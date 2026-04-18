import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
  cycleTheme: () => {},
});

const STORAGE_KEY = 'theme';
const VALID = ['light', 'dark', 'system'];

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return VALID.includes(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyClass(isDark) {
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStored);
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    readStored() === 'dark' || (readStored() === 'system' && systemPrefersDark()) ? 'dark' : 'light',
  );

  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
    applyClass(isDark);
    setResolvedTheme(isDark ? 'dark' : 'light');

    try {
      if (theme === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      applyClass(e.matches);
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t) => {
    if (VALID.includes(t)) setThemeState(t);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => {
      const i = VALID.indexOf(prev);
      return VALID[(i + 1) % VALID.length];
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
