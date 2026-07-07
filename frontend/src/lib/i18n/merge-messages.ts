import type { MessageTree } from './messages/types';

/** Deep-merge locale overlays onto English defaults. */
export function mergeMessages<T extends MessageTree>(base: T, overlay: MessageTree): T {
  const result: MessageTree = { ...base };

  for (const [key, value] of Object.entries(overlay)) {
    const baseValue = base[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === 'object' &&
      !Array.isArray(baseValue)
    ) {
      result[key] = mergeMessages(baseValue as MessageTree, value as MessageTree);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
