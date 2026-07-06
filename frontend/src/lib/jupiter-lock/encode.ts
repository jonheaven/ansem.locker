import { Buffer } from 'buffer';

/** sha256("global:create_vesting_escrow_v2")[0..8] — from jup-lock IDL */
const CREATE_VESTING_ESCROW_V2_DISC = Buffer.from([181, 155, 104, 183, 182, 128, 35, 47]);
/** sha256("global:claim_v2")[0..8] — from jup-lock IDL */
const CLAIM_V2_DISC = Buffer.from([229, 87, 46, 162, 21, 157, 231, 114]);

/** Option::Some(RemainingAccountsInfo { slices: [] }) */
const EMPTY_REMAINING_ACCOUNTS_INFO = Buffer.from([1, 0, 0, 0, 0]);

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

/** Borsh: CreateVestingEscrowParameters + Option<RemainingAccountsInfo> */
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
  return Buffer.concat([CREATE_VESTING_ESCROW_V2_DISC, body, EMPTY_REMAINING_ACCOUNTS_INFO]);
}

/** Borsh: u64 maxAmount + Option<RemainingAccountsInfo> */
export function encodeClaimV2Data(maxAmount: bigint): Buffer {
  const amount = Buffer.alloc(8);
  amount.writeBigUInt64LE(maxAmount, 0);
  return Buffer.concat([CLAIM_V2_DISC, amount, EMPTY_REMAINING_ACCOUNTS_INFO]);
}
