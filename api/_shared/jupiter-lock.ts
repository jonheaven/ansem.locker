export const JUPITER_LOCK_PROGRAM_ID = 'LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn';
export const VESTING_ESCROW_DATA_LEN = 8 + 288;

export type ParsedEscrow = {
  escrow: import('@solana/web3.js').PublicKey;
  recipient: import('@solana/web3.js').PublicKey;
  tokenMint: import('@solana/web3.js').PublicKey;
  creator: import('@solana/web3.js').PublicKey;
  cliffTime: number;
  cliffUnlockAmount: bigint;
  amountPerPeriod: bigint;
  numberOfPeriod: bigint;
  cancelledAt: number;
};

export function parseVestingEscrow(
  escrow: import('@solana/web3.js').PublicKey,
  data: Buffer,
  PublicKey: typeof import('@solana/web3.js').PublicKey,
): ParsedEscrow | null {
  if (data.length < VESTING_ESCROW_DATA_LEN) return null;

  const cancelledAt = Number(data.readBigUInt64LE(200));
  if (cancelledAt !== 0) return null;

  return {
    escrow,
    recipient: new PublicKey(data.subarray(8, 40)),
    tokenMint: new PublicKey(data.subarray(40, 72)),
    creator: new PublicKey(data.subarray(72, 104)),
    cliffTime: Number(data.readBigUInt64LE(144)),
    cliffUnlockAmount: BigInt(data.readBigUInt64LE(160)),
    amountPerPeriod: BigInt(data.readBigUInt64LE(168)),
    numberOfPeriod: BigInt(data.readBigUInt64LE(176)),
    cancelledAt,
  };
}

export function escrowTotalAmount(parsed: ParsedEscrow): bigint {
  return (
    parsed.cliffUnlockAmount +
    parsed.amountPerPeriod * parsed.numberOfPeriod
  );
}
