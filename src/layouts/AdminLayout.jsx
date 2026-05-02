import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import SidebarNav from '../components/SidebarNav';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-deep-900">
      <Header user={user} logout={logout} />

      <div className="flex min-h-0 flex-1">
        <aside
          aria-label={t('nav.navigation')}
          className="hidden w-72 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white md:flex lg:w-80 dark:border-deep-700 dark:bg-deep-800"
        >
          <SidebarNav />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
