import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import type { LockRecord } from '@/hooks/useLocks';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { useXLinkForWallet } from '@/hooks/useXLinks';
import { useI18n } from '@/lib/i18n/i18n-context';
import { ensureLockTxSig, resolveLockTxSig } from '@/lib/lock-tx-store';
import { openConvictionShareWithClipboard } from '@/lib/share-x';

export function useShareLock() {
  const { publicKey } = useWallet();
  const { t } = useI18n();
  const { formatTimeRemaining } = useLocalizedFormat();
  const linked = useXLinkForWallet(publicKey?.toBase58());
  const [sharingId, setSharingId] = useState<string | null>(null);

  const shareLock = useCallback(
    async (lock: LockRecord) => {
      const wallet = publicKey?.toBase58();
      if (!wallet) {
        toast.error(t('lock.connectFirst'));
        return;
      }

      setSharingId(lock.vestingAccount);
      try {
        let txSig = resolveLockTxSig(lock);
        if (!txSig) {
          txSig = await ensureLockTxSig(wallet, lock.vestingAccount);
        }

        const timeRemaining =
          lock.unlockTs > Math.floor(Date.now() / 1000)
            ? formatTimeRemaining(lock.unlockTs)
            : t('leaderboard.unlockAvailable');

        await openConvictionShareWithClipboard(
          lock.remainingInVault,
          timeRemaining,
          linked?.xHandle,
          txSig,
        );
        toast.success(t('locks.shareCopied'));
      } finally {
        setSharingId(null);
      }
    },
    [publicKey, linked?.xHandle, formatTimeRemaining, t],
  );

  return { shareLock, sharingId };
}
