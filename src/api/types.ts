export interface WpImageSize {
  source_url: string;
}

export interface WpMedia {
  id: number;
  source_url: string;
  media_details?: {
    sizes?: Record<string, WpImageSize>;
  };
}

export interface WpSinger {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

export interface WpPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  featured_media: number;
  singer?: number[];
  categories?: number[];
  views?: number;
  _embedded?: {
    'wp:featuredmedia'?: WpMedia[];
  };
}

export interface Song {
  id: number;
  slug: string;
  title: string;
  artist: string;
  artistSlug: string;
  cover: string;
  link: string;
  date: string;
  views?: number;
  /** extracted from page HTML in MVP; will come from ahangban/v2 */
  audioUrl?: string;
  audio128?: string;
  audio320?: string;
  lyrics?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  totalPages: number;
}
