import type { VercelRequest, VercelResponse } from '@vercel/node';

const FIAT = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD'] as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const params = new URLSearchParams({
      from: 'USD',
      to: FIAT.join(','),
    });
    const upstream = await fetch(`https://api.frankfurter.app/latest?${params}`, {
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Failed to fetch FX rates' });
    }

    const json = (await upstream.json()) as { rates?: Record<string, number> };
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json({ rates: json.rates ?? {} });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FX rates request failed';
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timer);
  }
}
