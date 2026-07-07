import { useLayoutEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useI18n } from '@/lib/i18n/i18n-context';

/** Patches hardcoded English strings in the wallet-adapter modal when locale changes. */
export function WalletModalI18nSync() {
  const { visible } = useWalletModal();
  const { t } = useI18n();

  useLayoutEffect(() => {
    if (!visible) return;

    const sync = () => {
      const title = document.querySelector('.wallet-adapter-modal-title');
      if (title) {
        const raw = title.textContent ?? '';
        if (raw.includes('need a wallet') || raw.includes('ウォレットが必要')) {
          title.textContent = t('wallet.modalTitleNoWallet');
        } else {
          title.textContent = t('wallet.modalTitle');
        }
      }

      document.querySelectorAll('.wallet-adapter-modal-list-more span').forEach((span) => {
        const raw = span.textContent ?? '';
        const expanded = Boolean(
          span.parentElement?.querySelector('.wallet-adapter-modal-list-more-icon-rotate'),
        );

        if (raw.includes('Already') || raw.includes('すでに')) {
          span.textContent = expanded ? t('wallet.hideOptions') : t('wallet.alreadyHaveWallet');
        } else if (raw.includes('More') || raw.includes('Less') || raw.includes('オプション')) {
          span.textContent = expanded ? t('wallet.lessOptions') : t('wallet.moreOptions');
        }
      });
    };

    sync();
    const id = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(id);
  }, [visible, t]);

  return null;
}
