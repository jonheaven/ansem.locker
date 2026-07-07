import { BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useLayoutEffect, useMemo } from 'react';
import { HoverTooltip } from '@/components/HoverTooltip';
import { useI18n } from '@/lib/i18n/i18n-context';

export function AppWalletButton() {
  const { t } = useI18n();
  const { publicKey } = useWallet();
  const { visible } = useWalletModal();

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

  const tooltip = publicKey ? t('wallet.changeWallet') : t('wallet.selectWallet');

  useLayoutEffect(() => {
    document.querySelectorAll('.wallet-adapter-button[title]').forEach((el) => {
      el.removeAttribute('title');
    });
  });

  return (
    <HoverTooltip label={tooltip} hidden={visible}>
      <div className="inline-flex">
        <BaseWalletMultiButton labels={labels} />
      </div>
    </HoverTooltip>
  );
}
