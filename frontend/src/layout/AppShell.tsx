import { Outlet } from 'react-router-dom';
import { AppBackground } from '@/components/AppBackground';
import { AppHeader } from '@/layout/AppHeader';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { cn } from '@/lib/cn';

export function AppShell() {
  const committed = useHasActiveLock();

  return (
    <div className="relative min-h-screen text-foreground transition-colors duration-700">
      <AppBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader />

        <main
          className={cn(
            'relative flex flex-1 flex-col items-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8',
            committed && 'locker-content-bg',
          )}
        >
          {committed ? (
            <div
              className="pointer-events-none absolute inset-0 bg-black/40 transition-colors duration-700"
              aria-hidden
            />
          ) : null}
          <div className="relative z-10 flex w-full flex-1 flex-col items-center">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
