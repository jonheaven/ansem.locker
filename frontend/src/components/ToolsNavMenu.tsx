import { Calculator, CandlestickChart, Wrench } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HoverTooltip } from '@/components/HoverTooltip';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const TOOL_ROUTES = [
  { to: '/tools/calculator', labelKey: 'tools.calculator', icon: Calculator },
  { to: '/tools/chart', labelKey: 'tools.chartNav', icon: CandlestickChart },
] as const;

export function ToolsNavMenu() {
  const { t } = useI18n();
  const location = useLocation();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const onTools = location.pathname.startsWith('/tools');

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <HoverTooltip label={t('tools.title')} hidden={open}>
      <div ref={rootRef} className="relative inline-flex">
        <button
          type="button"
          aria-label={t('tools.title')}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium transition-colors hover:bg-surface-hover',
            (onTools || open) && 'border-accent/40 bg-accent/10 text-accent',
          )}
        >
          <Wrench className="h-4 w-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{t('tools.nav')}</span>
        </button>

        {open ? (
          <div
            id={menuId}
            role="menu"
            aria-label={t('tools.title')}
            className="absolute right-0 top-full z-[60] mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-border/80 bg-background/95 p-1 shadow-xl backdrop-blur-2xl backdrop-saturate-150"
          >
            {TOOL_ROUTES.map(({ to, labelKey, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  role="menuitem"
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-accent/12 font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  {t(labelKey)}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </HoverTooltip>
  );
}
