import { JUPITER_LOCK_UI } from '@/lib/jupiter-lock/constants';
import { ANSEM_TICKER, X_SYMBOL } from '@/config/constants';

/** Plain-language copy — lead with outcomes; on-chain program is supporting detail. */
export const COPY = {
  headline: `Fle${X_SYMBOL} your commitment to ${ANSEM_TICKER}`,
  tagline:
    `Prove your bullishness on-chain. Lock ${ANSEM_TICKER} in a trustless vault until your date — public, verifiable, and yours to flex.`,
  lockPanel:
    'Choose how much to lock and for how long. Your wallet signs one transaction. Until the unlock date, nobody (including us) can move those tokens.',
  lockPanelBalanceHint: 'Lock a portion of your wallet balance.',
  lockPanelDisconnected:
    `Connect a wallet to prove your bullishness. Lock ${ANSEM_TICKER} on-chain — you sign everything; we never see or touch your private keys.`,
  lockFooter:
    'Mainnet · you sign every transaction · verifiable on Solscan · unlock works without this site',
  bonfidaShort:
    'Powered by Jupiter Lock — an audited Solana program with Token-2022 support.',
  bonfidaLong: `Locks use Jupiter Lock, open-source infrastructure Jupiter maintains for on-chain escrows. Tokens sit in a program-controlled vault; ansem.locker is only the interface.`,
  bonfidaLinkLabel: 'About Jupiter Lock',
  bonfidaLinkUrl: JUPITER_LOCK_UI,
  siteIndependenceTitle: 'If this site goes offline',
  siteIndependenceBody: `Your ${ANSEM_TICKER} is not stored on ansem.locker. It sits in a Jupiter Lock escrow on Solana mainnet, tied to your wallet. After your unlock date, you can claim from lock.jup.ag, this open-source repo, or any tool that talks to the same program — even if our website is gone.`,
  siteIndependenceUnlockLabel: 'Claim on lock.jup.ag',
} as const;

export const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Connect wallet',
    body: 'Phantom, Solflare, Backpack, or any Wallet Standard wallet.',
  },
  {
    step: '2',
    title: 'Set amount & date',
    body: `Pick how much ${ANSEM_TICKER} to lock and when it should unlock.`,
  },
  {
    step: '3',
    title: 'Approve once',
    body: 'Confirm in your wallet. The lock is public on-chain and appears on the leaderboard.',
  },
] as const;

export const REASSURANCE = [
  {
    title: 'Non-custodial',
    body: 'We never see or touch your private keys. Tokens go to a Jupiter Lock vault on Solana — not our servers. You approve every transaction in your wallet.',
  },
  {
    title: 'Fixed unlock date',
    body: 'You pick the date upfront. Early withdrawal is not possible — the program enforces the schedule.',
  },
  {
    title: 'Public & verifiable',
    body: 'Every lock is visible on Solscan. Anyone can confirm amounts and unlock dates.',
  },
] as const;
