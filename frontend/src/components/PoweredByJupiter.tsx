import { JUPITER_LOCK_UI } from '@/lib/jupiter-lock/constants';
import { cn } from '@/lib/cn';

const JUPITER_LOGO_SRC = '/juplogo.png';

type PoweredByJupiterProps = {
  /** Larger logo + stacked label for trust blocks; compact for header/footer */
  variant?: 'compact' | 'wordmark';
  className?: string;
};

export function PoweredByJupiter({
  variant = 'compact',
  className,
}: PoweredByJupiterProps) {
  const wordmark = variant === 'wordmark';

  return (
    <a
      href={JUPITER_LOCK_UI}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'jupiter-brand inline-flex items-center transition-opacity hover:opacity-90',
        wordmark ? 'gap-3' : 'gap-1.5',
        className,
      )}
      aria-label="Powered by Jupiter Lock — open lock.jup.ag"
    >
      <img
        src={JUPITER_LOGO_SRC}
        alt=""
        draggable={false}
        aria-hidden
        className={cn(
          'jup-logo shrink-0 object-contain',
          wordmark ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-4 w-4',
        )}
      />
      {wordmark ? (
        <span className="flex flex-col gap-0.5">
          <span className="jup-label text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Powered by
          </span>
          <span className="jup-name text-base font-semibold text-foreground sm:text-lg">Jupiter</span>
        </span>
      ) : (
        <span className="jup-label text-[11px] font-medium text-muted-foreground">
          Powered by <span className="jup-name font-semibold text-foreground">Jupiter</span>
        </span>
      )}
    </a>
  );
}
