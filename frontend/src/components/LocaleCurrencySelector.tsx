import { useI18n, type SupportedLocale } from '@/lib/i18n/i18n-context';
import { useCurrency, type FiatCurrency } from '@/lib/currency/currency-context';
import { cn } from '@/lib/cn';

const LOCALES: { code: SupportedLocale; labelKey: string }[] = [
  { code: 'en', labelKey: 'locale.en' },
  { code: 'ja', labelKey: 'locale.ja' },
];

const CURRENCIES: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

type LocaleCurrencySelectorProps = {
  className?: string;
};

export function LocaleCurrencySelector({ className }: LocaleCurrencySelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const { currency, setCurrency } = useCurrency();

  const selectClass = cn(
    'app-select rounded-md border border-border/70 bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-foreground outline-none focus:border-accent',
  );

  return (
    <span className={cn('inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1', className)}>
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
