import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

export const BRAND = '#185ADB';

export const lightColors = {
  brand: BRAND,
  background: '#FFFFFF',
  surface: '#F4F6FB',
  text: '#101828',
  textSecondary: '#667085',
  border: '#E4E7EC',
  error: '#D92D20',
};

export const darkColors = {
  brand: '#5B8DEF',
  background: '#0C111D',
  surface: '#161E2E',
  text: '#F2F4F7',
  textSecondary: '#98A2B3',
  border: '#1F2937',
  error: '#F97066',
};

export type AppColors = typeof lightColors;

export function navigationTheme(isDark: boolean): Theme {
  const base = isDark ? DarkTheme : DefaultTheme;
  const c = isDark ? darkColors : lightColors;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.brand,
      background: c.background,
      card: c.surface,
      text: c.text,
      border: c.border,
      notification: c.error,
    },
  };
}
