/** Anchor instruction discriminators for Jupiter Lock (sha256("global:<name>")[0..8]) */
const CREATE_VESTING_ESCROW_V2_DISC = Buffer.from([234, 83, 9, 71, 80, 149, 39, 120]);
const CLAIM_V2_DISC = Buffer.from([85, 145, 88, 119, 61, 220, 110, 69]);

export type CliffLockParams = {
  vestingStartTime: number;
  cliffTime: number;
  frequency: number;
  cliffUnlockAmount: bigint;
  amountPerPeriod: bigint;
  numberOfPeriod: bigint;
  updateRecipientMode: number;
  cancelMode: number;
};

/** Borsh: CreateVestingEscrowParameters + Option::None remaining accounts */
export function encodeCreateVestingEscrowV2Data(params: CliffLockParams): Buffer {
  const body = Buffer.alloc(50);
  body.writeBigUInt64LE(BigInt(params.vestingStartTime), 0);
  body.writeBigUInt64LE(BigInt(params.cliffTime), 8);
  body.writeBigUInt64LE(BigInt(params.frequency), 16);
  body.writeBigUInt64LE(params.cliffUnlockAmount, 24);
  body.writeBigUInt64LE(params.amountPerPeriod, 32);
  body.writeBigUInt64LE(params.numberOfPeriod, 40);
  body.writeUInt8(params.updateRecipientMode, 48);
  body.writeUInt8(params.cancelMode, 49);
  return Buffer.concat([CREATE_VESTING_ESCROW_V2_DISC, body, Buffer.from([0])]);
}

/** Borsh: u64 maxAmount + Option::None remaining accounts */
export function encodeClaimV2Data(maxAmount: bigint): Buffer {
  const body = Buffer.alloc(9);
  body.writeBigUInt64LE(maxAmount, 0);
  body.writeUInt8(0, 8);
  return Buffer.concat([CLAIM_V2_DISC, body]);
}
