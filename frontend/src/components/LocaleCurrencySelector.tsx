import { CircleDollarSign, Languages } from 'lucide-react';
import { HeaderIconPicker } from '@/components/HeaderIconPicker';
import { useI18n, type SupportedLocale } from '@/lib/i18n/i18n-context';
import { useCurrency, type FiatCurrency } from '@/lib/currency/currency-context';
import { cn } from '@/lib/cn';

const LOCALES: { code: SupportedLocale; labelKey: string }[] = [
  { code: 'en', labelKey: 'locale.en' },
  { code: 'ja', labelKey: 'locale.ja' },
  { code: 'es', labelKey: 'locale.es' },
  { code: 'ru', labelKey: 'locale.ru' },
  { code: 'zh', labelKey: 'locale.zh' },
];

const CURRENCIES: FiatCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

const CURRENCY_SYMBOL: Record<FiatCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

type LocaleCurrencySelectorProps = {
  className?: string;
};

export function LocaleCurrencySelector({ className }: LocaleCurrencySelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <HeaderIconPicker
        tooltip={t('common.language')}
        ariaLabel={t('common.language')}
        value={locale}
        onChange={setLocale}
        options={LOCALES.map((opt) => ({
          value: opt.code,
          label: t(opt.labelKey),
        }))}
        trigger={
          <>
            <Languages className="h-4 w-4 shrink-0" aria-hidden />
            <span className="sr-only">{t('common.language')}</span>
          </>
        }
      />
      <HeaderIconPicker
        tooltip={t('common.currency')}
        ariaLabel={t('common.currency')}
        value={currency}
        onChange={setCurrency}
        options={CURRENCIES.map((code) => ({
          value: code,
          label: code,
        }))}
        trigger={
          <span className="flex items-center gap-0.5">
            <CircleDollarSign className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-[10px] font-semibold tabular-nums leading-none">
              {CURRENCY_SYMBOL[currency]}
            </span>
          </span>
        }
      />
    </div>
  );
}
