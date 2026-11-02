import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { usePlayerStore } from '../../src/store/player';
import { SongCard } from '../../src/components/SongCard';

export default function LibraryScreen() {
  const c = useThemeColors();
  const queue = usePlayerStore((s) => s.queue);
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Text style={[styles.title, { color: c.text }]}>صف پخش فعلی</Text>
      {queue.length === 0 ? (
        <Text style={[styles.empty, { color: c.textSecondary }]}>هنوز آهنگی پخش نشده است</Text>
      ) : (
        queue.map((s) => <SongCard key={s.id} song={s} queue={queue} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16 },
  title: { fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginBottom: 8 },
  empty: { textAlign: 'center', marginTop: 40 },
});
