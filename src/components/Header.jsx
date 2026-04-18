import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';

export default function Header({ user, logout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-200 dark:bg-deep-800 dark:border-deep-700">
      <div className="mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <img src="/logo-color.png" alt="" className="h-8 w-8 object-contain" />
            <h1 className="text-2xl t-wordmark">Bağyt</h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user && (
              <>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user.name}
                </span>
                <Button variant="ghost" onClick={handleLogout}>
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
