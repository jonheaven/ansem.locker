import {
  Connection,
  Transaction,
  type Signer,
  type TransactionSignature,
} from '@solana/web3.js';
import type { TransactionInstruction } from '@solana/web3.js';

export async function sendInstructions(
  connection: Connection,
  payer: Signer,
  instructions: TransactionInstruction[],
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<TransactionSignature> {
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const tx = new Transaction({
    feePayer: payer.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(...instructions);

  const signed = await signTransaction(tx);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    'confirmed',
  );

  return signature;
}
