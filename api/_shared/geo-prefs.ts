export type GeoLocale = 'en' | 'ja' | 'es' | 'ru' | 'zh';
export type GeoCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';

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
