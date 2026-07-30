import { useEffect, useState } from 'react';

/**
 * Bascule de thème clair/sombre. Persiste dans localStorage et applique la
 * classe `dark` sur <html> (Tailwind darkMode: 'class').
 */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) || 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle, isDark: theme === 'dark' };
}
