import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestSongs, fetchPopularSongs, fetchSingers } from '../../src/api/wp';
import { SongCard } from '../../src/components/SongCard';
import { LoadingState, ErrorState, EmptyState } from '../../src/components/States';
import { useThemeColors } from '../../src/theme/ThemeContext';

export default function HomeScreen() {
  const c = useThemeColors();
  const latest = useQuery({ queryKey: ['latest'], queryFn: () => fetchLatestSongs(1) });
  const popular = useQuery({ queryKey: ['popular'], queryFn: () => fetchPopularSongs(1) });
  const singers = useQuery({ queryKey: ['singers'], queryFn: () => fetchSingers(12) });

  const loading = latest.isLoading || popular.isLoading;
  const error = latest.error || popular.error;

  const sections = [
    { key: 'latest', title: 'جدیدترین آهنگ‌ها', data: latest.data?.items ?? [] },
    { key: 'popular', title: 'پربازدیدترین‌ها', data: popular.data?.items ?? [] },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message="خطا در دریافت اطلاعات" onRetry={() => { latest.refetch(); popular.refetch(); }} />;

  return (
    <FlatList
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => { latest.refetch(); popular.refetch(); singers.refetch(); }} />}
      ListHeaderComponent={
        <View>
          <Text style={[styles.heading, { color: c.text }]}>آهنگ بان</Text>
          {singers.data && singers.data.length > 0 && (
            <View style={styles.singersRow}>
              {singers.data.slice(0, 8).map((s) => (
                <Text key={s.id} style={[styles.singerChip, { color: c.brand, borderColor: c.border }]}>
                  {s.name}
                </Text>
              ))}
            </View>
          )}
        </View>
      }
      data={sections}
      keyExtractor={(s) => s.key}
      renderItem={({ item }) => (
        <View>
          <Text style={[styles.sectionTitle, { color: c.text }]}>{item.title}</Text>
          {item.data.length === 0 ? (
            <EmptyState label="آهنگی یافت نشد" />
          ) : (
            item.data.slice(0, 10).map((song) => <SongCard key={song.id} song={song} queue={item.data} />)
          )}
        </View>
      )}
      ListFooterComponent={<View style={{ height: 90 }} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 12 },
  heading: { fontSize: 24, fontWeight: '800', marginHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginTop: 14, marginBottom: 4 },
  singersRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 4 },
  singerChip: { fontSize: 12, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
});
