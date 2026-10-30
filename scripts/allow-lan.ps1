# Lets other PCs on your home network reach Seedbox Sync: TCP 8743 (peer API, HTTPS) and
# UDP 8744 (discovery). Rules apply to Private and Domain networks only, never Public.
# install-service.ps1 runs this; run it yourself (as administrator) when you use `npm start`
# or `dotnet run` instead of the service.
# Usage: powershell -ExecutionPolicy Bypass -File scripts\allow-lan.ps1 [-Remove]
param(
    [int]$Port = 8743,
    [int]$DiscoveryPort = 8744,
    [switch]$Remove
)
$ErrorActionPreference = 'Stop'
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script from an elevated (administrator) PowerShell.'
}

$names = 'Seedbox Sync (LAN)', 'Seedbox Sync (discovery)'
foreach ($n in $names) { Get-NetFirewallRule -DisplayName $n -ErrorAction SilentlyContinue | Remove-NetFirewallRule }
if ($Remove) { Write-Host 'Seedbox Sync firewall rules removed.'; return }

New-NetFirewallRule -DisplayName $names[0] -Description 'Other PCs running Seedbox Sync use this PC as a media server.' `
    -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Private, Domain | Out-Null
New-NetFirewallRule -DisplayName $names[1] -Description 'Seedbox Sync finds other PCs on the network.' `
    -Direction Inbound -Protocol UDP -LocalPort $DiscoveryPort -Action Allow -Profile Private, Domain | Out-Null
Write-Host "Firewall: allowed TCP $Port and UDP $DiscoveryPort on private networks."

$public = Get-NetConnectionProfile -ErrorAction SilentlyContinue | Where-Object NetworkCategory -eq 'Public'
foreach ($p in $public) {
    Write-Warning "Network '$($p.Name)' is set to Public, so other PCs cannot find this one. Make it private: Settings > Network & internet > $($p.InterfaceAlias) > Private network (or run: Set-NetConnectionProfile -InterfaceIndex $($p.InterfaceIndex) -NetworkCategory Private)."
}
