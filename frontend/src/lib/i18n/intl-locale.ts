import type { SupportedLocale } from '@/lib/i18n/messages';

export function intlLocaleForSupported(locale: SupportedLocale): string {
  switch (locale) {
    case 'ja':
      return 'ja-JP';
    default:
      return 'en-US';
  }
}
