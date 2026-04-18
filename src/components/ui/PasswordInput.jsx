import { useState, forwardRef } from 'react';
import Input from './Input';

const EyeIcon = ({ open }) => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
  >
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.584 10.587a3 3 0 004.242 4.243M6.253 6.261C3.9 7.894 2.25 12 2.25 12s3.75 7.5 9.75 7.5c2.036 0 3.806-.646 5.27-1.547M9.88 4.651A10.54 10.54 0 0112 4.5c6 0 9.75 7.5 9.75 7.5a17.66 17.66 0 01-3.06 4.055" />
      </>
    )}
  </svg>
);

const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <EyeIcon open={visible} />
        </button>
      }
      {...props}
    />
  );
});

export default PasswordInput;
