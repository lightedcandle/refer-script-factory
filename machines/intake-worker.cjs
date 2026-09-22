#!/usr/bin/env node
/**
 * INTAKE WORKER - picks the next deposit off incoming and puts it on the belt.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-12: "the intake worker is responsible for pulling deposits
 * off the incoming and placing them on the conveyor."
 *
 * Placing something on the conveyor means DISPATCHING it - a named agent, in a
 * session that exists on disk - because that is what the belt now requires. So
 * this worker has a real capability and a deliberate safety.
 *
 * IT PREPARES BY DEFAULT AND DISPATCHES ONLY WHEN TOLD. --dispatch spawns a
 * real session; without it the worker selects, writes the brief, and stops.
 * Arming a machine to start agents on its own is a decision about authority, not
 * a default to be set quietly at two in the morning by the thing that benefits
 * from it.
 *
 * SELECTION, in order, and each rule earns its place:
 *
 *   capacity      never exceed the concurrent limit. A factory that dispatches
 *                 everything at once has not scheduled anything.
 *   his           never touch an item addressed to the operator. Those are his
 *                 by law - taste, money, deletion - and an agent picking one up
 *                 would be taking a decision that was reserved.
 *   actionable    an item carrying a recommendation goes before one without.
 *                 Dispatching a diagnosis with no proposed action just moves the
 *                 thinking to a colder session.
 *   oldest        among equals, the one that has waited longest.
 *
 *   node <factory>/machines/intake-worker.cjs             select and brief
 *   node <factory>/machines/intake-worker.cjs --dispatch  actually start it
 *   node <factory>/machines/intake-worker.cjs --json      machine-readable
 *
 * Exit 0 always: having nothing to pick up is a normal, healthy morning.
 */
const fs = require("fs");
const path = require("path");
// A dispatch has to be able to say WHICH session it started, and until now it
// could not: the CLI names its transcript after a uuid it chooses itself, so the
// id was unknowable until after the session existed - which is to say, never.
// --session-id lets this machine mint the id first. See the stamp below.
const crypto = require("crypto");
const { spawn } = require("child_process");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");

// AUTOMATIC OR MANUAL, and the operator holds the switch.
//
// Operator, 2026-09-21: "add an AutoRun switch on the incoming section that
// will flip all to being cued and pulled to the board automatically. but when
// off its manual by the individual switch."
//
// Until now dispatching was decided by whoever typed the command: --dispatch
// or nothing. That is not a setting, it is an argument, so the board could
// show the intake door as CLOSED and nobody could open it from the board. The
// mode file is the setting, written by the board and read here.
//
// MANUAL IS THE DEFAULT, and it is the default on every path: a missing file,
// an unreadable file, or any word other than "auto" all mean manual. A factory
// that starts dispatching because a settings file went missing is the wrong
// failure to build in.
const MODE_FILE = path.join(process.cwd(), ".claude/agent-context/intake-mode.json");
function intakeMode() {
  try {
    const j = JSON.parse(fs.readFileSync(MODE_FILE, "utf8"));
    return String(j && j.mode) === "auto" ? "auto" : "manual";
  } catch {
    return "manual";
  }
}
const MODE = intakeMode();
const DO_DISPATCH = process.argv.includes("--dispatch") || MODE === "auto";

const MS = { m: 6e4, h: 36e5 };
const ALIVE_MS = 30 * MS.m;
const CAPACITY = 3; // concurrent items on the belt
const now = Date.now();

if (!fs.existsSync(BELT)) {
  console.error(`intake-worker: no belt in ${ROOT}`);
  process.exit(2);
}

const records = fs
  .readFileSync(BELT, "utf8")
  .replace(/^\uFEFF/, "")
  .split("\n")
  .filter((l) => l.trim())
  .map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

