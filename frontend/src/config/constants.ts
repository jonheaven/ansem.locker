import { PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

/** $ANSEM — The Black Bull (pump.fun) */
export const ANSEM_MINT = new PublicKey(
  '9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump',
);

/** pump.fun $ANSEM uses Token-2022, not legacy SPL Token. */
export const ANSEM_TOKEN_PROGRAM = TOKEN_2022_PROGRAM_ID;

/** SPL decimals for pump.fun tokens */
export const ANSEM_DECIMALS = 6;

export {
  BONFIDA_VESTING_PROGRAM_ID,
  BONFIDA_VESTING_UI,
} from '@/lib/bonfida/constants';
export { JUPITER_LOCK_PROGRAM_ID, JUPITER_LOCK_UI } from '@/lib/jupiter-lock/constants';

export const RPC_ENDPOINT =
  import.meta.env.VITE_SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com';

export const MIN_LOCK_MINUTES = 5;
export const MAX_LOCK_DAYS = 365;

/** Rent + fees for Jupiter Lock escrow creation (observed ~0.003 SOL on mainnet). */
export const MIN_SOL_LAMPORTS_FOR_LOCK = 3_200_000;
/** Comfortable buffer so users are not one rent tweak away from failure. */
export const RECOMMENDED_SOL_LAMPORTS_FOR_LOCK = 5_000_000;

export const GITHUB_URL = 'https://github.com/jonheaven/ansem.locker';
export const SITE_URL = 'https://ansem.locker';
export const BUILDER_X = '@jontype';
export const BUILDER_X_URL = 'https://x.com/jontype';
export const BUILDER_WALLET = 'FUcz2E5vecFVDKXV6XirhfuDXGeq8EcuetLpMjhJWUFo';
export const ANSEM_X = '@blknoiz06';

/** Ticker symbol in UI (no $ — that's a cashtag on 𝕏 only). */
export const ANSEM_TICKER = 'ANSEM';
/** 𝕏 cashtag for share posts and flex verification. */
export const ANSEM_CASHTAG = '$ANSEM';

/** Display name for the X platform in UI copy */
export const X_SYMBOL = '𝕏';

export const COMMITMENT = 'confirmed' as const;
