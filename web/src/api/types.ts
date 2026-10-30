// Shapes returned by the Seedbox Sync service (/api). Kept in one place so a future
// TV client (Tizen) can reuse the same contract.

export type Protocol = 'ftp' | 'ftps' | 'sftp';

export interface ServiceStatus {
  service: {
    name: string;
    version: string;
    isWindowsService: boolean;
    urls: string[];
    dataDirectory: string;
    machineName: string;
  };
  seedbox: {
    configured: boolean;
    connected: boolean;
    refreshing: boolean;
    error: string | null;
    refreshedUtc: string | null;
    protocol: Protocol;
    host: string;
    mediaRoot: string;
  };
}

export interface SeedboxEntry {
  path: string;
  dir: boolean;
  size: number;
  modified: string | null;
  /** Ids of media servers holding this file with the same size. */
  servers: string[];
}

export interface SeedboxListing {
  configured: boolean;
  connected: boolean;
  refreshing: boolean;
  error: string | null;
  mediaRoot: string;
  protocol: string;
  host: string;
  refreshedUtc: string | null;
  totalBytes: number | null;
  freeBytes: number | null;
  /** Quota override from Settings; wins over the disk size the server reports. */
  quotaBytes: number | null;
  entries: SeedboxEntry[];
}

export interface DownloadServerResult {
  serverId: string;
  serverName: string;
  files: number;
  bytes: number;
  alreadyThere: number;
  alreadyQueued: number;
}

export interface DeleteResult {
  deleted: number;
  freedBytes: number;
  files: number;
  onlyCopy: number;
  cancelledTransfers: number;
}

export type TransferStatus = 'queued' | 'active' | 'done' | 'failed';

export interface Transfer {
  id: string;
  serverId: string;
  path: string;
  size: number;
  remoteModifiedUtc: string | null;
  status: TransferStatus;
  transferred: number;
  bytesPerSecond: number;
  attempts: number;
  error: string | null;
  createdUtc: string;
  completedUtc: string | null;
  notBeforeUtc: string | null;
}

export interface TransfersState {
  paused: boolean;
  items: Transfer[];
}

export interface NodeStatus {
  online: boolean;
  libraryRoot: string;
  totalBytes: number | null;
  freeBytes: number | null;
  version: string;
  lastSeenUtc: string | null;
  error: string | null;
}

export interface MediaServer {
  id: string;
  name: string;
  kind: 'local' | 'remote';
  libraryRoot: string;
  address: string | null;
  status: NodeStatus;
}

/** Another PC running Seedbox Sync, heard on the LAN and not added yet. */
export interface DiscoveredPeer {
  instanceId: string;
  name: string;
  address: string;
  version: string;
  lastSeenUtc: string;
}

export interface DiscoveryState {
  enabled: boolean;
  peers: DiscoveredPeer[];
}

export interface PairingCode {
  code: string;
  expiresUtc: string;
}

/** A PC that has added this one. */
export interface PairedManager {
  id: string;
  name: string;
  pairedUtc: string;
  lastSeenUtc: string | null;
  lastAddress: string | null;
}

/** This PC as the one being added. */
export interface PairingState {
  enabled: boolean;
  port: number;
  name: string;
  addresses: string[];
  code: PairingCode | null;
  managers: PairedManager[];
}

export interface SettingsDto {
  seedbox: {
    protocol: Protocol;
    host: string;
    port: number;
    username: string;
    password: string | null;
    passwordSet: boolean;
    mediaRoot: string;
    quotaTb: number | null;
    acceptAnyCertificate: boolean;
    refreshMinutes: number;
  };
  transfers: { parallel: number };
  metadata: {
    tmdbApiKey: string | null;
    tmdbApiKeySet: boolean;
    tvdbApiKey: string | null;
    tvdbApiKeySet: boolean;
    openSubtitlesApiKey: string | null;
    openSubtitlesApiKeySet: boolean;
    openSubtitlesUsername: string;
    openSubtitlesPassword: string | null;
    openSubtitlesPasswordSet: boolean;
    subtitleLanguages: string;
    writeSidecars: boolean;
    omdbApiKey: string | null;
    omdbApiKeySet: boolean;
    tvProvider: 'auto' | 'tmdb' | 'tvdb';
  };
}

