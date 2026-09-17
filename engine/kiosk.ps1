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
# -REPLACE closes this -Name's existing window first, so a second run re-homes
# the window instead of opening a second one.
#
# -KEEP stays resident and keeps the window on its screen. Operator,
# 2026-09-16: "when monitor is turned off and then back on the window moves to
# #1." That is Windows re-homing every window when a display disconnects, and
# it drops the fullscreen state on the way. The keeper checks every ten
# seconds: if the target monitor is present and the window is not filling it,
# it moves the window back; if the move does not take (fullscreen lost), it
# closes and reopens it. While the monitor is off it leaves the window alone.
# If the window is closed by a person, the keeper stops - a close is a
# decision, not a fault. -Keep implies -Replace.
#
# -LIST prints the monitors as JSON and exits; the board server reads it, so
# the page and this script number screens identically. Monitors are numbered
# in the order Windows enumerates them; the same order the board's screen
# control shows.
#
# THE PAGE MUST BE HONEST WHEN ITS SERVER DIES. This script only opens the
# window; it does not watch the page. A page shown on a wall must dim and say
# how long it has been frozen when its source stops answering - the board does
# this - because a frozen page that looks alive, where nobody is checking, is
# worse than a blank screen. Point this at pages that keep that promise.
#
#   powershell -File engine\kiosk.ps1 -Name board -Url http://127.0.0.1:47390 -Monitor 2 -Keep
#   powershell -File engine\kiosk.ps1 -Name sanctuary -Url https://... -Monitor 2 -Kiosk -Keep
#   powershell -File engine\kiosk.ps1 -List

param(
  [string]$Name,
  [string]$Url,
  [int]$Monitor = 2,
  [switch]$Kiosk,
  [switch]$Replace,
  [switch]$Keep,
  [switch]$List
)

$ErrorActionPreference = 'Stop'

# Monitors straight from user32. Not System.Windows.Forms.Screen: that caches
# its list once per process and only refreshes inside a message loop, so a
# resident keeper would never see a monitor come back.
Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public class KioskWin {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct MONITORINFOEX { public int cbSize; public RECT rcMonitor; public RECT rcWork; public uint dwFlags; [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string szDevice; }
  public delegate bool MonitorEnumProc(IntPtr hMon, IntPtr hdc, ref RECT rect, IntPtr data);
  [DllImport("user32.dll")] public static extern bool EnumDisplayMonitors(IntPtr hdc, IntPtr clip, MonitorEnumProc cb, IntPtr data);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern bool GetMonitorInfo(IntPtr hMon, ref MONITORINFOEX info);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int w, int h, uint flags);
  public static List<int[]> Monitors() {
    var list = new List<int[]>();
    EnumDisplayMonitors(IntPtr.Zero, IntPtr.Zero, delegate(IntPtr hMon, IntPtr hdc, ref RECT r, IntPtr d) {
      var mi = new MONITORINFOEX(); mi.cbSize = Marshal.SizeOf(typeof(MONITORINFOEX));
      GetMonitorInfo(hMon, ref mi);
      list.Add(new int[] { mi.rcMonitor.L, mi.rcMonitor.T, mi.rcMonitor.R - mi.rcMonitor.L, mi.rcMonitor.B - mi.rcMonitor.T, (int)(mi.dwFlags & 1) });
      return true;
    }, IntPtr.Zero);
    return list;
  }
}
"@

function Get-Monitors {
  $i = 0
  foreach ($m in [KioskWin]::Monitors()) { $i++; [pscustomobject]@{ index = $i; x = $m[0]; y = $m[1]; width = $m[2]; height = $m[3]; primary = ($m[4] -eq 1) } }
}

if ($List) {
  $mons = @(Get-Monitors)
  Write-Output (ConvertTo-Json -InputObject $mons -Compress)
  exit 0
}

if ($Name -notmatch '^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$') { throw "-Name must be a short plain token (letters, digits, . _ -): '$Name'" }
if ($Url -notmatch '^https?://') { throw "-Url must be http(s): '$Url'" }
if ($Keep) { $Replace = $true }

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

$profileDir = Join-Path $stateDir ("kiosk-profile-" + $Name)
$mode = if ($Kiosk) { "--kiosk" } else { "--start-fullscreen" }

# The screen for -Monitor, or $null when that monitor is not present right now.
function Get-Target {
  $mons = @(Get-Monitors)
  if ($Monitor -ge 1 -and $Monitor -le $mons.Count) { return $mons[$Monitor - 1] }
  return $null
}

