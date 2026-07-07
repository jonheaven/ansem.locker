import { Check } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type HeaderIconPickerProps<T extends string> = {
  tooltip: string;
  ariaLabel: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  trigger: ReactNode;
  className?: string;
};

export function HeaderIconPicker<T extends string>({
  tooltip,
  ariaLabel,
  value,
  onChange,
  options,
  trigger,
  className,
}: HeaderIconPickerProps<T>) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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

  return (
    <div ref={rootRef} className={cn('group/pick relative', className)}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-border bg-surface px-2 text-foreground transition-colors hover:bg-surface-hover',
          open && 'border-accent/40 bg-surface-hover ring-2 ring-accent/20',
        )}
      >
        {trigger}
      </button>

      {!open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute top-[calc(100%+6px)] left-1/2 z-[70] -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-medium tracking-wide text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover/pick:opacity-100 group-focus-within/pick:opacity-100"
        >
          <span
            className="absolute bottom-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-b-foreground"
            aria-hidden
          />
          {tooltip}
        </span>
      ) : null}

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-[60] mt-2 min-w-[9.5rem] overflow-hidden rounded-xl border border-border/80 bg-background/95 p-1 shadow-xl backdrop-blur-2xl backdrop-saturate-150"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  selected
                    ? 'bg-accent/12 font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground',
                )}
              >
                <span>{opt.label}</span>
                {selected ? <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
