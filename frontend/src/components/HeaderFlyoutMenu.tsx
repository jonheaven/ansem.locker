import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HoverTooltip } from '@/components/HoverTooltip';
import { cn } from '@/lib/cn';

const TRIGGER_CLASS =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover sm:h-9 sm:w-9';

const PANEL_CLASS =
  'absolute right-0 top-full z-[60] mt-2 w-max max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border/80 bg-background/95 p-1 shadow-xl backdrop-blur-2xl backdrop-saturate-150';

type HeaderFlyoutMenuProps = {
  label: string;
  active?: boolean;
  trigger: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  panelClassName?: string;
  scrollable?: boolean;
  onClose?: () => void;
};

export function HeaderFlyoutMenu({
  label,
  active,
  trigger,
  children,
  panelClassName,
  scrollable,
  onClose,
}: HeaderFlyoutMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) onClose?.();
  }, [open, onClose]);

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

  const close = () => setOpen(false);

  return (
    <HoverTooltip label={label} hidden={open}>
      <div ref={rootRef} className="relative inline-flex">
        <button
          type="button"
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            TRIGGER_CLASS,
            (active || open) && 'border-accent/40 bg-accent/10 text-accent',
            open && !active && 'bg-surface-hover',
          )}
        >
          {trigger}
        </button>

        {open ? (
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className={cn(
              PANEL_CLASS,
              scrollable && 'max-h-[min(70dvh,28rem)] overflow-y-auto overscroll-y-contain',
              panelClassName,
            )}
          >
            {typeof children === 'function' ? children(close) : children}
          </div>
        ) : null}
      </div>
    </HoverTooltip>
  );
}

export function HeaderFlyoutItem({
  label,
  description,
  icon: Icon,
  onClick,
  active,
  disabled,
  trailing,
  compact,
}: {
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  /** Hide descriptions — better for narrow mobile flyouts */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors whitespace-nowrap',
        compact ? 'min-h-10' : 'min-h-11',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : active
            ? 'bg-accent/12 font-medium text-foreground'
            : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden /> : null}
      <span className="min-w-0 flex-1">
        <span className="block">{label}</span>
        {description && !compact ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground whitespace-normal">
            {description}
          </span>
        ) : null}
      </span>
      {trailing}
    </button>
  );
}

export function HeaderFlyoutLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      className={cn(
        'flex w-full min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap',
        active
          ? 'bg-accent/12 font-medium text-foreground'
          : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden /> : null}
      {label}
    </Link>
  );
}
