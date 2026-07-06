import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Loader2, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { AnsemFiatValue } from '@/components/AnsemFiatValue';
import { LockFlexBanner } from '@/components/LockFlexBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { useMyLocks } from '@/hooks/useLocks';
import { buildClaimAnsemInstructions } from '@/lib/bonfida';
import { formatAnsemAmount } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';
import { clearJustLocked, readJustLocked, type JustLockedPayload } from '@/lib/just-locked';

export function MyLocksPanel() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { locks, isLoading, refetch } = useMyLocks();
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [flexPrompt, setFlexPrompt] = useState<JustLockedPayload | null>(() => readJustLocked());
  const { t } = useI18n();
  const { formatTimeRemaining, formatUnlockDate } = useLocalizedFormat();

  useEffect(() => {
    setFlexPrompt(readJustLocked());
  }, []);

  const handleUnlock = async (vestingAccount: string, amount: bigint) => {
    if (!publicKey || !signTransaction) return;

    setUnlocking(vestingAccount);
    try {
      const instructions = buildClaimAnsemInstructions(
        new PublicKey(vestingAccount),
        publicKey,
        amount,
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');

      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...instructions);

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        'confirmed',
      );

      toast.success(t('locks.unlockedToast'), {
        action: {
          label: t('common.solscan'),
          onClick: () =>
            window.open(`https://solscan.io/tx/${sig}`, '_blank', 'noopener,noreferrer'),
        },
      });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('locks.unlockFailed'));
    } finally {
      setUnlocking(null);
    }
  };

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
      {flexPrompt ? (
        <LockFlexBanner
          payload={flexPrompt}
          onDismiss={() => {
            clearJustLocked();
            setFlexPrompt(null);
          }}
        />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('locks.title')}</CardTitle>
          <CardDescription>{t('locks.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('locks.loading')}</p>
          ) : locks.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('locks.empty')}</p>
          ) : (
            <ul className="space-y-3">
              {locks.map((lock) => {
                const nowSec = Math.floor(Date.now() / 1000);
                const unlocked = lock.unlockTs <= nowSec;
                return (
                  <li
                    key={lock.vestingAccount}
                    className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-mono text-xl font-bold sm:text-2xl">
                        {formatAnsemAmount(lock.remainingInVault)}{' '}
                        <span className="text-accent">{t('common.ansem')}</span>
                      </p>
                      <AnsemFiatValue
                        raw={lock.remainingInVault}
                        inline={false}
                        className="mt-0.5 text-sm"
                      />
                      <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
                        {unlocked
                          ? t('locks.cliffPassed')
                          : `${formatTimeRemaining(lock.unlockTs, nowSec)} · ${t('leaderboard.unlocksOn', { date: formatUnlockDate(lock.unlockTs) })}`}
                      </p>
                      <a
                        href={`https://solscan.io/account/${lock.vestingAccount}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-muted-foreground transition-colors hover:text-accent"
                      >
                        {t('locks.solscanAccount', {
                          short: lock.vestingAccount.slice(0, 8),
                        })}
                      </a>
                    </div>
                    {unlocked && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={unlocking === lock.vestingAccount}
                        onClick={() =>
                          handleUnlock(lock.vestingAccount, lock.remainingInVault)
                        }
                      >
                        {unlocking === lock.vestingAccount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                        {t('common.unlock')}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
