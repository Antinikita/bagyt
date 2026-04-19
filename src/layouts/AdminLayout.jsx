import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SidebarNav from '../components/SidebarNav';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-deep-900">
      <Header user={user} logout={logout} />

      <div className="flex">
        <aside
          aria-label={t('nav.navigation')}
          className="hidden md:flex w-72 lg:w-80 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-deep-700 dark:bg-deep-800"
          style={{ height: 'calc(100vh - 4rem)', position: 'sticky', top: '4rem' }}
        >
          <SidebarNav />
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
