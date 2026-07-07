import { MAX_LOCK_DAYS, MIN_LOCK_MINUTES, X_SYMBOL } from '@/config/constants';

export { MIN_LOCK_MINUTES };

const DAYS_PER_MONTH = 30;
const MINUTES_PER_DAY = 24 * 60;

export const LOCK_PRESETS = [
  { labelKey: 'lock.preset10m', minutes: 10 },
  { labelKey: 'lock.preset1h', minutes: 60 },
  { labelKey: 'lock.preset6h', minutes: 6 * 60 },
  { labelKey: 'lock.preset1d', minutes: MINUTES_PER_DAY },
  { labelKey: 'lock.preset3d', minutes: 3 * MINUTES_PER_DAY },
  { labelKey: 'lock.preset1w', minutes: 7 * MINUTES_PER_DAY },
  { labelKey: 'lock.preset1mo', minutes: 1 * DAYS_PER_MONTH * MINUTES_PER_DAY },
  { labelKey: 'lock.preset3mo', minutes: 3 * DAYS_PER_MONTH * MINUTES_PER_DAY },
  { labelKey: 'lock.preset6mo', minutes: 6 * DAYS_PER_MONTH * MINUTES_PER_DAY },
  { labelKey: 'lock.preset1y', minutes: MAX_LOCK_DAYS * MINUTES_PER_DAY },
] as const;

export function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultUnlockLocal(minutesFromNow = 60 * 24 * 30): string {
  return toDatetimeLocalValue(new Date(Date.now() + minutesFromNow * 60_000));
}

export function parseUnlockLocal(value: string): number {
  return Math.floor(new Date(value).getTime() / 1000);
}

export function minUnlockLocal(now = Date.now()): string {
  return toDatetimeLocalValue(new Date(now + MIN_LOCK_MINUTES * 60_000));
}

export function maxUnlockLocal(now = Date.now()): string {
  return toDatetimeLocalValue(new Date(now + MAX_LOCK_DAYS * 86_400_000));
}

export function validateUnlockTs(
  unlockTs: number,
  nowSec = Math.floor(Date.now() / 1000),
): string | null {
  const minTs = nowSec + MIN_LOCK_MINUTES * 60;
  const maxTs = nowSec + MAX_LOCK_DAYS * 86_400;
  if (unlockTs < minTs) {
    return `Unlock must be at least ${MIN_LOCK_MINUTES} minutes from now`;
  }
  if (unlockTs > maxTs) {
    return `Maximum lock is 1 year`;
  }
  return null;
}

export function formatLockLength(unlockTs: number, nowSec = Math.floor(Date.now() / 1000)): string {
  const sec = Math.max(0, unlockTs - nowSec);
  if (sec < 3600) return `${Math.max(1, Math.round(sec / 60))} minutes`;
  if (sec < 86_400) return `${Math.max(1, Math.round(sec / 3600))} hours`;
  if (sec < 86_400 * 30) return `${Math.max(1, Math.round(sec / 86_400))} days`;
  return `${Math.max(1, Math.round(sec / (86_400 * 30)))} months`;
}

/** Human-readable “in X” distance from now — shown beside the unlock datetime. */
export function formatDurationAhead(
  unlockTs: number,
  nowSec = Math.floor(Date.now() / 1000),
): string {
  const sec = Math.max(0, unlockTs - nowSec);
  if (sec < 60) return 'in under a minute';

  const minutes = Math.floor(sec / 60);
  const hours = Math.floor(sec / 3600);
  const days = Math.floor(sec / 86_400);

  if (sec < 3600) {
    return `in ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  if (sec < 86_400) {
    const m = Math.floor((sec % 3600) / 60);
    if (m === 0) return `in ${hours} hour${hours === 1 ? '' : 's'}`;
    return `in ${hours}h ${m}m`;
  }

  if (days < 30) {
    const h = Math.floor((sec % 86_400) / 3600);
    if (h === 0 || days >= 7) return `in ${days} day${days === 1 ? '' : 's'}`;
    return `in ${days}d ${h}h`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    if (remDays === 0 || months >= 6) {
      return `in ${months} month${months === 1 ? '' : 's'}`;
    }
    return `in ${months}mo ${remDays}d`;
  }

  const years = Math.floor(days / 365);
  const remMonths = Math.floor((days % 365) / 30);
  if (remMonths === 0) return `in ${years} year${years === 1 ? '' : 's'}`;
  return `in ${years}y ${remMonths}mo`;
}

const MAX_LOCK_MINUTES = MAX_LOCK_DAYS * 24 * 60;

/** Log-scale slider (0–1000) ↔ lock length in minutes. */
export function minutesToSliderValue(minutes: number): number {
  const clamped = Math.min(MAX_LOCK_MINUTES, Math.max(MIN_LOCK_MINUTES, minutes));
  const logMin = Math.log(MIN_LOCK_MINUTES);
  const logMax = Math.log(MAX_LOCK_MINUTES);
  return Math.round(((Math.log(clamped) - logMin) / (logMax - logMin)) * 1000);
}

export function sliderValueToMinutes(slider: number): number {
  const t = Math.min(1000, Math.max(0, slider)) / 1000;
  const logMin = Math.log(MIN_LOCK_MINUTES);
  const logMax = Math.log(MAX_LOCK_MINUTES);
  return Math.round(Math.exp(logMin + t * (logMax - logMin)));
}

/** Maps 0–1 slider position → bull animation intensity (calm low, unhinged at max). */
export function sliderPositionToBullIntensity(linear: number): number {
  const t = Math.min(1, Math.max(0, linear));
  if (t <= 0) return 0;
  return Math.pow(t, 1.28);
}

/** 0 = short test lock, 1 = max duration — drives bull shake / flex copy. */
export function sliderValueToBullishness(slider: number): number {
  return sliderPositionToBullIntensity(slider / 1000);
}

export function getBullishFlexLabel(slider: number): string | null {
  const t = Math.min(1, Math.max(0, slider / 1000));
  if (t < 0.12) return null;
  if (t < 0.28) return 'Warming up…';
  if (t < 0.45) return 'Getting bullish';
  if (t < 0.62) return 'Bull mode';
  if (t < 0.78) return 'Diamond hooves';
  if (t < 0.92) return 'Serious conviction';
  return `Fle${X_SYMBOL} your commitment`;
}

export function unlockLocalToMinutes(unlockAt: string, nowMs = Date.now()): number {
  const unlockMs = parseUnlockLocal(unlockAt) * 1000;
  return Math.max(MIN_LOCK_MINUTES, Math.round((unlockMs - nowMs) / 60_000));
}

export function minutesToUnlockLocal(minutes: number): string {
  return toDatetimeLocalValue(new Date(Date.now() + minutes * 60_000));
}
