import { en } from './en';
import { es } from './es';
import { ja } from './ja';
import { ru } from './ru';
import { zh } from './zh';

export const SUPPORTED_LOCALES = ['en', 'ja', 'es', 'ru', 'zh'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const messagesByLocale = {
  en,
  ja,
  es,
  ru,
  zh,
} as const;

export type { Messages } from './types';
