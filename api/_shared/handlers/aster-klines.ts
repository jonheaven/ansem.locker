import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  ASTER_ANSEM_SYMBOL,
  asterFetch,
  isAsterKlineInterval,
} from '../aster';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const symbol = String(req.query.symbol ?? ASTER_ANSEM_SYMBOL).toUpperCase();
  const intervalRaw = String(req.query.interval ?? '1h');
  const interval = isAsterKlineInterval(intervalRaw) ? intervalRaw : '1h';
  const limit = Math.min(Math.max(Number(req.query.limit) || 300, 1), 1500);

  try {
    const klines = await asterFetch('/fapi/v3/klines', {
      symbol,
      interval,
      limit: String(limit),
    });

    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=60');
    return res.status(200).json({ symbol, interval, klines });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Aster klines request failed';
    return res.status(502).json({ error: message });
  }
}
