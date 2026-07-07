import { readJustLocked } from '@/lib/just-locked';

const STORAGE_KEY = 'ansem-locker-vesting-tx';

type VestingTxMap = Record<string, string>;

function readMap(): VestingTxMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VestingTxMap;
  } catch {
    return {};
  }
}

function writeMap(map: VestingTxMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // private mode / quota — non-fatal
  }
}

/** Remember which on-chain tx created a vesting escrow (survives refresh). */
export function rememberLockTx(vestingAccount: string, txSig: string): void {
  const map = readMap();
  map[vestingAccount] = txSig;
  writeMap(map);
}

export function getRememberedLockTx(vestingAccount: string): string | undefined {
  return readMap()[vestingAccount];
}

/** Best-effort lock creation tx for shares + flex verify. */
export function resolveLockTxSig(lock: {
  vestingAccount: string;
  lockTxSig?: string;
}): string | undefined {
  if (lock.lockTxSig) return lock.lockTxSig;

  const remembered = getRememberedLockTx(lock.vestingAccount);
  if (remembered) return remembered;

  const justLocked = readJustLocked();
  if (justLocked?.txSig) {
    if (!justLocked.vestingAccount || justLocked.vestingAccount === lock.vestingAccount) {
      return justLocked.txSig;
    }
  }

  return undefined;
}

/** Fetch lockTxSig from API when not cached locally (e.g. new device). */
export async function ensureLockTxSig(
  wallet: string,
  vestingAccount: string,
): Promise<string | undefined> {
  const cached = resolveLockTxSig({ vestingAccount });
  if (cached) return cached;

  try {
    const res = await fetch(`/api/wallet-locks?wallet=${encodeURIComponent(wallet)}`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as {
      locks?: { vestingAccount: string; lockTxSig?: string }[];
    };
    const match = data.locks?.find((l) => l.vestingAccount === vestingAccount);
    if (match?.lockTxSig) {
      rememberLockTx(vestingAccount, match.lockTxSig);
      return match.lockTxSig;
    }
  } catch {
    // offline / API down — share still works without proof line
  }

  return undefined;
}
