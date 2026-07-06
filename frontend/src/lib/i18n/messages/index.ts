import { en } from './en';
import { ja } from './ja';

export const SUPPORTED_LOCALES = ['ja', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const messagesByLocale = {
  en,
  ja,
} as const;

export type { Messages } from './types';
