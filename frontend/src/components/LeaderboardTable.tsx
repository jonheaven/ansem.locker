import { useState } from 'react';
import { Medal, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaderboard, sortLocks, type LeaderboardSort } from '@/hooks/useLocks';
import { useXLinks } from '@/hooks/useXLinks';
import { formatAnsemAmount, formatTimeRemaining, shortenAddress } from '@/lib/format';
import { cn } from '@/lib/cn';

type LeaderboardPreviewProps = {
  sort?: LeaderboardSort;
  limit?: number;
  showSortTabs?: boolean;
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span className="flex h-8 w-8 items-center justify-center">
        <Medal
          className={cn(
            'h-4 w-4',
            rank === 1 && 'text-foreground',
            rank === 2 && 'text-muted-foreground',
            rank === 3 && 'text-border-strong',
          )}
          aria-hidden
        />
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
      {rank}
    </span>
  );
}

export function LeaderboardTable({
  sort: initialSort = 'score',
  limit = 10,
  showSortTabs = false,
}: LeaderboardPreviewProps) {
  const { data, isLoading, isError, error } = useLeaderboard();
  const { data: xLinks } = useXLinks();
  const [sort, setSort] = useState<LeaderboardSort>(initialSort);

  const sorted = sortLocks(data ?? [], sort).slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Active $ANSEM locks ranked by amount × days remaining
        </CardDescription>
        {showSortTabs && (
          <div className="mt-4 flex gap-2">
            {(
              [
                ['score', 'Score'],
                ['amount', 'Amount'],
                ['duration', 'Duration'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  sort === key
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading locks…</p>
        )}
        {isError && (
          <div className="mx-auto max-w-md py-8 text-center text-sm">
            <p className="text-destructive">
              {error instanceof Error ? error.message : 'Could not load leaderboard'}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The leaderboard needs a dedicated Solana RPC on Vercel (
              <code className="text-foreground">SOLANA_RPC_URL</code>). Free tier at{' '}
              <a
                href="https://helius.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                helius.dev
              </a>{' '}
              works. Redeploy after adding the env var.
            </p>
          </div>
        )}
        {!isLoading && !isError && sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No active locks yet.{' '}
            <Link to="/" className="text-accent hover:underline">
              Lock $ANSEM
            </Link>
          </p>
        )}
        {sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map((entry, i) => {
              const xLink = xLinks?.get(entry.owner);
              const rank = i + 1;
              return (
                <div
                  key={entry.vestingAccount}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-surface-elevated px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <RankBadge rank={rank} />
                    <div className="min-w-0">
                      {xLink ? (
                        <a
                          href={`https://x.com/${xLink.xHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent"
                        >
                          <img src="/x.png" alt="" className="h-3.5 w-3.5" aria-hidden />
                          @{xLink.xHandle}
                        </a>
                      ) : (
                        <a
                          href={`https://solscan.io/account/${entry.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm transition-colors hover:text-accent"
                        >
                          {shortenAddress(entry.owner, 6)}
                        </a>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {xLink ? (
                          <span className="font-mono">{shortenAddress(entry.owner, 4)}</span>
                        ) : null}
                        {xLink ? ' · ' : ''}
                        {entry.unlockTs > Math.floor(Date.now() / 1000)
                          ? formatTimeRemaining(entry.unlockTs)
                          : 'Unlock available'}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono font-semibold tabular-nums">
                      {formatAnsemAmount(entry.remainingInVault)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      $ANSEM
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
