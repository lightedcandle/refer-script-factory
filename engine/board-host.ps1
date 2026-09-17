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

# The window itself is the general kiosk (engine/kiosk.ps1): one URL on one
# screen, its own browser profile, --app so the board keeps a title bar you can
# close. Since 2026-09-16 this script only knows what is board-specific - the
# server and the URL - and hands the screen to the sibling that knows screens.
$url = if ($Repo) { "http://127.0.0.1:$Port/?repo=$Repo" } else { "http://127.0.0.1:$Port" }
Write-Log "handing $url to kiosk.ps1 for monitor $Monitor"
& (Join-Path $PSScriptRoot 'kiosk.ps1') -Name board -Url $url -Monitor $Monitor
exit $LASTEXITCODE
