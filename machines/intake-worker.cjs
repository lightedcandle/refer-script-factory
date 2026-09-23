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
 * IT DOES NOT CHOOSE. IT DRAINS A LIST SOMEBODY ELSE ORDERED.
 *
 * The watcher writes a STANDING ordered ready-list - .claude/agent-context/
 * watcher-queue.json, with its own freshness stamp - and this door takes from
 * the top of it. A per-tick message was the alternative and it starves the door
 * on every tick where the watcher did not wake, which is most of them; a
 * standing list lets both share one clock without either waiting on the other.
 *
 * FOUR RULES, and each one closes a failure available without it:
 *
 *   top-first     the list is taken in the order it was written and never
 *                 re-sorted. THE WATCHER OWNS ORDER, THIS OWNS COUNT. A door
 *                 that reorders is quietly making the judgement again.
 *   capacity      room still governs. The list says what may go; the belt says
 *                 how much fits.
 *   never off     an id that is not on the list is never dispatched, however
 *   the list      eligible it looks from here. A door that invents work when
 *                 the list is empty is how a belt fills with things nobody
 *                 chose.
 *   refuse stale  a list past its own freshness stamp is a decayed judgement -
 *                 the same rot as an aging deposit one level up - so it is
 *                 refused, out loud, and nothing goes out on it.
 *
 * It may still NARROW, never add and never reorder: between the watcher's run
 * and this one an item can be closed or picked up by a live session, so every
 * entry is re-checked against the belt as it stands now and each one dropped is
 * named with its reason. That is the door refusing to double-dispatch, which is
 * not a judgement about whether the work is worth doing.
 *
 *   node <factory>/machines/intake-worker.cjs             drain and brief
 *   node <factory>/machines/intake-worker.cjs --dispatch  actually start them
 *   node <factory>/machines/intake-worker.cjs --dry       decide, write nothing
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
const { spawnSync, execFileSync } = require("child_process");

// NO WINDOW, EVER. This is the factory's standing rule for anything it starts
// on its own, and it was written on 2026-09-15 for the pulse: "the node pulse
// pop-up window is intrusive, can it run in background or stay in system tray."
// Every other launcher in the engine honours it - run-hidden.vbs for the
// scheduled task, windowsHide on every spawnSync - and this one did not, so
// three black console windows landed on the operator's desktop every twenty
// minutes and sat on top of whatever he was doing.
//
// Hiding the cmd.exe wrapper is NOT enough, and that was the first attempt:
// `claude` resolves to a launcher that opens a console of its OWN, so the
// window came back with the whole command line as its title. Measured, not
// assumed - the probe compared the set of windowed processes before and after.
//
// Starting claude.exe DIRECTLY removes the wrapper that was defeating the flag,
// and the newline that started this whole thread cannot bite either, because
// nothing re-parses a command line. Resolved once, here, rather than hardcoded:
// a path baked into a machine is a machine that breaks on the next install.
// `where.exe claude` answers with the SHIMS only - claude and claude.cmd - and
// never the executable, so the .exe has to be derived from where a shim lives:
// npm puts the real binary under <bin>/node_modules/@anthropic-ai/claude-code/.
// Anything that is not a file on disk is not returned, so a layout change
// degrades to the visible-window fallback rather than to a failed dispatch.
const CLAUDE_EXE = (() => {
  const seen = [];
  try {
    for (const line of String(execFileSync("where.exe", ["claude"], { encoding: "utf8", windowsHide: true })).split(/\r?\n/)) {
      const shim = line.trim();
      if (!shim) continue;
      if (/\.exe$/i.test(shim)) seen.push(shim);
      seen.push(path.join(path.dirname(shim), "node_modules/@anthropic-ai/claude-code/bin/claude.exe"));
    }
  } catch {
    /* not on PATH at all - the fallback says so by behaving visibly */
  }
  if (process.env.APPDATA) seen.push(path.join(process.env.APPDATA, "npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe"));
  for (const p of seen) {
    try {
      if (fs.statSync(p).isFile()) return p;
    } catch {
      /* next candidate */
    }
  }
  return null;
})();

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
// --dry DECIDES EVERYTHING AND WRITES NOTHING - no dispatch, no report, no belt
// record. It exists because once the AutoRun switch is on there is otherwise no
// way to exercise this machine at all: DO_DISPATCH is true whenever the mode
// file says "auto", so every trial run would start three real agents. The
// watcher has had the same flag, for the same reason, since it was armed.
const DRY = process.argv.includes("--dry");
// --self-test drives the failure-reporting path and exits before the dispatch
// block, so it can never start an agent. See the block below lastWords.
const SELF_TEST = process.argv.includes("--self-test");
const DO_DISPATCH = !DRY && !SELF_TEST && (process.argv.includes("--dispatch") || MODE === "auto");

const MS = { m: 6e4, h: 36e5 };
const ALIVE_MS = 30 * MS.m;
const CAPACITY = 3; // concurrent items on the belt
const now = Date.now();

// THE DOOR DOES NOT OPEN INTO A STARVED ACCOUNT.
//
// Deposit `the-tick-shares-a-budget-with-the-work-it-watches`, 2026-09-12, its
// second recommendation: "Throttle heavy dispatch against the pulse: never let
// the factory spend on work what the heartbeat needs to report that work. That
// is a scheduling rule, not a code change, and it belongs wherever dispatch
// capacity is decided - WHICH IS INTAKE."
//
// The heartbeat it was written to protect no longer needs protecting: the beat
// left the Claude account on 2026-09-14 for a Windows task running node, and
// Telechurch's budget-independence station measured that it really does survive
// a starvation - PROVEN, 172 account refusals across 375 minutes with all 37
// out-of-band readings of the beat reporting ALIVE.
//
// The SPENDING still needs it, and the same measurement is what shows why: 311
// refusals in twenty-four hours on that machine. One of them was the first
// dispatch of this very deposit - started here at 01:20Z, dead at 01:37Z on
// "You've hit your session limit", and the item sat marked HELD until the
// watcher read its transcript an hour later. A door that keeps dispatching into
// a refusal manufactures dead sessions at its own cadence, and every one of
// them looks exactly like work in progress.
//
// So capacity gains a second question. `room` asks how much fits on the belt;
// this asks whether the account will serve what is put there. The test, and the
// releases, are account-budget.cjs's - including the one that keeps this from
// deadlocking, which matters because THIS DOOR IS THE ONLY THING THAT STARTS
// SESSIONS HERE: held shut, it would wait forever for a success that only it
// could have produced, so the hold expires at the reset time the account's own
// message names rather than at a timeout invented here.
//
// IT NARROWS DISPATCH AND NOTHING ELSE. Selection, the four rules, the brief
// and the report all still run, so the report says exactly what would have gone
// out - which is the difference between a door that is holding and a door with
// nothing to do.
const { accountStarved } = require("./account-budget.cjs");
const budget = accountStarved(now);
// Armed, and the account will serve it. Both, because "armed" is about the
// AutoRun switch and says nothing about whether a session can run.
const DISPATCH_ALLOWED = DO_DISPATCH && !budget.starved;

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
const { deposit: depositRecord } = require("./deposit.cjs");

