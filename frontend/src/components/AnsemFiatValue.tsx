import { cn } from '@/lib/cn';
import { useCurrency } from '@/lib/currency/currency-context';

type AnsemFiatValueProps = {
  raw: bigint;
  className?: string;
  inline?: boolean;
};

/** Secondary fiat estimate for an ANSEM raw amount. */
export function AnsemFiatValue({ raw, className, inline = true }: AnsemFiatValueProps) {
  const { convertFiatFromRaw, formatFiat, priceUsd } = useCurrency();

  if (priceUsd == null || raw <= 0n) return null;

  const formatted = formatFiat(convertFiatFromRaw(raw));
  if (!formatted) return null;

  if (!inline) {
    return <p className={cn('text-sm text-muted-foreground', className)}>≈ {formatted}</p>;
  }

  return (
    <span className={cn('text-muted-foreground', className)}>
      {' '}
      · ≈ {formatted}
    </span>
  );
}
