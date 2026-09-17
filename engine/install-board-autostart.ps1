param(
  [switch]$Force,
  [int]$Port = 47390,
  [int]$Monitor = 2
)

# Installs the always-on factory board: a Startup-folder launcher that runs
# engine/board-host.ps1 at logon. Same shape as the SovereignNode autostarts it
# was modelled on, and the same deliberate difference as factory-resume there:
# the Startup folder rather than a SYSTEM scheduled task, because this opens a
# window in the user's session and a GUI launched as SYSTEM appears on a desktop
# nobody is looking at.
#
# WHERE THIS FILE LIVES. It was SovereignNode's scripts/install-factory-board-
# autostart.ps1, untracked there, and the launcher it wrote ran Telechurch's copy
# of the board server on port 4399. On 2026-09-15 that launcher would have opened
# a kiosk window on a port nothing served, because the server had come home to
# the factory the night before (PLAN-LIVING-FACTORY-ENGINE-HOME-001). The
# installer sits beside the host script it installs and finds it as a sibling.
# Re-running it with -Force is how the launcher is repointed - the same
# script-first rule as engine/install-schedule.ps1.
#
#   powershell -File engine\install-board-autostart.ps1 [-Port 47390] [-Monitor 2] [-Force]

$ErrorActionPreference = 'Stop'

$startupDir = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup'
$launcher   = Join-Path $startupDir 'sovereign-factory-board.cmd'   # the name the wall display has always had
$scriptPath = Join-Path $PSScriptRoot 'board-host.ps1'

if (-not (Test-Path -LiteralPath $scriptPath)) { throw "Missing host script: $scriptPath - this installer must sit beside engine/board-host.ps1" }

New-Item -ItemType Directory -Force -Path $startupDir | Out-Null

$content = @"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$scriptPath" -Port $Port -Monitor $Monitor -Keep
"@

if ($Force -or -not (Test-Path -LiteralPath $launcher) -or ((Get-Content -LiteralPath $launcher -Raw) -ne $content)) {
  Set-Content -LiteralPath $launcher -Value $content -Encoding ASCII
  Write-Host "Installed startup launcher: $launcher"
} else {
  Write-Host "Startup launcher already current: $launcher"
}

Write-Host ""
Write-Host "The board comes up on monitor $Monitor at logon, fullscreen, and reloads"
Write-Host "itself whenever the engine rebuilds it - roughly hourly, or immediately"
Write-Host "after any station runs. board-serve-check keeps the server alive on the beat."
Write-Host ""
Write-Host "Change the monitor:  install-board-autostart.ps1 -Monitor 3 -Force"
Write-Host "Close it any time:   Alt+F4 on that window. It returns at next logon."
