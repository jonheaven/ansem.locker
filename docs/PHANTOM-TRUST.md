# Phantom & wallet trust (for builders)

Phantom warnings on new dApps are **normal** — they are not a verdict that your site is a scam. ansem.locker is non-custodial: tokens go to **Jupiter Lock** on Solana, not our servers.

## Why users see warnings

| Warning | Cause | What helps |
|---------|--------|------------|
| “Domain is new / not reviewed” | New domain, not in Phantom’s reviewed set yet | Wait a few days; [Phantom domain review form](https://docs.google.com/forms/d/1JgIxdmolgh_80xMfQKBKx9-QPC7LRdN6LHpFFW8BlKM/viewform) if >1 week |
| “This dApp could be malicious” | Blowfish (Phantom’s tx preview) — often failed simulation, multi-signer txs, or unknown patterns | Pre-simulate txs; [contact Blowfish](mailto:review@blowfish.xyz); community vouch via [@blowfishxyz](https://x.com/blowfishxyz) |
| Multiple confirm clicks | New domain + caution UX | Phantom Portal app + verified domain (below) |

Official docs: [Phantom domain & transaction warnings](https://docs.phantom.com/developer-powertools/domain-and-transaction-warnings)

## What we already do in code

- **No private keys** — standard `@solana/wallet-adapter` only
- **Known program** — Jupiter Lock (`LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`), not custom drain logic
- **Fixed $ANSEM mint** — hardcoded Token-2022 mint; no “approve all” flow
- **Pre-flight simulation** — lock/claim txs simulated before the wallet popup (reduces Blowfish “will fail” flags)
- **Open source** — [github.com/jonheaven/ansem.locker](https://github.com/jonheaven/ansem.locker)
- **Signed API mutations** — Ed25519 wallet proof for 𝕏 link / flex verify

## Action checklist (builder)

1. **Register on [Phantom Portal](https://phantom.com/developer)** — create app, branding, **verify domain** `ansem.locker`, get App ID.
2. **Submit domain review** if warnings persist >7 days (form above).
3. **Email Blowfish** at `review@blowfish.xyz` with:
   - Domain: `https://ansem.locker`
   - GitHub: repo link
   - What the app does (lock $ANSEM via Jupiter Lock only)
   - Program ID + mint on Solscan
4. **Keep transactions simulating cleanly** — users need a little SOL for rent; failed sims trigger scarier warnings.
5. **Solflare / Backpack** — list as alternatives in UI copy; not every wallet uses the same heuristics.

## What does *not* fix Phantom

- An “AI approved” badge on the site (wallets do not read it)
- A Grok or ChatGPT tweet (helpful for humans, not wallet allowlists)
- Hiding the GitHub repo

Use AI/human reviews for **user trust** and marketing; use Phantom Portal + Blowfish for **wallet UX**.

## Verify yourself (users)

1. [SECURITY.md](./SECURITY.md) — threat model
2. [Solscan: Jupiter Lock program](https://solscan.io/account/LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn)
3. [Solscan: $ANSEM mint](https://solscan.io/token/9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump)
4. Lock a **tiny** amount for **5 minutes**, claim back on-site — proof the flow works
