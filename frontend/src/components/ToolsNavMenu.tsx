import { Calculator, CandlestickChart, Wrench } from 'lucide-react';
import { useState } from 'react';
import { AnsemChartPanel } from '@/components/chart/AnsemChartPanel';
import { HeaderFlyoutItem, HeaderFlyoutMenu } from '@/components/HeaderFlyoutMenu';
import { ToolModal } from '@/components/ToolModal';
import { AnsemCalculator } from '@/components/tools/AnsemCalculator';
import { useI18n } from '@/lib/i18n/i18n-context';

type OpenTool = 'calculator' | 'chart' | null;

const TOOLS = [
  { id: 'calculator' as const, labelKey: 'tools.calculator', icon: Calculator },
  { id: 'chart' as const, labelKey: 'tools.chartNav', icon: CandlestickChart },
] as const;

export function ToolsNavMenu() {
  const { t } = useI18n();
  const [openTool, setOpenTool] = useState<OpenTool>(null);

  return (
    <>
      <HeaderFlyoutMenu
        label={t('tools.title')}
        active={openTool !== null}
        trigger={<Wrench className="h-4 w-4 shrink-0" aria-hidden />}
      >
        {(close) =>
          TOOLS.map(({ id, labelKey, icon }) => (
            <HeaderFlyoutItem
              key={id}
              compact
              icon={icon}
              label={t(labelKey)}
              active={openTool === id}
              onClick={() => {
                close();
                setOpenTool(id);
              }}
            />
          ))
        }
      </HeaderFlyoutMenu>

      <ToolModal
        open={openTool === 'calculator'}
        onClose={() => setOpenTool(null)}
        title={t('tools.calculatorTitle')}
        description={t('tools.calculatorDescription')}
        size="md"
      >
        <AnsemCalculator embedded />
      </ToolModal>

      <ToolModal
        open={openTool === 'chart'}
        onClose={() => setOpenTool(null)}
        title={t('tools.chart')}
        description={t('tools.chartDescription')}
        size="lg"
      >
        <AnsemChartPanel embedded />
      </ToolModal>
    </>
  );
}
