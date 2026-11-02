import React from 'react';
import { Image, ScrollView, Share, StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchSongBySlug } from '../../src/api/wp';
import { LoadingState, ErrorState } from '../../src/components/States';
import { useThemeColors } from '../../src/theme/ThemeContext';
import { usePlayerStore } from '../../src/store/player';
import { playSongNow } from '../../src/player/trackPlayer';

export default function SongScreen() {
  const c = useThemeColors();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const playSongStore = usePlayerStore((s) => s.playSong);
  const query = useQuery({ queryKey: ['song', slug], queryFn: () => fetchSongBySlug(slug) });

  if (query.isLoading) return <LoadingState />;
  if (query.error || !query.data) return <ErrorState message="آهنگ یافت نشد" onRetry={() => query.refetch()} />;

  const song = query.data;
  const play = () => {
    playSongStore(song);
    void playSongNow(song);
  };

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      {song.cover ? <Image source={{ uri: song.cover }} style={styles.cover} /> : null}
      <Text style={[styles.title, { color: c.text }]}>{song.title}</Text>
      {song.artist ? (
        <Text style={[styles.artist, { color: c.textSecondary }]}>{song.artist}</Text>
      ) : null}
      <View style={styles.actions}>
        <Pressable onPress={play} style={[styles.btn, { backgroundColor: c.brand }]} disabled={!song.audioUrl}>
          <Text style={styles.btnText}>{song.audioUrl ? 'پخش آنلاین ▶' : 'فایل صوتی در دسترس نیست'}</Text>
        </Pressable>
        <Pressable
          onPress={() => void Share.share({ url: song.link, message: `${song.title} — ${song.artist}` })}
          style={[styles.btn, { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }]}
        >
          <Text style={[styles.btnText, { color: c.text }]}>اشتراک‌گذاری</Text>
        </Pressable>
      </View>
      {song.audio128 && <Text style={[styles.dl, { color: c.textSecondary }]}>دانلود 128: {song.audio128}</Text>}
      {song.audio320 && <Text style={[styles.dl, { color: c.textSecondary }]}>دانلود 320: {song.audio320}</Text>}
      {song.lyrics ? (
        <View style={[styles.lyricsBox, { backgroundColor: c.surface }]}>
          <Text style={[styles.lyricsTitle, { color: c.text }]}>متن ترانه</Text>
          <Text style={[styles.lyrics, { color: c.textSecondary }]}>{song.lyrics}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20, paddingBottom: 120 },
  cover: { width: 220, height: 220, borderRadius: 18, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800' },
  artist: { fontSize: 15, marginTop: 4 },
  actions: { flexDirection: 'row-reverse', gap: 10, marginTop: 18 },
  btn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '700' },
  dl: { fontSize: 11, marginTop: 8, textAlign: 'center' },
  lyricsBox: { alignSelf: 'stretch', borderRadius: 14, padding: 14, marginTop: 20 },
  lyricsTitle: { fontWeight: '700', marginBottom: 6 },
  lyrics: { fontSize: 14, lineHeight: 24, textAlign: 'right' },
});
