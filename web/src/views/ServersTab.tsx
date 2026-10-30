import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DiscoveredPeer, DiscoveryState, PairingState } from '../api/types';
import { useApp } from '../app/AppContext';
import { Workbench } from '../app/Workbench';
import { Badge, Button, Eyebrow, Field, Hint, Icon, Progress, SectionHeading, StatusDot, TextInput, TreeGroup } from '../ds';
import { fmtBytes, fmtDate, fmtTime, localPath, remotePath } from '../lib/format';
import { AddServerModal } from './AddServerModal';

const hostOf = (address: string | null) => (address ?? '').replace(/^https?:\/\//, '').replace(/:\d+$/, '');

function seen(iso: string | null): string {
  if (!iso) return 'Never';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return 'Just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `Today ${fmtTime(iso)}`;
  return fmtDate(iso);
}

export function ServersTab() {
  const { servers, ui, setUi, note, fail, reloadServers, tree, listing, reloadListing } = useApp();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [titles, setTitles] = useState<{ count: number; size: number } | null>(null);
  const [discovery, setDiscovery] = useState<DiscoveryState | null>(null);
  const [pairing, setPairing] = useState<PairingState | null>(null);
  const [adding, setAdding] = useState<{ initial: DiscoveredPeer | null } | null>(null);
  const [now, setNow] = useState(Date.now());

  const sel = servers.find(s => s.id === ui.srvSel) ?? servers[0];
  const draft = sel ? drafts[sel.id] ?? sel.libraryRoot : '';
  const clean = !sel || draft === sel.libraryRoot || !draft.trim();
  const peers = discovery?.peers ?? [];

  const loadDiscovery = useCallback(() => api.discovered().then(setDiscovery).catch(() => undefined), []);
  const loadPairing = useCallback(() => api.pairing().then(setPairing).catch(() => undefined), []);

  // While this tab is open: who is on the network, this PC's pairing state, and whether the
  // remote PCs are online.
  useEffect(() => {
    api.discoverPeers().catch(() => undefined);
    loadDiscovery();
    loadPairing();
    const fast = setInterval(() => { loadDiscovery(); loadPairing(); setNow(Date.now()); }, 3000);
    const slow = setInterval(() => { reloadServers(); }, 15000);
    return () => { clearInterval(fast); clearInterval(slow); };
  }, [loadDiscovery, loadPairing, reloadServers]);

  useEffect(() => {
    if (!sel) return;
    api.library(sel.id)
      .then(l => setTitles({ count: l.titles.length, size: l.titles.reduce((a, t) => a + t.size, 0) }))
      .catch(() => setTitles(null));
  }, [sel?.id, sel?.libraryRoot]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!sel) return;
    try {
      const s = await api.updateServer(sel.id, { libraryRoot: draft.trim() });
      setDrafts(d => {
        const n = { ...d };
        delete n[sel.id];
        return n;
      });
      await reloadServers();
      setTimeout(reloadListing, 1500);
      note(`Library root for ${s.name} set to ${s.libraryRoot}. Existing files are not moved.`);
    } catch (e) {
      fail(e);
    }
  };

  const showCode = async () => {
    try {
      await api.startPairing();
      await loadPairing();
    } catch (e) {
      fail(e);
    }
  };

  const hideCode = async () => {
    try {
      await api.stopPairing();
      await loadPairing();
    } catch (e) {
      fail(e);
    }
  };

  // A sample folder to show the mapping with real names.
  const cats = tree?.root.children.filter(c => c.dir) ?? [];
  const movies = cats.find(c => /movie|film/i.test(c.name)) ?? cats[0];
  const sample = movies?.children.find(c => c.dir) ?? movies;
  const sampleRel = sample?.path ?? 'Movies/Example (2024)';

  const commands = (
    <>
      <Button variant="primary" icon="Plus" disabled={discovery?.enabled === false} onClick={() => setAdding({ initial: null })}
        title={discovery?.enabled === false ? 'LAN access is turned off in appsettings.json' : 'Add another PC running Seedbox Sync'}>
        Add media server
      </Button>
      <Button variant="ghost" icon="Save" disabled={clean} onClick={save}>Save server</Button>
    </>
  );

  const sidebar = (
    <div style={{ flex: 1, overflow: 'auto', padding: '6px 0', display: 'flex', flexDirection: 'column' }}>
      <TreeGroup icon="Monitor" label="Media servers" count={servers.length} expanded />
      {servers.map(s => (
        <button
          key={s.id}
          type="button"
          className="hov-item"
          onClick={() => setUi({ srvSel: s.id })}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', minHeight: 44, border: 0, padding: '6px 14px 6px 38px', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', background: s.id === sel?.id ? 'var(--accent-soft)' : 'transparent' }}
        >
          <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="Monitor" size={14} /></span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="ellipsis" style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</span>
            <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{s.kind === 'local' ? 'This PC' : hostOf(s.address)}</span>
          </span>
          <StatusDot status={s.status.online ? 'ready' : 'error'} label={s.status.online ? 'Online' : 'Offline'} />
        </button>
      ))}
      <div style={{ height: 10 }} />
      <TreeGroup icon="Search" label="On your network" count={peers.length} expanded />
      {peers.map(p => (
        <button
          key={p.instanceId}
          type="button"
          className="hov-item"
          onClick={() => setAdding({ initial: p })}
          title={`Add ${p.name}`}
          style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', minHeight: 44, border: 0, padding: '6px 14px 6px 38px', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'var(--text)', background: 'transparent' }}
        >
          <span style={{ color: 'var(--muted)', display: 'flex' }}><Icon name="Monitor" size={14} /></span>
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="ellipsis" style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</span>
            <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{hostOf(p.address)}</span>
          </span>
          <span style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="Plus" size={12} />Add</span>
        </button>
      ))}
      <div style={{ padding: '8px 12px 14px' }}>
        <Hint>
          {discovery?.enabled === false
            ? 'LAN access is turned off in appsettings.json, so this PC neither finds nor is found by others.'
            : peers.length
              ? 'Other PCs running Seedbox Sync on this network. Add one to download to it and manage its library from here.'
              : 'Other PCs running Seedbox Sync on this network show up here. Install it on the other PC and start it.'}
        </Hint>
      </div>
    </div>
  );

  const st = sel?.status;
  const used = st?.totalBytes != null && st.freeBytes != null ? st.totalBytes - st.freeBytes : null;
  const remote = sel?.kind === 'remote';
  const left = pairing?.code ? Math.max(0, Math.round((new Date(pairing.code.expiresUtc).getTime() - now) / 1000)) : 0;

  const thisPc = pairing && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionHeading flush>Use this PC from another PC</SectionHeading>
      {!pairing.enabled ? (
        <Hint>LAN access is turned off. To turn it on, add the Peer endpoint back to appsettings.json and restart Seedbox Sync.</Hint>
      ) : pairing.code && left > 0 ? (
        <>
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'var(--bg)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, letterSpacing: 4 }}>{pairing.code.code}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>Expires in {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</span>
          </div>
          <Hint>On the other PC, open Seedbox Sync, go to Servers and choose Add media server. Pick {pairing.name} and type this code.</Hint>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="sm" onClick={hideCode}>Stop pairing</Button>
          </div>
        </>
      ) : (
        <>
          <Hint>Another PC running Seedbox Sync can add this one as a media server, download to it and manage its library. Show a code here, then type it on the other PC.</Hint>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button icon="Link" size="sm" onClick={showCode}>Show pairing code</Button>
          </div>
        </>
      )}
      {pairing.enabled && (
        <div style={{ display: 'grid', gridTemplateColumns: '110px minmax(0,1fr)', gap: '7px 10px', fontSize: 12 }}>
          <span style={{ color: 'var(--muted)' }}>Address</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{pairing.addresses.length ? pairing.addresses.join(', ') : 'No network connection'}</span>
        </div>
      )}
      {pairing.managers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Eyebrow>PCs that use this one</Eyebrow>
          {pairing.managers.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 4 }}>
              <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="Monitor" size={14} /></span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Added {fmtDate(m.pairedUtc)} · last seen {seen(m.lastSeenUtc).toLowerCase()}{m.lastAddress ? ` · ${m.lastAddress}` : ''}</span>
              </span>
              <Button
                size="xs"
                variant="ghost"
                icon="Trash2"
                onClick={async () => {
                  try {
                    await api.removeManager(m.id);
                    await loadPairing();
                    note(`${m.name} can no longer use this PC. To use it again, pair it with a new code.`);
                  } catch (e) {
                    fail(e);
                  }
                }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const main = sel ? (
    <div data-screen-label="Servers" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <div style={{ maxWidth: 640, padding: '20px 24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--accent)', display: 'flex' }}><Icon name="Monitor" size={18} /></span>
          <span style={{ fontSize: 17, fontWeight: 600 }}>{sel.name}</span>
          <Badge tone="accent">{remote ? 'On the network' : 'This PC'}</Badge>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>
            <StatusDot status={sel.status.online ? 'ready' : 'error'} />
            {sel.status.online ? 'Online' : 'Offline'}
          </span>
        </div>
        {remote && !sel.status.online && st?.error && <div style={{ fontSize: 11, lineHeight: 1.65, color: 'var(--error)' }}>{st.error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeading flush>Library folder</SectionHeading>
          <Field label={remote ? `Library root on ${sel.name}` : 'Library root on this server'}>
            <TextInput mono value={draft} disabled={remote && !sel.status.online} onChange={e => setDrafts({ ...drafts, [sel.id]: e.target.value })} placeholder="D:\Media" />
          </Field>
          <div style={{ border: '1px solid var(--border)', borderRadius: 4, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Eyebrow>Folder mapping</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: '70px minmax(0,1fr)', gap: '5px 10px', fontSize: 11, alignItems: 'baseline' }}>
              <span style={{ color: 'var(--muted)' }}>Seedbox</span>
              <span style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{remotePath(listing?.mediaRoot || '/home/user/media', sampleRel)}</span>
              <span style={{ color: 'var(--muted)' }}>{remote ? sel.name : 'This server'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: 'var(--accent)' }}>{localPath(draft || '?', sampleRel)}</span>
            </div>
          </div>
          <Hint>The seedbox owns the folder structure. Everything under the media root is recreated here with the same folder and file names. Files outside the media root are ignored.</Hint>
          {st?.error && sel.status.online && <div style={{ fontSize: 11, lineHeight: 1.65, color: 'var(--warning)' }}>{st.error}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeading flush>Storage</SectionHeading>
          <Progress bare max={100} value={used != null && st?.totalBytes ? (used / st.totalBytes) * 100 : 0} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
            <span>{used != null && st?.totalBytes != null ? `${fmtBytes(used)} used of ${fmtBytes(st.totalBytes)} · ${fmtBytes(st.freeBytes)} free` : 'Disk usage unknown'}</span>
            <span>{titles ? `${titles.count} titles · ${fmtBytes(titles.size)}` : ''}</span>
          </div>
        </div>
        {remote ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SectionHeading flush>Connection</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '110px minmax(0,1fr)', gap: '7px 10px', fontSize: 12 }}>
              <span style={{ color: 'var(--muted)' }}>Address</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{hostOf(sel.address)}</span>
              <span style={{ color: 'var(--muted)' }}>Version</span><span>{st?.version || '–'}</span>
              <span style={{ color: 'var(--muted)' }}>Last seen</span><span>{sel.status.online ? 'Now' : seen(st?.lastSeenUtc ?? null)}</span>
            </div>
            <Hint>Downloads go straight from the seedbox to {sel.name}. Play opens files in the default player on {sel.name}. If its IP address changes, Seedbox Sync finds it again on the network.</Hint>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                variant="danger"
                icon="Trash2"
                onClick={async () => {
                  try {
                    await api.removeServer(sel.id);
                    setUi({ srvSel: 'local' });
                    await reloadServers();
                    note(`Removed ${sel.name}. Files on that PC stay; it no longer receives transfers.`);
                  } catch (e) {
                    fail(e);
                  }
                }}
              >
                Remove server
              </Button>
            </div>
          </div>
        ) : (
          thisPc
        )}
      </div>
    </div>
  ) : (
    <div style={{ flex: 1 }} />
  );

  const modals = adding && (
    <AddServerModal
      peers={peers}
      initial={adding.initial}
      onClose={() => setAdding(null)}
      onError={fail}
      onAdded={async s => {
        setAdding(null);
        await reloadServers();
        setUi({ srvSel: s.id });
        loadDiscovery();
        setTimeout(reloadListing, 3000);
        note(`Added ${s.name}. Its library is being read; downloads to it go straight from the seedbox.`);
      }}
    />
  );

  return <Workbench commands={commands} sidebar={sidebar} main={main} modals={modals} />;
}
