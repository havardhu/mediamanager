# Removes the Seedbox Sync Windows service. Settings and the library index in
# %ProgramData%\SeedboxSync and your media files are left in place.
param([string]$ServiceName = 'SeedboxSync', [string]$InstallDir = "$env:ProgramFiles\SeedboxSync")
$ErrorActionPreference = 'Stop'
$svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($svc) {
    if ($svc.Status -ne 'Stopped') { Stop-Service $ServiceName }
    sc.exe delete $ServiceName | Out-Null
    Write-Host "Service $ServiceName removed."
}
if (Test-Path $InstallDir) { Remove-Item -Recurse -Force $InstallDir; Write-Host "Removed $InstallDir." }
& (Join-Path $PSScriptRoot 'allow-lan.ps1') -Remove
