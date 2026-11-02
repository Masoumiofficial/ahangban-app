import React from 'react';
import { Tabs } from 'expo-router';
import { useThemeColors } from '../../src/theme/ThemeContext';

export default function TabsLayout() {
  const c = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.brand,
        tabBarInactiveTintColor: c.textSecondary,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.text,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'خانه', tabBarIcon: () => null }} />
      <Tabs.Screen name="search" options={{ title: 'جست‌وجو', tabBarIcon: () => null }} />
      <Tabs.Screen name="radio" options={{ title: 'رادیو', tabBarIcon: () => null }} />
      <Tabs.Screen name="library" options={{ title: 'کتابخانه', tabBarIcon: () => null }} />
    </Tabs>
  );
}
