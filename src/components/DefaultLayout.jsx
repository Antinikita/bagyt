import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DefaultLayout() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8 items-center">
              <div className="font-bold text-lg">MyApp</div>
              <Link to="/dashboard" className="text-gray-900 hover:text-blue-600">Dashboard</Link>
              <Link to="/complaints" className="text-gray-900 hover:text-blue-600">Complaints</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}