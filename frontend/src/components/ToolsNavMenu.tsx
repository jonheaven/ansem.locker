import { Calculator, CandlestickChart, Wrench } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { HeaderFlyoutLink, HeaderFlyoutMenu } from '@/components/HeaderFlyoutMenu';
import { useI18n } from '@/lib/i18n/i18n-context';

const TOOL_ROUTES = [
  { to: '/tools/calculator', labelKey: 'tools.calculator', icon: Calculator },
  { to: '/tools/chart', labelKey: 'tools.chartNav', icon: CandlestickChart },
] as const;

export function ToolsNavMenu() {
  const { t } = useI18n();
  const location = useLocation();
  const onTools = location.pathname.startsWith('/tools');

  return (
    <HeaderFlyoutMenu
      label={t('tools.title')}
      active={onTools}
      trigger={<Wrench className="h-4 w-4 shrink-0" aria-hidden />}
    >
      {TOOL_ROUTES.map(({ to, labelKey, icon }) => (
        <HeaderFlyoutLink
          key={to}
          to={to}
          label={t(labelKey)}
          icon={icon}
          active={location.pathname === to}
        />
      ))}
    </HeaderFlyoutMenu>
  );
}
