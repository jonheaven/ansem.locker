import { useEffect, useState } from 'react';

/** Unix seconds; ticks every second while `active` is true. */
export function useNowSec(active: boolean): number {
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 1_000);
    return () => window.clearInterval(id);
  }, [active]);

  return nowSec;
}
