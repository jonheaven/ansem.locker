export const ASTER_CHAIN_INFO_URL = 'https://tapi.asterdex.com/info';

export type AsterChainPerpPosition = {
  id: string;
  symbol: string;
  collateral: string;
  positionAmount: string;
  entryPrice: string;
  unrealizedProfit: string;
  notionalValue: string;
  markPrice: string;
  leverage: number;
  isolated: boolean;
  positionSide: string;
};

export type AsterChainBalanceResult = {
  address: string;
  accountPrivacy: 'enabled' | 'disabled' | string;
  perpAssets?: Array<{ asset: string; walletBalance: number }>;
  positions?: Array<{
    tradingProduct: string;
    positions: AsterChainPerpPosition[];
  }>;
};

export async function asterChainRpc<T>(
  method: string,
  params: unknown[],
): Promise<T> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 10_000);

  try {
    const res = await fetch(ASTER_CHAIN_INFO_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      signal: ac.signal,
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method,
        params,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(body || `Aster chain RPC ${res.status}`);
    }

    const json = (await res.json()) as { result?: T; error?: { message?: string } };
    if (json.error) {
      throw new Error(json.error.message ?? 'Aster chain RPC error');
    }
    if (json.result == null) {
      throw new Error('Aster chain RPC returned empty result');
    }
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAsterChainBalance(
  address: string,
): Promise<AsterChainBalanceResult> {
  return asterChainRpc<AsterChainBalanceResult>('aster_getBalance', [address, 'latest']);
}

export function extractChainSymbolPosition(
  balance: AsterChainBalanceResult,
  symbol: string,
): AsterChainPerpPosition | null {
  for (const group of balance.positions ?? []) {
    for (const pos of group.positions ?? []) {
      if (pos.symbol.toUpperCase() === symbol.toUpperCase()) {
        const amt = Number(pos.positionAmount);
        if (!Number.isFinite(amt) || amt === 0) continue;
        return pos;
      }
    }
  }
  return null;
}
