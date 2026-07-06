import { ExternalLink, Unplug } from 'lucide-react';
import { PoweredByJupiter } from '@/components/PoweredByJupiter';
import { COPY, HOW_IT_WORKS, REASSURANCE } from '@/lib/copy';
import { GITHUB_URL, JUPITER_LOCK_PROGRAM_ID } from '@/config/constants';
import { cn } from '@/lib/cn';

type TrustSectionProps = {
  variant?: 'full' | 'stacked';
};

export function TrustSection({ variant = 'full' }: TrustSectionProps) {
  const stacked = variant === 'stacked';

  return (
    <section className="space-y-6">
      <div>
        <h2
          className={cn(
            'text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground',
            !stacked && 'text-center',
          )}
        >
          How it works
        </h2>
        <ol className={cn('mt-4 grid gap-4', stacked ? 'grid-cols-1' : 'sm:grid-cols-3')}>
          {HOW_IT_WORKS.map(({ step, title, body }) => (
            <li
              key={step}
              className="rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md"
            >
              <span className="text-xs font-medium tabular-nums text-accent">Step {step}</span>
              <h3 className="mt-1 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className={cn('grid gap-4', stacked ? 'grid-cols-1' : 'sm:grid-cols-3')}>
        {REASSURANCE.map(({ title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md"
          >
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div
        className={cn(
          'rounded-2xl border border-accent/25 bg-surface/90 p-5 shadow-sm backdrop-blur-md',
          !stacked && 'mx-auto max-w-2xl',
        )}
      >
        <div className={cn('mb-2 flex', stacked ? '' : 'justify-center')}>
          <Unplug className="h-5 w-5 text-accent" aria-hidden />
        </div>
        <h3 className={cn('text-sm font-semibold text-foreground', !stacked && 'text-center')}>
          {COPY.siteIndependenceTitle}
        </h3>
        <p
          className={cn(
            'mt-2 text-sm leading-relaxed text-muted-foreground',
            !stacked && 'text-center',
          )}
        >
          {COPY.siteIndependenceBody}
        </p>
        <p
          className={cn(
            'mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground',
            stacked ? 'items-start' : 'items-center justify-center',
          )}
        >
          <a
            href={COPY.bonfidaLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            {COPY.siteIndependenceUnlockLabel}
            <ExternalLink className="h-3 w-3" />
          </a>
          <span aria-hidden>·</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            Open-source unlock code
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>

      <div
        className={cn(
          'rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md',
          !stacked && 'mx-auto max-w-2xl text-center',
        )}
      >
        <div className={cn('mb-3 flex', stacked ? '' : 'justify-center')}>
          <PoweredByJupiter variant="wordmark" />
        </div>
        <p className="text-sm font-medium text-foreground">{COPY.bonfidaShort}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{COPY.bonfidaLong}</p>
        <p
          className={cn(
            'mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground',
            stacked ? 'items-start' : 'items-center justify-center',
          )}
        >
          <a
            href={COPY.bonfidaLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            {COPY.bonfidaLinkLabel}
            <ExternalLink className="h-3 w-3" />
          </a>
          <span aria-hidden>·</span>
          <a
            href={`https://solscan.io/account/${JUPITER_LOCK_PROGRAM_ID.toBase58()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono transition-colors hover:text-accent"
          >
            Program on Solscan
          </a>
        </p>
      </div>
    </section>
  );
}
