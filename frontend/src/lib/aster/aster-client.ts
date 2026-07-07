import type { AsterKlineInterval } from '@/lib/aster/constants';

export type AsterKlineBar = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type AsterTicker = {
  symbol: string;
  price: number;
  priceChangePercent: number;
  priceChange: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolume: number;
  lastPrice: number;
  openPrice: number;
  time: number;
};

type RawKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  ...unknown[],
];

function parseKlineBar(row: RawKline): AsterKlineBar | null {
  const open = Number(row[1]);
  const high = Number(row[2]);
  const low = Number(row[3]);
  const close = Number(row[4]);
  const volume = Number(row[5]);
  if (![open, high, low, close, volume].every(Number.isFinite)) return null;
  return {
    time: Math.floor(row[0] / 1000),
    open,
    high,
    low,
    close,
    volume,
  };
}

export async function fetchAsterKlines(
  interval: AsterKlineInterval,
  limit = 300,
): Promise<AsterKlineBar[]> {
  const params = new URLSearchParams({ interval, limit: String(limit) });
  const res = await fetch(`/api/aster-klines?${params}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load klines');
  const json = (await res.json()) as { klines?: RawKline[] };
  return (json.klines ?? [])
    .map(parseKlineBar)
    .filter((bar): bar is AsterKlineBar => bar != null)
    .sort((a, b) => a.time - b.time);
}

export async function fetchAsterTicker(): Promise<AsterTicker> {
  const res = await fetch('/api/aster-ticker', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load ticker');
  const json = (await res.json()) as AsterTicker;
  if (!Number.isFinite(json.price)) throw new Error('Invalid ticker');
  return json;
}
