import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Song } from '../api/types';
import { useThemeColors } from '../theme/ThemeContext';
import { usePlayerStore } from '../store/player';
import { playQueue } from '../player/trackPlayer';

export function SongCard({ song, queue }: { song: Song; queue?: Song[] }) {
  const c = useThemeColors();
  const router = useRouter();
  const playQueueStore = usePlayerStore((s) => s.playQueue);

  const onPlay = () => {
    const q = queue && queue.length > 0 ? queue : [song];
    const idx = q.findIndex((s) => s.id === song.id);
    playQueueStore(q, idx >= 0 ? idx : 0);
    void playQueue(q, idx >= 0 ? idx : 0);
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: c.surface }]}
      onPress={() => router.push(`/song/${song.slug}`)}
    >
      {song.cover ? (
        <Image source={{ uri: song.cover }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, { backgroundColor: c.border }]} />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {song.title}
        </Text>
        {!!song.artist && (
          <Text style={[styles.artist, { color: c.textSecondary }]} numberOfLines={1}>
            {song.artist}
          </Text>
        )}
      </View>
      <Pressable onPress={onPlay} hitSlop={8} style={[styles.play, { backgroundColor: c.brand }]}>
        <Text style={styles.playText}>▶</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 14, padding: 10, marginHorizontal: 16, marginVertical: 6, gap: 12 },
  cover: { width: 56, height: 56, borderRadius: 10 },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  artist: { fontSize: 13 },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  playText: { color: '#fff', fontSize: 14 },
});
