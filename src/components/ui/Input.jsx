import { useId, forwardRef } from 'react';

const Input = forwardRef(function Input(
  { id, label, hint, error, className = '', leading, trailing, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const base =
    'w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 ' +
    'transition-[border-color,box-shadow] duration-150 ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-0 ' +
    'dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500';
  const state = error
    ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/40'
    : 'border-gray-300 focus:border-brand-500 focus:ring-brand-100 dark:border-gray-700 dark:focus:border-brand-400 dark:focus:ring-brand-900/40';

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leading && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500"
          >
            {leading}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${base} ${state} ${leading ? 'pl-10' : ''} ${trailing ? 'pr-10' : ''} ${className}`}
          {...rest}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>
        )}
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-600 dark:text-red-400 mt-1 animate-fade-in"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
