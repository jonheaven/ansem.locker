import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isBase58Address } from './_shared/solana';

export type XLinkRecord = {
  wallet: string;
  xHandle: string;
  tweetUrl: string;
  linkedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __ansemXLinksStore: Map<string, XLinkRecord> | undefined;
}

const store = globalThis.__ansemXLinksStore ??= new Map<string, XLinkRecord>();

function isValidWallet(wallet: string) {
  return isBase58Address(wallet);
}

function parseTweetId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'x.com' && host !== 'twitter.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const statusIdx = parts.indexOf('status');
    if (statusIdx === -1 || !parts[statusIdx + 1]) return null;
    return parts[statusIdx + 1]!.replace(/\D/g, '');
  } catch {
    return null;
  }
}

function extractHandle(authorUrl?: string): string | null {
  if (!authorUrl) return null;
  try {
    const parsed = new URL(authorUrl);
    const segment = parsed.pathname.split('/').filter(Boolean)[0];
    return segment?.replace(/^@/, '') ?? null;
  } catch {
    return null;
  }
}

function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}

async function verifyTweetLink(
  tweetUrl: string,
  wallet: string,
  code: string,
): Promise<{ xHandle: string }> {
  const tweetId = parseTweetId(tweetUrl);
  if (!tweetId) {
    throw new Error('Paste a valid x.com or twitter.com post URL');
  }

  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
    `https://x.com/i/status/${tweetId}`,
  )}&omit_script=true`;

  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error('Could not read that post. Make sure it is public.');
  }

  const data = (await res.json()) as {
    author_name?: string;
    author_url?: string;
    html?: string;
  };

  const xHandle = extractHandle(data.author_url);
  if (!xHandle) {
    throw new Error('Could not read the post author');
  }

  const haystack = decodeHtml(data.html ?? '').toLowerCase();
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
    const { xHandle } = await verifyTweetLink(tweetUrl, wallet, code);
    const link: XLinkRecord = {
      wallet,
      xHandle,
      tweetUrl,
      linkedAt: Date.now(),
    };
    store.set(wallet, link);
    return res.status(200).json({ link });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return res.status(400).json({ error: message });
  }
}
