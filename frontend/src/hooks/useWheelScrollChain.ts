import { useEffect } from 'react';

function overflowYScrollable(el: Element): boolean {
  const { overflowY } = getComputedStyle(el);
  return (
    (overflowY === 'auto' || overflowY === 'scroll') &&
    el.scrollHeight > el.clientHeight + 1
  );
}

function isHiddenScrollport(el: Element): boolean {
  const { overflow, overflowY } = getComputedStyle(el);
  return (
    (overflow === 'hidden' || overflowY === 'hidden') && !overflowYScrollable(el)
  );
}

function overflowXTrapsWheel(el: Element): boolean {
  const { overflowX } = getComputedStyle(el);
  return overflowX === 'auto' || overflowX === 'scroll';
}

function canScrollY(el: Element, deltaY: number): boolean {
  if (deltaY === 0) return false;
  if (!overflowYScrollable(el)) return false;
  const { scrollTop, scrollHeight, clientHeight } = el;
  if (deltaY < 0) return scrollTop > 0;
  return scrollTop + clientHeight < scrollHeight - 1;
}

function findScrollableYAncestor(start: Element | null): Element | null {
  let el = start;
  while (el) {
    if (overflowYScrollable(el)) return el;
    el = el.parentElement;
  }
  return document.scrollingElement;
}

/**
 * Redirects vertical wheel deltas past horizontal-only scroll traps
 * (overflow-x: auto/scroll, overflow:hidden cards, etc.) to the nearest
 * vertical scroll parent — fixes mouse wheel dying over leaderboard rows,
 * lock presets, carousel panels, and similar.
 */
export function useWheelScrollChain() {
  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      let el = event.target as Element | null;
      while (el && el !== document.documentElement) {
        if (overflowYScrollable(el) && canScrollY(el, event.deltaY)) {
          return;
        }

        const traps =
          overflowXTrapsWheel(el) ||
          isHiddenScrollport(el) ||
          (getComputedStyle(el).overflow === 'hidden' &&
            el.scrollWidth > el.clientWidth + 1);

        if (traps && !canScrollY(el, event.deltaY)) {
          const parent = findScrollableYAncestor(el.parentElement);
          if (parent) {
            parent.scrollTop += event.deltaY;
            event.preventDefault();
          }
          return;
        }

        el = el.parentElement;
      }
    };

    document.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => document.removeEventListener('wheel', onWheel, { capture: true });
  }, []);
}
