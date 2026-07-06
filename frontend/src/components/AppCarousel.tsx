import { Trophy, Info, Lock, Wallet } from 'lucide-react';
import { BullAside } from '@/components/BullAside';
import { LockPanel } from '@/components/LockPanel';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { MyLocksPanel } from '@/components/MyLocksPanel';
import { TrustSection } from '@/components/TrustSection';
import { APP_VIEWS, type AppView, useAppView } from '@/hooks/useAppView';
import { GITHUB_URL, JUPITER_LOCK_PROGRAM_ID } from '@/config/constants';
import { COPY } from '@/lib/copy';
import { cn } from '@/lib/cn';

const TABS: { id: AppView; label: string; icon: typeof Lock }[] = [
  { id: 'lock', label: 'Lock', icon: Lock },
  { id: 'leaderboard', label: 'Ranks', icon: Trophy },
  { id: 'locks', label: 'Yours', icon: Wallet },
  { id: 'info', label: 'Info', icon: Info },
];

export function AppCarousel() {
  const { view, setView, index } = useAppView();

  return (
    <div className="flex w-full max-w-5xl flex-col items-stretch gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
      <BullAside className="sm:sticky sm:top-24" />

      <div className="min-w-0 flex-1">
        <div
          role="tablist"
          aria-label="ansem.locker views"
          className="mb-5 flex rounded-full border border-border/80 bg-surface/80 p-1.5 shadow-sm backdrop-blur-md"
        >
        {TABS.map(({ id, label, icon: Icon }) => (
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
            <span className="truncate">{label}</span>
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
                  <div className="text-left">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {COPY.headline}
                    </h1>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground sm:text-lg">
                      {COPY.tagline}
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
                      Program
                    </a>
                    {' · '}
                    <a
                      href={`${GITHUB_URL}/blob/main/docs/SECURITY.md`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-accent"
                    >
                      Security
                    </a>
                    {' · '}
                    <a href={GITHUB_URL} className="transition-colors hover:text-accent">
                      Source
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
