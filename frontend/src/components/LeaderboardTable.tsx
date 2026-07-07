import { useState, type ReactNode } from 'react';
import { ChevronDown, Medal, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnsemAmountDisplay } from '@/components/AnsemFiatValue';
import { CopyWalletButton } from '@/components/CopyWalletButton';
import { DiamondHoovesIcon } from '@/components/DiamondHoovesIcon';
import { FlexVerifyForm } from '@/components/FlexVerifyForm';
import { LockerListPanel } from '@/components/LockerListPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaderboard, sortLocks, type LeaderboardSort } from '@/hooks/useLocks';
import { useLockerList } from '@/hooks/useLockerList';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { useXLinks } from '@/hooks/useXLinks';
import { shortenAddress } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';
import { openLeaderboardEntryShare, openLeaderboardHypeShare } from '@/lib/share-x';
import { SolscanLink } from '@/components/SolscanLink';
import { solscanAccount } from '@/lib/solscan';
import { cn } from '@/lib/cn';

type LeaderboardPreviewProps = {
  sort?: LeaderboardSort;
  limit?: number;
  showSortTabs?: boolean;
  hideIntro?: boolean;
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

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  className,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-surface/50',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-11 items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated/50"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open ? <div className="border-t border-border/60 px-4 pb-4 pt-3">{children}</div> : null}
    </div>
  );
}

export function LeaderboardTable({
  sort: initialSort = 'score',
  limit = 10,
  showSortTabs = false,
  hideIntro = false,
}: LeaderboardPreviewProps) {
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const { data, isLoading, isError, error } = useLeaderboard();
  const { data: xLinks } = useXLinks();
  const [sort, setSort] = useState<LeaderboardSort>(initialSort);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const { t } = useI18n();
  const { formatTimeRemaining } = useLocalizedFormat();
  const { data: lockerList = [] } = useLockerList();
  const verifiedWallets = new Set(lockerList.map((e) => e.wallet));

  const allSorted = sortLocks(data ?? [], sort);
  const filtered = verifiedOnly
    ? allSorted.filter((entry) => verifiedWallets.has(entry.owner))
    : allSorted;
  const sorted = filtered.slice(0, limit);
  const nowSec = Math.floor(Date.now() / 1000);

  return (
    <div className="space-y-3">
      <Card className="border-accent/20 shadow-md">
        <CardHeader className={cn('space-y-3', hideIntro ? 'pb-2' : 'pb-3')}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            {!hideIntro ? (
              <div>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <DiamondHoovesIcon />
                  {t('leaderboard.title')}
                </CardTitle>
                <CardDescription className="mt-1 max-w-xl text-sm">
                  {t('leaderboard.description')}
                </CardDescription>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DiamondHoovesIcon />
                <span className="sr-only">{t('leaderboard.title')}</span>
              </div>
            )}
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
            <div className="flex flex-wrap items-center gap-2">
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
                    'min-h-11 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors sm:py-1.5',
                    sort === key
                      ? 'bg-accent/15 text-accent'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t(labelKey)}
                </button>
              ))}
              <span className="mx-1 hidden h-4 w-px bg-border sm:inline" aria-hidden />
              <button
                type="button"
                onClick={() => setVerifiedOnly((v) => !v)}
                className={cn(
                  'min-h-11 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors sm:py-1.5',
                  verifiedOnly
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t('leaderboard.verifiedOnly')}
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('leaderboard.loading')}
            </p>
          )}
          {isError && (
            <div className="mx-auto max-w-md py-6 text-center text-sm">
              <p className="text-destructive">
                {error instanceof Error ? error.message : t('leaderboard.loadError')}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {t('leaderboard.rpcHint')}
              </p>
            </div>
          )}
          {!isLoading && !isError && sorted.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {verifiedOnly ? t('leaderboard.verifiedOnlyEmpty') : t('leaderboard.empty')}{' '}
              {!verifiedOnly ? (
                <Link to="/" className="text-accent hover:underline">
                  {t('leaderboard.lockCta')}
                </Link>
              ) : null}
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
                    className={cn(
                      'relative flex flex-col gap-2 overflow-clip rounded-xl border border-border/80 bg-surface-elevated px-4 py-3 app-row-glass sm:flex-row sm:items-center sm:justify-between sm:gap-3',
                      isSelf && 'border-accent/50 bg-accent/5 ring-2 ring-accent/20',
                    )}
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
                    <div className="flex min-w-0 flex-1 items-center gap-3 pl-1 sm:pl-0">
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
                          <SolscanLink
                            href={solscanAccount(entry.owner)}
                            className="font-mono text-sm"
                          >
                            {shortenAddress(entry.owner, 6)}
                          </SolscanLink>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {displayHandle ? (
                            <SolscanLink href={solscanAccount(entry.owner)} className="font-mono">
                              {shortenAddress(entry.owner, 4)}
                            </SolscanLink>
                          ) : null}
                          {displayHandle ? ' · ' : ''}
                          <SolscanLink href={solscanAccount(entry.vestingAccount)} className="font-mono">
                            {entry.vestingAccount.slice(0, 6)}…
                          </SolscanLink>
                          {' · '}
                          {timeRemaining}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-2 pl-11 sm:justify-end sm:pl-0">
                      <AnsemAmountDisplay
                        raw={entry.remainingInVault}
                        size="sm"
                        align="right"
                      />
                      <div className="flex items-center gap-1">
                      <CopyWalletButton address={entry.owner} className="h-11 w-11" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-11 w-11 shrink-0 p-0"
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
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {t('leaderboard.tipHint')}
          </p>
        </CardContent>
      </Card>

      <CollapsibleSection title={t('leaderboard.lockerListTitle')}>
        <LockerListPanel className="border-0 bg-transparent p-0 shadow-none" embedded />
      </CollapsibleSection>

      {wallet && !verifiedWallets.has(wallet) ? (
        <CollapsibleSection title={t('leaderboard.lockerListJoin')}>
          <FlexVerifyForm wallet={wallet} />
        </CollapsibleSection>
      ) : null}
    </div>
  );
}
