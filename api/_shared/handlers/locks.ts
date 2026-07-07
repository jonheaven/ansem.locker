import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  escrowTotalAmount,
  JUPITER_LOCK_PROGRAM_ID,
  parseVestingEscrow,
  VESTING_ESCROW_DATA_LEN,
} from '../jupiter-lock';
import {
  ANSEM_MINT_ID,
  ANSEM_TOKEN_PROGRAM_ID,
  loadSolanaWeb3,
  loadSplToken,
} from '../solana';
import { fetchLockCreationMeta } from '../lock-creation-meta';
import {
  getMultipleAccountsChunked,
  INDEXER_TIMEOUT_MS,
  missingRpcMessage,
  resolveServerRpcUrl,
  validateServerRpcUrl,
  withTimeout,
} from '../rpc';

type LockDto = {
  vestingAccount: string;
  owner: string;
  amount: string;
  unlockTs: number;
  daysRemaining: number;
  score: string;
  remainingInVault: string;
  lockTxSig?: string;
  lockTs?: number;
};

function daysUntil(unixTs: number, now: number) {
  return Math.max(0, Math.ceil((unixTs - now) / 86_400));
}

function lockScore(amount: bigint, days: number) {
  return amount * BigInt(Math.max(days, 1));
}

async function indexLocks(rpcUrl: string): Promise<LockDto[]> {
  const { Connection, PublicKey } = await loadSolanaWeb3();
  const { getAssociatedTokenAddressSync } = await loadSplToken();

  const LOCK_PROGRAM = new PublicKey(JUPITER_LOCK_PROGRAM_ID);
  const ANSEM_MINT = new PublicKey(ANSEM_MINT_ID);
  const tokenProgram = new PublicKey(ANSEM_TOKEN_PROGRAM_ID);

  const connection = new Connection(rpcUrl, {
    commitment: 'confirmed',
    disableRetryOnRateLimit: false,
  });

  const accounts = await connection.getProgramAccounts(LOCK_PROGRAM, {
    commitment: 'confirmed',
    filters: [
      { dataSize: VESTING_ESCROW_DATA_LEN },
      { memcmp: { offset: 40, bytes: ANSEM_MINT.toBase58() } },
    ],
  });

  const now = Math.floor(Date.now() / 1000);
  const parsed: Array<{
    vestingAccount: import('@solana/web3.js').PublicKey;
    creator: import('@solana/web3.js').PublicKey;
    unlockTs: number;
    amount: bigint;
  }> = [];

  for (const { pubkey, account } of accounts) {
    const data = Buffer.from(account.data);
    const escrow = parseVestingEscrow(pubkey, data, PublicKey);
    if (!escrow || !escrow.tokenMint.equals(ANSEM_MINT)) continue;

    parsed.push({
      vestingAccount: pubkey,
      creator: escrow.creator,
      unlockTs: escrow.cliffTime,
      amount: escrowTotalAmount(escrow),
    });
  }

  if (parsed.length === 0) return [];

  const vaultKeys = parsed.map((p) =>
    getAssociatedTokenAddressSync(ANSEM_MINT, p.vestingAccount, true, tokenProgram),
  );

  const vaultInfos = await getMultipleAccountsChunked(connection, vaultKeys);

  const lockMetas = await Promise.all(
    parsed.map((row) => fetchLockCreationMeta(connection, row.vestingAccount)),
  );

  const locks: LockDto[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i]!;
    const vault = vaultInfos[i];
    let remaining = 0n;
    if (vault?.data && vault.data.length >= 72) {
      remaining = BigInt(vault.data.readBigUInt64LE(64));
    }
    if (remaining === 0n) continue;

    const daysRemaining = daysUntil(row.unlockTs, now);
    const meta = lockMetas[i]!;

    locks.push({
      vestingAccount: row.vestingAccount.toBase58(),
      owner: row.creator.toBase58(),
      amount: row.amount.toString(),
      unlockTs: row.unlockTs,
      daysRemaining,
      score: lockScore(remaining, daysRemaining).toString(),
      remainingInVault: remaining.toString(),
      ...(meta.lockTxSig ? { lockTxSig: meta.lockTxSig } : {}),
      ...(meta.lockTs != null ? { lockTs: meta.lockTs } : {}),
    });
  }

  return locks;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rpcUrl = resolveServerRpcUrl();
    if (!rpcUrl) {
      return res.status(503).json({ error: missingRpcMessage() });
    }

    const rpcError = validateServerRpcUrl(rpcUrl);
    if (rpcError) {
      return res.status(503).json({ error: rpcError });
    }

    const locks = await withTimeout(
      indexLocks(rpcUrl),
      INDEXER_TIMEOUT_MS,
      'Leaderboard indexer',
    );

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json({ locks });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Indexer failed';
    console.error('[api/locks]', message);
    return res.status(502).json({ error: message });
  }
}
