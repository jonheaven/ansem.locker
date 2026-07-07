import type { SupportedLocale } from '@/lib/i18n/messages';

export function intlLocaleForSupported(locale: SupportedLocale): string {
  switch (locale) {
    case 'hi':
      return 'hi-IN';
    case 'pt':
      return 'pt-BR';
    case 'ko':
      return 'ko-KR';
    case 'ja':
      return 'ja-JP';
    case 'es':
      return 'es-ES';
    case 'ru':
      return 'ru-RU';
    case 'tr':
      return 'tr-TR';
    case 'id':
      return 'id-ID';
    case 'zh':
      return 'zh-CN';
    default:
      return 'en-US';
  }
}
