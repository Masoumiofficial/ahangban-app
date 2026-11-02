import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme/ThemeContext';

export function LoadingState({ label = 'در حال بارگذاری…' }: { label?: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.center}>
      <ActivityIndicator color={c.brand} size="large" />
      <Text style={[styles.text, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ label = 'چیزی aquí پیدا نشد' }: { label?: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.center}>
      <Text style={[styles.text, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.center}>
      <Text style={[styles.text, { color: c.error }]}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={[styles.button, { backgroundColor: c.brand }]}>
          <Text style={styles.buttonText}>تلاش مجدد</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  text: { fontSize: 15, textAlign: 'center' },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
