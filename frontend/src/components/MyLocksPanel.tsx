import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Sparkles } from 'lucide-react';
import { ClaimLockCard } from '@/components/ClaimLockCard';
import { LockFlexBanner } from '@/components/LockFlexBanner';
import { UnlockFlexBanner } from '@/components/UnlockFlexBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClaimLock } from '@/hooks/useClaimLock';
import { useMyLocks } from '@/hooks/useLocks';
import { useI18n } from '@/lib/i18n/i18n-context';
import { clearJustLocked, readJustLocked, type JustLockedPayload } from '@/lib/just-locked';
import {
  clearJustUnlocked,
  readJustUnlocked,
  type JustUnlockedPayload,
} from '@/lib/just-unlocked';

export function MyLocksPanel() {
  const { publicKey } = useWallet();
  const { locks, isLoading, refetch } = useMyLocks();
  const { claimLock, claimingId } = useClaimLock(() => {
    void refetch();
    setUnlockPrompt(readJustUnlocked());
  });
  const [flexPrompt, setFlexPrompt] = useState<JustLockedPayload | null>(() => readJustLocked());
  const [unlockPrompt, setUnlockPrompt] = useState<JustUnlockedPayload | null>(() =>
    readJustUnlocked(),
  );
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const { t } = useI18n();

  useEffect(() => {
    setFlexPrompt(readJustLocked());
    setUnlockPrompt(readJustUnlocked());
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1_000);
    return () => window.clearInterval(id);
  }, []);

  const claimable = locks.filter(
    (lock) => lock.unlockTs <= nowSec && lock.remainingInVault > 0n,
  );
  const pending = locks.filter(
    (lock) => lock.unlockTs > nowSec && lock.remainingInVault > 0n,
  );

  if (!publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('locks.title')}</CardTitle>
          <CardDescription>{t('locks.disconnected')}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {unlockPrompt ? (
        <UnlockFlexBanner
          payload={unlockPrompt}
          onDismiss={() => {
            clearJustUnlocked();
            setUnlockPrompt(null);
          }}
        />
      ) : null}

      {flexPrompt ? (
        <LockFlexBanner
          payload={flexPrompt}
          onDismiss={() => {
            clearJustLocked();
            setFlexPrompt(null);
          }}
        />
      ) : null}

      {claimable.length > 0 ? (
        <div className="app-glass rounded-2xl border border-accent/35 bg-accent/8 p-4">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-accent">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t('locks.claimableBanner', { count: claimable.length })}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t('locks.claimOnSite')}</p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('locks.title')}</CardTitle>
          <CardDescription>
            {claimable.length > 0 ? t('locks.descriptionClaim') : t('locks.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('locks.loading')}</p>
          ) : locks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('locks.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {[...claimable, ...pending].map((lock) => (
                <ClaimLockCard
                  key={lock.vestingAccount}
                  lock={lock}
                  claiming={claimingId === lock.vestingAccount}
                  onClaim={() => claimLock(lock.vestingAccount, lock.remainingInVault)}
                />
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
            {t('locks.jupiterFallback')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
