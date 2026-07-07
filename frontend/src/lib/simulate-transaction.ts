import type { Connection, Transaction } from '@solana/web3.js';
import { parseSolanaTxError, type ParsedTxError } from '@/lib/solana-tx-error';

export async function getSimulationError(
  connection: Connection,
  tx: Transaction,
): Promise<ParsedTxError | null> {
  const result = await connection.simulateTransaction(tx);

  if (!result.value.err) return null;
  return parseSolanaTxError(result.value.err, result.value.logs);
}
