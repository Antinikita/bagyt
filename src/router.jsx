import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import RouterErrorBoundary from './components/RouterErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLayout from './layouts/AdminLayout';
import GuestLayout from './components/GuestLayout';

// Lazy-load every protected route. Login + Register stay eager because
// they're the auth-critical first-paint surface; everything else dropouts
// the unused page chunks until the user navigates there.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chats = lazy(() => import('./pages/Chats'));
const ChatDetail = lazy(() => import('./pages/ChatDetail'));
const Anamneses = lazy(() => import('./pages/Anamneses'));
const AnamnesisDetail = lazy(() => import('./pages/AnamnesisDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Health = lazy(() => import('./pages/Health'));

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

function suspended(node) {
  return <Suspense fallback={<LoadingScreen />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: suspended(<Dashboard />) },
      { path: 'profile', element: suspended(<Profile />) },
      { path: 'chats', element: suspended(<Chats />) },
      { path: 'chats/:chatId', element: suspended(<ChatDetail />) },
      { path: 'anamneses', element: suspended(<Anamneses />) },
      { path: 'anamneses/:anamnesisId', element: suspended(<AnamnesisDetail />) },
      { path: 'health', element: suspended(<Health />) },
    ],
  },
  {
    path: '/',
    element: (
      <GuestRoute>
        <GuestLayout />
      </GuestRoute>
    ),
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
