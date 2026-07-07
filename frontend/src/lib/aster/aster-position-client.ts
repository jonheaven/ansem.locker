export type AsterPositionDto = {
  wallet: string;
  symbol: string;
  source: 'chain' | 'api' | 'none';
  privacyEnabled: boolean;
  position: {
    side: 'long' | 'short';
    sizeAnsem: number;
    entryPrice: number;
    markPrice: number;
    unrealizedPnlUsdt: number;
    leverage: number;
    notionalUsdt: number;
    liquidationPrice: number | null;
  } | null;
  updatedAt: number;
};

export async function fetchAsterPosition(wallet?: string): Promise<AsterPositionDto> {
  const params = wallet ? `?wallet=${encodeURIComponent(wallet)}` : '';
  const res = await fetch(`/api/aster-position${params}`, { cache: 'no-store' });
  if (!res.ok) {
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(json.error ?? 'Could not load Aster position');
  }
  return (await res.json()) as AsterPositionDto;
}
