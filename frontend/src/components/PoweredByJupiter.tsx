import { JUPITER_LOCK_UI } from '@/lib/jupiter-lock/constants';
import { cn } from '@/lib/cn';

const JUPITER_LOGO_SRC = '/juplogo.png';
const JUPITER_LOCK_SRC = '/jupiter-lock.webp';
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
        'jupiter-brand inline-flex items-center transition-opacity hover:opacity-90',
        variant === 'wordmark' ? 'gap-3' : 'gap-1.5',
        className,
      )}
      aria-label="Powered by Jupiter Lock — open lock.jup.ag"
    >
      {variant === 'wordmark' ? (
        <>
          <img
            src={JUPITER_LOCK_SRC}
            alt=""
            draggable={false}
            aria-hidden
            className="h-10 w-10 shrink-0 rounded-lg object-contain sm:h-11 sm:w-11"
          />
          <span className="flex flex-col gap-1.5">
            <span className="jup-label text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Powered by
            </span>
            <img
              src={JUPITER_WORDMARK_SRC}
              alt="Jupiter"
              draggable={false}
              className="jup-wordmark h-7 w-auto brightness-0 sm:h-8"
            />
          </span>
        </>
      ) : (
        <>
          <img
            src={JUPITER_LOGO_SRC}
            alt=""
            draggable={false}
            aria-hidden
            className="jup-logo h-4 w-4 shrink-0 object-contain"
          />
          <span className="jup-label text-[11px] font-medium text-muted-foreground">
            Powered by <span className="jup-name font-semibold text-foreground">Jupiter</span>
          </span>
        </>
      )}
    </a>
  );
}
