import {
  formatSolLamports,
  lamportsShortfall,
  parseSolanaTxError,
  type ParsedTxError,
} from '@/lib/solana-tx-error';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

export function localizedTxError(t: Translate, parsed: ParsedTxError): string {
  if (parsed.kind === 'insufficient_sol') {
    return t('lock.insufficientSol', {
      have: formatSolLamports(parsed.haveLamports),
      need: formatSolLamports(parsed.needLamports),
      short: formatSolLamports(
        lamportsShortfall(parsed.haveLamports, parsed.needLamports),
      ),
    });
  }

  if (parsed.message === 'Transaction cancelled in wallet.') {
    return t('lock.txCancelled');
  }

  if (parsed.message === 'Network expired the transaction — try again.') {
    return t('lock.txExpired');
  }

  if (parsed.message === 'Transaction failed') {
    return t('lock.txFailed');
  }

  return parsed.message;
}

export function parseAndLocalizeTxError(
  t: Translate,
  err: unknown,
  logs?: string[] | null,
): string {
  return localizedTxError(t, parseSolanaTxError(err, logs));
}
