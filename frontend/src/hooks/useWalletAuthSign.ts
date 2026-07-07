import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  buildWalletAuthMessage,
  signatureToBase64,
  normalizeWalletSignature,
  type WalletAuthAction,
} from '@/lib/wallet-auth';
import { signMessageViaWalletStandard } from '@/lib/wallet-standard-sign';

export function useWalletAuthSign() {
  const { signMessage, wallet, publicKey } = useWallet();

  const signAuth = useCallback(
    async (action: WalletAuthAction): Promise<{ message: string; signature: string }> => {
      const walletAddress = publicKey?.toBase58();
      if (!walletAddress) {
        throw new Error('Connect your wallet first');
      }

      const message = buildWalletAuthMessage(walletAddress, action);
      const encoded = new TextEncoder().encode(message);

      let signatureBytes: Uint8Array | null = null;

      if (signMessage) {
        try {
          signatureBytes = normalizeWalletSignature(await signMessage(encoded));
        } catch (err) {
          const detail = err instanceof Error ? err.message : '';
          if (!/detached|invalid signature/i.test(detail)) {
            throw err;
          }
        }
      }

      if (!signatureBytes) {
        signatureBytes = await signMessageViaWalletStandard(wallet, publicKey, encoded);
      }

      if (!signatureBytes) {
        throw new Error(
          'Your wallet must support message signing for this action. Try Phantom or Solflare.',
        );
      }

      if (signatureBytes.length !== 64) {
        throw new Error('Wallet returned an invalid signature — please try again');
      }

      return {
        message,
        signature: signatureToBase64(signatureBytes),
      };
    },
    [publicKey, signMessage, wallet],
  );

  return { signAuth };
}
