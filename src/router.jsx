import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplaintEdit from './pages/ComplaintEdit';
import AdminLayout from './layouts/AdminLayout';
import GuestLayout from './components/GuestLayout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return !user ? children : <Navigate to="/admin/dashboard" replace />;
}

// Keyed wrapper — remounts ComplaintEdit on id change so state resets cleanly.
function ComplaintEditRoute() {
  const { complaintId } = useParams();
  return <ComplaintEdit key={complaintId} />;
}

const router = createBrowserRouter([
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: 'complaints/:complaintId',
        element: <ComplaintEditRoute />,
      },
    ],
  },
  {
    path: "/",
    element: (
      <GuestRoute>
        <GuestLayout />
      </GuestRoute>
    ),
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;
