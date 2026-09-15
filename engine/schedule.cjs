#!/usr/bin/env node
/**
 * THE SCHEDULE - every machine carries its own, and anyone may call one.
 *
 * Operator, 2026-09-12: "Let's redefine Station to be Trigger and then we can
 * prefix it with whatever trigger it is. Clock should not be used, it means just
 * the current time or some other time to be defined. Schedule means the time
 * that has been set."
 *
 * So three words now mean three different things and the file names say which:
 *
 *   CLOCK     what time is it. Nothing here is called that any more.
 *   SCHEDULE  the times that have been SET. This file.
 *   TRIGGER   the thing that fires. Was "station".
 *
 * A TRIGGER IS PREFIXED BY WHAT FIRES IT, and the four classes already exist in
 * the plan - Invoked, Triggered, Scheduled, and polling as a zero interval:
 *
 *   schedule trigger  fires at a set time. All twelve of ours are these.
 *   chat trigger      fires because a person said so.
 *   spawn trigger     fires because an agent spawned it.
 *   event trigger     fires on a real event - a hook, CI, a user path.
 *
 * THAT IS THE SAME LIST AS THE THREE INTAKE DOORS on the board: auto is the
 * schedule door, chat the chat door, spawn the spawn door. One vocabulary
 * answering both "what fires this" and "which door did the work come through",
 * which is the reason the model is right rather than a coincidence. Do not mint
 * a second set of words for either.
 *
 * Operator, 2026-09-11, on the original shape: "There needs to be a scheduler
 * attached at various locations, because not all run on a dependence - some
 * machinery needs its own timer and scheduler. Actually I think all machines
 * should run on a clock, and anytime something needs them they run now() or
 * schedule now+15min."
 *
 * WHY THIS SHAPE AND NOT A TIMETABLE
 *
 * A central scheduler is a supervisor, and S3.1 threw supervisors out: stations
 * trigger off outputs, never off something above them. One timetable dispatching
 * everything is the tower that principle rejects - and it failed here in
 * practice on 2026-09-10, when a station hung and nothing noticed, because the
 * only thing that could notice lived in the same timetable.
 *
 * So the outside world gets exactly ONE job: tick. It knows nothing about
 * triggers. Every trigger declares its own cadence in a `*.trigger.json` beside
 * its own machinery, and this walks them.
 *
 * Two things follow that are worth more than the scheduling itself:
 *
 *   1. The schedule becomes VERSION CONTROLLED. It currently lives outside
 *      every repo in one machine's private settings, controlled by nothing.
 *   2. Adding a trigger becomes a FILE beside the machine, not a settings
 *      change - and not an edit to one shared manifest that concurrent
 *      sessions would fight over, which is a live trap in this tree.
 *
 * THE THREE SAFETIES, without which "everything is scheduled" becomes
 * "the plant never sleeps":
 *
 *   singleton  a trigger cannot fire twice at once. Two runs would fight over
 *              the same working tree, which has already caused real damage here.
 *   coalesce   asking a trigger to fire while a run is already pending does
 *              nothing new. Without this one commit wakes eight triggers, each
 *              of which wakes two more.
 *   floor      a trigger declares the fastest it may ever fire, whoever asks.
 *              The operator's "inner systems don't outrun it", enforced by the
 *              machine instead of by someone choosing numbers by hand.
 *
 * BOTH SUFFIXES AND BOTH STATE FILES ARE ACCEPTED FOR ONE RELEASE. The renaming
 * commit cannot land everywhere at once: the Windows task that ticks this runs
 * with its working directory in a checkout that advances on its own schedule, so
 * for a while some trees will have `*.station.json` and `clock-state.json` and
 * others will have the new names. A half-renamed tree must still run - a rename
 * that stops the heartbeat recreates the exact fault the heartbeat was built to
 * fix. Drop the legacy names once no tree carries them.
 *
 * WHERE THIS FILE LIVES, since 2026-09-14: `<factory>/engine/schedule.cjs`. It
 * was `E:/Telechurch-e2e-v2/tools/factory/schedule.cjs` until then - one engine
 * per repo, adjacent to its subject - and the move is what makes the subject a
 * parameter rather than a location. It is not a machine: a machine asks what is
 * true here, a script makes something here, an ENGINE decides what runs here and
 * when. The same law still applies to it as to `machines/` - it is read off disk
 * by the Windows task at the moment it fires, so saving it is deploying it.
 *
 *   node <factory>/engine/schedule.cjs              tick: fire everything due
 *   node <factory>/engine/schedule.cjs --list       every trigger, when it next fires
 *   node <factory>/engine/schedule.cjs --now <id>   fire one now, floor still applies
 *   node <factory>/engine/schedule.cjs --in 15m <id>   ask for it later
 *   node <factory>/engine/schedule.cjs --dry        say what would fire, fire nothing
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// THE SUBJECT IS A PARAMETER. Operator, 2026-09-14: "lets wire the script
// factory repo in the board ... at the very least it should be able to monitor
// itself." This line was `path.resolve(__dirname, "../..")` and nothing else,
// so the engine could only ever drive the repo it lives in. The plan (M3) says
// the opposite: "Scope is all apps. The schedule sits above the apps."
//
//   node <factory>/engine/schedule.cjs                 tick the WORKING DIRECTORY, then fan out
//   node <factory>/engine/schedule.cjs --root <repo>   tick that repo only
//
// A run with --root is a CHILD: it ticks one subject and stops. The run
// without it is the PRIMARY: it ticks the working directory, writes the pulse
// card, and then fans out one isolated child per wired repo (see the end of
// this file). Everything below that says ROOT means the subject.
//
// THE FALLBACK IS NOW `process.cwd()`, NOT `__dirname`, AND THAT IS THE WHOLE
// COST OF THE MOVE. The engine no longer sits inside the repo it drives, so its
// own location says nothing about the subject; the working directory does, and
// it is the same directory this file hands every station it spawns, which is
// what makes cwd the honest answer rather than a convenient one. The price is
// exactly the one written down before the move: the primary subject is now set
// by the Windows Scheduled Task's working directory, configuration that lives
// outside every repository. A task registered against the wrong directory
// points the primary tick at the wrong repo and every machine inherits the
// error at once, with plausible numbers. The fan-out below softens it - every
// OTHER wired repo is ticked from the ecosystem map whatever the working
// directory is - but the primary's own subject has no second source. If the
// board's repo picker ever shows the wrong repo as the primary, check the task
// before you check anything in here.
const rootArg = (() => {
  const i = process.argv.indexOf("--root");
  return i >= 0 && process.argv[i + 1] ? path.resolve(process.argv[i + 1]) : null;
})();
const ROOT = rootArg || process.cwd();
const PRIMARY = !rootArg;
const CTX = path.join(ROOT, ".claude/agent-context");
const STATE = path.join(CTX, "schedule-state.json");
const STATE_LEGACY = path.join(CTX, "clock-state.json");
const SEARCH = ["tools", "tools/factory", "scripts"];
// Was ".station.json". Both are read for one release - see the header.
const SUFFIXES = [".trigger.json", ".station.json"];

// Carry the schedule across the rename ONCE, on first run, rather than dual
// writing forever. Dual writing is two sources that can disagree, which is the
// defect this whole board keeps being caught on; a one-time copy has a single
// source the moment it completes.
//
// Every trigger's last-run time, adaptive rung and lock lives in here. Losing it
// would make every trigger look like it had never run, and the board's liveness
// lamp reads NEVER RUN off exactly that - so the migration happens before
// anything reads state, and it never overwrites a newer file.
if (!fs.existsSync(STATE) && fs.existsSync(STATE_LEGACY)) {
  try {
    fs.mkdirSync(CTX, { recursive: true });
    fs.copyFileSync(STATE_LEGACY, STATE);
    console.log(`schedule: carried the schedule over from clock-state.json`);
  } catch (err) {
    console.error(`schedule: could not carry clock-state.json over - ${err.message}`);
  }
}

// ---- duration grammar -------------------------------------------------------

const UNITS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
function ms(spec) {
  const m = String(spec || "").trim().match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i);
  if (!m) throw new Error(`bad duration "${spec}" - use 30s, 15m, 6h, 7d`);
  return Number(m[1]) * UNITS[m[2].toLowerCase()];
}
const human = (t) => (t === null ? "never" : new Date(t).toISOString().replace("T", " ").slice(0, 16) + "Z");
const human2 = (msVal) => {
  const m = Math.round(msVal / 6e4);
  return m < 60 ? `${m}m` : `${(m / 60).toFixed(m % 60 ? 1 : 0)}h`;
};

// ---- discover stations ------------------------------------------------------
//
// Beside the machinery, not in a central manifest. "Attached at various
// locations" is the operator's phrase and it is also the safer design: a shared
// manifest is a file every concurrent session edits at once.

function discover() {
  const found = [];
  const seen = new Set();
  for (const rel of SEARCH) {
    const dir = path.join(ROOT, rel);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const suffix = SUFFIXES.find((s) => f.endsWith(s));
      if (!suffix) continue;
      const p = path.join(dir, f);
      let decl;
      try {
        decl = JSON.parse(fs.readFileSync(p, "utf8"));
      } catch (err) {
        console.error(`schedule: ${path.relative(ROOT, p)} is not readable - ${err.message}`);
        process.exitCode = 2;
        continue;
      }
      // AN EXTERNALLY DRIVEN RHYTHM DECLARES `drivenBy` INSTEAD OF `run`.
      //
      // It is discovered, listed and drawn exactly like every other trigger, and
      // this scheduler never fires it. The primordial tick forced the case: it
      // RUNS this scheduler, so the scheduler cannot run it without recursing -
      // and until it had a declaration of its own, the rail had no row for the
      // one rhythm everything else is downstream of, and borrowed a different
      // trigger's row to draw it. That is how a health check came to be called
      // the pulse, and how a request to beat every five minutes was applied to
      // the wrong thing.
      //
      // One registration pattern, not two: anything that keeps time here says so
      // in a file next to the others, whether or not this repo is what fires it.
      const required = decl.drivenBy ? ["id", "drivenBy", "every"] : ["id", "run", "every", "floor"];
      for (const field of required) {
        if (!decl[field]) {
          console.error(`schedule: ${path.relative(ROOT, p)} is missing "${field}"`);
          process.exitCode = 2;
          decl = null;
          break;
        }
      }
      if (!decl) continue;
      // A tree caught mid-rename can hold BOTH names for one trigger. Running it
      // twice per tick would break the singleton safety by the back door, and it
      // would be invisible - two clean runs look exactly like one. First name
      // wins, and the duplicate is named out loud so somebody deletes it.
      if (seen.has(decl.id)) {
        console.error(`schedule: "${decl.id}" is declared twice - ignoring ${path.relative(ROOT, p)}. Delete the stale one.`);
        process.exitCode = 2;
        continue;
      }
      seen.add(decl.id);
      found.push({
        ...decl,
        // Every trigger here fires on a set time. The field is explicit so a
        // chat, spawn or event trigger can declare itself later without this
        // file having to guess from the absence of something.
        kind: decl.kind || (decl.drivenBy ? "external" : "schedule"),
        // An external rhythm's cadence is set somewhere else, so this repo must
        // not pretend to adapt it: no ladder, and the floor defaults to the pace
        // itself. Defaulted rather than required, because a declaration that can
        // crash the scheduler by omitting a field it does not need is a trap, and
        // this scheduler runs unattended every five minutes.
        floor: decl.floor || decl.every,
        adaptive: decl.drivenBy ? false : decl.adaptive,
        declaredIn: path.relative(ROOT, p).replace(/\\/g, "/"),
        legacyName: suffix === ".station.json",
      });
    }
  }
  return found.sort((a, b) => a.id.localeCompare(b.id));
}

// ---- where a universal machine lives ----------------------------------------
//
// A station may name its machinery two ways:
//
//   "run": "node tools/foo.cjs"   repo-local, as before
//   "run": "factory:pulse-check"  a UNIVERSAL machine, shared by every repo
//
// The second form exists because most of this machinery was never this repo's.
// A clock, a pulse, a belt check and a host restart manager are true of any repo
// that runs a factory, and keeping a copy in each is how four copies drift into
// four behaviours. One copy, many repos, and the repo says only WHICH machines
// it runs and how often - which is the same separation the station declarations
// already make between machine and cadence.
//
// THE FACTORY IS THE DIRECTORY ABOVE THIS FILE, and since 2026-09-14 that is a
// fact rather than a search. The list used to be `REFER_FACTORY_ROOT`, then the
// hardcoded `E:/refer-script-factory`, then a guess at a sibling of the subject
// - three candidates that existed only because this engine lived in a different
// repo from the machines it resolves. It now ships inside the factory, so the
// machines it runs are its own siblings and a guess would only be a way to run
// somebody else's copy. The environment override is kept ahead of it for the
// one case it was always for: a second factory checkout driving a tick.
//
// A missing factory is still reported as a missing factory, never as a station
// that simply failed - those are different problems with different fixes.
const FACTORY_CANDIDATES = [process.env.REFER_FACTORY_ROOT, path.resolve(__dirname, "..")].filter(Boolean);

let factoryRoot = null;
for (const c of FACTORY_CANDIDATES) {
  if (fs.existsSync(path.join(c, "machines"))) {
    factoryRoot = c;
    break;
  }
}

function resolveRun(st) {
  const run = String(st.run || "");
  if (!run.startsWith("factory:")) return run;
  // A UNIVERSAL MACHINE MAY BE GIVEN ARGUMENTS: "factory:watcher --arm".
  //
  // The whole string used to be read as the machine's name, so the first
  // declaration that needed a flag would have gone looking for a file called
  // `watcher --arm --arm-limit 0.cjs` and failed with a message about a missing
  // machine rather than about an unsupported form. The name is the first token;
  // everything after it is passed through untouched.
  //
  // This is what lets a repo declare HOW it wants a shared machine run without
  // forking the machine - which is the whole point of one copy, many repos.
  const [name, ...runArgs] = run.slice("factory:".length).trim().split(/\s+/);
  if (!factoryRoot) {
    throw new Error(
      `station "${st.id}" needs the universal factory and it was not found. Looked in:\n` +
        FACTORY_CANDIDATES.map((c) => `    ${c}`).join("\n") +
        `\n  Set REFER_FACTORY_ROOT, or mount the factory repo. This is NOT the station failing.`,
    );
  }
  const p = path.join(factoryRoot, "machines", `${name}.cjs`);
  if (!fs.existsSync(p)) throw new Error(`station "${st.id}" names universal machine "${name}", which is not at ${p}`);
  return [`node`, p, ...runArgs].join(" ");
}

// ---- DO NOT RUN A FILE SOMEBODY IS STILL WRITING ----------------------------
//
// THERE IS NO DEPLOY STEP IN THIS FACTORY. A machine is read off disk at the
// moment it runs, from a shared working tree, so SAVING a file is deploying it.
// Not committing - saving.
//
// Measured 2026-09-12: a worker was midway through extending the watcher when
// the 12:50 tick fired, ran the half-finished file, and armed eight annotations
// onto the live belt. That run also carried a bug the author had not yet found.
// The worker had full worktree isolation on the product repo and none at all
// here, because the isolation protects the repo being CHANGED and this factory
// runs from the repo doing the changing.
//
// So: ask git whether the machine has uncommitted changes, and if it does, do
// not run it this tick.
//
// IT FAILS OPEN, DELIBERATELY. If git cannot answer - not a repo, git missing,
// a permission error - the trigger RUNS and the tick says it could not check.
// A guard that fails closed would stop the entire factory the first time git
// hiccupped, and a silently stopped factory is the failure this whole system
// exists to prevent. Refusing to run is the strong action and it is taken only
// on strong evidence.
//
// It cannot check itself. This file is read the same way, so editing the
// scheduler deploys the scheduler - warned about at startup, not blocked,
// because blocking would need this file to already be running to say so.
function machineIsMidEdit(command) {
  const m = String(command).match(/(\S+\.(?:cjs|mjs|js))/);
  if (!m) return { checked: false, why: "no script path in the command" };
  let file = m[1];
  if (!path.isAbsolute(file)) file = path.resolve(ROOT, file);
  if (!fs.existsSync(file)) return { checked: false, why: "the file is not there" };
  let r;
  try {
    r = spawnSync("git", ["-C", path.dirname(file), "status", "--porcelain", "--", file], {
      encoding: "utf8",
      windowsHide: true,
    });
  } catch (err) {
    return { checked: false, why: `git could not be run - ${err.message}` };
  }
  if (r.error) return { checked: false, why: `git could not be run - ${r.error.message}` };
  if (r.status !== 0) return { checked: false, why: "the file is not inside a git repository" };
  const line = String(r.stdout || "").trim().split("\n")[0] || "";
  return { checked: true, dirty: line.length > 0, detail: line.trim() };
}

// ---- state ------------------------------------------------------------------

// A TRIGGER THAT IS RENAMED KEEPS ITS HISTORY.
//
// The state is keyed by trigger id, so changing an id orphans everything known
// about it - last run, adaptive rung, run count - and a trigger with no last
// run reads as NEVER RUN, which is what the board's liveness lamp escalates on.
// A rename would therefore have stalled the lamp for a cycle and looked exactly
// like a dead factory.
//
// Carried under the new key, once, on read. Add to this when an id changes and
// remove the entry once no tree can still be holding the old one.
const RENAMED_IDS = { "board-critic": "manager" };

// The key was "stations". It is "triggers" now, and the old one is still read,
// because a state file written by any tree that has not taken this commit yet
// carries the old key - same reason, same consequence.
function readState() {
  const empty = { triggers: {} };
  if (!fs.existsSync(STATE)) return empty;
  try {
    const s = JSON.parse(fs.readFileSync(STATE, "utf8"));
    s.triggers ||= s.stations || {};
    delete s.stations;
    for (const [was, now_] of Object.entries(RENAMED_IDS)) {
      if (s.triggers[was] && !s.triggers[now_]) {
        s.triggers[now_] = s.triggers[was];
        console.log(`schedule: carried "${was}" history over to "${now_}"`);
      }
      delete s.triggers[was];
    }
    return s;
  } catch {
    return empty;
  }
}
// MERGE, never blind-overwrite.
//
// The first version read the whole file at startup, mutated its own copy, and
// wrote that copy back. Two invocations overlapping - a scheduled tick and a
// `--now` from a person - each wrote a snapshot taken before the other's work,
// so the later write silently erased the earlier one. It showed up as a trigger
// stuck "still running" forever: its run had finished and cleared the lock, and
// a stale snapshot put the lock back.
//
// That is the same lost-update this system already avoids on the belt by making
// it append-only. Here the fix is to re-read immediately before writing and
// merge per trigger, so two processes can only lose a race on the SAME trigger,
// not on unrelated ones.
function writeState(s, touched) {
  let disk = { triggers: {} };
  try {
    disk = JSON.parse(fs.readFileSync(STATE, "utf8"));
  } catch {
    /* first run, or unreadable - our copy becomes the file */
  }
  // Fold legacy names in rather than writing beside them. Two keys for one
  // thing is two answers waiting to disagree, and the whole point of carrying
  // history across a rename is that there is one history afterwards.
  disk.triggers ||= disk.stations || {};
  delete disk.stations;
  for (const [was, now_] of Object.entries(RENAMED_IDS)) {
    if (disk.triggers[was] && !disk.triggers[now_]) disk.triggers[now_] = disk.triggers[was];
    delete disk.triggers[was];
  }
  if (touched) {
    disk.triggers[touched] = s.triggers[touched];
  } else {
    for (const [id, v] of Object.entries(s.triggers)) disk.triggers[id] = v;
  }
  disk.updatedAt = new Date().toISOString();
  fs.writeFileSync(STATE, JSON.stringify(disk, null, 2) + "\n");
  // Keep the in-memory copy consistent with what is now on disk, so a later
  // read in this same process does not resurrect what another process wrote.
  s.triggers = disk.triggers;
}

