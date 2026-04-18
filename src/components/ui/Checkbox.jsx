import { useId, forwardRef } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(function Checkbox(
  { id, label, className = '', labelClassName = '', ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label
      htmlFor={inputId}
      className={`inline-flex select-none items-center gap-2 cursor-pointer ${className}`}
    >
      <span className="relative inline-flex">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden="true"
          className="
            grid h-4 w-4 place-items-center rounded-[5px] border border-gray-300 bg-white
            transition-colors duration-150
            peer-checked:border-brand-500 peer-checked:bg-brand-500
            peer-checked:[&_svg]:opacity-100
            peer-focus-visible:ring-2 peer-focus-visible:ring-brand-200 peer-focus-visible:ring-offset-1
            dark:border-gray-600 dark:bg-gray-900
            dark:peer-checked:border-brand-400 dark:peer-checked:bg-brand-500
            dark:peer-focus-visible:ring-brand-900/40 dark:peer-focus-visible:ring-offset-gray-900
          "
        >
          <Check
            aria-hidden="true"
            strokeWidth={3}
            className="h-3 w-3 text-white opacity-0 transition-opacity duration-150"
          />
        </span>
      </span>
      {label && (
        <span
          className={`text-sm text-gray-700 dark:text-gray-300 ${labelClassName}`}
        >
          {label}
        </span>
      )}
    </label>
  );
});

export default Checkbox;
