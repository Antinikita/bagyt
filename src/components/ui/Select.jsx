import { useId } from 'react';

export default function Select({
  id,
  label,
  hint,
  error,
  children,
  className = '',
  ...rest
}) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const describedBy = [error ? `${selectId}-error` : null, hint ? `${selectId}-hint` : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const base =
    'w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-gray-900 ' +
    'transition-[border-color,box-shadow] duration-150 ' +
    'focus:outline-none focus:ring-2 ' +
    'dark:bg-gray-900 dark:text-gray-100';
  const state = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/40'
    : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100 dark:border-gray-700 dark:focus:border-brand-400 dark:focus:ring-brand-900/40';

  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`${base} ${state} ${className}`}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${selectId}-hint`} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${selectId}-error`}
          className="text-xs text-red-600 dark:text-red-400 mt-1 animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
}
