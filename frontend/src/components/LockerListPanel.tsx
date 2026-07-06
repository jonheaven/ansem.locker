import { ExternalLink } from 'lucide-react';
import { CopyWalletButton } from '@/components/CopyWalletButton';
import { useLockerList } from '@/hooks/useLockerList';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

type LockerListPanelProps = {
  className?: string;
};

export function LockerListPanel({ className }: LockerListPanelProps) {
  const { t } = useI18n();
  const { data: entries = [], isLoading } = useLockerList();

  return (
    <div
      className={cn(
        'rounded-2xl border border-accent/25 bg-accent/5 p-4 shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-accent">
        {t('leaderboard.lockerListTitle')}
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {t('leaderboard.lockerListBody')}
      </p>
      {isLoading ? (
        <p className="mt-3 text-xs text-muted-foreground">{t('common.loading')}</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">{t('leaderboard.lockerListEmpty')}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {entries.slice(0, 12).map((entry) => (
            <li key={entry.wallet} className="inline-flex items-center gap-0.5">
              <a
                href={
                  entry.flexTweetUrl
                    ? entry.flexTweetUrl
                    : `https://x.com/${entry.xHandle}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface-elevated py-1.5 pl-3 pr-1.5 text-xs font-medium transition-colors hover:border-accent/40 hover:text-accent"
              >
                <img src="/x.png" alt="" className="h-3 w-3" aria-hidden />
                @{entry.xHandle}
                <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
              </a>
              <CopyWalletButton address={entry.wallet} className="h-7 w-7" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
