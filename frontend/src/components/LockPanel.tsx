import { useCallback, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useQueryClient } from '@tanstack/react-query';
import { SendTransactionError, Transaction } from '@solana/web3.js';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { BullSlider } from '@/components/BullSlider';
import { HoverTooltip } from '@/components/HoverTooltip';
import { AnsemAmountDisplay } from '@/components/AnsemFiatValue';
import { PoweredByJupiter } from '@/components/PoweredByJupiter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnsemBalance } from '@/hooks/useAnsemBalance';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { buildLockAnsemInstructions } from '@/lib/bonfida';
import {
  MIN_SOL_LAMPORTS_FOR_LOCK,
  RECOMMENDED_SOL_LAMPORTS_FOR_LOCK,
} from '@/config/constants';
import { formatAnsemAmount, parseAnsemAmount } from '@/lib/format';
import { useI18n } from '@/lib/i18n/i18n-context';
import { localizedTxError, parseAndLocalizeTxError } from '@/lib/localized-tx-error';
import {
  defaultUnlockLocal,
  formatLockLength,
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
} from '@/lib/lock-duration';
import { rememberLockTx } from '@/lib/lock-tx-store';
import { saveJustLocked } from '@/lib/just-locked';
import { openLockShare } from '@/lib/share-x';
import { getSimulationError } from '@/lib/simulate-transaction';
import { formatSolLamports } from '@/lib/solana-tx-error';
import { solscanTx } from '@/lib/solscan';
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
  const solBalance = useSolBalance();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const {
    formatUnlockDate,
    formatDurationAhead,
    validateUnlockTs,
    getBullishFlexLabel,
  } = useLocalizedFormat();

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
  const validationError = useMemo(() => validateUnlockTs(unlockTs), [unlockTs, validateUnlockTs]);
  const durationLabel = useMemo(() => formatLockLength(unlockTs), [unlockTs]);
  const durationAhead = useMemo(
    () => formatDurationAhead(unlockTs),
    [unlockTs, formatDurationAhead],
  );
  const amountBullishness = sliderPositionToBullIntensity(
    amountSlider / AMOUNT_SLIDER_STEPS,
  );
  const bullishness = sliderValueToBullishness(durationSlider);
  const flexLabel = getBullishFlexLabel(durationSlider);

  const solLamports = solBalance.data?.lamports ?? 0;
  const lowSol = solLamports > 0 && solLamports < MIN_SOL_LAMPORTS_FOR_LOCK;
  const solWarning =
    solLamports > 0 && solLamports < RECOMMENDED_SOL_LAMPORTS_FOR_LOCK && !lowSol;

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
      toast.error(t('lock.connectFirst'));
      return;
    }

    const raw = amountRaw;
    if (raw <= 0n) {
      toast.error(t('lock.chooseAmount'));
      return;
    }

    if (balance.data && raw > balance.data.raw) {
      toast.error(t('lock.insufficientBalance'));
      return;
    }

    const unlockError = validateUnlockTs(unlockTs);
    if (unlockError) {
      toast.error(unlockError);
      return;
    }

    if (solLamports < MIN_SOL_LAMPORTS_FOR_LOCK) {
      toast.error(
        t('lock.insufficientSol', {
          have: formatSolLamports(solLamports),
          need: formatSolLamports(MIN_SOL_LAMPORTS_FOR_LOCK),
          short: formatSolLamports(
            Math.max(0, MIN_SOL_LAMPORTS_FOR_LOCK - solLamports),
          ),
        }),
      );
      return;
    }

    setPending(true);
    try {
      const { instructions, extraSigners, vestingAccount } = buildLockAnsemInstructions(
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

      const simulationError = await getSimulationError(connection, tx);
      if (simulationError) {
        toast.error(localizedTxError(t, simulationError));
        return;
      }

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        'confirmed',
      );

      toast.success(t('lock.lockedToast'), {
        description: `${formatAnsemAmount(raw)} ${t('common.ansem')} · ${formatUnlockDate(unlockTs)}`,
        duration: 12_000,
        action: {
          label: t('common.viewTxOnSolscan'),
          onClick: () => window.open(solscanTx(sig), '_blank', 'noopener,noreferrer'),
        },
      });

      openLockShare(raw, durationLabel, sig);
      const vestingKey = vestingAccount.toBase58();
      rememberLockTx(vestingKey, sig);
      saveJustLocked({
        amountRaw: raw,
        amountDisplay: formatAnsemAmount(raw),
        durationLabel,
        txSig: sig,
        vestingAccount: vestingKey,
      });
      setAmountSlider(0);
      setAmountRawExact(null);
      setAmountInput('');
      balance.refetch();
      solBalance.refetch();
      void queryClient.invalidateQueries({ queryKey: ['my-locks'] });
      void queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      window.location.hash = 'locks';
    } catch (err) {
      const message =
        err instanceof SendTransactionError
          ? parseAndLocalizeTxError(t, err, err.logs)
          : parseAndLocalizeTxError(t, err);
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  if (!publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('lock.title')}</CardTitle>
          <CardDescription>{t('lock.disconnected')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start pt-4">
          <PoweredByJupiter />
        </CardContent>
      </Card>
    );
  }

  const hasBalance = maxRaw > 0n;
  const hasEnoughSol =
    solBalance.isLoading || solBalance.isError || solLamports >= MIN_SOL_LAMPORTS_FOR_LOCK;

  return (
    <Card className="overflow-visible">
      <CardContent className="space-y-3 pt-3 sm:space-y-4 sm:pt-4">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-surface-elevated/90 px-3 py-2.5 app-glass-elevated sm:px-4 sm:py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('lock.yourBalance')}
            </p>
            {balance.isLoading ? (
              <p className="mt-0.5 font-mono text-lg font-bold text-muted-foreground sm:text-xl">…</p>
            ) : balance.isError ? (
              <>
                <p className="mt-0.5 font-mono text-lg font-bold text-muted-foreground sm:text-xl">—</p>
                <p className="mt-1 text-xs text-destructive">{t('lock.balanceError')}</p>
              </>
            ) : (
              <div className="mt-0.5">
                <AnsemAmountDisplay raw={maxRaw} size="md" align="left" />
              </div>
            )}
          </div>
          <p className="shrink-0 text-right text-[11px] leading-snug text-muted-foreground">
            {solBalance.isLoading
              ? t('lock.solBalanceLoading')
              : solBalance.isError
                ? t('lock.solBalanceError')
                : t('lock.solBalance', { amount: formatSolLamports(solLamports) })}
          </p>
        </div>
        {lowSol ? (
          <p className="text-xs font-medium text-destructive">{t('lock.lowSolBlocking')}</p>
        ) : solWarning ? (
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            {t('lock.lowSolWarning')}
          </p>
        ) : null}

        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{t('lock.lockAmount')}</span>
            <div className="flex items-baseline gap-1.5">
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
                className="w-24 rounded-lg border border-border bg-surface-elevated px-2.5 py-1 text-right font-mono text-base font-semibold tabular-nums text-muted-foreground outline-none transition-colors focus:border-accent focus:text-foreground sm:w-28"
                aria-label={t('lock.lockAmount')}
              />
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {t('common.ansem')}
              </span>
              {hasBalance ? (
                <HoverTooltip label={t('lock.maxHint')} align="end" side="top">
                  <button
                    type="button"
                    className="ml-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent transition-colors hover:bg-accent/25 sm:px-3 sm:py-1.5 sm:text-sm"
                    onClick={() => {
                      setAmountRawExact(maxRaw);
                      setAmountSlider(AMOUNT_SLIDER_STEPS);
                      setAmountInput(formatAnsemAmount(maxRaw));
                    }}
                  >
                    {t('common.max')}
                  </button>
                </HoverTooltip>
              ) : null}
            </div>
          </div>
          <BullSlider
            ariaLabel={t('lock.lockAmount')}
            min={0}
            max={AMOUNT_SLIDER_STEPS}
            step={1}
            value={amountSlider}
            onChange={handleAmountSlider}
            disabled={!hasBalance || balance.isLoading}
            bullishness={amountBullishness}
            compact
          />
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">{t('lock.lockUntil')}</span>
            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-medium text-foreground sm:text-sm">
                {formatUnlockDate(unlockTs)}
              </p>
              <p className="text-[11px] font-bold tracking-wide text-accent sm:text-xs">
                {durationAhead}
              </p>
            </div>
          </div>
          <BullSlider
            ariaLabel={t('lock.lockUntil')}
            min={0}
            max={1000}
            step={1}
            value={durationSlider}
            onChange={handleDurationSlider}
            bullishness={bullishness}
            compact
          />
          {flexLabel ? (
            <p
              className={cn(
                'mt-1 hidden text-xs font-bold text-accent sm:block',
                bullishness > 0.75 && 'animate-pulse',
              )}
            >
              {flexLabel}
            </p>
          ) : null}
          <div className="-mx-1 mt-1.5 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
            {LOCK_PRESETS.map(({ labelKey, minutes }) => (
              <button
                key={labelKey}
                type="button"
                onClick={() => applyPreset(minutes)}
                className="shrink-0 rounded-full border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-border-strong hover:bg-surface-elevated hover:text-foreground sm:min-h-11 sm:px-3 sm:py-2.5 sm:text-sm"
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
          <details className="mt-2 sm:hidden">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
              {t('lock.customUnlockTime')}
            </summary>
            <label className="mt-2 block">
              <span className="sr-only">Exact unlock date and time</span>
              <input
                type="datetime-local"
                value={unlockAt}
                min={minUnlockLocal()}
                max={maxUnlockLocal()}
                onChange={(e) => handleUnlockAtChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-base font-medium text-foreground outline-none transition-colors focus:border-accent"
              />
            </label>
          </details>
          <label className="mt-2 hidden sm:block">
            <span className="sr-only">Exact unlock date and time</span>
            <input
              type="datetime-local"
              value={unlockAt}
              min={minUnlockLocal()}
              max={maxUnlockLocal()}
              onChange={(e) => handleUnlockAtChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2 text-base font-medium text-foreground outline-none transition-colors focus:border-accent"
            />
          </label>
          {validationError ? (
            <p className="mt-1.5 text-xs font-medium text-destructive sm:text-sm">{validationError}</p>
          ) : null}
        </div>

        <Button
          size="default"
          className="h-12 w-full text-base font-semibold sm:h-14 sm:text-lg"
          disabled={
            pending || amountRaw <= 0n || Boolean(validationError) || !hasEnoughSol
          }
          onClick={handleLock}
        >
          {pending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t('common.confirmInWallet')}
            </>
          ) : (
            <>
              <Lock className="h-5 w-5" />
              {t('lock.lockButton')}
            </>
          )}
        </Button>

        <p className="text-center text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
          {t('lock.footer')}
        </p>
      </CardContent>
    </Card>
  );
}
