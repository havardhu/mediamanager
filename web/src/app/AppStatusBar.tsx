import { Icon, StatusBar, StatusDot, StatusItem } from '../ds';
import { fmtSpeed } from '../lib/format';
import { useApp } from './AppContext';
import { capacityOf } from './capacity';

export function AppStatusBar() {
  const { status, listing, tree, servers, transfers, local, news, setTab, setUi } = useApp();
  const cap = capacityOf(listing, tree, servers.map(s => s.id));
  const sb = status?.seedbox;
  const connected = !!sb?.configured && !!sb.connected;
  const act = transfers.items.filter(t => t.status === 'active');
  const qd = transfers.items.filter(t => t.status === 'queued');
  const speed = act.reduce((a, t) => a + t.bytesPerSecond, 0);
  const multi = servers.length > 1;
  const conn = !sb ? 'Seedbox status unknown' : !sb.configured ? 'Seedbox not configured' : connected ? `Seedbox connected · ${sb.protocol.toUpperCase()}` : sb.refreshing ? 'Connecting to seedbox...' : 'Seedbox not connected';
  const xfer = transfers.paused ? 'Transfers paused' : act.length ? `${act.length} active · ${qd.length} queued · ${fmtSpeed(speed)}` : qd.length ? `${qd.length} queued` : 'No active transfers';
  const srv = multi
    ? `${servers.length} media servers · ${servers.filter(s => !s.status.online).length} offline`
    : local ? `${local.name} · ${local.libraryRoot}` : '';

  return (
    <StatusBar>
      <StatusItem>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <StatusDot status={status ? 'ready' : 'error'} />
          {status ? (status.service.isWindowsService ? 'Service running' : 'Running in console') : 'Service unreachable'}
        </span>
      </StatusItem>
      <StatusItem>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} title={sb?.error ?? undefined}>
          <StatusDot status={connected ? 'ready' : sb?.refreshing ? 'live' : 'error'} />
          {conn}
        </span>
      </StatusItem>
      <StatusItem>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          {cap.short}
          {cap.known && (
            <span style={{ display: 'inline-flex', width: 60, height: 4, borderRadius: 2, overflow: 'hidden', background: 'var(--bg)' }}>
              <span style={{ background: 'var(--accent)', width: cap.usedPct }} />
            </span>
          )}
        </span>
      </StatusItem>
      <StatusItem grow>
        <span />
      </StatusItem>
      {news.length > 0 && (
        <StatusItem>
          <button
            type="button"
            onClick={() => { setTab('library'); setUi({ libView: 'new', libMatch: null, libShow: null, libSeason: null, epSel: null }); }}
            title={news.slice(0, 6).map(n => `${n.title} S${String(n.episode.season).padStart(2, '0')}E${String(n.episode.episode).padStart(2, '0')}`).join('\n')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 0, background: 'transparent', color: 'var(--accent)', font: 'inherit', cursor: 'pointer', padding: 0 }}
          >
            <Icon name="Bell" size={12} />
            {news.length === 1 ? '1 new episode' : `${news.length} new episodes`}
          </button>
        </StatusItem>
      )}
      <StatusItem>{xfer}</StatusItem>
      <StatusItem>{srv}</StatusItem>
    </StatusBar>
  );
}
