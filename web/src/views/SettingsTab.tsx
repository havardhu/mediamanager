import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { Protocol, SettingsDto, TestResult } from '../api/types';
import { useApp } from '../app/AppContext';
import { Workbench } from '../app/Workbench';
import { Button, Checkbox, Field, FieldPair, Hint, InlineStatus, SectionHeading, Select, StatusDot, TextInput, TreeGroup, TreeItem } from '../ds';

const PORTS: Record<Protocol, number> = { ftp: 21, ftps: 990, sftp: 22 };
const PROTOCOLS = [
  { value: 'ftp', label: 'FTP' },
  { value: 'ftps', label: 'FTPS' },
  { value: 'sftp', label: 'SFTP' },
];
const SECS = [
  { id: 'conn' as const, label: 'Seedbox connection', icon: 'Cloud' },
  { id: 'xfer' as const, label: 'Transfers', icon: 'ArrowUpDown' },
  { id: 'meta' as const, label: 'Metadata providers', icon: 'Tag' },
  { id: 'svc' as const, label: 'Service', icon: 'Server' },
];

/** Secrets come back empty; null on save means "keep the stored value". */
function editable(s: SettingsDto): SettingsDto {
  return {
    seedbox: { ...s.seedbox, password: null },
    transfers: { ...s.transfers },
    metadata: { ...s.metadata, tmdbApiKey: null, tvdbApiKey: null, openSubtitlesApiKey: null, openSubtitlesPassword: null, omdbApiKey: null, tvProvider: s.metadata.tvProvider ?? 'auto' },
  };
}

