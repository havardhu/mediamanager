import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { CalendarEntry } from '../api/types';
import { Button, Icon, Spacer, Toolbar } from '../ds';
import { epCode } from '../lib/format';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PER_DAY = 3;

/** Local yyyy-MM-dd. */
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const calendarId = (e: CalendarEntry) => `${e.titleKey ?? e.wantedId}|${e.season}|${e.episode}`;

/** How an episode stands: in the library, on the seedbox, wanted, airing later, or released but not here. */
export function calendarState(e: CalendarEntry, today: string): 'have' | 'seed' | 'wanted' | 'upcoming' | 'missing' {
  if (e.available) return 'have';
  if (e.onSeedbox) return 'seed';
  if (e.date > today) return e.wanted ? 'wanted' : 'upcoming';
  return e.wanted ? 'wanted' : 'missing';
}

interface Props {
  serverId: string;
  /** Poster URL for a library title. */
  art: (key: string) => string;
  selected: string | null;
  onSelect: (e: CalendarEntry | null) => void;
  onEntries?: (entries: CalendarEntry[]) => void;
  /** Bumped by the parent to refetch (after adding to the download list, a finished download...). */
  reloadKey?: number;
  /** Rendered at the start of the toolbar (the Titles / Calendar toggle). */
  lead?: ReactNode;
}

/**
 * Month view of episode air dates for series in the library and on the download list.
 * Weeks start on Monday; six weeks are shown so a month never jumps in height.
 */
export function ReleaseCalendar({ serverId, art, selected, onSelect, onEntries, reloadKey, lead }: Props) {
  const today = iso(new Date());
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });
  const [entries, setEntries] = useState<CalendarEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const start = useMemo(() => addDays(month, -((month.getDay() + 6) % 7)), [month]);
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(start, i)), [start]);
  const from = iso(days[0]);
  const to = iso(days[41]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api.calendar(serverId, from, to)
      .then(r => { if (!cancelled) { setEntries(r); onEntries?.(r); } })
      .catch(e => { if (!cancelled) { setEntries([]); setError(e instanceof Error ? e.message : String(e)); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverId, from, to, reloadKey]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalendarEntry[]>();
    for (const e of entries ?? []) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [entries]);

  const shift = (n: number) => { setOpen(null); setMonth(m => new Date(m.getFullYear(), m.getMonth() + n, 1)); };
  const label = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const inMonth = (entries ?? []).filter(e => e.date.slice(0, 7) === iso(month).slice(0, 7));
  const upcoming = inMonth.filter(e => e.date >= today).length;

  const chip = (e: CalendarEntry) => {
    const st = calendarState(e, today);
    const id = calendarId(e);
    const poster = e.titleKey && e.hasPoster ? art(e.titleKey) : e.posterUrl;
    return (
      <button
        key={id}
        type="button"
        className={`cal-chip ${st}${e.wantedId ? ' ghost' : ''}${selected === id ? ' on' : ''}`}
        title={`${e.series} ${epCode(e)} · ${e.title}`}
        onClick={ev => { ev.stopPropagation(); onSelect(selected === id ? null : e); }}
      >
        <span className="cal-thumb">{poster && <img src={poster} alt="" loading="lazy" />}</span>
        <span className="cal-text">
          <span className="ellipsis cal-series">{e.series}</span>
          <span className="cal-code">
            {st === 'have' && <Icon name="Check" size={10} />}
            {st === 'seed' && <Icon name="Download" size={10} />}
            {st === 'wanted' && <Icon name="List" size={10} />}
            {epCode(e)}
          </span>
        </span>
      </button>
    );
  };

  return (
    <div data-screen-label="Release calendar" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Toolbar label="Release calendar">
        {lead}
        <Button size="sm" variant="ghost" icon="ChevronLeft" aria-label="Previous month" onClick={() => shift(-1)} />
        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 120, textAlign: 'center' }}>{label}</span>
        <Button size="sm" variant="ghost" icon="ChevronRight" aria-label="Next month" onClick={() => shift(1)} />
        <Button size="sm" variant="ghost" onClick={() => { setOpen(null); const n = new Date(); setMonth(new Date(n.getFullYear(), n.getMonth(), 1)); }}>Today</Button>
        <span style={{ fontSize: 11, color: 'var(--muted)', paddingLeft: 6, whiteSpace: 'nowrap' }}>
          {entries == null ? 'Loading...' : `${inMonth.length} episodes${upcoming ? ` · ${upcoming} still to air` : ''}`}
        </span>
        <Spacer />
      </Toolbar>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {error && <div style={{ fontSize: 11, color: 'var(--error)', paddingBottom: 10 }}>{error}</div>}
        <div className="cal-grid" role="grid" aria-label={label}>
          {WEEKDAYS.map(d => <div key={d} className="cal-wd" role="columnheader">{d}</div>)}
          {days.map(d => {
            const key = iso(d);
            const list = byDay.get(key) ?? [];
            const expanded = open === key;
            const shown = expanded ? list : list.slice(0, PER_DAY);
            return (
              <div
                key={key}
                role="gridcell"
                className={'cal-day' + (d.getMonth() !== month.getMonth() ? ' out' : '') + (key === today ? ' today' : '') + (key < today ? ' past' : '') + (expanded ? ' open' : '')}
              >
                <span className="cal-num">{d.getDate()}</span>
                {shown.map(chip)}
                {list.length > PER_DAY && (
                  <button type="button" className="cal-more" onClick={() => setOpen(expanded ? null : key)}>
                    {expanded ? 'Show less' : `+${list.length - PER_DAY} more`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="cal-legend" style={{ paddingTop: 10 }}>
          <span className="cal-key have">In library</span>
          <span className="cal-key seed">On seedbox</span>
          <span className="cal-key wanted">On download list</span>
          <span className="cal-key upcoming">Not aired yet</span>
          <span className="cal-key missing">Aired, not here</span>
          <span className="cal-key ghost">Dashed: series not in your library</span>
        </div>
        {entries != null && entries.length === 0 && !error && (
          <div style={{ fontSize: 11, color: 'var(--muted)', paddingTop: 12 }}>
            No episodes air in these weeks. Series in your library and series on your download list show up here; their air dates come from TVDB or TMDB and are refreshed twice a day.
          </div>
        )}
      </div>
    </div>
  );
}
