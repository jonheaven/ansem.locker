import { ANSEM_X, BUILDER_X, SITE_URL } from '@/config/constants';
import { formatAnsemAmount } from '@/lib/format';

function tweetIntent(text: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function openTweet(text: string) {
  window.open(tweetIntent(text), '_blank', 'noopener,noreferrer');
}

export function buildLockShareUrl(amount: string, durationLabel: string, txSig?: string): string {
  const proof = txSig ? `\n\nhttps://solscan.io/tx/${txSig}` : '';
  const text = `Just locked ${amount} $ANSEM for ${durationLabel} on ansem.locker. Diamond hooves only.\n\nWho's next? Live conviction leaderboard:\n${SITE_URL}/#leaderboard${proof}\n\n#ANSEM`;
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
  const text = `Lock $ANSEM on-chain until a date you choose. Prove conviction on the live leaderboard.\n\n${SITE_URL}${tag}\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openSiteShare(xHandle?: string) {
  window.open(buildSiteShareUrl(xHandle), '_blank', 'noopener,noreferrer');
}

export function buildConvictionShare(
  amount: string,
  timeRemaining: string,
  xHandle?: string,
) {
  const who = xHandle ? `@${xHandle.replace(/^@/, '')}` : 'I';
  const text = `${who} ${xHandle ? 'has' : 'have'} ${amount} $ANSEM locked on ansem.locker (${timeRemaining}). Diamond hooves.\n\n${SITE_URL}/#leaderboard\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openConvictionShare(
  amount: bigint,
  timeRemaining: string,
  xHandle?: string,
) {
  window.open(
    buildConvictionShare(formatAnsemAmount(amount), timeRemaining, xHandle),
    '_blank',
    'noopener,noreferrer',
  );
}

export function buildLeaderboardShareUrl(rank: number, amount: string, xHandle?: string) {
  const who = xHandle ? `@${xHandle.replace(/^@/, '')}` : 'I';
  const text = `${who} ${xHandle ? 'is' : 'am'} #${rank} on the ansem.locker conviction leaderboard (${amount} $ANSEM locked).\n\nSee who's diamond hooving: ${SITE_URL}/#leaderboard\n\n#ANSEM`;
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
    ? `I'm #${rank} on the ansem.locker $ANSEM conviction leaderboard — ${amount} locked (${timeRemaining}). Diamond hooves.\n\n${SITE_URL}/#leaderboard\n\n#ANSEM`
    : `${whoLabel} is #${rank} on the ansem.locker leaderboard — ${amount} $ANSEM locked (${timeRemaining}).\n\nSee who's flexing: ${SITE_URL}/#leaderboard\n\n#ANSEM`;
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
  const text = `The ansem.locker conviction leaderboard is live — see who's diamond hooving $ANSEM on-chain.\n\n${SITE_URL}/#leaderboard\n\n#ANSEM`;
  return tweetIntent(text);
}

export function openLeaderboardHypeShare() {
  window.open(buildLeaderboardHypeShareUrl(), '_blank', 'noopener,noreferrer');
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
