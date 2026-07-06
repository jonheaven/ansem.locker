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
        'relative text-foreground transition-colors duration-700',
        committed ? 'flex h-screen max-h-screen flex-col overflow-hidden' : 'min-h-screen',
      )}
    >
      <AppBackground />

      <div
        className={cn(
          'relative z-10 flex flex-col',
          committed ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-screen',
        )}
      >
        <AppHeader />

        <main
          className={cn(
            'relative flex flex-1 flex-col items-center px-4 sm:px-6',
            committed
              ? 'min-h-0 justify-center overflow-hidden py-4 sm:py-5'
              : 'overflow-y-auto py-6 sm:py-8',
          )}
        >
          <div className="relative z-10 flex w-full min-h-0 flex-1 flex-col items-center justify-center">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
