import { api } from './api';

/** Curated royalty-free demo tracks for invite background music. */

export type MusicTrack = {
  id: string;
  name: string;
  mood: string;
  /** Absolute URL — must work on the invite host, not only the landing origin. */
  url: string;
};

/**
 * Fallback when `/public/music-library` is empty or unreachable.
 * Prefer admin-managed tracks once seeded.
 */
export const DEFAULT_MUSIC_LIBRARY: MusicTrack[] = [
  {
    id: 'warm-melody',
    name: 'Giai điệu ấm áp',
    mood: 'Dịu dàng · piano',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'soft-evening',
    name: 'Chiều êm đềm',
    mood: 'Lãng mạn · chậm',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'garden-waltz',
    name: 'Vườn nhà mình',
    mood: 'Nhẹ nhàng · cổ điển',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'golden-hour',
    name: 'Giờ vàng',
    mood: 'Ấm áp · vui',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
  {
    id: 'quiet-promise',
    name: 'Lời hứa thầm',
    mood: 'Tối giản · sâu lắng',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
  },
  {
    id: 'together',
    name: 'Bên nhau',
    mood: 'Tươi sáng · hạnh phúc',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
  },
];

let cachedLibrary: MusicTrack[] | null = null;
let cacheAt = 0;
const CACHE_MS = 60_000;

function normalizeTrack(raw: unknown): MusicTrack | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const id = String(row.id || row.slug || '').trim();
  const name = String(row.name || '').trim();
  const url = String(row.url || '').trim();
  if (!id || !name || !url) return null;
  return {
    id,
    name,
    mood: String(row.mood || ''),
    url,
  };
}

/** Active catalog from Nest admin; falls back to built-in demos. */
export async function fetchMusicLibrary(force = false): Promise<MusicTrack[]> {
  if (!force && cachedLibrary && Date.now() - cacheAt < CACHE_MS) {
    return cachedLibrary;
  }
  try {
    const data = await api<MusicTrack[] | { data?: MusicTrack[] }>('/public/music-library', { auth: false });
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    const tracks = rows.map(normalizeTrack).filter((t): t is MusicTrack => Boolean(t));
    cachedLibrary = tracks.length ? tracks : DEFAULT_MUSIC_LIBRARY;
  } catch {
    cachedLibrary = DEFAULT_MUSIC_LIBRARY;
  }
  cacheAt = Date.now();
  return cachedLibrary;
}

export function matchMusicTrackId(url: string, library: MusicTrack[] = cachedLibrary || DEFAULT_MUSIC_LIBRARY): string | null {
  if (!url) return null;
  return library.find((t) => t.url === url)?.id ?? null;
}

export function musicTrackLabel(url: string, library: MusicTrack[] = cachedLibrary || DEFAULT_MUSIC_LIBRARY): string {
  const track = library.find((t) => t.url === url);
  if (track) return track.name;
  try {
    return decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'Bài hát');
  } catch {
    return 'Bài hát';
  }
}
