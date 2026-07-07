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
    committed && 'app-scroll max-h-[min(58vh,520px)] overflow-y-auto overscroll-contain',
  );

  const bullCompact = view === 'lock' && !committed;

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,34%)_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[minmax(0,38%)_minmax(0,1fr)] lg:gap-6">
      {/* Left column — hero + bull (persistent across tabs) */}
      <aside
        className={cn(
          'flex flex-col gap-3 sm:sticky sm:top-[calc(4.5rem+env(safe-area-inset-top))]',
          'max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:items-end max-sm:gap-3',
        )}
      >
        <div className="min-w-0 text-left max-sm:col-start-1 max-sm:row-start-1">
          <h1 className="text-lg font-bold tracking-tight sm:text-xl lg:text-2xl">
            {t('home.headline')}
          </h1>
          <p className="mt-1 line-clamp-3 text-xs leading-snug text-muted-foreground sm:line-clamp-none sm:text-sm sm:leading-relaxed">
            {t('home.tagline')}
          </p>
        </div>

        <BullAside
          compact={bullCompact}
          className="max-sm:col-start-2 max-sm:row-start-1 max-sm:w-[88px] sm:w-full"
        />
      </aside>

      {/* Right column — tab nav + panel content */}
      <div className="flex min-w-0 flex-col">
        <div
          role="tablist"
          aria-label="ansem.locker views"
          className="mb-2 grid grid-cols-2 gap-1 rounded-2xl border border-border/80 bg-surface/80 p-1 shadow-sm backdrop-blur-md sm:flex sm:rounded-full"
        >
          {TAB_IDS.map((tab) => {
            const { id, labelKey } = tab;
            const Icon = 'icon' in tab ? tab.icon : undefined;
            const label = t(labelKey);
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                aria-label={label}
                onClick={() => setView(id)}
                className={cn(
                  'flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-all sm:min-h-10 sm:flex-1 sm:rounded-full sm:py-2 sm:text-sm',
                  view === id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  id === 'locks' && 'col-span-2 sm:col-span-1',
                )}
              >
                {id === 'leaderboard' ? (
                  <DiamondHoovesIcon
                    size="sm"
                    className={view === id ? 'text-background' : undefined}
                  />
                ) : Icon ? (
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                ) : null}
                <span className="truncate">{label}</span>
                {id === 'locks' && claimableCount > 0 ? (
                  <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {claimableCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-clip">
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
                {id === 'lock' && <LockPanel />}
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
