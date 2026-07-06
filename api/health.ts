import type { VercelRequest, VercelResponse } from '@vercel/node';
import { missingRpcMessage, resolveServerRpcUrl, validateServerRpcUrl } from './_shared/rpc';

function rpcHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'invalid';
  }
}

/** Lightweight diagnostic — no Solana RPC calls. */
export default function handler(_req: VercelRequest, res: VercelResponse) {
  const rpcUrl = resolveServerRpcUrl();
  const rpcError = rpcUrl ? validateServerRpcUrl(rpcUrl) : null;

  return res.status(200).json({
    ok: true,
    rpcConfigured: Boolean(rpcUrl),
    rpcHost: rpcUrl ? rpcHost(rpcUrl) : null,
    rpcValid: Boolean(rpcUrl && !rpcError),
    rpcError: rpcError ?? (rpcUrl ? null : missingRpcMessage()),
  });
}
