export type AnsemQuote = {
  priceUsd: number;
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
  return json;
}
