import { AnchorProvider, BN, Program, type Idl } from '@coral-xyz/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  type TransactionInstruction,
} from '@solana/web3.js';
import { ANSEM_MINT, ANSEM_TOKEN_PROGRAM } from '@/config/constants';
import {
  JUPITER_LOCK_PROGRAM_ID,
  LOCK_CANCEL_MODE,
  LOCK_UPDATE_RECIPIENT_MODE,
  MEMO_PROGRAM_ID,
} from '@/lib/jupiter-lock/constants';
import idl from '@/lib/jupiter-lock/idl.json';

function deriveEscrow(base: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), base.toBuffer()],
    JUPITER_LOCK_PROGRAM_ID,
  )[0];
}

function getProgram(connection: Connection): Program {
  const provider = new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signTransaction: async () => {
        throw new Error('read-only');
      },
      signAllTransactions: async () => {
        throw new Error('read-only');
      },
    },
    { commitment: 'confirmed' },
  );
  return new Program(idl as unknown as Idl, provider);
}

export async function buildLockAnsemInstructions(
  connection: Connection,
  owner: PublicKey,
  amount: bigint,
  unlockTs: number,
): Promise<{
  instructions: TransactionInstruction[];
  vestingAccount: PublicKey;
  extraSigners: Keypair[];
}> {
  if (amount <= 0n) throw new Error('Amount must be greater than zero');

  const baseKeypair = Keypair.generate();
  const escrow = deriveEscrow(baseKeypair.publicKey);
  const now = Math.floor(Date.now() / 1000);

  const senderToken = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    owner,
    false,
    ANSEM_TOKEN_PROGRAM,
  );
  const escrowToken = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    escrow,
    true,
    ANSEM_TOKEN_PROGRAM,
  );

  const instructions: TransactionInstruction[] = [
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      senderToken,
      owner,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      escrowToken,
      escrow,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  ];

  const program = getProgram(connection);
  const createIx = await program.methods
    .createVestingEscrowV2(
      {
        vestingStartTime: new BN(now),
        cliffTime: new BN(unlockTs),
        frequency: new BN(1),
        cliffUnlockAmount: new BN(amount.toString()),
        amountPerPeriod: new BN(0),
        numberOfPeriod: new BN(0),
        updateRecipientMode: LOCK_UPDATE_RECIPIENT_MODE,
        cancelMode: LOCK_CANCEL_MODE,
      },
      null,
    )
    .accounts({
      base: baseKeypair.publicKey,
      escrow,
      escrowToken,
      sender: owner,
      senderToken,
      tokenMint: ANSEM_MINT,
      recipient: owner,
      tokenProgram: ANSEM_TOKEN_PROGRAM,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  instructions.push(createIx);

  return {
    instructions,
    vestingAccount: escrow,
    extraSigners: [baseKeypair],
  };
}

export async function buildClaimAnsemInstructions(
  connection: Connection,
  escrow: PublicKey,
  recipient: PublicKey,
  maxAmount: bigint,
): Promise<TransactionInstruction[]> {
  const recipientToken = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    recipient,
    false,
    ANSEM_TOKEN_PROGRAM,
  );
  const escrowToken = getAssociatedTokenAddressSync(
    ANSEM_MINT,
    escrow,
    true,
    ANSEM_TOKEN_PROGRAM,
  );

  const instructions: TransactionInstruction[] = [
    createAssociatedTokenAccountIdempotentInstruction(
      recipient,
      recipientToken,
      recipient,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  ];

  const program = getProgram(connection);
  const claimIx = await program.methods
    .claimV2(new BN(maxAmount.toString()), null)
    .accounts({
      escrow,
      mint: ANSEM_MINT,
      memoProgram: MEMO_PROGRAM_ID,
      escrowToken,
      recipient,
      recipientToken,
      tokenProgram: ANSEM_TOKEN_PROGRAM,
    })
    .instruction();

  instructions.push(claimIx);
  return instructions;
}

/** @deprecated Use buildClaimAnsemInstructions */
export function buildUnlockAnsemInstructions(
  _owner: PublicKey,
  _releaseTime: number,
  _amount: bigint,
): TransactionInstruction[] {
  throw new Error('Bonfida unlock is unsupported for $ANSEM. Use buildClaimAnsemInstructions.');
}
