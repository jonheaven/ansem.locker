import { Eye } from 'lucide-react';
import { AnsemChartPanel } from '@/components/chart/AnsemChartPanel';
import { useI18n } from '@/lib/i18n/i18n-context';

export default function ToolsPage() {
  const { t } = useI18n();

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="space-y-2 text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {t('tools.badge')}
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('tools.title')}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {t('tools.subtitle')}
        </p>
      </header>

      <AnsemChartPanel />
    </div>
  );
}
