import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { FlexVerifyForm } from '@/components/FlexVerifyForm';
import { clearJustLocked, type JustLockedPayload } from '@/lib/just-locked';
import { useFlexVerifiedForWallet } from '@/hooks/useLockerList';
import { SolscanLink } from '@/components/SolscanLink';
import { useI18n } from '@/lib/i18n/i18n-context';
import { solscanTx } from '@/lib/solscan';
import { openLockShare } from '@/lib/share-x';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type LockFlexBannerProps = {
  payload: JustLockedPayload;
  onDismiss: () => void;
  className?: string;
};

export function LockFlexBanner({ payload, onDismiss, className }: LockFlexBannerProps) {
  const { t } = useI18n();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const verified = useFlexVerifiedForWallet(wallet);
  const [showVerify, setShowVerify] = useState(false);

  const handleFlex = () => {
    openLockShare(
      BigInt(payload.amountRaw),
      payload.durationLabel,
      payload.txSig,
    );
    setShowVerify(true);
  };

  return (
    <div
      className={cn(
        'app-glass rounded-2xl border border-accent/35 bg-accent/10 p-4 shadow-sm',
        className,
      )}
    >
      <p className="locked-in-glow text-sm font-bold uppercase tracking-[0.14em]">
        {t('bull.youAreLockedIn')}
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">
        {payload.amountDisplay} {t('common.ansem')} · {payload.durationLabel}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t('bull.flexNow')}</p>
      {payload.txSig ? (
        <p className="mt-2">
          <SolscanLink href={solscanTx(payload.txSig)} className="text-xs font-medium">
            {t('info.viewLockTx')}
          </SolscanLink>
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="gap-2" onClick={handleFlex}>
          <img src="/x.png" alt="" className="h-3.5 w-3.5 invert" aria-hidden />
          {t('flex.flexOnX')}
        </Button>
        {!verified ? (
          <Button size="sm" variant="secondary" onClick={() => setShowVerify((v) => !v)}>
            {t('leaderboard.lockerListJoin')}
          </Button>
        ) : (
          <span className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent">
            {t('leaderboard.verifiedFlex')}
          </span>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            clearJustLocked();
            onDismiss();
          }}
        >
          {t('common.dismiss')}
        </Button>
      </div>
      {showVerify && !verified ? (
        <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-3">
          <FlexVerifyForm wallet={wallet} compact onSuccess={() => setShowVerify(false)} />
        </div>
      ) : null}
    </div>
  );
}