// ONE PLACE, because this machine deposits from four call sites and each had
// its own `try { appendFileSync } catch {}` that swallowed whatever went wrong.
//
// A BELT THAT CANNOT BE WRITTEN is survivable and stays swallowed: the console
// still says what happened and the next run tries again in five minutes.
//
// A REFUSAL IS NOT. The door only refuses a record THIS MACHINE built wrong,
// and three of the call sites below built one wrong for eleven days - eight of
// the fifteen permanent leaks on Telechurch's belt came from here. Swallowing
// that would put the guard behind the very silence it was added to end.
function putOnBelt(rec) {
  try {
    return depositRecord(rec, { belt: BELT, allowDuplicate: true });
  } catch (err) {
    if (err && err.name === "DepositRefused") throw err;
    return { written: false, reason: "belt-unwritable" };
  }
}
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
// PULLABLE IS A TEST APPLIED TO AN ID THE WATCHER ALREADY CHOSE - never a way
// to find one. Read as a search it would be the old behaviour under a new name.
//
// Not "has this ever been dispatched" but "is somebody working it NOW": a dead
// session's item is pullable again, which is the only answer that does not lose
// it. The "his by law" test is kept here as well, deliberately redundant with
// the watcher's - a decision could only reach this line through a mis-set kind,
// and the cost of that mistake is an agent taking a decision that was reserved.
const pullable = (r) =>
  IX.isOpenContract(r) &&
  !heldByLiveSession(r.id) &&
  String(r.triggers || "") !== "operator" &&
  r.owner !== "operator" &&
  !r.operatorDecision;

const whyNotPullable = (r) => {
  if (!IX.isOpenContract(r)) return "it is no longer an open contract here - closed, retired or re-kinded since the watcher ordered it";
  if (heldByLiveSession(r.id)) return "a live session is already holding it";
  return "it is addressed to the operator, and those are his by law";
};

const byId = new Map();
for (const r of records) if (r.id) byId.set(String(r.id), r);

// FOUR WAYS A STANDING LIST CAN FAIL TO BE ONE, and they are four different
// facts. Absent means nothing has ever judged this belt; unreadable means the
// list is there and cannot be trusted; undated means it carries no claim about
// its own freshness; stale means the judgement has decayed. None of them
// dispatches anything, and each of them says which it was - this factory has
// read absence as a clean result before, and that is the failure being avoided.
const QUEUE_FILE = path.join(CTX, "watcher-queue.json");
const humanMs = (ms) => {
  const m = Math.round(ms / MS.m);
  if (m < 90) return `${m}m`;
  const h = ms / MS.h;
  return h < 48 ? `${h.toFixed(1)}h` : `${(h / 24).toFixed(1)}d`;
};
const queue = (() => {
  let raw;
  try {
    raw = fs.readFileSync(QUEUE_FILE, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return { state: "absent", why: "the watcher has never written a ready-list here, so there is nothing to drain. Nothing has judged this belt yet - that is not a quiet morning.", ready: [] };
    }
    return { state: "unreadable", why: `the ready-list could not be read: ${String(err.message).split("\n")[0]}`, ready: [] };
  }
  let j;
  try {
    j = JSON.parse(raw.replace(/^\uFEFF/, ""));
  } catch (err) {
    return { state: "unreadable", why: `the ready-list is not valid JSON: ${String(err.message).split("\n")[0]}`, ready: [] };
  }
  const producedAt = Date.parse(j.producedAt || "") || null;
  const staleAfter = Date.parse(j.staleAfter || "") || null;
  const base = {
    producedAt: j.producedAt || null,
    staleAfter: j.staleAfter || null,
    goodFor: j.goodFor || null,
    listed: Array.isArray(j.ready) ? j.ready.length : 0,
    emptyBecause: j.readyEmptyBecause || null,
  };
  if (!staleAfter) return { ...base, state: "undated", why: "the ready-list carries no staleAfter stamp, so nothing here can say whether it is still good. An undated judgement is refused exactly as an expired one is.", ready: [] };
  if (now > staleAfter) return { ...base, state: "stale", why: `the ready-list expired ${humanMs(now - staleAfter)} ago - produced ${j.producedAt}, good for ${j.goodFor || "an unstated span"}. A long-unrun watcher's list is a decayed judgement, and acting on it would dispatch what somebody decided about a factory that has moved on.`, ready: [] };
  return { ...base, state: "fresh", why: `written ${humanMs(now - (producedAt || staleAfter))} ago, good until ${j.staleAfter}`, ready: Array.isArray(j.ready) ? j.ready : [] };
})();

// TAKEN IN THE ORDER IT WAS WRITTEN. There is no sort here and there must not
// be one: the watcher computed rank, band and priority for every entry, and a
// second opinion applied at the door would make those numbers decorative.
const skipped = [];
const waiting = [];
for (const entry of queue.ready) {
  const id = String((entry && entry.id) || "");
  const r = id ? byId.get(id) : null;
  const rank = entry && entry.rank !== undefined ? entry.rank : null;
  if (!r) {
    skipped.push({ id: id || "(an entry carrying no id)", rank, why: "no record on this belt carries that id" });
    continue;
  }
  if (!pullable(r)) {
    skipped.push({ id, rank, why: whyNotPullable(r) });
    continue;
  }
  waiting.push({ r, advice: adviceOf(r), at: Date.parse(r.run || "") || 0, rank });
}

// WHAT THE BELT WOULD HAVE OFFERED, COUNTED AND NEVER PULLED. This is the whole
// shape of the change in one number: work can be eligible here and still not go
// out, because nothing chose it. Reported so an idle door is never read as an
// empty belt - and so the gap between the two is visible to anyone who wonders
// why a busy belt is sending nothing.
const beltEligible = records.filter(pullable).length;

const picks = waiting.slice(0, room);

