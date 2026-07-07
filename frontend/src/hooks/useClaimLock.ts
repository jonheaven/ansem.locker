import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SendTransactionError, Transaction } from '@solana/web3.js';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n/i18n-context';
import { buildClaimAnsemInstructions } from '@/lib/bonfida';
import { formatAnsemAmount } from '@/lib/format';
import { saveJustUnlocked } from '@/lib/just-unlocked';
import { localizedTxError, parseAndLocalizeTxError } from '@/lib/localized-tx-error';
import { openUnlockShare } from '@/lib/share-x';
import { getSimulationError } from '@/lib/simulate-transaction';

export function useClaimLock(onSuccess?: () => void) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const claimLock = useCallback(
    async (vestingAccount: string, amount: bigint) => {
      if (!publicKey || !signTransaction) {
        toast.error(t('lock.connectFirst'));
        return;
      }

      setClaimingId(vestingAccount);
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

        const simulationError = await getSimulationError(connection, tx);
        if (simulationError) {
          toast.error(localizedTxError(t, simulationError));
          return;
        }

        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });

        await connection.confirmTransaction(
          { signature: sig, blockhash, lastValidBlockHeight },
          'confirmed',
        );

        saveJustUnlocked({
          amountRaw: amount,
          amountDisplay: formatAnsemAmount(amount),
          txSig: sig,
        });

        toast.success(t('locks.claimedToast'), {
          description: t('locks.claimedDescription', {
            amount: formatAnsemAmount(amount),
          }),
          duration: 14_000,
          action: {
            label: t('locks.shareClaim'),
            onClick: () => openUnlockShare(amount, sig),
          },
        });

        void queryClient.invalidateQueries({ queryKey: ['my-locks'] });
        void queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        void queryClient.invalidateQueries({ queryKey: ['ansem-balance'] });

        onSuccess?.();
      } catch (err) {
        const message =
          err instanceof SendTransactionError
            ? parseAndLocalizeTxError(t, err, err.logs)
            : parseAndLocalizeTxError(t, err);
        toast.error(message);
      } finally {
        setClaimingId(null);
      }
    },
    [connection, onSuccess, publicKey, queryClient, signTransaction, t],
  );

  return { claimLock, claimingId, isClaiming: claimingId != null };
}