export function SettingsTab() {
  const { settings, setSettings, status, ui, setUi, note, fail, reloadStatus, reloadListing } = useApp();
  const [draft, setDraft] = useState<SettingsDto | null>(settings ? editable(settings) : null);
  const [test, setTest] = useState<'testing' | TestResult | null>(null);
  const [saving, setSaving] = useState(false);
  // The quota is edited as text so "1." and "1,5" can be typed; it is parsed into the draft.
  const [quotaText, setQuotaText] = useState(settings?.seedbox.quotaTb != null ? String(settings.seedbox.quotaTb) : '');
  const [quotaInvalid, setQuotaInvalid] = useState(false);
  const resetDraft = (s: SettingsDto) => {
    setDraft(editable(s));
    setQuotaText(s.seedbox.quotaTb != null ? String(s.seedbox.quotaTb) : '');
    setQuotaInvalid(false);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const secRefs = { conn: useRef<HTMLDivElement>(null), xfer: useRef<HTMLDivElement>(null), meta: useRef<HTMLDivElement>(null), svc: useRef<HTMLDivElement>(null) };

  useEffect(() => {
    if (settings && !draft) resetDraft(settings);
  }, [settings, draft]);

  // Opened from "Open seedbox settings": scroll to the section.
  useEffect(() => {
    const el = secRefs[ui.setSec].current;
    if (scrollRef.current && el) scrollRef.current.scrollTop = el.offsetTop - 16;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clean = !draft || !settings || JSON.stringify(draft) === JSON.stringify(editable(settings));
  const d = draft;

  const setSb = (patch: Partial<SettingsDto['seedbox']>) => {
    if (!d) return;
    const sb = { ...d.seedbox, ...patch };
    if (patch.protocol && PORTS[d.seedbox.protocol] === d.seedbox.port) sb.port = PORTS[patch.protocol];
    setDraft({ ...d, seedbox: sb });
    setTest(null);
  };
  const setQuota = (text: string) => {
    setQuotaText(text);
    const t = text.trim().replace(',', '.');
    if (!t) {
      setQuotaInvalid(false);
      setSb({ quotaTb: null });
      return;
    }
    const n = Number(t);
    const ok = /^\d*\.?\d*$/.test(t) && isFinite(n) && n > 0;
    setQuotaInvalid(!ok);
    if (ok) setSb({ quotaTb: n });
  };
  const setMeta = (patch: Partial<SettingsDto['metadata']>) => d && setDraft({ ...d, metadata: { ...d.metadata, ...patch } });

  const runTest = async () => {
    if (!d) return;
    setTest('testing');
    try {
      setTest(await api.testSettings(d));
    } catch (e) {
      setTest({ ok: false, message: e instanceof Error ? e.message : String(e) });
    }
  };

  const save = async () => {
    if (!d || clean || saving) return;
    if (quotaInvalid) {
      note('Settings not saved. The storage quota must be a number of TB, such as 1.5.', true);
      return;
    }
    if (!d.seedbox.host.trim() || !d.seedbox.mediaRoot.trim()) {
      setTest({ ok: false, message: !d.seedbox.host.trim() ? 'Enter a host first.' : 'Enter the media root folder.' });
      note('Settings not saved. Enter the seedbox host and media root folder.', true);
      return;
    }
    setSaving(true);
    const wasConfigured = !!status?.seedbox.configured;
    try {
      const saved = await api.saveSettings(d);
      setSettings(saved);
      resetDraft(saved);
      reloadStatus();
      setTimeout(reloadListing, 500);
      setTimeout(reloadStatus, 300);
      note(wasConfigured
        ? 'Settings saved. The service picks up the changes immediately.'
        : 'Seedbox connected. Browse the media root on the Seedbox tab and download what you want.');
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  };

  const revert = () => {
    if (settings) resetDraft(settings);
    setTest(null);
  };

  // Ctrl+S / Cmd+S saves.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const restart = async () => {
    try {
      const r = await api.restartService();
      note(r.message);
      setTimeout(reloadStatus, 5000);
    } catch (e) {
      fail(e);
    }
  };

  const commands = (
    <>
      <Button variant="primary" icon="Save" disabled={clean || saving} onClick={save}>{saving ? 'Saving...' : 'Save changes'}</Button>
      <Button variant="ghost" icon="Undo2" disabled={clean} onClick={revert}>Revert</Button>
    </>
  );

  const sidebar = (
    <div style={{ flex: 1, overflow: 'auto', padding: '6px 0' }}>
      <TreeGroup icon="Settings" label="Settings" expanded />
      {SECS.map(s => (
        <TreeItem
          key={s.id}
          icon={s.icon}
          label={s.label}
          selected={ui.setSec === s.id}
          onClick={() => {
            setUi({ setSec: s.id });
            const el = secRefs[s.id].current;
            if (scrollRef.current && el) scrollRef.current.scrollTop = el.offsetTop - 16;
          }}
        />
      ))}
    </div>
  );

  const secretPh = (set: boolean, fallback = '') => (set ? 'Saved · type to replace' : fallback);
  const testing = test === 'testing';
  const testResult = test && test !== 'testing' ? test : null;
  const url = status?.service.urls[0] ?? window.location.origin;

  const main = !d ? (
    <div style={{ flex: 1, padding: 24, color: 'var(--muted)' }}>Loading settings...</div>
  ) : (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
    <div data-screen-label="Settings" ref={scrollRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', position: 'relative' }}>
      <div style={{ maxWidth: 560, padding: '20px 24px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div ref={secRefs.conn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeading flush>Seedbox connection</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '110px minmax(0,1fr) 80px', gap: 10 }}>
            <Field label="Protocol">
              <Select value={d.seedbox.protocol} options={PROTOCOLS} onChange={e => setSb({ protocol: e.target.value as Protocol })} />
            </Field>
            <Field label="Host">
              <TextInput mono value={d.seedbox.host} onChange={e => setSb({ host: e.target.value })} placeholder="seedbox.example.net" invalid={!!testResult && !testResult.ok && !d.seedbox.host} />
            </Field>
            <Field label="Port">
              <TextInput mono value={String(d.seedbox.port)} onChange={e => setSb({ port: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })} />
            </Field>
          </div>
          <FieldPair>
            <Field label="Username">
              <TextInput value={d.seedbox.username} onChange={e => setSb({ username: e.target.value })} autoComplete="off" />
            </Field>
            <Field label="Password">
              <TextInput type="password" value={d.seedbox.password ?? ''} placeholder={secretPh(d.seedbox.passwordSet)} onChange={e => setSb({ password: e.target.value || null })} autoComplete="new-password" />
            </Field>
          </FieldPair>
          <Field label="Media root folder">
            <TextInput mono value={d.seedbox.mediaRoot} onChange={e => setSb({ mediaRoot: e.target.value })} placeholder="/home/user/media" />
          </Field>
          <Hint>Every media server mirrors the folders under this path. Changing it later remaps the whole library; existing local files are not moved or deleted.</Hint>
          <FieldPair>
            <Field label="Storage quota (TB)">
              <TextInput mono value={quotaText} onChange={e => setQuota(e.target.value)} placeholder="Disk size reported by the seedbox" invalid={quotaInvalid} inputMode="decimal" />
            </Field>
            <Field label="Refresh listing every (minutes)">
              <TextInput mono value={String(d.seedbox.refreshMinutes)} onChange={e => setSb({ refreshMinutes: parseInt(e.target.value.replace(/\D/g, '') || '0', 10) })} />
            </Field>
          </FieldPair>
          <Hint>Shared seedboxes report the whole disk, not your share. Enter your quota in TB, such as 1.5, to use it for the storage bar; leave it empty to use what the seedbox reports. Set the refresh interval to 0 to list only when you choose Refresh.</Hint>
          {d.seedbox.protocol === 'ftps' && (
            <Checkbox label="Accept self-signed certificates" checked={d.seedbox.acceptAnyCertificate} onChange={c => setSb({ acceptAnyCertificate: c })} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Button icon="Plug" onClick={runTest} disabled={testing}>Test connection</Button>
            {testing && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Connecting to {d.seedbox.host || 'the seedbox'}...</span>}
            {testResult?.ok && <InlineStatus>{testResult.message}</InlineStatus>}
            {testResult && !testResult.ok && <span style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--error)' }}>{testResult.message}</span>}
          </div>
        </div>

        <div ref={secRefs.xfer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeading flush>Transfers</SectionHeading>
          <div style={{ width: 160 }}>
            <Field label="Parallel transfers">
              <Select value={String(d.transfers.parallel)} options={['1', '2', '3', '4', '6', '8']} onChange={e => setDraft({ ...d, transfers: { parallel: +e.target.value } })} />
            </Field>
          </div>
          <Hint>Files downloaded at the same time, across all media servers. Higher values help with many small files; most seedboxes cap total bandwidth either way.</Hint>
        </div>

        <div ref={secRefs.meta} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeading flush>Metadata providers</SectionHeading>
          <FieldPair>
            <Field label="TMDB API key">
              <TextInput mono type="password" value={d.metadata.tmdbApiKey ?? ''} placeholder={secretPh(d.metadata.tmdbApiKeySet, 'Movies')} onChange={e => setMeta({ tmdbApiKey: e.target.value || null })} autoComplete="off" />
            </Field>
            <Field label="TVDB API key">
              <TextInput mono type="password" value={d.metadata.tvdbApiKey ?? ''} placeholder={secretPh(d.metadata.tvdbApiKeySet, 'Series')} onChange={e => setMeta({ tvdbApiKey: e.target.value || null })} autoComplete="off" />
            </Field>
          </FieldPair>
          <FieldPair>
            <Field label="Series are matched with">
              <Select
                value={d.metadata.tvProvider ?? 'auto'}
                options={[
                  { value: 'auto', label: 'TVDB if it has a key, else TMDB' },
                  { value: 'tmdb', label: 'TMDB' },
                  { value: 'tvdb', label: 'TVDB' },
                ]}
                onChange={e => setMeta({ tvProvider: e.target.value as 'auto' | 'tmdb' | 'tvdb' })}
              />
            </Field>
            <Field label="OMDb API key (IMDb ratings)">
              <TextInput mono type="password" value={d.metadata.omdbApiKey ?? ''} placeholder={secretPh(d.metadata.omdbApiKeySet, 'Free from omdbapi.com')} onChange={e => setMeta({ omdbApiKey: e.target.value || null })} autoComplete="off" />
            </Field>
          </FieldPair>
          <Hint>TMDB covers series too (seasons, episodes, air dates), so TVDB is optional; it mainly helps with unusual episode orders such as anime. Changing this applies to new matches; use Fix match or Refresh metadata to move an existing series. OMDb adds IMDb, Rotten Tomatoes and Metacritic scores in Library and Discover (free key, 1,000 lookups a day; results are cached for a week).</Hint>
          <Field label="OpenSubtitles API key">
            <TextInput mono type="password" value={d.metadata.openSubtitlesApiKey ?? ''} placeholder={secretPh(d.metadata.openSubtitlesApiKeySet, 'From opensubtitles.com/consumers')} onChange={e => setMeta({ openSubtitlesApiKey: e.target.value || null })} autoComplete="off" />
          </Field>
          <FieldPair>
            <Field label="OpenSubtitles username">
              <TextInput value={d.metadata.openSubtitlesUsername} onChange={e => setMeta({ openSubtitlesUsername: e.target.value })} autoComplete="off" />
            </Field>
            <Field label="OpenSubtitles password">
              <TextInput type="password" value={d.metadata.openSubtitlesPassword ?? ''} placeholder={secretPh(d.metadata.openSubtitlesPasswordSet)} onChange={e => setMeta({ openSubtitlesPassword: e.target.value || null })} autoComplete="new-password" />
            </Field>
          </FieldPair>
          <Field label="Subtitle languages">
            <TextInput mono value={d.metadata.subtitleLanguages} onChange={e => setMeta({ subtitleLanguages: e.target.value })} placeholder="en, no" />
          </Field>
          <Checkbox label="Write .nfo files and artwork next to media files" checked={d.metadata.writeSidecars} onChange={c => setMeta({ writeSidecars: c })} />
          <Hint>Media files keep their seedbox names and paths. Metadata is stored as sidecar files, so the folder structure stays identical on every server. Audiobooks use embedded tags.</Hint>
        </div>

        <div ref={secRefs.svc} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionHeading flush>Service</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '130px minmax(0,1fr)', gap: '8px 10px', fontSize: 12, alignItems: 'center' }}>
            <span style={{ color: 'var(--muted)' }}>Status</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <StatusDot status={status ? 'ready' : 'error'} />
              {!status ? 'Not responding' : status.service.isWindowsService ? 'Running as a Windows service' : 'Running in a console window'}
            </span>
            <span style={{ color: 'var(--muted)' }}>Web interface</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{url}</span>
            <span style={{ color: 'var(--muted)' }}>Service name</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{status?.service.name ?? 'SeedboxSync'}</span>
            <span style={{ color: 'var(--muted)' }}>Version</span>
            <span style={{ fontSize: 11 }}>{status?.service.version ?? '–'}</span>
            <span style={{ color: 'var(--muted)' }}>Data folder</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, wordBreak: 'break-all' }}>{status?.service.dataDirectory ?? '–'}</span>
          </div>
          <Hint>The web interface only listens on this PC. Transfers continue when this page is closed.</Hint>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button icon="RotateCw" onClick={restart} disabled={!status?.service.isWindowsService}>Restart service</Button>
          </div>
        </div>
      </div>
    </div>
    <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 24px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <span style={{ fontSize: 11, color: clean ? 'var(--muted)' : 'var(--warning)', flex: 1 }}>
        {clean ? 'All changes saved.' : 'Unsaved changes · Ctrl+S saves'}
      </span>
      <Button variant="ghost" icon="Undo2" disabled={clean} onClick={revert}>Revert</Button>
      <Button variant="primary" icon="Save" disabled={clean || saving} onClick={save}>{saving ? 'Saving...' : 'Save changes'}</Button>
    </div>
    </div>
  );

  return <Workbench commands={commands} sidebar={sidebar} main={main} />;
}