// WHAT A RECORD SAYS ABOUT ITSELF, IN WHATEVER FIELDS IT HAPPENS TO CARRY.
//
// brief() read `claim` and `evidence` and nothing else. That is right for the
// belt's original author and wrong for every plan note: the Go switch writes
// `title` / `detail` / `plan` / `planStatus` and neither of the two fields
// this printed. Both lines came out empty, no error, agent dispatched blind.
//
// ORDER IS THE POINT. claim and evidence first, because that is what a briefed
// agent expects to read first and nothing about the common case should move.
// Everything after is additive: a record that already carried claim and
// evidence now also shows its title, which is context it always had and never
// handed over.
//
// A BLANK IS NEVER PRINTED. If none of these fields exist, the brief says the
// record is silent and names where to read it, rather than emitting "Claim: "
// and letting the agent decide whether that means empty or broken. Same rule
// the auto door now follows for its own queue: report why you are empty.
const CONTENT_FIELDS = [
  ["Claim", "claim"],
  ["Evidence", "evidence"],
  ["Title", "title"],
  ["Detail", "detail"],
];
const contentOf = (r) => {
  const out = [];
  // The plan line comes first because it is the subject everything else is
  // about, and because a plan id is the one field here that leads somewhere:
  // the registered plan file, which no other field can point at.
  if (r.plan) out.push(`Plan: ${String(r.plan)}${r.planStatus ? ` (${r.planStatus})` : ""}`);
  for (const [label, key] of CONTENT_FIELDS) {
    const v = String(r[key] || "").replace(/\s+/g, " ").trim();
    if (v) out.push(`${label}: ${v}`);
  }
  if (!out.length) {
    out.push(
      `This record ${MISSING_CONTENT} - it is on the belt with an id and`,
      `nothing that says what it is. Do not guess. Read the line whose "id" is`,
      `the one above in .claude/agent-context/findings.jsonl, and if it really`,
      `says nothing, close it terminal:withdrawn and say that is why.`
    );
  }
  return out;
};

const brief = (p) =>
  [
    `Work this single deposit from the Living Factory belt and nothing else.`,
    ``,
    `ID: ${p.r.id}`,
    ...contentOf(p.r),
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
    // STEP ZERO IS A REFUSAL, and it is first because every other step writes
    // something. On the night of 2026-09-22 two sessions worked
    // six-orphans-need-a-decision-not-a-purge and both merged it (#571, #572),
    // and a third had to reconcile them. claim.cjs exits 3 when another live
    // session already holds this item; it is on main and, until this line, no
    // session had ever been told to run it.
    `0. FIRST, before reading further: node tools/factory/claim.cjs`,
    `   It names the deposit that is yours and reports any other live session`,
    `   holding it. If it exits 3, STAND DOWN - do not branch, do not edit, do`,
    `   not close anything. Deposit what the duplicate cost and stop.`,
    `1. Then, before changing anything: cut the branch.`,
    `   <lane>/<PLAN-ID>--claude--<lineage>--<description>`,
    `2. Commit each coherent piece as you finish it, and push after the first one.`,
    `   Use git commit -F <file> for the message, never inline -m.`,
    `3. Commit ONLY the files you touched. This tree is shared with other sessions`,
    `   and carries their uncommitted work; never git add -A, never stash.`,
    // THE CLOSING RECORD HAS A SHAPE, AND THIS STEP USED TO DESCRIBE ONLY ITS
    // PURPOSE. Four sessions on the night of 2026-09-22 read the word "closure"
    // in the sentence below and wrote it as the record's KIND - a word the belt
    // does not recognise, so each one landed in badKinds and carried no kind at
    // all. They were reading the brief correctly; the brief named the act and
    // never named the vocabulary. Both constraints are stated literally now.
    `4. Then append ONE record to .claude/agent-context/findings.jsonl that ends`,
    `   this item. Three fields decide whether it lands:`,
    `     subject  EXACTLY "${p.r.id}" - the id and nothing else. A subject that`,
    `              describes the item in prose closes nothing and says nothing.`,
    `     triggers one of terminal:fixed, terminal:shipped, terminal:resolved, or`,
    `              terminal:withdrawn if it should not be done.`,
    `     kind     one of contract, deposit, note, decision - or leave the field`,
    `              out entirely, which is fine. "closure" is not a kind; it is`,
    `              what the record DOES, and writing it there voids the field.`,
    `   That record is what takes this off the conveyor - nothing else will, and`,
    `   until it is written the board cannot say your work happened.`,
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
const MISSING_CONTENT = "carries no claim, evidence, title or detail";
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

// DID A WINDOW APPEAR? ASK, RATHER THAN TRUST THE FLAG.
//
// The operator has reported popups twice, and both times the answer came from
// looking at the desktop rather than at the code - the second time a flag was
// set, correct, and defeated by the launcher it was set on. A flag says what we
// asked for; this says what happened.
//
// One sample before the spawns and one after the survival check. Cheap (two
// PowerShell reads per tick, hidden), and it measures the exact moment the risk
// exists rather than watching the whole machine forever.
// THE FIRST VERSION OF THIS WAS BLIND, and it is worth keeping why.
//
// It asked Get-Process for MainWindowHandle. That property finds a window owned
// by the process's own MAIN THREAD - and a console window is owned by conhost on
// behalf of somebody else, so three consoles stood on the operator's desktop
// while this reported a clean machine and the report was believed over the man
// looking at the screen.
//
// EnumWindows walks the real top-level window list; IsWindowVisible decides what
// a person can actually see; GetWindowThreadProcessId names the owner from the
// window rather than from a guess. Proven against a deliberately visible cmd.exe
// before being trusted - the shape the old probe could not see.
const WINDOW_LIST_PS = `
Add-Type @'
using System; using System.Text; using System.Collections.Generic; using System.Runtime.InteropServices;
public class WL {
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  // CharSet.Unicode IS LOAD-BEARING. Without it the default is Ansi, the
  // StringBuilder is marshalled a byte at a time against a function writing
  // UTF-16, and every title comes back as its FIRST LETTER - "ConsoleWindowClass"
  // arrives as "C". The detection was still right; the evidence it printed was
  // one character wide, which is the kind of quiet wrongness this whole thread
  // has been about.
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassNameW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out R r);
  [StructLayout(LayoutKind.Sequential)] public struct R { public int L, T, Rr, B; }
  delegate bool EnumProc(IntPtr h, IntPtr l);
  public class W { public long H; public uint Pid; public string Title; public string Cls; }
  public static List<W> All() {
    var o = new List<W>();
    EnumWindows((h, l) => {
      if (!IsWindowVisible(h)) return true;
      R r; GetWindowRect(h, out r);
      if (r.Rr - r.L <= 0 || r.B - r.T <= 0) return true;
      var t = new StringBuilder(512); GetWindowTextW(h, t, 512);
      var c = new StringBuilder(256); GetClassNameW(h, c, 256);
      uint pid; GetWindowThreadProcessId(h, out pid);
      o.Add(new W { H = (long)h, Pid = pid, Title = t.ToString(), Cls = c.ToString() });
      return true;
    }, IntPtr.Zero);
    return o;
  }
}
'@
[WL]::All() | Select-Object H,Pid,Cls,Title | ConvertTo-Json -Compress
`;

function windowedNow() {
  try {
    const raw = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", WINDOW_LIST_PS], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      windowsHide: true,
    });
    const parsed = JSON.parse(String(raw).trim() || "[]");
    // Keyed by WINDOW HANDLE, not by pid: one process can own several windows,
    // and three consoles from one launcher is exactly the case this exists for.
    // The class name is carried because it is what names a console - "C" is
    // ConsoleWindowClass, and a title is often empty while a class never is.
    return new Map(
      (Array.isArray(parsed) ? parsed : [parsed]).map((w) => [w.H, `pid ${w.Pid} class=${w.Cls} ${String(w.Title || "").slice(0, 100)}`]),
    );
  } catch {
    // Unreadable is not clean. An empty map would read as "no windows" and
    // quietly prove the opposite of what this is for, so the caller is told.
    return null;
  }
}

