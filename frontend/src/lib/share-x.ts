import { ANSEM_CASHTAG, ANSEM_X, BUILDER_X, SITE_URL } from '@/config/constants';
import { formatAnsemAmount } from '@/lib/format';
import { solscanTx } from '@/lib/solscan';

function lockProofLine(txSig?: string): string {
  return txSig ? `\n\nLock proof: ${solscanTx(txSig)}` : '';
}

function tweetIntent(text: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function openTweet(text: string) {
  window.open(tweetIntent(text), '_blank', 'noopener,noreferrer');
}

export function buildLockShareUrl(amount: string, durationLabel: string, txSig?: string): string {
  const text = `Just locked ${amount} ${ANSEM_CASHTAG} for ${durationLabel} on ansem.locker. Diamond hooves only.\n\nWho's next? Live Diamond Hooves Rank:\n${SITE_URL}/#leaderboard\n\nFlex posted? Paste the link back to join the Locker List.${lockProofLine(txSig)}\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openLockShare(
  amount: bigint,
  durationLabel: string,
  txSig?: string,
) {
  const formatted = formatAnsemAmount(amount);
  window.open(buildLockShareUrl(formatted, durationLabel, txSig), '_blank', 'noopener,noreferrer');
}

export function buildSiteShareUrl(xHandle?: string) {
  const tag = xHandle ? `\n\nVerified: @${xHandle.replace(/^@/, '')}` : '';
  const text = `Lock ${ANSEM_CASHTAG} on-chain until a date you choose. Prove conviction on the live leaderboard.\n\n${SITE_URL}${tag}\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openSiteShare(xHandle?: string) {
  window.open(buildSiteShareUrl(xHandle), '_blank', 'noopener,noreferrer');
}

export function buildConvictionShare(
  amount: string,
  timeRemaining: string,
  xHandle?: string,
  txSig?: string,
) {
  const who = xHandle ? `@${xHandle.replace(/^@/, '')}` : 'I';
  const text = `${who} ${xHandle ? 'has' : 'have'} ${amount} ${ANSEM_CASHTAG} locked on ansem.locker (${timeRemaining}). Diamond hooves.${lockProofLine(txSig)}\n\n${SITE_URL}/#leaderboard\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openConvictionShare(
  amount: bigint,
  timeRemaining: string,
  xHandle?: string,
  txSig?: string,
) {
  window.open(
    buildConvictionShare(formatAnsemAmount(amount), timeRemaining, xHandle, txSig),
    '_blank',
    'noopener,noreferrer',
  );
}

export function buildLeaderboardShareUrl(rank: number, amount: string, xHandle?: string) {
  const who = xHandle ? `@${xHandle.replace(/^@/, '')}` : 'I';
  const text = `${who} ${xHandle ? 'is' : 'am'} #${rank} on the ansem.locker conviction leaderboard (${amount} ${ANSEM_CASHTAG} locked).\n\nSee who's diamond hooving: ${SITE_URL}/#leaderboard\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openLeaderboardShare(rank: number, amount: bigint, xHandle?: string) {
  window.open(
    buildLeaderboardShareUrl(rank, formatAnsemAmount(amount), xHandle),
    '_blank',
    'noopener,noreferrer',
  );
}

export function buildLeaderboardEntryShareUrl(input: {
  rank: number;
  amount: string;
  whoLabel: string;
  timeRemaining: string;
  isSelf?: boolean;
}) {
  const { rank, amount, whoLabel, timeRemaining, isSelf } = input;
  const text = isSelf
    ? `I'm #${rank} on the ansem.locker ${ANSEM_CASHTAG} conviction leaderboard — ${amount} locked (${timeRemaining}). Diamond hooves.\n\n${SITE_URL}/#leaderboard\n\n#ANSEM`
    : `${whoLabel} is #${rank} on the ansem.locker leaderboard — ${amount} ${ANSEM_CASHTAG} locked (${timeRemaining}).\n\nSee who's flexing: ${SITE_URL}/#leaderboard\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openLeaderboardEntryShare(input: {
  rank: number;
  amount: bigint;
  whoLabel: string;
  timeRemaining: string;
  isSelf?: boolean;
}) {
  window.open(
    buildLeaderboardEntryShareUrl({
      ...input,
      amount: formatAnsemAmount(input.amount),
    }),
    '_blank',
    'noopener,noreferrer',
  );
}

export function buildLeaderboardHypeShareUrl() {
  const text = `The ansem.locker conviction leaderboard is live — see who's diamond hooving ${ANSEM_CASHTAG} on-chain.\n\n${SITE_URL}/#leaderboard\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openLeaderboardHypeShare() {
  window.open(buildLeaderboardHypeShareUrl(), '_blank', 'noopener,noreferrer');
}

export function buildUnlockShareUrl(amount: string, txSig: string) {
  const text = `Got my ${amount} ${ANSEM_CASHTAG} back from ansem.locker — lock worked, claim worked, all on-chain.\n\nClaim proof: https://solscan.io/tx/${txSig}\n\nTry a short lock to prove it yourself: ${SITE_URL}\n\n#ANSEM #DiamondHooves`;
  return tweetIntent(text);
}

export function openUnlockShare(amount: bigint, txSig: string) {
  window.open(
    buildUnlockShareUrl(formatAnsemAmount(amount), txSig),
    '_blank',
    'noopener,noreferrer',
  );
}

export function buildVerificationTweet(wallet: string, code: string) {
  return `Verifying my ansem.locker wallet.

Wallet: ${wallet}
Code: ${code}`;
}

export function openVerificationTweet(wallet: string, code: string) {
  openTweet(buildVerificationTweet(wallet, code));
}

export const X_PROFILES = [
  { handle: ANSEM_X, label: 'Ansem' },
  { handle: BUILDER_X, label: 'Builder' },
] as const;
