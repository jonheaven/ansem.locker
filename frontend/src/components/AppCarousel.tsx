import { Trophy, Info, Lock, Wallet } from 'lucide-react';
import { BullAside } from '@/components/BullAside';
import { LockPanel } from '@/components/LockPanel';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { MyLocksPanel } from '@/components/MyLocksPanel';
import { TrustSection } from '@/components/TrustSection';
import { APP_VIEWS, useAppView } from '@/hooks/useAppView';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { GITHUB_URL, JUPITER_LOCK_PROGRAM_ID } from '@/config/constants';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const TAB_IDS = [
  { id: 'lock' as const, labelKey: 'tabs.lock', icon: Lock },
  { id: 'leaderboard' as const, labelKey: 'tabs.ranks', icon: Trophy },
  { id: 'locks' as const, labelKey: 'tabs.yours', icon: Wallet },
  { id: 'info' as const, labelKey: 'tabs.info', icon: Info },
];

export function AppCarousel() {
  const { view, setView, index } = useAppView();
  const committed = useHasActiveLock();
  const { t } = useI18n();

  return (
    <div className="flex w-full max-w-5xl flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
      <BullAside className="sm:sticky sm:top-24" />

      <div className="min-w-0 flex-1">
        <div
          role="tablist"
          aria-label="ansem.locker views"
          className={cn(
            'mb-5 flex rounded-full border border-border/80 p-1.5 shadow-sm backdrop-blur-md',
            committed ? 'bg-surface' : 'bg-surface/80',
          )}
        >
        {TAB_IDS.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors sm:text-base',
              view === id
                ? 'bg-foreground text-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{t(labelKey)}</span>
          </button>
        ))}
        </div>

        <div className="overflow-hidden">
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
                  <div
                    className={cn(
                      'text-left',
                      committed &&
                        'rounded-2xl border border-border/70 bg-surface px-4 py-4 shadow-sm backdrop-blur-md sm:px-5',
                    )}
                  >
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
                <div className="max-h-[min(58vh,520px)] overflow-y-auto overscroll-contain">
                  <LeaderboardTable showSortTabs limit={25} />
                </div>
              )}
              {id === 'locks' && <MyLocksPanel />}
              {id === 'info' && (
                <div className="space-y-4">
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
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
