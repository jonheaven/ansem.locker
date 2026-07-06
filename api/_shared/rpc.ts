const PUBLIC_RPC_HOSTS = [
  'api.mainnet-beta.solana.com',
  'api.devnet.solana.com',
] as const;

export const INDEXER_TIMEOUT_MS = 25_000;

export function resolveServerRpcUrl(): string | null {
  const direct = process.env.SOLANA_RPC_URL?.trim().replace(/\/+$/, '');
  if (direct) return direct;

  const heliusKey = process.env.HELIUS_API_KEY?.trim();
  if (heliusKey) {
    return `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
  }

  return null;
}

export function validateServerRpcUrl(rpcUrl: string): string | null {
  try {
    const host = new URL(rpcUrl).hostname.replace(/^www\./, '');
    if (PUBLIC_RPC_HOSTS.includes(host as (typeof PUBLIC_RPC_HOSTS)[number])) {
      return 'Public Solana RPC cannot index the leaderboard. Set SOLANA_RPC_URL to a Helius or QuickNode mainnet URL in Vercel env vars.';
    }
  } catch {
    return 'Invalid SOLANA_RPC_URL.';
  }
  return null;
}

export function missingRpcMessage(): string {
  return 'Set SOLANA_RPC_URL in Vercel (Helius or QuickNode mainnet URL with API key). See docs/DEPLOYMENT.md.';
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                `${label} timed out. Use a dedicated RPC (Helius/QuickNode) — public RPC is too slow for leaderboard indexing.`,
              ),
            ),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function getMultipleAccountsChunked(
  connection: import('@solana/web3.js').Connection,
  keys: import('@solana/web3.js').PublicKey[],
  chunkSize = 100,
) {
  const out: Array<import('@solana/web3.js').AccountInfo<Buffer> | null> = [];
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunk = keys.slice(i, i + chunkSize);
    const infos = await connection.getMultipleAccountsInfo(chunk);
    out.push(...infos);
  }
  return out;
}
