import { SolanaSignMessage } from '@solana/wallet-standard-features';
import type { Wallet } from '@solana/wallet-adapter-react';
import type { PublicKey } from '@solana/web3.js';
import { normalizeWalletSignature } from '@/lib/wallet-auth';

type StandardWalletAdapter = {
  wallet?: {
    accounts: { address: string; features: string[] }[];
    features: Record<
      string,
      {
        signMessage: (input: {
          account: { address: string; features: string[] };
          message: Uint8Array;
        }) => Promise<{ signature: Uint8Array }[]>;
      }
    >;
  };
};

/** Direct Wallet Standard sign when the adapter wrapper fails (e.g. some mobile wallets). */
export async function signMessageViaWalletStandard(
  wallet: Wallet | null,
  publicKey: PublicKey | null,
  message: Uint8Array,
): Promise<Uint8Array | null> {
  if (!wallet?.adapter || !publicKey) return null;

  const adapter = wallet.adapter as StandardWalletAdapter;
  const stdWallet = adapter.wallet;
  if (!stdWallet?.features[SolanaSignMessage]) return null;

  const address = publicKey.toBase58();
  const account = stdWallet.accounts.find((a) => a.address === address);
  if (!account?.features.includes(SolanaSignMessage)) return null;

  const outputs = await stdWallet.features[SolanaSignMessage].signMessage({
    account,
    message,
  });

  const signature = outputs[0]?.signature;
  return signature ? normalizeWalletSignature(signature) : null;
}
