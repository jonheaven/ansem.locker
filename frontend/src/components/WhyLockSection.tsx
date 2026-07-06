import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/cn';

const POINTS = [
  { titleKey: 'why.supplyTitle', bodyKey: 'why.supplyBody' },
  { titleKey: 'why.convictionTitle', bodyKey: 'why.convictionBody' },
  { titleKey: 'why.flexTitle', bodyKey: 'why.flexBody' },
  { titleKey: 'why.diamondTitle', bodyKey: 'why.diamondBody' },
] as const;

type WhyLockSectionProps = {
  className?: string;
};

export function WhyLockSection({ className }: WhyLockSectionProps) {
  const { t } = useI18n();

  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {t('why.title')}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('why.intro')}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {POINTS.map(({ titleKey, bodyKey }) => (
          <div
            key={titleKey}
            className="rounded-2xl border border-accent/20 bg-accent/5 p-4 shadow-sm backdrop-blur-md"
          >
            <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
        {t('why.disclaimer')}
      </p>
    </section>
  );
}
