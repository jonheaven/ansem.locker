import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiErrorMessage, fetchJson } from '@/lib/fetch-json';

export type LockerListEntry = {
  wallet: string;
  xHandle: string;
  tweetUrl: string;
  linkedAt: number;
  flexTweetUrl?: string;
  flexVerifiedAt?: number;
  flexTxSig?: string;
};

type LockerListResponse = {
  entries: LockerListEntry[];
};

export function useLockerList() {
  return useQuery({
    queryKey: ['locker-list'],
    queryFn: async () => {
      const result = await fetchJson<LockerListResponse>('/api/flex-verify');
      if (!result.ok || !result.data) return [];
      return result.data.entries;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: false,
  });
}

export function useFlexVerifiedForWallet(wallet?: string) {
  const { data } = useLockerList();
  if (!wallet || !data) return false;
  return data.some((entry) => entry.wallet === wallet);
}

export function useVerifyFlexPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { wallet: string; flexTweetUrl: string }) => {
      const result = await fetchJson<{ error?: string; entry?: LockerListEntry }>(
        '/api/flex-verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
      );
      if (!result.ok || !result.data?.entry) {
        throw new Error(apiErrorMessage(result, 'Flex verification failed'));
      }
      return result.data.entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locker-list'] });
      queryClient.invalidateQueries({ queryKey: ['x-links'] });
    },
  });
}
