import { Outlet } from 'react-router-dom';
import { AppBackground } from '@/components/AppBackground';
import { AppHeader } from '@/layout/AppHeader';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { cn } from '@/lib/cn';

export function AppShell() {
  const committed = useHasActiveLock();

  return (
    <div
      className={cn(
        'relative flex min-h-0 flex-1 flex-col text-foreground transition-colors duration-700',
        !committed && 'min-h-screen',
      )}
    >
      <AppBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <AppHeader />

        {/* Single scroll container in locked-in mode — background stays fixed */}
        <main
          className={cn(
            'relative min-h-0 flex-1 px-4 sm:px-6',
            committed
              ? 'overflow-y-auto overscroll-y-contain py-4 sm:py-5'
              : 'overflow-y-auto py-6 sm:py-8',
          )}
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
