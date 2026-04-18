export default function Divider({ children, className = '' }) {
  if (!children) {
    return (
      <div
        role="separator"
        className={`h-px w-full bg-gray-200 dark:bg-gray-800 ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span aria-hidden="true" className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      <span className="whitespace-nowrap">{children}</span>
      <span aria-hidden="true" className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