function stillAlive(pid) {
  try {
    // Signal 0 tests for existence without touching the process.
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// How recent a refusal has to be to be THIS dispatch's cause rather than an
// older one still sitting in the transcript store.
const REFUSAL_IS_OURS_MS = 10 * MS.m;

/**
 * WHY A SILENT EXIT NO LONGER GUESSES.
 *
 * This used to answer "most often the headless CLI is not signed in. Run
 * `claude -p hello` in a terminal here to see the real message". That was a
 * guess, written on 2026-09-22 from a single foreground observation, and it is
 * measurably wrong on this host. Measured across all 49 dispatch logs in
 * Telechurch's .claude/agent-context/dispatch-logs on 2026-09-23: not one names
 * an authentication failure, and every dispatch failure that named a cause at
 * all named the account's session limit - six logs and four belt deposits
 * carrying "You've hit your session limit - resets ..." in the CLI's own words.
 * Sending the next session to go and check its sign-in points it at the one
 * cause never once observed here.
 *
 * It does not guess the other way either. Two things this machine can READ
 * separate the cases, and both are already wired here for other reasons:
 *
 *   the transcript   sessionLife() looks for a transcript named after the uuid
 *                    this machine minted at spawn. No transcript means the CLI
 *                    never got as far as opening a session - it failed BEFORE
 *                    it began, which is precisely what the deposit's own title
 *                    claims and what nothing until now actually checked.
 *   the account      accountStarved() reads the newest refusal out of the
 *                    transcript store, in the CLI's own sentence. A session
 *                    killed by the limit leaves that sentence behind even when
 *                    its own log file is empty.
 *
 * So the message reports what was found, and names a cause only when something
 * on disk says so. Where nothing does, it says that plainly and points at the
 * foreground run - which stays the only way to see a message that was never
 * written down anywhere.
 *
 * NEITHER PROBE MAY BECOME A SECOND FAILURE. This runs only on the path where a
 * dispatch has already died, so a throw here would replace the report of the
 * first failure with a crash about the diagnosis of it.
 *
 * THE TEXT MUST STAY STABLE ACROSS RUNS. The deposit below de-duplicates on
 * this exact string - "never a duplicate of one already sitting there
 * unanswered" - so folding a session id or a timestamp in here would make every
 * failure distinct and bury the belt under the same failure every twenty
 * minutes. The self-test drives that directly.
 */
function silentExit(session) {
  let opened = null;
  try {
    opened = sessionLife(session, ROOT, ALIVE_MS);
  } catch {
    /* the probe is evidence, never a second failure */
  }
  let refusal = null;
  try {
    const b = accountStarved(Date.now());
    if (b && b.refusal && Date.now() - Date.parse(b.refusal.at) < REFUSAL_IS_OURS_MS) {
      refusal = String(b.refusal.text || "").trim();
    }
  } catch {
    /* same */
  }
  const began = opened
    ? "it opened a session and then died without printing anything"
    : "it never opened a session, so it failed before it began";
  if (refusal) return `${began} - and the account refused a run moments earlier: "${refusal.slice(0, 120)}"`;
  return (
    `${began}, and nothing in the transcript store names a cause. Run the same command in the foreground to see ` +
    "what the CLI says - on this host every failure that named one named the account's session limit"
  );
}

function lastWords(file, session) {
  let t = "";
  try {
    // THE ESCAPE IS PART OF THE SEQUENCE. This pattern used to be
    // /\[[0-9;]*m/, which removes the "[31m" and leaves the escape byte
    // itself sitting at the front of the message - invisible in a terminal,
    // and then carried verbatim onto the belt, where the next reader finds a
    // control character inside a JSON field. The optional "?" keeps every
    // sequence the old pattern stripped, so nothing that worked stops working.
    //
    // Population on this host today: zero. `claude -p` writing to a redirected
    // handle emits no colour at all, so not one of the dispatch logs on disk has
    // ever carried an escape byte - which is exactly why a guard that never
    // worked has never been noticed. The self-test below is what found it.
    t = fs.readFileSync(file, "utf8").replace(/\u001b?\[[0-9;]*m/g, "").trim();
  } catch {
    return "it exited and left no output";
  }
  // AN EMPTY LOG IS ITSELF A DIAGNOSIS, so it is not reported as a shrug - but
  // the diagnosis is now read off disk instead of assumed. See silentExit.
  if (!t) return silentExit(session);
  // The first non-empty line is the useful one: these failures announce
  // themselves immediately and then say nothing else.
  return t.split(/\r?\n/).filter((l) => l.trim())[0].slice(0, 300);
}

// PROVEN RATHER THAN ARGUED: `node machines/intake-worker.cjs --self-test`.
//
// A sentence is the entire product of this path, so the only thing worth
// asserting is what the sentence SAYS. Every check drives the real function
// against the real filesystem; not one of them re-implements it. It runs here,
// above the dispatch block, so a test run can never start an agent.
if (SELF_TEST) {
  const os = require("os");
  const SL = require("./session-life.cjs");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lastwords-"));
  let failed = 0;
  let skipped = 0;
  const check = (name, ok, got) => {
    console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}`);
    if (!ok) {
      failed++;
      console.log(`        got: ${got}`);
    }
  };

  // A log with words is answered from the log and the probes never run.
  const spoke = path.join(dir, "spoke.log");
  // The escape is WRITTEN as \u001b, never pasted in: an invisible character is a
  // guard nobody can see break.
  fs.writeFileSync(
    spoke,
    "\u001b[31mYou've hit your session limit - resets 8:30pm (America/New_York)\u001b[0m\nand then some\n"
  );
  const said = lastWords(spoke, crypto.randomUUID());
  check(
    "a log with words returns the CLI's own first line",
    said === "You've hit your session limit - resets 8:30pm (America/New_York)",
    said
  );

  // A silent exit by a session that never existed.
  const silent = path.join(dir, "silent.log");
  fs.writeFileSync(silent, "");
  const never = crypto.randomUUID();
  const a = lastWords(silent, never);
  check("a silent exit by a session with no transcript says it never began", /never opened a session/.test(a), a);
  check("the sign-in guess is gone - it was never observed on this host", !/not signed in/i.test(a), a);
  check("and no session is sent to run `claude -p` after a cause nothing measured", !/claude -p/.test(a), a);
  check("the same failure reads identically twice, so the belt can de-duplicate it", a === lastWords(silent, never), a);
  check("and carries no session id, which would make every failure distinct", !a.includes(never), a);

  // The other half of the discriminator, against a session this host really
  // opened. No fixture is invented: the newest uuid-named transcript in the
  // store IS a session that existed, which is the condition under test.
  let real = null;
  try {
    const d = path.join(SL.PROJECTS, SL.tokenize(ROOT));
    const files = fs.readdirSync(d).filter((f) => /^[0-9a-f-]{36}\.jsonl$/i.test(f));
    if (files.length) {
      real = files
        .sort((x, y) => fs.statSync(path.join(d, y)).mtimeMs - fs.statSync(path.join(d, x)).mtimeMs)[0]
        .replace(/\.jsonl$/i, "");
    }
  } catch {
    /* no store on this host is a SKIP, reported as one, never folded into a pass */
  }
  if (real) {
    const b = lastWords(silent, real);
    check("a silent exit that DID open a session says so instead", /opened a session/.test(b), b);
    check("so the two silences are never reported as the same thing", b !== a, b);
  } else {
    skipped += 2;
    console.log("  SKIP  no uuid-named transcript in this host's store, so the opened-a-session half was not driven");
  }

  fs.rmSync(dir, { recursive: true, force: true });
  const tail = skipped ? ` (${skipped} NOT DRIVEN - see SKIP above)` : "";
  console.log(failed ? `\nintake-worker self-test: ${failed} FAILED${tail}` : `\nintake-worker self-test: all passed${tail}`);
  process.exit(failed ? 1 : 0);
}

let started = [];
let failedToStart = [];
let windowsBefore = null;
let windowsAppeared = [];
if (DISPATCH_ALLOWED && picks.length) {
  fs.mkdirSync(DISPATCH_LOGS, { recursive: true });
  windowsBefore = windowedNow();
  const launched = [];
  for (const p of picks) {
    const label = String(p.r.id).slice(0, 28);
    // MINTED BEFORE THE SPAWN, not read back after it. This is the whole reason
    // the stamp below can be proven from disk: sessionLife identifies a
    // main-checkout session by matching a transcript filename against the
    // session id, and the CLI names that file after this uuid.
    const session = crypto.randomUUID();
    const stem = String(p.r.id).replace(/[^a-z0-9._-]/gi, "_").slice(0, 80);
    const logPath = path.join(DISPATCH_LOGS, `${stem}.log`);
    // THE BRIEF WAS 71 CHARACTERS LONG BY THE TIME IT ARRIVED.
    //
    // It used to be passed as an argument: spawn("cmd.exe", ["/c", "claude",
    // "-p", ..., brief(p)]). cmd.exe ends a command line at the first CR or LF,
    // and no amount of quoting changes that - so every dispatched session
    // received exactly the first line, "Work this single deposit from the
    // Living Factory belt and nothing else.", and NOTHING after it. Not the ID.
    // Not the claim, the evidence or the recommendation. Not one of the five
    // publishing steps. Not the git trap or the Set-Content trap.
    //
    // Proven from the receiving end on 2026-09-22: the first user message in a
    // live dispatched session's transcript measures 71 characters. The sessions
    // were titled after it, which is why three agents all carried the same name
    // on the board.
    //
    // They worked anyway - branching, committing with -F, publishing, closing
    // their records - because CLAUDE.md is injected by the harness at session
    // start and carries that discipline. They found their own assignment by
    // reading the process table. That is the fleet compensating for a broken
    // dispatcher, and it is not a reason to leave it broken: the ONE thing
    // CLAUDE.md cannot supply is which deposit this session is for, which is
    // the only part of the brief that differs between them.
    //
    // FOUR SHAPES WERE TRIED BEFORE THIS ONE, and the three that failed all
    // failed the same way: they tried to push the whole brief THROUGH the
    // command line.
    //
    //   brief as an argument        - cut at the first newline. The bug.
    //   stdin from a file handle    - works, but only when the child is NOT
    //                                 detached. This dispatcher must detach;
    //                                 it starts three sessions and exits.
    //   cmd.exe's own < redirect    - the quoting does not survive spawn().
    //
    // So the brief stops travelling and the POINTER travels instead. One line
    // is all cmd.exe will carry, and one line is all this needs: the id, so a
    // session knows its assignment even if nothing else works, and the path to
    // the rest of it.
    //
    // The file lives inside the repo deliberately. The first pointer probe put
    // it in a scratchpad and the dispatched session could not read another
    // session's scratchpad - it spent its entire turn proving it had no way to
    // see its own orders. Under .claude/agent-context it is beside the belt the
    // session is already reading.
    const briefPath = path.join(DISPATCH_LOGS, `${stem}.brief.txt`);
    const briefRel = path.relative(ROOT, briefPath).replace(/\\/g, "/");
    try {
      fs.writeFileSync(briefPath, brief(p), "utf8");
      // Output goes to a file rather than nowhere. Whatever an agent says on
      // its way out is the only evidence of why it left.
      //
      // Read it for what it is: `claude -p` holds ALL of its output until the
      // run finishes, so an empty log means STILL WORKING far more often than
      // it means dead. That is why the aliveness check below asks the operating
      // system and not this file. Three probes were scored as failures against
      // an empty log while the sessions behind them were running fine.
      const errPath = path.join(DISPATCH_LOGS, `${stem}.err.txt`);
      const pidPath = path.join(DISPATCH_LOGS, `${stem}.pid`);
      try {
        fs.unlinkSync(pidPath);
      } catch {
        /* first run for this item */
      }
      // "ID: <slug>" IS A CONTRACT WITH ANOTHER STATION, not a formatting
      // choice. tools/factory/claim.cjs - the collision guard an agent built on
      // this belt - finds a session's own deposit by matching exactly that
      // marker in an ancestor's command line. Writing the id in prose instead
      // would leave the guard reporting "this session was not dispatched by the
      // intake worker" for every session, which is silence where a refusal
      // belongs. Keep the marker, keep a space after the id, and let nothing
      // else in this line look like one.
      const pointer =
        `Work one deposit from the Living Factory belt and nothing else. ID: ${p.r.id} . ` +
        `Run node tools/factory/claim.cjs first - it names your deposit and stops you if another live session already holds it. ` +
        `Then read your full brief - the claim, the evidence, the recommendation and how to publish and close it - ` +
        `in this repo at ${briefRel} , before anything else.`;
      const argv = ["-p", "--session-id", session, "--permission-mode", "acceptEdits", pointer];
      // WINDOWS OFFERS A DISPATCHER TWO BAD SHAPES AND ONE GOOD ONE, and this
      // machine shipped both bad ones before the operator's third report.
      //
      //   detached   survives the launcher - and has NO console. So when the
      //              CLI runs its own startup lookup through cmd.exe
      //              (`REG.exe QUERY ...\Cryptography /v MachineGuid`), Windows
      //              has to CREATE a console for that grandchild, and a new
      //              console in an interactive session is a visible window.
      //              Photographed 2026-09-23T12:43:57Z: three agents, three
      //              console windows, 895x518, cascading at +102 +128 +154,
      //              five seconds after the switch went to Automatic.
      //   attached   no window - and it dies the instant the launcher exits,
      //              because it shares the launcher's console and takes its
      //              close. Proven, not assumed: no transcript, empty log.
      //
      // The fix is to give the agent its OWN console, created hidden. Children
      // inherit a console, so the grandchild finds one already there and never
      // asks for a new one; and it is nobody's console-mate, so nothing closes
      // under it. Start-Process is how that is asked for from out here:
      // -WindowStyle Hidden creates with SW_HIDE, and without -Wait it returns
      // at once. Proven before shipping - zero windows across 90 seconds of
      // full window enumeration, and the agent still alive minutes after its
      // launcher was gone.
      //
      // WHY windowsHide ALONE WAS NOT ENOUGH, since it is set three lines down
      // and was set on the old shape too: it applies to the process being
      // started and says nothing about what that process starts. The window
      // that reached the desktop was two generations down.
      const psq = (s) => `'${String(s).replace(/'/g, "''")}'`;
      // TWO QUOTING LAYERS, AND ONLY ONE OF THEM WAS BEING WRITTEN.
      //
      // `psq` quotes for POWERSHELL's parser. It is not what the started process
      // sees. Start-Process joins -ArgumentList with single spaces into one
      // command-line string and quotes nothing, so a multi-word element is
      // delivered to the target as MANY arguments - and the target's own parser
      // has no way to know they were ever one.
      //
      // MEASURED, BOTH ENDS, 2026-09-23. The dispatcher builds a 400-character
      // pointer and hands it over as one argv element. The command line of a live
      // dispatched session carried all 648 characters of it, unquoted. The first
      // user message in that session's transcript was FOUR CHARACTERS: "Work".
      // Driven against a real Start-Process afterwards with a target that writes
      // its own argv: 38 arguments arrived where 6 were sent, and the last one
      // was "it." - the final word of the sentence.
      //
      // So the pointer that replaced the cut-at-the-first-newline brief was being
      // cut at every space instead, and the fleet went on compensating through
      // claim.cjs and the process table - which is what made it invisible. The
      // brief file it points at has been written correctly, and read by nobody.
      //
      // The fix is the second layer: anything carrying whitespace is also quoted
      // for the TARGET, inside the PowerShell quoting. `ID: <slug> ` survives it
      // intact, which claim.cjs depends on, because the quotes go around the whole
      // sentence and not inside it.
      const psqArg = (s) => {
        const v = String(s);
        return /\s/.test(v) ? psq(`"${v.replace(/"/g, '\\"')}"`) : psq(v);
      };
      const exe = CLAUDE_EXE || "claude";
      const psCmd =
        `$p = Start-Process -FilePath ${psq(exe)} -ArgumentList @(${argv.map(psqArg).join(",")}) ` +
        `-WorkingDirectory ${psq(ROOT)} -WindowStyle Hidden ` +
        // Two files, not one: PowerShell refuses to redirect both streams to the
        // same path, and a dispatch that failed on that would look like an agent
        // that never started.
        `-RedirectStandardOutput ${psq(logPath)} -RedirectStandardError ${psq(errPath)} -PassThru; ` +
        // The pid goes to a FILE rather than down a pipe. A pipe kept this
        // process waiting on a handle the grandchild had inherited, which is a
        // hang in the one machine that must not hang.
        `Set-Content -Path ${psq(pidPath)} -Value $p.Id -Encoding ascii`;
      const launch = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", psCmd], {
        windowsHide: true,
        stdio: "ignore",
        timeout: 60000,
      });
      let pid = null;
      try {
        pid = Number(String(fs.readFileSync(pidPath, "utf8")).trim()) || null;
      } catch {
        /* handled just below - an unwritten pid file IS the failure */
      }
      if (!pid) {
        failedToStart.push({
          id: p.r.id,
          label,
          why: `the launcher wrote no pid (powershell exit ${launch.status}${launch.error ? `, ${launch.error.message.split("\n")[0]}` : ""})`,
        });
        continue;
      }
      launched.push({ id: p.r.id, label, session, pid, logPath, errPath });
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
      // The session id travels with the log path. On a silent exit it is the only
      // thing that can say whether the CLI ever opened a session at all.
      // Both streams are read, newest words first from whichever spoke. The
      // launcher writes stderr to its own file now, and a CLI that refuses to
      // start says so there rather than on stdout.
      else
        failedToStart.push({
          id: l.id,
          label: l.label,
          pid: l.pid,
          why: lastWords(l.errPath, l.session) !== "it exited and left no output" ? lastWords(l.errPath, l.session) : lastWords(l.logPath, l.session),
          log: path.relative(ROOT, l.logPath).replace(/\\/g, "/"),
        });
      // No file handles to close: the agent's console is its own and the
      // launcher opened the redirect files, not this process.
    }
    // The second sample, after the agents have had SURVIVE_MS to open anything
    // they were going to open. Anything windowed now that was not windowed
    // before this tick is reported by name and title, so the next report of a
    // popup arrives with its culprit attached instead of a search.
    const after = windowedNow();
    if (windowsBefore && after) {
      for (const [pid, what] of after) if (!windowsBefore.has(pid)) windowsAppeared.push(what);
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
      // ADDRESSED, because a record naming nothing to trigger is a LEAK -
      // pulse-check's word for the way this belt dies quietly. This call site
      // wrote eight of the fifteen permanent ones on Telechurch's belt, and an
      // append-only belt cannot take any of them back. The kind stays
      // `deposit`, so it still waits for somebody to judge whether it is work;
      // the trigger only says whose queue it waits in until then.
      triggers: "contract:architecture",
      title: "An agent was dispatched and never started",
      claim: `${ids.length} dispatch(es) exited immediately: ${why}`,
      detail: `Items affected: ${ids.join(", ")}. The work stays accepted and will be offered again on the next run. Nothing is wrong with the items themselves.`,
      recommend: "Fix what the exit message names, then let the next run pick these up again. Until then every run will keep failing the same way.",
    };
    putOnBelt(rec);
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
    putOnBelt(rec);
  }
}

