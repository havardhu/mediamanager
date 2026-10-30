import { api } from '../api/client';
import type { Transfer } from '../api/types';
import { Badge, Button, Icon, IconButton, Progress } from '../ds';
import { fmtBytes, fmtEta, fmtSpeed } from '../lib/format';
import { useApp } from './AppContext';
import { Resizer, useStoredSize } from './Resizer';

const SEASON = /^(season|sesong|s)[ ._-]?\d{1,2}$/i;

function titleOf(path: string): string {
  const segs = path.split('/');
  if (segs.length < 2) return '';
  const parent = segs[segs.length - 2];
  if (segs.length >= 3 && SEASON.test(parent)) return segs[segs.length - 3] + ' / ' + parent;
  return parent;
}

export function TransfersPanel() {
  const { transfers, setTransfers, reloadTransfers, servers, settings, ui, setUi, fail, note } = useApp();
  const paused = transfers.paused;
  const srvName = (id: string) => servers.find(s => s.id === id)?.name ?? id;
  const items = transfers.items.filter(t => servers.length === 0 || servers.some(s => s.id === t.serverId));
  const act = items.filter(t => t.status === 'active');
  const qd = items.filter(t => t.status === 'queued');
  const failed = items.filter(t => t.status === 'failed');
  const done = items.filter(t => t.status === 'done').sort((a, b) => (b.completedUtc ?? '').localeCompare(a.completedUtc ?? ''));
  const speed = paused ? 0 : act.reduce((a, t) => a + t.bytesPerSecond, 0);
  const rows = [...act, ...qd, ...failed, ...done.slice(0, 8)];
  const parallel = settings?.transfers.parallel ?? 3;
  const [height, setHeight] = useStoredSize('transfers', 170);
  const maxH = Math.max(80, Math.round(window.innerHeight * 0.7));
  const summary = paused ? 'Paused' : act.length ? `${fmtSpeed(speed)} · up to ${parallel} at a time` : done.length ? 'Idle' : '';

  const togglePause = async () => {
    try {
      setTransfers(await api.pauseTransfers(!paused));
    } catch (e) {
      fail(e);
    }
  };
  const clear = async () => {
    try {
      await api.clearTransfers();
      await reloadTransfers();
    } catch (e) {
      fail(e);
    }
  };
  const cancel = async (t: Transfer) => {
    try {
      await api.cancelTransfer(t.id);
      await reloadTransfers();
    } catch (e) {
      fail(e);
    }
  };
  const retry = async (t: Transfer) => {
    try {
      await api.retryTransfer(t.id);
      await reloadTransfers();
      note(`Retrying ${t.path.split('/').pop()}.`);
    } catch (e) {
      fail(e);
    }
  };

  const statusText = (t: Transfer) => {
    if (t.status === 'done') return 'Completed · ' + fmtBytes(t.size);
    if (t.status === 'failed') return 'Failed · ' + (t.error ?? 'unknown error');
    const p = t.size ? Math.floor((t.transferred / t.size) * 100) : 0;
    if (t.status === 'queued') {
      if (t.error) return `Retrying · ${t.error}`;
      return (t.transferred > 0 ? `Queued · ${p}% · ` : 'Queued · ') + fmtBytes(t.size);
    }
    if (paused) return `Paused · ${p}%`;
    const eta = fmtEta(t.size - t.transferred, t.bytesPerSecond);
    return `${p}% · ${fmtSpeed(t.bytesPerSecond)}${eta ? ' · ' + eta : ''}`;
  };

  return (
    <>
    {ui.panelOpen && <Resizer axis="y" invert value={Math.min(height, maxH)} min={60} max={maxH} defaultValue={170} onChange={setHeight} label="Resize transfers" />}
    <div style={{ flex: 'none', borderTop: ui.panelOpen ? undefined : '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 33, display: 'flex', alignItems: 'center', gap: 8, padding: '0 6px 0 4px' }}>
        <button
          type="button"
          className="hov-item"
          onClick={() => setUi({ panelOpen: !ui.panelOpen })}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 27, padding: '0 8px', border: 0, borderRadius: 3, background: 'transparent', color: 'var(--text)', fontSize: 10, fontWeight: 600, letterSpacing: '.7px', textTransform: 'uppercase', cursor: 'pointer' }}
        >
          <span style={{ display: 'flex', color: 'var(--muted)' }}>
            <Icon name={ui.panelOpen ? 'ChevronDown' : 'ChevronRight'} size={13} />
          </span>
          Transfers
        </button>
        {act.length > 0 && <Badge tone="accent">{act.length} active</Badge>}
        {qd.length > 0 && <Badge>{qd.length} queued</Badge>}
        {failed.length > 0 && <Badge tone="error">{failed.length} failed</Badge>}
        <span className="ellipsis" style={{ fontSize: 11, color: 'var(--muted)' }}>{summary}</span>
        <span style={{ flex: 1 }} />
        <Button variant="ghost" size="xs" icon={paused ? 'Play' : 'Pause'} iconSize={13} onClick={togglePause} title={paused ? 'Resume transfers' : 'Pause transfers'}>
          {paused ? 'Resume' : 'Pause'}
        </Button>
        <Button variant="ghost" size="xs" icon="Eraser" iconSize={13} disabled={!done.length && !failed.length} onClick={clear} title="Clear completed and failed">
          Clear
        </Button>
      </div>
      {ui.panelOpen && (
        <div style={{ height: Math.min(height, maxH), overflow: 'auto', borderTop: '1px solid var(--border)' }}>
          {rows.map(t => {
            const icon = t.status === 'done' ? 'CircleCheck' : t.status === 'active' ? 'Download' : t.status === 'failed' ? 'CircleAlert' : 'Clock';
            const color = t.status === 'done' ? 'var(--status-ready)' : t.status === 'active' ? 'var(--accent)' : t.status === 'failed' ? 'var(--error)' : 'var(--muted)';
            const p = t.status === 'queued' && t.transferred === 0 ? 0 : t.size ? (t.transferred / t.size) * 100 : 100;
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 30, padding: '0 8px 0 12px', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                <span style={{ display: 'flex', color }}>
                  <Icon name={icon} size={13} />
                </span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', gap: 8, alignItems: 'baseline', overflow: 'hidden' }}>
                  <span className="ellipsis" style={{ fontSize: 12 }} title={t.path}>{t.path.split('/').pop()}</span>
                  <span className="ellipsis" style={{ color: 'var(--muted)' }}>{titleOf(t.path)}</span>
                </span>
                <span className="ellipsis" style={{ width: 104, color: 'var(--muted)' }}>{srvName(t.serverId)}</span>
                <span style={{ width: 150 }}>
                  <Progress bare max={100} value={t.status === 'done' ? 100 : p} />
                </span>
                <span className="ellipsis" title={t.error ?? undefined} style={{ width: 150, color: t.status === 'failed' ? 'var(--error)' : 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {statusText(t)}
                </span>
                <span style={{ width: t.status === 'failed' ? 58 : 27, display: 'flex', gap: 4 }}>
                  {t.status === 'failed' && <IconButton icon="RotateCw" label="Retry transfer" size="sm" variant="ghost" iconSize={13} onClick={() => retry(t)} />}
                  {t.status !== 'done' && <IconButton icon="X" label="Cancel transfer" size="sm" variant="ghost" iconSize={13} onClick={() => cancel(t)} />}
                </span>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ padding: '22px 16px', color: 'var(--muted)', fontSize: 11, textAlign: 'center' }}>
              No transfers. Select files or folders on the seedbox, then choose Download.
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