export interface TestResult {
  ok: boolean;
  message: string;
}

export type MediaKind = 'movie' | 'tv' | 'audiobook';
export type MatchStatus = 'matched' | 'review' | 'unmatched';

export interface MatchDto {
  provider: string;
  providerId: string | null;
  title: string | null;
  year: number | null;
  credit: string | null;
  status: MatchStatus;
  confidence: number;
  note: string | null;
  overview: string | null;
  runtimeMinutes: number | null;
}

export interface TitleDto {
  key: string;
  name: string;
  kind: MediaKind;
  category: string;
  displayTitle: string;
  year: number | null;
  size: number;
  have: number;
  total: number;
  onSeedbox: boolean;
  match: MatchDto;
  hasPoster: boolean;
  hasBackdrop: boolean;
  mainFile: string | null;
  subtitles: string[];
  seasons: number | null;
  episodes: number | null;
  /** Newest media file's date (when it arrived on the seedbox). */
  addedUtc: string | null;
  lastPlayedUtc: string | null;
  /** Series: the episode after the last one played. */
  upNext: EpisodeRef | null;
  /** Series: released after the newest episode you have. */
  newEpisodes: EpisodeRef[] | null;
  /** Series: released episodes older than your newest that are not here. */
  missing: number;
  /** Series: "S04E06 · 2026-11-06". */
  nextAirs: string | null;
  collectionId: string | null;
  collection: string | null;
  /** Movies: keys of other titles matched to the same movie. */
  duplicates: string[] | null;
}

export interface EpisodeRef {
  key: string;
  path: string | null;
  season: number;
  episode: number;
  title: string;
  available: boolean;
  onSeedbox: boolean;
  seedboxPath: string | null;
  aired: string | null;
}

export interface NewsItem {
  serverId: string;
  serverName: string;
  titleKey: string;
  title: string;
  episode: EpisodeRef;
}

export interface LibraryDto {
  serverId: string;
  serverName: string;
  libraryRoot: string;
  scannedUtc: string | null;
  matching: boolean;
  titles: TitleDto[];
}

export interface SubtitleTrack {
  language: string;
  label: string;
  path: string;
  /** A track inside the video file, not a file next to it. */
  embedded: boolean;
}

export interface EpisodeDto {
  key: string;
  season: number;
  episode: number;
  title: string;
  runtimeMinutes: number | null;
  size: number;
  path: string | null;
  seedboxPath: string | null;
  available: boolean;
  onSeedbox: boolean;
  subtitles: SubtitleTrack[];
  watched: boolean;
  aired: string | null;
  /** Announced, not released yet; aired is the date (null when not set). */
  upcoming?: boolean;
  /** Released after the newest episode you have. */
  new: boolean;
  /** Released, older than the newest episode you have, and not here. */
  missing: boolean;
}

export interface SeasonDto {
  number: number;
  episodes: EpisodeDto[];
}

export interface TitleDetailDto {
  title: TitleDto;
  localPath: string;
  seedboxPath: string | null;
  seasons: SeasonDto[];
  parts: string[];
  subtitleTracks: SubtitleTrack[];
  sidecars: string[];
}

export interface ScanResult {
  titles: number;
  needReview: number;
  unmatched: number;
  queued: number;
}

export interface SubtitleResult {
  found: number;
  languages: string[];
  files: number;
  /** How many were made for these exact files (in sync); the rest are matched by release name. */
  exact: number;
}

/** A subtitle search result with Seedbox Sync's estimate (0–100) of how well it lines up. */
export interface SubtitleCandidate {
  fileId: number;
  language: string;
  release: string | null;
  fileName: string | null;
  score: number;
  exact: boolean;
  machineTranslated: boolean;
  hearingImpaired: boolean;
  downloads: number;
  fps: number | null;
  uploaded: string | null;
  reason: string;
}

export interface SubtitleSearch {
  videoPath: string;
  release: string | null;
  hashed: boolean;
  candidates: SubtitleCandidate[];
}

export interface MetadataCandidate {
  provider: string;
  id: string;
  title: string;
  year: number | null;
  credit: string | null;
  posterUrl: string | null;
  popularity: number;
  score: number;
}

