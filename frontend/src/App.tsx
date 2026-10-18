import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { Route, Routes, Navigate } from 'react-router-dom';
import { PortfolioProvider } from './context/PortfolioContext';
import PortfolioPage from './PortfolioPage';
import Loader from './components/Loader';
import { AuthProvider } from './admin/AuthContext';
import ProtectedRoute from './admin/ProtectedRoute';
import HackerLoader from './components/HackerLoader';

const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HackerLoader>
        <AuthProvider>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/"
                element={
                  <PortfolioProvider>
                    <PortfolioPage />
                  </PortfolioProvider>
                }
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </HackerLoader>
    </MotionConfig>
  );
}
