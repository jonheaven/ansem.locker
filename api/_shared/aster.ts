export const ASTER_FAPI_BASE = 'https://fapi.asterdex.com';
export const ASTER_ANSEM_SYMBOL = 'ANSEMUSDT';

export const ASTER_KLINE_INTERVALS = [
  '1m',
  '5m',
  '15m',
  '1h',
  '4h',
  '1d',
] as const;

export type AsterKlineInterval = (typeof ASTER_KLINE_INTERVALS)[number];

export function isAsterKlineInterval(value: string): value is AsterKlineInterval {
  return (ASTER_KLINE_INTERVALS as readonly string[]).includes(value);
}

export async function asterFetch(path: string, searchParams: Record<string, string>) {
  const url = new URL(path, ASTER_FAPI_BASE);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 10_000);

  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(body || `Aster API ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}
