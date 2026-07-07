import { HelpCircle, Info, Lock, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BullAside } from '@/components/BullAside';
import { DiamondHoovesIcon } from '@/components/DiamondHoovesIcon';
import { LockPanel } from '@/components/LockPanel';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { MyLocksPanel } from '@/components/MyLocksPanel';
import { TrustSection } from '@/components/TrustSection';
import { WhyLockSection } from '@/components/WhyLockSection';
import { APP_VIEWS, useAppView } from '@/hooks/useAppView';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { useMyLocks } from '@/hooks/useLocks';
import { SolscanLink } from '@/components/SolscanLink';
import { GITHUB_URL, JUPITER_LOCK_PROGRAM_ID } from '@/config/constants';
import { solscanAccount } from '@/lib/solscan';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const TAB_IDS = [
  { id: 'lock' as const, labelKey: 'tabs.lock', icon: Lock },
  { id: 'leaderboard' as const, labelKey: 'tabs.ranks' },
  { id: 'why' as const, labelKey: 'tabs.why', icon: HelpCircle },
  { id: 'how' as const, labelKey: 'tabs.how', icon: Info },
  { id: 'locks' as const, labelKey: 'tabs.myLocks', icon: Wallet },
] as const;

export function AppCarousel() {
  const { view, setView, index } = useAppView();
  const committed = useHasActiveLock();
  const { locks } = useMyLocks();
  const { t } = useI18n();
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const id = window.setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1_000);
    return () => window.clearInterval(id);
  }, []);

  const claimableCount = locks.filter(
    (l) => l.unlockTs <= nowSec && l.remainingInVault > 0n,
  ).length;

  const scrollPanelClass = cn(
    !committed && 'app-scroll max-h-[min(58vh,520px)] overflow-y-auto overscroll-contain',
  );

  return (
    <div className="flex w-full max-w-5xl flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
      <BullAside className="sm:sticky sm:top-24" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div
          role="tablist"
          aria-label="ansem.locker views"
          className="mb-4 flex rounded-full border border-border/80 bg-surface/80 p-1 shadow-sm backdrop-blur-md"
        >
          {TAB_IDS.map((tab) => {
            const { id, labelKey } = tab;
            const Icon = 'icon' in tab ? tab.icon : undefined;
            return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 rounded-full px-1 py-2 text-xs font-semibold transition-all sm:gap-1.5 sm:px-2 sm:py-2.5 sm:text-sm',
                view === id
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {id === 'leaderboard' ? (
                <DiamondHoovesIcon
                  size="sm"
                  className={view === id ? 'text-background' : undefined}
                />
              ) : Icon ? (
                <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              ) : null}
              <span className="truncate">{t(labelKey)}</span>
              {id === 'locks' && claimableCount > 0 ? (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                  {claimableCount}
                </span>
              ) : null}
            </button>
            );
          })}
        </div>

        <div className="overflow-x-hidden">
          <div
            className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {APP_VIEWS.map((id) => (
              <div
                key={id}
                className="w-full shrink-0 px-0.5"
                role="tabpanel"
                aria-hidden={view !== id}
              >
                {id === 'lock' && (
                  <div className="space-y-4">
                    <div className="text-left">
                      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {t('home.headline')}
                      </h1>
                      <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {t('home.tagline')}
                      </p>
                    </div>
                    <LockPanel />
                  </div>
                )}
                {id === 'leaderboard' && (
                  <LeaderboardTable showSortTabs limit={25} />
                )}
                {id === 'why' && (
                  <div className={scrollPanelClass}>
                    <WhyLockSection />
                  </div>
                )}
                {id === 'how' && (
                  <div className={cn('space-y-4', scrollPanelClass)}>
                    <TrustSection variant="stacked" />
                    <p className="text-center text-[11px] text-muted-foreground">
                      <SolscanLink
                        href={solscanAccount(JUPITER_LOCK_PROGRAM_ID.toBase58())}
                        className="font-mono"
                      >
                        {t('info.program')}
                      </SolscanLink>
                      {' · '}
                      <a
                        href={`${GITHUB_URL}/blob/main/docs/SECURITY.md`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-accent"
                      >
                        {t('info.security')}
                      </a>
                      {' · '}
                      <a href={GITHUB_URL} className="transition-colors hover:text-accent">
                        {t('info.source')}
                      </a>
                      {' · '}
                      <Link to="/trust" className="transition-colors hover:text-accent">
                        {t('trust.badge')}
                      </Link>
                    </p>
                  </div>
                )}
                {id === 'locks' && <MyLocksPanel />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
