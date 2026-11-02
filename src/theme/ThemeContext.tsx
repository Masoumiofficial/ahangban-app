import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppColors, darkColors, lightColors } from './index';

type ThemeMode = 'system' | 'light' | 'dark';

const ThemeCtx = createContext<{ colors: AppColors; isDark: boolean; mode: ThemeMode; setMode: (m: ThemeMode) => void }>({
  colors: lightColors,
  isDark: false,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const value = useMemo(() => ({ colors, isDark, mode, setMode }), [colors, isDark, mode]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useThemeColors(): AppColors {
  return useContext(ThemeCtx).colors;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
