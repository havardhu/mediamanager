import { useState, type MouseEvent } from 'react';
import { api } from '../api/client';
import type { MediaServer } from '../api/types';
import { useApp } from '../app/AppContext';
import { capacityOf } from '../app/capacity';
import { Workbench } from '../app/Workbench';
import {
  Button, ButtonRow, Checkbox, EmptyState, Eyebrow, Hint, Icon, IconButton, Modal, SearchBox, Separator,
  Spacer, StatusDot, SummaryCard, ToolButton, Toolbar, TreeGroup, TreeItem,
} from '../ds';
import { fmtBytes, fmtDate, localPath, plural, remotePath } from '../lib/format';
import { isStructural, pendingFiles, syncOf, type SNode } from '../lib/seedboxTree';

const VIDEO = /\.(mkv|mp4|m4v|avi|mov|webm|ts|m4b|m4a|mp3|flac)$/i;

export function SeedboxTab() {
  const app = useApp();
  const { listing, tree, servers, local, tm, transfers, ui, setUi, note, fail, setListing, reloadTransfers, reloadListing, winW, setTab } = app;
  const [modal, setModal] = useState<null | 'del' | 'dl'>(null);
  const [picks, setPicks] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const connected = !!listing?.configured && (listing.connected || !!listing.refreshedUtc);
  const multi = servers.length > 1;
  const root = listing?.mediaRoot || '/';
  const paused = transfers.paused;
  const cap = capacityOf(listing, tree, servers.map(s => s.id));

  // Current folder; fall back to the root when it disappeared (deleted or root changed).
  const cwdNode: SNode | null = tree ? tree.byPath.get(ui.cwd) ?? tree.root : null;
  const selNodes = (tree ? ui.sel.map(p => tree.byPath.get(p)).filter(Boolean) : []) as SNode[];
  const targets = selNodes.length ? selNodes : cwdNode ? [cwdNode] : [];
  const targetFiles = targets.flatMap(t => t.files);

  // ---- sidebar tree --------------------------------------------------------------------
  const q = ui.q.trim().toLowerCase();
  const inside = (path: string, anc: string) => path === anc || path.startsWith(anc + '/');
  const categories = tree ? tree.root.children.filter(c => c.dir) : [];

  // ---- rows ----------------------------------------------------------------------------
  const kids = connected && cwdNode ? cwdNode.children : [];
  const rowsAll = kids.map(n => {
    const states = servers.map(s => syncOf(n.files, s, tm, paused));
    return { n, states, localKey: states[0]?.key };
  });
  const rowsF = rowsAll.filter(r => ui.filter === 'all' || (ui.filter === 'synced' ? r.localKey === 'synced' : r.localKey !== 'synced'));
  const sel = new Set(ui.sel);
  const allSel = rowsF.length > 0 && rowsF.every(r => sel.has(r.n.path));
  const someSel = !allSel && rowsF.some(r => sel.has(r.n.path));

  const clickRow = (path: string, e: MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const s = new Set(ui.sel);
      if (s.has(path)) s.delete(path);
      else s.add(path);
      setUi({ sel: [...s] });
    } else if (e.shiftKey && ui.sel.length) {
      const ids = rowsF.map(r => r.n.path);
      const a = ids.indexOf(ui.sel[ui.sel.length - 1]);
      const b = ids.indexOf(path);
      const [x, y] = a < b ? [a, b] : [b, a];
      setUi({ sel: ids.slice(Math.max(0, x), y + 1) });
    } else setUi({ sel: [path] });
  };

  const crumbs: SNode[] = [];
  for (let n: SNode | null = cwdNode; n; n = n.parent) crumbs.unshift(n);

  // ---- commands ------------------------------------------------------------------------
  const dlPending = servers.some(s => pendingFiles(targets, s.id, tm).length > 0);
  const delOk = connected && targets.length > 0 && targets.every(t => !isStructural(t));
  const downloadLabel = multi ? 'Download...' : `Download to ${local?.name ?? 'this PC'}`;

  const refresh = async () => {
    setBusy(true);
    try {
      const l = await api.refreshSeedbox();
      setListing(l);
      note(`Seedbox listing refreshed. ${plural(l.entries.filter(e => !e.dir).length, 'file')} under ${l.mediaRoot}.`);
    } catch (e) {
      fail(e);
      reloadListing();
    } finally {
      setBusy(false);
    }
  };

  const queue = async (serverIds: string[]) => {
    try {
      const res = await api.download(targets.map(t => t.path), serverIds);
      setModal(null);
      setUi({ panelOpen: true });
      await reloadTransfers();
      const files = res.reduce((a, r) => a + r.files, 0);
      const bytes = res.reduce((a, r) => a + r.bytes, 0);
      const names = res.map(r => r.serverName).join(' and ');
      note(files
        ? `Queued ${plural(files, 'file')} for ${names}. ${fmtBytes(bytes)} to transfer.`
        : `Nothing to download. Every file is already on ${names} or queued.`);
    } catch (e) {
      fail(e);
    }
  };

  const download = () => {
    if (multi) {
      setPicks(local ? { [local.id]: true } : {});
      setModal('dl');
    } else if (local) queue([local.id]);
  };

  const confirmDelete = async () => {
    const paths = targets.filter(t => !isStructural(t)).map(t => t.path);
    const label = paths.length === 1 ? paths[0].split('/').pop() : `${paths.length} items`;
    try {
      const r = await api.deleteFromSeedbox(paths);
      setModal(null);
      // Move out of a deleted folder.
      let cwd = ui.cwd;
      while (cwd && paths.some(p => inside(cwd, p))) cwd = cwd.includes('/') ? cwd.slice(0, cwd.lastIndexOf('/')) : '';
      setUi({ sel: [], cwd });
      await Promise.all([reloadListing(), reloadTransfers()]);
      note(`Deleted ${label} from the seedbox. ${fmtBytes(r.freedBytes)} freed.` +
        (r.onlyCopy ? ` ${plural(r.onlyCopy, 'file')} had no copy on a media server.` : ' Copies on media servers stay unchanged.'));
    } catch (e) {
      setModal(null);
      fail(e);
      reloadListing();
    }
  };

  const togglePause = async () => {
    try {
      app.setTransfers(await api.pauseTransfers(!paused));
    } catch (e) {
      fail(e);
    }
  };

  const commands = (
    <>
      <Button variant="ghost" icon="RefreshCw" disabled={!listing?.configured || busy || listing?.refreshing} onClick={refresh}>
        {busy || listing?.refreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      <Separator />
      <Button variant="primary" icon="Download" disabled={!connected || !dlPending} onClick={download}>
        {downloadLabel}
      </Button>
      <Button variant="danger" icon="Trash2" disabled={!delOk} onClick={() => setModal('del')}>
        Delete from seedbox
      </Button>
      <Separator />
      <Button variant="ghost" icon={paused ? 'Play' : 'Pause'} onClick={togglePause}>
        {paused ? 'Resume transfers' : 'Pause transfers'}
      </Button>
    </>
  );

  // ---- sidebar -------------------------------------------------------------------------
  const sidebar = (
    <>
      <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.7px', textTransform: 'uppercase', color: 'var(--muted)' }}>Seedbox storage</span>
          <span style={{ fontSize: 11, color: 'var(--text)' }}>{cap.usedLabel}</span>
        </div>
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <div style={{ background: 'var(--status-ready)', width: cap.syncedPct }} />
          <div style={{ background: 'var(--accent)', width: cap.remotePct }} />
          <div style={{ background: 'var(--muted)', opacity: 0.45, width: cap.otherPct }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
          <Legend color="var(--status-ready)" label="On a media server" value={cap.synced} />
          <Legend color="var(--accent)" label="Seedbox only" value={cap.remote} />
          <Legend color="var(--muted)" faded label="Outside media root" value={cap.other} />
          <Legend outline label="Free" value={cap.free} />
        </div>
        {cap.warn && <div style={{ fontSize: 11, lineHeight: 1.65, color: 'var(--warning)' }}>{cap.warnText}</div>}
      </div>
      <div style={{ padding: '10px 12px 6px' }}>
        <SearchBox value={ui.q} onChange={v => setUi({ q: v })} placeholder="Filter folders..." label="Filter folders" />
      </div>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 8 }}>
        {connected && categories.map(c => {
          const items = c.children.filter(n => n.dir && (!q || n.name.toLowerCase().includes(q)));
          const expanded = !ui.collapsed[c.path] || !!q;
          return (
            <div key={c.path}>
              <TreeGroup
                icon="Folder"
                label={c.name}
                count={c.children.filter(n => n.dir).length}
                expanded={expanded}
                onToggle={() => setUi({ collapsed: { ...ui.collapsed, [c.path]: !ui.collapsed[c.path] }, cwd: c.path, sel: [] })}
              />
              {expanded && items.map(n => (
                <TreeItem key={n.path} icon="Folder" label={n.name} selected={inside(ui.cwd, n.path)} onClick={() => setUi({ cwd: n.path, sel: [] })} />
              ))}
            </div>
          );
        })}
      </div>
    </>
  );

  // ---- main ----------------------------------------------------------------------------
  const filters = [
    { id: 'all' as const, label: 'All', icon: 'List' },
    { id: 'remote' as const, label: `Not on ${local?.name ?? 'this PC'}`, icon: 'Cloud' },
    { id: 'synced' as const, label: 'Synced', icon: 'CircleCheck' },
  ];
  const tableMin = 420 + servers.length * 128;

  const main = (
    <div data-screen-label="Seedbox" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Toolbar label="Folder navigation">
        <IconButton icon="ArrowUp" label="Up one folder" size="sm" disabled={!cwdNode?.parent || !connected} onClick={() => cwdNode?.parent && setUi({ cwd: cwdNode.parent.path, sel: [] })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, overflow: 'hidden', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          {connected && crumbs.map((c, i) => (
            <span key={c.path || '/'} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {i > 0 && <span style={{ color: 'var(--muted)', display: 'flex' }}><Icon name="ChevronRight" size={12} /></span>}
              <button
                type="button"
                className="hov-crumb"
                onClick={() => setUi({ cwd: c.path, sel: [] })}
                style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 11, padding: '3px 5px', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', color: i === crumbs.length - 1 ? 'var(--text)' : 'var(--muted)' }}
              >
                {i === 0 ? root : c.name}
              </button>
            </span>
          ))}
        </div>
        <Spacer />
        {filters.map(f => (
          <ToolButton key={f.id} icon={f.icon} label={f.label} showLabel={winW >= 1280} title={f.label} active={ui.filter === f.id} onClick={() => setUi({ filter: f.id })} />
        ))}
      </Toolbar>
      {connected ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <div style={{ minWidth: tableMin }}>
            <div style={{ position: 'sticky', top: 0, zIndex: 1, display: 'flex', alignItems: 'center', gap: 10, height: 28, padding: '0 12px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 600, letterSpacing: '.7px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              <div style={{ width: 16, display: 'flex' }} onClick={e => e.stopPropagation()}>
                <Checkbox label="" checked={allSel} indeterminate={someSel} onChange={c => setUi({ sel: c ? rowsF.map(r => r.n.path) : [] })} />
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>Name</div>
              <div style={{ width: 78, textAlign: 'right' }}>Size</div>
              <div style={{ width: 96 }}>Modified</div>
              {servers.map(s => (
                <div key={s.id} className="ellipsis" style={{ width: 118 }}>{s.name}</div>
              ))}
            </div>
            {rowsF.map(r => {
              const on = sel.has(r.n.path);
              return (
                <div
                  key={r.n.path}
                  className="hov-row"
                  onClick={e => clickRow(r.n.path, e)}
                  onDoubleClick={() => r.n.dir && setUi({ cwd: r.n.path, sel: [] })}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, height: 30, padding: '0 12px', borderBottom: '1px solid var(--border)', cursor: 'default', userSelect: 'none', background: on ? 'var(--accent-soft)' : 'transparent' }}
                >
                  <div style={{ width: 16, display: 'flex' }} onClick={e => e.stopPropagation()}>
                    <Checkbox
                      label=""
                      checked={on}
                      onChange={c => {
                        const s = new Set(ui.sel);
                        if (c) s.add(r.n.path);
                        else s.delete(r.n.path);
                        setUi({ sel: [...s] });
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
                    <span style={{ display: 'flex', color: r.n.dir ? 'var(--accent)' : 'var(--muted)' }}>
                      <Icon name={r.n.dir ? 'Folder' : VIDEO.test(r.n.name) ? 'File' : 'FileText'} size={14} />
                    </span>
                    <span className="ellipsis" title={r.n.name}>{r.n.name}</span>
                    {r.n.dir && <span style={{ color: 'var(--muted)', fontSize: 11, whiteSpace: 'nowrap' }}>{plural(r.n.files.length, 'file')}</span>}
                  </div>
                  <div style={{ width: 78, textAlign: 'right', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{fmtBytes(r.n.size)}</div>
                  <div style={{ width: 96, color: 'var(--muted)', fontSize: 11 }}>{fmtDate(r.n.dir ? r.n.latest ?? r.n.modified : r.n.modified)}</div>
                  {r.states.map((st, i) => (
                    <div key={servers[i].id} style={{ width: 118, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {st.dot ? (
                        <>
                          <StatusDot status={st.dot} />
                          <span>{st.label}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>{st.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
            {rowsF.length === 0 && (
              <div style={{ padding: '28px 16px', color: 'var(--muted)', fontSize: 11, textAlign: 'center' }}>
                {listing?.refreshing && !rowsAll.length ? 'Listing the seedbox...' : rowsAll.length ? 'Nothing here matches the filter.' : 'This folder is empty.'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 }}>
          {listing?.configured ? (
            <>
              <EmptyState icon="CloudOff" title={listing.refreshing ? 'Connecting to the seedbox...' : 'Seedbox not reachable'}>
                {listing.refreshing ? `Listing ${listing.mediaRoot} on ${listing.host}.` : listing.error ?? 'Refresh to try again.'}
              </EmptyState>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="primary" icon="RefreshCw" disabled={busy || listing.refreshing} onClick={refresh}>Try again</Button>
                <Button icon="Settings" onClick={() => { setUi({ setSec: 'conn' }); setTab('settings'); }}>Seedbox settings</Button>
              </div>
            </>
          ) : (
            <>
              <EmptyState icon="CloudOff" title="Connect your seedbox">
                Enter the FTP or SFTP address and the media root folder. The folders under that root become your library structure.
              </EmptyState>
              <Button variant="primary" icon="Settings" onClick={() => { setUi({ setSec: 'conn' }); setTab('settings'); }}>Open seedbox settings</Button>
            </>
          )}
        </div>
      )}
    </div>
  );

  // ---- dock ----------------------------------------------------------------------------
  let dock = null;
  if (connected && cwdNode) {
    const one = targets.length === 1 ? targets[0] : null;
    const totalSize = targetFiles.reduce((a, f) => a + f.size, 0);
    const latest = targetFiles.reduce<string | null>((a, f) => (f.modified && (!a || f.modified > a) ? f.modified : a), null);
    const srvIds = new Set(servers.map(s => s.id));
    const unsyncedAll = targetFiles.filter(f => !f.servers.some(s => srvIds.has(s)));
    const syncedLocal = local ? targetFiles.filter(f => f.servers.includes(local.id)).reduce((a, f) => a + f.size, 0) : 0;
    let hint: string;
    if (!delOk) hint = 'Category folders belong to the media root and cannot be deleted here. Select the items inside instead.';
    else if (!targetFiles.length) hint = 'Empty folder.';
    else if (!unsyncedAll.length) hint = `Every file is on a media server. Deleting frees ${fmtBytes(totalSize)} on the seedbox; local copies stay.`;
    else if (unsyncedAll.length === targetFiles.length) hint = 'Seedbox only. Download before deleting, or the files are gone for good.';
    else hint = `${unsyncedAll.length} of ${targetFiles.length} files exist only on the seedbox.`;
    const fields = [
      ...(one ? [{ label: 'Seedbox path', value: remotePath(root, one.path), mono: true }] : []),
      { label: 'Size', value: fmtBytes(totalSize) + (syncedLocal && syncedLocal < totalSize && local ? ` · ${fmtBytes(syncedLocal)} on ${local.name}` : ''), mono: false },
      { label: 'Modified', value: fmtDate(latest), mono: false },
    ];
    dock = (
      <>
        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent)', display: 'flex', paddingTop: 1 }}>
            <Icon name={one ? (one.dir ? 'FolderOpen' : 'File') : 'Copy'} size={16} />
          </span>
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <strong style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.35 }}>
              {one ? (one.parent ? one.name : root) : `${targets.length} items selected`}
            </strong>
            <span style={{ color: 'var(--muted)', fontSize: 11 }}>
              {one ? (one.dir ? `Folder · ${plural(targetFiles.length, 'file')}` : 'File') : plural(targetFiles.length, 'file')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {fields.map(f => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{f.label}</span>
              <span style={{ fontFamily: f.mono ? 'var(--font-mono)' : 'inherit', fontSize: f.mono ? 11 : 12, wordBreak: 'break-all', lineHeight: 1.45 }}>{f.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Media servers</Eyebrow>
          {servers.map(s => {
            const st = syncOf(targetFiles, s, tm, paused);
            return (
              <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, flex: 1 }}>{s.name}</span>
                  {st.dot ? (
                    <>
                      <StatusDot status={st.dot} />
                      <span style={{ fontSize: 11 }}>{st.label}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{st.label}</span>
                  )}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', wordBreak: 'break-all', lineHeight: 1.45 }}>
                  {one ? localPath(s.libraryRoot, one.path) : s.libraryRoot}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Button variant="primary" icon="Download" wide disabled={!dlPending} onClick={download}>{downloadLabel}</Button>
          <Button variant="danger" icon="Trash2" wide disabled={!delOk} onClick={() => setModal('del')}>Delete from seedbox</Button>
          <Hint>{hint}</Hint>
        </div>
      </>
    );
  }

  // ---- modals --------------------------------------------------------------------------
  let modals = null;
  if (modal === 'del') {
    const del = targets.filter(t => !isStructural(t));
    const F = del.flatMap(t => t.files);
    const srvIds = new Set(servers.map(s => s.id));
    const only = F.filter(f => !f.servers.some(s => srvIds.has(s)));
    const inflight = F.filter(f => servers.some(s => tm.has(f.path + '|' + s.id))).length;
    const risky = only.length > 0 || inflight > 0;
    const parentPath = del[0]?.parent?.path ?? '';
    modals = (
      <Modal eyebrow="Delete from seedbox" title={del.length === 1 ? `Delete ${del[0].name}?` : `Delete ${del.length} items?`} width="460px" onClose={() => setModal(null)}>
        <SummaryCard
          title={`${fmtBytes(F.reduce((a, f) => a + f.size, 0))} freed on the seedbox`}
          lines={[
            `${plural(F.length, 'file')} · ${remotePath(root, parentPath)}/`,
            ...servers.map(s => `${s.name}: ${syncOf(F, s, tm, paused).label.toLowerCase()}`),
          ]}
        />
        {risky && (
          <div style={{ fontSize: 11, lineHeight: 1.65, color: 'var(--error)' }}>
            {[
              only.length ? `${only.length} ${only.length === 1 ? 'file is' : 'files are'} not on any media server. Deleting removes the only copy.` : '',
              inflight ? `${inflight} active or queued ${inflight === 1 ? 'transfer is' : 'transfers are'} cancelled.` : '',
            ].filter(Boolean).join(' ')}
          </div>
        )}
        <Hint>Copies on media servers stay unchanged. Deleting from the seedbox cannot be undone.</Hint>
        <ButtonRow>
          <Button onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="danger" icon="Trash2" onClick={confirmDelete}>{only.length ? 'Delete anyway' : 'Delete from seedbox'}</Button>
        </ButtonRow>
      </Modal>
    );
  }
  if (modal === 'dl') {
    let n = 0;
    let bytes = 0;
    const rows = servers.map((s: MediaServer) => {
      const P = pendingFiles(targets, s.id, tm);
      const sz = P.reduce((a, f) => a + f.size, 0);
      if (picks[s.id] && P.length) {
        n += P.length;
        bytes += sz;
      }
      return { s, P, sz };
    });
    modals = (
      <Modal eyebrow="Download" title={targets.length === 1 ? `Download ${targets[0].name || root}` : `Download ${targets.length} items`} width="460px" onClose={() => setModal(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(({ s, P, sz }) => (
            <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 4, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Checkbox label={s.name} checked={!!picks[s.id] && P.length > 0} disabled={!P.length} onChange={c => setPicks({ ...picks, [s.id]: c })} />
              <span style={{ fontSize: 11, color: 'var(--muted)', paddingLeft: 21, lineHeight: 1.5 }}>
                {!P.length
                  ? 'Already on this server or queued.'
                  : `${plural(P.length, 'file')} · ${fmtBytes(sz)} → ${localPath(s.libraryRoot, targets[0]?.path ?? '')}${s.status.online ? '' : '. Offline: starts when that PC is back.'}`}
              </span>
            </div>
          ))}
        </div>
        <Hint>Files already on a server are skipped. Folders are created to match the seedbox.</Hint>
        <ButtonRow>
          <Button onClick={() => setModal(null)}>Cancel</Button>
          <Button variant="primary" icon="Download" disabled={!n} onClick={() => queue(Object.keys(picks).filter(k => picks[k]))}>
            {n ? `Queue ${fmtBytes(bytes)}` : 'Queue'}
          </Button>
        </ButtonRow>
      </Modal>
    );
  }

  return <Workbench commands={commands} sidebar={sidebar} main={main} dock={dock ?? <></>} modals={modals} />;
}

function Legend({ color, label, value, faded, outline }: { color?: string; label: string; value: string; faded?: boolean; outline?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, boxSizing: 'border-box', background: outline ? 'transparent' : color, border: outline ? '1px solid var(--border)' : undefined, opacity: faded ? 0.45 : 1 }} />
      <span style={{ color: 'var(--muted)', flex: 1 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
