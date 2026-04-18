import { useTranslation } from 'react-i18next';

const GoogleIcon = (props) => (
  <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C41.3 35.8 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
    <path d="M12 .5C5.73.5.67 5.56.67 11.83c0 5.02 3.25 9.27 7.76 10.78.57.11.78-.25.78-.55 0-.27-.01-1-.02-1.96-3.16.69-3.83-1.52-3.83-1.52-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.72-1.52-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.45-2.25 1.18-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.16.91-.25 1.89-.38 2.86-.38s1.95.13 2.86.38c2.19-1.47 3.15-1.16 3.15-1.16.62 1.57.23 2.73.11 3.02.74.79 1.18 1.8 1.18 3.04 0 4.36-2.65 5.32-5.18 5.6.41.35.77 1.03.77 2.08 0 1.5-.01 2.7-.01 3.07 0 .3.2.67.79.55 4.51-1.51 7.76-5.76 7.76-10.78C23.33 5.56 18.27.5 12 .5z" />
  </svg>
);

export default function SocialButton({
  provider,
  children,
  disabled = true,
  className = '',
  onClick,
  ...rest
}) {
  const { t } = useTranslation();
  const label =
    children ??
    (provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Continue');
  const Icon = provider === 'github' ? GithubIcon : GoogleIcon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={t('auth.continueWith', { provider: label })}
      title={disabled ? t('auth.comingSoon') : undefined}
      className={`
        inline-flex w-full items-center justify-center gap-2
        rounded-lg border border-gray-200 bg-white/70 px-3 py-2.5
        text-sm font-medium text-gray-700
        shadow-sm transition-colors duration-150
        hover:bg-white hover:border-gray-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-1
        disabled:cursor-not-allowed disabled:opacity-60
        dark:border-white/10 dark:bg-white/5 dark:text-gray-200
        dark:hover:bg-white/10 dark:focus-visible:ring-offset-gray-900
        ${className}
      `}
      {...rest}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