// The belt's vocabulary, from the one file that holds it. This block used to be
// a hand-written copy of a rule that also lives in the board, the manager, the
// exit worker and the deposit lookup - six copies, which drifted every time the
// rule changed.
const { beltIndex } = require("./kind.cjs");
const IX = beltIndex(records);
const isDone = IX.isDone;
const isCloser = IX.isCloser;
const isAnnotation = IX.isAnnotation;

const adviceFor = new Map();
for (const r of records) if (r.subject && r.recommend) adviceFor.set(String(r.subject), r.recommend);
const adviceOf = (r) => adviceFor.get(String(r.id)) || r.recommend || null;

const dispatchFor = new Map();
for (const r of records) if (r.subject && r.dispatch) dispatchFor.set(String(r.subject), r.dispatch);

// ONE DEFINITION, in session-life.cjs, shared with exit-worker. Written out
// here once and blind to every spawned agent - see the account in that file.
const { sessionLife } = require("./session-life.cjs");
const alive = (id) => {
  const life = sessionLife(id, ROOT, ALIVE_MS);
  return !!(life && life.alive);
};

// CAPACITY COUNTS EVERY DOOR, AND ALWAYS HAS.
//
// `dispatchFor` is built from every record carrying a dispatch, whoever made it,
// so this counts work that arrived through chat and through a spawn exactly as
// it counts work this worker sent. Stated here because it has been read the
// other way once: the proof is that it reports 1 on the belt while `armed` is
// false, and that one is a dispatch it did not make.
//
// What it CANNOT count is a live session that no belt record names - and that is
// a missing record, not a wrong filter. Do not "fix" this into counting only our
// own dispatches; that would be the bug it was mistaken for.
// HELD means held by a session that is STILL THERE, and both callers below
// must mean the same thing by it. `onBelt` always checked liveness; `waiting`
// checked only that a dispatch record existed. While nothing wrote one the two
// could never disagree - and the moment something did, they disagreed on every
// dispatch whose agent died: excluded from waiting so never offered again, and
// absent from onBelt so not holding capacity either. The item stopped being
// anywhere, and exit-worker - the machine that returns it to incoming - is not
// armed.
//
// It short-circuits on the map before touching the disk, so sessionLife runs
// only for items that actually carry a dispatch.
const heldByLiveSession = (id) => dispatchFor.has(String(id)) && alive(dispatchFor.get(String(id)).session);

const onBelt = records.filter((r) => !isDone(r) && !isCloser(r) && !isAnnotation(r) && heldByLiveSession(r.id));
const room = Math.max(0, CAPACITY - onBelt.length);

// ONLY A CONTRACT MAY BE DISPATCHED.
//
// Operator, 2026-09-12: "don't put notifications on the belt, only contracts to
// be processed." A deposit is seen and not yet judged - dispatching one would be
// this worker deciding that something is work, which is a decision reserved to
// whoever triages it. A note has nothing to do. A decision is his.
//
// This is the enforcement point for the whole taxonomy: everything else about
// kind is display, and this is the line where it decides what actually happens.
// The "his by law" filter below is kept as well, deliberately redundant - a
// decision could only reach here through a mis-set kind, and the cost of that
// mistake is an agent taking a decision that was reserved.
const waiting = records
  // Not "has this ever been dispatched" but "is somebody working it NOW". A
  // dead session's item is waiting again, which is the only answer that does
  // not lose it.
  .filter((r) => IX.isOpenContract(r) && !heldByLiveSession(r.id))
  // His by law. Never pick these up.
  .filter((r) => String(r.triggers || "") !== "operator" && r.owner !== "operator" && !r.operatorDecision)
  .map((r) => ({ r, advice: adviceOf(r), at: Date.parse(r.run || "") || 0 }))
  .sort((a, b) => (a.advice ? 0 : 1) - (b.advice ? 0 : 1) || a.at - b.at);

const picks = waiting.slice(0, room);

