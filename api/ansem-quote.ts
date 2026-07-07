import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANSEM_MINT = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';

type DexPair = {
  priceUsd?: string;
  liquidity?: { usd?: number };
  priceChange?: { h24?: number };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const upstream = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${ANSEM_MINT}`,
      { signal: ac.signal, headers: { Accept: 'application/json' } },
    );

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Failed to fetch ANSEM quote' });
    }

    const json = (await upstream.json()) as { pairs?: DexPair[] | null };
    const pairs = json.pairs ?? [];
    if (pairs.length === 0) {
      return res.status(404).json({ error: 'No ANSEM market found' });
    }

    const best = [...pairs].sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
    )[0];
    const priceUsd = Number(best?.priceUsd);
    if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
      return res.status(502).json({ error: 'Invalid ANSEM price from market' });
    }

    const rawChange = best?.priceChange?.h24;
    const priceChange24h =
      typeof rawChange === 'number' && Number.isFinite(rawChange) ? rawChange : null;

    res.setHeader('Cache-Control', 'public, s-maxage=45, stale-while-revalidate=120');
    return res.status(200).json({
      priceUsd,
      priceChange24h,
      mint: ANSEM_MINT,
      source: 'dexscreener',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quote request failed';
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timer);
  }
}
