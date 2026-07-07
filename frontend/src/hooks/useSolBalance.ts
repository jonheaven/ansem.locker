import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

export function useSolBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['sol-balance', connection.rpcEndpoint, publicKey?.toBase58()],
    enabled: Boolean(publicKey),
    queryFn: async () => {
      const lamports = await connection.getBalance(publicKey!);
      return { lamports, lamportsBig: BigInt(lamports) };
    },
    refetchInterval: 30_000,
  });
}
