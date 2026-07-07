import type { SupportedLocale } from '@/lib/i18n/messages';

export function intlLocaleForSupported(locale: SupportedLocale): string {
  switch (locale) {
    case 'ja':
      return 'ja-JP';
    case 'es':
      return 'es-ES';
    case 'ru':
      return 'ru-RU';
    case 'zh':
      return 'zh-CN';
    default:
      return 'en-US';
  }
}