// A lock is a timestamp, not a boolean. A boolean set by a run that was killed
// mid-flight would wedge the station shut forever, and nothing would say why -
// which is this system's single most expensive failure shape.
const LOCK_STALE_AFTER = ms("2h");

// ---- main -------------------------------------------------------------------

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : null;
};

const triggers = discover();
const state = readState();
const now = Date.now();

// A RUN BELONGS TO THE BEAT THAT STARTED IT, NOT TO THE SECOND IT FINISHED.
//
// The pulse fires on the five-minute grid - :00, :05, :10 - and lands within
// two seconds of it, every time (Task Scheduler log, 2026-09-13). A station
// run from the :10 beat finishes at :10:08 and that is what was stamped. Ten
// minutes later the :20 beat asks "has 10m passed since :10:08?" at :20:02,
// and the honest answer is "not for six seconds", so the station waits for
// the :25 beat. Every 10m station ran every 15m; every 15m station every 20m;
// the watcher, declared 30m, ran every 35m. Measured on the state file:
// board-serve at 21:55:02, 22:10:08, skipped at 22:20, ran at 22:25.
//
// The operator asked whether rounding would fix it, and it does: anchor the
// stamp to the grid before adding the interval, so a run from the :10 beat is
// due at :20 sharp and the :20 beat sees it. The grid is the pulse's own
// declared period, read from its trigger rather than assumed, so a faster
// pulse moves the grid with it.
const pulseDecl = triggers.find((t) => t.drivenBy && !t.run);
const TICK = ms((pulseDecl && pulseDecl.every) || "5m");
const onGrid = (t) => Math.floor(t / TICK) * TICK;

