import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-constants', () => ({
  default: { expoConfig: { extra: { apiBase: 'https://ahangban.ir/wp-json' } } },
}));
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(async () => null),
  setItemAsync: vi.fn(async () => {}),
}));

import { fetchAppConfig } from './ahangban';

describe('fetchAppConfig fallback', () => {
  it('returns cached config when server is unreachable', async () => {
    const store = await import('expo-secure-store');
    vi.mocked(store.getItemAsync).mockResolvedValueOnce(
      JSON.stringify({ app_name: 'cached', enabled: true })
    );
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    const cfg = await fetchAppConfig();
    expect(cfg.app_name).toBe('cached');
    vi.unstubAllGlobals();
  });

  it('throws when no cache and server down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    await expect(fetchAppConfig()).rejects.toThrow('config unavailable');
    vi.unstubAllGlobals();
  });
});