const brief = (p) =>
  [
    `Work this single deposit from the Living Factory belt and nothing else.`,
    ``,
    `ID: ${p.r.id}`,
    `Claim: ${String(p.r.claim || "").replace(/\s+/g, " ")}`,
    `Evidence: ${String(p.r.evidence || "").replace(/\s+/g, " ")}`,
    p.advice ? `Recommended: ${String(p.advice).replace(/\s+/g, " ")}` : `No recommendation exists. Work out what to do, and say so before doing it.`,
    ``,
    // ORDER REWRITTEN 2026-09-22, from watching three real runs.
    //
    // All three did good work and two of them landed nothing, because a run
    // ends at its last tool call and every one of them was still mid-action:
    // "Committing my two files", "Building the minimal one". Publishing came
    // last in the brief, so it came last in the run, so it did not happen. One
    // agent left two new files loose in a shared checkout on no branch.
    //
    // So the brief now asks for the branch FIRST and a push as soon as there
    // is one commit. A branch with a partial change on it is recoverable by
    // anybody; an unbranched file in a tree three sessions share is not.
    `Publish as you go, not at the end. A run can stop at any tool call, and work`,
    `that is not on a branch when that happens is lost or, worse, left loose in a`,
    `working tree other sessions share.`,
    ``,
    `1. FIRST, before changing anything: cut the branch.`,
    `   <lane>/<PLAN-ID>--claude--<lineage>--<description>`,
    `2. Commit each coherent piece as you finish it, and push after the first one.`,
    `   Use git commit -F <file> for the message, never inline -m.`,
    `3. Commit ONLY the files you touched. This tree is shared with other sessions`,
    `   and carries their uncommitted work; never git add -A, never stash.`,
    `4. Then append ONE record to .claude/agent-context/findings.jsonl with`,
    `   subject "${p.r.id}" and a terminal trigger (terminal:fixed, terminal:shipped,`,
    `   terminal:resolved, or terminal:withdrawn if it should not be done). That`,
    `   closure is what takes it off the conveyor - nothing else will, and until it`,
    `   is written the board cannot say your work happened.`,
    `5. Publish with npm run branch:publish, which opens AND squash-merges the PR.`,
    ``,
    // A REAL TRAP, FOUND BY AN AGENT ON THIS BELT, not theory: it wanted to run
    // git from elsewhere and could not, then diagnosed it correctly - the Bash
    // allow-list prefix-matches "git status*", so "git -C <path> status" never
    // matches any rule and is refused. Telling every agent the shape that works
    // is cheaper and safer than widening a permission for all of them.
    `Run git from the repo root with no -C flag. The permission rules prefix-match`,
    `("git status*"), so "git -C <path> status" matches nothing and is refused - it`,
    `looks like a policy block and is only a command shape. Change directory instead.`,
    ``,
    `Never edit files through PowerShell Set-Content; it corrupts every non-ASCII`,
    `character. Verify what a person would see, never the flag you just set.`,
  ].join("\n");

// A LAUNCH IS NOT A START, and this machine reported one as the other.
//
// Operator, 2026-09-22, after the first watched run: "fix the collector so it
// stops reporting dispatched." It printed DISPATCHED with three process ids;
// all three were dead within seconds because the headless CLI could not sign
// in - "Failed to authenticate: OAuth session expired and could not be
// refreshed". The message went to a stdio that was thrown away, and the board
// showed work going out every twenty minutes with nothing ever coming back.
//
// Two changes, and they are the same change really: KEEP THE OUTPUT, and CHECK
// THE PROCESS IS STILL THERE before calling it dispatched. Neither is clever;
// what was missing was the idea that spawn() returning a pid says only that
// the operating system created something.
const DISPATCH_LOGS = path.join(CTX, "dispatch-logs");
// HOW LONG "STILL THERE" HAS TO MEAN SOMETHING. The first version of this
// check waited 6 seconds and reported three agents RUNNING that were all dead
// ten seconds later - the sign-in failure takes longer to come back than the
// window allowed, so the check confirmed nothing and said everything. A wait
// that is shorter than the failure it is looking for is not a check.
//
// 20s against a 20-minute cadence is cheap, and an agent that is still there
// after twenty seconds has got past sign-in and started reading.
const SURVIVE_MS = 20000;

