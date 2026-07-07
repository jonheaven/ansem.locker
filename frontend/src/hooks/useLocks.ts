import { useQuery } from '@tanstack/react-query';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  fetchAnsemVestingLocks,
  fetchWalletVestingLocks,
  type VestingLockRecord,
} from '@/lib/vesting-indexer';

export type { VestingLockRecord as LockRecord };

export function useLeaderboard() {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ['leaderboard', connection.rpcEndpoint],
    queryFn: () => fetchAnsemVestingLocks(connection),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMyLocks() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const query = useQuery({
    queryKey: ['my-locks', connection.rpcEndpoint, publicKey?.toBase58()],
    enabled: Boolean(publicKey),
    queryFn: () => fetchWalletVestingLocks(connection, publicKey!),
    refetchInterval: (q) => {
      const locks = q.state.data ?? [];
      const now = Math.floor(Date.now() / 1000);
      const active = locks.filter((l) => l.remainingInVault > 0n);
      if (active.some((l) => l.unlockTs <= now)) return 5_000;
      if (active.some((l) => l.unlockTs - now < 120)) return 5_000;
      return 30_000;
    },
  });

  return { ...query, locks: query.data ?? [] };
}

export type LeaderboardSort = 'amount' | 'duration' | 'score';

export function sortLocks(
  locks: VestingLockRecord[],
  sort: LeaderboardSort,
): VestingLockRecord[] {
  const copy = [...locks];
  switch (sort) {
    case 'amount':
      return copy.sort((a, b) => (a.remainingInVault > b.remainingInVault ? -1 : 1));
    case 'duration':
      return copy.sort((a, b) => b.unlockTs - a.unlockTs);
    case 'score':
    default:
      return copy.sort((a, b) => (a.score > b.score ? -1 : 1));
  }
}
