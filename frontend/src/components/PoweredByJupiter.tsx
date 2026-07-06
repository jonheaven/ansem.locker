import { JUPITER_LOCK_UI } from '@/lib/jupiter-lock/constants';
import { cn } from '@/lib/cn';

const JUPITER_LOGO_SRC = '/juplogo.png';
const JUPITER_WORDMARK_SRC = '/jupiter.webp';

type PoweredByJupiterProps = {
  /** Symbol + text for tight spaces; full wordmark for trust blocks */
  variant?: 'compact' | 'wordmark';
  className?: string;
};

export function PoweredByJupiter({
  variant = 'compact',
  className,
}: PoweredByJupiterProps) {
  return (
    <a
      href={JUPITER_LOCK_UI}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center transition-opacity hover:opacity-85',
        variant === 'wordmark' ? 'flex-col gap-2' : 'gap-1.5',
        className,
      )}
      aria-label="Powered by Jupiter Lock — open lock.jup.ag"
    >
      {variant === 'wordmark' ? (
        <>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Powered by
          </span>
          <img
            src={JUPITER_WORDMARK_SRC}
            alt="Jupiter"
            draggable={false}
            className="h-7 w-auto sm:h-8"
          />
        </>
      ) : (
        <>
          <img
            src={JUPITER_LOGO_SRC}
            alt=""
            draggable={false}
            aria-hidden
            className="h-4 w-4 shrink-0 object-contain"
          />
          <span className="text-[11px] font-medium text-muted-foreground">
            Powered by <span className="text-foreground">Jupiter</span>
          </span>
        </>
      )}
    </a>
  );
}
