import { CircleDollarSign, Languages } from 'lucide-react';
import { HeaderIconPicker } from '@/components/HeaderIconPicker';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useCurrency } from '@/lib/currency/currency-context';
import {
  CURRENCY_SYMBOL,
  FIAT_OPTIONS,
  LOCALE_OPTIONS,
} from '@/lib/locale/catalog';
import { cn } from '@/lib/cn';

type LocaleCurrencySelectorProps = {
  className?: string;
};

export function LocaleCurrencySelector({ className }: LocaleCurrencySelectorProps) {
  const { locale, setLocale, t } = useI18n();
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <HeaderIconPicker
        ariaLabel={t('common.language')}
        value={locale}
        onChange={setLocale}
        options={LOCALE_OPTIONS.map((opt) => ({
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
        ariaLabel={t('common.currency')}
        value={currency}
        onChange={setCurrency}
        options={FIAT_OPTIONS.map((code) => ({
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