// ---- Discover (TMDB) -------------------------------------------------------------------

export type DiscoverKind = 'movie' | 'tv';

export interface DiscoverItem {
  kind: DiscoverKind;
  id: string;
  title: string;
  year: number | null;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  /** TMDB rating, 0–10. */
  rating: number | null;
  votes: number;
  genres: string[];
}

/** Where a Discover title stands. */
export interface DiscoverStatus {
  wanted: boolean;
  serverId: string | null;
  serverName: string | null;
  titleKey: string | null;
  seedboxPath: string | null;
  /** A series on the download list that is in the library: episodes not there yet. */
  waiting?: number;
  ready?: number;
  upcoming?: number;
}

export interface DiscoverCard {
  item: DiscoverItem;
  status: DiscoverStatus;
}

export interface DiscoverPage {
  page: number;
  totalPages: number;
  totalResults: number;
  items: DiscoverCard[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Ratings {
  imdb: number | null;
  imdbVotes: number | null;
  rottenTomatoes: number | null;
  metacritic: number | null;
  imdbUrl: string;
}

export interface DiscoverSeason {
  number: number;
  name: string;
  episodes: number;
  aired: string | null;
  posterUrl: string | null;
}

export interface DiscoverEpisode {
  season: number;
  episode: number;
  title: string;
  /** yyyy-MM-dd; null when not announced. */
  aired: string | null;
  runtimeMinutes: number | null;
  overview: string | null;
  stillUrl: string | null;
  rating: number | null;
}

export interface DiscoverSeasonDto {
  season: { number: number; name: string; overview: string | null; aired: string | null; posterUrl: string | null; episodes: DiscoverEpisode[] };
  serverName: string | null;
  inLibrary: number[];
  onSeedbox: number[];
}

export interface DiscoverDetails {
  details: {
    item: DiscoverItem;
    tagline: string | null;
    runtimeMinutes: number | null;
    seasons: number | null;
    episodes: number | null;
    status: string | null;
    credit: string | null;
    cast: { name: string; character: string | null; id: string | null }[];
    /** Directors (movies) or creators (series). */
    makers: { name: string; character: string | null; id: string | null }[] | null;
    imdbId: string | null;
    trailerUrl: string | null;
    network: string | null;
    tmdbUrl: string;
    seasonList: DiscoverSeason[] | null;
    nextEpisode: DiscoverEpisode | null;
    lastEpisode: DiscoverEpisode | null;
  };
  status: DiscoverStatus;
  ratings: Ratings | null;
  ratingsAvailable: boolean;
}

export interface WantedEntry {
  item: {
    /** "movie:603", "tv:1399", or for an episode "ep:<server>/<title key>:<season>:<episode>". */
    id: string;
    isEpisode: boolean;
    kind: DiscoverKind;
    tmdbId: string;
    title: string;
    year: number | null;
    posterUrl: string | null;
    addedUtc: string;
    season: number | null;
    episode: number | null;
    episodeTitle: string | null;
    serverId: string | null;
    titleKey: string | null;
  };
  status: DiscoverStatus;
}

// ---- Release calendar ----------------------------------------------------------------------

/** An episode on the release calendar: of a library series (titleKey) or a download-list series not in the library (wantedId). */
export interface CalendarEntry {
  date: string;
  series: string;
  season: number;
  episode: number;
  title: string;
  titleKey: string | null;
  hasPoster: boolean;
  wantedId: string | null;
  tmdbId: string | null;
  posterUrl: string | null;
  available: boolean;
  onSeedbox: boolean;
  wanted: boolean;
}

// ---- People (Discover) ---------------------------------------------------------------------

export interface PersonInfo {
  id: string;
  name: string;
  knownFor: string | null;
  birthday: string | null;
  deathday: string | null;
  birthplace: string | null;
  biography: string | null;
  photoUrl: string | null;
  imdbId: string | null;
  tmdbUrl: string;
}

export interface PersonCreditDto {
  item: DiscoverItem;
  status: DiscoverStatus;
  /** "James Reece", "Executive Producer", or several joined. */
  role: string;
  date: string | null;
}

export interface PersonDto {
  person: PersonInfo;
  credits: PersonCreditDto[];
}
