import type { VercelRequest, VercelResponse } from '@vercel/node';
import { indexWalletLocks } from '../wallet-lock-index';
import { isBase58Address, loadSolanaWeb3 } from '../solana';
import {
  INDEXER_TIMEOUT_MS,
  missingRpcMessage,
  resolveServerRpcUrl,
  validateServerRpcUrl,
  withTimeout,
} from '../rpc';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = String(req.query.wallet ?? '').trim();
  if (!wallet) {
    return res.status(400).json({ error: 'Missing wallet query parameter' });
  }

  if (!isBase58Address(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  const rpcUrl = resolveServerRpcUrl();
  if (!rpcUrl) {
    return res.status(503).json({ error: missingRpcMessage() });
  }

  const rpcError = validateServerRpcUrl(rpcUrl);
  if (rpcError) {
    return res.status(503).json({ error: rpcError });
  }

  try {
    const { PublicKey } = await loadSolanaWeb3();
    const locks = await withTimeout(
      indexWalletLocks(rpcUrl, new PublicKey(wallet)),
      INDEXER_TIMEOUT_MS,
      'Wallet lock indexer',
    );
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    return res.status(200).json({ locks });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Wallet indexer failed';
    console.error('[api/wallet-locks]', message);
    return res.status(502).json({ error: message });
  }
}
