const STORAGE_KEY = 'ansem-locker-just-locked';

export type JustLockedPayload = {
  amountRaw: string;
  amountDisplay: string;
  durationLabel: string;
  txSig: string;
  vestingAccount?: string;
  timestamp: number;
};

export function saveJustLocked(payload: {
  amountRaw: bigint;
  amountDisplay: string;
  durationLabel: string;
  txSig: string;
  vestingAccount?: string;
}): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        amountRaw: payload.amountRaw.toString(),
        amountDisplay: payload.amountDisplay,
        durationLabel: payload.durationLabel,
        txSig: payload.txSig,
        vestingAccount: payload.vestingAccount,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // private mode / quota — non-fatal
  }
}

export function readJustLocked(): JustLockedPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as JustLockedPayload;
    if (Date.now() - data.timestamp > 30 * 60_000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearJustLocked(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
