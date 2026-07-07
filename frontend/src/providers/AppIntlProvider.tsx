import type { ReactNode } from 'react';
import { CurrencyProvider } from '@/lib/currency/currency-context';
import { GeoPrefsBootstrap } from '@/components/GeoPrefsBootstrap';
import { I18nProvider, useI18n } from '@/lib/i18n/i18n-context';

function CurrencyBridge({ children }: { children: ReactNode }) {
  const { intlLocale } = useI18n();
  return (
    <CurrencyProvider intlLocale={intlLocale}>
      <GeoPrefsBootstrap />
      {children}
    </CurrencyProvider>
  );
}

export function AppIntlProvider({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <CurrencyBridge>{children}</CurrencyBridge>
    </I18nProvider>
  );
}
