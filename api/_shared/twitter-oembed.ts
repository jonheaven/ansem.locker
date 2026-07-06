export function parseTweetId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    if (host !== 'x.com' && host !== 'twitter.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const statusIdx = parts.indexOf('status');
    if (statusIdx === -1 || !parts[statusIdx + 1]) return null;
    return parts[statusIdx + 1]!.replace(/\D/g, '');
  } catch {
    return null;
  }
}

export function extractHandle(authorUrl?: string): string | null {
  if (!authorUrl) return null;
  try {
    const parsed = new URL(authorUrl);
    const segment = parsed.pathname.split('/').filter(Boolean)[0];
    return segment?.replace(/^@/, '') ?? null;
  } catch {
    return null;
  }
}

export function decodeHtml(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ');
}

export type TweetOembed = {
  xHandle: string;
  haystack: string;
};

export async function fetchTweetOembed(tweetUrl: string): Promise<TweetOembed> {
  const tweetId = parseTweetId(tweetUrl);
  if (!tweetId) {
    throw new Error('Paste a valid x.com or twitter.com post URL');
  }

  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
    `https://x.com/i/status/${tweetId}`,
  )}&omit_script=true`;

  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error('Could not read that post. Make sure it is public.');
  }

  const data = (await res.json()) as {
    author_name?: string;
    author_url?: string;
    html?: string;
  };

  const xHandle = extractHandle(data.author_url);
  if (!xHandle) {
    throw new Error('Could not read the post author');
  }

  return {
    xHandle,
    haystack: decodeHtml(data.html ?? '').toLowerCase(),
  };
}
