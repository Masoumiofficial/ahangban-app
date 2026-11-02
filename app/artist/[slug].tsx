import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchSingerBySlug, fetchSongsBySinger } from '../../src/api/wp';
import { SongCard } from '../../src/components/SongCard';
import { LoadingState, ErrorState, EmptyState } from '../../src/components/States';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { usePlayerStore } from '../../src/store/player';
import { playQueue } from '../../src/player/trackPlayer';

export default function ArtistScreen() {
  const c = useThemeColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const playQueueStore = usePlayerStore((s) => s.playQueue);
  const singer = useQuery({ queryKey: ['singer', slug], queryFn: () => fetchSingerBySlug(slug) });
  const songs = useQuery({
    queryKey: ['singerSongs', singer.data?.id],
    queryFn: () => fetchSongsBySinger(singer.data!.id),
    enabled: !!singer.data,
  });

  if (singer.isLoading || (singer.data && songs.isLoading)) return <LoadingState />;
  if (singer.error || !singer.data) return <ErrorState message="هنرمند یافت نشد" onRetry={() => singer.refetch()} />;

  const items = songs.data?.items ?? [];
  const startArtistRadio = () => {
    if (items.length === 0) return;
    playQueueStore(items, 0);
    void playQueue(items, 0);
  };

  return (
    <FlatList
      style={{ backgroundColor: c.background }}
      data={items}
      keyExtractor={(s) => String(s.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.name, { color: c.text }]}>{singer.data.name}</Text>
          <Text style={[styles.count, { color: c.textSecondary }]}>{items.length} اثر</Text>
          <Text
            style={[styles.radio, { color: c.brand }]}
            onPress={startArtistRadio}
          >
            ▶ رادیوی اختصاصی {singer.data.name}
          </Text>
        </View>
      }
      ListEmptyComponent={<EmptyState label="اثری برای این هنرمند یافت نشد" />}
      renderItem={({ item }) => <SongCard song={item} queue={items} />}
      contentContainerStyle={{ paddingBottom: 90 }}
    />
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', padding: 20, gap: 6 },
  name: { fontSize: 22, fontWeight: '800' },
  count: { fontSize: 14 },
  radio: { fontSize: 15, fontWeight: '700', marginTop: 8 },
});
