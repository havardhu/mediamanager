import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { CalendarEntry, DiscoverDetails, EpisodeDto, EpisodeRef, LibraryDto, Ratings, TitleDetailDto, TitleDto, WantedEntry } from '../api/types';
import { useApp } from '../app/AppContext';
import { Workbench } from '../app/Workbench';
import {
  Button, CoordinateBadge, EmptyState, Eyebrow, Hint, Icon, IconButton, InlineStatus, Select, Separator,
  Spacer, StatusDot, SummaryCard, Toolbar, TreeGroup, TreeItem,
} from '../ds';
import { daysFromToday, epCode, fmtBytes, fmtDate, fmtDay, langName, localPath, plural, relDay } from '../lib/format';
import { FixMatchModal } from './FixMatchModal';
import { SubtitlePickerModal } from './SubtitlePickerModal';
import { ReleaseCalendar, calendarId, calendarState } from './ReleaseCalendar';
import { TmdbDetailsPanel } from './TmdbDetailsPanel';

const TYPES = [
  { id: 'all' as const, label: 'All titles', icon: 'Layers' },
  { id: 'movie' as const, label: 'Movies', icon: 'Folder' },
  { id: 'tv' as const, label: 'TV series', icon: 'Folder' },
  { id: 'audiobook' as const, label: 'Audiobooks', icon: 'Folder' },
];
const BROWSE = [
  { id: 'continue' as const, label: 'Continue watching', icon: 'History' },
  { id: 'new' as const, label: 'New episodes', icon: 'Bell' },
  { id: 'recent' as const, label: 'Recently added', icon: 'Clock' },
  { id: 'missing' as const, label: 'Missing episodes', icon: 'Calendar' },
  { id: 'dupes' as const, label: 'Duplicates', icon: 'Copy' },
];
const VIEW_EMPTY: Record<string, string> = {
  continue: 'Series you have started show up here with their next episode. Play an episode to start.',
  new: 'No new episodes. When a series you have releases one, it shows up here and you get a notification.',
  recent: 'Nothing added yet.',
  missing: 'No gaps: every released episode up to your newest one is here.',
  dupes: 'No movie is here twice.',
  wanted: 'Nothing on your download list that is not here yet. Add movies and series in Discover.',
};
/** Selection key for a download-list title that is not in the library. */
const GHOST = 'wanted:';

/** "S02E05" */
const code = (e: { season: number; episode: number }) => `S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`;
const resolutionOf = (name: string) => (name.match(/(2160|1080|720|576|480)p/i)?.[1] ?? '');

const MATCHES = [
  { id: 'matched' as const, label: 'Matched', icon: 'CircleCheck' },
  { id: 'review' as const, label: 'Needs review', icon: 'TriangleAlert' },
  { id: 'unmatched' as const, label: 'Unmatched', icon: 'CircleX' },
];

