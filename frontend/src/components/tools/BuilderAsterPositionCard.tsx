import { ExternalLink, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyWalletButton } from '@/components/CopyWalletButton';
import { BUILDER_WALLET, BUILDER_X, BUILDER_X_URL } from '@/config/constants';
import { useBuilderAsterPosition } from '@/hooks/useBuilderAsterPosition';
import { useCurrency } from '@/lib/currency/currency-context';
import { ASTER_TRADE_URL } from '@/lib/aster/constants';
import { shortenAddress } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

function formatUsd(value: number): string {
  const abs = Math.abs(value);
  const digits = abs >= 1000 ? 0 : abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(2, digits),
    maximumFractionDigits: digits,
  }).format(value);
}

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  const abs = Math.abs(value);
  const digits = abs < 0.01 ? 6 : abs < 1 ? 5 : 4;
  return `$${value.toFixed(digits)}`;
}

export function BuilderAsterPositionCard() {
  const { t } = useI18n();
  const { formatTokenPrice } = useCurrency();
  const { data, isLoading, isError } = useBuilderAsterPosition();

  const position = data?.position;
  const pnl = position?.unrealizedPnlUsdt ?? 0;
  const pnlPositive = pnl > 0;
  const pnlNegative = pnl < 0;

  return (
    <Card className="overflow-hidden border-accent/25 bg-gradient-to-br from-accent/8 via-background to-background shadow-sm">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg sm:text-xl">{t('tools.builderTradeTitle')}</CardTitle>
            <CardDescription className="mt-1 max-w-xl">
              {t('tools.builderTradeDescription', { handle: BUILDER_X })}
            </CardDescription>
          </div>
          <a
            href={ASTER_TRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover"
          >
            {t('tools.openOnAster')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <a
            href={BUILDER_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground transition-colors hover:text-accent"
          >
            {BUILDER_X}
          </a>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 font-mono">
            {shortenAddress(BUILDER_WALLET, 4)}
            <CopyWalletButton address={BUILDER_WALLET} className="h-6 w-6" />
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t('tools.builderTradeLoading')}
          </div>
        ) : isError ? (
          <p className="py-4 text-sm text-muted-foreground">{t('tools.builderTradeError')}</p>
        ) : !position ? (
          <div className="rounded-xl border border-border/70 bg-surface/60 px-4 py-4 text-sm leading-relaxed text-muted-foreground">
            {data?.privacyEnabled ? t('tools.builderTradePrivate') : t('tools.builderTradeFlat')}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
                  position.side === 'long'
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-red-500/10 text-red-500',
                )}
              >
                {position.side === 'long' ? t('tools.long') : t('tools.short')} · {data?.symbol}
              </span>
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                {position.leverage}x
              </span>
              {data?.source === 'api' ? (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {t('tools.builderTradeLive')}
                </span>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label={t('tools.sizeAnsem')} value={position.sizeAnsem.toLocaleString()} />
              <Stat label={t('tools.entry')} value={formatPrice(position.entryPrice)} />
              <Stat
                label={t('tools.mark')}
                value={formatTokenPrice(position.markPrice) ?? formatPrice(position.markPrice)}
              />
              <Stat label={t('tools.notional')} value={formatUsd(position.notionalUsdt)} />
            </div>

            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3',
                pnlPositive && 'border-emerald-500/30 bg-emerald-500/8',
                pnlNegative && 'border-red-500/30 bg-red-500/8',
                !pnlPositive && !pnlNegative && 'border-border/70 bg-surface/60',
              )}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t('tools.unrealizedPnl')}
                </p>
                <p
                  className={cn(
                    'mt-1 font-mono text-2xl font-bold tabular-nums',
                    pnlPositive && 'text-emerald-600',
                    pnlNegative && 'text-red-500',
                  )}
                >
                  {formatUsd(pnl)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pnlPositive ? (
                  <TrendingUp className="h-6 w-6 text-emerald-600" aria-hidden />
                ) : pnlNegative ? (
                  <TrendingDown className="h-6 w-6 text-red-500" aria-hidden />
                ) : null}
                {position.liquidationPrice != null && position.liquidationPrice > 0 ? (
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{t('tools.liqPrice')}</p>
                    <p className="font-mono font-semibold text-foreground">
                      {formatPrice(position.liquidationPrice)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
          {t('tools.builderTradeDisclaimer')}
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface/70 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