function slot(id) {
  return (state.triggers[id] ||= { lastRunAt: null, lastExit: null, requestedFor: null, lockedAt: null, runs: 0 });
}

// ---- adaptive cadence: attention is earned back, not assumed ----------------
//
// Operator, 2026-09-11: "2 hours to watch the board is a long time. It should be
// elastic... if there's an issue detected it reduces - 15 minutes, 30, 45, an
// hour, not an hour and a half... A machine doesn't need 2 hours to sit when
// they're in dysfunctional mode; it needs immediate attention, and more close
// attention. Only when it's proven itself to be functional can we relax the
// watching to 2 hours. That's intelligent dynamic watching."
//
// Right, and it generalises past the one station he was looking at: every
// station's declared interval is really its RELAXED interval, the pace it earns
// when nothing is wrong. A fixed interval makes the same bet in both directions
// - too slow while something is broken, too fast while nothing is.
//
// THE ASYMMETRY IS THE WHOLE POINT, and it is deliberate rather than a reading
// of his ladder as literal steps in both directions:
//
//   A fault drops STRAIGHT TO THE FLOOR. "Dysfunctional needs immediate
//   attention" - stepping 2h -> 1h on the first detection would leave something
//   broken unwatched for an hour, which is the opposite of what he asked for.
//
//   A clean run climbs ONE RUNG. Relaxation is earned back slowly, so a single
//   lucky pass cannot restore full complacency. Four clean runs to go from
//   15m back to 2h.
//
// This is the same adaptive policy the hive node registry declared in April and
// nothing ever honoured - base interval while working, backing off toward a
// ceiling when idle. It was right there; it just had no machine behind it.
const LADDER = ["15m", "30m", "45m", "1h", "2h"].map(ms);

