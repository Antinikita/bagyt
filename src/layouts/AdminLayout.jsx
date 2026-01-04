import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ComplaintsList from '../components/ComplaintsList';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header user={user} logout={logout} />
      
      <div className="flex">
        {/* Sidebar - Always shows complaints */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Complaints</h2>
            <ComplaintsList />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
