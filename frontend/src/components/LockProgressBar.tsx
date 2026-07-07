import { useNowSec } from '@/hooks/useNowSec';
import { lockProgressPercent } from '@/lib/lock-progress';
import { resolveLockStartTs } from '@/lib/lock-tx-store';
import { cn } from '@/lib/cn';

type LockProgressBarProps = {
  lock: {
    vestingAccount: string;
    lockTs?: number;
    unlockTs: number;
  };
  className?: string;
};

/** Thin band showing how far through the lock period the user is. */
export function LockProgressBar({ lock, className }: LockProgressBarProps) {
  const active = lock.unlockTs > Math.floor(Date.now() / 1000);
  const nowSec = useNowSec(active);
  const lockTs = resolveLockStartTs(lock);
  const pct = lockProgressPercent(lockTs, lock.unlockTs, nowSec);

  if (pct === null) return null;

  return (
    <div
      className={cn('h-1 overflow-hidden bg-border/40', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Lock progress"
    >
      <div
        className="h-full bg-accent transition-[width] duration-1000 ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
