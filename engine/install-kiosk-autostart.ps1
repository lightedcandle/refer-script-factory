param(
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Url,
  [int]$Monitor = 2,
  [switch]$Kiosk,
  [switch]$Force,
  [switch]$Remove
)

# Installs (or removes) a Startup-folder launcher that puts one URL on one
# screen at every logon, through engine/kiosk.ps1. One launcher per screen,
# named by -Name, so a wall board and a sanctuary display are two files that
# never fight. The Startup folder rather than a SYSTEM scheduled task, because
# this opens a window in the user's session and a GUI launched as SYSTEM
# appears on a desktop nobody is looking at.
#
#   install-kiosk-autostart.ps1 -Name sanctuary -Url https://... -Monitor 2 -Kiosk
#   install-kiosk-autostart.ps1 -Name sanctuary -Remove
#
# Re-running with -Force rewrites the launcher: that is how a screen is moved or
# a URL changed - edit nothing by hand.

$ErrorActionPreference = 'Stop'

if ($Name -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$') { throw "-Name must be a short plain token (letters, digits, . _ -): '$Name'" }

$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$launcher   = Join-Path $startupDir ("living-factory-kiosk-" + $Name + ".cmd")
$scriptPath = Join-Path $PSScriptRoot 'kiosk.ps1'

if ($Remove) {
  if (Test-Path -LiteralPath $launcher) { Remove-Item -LiteralPath $launcher -Force; Write-Host "Removed startup launcher: $launcher" }
  else { Write-Host "No launcher to remove at $launcher" }
  exit 0
}

if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Missing kiosk script: $scriptPath - this installer must sit beside engine/kiosk.ps1" }
if ($Url -notmatch '^https?://') { throw "-Url must be http(s): '$Url'" }

New-Item -ItemType Directory -Force -Path $startupDir | Out-Null

$kioskFlag = if ($Kiosk) { " -Kiosk" } else { "" }
$content = @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$scriptPath" -Name $Name -Url "$Url" -Monitor $Monitor$kioskFlag
"@

if ($Force -or -not (Test-Path -LiteralPath $launcher) -or ((Get-Content -LiteralPath $launcher -Raw) -ne $content)) {
  Set-Content -LiteralPath $launcher -Value $content -Encoding ASCII
  Write-Host "Installed startup launcher: $launcher"
} else {
  Write-Host "Startup launcher already current: $launcher"
}

Write-Host ""
Write-Host "'$Name' opens $Url on monitor $Monitor at logon$(if ($Kiosk) { ', kiosk (no title bar)' } else { ', fullscreen app window' })."
Write-Host "Move it:    install-kiosk-autostart.ps1 -Name $Name -Url `"$Url`" -Monitor 3 -Force"
Write-Host "Remove it:  install-kiosk-autostart.ps1 -Name $Name -Remove"
Write-Host "Close it:   Alt+F4 on that window. It returns at next logon."
