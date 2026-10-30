# Seedbox Sync

Seedbox manager and media library for Windows. Built from the Claude Design
project "Seedbox Sync" (see `claude_design/`).

- **Seedbox:** browse the media root over FTP, FTPS or SFTP, see the sync state of every folder and file, download to this PC, and delete from the seedbox. The seedbox's 1 TB fills up, so delete what is already safe at home.
- **Library:** titles on this PC, matched with TMDB (movies) and TVDB or TMDB (series). Audiobooks use their embedded tags. Posters, fanart and `.nfo` sidecars are written next to the media, and subtitles come from OpenSubtitles.
- **Playback:** left to a real player. **Play** opens the file in the PC's default player (VLC, MPC-HC, Windows Media Player), and **Copy path** puts the file's path on the clipboard. Subtitles from OpenSubtitles are saved next to the video, so players pick them up. When the app runs as a Windows service there is no desktop to open a player on, so use **Copy path** instead.
- **Media servers:** install Seedbox Sync on other PCs on your home network and add them on **Servers**. They are found automatically and added with a pairing code. Downloads go straight from the seedbox to that PC, and its library, sync state and **Play** work from here.
- **Service:** runs as a Windows service. The UI is on `http://127.0.0.1:8742`; other PCs reach it on port 8743 (HTTPS) and find it on UDP 8744.

The seedbox owns the folder structure. Everything under the media root (for example
`/home/rob/media/Movies/Dune Part Two (2024)/…`) is mirrored to the same relative path under
the library folder (for example `D:\Media\Movies\Dune Part Two (2024)\…`). File names are never changed.

## Requirements

- Windows 10/11
- .NET 10 SDK (the projects target `net10.0`)
- Node.js 18+ (only to build the UI)

## Run it for development

```powershell
cd web
npm install
npm start      # backend (dotnet watch) + UI with hot reload; open http://localhost:5173
```

`npm start` runs both in one terminal. The UI reloads as you save, `dotnet watch` rebuilds the
backend when C# files change (press Ctrl+R if it asks to restart), and Ctrl+C stops both. Stop
the Windows service first if it is installed, since both use port 8742. To run them separately:
`dotnet watch --project src\SeedboxSync.Service` and `npm run dev`.

To work on the UI without a seedbox, use the mock API with the design's sample data:

```powershell
cd web
npm run mock                                   # http://127.0.0.1:8743
$env:API_URL="http://127.0.0.1:8743"; npm run dev
```

## Install as a Windows service

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build.ps1            # builds UI + publishes to .\publish
# then, in an administrator PowerShell:
powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1  # installs to C:\Program Files\SeedboxSync
```

Open http://127.0.0.1:8742. Go to **Settings**, enter the seedbox host, port, user, password and
media root, and choose **Test connection**, then **Save changes**. Then set the library folder on
**Servers**. It defaults to `C:\Users\Public\Videos\Seedbox`.

## Add another PC as a media server

1. Install Seedbox Sync on the other PC the same way (build, then `install-service.ps1`), and set its library folder on **Servers**.
2. On that PC, open **Servers**, select **This PC** and choose **Show pairing code**.
3. On the PC you manage from, open **Servers**. The other PC appears under **On your network**. Choose it, type the code, and check its name and library folder.

Both PCs need their network set to **Private** in Windows, and the firewall must allow TCP 8743 and UDP 8744.
`install-service.ps1` adds those rules. When you run from source (`npm start`) instead, run
`scripts\allow-lan.ps1` once as administrator. If the other PC does not show up (some routers block
multicast), add it by IP address in **Add media server**. To keep a PC off the network, remove the
`Peer` endpoint from its `appsettings.json`.

The service runs as LocalSystem. It can write to local disks, but not to mapped network drives.
If your library is on a NAS, change the service's log-on account to a user that can reach it,
and use a UNC path such as `\\nas\media`.

## Where things are stored

There is no database. State is kept in small JSON files under `%ProgramData%\SeedboxSync`.
To use a different folder, set `DataDirectory` in `appsettings.json`. Ports are set under `Kestrel:Endpoints` there (`Ui` and `Peer`).

| File | Contents |
|---|---|
| `settings.json` | Settings. Passwords and API keys are encrypted with Windows DPAPI (machine scope). |
| `servers.json` | Media servers and their library folders; for other PCs also address, pinned certificate and key (encrypted). |
| `transfers.json` | The download queue. Downloads resume after a restart, using `.part` files. |
| `seedbox-cache.json` | Last seedbox listing, so the UI has data at startup. |
| `instance.json` | This install's permanent ID, so other PCs recognise it when its IP address changes. |
| `peer-certificate.dat` | The certificate other PCs pin when they add this one (encrypted). |
| `managers.json` | PCs that have added this one, with their keys (encrypted). |
| `library\<server>.json` | Matches, episode titles and artwork flags per title. |
| `artwork\` | Cached posters and fanart. |

## Metadata keys

- **TMDB:** a v3 API key or a v4 read access token, from themoviedb.org → Settings → API.
- **TVDB:** a v4 project API key, from thetvdb.com → API information. Without one, series are matched with TMDB.
- **OpenSubtitles:** a consumer API key from opensubtitles.com/consumers, plus your username and password. Downloads need the login.

## Project layout

```
src/SeedboxSync.Core      domain: seedbox clients, media nodes, transfers, library, metadata, subtitles
src/SeedboxSync.Service   ASP.NET Core host: Windows service, REST API, serves the built UI
web/                      React + Vite UI (design-system components generated from claude_design/)
scripts/                  build / install / uninstall
docs/ARCHITECTURE.md      how it fits together: LAN media servers, pairing, the peer API, the TV app
```

The UI's design-system components in `web/src/ds/index.js` are generated from the Claude Design
bundle. To regenerate them, run `npm run import-ds` (needs Python).
