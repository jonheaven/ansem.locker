import type { AppView } from '@/hooks/useAppView';

type TabHeroInput = {
  view: AppView;
  committed: boolean;
  walletConnected: boolean;
  claimableCount: number;
};

type TabHeroCopy = {
  headlineKey: string;
  taglineKey: string;
};

export function resolveTabHeroCopy({
  view,
  committed,
  walletConnected,
  claimableCount,
}: TabHeroInput): TabHeroCopy {
  switch (view) {
    case 'lock':
      if (!walletConnected) {
        return {
          headlineKey: 'home.hero.lock.headline',
          taglineKey: 'home.hero.lockDisconnected.tagline',
        };
      }
      if (committed) {
        return {
          headlineKey: 'home.hero.lock.headline',
          taglineKey: 'home.hero.lockCommitted.tagline',
        };
      }
      return {
        headlineKey: 'home.hero.lock.headline',
        taglineKey: 'home.hero.lock.tagline',
      };
    case 'leaderboard':
      return {
        headlineKey: 'home.hero.leaderboard.headline',
        taglineKey: 'home.hero.leaderboard.tagline',
      };
    case 'why':
      return {
        headlineKey: 'home.hero.why.headline',
        taglineKey: 'home.hero.why.tagline',
      };
    case 'how':
      return {
        headlineKey: 'home.hero.how.headline',
        taglineKey: 'home.hero.how.tagline',
      };
    case 'locks':
      return {
        headlineKey: 'home.hero.locks.headline',
        taglineKey:
          claimableCount > 0 ? 'home.hero.locksClaim.tagline' : 'home.hero.locks.tagline',
      };
    default:
      return {
        headlineKey: 'home.headline',
        taglineKey: 'home.tagline',
      };
  }
}
