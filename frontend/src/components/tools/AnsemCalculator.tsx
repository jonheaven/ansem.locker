import { useMemo, useState } from 'react';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ANSEM_DECIMALS } from '@/config/constants';
import { useCurrency } from '@/lib/currency/currency-context';
import { formatAnsemAmount, parseAnsemAmount } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';
import { CURRENCY_SYMBOL } from '@/lib/locale/catalog';
import { cn } from '@/lib/cn';

const ANSEM_PRESETS = [1_000, 10_000, 100_000, 1_000_000] as const;

function parseFiatInput(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) return null;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function ansemToRaw(amount: number): bigint {
  const whole = Math.floor(amount);
  const frac = amount - whole;
  const fracRaw = Math.round(frac * 10 ** ANSEM_DECIMALS);
  return BigInt(whole) * BigInt(10 ** ANSEM_DECIMALS) + BigInt(fracRaw);
}

function rawToAnsemUnits(raw: bigint): number {
  return Number(raw) / 10 ** ANSEM_DECIMALS;
}

export function AnsemCalculator({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n();
  const { currency, priceUsd, convertFiatFromRaw, formatFiat, formatTokenPrice } = useCurrency();
  const [ansemInput, setAnsemInput] = useState('10000');
  const [fiatInput, setFiatInput] = useState('');
  const [lastEdited, setLastEdited] = useState<'ansem' | 'fiat'>('ansem');

  const fiatPerAnsem = useMemo(() => {
    if (priceUsd == null) return null;
    return convertFiatFromRaw(BigInt(10 ** ANSEM_DECIMALS));
  }, [convertFiatFromRaw, priceUsd]);

  const derived = useMemo(() => {
    if (fiatPerAnsem == null || fiatPerAnsem <= 0) {
      return { ansem: null as number | null, fiat: null as number | null };
    }

    if (lastEdited === 'ansem') {
      const trimmed = ansemInput.trim().replace(/,/g, '');
      if (!trimmed) return { ansem: null, fiat: null };
      try {
        const raw = parseAnsemAmount(trimmed);
        const ansem = rawToAnsemUnits(raw);
        const fiat = ansem * fiatPerAnsem;
        return { ansem, fiat };
      } catch {
        return { ansem: null, fiat: null };
      }
    }

    const fiat = parseFiatInput(fiatInput);
    if (fiat == null) return { ansem: null, fiat: null };
    const ansem = fiat / fiatPerAnsem;
    return { ansem, fiat };
  }, [ansemInput, fiatInput, fiatPerAnsem, lastEdited]);

  const displayFiat =
    lastEdited === 'ansem' && derived.fiat != null
      ? derived.fiat.toLocaleString(undefined, {
          maximumFractionDigits: derived.fiat >= 1000 ? 0 : 2,
        })
      : fiatInput;

  const displayAnsem =
    lastEdited === 'fiat' && derived.ansem != null
      ? formatAnsemAmount(ansemToRaw(derived.ansem))
      : ansemInput;

  const handleAnsemChange = (value: string) => {
    setLastEdited('ansem');
    setAnsemInput(value);
  };

  const handleFiatChange = (value: string) => {
    setLastEdited('fiat');
    setFiatInput(value);
  };

  const swapFields = () => {
    if (derived.ansem != null && derived.fiat != null) {
      setAnsemInput(formatAnsemAmount(ansemToRaw(derived.ansem)));
      setFiatInput(
        derived.fiat.toLocaleString(undefined, {
          maximumFractionDigits: derived.fiat >= 1000 ? 0 : 2,
        }),
      );
    }
    setLastEdited((prev) => (prev === 'ansem' ? 'fiat' : 'ansem'));
  };

  const priceLoading = priceUsd == null;

  const priceLine = priceLoading ? (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      {t('tools.priceLoading')}
    </span>
  ) : (
    t('tools.pricePerAnsem', {
      price: formatTokenPrice(priceUsd) ?? '—',
    })
  );

  const body = (
    <>
      {!embedded ? (
        <CardHeader>
          <CardTitle>{t('tools.calculatorTitle')}</CardTitle>
          <CardDescription>{t('tools.calculatorDescription')}</CardDescription>
          <p className="pt-1 text-sm font-medium text-foreground">{priceLine}</p>
        </CardHeader>
      ) : (
        <p className="text-sm font-medium text-foreground">{priceLine}</p>
      )}
      <CardContent className={cn('space-y-4', embedded && 'p-0')}>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t('common.ansem')}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={displayAnsem}
              onChange={(e) => handleAnsemChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 font-mono text-xl font-semibold tabular-nums text-foreground outline-none transition-colors focus:border-accent"
              aria-label={t('tools.ansemAmount')}
            />
          </label>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapFields}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
              aria-label={t('tools.swapAmounts')}
            >
              <ArrowDownUp className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {currency}
            </span>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg text-muted-foreground">
                {CURRENCY_SYMBOL[currency]}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={displayFiat}
                onChange={(e) => handleFiatChange(e.target.value)}
                disabled={priceLoading}
                className={cn(
                  'w-full rounded-xl border border-border bg-surface-elevated py-3 pr-4 font-mono text-xl font-semibold tabular-nums text-foreground outline-none transition-colors focus:border-accent',
                  currency === 'JPY' ? 'pl-10' : 'pl-9',
                )}
                aria-label={t('tools.fiatAmount', { currency })}
              />
            </div>
          </label>
        </div>

        {derived.ansem != null && derived.fiat != null && !priceLoading ? (
          <div className="rounded-xl border border-accent/25 bg-accent/8 px-4 py-3 text-center">
            <p className="text-sm text-muted-foreground">{t('tools.equals')}</p>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              {formatAnsemAmount(ansemToRaw(derived.ansem))} {t('common.ansem')}
              <span className="mx-2 text-muted-foreground">=</span>
              {formatFiat(derived.fiat)}
            </p>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t('tools.quickAmounts')}
          </p>
          <div className="flex flex-wrap gap-2">
            {ANSEM_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setLastEdited('ansem');
                  setAnsemInput(formatAnsemAmount(BigInt(preset) * BigInt(10 ** ANSEM_DECIMALS)));
                }}
                className="min-h-11 rounded-full border border-border px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                {formatAnsemAmount(BigInt(preset) * BigInt(10 ** ANSEM_DECIMALS))}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">{t('tools.calculatorNote')}</p>
      </CardContent>
    </>
  );

  if (embedded) {
    return <div className="space-y-4">{body}</div>;
  }

  return <Card>{body}</Card>;
}
