# Builds the web UI into the service's wwwroot and publishes the service to .\publish.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\build.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot

Push-Location (Join-Path $root 'web')
try {
    if (-not (Test-Path 'node_modules')) { npm install }
    npm run build
} finally { Pop-Location }

dotnet publish (Join-Path $root 'src\SeedboxSync.Service\SeedboxSync.Service.csproj') `
    -c Release -r win-x64 --self-contained false -o (Join-Path $root 'publish')

Write-Host "Published to $(Join-Path $root 'publish'). Run scripts\install-service.ps1 as administrator to install the Windows service."
