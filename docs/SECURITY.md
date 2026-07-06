# Security model

## Threat model

| Threat | Mitigation |
|--------|------------|
| Operator steals locked tokens | Bonfida program holds tokens; we have no admin keys |
| Fake lock UI drains wallet | Only Bonfida vesting ixs; user reviews in wallet |
| Wrong token locked | UI hardcodes $ANSEM mint; Bonfida stores mint in vesting account |
| Early unlock | Bonfida checks `Clock` sysvar before transfer |
| Phishing site | Official domain; verify program ID `CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743` |

## What we never ask for

- Seed phrase / private key
- Unlimited token approvals (single transfer per lock)

## Wallet safety

1. Official `@solana/wallet-adapter` + Wallet Standard
2. Every lock = signed mainnet transaction
3. Every vesting account public on Solscan
4. Open-source frontend on GitHub

## Bonfida audit

Program audited by Kudelski (May 2021). Report in [Bonfida/token-vesting](https://github.com/Bonfida/token-vesting).

## Our integration

- Instruction builders match Bonfida on-chain layout (`frontend/src/lib/bonfida/`)
- No mock leaderboard — `getProgramAccounts` only
- Deterministic seeds — no off-chain DB required for unlock

## Reporting vulnerabilities

Private GitHub security advisory or DM [@jontype](https://x.com/jontype).
