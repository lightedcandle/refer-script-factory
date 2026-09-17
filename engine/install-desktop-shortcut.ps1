param(
  [string]$Name = "Script Factory",
  [int]$Monitor = 2,
  [switch]$Remove
)

# A desktop icon for the board. Operator, 2026-09-16: "can i have an icon on my
# desktop for the script factory."
#
# The shortcut runs engine/board-host.ps1 - warm the server if it is not up,
# open the board fullscreen on -Monitor - through run-hidden.vbs, so nothing
# flashes a console on the way. Double-click, and the board is on the screen.
# The icon is Chrome's or Edge's, whichever the kiosk will use; it is the
# window the click produces, so it is the honest picture of it.
#
#   install-desktop-shortcut.ps1 [-Name "Script Factory"] [-Monitor 2]
#   install-desktop-shortcut.ps1 -Remove

$ErrorActionPreference = 'Stop'

$desktop  = [Environment]::GetFolderPath('Desktop')
$shortcut = Join-Path $desktop ($Name + ".lnk")

if ($Remove) {
  if (Test-Path -LiteralPath $shortcut) { Remove-Item -LiteralPath $shortcut -Force; Write-Host "Removed $shortcut" }
  else { Write-Host "No shortcut at $shortcut" }
  exit 0
}

$host_    = Join-Path $PSScriptRoot 'board-host.ps1'
$launcher = Join-Path $PSScriptRoot 'run-hidden.vbs'
foreach ($f in $host_, $launcher) { if (-not (Test-Path -LiteralPath $f)) { throw "missing $f - this installer must sit beside it in engine/" } }

$icon = $null
foreach ($candidate in @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
  )) {
  if (Test-Path -LiteralPath $candidate) { $icon = "$candidate,0"; break }
}
if (-not $icon) { $icon = "$env:SystemRoot\System32\shell32.dll,14" }

$powershell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$wsh = New-Object -ComObject WScript.Shell
$lnk = $wsh.CreateShortcut($shortcut)
$lnk.TargetPath = Join-Path $env:SystemRoot 'System32\wscript.exe'
$lnk.Arguments = "//B //Nologo `"$launcher`" `"$powershell`" -NoProfile -ExecutionPolicy Bypass -File `"$host_`" -Monitor $Monitor -Keep"
$lnk.WorkingDirectory = Split-Path -Parent $PSScriptRoot
$lnk.IconLocation = $icon
$lnk.Description = "Open the Living Factory board on monitor $Monitor"
$lnk.WindowStyle = 7   # minimized, in case anything does surface
$lnk.Save()

Write-Host "Installed $shortcut"
Write-Host "Double-click: the board opens fullscreen on monitor $Monitor (server warmed first if needed)."
Write-Host "Move it:      install-desktop-shortcut.ps1 -Monitor 1"
Write-Host "Remove it:    install-desktop-shortcut.ps1 -Remove"
