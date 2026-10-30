// Mock of the Seedbox Sync API with the sample data from the design, for UI work without a
// seedbox. No dependencies.
//
//   npm run mock                         → API on http://127.0.0.1:8743
//   API_URL=http://127.0.0.1:8743 npm run dev
//   node mock/server.mjs --static <dir>  → also serve a built UI from <dir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const port = +(args[args.indexOf('--port') + 1] || 0) || 8743;
const staticDir = args.includes('--static') ? path.resolve(args[args.indexOf('--static') + 1]) : null;
const fresh = args.includes('--first-run');

const GB = 1e9;
const ROOT = '/home/rob/media';
const now = Date.now();
const day = (d) => new Date(d + 'T12:00:00Z').toISOString();

// ---- sample data (from the design) ------------------------------------------------------
const MOVIES = [
  ['Dune Part Two (2024)', 64.3, '2026-10-02', true],
  ['Oppenheimer (2023)', 38.1, '2026-09-28', true],
  ['Civil War (2024)', 21.4, '2026-10-11', true],
  ['The Holdovers (2023)', 14.2, '2026-10-19', false],
  ['Past Lives (2023)', 9.8, '2026-10-21', false],
  ['Perfect Days (2023)', 11.5, '2026-10-24', false],
  ['Anatomy of a Fall (2023)', 12.9, '2026-10-25', false],
  ['Furiosa (2024)', 47.6, '2026-10-25', false],
];
const SHOWS = [
  ['Shōgun (2024)', 'Season 01', 10, 5.2, '2026-10-14', 6],
  ['The Bear (2022)', 'Season 03', 10, 2.2, '2026-09-30', 10],
  ['Slow Horses (2022)', 'Season 04', 6, 3.0, '2026-10-20', 0],
  ['Severance (2022)', 'Season 02', 10, 4.1, '2026-10-23', 0],
];
const BOOKS = [
  ['Andy Weir - Project Hail Mary', 'Project Hail Mary.m4b', 0.9, '2026-09-12', true],
  ['Gabrielle Zevin - Tomorrow, and Tomorrow, and Tomorrow', 'Tomorrow, and Tomorrow, and Tomorrow.m4b', 1.1, '2026-10-18', false],
  ['Cixin Liu - The Three-Body Problem', 'The Three-Body Problem.m4b', 0.7, '2026-10-05', true],
];
const LOCAL_ONLY = [
  ['Movies/Arrival (2016)/Arrival.2016.1080p.BluRay.mkv', 31.2],
  ['Movies/Blade Runner 2049 (2017)/Blade.Runner.2049.2017.2160p.mkv', 58.4],
  ['Movies/aftersun.2022.1080p.BluRay/aftersun.2022.1080p.BluRay.mkv', 8.7],
  ['TV/Succession (2018)/Season 01/Succession.S01E01.1080p.mkv', 2.4],
  ['TV/Succession (2018)/Season 01/Succession.S01E02.1080p.mkv', 2.3],
];
const slug = (s) => s.replace(/ō/g, 'o').replace(/[():,']/g, '').trim().replace(/\s+/g, '.');

const entries = []; // seedbox listing
const local = new Map(); // path -> size, files on MEDIA-PC
const dir = (p, m) => entries.push({ path: p, dir: true, size: 0, modified: m ? day(m) : null });
const file = (p, sizeGb, m, synced) => {
  const size = Math.round(sizeGb * GB);
  entries.push({ path: p, dir: false, size, modified: day(m) });
  if (synced) local.set(p, size);
};
for (const c of ['Movies', 'TV', 'Audiobooks']) dir(c);
for (const [name, size, mod, synced] of MOVIES) {
  dir('Movies/' + name, mod);
  const b = slug(name);
  file(`Movies/${name}/${b}.2160p.WEB-DL.mkv`, size, mod, synced);
  file(`Movies/${name}/${b}.en.srt`, 0.00009, mod, synced);
}
for (const [name, season, eps, sz, mod, have] of SHOWS) {
  dir('TV/' + name, mod);
  dir(`TV/${name}/${season}`, mod);
  const b = slug(name.replace(/\s*\(\d{4}\)$/, '')) + '.' + name.match(/\d{4}/)[0];
  for (let e = 1; e <= eps; e++) {
    file(`TV/${name}/${season}/${b}.S${season.slice(-2)}E${String(e).padStart(2, '0')}.1080p.WEB.mkv`, +(sz * (0.92 + ((e * 37) % 17) / 100)).toFixed(2), mod, e <= have);
  }
}
for (const [name, f, size, mod, synced] of BOOKS) {
  dir('Audiobooks/' + name, mod);
  file(`Audiobooks/${name}/${f}`, size, mod, synced);
  file(`Audiobooks/${name}/cover.jpg`, 0.0004, mod, synced);
}
for (const [p, s] of LOCAL_ONLY) local.set(p, Math.round(s * GB));

// ---- state ------------------------------------------------------------------------------
let settings = {
  seedbox: { protocol: 'sftp', host: fresh ? '' : 'nl-ams-14.seedhost.example', port: 22, username: fresh ? '' : 'rob', password: null, passwordSet: !fresh, mediaRoot: fresh ? '' : ROOT, quotaTb: null, acceptAnyCertificate: true, refreshMinutes: 10 },
  transfers: { parallel: 3 },
  metadata: { tmdbApiKey: null, tmdbApiKeySet: true, omdbApiKey: null, omdbApiKeySet: true, tvProvider: 'auto', tvdbApiKey: null, tvdbApiKeySet: true, openSubtitlesApiKey: null, openSubtitlesApiKeySet: true, openSubtitlesUsername: 'rob.media', openSubtitlesPassword: null, openSubtitlesPasswordSet: true, subtitleLanguages: 'en, no', writeSidecars: true },
};
const server = { id: 'local', name: 'MEDIA-PC', kind: 'local', libraryRoot: 'D:\\Media', address: null };
let transfers = { paused: false, items: [] };
let tseq = 1;
const addT = (p, status, pct) => {
  const e = entries.find(x => x.path === p);
  transfers.items.push({ id: 't' + tseq++, serverId: 'local', path: p, size: e.size, remoteModifiedUtc: e.modified, status, transferred: Math.round((e.size * (pct || 0)) / 100), bytesPerSecond: status === 'active' ? 34e6 : 0, attempts: status === 'active' ? 1 : 0, error: null, createdUtc: new Date().toISOString(), completedUtc: null, notBeforeUtc: null });
};
if (!fresh) {
  addT('Movies/Perfect Days (2023)/Perfect.Days.2023.2160p.WEB-DL.mkv', 'active', 42);
  addT('Movies/Perfect Days (2023)/Perfect.Days.2023.en.srt', 'queued');
  entries.filter(e => e.path.startsWith('TV/Shōgun (2024)/') && !e.dir).slice(6).forEach((e, k) => addT(e.path, k === 0 ? 'active' : 'queued', k === 0 ? 18 : 0));
}

const META = {
  'Movies/Dune Part Two (2024)': ['TMDB', '693134', 'Dune: Part Two', 2024, 'Denis Villeneuve', 'matched', 98],
  'Movies/Oppenheimer (2023)': ['TMDB', '872585', 'Oppenheimer', 2023, 'Christopher Nolan', 'matched', 99],
  'Movies/Civil War (2024)': ['TMDB', '271110', 'Captain America: Civil War', 2016, 'Anthony Russo, Joe Russo', 'review', 71],
  'Movies/Arrival (2016)': ['TMDB', '329865', 'Arrival', 2016, 'Denis Villeneuve', 'matched', 99],
  'Movies/Blade Runner 2049 (2017)': ['TMDB', '335984', 'Blade Runner 2049', 2017, 'Denis Villeneuve', 'matched', 99],
  'Movies/aftersun.2022.1080p.BluRay': ['TMDB', null, null, null, null, 'unmatched', 0],
  'Movies/Perfect Days (2023)': ['TMDB', '976893', 'Perfect Days', 2023, 'Wim Wenders', 'matched', 96],
  'TV/Shōgun (2024)': ['TVDB', '393554', 'Shōgun', 2024, 'FX', 'matched', 97],
  'TV/The Bear (2022)': ['TVDB', '412453', 'The Bear', 2022, 'FX', 'matched', 99],
  'TV/Succession (2018)': ['TVDB', '338186', 'Succession', 2018, 'HBO', 'matched', 99],
  'Audiobooks/Andy Weir - Project Hail Mary': ['Tags', '', 'Project Hail Mary', 2021, 'Andy Weir', 'matched', 100],
  'Audiobooks/Cixin Liu - The Three-Body Problem': ['Tags', '', 'The Three-Body Problem', 2014, 'Cixin Liu', 'matched', 100],
};
const EPT = { 'TV/Shōgun (2024)': ['Anjin', 'Servants of Two Masters', 'Tomorrow Is Tomorrow', 'The Eightfold Fence', 'Broken to the Fist', 'Ladies of the Willow World', 'A Stick of Time', 'The Abyss of Life', 'Crimson Sky', 'A Dream of a Dream'] };

// ---- helpers ----------------------------------------------------------------------------
const kindOf = (cat) => (/audio/i.test(cat) ? 'audiobook' : /tv|series|show/i.test(cat) ? 'tv' : 'movie');
const isMedia = (p) => /\.(mkv|mp4|m4b|mp3)$/i.test(p);
function listing() {
  const configured = !!settings.seedbox.host && !!settings.seedbox.mediaRoot;
  return {
    configured, connected: configured, refreshing: false, error: null, mediaRoot: settings.seedbox.mediaRoot,
    protocol: settings.seedbox.protocol.toUpperCase(), host: settings.seedbox.host,
    refreshedUtc: configured ? new Date(now).toISOString() : null,
    totalBytes: configured ? 1000 * GB : null, freeBytes: configured ? 258.4 * GB : null, quotaBytes: settings.seedbox.quotaTb ? settings.seedbox.quotaTb * 1e12 : null,
    entries: configured ? entries.map(e => ({ ...e, servers: !e.dir && local.get(e.path) === e.size ? ['local'] : [] })) : [],
  };
}
// ---- Watching (mock): history, a freshly released episode, collections -------------------
const WATCHED = new Set();
const LAST = {}; // key → { path, at }
const iso = d => new Date(d).toISOString();
const dayIso = n => iso(now - n * 86400000).slice(0, 10);
// Upcoming: Shōgun S01E12 in 5 days, E13 undated; a new season 2 premiering in 40 days.
const UPEP = { 'TV/Shōgun (2024)': [{ season: 1, episode: 12, title: 'The Tea House', aired: dayIso(-5) }, { season: 1, episode: 13, title: 'Episode 13', aired: null }, { season: 2, episode: 1, title: 'Episode 1', aired: dayIso(-40) }, { season: 2, episode: 2, title: 'Episode 2', aired: dayIso(-47) }] };
const NEWEP = { 'TV/Shōgun (2024)': [{ season: 1, episode: 11, title: 'Crimson Sky', aired: dayIso(2) }] };
const NEXTAIRS = { 'TV/The Bear (2023)': 'S02E01 · ' + dayIso(-9) };
const COLLECTIONS = { 'Movies/Dune Part Two (2024)': ['726871', 'Dune Collection'], 'Movies/Blade Runner 2049 (2017)': ['422837', 'Blade Runner Collection'], 'Movies/Arrival (2016)': ['999001', 'Villeneuve Sci-Fi'] };
const code = e => `S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`;
function episodesOf(key) {
  const seed = entries.filter(e => !e.dir && e.path.startsWith(key + '/') && isMedia(e.path));
  const loc = [...local.keys()].filter(p => p.startsWith(key + '/') && isMedia(p));
  const all = [...new Set([...seed.map(e => e.path), ...loc])].sort();
  const eps = all.map(p => {
    const m = p.match(/S(\d+)E(\d+)/i);
    const s = m ? +m[1] : 1, e = m ? +m[2] : 1;
    const avail = local.has(p);
    return { key: p, season: s, episode: e, title: EPT[key]?.[e - 1] ?? `Episode ${e}`, runtimeMinutes: 58, size: local.get(p) ?? entries.find(x => x.path === p)?.size ?? 0, path: avail ? p : null, seedboxPath: seed.some(x => x.path === p) ? p : null, available: avail, onSeedbox: seed.some(x => x.path === p), subtitles: [], watched: WATCHED.has(p), aired: dayIso(400 - e * 7), new: false, missing: false };
  });
  for (const n of UPEP[key] ?? []) eps.push({ key: key + '#' + code(n), ...n, runtimeMinutes: 58, size: 0, path: null, seedboxPath: null, available: false, onSeedbox: false, subtitles: [], watched: false, new: false, missing: false, upcoming: true });
  for (const n of NEWEP[key] ?? []) eps.push({ key: key + '#' + code(n), ...n, runtimeMinutes: 58, size: 0, path: null, seedboxPath: null, available: false, onSeedbox: false, subtitles: [], watched: false, new: true, missing: false });
  return eps.sort((a, b) => a.season - b.season || a.episode - b.episode);
}
const ref = e => ({ key: e.key, path: e.path, season: e.season, episode: e.episode, title: e.title, available: e.available, onSeedbox: e.onSeedbox, seedboxPath: e.seedboxPath, aired: e.aired });
function upNextOf(key) {
  const last = LAST[key];
  if (!last) return null;
  const eps = episodesOf(key);
  const i = eps.findIndex(e => e.path === last.path);
  return i >= 0 ? eps.slice(i + 1).find(e => e.available || e.onSeedbox || e.new) ?? null : null;
}

// ---- Discover (mock TMDB) ---------------------------------------------------------------
const DISC = {
  movie: [
    ['693134', 'Dune: Part Two', 2024, 8.2, 'Science Fiction, Adventure'], ['872585', 'Oppenheimer', 2023, 8.1, 'Drama, History'],
    ['1184918', 'The Wild Robot', 2024, 8.4, 'Animation, Science Fiction'], ['533535', 'Deadpool & Wolverine', 2024, 7.7, 'Action, Comedy'],
    ['945961', 'Alien: Romulus', 2024, 7.2, 'Horror, Science Fiction'], ['1022789', 'Inside Out 2', 2024, 7.6, 'Animation, Family'],
    ['558449', 'Gladiator II', 2024, 6.8, 'Action, Adventure'], ['402431', 'Wicked', 2024, 7.3, 'Drama, Fantasy'],
    ['1034541', 'Terrifier 3', 2024, 6.9, 'Horror, Thriller'], ['912649', 'Venom: The Last Dance', 2024, 6.8, 'Action, Science Fiction'],
    ['335983', 'Blade Runner 2049', 2017, 7.6, 'Science Fiction, Drama'], ['329865', 'Arrival', 2016, 7.6, 'Drama, Science Fiction'],
  ],
  tv: [
    ['393554', 'Shōgun', 2024, 8.6, 'Drama, War'], ['136315', 'The Bear', 2022, 8.2, 'Comedy, Drama'], ['94997', 'House of the Dragon', 2022, 8.4, 'Drama, Fantasy'],
    ['100088', 'The Last of Us', 2023, 8.6, 'Drama'], ['1396', 'Breaking Bad', 2008, 8.9, 'Drama, Crime'], ['76479', 'The Boys', 2019, 8.5, 'Action, Comedy'],
  ],
};
const WANTED = [
  { id: 'movie:1184918', isEpisode: false, kind: 'movie', tmdbId: '1184918', title: 'The Wild Robot', year: 2024, posterUrl: null, addedUtc: new Date(Date.now() - 3 * 86400000).toISOString(), season: null, episode: null, episodeTitle: null, serverId: null, titleKey: null },
  { id: 'tv:94997', isEpisode: false, kind: 'tv', tmdbId: '94997', title: 'House of the Dragon', year: 2022, posterUrl: null, addedUtc: new Date(Date.now() - 2 * 86400000).toISOString(), season: null, episode: null, episodeTitle: null, serverId: null, titleKey: null },
  { id: 'movie:402431', isEpisode: false, kind: 'movie', tmdbId: '402431', title: 'Wicked', year: 2024, posterUrl: null, addedUtc: new Date(Date.now() - 6 * 86400000).toISOString(), season: null, episode: null, episodeTitle: null, serverId: null, titleKey: null },
];
// Season 2 starts 5 days ago, weekly; episode 6 has no date yet.
const mockEp = (s, e) => ({ season: s, episode: e, title: s === 1 ? (EPT['TV/Shōgun (2024)'][e - 1] ?? `Episode ${e}`) : `Episode ${e}`, aired: s === 2 ? (e >= 6 ? null : dayIso(5 - (e - 1) * 7)) : dayIso(600 - e * 7), runtimeMinutes: 55 + (e % 4), overview: e % 3 === 0 ? null : 'Toranaga moves against the council while Blackthorne learns what loyalty costs.', stillUrl: null, rating: s === 2 && e > 1 ? null : 7.5 + (e % 5) / 5 });
const discItem = (kind, [id, title, year, rating, genres]) => ({ kind, id, title, year, overview: `${title} — a ${genres.toLowerCase()} title from ${year}.`, posterUrl: null, backdropUrl: null, rating, votes: 1000 + (+id % 9000), genres: genres.split(', ') });
const discStatus = (kind, id, title) => {
  const lib = titles().find(t => t.kind === kind && (t.match.providerId === id));
  const seed = !lib && kind === 'movie' && (title === 'Arrival' || title === 'Wicked') ? `Movies/${title} (${title === 'Wicked' ? 2024 : 2016})` : null;
  return { wanted: WANTED.some(w => !w.isEpisode && w.kind === kind && w.tmdbId === id), serverId: lib ? 'local' : null, serverName: lib ? server.name : null, titleKey: lib?.key ?? null, seedboxPath: seed };
};

function titles() {
  const groups = new Map();
  for (const [p, size] of local) {
    const s = p.split('/');
    if (s.length < 2) continue;
    const key = s[0] + '/' + s[1];
    if (!groups.has(key)) groups.set(key, { key, files: [] });
    groups.get(key).files.push({ path: p, size });
  }
  return [...groups.values()].filter(g => g.files.some(f => isMedia(f.path))).map(g => {
    const [cat, name] = g.key.split('/');
    const kind = kindOf(cat);
    const m = META[g.key];
    const media = g.files.filter(f => isMedia(f.path));
    const seedMedia = entries.filter(e => !e.dir && e.path.startsWith(g.key + '/') && isMedia(e.path));
    const total = new Set([...media.map(f => f.path), ...seedMedia.map(e => e.path)]).size;
    const display = kind === 'audiobook' ? (m?.[2] ?? name.split(' - ')[1] ?? name) : name.replace(/\s*\(\d{4}\)$/, '').replace(/\.\d{4}\..*$/, '');
    const eps = media.length;
    const subs = g.files.filter(f => f.path.endsWith('.srt')).map(f => f.path.match(/\.(\w\w)\.srt$/)?.[1] ?? '');
    return {
      key: g.key, name, kind, category: cat, displayTitle: display, year: m?.[3] ?? (+(name.match(/(19|20)\d{2}/) || [0])[0] || null),
      size: g.files.reduce((a, f) => a + f.size, 0), have: media.length, total, onSeedbox: seedMedia.length > 0,
      match: m
        ? { provider: m[0], providerId: m[1], title: m[2], year: m[3], credit: m[4], status: m[5], confidence: m[6], note: m[5] === 'review' ? `The folder says ${name.match(/\d{4}/)?.[0]} but the best result is from ${m[3]}. Confirm or pick another result.` : m[5] === 'unmatched' ? `No TMDB result for "${name}". Search with the original title.` : null, overview: null, runtimeMinutes: null }
        : { provider: kind === 'tv' ? 'TVDB' : kind === 'audiobook' ? 'Tags' : 'TMDB', providerId: null, title: null, year: null, credit: null, status: 'unmatched', confidence: 0, note: 'Not matched yet.', overview: null, runtimeMinutes: null },
      hasPoster: false, hasBackdrop: false,
      mainFile: media.sort((a, b) => b.size - a.size)[0]?.path ?? null,
      subtitles: [...new Set(subs)], seasons: kind === 'tv' ? 1 : null, episodes: kind === 'tv' ? eps : null,
      addedUtc: iso(now - (g.key.length % 9) * 86400000 * 3), lastPlayedUtc: LAST[g.key]?.at ?? null,
      upNext: kind === 'tv' && upNextOf(g.key) ? ref(upNextOf(g.key)) : null,
      newEpisodes: kind === 'tv' ? episodesOf(g.key).filter(e => e.new).map(ref) : null,
      missing: 0, nextAirs: NEXTAIRS[g.key] ?? null,
      collectionId: COLLECTIONS[g.key]?.[0] ?? null, collection: COLLECTIONS[g.key]?.[1] ?? null, duplicates: null,
    };
  });
}
function detail(key) {
  const t = titles().find(x => x.key === key);
  if (!t) return null;
  let seasons = [];
  if (t.kind === 'tv') {
    const eps = episodesOf(key);
    const by = new Map();
    eps.forEach(e => { if (!by.has(e.season)) by.set(e.season, []); by.get(e.season).push(e); });
    seasons = [...by.entries()].map(([n, e]) => ({ number: n, episodes: e }));
  }
  return { title: t, localPath: 'D:\\Media\\' + key.replace(/\//g, '\\'), seedboxPath: t.onSeedbox ? ROOT + '/' + key : null, seasons, parts: t.kind === 'audiobook' ? [t.mainFile] : [], subtitleTracks: t.kind === 'movie' ? [{ language: 'en', label: 'English (embedded)', path: t.mainFile, embedded: true }, { language: 'no', label: 'Norwegian (embedded, forced)', path: t.mainFile, embedded: true }] : [], sidecars: t.match.status === 'matched' ? ['movie.nfo', 'poster.jpg', 'fanart.jpg'] : [] };
}

// Simulated transfer progress.
setInterval(() => {
  if (transfers.paused) return;
  let active = transfers.items.filter(t => t.status === 'active').length;
  for (const t of transfers.items) if (t.status === 'queued' && active < settings.transfers.parallel) { t.status = 'active'; active++; }
  for (const t of transfers.items) {
    if (t.status !== 'active') continue;
    t.bytesPerSecond = (22 + Math.random() * 22) * 1e6;
    t.transferred = Math.min(t.size, t.transferred + Math.max(t.size * 0.02, t.bytesPerSecond * 8));
    if (t.transferred >= t.size) { t.status = 'done'; t.completedUtc = new Date().toISOString(); t.bytesPerSecond = 0; local.set(t.path, t.size); }
  }
}, 1000);

// ---- http -------------------------------------------------------------------------------
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(body === undefined ? '' : JSON.stringify(body)); };
// ---- LAN mock: two PCs on the network, one already using this PC ----------------------
const NETWORK = [
  { instanceId: 'a1b2', name: 'LIVINGROOM-PC', address: 'https://192.168.1.31:8743', version: '1.0.0', root: 'E:\\Library' },
  { instanceId: 'c3d4', name: 'STUDY-PC', address: 'https://192.168.1.44:8743', version: '1.0.0', root: 'D:\\Media' },
];
let remotes = [];
let pairCode = null;
let managers = [{ id: 'e5f6', name: 'LAPTOP', pairedUtc: new Date(now - 86400000 * 3).toISOString(), lastSeenUtc: new Date(now - 120000).toISOString(), lastAddress: '192.168.1.52' }];
const localStatus = () => ({ online: true, libraryRoot: server.libraryRoot, totalBytes: 4e12, freeBytes: 1.84e12, version: 'Service 1.0.0', lastSeenUtc: new Date().toISOString(), error: null });
const remoteDto = r => r.name === 'STUDY-PC'
  ? { id: r.id, name: r.name, kind: 'remote', libraryRoot: r.libraryRoot, address: r.address, status: { online: false, libraryRoot: r.libraryRoot, totalBytes: null, freeBytes: null, version: 'Service 1.0.0', lastSeenUtc: new Date(now - 3600000).toISOString(), error: `Could not reach ${r.name} at ${r.address}. Check that the PC is on, Seedbox Sync is running there, and the firewall allows it.` } }
  : { id: r.id, name: r.name, kind: 'remote', libraryRoot: r.libraryRoot, address: r.address, status: { online: true, libraryRoot: r.libraryRoot, totalBytes: 2e12, freeBytes: 0.88e12, version: 'Service 1.0.0', lastSeenUtc: new Date().toISOString(), error: null } };

const readBody = (req) => new Promise(r => { let b = ''; req.on('data', c => (b += c)); req.on('end', () => r(b ? JSON.parse(b) : {})); });
const under = (p, roots) => roots.some(r => p === r || p.startsWith(r + '/'));

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const p = url.pathname;
  const m = req.method;
  try {
    if (p === '/api/status') return json(res, 200, { service: { name: 'SeedboxSync', version: '1.0.0', isWindowsService: true, urls: ['http://127.0.0.1:8742'], dataDirectory: 'C:\\ProgramData\\SeedboxSync', machineName: 'MEDIA-PC' }, seedbox: { configured: !!settings.seedbox.host, connected: !!settings.seedbox.host, refreshing: false, error: null, refreshedUtc: new Date(now).toISOString(), protocol: settings.seedbox.protocol, host: settings.seedbox.host, mediaRoot: settings.seedbox.mediaRoot } });
    if (p === '/api/settings' && m === 'GET') return json(res, 200, settings);
    if (p === '/api/settings' && m === 'PUT') { const b = await readBody(req); settings = { seedbox: { ...b.seedbox, password: null, passwordSet: settings.seedbox.passwordSet || !!b.seedbox.password }, transfers: b.transfers, metadata: { ...b.metadata, tmdbApiKey: null, tvdbApiKey: null, openSubtitlesApiKey: null, openSubtitlesPassword: null } }; return json(res, 200, settings); }
    if (p === '/api/settings/test') { const b = await readBody(req); return json(res, 200, b.seedbox.host ? { ok: true, message: `Connected · ${b.seedbox.protocol.toUpperCase()} · 3 folders under ${b.seedbox.mediaRoot}` } : { ok: false, message: 'Enter a host first.' }); }
    if (p === '/api/seedbox' || p === '/api/seedbox/refresh') return json(res, 200, listing());
    if (p === '/api/seedbox/download') {
      const b = await readBody(req);
      const files = entries.filter(e => !e.dir && under(e.path, b.paths) && local.get(e.path) !== e.size && !transfers.items.some(t => t.path === e.path && t.status !== 'done'));
      files.forEach(f => addT(f.path, 'queued'));
      return json(res, 200, [{ serverId: 'local', serverName: 'MEDIA-PC', files: files.length, bytes: files.reduce((a, f) => a + f.size, 0), alreadyThere: 0, alreadyQueued: 0 }]);
    }
    if (p === '/api/seedbox/delete') {
      const b = await readBody(req);
      const files = entries.filter(e => !e.dir && under(e.path, b.paths));
      for (let i = entries.length - 1; i >= 0; i--) if (under(entries[i].path, b.paths)) entries.splice(i, 1);
      transfers.items = transfers.items.filter(t => t.status === 'done' || !under(t.path, b.paths));
      return json(res, 200, { deleted: b.paths.length, freedBytes: files.reduce((a, f) => a + f.size, 0), files: files.length, onlyCopy: files.filter(f => !local.has(f.path)).length, cancelledTransfers: 0 });
    }
    if (p === '/api/transfers') return json(res, 200, transfers);
    if (p === '/api/transfers/pause') { const b = await readBody(req); transfers.paused = b.paused; return json(res, 200, transfers); }
    if (p === '/api/transfers/clear') { const n = transfers.items.length; transfers.items = transfers.items.filter(t => t.status !== 'done' && t.status !== 'failed'); return json(res, 200, { cleared: n - transfers.items.length }); }
    let mm;
    if ((mm = p.match(/^\/api\/transfers\/([^/]+)\/(cancel|retry)$/))) { transfers.items = transfers.items.filter(t => t.id !== mm[1] || mm[2] === 'retry'); return json(res, 204); }
    // LAN: other PCs running Seedbox Sync, pairing in both directions.
    if (p === '/api/servers' && m === 'GET') return json(res, 200, [{ ...server, status: localStatus() }, ...remotes.map(remoteDto)]);
    if ((mm = p.match(/^\/api\/servers\/([\w-]+)$/)) && m === 'PUT') {
      const b = await readBody(req);
      const r = remotes.find(x => x.id === mm[1]);
      if (r) { if (b.name) r.name = b.name; if (b.libraryRoot) r.libraryRoot = b.libraryRoot; return json(res, 200, remoteDto(r)); }
      if (b.libraryRoot) server.libraryRoot = b.libraryRoot;
      if (b.name) server.name = b.name;
      return json(res, 200, { ...server, status: localStatus() });
    }
    if ((mm = p.match(/^\/api\/servers\/([\w-]+)$/)) && m === 'DELETE') { remotes = remotes.filter(x => x.id !== mm[1]); res.writeHead(204); return res.end(); }
    if (p === '/api/servers/discovered') return json(res, 200, { enabled: true, peers: NETWORK.filter(n => !remotes.some(r => r.instanceId === n.instanceId)).map(n => ({ ...n, lastSeenUtc: new Date().toISOString() })) });
    if (p === '/api/servers/discover') { res.writeHead(204); return res.end(); }
    if (p === '/api/servers/pair') {
      const b = await readBody(req);
      await new Promise(r => setTimeout(r, 600));
      const host = String(b.address).replace(/^https?:\/\//, '').replace(/:\d+$/, '');
      const peer = NETWORK.find(n => n.address.includes(host));
      if (!peer) return json(res, 502, { message: `Could not reach Seedbox Sync at https://${host}:8743. Check the address, that Seedbox Sync is running on that PC, and that its firewall allows TCP port 8743.` });
      if (String(b.code).toUpperCase() !== 'K7Q4XM') return json(res, 403, { message: 'The pairing code is wrong. Check the code shown on the other PC.' });
      const r = { id: peer.name.toLowerCase(), name: peer.name, kind: 'remote', libraryRoot: peer.root, address: peer.address, instanceId: peer.instanceId };
      remotes.push(r);
      return json(res, 200, remoteDto(r));
    }
    if (p === '/api/pairing' && m === 'GET') return json(res, 200, { enabled: true, port: 8743, name: server.name, addresses: ['192.168.1.20'], code: pairCode && Date.parse(pairCode.expiresUtc) > Date.now() ? pairCode : null, managers });
    if (p === '/api/pairing/code' && m === 'POST') { pairCode = { code: 'H4C-9TQ', expiresUtc: new Date(Date.now() + 600000).toISOString() }; return json(res, 200, pairCode); }
    if (p === '/api/pairing/code' && m === 'DELETE') { pairCode = null; res.writeHead(204); return res.end(); }
    if ((mm = p.match(/^\/api\/pairing\/managers\/([\w-]+)$/)) && m === 'DELETE') { managers = managers.filter(x => x.id !== mm[1]); res.writeHead(204); return res.end(); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)$/))) return json(res, 200, { serverId: 'local', serverName: server.name, libraryRoot: server.libraryRoot, scannedUtc: new Date().toISOString(), matching: false, titles: titles() });
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/scan$/))) { const t = titles(); return json(res, 200, { titles: t.length, needReview: t.filter(x => x.match.status === 'review').length, unmatched: t.filter(x => x.match.status === 'unmatched').length, queued: 0 }); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/title$/))) { const d = detail(url.searchParams.get('key')); return d ? json(res, 200, d) : json(res, 404, { message: 'That title is not on this media server.' }); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/artwork$/))) return json(res, 404, {});
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/match$/))) { const b = await readBody(req); META[b.key] = [b.provider, b.id, 'Civil War', 2024, 'Alex Garland', 'matched', 100]; return json(res, 200, titles().find(t => t.key === b.key)); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/refresh$/))) { const b = await readBody(req); return json(res, 200, titles().find(t => t.key === b.key)); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/subtitles\/search$/))) {
      const b = await readBody(req);
      await new Promise(r => setTimeout(r, 400));
      const all = [
        { fileId: 101, language: 'en', release: 'Insomnia.2002.720p.BRRip.x264-x0r', fileName: null, score: 99, exact: true, machineTranslated: false, hearingImpaired: false, downloads: 1840, fps: 23.976, uploaded: '2014-03-02T00:00:00Z', reason: 'Made for this exact file' },
        { fileId: 102, language: 'en', release: 'Insomnia.2002.1080p.BluRay.x264-AMIABLE', fileName: null, score: 53, exact: false, machineTranslated: false, hearingImpaired: true, downloads: 9320, fps: 23.976, uploaded: '2013-11-20T00:00:00Z', reason: 'Same source (bluray)' },
        { fileId: 103, language: 'en', release: 'Insomnia 2002 WEBRip', fileName: null, score: 27, exact: false, machineTranslated: false, hearingImpaired: false, downloads: 412, fps: 25, uploaded: '2021-06-01T00:00:00Z', reason: 'Different source (web)' },
        { fileId: 104, language: 'no', release: 'Insomnia.2002.DVDRip.XviD', fileName: null, score: 24, exact: false, machineTranslated: false, hearingImpaired: false, downloads: 230, fps: 25, uploaded: '2009-01-10T00:00:00Z', reason: 'Different source (dvd)' },
        { fileId: 105, language: 'sv', release: 'Insomnia.2002.720p.BRRip.x264-x0r', fileName: null, score: 46, exact: false, machineTranslated: true, hearingImpaired: false, downloads: 75, fps: null, uploaded: null, reason: 'Same release group, same source (bluray), same resolution; machine translated' },
      ];
      const langs = b.language ? [b.language] : ['en', 'no'];
      return json(res, 200, { videoPath: 'Movies/Insomnia (2002)/Insomnia.2002.720p.BRRip.x264-x0r.mkv', release: 'Insomnia.2002.720p.BRRip.x264-x0r.mkv', hashed: true, candidates: all.filter(c => langs.includes(c.language)) });
    }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/subtitles\/download$/))) { const b = await readBody(req); await new Promise(r => setTimeout(r, 400)); return json(res, 200, { path: 'Movies/x.' + b.language + '.srt' }); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/subtitles$/))) return json(res, 200, { found: 2, languages: ['en', 'no'], files: 1, exact: 1 });
    if (p === '/api/metadata/search') return json(res, 200, [
      { provider: 'TMDB', id: '929590', title: 'Civil War', year: 2024, credit: 'Alex Garland', posterUrl: null, popularity: 0, score: 96 },
      { provider: 'TMDB', id: '271110', title: 'Captain America: Civil War', year: 2016, credit: 'Anthony Russo, Joe Russo', posterUrl: null, popularity: 0, score: 71 },
    ]);
    if (p === '/api/discover') {
      const kind = url.searchParams.get('kind') === 'tv' ? 'tv' : 'movie';
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const pageNo = +(url.searchParams.get('page') || 1);
      let list = DISC[kind].map(x => discItem(kind, x));
      if (q) list = list.filter(i => i.title.toLowerCase().includes(q));
      if (url.searchParams.get('sort') === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
      const minR = +(url.searchParams.get('minRating') || 0); if (minR) list = list.filter(i => i.rating >= minR);
      await new Promise(r => setTimeout(r, 250));
      return json(res, 200, { page: pageNo, totalPages: 2, totalResults: list.length * 2, items: list.map(i => ({ item: pageNo > 1 ? { ...i, id: i.id + 'p2' } : i, status: discStatus(kind, i.id, i.title) })) });
    }
    if (p === '/api/discover/genres') return json(res, 200, ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Science Fiction', 'Thriller'].map((n, i) => ({ id: i + 1, name: n })));
    if ((mm = p.match(/^\/api\/discover\/(movie|tv)\/(\w+)$/))) {
      const row = DISC[mm[1]].find(x => x[0] === mm[2]) ?? DISC[mm[1]][0];
      const it = discItem(mm[1], row);
      await new Promise(r => setTimeout(r, 200));
      return json(res, 200, { details: { item: it, tagline: 'Long live the fighters.', runtimeMinutes: mm[1] === 'movie' ? 166 : 55, seasons: mm[1] === 'tv' ? 2 : null, episodes: mm[1] === 'tv' ? 18 : null, status: mm[1] === 'tv' ? 'Returning Series' : 'Released', credit: 'Denis Villeneuve', cast: [{ name: 'Timothée Chalamet', character: 'Paul Atreides', id: '1190668' }, { name: 'Zendaya', character: 'Chani', id: '505710' }, { name: 'Rebecca Ferguson', character: 'Lady Jessica', id: '933238' }], makers: [{ name: 'Denis Villeneuve', character: mm[1] === 'tv' ? 'Creator' : 'Director', id: '137427' }], imdbId: 'tt15239678', trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w', network: mm[1] === 'tv' ? 'FX' : null, tmdbUrl: 'https://www.themoviedb.org/' + mm[1] + '/' + it.id, seasonList: mm[1] === 'tv' ? [{ number: 1, name: 'Season 1', episodes: 10, aired: dayIso(600), posterUrl: null }, { number: 2, name: 'Season 2', episodes: 8, aired: dayIso(5), posterUrl: null }, { number: 0, name: 'Specials', episodes: 2, aired: dayIso(500), posterUrl: null }] : null, nextEpisode: mm[1] === 'tv' ? mockEp(2, 2) : null, lastEpisode: mm[1] === 'tv' ? mockEp(2, 1) : null }, status: discStatus(mm[1], it.id, it.title), ratings: { imdb: 8.5, imdbVotes: 612000, rottenTomatoes: 92, metacritic: 79, imdbUrl: 'https://www.imdb.com/title/tt15239678/' }, ratingsAvailable: true });
    }
    if ((mm = p.match(/^\/api\/discover\/tv\/(\w+)\/season\/(\d+)$/))) {
      const n = +mm[2];
      const count = n === 1 ? 10 : n === 2 ? 8 : 2;
      const lib = titles().find(t => t.kind === 'tv' && t.match.providerId === mm[1]);
      const eps = lib ? episodesOf(lib.key).filter(e => e.season === n) : [];
      await new Promise(r => setTimeout(r, 200));
      return json(res, 200, { season: { number: n, name: n ? `Season ${n}` : 'Specials', overview: n === 2 ? 'War comes to Osaka as old alliances crack.' : null, aired: n === 2 ? dayIso(5) : dayIso(600), posterUrl: null, episodes: Array.from({ length: count }, (_, i) => mockEp(n, i + 1)) }, serverName: lib ? server.name : null, inLibrary: eps.filter(e => e.available).map(e => e.episode), onSeedbox: eps.filter(e => !e.available && e.onSeedbox).map(e => e.episode) });
    }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/calendar$/))) {
      const from = url.searchParams.get('from'), to = url.searchParams.get('to');
      const inRange = d => d && d >= from && d <= to;
      const out = [];
      for (const t of titles().filter(t => t.kind === 'tv')) {
        const seriesWanted = WANTED.some(w => !w.isEpisode && w.kind === 'tv' && w.tmdbId === t.match.providerId);
        for (const e of episodesOf(t.key).filter(e => inRange(e.aired) && e.episode < 900)) {
          const epWanted = WANTED.some(w => w.isEpisode && w.titleKey === t.key && w.season === e.season && w.episode === e.episode);
          out.push({ date: e.aired, series: t.displayTitle, season: e.season, episode: e.episode, title: e.title, titleKey: t.key, hasPoster: false, wantedId: null, tmdbId: t.match.providerId, posterUrl: null, available: e.available, onSeedbox: e.onSeedbox, wanted: !e.available && (seriesWanted || epWanted) });
        }
      }
      for (const w of WANTED.filter(w => !w.isEpisode && w.kind === 'tv' && !titles().some(t => t.match.providerId === w.tmdbId))) {
        for (let i = 0; i < 8; i++) {
          const d = dayIso(10 - i * 7);
          if (inRange(d)) out.push({ date: d, series: w.title, season: 3, episode: i + 1, title: `Chapter ${i + 1}`, titleKey: null, hasPoster: false, wantedId: w.id, tmdbId: w.tmdbId, posterUrl: w.posterUrl, available: false, onSeedbox: false, wanted: true });
        }
      }
      return json(res, 200, out.sort((a, b) => a.date.localeCompare(b.date)));
    }
    if ((mm = p.match(/^\/api\/discover\/person\/(\w+)$/))) {
      await new Promise(r => setTimeout(r, 200));
      const pick = [...DISC.movie.map(x => discItem('movie', x)), ...DISC.tv.slice(0, 3).map(x => discItem('tv', x))].filter((_, i) => i % 2 === 0 || mm[1] === '137427');
      return json(res, 200, {
        person: { id: mm[1], name: mm[1] === '137427' ? 'Denis Villeneuve' : 'Timothée Chalamet', knownFor: mm[1] === '137427' ? 'Directing' : 'Acting', birthday: '1995-12-27', deathday: null, birthplace: 'New York City, New York, USA', biography: 'An actor known for intense, quiet performances across independent and studio films. '.repeat(6), photoUrl: null, imdbId: 'nm3154303', tmdbUrl: 'https://www.themoviedb.org/person/' + mm[1] },
        credits: pick.map((it, i) => ({ item: it, status: discStatus(it.kind, it.id, it.title), role: i % 3 === 0 ? 'Director, Producer' : 'Paul Atreides', date: `${it.year}-0${(i % 9) + 1}-15` })),
      });
    }
    if (p === '/api/wanted' && m === 'GET') return json(res, 200, WANTED.map(w => {
      if (!w.isEpisode) {
        const st = discStatus(w.kind, w.tmdbId, w.title);
        if (w.kind === 'tv' && st.titleKey) {
          const moving = new Set(transfers.items.filter(t => t.status === 'queued' || t.status === 'active').map(t => t.path));
          const rest = episodesOf(st.titleKey).filter(e => !e.available && e.episode < 900 && !(e.seedboxPath && moving.has(e.seedboxPath)));
          Object.assign(st, { ready: rest.filter(e => e.onSeedbox).length, upcoming: rest.filter(e => !e.onSeedbox && e.upcoming).length, waiting: rest.filter(e => !e.onSeedbox && !e.upcoming).length });
        }
        return { item: w, status: st };
      }
      const e = episodesOf(w.titleKey).find(x => x.season === w.season && x.episode === w.episode);
      return { item: w, status: { wanted: true, serverId: e?.available ? w.serverId : null, serverName: e?.available ? server.name : null, titleKey: w.titleKey, seedboxPath: e?.onSeedbox ? e.seedboxPath : null } };
    }));
    if (p === '/api/wanted' && m === 'POST') {
      const b = await readBody(req);
      const isEpisode = b.season != null && b.episode != null;
      const id = isEpisode ? `ep:${b.serverId}/${b.titleKey}:${b.season}:${b.episode}` : `${b.kind}:${b.tmdbId}`;
      if (!WANTED.some(w => w.id === id)) WANTED.unshift({ season: null, episode: null, episodeTitle: null, serverId: null, titleKey: null, ...b, kind: isEpisode ? 'tv' : b.kind, id, isEpisode, addedUtc: new Date().toISOString() });
      res.writeHead(204); return res.end();
    }
    if (p === '/api/wanted' && m === 'DELETE') { const i = WANTED.findIndex(w => w.id === url.searchParams.get('id')); if (i >= 0) WANTED.splice(i, 1); res.writeHead(204); return res.end(); }
    if ((mm = p.match(/^\/api\/wanted\/(movie|tv)\/(\w+)$/)) && m === 'DELETE') { const i = WANTED.findIndex(w => !w.isEpisode && w.kind === mm[1] && w.tmdbId === mm[2]); if (i >= 0) WANTED.splice(i, 1); res.writeHead(204); return res.end(); }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/tmdb$/))) {
      const t = titles().find(x => x.key === url.searchParams.get('key'));
      return json(res, 200, { kind: t && (t.kind === 'tv' || t.kind === 'movie') ? t.kind : null, id: t?.match.providerId ?? null });
    }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/ratings$/))) return json(res, 200, { available: true, ratings: { imdb: 7.9, imdbVotes: 410000, rottenTomatoes: 88, metacritic: 74, imdbUrl: 'https://www.imdb.com/' } });
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/play$/))) {
      const b = await readBody(req);
      const t = titles().find(x => x.key === b.key);
      const target = t?.kind === 'tv' ? (upNextOf(b.key)?.path ?? episodesOf(b.key).find(e => e.available)?.path) : t?.mainFile;
      if (!target) return json(res, 400, { message: 'Nothing to play.' });
      LAST[b.key] = { path: target, at: new Date().toISOString() }; WATCHED.add(target);
      return json(res, 200, { path: target });
    }
    if ((mm = p.match(/^\/api\/library\/([\w-]+)\/watched$/))) { const b = await readBody(req); b.paths.forEach(x => (b.watched ? WATCHED.add(x) : WATCHED.delete(x))); res.writeHead(204); return res.end(); }
    if (p === '/api/news') return json(res, 200, titles().flatMap(t => (t.newEpisodes ?? []).map(e => ({ serverId: 'local', serverName: server.name, titleKey: t.key, title: t.displayTitle, episode: e }))));
    if (p.startsWith('/api/media/') && p.endsWith('/open')) { const b = await readBody(req); const t = titles().find(x => b.path.startsWith(x.key + '/')); if (t) { LAST[t.key] = { path: b.path, at: new Date().toISOString() }; WATCHED.add(b.path); } res.writeHead(204); return res.end(); }
    if (p.startsWith('/api/media/') && p.endsWith('/open-real')) return json(res, 400, { message: 'The Windows service has no desktop to open a player on. Run SeedboxSync.exe from a console, or use Copy path and open the file in your player.' });
    if (p.startsWith('/api/')) return json(res, 404, { message: 'Not found in mock.' });

    if (staticDir) {
      let f = path.join(staticDir, p === '/' ? 'index.html' : p);
      if (!fs.existsSync(f)) f = path.join(staticDir, 'index.html');
      const ext = path.extname(f);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      return fs.createReadStream(f).pipe(res);
    }
    json(res, 404, { message: 'Not found' });
  } catch (e) {
    json(res, 500, { message: String(e) });
  }
}).listen(port, '127.0.0.1', () => console.log(`Seedbox Sync mock API on http://127.0.0.1:${port}`));
