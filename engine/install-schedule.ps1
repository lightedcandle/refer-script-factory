# Give the factory a heartbeat that does not depend on anybody being in the room.
#
# Operator, 2026-09-11: "The living factory appears stale. Can't seem to keep up
# with life."
#
# It could not, and the cause was structural rather than a slow station: NOTHING
# ON THIS MACHINE INVOKED THE CLOCK. Stations declared 10- and 15-minute
# cadences, and the only thing walking them was a Claude session doing it by
# hand. The factory ran while somebody was watching it, which is the exact
# arrangement the whole system exists to end - and it is why the board kept
# drifting into DUE and STALLED between visits.
#
# His first requirement, from the first message: flip the switch, and the timer
# is running. This is that switch.
#
#   powershell -File engine\install-schedule.ps1 [-Subject E:\Telechurch-e2e-v2]
#
# WHERE THIS FILE LIVES, and why it moved. It was written in SovereignNode as
# scripts/install-factory-schedule.ps1 and pointed the task at Telechurch's
# tools/factory/schedule.cjs, because that is where the engine was born. It was
# never merged to that repo's main - it sat on a recovery branch - so the switch
# for the factory's heartbeat had no home on any main. On 2026-09-14 the engine
# came home to the factory (PLAN-LIVING-FACTORY-ENGINE-HOME-001) and the switch
# came with it: the installer sits beside the engine it installs, finds it as a
# sibling, and can never register a path that does not exist next to it.
#
# ---------------------------------------------------------------------------
# WHY THIS SHAPE, which took two wrong versions and some reading to reach.
#
# ATTEMPT 1 used New-ScheduledTaskTrigger -Once with -RepetitionInterval and no
# duration, assuming "no end date" means forever. Read back, the registered
# trigger said: interval PT5M, duration (none set), stopAtDurationEnd True.
#
# Researched rather than assumed, because the assumption was load-bearing. The
# PowerShell community is consistent that omitting RepetitionDuration does not
# give indefinite repetition. Microsoft's own authoritative pages - the
# Repetition schema element, and "Repeating A Task" - describe only the case
# where a duration IS given, and say nothing at all about omitting it.
#
# So the behaviour the heartbeat depended on is UNDOCUMENTED. Two sources
# disagreed and the authoritative one was silent, which is not a tie: it means
# the answer is not knowable, and a factory heartbeat is the last place to build
# on something not knowable. It would have stopped quietly at an unknown point
# and re-created the exact staleness it exists to fix.
#
# ATTEMPT 2 used schtasks /sc MINUTE /mo 5, which IS documented as indefinite.
# It failed for a different reason: node lives at "C:\Program Files\nodejs" and
# PowerShell re-tokenizes quoted spans passed to a native command, so the path
# arrived split at the space. That trap is already written down in this corpus.
#
# THIS VERSION builds the task through the Task Scheduler's own object model.
# No shell, so no quoting to get wrong, and every field is set explicitly:
#
#   a DAILY trigger repeating every 5 minutes for 23h59m, which is the pattern
#   Microsoft support recommends after the known bug where a daily trigger set
#   to repeat "indefinitely" does not start on its own. Finite duration, and the
#   daily trigger re-arms it every day - so it runs forever by renewing rather
#   than by relying on an unbounded value nobody documents.
#
# Five minutes, because the fastest station declares ten and a ticker must be
# faster than its fastest passenger. The engine's own three safeties - singleton,
# coalesce and floor - mean a tick landing on running work does nothing.
#
# Runs in the logged-on user's context on purpose. "Whether logged on or not"
# needs a stored password, and handling his password is not something this may
# do. The machine this lives on stays logged in; that is what a dedicated box is.
#
# Re-running this is how the task is CHANGED, not just created: registration is
# CREATE_OR_UPDATE, so a repoint is "edit this file, run it once", which is the
# script-first rule. On 2026-09-14 that is exactly how the task moved from
# Telechurch's copy of the engine to this one.

