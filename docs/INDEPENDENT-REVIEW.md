# Independent review (AI, Grok, humans)

There is **no official “Grok stamp”** or AI certificate that Phantom reads. This doc is for **public accountability** — anyone (Grok, another model, a security firm, a user) can review the repo and publish findings.

## Repo

- **GitHub:** https://github.com/jonheaven/ansem.locker
- **Live site:** https://ansem.locker
- **Security model:** [SECURITY.md](./SECURITY.md)
- **Phantom / wallet friction:** [PHANTOM-TRUST.md](./PHANTOM-TRUST.md)

## Suggested review prompt (paste into Grok, Claude, etc.)

```
Review the open-source repo jonheaven/ansem.locker (branch main).

Focus on:
1. Does the frontend ever request seed phrases or private keys?
2. What Solana program IDs and token mints do lock/claim transactions use?
3. Can the server API move user funds or forge wallet signatures?
4. Are mutating API routes properly authenticated?
5. Any phishing, hidden transfers, or unexpected signers in transaction builders?

Return: verdict (safe / concerns / unsafe), evidence with file paths, and what a user should verify on Solscan before signing.
```

## What a legitimate review should confirm

| Claim | Where to verify |
|-------|-----------------|
| Non-custodial | Tokens in Jupiter Lock escrows, not site DB |
| Program ID | `frontend/src/lib/jupiter-lock/constants.ts` → Solscan |
| $ANSEM mint only | `frontend/src/config/constants.ts` |
| Wallet signs locally | `@solana/wallet-adapter-react` only |
| API cannot steal locks | No server-side signing of user txs |

## Publishing a review

If you run a review (AI or human), link it from:

- A GitHub Issue or Discussion on the repo
- Your 𝕏 post tagging [@jontype](https://x.com/jontype)

We may link **third-party** reviews from `/trust` if they are public and reproducible. We will not claim “Grok certified” without an explicit, verifiable post from xAI.

## Automated checks in this repo

- CI: `frontend` typecheck + build (`.github/workflows/ci.yml`)
- Recommended: periodic `security-review` on PRs touching `api/` or transaction builders

**Last updated:** commit hash at time of deploy — see `git log -1` on `main`.
