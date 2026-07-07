export const SOLSCAN_BASE = 'https://solscan.io';

export function solscanTx(signature: string): string {
  return `${SOLSCAN_BASE}/tx/${signature}`;
}

export function solscanAccount(address: string): string {
  return `${SOLSCAN_BASE}/account/${address}`;
}

export function solscanToken(mint: string): string {
  return `${SOLSCAN_BASE}/token/${mint}`;
}
