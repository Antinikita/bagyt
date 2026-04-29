import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chats from './pages/Chats';
import ChatDetail from './pages/ChatDetail';
import Anamneses from './pages/Anamneses';
import AnamnesisDetail from './pages/AnamnesisDetail';
import Profile from './pages/Profile';
import Health from './pages/Health';
import AdminLayout from './layouts/AdminLayout';
import GuestLayout from './components/GuestLayout';

function LoadingScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-deep-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-brand-500 animate-spin dark:border-gray-700 dark:border-t-brand-400" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/admin/dashboard" replace />;
}

const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'chats', element: <Chats /> },
      { path: 'chats/:chatId', element: <ChatDetail /> },
      { path: 'anamneses', element: <Anamneses /> },
      { path: 'anamneses/:anamnesisId', element: <AnamnesisDetail /> },
      { path: 'health', element: <Health /> },
    ],
  },
  {
    path: '/',
    element: (
      <GuestRoute>
        <GuestLayout />
      </GuestRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
