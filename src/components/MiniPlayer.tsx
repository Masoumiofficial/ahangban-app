import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import TrackPlayer, { State } from 'react-native-track-player';
import { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/player';
import { useThemeColors } from '../theme/ThemeContext';

export function MiniPlayer() {
  const c = useThemeColors();
  const router = useRouter();
  const current = usePlayerStore((s) => s.current());
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!!current);
  }, [current?.id]);

  if (!visible || !current) return null;

  const toggle = async () => {
    const st = await TrackPlayer.getPlaybackState();
    if (st.state === State.Playing) await TrackPlayer.pause();
    else await TrackPlayer.play();
  };

  return (
    <Pressable
      style={[styles.bar, { backgroundColor: c.surface, borderColor: c.border }]}
      onPress={() => router.push(`/song/${current.slug}`)}
    >
      {current.cover ? (
        <Image source={{ uri: current.cover }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, { backgroundColor: c.border }]} />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {current.title}
        </Text>
        <Text style={[styles.artist, { color: c.textSecondary }]} numberOfLines={1}>
          {current.artist}
        </Text>
      </View>
      <Pressable onPress={toggle} style={[styles.btn, { backgroundColor: c.brand }]}>
        <Text style={styles.btnText}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row-reverse', alignItems: 'center', padding: 10, paddingBottom: 26, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  cover: { width: 44, height: 44, borderRadius: 8 },
  info: { flex: 1, gap: 1 },
  title: { fontSize: 14, fontWeight: '600' },
  artist: { fontSize: 12 },
  btn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff' },
});
