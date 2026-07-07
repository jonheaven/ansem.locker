import { Connection, PublicKey } from '@solana/web3.js';
import { apiErrorMessage, fetchJson } from '@/lib/fetch-json';

export type VestingLockRecord = {
  vestingAccount: string;
  owner: string;
  amount: bigint;
  unlockTs: number;
  daysRemaining: number;
  score: bigint;
  remainingInVault: bigint;
  lockTxSig?: string;
};

type LockDto = {
  vestingAccount: string;
  owner: string;
  amount: string;
  unlockTs: number;
  daysRemaining: number;
  score: string;
  remainingInVault: string;
  lockTxSig?: string;
};

function dtoToRecord(d: LockDto): VestingLockRecord {
  return {
    vestingAccount: d.vestingAccount,
    owner: d.owner,
    amount: BigInt(d.amount),
    unlockTs: d.unlockTs,
    daysRemaining: d.daysRemaining,
    score: BigInt(d.score),
    remainingInVault: BigInt(d.remainingInVault),
    lockTxSig: d.lockTxSig,
  };
}

/** Leaderboard — server indexer (public RPC blocks getProgramAccounts in browser). */
export async function fetchAnsemVestingLocks(
  _connection: Connection,
): Promise<VestingLockRecord[]> {
  const result = await fetchJson<{ locks?: LockDto[]; error?: string }>('/api/locks');

  if (!result.ok) {
    throw new Error(
      apiErrorMessage(
        result,
        'Leaderboard unavailable. Set SOLANA_RPC_URL on Vercel (Helius or QuickNode).',
      ),
    );
  }

  if (!result.data) {
    throw new Error('Leaderboard unavailable. Set SOLANA_RPC_URL on Vercel (Helius or QuickNode).');
  }

  return (result.data.locks ?? []).map(dtoToRecord);
}

/** User locks — server scans wallet tx history (browser public RPC returns 403). */
export async function fetchWalletVestingLocks(
  _connection: Connection,
  owner: PublicKey,
): Promise<VestingLockRecord[]> {
  const result = await fetchJson<{ locks?: LockDto[]; error?: string }>(
    `/api/wallet-locks?wallet=${owner.toBase58()}`,
  );

  if (!result.ok) {
    throw new Error(
      apiErrorMessage(
        result,
        'Could not load your locks. Set SOLANA_RPC_URL on Vercel (Helius or QuickNode).',
      ),
    );
  }

  if (!result.data) {
    throw new Error('Could not load your locks. Set SOLANA_RPC_URL on Vercel (Helius or QuickNode).');
  }

  return (result.data.locks ?? []).map(dtoToRecord);
}
