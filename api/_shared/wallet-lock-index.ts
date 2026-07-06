import {
  escrowTotalAmount,
  JUPITER_LOCK_PROGRAM_ID,
  parseVestingEscrow,
  VESTING_ESCROW_DATA_LEN,
} from './jupiter-lock';
import {
  ANSEM_MINT_ID,
  ANSEM_TOKEN_PROGRAM_ID,
  loadSolanaWeb3,
  loadSplToken,
} from './solana';

export type WalletLockDto = {
  vestingAccount: string;
  owner: string;
  amount: string;
  unlockTs: number;
  daysRemaining: number;
  score: string;
  remainingInVault: string;
};

function daysUntil(unixTs: number, now: number) {
  return Math.max(0, Math.ceil((unixTs - now) / 86_400));
}

function lockScore(amount: bigint, days: number) {
  return amount * BigInt(Math.max(days, 1));
}

export async function indexWalletLocks(
  rpcUrl: string,
  owner: import('@solana/web3.js').PublicKey,
): Promise<WalletLockDto[]> {
  const { Connection, PublicKey } = await loadSolanaWeb3();
  const { getAssociatedTokenAddressSync } = await loadSplToken();

  const LOCK_PROGRAM = new PublicKey(JUPITER_LOCK_PROGRAM_ID);
  const ANSEM_MINT = new PublicKey(ANSEM_MINT_ID);
  const tokenProgram = new PublicKey(ANSEM_TOKEN_PROGRAM_ID);

  const connection = new Connection(rpcUrl, 'confirmed');

  const accounts = await connection.getProgramAccounts(LOCK_PROGRAM, {
    commitment: 'confirmed',
    filters: [
      { dataSize: VESTING_ESCROW_DATA_LEN },
      { memcmp: { offset: 40, bytes: ANSEM_MINT.toBase58() } },
      { memcmp: { offset: 72, bytes: owner.toBase58() } },
    ],
  });

  const now = Math.floor(Date.now() / 1000);
  const parsed: Array<{
    vestingAccount: import('@solana/web3.js').PublicKey;
    unlockTs: number;
    amount: bigint;
  }> = [];

  for (const { pubkey, account } of accounts) {
    const data = Buffer.from(account.data);
    const escrow = parseVestingEscrow(pubkey, data, PublicKey);
    if (!escrow || !escrow.creator.equals(owner)) continue;

    parsed.push({
      vestingAccount: pubkey,
      unlockTs: escrow.cliffTime,
      amount: escrowTotalAmount(escrow),
    });
  }

  if (parsed.length === 0) return [];

  const vaultKeys = parsed.map((p) =>
    getAssociatedTokenAddressSync(ANSEM_MINT, p.vestingAccount, true, tokenProgram),
  );

  const vaultInfos = await connection.getMultipleAccountsInfo(vaultKeys);

  const locks: WalletLockDto[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i]!;
    const vault = vaultInfos[i];
    let remaining = 0n;
    if (vault?.data && vault.data.length >= 72) {
      remaining = BigInt(vault.data.readBigUInt64LE(64));
    }
    if (remaining === 0n) continue;

    const daysRemaining = daysUntil(row.unlockTs, now);

    locks.push({
      vestingAccount: row.vestingAccount.toBase58(),
      owner: owner.toBase58(),
      amount: row.amount.toString(),
      unlockTs: row.unlockTs,
      daysRemaining,
      score: lockScore(remaining, daysRemaining).toString(),
      remainingInVault: remaining.toString(),
    });
  }

  return locks;
}

export async function walletHasActiveLock(
  rpcUrl: string,
  owner: import('@solana/web3.js').PublicKey,
): Promise<boolean> {
  const locks = await indexWalletLocks(rpcUrl, owner);
  return locks.length > 0;
}
