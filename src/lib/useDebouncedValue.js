import { useEffect, useState } from 'react';

/**
 * Returns a value that lags `value` by `delay` ms. Used to debounce
 * inputs that drive query keys (search box, filter inputs) so we
 * don't fire one request per keystroke.
 */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
