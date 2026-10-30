import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import type { DiscoverCard, DiscoverDetails, DiscoverEpisode, DiscoverKind, DiscoverSeasonDto, DiscoverStatus, Genre, PersonDto, WantedEntry } from '../api/types';
import { useApp } from '../app/AppContext';
import { Workbench } from '../app/Workbench';
import { TmdbDetailsPanel } from './TmdbDetailsPanel';
import { Button, EmptyState, Eyebrow, Field, Hint, Icon, SearchBox, Select, Spacer, Toolbar, TreeGroup, TreeItem } from '../ds';
import { daysFromToday, epCode, fmtDate, fmtDay, plural, relDay } from '../lib/format';

const listsFor = (kind: DiscoverKind) => [
  { id: 'trending', label: 'Trending this week', icon: 'Zap' },
  { id: 'popular', label: 'Popular', icon: 'Users' },
  { id: 'top_rated', label: 'Top rated', icon: 'Star' },
  kind === 'movie' ? { id: 'upcoming', label: 'Coming soon', icon: 'Calendar' } : { id: 'on_the_air', label: 'On the air', icon: 'Calendar' },
  kind === 'movie' ? { id: 'now_playing', label: 'In cinemas', icon: 'Play' } : { id: 'airing_today', label: 'Airing today', icon: 'Play' },
];
const YEAR_NOW = new Date().getFullYear();
const YEARS = [{ value: '', label: 'Any year' }, ...Array.from({ length: YEAR_NOW - 1949 }, (_, i) => String(YEAR_NOW + 1 - i)).map(y => ({ value: y, label: y }))];
const RATINGS = [{ value: '', label: 'Any rating' }, ...['6', '7', '7.5', '8'].map(r => ({ value: r, label: `★ ${r}+` }))];
const SORTS = [
  { value: '', label: 'Most popular' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'votes', label: 'Most votes' },
];

interface Filters {
  kind: DiscoverKind;
  list: string;
  genre: number | null;
  year: number | null;
  minRating: number | null;
  sort: string;
  q: string;
}

const upcoming = (e: DiscoverEpisode) => !e.aired || daysFromToday(e.aired) > 0;

const statusOf = (s: DiscoverStatus) =>
  s.ready ? { label: `${s.ready} on seedbox`, cls: 'disc-badge on-seed' }
  : s.serverId && s.wanted && s.waiting ? { label: `${s.waiting} waiting`, cls: 'disc-badge wanted' }
  : s.serverId ? { label: 'In library', cls: 'disc-badge in-lib' } : s.seedboxPath ? { label: 'On seedbox', cls: 'disc-badge on-seed' } : s.wanted ? { label: 'On your list', cls: 'disc-badge wanted' } : null;

/**
 * Browse TMDB for things to watch. Nothing here is part of the library; each card shows whether
 * you already have it (library, seedbox), and anything can go on the download list.
 */
