import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/i18n-context';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/cn';

type CopyWalletButtonProps = {
  address: string;
  className?: string;
  /** Icon-only ghost button (leaderboard rows). */
  variant?: 'icon' | 'inline';
  chars?: number;
};

export function CopyWalletButton({
  address,
  className,
  variant = 'icon',
  chars = 4,
}: CopyWalletButtonProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success(t('common.walletCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.walletCopyFailed'));
    }
  };

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={copy}
        title={address}
        className={cn(
          'inline-flex items-center gap-1 font-mono transition-colors hover:text-accent',
          className,
        )}
      >
        {shortenAddress(address, chars)}
        {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={cn('h-8 w-8 shrink-0 p-0', className)}
      title={t('leaderboard.copyWallet')}
      aria-label={t('leaderboard.copyWallet')}
      onClick={copy}
    >
      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}