function rungsFor(st) {
  const ceiling = ms(st.every);
  const floor = ms(st.floor);
  const rungs = LADDER.filter((r) => r >= floor && r < ceiling);
  rungs.push(ceiling);
  return rungs.length ? rungs : [ceiling];
}

function intervalFor(st) {
  const s = slot(st.id);
  const rungs = rungsFor(st);
  if (st.adaptive === false) return ms(st.every);
  const cur = Number(s.intervalMs);
  if (!cur || !rungs.includes(cur)) return ms(st.every);
  return cur;
}

// Called after a run. Exit 0 relaxes one rung; anything else drops to the floor.
function adapt(st, exit) {
  if (st.adaptive === false) return null;
  const s = slot(st.id);
  const rungs = rungsFor(st);
  const cur = rungs.includes(Number(s.intervalMs)) ? Number(s.intervalMs) : ms(st.every);
  const at = rungs.indexOf(cur);
  const next = exit === 0 ? rungs[Math.min(at + 1, rungs.length - 1)] : rungs[0];
  s.intervalMs = next;
  return { from: cur, to: next, tightened: next < cur, relaxed: next > cur };
}

function dueAt(st) {
  const s = slot(st.id);
  const byClock = s.lastRunAt === null ? now : onGrid(s.lastRunAt) + intervalFor(st);
  // A request can only pull a station FORWARD, never past its floor.
  const earliest = s.lastRunAt === null ? now : onGrid(s.lastRunAt) + ms(st.floor);
  if (s.requestedFor !== null) return Math.max(Math.min(byClock, s.requestedFor), earliest);
  return byClock;
}

