import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { messagesByLocale, SUPPORTED_LOCALES, type SupportedLocale } from './messages';
import type { MessageTree } from './messages/types';
import { intlLocaleForSupported } from './intl-locale';

export type { SupportedLocale } from './messages';

const LOCALE_KEY = 'ansem-locker-preferred-locale';

type I18nContextValue = {
  locale: SupportedLocale;
  intlLocale: string;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function lookup(messages: MessageTree, key: string): string {
  const parts = key.split('.');
  let current: string | MessageTree = messages;
  for (const part of parts) {
    if (typeof current !== 'object' || current == null || !(part in current)) {
      return key;
    }
    current = current[part] as string | MessageTree;
  }
  return typeof current === 'string' ? current : key;
}

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return Object.entries(vars).reduce(
    (acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
    text,
  );
}

function normalizeLocale(raw: string | null | undefined): SupportedLocale | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'ja' || normalized.startsWith('ja-')) return 'ja';
  if (normalized === 'en' || normalized.startsWith('en')) return 'en';
  return null;
}

function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const locale = normalizeLocale(candidate);
    if (locale) return locale;
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    try {
      const stored = normalizeLocale(window.localStorage.getItem(LOCALE_KEY));
      setLocaleState(stored ?? detectBrowserLocale());
    } catch {
      setLocaleState(detectBrowserLocale());
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (loc: SupportedLocale) => {
    setLocaleState(loc);
    try {
      window.localStorage.setItem(LOCALE_KEY, loc);
    } catch {
      // ignore
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const active = messagesByLocale[locale] ?? messagesByLocale.en;
    return {
      locale,
      intlLocale: intlLocaleForSupported(locale),
      setLocale,
      t: (key, vars) => {
        const localized = lookup(active, key);
        const resolved =
          localized === key ? lookup(messagesByLocale.en, key) : localized;
        return interpolate(resolved, vars);
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

const fallback: I18nContextValue = {
  locale: 'en',
  intlLocale: 'en-US',
  setLocale: () => {},
  t: (key, vars) => interpolate(lookup(messagesByLocale.en, key), vars),
};

export function useI18n() {
  return useContext(I18nContext) ?? fallback;
}

export { SUPPORTED_LOCALES };
