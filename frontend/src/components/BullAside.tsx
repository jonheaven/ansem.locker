import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const BULL_SRC = '/blackbull.png';
const BULL_HAPPY_SRC = '/blackbullhover.png';

type BullAsideProps = {
  className?: string;
  /** Shorter bull on the lock tab so the form fits above the fold. */
  compact?: boolean;
};

/** Bull art — lives in the left hero column beside tabbed content. */
export function BullAside({ className, compact }: BullAsideProps) {
  const committed = useHasActiveLock();
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'relative flex w-full shrink-0 flex-col items-center justify-end gap-1 sm:items-start sm:gap-2',
        className,
      )}
    >
      {committed ? (
        <p className="locked-in-glow text-center text-[10px] font-bold uppercase tracking-[0.18em] sm:text-left sm:text-sm sm:tracking-[0.22em]">
          {t('bull.lockedIn')}
        </p>
      ) : null}
      <img
        src={committed ? BULL_HAPPY_SRC : BULL_SRC}
        alt=""
        draggable={false}
        className={cn(
          'w-full object-contain',
          compact
            ? 'max-h-[min(20vh,180px)] sm:max-h-[min(28vh,240px)]'
            : 'max-h-[min(24vh,200px)] sm:max-h-[min(52vh,480px)]',
        )}
        aria-hidden
      />
    </div>
  );
}
