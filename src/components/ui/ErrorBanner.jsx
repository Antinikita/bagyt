export default function ErrorBanner({ message, className = '' }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 ${className}`}
    >
      <svg
        aria-hidden="true"
        className="mt-0.5 h-4 w-4 flex-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0 3.75h.01M5.47 19h13.06a2 2 0 001.74-2.993L13.74 5.01a2 2 0 00-3.48 0L3.73 16.007A2 2 0 005.47 19z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
}
