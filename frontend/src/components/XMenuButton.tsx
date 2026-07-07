import { useWallet } from '@solana/wallet-adapter-react';
import {
  ChevronRight,
  ExternalLink,
  Link2,
  Loader2,
  Share2,
  Unlink,
  User,
} from 'lucide-react';
import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import { toast } from 'sonner';
import { FlexVerifyForm } from '@/components/FlexVerifyForm';
import { HoverTooltip } from '@/components/HoverTooltip';
import { DiamondHoovesMenuIcon } from '@/components/DiamondHoovesIcon';
import { useFlexVerifiedForWallet } from '@/hooks/useLockerList';
import { useLeaderboard, sortLocks, useMyLocks } from '@/hooks/useLocks';
import {
  useLinkXAccount,
  useUnlinkXAccount,
  useXLinkForWallet,
} from '@/hooks/useXLinks';
import { X_SYMBOL } from '@/config/constants';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n/i18n-context';
import { formatAnsemAmount, formatTimeRemaining } from '@/lib/format';
import {
  buildVerificationTweet,
  openConvictionShareWithClipboard,
  openLeaderboardHypeShare,
  openLeaderboardShare,
  openSiteShare,
  openVerificationTweet,
  X_PROFILES,
} from '@/lib/share-x';
import { buildVerificationCode } from '@/lib/x-link-store';
import { ensureLockTxSig, resolveLockTxSig } from '@/lib/lock-tx-store';

type Panel = 'menu' | 'link' | 'flex';

function MenuRow({
  icon: Icon,
  label,
  description,
  onClick,
  disabled,
  trailing,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  onClick?: () => void;
  disabled?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors sm:items-start sm:gap-2.5 sm:rounded-xl sm:px-3 sm:py-2',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:bg-surface-hover active:bg-surface-hover',
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-elevated sm:mt-0.5 sm:h-8 sm:w-8">
        <Icon className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground whitespace-nowrap">{label}</span>
        {description ? (
          <span className="mt-0.5 hidden text-xs leading-relaxed text-muted-foreground sm:block sm:whitespace-normal">
            {description}
          </span>
        ) : null}
      </span>
      {trailing ?? (
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:mt-2 sm:block" />
      )}
    </button>
  );
}

function Divider({ className }: { className?: string }) {
  return <div className={cn('my-0.5 h-px bg-border/80', className)} />;
}

