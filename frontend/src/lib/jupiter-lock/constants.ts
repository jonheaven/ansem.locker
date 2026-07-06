import { PublicKey } from '@solana/web3.js';

/** Jupiter Lock — audited mainnet program with Token-2022 support */
export const JUPITER_LOCK_PROGRAM_ID = new PublicKey(
  'LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn',
);

export const JUPITER_LOCK_UI = 'https://lock.jup.ag';

export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);

/** Neither creator nor recipient can cancel or change recipient */
export const LOCK_CANCEL_MODE = 0;
export const LOCK_UPDATE_RECIPIENT_MODE = 0;
