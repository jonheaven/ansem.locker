import { useWheelScrollChain } from '@/hooks/useWheelScrollChain';

/** Installs document-level wheel chaining for scroll traps. */
export function WheelScrollChain() {
  useWheelScrollChain();
  return null;
}
