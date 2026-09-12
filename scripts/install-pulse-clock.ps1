# Install the factory's heartbeat.
#
# WHY THIS IS A SCRIPT AND NOT A COMMAND TO PASTE.
#
# It was a command to paste on 2026-09-12, and it did not work. The command
# nested PowerShell inside `powershell -Command "..."`, so the OUTER shell
# expanded $a and $t to empty strings before the inner one ever saw them, and
# Register-ScheduledTask was called with -Action and -Trigger both blank. It
# failed silently enough that the task simply was not there afterwards.
#
# That is the repo's own Script-First Law arriving the expensive way: known work
# becomes a script before it becomes a habit, and a command handed over twice was
# always a script that had not been written yet.
#
# WHAT IT INSTALLS
#
# A clock, not an engine. `machines/pulse-belt.cjs` run from THIS directory every
# five minutes. The pulse is universal factory state and repo-agnostic - it
# resolves its own factory through __dirname and needs no consuming repo at all.
#
# It is deliberately NOT driven by `schedule.cjs`. That engine resolves its
# subject with `path.resolve(__dirname, "../..")`, so it drives the repo it lives
# in no matter what working directory it is launched from, and the host's
# LivingFactory-Schedule task is therefore permanently pointed at Telechurch.
# Pointing it here is not a setting, it is the shelved engine decision.
#
# The pulse must also never depend on anything that can hesitate. Its own
# doctrine: "deliberately the stupidest component in the factory: one tool, no
# judgement, nothing that can prompt", because a thing whose only job is to prove
# time passed must never have a reason to wait for an answer.
#
# Idempotent: re-running replaces the task rather than erroring or duplicating.
# Undo:  Unregister-ScheduledTask -TaskName LivingFactory-PulseBelt -Confirm:$false

$ErrorActionPreference = 'Stop'

$TaskName = 'LivingFactory-PulseBelt'
$FactoryRoot = Split-Path -Parent $PSScriptRoot
$Machine = Join-Path $FactoryRoot 'machines\pulse-belt.cjs'

Write-Host "factory root : $FactoryRoot"

if (-not (Test-Path $Machine)) {
    Write-Host "FAILED: no machine at $Machine" -ForegroundColor Red
    Write-Host "This script must live in scripts/ inside the factory repo."
    exit 1
}

$node = (Get-Command node -ErrorAction SilentlyContinue)
if ($null -eq $node) {
    Write-Host 'FAILED: node is not on PATH.' -ForegroundColor Red
    exit 1
}
$NodeExe = $node.Source
Write-Host "node         : $NodeExe"

# Prove the machine runs BEFORE scheduling it. Registering a clock for something
# that cannot run produces a task that fails every five minutes forever, and a
# failing task is quieter than no task at all.
& $NodeExe $Machine --list | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: the machine exits $LASTEXITCODE on a read-only run; not scheduling it." -ForegroundColor Red
    exit 1
}
Write-Host 'machine      : runs clean (--list, wrote nothing)'

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -ne $existing) {
    Write-Host "existing     : found, replacing it"
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute $NodeExe -Argument 'machines\pulse-belt.cjs' -WorkingDirectory $FactoryRoot
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew
$description = 'The factory own heartbeat. Ticks machines/pulse-belt.cjs every 5 minutes with the factory as working directory, so universal pulse state has something universal writing it. A clock, not an engine. Installed by scripts/install-pulse-clock.ps1.'

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description $description | Out-Null

# VERIFY, rather than trust the call that just returned. A registration that
# reports success and leaves no task is exactly the failure this script exists
# to stop happening a second time.
$check = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -eq $check) {
    Write-Host 'FAILED: Register-ScheduledTask returned without error but no task exists.' -ForegroundColor Red
    exit 1
}

$info = Get-ScheduledTaskInfo -TaskName $TaskName
Write-Host ''
Write-Host "INSTALLED    : $TaskName" -ForegroundColor Green
Write-Host "state        : $($check.State)"
Write-Host "next run     : $($info.NextRunTime)"
Write-Host "every        : 5 minutes"
Write-Host ''
Write-Host 'The belt fills over 15 minutes, not at once:'
Write-Host '  +0m   a card appears in incoming'
Write-Host '  +5m   it moves to belt'
Write-Host '  +10m  it reaches resolved'
Write-Host '  +15m  it is pruned'
Write-Host ''
Write-Host 'Watch it with:  npm run pulse:list'
