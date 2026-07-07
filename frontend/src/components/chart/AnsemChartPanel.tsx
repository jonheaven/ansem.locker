import { ExternalLink, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnsemCandlestickChart } from '@/components/chart/AnsemCandlestickChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAsterKlines, useAsterTicker } from '@/hooks/useAsterMarket';
import { useCurrency } from '@/lib/currency/currency-context';
import {
  ASTER_KLINE_INTERVALS,
  ASTER_TRADE_URL,
  type AsterKlineInterval,
} from '@/lib/aster/constants';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return value.toFixed(2);
}

function formatPercent(change: number): string {
  if (!Number.isFinite(change)) return '—';
  const rounded = Math.abs(change) < 0.005 ? 0 : change;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(2)}%`;
}

export function AnsemChartPanel() {
  const { t } = useI18n();
  const { formatTokenPrice } = useCurrency();
  const [interval, setInterval] = useState<AsterKlineInterval>('1h');

  const ticker = useAsterTicker();
  const klines = useAsterKlines(interval);

  const price = formatTokenPrice(ticker.data?.price ?? null);
  const change = ticker.data?.priceChangePercent;
  const changeLabel = change != null ? formatPercent(change) : null;

  const stats = useMemo(
    () => [
      {
        label: t('tools.high24h'),
        value: formatTokenPrice(ticker.data?.highPrice ?? null) ?? '—',
      },
      {
        label: t('tools.low24h'),
        value: formatTokenPrice(ticker.data?.lowPrice ?? null) ?? '—',
      },
      {
        label: t('tools.volume24h'),
        value: ticker.data ? `$${formatCompact(ticker.data.quoteVolume)}` : '—',
      },
    ],
    [t, ticker.data, formatTokenPrice],
  );

  return (
    <Card className="overflow-clip border-border/80 bg-background/80 shadow-sm backdrop-blur-md">
      <CardHeader className="space-y-4 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{t('tools.chart')}</CardTitle>
            <CardDescription className="mt-1">{t('tools.chartDescription')}</CardDescription>
          </div>
          <a
            href={ASTER_TRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            {t('tools.openOnAster')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('common.ansem')}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {price ?? (ticker.isLoading ? '…' : '—')}
              </p>
              {changeLabel ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-sm font-semibold',
                    change! > 0 && 'bg-emerald-500/10 text-emerald-600',
                    change! < 0 && 'bg-red-500/10 text-red-500',
                    change === 0 && 'bg-surface text-muted-foreground',
                  )}
                >
                  {change! > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  ) : change! < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                  ) : null}
                  {changeLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border/70 bg-surface/70 px-3 py-2"
              >
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={t('tools.interval')}
          className="flex flex-wrap gap-1 rounded-full border border-border/80 bg-surface/80 p-1"
        >
          {ASTER_KLINE_INTERVALS.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={interval === item}
              onClick={() => setInterval(item)}
              className={cn(
                'min-h-11 rounded-full px-3 py-2.5 font-mono text-xs font-semibold transition-colors sm:py-1.5',
                interval === item
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative h-[min(58vh,520px)] min-h-[320px] w-full px-2 pb-3 pt-2 sm:px-4">
          {klines.isLoading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('tools.loading')}
            </div>
          ) : klines.isError || !klines.data?.length ? (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              {t('tools.loadError')}
            </div>
          ) : (
            <AnsemCandlestickChart bars={klines.data} className="h-full" />
          )}
        </div>

        <p className="border-t border-border/60 px-4 py-2 text-center text-[10px] text-muted-foreground">
          {t('tools.poweredByAster')}
        </p>
      </CardContent>
    </Card>
  );
}
