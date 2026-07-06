import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppToaster } from '@/components/AppToaster';
import { CommittedTheme } from '@/components/CommittedTheme';
import { AppShell } from '@/layout/AppShell';
import HomePage from '@/pages/HomePage';
import { AppIntlProvider } from '@/providers/AppIntlProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { SolanaWalletProvider } from '@/providers/WalletProvider';

export default function App() {
  return (
    <QueryProvider>
      <AppIntlProvider>
        <SolanaWalletProvider>
          <CommittedTheme />
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/leaderboard" element={<Navigate to="/#leaderboard" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <AppToaster />
        </SolanaWalletProvider>
      </AppIntlProvider>
    </QueryProvider>
  );
}
