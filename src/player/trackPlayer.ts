import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  RepeatMode,
  State,
  Track,
} from 'react-native-track-player';
import { usePlayerStore } from '../store/player';
import type { Song } from '../api/types';

export async function setupPlayer(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  if (state.state === State.None) {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      notificationCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
  }
}

function toTrack(song: Song): Track {
  return {
    id: String(song.id),
    url: song.audioUrl ?? song.link,
    title: song.title,
    artist: song.artist,
    artwork: song.cover || undefined,
    duration: 0,
  };
}

/** Syncs the native queue with the zustand queue and starts playback. */
export async function playQueue(songs: Song[], index: number): Promise<void> {
  await TrackPlayer.reset();
  if (songs.length === 0) return;
  await TrackPlayer.add(songs.map(toTrack));
  await TrackPlayer.skip(Math.min(index, songs.length - 1));
  await TrackPlayer.play();
}

export async function playSongNow(song: Song): Promise<void> {
  await playQueue([song], 0);
}

export async function syncFromStore(): Promise<void> {
  const state0 = usePlayerStore.getState();
  const current = state0.current();
  if (!current) return;
  const isPlaying = state0.isPlaying;
  const state = await TrackPlayer.getPlaybackState();
  const track = await TrackPlayer.getActiveTrack();
  if (track?.id !== String(current.id)) {
    await playQueue(usePlayerStore.getState().queue, usePlayerStore.getState().currentIndex);
  } else if (isPlaying) {
    if (state.state !== State.Playing) await TrackPlayer.play();
  } else if (state.state === State.Playing) {
    await TrackPlayer.pause();
  }
}

let listenerRegistered = false;

export function registerPlayerEvents(): void {
  if (listenerRegistered) return;
  listenerRegistered = true;
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    usePlayerStore.getState().setPlaying(false);
  });
  TrackPlayer.addEventListener(Event.PlaybackState, (e) => {
    usePlayerStore.getState().setPlaying(e.state === State.Playing);
  });
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (e) => {
    if (e.track == null) return;
    const { queue, setCurrentIndex } = usePlayerStore.getState();
    const idx = queue.findIndex((s) => String(s.id) === String(e.track!.id));
    if (idx >= 0 && idx !== usePlayerStore.getState().currentIndex) setCurrentIndex(idx);
  });
  TrackPlayer.addEventListener(Event.RemoteNext, () => usePlayerStore.getState().next());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => usePlayerStore.getState().previous());
}
