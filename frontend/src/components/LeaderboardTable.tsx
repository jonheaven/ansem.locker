import { useState } from 'react';
import { Medal, Share2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnsemFiatValue } from '@/components/AnsemFiatValue';
import { FlexVerifyForm } from '@/components/FlexVerifyForm';
import { LockerListPanel } from '@/components/LockerListPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaderboard, sortLocks, type LeaderboardSort } from '@/hooks/useLocks';
import { useLockerList } from '@/hooks/useLockerList';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { useXLinks } from '@/hooks/useXLinks';
import { formatAnsemAmount, shortenAddress } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';
import { openLeaderboardEntryShare, openLeaderboardHypeShare } from '@/lib/share-x';
import { cn } from '@/lib/cn';

type LeaderboardPreviewProps = {
  sort?: LeaderboardSort;
  limit?: number;
  showSortTabs?: boolean;
};

const RANK_STYLES: Record<
  1 | 2 | 3,
  { strip: string; medal: string }
> = {
  1: { strip: 'bg-[#D4AF37]', medal: 'text-[#D4AF37]' },
  2: { strip: 'bg-[#B8B8B8]', medal: 'text-[#B8B8B8]' },
  3: { strip: 'bg-[#CD7F32]', medal: 'text-[#CD7F32]' },
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const styles = RANK_STYLES[rank as 1 | 2 | 3];
    return (
      <span className="flex h-8 w-8 items-center justify-center">
        <Medal className={cn('h-4 w-4 fill-current', styles.medal)} aria-hidden />
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
  const { t } = useI18n();
  const { formatTimeRemaining } = useLocalizedFormat();
  const { data: lockerList = [] } = useLockerList();
  const verifiedWallets = new Set(lockerList.map((e) => e.wallet));

  const sorted = sortLocks(data ?? [], sort).slice(0, limit);
  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div className="space-y-4">
      <LockerListPanel />
      <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              {t('leaderboard.title')}
            </CardTitle>
            <CardDescription>{t('leaderboard.description')}</CardDescription>
          </div>
          {sorted.length > 0 ? (
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0 gap-1.5"
              onClick={() => openLeaderboardHypeShare()}
            >
              <Share2 className="h-3.5 w-3.5" />
              {t('leaderboard.shareRanks')}
            </Button>
          ) : null}
        </div>
        {showSortTabs && (
          <div className="mt-4 flex gap-2">
            {(
              [
                ['score', 'leaderboard.sortScore'],
                ['amount', 'leaderboard.sortAmount'],
                ['duration', 'leaderboard.sortDuration'],
              ] as const
            ).map(([key, labelKey]) => (
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
                {t(labelKey)}
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('leaderboard.loading')}
          </p>
        )}
        {isError && (
          <div className="mx-auto max-w-md py-8 text-center text-sm">
            <p className="text-destructive">
              {error instanceof Error ? error.message : t('leaderboard.loadError')}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t('leaderboard.rpcHint')}
            </p>
          </div>
        )}
        {!isLoading && !isError && sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t('leaderboard.empty')}{' '}
            <Link to="/" className="text-accent hover:underline">
              {t('leaderboard.lockCta')}
            </Link>
          </p>
        )}
        {sorted.length > 0 && (
          <div className="space-y-2">
            {sorted.map((entry, i) => {
              const xLink = xLinks?.get(entry.owner);
              const rank = i + 1;
              const lockerEntry = lockerList.find((e) => e.wallet === entry.owner);
              const displayHandle = xLink?.xHandle ?? lockerEntry?.xHandle;
              const whoLabel = displayHandle
                ? `@${displayHandle}`
                : shortenAddress(entry.owner, 6);
              const timeRemaining =
                entry.unlockTs > nowSec
                  ? formatTimeRemaining(entry.unlockTs, nowSec)
                  : t('leaderboard.unlockAvailable');
              const isSelf = wallet === entry.owner;
              const flexVerified = verifiedWallets.has(entry.owner);

              return (
                <div
                  key={entry.vestingAccount}
                  className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-border/80 bg-surface-elevated px-4 py-3"
                >
                  {rank <= 3 ? (
                    <span
                      className={cn(
                        'absolute inset-y-0 left-0 w-1.5 rounded-l-xl',
                        RANK_STYLES[rank as 1 | 2 | 3].strip,
                      )}
                      aria-hidden
                    />
                  ) : null}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <RankBadge rank={rank} />
                    <div className="min-w-0">
                      {displayHandle ? (
                        <a
                          href={
                            lockerEntry?.flexTweetUrl ??
                            `https://x.com/${displayHandle}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-wrap items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent"
                        >
                          <img src="/x.png" alt="" className="h-3.5 w-3.5" aria-hidden />
                          @{displayHandle}
                          {flexVerified ? (
                            <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent">
                              {t('leaderboard.verifiedFlex')}
                            </span>
                          ) : null}
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
                        {displayHandle ? (
                          <span className="font-mono">{shortenAddress(entry.owner, 4)}</span>
                        ) : null}
                        {displayHandle ? ' · ' : ''}
                        {timeRemaining}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="font-mono font-semibold tabular-nums">
                        {formatAnsemAmount(entry.remainingInVault)}
                      </p>
                      <AnsemFiatValue
                        raw={entry.remainingInVault}
                        inline={false}
                        className="text-[10px]"
                      />
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t('common.ansem')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 p-0"
                      title={t('leaderboard.shareRank', { rank })}
                      aria-label={t('leaderboard.shareRank', { rank })}
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

      {wallet && !verifiedWallets.has(wallet) ? (
        <Card>
          <CardContent className="pt-6">
            <FlexVerifyForm wallet={wallet} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
