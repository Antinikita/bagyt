import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import ComplaintsList from '../components/ComplaintsList';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-deep-900">
      <Header user={user} logout={logout} />

      <div className="flex">
        <aside className="w-80 shrink-0 bg-white border-r border-gray-200 dark:bg-deep-800 dark:border-deep-700">
          <div className="p-6">
            <h2 className="t-h2 mb-6">Complaints</h2>
            <ComplaintsList />
          </div>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
