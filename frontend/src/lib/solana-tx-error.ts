import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export type ParsedTxError =
  | {
      kind: 'insufficient_sol';
      haveLamports: number;
      needLamports: number;
    }
  | { kind: 'generic'; message: string };

const INSUFFICIENT_LAMPORTS_RE = /insufficient lamports (\d+), need (\d+)/;

function parseInsufficientLamports(text: string): ParsedTxError | null {
  const match = text.match(INSUFFICIENT_LAMPORTS_RE);
  if (!match) return null;
  return {
    kind: 'insufficient_sol',
    haveLamports: Number(match[1]),
    needLamports: Number(match[2]),
  };
}

export function parseSolanaTxError(err: unknown, logs?: string[] | null): ParsedTxError {
  const logText = (logs ?? []).join('\n');
  const fromLogs = parseInsufficientLamports(logText);
  if (fromLogs) return fromLogs;

  const errMessage =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : JSON.stringify(err);

  const fromMessage = parseInsufficientLamports(errMessage);
  if (fromMessage) return fromMessage;

  if (errMessage.includes('blockhash not found')) {
    return { kind: 'generic', message: 'Network expired the transaction — try again.' };
  }

  if (errMessage.includes('User rejected')) {
    return { kind: 'generic', message: 'Transaction cancelled in wallet.' };
  }

  const trimmed = errMessage.trim();
  return {
    kind: 'generic',
    message: trimmed.length > 0 && trimmed.length < 280 ? trimmed : 'Transaction failed',
  };
}

export function formatSolLamports(lamports: number | bigint): string {
  const sol = Number(lamports) / LAMPORTS_PER_SOL;
  if (sol < 0.0001) return sol.toFixed(6);
  if (sol < 0.01) return sol.toFixed(4);
  return sol.toFixed(3);
}

export function lamportsShortfall(have: number, need: number): number {
  return Math.max(0, need - have);
}
