import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { StoreRegisterPage } from '@/pages/StoreRegisterPage';
import { KeywordSetupPage } from '@/pages/KeywordSetupPage';
import { RankHistoryPage } from '@/pages/RankHistoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/keywords" element={<Navigate to="/" replace />} />
          <Route path="/stores/register" element={<StoreRegisterPage />} />
          <Route path="/stores/:storeId/keywords" element={<KeywordSetupPage />} />
          <Route path="/keywords/:keywordId/history" element={<RankHistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
