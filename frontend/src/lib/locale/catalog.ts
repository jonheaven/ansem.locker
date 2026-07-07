import type { FiatCurrency } from '@/lib/currency/currency-context';
import type { SupportedLocale } from '@/lib/i18n/messages';

export const LOCALE_OPTIONS: { code: SupportedLocale; labelKey: string }[] = [
  { code: 'en', labelKey: 'locale.en' },
  { code: 'hi', labelKey: 'locale.hi' },
  { code: 'pt', labelKey: 'locale.pt' },
  { code: 'ko', labelKey: 'locale.ko' },
  { code: 'ja', labelKey: 'locale.ja' },
  { code: 'es', labelKey: 'locale.es' },
  { code: 'ru', labelKey: 'locale.ru' },
  { code: 'tr', labelKey: 'locale.tr' },
  { code: 'id', labelKey: 'locale.id' },
  { code: 'zh', labelKey: 'locale.zh' },
];

export const FIAT_OPTIONS: FiatCurrency[] = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'BRL',
  'KRW',
  'JPY',
  'TRY',
  'IDR',
  'AUD',
  'CAD',
];

export const CURRENCY_SYMBOL: Record<FiatCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  BRL: 'R$',
  KRW: '₩',
  JPY: '¥',
  TRY: '₺',
  IDR: 'Rp',
  AUD: 'A$',
  CAD: 'C$',
};
