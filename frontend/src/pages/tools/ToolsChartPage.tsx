import { AnsemChartPanel } from '@/components/chart/AnsemChartPanel';
import { BuilderAsterPositionCard } from '@/components/tools/BuilderAsterPositionCard';

export default function ToolsChartPage() {
  return (
    <div className="flex flex-col gap-4">
      <BuilderAsterPositionCard />
      <AnsemChartPanel />
    </div>
  );
}
