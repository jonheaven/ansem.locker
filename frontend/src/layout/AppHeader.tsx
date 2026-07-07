import { Link } from 'react-router-dom';
import { ToolsNavMenu } from '@/components/ToolsNavMenu';
import { PoweredByJupiter } from '@/components/PoweredByJupiter';
import { AnsemPriceTicker } from '@/components/AnsemPriceTicker';
import { AppWalletButton } from '@/components/AppWalletButton';
import { CopyWalletButton } from '@/components/CopyWalletButton';
import { LocaleCurrencySelector } from '@/components/LocaleCurrencySelector';
import { XMenuButton } from '@/components/XMenuButton';
import { BUILDER_WALLET, BUILDER_X, BUILDER_X_URL, GITHUB_URL } from '@/config/constants';
import { useI18n } from '@/lib/i18n/i18n-context';

function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={className ?? 'flex shrink-0 items-center gap-1 sm:gap-2'}>
      <ToolsNavMenu />
      <LocaleCurrencySelector />
      <XMenuButton />
      <AppWalletButton />
    </div>
  );
}

export function AppHeader() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border/80 bg-background/72 pt-[env(safe-area-inset-top)] backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-700">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-[max(1rem,env(safe-area-inset-left))] py-2 pr-[max(1rem,env(safe-area-inset-right))] sm:gap-6 sm:px-6 sm:py-2.5 lg:gap-8">
        <div className="group flex min-w-0 items-center gap-2 sm:gap-2.5">
          <Link to="/" className="shrink-0">
            <img
              src="/blackbull4.png"
              alt=""
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
          </Link>
          <div className="min-w-0 text-left">
            <Link
              to="/"
              className="block truncate text-base font-semibold tracking-tight text-foreground transition-colors hover:text-accent"
            >
              ansem.locker
            </Link>
            <AnsemPriceTicker className="mt-0.5" />
          </div>
        </div>

        <HeaderActions />
      </div>

      {/* Mobile: condensed trust strip */}
      <div className="border-t border-border/50 px-4 py-1 text-center text-[10px] text-muted-foreground sm:hidden">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
          <a
            href={BUILDER_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {BUILDER_X}
          </a>
          <span aria-hidden>·</span>
          <Link to="/trust" className="transition-colors hover:text-accent">
            {t('trust.badge')}
          </Link>
          <span aria-hidden>·</span>
          <PoweredByJupiter />
        </span>
      </div>

      {/* Desktop: full trust strip */}
      <div className="hidden border-t border-border/50 px-4 py-1 text-center text-[10px] text-muted-foreground sm:block">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
          <span>
            {t('common.builtBy')}{' '}
            <a
              href={BUILDER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-accent"
            >
              {BUILDER_X}
            </a>
          </span>
          <span aria-hidden>·</span>
          <span>
            {t('common.tipBuilder')}{' '}
            <CopyWalletButton address={BUILDER_WALLET} variant="inline" />
          </span>
          <span aria-hidden>·</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-accent"
          >
            {t('common.github')}
          </a>
          <span>· {t('common.openSource')}</span>
          <span aria-hidden>·</span>
          <span>{t('common.nonCustodial')}</span>
          <span aria-hidden>·</span>
          <PoweredByJupiter />
        </span>
      </div>
    </header>
  );
}
