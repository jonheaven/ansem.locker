import * as React from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'app-card rounded-2xl border border-border/80 bg-surface shadow-sm backdrop-blur-md transition-colors duration-700',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-4 sm:p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-xl font-semibold tracking-tight sm:text-2xl', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-base leading-relaxed text-muted-foreground', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4 pt-0 sm:px-6 sm:pb-6', className)} {...props} />;
}