export function LibraryTab() {
  const { servers, ui, setUi, setTab, note, fail, tm, transfers, completedTick, settings, reloadTransfers, reloadNews, wanted, reloadWanted } = useApp();
  const [lib, setLib] = useState<LibraryDto | null>(null);
  const [detail, setDetail] = useState<TitleDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<null | 'fix'>(null);
  const [subsPending, setSubsPending] = useState<string | null>(null);
  // Subtitle picker for a movie (episodePath null) or one episode.
  const [subsPick, setSubsPick] = useState<{ episodePath: string | null; title: string } | null>(null);
  const [artVersion, setArtVersion] = useState(0);
  const [ratings, setRatings] = useState<{ key: string; r: Ratings | null } | null>(null);
  // Release calendar: the selected episode and what the shown weeks contain (for the side panel).
  const [calSel, setCalSel] = useState<CalendarEntry | null>(null);
  const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
  const [calReload, setCalReload] = useState(0);
  // Title panel: the library view, or the TMDB page (as in Discover). The choice sticks between titles.
  const [dockTab, setDockTab] = useState<'library' | 'details'>('library');
  const [tmdb, setTmdb] = useState<{ key: string; d: DiscoverDetails | null; error?: string } | null>(null);

  const server = servers.find(s => s.id === ui.libServer) ?? servers[0];
  const serverId = server?.id ?? 'local';
  const multi = servers.length > 1;

  const loadLib = useCallback(async () => {
    try {
      setLib(await api.library(serverId));
    } catch (e) {
      fail(e);
    }
  }, [serverId, fail]);

  // A download-list title (not in the library) has no details here.
  const realSel = ui.libSel?.startsWith('wanted:') ? null : ui.libSel;
  const detailKey = ui.libShow ?? realSel;
  const loadDetail = useCallback(async () => {
    if (!detailKey) {
      setDetail(null);
      return;
    }
    try {
      setDetail(await api.title(serverId, detailKey));
    } catch (e) {
      setDetail(null);
      fail(e);
    }
  }, [serverId, detailKey, fail]);

  useEffect(() => {
    setLoading(true);
    loadLib().finally(() => setLoading(false));
  }, [loadLib, completedTick]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail, completedTick]);

  // IMDb / Rotten Tomatoes / Metacritic for the selected title, when an OMDb key is set.
  useEffect(() => {
    const key = ui.libShow ?? realSel;
    if (!key) return;
    let cancelled = false;
    api.ratings(serverId, key)
      .then(x => { if (!cancelled) setRatings(x.available ? { key, r: x.ratings } : null); })
      .catch(() => { if (!cancelled) setRatings(null); });
    return () => { cancelled = true; };
  }, [serverId, ui.libShow, realSel]);

  // Background matching: poll until it finishes.
  useEffect(() => {
    if (!lib?.matching) return;
    const t = setInterval(() => {
      loadLib();
      loadDetail();
      setArtVersion(v => v + 1);
    }, 3000);
    return () => clearInterval(t);
  }, [lib?.matching, loadLib, loadDetail]);

  const titles = lib?.titles ?? [];
  const cnt = { all: titles.length, movie: 0, tv: 0, audiobook: 0, matched: 0, review: 0, unmatched: 0 };
  titles.forEach(t => {
    cnt[t.kind]++;
    cnt[t.match.status]++;
  });
  // Browse views: built from what the service tracks per title.
  const byDate = (a: string | null, b: string | null) => (b ?? '').localeCompare(a ?? '');
  const views: Record<(typeof BROWSE)[number]['id'], TitleDto[]> = {
    continue: titles.filter(t => t.upNext?.available).sort((a, b) => byDate(a.lastPlayedUtc, b.lastPlayedUtc)),
    new: titles.filter(t => (t.newEpisodes?.length ?? 0) > 0),
    recent: titles.filter(t => t.addedUtc).sort((a, b) => byDate(a.addedUtc, b.addedUtc)).slice(0, 24),
    missing: titles.filter(t => t.missing > 0),
    dupes: titles.filter(t => (t.duplicates?.length ?? 0) > 0).sort((a, b) => a.displayTitle.localeCompare(b.displayTitle)),
  };
  const collections = [...titles.reduce((acc, t) => {
    if (t.collectionId && t.collection) {
      const c = acc.get(t.collectionId) ?? { id: t.collectionId, name: t.collection, count: 0 };
      c.count++;
      acc.set(t.collectionId, c);
    }
    return acc;
  }, new Map<string, { id: string; name: string; count: number }>()).values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const view = ui.libView;
  const shown = view
    ? (view.startsWith('col:') ? titles.filter(t => t.collectionId === view.slice(4)) : views[view as keyof typeof views] ?? [])
    : titles.filter(t => (ui.libType === 'all' || t.kind === ui.libType) && (!ui.libMatch || t.match.status === ui.libMatch));
  const home = !view && !ui.libMatch && ui.libType === 'all';
  // Movies and series on the download list that are not in a library yet: shown faded among the
  // real titles (or alone in the Download list view) so you see what is coming.
  const ghosts = wanted
    .filter(w => !w.item.isEpisode && !w.status.serverId)
    .filter(w => view === 'wanted' || (!view && !ui.libMatch && (ui.libType === 'all' || ui.libType === w.item.kind)));
  const ghostCount = wanted.filter(w => !w.item.isEpisode && !w.status.serverId).length;
  type Tile = { t: TitleDto; w?: undefined } | { w: WantedEntry; t?: undefined };
  const tiles: Tile[] = view === 'wanted' ? ghosts.map(w => ({ w })) : shown.map(t => ({ t }));
  // After the titles you have, newest additions first.
  if (view !== 'wanted') tiles.push(...ghosts.map(w => ({ w })));
  const selGhost = ui.libSel?.startsWith(GHOST) ? wanted.find(w => w.item.id === ui.libSel!.slice(GHOST.length)) ?? null : null;
  const viewLabel = view === 'wanted' ? 'Download list' : view ? (view.startsWith('col:') ? collections.find(c => 'col:' + c.id === view)?.name ?? 'Collection' : BROWSE.find(b => b.id === view)?.label) : null;
  const selT = titles.find(t => t.key === ui.libSel) ?? null;
  const showT = ui.libShow ? titles.find(t => t.key === ui.libShow) ?? null : null;
  const seasons = showT && detail?.title.key === showT.key ? detail.seasons : [];
  const season = showT && ui.libSeason != null ? seasons.find(s => s.number === ui.libSeason) ?? null : null;
  // Episodes of this series on the download list, by "season:episode".
  // The whole series on the download list (added in Discover) covers every episode not here.
  const seriesWanted = wanted.find(w => !w.item.isEpisode && w.item.kind === 'tv' && w.status.serverId === serverId && w.status.titleKey === (showT?.key ?? ui.libSel)) ?? null;
  const wantedEps = new Map(wanted
    .filter(w => w.item.isEpisode && w.item.serverId === serverId && w.item.titleKey === showT?.key)
    .map(w => [`${w.item.season}:${w.item.episode}`, w]));
  const ep: EpisodeDto | null = season?.episodes.find(e => e.key === ui.epSel) ?? null;
  const art = (key: string, kind: 'poster' | 'fanart' = 'poster') => api.artworkUrl(serverId, key, kind, artVersion);

  const toTop = () => setUi({ libShow: null, libSeason: null, epSel: null });

  // The calendar is about series: it shows for All titles and TV series, not inside a view or a series.
  const calendarOn = ui.libCal && !showT && !ui.libView && !ui.libMatch && (ui.libType === 'all' || ui.libType === 'tv');
  useEffect(() => {
    if (ui.libCal && (ui.libView || ui.libMatch || ui.libType === 'movie' || ui.libType === 'audiobook')) setUi({ libCal: false });
  }, [ui.libCal, ui.libView, ui.libMatch, ui.libType, setUi]);
  useEffect(() => { setCalReload(n => n + 1); }, [wanted, completedTick]);
  const calToggle = (
    <div className="seg" role="tablist" aria-label="Library view">
      <button type="button" role="tab" aria-selected={!ui.libCal} className={!ui.libCal ? 'on' : ''} onClick={() => setUi({ libCal: false })}>
        <Icon name="LayoutGrid" size={13} />{ui.libType === 'tv' ? 'TV series' : 'Titles'}
      </button>
      <button type="button" role="tab" aria-selected={ui.libCal} className={ui.libCal ? 'on' : ''} onClick={() => { setCalSel(null); setUi({ libCal: true, libView: null, libMatch: null, libType: ui.libType === 'tv' ? 'tv' : 'all', libSel: null, epSel: null }); }}>
        <Icon name="Calendar" size={13} />Release calendar
      </button>
    </div>
  );
  const openCalEntry = (e: CalendarEntry) => {
    if (e.titleKey) {
      setUi({ libCal: false, libSel: e.titleKey, libShow: e.titleKey, libSeason: e.season, epSel: null });
    } else if (e.wantedId) {
      setUi({ libCal: false, libSel: 'wanted:' + e.wantedId, libShow: null, libSeason: null, epSel: null });
    }
  };
  const addCalEntry = async (e: CalendarEntry) => {
    if (!e.titleKey) return;
    try {
      await api.addWanted({ kind: 'tv', tmdbId: e.tmdbId ?? '', title: e.series, year: null, posterUrl: null, season: e.season, episode: e.episode, episodeTitle: e.title, serverId, titleKey: e.titleKey });
      await reloadWanted();
      setCalSel({ ...e, wanted: true });
      note(`Added ${e.series} ${epCode(e)} to your download list.`);
    } catch (err) {
      fail(err);
    }
  };
  const openShow = (t: TitleDto) => setUi({ libShow: t.key, libSel: t.key, libSeason: null, epSel: null });

  // ---- actions -------------------------------------------------------------------------
  const scan = async () => {
    try {
      const r = await api.scanLibrary(serverId);
      await loadLib();
      note(`Scanned ${server?.libraryRoot}. ${plural(r.titles, 'title')} · ${r.needReview} need review · ${r.unmatched} unmatched.` +
        (r.queued ? ` Matching ${plural(r.queued, 'new title')} in the background.` : ''));
    } catch (e) {
      fail(e);
    }
  };

  // Playback is left to a real player: open the file with the PC's default app, or copy its
  // path for VLC, Kodi or mpv.
  const openExternal = async (path: string, title: string) => {
    try {
      await api.openExternal(serverId, path);
      note(`Opened ${title} in the default player on ${server?.name}.`);
      loadLib();
      loadDetail();
    } catch (e) {
      fail(e);
    }
  };

  // A series plays its next episode (or the first one); a movie its file.
  const playTitle = async (t: TitleDto) => {
    try {
      await api.playTitle(serverId, t.key);
      const next = t.kind === 'tv' && t.upNext?.available ? ` ${code(t.upNext)}` : '';
      note(`Opened ${t.displayTitle}${next} in the default player on ${server?.name}.`);
      loadLib();
      loadDetail();
    } catch (e) {
      fail(e);
    }
  };

  const download = async (paths: string[], what: string) => {
    try {
      await api.download(paths, [serverId]);
      await reloadTransfers();
      note(`Downloading ${what} to ${server?.name}.`);
    } catch (e) {
      fail(e);
    }
  };

  const setWatched = async (paths: string[], watched: boolean) => {
    if (!selT) return;
    try {
      await api.setWatched(serverId, selT.key, paths, watched);
      await Promise.all([loadLib(), loadDetail()]);
    } catch (e) {
      fail(e);
    }
  };

  const copyPath = async (path: string) => {
    const full = localPath(server?.libraryRoot ?? '', path);
    try {
      await navigator.clipboard.writeText(full);
      note(`Copied ${full}`);
    } catch {
      fail(new Error(`Could not copy to the clipboard. The path is ${full}`));
    }
  };

  // ---- Details tab (TMDB) -----------------------------------------------------------------
  const detailsTitle = selT && (selT.kind === 'movie' || selT.kind === 'tv') && selT.match.status !== 'unmatched' ? selT : null;
  useEffect(() => {
    if (dockTab !== 'details' || !detailsTitle || tmdb?.key === detailsTitle.key) return;
    const key = detailsTitle.key;
    let cancelled = false;
    setTmdb({ key, d: null });
    (async () => {
      try {
        const ref = await api.libraryTmdb(serverId, key);
        if (!ref.id || !ref.kind) throw new Error('TMDB has no entry for this title. Fix match can link it to TMDB.');
        const d = await api.discoverDetails(ref.kind, ref.id);
        if (!cancelled) setTmdb({ key, d });
      } catch (e) {
        if (!cancelled) setTmdb({ key, d: null, error: e instanceof Error ? e.message : String(e) });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dockTab, detailsTitle?.key, serverId]);

  // ---- download list (episodes) ------------------------------------------------------------
  /** On the list itself, or covered by the whole series being on the list. */
  const isWanted = (e: EpisodeDto) => wantedEps.has(`${e.season}:${e.episode}`) || (!!seriesWanted && !e.available && e.episode < 900);
  const removeSeries = async () => {
    if (!seriesWanted) return;
    try {
      await api.removeWantedId(seriesWanted.item.id);
      await reloadWanted();
      note(`Removed ${seriesWanted.item.title} from your download list.`);
    } catch (err) {
      fail(err);
    }
  };
  const addWanted = async (eps: EpisodeDto[]) => {
    if (!showT || !eps.length) return;
    try {
      for (const e of eps) {
        await api.addWanted({
          kind: 'tv', tmdbId: showT.match.provider === 'TMDB' ? showT.match.providerId ?? '' : '', title: showT.displayTitle, year: showT.year, posterUrl: null,
          season: e.season, episode: e.episode, episodeTitle: e.title, serverId, titleKey: showT.key,
        });
      }
      await reloadWanted();
      note(eps.length === 1
        ? `Added ${showT.displayTitle} ${epCode(eps[0])} to your download list. You get a notification when it is on the seedbox.`
        : `Added ${eps.length} episodes of ${showT.displayTitle} to your download list.`);
    } catch (err) {
      fail(err);
    }
  };
  const removeWanted = async (e: EpisodeDto) => {
    const w = wantedEps.get(`${e.season}:${e.episode}`);
    if (!w) return;
    try { await api.removeWantedId(w.item.id); await reloadWanted(); } catch (err) { fail(err); }
  };

  const playEpisode = (e: EpisodeDto) => {
    if (!e.available || !e.path || !showT) return;
    setUi({ epSel: e.key });
    openExternal(e.path, `${showT.displayTitle} S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`);
  };

  // The file "Play" opens for the selection: an episode, a movie's main file, or an audiobook's first part.
  const selFile = ep
    ? (ep.available ? ep.path : null)
    : selT?.kind === 'movie'
      ? selT.mainFile
      : selT?.kind === 'audiobook' && detail?.title.key === selT.key
        ? detail.parts[0] ?? null
        : null;
  const playSel = () => {
    if (ep) playEpisode(ep);
    else if (selT?.kind === 'tv') playTitle(selT);
    else if (selT && selFile) openExternal(selFile, selT.displayTitle);
  };

  const fetchSubs = async (episodePath?: string) => {
    if (!selT) return;
    setSubsPending(selT.key);
    try {
      const r = await api.fetchSubtitles(serverId, selT.key, episodePath);
      await Promise.all([loadLib(), loadDetail()]);
      note(r.found
        ? `Found ${plural(r.found, 'subtitle')} on OpenSubtitles for ${selT.displayTitle} (${r.languages.map(langName).join(', ')}). Saved next to the video ${r.files === 1 ? 'file' : 'files'}. ` +
          (r.exact >= r.found
            ? 'Made for this exact release, so they should be in sync.'
            : r.exact > 0
              ? `${r.exact} made for this exact release; the rest chosen by release name and may need a subtitle delay in your player (VLC: G and H).`
              : 'None were made for this exact release, so they were chosen by release name and may need a subtitle delay in your player (VLC: G and H).')
        : r.files
          ? `No subtitles found on OpenSubtitles for ${selT.displayTitle} in ${settings?.metadata.subtitleLanguages || 'the chosen languages'}.`
          : `Every episode already has subtitles in ${settings?.metadata.subtitleLanguages}.`);
    } catch (e) {
      fail(e);
    } finally {
      setSubsPending(null);
    }
  };

  // A movie or one episode: choose from the scored list. A whole series: fetch the best match
  // for every episode that is missing a language.
  const pickSubs = (e?: EpisodeDto | null) => {
    if (e?.path && showT) {
      setSubsPick({ episodePath: e.path, title: `${showT.displayTitle} · S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')} · ${e.title}` });
    } else if (selT?.kind === 'movie') {
      setSubsPick({ episodePath: null, title: selT.displayTitle + (selT.year ? ` (${selT.year})` : '') });
    } else {
      fetchSubs();
    }
  };

  const refreshMeta = async () => {
    if (!selT) return;
    try {
      const t = await api.refreshMetadata(serverId, selT.key);
      await Promise.all([loadLib(), loadDetail()]);
      setArtVersion(v => v + 1);
      note(`Refreshed metadata for ${t.displayTitle} from ${t.match.provider}.` + (t.match.provider === 'Tags' ? '' : ' Poster and .nfo rewritten.'));
    } catch (e) {
      fail(e);
    }
  };

  // ---- commands ------------------------------------------------------------------------
  const canPlaySel = !!selFile || (!ep && selT?.kind === 'tv' && (selT.episodes ?? 0) > 0);
  const noSel = !selT || selT.match.provider === 'Tags';
  const noSubs = !selT || selT.kind === 'audiobook' || selT.match.status === 'unmatched' || subsPending === selT.key;

  const commands = (
    <>
      <Button variant="ghost" icon="RefreshCw" disabled={loading} onClick={scan}>Scan library</Button>
      <Separator />
      <Button variant="primary" icon="Play" disabled={!canPlaySel} onClick={playSel} title="Open in the default player on the media server">Play</Button>
      <Button variant="ghost" icon="Search" disabled={noSel} onClick={() => setModal('fix')}>Fix match</Button>
      <Button variant="ghost" icon="MessageSquare" disabled={noSubs} onClick={() => pickSubs(ep)}>
        {subsPending ? 'Searching...' : 'Fetch subtitles'}
      </Button>
      <Button variant="ghost" icon="RotateCw" disabled={!selT} onClick={refreshMeta}>Refresh metadata</Button>
    </>
  );

  // ---- sidebar -------------------------------------------------------------------------
  const sidebar = (
    <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
      {multi && (
        <div style={{ padding: '6px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>Media server</span>
          <Select value={serverId} options={servers.map(s => ({ value: s.id, label: s.name }))} onChange={e => setUi({ libServer: e.target.value, libSel: null, libShow: null, libSeason: null, epSel: null })} />
        </div>
      )}
      <TreeGroup icon="Layers" label="Media type" expanded />
      {TYPES.map(t => (
        <TreeItem key={t.id} icon={t.icon} label={`${t.label} (${cnt[t.id]})`} selected={ui.libType === t.id && !ui.libMatch && !view} onClick={() => setUi({ libType: t.id, libMatch: null, libView: null, libShow: null, libSeason: null, epSel: null })} />
      ))}
      <TreeGroup icon="Tag" label="Match status" expanded />
      {MATCHES.map(m => (
        <TreeItem
          key={m.id}
          icon={m.icon}
          label={`${m.label} (${cnt[m.id]})`}
          error={m.id !== 'matched' && cnt[m.id] > 0}
          selected={ui.libMatch === m.id}
          onClick={() => setUi({ libMatch: ui.libMatch === m.id ? null : m.id, libView: null, libShow: null, libSeason: null, epSel: null })}
        />
      ))}
      <TreeGroup icon="Sparkles" label="Browse" expanded />
      {BROWSE.map(b => (
        <TreeItem
          key={b.id}
          icon={b.icon}
          label={`${b.label} (${views[b.id].length})`}
          error={b.id === 'new' && views.new.length > 0}
          selected={view === b.id}
          onClick={() => setUi({ libView: view === b.id ? null : b.id, libMatch: null, libType: 'all', libShow: null, libSeason: null, epSel: null })}
        />
      ))}
      <TreeItem
        icon="List"
        label={`Download list (${ghostCount})`}
        selected={view === 'wanted'}
        onClick={() => setUi({ libView: view === 'wanted' ? null : 'wanted', libMatch: null, libType: 'all', libShow: null, libSeason: null, epSel: null })}
      />
      {collections.length > 0 && (
        <>
          <TreeGroup icon="Package" label="Collections" count={collections.length} expanded />
          {collections.map(c => (
            <TreeItem
              key={c.id}
              icon="Package"
              label={`${c.name.replace(/ Collection$/i, '')} (${c.count})`}
              selected={view === 'col:' + c.id}
              onClick={() => setUi({ libView: view === 'col:' + c.id ? null : 'col:' + c.id, libMatch: null, libType: 'all', libShow: null, libSeason: null, epSel: null })}
            />
          ))}
        </>
      )}
      <div style={{ padding: '14px 12px 0' }}>
        <Hint>
          Matches come from TMDB (movies) and TVDB (series). Audiobooks use embedded tags. Artwork and .nfo files are written next to the media; file names stay as they are on the seedbox.
        </Hint>
        {lib?.matching && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)', paddingTop: 10 }}>
            <Icon name="LoaderCircle" size={14} className="spin" /> Matching new titles...
          </div>
        )}
      </div>
    </div>
  );

  // ---- download-list title that is not here yet --------------------------------------------
  const ghostCard = (w: WantedEntry) => {
    const it = w.item;
    const key = GHOST + it.id;
    const on = ui.libSel === key;
    const seed = !!w.status.seedboxPath;
    return (
      <button
        key={key}
        type="button"
        className="hov-card ghost-card"
        title={`${it.title}: on your download list, not downloaded`}
        onClick={() => setUi({ libSel: on ? null : key, epSel: null })}
        style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 6, borderRadius: 4, border: '1px solid ' + (on ? 'var(--accent)' : 'transparent'), background: on ? 'var(--accent-soft)' : 'transparent', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', minWidth: 0 }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <div className="ghost-poster">
            {it.posterUrl ? <img src={it.posterUrl} alt="" className="poster-img" loading="lazy" /> : <span>{it.title}</span>}
          </div>
          <span className={'disc-badge ' + (seed ? 'on-seed' : 'wanted')}>{seed ? 'On seedbox' : 'Wanted'}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, padding: '0 2px 2px' }}>
          <span className="ellipsis" style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>{it.title}</span>
          <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{[it.year, seed ? 'Ready to download' : 'On your download list'].filter(Boolean).join(' · ')}</span>
        </div>
      </button>
    );
  };

  // ---- title card (grid and rows) --------------------------------------------------------
  const card = (t: TitleDto, rowSub?: string) => {
    const on = ui.libSel === t.key;
    const unmatched = t.match.status === 'unmatched';
    const ratio = t.kind === 'audiobook' ? '1 / 1' : '2 / 3';
    // Movies and audiobooks play their file; series their next (or first) episode.
    const playable = t.kind === 'tv' ? (t.episodes ?? 0) > 0 : !!t.mainFile;
    const newCount = t.newEpisodes?.length ?? 0;
    const playLabel = t.kind === 'tv' && t.upNext?.available ? `Play ${code(t.upNext)}` : `Play ${t.displayTitle}`;
    const overlay = playable && (
      <span
        role="button"
        tabIndex={-1}
        aria-label={playLabel}
        title={playLabel}
        className="play-overlay"
        onClick={ev => {
          ev.stopPropagation();
          setUi({ libSel: t.key, epSel: null });
          if (t.kind === 'tv') playTitle(t);
          else openExternal(t.mainFile!, t.displayTitle);
        }}
      >
        <span className="play-overlay-btn"><Icon name="Play" size={20} /></span>
      </span>
    );
    const sub = rowSub ?? (t.kind === 'tv' && t.seasons
      ? `${plural(t.seasons, 'season')} · ${plural(t.episodes ?? 0, 'episode')}`
      : unmatched ? 'No match'
      : t.kind === 'audiobook' ? t.match.credit ?? ''
      : `${t.match.year ?? t.year ?? ''} · ${t.match.provider} ${t.match.providerId ?? ''}`);
    return (
      <button
        key={t.key}
        type="button"
        className="hov-card"
        onClick={() => (t.kind === 'tv' ? openShow(t) : setUi({ libSel: on ? null : t.key, epSel: null }))}
        style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 6, borderRadius: 4, border: '1px solid ' + (on ? 'var(--accent)' : 'transparent'), background: on ? 'var(--accent-soft)' : 'transparent', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', minWidth: 0, ...(rowSub !== undefined ? { width: 132, flex: 'none' } : {}) }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          {t.hasPoster ? (
            <div style={{ aspectRatio: ratio, width: '100%', borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border)', boxSizing: 'border-box', overflow: 'hidden' }}>
              <img src={art(t.key)} alt="" className="poster-img" loading="lazy" />
            </div>
          ) : unmatched ? (
            <div style={{ aspectRatio: ratio, width: '100%', borderRadius: 3, border: '1px dashed var(--border)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)' }}>No artwork</div>
          ) : (
            <div style={{ aspectRatio: ratio, width: '100%', borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border)', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', padding: 8, fontSize: 10, lineHeight: 1.35, color: 'var(--muted)', overflow: 'hidden' }}>
              {t.match.title ?? t.displayTitle}
            </div>
          )}
          {newCount > 0 && <span className="poster-badge">{newCount === 1 ? 'New episode' : `${newCount} new`}</span>}
          {overlay}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, padding: '0 2px 2px' }}>
          <span className="ellipsis" style={{ fontSize: 12, fontWeight: 500 }} title={t.name !== t.displayTitle ? `${t.displayTitle}\nFolder: ${t.name}` : t.displayTitle}>{t.displayTitle}</span>
          <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</span>
          {t.match.status === 'review' && <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--warning)', paddingTop: 3 }}>Needs review</span>}
          {unmatched && <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--error)', paddingTop: 3 }}>Unmatched</span>}
        </div>
      </button>
    );
  };

  /** A horizontal row of cards on the library's front page. */
  const row = (label: string, icon: string, list: TitleDto[], sub: (t: TitleDto) => string, viewId: string) =>
    list.length > 0 && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name={icon} size={14} /></span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{list.length}</span>
          <Spacer />
          <button type="button" className="hov-crumb" onClick={() => setUi({ libView: viewId, libShow: null, libSeason: null, epSel: null })} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 11, color: 'var(--muted)', cursor: 'pointer', padding: '3px 5px', borderRadius: 3 }}>See all</button>
        </div>
        <div className="row-scroll" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {list.slice(0, 16).map(t => card(t, sub(t)))}
        </div>
      </div>
    );

  // ---- main ----------------------------------------------------------------------------
  const crumbs = showT
    ? [{ name: 'All titles', onClick: toTop }, { name: showT.displayTitle, onClick: () => setUi({ libSeason: null, epSel: null }) }]
        .concat(season ? [{ name: `Season ${season.number}`, onClick: () => undefined }] : [])
    : [];
  const shownSize = shown.reduce((a, t) => a + t.size, 0);
  const allAvail = season ? season.episodes.every(e => e.available || e.upcoming) : true;
  // Released episodes that are neither here nor on the seedbox, and not on the download list yet.
  const listable = season ? season.episodes.filter(e => !e.available && !e.onSeedbox && !e.upcoming && e.episode < 900 && !isWanted(e)) : [];
  const seasonWanted = season ? season.episodes.filter(isWanted).length : 0;
  const nextUp = season?.episodes.find(e => e.upcoming && e.aired);
  const epStatus = (e: EpisodeDto): { label: string; dot: '' | 'ready' | 'live' | 'pending' } => {
    if (e.available) return { label: 'Available', dot: 'ready' };
    const t = e.seedboxPath ? tm.get(e.seedboxPath + '|' + serverId) : undefined;
    if (t?.status === 'active') return { label: `${transfers.paused ? 'Paused' : 'Downloading'} ${Math.floor((t.transferred / Math.max(1, t.size)) * 100)}%`, dot: 'live' };
    if (t?.status === 'queued') return { label: 'Queued', dot: 'live' };
    if (isWanted(e) && !e.onSeedbox) return { label: 'On download list', dot: 'pending' };
    if (e.upcoming) return { label: e.aired ? `Airs ${fmtDay(e.aired, false)}` : 'Not announced', dot: '' };
    if (e.new) return { label: e.onSeedbox ? 'New · on seedbox' : 'New · not on seedbox', dot: '' };
    if (e.missing) return { label: e.onSeedbox ? 'Missing · on seedbox' : 'Missing', dot: '' };
    return { label: e.onSeedbox ? 'Seedbox only' : 'Not on this server', dot: '' };
  };

  const main = calendarOn ? (
      <ReleaseCalendar
        serverId={serverId}
        art={k => art(k)}
        selected={calSel ? calendarId(calSel) : null}
        onSelect={setCalSel}
        onEntries={setCalEntries}
        reloadKey={calReload}
        lead={calToggle}
      />
  ) : (
    <div data-screen-label="Library" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Toolbar label="Library">
        {showT ? (
          <>
            <IconButton icon="ArrowLeft" label="Back" size="sm" onClick={() => (season ? setUi({ libSeason: null, epSel: null }) : toTop())} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, overflow: 'hidden' }}>
              {crumbs.map((c, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {i > 0 && <span style={{ color: 'var(--muted)', display: 'flex' }}><Icon name="ChevronRight" size={12} /></span>}
                  <button type="button" className="hov-crumb" onClick={c.onClick} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 11, padding: '3px 5px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', color: i === crumbs.length - 1 ? 'var(--text)' : 'var(--muted)' }}>
                    {c.name}
                  </button>
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
          {!view && !ui.libMatch && (ui.libType === 'all' || ui.libType === 'tv') && calToggle}
          <span style={{ fontSize: 11, color: 'var(--muted)', padding: '0 4px' }}>
            {view === 'wanted'
              ? `Download list · ${plural(ghosts.length, 'title')} not downloaded yet`
              : <>{viewLabel ? `${viewLabel} · ` : ''}{plural(shown.length, 'title')} on {server?.name ?? '…'} · {fmtBytes(shownSize)}{ghosts.length ? ` · ${ghosts.length} on your download list` : ''}</>}
          </span>
          </>
        )}
        <Spacer />
        <CoordinateBadge>{server?.libraryRoot ?? ''}</CoordinateBadge>
      </Toolbar>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {!showT && (
          <>
            {home && (
              <>
                {row('Continue watching', 'History', views.continue, t => (t.upNext ? `${code(t.upNext)} · ${t.upNext.title}` : ''), 'continue')}
                {row('New episodes', 'Bell', views.new, t => `${code(t.newEpisodes![0])}${t.newEpisodes![0].onSeedbox ? ' · on seedbox' : ' · not on seedbox'}`, 'new')}
                {row('Recently added', 'Clock', views.recent, t => fmtDate(t.addedUtc), 'recent')}
                {(views.continue.length > 0 || views.new.length > 0 || views.recent.length > 0) && (
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>All titles</div>
                )}
              </>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: '16px 14px', alignItems: 'start' }}>
              {tiles.map(x => (x.t ? card(x.t) : ghostCard(x.w)))}
            </div>
            {!tiles.length && lib && (
              <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                <EmptyState icon="Layers" title={view ? `${viewLabel}: none` : titles.length ? 'Nothing matches' : 'Your library starts here'}>
                  {view ? VIEW_EMPTY[view] ?? 'Nothing here yet.' : titles.length ? 'Choose another media type or match status.' : 'Download titles from the seedbox. They appear here once the first file arrives.'}
                </EmptyState>
              </div>
            )}
          </>
        )}
        {showT && !season && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: '16px 14px', alignItems: 'start' }}>
            {seasons.map(s => {
              const av = s.episodes.filter(e => e.available).length;
              const released = s.episodes.filter(e => !e.upcoming).length;
              const premiere = s.episodes.find(e => e.upcoming && e.aired)?.aired;
              return (
                <button key={s.number} type="button" className="hov-card" onClick={() => setUi({ libSeason: s.number, epSel: null })} style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 6, borderRadius: 4, border: '1px solid transparent', background: 'transparent', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', minWidth: 0 }}>
                  <div style={{ aspectRatio: '2 / 3', width: '100%', borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border)', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', padding: showT.hasPoster ? 0 : 8, fontSize: 10, lineHeight: 1.35, color: 'var(--muted)', overflow: 'hidden', position: 'relative' }}>
                    {showT.hasPoster ? <img src={art(showT.key)} alt="" className="poster-img" loading="lazy" /> : `${showT.displayTitle} · Season ${s.number}`}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 2px 2px' }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Season {s.number}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{released === 0
                      ? (premiere ? `Premieres ${fmtDay(premiere, false)}` : 'Announced')
                      : av === released ? plural(released, 'episode') : `${av} of ${released} episodes here`}</span>
                    {released > 0 && released < s.episodes.length && <span style={{ fontSize: 11, color: 'var(--accent)' }}>{`${s.episodes.length - released} upcoming`}</span>}
                  </div>
                </button>
              );
            })}
            {!seasons.length && <div style={{ color: 'var(--muted)', fontSize: 11 }}>Loading seasons...</div>}
          </div>
        )}
        {showT && season && (
          <>
            {(listable.length > 0 || seasonWanted > 0 || nextUp || seriesWanted) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingBottom: 12, fontSize: 11, color: 'var(--muted)' }}>
                {nextUp?.aired && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="Calendar" size={13} />
                    <span>{`Next: E${String(nextUp.episode).padStart(2, '0')} "${nextUp.title}" · ${fmtDay(nextUp.aired)}`}</span>
                    {relDay(nextUp.aired) && <span className="pill-new">{relDay(nextUp.aired)}</span>}
                  </span>
                )}
                {seriesWanted ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
                    <Icon name="List" size={13} />The whole series is on your download list
                    <Button size="xs" variant="ghost" onClick={removeSeries}>Remove</Button>
                  </span>
                ) : seasonWanted > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="List" size={13} />{`${plural(seasonWanted, 'episode')} on your download list`}</span>}
                <Spacer />
                {listable.length > 0 && (
                  <Button size="sm" icon="Plus" onClick={() => addWanted(listable)}>{listable.length === 1 ? 'Add the missing episode to download list' : `Add ${listable.length} missing episodes to download list`}</Button>
                )}
              </div>
            )}
            <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'auto' }}>
              <div style={{ minWidth: 740 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 28, padding: '0 10px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 600, letterSpacing: '.7px', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  <div style={{ width: 34 }}>Ep</div>
                  <div style={{ flex: 1, minWidth: 160 }}>Title</div>
                  <div style={{ width: 56, textAlign: 'right' }}>Runtime</div>
                  <div style={{ width: 64, textAlign: 'right' }}>Size</div>
                  <div style={{ width: 92 }}>Aired</div>
                  <div style={{ width: 128 }}>Status</div>
                  <div style={{ width: 110 }}>Subtitles</div>
                  <div style={{ width: 76 }} />
                </div>
                {season.episodes.map(e => {
                  const on = ui.epSel === e.key;
                  const st = epStatus(e);
                  return (
                    <div key={e.key} className={'hov-row' + (e.upcoming ? ' ep-soon' : '')} onClick={() => setUi({ epSel: e.key })} onDoubleClick={() => e.available && playEpisode(e)} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 34, padding: '0 10px', borderBottom: '1px solid var(--border)', cursor: 'default', userSelect: 'none', background: on ? 'var(--accent-soft)' : 'transparent' }}>
                      <div style={{ width: 34, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{e.episode >= 900 ? '–' : 'E' + String(e.episode).padStart(2, '0')}</div>
                      <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', color: e.available ? 'var(--text)' : 'var(--muted)' }}>
                        {e.watched && <span title="Watched" style={{ display: 'flex', color: 'var(--muted)' }}><Icon name="Check" size={12} /></span>}
                        <span className="ellipsis">{e.title}</span>
                        {e.new && <span className="pill-new">New</span>}
                        {e.upcoming && e.aired && daysFromToday(e.aired) <= 30 && <span className="pill-new">{relDay(e.aired)}</span>}
                      </div>
                      <div style={{ width: 56, textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>{e.runtimeMinutes ? e.runtimeMinutes + ' min' : '–'}</div>
                      <div style={{ width: 64, textAlign: 'right', color: 'var(--muted)', fontSize: 11 }}>{e.size ? fmtBytes(e.size) : '–'}</div>
                      <div style={{ width: 92, fontSize: 11, color: e.upcoming ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{e.aired ? fmtDate(e.aired) : '–'}</div>
                      <div style={{ width: 128, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {st.dot ? (<><StatusDot status={st.dot} /><span>{st.label}</span></>) : <span style={{ color: 'var(--muted)' }}>{st.label}</span>}
                      </div>
                      <div className="ellipsis" style={{ width: 110, fontSize: 11, color: 'var(--muted)' }}>
                        {e.available ? (e.subtitles.length ? e.subtitles.map(s => s.label).join(', ') : 'None') : '–'}
                      </div>
                      <div style={{ width: 76, display: 'flex', justifyContent: 'flex-end' }}>
                        {!e.available && !e.onSeedbox && e.episode < 900 ? (
                          isWanted(e)
                            ? (wantedEps.has(`${e.season}:${e.episode}`)
                              ? <Button size="xs" icon="Check" iconSize={12} title="On your download list. Choose to remove it." onClick={ev => { ev.stopPropagation(); removeWanted(e); }}>Listed</Button>
                              : <Button size="xs" icon="Check" iconSize={12} disabled title="The whole series is on your download list">Listed</Button>)
                            : <Button size="xs" variant="ghost" icon="Plus" iconSize={12} title="Add to download list: you get a notification when it is on the seedbox" onClick={ev => { ev.stopPropagation(); addWanted([e]); }}>List</Button>
                        ) : e.available || !e.onSeedbox || !e.seedboxPath || tm.has(e.seedboxPath + '|' + serverId) ? (
                          <Button size="xs" icon="Play" iconSize={12} disabled={!e.available} onClick={ev => { ev.stopPropagation(); playEpisode(e); }}>Play</Button>
                        ) : (
                          <Button size="xs" icon="Download" iconSize={12} onClick={ev => { ev.stopPropagation(); download([e.seedboxPath!], `${showT?.displayTitle ?? ''} ${code(e)}`); }}>Get</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ paddingTop: 10 }}>
              <Hint>
                {allAvail
                  ? 'Double-click an episode to open it in the default player.'
                  : 'Get downloads an episode from the seedbox to this server. Episodes the seedbox does not have yet (released or upcoming) are listed too: choose List to put them on your download list, and you get a notification when they reach the seedbox.'}
              </Hint>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ---- dock ----------------------------------------------------------------------------
  let dock: JSX.Element;
  const todayIso = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (calendarOn && calSel) {
    const e = calSel;
    const st = calendarState(e, todayIso);
    const stText = { have: 'In your library', seed: 'On the seedbox, not downloaded', wanted: 'On your download list', upcoming: 'Not aired yet', missing: 'Released, not on the seedbox' }[st];
    dock = (
      <>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 56, flex: 'none', aspectRatio: '2 / 3', borderRadius: 3, overflow: 'hidden', background: 'var(--surface-2)', border: '1px ' + (e.wantedId ? 'dashed' : 'solid') + ' var(--border)' }}>
            {(e.titleKey && e.hasPoster ? art(e.titleKey) : e.posterUrl) && <img src={e.titleKey && e.hasPoster ? art(e.titleKey) : e.posterUrl!} alt="" className="poster-img" />}
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{epCode(e)}</span>
            <strong style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{e.title}</strong>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{e.series}</span>
          </div>
        </div>
        <KV rows={[
          { k: daysFromToday(e.date) > 0 ? 'Airs' : 'Aired', v: `${fmtDay(e.date)}${relDay(e.date) ? ` · ${relDay(e.date)}` : ''}` },
          { k: 'Status', v: stText },
          { k: 'Series', v: e.titleKey ? `In your library on ${server?.name ?? 'this server'}` : 'On your download list, not in the library' },
        ]} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button size="sm" variant="primary" icon={e.titleKey ? 'ListTree' : 'List'} onClick={() => openCalEntry(e)}>{e.titleKey ? `Open season ${e.season}` : 'Show in library'}</Button>
          {e.titleKey && !e.available && !e.onSeedbox && !e.wanted && <Button size="sm" icon="Plus" onClick={() => addCalEntry(e)}>Add to download list</Button>}
        </div>
        {st === 'seed' && <Hint>Open the season and choose Get to download it.</Hint>}
        {(st === 'wanted' || (st === 'upcoming' && e.wanted)) && <Hint>You get a notification when it reaches the seedbox.</Hint>}
      </>
    );
  } else if (calendarOn) {
    const next = calEntries.filter(x => x.date >= todayIso).slice(0, 12);
    dock = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Coming up</Eyebrow>
          {next.length === 0 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Nothing airs in the weeks shown.</span>}
          {next.map(x => (
            <button key={calendarId(x)} type="button" className="cal-agenda" onClick={() => setCalSel(x)}>
              <span className="cal-agenda-day">{fmtDay(x.date, false)}</span>
              <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span className="ellipsis" style={{ fontSize: 12 }}>{x.series}</span>
                <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{`${epCode(x)} · ${x.title}`}</span>
              </span>
              {relDay(x.date) && <span className="pill-new" style={{ flex: 'none' }}>{relDay(x.date)}</span>}
            </button>
          ))}
        </div>
        <Hint>Episodes of the series in your library and of series on your download list. Select one for details; faded entries are series you do not have yet.</Hint>
      </>
    );
  } else if (selGhost && !showT) {
    const it = selGhost.item;
    const st = selGhost.status;
    dock = (
      <>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div className="ghost-poster" style={{ width: 64, flex: 'none' }}>
            {it.posterUrl && <img src={it.posterUrl} alt="" className="poster-img" />}
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <strong style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, wordBreak: 'break-word' }}>{it.title}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{[it.kind === 'tv' ? 'TV series' : 'Movie', it.year].filter(Boolean).join(' · ')}</span>
            <span style={{ color: st.seedboxPath ? 'var(--warning)' : 'var(--muted)', fontSize: 11 }}>{st.seedboxPath ? 'On the seedbox, not downloaded' : 'Not on the seedbox yet'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {st.seedboxPath && (
            <Button variant="primary" icon="Download" size="sm" onClick={() => download([st.seedboxPath!], it.title)}>{`Download to ${server?.name ?? 'this server'}`}</Button>
          )}
          <Button icon="X" size="sm" variant="ghost" onClick={async () => {
            try { await api.removeWantedId(it.id); await reloadWanted(); setUi({ libSel: null }); note(`Removed ${it.title} from your download list.`); } catch (err) { fail(err); }
          }}>Remove from download list</Button>
        </div>
        <Hint>
          {st.seedboxPath
            ? 'It is on the seedbox. Once downloaded it shows up here as a regular title.'
            : `On your download list since ${fmtDate(it.addedUtc)}. You get a notification when it reaches the seedbox. Faded posters are titles on your download list that are not in the library yet.`}
        </Hint>
      </>
    );
  } else if (ep && season && showT) {
    const st = epStatus(ep);
    const sxe = `S${String(ep.season).padStart(2, '0')}E${String(ep.episode).padStart(2, '0')}`;
    dock = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{sxe}</span>
          <strong style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{ep.title}</strong>
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>{showT.displayTitle} · Season {season.number}{ep.runtimeMinutes ? ` · ${ep.runtimeMinutes} min` : ''}</span>
        </div>
        {(ep.available || ep.onSeedbox) && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="primary" icon="Play" size="sm" disabled={!ep.available} onClick={() => playEpisode(ep)}>Play</Button>
            <Button variant="ghost" icon="Copy" size="sm" disabled={!ep.available} onClick={() => ep.path && copyPath(ep.path)}>Copy path</Button>
          </div>
        )}
        {ep.available && ep.path && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="ghost" icon={ep.watched ? 'EyeOff' : 'Eye'} size="sm" onClick={() => setWatched([ep.path!], !ep.watched)}>{ep.watched ? 'Mark as unwatched' : 'Mark as watched'}</Button>
          </div>
        )}
        {!ep.available && ep.onSeedbox && ep.seedboxPath && !tm.has(ep.seedboxPath + '|' + serverId) && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button icon="Download" size="sm" onClick={() => download([ep.seedboxPath!], `${showT.displayTitle} ${sxe}`)}>Download from seedbox</Button>
          </div>
        )}
        {!ep.available && !ep.onSeedbox && ep.episode < 900 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {!isWanted(ep)
                ? <Button icon="Plus" size="sm" variant="primary" onClick={() => addWanted([ep])}>Add to download list</Button>
                : wantedEps.has(`${ep.season}:${ep.episode}`)
                  ? <Button icon="Check" size="sm" onClick={() => removeWanted(ep)}>On your download list</Button>
                  : <Button icon="Check" size="sm" disabled>On your download list</Button>}
            </div>
            <Hint>{!isWanted(ep)
              ? 'Not on the seedbox yet. On the download list, you get a notification when it arrives.'
              : wantedEps.has(`${ep.season}:${ep.episode}`)
                ? 'You get a notification when it is on the seedbox. Choose again to remove it.'
                : 'The whole series is on your download list, so this episode is too. You get a notification when it is on the seedbox.'}</Hint>
          </div>
        )}
        <KV rows={[
          { k: 'Status', v: st.label + (ep.watched ? ' · watched' : '') },
          { k: ep.upcoming ? 'Airs' : 'Aired', v: ep.aired ? `${fmtDay(ep.aired)}${relDay(ep.aired) ? ` · ${relDay(ep.aired)}` : ''}` : ep.upcoming ? 'Not announced' : '–' },
          { k: 'Size', v: fmtBytes(ep.size) },
          { k: 'Subtitles', v: ep.available ? (ep.subtitles.map(s => s.label).join(', ') || 'None') : '–' },
          { k: 'Seedbox', v: ep.onSeedbox ? (ep.available ? 'Also on the seedbox' : 'On the seedbox') : ep.available ? 'Removed from the seedbox' : 'Not on the seedbox yet' },
        ]} />
        {ep.available && showT.match.status !== 'unmatched' && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button icon="MessageSquare" size="sm" disabled={subsPending === showT.key} onClick={() => pickSubs(ep)}>{ep.subtitles.length ? 'Choose other subtitles' : 'Fetch subtitles'}</Button>
          </div>
        )}
        {(ep.path || ep.seedboxPath) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow>Location</Eyebrow>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, wordBreak: 'break-all', lineHeight: 1.5 }}>
              {localPath(server?.libraryRoot ?? '', ep.path ?? ep.seedboxPath ?? ep.key)}
            </span>
          </div>
        )}
      </>
    );
  } else if (selT) {
    const m = selT.match;
    const isBook = selT.kind === 'audiobook';
    const d = detail && detail.title.key === selT.key ? detail : null;
    const langs = (settings?.metadata.subtitleLanguages ?? '').split(/[,; ]+/).filter(Boolean);
    const matchHead = m.status === 'matched'
      ? (m.provider === 'Tags' ? 'Read from embedded tags' : `Matched · ${m.confidence}% confidence`)
      : m.status === 'review' ? `Needs review · ${m.confidence}% confidence` : 'No match found';
    const matchRows = m.status === 'unmatched'
      ? [{ k: 'Searched', v: m.provider }, { k: 'Folder', v: selT.name }]
      : m.provider === 'Tags'
        ? [{ k: 'Title', v: m.title ?? selT.displayTitle }, { k: 'Author', v: m.credit ?? '–' }]
        : [
            { k: 'Matched as', v: `${m.title}${m.year ? ` (${m.year})` : ''}` },
            { k: `${m.provider} ID`, v: m.providerId ?? '–' },
            { k: selT.kind === 'tv' ? 'Network' : 'Director', v: m.credit ?? '–' },
          ];
    const matchHint = m.note
      ?? (m.provider === 'Tags' ? 'No audiobook provider is configured. Edit tags in the file to change this.' : `Wrong title? Search ${m.provider} and pick the right result.`);
    const metaFile = selT.kind === 'tv' ? 'tvshow.nfo' : 'movie.nfo';
    const hasNfo = !!d?.sidecars.some(s => s.toLowerCase() === metaFile);
    const libDock = (
      <>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 64, flex: 'none', aspectRatio: isBook ? '1 / 1' : '2 / 3', borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border)', boxSizing: 'border-box', overflow: 'hidden' }}>
            {selT.hasPoster && <img src={art(selT.key)} alt="" className="poster-img" />}
          </div>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <strong style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, wordBreak: 'break-word' }}>{selT.displayTitle}</strong>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{[isBook ? 'Audiobook' : selT.kind === 'tv' ? 'TV series' : 'Movie', m.year ?? selT.year].filter(Boolean).join(' · ')}</span>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{fmtBytes(selT.size)}{selT.have < selT.total ? ` · ${selT.have} of ${selT.total} files` : ''}</span>
          </div>
        </div>
        {(selT.kind === 'movie' || isBook) && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button variant="primary" icon="Play" size="sm" disabled={!canPlaySel} onClick={playSel}>Play</Button>
            <Button variant="ghost" icon="Copy" size="sm" disabled={!selFile} onClick={() => selFile && copyPath(selFile)}>Copy path</Button>
          </div>
        )}
        {selT.kind === 'tv' && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Button variant="primary" icon="Play" size="sm" disabled={!(selT.episodes ?? 0)} onClick={() => playTitle(selT)}>
              {selT.upNext?.available ? `Play ${code(selT.upNext)}` : 'Play'}
            </Button>
            {!showT && <Button icon="ListTree" size="sm" onClick={() => openShow(selT)}>Seasons and episodes</Button>}
          </div>
        )}
        {selT.kind === 'tv' && seriesWanted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent)' }}>
            <Icon name="List" size={13} />
            <span style={{ flex: 1 }}>
              {'On your download list'}
              <span style={{ color: 'var(--muted)' }}>{[seriesWanted.status.ready ? ` · ${seriesWanted.status.ready} on the seedbox` : '', seriesWanted.status.waiting ? ` · ${seriesWanted.status.waiting} waiting` : '', seriesWanted.status.upcoming ? ` · ${seriesWanted.status.upcoming} upcoming` : ''].join('')}</span>
            </span>
            <Button size="xs" variant="ghost" onClick={removeSeries}>Remove</Button>
          </div>
        )}
        {selT.kind === 'tv' && (() => {
          const fresh = selT.newEpisodes ?? [];
          const gettable = fresh.filter(e => e.onSeedbox && e.seedboxPath && !tm.has(e.seedboxPath + '|' + serverId));
          const up = selT.upNext;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow>Watching</Eyebrow>
              <KV rows={[
                { k: 'Up next', v: up ? `${code(up)} · ${up.title}${up.available ? '' : up.onSeedbox ? ' (on seedbox)' : ' (not here)'}` : selT.lastPlayedUtc ? 'All caught up' : 'Not started' },
                { k: 'New', v: fresh.length ? fresh.map((e: EpisodeRef) => code(e) + (e.onSeedbox ? ' (on seedbox)' : '')).join(', ') : 'None' },
                { k: 'Next airs', v: selT.nextAirs ?? '–' },
                { k: 'Missing', v: selT.missing ? `${plural(selT.missing, 'episode')} older than your newest` : 'None' },
              ]} />
              {gettable.length > 0 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button icon="Download" size="sm" onClick={() => download(gettable.map(e => e.seedboxPath!), gettable.length === 1 ? `${selT.displayTitle} ${code(gettable[0])}` : `${gettable.length} new episodes of ${selT.displayTitle}`)}>
                    {gettable.length === 1 ? `Download ${code(gettable[0])}` : `Download ${gettable.length} new episodes`}
                  </Button>
                </div>
              )}
              {fresh.length > gettable.length && fresh.some(e => !e.onSeedbox) && (
                <Hint>Released, but not on the seedbox yet. It shows up here once your seedbox has it.</Hint>
              )}
            </div>
          );
        })()}
        {selT.kind === 'movie' && (selT.collection || (selT.duplicates?.length ?? 0) > 0) && (() => {
          const copies = [selT, ...(selT.duplicates ?? []).map(k => titles.find(x => x.key === k)).filter((x): x is TitleDto => !!x)];
          const best = [...copies].sort((a, b) => (+resolutionOf(b.mainFile ?? b.name) - +resolutionOf(a.mainFile ?? a.name)) || b.size - a.size)[0];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Eyebrow>Related</Eyebrow>
              {selT.collection && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ color: 'var(--muted)', width: 72 }}>Collection</span>
                  <button type="button" className="hov-crumb" onClick={() => setUi({ libView: 'col:' + selT.collectionId, libSel: selT.key })} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 11, color: 'var(--accent)', cursor: 'pointer', padding: '2px 4px', borderRadius: 3, textAlign: 'left' }}>{selT.collection}</button>
                </div>
              )}
              {copies.length > 1 && (
                <>
                  <span style={{ fontSize: 11, color: 'var(--warning)' }}>{`This movie is here ${copies.length} times`}</span>
                  {copies.map(c => (
                    <button key={c.key} type="button" className="hov-row" onClick={() => setUi({ libSel: c.key })} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '6px 8px', border: '1px solid ' + (c.key === selT.key ? 'var(--accent)' : 'var(--border)'), borderRadius: 4, background: 'transparent', fontFamily: 'inherit', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}>
                      <span className="ellipsis" style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }} title={c.key}>{(c.mainFile ?? c.key).split('/').slice(-2).join('/')}</span>
                      <span style={{ fontSize: 11, color: c.key === best.key ? 'var(--accent)' : 'var(--muted)' }}>
                        {[resolutionOf(c.mainFile ?? c.name) && resolutionOf(c.mainFile ?? c.name) + 'p', fmtBytes(c.size), c.key === best.key ? 'best copy: keep this one' : c.onSeedbox ? 'also on the seedbox' : ''].filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  ))}
                  <Hint>Delete the copies you do not need from the seedbox (Seedbox tab) and from this PC in Explorer. Copy path helps you find them.</Hint>
                </>
              )}
            </div>
          );
        })()}
        {ratings?.key === selT.key && ratings.r && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ratings.r.imdb != null && <a className="rating-chip" href={ratings.r.imdbUrl} target="_blank" rel="noreferrer"><span style={{ color: 'var(--muted)' }}>IMDb</span><strong>{ratings.r.imdb.toFixed(1)}</strong></a>}
            {ratings.r.rottenTomatoes != null && <span className="rating-chip"><span style={{ color: 'var(--muted)' }}>RT</span><strong>{ratings.r.rottenTomatoes}%</strong></span>}
            {ratings.r.metacritic != null && <span className="rating-chip"><span style={{ color: 'var(--muted)' }}>Metacritic</span><strong>{ratings.r.metacritic}</strong></span>}
          </div>
        )}
        {m.overview && <div style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--muted)' }}>{m.overview}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Match</Eyebrow>
          {m.status === 'matched' && <InlineStatus>{matchHead}</InlineStatus>}
          {m.status === 'review' && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning)' }}>{matchHead}</span>}
          {m.status === 'unmatched' && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--error)' }}>{matchHead}</span>}
          <KV rows={matchRows} />
          <Hint>{matchHint}</Hint>
          {m.provider !== 'Tags' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant={m.status === 'matched' ? 'default' : 'primary'} icon="Search" size="sm" onClick={() => setModal('fix')}>
                {m.status === 'matched' ? 'Fix match' : m.status === 'review' ? 'Review match' : 'Search manually'}
              </Button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Artwork</Eyebrow>
          <KV rows={[
            { k: 'Poster', v: selT.hasPoster ? (isBook ? 'Cover image' : d?.sidecars.includes('poster.jpg') ? 'poster.jpg · downloaded' : 'Cached') : 'Missing' },
            ...(isBook ? [] : [{ k: 'Backdrop', v: selT.hasBackdrop ? (d?.sidecars.includes('fanart.jpg') ? 'fanart.jpg · downloaded' : 'Cached') : 'Missing' }]),
            { k: 'Metadata', v: isBook ? 'Embedded tags' : hasNfo ? metaFile : settings?.metadata.writeSidecars ? 'Not written yet' : 'Not written' },
          ]} />
        </div>
        {!isBook && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow>Subtitles</Eyebrow>
            {selT.kind === 'movie' && d ? (
              <KV rows={[
                { k: 'Embedded', v: d.subtitleTracks.filter(t => t.embedded).map(t => t.label.replace(/ \(embedded(, )?/, ' (').replace(' ()', '')).join(', ') || 'None' },
                { k: 'Files', v: d.subtitleTracks.filter(t => !t.embedded).map(t => t.label).join(', ') || `None yet · languages: ${langs.map(langName).join(', ') || 'none set'}` },
              ]} />
            ) : (
              <span style={{ fontSize: 11 }}>
                {selT.subtitles.length ? selT.subtitles.map(langName).join(', ') : `None yet · languages: ${langs.map(langName).join(', ') || 'none set'}`}
              </span>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <Button icon="MessageSquare" size="sm" disabled={noSubs} onClick={() => pickSubs(null)}>
                {subsPending === selT.key ? 'Searching...' : selT.kind === 'tv' ? 'Fetch for all episodes' : selT.subtitles.length ? 'Choose other subtitles' : 'Fetch subtitles'}
              </Button>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Location</Eyebrow>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, wordBreak: 'break-all', lineHeight: 1.5 }}>{d?.localPath ?? localPath(server?.libraryRoot ?? '', selT.key)}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            {selT.onSeedbox ? `Also on the seedbox${d?.seedboxPath ? ' at ' + d.seedboxPath : ''}` : 'Removed from the seedbox. This is the only copy.'}
          </span>
        </div>
      </>
    );
    if (detailsTitle) {
      const t = detailsTitle;
      const d = tmdb?.key === t.key ? tmdb.d : null;
      let detailsDock: JSX.Element;
      if (d) {
        const it = d.details.item;
        const listed = wanted.find(w => !w.item.isEpisode && w.item.kind === it.kind && w.item.tmdbId === it.id);
        detailsDock = (
          <TmdbDetailsPanel
            detail={d}
            actions={
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Button icon={listed ? 'Check' : 'Plus'} size="sm" variant={listed ? 'default' : 'ghost'} onClick={async () => {
                  try {
                    if (listed) await api.removeWantedId(listed.item.id);
                    else await api.addWanted({ kind: it.kind, tmdbId: it.id, title: it.title, year: it.year, posterUrl: it.posterUrl?.replace('/w500/', '/w342/') ?? null });
                    await reloadWanted();
                    note(listed ? `Removed ${it.title} from your download list.` : `Added ${it.title} to your download list.${it.kind === 'tv' ? ' Every episode you do not have is now wanted.' : ''}`);
                  } catch (err) {
                    fail(err);
                  }
                }}>{listed ? 'On your download list' : 'Add to download list'}</Button>
                {d.details.trailerUrl && <Button icon="Play" size="sm" variant="ghost" onClick={() => window.open(d.details.trailerUrl!, '_blank', 'noopener')}>Trailer</Button>}
              </div>
            }
            activeSeason={showT?.key === t.key ? ui.libSeason : null}
            onSeason={t.kind === 'tv' ? n => setUi({ libSel: t.key, libShow: t.key, libSeason: n, epSel: null }) : undefined}
            onPerson={(id, name) => { setUi({ discPerson: { id, name } }); setTab('discover'); }}
          />
        );
      } else if (tmdb?.key === t.key && tmdb.error) {
        detailsDock = <Hint>{tmdb.error}</Hint>;
      } else {
        detailsDock = <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}><span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>Loading from TMDB...</span>;
      }
      dock = (
        <>
          <div className="seg seg-fill" role="tablist" aria-label="Title panel">
            <button type="button" role="tab" aria-selected={dockTab === 'library'} className={dockTab === 'library' ? 'on' : ''} onClick={() => setDockTab('library')}><Icon name="HardDrive" size={13} />Library</button>
            <button type="button" role="tab" aria-selected={dockTab === 'details'} className={dockTab === 'details' ? 'on' : ''} onClick={() => setDockTab('details')}><Icon name="Info" size={13} />Details</button>
          </div>
          {dockTab === 'library' ? libDock : detailsDock}
        </>
      );
    } else {
      dock = libDock;
    }
  } else {
    dock = (
      <>
        <SummaryCard
          title={`${plural(titles.length, 'title')} on ${server?.name ?? '…'}`}
          lines={[
            `${plural(cnt.movie, 'movie')} · ${cnt.tv} series · ${plural(cnt.audiobook, 'audiobook')}`,
            `${cnt.review} need review · ${cnt.unmatched} unmatched`,
            `${fmtBytes(titles.reduce((a, t) => a + t.size, 0))} on disk`,
          ]}
        />
        <Hint>Select a title to see its match, artwork and subtitles.</Hint>
      </>
    );
  }

  const modals = (
    <>
      {subsPick && selT && (
        <SubtitlePickerModal
          serverId={serverId}
          titleKey={selT.key}
          episodePath={subsPick.episodePath}
          title={subsPick.title}
          languages={(settings?.metadata.subtitleLanguages ?? '').split(/[,; ]+/).map(l => l.trim().toLowerCase()).filter(Boolean)}
          onClose={() => setSubsPick(null)}
          onError={fail}
          onSaved={async c => {
            setSubsPick(null);
            await Promise.all([loadLib(), loadDetail()]);
            note(`Saved ${langName(c.language)} subtitles for ${subsPick.title}${c.exact ? ', made for this exact file' : ` (${c.score}% match)`}. If they drift, adjust the subtitle delay in your player (VLC: G and H).`);
          }}
        />
      )}
      {modal === 'fix' && selT && (
        <FixMatchModal
          serverId={serverId}
          title={selT}
          onClose={() => setModal(null)}
          onError={fail}
          onApplied={async (t, r) => {
            setModal(null);
            await Promise.all([loadLib(), loadDetail()]);
            setArtVersion(v => v + 1);
            note(`Matched ${selT.name} to ${r.title}${r.year ? ` (${r.year})` : ''}, ${r.provider} ${r.id}. Artwork and .nfo refreshed.`);
          }}
        />
      )}
    </>
  );

  return <Workbench commands={commands} sidebar={sidebar} main={main} dock={dock} modals={modals} />;
}

function KV({ rows }: { rows: { k: string; v: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: '5px 10px', fontSize: 11 }}>
      {rows.map(r => (
        <span key={r.k} style={{ display: 'contents' }}>
          <span style={{ color: 'var(--muted)' }}>{r.k}</span>
          <span style={{ wordBreak: 'break-word' }}>{r.v}</span>
        </span>
      ))}
    </div>
  );
}
