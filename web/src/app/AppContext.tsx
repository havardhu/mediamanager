import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, ApiError } from '../api/client';
import type { MediaServer, NewsItem, SeedboxListing, ServiceStatus, SettingsDto, TransfersState, WantedEntry } from '../api/types';
import { buildTree, transferMap, type STree, type TransferMap } from '../lib/seedboxTree';

export type TabId = 'seedbox' | 'library' | 'discover' | 'servers' | 'settings';
export type Theme = 'dark' | 'light';

interface Msg {
  text: string;
  error: boolean;
  id: number;
}

/** UI state that should survive switching tabs. */
export interface UiState {
  cwd: string;
  sel: string[];
  filter: 'all' | 'remote' | 'synced';
  q: string;
  collapsed: Record<string, boolean>;
  libServer: string;
  libType: 'all' | 'movie' | 'tv' | 'audiobook';
  libMatch: 'matched' | 'review' | 'unmatched' | null;
  /** 'continue' | 'new' | 'missing' | 'dupes' | 'recent' | 'col:<id>', or null for the media type view. */
  libView: string | null;
  /** Library shows the release calendar instead of titles. */
  libCal: boolean;
  /** Set to open a person's page in Discover (from another tab). */
  discPerson: { id: string; name: string } | null;
  libSel: string | null;
  libShow: string | null;
  libSeason: number | null;
  epSel: string | null;
  srvSel: string;
  setSec: 'conn' | 'xfer' | 'meta' | 'svc';
  panelOpen: boolean;
}

interface AppCtx {
  tab: TabId;
  setTab: (t: TabId) => void;
  theme: Theme;
  toggleTheme: () => void;
  winW: number;

  status: ServiceStatus | null;
  settings: SettingsDto | null;
  setSettings: (s: SettingsDto) => void;
  servers: MediaServer[];
  local: MediaServer | null;
  listing: SeedboxListing | null;
  tree: STree | null;
  transfers: TransfersState;
  tm: TransferMap;
  /** Increments whenever a transfer completes, so views can reload. */
  completedTick: number;
  /** Newly released episodes of series you have. */
  news: NewsItem[];
  reloadNews: () => Promise<void>;
  /** The download list (movies, series, episodes) with live status. */
  wanted: WantedEntry[];
  reloadWanted: () => Promise<void>;

  reloadStatus: () => Promise<void>;
  reloadServers: () => Promise<void>;
  reloadListing: () => Promise<void>;
  setListing: (l: SeedboxListing) => void;
  reloadTransfers: () => Promise<void>;
  setTransfers: (t: TransfersState) => void;

  msg: Msg | null;
  note: (text: string, error?: boolean) => void;
  fail: (e: unknown) => void;
  dismiss: () => void;

  ui: UiState;
  setUi: (patch: Partial<UiState>) => void;
}

const Ctx = createContext<AppCtx | null>(null);

/** New-episode notifications already shown in this browser. */
const NEWS_SEEN = 'seedboxsync.news.seen';
const WANTED_SEEN = 'seedboxsync.wanted.seen';

