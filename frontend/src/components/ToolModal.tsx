import { X } from 'lucide-react';
import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type ToolModalSize = 'md' | 'lg';

type ToolModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: ToolModalSize;
};

export function ToolModal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ToolModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-[101] flex max-h-[min(92dvh,720px)] w-full flex-col overflow-hidden border border-border/80 bg-background shadow-2xl',
          'rounded-t-2xl pb-[env(safe-area-inset-bottom)]',
          'sm:max-h-[min(88dvh,680px)] sm:rounded-2xl',
          size === 'md' && 'sm:max-w-md',
          size === 'lg' && 'sm:max-w-2xl',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 sm:px-5">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
