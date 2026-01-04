// router.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Import your auth
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ComplaintEdit from "./pages/ComplaintEdit";
import AdminLayout from "./layouts/AdminLayout";
import GuestLayout from "./components/GuestLayout";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Guest Route Component  
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
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "complaints/new",
        element: <ComplaintEdit complaintId="new" />,
      },
      {
        path: "complaints/:complaintId",
        element: <ComplaintEdit />,
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
