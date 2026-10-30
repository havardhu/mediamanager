/** 12.9 GB, 741.6 GB, 1.00 TB, 94 KB. Decimal units, like the seedbox quota. */
export function fmtBytes(bytes: number | null | undefined): string {
  if (bytes == null || !isFinite(bytes)) return '–';
  const gb = bytes / 1e9;
  if (gb >= 1000) return (gb / 1000).toFixed(2) + ' TB';
  if (gb >= 1) return gb.toFixed(1) + ' GB';
  if (bytes >= 1e6) return Math.round(bytes / 1e6) + ' MB';
  if (bytes <= 0) return '0 KB';
  return Math.max(1, Math.round(bytes / 1e3)) + ' KB';
}

/** Short capacity label: "1 TB" for exact terabytes. */
export function fmtCapacity(bytes: number): string {
  const tb = bytes / 1e12;
  if (tb >= 1 && Math.abs(tb - Math.round(tb)) < 0.005) return Math.round(tb) + ' TB';
  return fmtBytes(bytes);
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '–';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** A yyyy-MM-dd air date as a local day. */
const dayOf = (iso: string) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
/** Days from today to a yyyy-MM-dd date: 0 today, 1 tomorrow, negative in the past. */
export const daysFromToday = (iso: string) => { const t = new Date(); t.setHours(0, 0, 0, 0); return Math.round((dayOf(iso).getTime() - t.getTime()) / 86400000); };
/** "Sat, 1 Nov 2026" (or without the year). */
export const fmtDay = (iso: string, withYear = true) => dayOf(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) });
/** "Today", "Tomorrow", "in 5 days", "3 days ago"; null further back than a week. */
export const relDay = (iso: string) => {
  const n = daysFromToday(iso);
  return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n === -1 ? 'Yesterday' : n > 1 ? `in ${n} days` : n > -7 ? `${-n} days ago` : null;
};
export const epCode = (e: { season: number; episode: number }) => `S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`;

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtSpeed(bps: number): string {
  return Math.round(bps / 1e6) + ' MB/s';
}

export function fmtEta(remainingBytes: number, bps: number): string {
  if (bps <= 0) return '';
  const min = Math.max(1, Math.round(remainingBytes / bps / 60));
  return min > 59 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
}

export function hms(s: number): string {
  if (!isFinite(s) || s < 0) s = 0;
  s = Math.floor(s);
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function pct(a: number, b: number): string {
  return (b ? Math.max(0, Math.min(100, (a / b) * 100)) : 0).toFixed(2) + '%';
}

export function plural(n: number, one: string, many?: string): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many ?? one + 's'}`;
}

const LANG: Record<string, string> = {
  en: 'English', no: 'Norwegian', nb: 'Norwegian', sv: 'Swedish', da: 'Danish', de: 'German', fr: 'French',
  es: 'Spanish', fi: 'Finnish', nl: 'Dutch', it: 'Italian', pt: 'Portuguese', pl: 'Polish', ja: 'Japanese',
  ko: 'Korean', zh: 'Chinese', ru: 'Russian', cs: 'Czech', hu: 'Hungarian', el: 'Greek', tr: 'Turkish',
  ro: 'Romanian', ar: 'Arabic', he: 'Hebrew', is: 'Icelandic', et: 'Estonian', '': 'Unknown',
};

/** Languages offered in the subtitle picker, besides the ones set in Settings. */
export const SUBTITLE_LANGS = ['en', 'no', 'sv', 'da', 'fi', 'is', 'de', 'nl', 'fr', 'es', 'it', 'pt', 'pl', 'cs', 'hu', 'ro', 'el', 'tr', 'ru', 'et', 'ar', 'he', 'ja', 'ko', 'zh'];

export const langName = (code: string) => LANG[code] ?? code;

/** "Movies/Dune Part Two (2024)" → "D:\Media\Movies\Dune Part Two (2024)". */
export function localPath(root: string, rel: string): string {
  if (!rel) return root;
  const sep = root.includes('/') && !root.includes('\\') ? '/' : '\\';
  return root.replace(/[\\/]+$/, '') + sep + rel.split('/').join(sep);
}

export function remotePath(root: string, rel: string): string {
  if (!rel) return root;
  return (root === '/' ? '' : root.replace(/\/+$/, '')) + '/' + rel;
}

export const cleanName = (n: string) => n.replace(/\s*\(\d{4}\)\s*$/, '');
export const yearOf = (n: string) => (n.match(/(19|20)\d{2}/) || [''])[0];
