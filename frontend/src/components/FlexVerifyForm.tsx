import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useVerifyFlexPost } from '@/hooks/useLockerList';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

type FlexVerifyFormProps = {
  wallet?: string;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
};

export function FlexVerifyForm({ wallet, onSuccess, className, compact }: FlexVerifyFormProps) {
  const { t } = useI18n();
  const [flexTweetUrl, setFlexTweetUrl] = useState('');
  const verifyMutation = useVerifyFlexPost();

  const submit = async () => {
    if (!wallet) {
      toast.error(t('flex.verifyRequiresWallet'));
      return;
    }
    try {
      await verifyMutation.mutateAsync({ wallet, flexTweetUrl });
      toast.success(t('flex.verifySuccess'));
      setFlexTweetUrl('');
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {!compact ? (
        <>
          <p className="text-sm font-semibold text-foreground">{t('flex.verifyTitle')}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{t('flex.verifyHint')}</p>
          <p className="text-xs font-medium text-accent/90">{t('flex.verifySolscanNote')}</p>
        </>
      ) : (
        <p className="text-xs font-medium text-accent/90">{t('flex.verifySolscanNote')}</p>
      )}
      <div className="flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>{t('flex.step1')}</span>
        <span aria-hidden>→</span>
        <span>{t('flex.step2')}</span>
      </div>
      <input
        type="url"
        placeholder={t('flex.verifyPlaceholder')}
        value={flexTweetUrl}
        onChange={(e) => setFlexTweetUrl(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none ring-accent/40 focus:ring-2"
      />
      <button
        type="button"
        disabled={!flexTweetUrl || !wallet || verifyMutation.isPending}
        onClick={submit}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50"
      >
        {verifyMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : null}
        {t('flex.verifySubmit')}
      </button>
    </div>
  );
}
