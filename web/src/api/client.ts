import type {
  DeleteResult, DiscoverDetails, DiscoverKind, DiscoverPage, DiscoverSeasonDto, CalendarEntry, PersonDto, DiscoveryState, Genre, Ratings, WantedEntry, DownloadServerResult, LibraryDto, MediaServer, MetadataCandidate, NewsItem, PairingCode, PairingState, ScanResult, SeedboxListing,
  ServiceStatus, SettingsDto, SubtitleResult, SubtitleSearch, TestResult, TitleDetailDto, TitleDto, TransfersState,
} from './types';

/** Error raised for non-2xx responses; message is the service's user-facing text. */
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

const base = '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(base + path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('The Seedbox Sync service is not responding. Check that it is running.', 0);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? safeJson(text) : undefined;
  if (!res.ok) {
    const msg = (data && typeof data === 'object' && 'message' in data && (data as { message: string }).message) || `Request failed (${res.status}).`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const q = (v: string) => encodeURIComponent(v);

export const api = {
  status: () => request<ServiceStatus>('GET', '/status'),
  restartService: () => request<{ message: string }>('POST', '/service/restart'),

  settings: () => request<SettingsDto>('GET', '/settings'),
  saveSettings: (s: SettingsDto) => request<SettingsDto>('PUT', '/settings', s),
  testSettings: (s: SettingsDto) => request<TestResult>('POST', '/settings/test', s),

  seedbox: () => request<SeedboxListing>('GET', '/seedbox'),
  refreshSeedbox: () => request<SeedboxListing>('POST', '/seedbox/refresh'),
  download: (paths: string[], servers: string[]) => request<DownloadServerResult[]>('POST', '/seedbox/download', { paths, servers }),
  deleteFromSeedbox: (paths: string[]) => request<DeleteResult>('POST', '/seedbox/delete', { paths }),

  transfers: () => request<TransfersState>('GET', '/transfers'),
  pauseTransfers: (paused: boolean) => request<TransfersState>('POST', '/transfers/pause', { paused }),
  cancelTransfer: (id: string) => request<void>('POST', `/transfers/${q(id)}/cancel`),
  retryTransfer: (id: string) => request<void>('POST', `/transfers/${q(id)}/retry`),
  clearTransfers: () => request<{ cleared: number }>('POST', '/transfers/clear'),

  servers: () => request<MediaServer[]>('GET', '/servers'),
  updateServer: (id: string, body: { name?: string; libraryRoot?: string }) => request<MediaServer>('PUT', `/servers/${q(id)}`, body),
  removeServer: (id: string) => request<void>('DELETE', `/servers/${q(id)}`),
  discovered: () => request<DiscoveryState>('GET', '/servers/discovered'),
  discoverPeers: () => request<void>('POST', '/servers/discover'),
  pairServer: (address: string, code: string) => request<MediaServer>('POST', '/servers/pair', { address, code }),

  pairing: () => request<PairingState>('GET', '/pairing'),
  startPairing: () => request<PairingCode>('POST', '/pairing/code'),
  stopPairing: () => request<void>('DELETE', '/pairing/code'),
  removeManager: (id: string) => request<void>('DELETE', `/pairing/managers/${q(id)}`),

  library: (server: string) => request<LibraryDto>('GET', `/library/${q(server)}`),
  scanLibrary: (server: string) => request<ScanResult>('POST', `/library/${q(server)}/scan`),
  title: (server: string, key: string) => request<TitleDetailDto>('GET', `/library/${q(server)}/title?key=${q(key)}`),
  applyMatch: (server: string, key: string, provider: string, id: string) =>
    request<TitleDto>('POST', `/library/${q(server)}/match`, { key, provider, id }),
  refreshMetadata: (server: string, key: string) => request<TitleDto>('POST', `/library/${q(server)}/refresh`, { key }),
  fetchSubtitles: (server: string, key: string, episodePath?: string) =>
    request<SubtitleResult>('POST', `/library/${q(server)}/subtitles`, { key, episodePath: episodePath ?? null }),
  /** A movie's file, or a series' next episode, in the default player. */
  playTitle: (server: string, key: string) => request<{ path: string }>('POST', `/library/${q(server)}/play`, { key }),
  setWatched: (server: string, key: string, paths: string[], watched: boolean) =>
    request<void>('POST', `/library/${q(server)}/watched`, { key, paths, watched }),
  news: () => request<NewsItem[]>('GET', '/news'),
  ratings: (server: string, key: string) => request<{ available: boolean; ratings: Ratings | null }>('GET', `/library/${q(server)}/ratings?key=${q(key)}`),

  discover: (p: { kind: DiscoverKind; list?: string; genre?: number | null; year?: number | null; minRating?: number | null; sort?: string | null; page?: number; q?: string }) => {
    const qs = new URLSearchParams({ kind: p.kind, page: String(p.page ?? 1) });
    if (p.q) qs.set('q', p.q);
    else {
      qs.set('list', p.list ?? 'trending');
      if (p.genre) qs.set('genre', String(p.genre));
      if (p.year) qs.set('year', String(p.year));
      if (p.minRating) qs.set('minRating', String(p.minRating));
      if (p.sort) qs.set('sort', p.sort);
    }
    return request<DiscoverPage>('GET', `/discover?${qs}`);
  },
  genres: (kind: DiscoverKind) => request<Genre[]>('GET', `/discover/genres?kind=${kind}`),
  discoverDetails: (kind: DiscoverKind, id: string) => request<DiscoverDetails>('GET', `/discover/${kind}/${q(id)}`),
  libraryTmdb: (server: string, key: string) => request<{ kind: DiscoverKind | null; id: string | null }>('GET', `/library/${q(server)}/tmdb?key=${q(key)}`),
  discoverPerson: (id: string) => request<PersonDto>('GET', `/discover/person/${q(id)}`),
  discoverSeason: (id: string, season: number) => request<DiscoverSeasonDto>('GET', `/discover/tv/${q(id)}/season/${season}`),
  wanted: () => request<WantedEntry[]>('GET', '/wanted'),
  addWanted: (i: {
    kind: DiscoverKind; tmdbId: string; title: string; year: number | null; posterUrl: string | null;
    season?: number; episode?: number; episodeTitle?: string; serverId?: string; titleKey?: string;
  }) => request<void>('POST', '/wanted', i),
  calendar: (server: string, from: string, to: string) => request<CalendarEntry[]>('GET', `/library/${q(server)}/calendar?from=${from}&to=${to}`),
  removeWantedId: (id: string) => request<void>('DELETE', `/wanted?id=${q(id)}`),
  removeWanted: (kind: DiscoverKind, id: string) => request<void>('DELETE', `/wanted/${kind}/${q(id)}`),
  searchSubtitles: (server: string, key: string, episodePath: string | null, language: string | null) =>
    request<SubtitleSearch>('POST', `/library/${q(server)}/subtitles/search`, { key, episodePath, language }),
  downloadSubtitle: (server: string, key: string, episodePath: string | null, fileId: number, language: string) =>
    request<{ path: string }>('POST', `/library/${q(server)}/subtitles/download`, { key, episodePath, fileId, language }),
  searchMetadata: (provider: string, kind: 'movie' | 'tv', query: string, year?: number | null) =>
    request<MetadataCandidate[]>('GET', `/metadata/search?provider=${q(provider)}&kind=${kind}&q=${q(query)}${year ? `&year=${year}` : ''}`),
  openExternal: (server: string, path: string) => request<void>('POST', `/media/${q(server)}/open`, { path }),

  artworkUrl: (server: string, key: string, kind: 'poster' | 'fanart', version?: string | number) =>
    `${base}/library/${q(server)}/artwork?key=${q(key)}&kind=${kind}${version ? `&v=${q(String(version))}` : ''}`,
  /** The file as is, with HTTP range support (for a TV app or a network player such as VLC). */
  streamUrl: (server: string, path: string) => `${base}/media/${q(server)}/stream?path=${q(path)}`,
};
