import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const SunIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <circle cx="12" cy="12" r="4" />
    <path
      strokeLinecap="round"
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
    />
  </svg>
);

const MoonIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
  </svg>
);

const SystemIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path strokeLinecap="round" d="M8 20h8M12 16v4" />
  </svg>
);

const ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: SystemIcon,
};

export default function ThemeToggle({ className = '' }) {
  const { theme, cycleTheme } = useTheme();
  const { t } = useTranslation();
  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={t(`theme.next.${theme}`)}
      title={t(`theme.${theme}`)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${className}`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
