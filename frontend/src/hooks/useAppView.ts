import { useCallback, useEffect, useState } from 'react';

export const APP_VIEWS = ['lock', 'leaderboard', 'locks', 'info'] as const;
export type AppView = (typeof APP_VIEWS)[number];

function parseView(hash: string): AppView {
  const id = hash.replace(/^#/, '').toLowerCase();
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