// A REFUSED LIST GOES ON THE BELT, because a door that quietly stops pulling
// looks exactly like a morning with nothing to do. The watcher failing to run
// is the single failure that halts this whole factory, and nothing else would
// say so: the board's AUTO lane reads `armed` and `room`, both of which stay
// true and healthy while nothing moves.
//
// ONLY WHEN WORK IS ACTUALLY STRANDED BEHIND IT. A refused list with an empty
// belt costs nothing and is not a fault worth a record.
//
// ONE RECORD PER DISTINCT FAULT PER DAY. At a five-minute cadence an
// unconditional write would put 288 identical records on the belt before
// anybody read one, and `a-belt-can-die-by-flooding-not-only-by-leaking` is
// already a finding here. A day is short enough that a fault returning after a
// fix appears as a new record, and long enough not to bury the belt it warns.
if (!DRY && queue.state !== "fresh" && beltEligible) {
  const key = `${queue.state}|${new Date(now).toISOString().slice(0, 10)}`;
  let beltText = "";
  try {
    beltText = fs.readFileSync(BELT, "utf8");
  } catch {
    /* the console still says it */
  }
  if (!beltText.includes(`"intakeRefusal":${JSON.stringify(key)}`)) {
    const rec = {
      id: `intake-refused-${key.replace("|", "-")}`,
      run: new Date(now).toISOString(),
      kind: "deposit",
      dimension: "architecture",
      source: "intake-worker",
      intakeRefusal: key,
      // ADDRESSED - see the note at the dispatch-failure record above. A record
      // that names nothing to trigger is a leak, and this is one of the three
      // call sites that wrote them.
      triggers: "contract:architecture",
      title: "The auto door refused the watcher's ready-list",
      claim: `Auto intake dispatched nothing: the list it drains is ${queue.state}, and ${beltEligible} contract(s) on this belt are eligible behind it.`,
      detail: `${queue.why} This door pulls only what the watcher put on the list, so it will go on refusing - correctly - until a watcher run writes a fresh one. Nothing has been lost and nothing has been reordered.`,
      recommend: "Find out why the watcher stopped writing its ready-list - its rhythm on the rail, its lock, or its own last run - and let it write one. The door itself needs no change.",
    };
    putOnBelt(rec);
  }
}

