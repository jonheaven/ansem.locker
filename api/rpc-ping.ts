import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveServerRpcUrl } from './_shared/rpc';

/** Confirms @solana/web3.js loads and RPC responds (getSlot). */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const rpcUrl = resolveServerRpcUrl();
  if (!rpcUrl) {
    return res.status(503).json({ error: 'SOLANA_RPC_URL not set' });
  }

  try {
    const { Connection } = await import('@solana/web3.js');
    const connection = new Connection(rpcUrl, 'confirmed');
    const slot = await connection.getSlot();
    return res.status(200).json({ ok: true, slot });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/rpc-ping]', message);
    return res.status(502).json({ error: message });
  }
}
