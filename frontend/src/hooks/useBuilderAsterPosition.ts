import { useQuery } from '@tanstack/react-query';
import { BUILDER_WALLET } from '@/config/constants';
import { fetchAsterPosition } from '@/lib/aster/aster-position-client';

export function useBuilderAsterPosition() {
  return useQuery({
    queryKey: ['aster-position', BUILDER_WALLET],
    queryFn: () => fetchAsterPosition(BUILDER_WALLET),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
