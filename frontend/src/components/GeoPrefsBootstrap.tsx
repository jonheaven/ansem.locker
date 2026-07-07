import { useEffect } from 'react';
import { useCurrency } from '@/lib/currency/currency-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  fetchGeoPrefs,
  FIAT_KEY,
  LOCALE_KEY,
  readStoredCurrency,
  readStoredLocale,
} from '@/lib/locale/prefs';

/** Applies IP-based locale/currency on first visit; user overrides persist in localStorage. */
export function GeoPrefsBootstrap() {
  const { setLocale } = useI18n();
  const { setCurrency } = useCurrency();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const hasLocale = Boolean(readStoredLocale());
      const hasCurrency = Boolean(readStoredCurrency());
      if (hasLocale && hasCurrency) return;

      const geo = await fetchGeoPrefs();
      if (cancelled || !geo) return;

      if (!hasLocale && geo.locale) {
        setLocale(geo.locale);
      } else if (!hasLocale) {
        try {
          window.localStorage.removeItem(LOCALE_KEY);
        } catch {
          // ignore
        }
      }

      if (!hasCurrency && geo.currency) {
        setCurrency(geo.currency);
      } else if (!hasCurrency) {
        try {
          window.localStorage.removeItem(FIAT_KEY);
        } catch {
          // ignore
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setCurrency, setLocale]);

  return null;
}