param(
  # THE PRIMARY SUBJECT. The engine ticks the repo it is started in, writes the
  # pulse card, and then fans out one child tick per wired repo in the ecosystem
  # map. Telechurch was the primary from the first beat until 2026-09-15 01:37,
  # because the engine was born there. Operator, 2026-09-15: "make the factory
  # the primary subject." The default is now the factory itself - the directory
  # above this file - so the beat stamps where the engine lives and no product
  # repo is load-bearing for the factory's heartbeat. Telechurch is a child like
  # every other wired repo.
  [string]$Subject = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"

$TaskName = "LivingFactory-Schedule"
$OldTask  = "LivingFactory-Clock"   # removed at the end, and only once the new one is registered

$Node   = (Get-Command node).Source
$Engine = Join-Path $PSScriptRoot "schedule.cjs"   # a sibling: the installer lives beside the engine

# THE GUARD THAT MATTERS. Registering a task whose script is missing gives a task
# that fails every five minutes, and the only symptom is a board going quietly
# stale while still reporting ALIVE - which is exactly the fault the heartbeat
# was written to end. Refusing costs nothing: the task that is already
# registered keeps ticking whatever it ticks today.
if (-not (Test-Path -LiteralPath $Engine)) {
  throw "no engine at $Engine - refusing to register a task that would fail every 5 minutes. This installer must sit beside engine/schedule.cjs in the factory."
}
if (-not (Test-Path -LiteralPath $Subject -PathType Container)) {
  throw "no subject at $Subject - the primary subject must be a repo on disk; the engine resolves its subject from the working directory."
}

$svc = New-Object -ComObject Schedule.Service
$svc.Connect()
$folder = $svc.GetFolder("\")

$def = $svc.NewTask(0)
$def.RegistrationInfo.Description = "Keeps the Living Factory's schedule: ticks every 5 minutes so every due trigger fires, in every wired repo. Without this nothing ticks the schedule and the factory only runs while a person is present."
$def.RegistrationInfo.Author = "Living Factory"

# TASK_TRIGGER_DAILY = 2
$trigger = $def.Triggers.Create(2)
$trigger.StartBoundary = (Get-Date).Date.ToString("yyyy-MM-ddTHH:mm:ss")
$trigger.DaysInterval = 1
$trigger.Enabled = $true
$trigger.Repetition.Interval = "PT5M"
$trigger.Repetition.Duration = "PT23H59M"
$trigger.Repetition.StopAtDurationEnd = $false

# TASK_ACTION_EXEC = 0
$action = $def.Actions.Create(0)
$action.Path = $Node
$action.Arguments = $Engine
# The engine resolves its subject from the CURRENT DIRECTORY, never from its own
# location - that is the one rule the universal machines keep, so a single
# factory can serve many repos. Since 2026-09-14 the engine's own ROOT line is
# process.cwd(), so this field is the whole answer to "which repo is primary".
# Getting it wrong would point the factory at the wrong repo silently rather
# than failing - which is why the subject is checked above before anything is
# registered.
$action.WorkingDirectory = $Subject

$def.Settings.Enabled = $true
$def.Settings.StartWhenAvailable = $true          # slept through a tick? run on wake
$def.Settings.MultipleInstances = 2               # IgnoreNew: never overlap a slow tick
$def.Settings.DisallowStartIfOnBatteries = $false # a lid must not stop the factory
$def.Settings.StopIfGoingOnBatteries = $false
$def.Settings.ExecutionTimeLimit = "PT10M"
$def.Settings.RestartCount = 3
$def.Settings.RestartInterval = "PT5M"
$def.Settings.Priority = 5
# Ask to wake the machine for a tick. Honest caveat: this host has "allow wake
# timers" set to 2 (important only), and a task's wake request is not usually
# treated as important - so this may well be ignored here. It is set anyway
# because it costs nothing and becomes effective the moment that policy changes.
# Changing the policy is a system power setting and therefore his call, not
# mine; the factory reports the resulting quiet period instead of pretending it
# did not happen.
$def.Settings.WakeToRun = $true

# TASK_CREATE_OR_UPDATE = 6, TASK_LOGON_INTERACTIVE_TOKEN = 3
$folder.RegisterTaskDefinition($TaskName, $def, 6, $null, $null, 3) | Out-Null

Write-Output "registered $TaskName - every 5 minutes, renewed daily, engine $Engine, working dir $Subject"

# ---------------------------------------------------------------------------
# THE MORNING REPORT, on the same mechanism.
#
# Operator, 2026-09-11: "now let it run overnight and report what it did."
#
# The report must not depend on anybody being awake to write it - the same
# principle as the heartbeat. A factory that needs a person to describe itself
# is only half autonomous, and "what did it do overnight" is exactly the
# question a person cannot answer, because they were asleep for the answer.
#
# Once a day at 07:00 rather than on an interval, because a night has an end and
# a report about it has a right moment. The engine walks intervals and has no
# concept of a time of day; rather than teach it one for a single caller, this
# uses the scheduler that already knows about mornings.
#
# night-report.cjs is Telechurch's own tool - it did not move with the engine,
# because it reports on one repo's night. It is registered only when the subject
# has it; a subject without one simply has no morning report, and an already
# registered report task is left exactly as it is (this block only ever
# CREATE_OR_UPDATEs, never removes). With the factory as primary, Telechurch's
# report task keeps running in Telechurch untouched.
$ReportTask = "LivingFactory-NightReport"
$Report = Join-Path $Subject "tools\factory\night-report.cjs"
if (Test-Path -LiteralPath $Report) {
  $rdef = $svc.NewTask(0)
  $rdef.RegistrationInfo.Description = "Writes what the Living Factory did overnight, then re-marks the baseline for the next night."
  $rdef.RegistrationInfo.Author = "Living Factory"

  $rt = $rdef.Triggers.Create(2)   # daily
  $rt.StartBoundary = (Get-Date).Date.AddDays(1).AddHours(7).ToString("yyyy-MM-ddTHH:mm:ss")
  $rt.DaysInterval = 1
  $rt.Enabled = $true

  $ra = $rdef.Actions.Create(0)
  $ra.Path = $Node
  $ra.Arguments = "tools\factory\night-report.cjs"
  $ra.WorkingDirectory = $Subject

  $rdef.Settings.Enabled = $true
  $rdef.Settings.StartWhenAvailable = $true   # slept past 07:00? report on wake
  $rdef.Settings.MultipleInstances = 2
  $rdef.Settings.DisallowStartIfOnBatteries = $false
  $rdef.Settings.StopIfGoingOnBatteries = $false
  $rdef.Settings.ExecutionTimeLimit = "PT10M"

  $folder.RegisterTaskDefinition($ReportTask, $rdef, 6, $null, $null, 3) | Out-Null
  Write-Output "registered $ReportTask - daily at 07:00, in $Subject"
} else {
  Write-Output "no $Report - $ReportTask not registered; the subject has no night report"
}

$t = Get-ScheduledTask -TaskName $TaskName
$i = $t | Get-ScheduledTaskInfo
Write-Output ("  state={0}  next={1}" -f $t.State, $i.NextRunTime)

# ---------------------------------------------------------------------------
# RETIRE THE OLD TASK - LAST, AND ONLY IF THE NEW ONE IS ACTUALLY THERE.
#
# Two tasks ticking the same schedule is harmless (the singleton lock makes the
# second tick a no-op) but it is two things to reason about, and one of them
# points at a deprecated filename. So the old one goes.
#
# Ordered deliberately: the new task is registered and read back BEFORE this
# runs. Removing the old one first would leave a window with no heartbeat at
# all, and if registration then failed there would be nothing ticking and
# nothing saying so. Deleting a working guard before its replacement is proven
# is the shape of mistake this whole corpus keeps recording.
if ($t.State -in @("Ready", "Running")) {
  $old = Get-ScheduledTask -TaskName $OldTask -ErrorAction SilentlyContinue
  if ($old) {
    Unregister-ScheduledTask -TaskName $OldTask -Confirm:$false
    Write-Output "  retired $OldTask - $TaskName is registered and $($t.State)"
  } else {
    Write-Output "  $OldTask was already gone"
  }
} else {
  Write-Output "  KEEPING $OldTask - $TaskName registered but reads $($t.State), so the old heartbeat stays until this one is healthy"
}
$t.Triggers | ForEach-Object {
  Write-Output ("  interval={0}  duration={1}  stopAtEnd={2}" -f $_.Repetition.Interval, $_.Repetition.Duration, $_.Repetition.StopAtDurationEnd)
}
$t.Actions | ForEach-Object {
  Write-Output ("  runs: {0} {1}   in {2}" -f $_.Execute, $_.Arguments, $_.WorkingDirectory)
}
