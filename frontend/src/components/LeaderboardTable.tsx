import { useState } from 'react';
import { Medal, Share2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaderboard, sortLocks, type LeaderboardSort } from '@/hooks/useLocks';
import { useXLinks } from '@/hooks/useXLinks';
import { X_SYMBOL } from '@/config/constants';
import { formatAnsemAmount, formatTimeRemaining, shortenAddress } from '@/lib/format';
import { openLeaderboardEntryShare, openLeaderboardHypeShare } from '@/lib/share-x';
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
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const { data, isLoading, isError, error } = useLeaderboard();
  const { data: xLinks } = useXLinks();
  const [sort, setSort] = useState<LeaderboardSort>(initialSort);

  const sorted = sortLocks(data ?? [], sort).slice(0, limit);
  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              Active $ANSEM locks ranked by amount × days remaining
            </CardDescription>
          </div>
          {sorted.length > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 gap-1.5"
              onClick={() => openLeaderboardHypeShare()}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share ranks
            </Button>
          ) : null}
        </div>
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
              const whoLabel = xLink
                ? `@${xLink.xHandle}`
                : shortenAddress(entry.owner, 6);
              const timeRemaining =
                entry.unlockTs > nowSec
                  ? formatTimeRemaining(entry.unlockTs, nowSec)
                  : 'Unlock available';
              const isSelf = wallet === entry.owner;

              return (
                <div
                  key={entry.vestingAccount}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface-elevated px-4 py-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
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
                        {timeRemaining}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="font-mono font-semibold tabular-nums">
                        {formatAnsemAmount(entry.remainingInVault)}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        $ANSEM
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 p-0"
                      title={`Share #${rank} on ${X_SYMBOL}`}
                      aria-label={`Share rank ${rank} on ${X_SYMBOL}`}
                      onClick={() =>
                        openLeaderboardEntryShare({
                          rank,
                          amount: entry.remainingInVault,
                          whoLabel,
                          timeRemaining,
                          isSelf,
                        })
                      }
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
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
