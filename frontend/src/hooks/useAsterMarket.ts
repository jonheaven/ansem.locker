import { useQuery } from '@tanstack/react-query';
import { fetchAsterKlines, fetchAsterTicker } from '@/lib/aster/aster-client';
import type { AsterKlineInterval } from '@/lib/aster/constants';
import { klineRefetchMs } from '@/lib/aster/constants';

export function useAsterTicker() {
  return useQuery({
    queryKey: ['aster-ticker'],
    queryFn: fetchAsterTicker,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function useAsterKlines(interval: AsterKlineInterval) {
  return useQuery({
    queryKey: ['aster-klines', interval],
    queryFn: () => fetchAsterKlines(interval),
    refetchInterval: klineRefetchMs(interval),
    staleTime: 10_000,
  });
}
