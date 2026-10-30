# Architecture

## Overview

```
 Browser (React UI)          Tizen TV app (later)
        │  /api (JSON, range-streamed media)          http://127.0.0.1:8742
        ▼
 ┌───────────────────────────── SeedboxSync.Service (Windows service, Kestrel) ────────────────┐
 │  Endpoints ─► SeedboxCatalog ──► ISeedboxClient (FTP/FTPS: FluentFTP, SFTP: SSH.NET)       │
 │            ─► TransferQueue ───► IMediaNode.DownloadFromSeedboxAsync  ─┐                   │
 │            ─► LibraryService ──► IMediaNode (scan, read, write sidecars)│                   │
 │            ─► InventoryService ─► IMediaNode.ScanAsync                  │                   │
 │                 MediaServerRegistry ── hands out IMediaNode per server ─┘                   │
 │                    ├── LocalMediaNode   (this PC's disk)                                    │
 │                    └── RemoteMediaNode  (another PC running Seedbox Sync, over HTTPS) ──┐   │
 │  /peer/v1 on https://0.0.0.0:8743 ◄── the same, offered to other PCs ◄─────────────────┘   │
 │  DiscoveryService: UDP multicast 239.255.87.44:8744                                         │
 └────────────────────────────────────────────────────────────────────────────────────────────┘
```

**One concept ties it together: the relative path.** `Movies/Dune Part Two (2024)/Dune.mkv`
means the same file under the seedbox media root and under every media server's library root
(`RelPath`). Windows-illegal characters (`:` `?` …) are replaced the same way on every server
(`RelPath.LocalSafe`), so a file still counts as synced when its name had to change.

**Sync state is derived, not stored.** A file is on a server when the server's inventory has the
same relative path with the same size. Inventories are scanned and kept in memory
(`InventoryService`). Finished transfers update them directly.

## No database

Every piece of state is a JSON file in `%ProgramData%\SeedboxSync`, written atomically
(`JsonFileStore`): settings, servers, the transfer queue, the seedbox listing cache, and the
library index per server. Artwork is cached as files. Metadata is also written as Kodi/Jellyfin
`.nfo` sidecars next to the media, so the library is portable.

## Media servers on the LAN

There is no separate agent. Every PC runs the same Seedbox Sync, and any install can add another
as a media server. `IMediaNode` is the seam. It is deliberately file-level and stateless:

| Method | Purpose |
|---|---|
| `GetStatusAsync` | online, library root, disk space, version |
| `ScanAsync` | every file under the library root (path, size, mtime) |
| `GetFileAsync`, `OpenReadAsync` | file info, and a read stream |
| `WriteFileAsync` | sidecars (poster, fanart, .nfo, subtitles) |
| `DownloadFromSeedboxAsync` | pull one file **directly from the seedbox**, resuming `.part` files |
| `DiscardPartialAsync` | clean up after a cancelled transfer |
| `ReadTagsAsync` | embedded audio tags and cover (audiobooks) |
| `OpenWithDefaultPlayerAsync` | open on that PC's desktop |

All "smart" logic (scheduling, matching, artwork, subtitles, sync state) lives in the service that
manages the server and only calls these primitives. `LocalMediaNode` implements them on this PC's
disk; `RemoteMediaNode` calls the same operations on another PC.

### Two faces, two ports

- **UI and its API:** `http://127.0.0.1:8742` (`Kestrel:Endpoints:Ui`). Unauthenticated, so it
  stays on localhost.
- **Peer API:** `https://0.0.0.0:8743` (`Kestrel:Endpoints:Peer`), served with a self-signed
  certificate created on first start (`PeerCertificate`, kept DPAPI-encrypted in the data folder).
  `PeerGuardMiddleware` answers `/peer/v1/*` only on this port and everything else only on the
  UI port. Remove the Peer endpoint to keep a PC off the network.