// A HELD DOOR GOES ON THE BELT, on exactly the terms the refused list above
// uses, and for the same reason: holding correctly and having nothing to do are
// indistinguishable from outside, and this door has been repaired twice already
// for looking busy while nothing moved.
//
// ONLY WHEN WORK IS ACTUALLY STRANDED BEHIND IT - `picks.length`, which is what
// this run would have sent. A hold over an empty ready-list costs nothing and is
// not a fault worth a record.
//
// ONE RECORD PER DAY. At five-minute cadence an unconditional write would put
// 288 identical records on the belt before anybody read one, and a starvation
// lasting six hours is ordinary here rather than exceptional.
if (!DRY && budget.starved && picks.length) {
  const key = new Date(now).toISOString().slice(0, 10);
  let beltText = "";
  try {
    beltText = fs.readFileSync(BELT, "utf8");
  } catch {
    /* the console still says it */
  }
  if (!beltText.includes(`"intakeHold":${JSON.stringify(key)}`)) {
    const rec = {
      id: `intake-held-starved-${key}`,
      run: new Date(now).toISOString(),
      kind: "deposit",
      dimension: "architecture",
      source: "intake-worker",
      intakeHold: key,
      // ADDRESSED - see the note at the dispatch-failure record above. A record
      // that names nothing to trigger is a leak, and this is the third of the
      // three call sites that wrote them.
      triggers: "contract:architecture",
      title: "The auto door held, because the account will not run what it would have started",
      claim: `Auto intake dispatched nothing: ${picks.length} item(s) were selected and held, because the Claude account is refusing to serve new sessions.`,
      detail: `${budget.why} The work stays accepted, in the order the watcher wrote it, and goes out on the first run after the account is serving again. Nothing has been lost and nothing has been reordered. This is the door working, not the door broken - the alternative is spending a belt slot on a session that cannot run, which is what produced the dispatch that died at 01:37Z on 2026-09-23.`,
      recommend:
        "Nothing needs doing to the door. If holds like this are frequent, the cause is how much of the account the factory's own workers spend - deposit `the-tick-shares-a-budget-with-the-work-it-watches` is the record of that, and the answer is fewer or cheaper concurrent workers, not a wider door.",
    };
    putOnBelt(rec);
  }
}

