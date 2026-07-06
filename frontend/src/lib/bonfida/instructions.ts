import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { ANSEM_TOKEN_PROGRAM } from '@/config/constants';
import { BONFIDA_VESTING_PROGRAM_ID } from '@/lib/bonfida/constants';
import { Numberu32 } from '@/lib/bonfida/number';
import { scheduleToWire, type VestingScheduleWire } from '@/lib/bonfida/state';

function createInitInstruction(
  payer: PublicKey,
  vestingAccount: PublicKey,
  seeds: Buffer[],
  scheduleCount: number,
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([0]),
    Buffer.concat(seeds),
    new Numberu32(scheduleCount).toBuffer(),
  ]);

  return new TransactionInstruction({
    programId: BONFIDA_VESTING_PROGRAM_ID,
    keys: [
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: vestingAccount, isSigner: false, isWritable: true },
    ],
    data,
  });
}

function createCreateInstruction(
  vestingAccount: PublicKey,
  vestingTokenAccount: PublicKey,
  sourceOwner: PublicKey,
  sourceTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  mint: PublicKey,
  schedules: VestingScheduleWire[],
  seeds: Buffer[],
): TransactionInstruction {
  const data = Buffer.concat([
    Buffer.from([1]),
    Buffer.concat(seeds),
    mint.toBuffer(),
    destinationTokenAccount.toBuffer(),
    ...schedules.map((s) => scheduleToWire(s.releaseTime, s.amount)),
  ]);

  return new TransactionInstruction({
    programId: BONFIDA_VESTING_PROGRAM_ID,
    keys: [
      { pubkey: ANSEM_TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: vestingAccount, isSigner: false, isWritable: true },
      { pubkey: vestingTokenAccount, isSigner: false, isWritable: true },
      { pubkey: sourceOwner, isSigner: true, isWritable: false },
      { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
    ],
    data,
  });
}

export function createUnlockInstruction(
  vestingAccount: PublicKey,
  vestingTokenAccount: PublicKey,
  destinationTokenAccount: PublicKey,
  seeds: Buffer[],
): TransactionInstruction {
  const data = Buffer.concat([Buffer.from([2]), Buffer.concat(seeds)]);

  return new TransactionInstruction({
    programId: BONFIDA_VESTING_PROGRAM_ID,
    keys: [
      { pubkey: ANSEM_TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: vestingAccount, isSigner: false, isWritable: true },
      { pubkey: vestingTokenAccount, isSigner: false, isWritable: true },
      { pubkey: destinationTokenAccount, isSigner: false, isWritable: true },
    ],
    data,
  });
}

export function buildCreateVestingInstructions(params: {
  payer: PublicKey;
  owner: PublicKey;
  sourceTokenAccount: PublicKey;
  destinationTokenAccount: PublicKey;
  vestingTokenAccount: PublicKey;
  vestingAccount: PublicKey;
  mint: PublicKey;
  schedules: VestingScheduleWire[];
  seeds: Buffer[];
}): TransactionInstruction[] {
  return [
    createInitInstruction(
      params.payer,
      params.vestingAccount,
      params.seeds,
      params.schedules.length,
    ),
    createCreateInstruction(
      params.vestingAccount,
      params.vestingTokenAccount,
      params.owner,
      params.sourceTokenAccount,
      params.destinationTokenAccount,
      params.mint,
      params.schedules,
      params.seeds,
    ),
  ];
}
