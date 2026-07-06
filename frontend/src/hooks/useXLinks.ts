import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiErrorMessage, fetchJson } from '@/lib/fetch-json';
import { X_SYMBOL } from '@/config/constants';
import { useXLinkStore } from '@/lib/x-link-store';

export type XLinkRecord = {
  wallet: string;
  xHandle: string;
  tweetUrl: string;
  linkedAt: number;
  flexTweetUrl?: string;
  flexVerifiedAt?: number;
};

type XLinksResponse = {
  links: XLinkRecord[];
};

async function fetchXLinks(): Promise<Map<string, XLinkRecord>> {
  let remote = new Map<string, XLinkRecord>();
  try {
    const result = await fetchJson<XLinksResponse>('/api/x-links');
    if (result.ok && result.data) {
      remote = new Map(result.data.links.map((link) => [link.wallet, link]));
    }
  } catch {
    // API unavailable — still merge any links saved in this browser
  }

  const local = useXLinkStore.getState().links;
  for (const [wallet, link] of Object.entries(local)) {
    if (!remote.has(wallet)) {
      remote.set(wallet, {
        wallet,
        xHandle: link.xHandle,
        tweetUrl: link.tweetUrl,
        linkedAt: link.linkedAt,
      });
    }
  }

  return remote;
}

export function useXLinks() {
  return useQuery({
    queryKey: ['x-links'],
    queryFn: fetchXLinks,
    staleTime: 60_000,
    refetchInterval: 120_000,
    retry: false,
  });
}

export function useXLinkForWallet(wallet?: string) {
  const { data } = useXLinks();
  const local = useXLinkStore((s) => (wallet ? s.links[wallet] : undefined));

  if (!wallet) return undefined;

  const remote = data?.get(wallet);
  if (remote) {
    return {
      xHandle: remote.xHandle,
      tweetUrl: remote.tweetUrl,
      linkedAt: remote.linkedAt,
      flexTweetUrl: remote.flexTweetUrl,
      flexVerifiedAt: remote.flexVerifiedAt,
    };
  }

  return local;
}

export function useLinkXAccount() {
  const queryClient = useQueryClient();
  const setLocalLink = useXLinkStore((s) => s.setLink);

  return useMutation({
    mutationFn: async (input: { wallet: string; code: string; tweetUrl: string }) => {
      const result = await fetchJson<{ error?: string; link?: XLinkRecord }>('/api/x-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!result.ok || !result.data?.link) {
        throw new Error(apiErrorMessage(result, `Could not link ${X_SYMBOL} account`));
      }
      return result.data.link;
    },
    onSuccess: (link) => {
      setLocalLink(link.wallet, {
        xHandle: link.xHandle,
        tweetUrl: link.tweetUrl,
        linkedAt: link.linkedAt,
      });
      queryClient.invalidateQueries({ queryKey: ['x-links'] });
    },
  });
}

export function useUnlinkXAccount() {
  const queryClient = useQueryClient();
  const removeLocal = useXLinkStore((s) => s.removeLink);

  return useMutation({
    mutationFn: async (wallet: string) => {
      const result = await fetchJson<{ error?: string }>('/api/x-links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet }),
      });
      if (!result.ok) {
        throw new Error(apiErrorMessage(result, `Could not unlink ${X_SYMBOL} account`));
      }
    },
    onSuccess: (_, wallet) => {
      removeLocal(wallet);
      queryClient.invalidateQueries({ queryKey: ['x-links'] });
    },
  });
}
