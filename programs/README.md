# Custom Anchor program (future v2)

The production ansem.locker site uses **Bonfida Token Vesting** on mainnet — see [docs/PROGRAM.md](../docs/PROGRAM.md).

This directory contains an optional Anchor timelock program for future features (linear vesting, custom events). It is **not deployed** and **not used** by the live frontend.

To build (requires Rust + Anchor + Solana CLI):

```bash
anchor build
```
