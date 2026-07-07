import { cn } from '@/lib/cn';
import { useCurrency } from '@/lib/currency/currency-context';
import { formatAnsemAmount } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';

type AnsemAmountDisplayProps = {
  raw: bigint;
  /** hero = balance card; lg = my locks; md = lock amount preview; sm = leaderboard row */
  size?: 'hero' | 'lg' | 'md' | 'sm';
  align?: 'left' | 'center' | 'right';
  className?: string;
};

const FIAT_SIZE = {
  hero: 'text-4xl font-bold tracking-tight tabular-nums text-accent sm:text-5xl',
  lg: 'text-xl font-bold tabular-nums text-accent sm:text-2xl',
  md: 'text-2xl font-bold tabular-nums text-accent sm:text-3xl',
  sm: 'text-base font-bold tabular-nums text-accent sm:text-lg',
} as const;

const TOKEN_SIZE = {
  hero: 'mt-1.5 text-sm font-medium tabular-nums text-muted-foreground',
  lg: 'mt-0.5 text-xs font-medium tabular-nums text-muted-foreground sm:text-sm',
  md: 'mt-0.5 text-xs font-medium tabular-nums text-muted-foreground',
  sm: 'mt-0.5 text-[10px] font-medium tabular-nums text-muted-foreground',
} as const;

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

/** Fiat-first amount: local currency prominent, ANSEM beneath. */
export function AnsemAmountDisplay({
  raw,
  size = 'md',
  align = 'right',
  className,
}: AnsemAmountDisplayProps) {
  const { t } = useI18n();
  const { convertFiatFromRaw, formatFiat, priceUsd } = useCurrency();

  const tokenLabel = `${formatAnsemAmount(raw)} ${t('common.ansem')}`;
  const fiat = priceUsd != null && raw > 0n ? formatFiat(convertFiatFromRaw(raw)) : null;

  if (fiat) {
    return (
      <div className={cn(ALIGN[align], className)}>
        <p className={cn('font-mono', FIAT_SIZE[size])}>{fiat}</p>
        <p className={cn('font-mono', TOKEN_SIZE[size])}>{tokenLabel}</p>
      </div>
    );
  }

  return (
    <div className={cn(ALIGN[align], className)}>
      <p className={cn('font-mono text-foreground', FIAT_SIZE[size])}>
        {formatAnsemAmount(raw)}
      </p>
      <p className={cn(TOKEN_SIZE[size], 'text-accent')}>{t('common.ansem')}</p>
    </div>
  );
}

/** @deprecated Use AnsemAmountDisplay — kept for inline suffix use if needed. */
export function AnsemFiatValue({
  raw,
  className,
  inline = true,
}: {
  raw: bigint;
  className?: string;
  inline?: boolean;
}) {
  const { convertFiatFromRaw, formatFiat, priceUsd } = useCurrency();
  if (priceUsd == null || raw <= 0n) return null;
  const formatted = formatFiat(convertFiatFromRaw(raw));
  if (!formatted) return null;
  if (!inline) {
    return <p className={cn('text-sm text-muted-foreground', className)}>{formatted}</p>;
  }
  return <span className={cn('text-muted-foreground', className)}> · {formatted}</span>;
}
