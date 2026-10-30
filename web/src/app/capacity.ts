import type { SeedboxListing } from '../api/types';
import { fmtBytes, fmtCapacity, pct } from '../lib/format';
import type { STree } from '../lib/seedboxTree';

export interface Capacity {
  known: boolean;
  usedLabel: string;
  synced: string;
  remote: string;
  other: string;
  free: string;
  syncedPct: string;
  remotePct: string;
  otherPct: string;
  usedPct: string;
  warn: boolean;
  warnText: string;
  short: string;
}

const UNKNOWN: Capacity = {
  known: false, usedLabel: 'Not connected', synced: '–', remote: '–', other: '–', free: '–',
  syncedPct: '0%', remotePct: '0%', otherPct: '0%', usedPct: '0%', warn: false, warnText: '', short: 'Storage unknown',
};

/**
 * Seedbox storage split the way the design shows it: on a media server / seedbox only /
 * outside the media root / free. A quota set in Settings wins; otherwise SFTP's disk usage
 * is used. With a quota, "outside media root" is unknown.
 */
export function capacityOf(listing: SeedboxListing | null, tree: STree | null, serverIds: string[]): Capacity {
  if (!listing || !tree || !listing.configured || (!listing.connected && !listing.refreshedUtc)) return UNKNOWN;
  const files = tree.root.files;
  const media = files.reduce((a, f) => a + f.size, 0);
  const ids = new Set(serverIds);
  const syncedAny = files.filter(f => f.servers.some(s => ids.has(s))).reduce((a, f) => a + f.size, 0);
  let cap: number;
  let used: number;
  let other: number | null;
  if (listing.quotaBytes) {
    // Your quota from Settings. The server only shows the whole disk, so what counts against
    // the quota here is what is under the media root; anything else is not visible.
    cap = listing.quotaBytes;
    used = media;
    other = null;
  } else if (listing.totalBytes && listing.freeBytes != null) {
    cap = listing.totalBytes;
    used = listing.totalBytes - listing.freeBytes;
    other = Math.max(0, used - media);
  } else {
    return {
      ...UNKNOWN, known: true, usedLabel: fmtBytes(media) + ' in media root', synced: fmtBytes(syncedAny),
      remote: fmtBytes(media - syncedAny), short: fmtBytes(media) + ' in media root',
    };
  }
  const usedRatio = cap ? used / cap : 0;
  return {
    known: true,
    usedLabel: `${fmtBytes(used)} of ${fmtCapacity(cap)}`,
    synced: fmtBytes(syncedAny),
    remote: fmtBytes(media - syncedAny),
    other: other == null ? '–' : fmtBytes(other),
    free: fmtBytes(Math.max(0, cap - used)),
    syncedPct: pct(syncedAny, cap),
    remotePct: pct(media - syncedAny, cap),
    otherPct: pct(other ?? 0, cap),
    usedPct: pct(used, cap),
    warn: usedRatio > 0.9,
    warnText: 'Seedbox is over 90% full. Delete synced items to make room; new torrents may stall.',
    short: `${fmtBytes(used)} of ${fmtCapacity(cap)}`,
  };
}
