# On-chain locking: Bonfida Token Vesting

Production locks use the **Kudelski-audited Bonfida Token Vesting program** on Solana mainnet.

| Field | Value |
|-------|-------|
| Program ID | `CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743` |
| Audit | [Kudelski report](https://github.com/Bonfida/token-vesting/blob/master/audit/Bonfida_SecurityAssessment_Vesting_Final050521.pdf) |
| Official UI | https://vesting.bonfida.org |
| Source | https://github.com/Bonfida/token-vesting |

## How a lock works

1. User signs a mainnet transaction that:
   - Initializes a Bonfida vesting account (PDA derived from a deterministic seed)
   - Creates the vesting SPL token account
   - Transfers $ANSEM from the user's ATA into the vesting vault
2. Schedule: **single cliff** — 100% of tokens unlock at `unlock_timestamp`
3. Destination: user's own $ANSEM ATA (tokens return to the same wallet after unlock)
4. After cliff: anyone can crank `unlock` (permissionless); user signs in our UI

## Seed derivation (recoverable)

The vesting PDA seed is deterministic from:

```
owner_pubkey[0..16] || unlock_ts_u64_le || amount_u64_le  → 31 bytes
```

This lets the UI recover unlock instructions from on-chain schedule data without an off-chain database.

## Instructions (Bonfida opcode)

| Opcode | Name | Purpose |
|--------|------|---------|
| 0 | Init | Allocate vesting account |
| 1 | Create | Fund vesting + set schedule |
| 2 | Unlock | Transfer unlocked tokens to destination ATA |
| 3 | Change destination | Owner changes receive ATA |

Frontend builders: `frontend/src/lib/bonfida/`

## Leaderboard indexing

`getProgramAccounts(BONFIDA_PROGRAM_ID)` → parse account data → filter `mint == $ANSEM` → read vault SPL balance → resolve owner from destination token account.

No mock data. Empty leaderboard = no one has locked yet.

## Custom Anchor program (`programs/ansem-locker`)

Reserved for a future v2 (linear vesting, on-chain events). **Not used in production.** Mainnet locks go through Bonfida today.
