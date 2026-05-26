import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import type { ThemeMode } from '@/types';
import colorTokens from '@/constants/colors';

const THEME_KEY = '@mw_theme';

export type ThemeColors = typeof colorTokens.light;

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setThemeModeState(val);
        if (val !== 'system') {
          Appearance.setColorScheme(val);
        }
      }
    });
  }, []);

  function setThemeMode(mode: ThemeMode) {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
    if (mode === 'light' || mode === 'dark') {
      Appearance.setColorScheme(mode);
    } else {
      Appearance.setColorScheme(null);
    }
  }

  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';
  const colors: ThemeColors = isDark ? colorTokens.dark : colorTokens.light;

  const value = useMemo(() => ({ themeMode, setThemeMode, isDark, colors }), [themeMode, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
