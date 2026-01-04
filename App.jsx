import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import './';  // ✅ THIS LINE IS REQUIRED

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div></div>;

  return (
    <Router>
      <Routes>
        {user ? (
          <Route path="/admin/*" element={<AdminLayout />} />
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
        <Route path="*" element={<Navigate to={user ? "/admin" : "/login"} />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
