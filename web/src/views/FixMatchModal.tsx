import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { MetadataCandidate, TitleDto } from '../api/types';
import { Button, ButtonRow, Field, Hint, Modal, Select, TextInput } from '../ds';

interface Props {
  serverId: string;
  title: TitleDto;
  onClose: () => void;
  onApplied: (t: TitleDto, pick: MetadataCandidate) => void;
  onError: (e: unknown) => void;
}

function initialQuery(name: string): string {
  return name.replace(/\./g, ' ').replace(/\(?(19|20)\d{2}\)?.*$/, '').trim() || name;
}

export function FixMatchModal({ serverId, title, onClose, onApplied, onError }: Props) {
  const kind = title.kind === 'tv' ? 'tv' : 'movie';
  const [provider, setProvider] = useState(title.match.provider === 'TVDB' || title.match.provider === 'TMDB' ? title.match.provider : kind === 'tv' ? 'TVDB' : 'TMDB');
  const [q, setQ] = useState(initialQuery(title.name));
  const [results, setResults] = useState<MetadataCandidate[] | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const yearMatch = title.name.match(/(19|20)\d{2}/);
  const year = yearMatch ? +yearMatch[0] : null;

  const search = async (p = provider, query = q) => {
    setSearching(true);
    setError(null);
    setPick(null);
    try {
      setResults(await api.searchMetadata(p, kind, query, null));
    } catch (e) {
      setResults([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    search();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = async () => {
    if (pick == null || !results) return;
    const r = results[pick];
    setApplying(true);
    try {
      const t = await api.applyMatch(serverId, title.key, r.provider, r.id);
      onApplied(t, r);
    } catch (e) {
      onError(e);
    } finally {
      setApplying(false);
    }
  };

  const providers = kind === 'tv' ? ['TVDB', 'TMDB'] : ['TMDB'];

  return (
    <Modal eyebrow="Fix match" title={title.name} width="620px" gap={14} onClose={onClose}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 110 }}>
          <Field label="Provider">
            <Select value={provider} options={providers} onChange={e => { setProvider(e.target.value); search(e.target.value, q); }} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Search title">
            <TextInput value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} />
          </Field>
        </div>
        <Button icon="Search" disabled={searching} onClick={() => search()}>{searching ? 'Searching...' : 'Search'}</Button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>Folder: {title.key}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflow: 'auto' }}>
        {(results ?? []).map((r, i) => {
          const on = pick === i;
          return (
            <button
              key={r.provider + r.id}
              type="button"
              className="hov-card"
              onClick={() => setPick(i)}
              style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 8, borderRadius: 4, border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border)'), background: on ? 'var(--accent-soft)' : 'transparent', fontFamily: 'inherit', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}
            >
              <span style={{ width: 30, height: 45, flex: 'none', borderRadius: 2, background: 'var(--surface-3)', overflow: 'hidden' }}>
                {r.posterUrl && <img src={r.posterUrl} alt="" className="poster-img" loading="lazy" />}
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{r.title}{r.year ? ` (${r.year})` : ''}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {r.provider} {r.id}{r.credit ? ' · ' + r.credit : ''}{title.match.providerId === r.id ? ' · current match' : ''}
                </span>
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{r.score}%</span>
            </button>
          );
        })}
        {results && !results.length && !error && (
          <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: 'var(--muted)' }}>No results. Try the original title or remove the year.</div>
        )}
        {error && <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: 'var(--error)' }}>{error}</div>}
      </div>
      <Hint>
        Nothing changes until Apply. Artwork, .nfo and subtitles are refreshed for the new match; the media file is not renamed.
        {year ? ` The folder says ${year}.` : ''}
      </Hint>
      <ButtonRow>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="Check" disabled={pick == null || applying} onClick={apply}>{applying ? 'Applying...' : 'Apply match'}</Button>
      </ButtonRow>
    </Modal>
  );
}
