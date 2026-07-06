import { useI18n, type SupportedLocale } from '@/lib/i18n/i18n-context';
import { useCurrency, type FiatCurrency } from '@/lib/currency/currency-context';
import { cn } from '@/lib/cn';

const REGION_KEY = 'ansem-locker-preferred-region';

export type AppRegion = 'jp' | 'us' | 'gb' | 'eu' | 'au' | 'ca';

const REGIONS: {
  id: AppRegion;
  labelKey: string;
  locale: SupportedLocale;
  currency: FiatCurrency;
}[] = [
  { id: 'jp', labelKey: 'region.japan', locale: 'ja', currency: 'JPY' },
  { id: 'us', labelKey: 'region.unitedStates', locale: 'en', currency: 'USD' },
  { id: 'gb', labelKey: 'region.unitedKingdom', locale: 'en', currency: 'GBP' },
  { id: 'eu', labelKey: 'region.europe', locale: 'en', currency: 'EUR' },
  { id: 'au', labelKey: 'region.australia', locale: 'en', currency: 'AUD' },
  { id: 'ca', labelKey: 'region.canada', locale: 'en', currency: 'CAD' },
];

const LOCALES: { code: SupportedLocale; labelKey: string }[] = [
  { code: 'ja', labelKey: 'locale.ja' },
  { code: 'en', labelKey: 'locale.en' },
];

const CURRENCIES: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

function detectRegion(): AppRegion {
  if (typeof navigator === 'undefined') return 'us';
  const lang = navigator.language || 'en-US';
  if (lang.startsWith('ja')) return 'jp';
  if (lang.startsWith('en-GB')) return 'gb';
  if (lang.startsWith('en-AU')) return 'au';
  if (lang.startsWith('en-CA') || lang.startsWith('fr-CA')) return 'ca';
  if (lang.startsWith('de') || lang.startsWith('fr') || lang.startsWith('es') || lang.startsWith('it')) {
    return 'eu';
  }
  return 'us';
}

function readStoredRegion(): AppRegion | null {
  try {
    const raw = window.localStorage.getItem(REGION_KEY);
    if (raw && REGIONS.some((r) => r.id === raw)) return raw as AppRegion;
  } catch {
    // ignore
  }
  return null;
}

type LocaleCurrencySelectorProps = {
  className?: string;
};

export function LocaleCurrencySelector({ className }: LocaleCurrencySelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const { currency, setCurrency } = useCurrency();

  const region =
    REGIONS.find((r) => r.locale === locale && r.currency === currency)?.id ??
    readStoredRegion() ??
    detectRegion();

  const selectClass =
    'rounded-md border border-border/70 bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground outline-none focus:border-accent';

  const applyRegion = (id: AppRegion) => {
    const picked = REGIONS.find((r) => r.id === id);
    if (!picked) return;
    setLocale(picked.locale);
    setCurrency(picked.currency);
    try {
      window.localStorage.setItem(REGION_KEY, id);
    } catch {
      // ignore
    }
  };

  return (
    <span className={cn('inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1', className)}>
      <label className="inline-flex items-center gap-1">
        <span className="sr-only">{t('common.region')}</span>
        <select
          className={selectClass}
          value={region}
          onChange={(e) => applyRegion(e.target.value as AppRegion)}
          aria-label={t('common.region')}
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {t(r.labelKey)}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-1">
        <span className="sr-only">{t('common.language')}</span>
        <select
          className={selectClass}
          value={locale}
          onChange={(e) => setLocale(e.target.value as SupportedLocale)}
          aria-label={t('common.language')}
        >
          {LOCALES.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {t(opt.labelKey)}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex items-center gap-1">
        <span className="sr-only">{t('common.currency')}</span>
        <select
          className={selectClass}
          value={currency}
          onChange={(e) => setCurrency(e.target.value as FiatCurrency)}
          aria-label={t('common.currency')}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </label>
    </span>
  );
}