// --list
if (has("--list")) {
  console.log(`schedule: ${triggers.length} trigger(s)\n`);
  console.log(`  ${"trigger".padEnd(22)} ${"kind".padEnd(9)} ${"pace".padEnd(6)} ${"relaxed".padEnd(8)} ${"last fired".padEnd(18)} next`);
  console.log(`  ${"-".repeat(22)} ${"-".repeat(9)} ${"-".repeat(6)} ${"-".repeat(8)} ${"-".repeat(18)} ----`);
  for (const st of triggers) {
    const s = slot(st.id);
    const next = dueAt(st);
    const cur = intervalFor(st);
    const mark = s.lockedAt && now - s.lockedAt < LOCK_STALE_AFTER ? "  RUNNING" : next <= now ? "  DUE" : "";
    // "pace" is what it is running at now; "relaxed" is what it earns back when
    // it keeps passing. They differ exactly when something has gone wrong.
    const tight = cur < ms(st.every) ? " *" : "";
    console.log(
      `  ${st.id.padEnd(22)} ${String(st.kind).padEnd(9)} ${(human2(cur) + tight).padEnd(6)} ${String(st.every).padEnd(8)} ${human(s.lastRunAt).padEnd(18)} ${human(next)}${mark}`,
    );
  }
  console.log(`\n  * running tighter than its relaxed pace - it faulted and has not earned the time back yet.`);
  const legacy = triggers.filter((t) => t.legacyName);
  if (legacy.length) console.log(`  ${legacy.length} still declared as *.station.json: ${legacy.map((t) => t.id).join(", ")}`);
  process.exit(0);
}

