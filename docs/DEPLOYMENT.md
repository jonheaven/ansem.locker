# Deployment

## Frontend (Vercel)

### Automatic

Push to `main` on `jonheaven/ansem.locker` → Vercel builds and deploys.

### Critical: Vercel project root

**Root Directory must be empty** (repository root), **not** `frontend`.

The repo root `vercel.json` deploys:

- `frontend/dist` — static site
- `api/*.ts` — serverless leaderboard + wallet locks

If Root Directory is set to `frontend`, `/api/locks` will fail.

### Environment variables

Set in Vercel → Project → Settings → Environment Variables. Enable **Production** and **Preview**. **Redeploy** after changing env vars.

| Variable | Where used | Description |
|----------|------------|-------------|
| `SOLANA_RPC_URL` | Server (`/api/locks`, `/api/wallet-locks`) | **Required** — full QuickNode or Helius mainnet URL |
| `VITE_SOLANA_RPC_URL` | Browser (build time) | Same RPC URL — balances, lock txs, wallet reads |

**Do not** use `VITE_` prefix for `SOLANA_RPC_URL`. The server reads `process.env.SOLANA_RPC_URL` only.

### QuickNode (recommended)

1. QuickNode dashboard → your Solana Mainnet endpoint
2. Copy **HTTPS** URL, e.g.  
   `https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/`
3. Vercel env vars:

```
SOLANA_RPC_URL=https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/
VITE_SOLANA_RPC_URL=https://YOUR-ENDPOINT.solana-mainnet.quiknode.pro/YOUR_TOKEN/
```

4. Redeploy from Vercel → Deployments → ⋯ → Redeploy

### Helius (alternative)

```
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
```

Or set `HELIUS_API_KEY` alone (server builds the URL automatically).

### Verify deployment

After redeploy:

1. `https://ansem.locker/api/health` — should return `{ "ok": true, "rpcConfigured": true, ... }`
2. `https://ansem.locker/api/locks` — should return `{ "locks": [...] }` (may be empty)

If `/api/health` fails with `FUNCTION_INVOCATION_FAILED`, the API bundle is broken — confirm Root Directory is repo root and redeploy.

### Leaderboard indexer

Public RPC (`api.mainnet-beta.solana.com`) returns **403** on `getProgramAccounts`. The leaderboard uses `/api/locks` with your dedicated RPC server-side.

No program deploy required — locks use existing Bonfida mainnet program.

### Custom domain

Point `ansem.locker` DNS to Vercel (`A` → `76.76.21.21` or Vercel nameservers).

## Local development

```bash
# Frontend only
cd frontend && npm install && npm run dev

# Frontend + API routes (matches production)
npm install
cd frontend && npm install
npm run dev:full   # vercel dev from repo root
```

Copy `frontend/.env.example` → `frontend/.env` and set both RPC URLs.

## On-chain program

**Production:** Bonfida `CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743` (already on mainnet).

**Optional future:** deploy `programs/ansem-locker` via Anchor — not required for v1.

## RPC providers

- [QuickNode](https://quicknode.com)
- [Helius](https://helius.dev)

Never commit API keys to git.
