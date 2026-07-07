import { JUPITER_LOCK_PROGRAM_ID } from './jupiter-lock';
import { ANSEM_MINT_ID, loadSolanaWeb3 } from './solana';

const TX_SIG_RE = /solscan\.io\/tx\/([1-9A-HJ-NP-Za-km-z]{80,90})/i;

export function extractSolscanTxSig(text: string): string | null {
  const match = text.match(TX_SIG_RE);
  return match?.[1] ?? null;
}

/** Confirm a Solscan tx link in a flex post is a real lock tx from this wallet. */
export async function verifyLockTxForWallet(
  rpcUrl: string,
  txSig: string,
  wallet: string,
): Promise<void> {
  const { Connection, PublicKey } = await loadSolanaWeb3();
  const connection = new Connection(rpcUrl, 'confirmed');

  const parsed = await connection.getParsedTransaction(txSig, {
    maxSupportedTransactionVersion: 0,
    commitment: 'confirmed',
  });

  if (!parsed) {
    throw new Error('Could not find that Solscan transaction on-chain');
  }

  const walletKey = new PublicKey(wallet);
  const accountKeys = parsed.transaction.message.accountKeys;

  const walletInvolved = accountKeys.some((key) => key.pubkey.equals(walletKey));
  if (!walletInvolved) {
    throw new Error('That transaction is not from your wallet');
  }

  const walletSigned = accountKeys.some(
    (key) => key.pubkey.equals(walletKey) && key.signer,
  );
  if (!walletSigned) {
    throw new Error('Your wallet must be a signer on the lock transaction');
  }

  if (parsed.meta?.err) {
    throw new Error('That transaction failed on-chain — use your successful lock tx');
  }

  const lockProgram = new PublicKey(JUPITER_LOCK_PROGRAM_ID);
  const ansemMint = new PublicKey(ANSEM_MINT_ID);

  const resolvesProgramId = (ix: {
    programId?: import('@solana/web3.js').PublicKey;
    programIdIndex?: number;
  }) => {
    if ('programId' in ix && ix.programId) return ix.programId;
    if ('programIdIndex' in ix && typeof ix.programIdIndex === 'number') {
      return accountKeys[ix.programIdIndex]?.pubkey;
    }
    return undefined;
  };

  const allInstructions = [
    ...parsed.transaction.message.instructions,
    ...(parsed.meta?.innerInstructions?.flatMap((inner) => inner.instructions) ?? []),
  ];

  const touchesLockProgram = allInstructions.some((ix) =>
    resolvesProgramId(ix)?.equals(lockProgram),
  );
  const includesAnsemMint = accountKeys.some((key) => key.pubkey.equals(ansemMint));

  if (!touchesLockProgram || !includesAnsemMint) {
    throw new Error(
      'Transaction must be a $ANSEM Jupiter Lock (include your lock tx Solscan link)',
    );
  }
}

export function requireSolscanTxInPost(haystack: string): string {
  const sig = extractSolscanTxSig(haystack);
  if (!sig) {
    throw new Error(
      'Flex post must include your lock Solscan link (https://solscan.io/tx/…)',
    );
  }
  return sig;
}
