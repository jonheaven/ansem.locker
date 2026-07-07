import type { VercelRequest, VercelResponse } from '@vercel/node';
import { assertTweetUrl, fetchTweetOembed } from '../twitter-oembed';
import {
  loadXLinkStore,
  saveXLinkStore,
  type XLinkRecord,
} from '../x-link-store';
import { isBase58Address, loadSolanaWeb3 } from '../solana';
import { walletHasActiveLock } from '../wallet-lock-index';
import { requireSolscanTxInPost, verifyLockTxForWallet } from '../verify-flex-tx';
import { verifyWalletSignature } from '../wallet-auth';
import {
  INDEXER_TIMEOUT_MS,
  missingRpcMessage,
  resolveServerRpcUrl,
  validateServerRpcUrl,
  withTimeout,
} from '../rpc';

export type { XLinkRecord };

function isValidWallet(wallet: string) {
  return isBase58Address(wallet);
}

function verifyFlexPostContent(haystack: string) {
  if (!haystack.includes('ansem.locker')) {
    throw new Error('Flex post must mention ansem.locker');
  }
  if (!haystack.includes('ansem')) {
    throw new Error('Flex post must mention $ANSEM');
  }
  const flexWords = ['lock', 'locked', 'diamond', 'conviction', 'hoov', 'bull'];
  if (!flexWords.some((word) => haystack.includes(word))) {
    throw new Error('Flex post should describe your lock or conviction');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const store = await loadXLinkStore();

  if (req.method === 'GET') {
    const entries = Array.from(store.values())
      .filter((entry) => entry.flexVerifiedAt != null)
      .sort((a, b) => (b.flexVerifiedAt ?? 0) - (a.flexVerifiedAt ?? 0));
    return res.status(200).json({ entries });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = String(req.body?.wallet ?? '').trim();
  const flexTweetUrl = String(req.body?.flexTweetUrl ?? req.body?.tweetUrl ?? '').trim();
  const message = String(req.body?.message ?? '').trim();
  const signature = String(req.body?.signature ?? '').trim();

  if (!isValidWallet(wallet)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  if (!flexTweetUrl) {
    return res.status(400).json({ error: 'Paste your flex post URL' });
  }
  if (!message || !signature) {
    return res.status(400).json({ error: 'Wallet signature required to verify flex' });
  }

  const rpcUrl = resolveServerRpcUrl();
  if (!rpcUrl) {
    return res.status(503).json({ error: missingRpcMessage() });
  }
  const rpcError = validateServerRpcUrl(rpcUrl);
  if (rpcError) {
    return res.status(503).json({ error: rpcError });
  }

  try {
    await verifyWalletSignature(wallet, message, signature, 'flex-verify');
    assertTweetUrl(flexTweetUrl);

    const { PublicKey } = await loadSolanaWeb3();
    const hasLock = await withTimeout(
      walletHasActiveLock(rpcUrl, new PublicKey(wallet)),
      INDEXER_TIMEOUT_MS,
      'Wallet lock check',
    );
    if (!hasLock) {
      return res.status(400).json({
        error: 'Locker List requires an active $ANSEM lock for this wallet',
      });
    }

    const { xHandle, haystack } = await fetchTweetOembed(flexTweetUrl);
    verifyFlexPostContent(haystack);
    const flexTxSig = requireSolscanTxInPost(haystack);
    await verifyLockTxForWallet(rpcUrl, flexTxSig, wallet);

    const existing = store.get(wallet);
    if (existing?.xHandle && existing.xHandle.toLowerCase() !== xHandle.toLowerCase()) {
      throw new Error(
        `Flex post author @${xHandle} does not match linked @${existing.xHandle}`,
      );
    }

    const now = Date.now();
    const entry: XLinkRecord = {
      wallet,
      xHandle,
      tweetUrl: existing?.tweetUrl ?? flexTweetUrl,
      linkedAt: existing?.linkedAt ?? now,
      flexTweetUrl,
      flexVerifiedAt: now,
      flexTxSig,
    };

    store.set(wallet, entry);
    await saveXLinkStore(store);
    return res.status(200).json({ entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Flex verification failed';
    return res.status(400).json({ error: message });
  }
}
