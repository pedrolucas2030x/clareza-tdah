import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

const PRIMARY = '#6366f1';
const PRIMARY_DARK = '#4f46e5';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: PRIMARY,
    secondary: '#8b5cf6',
    background: '#fafafa',
    surface: '#ffffff',
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',
    secondary: '#a78bfa',
    background: '#0f172a',
    surface: '#1e293b',
  },
};

export { PRIMARY, PRIMARY_DARK };
