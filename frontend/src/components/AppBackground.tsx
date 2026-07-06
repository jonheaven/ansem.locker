import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { cn } from '@/lib/cn';

type AppBackgroundProps = {
  className?: string;
};

export function AppBackground({ className }: AppBackgroundProps) {
  const committed = useHasActiveLock();

  return (
    <div
      className={cn('bg-gold-blocks-pattern pointer-events-none fixed inset-0 z-0', className)}
      aria-hidden
    >
      <div
        className={cn(
          'absolute inset-0 transition-colors duration-700',
          committed ? 'bg-black/65' : 'bg-background/25',
        )}
      />
    </div>
  );
}
