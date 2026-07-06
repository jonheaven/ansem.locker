import { useCallback, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@solana/web3.js';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { BullSlider } from '@/components/BullSlider';
import { PoweredByJupiter } from '@/components/PoweredByJupiter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnsemBalance } from '@/hooks/useAnsemBalance';
import { buildLockAnsemInstructions } from '@/lib/bonfida';
import { COPY } from '@/lib/copy';
import { formatAnsemAmount, formatUnlockDate, parseAnsemAmount } from '@/lib/format';
import {
  defaultUnlockLocal,
  formatDurationAhead,
  formatLockLength,
  getBullishFlexLabel,
  LOCK_PRESETS,
  maxUnlockLocal,
  minUnlockLocal,
  minutesToSliderValue,
  minutesToUnlockLocal,
  parseUnlockLocal,
  sliderPositionToBullIntensity,
  sliderValueToBullishness,
  sliderValueToMinutes,
  unlockLocalToMinutes,
  validateUnlockTs,
} from '@/lib/lock-duration';
import { openLockShare } from '@/lib/share-x';
import { cn } from '@/lib/cn';

const AMOUNT_SLIDER_STEPS = 1000;

function sliderToAmountRaw(slider: number, maxRaw: bigint): bigint {
  if (maxRaw <= 0n) return 0n;
  const clamped = Math.min(AMOUNT_SLIDER_STEPS, Math.max(0, slider));
  return (maxRaw * BigInt(clamped)) / BigInt(AMOUNT_SLIDER_STEPS);
}

function amountRawToSlider(raw: bigint, maxRaw: bigint): number {
  if (maxRaw <= 0n || raw <= 0n) return 0;
  const clamped = raw > maxRaw ? maxRaw : raw;
  return Math.round(
    Number((clamped * BigInt(AMOUNT_SLIDER_STEPS)) / maxRaw),
  );
}

export function LockPanel() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const balance = useAnsemBalance();
  const queryClient = useQueryClient();

  const maxRaw = balance.data?.raw ?? 0n;

  const [amountSlider, setAmountSlider] = useState(0);
  const [amountRawExact, setAmountRawExact] = useState<bigint | null>(null);
  const [durationSlider, setDurationSlider] = useState(() =>
    minutesToSliderValue(unlockLocalToMinutes(defaultUnlockLocal())),
  );
  const [unlockAt, setUnlockAt] = useState(() => defaultUnlockLocal());
  const [amountInput, setAmountInput] = useState('');
  const [amountInputFocused, setAmountInputFocused] = useState(false);
  const [pending, setPending] = useState(false);

  const amountRaw = useMemo(() => {
    if (amountRawExact !== null) return amountRawExact;
    return sliderToAmountRaw(amountSlider, maxRaw);
  }, [amountRawExact, amountSlider, maxRaw]);
  const amountDisplay = useMemo(
    () => (amountRaw > 0n ? formatAnsemAmount(amountRaw) : ''),
    [amountRaw],
  );

  const unlockTs = useMemo(() => parseUnlockLocal(unlockAt), [unlockAt]);
  const validationError = useMemo(() => validateUnlockTs(unlockTs), [unlockTs]);
  const durationLabel = useMemo(() => formatLockLength(unlockTs), [unlockTs]);
  const durationAhead = useMemo(() => formatDurationAhead(unlockTs), [unlockTs]);
  const amountBullishness = sliderPositionToBullIntensity(
    amountSlider / AMOUNT_SLIDER_STEPS,
  );
  const bullishness = sliderValueToBullishness(durationSlider);
  const flexLabel = getBullishFlexLabel(durationSlider);

  const setDurationFromMinutes = useCallback((minutes: number) => {
    setDurationSlider(minutesToSliderValue(minutes));
    setUnlockAt(minutesToUnlockLocal(minutes));
  }, []);

  const handleDurationSlider = (value: number) => {
    setDurationSlider(value);
    setUnlockAt(minutesToUnlockLocal(sliderValueToMinutes(value)));
  };

  const handleAmountSlider = (value: number) => {
    setAmountRawExact(null);
    setAmountSlider(value);
    if (!amountInputFocused) {
      const raw = sliderToAmountRaw(value, maxRaw);
      setAmountInput(raw > 0n ? formatAnsemAmount(raw) : '');
    }
  };

  const handleAmountInputChange = (value: string) => {
    setAmountInput(value);
    const trimmed = value.trim().replace(/,/g, '');
    if (!trimmed) {
      setAmountRawExact(null);
      setAmountSlider(0);
      return;
    }
    try {
      const raw = parseAnsemAmount(trimmed);
      if (raw > maxRaw) return;
      setAmountRawExact(raw);
      setAmountSlider(amountRawToSlider(raw, maxRaw));
    } catch {
      // allow partial input while typing
    }
  };

  const handleAmountInputBlur = () => {
    setAmountInputFocused(false);
    const trimmed = amountInput.trim().replace(/,/g, '');
    if (!trimmed) {
      setAmountInput('');
      setAmountRawExact(null);
      setAmountSlider(0);
      return;
    }
    try {
      let raw = parseAnsemAmount(trimmed);
      if (raw > maxRaw) raw = maxRaw;
      setAmountRawExact(raw);
      setAmountSlider(amountRawToSlider(raw, maxRaw));
      setAmountInput(raw > 0n ? formatAnsemAmount(raw) : '');
    } catch {
      setAmountInput(amountDisplay || '');
    }
  };

  const handleUnlockAtChange = (value: string) => {
    setUnlockAt(value);
    setDurationSlider(minutesToSliderValue(unlockLocalToMinutes(value)));
  };

  const applyPreset = (minutes: number) => {
    setDurationFromMinutes(minutes);
  };

  const handleLock = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Connect your wallet first');
      return;
    }

    const raw = amountRaw;
    if (raw <= 0n) {
      toast.error('Choose an amount to lock');
      return;
    }

    if (balance.data && raw > balance.data.raw) {
      toast.error('Insufficient balance');
      return;
    }

    const unlockError = validateUnlockTs(unlockTs);
    if (unlockError) {
      toast.error(unlockError);
      return;
    }

    setPending(true);
    try {
      const { instructions, extraSigners } = buildLockAnsemInstructions(
        publicKey,
        raw,
        unlockTs,
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');

      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(...instructions);

      tx.partialSign(...extraSigners);

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        'confirmed',
      );

      toast.success('Locked', {
        description: `${formatAnsemAmount(raw)} $ANSEM · unlocks ${formatUnlockDate(unlockTs)}`,
        action: {
          label: 'Solscan',
          onClick: () =>
            window.open(`https://solscan.io/tx/${sig}`, '_blank', 'noopener,noreferrer'),
        },
      });

      openLockShare(raw, durationLabel, sig);
      setAmountSlider(0);
      setAmountRawExact(null);
      setAmountInput('');
      balance.refetch();
      void queryClient.invalidateQueries({ queryKey: ['my-locks'] });
      void queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      window.location.hash = 'locks';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  if (!publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lock $ANSEM</CardTitle>
          <CardDescription>{COPY.lockPanelDisconnected}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 pt-0">
          <PoweredByJupiter />
        </CardContent>
      </Card>
    );
  }

  const hasBalance = maxRaw > 0n;

  return (
    <Card>
      <CardContent className="space-y-7 pt-6">
        <div className="rounded-2xl border border-border/70 bg-surface-elevated/90 px-5 py-5 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Your balance
          </p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-tight tabular-nums text-foreground sm:text-5xl">
            {balance.isLoading
              ? '…'
              : balance.isError
                ? '—'
                : formatAnsemAmount(maxRaw)}
          </p>
          {balance.isError ? (
            <p className="mt-2 text-sm text-destructive">Could not load balance. Try again shortly.</p>
          ) : null}
          <p className="mt-1 text-xl font-semibold text-accent">$ANSEM</p>
        </div>

        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <span className="text-base font-semibold text-foreground">Lock amount</span>
            <div className="flex items-baseline justify-end gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amountInputFocused ? amountInput : amountDisplay || '0'}
                disabled={!hasBalance || balance.isLoading}
                onFocus={() => {
                  setAmountInputFocused(true);
                  setAmountInput(amountDisplay || '');
                }}
                onChange={(e) => handleAmountInputChange(e.target.value)}
                onBlur={handleAmountInputBlur}
                className="w-36 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-right font-mono text-2xl font-bold tabular-nums text-foreground outline-none transition-colors focus:border-accent sm:w-44 sm:text-3xl"
                aria-label="Amount to lock"
              />
              <span className="text-base font-semibold text-muted-foreground sm:text-lg">$ANSEM</span>
            </div>
          </div>
          <BullSlider
            ariaLabel="Amount to lock"
            min={0}
            max={AMOUNT_SLIDER_STEPS}
            step={1}
            value={amountSlider}
            onChange={handleAmountSlider}
            disabled={!hasBalance || balance.isLoading}
            bullishness={amountBullishness}
          />
          <div className="mt-2 flex items-center justify-between text-sm font-semibold text-muted-foreground">
            <span className="font-mono text-base">0</span>
            {hasBalance ? (
              <button
                type="button"
                className="rounded-full bg-accent/15 px-4 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-accent/25"
                onClick={() => {
                  setAmountRawExact(maxRaw);
                  setAmountSlider(AMOUNT_SLIDER_STEPS);
                  setAmountInput(formatAnsemAmount(maxRaw));
                }}
              >
                Max
              </button>
            ) : (
              <span>Max</span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <span className="text-base font-semibold text-foreground">Lock until</span>
            <div className="sm:text-right">
              <p className="text-base font-medium text-foreground sm:text-lg">
                {formatUnlockDate(unlockTs)}
              </p>
              <p className="mt-0.5 text-sm font-bold tracking-wide text-accent sm:text-base">
                {durationAhead}
              </p>
            </div>
          </div>
          <BullSlider
            ariaLabel="Lock duration"
            min={0}
            max={1000}
            step={1}
            value={durationSlider}
            onChange={handleDurationSlider}
            bullishness={bullishness}
          />
          {flexLabel ? (
            <p
              className={cn(
                'mt-3 text-base font-bold text-accent',
                bullishness > 0.75 && 'animate-pulse',
              )}
            >
              {flexLabel}
            </p>
          ) : null}
          <div className="mt-2 flex justify-between text-sm font-semibold text-muted-foreground">
            <span>5m</span>
            <span>1y</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LOCK_PRESETS.map(({ label, minutes }) => (
              <button
                key={label}
                type="button"
                onClick={() => applyPreset(minutes)}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface-elevated hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Exact unlock date and time</span>
            <input
              type="datetime-local"
              value={unlockAt}
              min={minUnlockLocal()}
              max={maxUnlockLocal()}
              onChange={(e) => handleUnlockAtChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-colors focus:border-accent sm:text-base"
            />
          </label>
          {validationError ? (
            <p className="mt-3 text-sm font-medium text-destructive sm:text-base">{validationError}</p>
          ) : null}
        </div>

        <Button
          size="lg"
          className="w-full"
          disabled={pending || amountRaw <= 0n || Boolean(validationError)}
          onClick={handleLock}
        >
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirm in wallet…
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              Lock $ANSEM
            </>
          )}
        </Button>

        <div className="flex flex-col items-center gap-2 pt-1">
          <PoweredByJupiter />
          <p className="text-center text-[11px] text-muted-foreground">{COPY.lockFooter}</p>
        </div>
      </CardContent>
    </Card>
  );
}