export function useApp(): AppCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('seedboxsync.theme');
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* storage unavailable */
  }
  return 'dark';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTabState] = useState<TabId>('seedbox');
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [winW, setWinW] = useState(() => window.innerWidth);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [settings, setSettings] = useState<SettingsDto | null>(null);
  const [servers, setServers] = useState<MediaServer[]>([]);
  const [listing, setListing] = useState<SeedboxListing | null>(null);
  const [transfers, setTransfers] = useState<TransfersState>({ paused: false, items: [] });
  const [completedTick, setCompletedTick] = useState(0);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [ui, setUiState] = useState<UiState>({
    cwd: '', sel: [], filter: 'all', q: '', collapsed: {}, libServer: 'local', libType: 'all', libMatch: null, libView: null, libCal: false, discPerson: null,
    libSel: null, libShow: null, libSeason: null, epSel: null, srvSel: 'local', setSec: 'conn', panelOpen: true,
  });
  const msgId = useRef(0);
  const doneIds = useRef<Set<string> | null>(null);

  const note = useCallback((text: string, error = false) => setMsg({ text, error, id: ++msgId.current }), []);
  const fail = useCallback((e: unknown) => note(e instanceof ApiError ? e.message : String((e as Error)?.message ?? e), true), [note]);
  const dismiss = useCallback(() => setMsg(null), []);
  const setUi = useCallback((patch: Partial<UiState>) => setUiState(s => ({ ...s, ...patch })), []);
  const setTab = useCallback((t: TabId) => setTabState(t), []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('seedboxsync.theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Info messages fade after a while; errors stay until dismissed.
  useEffect(() => {
    if (!msg || msg.error) return;
    const t = setTimeout(() => setMsg(m => (m && m.id === msg.id ? null : m)), 9000);
    return () => clearTimeout(t);
  }, [msg]);

  const reloadStatus = useCallback(async () => {
    try {
      setStatus(await api.status());
    } catch {
      setStatus(null);
    }
  }, []);
  const reloadServers = useCallback(async () => {
    try {
      setServers(await api.servers());
    } catch (e) {
      fail(e);
    }
  }, [fail]);
  const reloadListing = useCallback(async () => {
    try {
      setListing(await api.seedbox());
    } catch (e) {
      fail(e);
    }
  }, [fail]);
  // New episodes: checked at start and every 15 minutes. Each one is announced once.
  const [news, setNews] = useState<NewsItem[]>([]);
  const [wanted, setWanted] = useState<WantedEntry[]>([]);
  const reloadWanted = useCallback(async () => {
    try { setWanted(await api.wanted()); } catch { /* no TMDB key or service busy */ }
  }, []);
  const reloadNews = useCallback(async () => {
    let items: NewsItem[];
    try {
      items = await api.news();
    } catch {
      return;
    }
    setNews(items);
    let seen: string[] = [];
    try { seen = JSON.parse(localStorage.getItem(NEWS_SEEN) ?? '[]'); } catch { /* private window */ }
    const id = (n: NewsItem) => `${n.serverId}|${n.titleKey}|S${n.episode.season}E${n.episode.episode}`;
    const fresh = items.filter(n => !seen.includes(id(n)));
    if (fresh.length) {
      const n = fresh[0];
      const code = `S${String(n.episode.season).padStart(2, '0')}E${String(n.episode.episode).padStart(2, '0')}`;
      const where = n.episode.onSeedbox ? 'It is on the seedbox, ready to download.' : 'Not on the seedbox yet.';
      note(fresh.length === 1
        ? `New episode: ${n.title} ${code} "${n.episode.title}" is out. ${where}`
        : `${fresh.length} new episodes are out, including ${n.title} ${code}. See Library → New episodes.`);
      try { localStorage.setItem(NEWS_SEEN, JSON.stringify([...seen, ...fresh.map(id)].slice(-500))); } catch { /* ignore */ }
    }
    // Download list: announce once when a title reaches the seedbox, and once when it is in the library.
    try {
      const wanted = await api.wanted();
      setWanted(wanted);
      let seenW: string[] = [];
      try { seenW = JSON.parse(localStorage.getItem(WANTED_SEEN) ?? '[]'); } catch { /* private window */ }
      const events = wanted.flatMap(w => {
        const base = w.item.id;
        const name = w.item.isEpisode
          ? `${w.item.title} S${String(w.item.season).padStart(2, '0')}E${String(w.item.episode).padStart(2, '0')}`
          : w.item.title;
        if (!w.item.isEpisode && w.item.kind === 'tv' && w.status.serverId) {
          // A series in the library: announce each time more episodes reach the seedbox.
          return w.status.ready
            ? [{ id: `${base}:ready:${w.status.ready}`, text: `From your download list: ${w.status.ready === 1 ? 'an episode' : `${w.status.ready} episodes`} of ${name} ${w.status.ready === 1 ? 'is' : 'are'} on the seedbox. Get ${w.status.ready === 1 ? 'it' : 'them'} in the library.` }]
            : [];
        }
        if (w.status.serverId) return [{ id: base + ':lib', text: `From your download list: ${name} is in your library on ${w.status.serverName}.` }];
        if (w.status.seedboxPath) return [{ id: base + ':seed', text: `From your download list: ${name} is on the seedbox. Download it from ${w.item.isEpisode ? 'the library or ' : ''}Discover → Download list.` }];
        return [];
      }).filter(e => !seenW.includes(e.id));
      if (events.length) {
        if (!fresh.length) note(events.length === 1 ? events[0].text : `${events.length} titles from your download list have arrived. See Discover → Download list.`);
        try { localStorage.setItem(WANTED_SEEN, JSON.stringify([...seenW, ...events.map(e => e.id)].slice(-500))); } catch { /* ignore */ }
      }
    } catch {
      /* no TMDB key or service busy */
    }
  }, [note]);
  useEffect(() => {
    const first = setTimeout(reloadNews, 3000);
    const t = setInterval(reloadNews, 15 * 60 * 1000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [reloadNews]);
  // The download list follows downloads: refresh it when one finishes.
  useEffect(() => { reloadWanted(); }, [reloadWanted, completedTick]);

  const reloadTransfers = useCallback(async () => {
    try {
      setTransfers(await api.transfers());
    } catch {
      /* the status bar shows the service as unreachable */
    }
  }, []);

  // Initial load.
  useEffect(() => {
    reloadStatus();
    reloadServers();
    reloadListing();
    reloadTransfers();
    api.settings().then(setSettings).catch(fail);
  }, [reloadStatus, reloadServers, reloadListing, reloadTransfers, fail]);

  // Transfers poll quickly while something is moving, slowly otherwise.
  const busy = transfers.items.some(t => t.status === 'active' || t.status === 'queued');
  useEffect(() => {
    const t = setInterval(reloadTransfers, busy ? 1000 : 4000);
    return () => clearInterval(t);
  }, [busy, reloadTransfers]);

  useEffect(() => {
    const t = setInterval(reloadStatus, 10000);
    return () => clearInterval(t);
  }, [reloadStatus]);

  // While the service is refreshing the seedbox, poll the listing.
  useEffect(() => {
    if (!listing?.refreshing && !status?.seedbox.refreshing) return;
    const t = setInterval(() => {
      reloadListing();
      reloadStatus();
    }, 2000);
    return () => clearInterval(t);
  }, [listing?.refreshing, status?.seedbox.refreshing, reloadListing, reloadStatus]);

  // When a transfer completes, reload the listing so sync states update.
  useEffect(() => {
    const done = new Set(transfers.items.filter(t => t.status === 'done').map(t => t.id));
    const prev = doneIds.current;
    doneIds.current = done;
    if (!prev) return;
    let added = false;
    done.forEach(id => {
      if (!prev.has(id)) added = true;
    });
    if (added) {
      setCompletedTick(n => n + 1);
      const t = setTimeout(reloadListing, 400);
      return () => clearTimeout(t);
    }
  }, [transfers, reloadListing]);

  const tree = useMemo(() => (listing ? buildTree(listing.entries) : null), [listing]);
  const tm = useMemo(() => transferMap(transfers.items), [transfers]);
  const local = servers.find(s => s.kind === 'local') ?? servers[0] ?? null;

  const value: AppCtx = {
    tab, setTab, theme, toggleTheme, winW,
    status, settings, setSettings, servers, local, listing, tree, transfers, tm, completedTick, news, reloadNews, wanted, reloadWanted,
    reloadStatus, reloadServers, reloadListing, setListing, reloadTransfers, setTransfers,
    msg, note, fail, dismiss, ui, setUi,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
