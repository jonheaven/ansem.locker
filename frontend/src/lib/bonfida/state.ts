import { PublicKey } from '@solana/web3.js';
import { Numberu64 } from '@/lib/bonfida/number';

export type VestingScheduleWire = {
  releaseTime: number;
  amount: bigint;
};

export type ParsedVestingContract = {
  vestingAccount: PublicKey;
  destinationTokenAccount: PublicKey;
  mint: PublicKey;
  schedules: VestingScheduleWire[];
};

function parseHeader(buf: Buffer) {
  const destinationAddress = new PublicKey(buf.subarray(0, 32));
  const mintAddress = new PublicKey(buf.subarray(32, 64));
  const isInitialized = buf[64] === 1;
  return { destinationAddress, mintAddress, isInitialized };
}

/** Deserialize on-chain Bonfida vesting account data */
export function parseVestingContract(
  vestingAccount: PublicKey,
  data: Buffer,
): ParsedVestingContract | null {
  if (data.length < 81) return null;

  const header = parseHeader(data.subarray(0, 65));
  if (!header.isInitialized) return null;

  const schedules: VestingScheduleWire[] = [];
  for (let i = 65; i + 16 <= data.length; i += 16) {
    const releaseTime = Number(Numberu64.fromBuffer(data.subarray(i, i + 8)).toString());
    const amount = BigInt(Numberu64.fromBuffer(data.subarray(i + 8, i + 16)).toString());
    schedules.push({ releaseTime, amount });
  }

  return {
    vestingAccount,
    destinationTokenAccount: header.destinationAddress,
    mint: header.mintAddress,
    schedules,
  };
}

export function scheduleToWire(releaseTime: number, amount: bigint) {
  return Buffer.concat([
    new Numberu64(releaseTime).toBuffer(),
    new Numberu64(amount.toString()).toBuffer(),
  ]);
}
