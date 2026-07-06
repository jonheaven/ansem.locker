import { Outlet } from 'react-router-dom';
import { AppBackground } from '@/components/AppBackground';
import { AppHeader } from '@/layout/AppHeader';

export function AppShell() {
  return (
    <div className="relative min-h-screen text-foreground transition-colors duration-700">
      <AppBackground />

      <div className="relative z-10 flex min-h-screen flex-col">
        <AppHeader />

        <main className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
