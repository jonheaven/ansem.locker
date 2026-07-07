import { ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SolscanLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Trusted Solana explorer link — always opens solscan.io in a new tab. */
export function SolscanLink({ href, children, className }: SolscanLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 transition-colors hover:text-accent',
        className,
      )}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
    </a>
  );
}
