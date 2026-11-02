import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { apiBase: 'https://ahangban.ir/wp-json' } } },
}));

import { extractAudioUrls, postToSong } from './wp';
import type { WpPost } from './types';

describe('extractAudioUrls', () => {
  it('extracts 128 and 320 quality URLs from song page HTML', () => {
    const html = `
      <a class="dl_link_128" href="https://dl.ahangban.ir/music/s/salar-darabi/Salar%20Darabi%20-%20Man%20%5B128%5D.mp3">128</a>
      <a href="https://dl.ahangban.ir/music/s/salar-darabi/Salar%20Darabi%20-%20Man%20%5B320%5D.mp3">320</a>`;
    const urls = extractAudioUrls(html);
    expect(urls['128']).toContain('%5B128%5D.mp3');
    expect(urls['320']).toContain('%5B320%5D.mp3');
  });

  it('returns empty object when no download links exist', () => {
    expect(extractAudioUrls('<p>nothing</p>')).toEqual({});
  });
});

describe('postToSong', () => {
  it('maps a WP post to a Song and strips HTML from the title', () => {
    const post: WpPost = {
      id: 1,
      slug: 'test-song',
      link: 'https://ahangban.ir/test-song/',
      date: '2026-11-01',
      title: { rendered: 'آهنگ <b>تست</b>' },
      featured_media: 0,
      singer: [5],
      _embedded: {
        'wp:featuredmedia': [
          { id: 9, source_url: 'https://ahangban.ir/full.webp', media_details: { sizes: { medium: { source_url: 'https://ahangban.ir/med.webp' } } } },
        ],
      },
    };
    const song = postToSong(post, 'خواننده', 'singer-slug');
    expect(song.title).toBe('آهنگ تست');
    expect(song.artist).toBe('خواننده');
    expect(song.cover).toBe('https://ahangban.ir/med.webp');
  });
});
