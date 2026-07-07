export type AnsemQuote = {
  priceUsd: number;
  priceChange24h: number | null;
  mint: string;
  source: string;
};

export async function fetchAnsemQuoteClient(): Promise<AnsemQuote> {
  const res = await fetch('/api/ansem-quote');
  if (!res.ok) {
    throw new Error('ANSEM quote unavailable');
  }
  const json = (await res.json()) as AnsemQuote;
  if (typeof json.priceUsd !== 'number' || !Number.isFinite(json.priceUsd)) {
    throw new Error('Invalid ANSEM quote');
  }
  const priceChange24h =
    typeof json.priceChange24h === 'number' && Number.isFinite(json.priceChange24h)
      ? json.priceChange24h
      : null;
  return { ...json, priceChange24h };
}
