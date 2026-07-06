import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { cn } from '@/lib/cn';

const BULL_SRC = '/blackbull.png';
const BULL_HAPPY_SRC = '/blackbullhover.png';

type BullAsideProps = {
  className?: string;
};

/** Bull art — sits left of the tabbed UI, always visible on sm+ screens. */
export function BullAside({ className }: BullAsideProps) {
  const committed = useHasActiveLock();

  const bullClass = cn(
    'relative z-10 mx-auto w-full object-contain',
    committed ? 'max-h-[min(52vh,440px)] opacity-90' : 'max-h-[min(58vh,520px)]',
  );

  return (
    <div
      className={cn(
        'relative mx-auto flex w-full max-w-[300px] shrink-0 items-center justify-center sm:mx-0 sm:w-[38%] sm:max-w-[360px] lg:max-w-[400px]',
        className,
      )}
      aria-hidden
    >
      <div className="relative w-full">
        {committed ? (
          <>
            <img
              src="/locked-bg.jpg"
              alt=""
              className="absolute inset-0 rounded-2xl object-cover object-center"
            />
            <div className="absolute inset-0 rounded-2xl bg-black/30" />
          </>
        ) : null}
        <img
          src={committed ? BULL_HAPPY_SRC : BULL_SRC}
          alt=""
          draggable={false}
          className={bullClass}
        />
      </div>
    </div>
  );
}
