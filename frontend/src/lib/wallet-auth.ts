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

/** Wallets return Uint8Array, { signature }, or occasionally base64/base58 strings. */
export function normalizeWalletSignature(result: unknown): Uint8Array {
  if (result instanceof Uint8Array) return result;
  if (Array.isArray(result)) return new Uint8Array(result);

  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    for (const key of ['signature', 'signedMessage', 'sig'] as const) {
      const candidate = record[key];
      if (candidate instanceof Uint8Array) return candidate;
      if (Array.isArray(candidate)) return new Uint8Array(candidate);
    }
  }

  if (typeof result === 'string') {
    const trimmed = result.trim();
    if (/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
      try {
        const binary = atob(trimmed);
        return Uint8Array.from(binary, (c) => c.charCodeAt(0));
      } catch {
        // fall through
      }
    }
  }

  throw new Error(
    'Wallet returned an invalid signature format. Try reconnecting or use Phantom / Solflare.',
  );
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

  let signatureBytes: Uint8Array;
  try {
    const raw = await signMessage(encoded);
    signatureBytes = normalizeWalletSignature(raw);
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'Message signing failed';
    if (/detached/i.test(detail)) {
      throw new Error(
        'Wallet message signing failed. Reconnect your wallet, or try Phantom / Solflare.',
      );
    }
    throw err instanceof Error ? err : new Error(detail);
  }

  if (signatureBytes.length !== 64) {
    throw new Error('Wallet returned an invalid signature — please try again');
  }

  return {
    message,
    signature: signatureToBase64(signatureBytes),
  };
}
