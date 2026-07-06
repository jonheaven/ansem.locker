import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { Connection, PublicKey, type TransactionInstruction } from '@solana/web3.js';
import { ANSEM_MINT, ANSEM_TOKEN_PROGRAM } from '@/config/constants';
import { BONFIDA_VESTING_PROGRAM_ID } from '@/lib/bonfida/constants';
import { buildCreateVestingInstructions, createUnlockInstruction } from '@/lib/bonfida/instructions';
import { parseVestingContract } from '@/lib/bonfida/state';

/**
 * Deterministic 31-byte seed from owner + cliff time + amount.
 * Recoverable from on-chain schedule data for permissionless unlock.
 */
export function deriveVestingBaseSeed(
  owner: PublicKey,
  releaseTime: number,
  amount: bigint,
): Buffer {
  const buf = Buffer.alloc(32);
  owner.toBuffer().subarray(0, 16).copy(buf, 0);
  buf.writeBigUInt64LE(BigInt(releaseTime), 16);
  buf.writeBigUInt64LE(amount, 24);
  return buf.subarray(0, 31);
}

export function resolveVestingDerivation(baseSeed: Buffer): {
  vestingAccount: PublicKey;
  instructionSeed: Buffer;
} {
  const [vestingAccount, bump] = PublicKey.findProgramAddressSync(
    [baseSeed],
    BONFIDA_VESTING_PROGRAM_ID,
  );
  const instructionSeed = Buffer.concat([baseSeed, Buffer.from([bump])]);
  return { vestingAccount, instructionSeed };
}

export function getVestingTokenAccount(vestingAccount: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(
    ANSEM_MINT,
    vestingAccount,
    true,
    ANSEM_TOKEN_PROGRAM,
  );
}

export async function buildLockAnsemInstructions(
  connection: Connection,
  owner: PublicKey,
  amount: bigint,
  unlockTs: number,
): Promise<{
  instructions: TransactionInstruction[];
  vestingAccount: PublicKey;
}> {
  if (amount <= 0n) throw new Error('Amount must be greater than zero');

  const baseSeed = deriveVestingBaseSeed(owner, unlockTs, amount);
  const { vestingAccount, instructionSeed } = resolveVestingDerivation(baseSeed);

  const existing = await connection.getAccountInfo(vestingAccount);
  if (existing) {
    throw new Error(
      'You already have a lock with this amount and unlock time. Change amount or duration.',
    );
  }

  const sourceAta = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    owner,
    false,
    ANSEM_TOKEN_PROGRAM,
  );
  const destinationAta = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    owner,
    false,
    ANSEM_TOKEN_PROGRAM,
  );
  const vestingTokenAta = getVestingTokenAccount(vestingAccount);

  const instructions: TransactionInstruction[] = [
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      sourceAta,
      owner,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      destinationAta,
      owner,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      vestingTokenAta,
      vestingAccount,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    ...buildCreateVestingInstructions({
      payer: owner,
      owner,
      sourceTokenAccount: sourceAta,
      destinationTokenAccount: destinationAta,
      vestingTokenAccount: vestingTokenAta,
      vestingAccount,
      mint: ANSEM_MINT,
      schedules: [{ releaseTime: unlockTs, amount }],
      seeds: [instructionSeed],
    }),
  ];

  return { instructions, vestingAccount };
}

export function buildUnlockAnsemInstructions(
  owner: PublicKey,
  releaseTime: number,
  amount: bigint,
): TransactionInstruction[] {
  const baseSeed = deriveVestingBaseSeed(owner, releaseTime, amount);
  const { vestingAccount, instructionSeed } = resolveVestingDerivation(baseSeed);
  const vestingTokenAta = getVestingTokenAccount(vestingAccount);
  const destinationAta = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    owner,
    false,
    ANSEM_TOKEN_PROGRAM,
  );

  return [
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      destinationAta,
      owner,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createUnlockInstruction(
      vestingAccount,
      vestingTokenAta,
      destinationAta,
      [instructionSeed],
    ),
  ];
}

export async function fetchVestingContract(
  connection: Connection,
  vestingAccount: PublicKey,
) {
  const info = await connection.getAccountInfo(vestingAccount);
  if (!info?.data) return null;
  return parseVestingContract(vestingAccount, Buffer.from(info.data));
}
