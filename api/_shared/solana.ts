export const BONFIDA_PROGRAM_ID = 'CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743';
export const ANSEM_MINT_ID = '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump';
/** pump.fun $ANSEM uses Token-2022, not legacy SPL Token. */
export const ANSEM_TOKEN_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';

export async function loadSolanaWeb3() {
  return import('@solana/web3.js');
}

export async function loadSplToken() {
  return import('@solana/spl-token');
}

export function isBase58Address(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}
