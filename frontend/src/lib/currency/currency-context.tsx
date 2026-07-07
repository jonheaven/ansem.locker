import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ANSEM_DECIMALS } from '@/config/constants';
import { fetchAnsemQuoteClient } from '@/lib/ansem-price/ansem-market-client';
import { FIAT_KEY, readStoredCurrency } from '@/lib/locale/prefs';

export type FiatCurrency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'BRL'
  | 'KRW'
  | 'JPY'
  | 'TRY'
  | 'IDR'
  | 'AUD'
  | 'CAD';

type CurrencyContextValue = {
  currency: FiatCurrency;
  setCurrency: (c: FiatCurrency) => void;
  priceUsd: number | null;
  priceChange24h: number | null;
  convertUsdFromRaw: (raw: bigint) => number | null;
  convertFiatFromRaw: (raw: bigint) => number | null;
  formatFiat: (value: number | null) => string | null;
  formatTokenPrice: (usd: number | null) => string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const FALLBACK_FX_FROM_USD: Record<FiatCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83,
  BRL: 5.0,
  KRW: 1350,
  JPY: 150,
  TRY: 32,
  IDR: 16_000,
  AUD: 1.55,
  CAD: 1.36,
};

function detectDefaultCurrency(): FiatCurrency {
  if (typeof navigator === 'undefined') return 'USD';
  const lang = navigator.language || 'en-US';
  if (lang.startsWith('en-GB')) return 'GBP';
  if (lang.startsWith('en-AU')) return 'AUD';
  if (lang.startsWith('en-CA') || lang.startsWith('fr-CA')) return 'CAD';
  if (lang.startsWith('ja')) return 'JPY';
  if (lang.startsWith('ko')) return 'KRW';
  if (lang.startsWith('hi')) return 'INR';
  if (lang.startsWith('pt')) return 'BRL';
  if (lang.startsWith('tr')) return 'TRY';
  if (lang.startsWith('id')) return 'IDR';
  if (lang.startsWith('ru')) return 'USD';
  if (lang.startsWith('zh')) return 'USD';
  if (lang.startsWith('es')) return lang.includes('-ES') || lang === 'es' ? 'EUR' : 'USD';
  if (
    lang.startsWith('de') ||
    lang.startsWith('fr') ||
    lang.startsWith('it')
  ) {
    return 'EUR';
  }
  return 'USD';
}

function rawToUnits(raw: bigint): number {
  return Number(raw) / 10 ** ANSEM_DECIMALS;
}

function priceFractionDigits(value: number): number {
  const abs = Math.abs(value);
  if (abs === 0) return 2;
  if (abs < 0.00001) return 8;
  if (abs < 0.0001) return 7;
  if (abs < 0.001) return 6;
  if (abs < 0.01) return 5;
  if (abs < 1) return 4;
  if (abs < 10) return 3;
  if (abs < 1000) return 2;
  return 0;
}

export function CurrencyProvider({
  children,
  intlLocale,
}: {
  children: ReactNode;
  intlLocale: string;
}) {
  const [currency, setCurrencyState] = useState<FiatCurrency>('USD');
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [fxFromUsd, setFxFromUsd] = useState<Record<FiatCurrency, number>>(FALLBACK_FX_FROM_USD);

  useEffect(() => {
    const stored = readStoredCurrency();
    if (stored) {
      setCurrencyState(stored);
      return;
    }
    setCurrencyState(detectDefaultCurrency());
  }, []);

  useEffect(() => {
    async function pullQuote() {
      try {
        const json = await fetchAnsemQuoteClient();
        setPriceUsd(json.priceUsd);
        setPriceChange24h(json.priceChange24h);
      } catch {
        // ignore
      }
    }
    void pullQuote();
    const id = window.setInterval(pullQuote, 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    async function pullFx() {
      try {
        const res = await fetch('/api/fx-rates');
        if (!res.ok) return;
        const json = (await res.json()) as { rates?: Record<string, number> };
        if (!json.rates) return;
        setFxFromUsd((prev) => {
          const next: Record<FiatCurrency, number> = { ...prev };
          (Object.keys(next) as FiatCurrency[]).forEach((code) => {
            if (code === 'USD') next.USD = 1;
            else if (typeof json.rates?.[code] === 'number') next[code] = json.rates[code]!;
          });
          return next;
        });
      } catch {
        // keep fallback
      }
    }
    void pullFx();
    const id = window.setInterval(pullFx, 10 * 60_000);
    return () => window.clearInterval(id);
  }, []);

  const setCurrency = (c: FiatCurrency) => {
    setCurrencyState(c);
    try {
      window.localStorage.setItem(FIAT_KEY, c);
    } catch {
      // ignore
    }
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const convertUsdFromRaw = (raw: bigint) => {
      if (priceUsd == null) return null;
      const units = rawToUnits(raw);
      if (!Number.isFinite(units)) return null;
      return units * priceUsd;
    };

    const convertFiatFromRaw = (raw: bigint) => {
      const usd = convertUsdFromRaw(raw);
      if (usd == null) return null;
      const fx = fxFromUsd[currency] ?? 1;
      return usd * fx;
    };

    const formatFiat = (value: number | null) => {
      if (value == null || !Number.isFinite(value)) return null;
      return new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency,
        maximumFractionDigits: value >= 1000 ? 0 : value >= 100 ? 1 : 2,
      }).format(value);
    };

    const formatTokenPrice = (usd: number | null) => {
      if (usd == null || !Number.isFinite(usd)) return null;
      const fx = fxFromUsd[currency] ?? 1;
      const fiat = usd * fx;
      const maxFrac = priceFractionDigits(fiat);
      return new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: Math.min(2, maxFrac),
        maximumFractionDigits: maxFrac,
      }).format(fiat);
    };

    return {
      currency,
      setCurrency,
      priceUsd,
      priceChange24h,
      convertUsdFromRaw,
      convertFiatFromRaw,
      formatFiat,
      formatTokenPrice,
    };
  }, [currency, fxFromUsd, intlLocale, priceChange24h, priceUsd]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
