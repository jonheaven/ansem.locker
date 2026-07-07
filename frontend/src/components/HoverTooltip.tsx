import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type HoverTooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
  /** Hide while a menu or popover is open */
  hidden?: boolean;
  side?: 'bottom' | 'top';
  multiline?: boolean;
};

export function HoverTooltip({
  label,
  children,
  className,
  hidden = false,
  side = 'bottom',
  multiline = false,
}: HoverTooltipProps) {
  if (!label) {
    return <div className={cn('inline-flex', className)}>{children}</div>;
  }

  const below = side === 'bottom';

  return (
    <div className={cn('group/tooltip relative inline-flex', className)}>
      {children}
      {!hidden ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-[70] -translate-x-1/2 rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-medium tracking-wide text-background opacity-0 shadow-lg transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
            multiline ? 'max-w-[min(16rem,70vw)] whitespace-normal text-center' : 'whitespace-nowrap',
            below ? 'top-[calc(100%+6px)]' : 'bottom-[calc(100%+6px)]',
          )}
        >
          <span
            className={cn(
              'absolute left-1/2 -translate-x-1/2 border-[5px] border-transparent',
              below ? 'bottom-full border-b-foreground' : 'top-full border-t-foreground',
            )}
            aria-hidden
          />
          {label}
        </span>
      ) : null}
    </div>
  );
}
