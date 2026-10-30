# Installs (or updates) Seedbox Sync as a Windows service. Run as administrator after build.ps1.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\install-service.ps1 [-InstallDir "C:\Program Files\SeedboxSync"]
param(
    [string]$InstallDir = "$env:ProgramFiles\SeedboxSync",
    [string]$ServiceName = 'SeedboxSync'
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$publish = Join-Path $root 'publish'

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script from an elevated (administrator) PowerShell.'
}
if (-not (Test-Path (Join-Path $publish 'SeedboxSync.exe'))) { throw 'Nothing to install. Run scripts\build.ps1 first.' }

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing -and $existing.Status -ne 'Stopped') { Stop-Service $ServiceName; Start-Sleep -Seconds 2 }

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
# Keep a customised appsettings.json on update.
$keep = Join-Path $InstallDir 'appsettings.json'
$saved = if (Test-Path $keep) { Get-Content $keep -Raw } else { $null }
Copy-Item -Path (Join-Path $publish '*') -Destination $InstallDir -Recurse -Force
if ($saved) {
    $old = $saved | ConvertFrom-Json
    if ($old.PSObject.Properties['Kestrel']) {
        Set-Content -Path $keep -Value $saved -NoNewline
    } else {
        # Settings from before LAN support: take the new file (UI and LAN endpoints) and carry
        # over the data folder, CORS and logging settings.
        $new = Get-Content $keep -Raw | ConvertFrom-Json
        foreach ($p in 'DataDirectory', 'Cors', 'Logging') {
            if ($old.PSObject.Properties[$p]) { $new.$p = $old.$p }
        }
        $new | ConvertTo-Json -Depth 10 | Set-Content -Path $keep
        Write-Host 'appsettings.json updated for LAN access; your data folder and CORS settings were kept.'
    }
}

$exe = Join-Path $InstallDir 'SeedboxSync.exe'
if (-not $existing) {
    New-Service -Name $ServiceName -BinaryPathName "`"$exe`"" -DisplayName 'Seedbox Sync' `
        -Description 'Mirrors the seedbox media library to this PC, serves the web UI on http://127.0.0.1:8742 and lets other PCs running Seedbox Sync use it as a media server.' `
        -StartupType Automatic | Out-Null
}
# Restart on failure. "Restart service" in the UI relies on this.
sc.exe failure $ServiceName reset= 86400 actions= restart/3000/restart/10000/restart/60000 | Out-Null

# Other PCs on the home network: peer API and discovery.
& (Join-Path $PSScriptRoot 'allow-lan.ps1')

Start-Service $ServiceName
Write-Host "Seedbox Sync is running. Open http://127.0.0.1:8742"
