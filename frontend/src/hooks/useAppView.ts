import { useCallback, useEffect, useState } from 'react';

export const APP_VIEWS = ['lock', 'leaderboard', 'why', 'how', 'locks'] as const;
export type AppView = (typeof APP_VIEWS)[number];

const VIEW_ALIASES: Record<string, AppView> = {
  info: 'how',
};

function parseView(hash: string): AppView {
  const id = hash.replace(/^#/, '').toLowerCase();
  if (id in VIEW_ALIASES) return VIEW_ALIASES[id]!;
  return APP_VIEWS.includes(id as AppView) ? (id as AppView) : 'lock';
}

export function useAppView() {
  const [view, setViewState] = useState<AppView>(() => parseView(window.location.hash));

  useEffect(() => {
    const sync = () => setViewState(parseView(window.location.hash));
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const setView = useCallback((next: AppView) => {
    const hash = `#${next}`;
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }
    setViewState(next);
  }, []);

  const index = APP_VIEWS.indexOf(view);

  return { view, setView, index };
}
