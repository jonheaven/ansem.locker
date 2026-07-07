import { loadSolanaWeb3 } from './solana';

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

export type WalletAuthAction = 'link' | 'unlink' | 'flex-verify';

function parseAuthMessage(message: string, action: WalletAuthAction, wallet: string): number {
  const pattern = new RegExp(
    `^ansem\\.locker:${action}:([1-9A-HJ-NP-Za-km-z]{32,44}):(\\d+)$`,
  );
  const match = message.match(pattern);
  if (!match) {
    throw new Error('Invalid signed message format');
  }
  const signedWallet = match[1]!;
  const timestamp = Number(match[2]);
  if (signedWallet !== wallet) {
    throw new Error('Signed message does not match wallet');
  }
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() - timestamp) > MAX_SIGNATURE_AGE_MS) {
    throw new Error('Signed message expired — please try again');
  }
  return timestamp;
}

export async function verifyWalletSignature(
  wallet: string,
  message: string,
  signatureBase64: string,
  action: WalletAuthAction,
): Promise<void> {
  parseAuthMessage(message, action, wallet);

  let signature: Uint8Array;
  try {
    signature = new Uint8Array(Buffer.from(signatureBase64, 'base64'));
  } catch {
    throw new Error('Invalid wallet signature encoding');
  }

  if (signature.length !== 64) {
    throw new Error('Invalid wallet signature length');
  }

  const { PublicKey } = await loadSolanaWeb3();
  const naclModule = await import('tweetnacl');
  const nacl = (naclModule as { default?: typeof naclModule }).default ?? naclModule;

  if (!nacl.sign?.detached?.verify) {
    throw new Error('Signature verification unavailable');
  }

  const pubkey = new PublicKey(wallet).toBytes();
  const payload = new TextEncoder().encode(message);
  const valid = nacl.sign.detached.verify(payload, signature, pubkey);
  if (!valid) {
    throw new Error('Wallet signature verification failed');
  }
}

export function buildWalletAuthMessage(wallet: string, action: WalletAuthAction): string {
  return `ansem.locker:${action}:${wallet}:${Date.now()}`;
}
