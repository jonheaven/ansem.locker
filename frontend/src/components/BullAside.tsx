import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const BULL_SRC = '/blackbull.png';
const BULL_HAPPY_SRC = '/blackbullhover.png';

type BullAsideProps = {
  className?: string;
};

/** Bull art — sits left of the tabbed UI, always visible on sm+ screens. */
export function BullAside({ className }: BullAsideProps) {
  const committed = useHasActiveLock();
  const { t } = useI18n();

  const bullClass = cn(
    'mx-auto w-full object-contain',
    committed ? 'max-h-[min(36vh,300px)] opacity-95' : 'max-h-[min(58vh,520px)]',
  );

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[300px] shrink-0 flex-col items-center justify-center gap-3 sm:mx-0 sm:w-[38%] sm:max-w-[360px] lg:max-w-[400px]',
        className,
      )}
    >
      {committed ? (
        <p className="text-center text-sm font-bold uppercase tracking-[0.22em] text-accent sm:text-base">
          {t('bull.lockedIn')}
        </p>
      ) : null}
      <img
        src={committed ? BULL_HAPPY_SRC : BULL_SRC}
        alt=""
        draggable={false}
        className={bullClass}
        aria-hidden
      />
    </div>
  );
}
