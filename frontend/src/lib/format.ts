import { ANSEM_DECIMALS } from '@/config/constants';

export function formatAnsemAmount(raw: bigint | number): string {
  const value = typeof raw === 'bigint' ? raw : BigInt(raw);
  const whole = value / BigInt(10 ** ANSEM_DECIMALS);
  const frac = value % BigInt(10 ** ANSEM_DECIMALS);
  const fracStr = frac.toString().padStart(ANSEM_DECIMALS, '0').replace(/0+$/, '');
  return fracStr ? `${whole.toLocaleString()}.${fracStr}` : whole.toLocaleString();
}

export function parseAnsemAmount(input: string): bigint {
  const trimmed = input.trim().replace(/,/g, '');
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error('Invalid amount');
  }
  const [whole, frac = ''] = trimmed.split('.');
  const fracPadded = frac.padEnd(ANSEM_DECIMALS, '0').slice(0, ANSEM_DECIMALS);
  return BigInt(whole) * BigInt(10 ** ANSEM_DECIMALS) + BigInt(fracPadded || '0');
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatUnlockDate(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeRemaining(unixTs: number, nowSec = Math.floor(Date.now() / 1000)): string {
  const sec = Math.max(0, unixTs - nowSec);
  if (sec < 60) return 'under 1m left';
  if (sec < 3600) return `${Math.ceil(sec / 60)}m left`;
  if (sec < 86_400) {
    const h = Math.floor(sec / 3600);
    const m = Math.ceil((sec % 3600) / 60);
    return m > 0 && h < 24 ? `${h}h ${m}m left` : `${Math.ceil(sec / 3600)}h left`;
  }
  return `${Math.ceil(sec / 86_400)}d left`;
}

export function daysUntil(unixTs: number, nowSec = Math.floor(Date.now() / 1000)): number {
  return Math.max(0, Math.ceil((unixTs - nowSec) / 86_400));
}

export function lockScore(amount: bigint, daysRemaining: number): bigint {
  return amount * BigInt(Math.max(daysRemaining, 1));
}
