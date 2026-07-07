import { ANSEM_MINT } from '@/config/constants';
import { useCurrency } from '@/lib/currency/currency-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const DEXSCREENER_URL = `https://dexscreener.com/solana/${ANSEM_MINT.toBase58()}`;

type AnsemPriceTickerProps = {
  className?: string;
};

function formatChange(change: number): string {
  const rounded = Math.abs(change) < 0.005 ? 0 : change;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(2)}%`;
}

export function AnsemPriceTicker({ className }: AnsemPriceTickerProps) {
  const { t } = useI18n();
  const { priceUsd, priceChange24h, formatTokenPrice } = useCurrency();

  const price = formatTokenPrice(priceUsd);
  if (!price) return null;

  const change =
    priceChange24h != null && Number.isFinite(priceChange24h) ? priceChange24h : null;
  const changeLabel = change != null ? formatChange(change) : null;
  const tooltip = changeLabel
    ? t('price.tickerAria', { price, change: changeLabel })
    : t('price.tickerAriaNoChange', { price });

  return (
    <a
      href={DEXSCREENER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md tabular-nums transition-colors hover:text-accent',
        className,
      )}
      aria-label={tooltip}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t('common.ansem')}
      </span>
      <span className="truncate text-xs font-semibold text-foreground">{price}</span>
      {changeLabel ? (
        <span
          className={cn(
            'shrink-0 text-[10px] font-semibold',
            change! > 0 && 'text-emerald-600',
            change! < 0 && 'text-red-500',
            change === 0 && 'text-muted-foreground',
          )}
        >
          {changeLabel}
        </span>
      ) : null}
    </a>
  );
}