const report = {
  checkedAt: new Date(now).toISOString(),
  repo: path.basename(ROOT),
  capacity: CAPACITY,
  onBelt: onBelt.length,
  room,
  // `waiting` is what THIS DOOR could take: entries on the watcher's ready-list
  // that are still pullable. The board's AUTO lane and the watcher's doors zone
  // both read it, and for a door that is the honest number - a belt full of work
  // nobody has offered is not work waiting at this door. The two counts below
  // keep the difference visible rather than leaving it to be inferred from a
  // zero.
  waiting: waiting.length,
  beltEligible,
  beltEligibleNotOffered: Math.max(0, beltEligible - waiting.length),
  queue: {
    file: path.relative(ROOT, QUEUE_FILE).replace(/\\/g, "/"),
    state: queue.state,
    why: queue.why,
    producedAt: queue.producedAt || null,
    staleAfter: queue.staleAfter || null,
    goodFor: queue.goodFor || null,
    listed: queue.listed || 0,
    offered: waiting.length,
    skipped,
    emptyBecause: queue.emptyBecause || null,
  },
  dry: DRY,
  selected: picks.map((p) => ({ id: p.r.id, hasRecommendation: !!p.advice, waitedHours: Math.round((now - p.at) / MS.h) })),
  // Only the ones still running when they were checked. A pid is not a start.
  dispatched: DO_DISPATCH ? started : [],
  failedToStart: DO_DISPATCH ? failedToStart : [],
  armed: DO_DISPATCH,
  // ARMED AND HELD ARE DIFFERENT FACTS AND BOTH ARE PUBLISHED.
  //
  // `armed` is the AutoRun switch. It stays true through a starvation, and a
  // board reading it alone would draw a healthy open door with nothing coming
  // out of it - which is the exact failure the refused-list record below was
  // written to end, one cause further along. So the hold is its own field, with
  // the account's own words for why and the instant it lifts.
  held: budget.starved,
  budget: {
    question: "will the Claude account serve a session started right now?",
    observable: budget.observable,
    starved: budget.starved,
    why: budget.why,
    holdsUntil: budget.holdsUntil ? new Date(budget.holdsUntil).toISOString() : null,
    newestRefusal: budget.refusal || null,
    newestSuccess: budget.lastSuccessAt || null,
  },
  // Which of the two reasons it is armed, so the board can say "Automatic"
  // rather than just "armed" - and so a run armed by a typed flag is never
  // mistaken for the switch being on.
  mode: MODE,
  armedBy: DO_DISPATCH ? (MODE === "auto" ? "the AutoRun switch" : "the --dispatch flag") : null,
  // MEASURED, NOT ASSUMED. null means no dispatch happened this tick or the
  // desktop could not be read; an empty array means it was read and nothing
  // appeared. The two are different facts and a popup report should be able to
  // tell them apart.
  windowsAppeared: windowsBefore ? windowsAppeared : null,
};
if (!DRY) {
  fs.mkdirSync(CTX, { recursive: true });
  fs.writeFileSync(path.join(CTX, "intake-worker.json"), JSON.stringify(report, null, 2) + "\n");
  if (picks.length) fs.writeFileSync(path.join(CTX, "intake-brief.txt"), picks.map(brief).join("\n\n" + "-".repeat(70) + "\n\n"), "utf8");
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`intake-worker: ${onBelt.length}/${CAPACITY} on the belt, ${waiting.length} offered by the watcher, room for ${room}  [${report.repo}]${DRY ? "   DRY - nothing written" : ""}`);
  // THE LIST IS NAMED EVERY RUN, whatever it says, because a verdict printed
  // only on failure makes silence ambiguous.
  console.log(`  ready-list  ${queue.state.toUpperCase()} - ${queue.why}`);
  for (const s of skipped) console.log(`  skipped  ${s.id} - ${s.why}`);
  for (const p of picks) console.log(`  would dispatch  ${p.r.id}${p.advice ? "" : "   (no recommendation - it would have to work one out)"}`);
  if (!picks.length) {
    // FIVE DIFFERENT MORNINGS THAT ALL LOOK LIKE AN IDLE DOOR. Refused, full,
    // empty by decision, empty with work stranded behind it, and genuinely
    // nothing to do are not the same fact, and this factory has read absence as
    // a clean result before.
    if (queue.state !== "fresh") console.log(`  REFUSED - nothing dispatched, because the list this door drains is ${queue.state}. Run the watcher.`);
    else if (!room) console.log("  belt is full");
    else if (queue.emptyBecause) console.log(`  nothing offered - ${queue.emptyBecause}`);
    else if (beltEligible) console.log(`  nothing offered - ${beltEligible} contract(s) here are eligible and the watcher put none of them on the ready-list. This door pulls what it is given and never chooses for itself.`);
    else {
      const untriaged = records.filter(IX.isAwaitingTriage).length;
      console.log(untriaged ? `  nothing offered, and nothing here is eligible - ${untriaged} deposit(s) are still waiting to be judged, and only a contract can be dispatched` : "  nothing offered, and nothing on this belt is eligible either");
    }
  }
  // PRINTED EVERY RUN THAT HOLDS, not only when something was stranded behind
  // it. A door that is shut for a reason and a door with nothing to do read the
  // same from outside, and that is the whole family of defect this machine keeps
  // being repaired for.
  if (budget.starved) console.log(`  HELD - ${budget.why}`);
  if (DISPATCH_ALLOWED) {
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
  // THREE REASONS NOTHING WENT OUT, AND THEY ARE NOT THE SAME REASON. --dry
  // disarms the run and writes nothing, so saying "brief written" there names a
  // file that does not exist; and "not armed" is about the AutoRun switch, which
  // may well be set to Automatic while --dry is in force. A machine that
  // misreports its own state in the one mode built for checking it is worse than
  // one with no check at all.
  else if (picks.length) {
    if (DRY) console.log(`\n  Dry run. Nothing was written and nothing was started. Without --dry these ${picks.length} would go out ${MODE === "auto" ? "now - the AutoRun switch is set to Automatic" : "only with --dispatch - the AutoRun switch is set to Manual"}.`);
    // A FOURTH REASON, AND IT IS NOT "NOT ARMED". The switch may well be set to
    // Automatic while the account refuses every session started under it, and
    // printing "run with --dispatch" there would send somebody to type a flag
    // that changes nothing.
    else if (budget.starved) console.log(`\n  Held, not idle. Brief written to .claude/agent-context/intake-brief.txt; these ${picks.length} go out on the first run after the account is serving again${budget.holdsUntil ? `, which its own message puts at ${new Date(budget.holdsUntil).toISOString()}` : ""}. Nothing has been lost and nothing has been reordered.`);
    else console.log(`\n  Not armed. Brief written to .claude/agent-context/intake-brief.txt; run with --dispatch to start them.`);
  }
}
process.exit(0);
