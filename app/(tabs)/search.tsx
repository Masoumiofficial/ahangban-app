import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { searchSongs } from '../../src/api/wp';
import { SongCard } from '../../src/components/SongCard';
import { LoadingState, ErrorState, EmptyState } from '../../src/components/States';
import { useThemeColors } from '../../src/theme/ThemeContext';

export default function SearchScreen() {
  const c = useThemeColors();
  const [input, setInput] = useState('');
  const [debounced, setDebounced] = useState('');

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), 450);
    return () => clearTimeout(t);
  }, [input]);

  const query = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => searchSongs(debounced),
    enabled: debounced.length > 0,
  });

  const songs = useMemo(() => query.data?.items ?? [], [query.data]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TextInput
        style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]}
        placeholder="جست‌وجوی آهنگ، خواننده…"
        placeholderTextColor={c.textSecondary}
        value={input}
        onChangeText={setInput}
        autoCorrect={false}
      />
      {debounced.length === 0 ? (
        <EmptyState label="نام آهنگ یا خواننده را وارد کنید" />
      ) : query.isLoading ? (
        <LoadingState label="در حال جست‌وجو…" />
      ) : query.error ? (
        <ErrorState message="خطا در جست‌وجو" onRetry={() => query.refetch()} />
      ) : songs.length === 0 ? (
        <EmptyState label="نتیجه‌ای یافت نشد" />
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(s) => String(s.id)}
          renderItem={({ item }) => <SongCard song={item} queue={songs} />}
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: { margin: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, fontSize: 15, textAlign: 'right' },
});