# The browser process that owns this -Name's window: the one holding our
# profile directory that is not a helper (--type=gpu, renderer, ...).
function Get-Existing {
  Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq 'chrome.exe' -or $_.Name -eq 'msedge.exe') -and $_.CommandLine -like "*kiosk-profile-$Name*" -and $_.CommandLine -notlike '*--type=*'
  }
}

function Close-Existing {
  $any = $false
  foreach ($p in @(Get-Existing)) { Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue; $any = $true; Write-Log "closed existing window (PID $($p.ProcessId))" }
  if ($any) { Start-Sleep -Milliseconds 1500 }
}

# Window position picks the monitor; --window-size is passed as well, because a
# reused profile remembers its last placement and the size is what stops Chrome
# restoring that memory over the flag (seen 2026-09-16: the board came up
# windowed on the primary after a logon). An absent monitor falls back to the
# primary rather than opening a window nobody can see.
function Open-Window {
  $t = Get-Target
  if (-not $t) { $t = @(Get-Monitors | Where-Object { $_.primary })[0]; Write-Log "monitor $Monitor not present - opening on the primary" }
  Write-Log "opening $Url on monitor $Monitor at $($t.x),$($t.y) ($($t.width) x $($t.height)) $mode using $(Split-Path -Leaf $browser)"
  $p = Start-Process -FilePath $browser -PassThru -ArgumentList @(
    "--app=$Url",
    $mode,
    "--user-data-dir=`"$profileDir`"",
    "--window-position=$($t.x),$($t.y)",
    "--window-size=$($t.width),$($t.height)",
    '--noerrdialogs',
    '--disable-session-crashed-bubble',
    '--disable-infobars',
    '--no-first-run'
  )
  Write-Log "window opened (PID $($p.Id))"
  return $p
}

function Get-Rect([IntPtr]$h) {
  $r = New-Object KioskWin+RECT
  if (-not [KioskWin]::GetWindowRect($h, [ref]$r)) { return $null }
  return [pscustomobject]@{ x = $r.L; y = $r.T; width = $r.R - $r.L; height = $r.B - $r.T }
}

function Fills([object]$rect, [object]$t) {
  return ($rect -and $t -and $rect.x -eq $t.x -and $rect.y -eq $t.y -and $rect.width -eq $t.width -and $rect.height -eq $t.height)
}

if ($Replace) { Close-Existing }
$proc = Open-Window
if (-not $Keep) { exit 0 }

# ONE KEEPER PER -NAME, THE NEWEST. The first keeper hand-over (2026-09-16
# 21:50) had two: the old one saw its window vanish under -Replace, read the
# dying window's rectangle (-32000,-32000, the place Windows parks a minimised
# or closing window), decided the move had failed, and reopened a window of its
# own while the new keeper opened another. So: the newest keeper writes its PID
# to a file, every keeper checks the file each loop and steps aside the moment
# it is not the owner; a parked rectangle is left alone (a minimise is a
# decision too); and a keeper that reopens closes only ITS OWN window, never
# whatever else holds the profile.
$pidFile = Join-Path $stateDir ("kiosk-keeper-" + $Name + ".pid")
Set-Content -LiteralPath $pidFile -Value $PID -Encoding ASCII
Write-Log "keeping the window on monitor $Monitor (window PID $($proc.Id), keeper PID $PID)"
while ($true) {
  Start-Sleep -Seconds 10
  $owner = try { (Get-Content -LiteralPath $pidFile -Raw -ErrorAction Stop).Trim() } catch { '' }
  if ($owner -ne "$PID") { Write-Log "keeper PID $owner owns this window now - this keeper (PID $PID) steps aside"; exit 0 }
  if ($proc.HasExited) { Write-Log 'window closed - a close is a decision, the keeper stops'; exit 0 }
  $t = Get-Target
  if (-not $t) { continue }   # the screen is off or unplugged: leave the window where Windows put it
  $live = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
  if (-not $live -or $live.MainWindowHandle -eq 0) { continue }
  $rect = Get-Rect $live.MainWindowHandle
  if (-not $rect) { continue }
  if ($rect.x -le -32000 -or $rect.y -le -32000) { continue }   # minimised or closing: not ours to undo
  if (Fills $rect $t) { continue }
  Write-Log "window at $($rect.x),$($rect.y) $($rect.width)x$($rect.height) is not filling monitor $Monitor - moving it back"
  [KioskWin]::SetWindowPos($live.MainWindowHandle, [IntPtr]::Zero, $t.x, $t.y, $t.width, $t.height, 0x0040) | Out-Null
  Start-Sleep -Seconds 1
  $rect = Get-Rect $live.MainWindowHandle
  if (Fills $rect $t) { Write-Log 'moved back'; continue }
  Write-Log 'the move did not take (fullscreen lost) - reopening on its screen'
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 1500
  $proc = Open-Window
}
