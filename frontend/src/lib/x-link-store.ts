import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StoredXLink = {
  xHandle: string;
  tweetUrl: string;
  linkedAt: number;
};

type XLinkStore = {
  links: Record<string, StoredXLink>;
  setLink: (wallet: string, link: StoredXLink) => void;
  removeLink: (wallet: string) => void;
  getLink: (wallet: string) => StoredXLink | undefined;
};

export const useXLinkStore = create<XLinkStore>()(
  persist(
    (set, get) => ({
      links: {},
      setLink: (wallet, link) =>
        set((state) => ({
          links: { ...state.links, [wallet]: link },
        })),
      removeLink: (wallet) =>
        set((state) => {
          const next = { ...state.links };
          delete next[wallet];
          return { links: next };
        }),
      getLink: (wallet) => get().links[wallet],
    }),
    { name: 'ansem-locker-x-links' },
  ),
);

export function buildVerificationCode(wallet: string): string {
  const short = `${wallet.slice(0, 4)}${wallet.slice(-4)}`.toUpperCase();
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BULL-${short}-${nonce}`;
}
