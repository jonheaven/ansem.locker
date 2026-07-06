import { head, put } from '@vercel/blob';

export type XLinkRecord = {
  wallet: string;
  xHandle: string;
  /** Account-link verification post (optional if flex-only). */
  tweetUrl: string;
  linkedAt: number;
  /** Verified flex / lock share post — earns Locker List spot. */
  flexTweetUrl?: string;
  flexVerifiedAt?: number;
};

const X_LINKS_BLOB_PATH = 'ansem-locker-x-links.json';

declare global {
  // eslint-disable-next-line no-var
  var __ansemXLinksStore: Map<string, XLinkRecord> | undefined;
}

function memoryStore(): Map<string, XLinkRecord> {
  return (globalThis.__ansemXLinksStore ??= new Map());
}

async function loadFromBlob(): Promise<Map<string, XLinkRecord> | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;

  try {
    const meta = await head(X_LINKS_BLOB_PATH);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;

    const links = JSON.parse(await res.text()) as XLinkRecord[];
    if (!Array.isArray(links)) return null;

    return new Map(
      links
        .filter((link) => link?.wallet && link?.xHandle)
        .map((link) => [link.wallet, link]),
    );
  } catch {
    return null;
  }
}

async function saveToBlob(store: Map<string, XLinkRecord>): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  const links = Array.from(store.values()).sort((a, b) => b.linkedAt - a.linkedAt);
  await put(X_LINKS_BLOB_PATH, JSON.stringify(links), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function loadXLinkStore(): Promise<Map<string, XLinkRecord>> {
  const fromBlob = await loadFromBlob();
  if (fromBlob) {
    globalThis.__ansemXLinksStore = fromBlob;
    return fromBlob;
  }
  return memoryStore();
}

export async function saveXLinkStore(store: Map<string, XLinkRecord>): Promise<void> {
  globalThis.__ansemXLinksStore = store;
  await saveToBlob(store);
}
