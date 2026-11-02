import { beforeEach, describe, expect, it } from 'vitest';
import { usePlayerStore } from './player';
import type { Song } from '../api/types';

const song = (id: number): Song => ({
  id, slug: `s${id}`, title: `t${id}`, artist: 'a', artistSlug: 'a', cover: '', link: `https://ahangban.ir/s${id}/`, date: '',
});

beforeEach(() => {
  usePlayerStore.setState({ queue: [], currentIndex: -1, isPlaying: false });
});

describe('player store queue', () => {
  it('playQueue sets queue and clamps index', () => {
    usePlayerStore.getState().playQueue([song(1), song(2), song(3)], 5);
    expect(usePlayerStore.getState().current()?.id).toBe(3);
    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it('next/previous respect queue bounds (radio scope preserved)', () => {
    usePlayerStore.getState().playQueue([song(1), song(2)], 0);
    usePlayerStore.getState().previous();
    expect(usePlayerStore.getState().currentIndex).toBe(0);
    usePlayerStore.getState().next();
    expect(usePlayerStore.getState().current()?.id).toBe(2);
    usePlayerStore.getState().next();
    expect(usePlayerStore.getState().currentIndex).toBe(1);
  });
});
