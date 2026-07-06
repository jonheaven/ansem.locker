import { useEffect } from 'react';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';

/** Syncs layout-only document state when wallet has active locks (scroll + bg). */
export function CommittedTheme() {
  const committed = useHasActiveLock();

  useEffect(() => {
    document.documentElement.toggleAttribute('data-committed', committed);
    return () => document.documentElement.removeAttribute('data-committed');
  }, [committed]);

  return null;
}
