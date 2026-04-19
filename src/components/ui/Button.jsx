const variants = {
  primary:
    'bg-brand-500 text-deep-700 hover:bg-brand-600 hover:text-white focus-visible:ring-brand-300 dark:text-deep-900 dark:hover:text-white',
  deep:
    'bg-deep-600 text-white hover:bg-deep-700 focus-visible:ring-deep-500 dark:bg-deep-700 dark:hover:bg-deep-800',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-300 dark:bg-deep-700 dark:text-gray-100 dark:hover:bg-deep-600 dark:focus-visible:ring-deep-500',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300 dark:bg-red-500 dark:hover:bg-red-400 dark:focus-visible:ring-red-900',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-deep-700 dark:hover:text-white focus-visible:ring-gray-300 dark:focus-visible:ring-deep-500',
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-deep-900 disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin"
        />
      )}
      <span>{children}</span>
    </button>
  );
}
