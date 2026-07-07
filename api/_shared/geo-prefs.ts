export type GeoLocale = 'en' | 'hi' | 'pt' | 'ko' | 'ja' | 'es' | 'ru' | 'tr' | 'id' | 'zh';
export type GeoCurrency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'BRL'
  | 'KRW'
  | 'JPY'
  | 'TRY'
  | 'IDR'
  | 'AUD'
  | 'CAD';

export type GeoPrefs = {
  country: string;
  locale: GeoLocale;
  currency: GeoCurrency;
};

const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

const LATAM_ES = new Set(['MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'UY', 'PY', 'BO', 'CR', 'PA']);

export function geoPrefsFromCountry(countryCode: string | null | undefined): GeoPrefs {
  const country = (countryCode ?? 'US').toUpperCase().slice(0, 2);

  switch (country) {
    case 'IN':
      return { country, locale: 'hi', currency: 'INR' };
    case 'BR':
      return { country, locale: 'pt', currency: 'BRL' };
    case 'KR':
      return { country, locale: 'ko', currency: 'KRW' };
    case 'TR':
      return { country, locale: 'tr', currency: 'TRY' };
    case 'ID':
      return { country, locale: 'id', currency: 'IDR' };
    case 'JP':
      return { country, locale: 'ja', currency: 'JPY' };
    case 'GB':
      return { country, locale: 'en', currency: 'GBP' };
    case 'AU':
      return { country, locale: 'en', currency: 'AUD' };
    case 'CA':
      return { country, locale: 'en', currency: 'CAD' };
    case 'RU':
    case 'BY':
    case 'KZ':
      return { country, locale: 'ru', currency: 'USD' };
    case 'CN':
      return { country, locale: 'zh', currency: 'USD' };
    case 'TW':
    case 'HK':
    case 'MO':
      return { country, locale: 'zh', currency: 'USD' };
    case 'ES':
      return { country, locale: 'es', currency: 'EUR' };
    case 'PT':
      return { country, locale: 'pt', currency: 'EUR' };
    case 'US':
      return { country, locale: 'en', currency: 'USD' };
    default:
      if (LATAM_ES.has(country)) {
        return { country, locale: 'es', currency: 'USD' };
      }
      if (EU_COUNTRIES.has(country)) {
        return { country, locale: 'en', currency: 'EUR' };
      }
      return { country, locale: 'en', currency: 'USD' };
  }
}
