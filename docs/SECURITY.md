# Security model

## Threat model

| Threat | Mitigation |
|--------|------------|
| Operator steals locked tokens | Jupiter Lock program holds tokens; we have no admin keys |
| Fake lock UI drains wallet | Only Jupiter Lock instructions for $ANSEM; user reviews in wallet |
| Wrong token locked | UI hardcodes $ANSEM mint; on-chain escrow stores mint; flex verification checks mint |
| Early unlock | Jupiter Lock enforces cliff; program checks `Clock` sysvar |
| Phishing site | Official domain; verify program ID on Solscan |
| 𝕏 link hijacking | Wallet must sign API requests; cannot unlink/link another wallet without signature |
| Fake flex verification | Tweet oEmbed + on-chain tx must be signed by wallet, touch Jupiter Lock + $ANSEM mint |

## What we never ask for

- Seed phrase / private key
- Unlimited token approvals (single transfer per lock)

## What we never do

- **See or touch your private keys** — signing happens only in your wallet
- Hold tokens on our servers — escrows live on Solana mainnet
- Move your funds without a wallet signature you approve

## Wallet safety

1. Official `@solana/wallet-adapter` + Wallet Standard
2. Every lock = signed mainnet transaction you review in Phantom/Solflare/etc.
3. Every lock verifiable on [Solscan](https://solscan.io)
4. Open-source frontend on GitHub

## API authentication

Mutating endpoints (`POST`/`DELETE` on `/api/x-links`, `POST` on `/api/flex-verify`) require an **Ed25519 wallet signature** over:

`ansem.locker:{action}:{wallet}:{timestamp}`

Signatures expire after 5 minutes. This prevents third parties from linking, unlinking, or verifying flex on behalf of your wallet.

## Flex verification

1. Public 𝕏 post URL (x.com / twitter.com only)
2. Post must mention ansem.locker, $ANSEM, and lock-related keywords
3. Post must include `https://solscan.io/tx/…` for your lock
4. On-chain tx verified: your wallet signed, Jupiter Lock program, $ANSEM mint present, tx succeeded

## Jupiter Lock

Locks use Jupiter Lock (`LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`), open-source on-chain escrow infrastructure.

## Reporting vulnerabilities

Private GitHub security advisory or DM [@jontype](https://x.com/jontype).
