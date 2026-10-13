# Sets the guide gate's settings on the live SMS relay, and nothing else.
#
# The relay's code already holds the guide; it stays switched off until these
# settings exist. They are read from an ignored file (.env.guide.local): the
# test visitor numbers, the test pastor number, the church, and two time limits.
# No other secret is read, sent or changed, and no value is printed.
#
# To switch the guide off again: set ALLIANCE_GUIDE_TEST_VISITOR_PHONES=off in
# that file and run this once more.
#
#   powershell -ExecutionPolicy Bypass -File tools\guide-gate-set.ps1
param(
  [string]$GuideEnv = (Join-Path $PSScriptRoot '..\.env.guide.local'),
  [string]$MasterEnv = 'E:\Telechurch-e2e-v2\.env.master',
  [string]$ProjectRef = 'skqmzcdmfaijxpbvcdal'
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $GuideEnv)) { throw "Missing guide settings file: $GuideEnv" }
if (-not (Test-Path $MasterEnv)) { throw "Missing env file: $MasterEnv" }
$line = Get-Content $MasterEnv | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN\s*=' } | Select-Object -First 1
if (-not $line) { throw 'No SUPABASE_ACCESS_TOKEN in the env file.' }
$env:SUPABASE_ACCESS_TOKEN = ($line -replace '^SUPABASE_ACCESS_TOKEN\s*=\s*', '').Trim().Trim('"').Trim("'")
try {
  supabase secrets set --project-ref $ProjectRef --env-file (Resolve-Path $GuideEnv).Path | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'supabase secrets set failed.' }
  $names = supabase secrets list --project-ref $ProjectRef |
    Select-String 'ALLIANCE_GUIDE' | ForEach-Object { ($_.Line -split '\|')[0].Trim() }
  'Guide settings now on the relay (names only):'
  $names
} finally {
  $env:SUPABASE_ACCESS_TOKEN = $null
}
