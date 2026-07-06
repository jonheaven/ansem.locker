import { useEffect } from 'react';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';

/** Syncs document theme: light by default, dark once wallet has active locks. */
export function CommittedTheme() {
  const committed = useHasActiveLock();

  useEffect(() => {
    document.documentElement.toggleAttribute('data-committed', committed);
    return () => document.documentElement.removeAttribute('data-committed');
  }, [committed]);

  return null;
}
