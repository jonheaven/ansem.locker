import { X_SYMBOL } from '@/config/constants';
import { clearJustLocked, type JustLockedPayload } from '@/lib/just-locked';
import { openLockShare } from '@/lib/share-x';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type LockFlexBannerProps = {
  payload: JustLockedPayload;
  onDismiss: () => void;
  className?: string;
};

export function LockFlexBanner({ payload, onDismiss, className }: LockFlexBannerProps) {
  const handleFlex = () => {
    openLockShare(
      BigInt(payload.amountRaw),
      payload.durationLabel,
      payload.txSig,
    );
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-accent/35 bg-accent/10 p-4 shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-accent">
        You are locked in
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">
        {payload.amountDisplay} $ANSEM · {payload.durationLabel}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Flex on {X_SYMBOL} now — show the trenches who&apos;s diamond hooving.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="gap-2" onClick={handleFlex}>
          <img src="/x.png" alt="" className="h-3.5 w-3.5 invert" aria-hidden />
          Flex on {X_SYMBOL}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            clearJustLocked();
            onDismiss();
          }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
