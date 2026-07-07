import type { FiatCurrency } from '@/lib/currency/currency-context';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/i18n/messages';

export const LOCALE_KEY = 'ansem-locker-preferred-locale';
export const FIAT_KEY = 'ansem-locker-preferred-fiat';

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);
const FIAT_CODES = new Set<FiatCurrency>(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']);

export function readStoredLocale(): SupportedLocale | null {
  try {
    const raw = window.localStorage.getItem(LOCALE_KEY);
    if (!raw || !LOCALE_SET.has(raw)) return null;
    return raw as SupportedLocale;
  } catch {
    return null;
  }
}

export function readStoredCurrency(): FiatCurrency | null {
  try {
    const raw = window.localStorage.getItem(FIAT_KEY);
    if (raw && FIAT_CODES.has(raw as FiatCurrency)) {
      return raw as FiatCurrency;
    }
  } catch {
    // ignore
  }
  return null;
}

export type GeoPrefsResponse = {
  country: string;
  locale: SupportedLocale;
  currency: FiatCurrency;
};

export async function fetchGeoPrefs(): Promise<GeoPrefsResponse | null> {
  try {
    const res = await fetch('/api/geo', { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as GeoPrefsResponse;
  } catch {
    return null;
  }
}
