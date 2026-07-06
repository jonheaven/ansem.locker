import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { ANSEM_MINT, ANSEM_TOKEN_PROGRAM } from '@/config/constants';
import {
  JUPITER_LOCK_PROGRAM_ID,
  LOCK_CANCEL_MODE,
  LOCK_UPDATE_RECIPIENT_MODE,
  MEMO_PROGRAM_ID,
} from '@/lib/jupiter-lock/constants';
import { encodeClaimV2Data, encodeCreateVestingEscrowV2Data } from '@/lib/jupiter-lock/encode';

function deriveEscrow(base: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('escrow'), base.toBuffer()],
    JUPITER_LOCK_PROGRAM_ID,
  )[0];
}

function deriveEventAuthority(): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('__event_authority')],
    JUPITER_LOCK_PROGRAM_ID,
  )[0];
}

export function buildLockAnsemInstructions(
  owner: PublicKey,
  amount: bigint,
  unlockTs: number,
): {
  instructions: TransactionInstruction[];
  vestingAccount: PublicKey;
  extraSigners: Keypair[];
} {
  if (amount <= 0n) throw new Error('Amount must be greater than zero');

  const baseKeypair = Keypair.generate();
  const escrow = deriveEscrow(baseKeypair.publicKey);
  const eventAuthority = deriveEventAuthority();
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

  const createIx = new TransactionInstruction({
    programId: JUPITER_LOCK_PROGRAM_ID,
    keys: [
      { pubkey: baseKeypair.publicKey, isSigner: true, isWritable: true },
      { pubkey: escrow, isSigner: false, isWritable: true },
      { pubkey: ANSEM_MINT, isSigner: false, isWritable: false },
      { pubkey: escrowToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: senderToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: ANSEM_TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: eventAuthority, isSigner: false, isWritable: false },
      { pubkey: JUPITER_LOCK_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: encodeCreateVestingEscrowV2Data({
      vestingStartTime: now,
      cliffTime: unlockTs,
      frequency: 1,
      cliffUnlockAmount: amount,
      amountPerPeriod: 0n,
      numberOfPeriod: 0n,
      updateRecipientMode: LOCK_UPDATE_RECIPIENT_MODE,
      cancelMode: LOCK_CANCEL_MODE,
    }),
  });

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
    createIx,
  ];

  return {
    instructions,
    vestingAccount: escrow,
    extraSigners: [baseKeypair],
  };
}

export function buildClaimAnsemInstructions(
  escrow: PublicKey,
  recipient: PublicKey,
  maxAmount: bigint,
): TransactionInstruction[] {
  const eventAuthority = deriveEventAuthority();
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

  const claimIx = new TransactionInstruction({
    programId: JUPITER_LOCK_PROGRAM_ID,
    keys: [
      { pubkey: escrow, isSigner: false, isWritable: true },
      { pubkey: ANSEM_MINT, isSigner: false, isWritable: false },
      { pubkey: MEMO_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: escrowToken, isSigner: false, isWritable: true },
      { pubkey: recipient, isSigner: true, isWritable: true },
      { pubkey: recipientToken, isSigner: false, isWritable: true },
      { pubkey: ANSEM_TOKEN_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: eventAuthority, isSigner: false, isWritable: false },
      { pubkey: JUPITER_LOCK_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: encodeClaimV2Data(maxAmount),
  });

  return [
    createAssociatedTokenAccountIdempotentInstruction(
      recipient,
      recipientToken,
      recipient,
      ANSEM_MINT,
      ANSEM_TOKEN_PROGRAM,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    claimIx,
  ];
}
