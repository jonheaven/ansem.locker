import { useMemo, type FC, type ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { useStandardWalletAdapters } from '@solana/wallet-standard-wallet-adapter-react';
import { RPC_ENDPOINT } from '@/config/constants';
import { WalletModalI18nSync } from '@/components/WalletModalI18nSync';

import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = useStandardWalletAdapters(
    useMemo(() => [new BackpackWalletAdapter()], []),
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletModalI18nSync />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
