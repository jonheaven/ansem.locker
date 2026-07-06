import { useWallet } from '@solana/wallet-adapter-react';
import { useMyLocks } from '@/hooks/useLocks';

/** True when the connected wallet has $ANSEM actively locked on-chain. */
export function useHasActiveLock(): boolean {
  const { publicKey } = useWallet();
  const { locks, isLoading } = useMyLocks();

  if (!publicKey || isLoading) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  return locks.some((lock) => lock.remainingInVault > 0n && lock.unlockTs > nowSec);
}
