import { Toaster } from 'sonner';
import { useHasActiveLock } from '@/hooks/useHasActiveLock';

export function AppToaster() {
  const committed = useHasActiveLock();
  return <Toaster theme={committed ? 'dark' : 'light'} position="bottom-right" richColors />;
}
