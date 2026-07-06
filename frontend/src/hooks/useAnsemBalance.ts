import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiErrorMessage, fetchJson } from '@/lib/fetch-json';

export function useAnsemBalance() {
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['ansem-balance', publicKey?.toBase58()],
    enabled: Boolean(publicKey),
    queryFn: async () => {
      if (!publicKey) return null;

      const result = await fetchJson<{ raw?: string; ui?: number; error?: string }>(
        `/api/balance?wallet=${publicKey.toBase58()}`,
      );

      if (!result.ok || !result.data) {
        throw new Error(apiErrorMessage(result, 'Could not load $ANSEM balance'));
      }

      return {
        raw: BigInt(result.data.raw ?? '0'),
        ui: result.data.ui ?? 0,
      };
    },
    refetchInterval: 30_000,
  });
}
