import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { AnsemAmountDisplay } from '@/components/AnsemFiatValue';
import { DiamondHoovesIcon } from '@/components/DiamondHoovesIcon';
import { SolscanLink } from '@/components/SolscanLink';
import { Button } from '@/components/ui/button';
import type { LockRecord } from '@/hooks/useLocks';
import { useShareLock } from '@/hooks/useShareLock';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { useI18n } from '@/lib/i18n/i18n-context';
import { resolveLockTxSig } from '@/lib/lock-tx-store';
import { solscanAccount, solscanTx } from '@/lib/solscan';
import { cn } from '@/lib/cn';

type ClaimLockCardProps = {
  lock: LockRecord;
  claiming: boolean;
  onClaim: () => void;
};

function useNowSec(tick: boolean) {
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!tick) return;
    const id = window.setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1_000);
    return () => window.clearInterval(id);
  }, [tick]);

  return nowSec;
}

export function ClaimLockCard({ lock, claiming, onClaim }: ClaimLockCardProps) {
  const { t } = useI18n();
  const { formatTimeRemaining, formatUnlockDate } = useLocalizedFormat();
  const { shareLock, sharingId } = useShareLock();
  const nowSec = useNowSec(lock.unlockTs > Math.floor(Date.now() / 1000));
  const ready = lock.unlockTs <= nowSec && lock.remainingInVault > 0n;
  const secondsLeft = Math.max(0, lock.unlockTs - nowSec);
  const lockTxSig = resolveLockTxSig(lock);
  const sharing = sharingId === lock.vestingAccount;

  return (
    <li
      className={cn(
        'relative overflow-clip rounded-2xl border bg-surface-elevated p-4 app-row-glass sm:p-5',
        ready
          ? 'claim-ready-glow border-accent/60 bg-gradient-to-br from-accent/12 via-surface-elevated to-surface-elevated'
          : 'border-border/80',
      )}
    >
      {ready ? (
        <span
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/20 blur-2xl"
          aria-hidden
        />
      ) : null}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <DiamondHoovesIcon size="sm" />
            <AnsemAmountDisplay raw={lock.remainingInVault} size="lg" align="left" />
          </div>

          {ready ? (
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-accent sm:text-base">
              <Sparkles className="mr-1.5 inline h-4 w-4" aria-hidden />
              {t('locks.readyToClaim')}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-semibold text-foreground sm:text-base">
                {formatTimeRemaining(lock.unlockTs, nowSec)}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {t('leaderboard.unlocksOn', { date: formatUnlockDate(lock.unlockTs) })}
              </p>
              {secondsLeft <= 600 ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
                    style={{
                      width: `${Math.min(100, Math.max(4, 100 - (secondsLeft / 600) * 100))}%`,
                    }}
                  />
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <SolscanLink
              href={solscanAccount(lock.vestingAccount)}
              className="text-[10px] text-muted-foreground sm:text-xs"
            >
              {t('locks.solscanAccount', {
                short: lock.vestingAccount.slice(0, 8),
              })}
            </SolscanLink>
            {lockTxSig ? (
              <SolscanLink
                href={solscanTx(lockTxSig)}
                className="text-[10px] text-muted-foreground sm:text-xs"
              >
                {t('info.viewLockTx')}
              </SolscanLink>
            ) : null}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
          <Button
            size="sm"
            variant="secondary"
            className="w-full gap-2 sm:w-auto"
            disabled={sharing}
            onClick={() => void shareLock(lock)}
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <img src="/x.png" alt="" className="h-3.5 w-3.5" aria-hidden />
            )}
            {t('locks.shareLock')}
          </Button>

        {ready ? (
          <Button
            size="lg"
            className="w-full gap-2 bg-accent font-bold shadow-lg shadow-accent/25 hover:bg-accent/90 sm:w-auto"
            disabled={claiming}
            onClick={onClaim}
          >
            {claiming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {t('locks.claimBack')}
          </Button>
        ) : (
          <div className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-center sm:min-w-[9rem]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('locks.claimOpens')}
            </p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-foreground">
              {formatTimeRemaining(lock.unlockTs, nowSec)}
            </p>
          </div>
        )}
        </div>
      </div>
    </li>
  );
}
