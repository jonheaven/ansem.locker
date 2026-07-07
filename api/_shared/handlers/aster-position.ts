import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ASTER_ANSEM_SYMBOL } from '../aster';
import {
  extractChainSymbolPosition,
  fetchAsterChainBalance,
} from '../aster-chain';
import { fetchSignedPositionRisk, readAsterApiCredentials } from '../aster-auth';

const DEFAULT_BUILDER_WALLET = 'FUcz2E5vecFVDKXV6XirhfuDXGeq8EcuetLpMjhJWUFo';

export type AsterPositionDto = {
  wallet: string;
  symbol: string;
  source: 'chain' | 'api' | 'none';
  privacyEnabled: boolean;
  position: {
    side: 'long' | 'short';
    sizeAnsem: number;
    entryPrice: number;
    markPrice: number;
    unrealizedPnlUsdt: number;
    leverage: number;
    notionalUsdt: number;
    liquidationPrice: number | null;
  } | null;
  updatedAt: number;
};

function parsePosition(input: {
  positionAmt: string;
  entryPrice: string;
  markPrice: string;
  unRealizedProfit: string;
  leverage: string | number;
  notional?: string;
  notionalValue?: string;
  liquidationPrice?: string;
}): AsterPositionDto['position'] {
  const size = Number(input.positionAmt);
  if (!Number.isFinite(size) || size === 0) return null;

  const entryPrice = Number(input.entryPrice);
  const markPrice = Number(input.markPrice);
  const unrealizedPnlUsdt = Number(input.unRealizedProfit);
  const leverage = Number(input.leverage);
  const notionalUsdt = Number(input.notional ?? input.notionalValue ?? 0);
  const liquidationPriceRaw = input.liquidationPrice ? Number(input.liquidationPrice) : NaN;

  return {
    side: size > 0 ? 'long' : 'short',
    sizeAnsem: Math.abs(size),
    entryPrice: Number.isFinite(entryPrice) ? entryPrice : 0,
    markPrice: Number.isFinite(markPrice) ? markPrice : 0,
    unrealizedPnlUsdt: Number.isFinite(unrealizedPnlUsdt) ? unrealizedPnlUsdt : 0,
    leverage: Number.isFinite(leverage) && leverage > 0 ? leverage : 1,
    notionalUsdt: Number.isFinite(notionalUsdt) ? Math.abs(notionalUsdt) : 0,
    liquidationPrice: Number.isFinite(liquidationPriceRaw) ? liquidationPriceRaw : null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const wallet = String(
    req.query.wallet ?? process.env.BUILDER_ASTER_WALLET ?? DEFAULT_BUILDER_WALLET,
  ).trim();
  const symbol = String(req.query.symbol ?? ASTER_ANSEM_SYMBOL).toUpperCase();

  if (!wallet) {
    return res.status(400).json({ error: 'Missing wallet' });
  }

  try {
    const balance = await fetchAsterChainBalance(wallet);
    const privacyEnabled = balance.accountPrivacy === 'enabled';
    const chainPos = extractChainSymbolPosition(balance, symbol);

    if (chainPos) {
      const position = parsePosition({
        positionAmt: chainPos.positionAmount,
        entryPrice: chainPos.entryPrice,
        markPrice: chainPos.markPrice,
        unRealizedProfit: chainPos.unrealizedProfit,
        leverage: chainPos.leverage,
        notionalValue: chainPos.notionalValue,
      });

      const dto: AsterPositionDto = {
        wallet,
        symbol,
        source: 'chain',
        privacyEnabled,
        position,
        updatedAt: Date.now(),
      };

      res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
      return res.status(200).json(dto);
    }

    const creds = readAsterApiCredentials();
    if (creds) {
      const risks = await fetchSignedPositionRisk(creds, symbol);
      const open = risks.find((row) => {
        const amt = Number(row.positionAmt);
        return row.symbol.toUpperCase() === symbol && Number.isFinite(amt) && amt !== 0;
      });

      if (open) {
        const dto: AsterPositionDto = {
          wallet,
          symbol,
          source: 'api',
          privacyEnabled,
          position: parsePosition({
            positionAmt: open.positionAmt,
            entryPrice: open.entryPrice,
            markPrice: open.markPrice,
            unRealizedProfit: open.unRealizedProfit,
            leverage: open.leverage,
            notional: open.notional,
            liquidationPrice: open.liquidationPrice,
          }),
          updatedAt: Date.now(),
        };

        res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
        return res.status(200).json(dto);
      }
    }

    const dto: AsterPositionDto = {
      wallet,
      symbol,
      source: 'none',
      privacyEnabled,
      position: null,
      updatedAt: Date.now(),
    };

    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
    return res.status(200).json(dto);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Aster position lookup failed';
    console.error('[api/aster-position]', message);
    return res.status(502).json({ error: message });
  }
}
