import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestSongs, fetchPopularSongs } from '../../src/api/wp';
import type { Song } from '../../src/api/types';
import { SongCard } from '../../src/components/SongCard';
import { LoadingState, ErrorState } from '../../src/components/States';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { usePlayerStore } from '../../src/store/player';
import { playQueue } from '../../src/player/trackPlayer';

type Source = 'latest' | 'popular';

export default function RadioScreen() {
  const c = useThemeColors();
  const [source, setSource] = useState<Source>('latest');
  const latest = useQuery({ queryKey: ['latest'], queryFn: () => fetchLatestSongs(1) });
  const popular = useQuery({ queryKey: ['popular'], queryFn: () => fetchPopularSongs(1) });
  const playQueueStore = usePlayerStore((s) => s.playQueue);

  const songs = source === 'latest' ? latest.data?.items ?? [] : popular.data?.items ?? [];
  const loading = latest.isLoading || popular.isLoading;
  const error = latest.error || popular.error;

  const startRadio = () => {
    if (songs.length === 0) return;
    playQueueStore(songs, 0);
    void playQueue(songs, 0);
  };

  if (loading) return <LoadingState label="در حال آماده‌سازی رادیو…" />;
  if (error) return <ErrorState message="خطا در دریافت صف رادیو" />;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.controls}>
        {(['latest', 'popular'] as Source[]).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSource(s)}
            style={[styles.chip, { backgroundColor: source === s ? c.brand : c.surface, borderColor: c.border }]}
          >
            <Text style={{ color: source === s ? '#fff' : c.text }}>{s === 'latest' ? 'جدیدترین' : 'پربازدیدترین'}</Text>
          </Pressable>
        ))}
        <Pressable onPress={startRadio} style={[styles.playBtn, { backgroundColor: c.brand }]}>
          <Text style={styles.playBtnText}>پخش رادیو ▶</Text>
        </Pressable>
      </View>
      <FlatList
        data={songs}
        keyExtractor={(x: Song) => String(x.id)}
        renderItem={({ item }) => <SongCard song={item} queue={songs} />}
        contentContainerStyle={{ paddingBottom: 90 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  playBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24 },
  playBtnText: { color: '#fff', fontWeight: '700' },
});
