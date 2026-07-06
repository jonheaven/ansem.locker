import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PoweredByJupiter } from '@/components/PoweredByJupiter';
import { XMenuButton } from '@/components/XMenuButton';
import { BUILDER_WALLET, BUILDER_X, BUILDER_X_URL, GITHUB_URL } from '@/config/constants';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';
import { shortenAddress } from '@/lib/format';
import { cn } from '@/lib/cn';

function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <XMenuButton />
      <WalletMultiButton className="!h-9 !rounded-full !bg-foreground !px-4 !text-sm !font-medium !text-background hover:!bg-black" />
    </div>
  );
}

export function AppHeader() {
  const [copied, setCopied] = useState(false);
  const committed = useHasActiveLock();

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(BUILDER_WALLET);
      setCopied(true);
      toast.success('Wallet copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy wallet');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border/80 backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-700',
        committed ? 'bg-black/88' : 'bg-background/72',
      )}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-3 sm:flex-row sm:items-center sm:gap-8 sm:px-6 lg:gap-10">
        <div className="relative flex w-full items-center justify-center sm:w-[38%] sm:max-w-[360px] sm:shrink-0 lg:max-w-[400px]">
          <a
            href="#lock"
            className="flex items-center gap-2.5"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = 'lock';
            }}
          >
            <img src="/blackbull4.png" alt="" className="h-8 w-auto" draggable={false} />
            <p className="text-base font-semibold tracking-tight text-foreground">ansem.locker</p>
          </a>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 sm:hidden">
            <HeaderActions />
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end sm:flex">
          <HeaderActions />
        </div>
      </div>
      <div className="border-t border-border/50 px-4 py-1.5 text-center text-[11px] text-muted-foreground">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5">
          <span>
            Built by{' '}
            <a
              href={BUILDER_X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {BUILDER_X}
            </a>
          </span>
          <span aria-hidden>·</span>
          <span>
            Tip builder{' '}
            <button
              type="button"
              onClick={copyWallet}
              className="inline-flex items-center gap-1 font-mono transition-colors hover:text-foreground"
              title={BUILDER_WALLET}
            >
              {shortenAddress(BUILDER_WALLET, 4)}
              {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3" />}
            </button>
          </span>
          <span aria-hidden>·</span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <span>· open source</span>
          <span aria-hidden>·</span>
          <span>non-custodial · decentralized</span>
          <span aria-hidden>·</span>
          <PoweredByJupiter />
        </span>
      </div>
    </header>
  );
}
