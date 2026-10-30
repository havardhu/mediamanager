import type { SeedboxEntry, Transfer, MediaServer } from '../api/types';
import type { Status } from '../ds';

export interface SNode {
  path: string;
  name: string;
  dir: boolean;
  size: number;
  modified: string | null;
  servers: string[];
  parent: SNode | null;
  children: SNode[];
  /** Every file at or below this node (just itself for a file). */
  files: SNode[];
  /** Latest modification time of any file below. */
  latest: string | null;
}

export interface STree {
  root: SNode;
  byPath: Map<string, SNode>;
}

/** Builds the folder tree from the flat listing. Folders sort before files. */
export function buildTree(entries: SeedboxEntry[]): STree {
  const root: SNode = { path: '', name: '', dir: true, size: 0, modified: null, servers: [], parent: null, children: [], files: [], latest: null };
  const byPath = new Map<string, SNode>([['', root]]);
  const ensureDir = (path: string): SNode => {
    const found = byPath.get(path);
    if (found) return found;
    const i = path.lastIndexOf('/');
    const parent = ensureDir(i < 0 ? '' : path.slice(0, i));
    const n: SNode = { path, name: i < 0 ? path : path.slice(i + 1), dir: true, size: 0, modified: null, servers: [], parent, children: [], files: [], latest: null };
    parent.children.push(n);
    byPath.set(path, n);
    return n;
  };
  for (const e of entries) {
    if (e.dir) {
      const d = ensureDir(e.path);
      d.modified = e.modified;
      continue;
    }
    const i = e.path.lastIndexOf('/');
    const parent = ensureDir(i < 0 ? '' : e.path.slice(0, i));
    const n: SNode = { path: e.path, name: i < 0 ? e.path : e.path.slice(i + 1), dir: false, size: e.size, modified: e.modified, servers: e.servers, parent, children: [], files: [], latest: e.modified };
    n.files = [n];
    parent.children.push(n);
    byPath.set(e.path, n);
  }
  const fill = (n: SNode) => {
    if (!n.dir) return;
    n.children.sort((a, b) => (a.dir === b.dir ? a.name.localeCompare(b.name) : a.dir ? -1 : 1));
    for (const c of n.children) {
      fill(c);
      for (const f of c.files) n.files.push(f);
      n.size += c.size;
      if (c.latest && (!n.latest || c.latest > n.latest)) n.latest = c.latest;
    }
  };
  fill(root);
  return { root, byPath };
}

export type TransferMap = Map<string, Transfer>;

/** Unfinished transfers by "path|server". */
export function transferMap(items: Transfer[]): TransferMap {
  const m: TransferMap = new Map();
  for (const t of items) if (t.status !== 'done') m.set(t.path + '|' + t.serverId, t);
  return m;
}

export interface SyncState {
  key: 'empty' | 'dl' | 'q' | 'failed' | 'synced' | 'partial' | 'off' | 'none';
  label: string;
  dot?: Status;
  muted?: boolean;
}

/** Sync state of a set of files on one server, worded like the design. */
export function syncOf(files: SNode[], server: MediaServer, tm: TransferMap, paused: boolean): SyncState {
  if (!files.length) return { key: 'empty', label: 'Empty', muted: true };
  let s = 0, sb = 0, tot = 0, act = 0, q = 0, failed = 0, prog = 0;
  for (const f of files) {
    tot += f.size;
    if (f.servers.includes(server.id)) {
      s++;
      sb += f.size;
      continue;
    }
    const t = tm.get(f.path + '|' + server.id);
    if (!t) continue;
    if (t.status === 'active') {
      act++;
      prog += t.transferred;
    } else if (t.status === 'failed') failed++;
    else {
      q++;
      prog += t.transferred;
    }
  }
  const p = tot ? Math.floor(((sb + prog) / tot) * 100) : 0;
  if (act) return { key: 'dl', label: (paused ? 'Paused ' : 'Downloading ') + p + '%', dot: 'live' };
  if (q) return { key: 'q', label: server.status.online ? (paused ? 'Paused · queued' : 'Queued') : 'Queued · offline', dot: 'live' };
  if (failed) return { key: 'failed', label: failed === files.length ? 'Failed' : `${failed} failed`, dot: 'error' };
  if (s === files.length) return { key: 'synced', label: 'Synced', dot: 'ready' };
  if (s > 0) return { key: 'partial', label: `${s} of ${files.length} files`, dot: 'pending' };
  if (!server.status.online) return { key: 'off', label: 'Offline', muted: true };
  return { key: 'none', label: 'Not synced', muted: true };
}

/** Files that are not on the server and not already queued for it. */
export function pendingFiles(nodes: SNode[], serverId: string, tm: TransferMap): SNode[] {
  const out: SNode[] = [];
  for (const n of nodes)
    for (const f of n.files) {
      if (f.servers.includes(serverId)) continue;
      const t = tm.get(f.path + '|' + serverId);
      if (t && t.status !== 'failed') continue;
      out.push(f);
    }
  return out;
}

export const isStructural = (n: SNode) => !n.path || !n.path.includes('/');
