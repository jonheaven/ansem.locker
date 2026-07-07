import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type HoverTooltipProps = {
  label: string;
  children: ReactNode;
  className?: string;
  /** Hide while a menu or popover is open */
  hidden?: boolean;
  side?: 'bottom' | 'top';
  multiline?: boolean;
  /** Horizontal alignment relative to the trigger */
  align?: 'center' | 'start' | 'end';
};

type TooltipCoords = {
  top: number;
  left: number;
  transform: string;
};

function computeCoords(
  rect: DOMRect,
  side: 'bottom' | 'top',
  align: 'center' | 'start' | 'end',
): TooltipCoords {
  const gap = 6;
  const padding = 10;

  let left = rect.left + rect.width / 2;
  let transform = 'translateX(-50%)';

  if (align === 'end') {
    left = rect.right;
    transform = 'translateX(-100%)';
  } else if (align === 'start') {
    left = rect.left;
    transform = 'translateX(0)';
  }

  const top = side === 'bottom' ? rect.bottom + gap : rect.top - gap;
  const transformY = side === 'top' ? 'translateY(-100%)' : '';
  transform = [transform, transformY].filter(Boolean).join(' ');

  // Nudge inside viewport once rendered; rough clamp for first paint
  const estWidth = 160;
  if (align === 'center') {
    left = Math.max(padding + estWidth / 2, Math.min(window.innerWidth - padding - estWidth / 2, left));
  } else if (align === 'end') {
    left = Math.min(left, window.innerWidth - padding);
  } else {
    left = Math.max(padding, left);
  }

  return { top, left, transform };
}

export function HoverTooltip({
  label,
  children,
  className,
  hidden = false,
  side = 'bottom',
  multiline = false,
  align = 'center',
}: HoverTooltipProps) {
  const tooltipId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    setCoords(computeCoords(el.getBoundingClientRect(), side, align));
  }, [side, align]);

  const show = useCallback(() => {
    if (hidden) return;
    updatePosition();
    setVisible(true);
  }, [hidden, updatePosition]);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;

    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [visible, updatePosition]);

  if (!label) {
    return <div className={cn('inline-flex', className)}>{children}</div>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={cn('inline-flex', className)}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={(e) => {
          if (!triggerRef.current?.contains(e.relatedTarget as Node)) {
            hide();
          }
        }}
      >
        {children}
      </div>
      {visible && !hidden && coords
        ? createPortal(
            <span
              id={tooltipId}
              role="tooltip"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                transform: coords.transform,
                zIndex: 10001,
              }}
              className={cn(
                'pointer-events-none max-w-[min(16rem,calc(100vw-1.25rem))] rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-medium leading-snug tracking-wide text-background shadow-lg',
                multiline ? 'whitespace-normal text-center' : 'whitespace-nowrap',
              )}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
