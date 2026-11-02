import React, { useEffect } from 'react';
import { I18nManager, StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { navigationTheme } from '../src/theme';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { setupPlayer, registerPlayerEvents } from '../src/player/trackPlayer';
import { NavigationContainer } from '@react-navigation/native';

// Force RTL layout once
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 2 } },
});

function Shell() {
  const { isDark } = useTheme();
  useEffect(() => {
    void setupPlayer().then(() => registerPlayerEvents()).catch(() => {});
  }, []);
  return (
    <NavigationContainer theme={navigationTheme(isDark)}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="song/[slug]" options={{ headerShown: true, title: 'آهنگ' }} />
        <Stack.Screen name="artist/[slug]" options={{ headerShown: true, title: 'هنرمند' }} />
      </Stack>
      <MiniPlayer />
    </NavigationContainer>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Shell />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
