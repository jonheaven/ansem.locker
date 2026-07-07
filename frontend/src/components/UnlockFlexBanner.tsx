import { Share2 } from 'lucide-react';
import { SolscanLink } from '@/components/SolscanLink';
import { Button } from '@/components/ui/button';
import { clearJustUnlocked, type JustUnlockedPayload } from '@/lib/just-unlocked';
import { useI18n } from '@/lib/i18n/i18n-context';
import { openUnlockShare } from '@/lib/share-x';
import { solscanTx } from '@/lib/solscan';
import { cn } from '@/lib/cn';

type UnlockFlexBannerProps = {
  payload: JustUnlockedPayload;
  onDismiss: () => void;
  className?: string;
};

export function UnlockFlexBanner({ payload, onDismiss, className }: UnlockFlexBannerProps) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'app-glass relative overflow-clip rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-surface p-5 shadow-md',
        className,
      )}
    >
      <span
        className="pointer-events-none absolute -left-8 top-0 h-32 w-32 rounded-full bg-accent/25 blur-3xl"
        aria-hidden
      />
      <p className="relative text-sm font-bold uppercase tracking-[0.14em] text-accent">
        {t('locks.claimSuccessTitle')}
      </p>
      <p className="relative mt-2 text-xl font-bold text-foreground sm:text-2xl">
        {payload.amountDisplay} {t('common.ansem')}
      </p>
      <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">
        {t('locks.claimSuccessBody')}
      </p>
      {payload.txSig ? (
        <p className="relative mt-2">
          <SolscanLink href={solscanTx(payload.txSig)} className="text-xs font-medium">
            {t('locks.viewClaimTx')}
          </SolscanLink>
        </p>
      ) : null}
      <div className="relative mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="gap-2"
          onClick={() =>
            openUnlockShare(BigInt(payload.amountRaw), payload.txSig)
          }
        >
          <Share2 className="h-3.5 w-3.5" />
          <img src="/x.png" alt="" className="h-3.5 w-3.5 invert" aria-hidden />
          {t('locks.shareClaim')}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            clearJustUnlocked();
            onDismiss();
          }}
        >
          {t('common.dismiss')}
        </Button>
      </div>
    </div>
  );
}
