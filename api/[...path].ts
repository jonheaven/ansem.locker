import type { VercelRequest, VercelResponse } from '@vercel/node';

type RouteHandler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;

/** Single serverless entry — Hobby plan allows max 12 functions per deployment. */
const ROUTES: Record<string, () => Promise<{ default: RouteHandler }>> = {
  health: () => import('./_shared/handlers/health'),
  locks: () => import('./_shared/handlers/locks'),
  'wallet-locks': () => import('./_shared/handlers/wallet-locks'),
  balance: () => import('./_shared/handlers/balance'),
  'ansem-quote': () => import('./_shared/handlers/ansem-quote'),
  'flex-verify': () => import('./_shared/handlers/flex-verify'),
  'x-links': () => import('./_shared/handlers/x-links'),
  geo: () => import('./_shared/handlers/geo'),
  'fx-rates': () => import('./_shared/handlers/fx-rates'),
  'aster-ticker': () => import('./_shared/handlers/aster-ticker'),
  'aster-klines': () => import('./_shared/handlers/aster-klines'),
  'aster-position': () => import('./_shared/handlers/aster-position'),
};

function resolveApiPath(req: VercelRequest): string {
  const q = req.query as Record<string, string | string[] | undefined>;
  // Non-Next Vercel catch-all uses the literal key "...path", not "path".
  const raw = q.path ?? q['...path'];
  if (raw != null && raw !== '') {
    return Array.isArray(raw) ? raw.join('/') : String(raw);
  }

  const pathname = (req.url ?? '').split('?')[0] ?? '';
  const match = pathname.match(/\/api\/(.+)$/);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = resolveApiPath(req);

  const load = ROUTES[path];
  if (!load) {
    return res.status(404).json({ error: `Unknown API route: /api/${path}` });
  }

  const mod = await load();
  return mod.default(req, res);
}
