import { type ReactNode } from 'react';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { cn } from '@/lib/cn';

/** Locks the app to viewport height in committed mode so only main scrolls once. */
export function CommittedViewport({ children }: { children: ReactNode }) {
  const committed = useHasActiveLock();

  return (
    <div
      className={cn(
        committed && 'flex min-h-0 flex-1 flex-col overflow-hidden',
      )}
    >
      {children}
    </div>
  );
}