// --now <id> / --in <dur> <id>
const nowId = valueOf("--now");
const inDur = valueOf("--in");
if (nowId || inDur) {
  const id = nowId || argv[argv.indexOf("--in") + 2];
  const st = triggers.find((x) => x.id === id);
  if (!st) {
    console.error(`schedule: no trigger "${id}". Known: ${triggers.map((s) => s.id).join(", ") || "(none)"}`);
    process.exit(1);
  }
  const s = slot(id);
  const want = nowId ? now : now + ms(inDur);

  // COALESCE. A second request for a trigger already pending is not a second
  // run - it is the same run, asked for twice.
  if (s.requestedFor !== null && s.requestedFor <= want) {
    console.log(`schedule: ${id} already requested for ${human(s.requestedFor)} - coalesced, nothing queued`);
    process.exit(0);
  }
  s.requestedFor = want;
  writeState(state, id);
  const floored = dueAt(st);
  console.log(`schedule: ${id} requested for ${human(want)}${floored > want ? ` - held to ${human(floored)} by its ${st.floor} floor` : ""}`);
  process.exit(0);
}

// tick
const DRY = has("--dry");

// THE SCHEDULER CANNOT GUARD ITSELF, SO IT SAYS SO.
//
// This file is read off disk exactly like the machines it runs, so editing it
// deploys it. It cannot refuse to run on that basis - it would already be
// running in order to refuse - so the honest move is to announce it and let a
// person or a session decide. Once, at startup, never per trigger.
{
  const self = machineIsMidEdit(__filename);
  if (self.checked && self.dirty) {
    console.log(`schedule: NOTE - the scheduler itself has uncommitted changes (${self.detail}). It is running the edited copy.`);
  }
}
// An externally driven rhythm is never fired from here, and this is the single
// place that decides what fires - so the exclusion lives here rather than being
// repeated at each call site where it could later be forgotten in one of them.
// It stays in `triggers` for every other purpose: counted, listed, and drawn.
// An externally driven rhythm is never fired from here, and this is the single
// place that decides what fires - so the exclusion lives here rather than being
// repeated at each call site where it could later be forgotten in one of them.
// It stays in `triggers` for every other purpose: counted, listed, and drawn.
const due = triggers.filter((st) => !st.drivenBy && dueAt(st) <= now);

