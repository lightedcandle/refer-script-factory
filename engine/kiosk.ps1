# Living Factory - put one URL on one screen, fullscreen, and keep it there.
#
# Operator, 2026-09-16, watching the board land on the HDMI screen: "wow, i
# could have done this same thing for telechurch instead of using lively
# desktop." Yes. This is that, made general: any URL, any monitor, with or
# without a title bar.
#
# WHY A BROWSER WINDOW AND NOT A WALLPAPER
#
# A wallpaper sits behind every icon and every window, so the one page you want
# to glance at is the thing everything else covers. A fullscreen window on a
# screen whose whole job is that page is always visible, survives being clicked
# on, needs no desktop to be clear, and needs no wallpaper engine. It is Chrome
# (or Edge) with a handful of flags.
#
# TWO MODES
#
#   -App    (default)  a chromeless window with a plain title bar: minimise,
#                      close, Alt+F4. Right for a desk or an office wall.
#   -Kiosk             no title bar, no buttons; the page IS the screen. Right
#                      for a sanctuary display or a lobby TV. Closed by Alt+F4
#                      or by killing the process; nothing on the screen offers
#                      a way out, which is the point.
#
# EACH WINDOW GETS ITS OWN PROFILE, named by -Name. It cannot inherit a login,
# a pinned tab, an extension, or a "restore session?" prompt, and closing it
# never touches ordinary browsing. Two kiosks with two names are two isolated
# windows.
#
# THE PAGE MUST BE HONEST WHEN ITS SERVER DIES. This script only opens the
# window; it does not watch the page. A page shown on a wall must dim and say
# how long it has been frozen when its source stops answering - the board does
# this - because a frozen page that looks alive, where nobody is checking, is
# worse than a blank screen. Point this at pages that keep that promise.
#
#   powershell -File engine\kiosk.ps1 -Name board -Url http://127.0.0.1:47390 -Monitor 2
#   powershell -File engine\kiosk.ps1 -Name sanctuary -Url https://... -Monitor 2 -Kiosk

param(
  [Parameter(Mandatory = $true)][string]$Name,
  [Parameter(Mandatory = $true)][string]$Url,
  [int]$Monitor = 2,
  [switch]$Kiosk
)

$ErrorActionPreference = 'Stop'

if ($Name -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$') { throw "-Name must be a short plain token (letters, digits, . _ -): '$Name'" }
if ($Url -notmatch '^https?://') { throw "-Url must be http(s): '$Url'" }

$stateDir = Join-Path $env:LOCALAPPDATA 'LivingFactory'
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
$log = Join-Path $stateDir 'kiosk.log'
function Write-Log([string]$m) {
  Add-Content -LiteralPath $log -Value ("{0}  [{1}]  {2}" -f (Get-Date).ToString('o'), $Name, $m) -Encoding UTF8
}

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
  Write-Log 'no Chrome or Edge found'
  throw "No Chrome or Edge found. Open $Url yourself and press F11."
}

# Window position picks the monitor. Screens are enumerated left to right; -Monitor
# is 1-based, and an out-of-range value falls back to the primary rather than
# opening a window nobody can see. --window-size is passed as well as the
# position: a reused profile remembers its last placement, and the size is what
# stops Chrome restoring that memory over the flag (seen 2026-09-16: the board
# came up windowed on the primary after a logon).
Add-Type -AssemblyName System.Windows.Forms
$screens = [System.Windows.Forms.Screen]::AllScreens
$target = if ($Monitor -ge 1 -and $Monitor -le $screens.Count) { $screens[$Monitor - 1] } else { [System.Windows.Forms.Screen]::PrimaryScreen }
$x = $target.Bounds.X
$y = $target.Bounds.Y
$w = $target.Bounds.Width
$h = $target.Bounds.Height

$profileDir = Join-Path $stateDir ("kiosk-profile-" + $Name)
$mode = if ($Kiosk) { "--kiosk" } else { "--start-fullscreen" }

Write-Log "opening $Url on monitor $Monitor at $x,$y ($w x $h) $mode using $(Split-Path -Leaf $browser)"

Start-Process -FilePath $browser -ArgumentList @(
  "--app=$Url",
  $mode,
  "--user-data-dir=`"$profileDir`"",
  "--window-position=$x,$y",
  "--window-size=$w,$h",
  '--noerrdialogs',
  '--disable-session-crashed-bubble',
  '--disable-infobars',
  '--no-first-run'
)

Write-Log 'window opened'
exit 0
