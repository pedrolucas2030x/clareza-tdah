import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4648d4',
    onPrimary: '#ffffff',
    primaryContainer: '#6063ee',
    onPrimaryContainer: '#fffbff',
    secondary: '#6b38d4',
    onSecondary: '#ffffff',
    secondaryContainer: '#8455ef',
    onSecondaryContainer: '#fffbff',
    tertiary: '#904900',
    onTertiary: '#ffffff',
    tertiaryContainer: '#b55d00',
    onTertiaryContainer: '#fffbff',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
    background: '#f9f9f9',
    onBackground: '#1a1c1c',
    surface: '#f9f9f9',
    onSurface: '#1a1c1c',
    surfaceVariant: '#e2e2e2',
    onSurfaceVariant: '#464554',
    outline: '#767586',
    outlineVariant: '#c7c4d7',
    inverseSurface: '#2f3131',
    inverseOnSurface: '#f0f1f1',
    inversePrimary: '#c0c1ff',
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
