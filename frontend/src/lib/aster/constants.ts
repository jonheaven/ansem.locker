export const ASTER_ANSEM_SYMBOL = 'ANSEMUSDT';
export const ASTER_TRADE_URL = 'https://www.asterdex.com/en/futures/ANSEMUSDT';

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

export function klineRefetchMs(interval: AsterKlineInterval): number {
  switch (interval) {
    case '1m':
      return 30_000;
    case '5m':
      return 60_000;
    default:
      return 120_000;
  }
}
