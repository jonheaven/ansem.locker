import { readJustLocked } from '@/lib/just-locked';

const STORAGE_KEY = 'ansem-locker-vesting-tx';
const TS_STORAGE_KEY = 'ansem-locker-vesting-ts';

type VestingTxMap = Record<string, string>;
type VestingTsMap = Record<string, number>;

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

function readTsMap(): VestingTsMap {
  try {
    const raw = localStorage.getItem(TS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VestingTsMap;
  } catch {
    return {};
  }
}

function writeTsMap(map: VestingTsMap): void {
  try {
    localStorage.setItem(TS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // private mode / quota — non-fatal
  }
}

/** Remember which on-chain tx created a vesting escrow (survives refresh). */
export function rememberLockTx(
  vestingAccount: string,
  txSig: string,
  lockTs?: number,
): void {
  const map = readMap();
  map[vestingAccount] = txSig;
  writeMap(map);
  if (lockTs != null) {
    rememberLockTs(vestingAccount, lockTs);
  }
}

export function rememberLockTs(vestingAccount: string, lockTs: number): void {
  const map = readTsMap();
  map[vestingAccount] = lockTs;
  writeTsMap(map);
}

export function getRememberedLockTs(vestingAccount: string): number | undefined {
  return readTsMap()[vestingAccount];
}

/** Best-effort lock start time for progress UI. */
export function resolveLockStartTs(lock: {
  vestingAccount: string;
  lockTs?: number;
  unlockTs: number;
}): number | undefined {
  if (lock.lockTs != null) return lock.lockTs;

  const remembered = getRememberedLockTs(lock.vestingAccount);
  if (remembered != null) return remembered;

  const justLocked = readJustLocked();
  if (justLocked) {
    const match =
      !justLocked.vestingAccount || justLocked.vestingAccount === lock.vestingAccount;
    if (match) return Math.floor(justLocked.timestamp / 1000);
  }

  return undefined;
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
      locks?: { vestingAccount: string; lockTxSig?: string; lockTs?: number }[];
    };
    const match = data.locks?.find((l) => l.vestingAccount === vestingAccount);
    if (match?.lockTxSig) {
      rememberLockTx(vestingAccount, match.lockTxSig, match.lockTs);
      return match.lockTxSig;
    }
  } catch {
    // offline / API down — share still works without proof line
  }

  return undefined;
}
