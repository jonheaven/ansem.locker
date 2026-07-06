import { Diamond, HelpCircle, Info, Lock, Wallet } from 'lucide-react';
import { BullAside } from '@/components/BullAside';
import { LockPanel } from '@/components/LockPanel';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { MyLocksPanel } from '@/components/MyLocksPanel';
import { TrustSection } from '@/components/TrustSection';
import { WhyLockSection } from '@/components/WhyLockSection';
import { APP_VIEWS, useAppView } from '@/hooks/useAppView';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { GITHUB_URL, JUPITER_LOCK_PROGRAM_ID } from '@/config/constants';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const TAB_IDS = [
  { id: 'lock' as const, labelKey: 'tabs.lock', icon: Lock },
  { id: 'leaderboard' as const, labelKey: 'tabs.ranks', icon: Diamond },
  { id: 'why' as const, labelKey: 'tabs.why', icon: HelpCircle },
  { id: 'how' as const, labelKey: 'tabs.how', icon: Info },
  { id: 'locks' as const, labelKey: 'tabs.myLocks', icon: Wallet },
] as const;

export function AppCarousel() {
  const { view, setView, index } = useAppView();
  const committed = useHasActiveLock();
  const { t } = useI18n();

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
          {TAB_IDS.map(({ id, labelKey, icon: Icon }) => (
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
              <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden />
              <span className="truncate">{t(labelKey)}</span>
            </button>
          ))}
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
                  <div className={scrollPanelClass}>
                    <LeaderboardTable showSortTabs limit={25} />
                  </div>
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
                      <a
                        href={`https://solscan.io/account/${JUPITER_LOCK_PROGRAM_ID.toBase58()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono transition-colors hover:text-accent"
                      >
                        {t('info.program')}
                      </a>
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
