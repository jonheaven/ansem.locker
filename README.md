# ansem.locker

Lock [$ANSEM](https://solscan.io/token/9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump) on Solana mainnet. Prove diamond hooves.

**Live:** [ansem.locker](https://ansem.locker)

## Real on-chain locking

Uses the **Kudelski-audited Bonfida Token Vesting program** on mainnet (`CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743`). No simulators. No undeployed custom contracts.

1. Connect Phantom, Solflare, or Backpack
2. See your real $ANSEM balance
3. Lock a **portion** of your bag for 7–365 days (cliff vesting)
4. Share proof on X with Solscan link
5. Leaderboard indexes live Bonfida vesting accounts

## Quick start

```bash
cd frontend
npm install
npm run dev
```

Optional: `VITE_SOLANA_RPC_URL` for a dedicated mainnet RPC (recommended for leaderboard).

## Architecture

```
frontend/     Vite React dApp — Bonfida instruction builders + chain indexer
programs/     Future Anchor timelock (not used in production v1)
docs/         Program spec, security, deployment
```

## Trust

- Bonfida vesting — audited, mainnet since 2021
- Built by [@jontype](https://x.com/jontype) — ex-Club Penguin dev
- Open source · MIT license
- Verifiable on [Solscan](https://solscan.io)

## License

MIT