export function XMenuButton() {
  const { t } = useI18n();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('menu');
  const [tweetUrl, setTweetUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58();
  const linked = useXLinkForWallet(wallet);
  const { locks } = useMyLocks();
  const { data: leaderboard } = useLeaderboard();
  const linkMutation = useLinkXAccount();
  const unlinkMutation = useUnlinkXAccount();
  const flexVerified = useFlexVerifiedForWallet(wallet);

  const topLock = locks[0];
  const rankEntry =
    wallet && leaderboard
      ? sortLocks(leaderboard, 'score').findIndex((entry) => entry.owner === wallet)
      : -1;
  const rank = rankEntry >= 0 ? rankEntry + 1 : null;
  const rankLock = rankEntry >= 0 ? sortLocks(leaderboard ?? [], 'score')[rankEntry] : null;

  useEffect(() => {
    if (!open) {
      setPanel('menu');
      setTweetUrl('');
      setVerificationCode(null);
    }
  }, [open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onPointerDown);
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const startLink = () => {
    if (!wallet) {
      toast.error(t('lock.connectFirst'));
      return;
    }
    setVerificationCode(buildVerificationCode(wallet));
    setPanel('link');
  };

  const submitLink = async () => {
    if (!wallet || !verificationCode) return;
    try {
      const result = await linkMutation.mutateAsync({
        wallet,
        code: verificationCode,
        tweetUrl,
      });
      toast.success(t('xMenu.linkedToast', { handle: result.xHandle }));
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('xMenu.linkFailed', { x: X_SYMBOL }));
    }
  };

  const handleUnlink = async () => {
    if (!wallet) return;
    try {
      await unlinkMutation.mutateAsync(wallet);
      toast.success(t('xMenu.unlinkedToast', { x: X_SYMBOL }));
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('xMenu.unlinkFailed'));
    }
  };

  const xHandle = linked?.xHandle;

  return (
    <HoverTooltip label={t('xMenu.tooltip')} hidden={open}>
      <div ref={rootRef} className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          aria-label={t('xMenu.tooltip')}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-hover sm:h-9 sm:w-9',
            open && 'bg-surface-hover',
          )}
        >
          <img src="/x.png" alt="" className="h-4 w-4" aria-hidden />
          <span className="sr-only">
            {linked ? `@${linked.xHandle}` : X_SYMBOL}
          </span>
        </button>

        {open ? (
          <div
            id={menuId}
            role="menu"
            className={cn(
              'absolute right-0 top-full z-[60] mt-2 w-max max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-border/80 bg-background/95 p-1 shadow-xl backdrop-blur-2xl backdrop-saturate-150',
              panel === 'menu'
                ? 'max-h-[min(70dvh,26rem)] overflow-y-auto overscroll-y-contain'
                : 'w-[min(calc(100vw-1.5rem),18rem)] max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-y-contain p-2',
            )}
          >
          {panel === 'menu' ? (
            <>
              <div className="hidden px-2 py-1.5 sm:block">
                <div className="flex items-center gap-2">
                  <img src="/xai.svg" alt="" className="h-4 w-4 invert" aria-hidden />
                  <p className="text-sm font-semibold text-foreground">{X_SYMBOL}</p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {linked
                    ? t('xMenu.linkedIntro', { handle: linked.xHandle })
                    : wallet
                      ? t('xMenu.linkIntro', { x: X_SYMBOL })
                      : t('xMenu.shareIntro', { x: X_SYMBOL })}
                </p>
              </div>

              <Divider className="hidden sm:block" />

              {linked ? (
                <>
                  <MenuRow
                    icon={User}
                    label={`@${linked.xHandle}`}
                    description={t('xMenu.viewProfile')}
                    onClick={() =>
                      window.open(
                        `https://x.com/${linked.xHandle}`,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                    trailing={<ExternalLink className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />}
                  />
                  <MenuRow
                    icon={Unlink}
                    label={t('xMenu.unlinkAccount', { x: X_SYMBOL })}
                    description={t('xMenu.unlinkDescription', { x: X_SYMBOL })}
                    onClick={handleUnlink}
                    disabled={unlinkMutation.isPending}
                    trailing={
                      unlinkMutation.isPending ? (
                        <Loader2 className="mt-2 h-4 w-4 animate-spin text-muted-foreground" />
                      ) : undefined
                    }
                  />
                </>
              ) : (
                <MenuRow
                  icon={Link2}
                  label={t('xMenu.linkAccount', { x: X_SYMBOL })}
                  description={
                    wallet ? t('xMenu.linkDescription') : t('xMenu.connectFirst')
                  }
                  onClick={startLink}
                  disabled={!wallet}
                />
              )}

              <Divider />

              <p className="hidden px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
                {t('xMenu.sectionShare')}
              </p>

              <MenuRow
                icon={Share2}
                label={t('xMenu.shareSite')}
                description={t('xMenu.shareSiteDescription')}
                onClick={() => {
                  openSiteShare(xHandle);
                  setOpen(false);
                }}
                trailing={null}
              />

              <MenuRow
                icon={DiamondHoovesMenuIcon}
                label={t('xMenu.shareLeaderboard')}
                description={
                  rank && rankLock
                    ? t('xMenu.shareLeaderboardRank', { rank })
                    : t('xMenu.shareLeaderboardInvite')
                }
                onClick={() => {
                  if (rank && rankLock) {
                    openLeaderboardShare(rank, rankLock.remainingInVault, xHandle);
                  } else {
                    openLeaderboardHypeShare();
                  }
                  setOpen(false);
                }}
                trailing={null}
              />

              {topLock ? (
                <MenuRow
                  icon={Share2}
                  label={t('xMenu.shareMyLock')}
                  description={`${formatAnsemAmount(topLock.remainingInVault)} ${t('common.ansem')} · ${formatTimeRemaining(topLock.unlockTs)}`}
                  onClick={() => {
                    void (async () => {
                      const w = wallet;
                      if (!w) return;
                      let txSig = resolveLockTxSig(topLock);
                      if (!txSig) {
                        txSig = await ensureLockTxSig(w, topLock.vestingAccount);
                      }
                      await openConvictionShareWithClipboard(
                        topLock.remainingInVault,
                        formatTimeRemaining(topLock.unlockTs),
                        xHandle,
                        txSig,
                      );
                      toast.success(t('locks.shareCopied'));
                      setPanel('flex');
                    })();
                  }}
                  trailing={null}
                />
              ) : null}

              {wallet && topLock && !flexVerified ? (
                <MenuRow
                  icon={DiamondHoovesMenuIcon}
                  label={t('xMenu.joinLockerList')}
                  description={t('xMenu.joinLockerListDescription')}
                  onClick={() => setPanel('flex')}
                />
              ) : flexVerified ? (
                <MenuRow
                  icon={DiamondHoovesMenuIcon}
                  label={t('xMenu.onLockerList')}
                  description={t('xMenu.onLockerListDescription')}
                  disabled
                  trailing={null}
                />
              ) : null}

              <Divider />

              <p className="hidden px-2 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
                {t('xMenu.sectionFollow')}
              </p>

              {X_PROFILES.map(({ handle, label }) => (
                <MenuRow
                  key={handle}
                  icon={ExternalLink}
                  label={handle}
                  description={t('xMenu.followLabel', { label })}
                  onClick={() => {
                    window.open(
                      `https://x.com/${handle.replace(/^@/, '')}`,
                      '_blank',
                      'noopener,noreferrer',
                    );
                    setOpen(false);
                  }}
                  trailing={<ExternalLink className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />}
                />
              ))}
            </>
          ) : panel === 'link' ? (
            <div className="p-3">
              <button
                type="button"
                onClick={() => setPanel('menu')}
                className="mb-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('xMenu.back')}
              </button>

              <p className="text-sm font-semibold text-foreground">
                {t('xMenu.linkTitle', { x: X_SYMBOL })}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t('xMenu.linkBody', { x: X_SYMBOL })}
              </p>

              {wallet && verificationCode ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-border bg-surface-elevated p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t('xMenu.codeLabel')}
                    </p>
                    <p className="mt-1 font-mono text-sm text-foreground">{verificationCode}</p>
                    <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                      {buildVerificationTweet(wallet, verificationCode)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openVerificationTweet(wallet, verificationCode)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-black"
                  >
                    <img src="/x.png" alt="" className="h-4 w-4 invert" aria-hidden />
                    {t('xMenu.postVerification', { x: X_SYMBOL })}
                  </button>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      {t('xMenu.postUrl')}
                    </label>
                    <input
                      type="url"
                      placeholder={t('flex.verifyPlaceholder')}
                      value={tweetUrl}
                      onChange={(e) => setTweetUrl(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-base outline-none ring-accent/40 focus:ring-2"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!tweetUrl || linkMutation.isPending}
                    onClick={submitLink}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-95 disabled:opacity-50"
                  >
                    {linkMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="h-4 w-4" />
                    )}
                    {t('xMenu.verifyAndLink')}
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="p-3">
              <button
                type="button"
                onClick={() => setPanel('menu')}
                className="mb-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t('xMenu.back')}
              </button>
              <FlexVerifyForm
                wallet={wallet}
                onSuccess={() => setOpen(false)}
              />
            </div>
          )}
        </div>
      ) : null}
      </div>
    </HoverTooltip>
  );
}
