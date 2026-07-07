import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useLayoutEffect, useMemo } from 'react';
import { useI18n } from '@/lib/i18n/i18n-context';

export function AppWalletButton() {
  const { t } = useI18n();

  const labels = useMemo(
    () => ({
      'change-wallet': t('wallet.changeWallet'),
      connecting: t('wallet.connecting'),
      'copy-address': t('wallet.copyAddress'),
      copied: t('wallet.copied'),
      disconnect: t('wallet.disconnect'),
      'has-wallet': t('wallet.connect'),
      'no-wallet': t('wallet.selectWallet'),
    }),
    [t],
  );

  useLayoutEffect(() => {
    document.querySelectorAll('.wallet-adapter-button[title]').forEach((el) => {
      el.removeAttribute('title');
    });
  });

  return (
    <div className="inline-flex">
      <BaseWalletMultiButton labels={labels} />
    </div>
  );
}
