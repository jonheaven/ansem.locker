import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { cn } from '@/lib/cn';

const LOCKER_BG_SRC = '/lockerbg.jpg';

type AppBackgroundProps = {
  className?: string;
};

export function AppBackground({ className }: AppBackgroundProps) {
  const committed = useHasActiveLock();

  return (
    <div className={cn('pointer-events-none fixed inset-0 z-0', className)} aria-hidden>
      {committed ? (
        <>
          <img
            src={LOCKER_BG_SRC}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/40 transition-colors duration-700" />
        </>
      ) : (
        <div className="bg-gold-blocks-pattern absolute inset-0">
          <div className="absolute inset-0 bg-background/25 transition-colors duration-700" />
        </div>
      )}
    </div>
  );
}
