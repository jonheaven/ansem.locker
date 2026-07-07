import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ANSEM_MINT_ID, isBase58Address, loadSolanaWeb3 } from '../solana';
import {
  missingRpcMessage,
  resolveServerRpcUrl,
  validateServerRpcUrl,
} from '../rpc';

const ANSEM_DECIMALS = 6;

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
    const { Connection, PublicKey } = await loadSolanaWeb3();

    const owner = new PublicKey(wallet);
    const mint = new PublicKey(ANSEM_MINT_ID);
    const connection = new Connection(rpcUrl, 'confirmed');

    const parsed = await connection.getParsedTokenAccountsByOwner(owner, { mint });
    let total = 0n;
    for (const { account } of parsed.value) {
      const amount = account.data.parsed?.info?.tokenAmount?.amount;
      if (amount) total += BigInt(amount);
    }

    const raw = total.toString();
    const ui = Number(total) / 10 ** ANSEM_DECIMALS;
    res.setHeader('Cache-Control', 'private, s-maxage=10, stale-while-revalidate=20');
    return res.status(200).json({ raw, ui });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Balance lookup failed';
    console.error('[api/balance]', message);
    return res.status(502).json({ error: message });
  }
}
