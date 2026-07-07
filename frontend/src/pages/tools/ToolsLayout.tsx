import { Calculator, CandlestickChart } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const TABS = [
  { to: '/tools/calculator', labelKey: 'tools.calculator', icon: Calculator },
  { to: '/tools/chart', labelKey: 'tools.chartNav', icon: CandlestickChart },
] as const;

export default function ToolsLayout() {
  const { t } = useI18n();

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-4 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('tools.title')}</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('tools.subtitle')}
          </p>
        </div>

        <nav
          aria-label={t('tools.title')}
          className="flex w-full max-w-md rounded-full border border-border/80 bg-surface/80 p-1 shadow-sm backdrop-blur-md"
        >
          {TABS.map(({ to, labelKey, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold transition-all sm:gap-2 sm:px-3 sm:text-sm',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              <span className="truncate">{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
