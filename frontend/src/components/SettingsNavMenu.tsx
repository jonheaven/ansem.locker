import { Check, ChevronLeft, CircleDollarSign, Languages, Settings } from 'lucide-react';
import { useState } from 'react';
import { HeaderFlyoutItem, HeaderFlyoutMenu } from '@/components/HeaderFlyoutMenu';
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

type Panel = 'menu' | 'language' | 'currency';

export function SettingsNavMenu() {
  const { locale, setLocale, t } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const [panel, setPanel] = useState<Panel>('menu');

  const currentLocaleLabel = t(LOCALES.find((l) => l.code === locale)?.labelKey ?? 'locale.en');

  return (
    <HeaderFlyoutMenu
      label={t('common.settings')}
      trigger={<Settings className="h-4 w-4 shrink-0" aria-hidden />}
      scrollable
      onClose={() => setPanel('menu')}
    >
      {(close) => {
        if (panel !== 'menu') {
          return (
            <>
              <button
                type="button"
                onClick={() => setPanel('menu')}
                className="mb-0.5 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {t('xMenu.back')}
              </button>
              {panel === 'language'
                ? LOCALES.map((opt) => {
                    const selected = opt.code === locale;
                    return (
                      <button
                        key={opt.code}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLocale(opt.code);
                          setPanel('menu');
                          close();
                        }}
                        className={cn(
                          'flex w-full min-h-10 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors',
                          selected
                            ? 'bg-accent/12 font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                        )}
                      >
                        <span>{t(opt.labelKey)}</span>
                        {selected ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        ) : null}
                      </button>
                    );
                  })
                : CURRENCIES.map((code) => {
                    const selected = code === currency;
                    return (
                      <button
                        key={code}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setCurrency(code);
                          setPanel('menu');
                          close();
                        }}
                        className={cn(
                          'flex w-full min-h-10 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors',
                          selected
                            ? 'bg-accent/12 font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                        )}
                      >
                        <span>
                          {CURRENCY_SYMBOL[code]} {code}
                        </span>
                        {selected ? (
                          <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        ) : null}
                      </button>
                    );
                  })}
            </>
          );
        }

        return (
          <>
            <HeaderFlyoutItem
              compact
              icon={Languages}
              label={t('common.language')}
              onClick={() => setPanel('language')}
              trailing={
                <span className="text-xs text-muted-foreground">{currentLocaleLabel}</span>
              }
            />
            <HeaderFlyoutItem
              compact
              icon={CircleDollarSign}
              label={t('common.currency')}
              onClick={() => setPanel('currency')}
              trailing={
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {currency}
                </span>
              }
            />
          </>
        );
      }}
    </HeaderFlyoutMenu>
  );
}
