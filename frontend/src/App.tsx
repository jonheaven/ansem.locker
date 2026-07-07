import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppToaster } from '@/components/AppToaster';
import { WheelScrollChain } from '@/components/WheelScrollChain';
import { CommittedTheme } from '@/components/CommittedTheme';
import { CommittedViewport } from '@/components/CommittedViewport';
import { AppShell } from '@/layout/AppShell';
import HomePage from '@/pages/HomePage';
import TrustPage from '@/pages/TrustPage';
import { AppIntlProvider } from '@/providers/AppIntlProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SolanaWalletProvider } from '@/providers/WalletProvider';

export default function App() {
  return (
    <QueryProvider>
      <AppIntlProvider>
        <SolanaWalletProvider>
          <CommittedTheme />
          <CommittedViewport>
            <WheelScrollChain />
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/tools/*" element={<Navigate to="/" replace />} />
                  <Route path="/trust" element={<TrustPage />} />
                  <Route path="/leaderboard" element={<Navigate to="/#leaderboard" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <AppToaster />
          </CommittedViewport>
        </SolanaWalletProvider>
      </AppIntlProvider>
    </QueryProvider>
  );
}
