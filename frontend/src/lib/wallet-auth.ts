import type { WalletAuthAction } from './wallet-auth-message';

export type { WalletAuthAction };

export function buildWalletAuthMessage(wallet: string, action: WalletAuthAction): string {
  return `ansem.locker:${action}:${wallet}:${Date.now()}`;
}

export function signatureToBase64(signature: Uint8Array): string {
  let binary = '';
  for (const byte of signature) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function signWalletAuthRequest(
  signMessage: ((message: Uint8Array) => Promise<Uint8Array>) | undefined,
  wallet: string,
  action: WalletAuthAction,
): Promise<{ message: string; signature: string }> {
  if (!signMessage) {
    throw new Error('Your wallet must support message signing for this action');
  }

  const message = buildWalletAuthMessage(wallet, action);
  const encoded = new TextEncoder().encode(message);
  const signatureBytes = await signMessage(encoded);

  return {
    message,
    signature: signatureToBase64(signatureBytes),
  };
}
