import { cn } from '@/lib/cn';

type AppBackgroundProps = {
  className?: string;
};

export function AppBackground({ className }: AppBackgroundProps) {
  return (
    <div className={cn('app-bg-fixed', className)} aria-hidden>
      <div className="bg-gold-blocks-pattern absolute inset-0">
        <div className="absolute inset-0 bg-background/25 transition-colors duration-700" />
      </div>
    </div>
  );
}
