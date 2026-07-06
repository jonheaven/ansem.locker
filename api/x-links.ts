import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  loadXLinkStore,
  saveXLinkStore,
  type XLinkRecord,
} from './_shared/x-link-store';
import { isBase58Address } from './_shared/solana';
import { fetchTweetOembed } from './_shared/twitter-oembed';

export type { XLinkRecord };

function isValidWallet(wallet: string) {
  return isBase58Address(wallet);
}

async function verifyAccountLink(
  tweetUrl: string,
  wallet: string,
  code: string,
): Promise<{ xHandle: string }> {
  const { xHandle, haystack } = await fetchTweetOembed(tweetUrl);
  const codeNeedle = code.toLowerCase();
  const walletNeedle = wallet.toLowerCase();

  if (!haystack.includes(codeNeedle)) {
    throw new Error('Verification post must include your code');
  }

  if (!haystack.includes(walletNeedle) && !haystack.includes(walletNeedle.slice(0, 8))) {
    throw new Error('Verification post must include your wallet address');
  }

  return { xHandle };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const store = await loadXLinkStore();

  if (req.method === 'GET') {
    return res.status(200).json({
      links: Array.from(store.values()).sort((a, b) => b.linkedAt - a.linkedAt),
    });
  }

  if (req.method === 'DELETE') {
    const wallet = String(req.body?.wallet ?? '').trim();
    if (!isValidWallet(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    store.delete(wallet);
    await saveXLinkStore(store);
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = String(req.body?.wallet ?? '').trim();
  const code = String(req.body?.code ?? '').trim();
  const tweetUrl = String(req.body?.tweetUrl ?? '').trim();

  if (!isValidWallet(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  if (!code || code.length < 8) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  if (!tweetUrl) {
    return res.status(400).json({ error: 'Paste your verification post URL' });
  }

  try {
    const { xHandle } = await verifyAccountLink(tweetUrl, wallet, code);
    const existing = store.get(wallet);
    const link: XLinkRecord = {
      wallet,
      xHandle,
      tweetUrl,
      linkedAt: Date.now(),
      flexTweetUrl: existing?.flexTweetUrl,
      flexVerifiedAt: existing?.flexVerifiedAt,
    };
    store.set(wallet, link);
    await saveXLinkStore(store);
    return res.status(200).json({ link });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return res.status(400).json({ error: message });
  }
}
