import { privateKeyToAccount } from 'viem/accounts';
import { ASTER_FAPI_BASE } from './aster';

const ASTER_SIGN_DOMAIN = {
  name: 'AsterSignTransaction',
  version: '1',
  chainId: 1666,
  verifyingContract: '0x0000000000000000000000000000000000000000' as const,
} as const;

const ASTER_SIGN_TYPES = {
  Message: [{ name: 'msg', type: 'string' }],
} as const;

export type AsterApiCredentials = {
  user: string;
  signer: string;
  privateKey: `0x${string}`;
};

export function readAsterApiCredentials(): AsterApiCredentials | null {
  const user = process.env.ASTER_API_USER?.trim();
  const signer = process.env.ASTER_API_SIGNER?.trim();
  let privateKey = process.env.ASTER_API_PRIVATE_KEY?.trim();

  if (!user || !signer || !privateKey) return null;

  if (!privateKey.startsWith('0x')) {
    privateKey = `0x${privateKey}`;
  }

  return {
    user,
    signer,
    privateKey: privateKey as `0x${string}`,
  };
}

function buildSignedQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
}

export async function signedAsterFapiGet<T>(
  path: string,
  businessParams: Record<string, string>,
  creds: AsterApiCredentials,
): Promise<T> {
  const nonce = String(Date.now() * 1000);
  const baseParams: Record<string, string> = {
    ...businessParams,
    nonce,
    signer: creds.signer,
    user: creds.user,
  };
  const msg = buildSignedQuery(baseParams);
  const account = privateKeyToAccount(creds.privateKey);
  const signature = await account.signTypedData({
    domain: ASTER_SIGN_DOMAIN,
    types: ASTER_SIGN_TYPES,
    primaryType: 'Message',
    message: { msg },
  });

  const url = new URL(path, ASTER_FAPI_BASE);
  url.search = `${msg}&signature=${signature}`;

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 10_000);

  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(body || `Aster signed API ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export type FapiPositionRisk = {
  symbol: string;
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  leverage: string;
  positionSide: string;
  notional?: string;
  liquidationPrice?: string;
};

export async function fetchSignedPositionRisk(
  creds: AsterApiCredentials,
  symbol?: string,
): Promise<FapiPositionRisk[]> {
  const params: Record<string, string> = {};
  if (symbol) params.symbol = symbol;
  return signedAsterFapiGet<FapiPositionRisk[]>('/fapi/v3/positionRisk', params, creds);
}
