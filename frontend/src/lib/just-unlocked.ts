const STORAGE_KEY = 'ansem-locker-just-unlocked';

export type JustUnlockedPayload = {
  amountRaw: string;
  amountDisplay: string;
  txSig: string;
  timestamp: number;
};

export function saveJustUnlocked(payload: {
  amountRaw: bigint;
  amountDisplay: string;
  txSig: string;
}): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        amountRaw: payload.amountRaw.toString(),
        amountDisplay: payload.amountDisplay,
        txSig: payload.txSig,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // non-fatal
  }
}

export function readJustUnlocked(): JustUnlockedPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as JustUnlockedPayload;
    if (Date.now() - data.timestamp > 30 * 60_000) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function clearJustUnlocked(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