export function DiscoverTab() {
  const { note, fail, setTab, ui, setUi, local, servers, reloadTransfers, settings, wanted, reloadWanted: loadWanted } = useApp();
  const [f, setF] = useState<Filters>({ kind: 'movie', list: 'trending', genre: null, year: null, minRating: null, sort: '', q: '' });
  const [view, setView] = useState<'browse' | 'wanted' | 'person'>('browse');
  // A person's page: everything they are in. Opened from cast and crew names.
  const [person, setPerson] = useState<{ id: string; name: string } | null>(null);
  const [personData, setPersonData] = useState<PersonDto | null>(null);
  const [personKind, setPersonKind] = useState<'all' | 'movie' | 'tv'>('all');
  const [personSort, setPersonSort] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [bioOpen, setBioOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<DiscoverCard[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sel, setSel] = useState<{ kind: DiscoverKind; id: string } | null>(null);
  const [detail, setDetail] = useState<DiscoverDetails | null>(null);
  // Series drill-down: the series, the season shown, and its episodes.
  const [drill, setDrill] = useState<{ id: string; title: string } | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [seasonData, setSeasonData] = useState<DiscoverSeasonDto | null>(null);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const seq = useRef(0);
  const hasTmdb = !!settings?.metadata.tmdbApiKeySet;

  useEffect(() => { loadWanted(); }, [loadWanted]);

  useEffect(() => {
    api.genres(f.kind).then(setGenres).catch(() => setGenres([]));
  }, [f.kind]);

  // Search as you type, after a short pause.
  useEffect(() => {
    const t = setTimeout(() => setF(x => (x.q === query.trim() ? x : { ...x, q: query.trim() })), 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchPage = useCallback(async (p: number, replace: boolean) => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const r = await api.discover({ kind: f.kind, list: f.list, genre: f.genre, year: f.year, minRating: f.minRating, sort: f.sort || null, page: p, q: f.q });
      if (id !== seq.current) return;
      setItems(prev => (replace ? r.items : [...prev, ...r.items.filter(i => !prev.some(x => x.item.id === i.item.id))]));
      setPage(r.page);
      setTotalPages(r.totalPages);
      setTotal(r.totalResults);
    } catch (e) {
      if (id === seq.current) setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [f]);

  useEffect(() => {
    if (view === 'browse') fetchPage(1, true);
  }, [fetchPage, view]);

  useEffect(() => {
    if (!sel) { setDetail(null); return; }
    let cancelled = false;
    setDetail(null);
    api.discoverDetails(sel.kind, sel.id).then(d => { if (!cancelled) setDetail(d); }).catch(e => { if (!cancelled) fail(e); });
    return () => { cancelled = true; };
  }, [sel, fail]);

  // Leaving the list (other kind, list, filter, search or the download list) closes the series.
  useEffect(() => { setDrill(null); }, [f, view, person]);

  useEffect(() => {
    if (!person) { setPersonData(null); return; }
    let cancelled = false;
    setPersonData(null);
    setError(null);
    setBioOpen(false);
    api.discoverPerson(person.id)
      .then(d => { if (!cancelled) setPersonData(d); })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, [person]);

  // A person chosen in the library (Details tab): show their page here.
  useEffect(() => {
    if (!ui.discPerson) return;
    openPerson(ui.discPerson.id, ui.discPerson.name);
    setUi({ discPerson: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.discPerson]);

  const openPerson = (id: string | null, name: string) => {
    if (!id) return;
    setSel(null);
    setPersonKind('all');
    setPerson({ id, name });
    setView('person');
  };

  // Open a series on the season that is airing, else its latest season.
  useEffect(() => {
    if (!drill || season != null || !detail || detail.details.item.id !== drill.id) return;
    const list = detail.details.seasonList ?? [];
    const next = detail.details.nextEpisode?.season;
    const latest = Math.max(...list.filter(x => x.number > 0).map(x => x.number), list[0]?.number ?? 1);
    setSeason(next != null && list.some(x => x.number === next) ? next : latest);
  }, [drill, season, detail]);

  useEffect(() => {
    if (!drill || season == null) { setSeasonData(null); return; }
    let cancelled = false;
    setSeasonData(null);
    setSeasonError(null);
    api.discoverSeason(drill.id, season)
      .then(d => { if (!cancelled) setSeasonData(d); })
      .catch(e => { if (!cancelled) setSeasonError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, [drill, season]);

  const openSeries = (id: string, title: string, n: number | null = null) => {
    setSel({ kind: 'tv', id });
    setDrill(d => (d?.id === id ? d : { id, title }));
    setSeason(n);
  };

  const patchStatus = (kind: DiscoverKind, id: string, patch: Partial<DiscoverStatus>) => {
    setItems(list => list.map(c => (c.item.kind === kind && c.item.id === id ? { ...c, status: { ...c.status, ...patch } } : c)));
    setPersonData(p => p && { ...p, credits: p.credits.map(c => (c.item.kind === kind && c.item.id === id ? { ...c, status: { ...c.status, ...patch } } : c)) });
    setDetail(d => (d && d.details.item.kind === kind && d.details.item.id === id ? { ...d, status: { ...d.status, ...patch } } : d));
  };

  const toggleWanted = async (it: { kind: DiscoverKind; id: string; title: string; year: number | null; posterUrl: string | null }, isWanted: boolean) => {
    try {
      if (isWanted) {
        await api.removeWanted(it.kind, it.id);
        note(`Removed ${it.title} from your download list.`);
      } else {
        await api.addWanted({ kind: it.kind, tmdbId: it.id, title: it.title, year: it.year, posterUrl: it.posterUrl });
        note(`Added ${it.title} to your download list. You get a notification when it is on the seedbox.`);
      }
      patchStatus(it.kind, it.id, { wanted: !isWanted });
      loadWanted();
    } catch (e) {
      fail(e);
    }
  };

  const download = async (path: string, title: string) => {
    if (!local) return;
    try {
      await api.download([path], [local.id]);
      await reloadTransfers();
      note(`Downloading ${title} to ${local.name}.`);
    } catch (e) {
      fail(e);
    }
  };

  const openInLibrary = (s: DiscoverStatus) => {
    if (!s.serverId || !s.titleKey) return;
    setUi({ libServer: s.serverId, libSel: s.titleKey, libShow: null, libSeason: null, epSel: null, libView: null, libMatch: null, libType: 'all' });
    setTab('library');
  };

  const setFilter = (patch: Partial<Filters>) => {
    setView('browse');
    setF(x => {
      const n = { ...x, ...patch };
      // Any filter turns a fixed list into a filtered TMDB discover query.
      if ((patch.genre !== undefined || patch.year !== undefined || patch.minRating !== undefined || patch.sort !== undefined) && (n.genre || n.year || n.minRating || n.sort)) n.list = 'discover';
      return n;
    });
  };

  const lists = listsFor(f.kind);
  const kindLabel = f.kind === 'movie' ? 'Movies' : 'Series';
  const heading = view === 'wanted'
    ? 'Download list'
    : f.q
      ? `Search: "${f.q}"`
      : f.list === 'discover'
        ? [genres.find(g => g.id === f.genre)?.name, f.year, f.minRating ? `★ ${f.minRating}+` : null, SORTS.find(s => s.value === f.sort)?.label].filter(Boolean).join(' · ') || 'All'
        : lists.find(l => l.id === f.list)?.label ?? '';
  const filtersOn = !!(f.genre || f.year || f.minRating || f.sort);

  const commands = (
    <>
      <Button variant={f.kind === 'movie' && view === 'browse' ? 'primary' : 'ghost'} icon="Monitor" onClick={() => { setView('browse'); setF(x => ({ ...x, kind: 'movie', genre: null, list: x.list === 'discover' ? 'trending' : x.list === 'on_the_air' ? 'upcoming' : x.list === 'airing_today' ? 'now_playing' : x.list })); setSel(null); }}>Movies</Button>
      <Button variant={f.kind === 'tv' && view === 'browse' ? 'primary' : 'ghost'} icon="Layers" onClick={() => { setView('browse'); setF(x => ({ ...x, kind: 'tv', genre: null, list: x.list === 'discover' ? 'trending' : x.list === 'upcoming' ? 'on_the_air' : x.list === 'now_playing' ? 'airing_today' : x.list })); setSel(null); }}>Series</Button>
      <Button variant={view === 'wanted' ? 'primary' : 'ghost'} icon="List" onClick={() => { setView('wanted'); loadWanted(); }}>{`Download list (${wanted.length})`}</Button>
    </>
  );

  const sidebar = (
    <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
      <TreeGroup icon="Compass" label={kindLabel} expanded />
      {lists.map(l => (
        <TreeItem key={l.id} icon={l.icon} label={l.label} selected={view === 'browse' && !f.q && f.list === l.id} onClick={() => { setQuery(''); setView('browse'); setF(x => ({ ...x, list: l.id, genre: null, year: null, minRating: null, sort: '', q: '' })); }} />
      ))}
      <TreeItem icon="List" label={`Download list (${wanted.length})`} selected={view === 'wanted'} onClick={() => { setView('wanted'); loadWanted(); }} />
      {person && <TreeItem icon="User" label={person.name} selected={view === 'person'} onClick={() => setView('person')} />}
      <TreeGroup icon="SlidersHorizontal" label="Filters" expanded />
      <div style={{ padding: '4px 12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Select value={f.year ? String(f.year) : ''} options={YEARS} onChange={e => setFilter({ year: e.target.value ? +e.target.value : null })} aria-label="Year" />
        <Select value={f.minRating ? String(f.minRating) : ''} options={RATINGS} onChange={e => setFilter({ minRating: e.target.value ? +e.target.value : null })} aria-label="Minimum rating" />
        <Select value={f.sort} options={SORTS} onChange={e => setFilter({ sort: e.target.value })} aria-label="Sort" />
        {filtersOn && <Button size="sm" variant="ghost" icon="X" onClick={() => setF(x => ({ ...x, list: 'popular', genre: null, year: null, minRating: null, sort: '' }))}>Clear filters</Button>}
      </div>
      <TreeGroup icon="Tag" label="Genres" count={genres.length || undefined} expanded />
      {genres.map(g => (
        <TreeItem key={g.id} icon="Tag" label={g.name} selected={view === 'browse' && f.genre === g.id} onClick={() => setFilter({ genre: f.genre === g.id ? null : g.id })} />
      ))}
      <div style={{ padding: '14px 12px 0' }}>
        <Hint>From TMDB. Titles here are not part of your library until you download them. Add something to the download list to be notified when it is on the seedbox.</Hint>
      </div>
    </div>
  );

  const card = (c: DiscoverCard, sub?: string) => {
    const it = c.item;
    const on = sel?.kind === it.kind && sel.id === it.id;
    const st = statusOf(c.status);
    return (
      <button
        key={it.kind + it.id}
        type="button"
        className="hov-card"
        onClick={() => (it.kind === 'tv' ? openSeries(it.id, it.title) : setSel(on ? null : { kind: it.kind, id: it.id }))}
        style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 6, borderRadius: 4, border: '1px solid ' + (on ? 'var(--accent)' : 'transparent'), background: on ? 'var(--accent-soft)' : 'transparent', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', minWidth: 0 }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ aspectRatio: '2 / 3', width: '100%', borderRadius: 3, background: 'var(--surface-2)', border: '1px solid var(--border)', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: it.posterUrl ? 0 : 8, fontSize: 10, color: 'var(--muted)' }}>
            {it.posterUrl ? <img src={it.posterUrl} alt="" className="poster-img" loading="lazy" /> : it.title}
          </div>
          {st && <span className={st.cls}>{st.label}</span>}
          {it.rating != null && <span className="disc-rating"><Icon name="Star" size={10} />{it.rating.toFixed(1)}</span>}
          <span
            role="button"
            tabIndex={-1}
            className={'disc-quick' + (c.status.wanted ? ' on' : '')}
            title={c.status.wanted ? 'Remove from download list' : 'Add to download list'}
            onClick={ev => { ev.stopPropagation(); toggleWanted({ kind: it.kind, id: it.id, title: it.title, year: it.year, posterUrl: it.posterUrl }, c.status.wanted); }}
          >
            <Icon name={c.status.wanted ? 'Check' : 'Plus'} size={14} />
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, padding: '0 2px 2px' }}>
          <span className="ellipsis" style={{ fontSize: 12, fontWeight: 500 }} title={it.title}>{it.title}</span>
          <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }} title={sub}>{sub ?? [it.year, it.genres.slice(0, 2).join(', ')].filter(Boolean).join(' · ')}</span>
        </div>
      </button>
    );
  };

  const wantedEpisodes = wanted.filter(w => w.item.isEpisode);
  const wantedCards = useMemo(() => wanted.filter(w => !w.item.isEpisode).map(w => ({
    item: { kind: w.item.kind, id: w.item.tmdbId, title: w.item.title, year: w.item.year, overview: null, posterUrl: w.item.posterUrl, backdropUrl: null, rating: null, votes: 0, genres: [] },
    status: w.status,
  }) as DiscoverCard), [wanted]);

  const shown = view === 'wanted' ? wantedCards : view === 'person' ? [] : items;
  const credits = (personData?.credits ?? [])
    .filter(c => personKind === 'all' || c.item.kind === personKind)
    .slice()
    .sort((a, b) => personSort === 'newest'
      ? (b.date ?? '9999').localeCompare(a.date ?? '9999')
      : personSort === 'rating'
        ? (b.item.votes >= 50 ? b.item.rating ?? 0 : 0) - (a.item.votes >= 50 ? a.item.rating ?? 0 : 0)
        : 0);
  const pi = personData?.person;
  const personPage = view === 'person' && person && (
    <>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 18, maxWidth: 900 }}>
        <div style={{ width: 96, flex: 'none', aspectRatio: '2 / 3', borderRadius: 4, overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
          {pi?.photoUrl ? <img src={pi.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : <Icon name="User" size={28} />}
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <strong style={{ fontSize: 18, fontWeight: 600 }}>{pi?.name ?? person.name}</strong>
          {pi && (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {[
                pi.knownFor ? `Known for ${pi.knownFor.toLowerCase()}` : null,
                pi.birthday ? `Born ${fmtDate(pi.birthday)}${pi.birthplace ? ` in ${pi.birthplace}` : ''}` : null,
                pi.deathday ? `Died ${fmtDate(pi.deathday)}` : null,
              ].filter(Boolean).join(' · ')}
            </span>
          )}
          {pi?.biography && (
            <span style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 720 }} className={bioOpen ? '' : 'clamp-3'}>
              {pi.biography}
            </span>
          )}
          {pi && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 2 }}>
              {pi.biography && pi.biography.length > 320 && <Button size="xs" variant="ghost" onClick={() => setBioOpen(o => !o)}>{bioOpen ? 'Less' : 'More'}</Button>}
              <Button size="xs" variant="ghost" icon="ExternalLink" iconSize={12} onClick={() => window.open(pi.tmdbUrl, '_blank', 'noopener')}>TMDB</Button>
              {pi.imdbId && <Button size="xs" variant="ghost" icon="ExternalLink" iconSize={12} onClick={() => window.open(`https://www.imdb.com/name/${pi.imdbId}/`, '_blank', 'noopener')}>IMDb</Button>}
            </div>
          )}
        </div>
      </div>
      {personData ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, flexWrap: 'wrap' }}>
            <div className="seg" role="tablist" aria-label="Kind">
              {(['all', 'movie', 'tv'] as const).map(k => {
                const n = k === 'all' ? personData.credits.length : personData.credits.filter(c => c.item.kind === k).length;
                return (
                  <button key={k} type="button" role="tab" aria-selected={personKind === k} className={personKind === k ? 'on' : ''} onClick={() => setPersonKind(k)}>
                    {`${k === 'all' ? 'All' : k === 'movie' ? 'Movies' : 'Series'} (${n})`}
                  </button>
                );
              })}
            </div>
            <div style={{ width: 150 }}>
              <Select value={personSort} options={[{ value: 'popular', label: 'Most popular' }, { value: 'newest', label: 'Newest' }, { value: 'rating', label: 'Highest rated' }]} onChange={e => setPersonSort(e.target.value as 'popular' | 'newest' | 'rating')} aria-label="Sort" />
            </div>
            {(() => {
              const have = personData.credits.filter(c => c.status.serverId).length;
              return have > 0 ? <span style={{ fontSize: 11, color: 'var(--muted)' }}>{`${have} in your library`}</span> : null;
            })()}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: '16px 14px', alignItems: 'start' }}>
            {credits.map(c => card({ item: c.item, status: c.status }, [c.item.year, c.role].filter(Boolean).join(' · ')))}
          </div>
          {!credits.length && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Nothing here.</div>}
        </>
      ) : !error && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}><span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>Loading...</span>
      )}
    </>
  );
  const grid = (
    <div data-screen-label="Discover" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Toolbar label="Discover">
        <span style={{ fontSize: 11, color: 'var(--muted)', padding: '0 4px', whiteSpace: 'nowrap' }}>
          {view === 'person' ? `${person?.name ?? ''}${personData ? ` · ${plural(personData.credits.length, 'title')}` : ''}` : view === 'wanted' ? `Download list · ${[wantedCards.length ? plural(wantedCards.length, 'title') : null, wantedEpisodes.length ? plural(wantedEpisodes.length, 'episode') : null].filter(Boolean).join(' · ') || 'empty'}` : `${kindLabel} · ${heading}${total ? ` · ${total.toLocaleString('en-GB')} results` : ''}`}
        </span>
        <Spacer />
        <div style={{ width: 260 }}>
          <SearchBox value={query} onChange={v => { setQuery(v); if (v) setView('browse'); }} placeholder={`Search ${kindLabel.toLowerCase()} on TMDB`} />
        </div>
      </Toolbar>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {!hasTmdb ? (
          <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
            <EmptyState icon="Compass" title="Discover needs a TMDB key">Add a TMDB API key in Settings → Metadata providers. The same key is used for matching movies.</EmptyState>
          </div>
        ) : (
          <>
            {error && <div style={{ fontSize: 11, color: 'var(--error)', paddingBottom: 12 }}>{error}</div>}
            {personPage}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: '16px 14px', alignItems: 'start' }}>
              {shown.map(c => card(c))}
            </div>
            {view === 'wanted' && wantedEpisodes.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: wantedCards.length ? 24 : 0, maxWidth: 900 }}>
                <Eyebrow>{`Episodes · ${wantedEpisodes.length}`}</Eyebrow>
                <div style={{ border: '1px solid var(--border)', borderRadius: 4 }}>
                  {wantedEpisodes.map(w => {
                    const it = w.item;
                    const st = w.status;
                    const server = servers.find(x => x.id === it.serverId);
                    return (
                      <div key={it.id} className="hov-row" style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 38, padding: '4px 10px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ width: 54, flex: 'none', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{epCode({ season: it.season ?? 0, episode: it.episode ?? 0 })}</span>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span className="ellipsis" style={{ fontSize: 12 }}>{it.title}</span>
                          {it.episodeTitle && <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{it.episodeTitle}</span>}
                        </div>
                        <span style={{ width: 150, flex: 'none', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: st.serverId ? 'var(--accent)' : st.seedboxPath ? 'var(--warning)' : 'var(--muted)' }}>
                          {st.serverId ? <><Icon name="CircleCheck" size={12} />{`In library${server ? ` · ${server.name}` : ''}`}</> : st.seedboxPath ? <><Icon name="Download" size={12} />On the seedbox</> : 'Waiting for the seedbox'}
                        </span>
                        <div style={{ width: 150, flex: 'none', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          {!st.serverId && st.seedboxPath && server && (
                            <Button size="xs" icon="Download" iconSize={12} onClick={async () => {
                              try { await api.download([st.seedboxPath!], [server.id]); await reloadTransfers(); note(`Downloading ${it.title} ${epCode({ season: it.season ?? 0, episode: it.episode ?? 0 })} to ${server.name}.`); } catch (e) { fail(e); }
                            }}>Get</Button>
                          )}
                          <Button size="xs" variant="ghost" icon="LayoutGrid" iconSize={12} onClick={() => {
                            setUi({ libServer: it.serverId!, libSel: null, libShow: it.titleKey, libSeason: it.season, epSel: null, libView: null, libMatch: null, libType: 'all' });
                            setTab('library');
                          }}>Library</Button>
                          <Button size="xs" variant="ghost" icon="X" iconSize={12} aria-label="Remove from download list" onClick={async () => { await api.removeWantedId(it.id).catch(fail); loadWanted(); }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {view === 'browse' && !loading && !error && !items.length && (
              <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                <EmptyState icon="Search" title="Nothing found">Try other filters or another search.</EmptyState>
              </div>
            )}
            {view === 'wanted' && !wanted.length && (
              <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                <EmptyState icon="List" title="Your download list is empty">Browse and choose + on anything you want. It shows up here with its status: wanted, on the seedbox, in the library.</EmptyState>
              </div>
            )}
            {view === 'browse' && (loading || page < totalPages) && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 4px' }}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}><span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>Loading...</span>
                  : <Button icon="ChevronDown" onClick={() => fetchPage(page + 1, false)}>Load more</Button>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ---- series: seasons and episodes ------------------------------------------------------
  const sd = detail && drill && detail.details.item.id === drill.id ? detail.details : null;
  const seasons = sd?.seasonList ?? [];
  const have = (n: number) => (seasonData?.inLibrary.includes(n) ? 'lib' : seasonData?.onSeedbox.includes(n) ? 'seed' : null);
  const episodeRow = (e: DiscoverEpisode) => {
    const soon = upcoming(e);
    const rel = e.aired ? relDay(e.aired) : null;
    const h = have(e.episode);
    return (
      <div key={e.episode} className={'disc-ep' + (soon ? ' soon' : '')}>
        <div className="disc-ep-still">
          {e.stillUrl ? <img src={e.stillUrl} alt="" loading="lazy" /> : <span>{epCode(e)}</span>}
        </div>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', flex: 'none' }}>{e.episode}</span>
            <strong className="ellipsis" style={{ fontSize: 12, fontWeight: 500 }} title={e.title}>{e.title}</strong>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {[e.runtimeMinutes ? `${e.runtimeMinutes} min` : null, e.rating != null ? `★ ${e.rating.toFixed(1)}` : null].filter(Boolean).join(' · ')}
          </span>
          {e.overview && <span className="disc-ep-text">{e.overview}</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, textAlign: 'right', flex: 'none' }}>
          {e.aired ? (
            <>
              <span style={{ fontSize: 11, color: soon ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{fmtDay(e.aired)}</span>
              {soon && rel && <span className="pill-new">{rel}</span>}
              {!soon && rel && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{rel}</span>}
            </>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Date not announced</span>
          )}
          {h === 'lib' && <span style={{ fontSize: 10, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="CircleCheck" size={12} />In library</span>}
          {h === 'seed' && <span style={{ fontSize: 10, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="Download" size={12} />On seedbox</span>}
        </div>
      </div>
    );
  };
  const eps = seasonData?.season.episodes ?? [];
  const aired = eps.filter(e => !upcoming(e)).length;
  const series = drill && (
    <div data-screen-label="Discover series" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Toolbar label="Series">
        <Button variant="ghost" size="sm" icon="ArrowLeft" onClick={() => setDrill(null)}>Back</Button>
        <span className="ellipsis" style={{ fontSize: 12, fontWeight: 600, padding: '0 4px' }}>{sd?.item.title ?? drill.title}</span>
        {sd?.item.year && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{sd.item.year}</span>}
        <Spacer />
        {seasons.length > 8 && (
          <div style={{ width: 160 }}>
            <Select value={season != null ? String(season) : ''} options={seasons.map(x => ({ value: String(x.number), label: x.name }))} onChange={ev => setSeason(+ev.target.value)} aria-label="Season" />
          </div>
        )}
      </Toolbar>
      {seasons.length > 1 && seasons.length <= 8 && (
        <div className="disc-seasons" role="tablist">
          {seasons.map(x => (
            <button key={x.number} type="button" role="tab" aria-selected={x.number === season} className={x.number === season ? 'on' : ''} onClick={() => setSeason(x.number)}>
              {x.name}
            </button>
          ))}
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {seasonError ? (
          <div style={{ fontSize: 11, color: 'var(--error)' }}>{seasonError}</div>
        ) : !seasonData ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}><span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>Loading episodes...</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 900 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <strong style={{ fontSize: 14, fontWeight: 600 }}>{seasonData.season.name}</strong>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {[
                  plural(eps.length, 'episode'),
                  seasonData.season.aired ? (daysFromToday(seasonData.season.aired) > 0 ? `Premieres ${fmtDay(seasonData.season.aired)}` : `Premiered ${fmtDay(seasonData.season.aired)}`) : null,
                  eps.length && aired < eps.length ? `${aired} of ${eps.length} aired` : null,
                  seasonData.serverName && seasonData.inLibrary.length ? `${seasonData.inLibrary.length} in your library` : null,
                ].filter(Boolean).join(' · ')}
              </span>
              {seasonData.season.overview && <span style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 680 }}>{seasonData.season.overview}</span>}
            </div>
            {eps.length ? <div style={{ display: 'flex', flexDirection: 'column' }}>{eps.map(episodeRow)}</div> : <Hint>TMDB has no episodes for this season yet.</Hint>}
          </div>
        )}
      </div>
    </div>
  );
  const main = series || grid;

  // ---- details ---------------------------------------------------------------------------
  let dock: JSX.Element;
  if (sel && detail) {
    const it = detail.details.item;
    const s = detail.status;
    const actions = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {s.serverId ? (
          <>
            <span style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="CircleCheck" size={14} />{`In your library on ${s.serverName}`}</span>
            {it.kind === 'tv' && s.wanted && (() => {
              const w = wanted.find(x => !x.item.isEpisode && x.item.kind === 'tv' && x.item.tmdbId === it.id)?.status;
              return w && (w.waiting || w.ready || w.upcoming)
                ? <span style={{ fontSize: 11, color: 'var(--muted)' }}>{[w.ready ? `${w.ready} on the seedbox` : null, w.waiting ? `${w.waiting} waiting for the seedbox` : null, w.upcoming ? `${w.upcoming} upcoming` : null].filter(Boolean).join(' · ')}</span>
                : null;
            })()}
            <div style={{ display: 'flex', gap: 6 }}><Button variant="primary" icon="Play" size="sm" onClick={() => openInLibrary(s)}>Open in library</Button></div>
          </>
        ) : s.seedboxPath ? (
          <>
            <span style={{ fontSize: 12, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="Download" size={14} />On the seedbox, not downloaded</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant="primary" icon="Download" size="sm" disabled={!local} onClick={() => download(s.seedboxPath!, it.title)}>{servers.length > 1 ? `Download to ${local?.name}` : 'Download'}</Button>
            </div>
          </>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Not on the seedbox or in your library.</span>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button icon={s.wanted ? 'Check' : 'Plus'} size="sm" variant={s.wanted ? 'default' : s.serverId ? 'ghost' : 'primary'} onClick={() => toggleWanted({ kind: it.kind, id: it.id, title: it.title, year: it.year, posterUrl: it.posterUrl?.replace('/w500/', '/w342/') ?? null }, s.wanted)}>
            {s.wanted ? 'On your download list' : 'Add to download list'}
          </Button>
          {detail.details.trailerUrl && <Button icon="Play" size="sm" variant="ghost" onClick={() => window.open(detail.details.trailerUrl!, '_blank', 'noopener')}>Trailer</Button>}
        </div>
      </div>
    );
    dock = (
      <TmdbDetailsPanel
        detail={detail}
        actions={actions}
        activeSeason={drill?.id === it.id ? season : null}
        onSeason={n => openSeries(it.id, it.title, n)}
        onPerson={(id, name) => openPerson(id, name)}
      />
    );
  } else if (sel) {
    dock = <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}><span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>Loading...</span>;
  } else {
    // A series in the library counts as done only when no episode is still to come.
    const pending = (w: WantedEntry) => !!(w.status.waiting || w.status.ready || w.status.upcoming);
    const onSeed = wanted.filter(w => (w.status.seedboxPath && !w.status.serverId) || w.status.ready).length;
    const got = wanted.filter(w => w.status.serverId && !pending(w)).length;
    dock = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Download list</Eyebrow>
          <span style={{ fontSize: 12 }}>{[plural(wantedCards.length, 'title'), wantedEpisodes.length ? plural(wantedEpisodes.length, 'episode') : null].filter(Boolean).join(' · ')}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{`${onSeed} on the seedbox · ${got} in your library · ${wanted.length - onSeed - got} waiting`}</span>
        </div>
        <Hint>Select a title to see its ratings, cast and trailer, and whether you already have it. Choose + on a poster to add it to your download list.</Hint>
        {view === 'wanted' && got > 0 && (
          <Field label="Tidy up">
            <Button size="sm" icon="X" onClick={async () => {
              for (const w of wanted.filter(x => x.status.serverId && !pending(x))) await api.removeWantedId(w.item.id).catch(() => undefined);
              loadWanted();
            }}>{`Remove ${got} you have`}</Button>
          </Field>
        )}
      </>
    );
  }

  return <Workbench commands={commands} sidebar={sidebar} main={main} dock={dock} />;
}
