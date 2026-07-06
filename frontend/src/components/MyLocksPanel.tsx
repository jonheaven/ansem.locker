import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { Loader2, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyLocks } from '@/hooks/useLocks';
import { buildClaimAnsemInstructions } from '@/lib/bonfida';
import { formatAnsemAmount, formatTimeRemaining, formatUnlockDate } from '@/lib/format';

export function MyLocksPanel() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { locks, isLoading, refetch } = useMyLocks();
  const [unlocking, setUnlocking] = useState<string | null>(null);

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

      toast.success('Unlocked on-chain', {
        action: {
          label: 'Solscan',
          onClick: () =>
            window.open(`https://solscan.io/tx/${sig}`, '_blank', 'noopener,noreferrer'),
        },
      });
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unlock failed');
    } finally {
      setUnlocking(null);
    }
  };

  if (!publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your locks</CardTitle>
          <CardDescription>Connect a wallet to see and unlock your $ANSEM.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your locks</CardTitle>
        <CardDescription>Active locks for your wallet.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading from chain…</p>
        ) : locks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active $ANSEM locks for this wallet yet.
          </p>
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
                      <span className="text-accent">$ANSEM</span>
                    </p>
                    <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">
                      {unlocked
                        ? 'Cliff passed — ready to unlock'
                        : `${formatTimeRemaining(lock.unlockTs, nowSec)} · unlocks ${formatUnlockDate(lock.unlockTs)}`}
                    </p>
                    <a
                      href={`https://solscan.io/account/${lock.vestingAccount}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-muted-foreground transition-colors hover:text-accent"
                    >
                      {lock.vestingAccount.slice(0, 8)}… on Solscan
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
                      Unlock
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
