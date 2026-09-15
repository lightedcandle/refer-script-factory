# Living Factory - always-on board host.
#
# Serves the board on localhost and opens it fullscreen on a chosen monitor, so
# it can live on a wall display without anyone touching it.
#
# WHY A BROWSER IN KIOSK AND NOT AN ACTUAL WALLPAPER
#
# A wallpaper sits behind every window and every icon, so the one board you
# actually want to glance at is the one thing covered by whatever you are doing.
# A dedicated fullscreen window on a second monitor is always visible, needs no
# desktop to be clear, and survives being clicked on. Lively or Wallpaper Engine
# can render this same URL as true wallpaper if a spare monitor is not available
# - the server below is what either approach needs.
#
# WHY LOCALHOST AND NOT THE PUBLISHED ARTIFACT
#
# The artifact needs a claude.ai login in whatever browser shows it, and it only
# changes when a session republishes it. The local board is rebuilt by the engine
# every hour with no session involved, and the page reloads itself when the build
# stamp changes - so this display is live in a way the artifact cannot be.
#
# WHERE THIS FILE LIVES. It was an untracked script in SovereignNode that started
# Telechurch's copy of the server on port 4399 - both stale by 2026-09-14: the
# board moved to 47390 on the 13th and the server came home to the factory on
# the 14th (PLAN-LIVING-FACTORY-ENGINE-HOME-001). It sits beside the server now
# and finds it as a sibling. Nothing here duplicates board-serve-check.cjs, the
# machine that keeps the server alive on the beat; this only starts it when a
# person wants the wall display up before the next beat would.
#
#   powershell -File engine\board-host.ps1 [-Port 47390] [-Monitor 2] [-NoBrowser] [-Repo <id>]

param(
  [int]$Port = 47390,
  [int]$Monitor = 2,
  [switch]$NoBrowser,
  # Which repo's board the window opens on. Empty means the server's default.
  [string]$Repo = ""
)

$ErrorActionPreference = 'Stop'

$factory = Split-Path -Parent $PSScriptRoot
$server  = Join-Path $PSScriptRoot 'serve-tracker.cjs'
$stateDir = Join-Path $env:LOCALAPPDATA 'LivingFactory'
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
$log = Join-Path $stateDir 'board-host.log'

function Write-Log([string]$m) {
  Add-Content -LiteralPath $log -Value ("{0}  {1}" -f (Get-Date).ToString('o'), $m) -Encoding UTF8
}

Write-Log "board host starting on port $Port"

# Don't start a second server on the same port. An already-serving board is a
# working board; replacing it would blink the display for no reason.
$inUse = $false
try {
  $inUse = [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop)
} catch { $inUse = $false }

if ($inUse) {
  Write-Log "port $Port already serving - leaving it alone"
} else {
  if (-not (Test-Path -LiteralPath $server)) { throw "server not found: $server" }
  Start-Process -FilePath 'node' `
    -ArgumentList @($server, '--port', "$Port") `
    -WorkingDirectory $factory -WindowStyle Hidden
  Write-Log "started server"
  Start-Sleep -Seconds 3
}

if ($NoBrowser) { Write-Log 'NoBrowser set - not opening a window'; exit 0 }

# --app gives a chromeless window; --start-fullscreen fills the monitor. Both
# Chrome and Edge accept these, so whichever is present is used. A dedicated
# user-data-dir keeps this window out of the ordinary browsing profile, so it
# cannot inherit a session, a pinned tab, or a restore prompt.
$profileDir = Join-Path $stateDir 'board-browser-profile'
$url = if ($Repo) { "http://127.0.0.1:$Port/?repo=$Repo" } else { "http://127.0.0.1:$Port" }

$browser = $null
foreach ($candidate in @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )) {
  if (Test-Path -LiteralPath $candidate) { $browser = $candidate; break }
}

if (-not $browser) {
  Write-Log 'no Chrome or Edge found - serving only'
  Write-Host "Board is serving at $url - open it yourself and press F11."
  exit 0
}

# Window position picks the monitor. Screens are enumerated left to right; -Monitor
# is 1-based, and an out-of-range value falls back to the primary rather than
# opening a window nobody can see.
Add-Type -AssemblyName System.Windows.Forms
$screens = [System.Windows.Forms.Screen]::AllScreens
$target = if ($Monitor -ge 1 -and $Monitor -le $screens.Count) { $screens[$Monitor - 1] } else { [System.Windows.Forms.Screen]::PrimaryScreen }
$x = $target.Bounds.X
$y = $target.Bounds.Y

Write-Log "opening on monitor $Monitor at $x,$y using $(Split-Path -Leaf $browser)"

Start-Process -FilePath $browser -ArgumentList @(
  "--app=$url",
  "--user-data-dir=`"$profileDir`"",
  "--window-position=$x,$y",
  '--start-fullscreen',
  '--noerrdialogs',
  '--disable-session-crashed-bubble',
  '--disable-infobars',
  '--no-first-run'
)

Write-Log 'board window opened'
exit 0
