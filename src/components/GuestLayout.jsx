import { Outlet } from 'react-router-dom';
import ThemeToggle from './ui/ThemeToggle';
import LanguageSwitcher from './ui/LanguageSwitcher';
import AuthSidePanel from './AuthSidePanel';

export default function GuestLayout() {
  return (
    <div
      className="
        relative isolate min-h-screen overflow-hidden
        bg-gradient-to-br from-brand-50 via-white to-brand-100
        dark:bg-grad-guest-dark dark:from-deep-900 dark:via-deep-800 dark:to-deep-700
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full
          bg-brand-400/30 blur-3xl
          dark:bg-brand-500/20
        "
      />
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-44 -right-44 h-[560px] w-[560px] rounded-full
          bg-brand-400/30 blur-3xl
          dark:bg-brand-500/20
        "
      />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div
        className="
          relative z-10 grid min-h-screen w-full
          grid-cols-1 lg:grid-cols-2
        "
      >
        <div className="flex items-center justify-center py-10 lg:py-14">
          <Outlet />
        </div>

        <aside
          aria-label="Product preview"
          className="flex items-center justify-center px-4 pb-10 lg:py-14 lg:pr-6"
        >
          <AuthSidePanel />
        </aside>
      </div>
    </div>
  );
}
