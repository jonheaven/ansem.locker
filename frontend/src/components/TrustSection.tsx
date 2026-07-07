import { ExternalLink, Unplug } from 'lucide-react';
import { PoweredByJupiter } from '@/components/PoweredByJupiter';
import { SolscanLink } from '@/components/SolscanLink';
import { ANSEM_MINT, GITHUB_URL, JUPITER_LOCK_PROGRAM_ID } from '@/config/constants';
import { useI18n } from '@/lib/i18n/i18n-context';
import { solscanAccount, solscanToken } from '@/lib/solscan';
import { cn } from '@/lib/cn';

const STEPS = [
  { step: 1, titleKey: 'info.step1Title', bodyKey: 'info.step1Body' },
  { step: 2, titleKey: 'info.step2Title', bodyKey: 'info.step2Body' },
  { step: 3, titleKey: 'info.step3Title', bodyKey: 'info.step3Body' },
] as const;

const REASSURANCE = [
  { titleKey: 'info.reassuranceNonCustodialTitle', bodyKey: 'info.reassuranceNonCustodialBody' },
  { titleKey: 'info.reassuranceFixedTitle', bodyKey: 'info.reassuranceFixedBody' },
  { titleKey: 'info.reassurancePublicTitle', bodyKey: 'info.reassurancePublicBody' },
] as const;

type TrustSectionProps = {
  variant?: 'full' | 'stacked';
};

export function TrustSection({ variant = 'full' }: TrustSectionProps) {
  const stacked = variant === 'stacked';
  const { t } = useI18n();

  return (
    <section className="space-y-6">
      <div
        className={cn(
          'rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md',
          !stacked && 'mx-auto max-w-2xl text-center',
        )}
      >
        <div className={cn('mb-3 flex', stacked ? '' : 'justify-center')}>
          <PoweredByJupiter variant="wordmark" />
        </div>
        <p className="text-sm font-medium text-foreground">{t('info.jupiterShort')}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('info.jupiterLong')}</p>
        <p
          className={cn(
            'mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground',
            stacked ? 'items-start' : 'items-center justify-center',
          )}
        >
          <a
            href="https://lock.jup.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            {t('info.aboutJupiter')}
            <ExternalLink className="h-3 w-3" />
          </a>
          <span aria-hidden>·</span>
          <SolscanLink href={solscanAccount(JUPITER_LOCK_PROGRAM_ID.toBase58())} className="font-mono">
            {t('info.programOnSolscan')}
          </SolscanLink>
          <span aria-hidden>·</span>
          <SolscanLink href={solscanToken(ANSEM_MINT.toBase58())} className="font-mono">
            {t('info.tokenOnSolscan')}
          </SolscanLink>
        </p>
      </div>

      <div className={cn('grid gap-4', stacked ? 'grid-cols-1' : 'sm:grid-cols-3')}>
        {REASSURANCE.map(({ titleKey, bodyKey }) => (
          <div
            key={titleKey}
            className="rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md"
          >
            <h3 className="font-semibold">{t(titleKey)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t(bodyKey)}</p>
          </div>
        ))}
      </div>

      <div>
        <h2
          className={cn(
            'text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground',
            !stacked && 'text-center',
          )}
        >
          {t('info.howItWorks')}
        </h2>
        <ol className={cn('mt-4 grid gap-4', stacked ? 'grid-cols-1' : 'sm:grid-cols-3')}>
          {STEPS.map(({ step, titleKey, bodyKey }) => (
            <li
              key={step}
              className="rounded-2xl border border-border/80 bg-surface/90 p-5 shadow-sm backdrop-blur-md"
            >
              <span className="text-xs font-medium tabular-nums text-accent">
                {t('info.stepLabel', { step })}
              </span>
              <h3 className="mt-1 font-semibold">{t(titleKey)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(bodyKey)}</p>
            </li>
          ))}
        </ol>
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
          {t('info.offlineTitle')}
        </h3>
        <p
          className={cn(
            'mt-2 text-sm leading-relaxed text-muted-foreground',
            !stacked && 'text-center',
          )}
        >
          {t('info.offlineBody')}
        </p>
        <p
          className={cn(
            'mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground',
            stacked ? 'items-start' : 'items-center justify-center',
          )}
        >
          <a
            href="https://lock.jup.ag"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            {t('info.claimOnJupiter')}
            <ExternalLink className="h-3 w-3" />
          </a>
          <span aria-hidden>·</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            {t('info.openSourceUnlock')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </section>
  );
}
