import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import '@/lib/i18n';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { lightTheme, darkTheme } from '@/lib/theme';

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { theme, language, hydrate } = useSettingsStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const effectiveTheme =
    theme === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme;

  const paperTheme = effectiveTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: paperTheme.colors.primary },
            headerTintColor: '#fff',
            contentStyle: { backgroundColor: paperTheme.colors.background },
          }}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