function stillAlive(pid) {
  try {
    // Signal 0 tests for existence without touching the process.
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function lastWords(file) {
  try {
    const t = fs.readFileSync(file, "utf8").replace(/\[[0-9;]*m/g, "").trim();
    // AN EMPTY LOG IS ITSELF A DIAGNOSIS, so it is not reported as a shrug. A
    // detached agent that exits at once having written nothing has almost
    // always failed before it began, and on 2026-09-22 the cause was the
    // headless CLI's sign-in: "Failed to authenticate: OAuth session expired
    // and could not be refreshed", visible only when the same command was run
    // in the foreground. Naming the likely cause and how to confirm it beats
    // reporting silence, which is what sent the operator looking twice.
    if (!t) {
      return "it exited at once and wrote nothing - most often the headless CLI is not signed in. Run `claude -p \"hello\"` in a terminal here to see the real message";
    }
    // The first non-empty line is the useful one: these failures announce
    // themselves immediately and then say nothing else.
    return t.split(/\r?\n/).filter((l) => l.trim())[0].slice(0, 300);
  } catch {
    return "it exited and left no output";
  }
}

let started = [];
let failedToStart = [];
if (DO_DISPATCH && picks.length) {
  fs.mkdirSync(DISPATCH_LOGS, { recursive: true });
  const launched = [];
  for (const p of picks) {
    const label = String(p.r.id).slice(0, 28);
    // MINTED BEFORE THE SPAWN, not read back after it. This is the whole reason
    // the stamp below can be proven from disk: sessionLife identifies a
    // main-checkout session by matching a transcript filename against the
    // session id, and the CLI names that file after this uuid.
    const session = crypto.randomUUID();
    const logPath = path.join(DISPATCH_LOGS, `${String(p.r.id).replace(/[^a-z0-9._-]/gi, "_").slice(0, 80)}.log`);
    try {
      // Output goes to a file rather than nowhere. Whatever an agent says on
      // its way out is the only evidence of why it left.
      const fd = fs.openSync(logPath, "w");
      const child = spawn("cmd.exe", ["/c", "claude", "-p", "--session-id", session, "--permission-mode", "acceptEdits", brief(p)], {
        cwd: ROOT,
        detached: true,
        stdio: ["ignore", fd, fd],
      });
      child.unref();
      // The handle stays open until after the survival check. Closing it
      // immediately left every log file 0 bytes, so a dispatch that died had
      // nothing to say about why - which is most of the value of keeping a log
      // at all. This process exits moments later and the handle goes with it.
      launched.push({ id: p.r.id, label, session, pid: child.pid, logPath, fd });
    } catch (err) {
      failedToStart.push({ id: p.r.id, label, why: err.message.split("\n")[0] });
    }
  }
  if (launched.length) {
    // One wait for all of them, not one each - they were started together and
    // an immediate failure is immediate.
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, SURVIVE_MS);
    for (const l of launched) {
      if (stillAlive(l.pid)) started.push({ id: l.id, label: l.label, session: l.session, pid: l.pid });
      else failedToStart.push({ id: l.id, label: l.label, pid: l.pid, why: lastWords(l.logPath), log: path.relative(ROOT, l.logPath).replace(/\\/g, "/") });
      try {
        fs.closeSync(l.fd);
      } catch {
        /* already gone with the child */
      }
    }
  }
}

// A DISPATCH THAT DIED GOES ON THE BELT, because a failure only this machine
// knows about is the same silence the board was built to end. One record per
// distinct reason per run, and never a duplicate of one already sitting there
// unanswered - the same authentication failure every twenty minutes would bury
// the belt it is trying to warn.
if (failedToStart.length) {
  const reasons = [...new Set(failedToStart.map((f) => f.why))];
  let beltText = "";
  try {
    beltText = fs.readFileSync(BELT, "utf8");
  } catch {
    /* already handled above */
  }
  for (const why of reasons) {
    const ids = failedToStart.filter((f) => f.why === why).map((f) => f.id);
    if (beltText.includes(`"dispatchFailure":${JSON.stringify(why)}`)) continue;
    const rec = {
      id: `dispatch-failed-${Date.now().toString(36)}`,
      run: new Date().toISOString(),
      kind: "deposit",
      dimension: "architecture",
      source: "intake-worker",
      dispatchFailure: why,
      title: "An agent was dispatched and never started",
      claim: `${ids.length} dispatch(es) exited immediately: ${why}`,
      detail: `Items affected: ${ids.join(", ")}. The work stays accepted and will be offered again on the next run. Nothing is wrong with the items themselves.`,
      recommend: "Fix what the exit message names, then let the next run pick these up again. Until then every run will keep failing the same way.",
    };
    try {
      fs.appendFileSync(BELT, JSON.stringify(rec) + "\n", "utf8");
    } catch {
      /* the console still says it */
    }
  }
}

// A DISPATCH THAT STARTED GOES ON THE BELT TOO. Until now only the failures
// did, and the asymmetry was invisible because the field it should have written
// already existed and already had readers.
//
// `dispatch` is how the factory answers "who is working on what". THREE
// machines read it: this one at :113 to compute how full the belt is,
// exit-worker at :83 to decide whether work was abandoned, and watcher at :1372
// to judge MOVING against QUIET. NOTHING WROTE IT. One record in 464 had one -
// hand-written on 2026-09-12 - so all three answered from a belt of one, and
// each read its own blank as a separate defect: intake reported onBelt:0 with
// three sessions alive and double-dispatched an item, the exit door has judged
// nothing since, and the board's door census counted one arrival on a night
// that ran ten.
//
// ONE RECORD PER SURVIVOR, NEVER PER LAUNCH. `started` is already filtered to
// processes still there after SURVIVE_MS. Stamping a pid that died in twenty
// seconds would rebuild precisely the defect the operator named - "fix the
// collector so it stops reporting dispatched" - one field further along.
//
// NO `kind` FIELD, AND THIS IS LOAD-BEARING. kind.cjs attaches a declared kind
// to the record's SUBJECT when that subject is a known id, so a dispatch stamp
// carrying `kind` would silently RECLASSIFY THE ITEM IT NAMES - "note" would
// drop a live contract out of open work altogether. The hand-written record got
// this right by carrying no kind and this follows it. With `triggers:
// terminal:recorded` and a known subject the record reads as an ANNOTATION:
// bookkeeping, drawn in no column, counted in no tally, and - because
// terminal:recorded is in the NOTING family - it does NOT close the item.
//
// `via: "auto"` because THIS MACHINE IS THE AUTO DOOR. build-tracker says it
// in as many words - "AUTO is the intake worker dispatching on a schedule" -
// and the doors are the trigger classes, so a dispatch this machine makes
// arrived by a schedule whatever it started.
//
// It said "spawn" for one day and that was worse than the blank it replaced.
// P15's "an agent starting an agent" is about a CONVERSATION forking an
// unattended worker, not about the scheduled machine; reading it here filed 17
// scheduled arrivals at the SPAWN door, left AUTO - the busiest door on the
// board - structurally unable to count above zero, and made the AUTO row
// contradict itself, since its state is read from this machine's own report.
// An attribution invented to make three lanes look busy is the same defect as
// a count that does not count, and a wrong door is exactly that in reverse.
//
// The SPAWN door's real supply is machines/dispatch-stamp.cjs, which a chat
// calls when it forks a worker. viaOf reads exactly auto / chat / spawn and
// reports anything else as unknown; do not mint a second vocabulary.
if (started.length) {
  for (const s of started) {
    const at = new Date().toISOString();
    const rec = {
      id: `dispatch-${s.session}`,
      run: at,
      tier: 1,
      dimension: "architecture",
      source: "intake-worker",
      // Keyed by SUBJECT and looked up by the item's ID in all three readers,
      // so this must be the dispatched item itself - never a description of it.
      subject: String(s.id),
      claim: `Dispatched to its own session. ${s.label} took this at ${at} (pid ${s.pid}).`,
      evidence:
        "Proven from disk rather than believed: the session must have a transcript written within the liveness window, " +
        "or the card leaves the belt and the dispatch is reported as abandoned. The session id is the uuid this machine " +
        "handed to the CLI with --session-id, which is what the transcript is named after.",
      dispatch: { session: s.session, label: s.label, via: "auto", pid: s.pid, at },
      seen: true,
      confidence: "measured",
      triggers: "terminal:recorded",
      owner: "architecture",
    };
    try {
      fs.appendFileSync(BELT, JSON.stringify(rec) + "\n", "utf8");
    } catch {
      /* the console still says it */
    }
  }
}

const report = {
  checkedAt: new Date(now).toISOString(),
  repo: path.basename(ROOT),
  capacity: CAPACITY,
  onBelt: onBelt.length,
  room,
  waiting: waiting.length,
  selected: picks.map((p) => ({ id: p.r.id, hasRecommendation: !!p.advice, waitedHours: Math.round((now - p.at) / MS.h) })),
  // Only the ones still running when they were checked. A pid is not a start.
  dispatched: DO_DISPATCH ? started : [],
  failedToStart: DO_DISPATCH ? failedToStart : [],
  armed: DO_DISPATCH,
  // Which of the two reasons it is armed, so the board can say "Automatic"
  // rather than just "armed" - and so a run armed by a typed flag is never
  // mistaken for the switch being on.
  mode: MODE,
  armedBy: DO_DISPATCH ? (MODE === "auto" ? "the AutoRun switch" : "the --dispatch flag") : null,
};
fs.mkdirSync(CTX, { recursive: true });
fs.writeFileSync(path.join(CTX, "intake-worker.json"), JSON.stringify(report, null, 2) + "\n");
if (picks.length) fs.writeFileSync(path.join(CTX, "intake-brief.txt"), picks.map(brief).join("\n\n" + "-".repeat(70) + "\n\n"), "utf8");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`intake-worker: ${onBelt.length}/${CAPACITY} on the belt, ${waiting.length} waiting, room for ${room}  [${report.repo}]`);
  for (const p of picks) console.log(`  would dispatch  ${p.r.id}${p.advice ? "" : "   (no recommendation - it would have to work one out)"}`);
  if (!picks.length) {
    // NOTHING ELIGIBLE AND NOTHING ACCEPTED ARE DIFFERENT FACTS, and they look
    // identical from a worker that only prints the first. A queue of unjudged
    // deposits is a factory waiting on a person, not a factory with nothing to do.
    const untriaged = records.filter(IX.isAwaitingTriage).length;
    if (room && untriaged) console.log(`  nothing eligible - ${untriaged} deposit(s) are waiting to be judged, and only a contract can be dispatched`);
    else console.log(room ? "  nothing eligible to pick up" : "  belt is full");
  }
  if (DO_DISPATCH) {
    // RUNNING is the word now, and it is only printed for a process that was
    // still there when it was looked at. The old line said DISPATCHED the
    // instant a pid existed, which is how three agents that never signed in
    // were reported as three agents working.
    for (const s of started) console.log(`  RUNNING ${s.id} (pid ${s.pid}, still alive after ${Math.round(SURVIVE_MS / 1000)}s)`);
    for (const f of failedToStart) {
      console.log(`  DID NOT START ${f.id} - ${f.why}`);
      if (f.log) console.log(`      its last words: ${f.log}`);
    }
    if (failedToStart.length && !started.length) {
      console.log(`\n  NOTHING IS RUNNING. The work stays accepted and will be offered again next run; the reason is on the belt.`);
    }
  }
  else if (picks.length) console.log(`\n  Not armed. Brief written to .claude/agent-context/intake-brief.txt; run with --dispatch to start them.`);
}
process.exit(0);
