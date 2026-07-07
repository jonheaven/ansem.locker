/** Elapsed share of lock period (0–100), or null when start time is unknown. */
export function lockProgressPercent(
  lockTs: number | undefined,
  unlockTs: number,
  nowSec: number,
): number | null {
  if (lockTs == null || unlockTs <= lockTs) return null;
  if (nowSec >= unlockTs) return 100;
  const total = unlockTs - lockTs;
  const elapsed = nowSec - lockTs;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
