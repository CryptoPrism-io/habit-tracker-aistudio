import { useState, useEffect, useCallback } from 'react';

export const useTheme = (): [string, () => void] => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') {
            return 'dark';
        }
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    }, []);

    return [theme, toggleTheme];
};
