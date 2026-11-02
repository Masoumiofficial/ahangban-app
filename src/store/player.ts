import { create } from 'zustand';
import type { Song } from '../api/types';

interface PlayerState {
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  /** replaces the whole queue and plays from index (single source of truth for playback) */
  playQueue: (songs: Song[], index: number) => void;
  playSong: (song: Song) => void;
  next: () => void;
  previous: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentIndex: (index: number) => void;
  current: () => Song | undefined;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  playQueue: (songs, index) =>
    set({ queue: songs, currentIndex: Math.min(Math.max(index, 0), songs.length - 1), isPlaying: true }),
  playSong: (song) => set({ queue: [song], currentIndex: 0, isPlaying: true }),
  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) set({ currentIndex: currentIndex + 1, isPlaying: true });
  },
  previous: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) set({ currentIndex: currentIndex - 1, isPlaying: true });
  },
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  current: () => {
    const { queue, currentIndex } = get();
    return currentIndex >= 0 ? queue[currentIndex] : undefined;
  },
}));