// THIS PROCESS RUNNING IS THE PROOF THE TICK HAPPENED.
//
// The pulse drives this scheduler, so there is no separate evidence to go
// looking for - the driver's beat and this process starting are the same event.
// Stamping it here is the whole reason an external rhythm can be drawn honestly
// rather than reading "never" forever while it beats every five minutes.
//
// Before the early exit below, deliberately: "nothing due" is by far the most
// common tick and it is still a tick. Stamping after that return would have
// recorded the pulse only on the rare occasions something ELSE ran, which is a
// liveness signal that goes quiet precisely when the factory is calmest.
if (!DRY) {
  for (const st of triggers) {
    if (!st.drivenBy) continue;
    const s = slot(st.id);
    s.lastRunAt = now;
    s.runs = (s.runs || 0) + 1;
    s.lastExit = 0;
    writeState(state, st.id);
  }

  // THE PULSE WRITES ITS OWN CARD, HERE, IN THE SAME BREATH AS THE STAMP.
  //
  // Operator, 2026-09-14: "be careful adding extra triggers to write the pulse
  // belt, make sure it's triggered by the pulse itself not something else." A
  // pulse-belt station would be one step removed - due-arithmetic, the
  // mid-edit guard, the ladder - and a card written by a station is a card
  // that can be late while the pulse was on time. This IS the pulse: the
  // process Windows started on the beat. So the card is written from here.
  //
  // ISOLATED SO IT CAN NEVER STOP THE TICK. The tick was stopped once before by
  // giving it a duty (the Claude routine waited five hours on a permission
  // prompt). This duty is a child process with a ten-second ceiling, its own
  // try/catch, and no say in this process's exit code: if the factory is not
  // mounted, the machine throws, or the file cannot be written, the beat is
  // still stamped and the tick still ticks. The machine dedupes by stage
  // window, so a second driver in the same beat is a no-op, not a second card.
  try {
    if (!PRIMARY) {
      // A child tick is the same beat seen from another repo; the primary
      // already wrote this beat's card, and the machine would say so.
    } else if (factoryRoot) {
      const r = spawnSync(process.execPath, [path.join(factoryRoot, "machines", "pulse-belt.cjs")], {
        cwd: ROOT,
        encoding: "utf8",
        timeout: 10000,
        windowsHide: true,
      });
      const first = String((r.stdout || "") + (r.stderr || "")).trim().split("\n")[0] || "";
      console.log(`schedule: pulse card - ${r.status === 0 ? first : `exit ${r.status} - ${first || r.error && r.error.message || "no output"}`}`);
    } else {
      console.log("schedule: pulse card - factory not found, no card written (the beat is still stamped)");
    }
  } catch (err) {
    console.log(`schedule: pulse card - could not run pulse-belt (${err.message}); the beat is still stamped`);
  }
}

// ---- FAN OUT: THE SCHEDULE SITS ABOVE THE APPS -------------------------------
//
// Operator's plan, M3: "Scope is all apps. The schedule sits above the apps."
// And on 2026-09-14: "lets wire the script factory repo in the board ... at
// the very least it should be able to monitor itself."
//
// The PRIMARY tick - the one Windows starts - ticks its own repo and then runs
// one CHILD tick per wired repo in the ecosystem map: `--root <that repo>`. A
// repo is WIRED when it declares at least one trigger where this file searches,
// which is the same test the board's dropdown applies, so the board never
// offers a subject nothing is ticking. Each child is its own process with its
// own ceiling and cannot fail the primary: a repo whose tick breaks is
// reported here, not propagated. The child stamps that repo's drivenBy rows,
// runs that repo's due stations against that repo's belt, and writes no pulse
// card - the primary already did, and the machine dedupes anyway.
//
// No new OS task and no routine: the bell that rings Telechurch rings every
// wired repo, which is what "above the apps" has to mean in practice.
function fanOut() {
  if (!PRIMARY || DRY) return;
  const mapPath = [process.env.REFER_ECOSYSTEM_MAP, "E:/e2e-bridge/governance/ecosystem-map.json"].filter(Boolean).find((p) => fs.existsSync(p));
  if (!mapPath) {
    console.log("schedule: fan-out - no ecosystem map found, ticking this repo only");
    return;
  }
  let repos = [];
  try {
    repos = JSON.parse(fs.readFileSync(mapPath, "utf8").replace(/^\uFEFF/, "")).repos || [];
  } catch (err) {
    console.log(`schedule: fan-out - ecosystem map unreadable (${err.message}), ticking this repo only`);
    return;
  }
  const same = (a, b) => path.resolve(a).replace(/\\/g, "/").toLowerCase() === path.resolve(b).replace(/\\/g, "/").toLowerCase();
  const declares = (root) => SEARCH.some((rel) => {
    try {
      return fs.readdirSync(path.join(root, rel)).some((f) => SUFFIXES.some((s) => f.endsWith(s)));
    } catch {
      return false;
    }
  });
  const targets = repos.filter((r) => r && r.path && r.status === "active" && fs.existsSync(r.path) && !same(r.path, ROOT) && declares(r.path));
  if (!targets.length) {
    console.log("schedule: fan-out - no other wired repo");
    return;
  }
  for (const r of targets) {
    try {
      const started = Date.now();
      const res = spawnSync(process.execPath, [__filename, "--root", r.path], { encoding: "utf8", timeout: 240000, windowsHide: true });
      const took = ((Date.now() - started) / 1000).toFixed(1);
      const lines = String((res.stdout || "") + (res.stderr || "")).trim().split("\n");
      console.log(`schedule: fan-out -> ${r.repo_id} (${r.path}) exit ${res.status === null ? "timeout" : res.status} in ${took}s`);
      for (const line of lines.slice(0, 6)) console.log(`      ${line}`);
      if (lines.length > 6) console.log(`      ... ${lines.length - 6} more line(s)`);
    } catch (err) {
      console.log(`schedule: fan-out -> ${r.repo_id} could not run (${err.message})`);
    }
  }
}

