# Architecture

## Overview

ansem.locker is a **non-custodial** Solana dApp. Users lock $ANSEM via the **Bonfida Token Vesting** program (mainnet, Kudelski-audited). The website builds and submits real transactions — it never holds keys or tokens.

```
┌─────────────┐     sign tx      ┌──────────────────────────────┐
│   Wallet    │ ───────────────► │ Bonfida Token Vesting        │
│  (Phantom)  │                  │ CChTq6PthWU82YZkbveA3WDf7... │
└─────────────┘                  └──────────────┬───────────────┘
       ▲                                      │
       │                                      ▼
       └──── unlock after cliff ──── SPL vesting token account
                                    (holds locked $ANSEM)
```

## Components

### Bonfida vesting (on-chain)

| Step | Instruction | Effect |
|------|-------------|--------|
| Lock | `Init` + `Create` | $ANSEM → vesting vault; cliff schedule stored on-chain |
| Unlock | `Unlock` | After cliff, tokens → user's ATA |

Program ID: `CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743`

### Frontend (`frontend/`)

Static SPA on Vercel:

- Wallet adapter (Phantom, Solflare, Backpack + Wallet Standard)
- Builds Bonfida instructions (`lib/bonfida/`)
- Indexes leaderboard via `getProgramAccounts` (`lib/vesting-indexer.ts`)
- X share with Solscan tx link

**Does not:** custody funds, run locking logic server-side, or store mock leaderboard rows.

### Leaderboard

```
conviction_score = remaining_vault_balance × days_until_cliff
```

Data source: live mainnet Bonfida accounts where `mint == $ANSEM` and vault balance &gt; 0.

## Lock flow

1. User picks amount + duration
2. `unlock_ts = now + days × 86400`
3. Frontend builds Bonfida `Init` + `Create` (+ ATA idempotent creates)
4. User signs in wallet → mainnet tx
5. Vesting account visible on Solscan
6. X share opens with tx proof

## Unlock flow

1. User's lock appears when destination ATA owner matches wallet
2. After `unlock_ts`, user clicks Unlock
3. Frontend rebuilds seed from on-chain schedule → `Unlock` instruction
4. User signs → $ANSEM returns to ATA

## RPC

Use a dedicated mainnet RPC (Helius, QuickNode) via `VITE_SOLANA_RPC_URL` for `getProgramAccounts` reliability.

## Future: custom program

See `programs/ansem-locker/` for an optional Anchor timelock (not deployed). v1 production = Bonfida only.
