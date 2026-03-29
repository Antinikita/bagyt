import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ComplaintEdit from "./pages/ComplaintEdit";
import AdminLayout from "./layouts/AdminLayout";
import GuestLayout from "./components/GuestLayout";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />; // fix: was /admin/dashboard
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return !user ? children : <Navigate to="/admin/dashboard" replace />;
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
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "complaints/new", element: <ComplaintEdit complaintId="new" /> },
      { path: "complaints/:complaintId", element: <ComplaintEdit /> },
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
      { index: true, element: <Navigate to="/login" replace /> }, // add this
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);

export default router;