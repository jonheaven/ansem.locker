export type LockCreationMeta = {
  lockTxSig?: string;
  lockTs?: number;
};

/** Paginate to the oldest signature — lock creation tx + block time when available. */
export async function fetchLockCreationMeta(
  connection: import('@solana/web3.js').Connection,
  vestingAccount: import('@solana/web3.js').PublicKey,
): Promise<LockCreationMeta> {
  try {
    let before: string | undefined;
    let oldest: import('@solana/web3.js').ConfirmedSignatureInfo | undefined;

    for (;;) {
      const batch = await connection.getSignaturesForAddress(vestingAccount, {
        limit: 1000,
        before,
      });
      if (batch.length === 0) break;
      oldest = batch[batch.length - 1]!;
      if (batch.length < 1000) break;
      before = oldest.signature;
    }

    if (!oldest) return {};

    const lockTs = oldest.blockTime ?? undefined;
    return {
      lockTxSig: oldest.signature,
      ...(lockTs != null ? { lockTs } : {}),
    };
  } catch {
    return {};
  }
}
