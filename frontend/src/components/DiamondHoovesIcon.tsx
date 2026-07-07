import { Diamond } from 'lucide-react';
import { cn } from '@/lib/cn';

type DiamondHoovesIconProps = {
  className?: string;
  size?: 'sm' | 'md';
};

function Horns({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 14" className={className} aria-hidden fill="currentColor">
      <path d="M12 14c-1.4 0-2.6-.6-3.4-1.5C6.8 10.6 5.2 7.8 4 4.5 3.2 2.4 3.5.9 4.8.2 6.2 2.4 7.6 4.8 9 7c.7 1.1 1.4 1.8 2.4 2.2 0 1.5 0 3.3 0 4.8z" />
      <path d="M12 14c1.4 0 2.6-.6 3.4-1.5 1.8-1.9 3.4-4.7 4.6-8 1-2.1.7-3.6-.6-4.3-1.4 2.2-2.8 4.6-4.2 6.8-.7 1.1-1.4 1.8-2.4 2.2 0 1.5 0 3.3 0 4.8z" />
    </svg>
  );
}

/** Diamond with bull horns — used for Diamond Hooves branding. */
export function DiamondHoovesIcon({ className, size = 'md' }: DiamondHoovesIconProps) {
  const horn = size === 'sm' ? 'h-2 w-2.5' : 'h-2.5 w-3';
  const diamond = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <span
      className={cn('inline-flex shrink-0 items-end gap-0.5 text-accent', className)}
      aria-hidden
    >
      <Horns className={cn(horn, 'opacity-90')} />
      <Diamond className={diamond} />
      <Horns className={cn(horn, 'scale-x-[-1] opacity-90')} />
    </span>
  );
}

/** Menu-row size — matches Lucide icon slot in XMenuButton. */
export function DiamondHoovesMenuIcon({ className }: { className?: string }) {
  return <DiamondHoovesIcon size="sm" className={cn('text-foreground', className)} />;
}
