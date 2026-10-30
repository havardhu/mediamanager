import type { CSSProperties, ReactNode } from 'react';
import type { DiscoverDetails } from '../api/types';
import { Eyebrow, Hint, Icon } from '../ds';
import { epCode, fmtDay, plural, relDay } from '../lib/format';

interface Props {
  detail: DiscoverDetails;
  /** Status and buttons under the ratings (download list, trailer; in Discover also library / seedbox). */
  actions?: ReactNode;
  /** The season highlighted in the season list. */
  activeSeason?: number | null;
  onSeason?: (season: number) => void;
  /** A cast or crew name was chosen: show everything with that person. */
  onPerson?: (id: string, name: string) => void;
}

/**
 * The TMDB page of a movie or series: artwork, ratings, next episode, seasons, overview, people.
 * Used by Discover and by the Details tab of a library title.
 */
export function TmdbDetailsPanel({ detail, actions, activeSeason, onSeason, onPerson }: Props) {
  const d = detail.details;
  const it = d.item;
  const r = detail.ratings;
  const facts = [
    it.year,
    it.kind === 'tv' ? (d.seasons ? plural(d.seasons, 'season') : null) : d.runtimeMinutes ? `${Math.floor(d.runtimeMinutes / 60)}h ${d.runtimeMinutes % 60}m` : null,
    it.kind === 'tv' && d.status ? d.status : null,
  ].filter(Boolean).join(' · ');
  const chip = (label: string, value: string, href?: string) => (
    <a key={label} href={href} target="_blank" rel="noreferrer" className="rating-chip" style={{ pointerEvents: href ? 'auto' : 'none' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <strong>{value}</strong>
    </a>
  );
  const person = (p: { name: string; id: string | null }, extra?: CSSProperties) => (
    <button type="button" className="link-btn ellipsis" style={extra} disabled={!p.id || !onPerson} title={`Everything with ${p.name}`} onClick={() => p.id && onPerson?.(p.id, p.name)}>{p.name}</button>
  );

  return (
    <>
      {it.backdropUrl && (
        <div style={{ aspectRatio: '16 / 9', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
          <img src={it.backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <strong style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{it.title}</strong>
        <span style={{ color: 'var(--muted)', fontSize: 11 }}>{facts}</span>
        {it.genres.length > 0 && <span style={{ color: 'var(--muted)', fontSize: 11 }}>{it.genres.join(', ')}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {it.rating != null && chip('TMDB', `★ ${it.rating.toFixed(1)}`, d.tmdbUrl)}
        {r?.imdb != null && chip('IMDb', r.imdb.toFixed(1), r.imdbUrl)}
        {r?.rottenTomatoes != null && chip('RT', `${r.rottenTomatoes}%`)}
        {r?.metacritic != null && chip('Metacritic', String(r.metacritic))}
      </div>
      {!detail.ratingsAvailable && <Hint>For IMDb, Rotten Tomatoes and Metacritic scores, add a free OMDb key in Settings → Metadata providers.</Hint>}

      {actions}

      {it.kind === 'tv' && d.nextEpisode && (
        <div className="disc-next">
          <Eyebrow>Next episode</Eyebrow>
          <span style={{ fontSize: 12 }}>{`${epCode(d.nextEpisode)} · ${d.nextEpisode.title}`}</span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {d.nextEpisode.aired ? [fmtDay(d.nextEpisode.aired), relDay(d.nextEpisode.aired)].filter(Boolean).join(' · ') : 'Date not announced'}
          </span>
        </div>
      )}
      {it.kind === 'tv' && (d.seasonList?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Eyebrow style={{ marginBottom: 4 }}>Seasons</Eyebrow>
          {d.seasonList!.map(x => (
            <button key={x.number} type="button" className={'disc-season-row' + (activeSeason === x.number ? ' on' : '')} disabled={!onSeason} onClick={() => onSeason?.(x.number)}>
              <span className="ellipsis" style={{ flex: 1, minWidth: 0 }}>{x.name}</span>
              <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>{[plural(x.episodes, 'episode'), x.aired?.slice(0, 4)].filter(Boolean).join(' · ')}</span>
              {onSeason && <Icon name="ChevronRight" size={12} />}
            </button>
          ))}
        </div>
      )}
      {d.tagline && <div style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--muted)' }}>{d.tagline}</div>}
      {it.overview && <div style={{ fontSize: 11, lineHeight: 1.6, color: 'var(--muted)' }}>{it.overview}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: '5px 10px', fontSize: 11 }}>
        {(d.makers?.length ? true : !!d.credit) && (
          <>
            <span style={{ color: 'var(--muted)' }}>{it.kind === 'tv' ? 'Created by' : 'Director'}</span>
            <span>
              {d.makers?.length
                ? d.makers.map((m, i) => <span key={m.name}>{i > 0 && ', '}{person(m)}</span>)
                : d.credit}
            </span>
          </>
        )}
        {d.network && (<><span style={{ color: 'var(--muted)' }}>Network</span><span>{d.network}</span></>)}
        {it.kind === 'tv' && d.episodes != null && (<><span style={{ color: 'var(--muted)' }}>Episodes</span><span>{d.episodes}</span></>)}
        {it.votes > 0 && (<><span style={{ color: 'var(--muted)' }}>Votes</span><span>{it.votes.toLocaleString('en-GB')} on TMDB{r?.imdbVotes ? ` · ${r.imdbVotes.toLocaleString('en-GB')} on IMDb` : ''}</span></>)}
      </div>
      {d.cast.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>Cast</Eyebrow>
          {d.cast.map(c => (
            <div key={c.name + c.character} style={{ display: 'flex', gap: 8, fontSize: 11 }}>
              {person(c, { minWidth: 0, flex: 1, textAlign: 'left' })}
              <span style={{ minWidth: 0, flex: 1, color: 'var(--muted)' }} className="ellipsis">{c.character}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