if (!due.length) {
  console.log(`schedule: tick - nothing due (${triggers.length} trigger(s))`);
  fanOut();
  process.exit(0);
}

console.log(`schedule: tick - ${due.length} due of ${triggers.length}`);
let failed = 0;

for (const st of due) {
  const s = slot(st.id);

  if (s.lockedAt && now - s.lockedAt < LOCK_STALE_AFTER) {
    console.log(`  ${st.id}: still running since ${human(s.lockedAt)} - skipped`);
    continue;
  }
  if (s.lockedAt) {
    console.log(`  ${st.id}: clearing a stale lock from ${human(s.lockedAt)} (a run was killed mid-flight)`);
  }
  if (DRY) {
    console.log(`  ${st.id}: would run  ${st.run}`);
    continue;
  }

  // Resolve BEFORE locking. Resolution can throw - a universal machine whose
  // factory is not mounted, or a station naming a machine that does not exist -
  // and a throw after the lock is taken would leave the station wedged shut
  // forever with nothing saying why. That is the exact failure shape this whole
  // system exists to prevent, so it must not be built into the thing that runs it.
  let command;
  try {
    command = resolveRun(st);
  } catch (err) {
    console.error(`  ${st.id}: ${err.message}`);
    failed++;
    continue;
  }

  // Checked AFTER resolution, because resolution is what turns "factory:watcher"
  // into the actual file on disk, and the file is the thing that might be
  // half-written. Checked BEFORE the lock, so a skipped trigger leaves no lock
  // behind to expire.
  const edit = machineIsMidEdit(command);
  if (edit.checked && edit.dirty) {
    console.error(
      `  ${st.id}: SKIPPED - its machine has uncommitted changes (${edit.detail}). ` +
        `There is no deploy step here: the file is read as it runs, so a save is a deploy and this one is mid-edit. ` +
        `It will run on the next tick after the change is committed.`,
    );
    failed++;
    continue;
  }
  if (!edit.checked) {
    console.log(`  ${st.id}: could not check whether its machine is mid-edit (${edit.why}) - running it anyway`);
  }

  s.lockedAt = Date.now();
  writeState(state, st.id);

  const started = Date.now();
  let res;
  try {
    const [cmd, ...args] = command.split(/\s+/);
    res = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
  } finally {
    // The lock clears whatever happened. A finally, not a happy path.
    s.lockedAt = null;
    s.lastRunAt = Date.now();
    s.lastExit = res ? res.status : null;
    s.requestedFor = null;
    s.runs = (s.runs || 0) + 1;
    // A run that could not be observed is treated as a fault, not as clean.
    // Assuming success from an absent exit code is how a broken station earns
    // itself a two-hour nap.
    var moved = adapt(st, res ? res.status : 1);
    writeState(state, st.id);
  }
  const took = ((Date.now() - started) / 1000).toFixed(1);

  const ok = res.status === 0;
  if (!ok) failed++;
  const pace = moved && (moved.tightened || moved.relaxed) ? `  ${moved.tightened ? "tightened" : "relaxed"} ${human2(moved.from)} -> ${human2(moved.to)}` : "";
  console.log(`  ${st.id}: exit ${res.status} in ${took}s${pace}`);

  // A station's own output is the interesting thing; the clock never
  // paraphrases it. On a fault the whole tail is printed, because a fault
  // nobody can read is the same as a fault nobody saw.
  const out = ((res.stdout || "") + (res.stderr || "")).trim();
  if (out) {
    const lines = out.split("\n");
    for (const line of ok ? lines.slice(0, 3) : lines) console.log(`      ${line}`);
    if (ok && lines.length > 3) console.log(`      ... ${lines.length - 3} more line(s)`);
  }
}

fanOut();
process.exit(failed ? 1 : 0);
