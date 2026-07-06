export type FetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  text: string;
};

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<FetchJsonResult<T>> {
  const res = await fetch(url, init);
  const text = await res.text();

  if (!text) {
    return { ok: res.ok, status: res.status, data: null, text };
  }

  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) as T, text };
  } catch {
    return { ok: res.ok, status: res.status, data: null, text };
  }
}

export function apiErrorMessage(
  result: FetchJsonResult<{ error?: string }>,
  fallback: string,
): string {
  if (result.data?.error) return result.data.error;
  if (
    result.text.includes('FUNCTION_INVOCATION_FAILED') ||
    result.text.includes('A server error has occurred')
  ) {
    return 'Leaderboard indexer failed on the server. Set SOLANA_RPC_URL to a Helius or QuickNode mainnet URL in Vercel env vars, then redeploy.';
  }
  if (result.text.startsWith('<')) {
    return fallback;
  }
  if (result.text) {
    return result.text.slice(0, 200);
  }
  return fallback;
}
