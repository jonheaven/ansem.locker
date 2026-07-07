import { en } from './en';
import { es } from './es';
import { hi } from './hi';
import { id } from './id';
import { ja } from './ja';
import { ko } from './ko';
import { pt } from './pt';
import { ru } from './ru';
import { tr } from './tr';
import { zh } from './zh';
import { mergeMessages } from '../merge-messages';

export const SUPPORTED_LOCALES = [
  'en',
  'hi',
  'pt',
  'ko',
  'ja',
  'es',
  'ru',
  'tr',
  'id',
  'zh',
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const messagesByLocale = {
  en,
  hi: mergeMessages(en, hi),
  pt: mergeMessages(en, pt),
  ko: mergeMessages(en, ko),
  ja,
  es,
  ru,
  tr: mergeMessages(en, tr),
  id: mergeMessages(en, id),
  zh,
} as const;

export type { Messages } from './types';
