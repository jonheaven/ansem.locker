import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ASTER_ANSEM_SYMBOL, asterFetch } from './_shared/aster';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const symbol = String(req.query.symbol ?? ASTER_ANSEM_SYMBOL).toUpperCase();

  try {
    const [priceRow, stats] = await Promise.all([
      asterFetch('/fapi/v3/ticker/price', { symbol }),
      asterFetch('/fapi/v3/ticker/24hr', { symbol }),
    ]);

    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    return res.status(200).json({
      symbol,
      price: Number(priceRow.price),
      priceChangePercent: Number(stats.priceChangePercent),
      priceChange: Number(stats.priceChange),
      highPrice: Number(stats.highPrice),
      lowPrice: Number(stats.lowPrice),
      volume: Number(stats.volume),
      quoteVolume: Number(stats.quoteVolume),
      lastPrice: Number(stats.lastPrice),
      openPrice: Number(stats.openPrice),
      time: Number(priceRow.time ?? stats.closeTime),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Aster ticker request failed';
    return res.status(502).json({ error: message });
  }
}
