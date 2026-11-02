import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import type { Song } from './types';

const API_BASE: string =
  (Constants.expoConfig?.extra?.apiBase as string) ?? 'https://ahangban.ir/wp-json';

export interface AppConfig {
  app_name: string;
  logo: { light: string; dark: string };
  brand_color: string;
  enabled: boolean;
  maintenance: boolean;
  maintenance_message: string;
  min_versions: { android: string; ios: string };
  home_sections: string[];
  radio_source: string;
  feature_flags: Record<string, boolean>;
  notifications: { title: string; body: string; link: string }[];
}

const CONFIG_CACHE_KEY = 'ahangban_v2_config_cache';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/**
 * alltid ابتدا serveur؛ در صورت قطع ارتباط، آخرین تنظیمات معتبر کش‌شده برگردانده می‌شود.
 */
export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const config = await fetchJson<AppConfig>(`${API_BASE}/ahangban/v2/config`);
    await SecureStore.setItemAsync(CONFIG_CACHE_KEY, JSON.stringify(config)).catch(() => {});
    return config;
  } catch {
    const cached = await SecureStore.getItemAsync(CONFIG_CACHE_KEY).catch(() => null);
    if (cached) return JSON.parse(cached) as AppConfig;
    throw new Error('config unavailable');
  }
}

export async function fetchHome(): Promise<{ sections: { key: string; title: string; items: Song[] }[] }> {
  return fetchJson(`${API_BASE}/ahangban/v2/home`);
}

export async function fetchRadio(source?: 'latest' | 'popular' | 'random'): Promise<{ source: string; items: Song[] }> {
  const q = source ? `?source=${source}` : '';
  return fetchJson(`${API_BASE}/ahangban/v2/radio${q}`);
}

export async function fetchArtistRadio(slug: string): Promise<{ artist: { id: number; name: string; slug: string }; items: Song[] }> {
  return fetchJson(`${API_BASE}/ahangban/v2/radio/artist/${encodeURIComponent(slug)}`);
}

export async function fetchSongV2(id: number): Promise<Song> {
  return fetchJson(`${API_BASE}/ahangban/v2/songs/${id}`);
}