```
GET    /peer/v1/hello                 → { instanceId, name, version }      (open)
POST   /peer/v1/pair                  ← { managerId, managerName, proof }  (open, code-gated)
DELETE /peer/v1/pair                  the caller forgets this PC
GET    /peer/v1/status                → { instanceId, name, version, status: NodeStatus }
GET    /peer/v1/files                 → NodeFile[]
GET    /peer/v1/file?path=            → NodeFile | 404
GET    /peer/v1/stream?path=          → bytes (Range supported)
PUT    /peer/v1/file?path=            ← bytes (sidecars, max 64 MB)
POST   /peer/v1/download              ← NodeDownloadRequest → NDJSON progress lines
DELETE /peer/v1/partial?path=
GET    /peer/v1/tags?path=            → MediaTags | 204
POST   /peer/v1/open?path=
PUT    /peer/v1/libraryroot           ← { root }
```

### Discovery

`DiscoveryService` sends a small JSON beacon (`{ app, v, id, name, port, version }`) to
`239.255.87.44:8744` on every IPv4 adapter every 10 seconds, with TTL 1 so it never leaves the
LAN. A starting install sends a query so everyone answers at once. Each install has a permanent ID
(`instance.json`); when a paired PC is heard at a new address, `MediaServerRegistry` follows it,
so DHCP changes need nothing. If multicast is blocked, a PC can still be added by IP address.

### Pairing and trust

1. On the PC to be added (B), **Show pairing code** gives a 6-character code, valid 10 minutes,
   5 attempts.
2. On the managing PC (A), the user picks B and types the code. A connects to B over HTTPS, notes
   the certificate B presents, and sends `HMAC-SHA256(code, B's certificate thumbprint | A's id)`.
   The code never crosses the network, and a machine in the middle with its own certificate
   cannot produce a proof B accepts.
3. B returns a random 256-bit key for A (`managers.json`, encrypted). A stores B's address,
   instance ID, key (encrypted) and certificate thumbprint in `servers.json`.
4. Every later call from A carries `Authorization: Bearer <key>` and `X-SeedboxSync-Peer: <A's id>`,
   and A accepts only B's pinned certificate. Removing B on A also tells B to forget A; B can
   revoke A itself under **PCs that use this one**.

### Downloads to another PC

A's `TransferQueue` schedules transfers for remote servers like local ones, and skips a server
whose last call failed in the past minute. `RemoteMediaNode.DownloadFromSeedboxAsync` makes one
long `POST /download` carrying the seedbox connection (over the pinned TLS channel). B downloads
straight from the seedbox and streams a progress line every half second while bytes move, plus a
heartbeat every 10 seconds. If A cancels, the connection closes and B stops, keeping the `.part`
file for a resume. If B goes quiet for 60 seconds, A treats it as offline and retries later.

When a remote PC is off, the seedbox view uses its last known inventory instead of failing.

## Playback and the TV app

There is no player in the UI. A browser player turned out to need ffmpeg to convert the audio
(browsers cannot decode AC3, E-AC3, DTS or TrueHD), plus audio sync and seeking on top, which
VLC, Kodi and other players already do well. The library opens files in the PC's default
player, or copies their path.

A TV app can use the same public endpoints:

- `GET /api/library/{server}`: titles with match, artwork flags and main file
- `GET /api/library/{server}/title?key=`: seasons/episodes, parts, subtitle tracks
- `GET /api/library/{server}/artwork?key=&kind=poster|fanart`
- `GET /api/media/{server}/stream?path=`: the file as is, with HTTP range requests (seekable). Tizen's AVPlay and VLC accept a plain URL. Subtitles are `.srt` files next to the video and can be fetched the same way.

For a TV on the LAN:

- set `Urls` in `appsettings.json` to e.g. `http://0.0.0.0:8742`
- add the TV app origin to `Cors:Origins`
- add authentication before exposing the API beyond localhost. Today it trusts anything that can reach it, which is fine on `127.0.0.1` only.

## Frontend

`web/` is React 18 + Vite + TypeScript. `src/ds/index.js` is generated from the Claude Design
"Workbench" design-system bundle (`npm run import-ds`), so the UI uses the exact same components
and tokens as the design. `src/app/AppContext.tsx` holds shared state and polling (transfers
every second while active). Each tab (`src/views/*Tab.tsx`) renders the shared `Workbench` shell
with its own commands, explorer, canvas and properties dock.
