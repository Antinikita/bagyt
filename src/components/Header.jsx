import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';
import LanguageSwitcher from './ui/LanguageSwitcher';
import Button from './ui/Button';
import SearchBar from './SearchBar';
import { getInitials } from '../lib/initials';

export default function Header({ user, logout }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-deep-700 dark:bg-deep-800/80">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="inline-flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-black/5 shadow-logo"
          >
            <img
              src="/logo-color.svg"
              alt=""
              className="h-7 w-7 object-contain"
            />
          </span>
          <h1 className="text-xl font-bold tracking-tight t-wordmark">Bağyt</h1>
        </div>

        {user && (
          <div className="hidden flex-1 justify-center px-4 md:flex">
            <SearchBar />
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <ThemeToggle />
          {user && (
            <>
              <div className="ml-1 hidden border-l border-gray-200 pl-2 dark:border-deep-700 sm:flex">
                <Link
                  to="/admin/profile"
                  aria-label={t('nav.openProfile')}
                  className="group inline-flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:hover:bg-deep-700"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-grad-pill text-xs font-semibold text-deep-700 shadow-pill"
                  >
                    {initials}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-200 dark:group-hover:text-white">
                    {user.name}
                  </span>
                </Link>
              </div>
              <Button variant="ghost" onClick={handleLogout} aria-label={t('nav.logout')}>
                <span className="inline-flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('nav.logout')}</span>
                </span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
