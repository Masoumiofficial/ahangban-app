import Constants from 'expo-constants';
import type { Paginated, Song, WpPost, WpSinger } from './types';

const API_BASE: string =
  (Constants.expoConfig?.extra?.apiBase as string) ?? 'https://ahangban.ir/wp-json';

export const SITE_URL = 'https://ahangban.ir';

function decodeHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&‌/g, '‌')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function pickCover(post: WpPost): string {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return '';
  return (
    media.media_details?.sizes?.['medium_large']?.source_url ??
    media.media_details?.sizes?.['medium']?.source_url ??
    media.source_url
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export function postToSong(post: WpPost, singerName = '', singerSlug = ''): Song {
  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtml(post.title.rendered),
    artist: singerName,
    artistSlug: singerSlug,
    cover: pickCover(post),
    link: post.link,
    date: post.date,
    views: post.views,
  };
}

async function fetchSingersMap(ids: number[]): Promise<Map<number, WpSinger>> {
  const map = new Map<number, WpSinger>();
  const unique = [...new Set(ids)].filter((id) => id > 0);
  await Promise.all(
    unique.map(async (id) => {
      try {
        const s = await fetchJson<WpSinger>(`${API_BASE}/wp/v2/singer/${id}`);
        map.set(id, s);
      } catch {
        /* ignore */
      }
    })
  );
  return map;
}

async function fetchPosts(params: Record<string, string>, withSingers = true): Promise<{ posts: WpPost[]; total: number; totalPages: number }> {
  const search = new URLSearchParams({ per_page: '20', _embed: 'wp:featuredmedia', ...params });
  const url = `${API_BASE}/wp/v2/posts?${search.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const posts = (await res.json()) as WpPost[];
  const total = Number(res.headers.get('X-WP-Total') ?? posts.length);
  const totalPages = Number(res.headers.get('X-WP-TotalPages') ?? 1);
  return { posts, total, totalPages };
}

export async function fetchLatestSongs(page = 1): Promise<Paginated<Song>> {
  const { posts, total, totalPages } = await fetchPosts({ page: String(page), orderby: 'date', order: 'desc' });
  const singers = await fetchSingersMap(posts.flatMap((p) => p.singer ?? []));
  return {
    items: posts.map((p) => {
      const s = p.singer?.[0] ? singers.get(p.singer[0]) : undefined;
      return postToSong(p, s?.name ?? '', s?.slug ?? '');
    }),
    total,
    totalPages,
  };
}

export async function fetchPopularSongs(page = 1): Promise<Paginated<Song>> {
  const { posts, total, totalPages } = await fetchPosts({ page: String(page), orderby: 'meta_value_num', order: 'desc', meta_key: 'views' });
  const singers = await fetchSingersMap(posts.flatMap((p) => p.singer ?? []));
  return {
    items: posts.map((p) => {
      const s = p.singer?.[0] ? singers.get(p.singer[0]) : undefined;
      return postToSong(p, s?.name ?? '', s?.slug ?? '');
    }),
    total,
    totalPages,
  };
}

export async function searchSongs(q: string, page = 1): Promise<Paginated<Song>> {
  const { posts, total, totalPages } = await fetchPosts({ search: q, page: String(page) });
  const singers = await fetchSingersMap(posts.flatMap((p) => p.singer ?? []));
  return {
    items: posts.map((p) => {
      const s = p.singer?.[0] ? singers.get(p.singer[0]) : undefined;
      return postToSong(p, s?.name ?? '', s?.slug ?? '');
    }),
    total,
    totalPages,
  };
}

export async function fetchSongBySlug(slug: string): Promise<Song | null> {
  const posts = await fetchJson<WpPost[]>(
    `${API_BASE}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia`
  );
  const post = posts[0];
  if (!post) return null;
  const singers = await fetchSingersMap(post.singer ?? []);
  const s = post.singer?.[0] ? singers.get(post.singer[0]) : undefined;
  const song = postToSong(post, s?.name ?? '', s?.slug ?? '');
  // MVP fallback: extract audio URLs + lyrics from the public HTML page (isolated layer, temporary)
  try {
    const html = await (await fetch(post.link)).text();
    const audio = extractAudioUrls(html);
    song.audio128 = audio['128'];
    song.audio320 = audio['320'];
    song.audioUrl = audio['320'] ?? audio['128'];
    song.lyrics = extractLyrics(html);
  } catch {
    /* page parse is best-effort in MVP */
  }
  return song;
}

export function extractAudioUrls(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /https:\/\/dl\.ahangban\.ir\/[^"'\s]+?(?:%5B|\[)(\d{3})(?:%5D|\])\.mp3/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out[m[1]] = m[0];
  }
  return out;
}

export function extractLyrics(html: string): string | undefined {
  const m = html.match(/متن آهنگ[\s\S]{0,200}?<\/h[23]>|<div[^>]*class="[^"]*lyrics[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (!m) return undefined;
  const block = m[0];
  const text = decodeHtml(block);
  return text.length > 20 ? text : undefined;
}

export async function fetchSingers(perPage = 50): Promise<WpSinger[]> {
  return fetchJson<WpSinger[]>(`${API_BASE}/wp/v2/singer?per_page=${perPage}&orderby=count&order=desc&_fields=id,name,slug,count`);
}

export async function fetchSingerBySlug(slug: string): Promise<WpSinger | null> {
  const arr = await fetchJson<WpSinger[]>(`${API_BASE}/wp/v2/singer?slug=${encodeURIComponent(slug)}`);
  return arr[0] ?? null;
}

export async function fetchSongsBySinger(singerId: number, page = 1): Promise<Paginated<Song>> {
  const { posts, total, totalPages } = await fetchPosts({ singer: String(singerId), page: String(page) });
  const singers = await fetchSingersMap(posts.flatMap((p) => p.singer ?? []));
  return {
    items: posts.map((p) => {
      const s = p.singer?.[0] ? singers.get(p.singer[0]) : undefined;
      return postToSong(p, s?.name ?? '', s?.slug ?? '');
    }),
    total,
    totalPages,
  };
}

export { API_BASE };
