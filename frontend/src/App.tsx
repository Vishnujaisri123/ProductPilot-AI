import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthCallback from './pages/auth/AuthCallback';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import UploadPage from './pages/dashboard/UploadPage';
import HistoryPage from './pages/dashboard/HistoryPage';
import TelegramPage from './pages/dashboard/TelegramPage';
import KnowledgeBasePage from './pages/dashboard/KnowledgeBasePage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import ApiAccessPage from './pages/dashboard/ApiAccessPage';
import BillingPage from './pages/dashboard/BillingPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import BatchPage from './pages/dashboard/BatchPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import ProductDetailsPage from './pages/dashboard/ProductDetailsPage';

import PublicLayout from './pages/public/PublicLayout';
import StorefrontHome from './pages/public/StorefrontHome';
import PublicProductDetails from './pages/public/PublicProductDetails';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Public Storefront */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<StorefrontHome />} />
        <Route path="products/:id" element={<PublicProductDetails />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Admin Panel */}
      <Route
        path="/admin"
        element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="batch" element={<BatchPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="telegram" element={<TelegramPage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="api" element={<ApiAccessPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
