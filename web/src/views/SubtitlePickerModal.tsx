import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SubtitleCandidate, SubtitleSearch } from '../api/types';
import { Button, ButtonRow, Field, Hint, Icon, Modal, Select } from '../ds';
import { fmtDate, langName, SUBTITLE_LANGS } from '../lib/format';

interface Props {
  serverId: string;
  titleKey: string;
  /** For an episode; omitted for a movie. */
  episodePath?: string | null;
  title: string;
  /** Languages from Settings, offered first. */
  languages: string[];
  onClose: () => void;
  onSaved: (c: SubtitleCandidate) => void;
  onError: (e: unknown) => void;
}

const ALL = '*';

function tone(score: number): { fg: string; bg: string } {
  if (score >= 75) return { fg: 'var(--status-ready)', bg: 'color-mix(in srgb, var(--status-ready) 14%, transparent)' };
  if (score >= 45) return { fg: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 14%, transparent)' };
  return { fg: 'var(--muted)', bg: 'var(--surface-2)' };
}

/**
 * Subtitle search results for one video, each with a match score: 99% when it was made for this
 * exact file, otherwise how close its release is (group, source, edition, resolution).
 */
export function SubtitlePickerModal({ serverId, titleKey, episodePath, title, languages, onClose, onSaved, onError }: Props) {
  const [lang, setLang] = useState(languages.length === 1 ? languages[0] : ALL);
  const [result, setResult] = useState<SubtitleSearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPick(null);
    api.searchSubtitles(serverId, titleKey, episodePath ?? null, lang === ALL ? null : lang)
      .then(r => { if (!cancelled) { setResult(r); setPick(r.candidates.length ? 0 : null); } })
      .catch(e => { if (!cancelled) { setResult(null); setError(e instanceof Error ? e.message : String(e)); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [serverId, titleKey, episodePath, lang]);

  const save = async () => {
    const c = pick != null ? result?.candidates[pick] : null;
    if (!c) return;
    setSaving(true);
    try {
      await api.downloadSubtitle(serverId, titleKey, episodePath ?? null, c.fileId, c.language);
      onSaved(c);
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  const options = [
    { value: ALL, label: languages.length ? `My languages (${languages.map(langName).join(', ')})` : 'All languages' },
    ...[...languages, ...SUBTITLE_LANGS.filter(l => !languages.includes(l))].map(l => ({ value: l, label: langName(l) })),
  ];
  const candidates = result?.candidates ?? [];

  return (
    <Modal eyebrow="Choose subtitles" title={title} width="720px" gap={14} onClose={onClose}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ width: 260 }}>
          <Field label="Language">
            <Select value={lang} options={options} onChange={e => setLang(e.target.value)} />
          </Field>
        </div>
        <div style={{ flex: 1, minWidth: 0, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, paddingBottom: 4 }}>
          <div className="ellipsis" style={{ fontFamily: 'var(--font-mono)' }} title={result?.release ?? ''}>Your release: {result?.release ?? '…'}</div>
          <div>{result ? (result.hashed ? 'File fingerprint sent, so subtitles made for this exact file are marked.' : 'Could not read the file, so the score uses the release name only.') : ' '}</div>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, padding: '0 10px', height: 28, alignItems: 'center', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <span style={{ width: 46 }}>Match</span>
          <span style={{ flex: 1 }}>Release</span>
          <span style={{ width: 74 }}>Language</span>
          <span style={{ width: 70, textAlign: 'right' }}>Downloads</span>
        </div>
        <div style={{ maxHeight: 330, overflow: 'auto' }}>
          {loading && (
            <div style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 11, color: 'var(--muted)' }}>
              <span className="spin" style={{ display: 'flex' }}><Icon name="LoaderCircle" size={14} /></span>Searching OpenSubtitles...
            </div>
          )}
          {!loading && error && <div style={{ padding: 18, textAlign: 'center', fontSize: 11, color: 'var(--error)' }}>{error}</div>}
          {!loading && !error && result && !candidates.length && (
            <div style={{ padding: 18, textAlign: 'center', fontSize: 11, color: 'var(--muted)' }}>No subtitles found in {lang === ALL ? 'your languages' : langName(lang)}. Try another language.</div>
          )}
          {!loading && candidates.map((c, i) => {
            const on = pick === i;
            const t = tone(c.score);
            return (
              <button
                key={c.fileId}
                type="button"
                className="hov-row"
                onClick={() => setPick(i)}
                onDoubleClick={() => { setPick(i); save(); }}
                style={{ display: 'flex', gap: 10, alignItems: 'center', width: '100%', padding: '7px 10px', border: 0, borderBottom: '1px solid var(--border)', background: on ? 'var(--accent-soft)' : 'transparent', fontFamily: 'inherit', color: 'var(--text)', textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ width: 46, flex: 'none' }}>
                  <span style={{ display: 'inline-block', minWidth: 38, textAlign: 'center', padding: '2px 0', borderRadius: 3, fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: t.fg, background: t.bg }}>{c.score}%</span>
                </span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span className="ellipsis" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }} title={c.release ?? c.fileName ?? ''}>{c.release || c.fileName || 'Unnamed'}</span>
                  <span className="ellipsis" style={{ fontSize: 11, color: c.exact ? 'var(--accent)' : 'var(--muted)' }}>
                    {c.reason}
                    {c.hearingImpaired ? ' · hearing impaired' : ''}
                    {c.fps ? ` · ${c.fps} fps` : ''}
                    {c.uploaded ? ` · ${fmtDate(c.uploaded)}` : ''}
                  </span>
                </span>
                <span style={{ width: 74, fontSize: 11 }}>{langName(c.language)}</span>
                <span style={{ width: 70, textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{c.downloads.toLocaleString('en-GB')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Hint>
        The score estimates how well a subtitle lines up with your file: 99% means it was made for this exact file; otherwise
        the same release group and source (Blu-ray, web, TV) count most. Saved next to the video as name.{'<language>'}.srt,
        replacing an earlier one in that language. Each download counts against your daily OpenSubtitles quota.
      </Hint>
      <ButtonRow>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="primary" icon="Download" disabled={pick == null || saving || loading} onClick={save}>{saving ? 'Downloading...' : 'Download'}</Button>
      </ButtonRow>
    </Modal>
  );
}
