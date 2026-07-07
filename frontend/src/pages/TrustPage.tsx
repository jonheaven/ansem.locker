import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SolscanLink } from '@/components/SolscanLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrustSection } from '@/components/TrustSection';
import {
  ANSEM_MINT,
  GITHUB_URL,
  JUPITER_LOCK_PROGRAM_ID,
  SITE_URL,
} from '@/config/constants';
import { useI18n } from '@/lib/i18n/i18n-context';
import { solscanAccount, solscanToken } from '@/lib/solscan';

export default function TrustPage() {
  const { t } = useI18n();

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          {t('trust.badge')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('trust.title')}</h1>
        <p className="text-base leading-relaxed text-muted-foreground">{t('trust.intro')}</p>
      </header>

      <TrustSection variant="stacked" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('trust.verifyTitle')}</CardTitle>
          <CardDescription>{t('trust.verifyDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ul className="list-inside list-disc space-y-2 text-muted-foreground">
            <li>
              <a
                href={`${GITHUB_URL}/blob/main/docs/SECURITY.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:text-accent hover:underline"
              >
                {t('trust.securityDoc')}
              </a>
            </li>
            <li>
              <a
                href={`${GITHUB_URL}/blob/main/docs/PHANTOM-TRUST.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:text-accent hover:underline"
              >
                {t('trust.phantomDoc')}
              </a>
            </li>
            <li>
              <a
                href={`${GITHUB_URL}/blob/main/docs/INDEPENDENT-REVIEW.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-2 hover:text-accent hover:underline"
              >
                {t('trust.reviewDoc')}
              </a>
            </li>
            <li>
              <SolscanLink href={solscanAccount(JUPITER_LOCK_PROGRAM_ID.toBase58())}>
                {t('info.programOnSolscan')}
              </SolscanLink>
            </li>
            <li>
              <SolscanLink href={solscanToken(ANSEM_MINT.toBase58())}>
                {t('info.tokenOnSolscan')}
              </SolscanLink>
            </li>
          </ul>
          <p className="rounded-xl border border-border/70 bg-surface/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            {t('trust.phantomNote')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('trust.aiTitle')}</CardTitle>
          <CardDescription>{t('trust.aiDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t('trust.aiBody')}</p>
          <a
            href={`${GITHUB_URL}/blob/main/docs/INDEPENDENT-REVIEW.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
          >
            {t('trust.aiPromptLink')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-accent">
          ← {t('trust.backHome')}
        </Link>
        {' · '}
        <a href={SITE_URL} className="font-mono hover:text-accent">
          {SITE_URL.replace('https://', '')}
        </a>
      </p>
    </div>
  );
}
