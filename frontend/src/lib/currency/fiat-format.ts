import type { FiatCurrency } from '@/lib/currency/currency-context';

export function intlLocaleForFiat(code: FiatCurrency): string {
  const map: Record<FiatCurrency, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    INR: 'en-IN',
    BRL: 'pt-BR',
    KRW: 'ko-KR',
    JPY: 'ja-JP',
    TRY: 'tr-TR',
    IDR: 'id-ID',
    AUD: 'en-AU',
    CAD: 'en-CA',
  };
  return map[code];
}

function priceFractionDigits(value: number): number {
  const abs = Math.abs(value);
  if (abs === 0) return 2;
  if (abs < 0.00001) return 8;
  if (abs < 0.0001) return 7;
  if (abs < 0.001) return 6;
  if (abs < 0.01) return 5;
  if (abs < 1) return 4;
  if (abs < 10) return 3;
  if (abs < 1000) return 2;
  return 0;
}

export function formatFiatAmount(
  code: FiatCurrency,
  value: number | null,
  options?: { maxDigits?: 'auto' | 'price' },
): string | null {
  if (value == null || !Number.isFinite(value)) return null;

  if (options?.maxDigits === 'price') {
    const maxFrac = priceFractionDigits(value);
    return new Intl.NumberFormat(intlLocaleForFiat(code), {
      style: 'currency',
      currency: code,
      minimumFractionDigits: Math.min(2, maxFrac),
      maximumFractionDigits: maxFrac,
    }).format(value);
  }

  return new Intl.NumberFormat(intlLocaleForFiat(code), {
    style: 'currency',
    currency: code,
    maximumFractionDigits: value >= 1000 ? 0 : value >= 100 ? 1 : 2,
  }).format(value);
}
