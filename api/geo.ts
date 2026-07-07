import type { VercelRequest, VercelResponse } from '@vercel/node';
import { geoPrefsFromCountry } from './_shared/geo-prefs';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const country =
    (req.headers['x-vercel-ip-country'] as string | undefined) ??
    (req.headers['cf-ipcountry'] as string | undefined) ??
    'US';

  const prefs = geoPrefsFromCountry(country);

  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(200).json(prefs);
}
