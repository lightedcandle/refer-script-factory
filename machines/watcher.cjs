#!/usr/bin/env node
/**
 * THE WATCHER - FIVE ZONES. What should be judged, what has stopped moving,
 * what stopped keeping its promise, what can still get in, and what only looks
 * finished.
 *
 * UNIVERSAL MACHINE. Resolves its subject repo from process.cwd(), never from
 * __dirname (precedent P13), and deposits to that repo's belt.
 *
 * ---------------------------------------------------------------------------
 * FIVE ZONES, AND WHAT EACH ONE IS ALLOWED TO DO
 * ---------------------------------------------------------------------------
 *
 * `watcher-has-five-zones`: the round covers incoming, the belt, the rail of
 * rhythms, the intake doors, and the closed pile - one per place work can stop
 * moving unnoticed. Its own recommendation set the order of construction:
 *
 *   "A watcher that half-covers five zones reports confidently about places it
 *    cannot see, which is worse than a watcher that covers one zone honestly."
 *
 * Zone 1 was built and armed first and is unchanged. Zones 2 to 5 are added
 * here, and each one still states its own coverage in every report - what it
 * looked at, and what it could not look at. Absence is not failure: a zone
 * nobody watched is a different fact from a zone that came back clean, and this
 * machine must never let the first read as the second.
 *
 * AUTHORITY IS NOT SHARED BETWEEN THE ZONES, AND THAT IS DELIBERATE.
 *
 * Zone 1 may accept work, behind --arm, at most --arm-limit per run. That limit
 * was an operator decision made while watching a real pass, and adding four more
 * zones is not a reason to revisit it. So ZONES 2 TO 5 HAVE NO ACCEPTANCE POWER
 * AT ALL. They observe, they annotate, and they queue. They do not promote, do
 * not retire, do not close, do not dispatch, and do not return work to incoming
 * - not even where they can see plainly that somebody should. Each zone's `can`
 * and `cannot` are written into its declaration below and into every report, so
 * a reader never has to infer what a verdict is going to cause.
 *
 * The one thing they may write is an ANNOTATION, and only when it says something
 * the belt does not already carry. See the signature note further down: it now
 * covers every zone, because all five run on the same thirty-minute clock and a
 * watcher that re-states an unmoved verdict floods the belt it is watching.
 *
 * ---------------------------------------------------------------------------
 * ZONE 2 - THE BELT. Is this still moving, and if not, why not?
 * ---------------------------------------------------------------------------
 *
 * The liveness primitive already exists and is the whole point of this zone.
 * `sessionLife` returns not just alive or dead but ITS OWN EVIDENCE - `where`
 * and `at` - and this zone shows both, every time, because the four sources are
 * not equally good. A transcript is a session writing its own turns. A worktree
 * FOLDER's mtime only moves when a file is added or removed at the top level,
 * which is almost never while work is happening; it is barely evidence at all.
 * A verdict resting on it is reported as resting on it.
 *
 *   MOVING     alive, with the evidence named.
 *   DELIVERED  the session is gone and the item was closed. Silent - the
 *              closure already says it, and saying it twice is the board
 *              congratulating itself for one piece of work.
 *   QUIET      gone quiet, and something here says do not call that dead.
 *   ADRIFT     gone, long past the horizon, nothing unfinished in the last
 *              turn, and the item is still open. Reported, never returned.
 *   UNSEEN     no evidence on disk at all. Not dead. Unobserved.
 *
 * QUIET IS THE ONE THAT WAS MISSING, and it is why this zone had to exist here
 * rather than in exit-worker. `exit-worker-needs-a-quiet-outcome`: idle and dead
 * are identical on disk, a session waiting for a reply writes nothing, and
 * thirty minutes of quiet therefore meant ABANDONED and threw the work back to
 * incoming. That finding also says why the fix does not belong downstream - "do
 * not build a heuristic in exit-worker, it can only measure" - so the measuring
 * stays there and the reading stays here.
 *
 * WHAT THE READING ACTUALLY IS, stated narrowly so nobody has to trust the word
 * "judgement". Three reasons produce QUIET, and each is a fact rather than a
 * feeling:
 *
 *   a. THE LAST TURN ASKED SOMETHING. The final assistant turn ends in a
 *      question mark, or in one of a short list of asking forms. A session that
 *      asked and got no answer is not abandoned; it is waiting, and the person
 *      it is waiting for is the one who needs to see this.
 *   b. THE LAST TURN IS A TOOL CALL WITH NO RESULT. Mechanical, and the
 *      strongest of the three: the session stopped inside a tool it never got
 *      back from, which is what an unanswered permission prompt looks like on
 *      disk.
 *   c. THE ONLY LIVENESS EVIDENCE IS WEAK. If the whole case for "dead" is a
 *      folder mtime, then "dead" has not been shown. This one is the reason a
 *      transcript-less background worker cannot be called adrift by silence.
 *
 * A run whose last turn is an API error is neither quiet nor adrift - it is a
 * session that FAILED, which is a third thing, and it is named as one.
 *
 * ---------------------------------------------------------------------------
 * ZONE 3 - THE RAIL. Is each rhythm keeping its own declared promise?
 * ---------------------------------------------------------------------------
 *
 * Every trigger declares `every` and the schedule state records what it is
 * actually running at. THE TWO DISAGREEING IS NORMAL - the adaptive ladder
 * tightens a rhythm to its floor when it faults and lets it climb back a rung at
 * a time - so a divergence is only worth reporting when nothing explains it.
 *
 * The ladder itself lives in the repo's scheduler, which a universal machine
 * cannot import, so this checks the WEAKER, SAFER thing: an interval anywhere
 * between the declared floor and the declared ceiling is explainable, and only
 * one outside that range is reported. That errs quiet on purpose. Reimplementing
 * the exact rungs here would be a second copy of a rule that lives somewhere
 * else, and the first time the ladder changed upstream this would start raising
 * alarms about a scheduler that was working correctly.
 *
 *   ON RHYTHM   fired inside its own interval. Silent.
 *   LATE        overdue against the interval it is ACTUALLY running at, not the
 *               one it declared. A tightened rhythm is late sooner, which is
 *               the point of tightening it.
 *   NEVER RUN   declared, and the state has no run for it. Not "late" - a
 *               rhythm that has never fired and one that fired and stopped are
 *               different faults with different fixes.
 *   FAULTED     it ran and exited non-zero. Visible on the board only as a
 *               tightened interval, which reads like diligence.
 *   DRIFTED     running at an interval its own declaration cannot reach.
 *   EXTERNAL    `drivenBy` something outside this repo. NEVER reported as
 *               overdue for not being fired here, because this repo is not what
 *               fires it - see the note on the primordial tick below.
 *   PHANTOM     drawn on the rail with no declaration behind it.
 *
 * THE PHANTOM CHECK IS DELIBERATELY NOT A LOOKUP OF THE BOARD'S OWN LABEL. The
 * board already flags one cell NOT A TRIGGER, and believing that flag would make
 * this zone a mirror rather than a check. It reads the set of rhythm cells the
 * board actually rendered and subtracts the set of declarations and the set of
 * scheduled triggers; whatever is left is drawn by something that can neither
 * declare it nor fire it. Same verdict, reached from the data. If the board's
 * output is not on disk the check reports NOT CHECKED, never zero.
 *
 * AND A FAILED TICK NOW LEAVES A TRACE. `a-tick-that-could-not-run-leaves-no-
 * trace`: five consecutive pulses failed and nothing the board can see recorded
 * it, because the scheduler logs runs that HAPPENED - a run that could not start
 * is indistinguishable from a quiet stretch. The harness does record them, with
 * reasons, and where it keeps them is written into `routineRuns` below. This is
 * a display gap rather than a data gap, which makes it the cheapest honest fix
 * available, and it is the one thing on this rail that can say WHY the factory
 * went still rather than only THAT it did.
 *
 * ---------------------------------------------------------------------------
 * ZONE 4 - THE DOORS. Can work still get in, and does each door know it?
 * ---------------------------------------------------------------------------
 *
 * Four doors: the three intake doors work arrives through - AUTO, CHAT, SPAWN -
 * and the EXIT door finished work leaves by. Each one is observed through a
 * report or through an evidence directory, and the states are kept apart on
 * purpose because this factory has confused them seven times:
 *
 *   OPEN            observed, recently, and able to pull.
 *   OFF             deliberately not pulling. ONLY AUTO CAN BE OFF. A person
 *                   can always open a chat and an agent can always spawn one, so
 *                   for those two the honest word is never "off".
 *   NEVER OBSERVED  the report has never been written. This is NOT off. A door
 *                   nobody has ever looked at and a door somebody switched off
 *                   are opposite facts about whether anyone is in control.
 *   UNREADABLE      the report exists and will not parse. Not absent either.
 *   STALE           the report exists and is old. We know what it said; we do
 *                   not know what is true now.
 *   UNDRIVEN        the report is fine and nothing on the rail fires it. A door
 *                   that only opens when somebody remembers is not a door.
 *
 * ---------------------------------------------------------------------------
 * ZONE 5 - THE CLOSED PILE. Did the claim actually land?
 * ---------------------------------------------------------------------------
 *
 * A terminal record closes its target only if `subject` EXACTLY EQUALS the
 * target's id, and that is not going to change here. `kind.cjs` says why and it
 * is right: a matcher that NEARLY matches an id would start closing the wrong
 * findings, and a closure applied to the wrong record deletes real work silently
 * - strictly worse than one that failed to apply.
 *
 * So this zone makes the failures VISIBLE AND ACTIONABLE and fuzzy-matches
 * nothing.
 *
 *   LANDED        subject equals a known id. Silent.
 *   SELF-CLOSING  terminal with no subject; it closes itself and nothing else.
 *                 Silent, because that is a legitimate shape and not a miss.
 *   NEAR MISS     the subject CONTAINS a known id without equalling it. This one
 *                 was unmistakably reaching for that record, and the repair is a
 *                 one-line re-file. Named, with the id it appears to mean.
 *   UNRECOVERABLE the subject shares no id with anything on the belt. No honest
 *                 rule recovers these; they need re-filing by hand, and the
 *                 whole value this zone adds is that the list exists and is
 *                 short enough to work through.
 *
 * ---------------------------------------------------------------------------
 * THE LOOP - his six steps, with one insertion that is not optional
 * ---------------------------------------------------------------------------
 *
 * Zone 1's loop. Zones 2 to 5 do not run it: they have no timers, because there
 * is no unmade judgement to time - a rhythm that is late is late now, not late
 * in four hours - and no promotion, because they cannot accept.
 *
 * ---------------------------------------------------------------------------
 * THE LOOP - his six steps, with one insertion that is not optional
 * ---------------------------------------------------------------------------
 *
 * Operator, verbatim: "Incoming watching means to scan prioritize and add a
 * timer for it to create a contract append any metadata pass to the processing,
 * create a contract."
 *
 *   1. SCAN         everything sitting in incoming: deposits awaiting triage,
 *                   and decisions held for him.
 *   1b. RE-VERIFY   -> inserted BEFORE prioritising, on anything old. See below.
 *   2. TIMER        a decision timer per item, from its tier, floored at the
 *                   pulse. Computed before priority because expiry is a
 *                   priority BAND, not a tiebreak.
 *   3. PRIORITISE   computed, never a field.
 *   4. ANNOTATE     what was learned, appended as an annotation, never an edit.
 *   5. CONTRACT     an accepted item becomes a contract - DISARMED, see below.
 *   6. PASS ON      a STANDING ordered ready-list, not a per-tick message.
 *
 * ---------------------------------------------------------------------------
 * 1b. RE-VERIFICATION COMES FIRST, AND IT IS A FALSIFICATION TEST
 * ---------------------------------------------------------------------------
 *
 * A waiting deposit does not merely age, it DECAYS. Proven on this belt: a
 * finding said the machine registry had no live heartbeat and had not been
 * written since May. True when filed; within hours a heartbeat was running and
 * the file was 31KB of live data. Acting on it would have meant fixing what was
 * already fixed. ATTENTION RISES WITH AGE RATHER THAN FALLING - four minutes old
 * needs no checking, four days old cannot be trusted without it.
 *
 * WHAT IT CAN HONESTLY ASK is "has anything changed that would FALSIFY this",
 * not "can I prove this is still true". A machine cannot re-prove a claim about
 * a UI, a policy or a person's intent. It can ask two questions and it asks
 * exactly those two:
 *
 *   A. ARTIFACT AGE. Pull every file path the record names out of its own text
 *      and stat it. A path written AFTER the record was filed means the thing it
 *      describes has moved underneath it. A path unchanged since means the
 *      claim's ground is intact. A path that resolves nowhere is reported as
 *      UNRESOLVED and never as deleted - "I cannot find it" and "it is gone" are
 *      different facts and this file will not merge them.
 *
 *   B. ANSWERED ELSEWHERE. A later record that is terminal, is not merely
 *      noting, and whose subject EQUALS this record's subject string, means
 *      somebody declared the same thing finished after this was filed.
 *
 *      GUARDED, because the guard is the trap. Twelve open records on this belt
 *      share the subject "the watcher programme". A single closer naming that
 *      programme would retire all twelve at once. So B applies ONLY when no
 *      other OPEN record shares the subject; a shared subject is a programme
 *      label, and a programme label cannot carry a closure. The sharing is
 *      itself reported, because it is the convention breach that makes it
 *      dangerous.
 *
 * MEASURED COVERAGE, stated rather than implied: 16 of 53 open records on the
 * Telechurch belt name a file path at all, and 13 have at least one that
 * resolves. So test A can speak about roughly a quarter of them. The rest come
 * back `unverifiable`, and the queue carries `groundChecked: false` so nothing
 * downstream can read "not contradicted" as "verified".
 *
 * WHICH DIRECTION IT ERRS. A generic path - CLAUDE.md, AGENTS.md, package.json -
 * is touched constantly and will report stale ground on a record that merely
 * mentioned it. That is deliberately not filtered out: a false stale-ground only
 * downgrades PROMOTE to COMPLETE and attaches "re-verify before acting", which
 * is the safe direction to be wrong in. The exact path and its timestamp are
 * named in the verdict so a reader can overrule it in one glance.
 *
 * ---------------------------------------------------------------------------
 * FIVE OUTCOMES, NO MORE - IN ZONE 1
 * ---------------------------------------------------------------------------
 *
 * Each later zone has its own small vocabulary, listed above, because each asks
 * a different question. What they share is the shape: exactly one outcome per
 * thing, one of them meaning "fine, and therefore silent", and no outcome that
 * quietly stands for "I could not tell".
 *
 *   HOLD      fresh and correct, timer still running. COMPLETELY SILENT - not
 *             listed, only counted. This is the most common outcome by far and a
 *             watcher that reports every hold is noise. Noise is how a board
 *             stops being read.
 *   COMPLETE  real but underspecified. The watcher names the gap. A finding with
 *             no recommendation cannot be picked up, because there is nothing to
 *             pick up.
 *   PROMOTE   true, specified, owned, and its timer has expired. It becomes a
 *             contract - when armed. See the authority note.
 *   RETIRE    no longer true, or never was work. Always with a reason that
 *             survives being read in six months.
 *   RAISE     reserved to him by law, or a genuine product decision.
 *
 * HOLD IS NOT "NOTHING TO DO" - IT IS "THE TIMER HAS NOT RUN OUT". The timer is
 * on the unmade judgement, not on the work, so a perfectly specified item still
 * waits out its window: that window is the chance for a person to act first.
 * COMPLETE ignores the timer, because completing a specification is preparation
 * rather than judgement and delaying it buys nothing.
 *
 * AN EXPIRED TIMER FORCES A DECISION AND NEVER A PROMOTION. Auto-promotion
 * manufactures work nobody judged - the failure named on this belt as
 * `a-belt-can-die-by-flooding-not-only-by-leaking`. Expiry raises the item into
 * the front band and requires one of the five; it does not choose one.
 *
 * ---------------------------------------------------------------------------
 * AUTHORITY - PROMOTION IS BUILT AND DISARMED
 * ---------------------------------------------------------------------------
 *
 * Accepting something as work is the operator's call and he has been exercising
 * it by hand. Every write this machine could make is implemented and reachable
 * only behind --arm. Without it the live run produces the prioritised queue,
 * with timers, re-verification results and named gaps, and writes NOTHING to the
 * belt. That is pure gain with no transfer of authority.
 *
 * PROMOTION BELONGS TO ZONE 1 ALONE. Zones 2 to 5 write annotations and nothing
 * else, ever, and their annotations are capped per run by
 * --zone-annotate-limit. That cap is a narrowing, not a new power: four zones
 * arriving at once would otherwise put a few dozen records on the belt in a
 * single tick on their first armed pass, which is the failure this belt already
 * has a name for - `a-belt-can-die-by-flooding-not-only-by-leaking`. Held-back
 * annotations are counted and reported, and the most serious go first.
 *
 * --arm-limit N exists for the same reason and is not the same thing as intake's
 * capacity. Intake's capacity governs how many contracts may be WORKED at once.
 * This governs how many acceptances may be WRITTEN in one run, so the belt's
 * open-contract count can be raised deliberately rather than in one jump - a
 * fully-drained queue would accept twenty-odd deposits at a stroke and every
 * domain-load alarm on the board would fire at once, truthfully and uselessly.
 * The list stays fully ordered either way: the limit never reorders anything.
 *
 * ---------------------------------------------------------------------------
 * ARGUMENTS
 * ---------------------------------------------------------------------------
 *
 *   node <factory>/machines/watcher.cjs            judge, write the queue
 *   node <factory>/machines/watcher.cjs --dry      judge, write NOTHING at all
 *   node <factory>/machines/watcher.cjs --json     the whole verdict, machine-readable
 *   node <factory>/machines/watcher.cjs --show-holds   list the silent ones (debugging)
 *   node <factory>/machines/watcher.cjs --arm      also write the acts to the belt
 *   node <factory>/machines/watcher.cjs --arm --arm-limit 3
 *   node <factory>/machines/watcher.cjs --zones 3,5     judge only these zones
 *   node <factory>/machines/watcher.cjs --zone-annotate-limit 8
 *
 * --zones takes zone numbers or ids and is for proving one zone at a time; the
 * ones left out report NOT ASKED, which is a third thing again - not covered,
 * not clean, just not run this round.
 *
 * Exit 0 when it did its job, whatever it found - finding work is not a fault,
 * and a scheduler that reads a busy morning as a failure will nap the watcher.
 * Exit 2 only when it could not run at all: no belt, or a belt it cannot read.
 * A lock held by a live run exits 0, because a skipped tick is normal.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { KIND, beltIndex, triageRecord } = require("./kind.cjs");
const { repoRootOf, sessionLife, tokenize, PROJECTS } = require("./session-life.cjs");
const { discoverTriggers, readScheduleState } = require("./triggers.cjs");

// ---------------------------------------------------------------------------
// THE SUBJECT REPO
// ---------------------------------------------------------------------------
//
// process.cwd(), then lifted out of a worktree. The belt is a REPO-level
// artifact and a worktree carries a git-tracked SNAPSHOT of it, so judging a
// worktree's copy would produce verdicts about a belt that has since moved - and
// would take a lock in a directory no other watcher looks at, which is a lock
// that prevents nothing. `repoRootOf` is the factory's existing answer to "which
// repo am I talking about"; there is no second one here.
//
// Both paths are printed. A machine that silently judged somewhere other than
// where it was invoked would be the exact failure the README warns about.
const CWD = process.cwd();
const ROOT = repoRootOf(CWD);
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const QUEUE = path.join(CTX, "watcher-queue.json");
const LOCK = path.join(CTX, "watcher.lock");

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const DRY = has("--dry");
const JSON_OUT = has("--json");
const SHOW_HOLDS = has("--show-holds");
const ARM = has("--arm");
const numArg = (flag, fallback) => {
  const i = argv.indexOf(flag);
  if (i < 0) return fallback;
  const n = Number(argv[i + 1]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
const ARM_LIMIT = numArg("--arm-limit", Infinity);

// The new zones' whole write budget for one run. Eight rather than three
// because an annotation accepts nothing and changes no count - it is the flood
// that is being capped, not the authority, and there is no authority here to cap.
const ZONE_ANNOTATE_LIMIT = numArg("--zone-annotate-limit", 8);

// --zones 2,4  or  --zones belt,doors. Absent means all of them.
const ZONES_ASKED = (() => {
  const i = argv.indexOf("--zones");
  if (i < 0) return null;
  const raw = String(argv[i + 1] || "").split(/[,\s]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  return raw.length ? new Set(raw) : null;
})();

const MS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 };
const now = Date.now();

// SWALLOW ONLY THE ERROR YOU EXPECT. A bare catch here also catches
// ReferenceError and TypeError, and a programming mistake inside a filesystem
// probe would come back as a plausible verdict instead of a crash. A crash is a
// message; a plausible status is not. See the top of session-life.cjs.
const expectedFsError = (err) =>
  !!err && ["ENOENT", "ENOTDIR", "EACCES", "EPERM", "EBUSY", "EEXIST", "EMFILE", "ELOOP", "ENAMETOOLONG"].includes(err.code);

// ---------------------------------------------------------------------------
// THE ZONES. All five are covered now, and each states what it may and may not
// do - in the declaration, so a reader never infers it from behaviour.
// ---------------------------------------------------------------------------
const ZONES = [
  {
    n: 1,
    id: "incoming",
    covered: true,
    what: "deposits awaiting triage and decisions held for him",
    asks: "what should be judged, in what order, by when",
    can: "re-verify, time, prioritise, annotate, and - behind --arm, up to --arm-limit per run - accept a deposit as a contract or retire it",
    cannot: "accept more than the arm limit in one run, or take a decision reserved to him",
  },
  {
    n: 2,
    id: "belt",
    covered: true,
    what: "work that was dispatched and is supposed to be moving",
    asks: "is this still moving, and if not, why not",
    can: "prove liveness from disk, name which evidence it had, and separate quiet from adrift",
    cannot: "return work to incoming, close it, re-dispatch it, or touch a live session. exit-worker owns the act; this only reads",
  },
  {
    n: 3,
    id: "rail",
    covered: true,
    what: "rhythms: declared cadence against what actually fired, and runs that could not start",
    asks: "is each rhythm keeping its own declared promise",
    can: "compare declaration against schedule state, surface failed scheduled runs with their reasons, and name a rail cell nothing declares",
    cannot: "fire a rhythm, change an interval, edit a declaration, or write to the schedule state",
  },
  {
    n: 4,
    id: "doors",
    covered: true,
    what: "auto, chat and spawn intake, and the exit door work leaves by",
    asks: "can work still get in, and does each door know it",
    can: "report each door's state and say which evidence it rests on, keeping off, never-observed, unreadable and stale apart",
    cannot: "open a door, arm intake, or dispatch anything",
  },
  {
    n: 5,
    id: "closed-pile",
    covered: true,
    what: "claimed-done work that closed nothing",
    asks: "did the claim actually land",
    can: "list every terminal record whose subject matched no id, and name the near misses",
    cannot: "fuzzy-match a subject to an id, re-file a record, or close anything on its behalf",
  },
];
const zoneAsked = (id) => {
  if (!ZONES_ASKED) return true;
  const z = ZONES.find((x) => x.id === id);
  return ZONES_ASKED.has(id) || (z ? ZONES_ASKED.has(String(z.n)) : false);
};

// ---------------------------------------------------------------------------
// WHAT THE LATER ZONES HAD TO LEARN TO READ
// ---------------------------------------------------------------------------

/**
 * "30m" -> 1800000. NULL when it is not a duration, never a default.
 *
 * A declaration with an unparseable `every` is a declaration this machine cannot
 * reason about, and inventing an hour for it would put a plausible number in
 * front of somebody in exactly the place they came to check a number.
 */
const DURATION_RE = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)$/i;
function parseEvery(v) {
  const m = DURATION_RE.exec(String(v == null ? "" : v).trim());
  if (!m) return null;
  const n = Number(m[1]);
  const u = m[2].toLowerCase();
  return u === "ms" ? n : n * MS[u];
}

/** The last `bytes` of a file, as text. Cheap enough to do to a hundred transcripts. */
function tailOf(file, bytes) {
  let st;
  try {
    st = fs.statSync(file);
  } catch (err) {
    if (!expectedFsError(err)) throw err;
    return null;
  }
  const len = Math.min(bytes, st.size);
  const buf = Buffer.alloc(len);
  let fd;
  try {
    fd = fs.openSync(file, "r");
  } catch (err) {
    if (!expectedFsError(err)) throw err;
    return null;
  }
  try {
    fs.readSync(fd, buf, 0, len, st.size - len);
  } finally {
    fs.closeSync(fd);
  }
  // The first line of a mid-file read is almost always a fragment. Dropping it
  // when the read was truncated is the difference between a parse error every
  // single time and none.
  const text = buf.toString("utf8");
  return len < st.size ? text.slice(text.indexOf("\n") + 1) : text;
}

/** JSONL entries out of a tail, skipping the ones that do not parse. */
function entriesFromTail(text) {
  const out = [];
  for (const line of String(text || "").split("\n")) {
    const t = line.trim();
    if (!t.startsWith("{")) continue;
    try {
      out.push(JSON.parse(t));
    } catch {
      // A truncated or half-written line in a transcript being appended to right
      // now is expected, and it is not this machine's to repair.
    }
  }
  return out;
}

/**
 * Where a session wrote its turns.
 *
 * THIS IS A SECOND COPY OF A RULE THAT LIVES IN session-life.cjs, and it is here
 * only because that file was outside this change's write boundary. It uses that
 * file's own exported primitives - PROJECTS and tokenize - so the parts most
 * likely to drift are still shared, but the directory-naming rule itself is now
 * written twice, which is the thing this factory has been burned by eight times.
 * LIFT IT INTO session-life.cjs AS `transcriptsFor` at the first opportunity;
 * until then, a change to how a worktree session's project directory is named
 * has to be made in both places.
 */
function transcriptsFor(id, root) {
  if (!id) return [];
  const token = tokenize(repoRootOf(root));
  const out = [];
  let dirs;
  try {
    dirs = fs.readdirSync(PROJECTS);
  } catch (err) {
    if (!expectedFsError(err)) throw err;
    return [];
  }
  for (const d of dirs) {
    const own = d === `${token}--claude-worktrees-${id}`;
    const base = d === token;
    if (!own && !base) continue;
    const dir = path.join(PROJECTS, d);
    let files;
    try {
      files = fs.readdirSync(dir);
    } catch (err) {
      if (!expectedFsError(err)) throw err;
      continue;
    }
    for (const f of files) {
      if (!f.endsWith(".jsonl")) continue;
      if (!own && !f.startsWith(String(id).slice(0, 8))) continue;
      try {
        out.push({ path: path.join(dir, f), at: fs.statSync(path.join(dir, f)).mtimeMs, own });
      } catch (err) {
        if (!expectedFsError(err)) throw err;
      }
    }
  }
  return out.sort((a, b) => b.at - a.at);
}

// The short list of asking forms. Kept short on purpose: every phrase added here
// is a way for a genuinely abandoned session to be excused as waiting, and the
// cost of that mistake is work sitting still while the board says somebody is
// on it. A question mark carries most of the weight; these are the ones that
// ask without one.
const ASK_RE = /\b(shall i|should i|would you like|do you want|which (?:one|of these|would)|let me know|please confirm|awaiting (?:your )?(?:reply|confirmation|approval)|may i proceed|waiting (?:for|on) (?:you|your))\b/i;

/**
 * What the last turn of a transcript was.
 *
 * @returns {null | {kind:"api-error"|"awaiting-tool"|"question"|"statement", at:number|null, text:string, why:string}}
 *          null when there is no transcript to read - which is NOT "it said
 *          nothing". A session with no transcript is unobserved, and the caller
 *          must not turn that into a verdict about what it was doing.
 */
function lastTurnOf(file) {
  const text = tailOf(file, 192 * 1024);
  if (text === null) return null;
  const entries = entriesFromTail(text).filter((e) => e && (e.type === "assistant" || e.type === "user"));
  if (!entries.length) return null;

  const flatten = (c) => {
    if (typeof c === "string") return c;
    if (!Array.isArray(c)) return "";
    return c.map((b) => (b && typeof b.text === "string" ? b.text : "")).join("\n");
  };

  const last = entries[entries.length - 1];
  const at = Date.parse(last.timestamp || "") || null;

  // A run that ended on an API error FAILED. Calling that quiet would excuse a
  // starved session as a patient one, and calling it adrift would blame the
  // session for something the account did.
  const errored = entries.filter((e) => e.isApiErrorMessage).pop();
  if (errored && errored === last) {
    return { kind: "api-error", at, text: flatten(errored.message && errored.message.content).slice(0, 300), why: "the last turn is an API error, so this run failed rather than stopped" };
  }

  // A tool call with nothing coming back is the on-disk shape of an unanswered
  // permission prompt. Mechanical, and the strongest of the three quiet signals.
  const blocks = last.message && Array.isArray(last.message.content) ? last.message.content : [];
  const calls = blocks.filter((b) => b && b.type === "tool_use").map((b) => b.id);
  if (last.type === "assistant" && calls.length) {
    return { kind: "awaiting-tool", at, text: String(blocks.map((b) => b.name).filter(Boolean).join(", ")).slice(0, 120), why: "the last turn is a tool call with no result after it - the session stopped inside a tool it never came back from" };
  }

  const said = flatten(last.message && last.message.content).trim();
  const tailText = said.slice(-400);
  if (last.type === "assistant" && (/\?\s*$/.test(said) || ASK_RE.test(tailText))) {
    return { kind: "question", at, text: tailText.slice(-200), why: "the last turn asked something and nothing answered it" };
  }
  return { kind: "statement", at, text: tailText.slice(-200), why: "the last turn neither asked anything nor stopped inside a tool" };
}

// ---------------------------------------------------------------------------
// WHERE THE HARNESS KEEPS A RUN THAT COULD NOT RUN
// ---------------------------------------------------------------------------
//
// `a-tick-that-could-not-run-leaves-no-trace` said the failures are recorded
// with their reasons and that surfacing them is a display gap. It is, and this
// is where they are. Found by probing rather than assumed, which the finding
// also asked for:
//
//   1. The desktop app writes ONE FILE PER SCHEDULED RUN under
//      <app data>/Claude/claude-code-sessions/<a>/<b>/local_<uuid>.json. Each
//      carries `scheduledTaskId`, `createdAt`, `lastActivityAt`, the `cwd` it
//      ran in, and - the load-bearing field - `cliSessionId`.
//   2. `cliSessionId` names the run's transcript, at
//      ~/.claude/projects/<tokenised cwd>/<cliSessionId>.jsonl. A run that could
//      not start ends its transcript on an assistant turn with
//      `isApiErrorMessage: true`, and the reason is the message text.
//
// So the run file says a run was ATTEMPTED and the transcript says whether it
// GOT ANYWHERE. Neither alone is enough: the scheduler's own state records only
// runs that happened, which is exactly the hole.
//
// NOT OBSERVABLE IS NOT ZERO. On a host with no desktop app there is no store,
// and this returns `observable: false` rather than a clean sheet. That
// distinction is the whole reason the finding exists.
const DESKTOP_SESSIONS = (() => {
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const candidates = [
    process.env.APPDATA ? path.join(process.env.APPDATA, "Claude", "claude-code-sessions") : null,
    home ? path.join(home, "Library", "Application Support", "Claude", "claude-code-sessions") : null,
    home ? path.join(home, ".config", "Claude", "claude-code-sessions") : null,
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isDirectory()) return c;
    } catch (err) {
      if (!expectedFsError(err)) throw err;
    }
  }
  return null;
})();

// Bounded, and the bound is reported when it bites. A scan that gave up and a
// scan that found nothing are different facts - see the same rule in
// session-life.cjs, where it is load-bearing for exactly this reason.
const RUN_SCAN_MAX_FILES = 4000;
const RUN_INSPECT_MAX = 250;

function runFilesUnder(dir) {
  const out = [];
  let truncated = false;
  const queue = [{ dir, depth: 0 }];
  while (queue.length) {
    const { dir: cur, depth } = queue.shift();
    let entries;
    try {
      entries = fs.readdirSync(cur, { withFileTypes: true });
    } catch (err) {
      if (!expectedFsError(err)) throw err;
      continue;
    }
    for (const e of entries) {
      if (e.isSymbolicLink()) continue;
      const full = path.join(cur, e.name);
      if (e.isDirectory()) {
        if (depth < 3) queue.push({ dir: full, depth: depth + 1 });
        else truncated = true;
        continue;
      }
      if (!e.isFile() || !/^local_.*\.json$/.test(e.name)) continue;
      if (out.length >= RUN_SCAN_MAX_FILES) {
        truncated = true;
        return { files: out, truncated };
      }
      out.push(full);
    }
  }
  return { files: out, truncated };
}

/**
 * Every attempt the harness made at one scheduled routine inside a window, and
 * which of them could not start.
 *
 * @param {string} taskId  the routine's id, e.g. "living-factory-pulse"
 * @param {number} sinceMs epoch millis; runs older than this are not inspected
 */
function routineRuns(taskId, sinceMs) {
  if (!DESKTOP_SESSIONS) {
    return { observable: false, why: "no desktop session store on this host, so an attempted run leaves nothing this machine can read. This is NOT a clean run history.", where: null };
  }
  const { files, truncated } = runFilesUnder(DESKTOP_SESSIONS);
  const attempts = [];
  let unreadableRunFiles = 0;
  for (const f of files) {
    let j;
    try {
      j = JSON.parse(fs.readFileSync(f, "utf8").replace(/^﻿/, ""));
    } catch (err) {
      if (err instanceof SyntaxError) {
        unreadableRunFiles++;
        continue;
      }
      if (!expectedFsError(err)) throw err;
      continue;
    }
    if (String(j.scheduledTaskId || "") !== String(taskId)) continue;
    const at = Number(j.createdAt) || 0;
    if (!at || at < sinceMs) continue;
    attempts.push({ at, until: Number(j.lastActivityAt) || null, cwd: j.cwd || null, cli: j.cliSessionId || null });
  }
  attempts.sort((a, b) => a.at - b.at);

  const inspected = attempts.slice(-RUN_INSPECT_MAX);
  const failed = [];
  let unreadTranscripts = 0;
  for (const a of inspected) {
    if (!a.cli || !a.cwd) {
      unreadTranscripts++;
      continue;
    }
    const t = path.join(PROJECTS, tokenize(a.cwd), `${a.cli}.jsonl`);
    const turn = lastTurnOf(t);
    if (turn === null) {
      // A run whose transcript is not on disk is a run this cannot judge. It is
      // NOT counted as a success, and it is NOT counted as a failure.
      unreadTranscripts++;
      continue;
    }
    if (turn.kind === "api-error") failed.push({ at: new Date(a.at).toISOString(), atMs: a.at, reason: turn.text.replace(/\s+/g, " ").trim() });
  }

  // Consecutive matters more than total: one starved tick is weather, a run of
  // them is the factory going still with a reason nobody can see.
  let longestRun = 0;
  let cur = 0;
  const failedAt = new Set(failed.map((f) => f.atMs));
  for (const a of inspected) {
    if (failedAt.has(a.at)) cur++;
    else cur = 0;
    if (cur > longestRun) longestRun = cur;
  }
  let trailing = 0;
  for (let i = inspected.length - 1; i >= 0 && failedAt.has(inspected[i].at); i--) trailing++;

  return {
    observable: true,
    where: DESKTOP_SESSIONS.replace(/\\/g, "/"),
    attempts: attempts.length,
    inspected: inspected.length,
    failed: failed.length,
    longestConsecutiveFailures: longestRun,
    failingRightNow: trailing,
    firstFailure: failed.length ? failed[0].at : null,
    lastFailure: failed.length ? failed[failed.length - 1].at : null,
    reasons: [...new Set(failed.map((f) => f.reason))].slice(0, 4),
    // Named rather than swallowed, so a number computed from half the evidence
    // never renders as a number computed from all of it.
    unreadableRunFiles,
    runsWithNoReadableTranscript: unreadTranscripts,
    scanTruncated: truncated,
  };
}

/**
 * A worker's own report, with absent, unreadable and stale kept apart.
 *
 * Three different facts arrive here as one missing number if this is written
 * carelessly, and the doors zone exists mostly to keep them apart.
 */
function readReport(file, staleAfterMs) {
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") return { state: "absent", why: "has never been written" };
    if (!expectedFsError(err)) throw err;
    return { state: "unreadable", why: `could not be read (${err.code})` };
  }
  let j;
  try {
    j = JSON.parse(raw.replace(/^﻿/, ""));
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    return { state: "unreadable", why: "exists and will not parse" };
  }
  const at = Date.parse(j.checkedAt || j.builtAt || j.producedAt || "") || null;
  if (at === null) return { state: "undated", why: "exists and carries no timestamp, so nothing here can say whether it is current", json: j, at: null };
  if (now - at > staleAfterMs) return { state: "stale", why: `last written ${humanMs(now - at)} ago`, json: j, at };
  return { state: "fresh", why: `written ${humanMs(now - at)} ago`, json: j, at };
}

// ---------------------------------------------------------------------------
// THE LOCK - TAKEN BEFORE ANYTHING ELSE
// ---------------------------------------------------------------------------
//
// `judging-watcher-needs-a-lock`: the mechanical half of the factory is already
// safe because the scheduler holds a singleton lock, and the judging half has
// none. A routine firing every fifteen minutes can overlap a previous run that
// is still thinking, and TWO VERDICTS ON ONE ITEM, APPLIED IN AN ORDER NOBODY
// CHOSE, IS A CORRUPTION RATHER THAN A DELAY.
//
// TIMESTAMPED, NEVER A BOOLEAN. A boolean lock is held forever by whoever
// crashed while holding it, and the failure is silent: the watcher simply stops
// judging and every number downstream goes on looking healthy. A timestamp lets
// a crashed holder EXPIRE.
//
// TAKEN WITH EXCLUSIVE CREATE (`wx`), which is atomic on NTFS and on POSIX, so
// two watchers starting in the same millisecond cannot both believe they won.
// A read-then-write lock has a window between the read and the write, and the
// window is exactly as wide as the race it was built to close.
//
// STALE AFTER 15 MINUTES. The scheduler's own locks expire after two hours,
// which is right for a station that shells out to a build. A judging pass is
// arithmetic over a file and finishes in well under a second, so a lock older
// than fifteen minutes is a crash rather than a slow run - and blocking
// judgement for two hours on a dead holder is worse than the overlap the lock
// exists to prevent.
//
// RECOVERY IS AUTOMATIC AND IT IS ANNOUNCED. Clearing a stale lock prints who
// held it and since when, because a holder that keeps crashing looks identical
// to a healthy factory once the lock is silently reclaimed.
const LOCK_STALE_AFTER = 15 * MS.m;
const LOCK_TOKEN = `${os.hostname()}:${process.pid}:${now.toString(36)}`;

function readLock() {
  try {
    // THE BOM STRIP IS NOT DECORATION. Every belt reader in this factory strips
    // it and this one did not, and the omission was caught by its own lock test:
    // a lock file written from PowerShell (`Out-File -Encoding utf8` emits a BOM
    // in 5.1) failed to parse, was read as "unreadable", and was therefore
    // cleared as stale - so a LIVE holder was evicted and both watchers ran.
    // The lock's whole purpose, defeated by a byte order mark.
    // Written as the ESCAPE, not as a literal U+FEFF. The other belt readers in
    // this factory carry the literal character, which is invisible in every
    // editor and would become mojibake the first time anything round-trips the
    // file through an ANSI codepage - and the strip would then silently stop
    // working, which is precisely the failure being guarded against here.
    return JSON.parse(fs.readFileSync(LOCK, "utf8").replace(/^\uFEFF/, ""));
  } catch (err) {
    if (err && err.code === "ENOENT") return null; // absent
    if (!expectedFsError(err) && !(err instanceof SyntaxError)) throw err;
    // UNREADABLE IS NOT ABSENT, and it is not a live holder either. A lock file
    // that will not parse is a lock nobody can reason about, so the staleness
    // rule clears it rather than wedging the watcher shut on a corrupt byte -
    // but it is RETURNED AS A FACT rather than as null, so clearing it gets
    // announced. A lock that keeps arriving corrupt is a bug somewhere, and
    // silently reclaiming it every run is how that bug never gets found.
    return { unreadable: true, host: "unknown", pid: null, takenAt: null, reason: err instanceof SyntaxError ? "not valid JSON" : err.code };
  }
}

function writeLockExclusive() {
  const body = JSON.stringify({ token: LOCK_TOKEN, host: os.hostname(), pid: process.pid, takenAt: new Date(now).toISOString(), takenAtMs: now, expiresAt: new Date(now + LOCK_STALE_AFTER).toISOString() }, null, 2);
  let fd;
  try {
    fd = fs.openSync(LOCK, "wx");
  } catch (err) {
    if (err && err.code === "EEXIST") return false;
    if (!expectedFsError(err)) throw err;
    throw err;
  }
  try {
    fs.writeFileSync(fd, body + "\n", "utf8");
  } finally {
    fs.closeSync(fd);
  }
  return true;
}

/** @returns {{ok:true, cleared:object|null} | {ok:false, held:object}} */
function takeLock() {
  fs.mkdirSync(CTX, { recursive: true });
  if (writeLockExclusive()) return { ok: true, cleared: null };

  const held = readLock();
  const takenAt = held && Number(held.takenAtMs || Date.parse(held.takenAt || "")) || 0;
  if (takenAt && now - takenAt < LOCK_STALE_AFTER) return { ok: false, held };

  // Stale, or unreadable. Remove and try once. Exactly once: a loop here would
  // let two watchers trade the lock back and forth instead of one of them
  // standing down, which is the deadlock this whole mechanism is meant to avoid.
  try {
    fs.unlinkSync(LOCK);
  } catch (err) {
    if (!expectedFsError(err)) throw err;
  }
  if (writeLockExclusive()) return { ok: true, cleared: held };
  return { ok: false, held: readLock() || held };
}

function releaseLock() {
  // ONLY IF WE STILL OWN IT. If our own lock went stale and another watcher took
  // over, deleting the file here would strip a live holder of its protection -
  // and it would happen precisely in the slow run where the protection matters.
  const held = readLock();
  if (!held || held.token !== LOCK_TOKEN) return false;
  try {
    fs.unlinkSync(LOCK);
    return true;
  } catch (err) {
    if (!expectedFsError(err)) throw err;
    return false;
  }
}

// ---------------------------------------------------------------------------

if (!fs.existsSync(BELT)) {
  console.error(`watcher: no belt in ${ROOT}`);
  process.exit(2);
}

// The lock is taken BEFORE the belt is read, not after. Reading first and
// locking second means the loser of a race has already formed its picture of the
// world, and a verdict computed from a snapshot taken before another watcher's
// writes is exactly the corruption this guards.
//
// --dry takes the lock too. A dry run reads the same belt a live run does, and a
// dry run overlapping a live one would print a verdict that disagreed with what
// was actually written, which is a worse kind of wrong than a missed tick.
const lock = takeLock();
if (!lock.ok) {
  const h = lock.held || {};
  const mins = h.takenAtMs || Date.parse(h.takenAt || "") ? Math.round((now - (h.takenAtMs || Date.parse(h.takenAt))) / MS.m) : null;
  const line = `watcher: another judging run holds the lock${h.host ? ` (${h.host} pid ${h.pid})` : ""}${mins === null ? "" : `, taken ${mins}m ago`} - standing down`;
  if (JSON_OUT) console.log(JSON.stringify({ ran: false, reason: "locked", held: h }, null, 2));
  else console.log(line);
  process.exit(0);
}

let exitCode = 0;
try {
  main(lock);
} finally {
  releaseLock();
}
process.exit(exitCode);

// ===========================================================================

function main(lockState) {
  let records;
  try {
    records = fs
      .readFileSync(BELT, "utf8")
      .replace(/^\uFEFF/, "") // the escape, not the literal - see readLock
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          // A malformed LINE is a known belt hazard and is not this machine's to
          // repair; it is counted below so a growing count is visible.
          return null;
        }
      });
  } catch (err) {
    console.error(`watcher: cannot read the belt - ${err.message}`);
    exitCode = 2;
    return;
  }
  const unreadableLines = records.filter((r) => r === null).length;
  records = records.filter(Boolean);

  const IX = beltIndex(records);

  // The same numbering the board draws, so a handle he says out loud resolves
  // here. One implementation, in kind.cjs - see the note there about the copies.
  const { handleOf } = require("./kind.cjs").handleIndex(records);
  const H = (r) => handleOf.get(String(r.id)) || "?";

  const text = (r) => [r.claim, r.evidence, r.recommend, r.subject].filter(Boolean).join("\n");
  const runAt = (r) => Date.parse(r.run || "") || 0;

  // Advice can be attached by a LATER record, the same later-wins mechanism the
  // board and both workers use. Reading only r.recommend would report a missing
  // recommendation on exactly the records somebody already came back and advised.
  const adviceFor = new Map();
  for (const r of records) if (r.subject && r.recommend) adviceFor.set(String(r.subject), r.recommend);
  const adviceOf = (r) => adviceFor.get(String(r.id)) || r.recommend || null;

  // ---- 1. SCAN --------------------------------------------------------------
  //
  // Incoming is what has not been judged: deposits awaiting triage, plus the
  // decisions held for him. Open CONTRACTS are already accepted work and belong
  // to zone 2, which this machine does not cover.
  const incoming = records.filter((r) => IX.isAwaitingTriage(r) || IX.isOpenDecision(r));

  // Everything still open, for the "is anything blocked behind it" input and for
  // the shared-subject guard. Bookkeeping is excluded on purpose: an annotation
  // ABOUT a record is not a thing waiting ON it, and counting `advise-x` and
  // `lesson-x` as blockers would give every annotated record a free promotion.
  const openAll = records.filter((r) => IX.isAwaitingTriage(r) || IX.isOpenContract(r) || IX.isOpenDecision(r));

  const openSubjectCount = new Map();
  for (const r of openAll) {
    const s = String(r.subject || "");
    if (s) openSubjectCount.set(s, (openSubjectCount.get(s) || 0) + 1);
  }

  // ---- 1b. RE-VERIFY --------------------------------------------------------

  const RECHECK_AFTER = 4 * MS.h;
  const ANCIENT = 7 * MS.d;

  // Only real, checkable extensions. A bare word with a dot in it is not a path,
  // and an over-eager matcher would stat nonsense and report it unresolved,
  // which reads as a missing file.
  const PATH_RE =
    /(?:[A-Za-z]:[\\/]|\.{1,2}[\\/])?(?:[\w.@~-]+[\\/])*[\w.@~-]+\.(?:cjs|mjs|jsx?|tsx?|jsonc?|jsonl|md|ps1|html|s?css|ya?ml|sql|txt|sh|toml)\b/g;

  const FACTORY = path.resolve(__dirname, "..");
  const candidatesFor = (p) => {
    const n = p.replace(/\\/g, "/");
    if (/^[A-Za-z]:/.test(n)) return [n];
    return [path.join(ROOT, n), path.join(ROOT, "tools/factory", n), path.join(FACTORY, n), path.join(__dirname, n)];
  };

  function reverify(r) {
    const filedAt = runAt(r);
    const ageMs = filedAt ? now - filedAt : null;

    // A record with no readable timestamp cannot be aged, and guessing one would
    // be a default for a missing measurement. It is checked as if it were old,
    // which is the cautious direction.
    if (ageMs !== null && ageMs < RECHECK_AFTER) {
      return { required: false, verdict: "not-required", groundChecked: false, ageHours: round1(ageMs / MS.h), why: "younger than the re-check threshold; nothing decays in four hours that this could observe" };
    }

    const out = {
      required: true,
      ageHours: ageMs === null ? null : round1(ageMs / MS.h),
      groundChecked: false,
      paths: { named: [], unchanged: [], changedSince: [], unresolved: [] },
      subjectSharedWith: 0,
      why: "",
    };

    // ---- B. ANSWERED ELSEWHERE (checked first: it is the strongest signal) ---
    const subj = String(r.subject || "");
    const shared = subj ? (openSubjectCount.get(subj) || 0) : 0;
    out.subjectSharedWith = Math.max(0, shared - 1);
    if (subj && shared <= 1) {
      const answer = records.find(
        (o) =>
          String(o.id) !== String(r.id) &&
          String(o.subject || "") === subj &&
          IX.selfTerminal(o) &&
          !IX.isNoting(o) &&
          runAt(o) > filedAt,
      );
      if (answer) {
        out.verdict = "answered-elsewhere";
        out.groundChecked = true;
        out.answeredBy = String(answer.id);
        out.why = `"${answer.id}" declared the same subject finished at ${answer.run}, after this was filed at ${r.run}.`;
        return out;
      }
    }

    // ---- A. ARTIFACT AGE ----------------------------------------------------
    const named = [...new Set(text(r).match(PATH_RE) || [])];
    out.paths.named = named;
    for (const p of named) {
      const hit = candidatesFor(p).find((c) => {
        try {
          return fs.statSync(c).isFile();
        } catch (err) {
          if (!expectedFsError(err)) throw err;
          return false;
        }
      });
      if (!hit) {
        // NOT "deleted". A path this resolver could not place is a path this
        // resolver could not place - the record may name a file in a repo this
        // machine has never been pointed at. Merging the two would let a
        // resolver's blind spot masquerade as a finding.
        out.paths.unresolved.push(p);
        continue;
      }
      const mt = fs.statSync(hit).mtimeMs;
      const entry = { path: p, resolved: hit.replace(/\\/g, "/"), mtime: new Date(mt).toISOString() };
      if (filedAt && mt > filedAt) out.paths.changedSince.push(entry);
      else out.paths.unchanged.push(entry);
    }

    if (out.paths.changedSince.length) {
      out.verdict = "stale-ground";
      out.groundChecked = true;
      const w = out.paths.changedSince[0];
      out.why = `${out.paths.changedSince.length} file(s) this names were written after it was filed - ${w.path} at ${w.mtime}, filed ${r.run}. The state it describes may already have moved.`;
      return out;
    }
    if (out.paths.unchanged.length) {
      out.verdict = "confirmed-ground";
      out.groundChecked = true;
      out.why = `${out.paths.unchanged.length} file(s) this names are unchanged since it was filed, and nothing on the belt answers its subject. Nothing contradicts it.`;
      return out;
    }

    out.verdict = "unverifiable";
    out.groundChecked = false;
    out.why = named.length
      ? `It names ${named.length} path(s) and none of them resolve from this repo, so its ground cannot be checked here: ${out.paths.unresolved.join(", ")}.`
      : `It names no file and no later record answers its subject, so there is nothing here a machine can re-check. Not contradicted is not the same as verified.`;
    if (ageMs !== null && ageMs > ANCIENT) out.ancient = true;
    return out;
  }

  // ---- 2. TIMER -------------------------------------------------------------
  //
  // The DECISION timer: how long the unmade judgement may wait, not how long the
  // work may take. Length comes from tier, because tier is the one severity
  // signal every record on this belt already carries - lower is more urgent, and
  // the manager files every alarm it raises at tier 1.
  //
  // FLOORED AT THE PULSE. The pulse is the primordial tick, every five minutes,
  // and it is the finest grain the factory can observe. A deadline shorter than
  // the pulse is a deadline nothing can enforce, so it is not offered.
  //
  // A MISSING TIER PRODUCES NO TIMER, NOT A DEFAULT ONE. A default for a missing
  // measurement is a fabrication. An item that cannot be scheduled is forced to
  // the front instead: unschedulable and unjudged is how something waits forever
  // while looking fine.
  const PULSE = 5 * MS.m;
  const TIMER_BY_TIER = { 0: 4 * MS.h, 1: 4 * MS.h, 2: 12 * MS.h, 3: 24 * MS.h, 4: 48 * MS.h, 5: 48 * MS.h, 6: 72 * MS.h, 7: 72 * MS.h };

  function timerFor(r) {
    const filedAt = runAt(r);
    const tier = Number.isFinite(Number(r.tier)) ? Number(r.tier) : null;
    const len = tier === null ? null : Math.max(PULSE, TIMER_BY_TIER[tier] ?? 72 * MS.h);
    if (len === null || !filedAt) {
      return {
        length: null,
        dueAt: null,
        expired: true,
        forced: true,
        why: tier === null ? "no tier declared, so no timer can be computed - it is forced to judgement rather than given an invented deadline" : "no readable filing time, so no deadline can be computed - forced to judgement",
      };
    }
    const dueAt = filedAt + len;
    return {
      length: humanMs(len),
      lengthMs: len,
      dueAt: new Date(dueAt).toISOString(),
      expired: now >= dueAt,
      overdueBy: now >= dueAt ? humanMs(now - dueAt) : null,
      remaining: now < dueAt ? humanMs(dueAt - now) : null,
      forced: false,
      why: `tier ${tier} decision timer of ${humanMs(len)} from ${r.run}`,
    };
  }

  // ---- outcome --------------------------------------------------------------
  //
  // RAISE, narrowly. An item is his when the belt already says so, or when the
  // ACTION somebody proposed is on the never-autonomous list. Matched against the
  // RECOMMENDATION only, never the evidence - evidence quotes traps and prior
  // incidents constantly, and matching there would send half the belt to the one
  // column whose cost is his attention.
  const HIS_BY_ACTION = [
    [/\b(schema|database)?\s*migrations?\b|--with-migrations/i, "a migration, which does not revert"],
    [/\bdelete\b|\bdeletion\b|\bdrop (?:the )?(?:table|database|bucket|project)\b|\bdestroy\b/i, "a deletion"],
    [/\bcredential|\bsecret\b|\bapi key\b|\brotate (?:the )?(?:key|token)\b/i, "a credential change"],
    [/\brefund\b|\bcharge\b|\bpayment\b|\bpurchase\b|\bbuy\b|\bmoves? money\b/i, "money"],
    [/\bbulk (?:email|sms|send)|\bsend (?:sms|email)s? (?:to|at scale)\b|\bmass (?:email|sms)\b/i, "an outbound send at scale"],
  ];
  // THERE IS NO "THE PROSE SAYS IT IS HIS" PATTERN, AND THERE WAS ONE FOR ABOUT
  // ten minutes. It matched `\breserved to him\b`, and the first thing it caught
  // was `incoming-watch-is-a-six-step-loop` - a record whose recommendation
  // DEFINES the five outcomes and therefore contains the words "RAISE (reserved
  // to him by law)". A record describing the vocabulary is not a record asking
  // for a decision, and prose cannot tell them apart.
  //
  // Nothing is lost. The belt already says "his" in a way that cannot be
  // misread: kind DECISION, which kind.cjs infers from `triggers: operator` or
  // an `operatorDecision` field. That check is above and it is exact. The only
  // job left for the patterns is the case the belt CANNOT express - a deposit
  // whose proposed ACTION is on the never-autonomous list - and every remaining
  // pattern names a physical act rather than a claim about authority.
  function needsHim(r) {
    const advice = adviceOf(r);
    if (!advice) return null;
    for (const [re, why] of HIS_BY_ACTION) {
      const m = String(advice).match(re);
      if (m) return { why, phrase: m[0] };
    }
    return null;
  }

  function judge(r) {
    const kind = IX.kindOf(r);
    const rv = reverify(r);
    const timer = timerFor(r);
    const advice = adviceOf(r);

    // GAPS BLOCK ACCEPTANCE. CAVEATS DO NOT. Keeping them apart is the whole
    // difference between "this cannot be picked up" and "read this before you
    // trust the verdict", and merging them was a real bug in the first run: the
    // shared-subject fact was filed as a gap, which turned all twelve records of
    // the watcher programme into COMPLETE at a stroke on a defect that has
    // nothing to do with whether they are specified.
    const gaps = [];
    const caveats = [];

    if (!advice) gaps.push("no recommendation - there is nothing to pick up");
    if (!r.dimension) gaps.push("no dimension - nothing can own it");
    if (!/^contract:/.test(String(r.triggers || "")) && String(r.triggers || "") !== "operator") gaps.push(`addressed to "${r.triggers || "nobody"}", which names no carrier`);
    if (rv.verdict === "stale-ground") gaps.push("evidence overtaken - re-verify before acting");
    if (rv.ancient) gaps.push("old and unverifiable - nothing here can re-check it");

    // A shared subject does NOT stop a record being accepted or closed - closure
    // matches on `id`, not on `subject`. What it stops is re-verification path B,
    // which asks whether a later record answered the same SUBJECT. So it is a
    // limit on how well this verdict could be checked, and it is reported as one.
    if (rv.subjectSharedWith > 0)
      caveats.push(
        `subject "${r.subject}" is shared with ${rv.subjectSharedWith} other open record(s), so it is a programme label rather than a specific thing. No closer can resolve it by name, and this verdict could not use the answered-elsewhere check.`,
      );
    if (rv.required && !rv.groundChecked) caveats.push("nothing here could re-check its ground; not contradicted is not the same as verified");

    // 1. His, by law or by the action proposed.
    if (kind === KIND.DECISION) return { outcome: "RAISE", rv, timer, gaps, caveats, advice, why: "already held for him on the belt - the watcher orders it, it does not touch it" };
    const his = needsHim(r);
    if (his) return { outcome: "RAISE", rv, timer, gaps, caveats, advice, why: `the recommended action is ${his.why} ("${his.phrase}"), which is never autonomous at any maturity` };

    // 2. Provably no longer live.
    if (rv.verdict === "answered-elsewhere") return { outcome: "RETIRE", rv, timer, gaps, caveats, advice, why: rv.why };

    // 3. Underspecified. Ignores the timer on purpose - completing a
    //    specification is preparation, not judgement.
    if (gaps.length) return { outcome: "COMPLETE", rv, timer, gaps, caveats, advice, why: gaps.join("; ") };

    // 4. Expired, and nothing is wrong with it.
    if (timer.expired) return { outcome: "PROMOTE", rv, timer, gaps, caveats, advice, why: `${timer.forced ? "cannot be scheduled" : `timer expired ${timer.overdueBy} ago`}; specified, owned, and ${rv.required ? rv.verdict : "too fresh to have decayed"}` };

    // 5. Fresh and correct. Silent.
    return { outcome: "HOLD", rv, timer, gaps, caveats, advice, why: `timer has ${timer.remaining} to run and nothing is wrong with it` };
  }

  // ---- 3. PRIORITISE --------------------------------------------------------
  //
  // COMPUTED, NEVER A FIELD. `decision-timer-forces-judgement-never-promotion`:
  // "A hand-set priority field becomes another blank nobody fills, and 17 empty
  // recommendations out of 44 is what that already looks like here."
  //
  // BANDS FIRST, because expiry is not a tiebreak. An expired timer MOVES THE
  // ITEM TO THE FRONT; a score alone would let a fresh tier-1 outrank an
  // expired tier-3, which is the opposite of what a deadline means.
  //
  //   band 0  HIS. His attention is the one resource the factory cannot
  //           manufacture, so it outranks everything, unconditionally.
  //   band 1  expired, or unschedulable.
  //   band 2  timer still running.
  //
  // Within a band, four inputs and no others:
  //
  //   tier          the only severity signal every record already carries.
  //   waited        as a FRACTION of its own timer, not in hours. Hours would
  //                 make a tier-4 item that has waited two days outrank a tier-1
  //                 item four hours late, when the second is the one whose
  //                 declared deadline is broken.
  //   blocked       how many other OPEN, non-bookkeeping records name this one
  //                 by id. That is the only sense in which this belt can express
  //                 "something is waiting on it". Measured on the live belt: 18
  //                 of 53 open records are named by something, so the input is
  //                 real rather than decorative.
  //   unverifiable  a small penalty, not a bar. An item nothing can re-check
  //                 should not out-order one whose ground was confirmed.
  const blockedBy = new Map();
  for (const r of openAll) {
    const mine = String(r.id);
    const n = openAll.filter((o) => String(o.id) !== mine && text(o).includes(mine)).length;
    if (n) blockedBy.set(mine, n);
  }

  function priorityOf(r, j) {
    const his = j.outcome === "RAISE";
    const band = his ? 0 : j.timer.expired ? 1 : 2;

    const tier = Number.isFinite(Number(r.tier)) ? Number(r.tier) : null;
    // No tier means no tier points - not zero points dressed as a measurement.
    const tierPts = tier === null ? null : Math.max(0, 45 - tier * 8);

    const filedAt = runAt(r);
    const waitedMs = filedAt ? now - filedAt : null;
    const fraction = waitedMs !== null && j.timer.lengthMs ? waitedMs / j.timer.lengthMs : null;
    const waitPts = fraction === null ? null : Math.min(40, Math.round(fraction * 20));

    const blockers = blockedBy.get(String(r.id)) || 0;
    const blockPts = Math.min(45, blockers * 15);

    const unverifiedPenalty = j.rv.required && !j.rv.groundChecked ? -8 : 0;

    const parts = { tier: tierPts, waited: waitPts, blocked: blockPts, unverified: unverifiedPenalty };
    const score = (tierPts || 0) + (waitPts || 0) + blockPts + unverifiedPenalty;
    return {
      band,
      bandName: ["his", "expired", "running"][band],
      score,
      parts,
      // Named so nothing downstream has to guess which input is absent versus
      // which measured zero. Those are different facts.
      absent: Object.entries(parts).filter(([, v]) => v === null).map(([k]) => k),
      blockers,
      waitedHours: waitedMs === null ? null : round1(waitedMs / MS.h),
    };
  }

  const judged = incoming.map((r) => {
    const j = judge(r);
    return { r, ...j, priority: priorityOf(r, j) };
  });

  judged.sort(
    (a, b) =>
      a.priority.band - b.priority.band ||
      b.priority.score - a.priority.score ||
      runAt(a.r) - runAt(b.r) ||
      String(a.r.id).localeCompare(String(b.r.id)),
  );
  judged.forEach((x, i) => (x.rank = i + 1));

  const byOutcome = { HOLD: [], COMPLETE: [], PROMOTE: [], RETIRE: [], RAISE: [] };
  for (const x of judged) byOutcome[x.outcome].push(x);

  // =========================================================================
  // ZONE 2 - THE BELT
  // =========================================================================
  //
  // ALIVE_MS matches exit-worker's, deliberately: two machines disagreeing about
  // what "alive" means would be worse than either being wrong, because the
  // disagreement is invisible. ADRIFT_AFTER is longer and is this zone's own,
  // and it is the number that makes QUIET mean something - between the two, a
  // silent session is quiet rather than gone.
  const ALIVE_MS = 30 * MS.m;
  const ADRIFT_AFTER = 3 * MS.h;

  function watchBelt() {
    const dispatchFor = new Map();
    for (const r of records) {
      const s = r.subject && String(r.subject);
      if (s && r.dispatch) dispatchFor.set(s, { ...r.dispatch, recordedAt: Date.parse(r.run || "") || null });
    }
    const held = records.filter((r) => dispatchFor.has(String(r.id)));

    // The strength of a liveness proof, from session-life's own `where` string.
    // A folder mtime only moves when a file is added or removed at the top level
    // of a worktree, which is almost never while somebody is working inside it -
    // so a verdict that rests on it says so, in the row, every time.
    const strengthOf = (life) => {
      if (!life) return { rank: 0, name: "none", note: "no evidence on disk at all" };
      const w = String(life.where || "");
      if (/^transcript/.test(w)) return { rank: 3, name: "transcript", note: "the session's own turns" };
      if (/^worktree file/.test(w)) return { rank: 2, name: "worktree file", note: "something the worker wrote" };
      if (/scan incomplete/.test(w)) return { rank: 0, name: "scan incomplete", note: "the walk hit its bound before finding anything - not the same as finding nothing" };
      if (/^worktree folder/.test(w)) return { rank: 1, name: "worktree folder", note: "a folder mtime, which does not move while work is happening - barely evidence" };
      return { rank: 1, name: w || "unknown", note: "an evidence source this zone does not recognise" };
    };

    const rows = [];
    for (const r of held) {
      const d = dispatchFor.get(String(r.id));
      const life = sessionLife(d.session, ROOT, ALIVE_MS);
      const strength = strengthOf(life);
      const quietFor = life ? now - life.at : null;
      const done = IX.isDone(r);

      const ev = {
        session: d.session || null,
        via: d.via || null,
        where: life ? life.where : null,
        at: life ? new Date(life.at).toISOString() : null,
        strength: strength.name,
        strengthNote: strength.note,
        quietFor: quietFor === null ? null : humanMs(quietFor),
        heldFor: d.recordedAt ? humanMs(now - d.recordedAt) : null,
      };

      const push = (outcome, why, extra) => rows.push({ id: String(r.id), handle: H(r), outcome, why, evidence: ev, ...(extra || {}) });

      if (life && life.alive) {
        push("MOVING", `alive - ${strength.name} written ${humanMs(quietFor)} ago (${strength.note}).`);
        continue;
      }
      if (done) {
        push("DELIVERED", `the session is gone and the item was closed while it was held. The closure already says this; nothing more is owed.`);
        continue;
      }
      if (!life) {
        push("UNSEEN", `nothing on disk names session "${d.session}" - no transcript, no worktree, no folder. That is unobserved, not dead, and this zone will not call it either.`);
        continue;
      }

      // The last turn, read for the one question a machine may honestly ask.
      const tx = transcriptsFor(d.session, ROOT)[0] || null;
      const turn = tx ? lastTurnOf(tx.path) : null;

      if (turn && turn.kind === "api-error") {
        push("QUIET", `the run FAILED rather than stopped - ${turn.why}. "${turn.text.replace(/\s+/g, " ").slice(0, 120)}". A failed run returns nothing to incoming here; somebody has to look at why it could not run.`, { lastTurn: turn.kind });
        continue;
      }
      if (turn && turn.kind === "awaiting-tool") {
        push("QUIET", `${turn.why} (${turn.text}). It is waiting, not gone.`, { lastTurn: turn.kind });
        continue;
      }
      if (turn && turn.kind === "question") {
        push("QUIET", `${turn.why}: "${turn.text.replace(/\s+/g, " ").slice(0, 140)}". Answer it and the work resumes; return it to incoming and whoever picks it up starts cold.`, { lastTurn: turn.kind });
        continue;
      }
      if (strength.rank <= 1) {
        push("QUIET", `quiet for ${humanMs(quietFor)}, and the only evidence either way is ${strength.name} - ${strength.note}. "Dead" has not been shown, so it is not being said.`, { lastTurn: turn ? turn.kind : null });
        continue;
      }
      if (quietFor !== null && quietFor < ADRIFT_AFTER) {
        push("QUIET", `quiet for ${humanMs(quietFor)}, which is past the ${humanMs(ALIVE_MS)} liveness horizon but short of the ${humanMs(ADRIFT_AFTER)} this zone needs before saying a session is gone. Thirty minutes of quiet meaning abandoned is the defect this outcome exists to end.`, { lastTurn: turn ? turn.kind : null });
        continue;
      }
      push(
        "ADRIFT",
        `gone: quiet ${humanMs(quietFor)}, evidence was ${strength.name}, ${turn ? `and the last turn ${turn.why.replace(/^the last turn /, "")}` : "and its transcript could not be read"}. The item is still open. exit-worker owns returning it; this zone only says so.`,
        { lastTurn: turn ? turn.kind : null },
      );
    }

    const counts = { MOVING: 0, DELIVERED: 0, QUIET: 0, ADRIFT: 0, UNSEEN: 0 };
    for (const x of rows) counts[x.outcome]++;
    const withTranscript = rows.filter((x) => x.evidence.strength === "transcript").length;

    return {
      counts,
      rows,
      // MOVING and DELIVERED are the "nothing is wrong" outcomes and are silent
      // for the same reason HOLD is: a watcher that reports every healthy item
      // teaches everyone to stop reading it.
      silent: ["MOVING", "DELIVERED"],
      coverage:
        `${held.length} dispatch record(s) on the belt; ${withTranscript} judged on a transcript and ${held.length - withTranscript} on weaker evidence or none. ` +
        `This zone can only see work a belt record NAMES - a live session nobody wrote down is invisible here, and that is a missing record rather than a wrong filter.`,
      cannotSee: "a session working in this repo that no belt record names; anything happening in a repo this machine was not invoked in; and, where no transcript exists, whether a silent session was asking something.",
    };
  }

  // =========================================================================
  // ZONE 3 - THE RAIL
  // =========================================================================

  function watchRail() {
    const declared = discoverTriggers(ROOT);
    const state = readScheduleState(CTX);
    const stateIds = new Set(Object.keys(state.triggers || {}));
    const declaredIds = new Set(declared.map((t) => t.id));

    // LATE has to be generous enough that a rhythm is not reported the instant
    // it is due. The scheduler itself only gets a chance to fire when the
    // primordial tick wakes it, so anything inside one pulse of its deadline is
    // on time by construction, and a quarter of its own interval on top of that
    // absorbs jitter without hiding a rhythm that has actually stopped.
    const graceFor = (iv) => Math.max(PULSE, Math.round(iv * 0.25));

    const rows = [];
    for (const t of declared) {
      const s = state.triggers[t.id] || null;
      const every = parseEvery(t.every);
      const floor = parseEvery(t.floor);
      // POSITIVE, not merely finite. `Number(null)` is 0 and 0 is finite, so the
      // first version of this read a state entry whose intervalMs was null as a
      // rhythm running every zero milliseconds - and then reported it LATE,
      // overdue against a deadline of "immediately", forever. Caught by a fixture
      // rather than by the live rail, where no trigger happens to carry a null.
      const ivRaw = s ? Number(s.intervalMs) : NaN;
      const iv = Number.isFinite(ivRaw) && ivRaw > 0 ? ivRaw : null;
      const lastRunAt = s && Number(s.lastRunAt) ? Number(s.lastRunAt) : null;
      const base = {
        id: t.id,
        owns: t.owns || null,
        declared: t.every || null,
        declaredMs: every,
        running: iv === null ? null : humanMs(iv),
        runs: s ? s.runs || 0 : null,
        lastExit: s ? (s.lastExit === undefined ? null : s.lastExit) : null,
        lastRun: lastRunAt ? new Date(lastRunAt).toISOString() : null,
        quietFor: lastRunAt ? humanMs(now - lastRunAt) : null,
        external: !!t.external,
        drivenBy: t.drivenBy || null,
      };
      const push = (outcome, why, extra) => rows.push({ ...base, outcome, why, ...(extra || {}) });

      // EXTERNAL FIRST, AND IT IS NEVER LATE HERE. A `drivenBy` rhythm is fired
      // from outside this repo - the primordial tick runs the scheduler, so the
      // scheduler cannot run it without recursing. Reporting it as overdue would
      // be this repo complaining that something it is forbidden to fire did not
      // fire. What CAN be said about it is whether its driver actually ran, and
      // that is a different source entirely.
      if (t.external) {
        const taskId = /^claude-routine:(.+)$/.exec(String(t.drivenBy || ""));
        const runs = taskId ? routineRuns(taskId[1], now - 24 * MS.h) : null;
        const extra = { driver: t.drivenBy || null, driverRuns: runs };
        // NOT SILENT, AND THIS WAS SILENT FOR ONE COMMIT. An external rhythm
        // whose driver cannot be followed at all first fell into EXTERNAL,
        // which this zone keeps quiet - so "the primordial tick is fine" and
        // "nothing here can see whether the primordial tick ran" printed
        // identically, which is the exact failure the finding behind this zone
        // is about. It has its own outcome now, and that outcome is loud.
        if (!runs || !runs.observable) {
          push(
            "DRIVER UNOBSERVED",
            `driven by ${t.drivenBy || "something outside this repo"}, so this repo's scheduler never fires it and it can never be overdue here - but nothing here can say whether it ran either. ${runs ? runs.why : "Its driver is not named as `claude-routine:<id>`, which is the only form this machine can follow to a run history."} This is a blind spot, not a clean bill.`,
            extra,
          );
          continue;
        }
        if (runs.failingRightNow > 0) {
          push(
            "FAILED RUNS",
            `${runs.failingRightNow} of its most recent attempts could not run at all - ${runs.reasons.join("; ") || "reason not recorded"}. ` +
              `${runs.failed} failed out of ${runs.inspected} inspected in the last 24h, longest unbroken stretch ${runs.longestConsecutiveFailures}. ` +
              `The scheduler records runs that HAPPENED, so this is invisible on the rail: it looks like a quiet stretch, and the board would eventually say STALLED with no reason attached.`,
            extra,
          );
          continue;
        }
        if (runs.failed > 0) {
          push(
            "FAILED RUNS",
            `${runs.failed} of ${runs.inspected} attempts in the last 24h could not run - ${runs.reasons.join("; ") || "reason not recorded"}. Longest unbroken stretch ${runs.longestConsecutiveFailures}, last at ${runs.lastFailure}. It is running now; this is what the quiet earlier was.`,
            extra,
          );
          continue;
        }
        // NO ATTEMPTS IS NOT A CLEAN HISTORY. A driver that fired a hundred
        // times without failing and a driver that never fired at all produce
        // the same "0 failed", and only one of them is good news. This is the
        // same distinction the rest of this file keeps drawing, arriving one
        // level further out - it is now about the thing that drives the thing
        // that drives the factory.
        if (runs.attempts === 0) {
          push(
            "DRIVER SILENT",
            `driven by ${t.drivenBy}, and the harness recorded no attempt at all in the last 24h. It declares ${t.every}, so roughly ${Math.max(1, Math.round((24 * MS.h) / (every || 24 * MS.h)))} were due. Zero failures here means zero tries, not a clean run.`,
            extra,
          );
          continue;
        }
        push("EXTERNAL", `driven by ${t.drivenBy}; ${runs.inspected} attempt(s) in the last 24h and none of them failed to start. Never overdue here, because this repo does not fire it.`, extra);
        continue;
      }

      if (!s || lastRunAt === null) {
        push("NEVER RUN", `declared in this repo and the schedule has no run recorded for it. That is not the same as late: a rhythm that has never fired usually means a declaration nothing picked up, and a rhythm that fired and stopped usually means a fault.`);
        continue;
      }

      // DRIFTED, checked against the declaration's OWN range rather than against
      // a copy of the ladder. See the header: the exact rungs live in the repo's
      // scheduler, and reimplementing them here would raise alarms about a
      // working scheduler the first time the ladder changed.
      if (iv !== null && every !== null) {
        const lo = floor === null ? null : Math.min(floor, every);
        if (iv > every || (lo !== null && iv < lo)) {
          push(
            "DRIFTED",
            `running every ${humanMs(iv)}, which its own declaration cannot reach - it declares ${t.every}${t.floor ? ` with a floor of ${t.floor}` : " and no floor"}. An adaptive rhythm may sit anywhere between its floor and its ceiling; this is outside both, so nothing in the declaration explains it.`,
          );
          continue;
        }
      }

      const effective = iv !== null ? iv : every;
      if (effective === null) {
        // ITS OWN OUTCOME, not a late one. A rhythm nobody can compute a
        // deadline for is not overdue - it is unschedulable, and calling it late
        // would put a number in front of somebody that no clock produced.
        push(
          "UNSCHEDULABLE",
          `neither its declaration nor the schedule state gives a readable interval - it declares "${t.every}" and the state holds ${s && s.intervalMs === undefined ? "no interval" : JSON.stringify(s ? s.intervalMs : null)}. No deadline can be computed for it, so none is invented: it cannot be late, because nothing can say when it was due.`,
        );
        continue;
      }

      const due = lastRunAt + effective;
      if (now > due + graceFor(effective)) {
        push(
          "LATE",
          `last ran ${humanMs(now - lastRunAt)} ago and it is running at ${humanMs(effective)}${iv !== null && every !== null && iv !== every ? ` (tightened from its declared ${t.every} by the adaptive ladder, which makes it late sooner - that is what tightening is for)` : ""}. Overdue by ${humanMs(now - due)}.`,
        );
        continue;
      }

      if (s.lastExit !== 0 && s.lastExit !== null && s.lastExit !== undefined) {
        push(
          "FAULTED",
          `it ran ${humanMs(now - lastRunAt)} ago and exited ${s.lastExit}. On the board this shows only as a tightened interval, which reads like diligence rather than like a fault.`,
        );
        continue;
      }

      push("ON RHYTHM", `last ran ${humanMs(now - lastRunAt)} ago, running at ${humanMs(effective)}, next due in ${humanMs(due - now)}.`);
    }

    // ---- the phantom check, reached from the data ---------------------------
    //
    // Not by reading the board's own NOT A TRIGGER label - believing that would
    // make this a mirror rather than a check. The set of rhythm cells the board
    // RENDERED, minus everything declared, minus everything the scheduler knows
    // about. What is left is drawn by something that can neither declare it nor
    // fire it.
    const boardFile = path.join(CTX, "factory-tracker.html");
    let phantoms = null;
    let phantomWhy = null;
    let drawn = null;
    try {
      const html = fs.readFileSync(boardFile, "utf8");
      drawn = [...new Set([...html.matchAll(/data-explain="rhythm:([^"]+)"/g)].map((m) => m[1]))];
      phantoms = drawn.filter((id) => !declaredIds.has(id) && !stateIds.has(id));
    } catch (err) {
      if (err && err.code === "ENOENT") phantomWhy = "the board's rendered output is not on disk in this repo, so what it draws could not be compared with what is declared. NOT CHECKED - not clean.";
      else if (!expectedFsError(err)) throw err;
      else phantomWhy = `the board's rendered output could not be read (${err.code}). NOT CHECKED - not clean.`;
    }
    for (const p of phantoms || []) {
      rows.push({
        id: p,
        owns: null,
        declared: null,
        running: null,
        runs: null,
        lastExit: null,
        lastRun: null,
        quietFor: null,
        external: false,
        drivenBy: null,
        outcome: "PHANTOM",
        why: `the board draws a rhythm cell "${p}" and nothing in this repo declares it - no trigger file names it and the schedule holds no state for it, so nothing can fire it. Reached by subtracting ${declaredIds.size} declarations and ${stateIds.size} scheduled triggers from the ${drawn.length} cells actually rendered, rather than by trusting any label on the cell.`,
      });
    }

    const orphanState = [...stateIds].filter((id) => !declaredIds.has(id));
    for (const id of orphanState) {
      const s = state.triggers[id];
      rows.push({
        id,
        owns: null,
        declared: null,
        running: s && s.intervalMs ? humanMs(Number(s.intervalMs)) : null,
        runs: s ? s.runs || 0 : null,
        lastExit: s ? (s.lastExit === undefined ? null : s.lastExit) : null,
        lastRun: s && s.lastRunAt ? new Date(Number(s.lastRunAt)).toISOString() : null,
        quietFor: s && s.lastRunAt ? humanMs(now - Number(s.lastRunAt)) : null,
        external: false,
        drivenBy: null,
        outcome: "UNDECLARED",
        why: `the schedule has run this ${s ? s.runs || 0 : 0} time(s) and no declaration in this tree explains it. A trigger with recorded runs and no declaration is invisible rather than wrong, which is worse - nothing can say what it is for or whether it should still exist.`,
      });
    }

    const counts = {};
    for (const x of rows) counts[x.outcome] = (counts[x.outcome] || 0) + 1;

    return {
      counts,
      rows,
      silent: ["ON RHYTHM", "EXTERNAL"],
      coverage:
        `${declared.length} declaration(s) and ${stateIds.size} scheduled trigger(s) in ${path.basename(ROOT)}; ` +
        `${drawn === null ? "the board's rendered cells could not be read" : `${drawn.length} rhythm cell(s) rendered on the board`}. ` +
        `Divergence between a declared cadence and a running one is EXPLAINED whenever the running interval lies between the declaration's floor and its ceiling; only an interval outside that range is reported.`,
      cannotSee:
        `the exact rungs of the adaptive ladder, which live in the repo's scheduler and are not importable from a universal machine - so a wrong-but-in-range interval reads as fine here` +
        (phantomWhy ? `; and ${phantomWhy}` : ``),
      phantomCheck: phantoms === null ? { checked: false, why: phantomWhy } : { checked: true, cellsDrawn: drawn.length, phantoms },
    };
  }

  // =========================================================================
  // ZONE 4 - THE DOORS
  // =========================================================================

  function watchDoors() {
    const DOOR_STALE = 6 * MS.h;
    const declaredIds = new Set(discoverTriggers(ROOT).map((t) => t.id));
    const rows = [];

    // ---- AUTO: the only door that can genuinely be OFF ----------------------
    //
    // Because it is the only one the factory operates. And OFF must never be
    // drawn the same way as NEVER OBSERVED: one means somebody decided, the
    // other means nobody has ever looked, and this factory has confused
    // absence with a clean result seven times.
    {
      const rep = readReport(path.join(CTX, "intake-worker.json"), DOOR_STALE);
      const driven = declaredIds.has("intake-worker") || declaredIds.has("intake");
      const common = { door: "auto", report: "intake-worker.json", reportState: rep.state, observedAt: rep.at ? new Date(rep.at).toISOString() : null, drivenByARhythm: driven };
      if (rep.state === "absent") rows.push({ ...common, outcome: "NEVER OBSERVED", why: `intake-worker.json has never been written, so this door has never been observed at all. That is not OFF. Nobody has decided anything about it; nobody has looked.` });
      else if (rep.state === "unreadable") rows.push({ ...common, outcome: "UNREADABLE", why: `intake-worker.json ${rep.why}. Its last state is unknown, which is a different fact from the door being quiet.` });
      else if (rep.state === "stale" || rep.state === "undated") rows.push({ ...common, outcome: "STALE", why: `intake-worker.json ${rep.why}${driven ? "" : ", and no rhythm on the rail fires it"}. What it says was true when it was written; nothing here says it is true now.` });
      else if (!rep.json.armed) rows.push({ ...common, outcome: "OFF", why: `observed ${humanMs(now - rep.at)} ago and deliberately not pulling - it selects and briefs but will not dispatch without --dispatch. ${rep.json.waiting || 0} contract(s) waiting, room for ${rep.json.room === undefined ? "an unstated number" : rep.json.room}.`, waiting: rep.json.waiting ?? null, room: rep.json.room ?? null });
      else rows.push({ ...common, outcome: "OPEN", why: `armed and observed ${humanMs(now - rep.at)} ago; ${(rep.json.dispatched || []).length} dispatched on its last pass, ${rep.json.waiting || 0} waiting.`, waiting: rep.json.waiting ?? null, room: rep.json.room ?? null });
    }

    // ---- CHAT and SPAWN: never OFF, only unobserved ------------------------
    //
    // A person can always open a session and an agent can always spawn one, so
    // OFF is not a state either of them can be in. The most this machine can
    // honestly say when the evidence is missing is that it cannot see them.
    const evidenceDoor = (key, dir, what) => {
      let present = false;
      try {
        present = fs.statSync(dir).isDirectory();
      } catch (err) {
        if (!expectedFsError(err)) throw err;
      }
      if (!present) {
        rows.push({ door: key, report: dir.replace(/\\/g, "/"), reportState: "absent", observedAt: null, drivenByARhythm: null, outcome: "NEVER OBSERVED", why: `${what} is not on this host, so nothing here can watch this door. It cannot be switched off - a person can always open a session and an agent can always spawn one - so this is a gap in observation, never a closed door.` });
        return;
      }
      rows.push({ door: key, report: dir.replace(/\\/g, "/"), reportState: "fresh", observedAt: null, drivenByARhythm: null, outcome: "OPEN", why: `${what} is present, so arrivals through this door are observable. This door has no off switch.` });
    };
    evidenceDoor("chat", PROJECTS, "the session transcript store");
    evidenceDoor("spawn", path.join(ROOT, ".claude", "worktrees"), "the worktree directory");

    // ---- EXIT: the way finished work leaves --------------------------------
    //
    // Counted as a door because it is one, and because a factory whose exit is
    // not driven silently accumulates work that has already been done.
    {
      const rep = readReport(path.join(CTX, "exit-worker.json"), DOOR_STALE);
      const driven = declaredIds.has("exit-worker") || declaredIds.has("exit");
      const common = { door: "exit", report: "exit-worker.json", reportState: rep.state, observedAt: rep.at ? new Date(rep.at).toISOString() : null, drivenByARhythm: driven };
      if (rep.state === "absent") rows.push({ ...common, outcome: "NEVER OBSERVED", why: `exit-worker.json has never been written. Nothing has ever taken finished work off the conveyor here.` });
      else if (rep.state === "unreadable") rows.push({ ...common, outcome: "UNREADABLE", why: `exit-worker.json ${rep.why}.` });
      else if (!driven) rows.push({ ...common, outcome: "UNDRIVEN", why: `exit-worker.json was ${rep.why}, and no trigger in this repo declares it - it runs only when somebody remembers. A door that opens on memory is the arrangement this whole factory exists to end.` });
      else if (rep.state === "stale" || rep.state === "undated") rows.push({ ...common, outcome: "STALE", why: `exit-worker.json ${rep.why} even though a rhythm declares it, so the rhythm is not landing.` });
      else rows.push({ ...common, outcome: "OPEN", why: `observed ${humanMs(now - rep.at)} ago; ${rep.json.held || 0} held, ${(rep.json.abandoned || []).length} returned on its last pass.` });
    }

    const counts = {};
    for (const x of rows) counts[x.outcome] = (counts[x.outcome] || 0) + 1;
    return {
      counts,
      rows,
      silent: ["OPEN"],
      coverage: `4 doors: auto, chat, spawn and exit. Auto and exit are judged from their own reports; chat and spawn from whether their evidence stores exist on this host. Only AUTO can be OFF, and only when its report exists and says so.`,
      cannotSee: "how many arrivals came through chat or spawn - that is counted from dispatch records on the belt and belongs to the board, not here; and whether a door that looks open would actually admit anything, which only an arrival proves.",
    };
  }

  // =========================================================================
  // ZONE 5 - THE CLOSED PILE
  // =========================================================================
  //
  // kind.cjs already computes the two lists this needs and already refuses to
  // guess. This zone does not re-derive either - it renders them, ranks them,
  // and says exactly what a person has to do, because the whole defect is that
  // the lists existed and nothing looked at them.

  function watchClosedPile() {
    const terminals = records.filter((r) => IX.selfTerminal(r) && !IX.isNoting(r));
    const near = new Map(IX.orphanClosers.map((o) => [String(o.id), o]));
    const prose = new Map(IX.proseSubjectClosers.map((o) => [String(o.id), o]));

    const rows = [];
    for (const r of terminals) {
      const subject = r.subject ? String(r.subject) : null;
      const base = { id: String(r.id), handle: H(r), subject, run: r.run || null };
      if (!subject) {
        rows.push({ ...base, outcome: "SELF-CLOSING", why: "terminal with no subject, so it closes itself and nothing else. A legitimate shape, not a miss." });
        continue;
      }
      if (IX.ids.has(subject)) {
        rows.push({ ...base, outcome: "LANDED", why: `subject equals "${subject}" exactly, so it closed it.` });
        continue;
      }
      const n = near.get(String(r.id));
      if (n && n.near) {
        rows.push({
          ...base,
          outcome: "NEAR MISS",
          appearsToMean: n.near,
          why: `its subject contains "${n.near}" without equalling it, so it closed nothing. It was unmistakably reaching for that record. The repair is to append one terminal record whose subject is exactly "${n.near}" - NOT to loosen the matcher, because a closer that nearly matches an id would start closing the wrong findings, and a closure applied to the wrong record deletes real work silently.`,
        });
        continue;
      }
      rows.push({
        ...base,
        outcome: "UNRECOVERABLE",
        why: `its subject "${subject}" shares no id with anything on this belt, so no honest rule recovers what it meant to close. It has to be re-filed by hand: read it, decide which record it finished, and append a terminal record whose subject is exactly that id.${prose.has(String(r.id)) ? "" : " (kind.cjs did not list this one, which means it names a subject nothing else does either.)"}`,
      });
    }

    const counts = {};
    for (const x of rows) counts[x.outcome] = (counts[x.outcome] || 0) + 1;
    return {
      counts,
      rows,
      silent: ["LANDED", "SELF-CLOSING"],
      coverage: `${terminals.length} terminal record(s) that are not annotations; every one of them checked for whether its subject equals a known id. Exact match, always - this zone reports and never repairs.`,
      cannotSee: "which record an unrecoverable closer MEANT. That is what makes them unrecoverable, and guessing is the one thing that would make this worse than leaving them alone.",
    };
  }

  // ---- run the zones that were asked for -----------------------------------
  //
  // A zone left out by --zones reports NOT ASKED. That is a third state and it
  // matters: not covered, not clean, just not run this round. A reader who sees
  // an empty zone must be able to tell which of the three they are looking at.
  const zoneRunners = { belt: watchBelt, rail: watchRail, doors: watchDoors, "closed-pile": watchClosedPile };
  const zoneResults = {};
  for (const z of ZONES) {
    if (z.id === "incoming") continue;
    if (!zoneAsked(z.id)) {
      zoneResults[z.id] = { n: z.n, asked: false, covered: true, asks: z.asks, can: z.can, cannot: z.cannot, why: "not asked for this round (--zones). This is not a clean result." };
      continue;
    }
    const r = zoneRunners[z.id]();
    const loud = r.rows.filter((x) => !r.silent.includes(x.outcome));
    zoneResults[z.id] = {
      n: z.n,
      asked: true,
      covered: true,
      asks: z.asks,
      can: z.can,
      cannot: z.cannot,
      coverage: r.coverage,
      cannotSee: r.cannotSee,
      counts: r.counts,
      silentOutcomes: r.silent,
      silentCount: r.rows.length - loud.length,
      rows: loud,
      ...(r.phantomCheck ? { phantomCheck: r.phantomCheck } : {}),
    };
  }

  // ---- 4 & 5. ANNOTATE, AND CONTRACT ---------------------------------------
  //
  // `watcher-metadata-is-an-annotation-not-an-edit`: the belt is append-only and
  // the annotation mechanism already exists. terminal:annotation is in the NOTING
  // family, so it explains without closing - built after a lesson attached to a
  // finding accidentally marked it resolved.
  //
  // AND THE SUBJECT IS THE TARGET'S ID, EXACTLY. A closer or annotator naming its
  // target in prose attaches to nothing and says nothing; twelve records on this
  // belt already get that wrong.
  //
  // WHAT THE WATCHER WILL AND WILL NOT WRITE INTO `recommend`:
  //
  // It writes one only where the action follows from a CHECKED FACT - the
  // stale-ground case, where the honest instruction is "re-verify against this
  // file, which moved after you filed this". For a record that simply has no
  // recommendation, it NAMES THE GAP AND STOPS. Inventing a plausible action
  // there would be a default for a missing measurement, and it would be the most
  // expensive possible place to fabricate one, because the next agent would
  // execute it.
  function annotationFor(x) {
    const r = x.r;
    const rec =
      x.rv.verdict === "stale-ground"
        ? `Re-verify before acting. ${x.rv.paths.changedSince.map((c) => `${c.path} was written ${c.mtime}`).join("; ")}, after this was filed ${r.run}. Confirm the claim still holds against the current file, then act or retire it.`
        : undefined;
    return {
      id: `watched-${String(r.id).slice(0, 56)}-${now.toString(36)}`,
      run: new Date(now).toISOString(),
      // WHAT THIS ANNOTATION ACTUALLY SAYS, reduced to one comparable string.
      // The id carries a timestamp so it is unique per run, which means nothing
      // downstream can ever recognise two annotations as the same observation.
      // Without a signature to compare, a scheduled watcher re-states its verdict
      // every cycle: eleven records an hour, none of them new, and the belt dies
      // by flooding rather than by leaking - which is itself a finding on this
      // belt. `mind-watch` already carries the rule in its own declaration:
      // report CHANGES against a stored baseline, never state.
      watchSig: `${x.outcome}|${x.rv.verdict}|${x.gaps.join(";")}`,
      driver: "I7",
      tier: Number.isFinite(Number(r.tier)) ? Number(r.tier) : 2,
      dimension: r.dimension || "architecture",
      subject: String(r.id),
      claim: `Watched in incoming: ${x.outcome}. ${x.why}`,
      evidence: [
        `Re-verification: ${x.rv.verdict}${x.rv.why ? ` - ${x.rv.why}` : ""}`,
        `Timer: ${x.timer.why}${x.timer.expired ? `, expired${x.timer.overdueBy ? ` ${x.timer.overdueBy} ago` : ""}` : `, ${x.timer.remaining} remaining`}.`,
        `Priority: band ${x.priority.bandName}, score ${x.priority.score} (tier ${fmt(x.priority.parts.tier)}, waited ${fmt(x.priority.parts.waited)}, blocked ${fmt(x.priority.parts.blocked)}${x.priority.parts.unverified ? `, unverified ${x.priority.parts.unverified}` : ""}), ${x.priority.blockers} record(s) name it.`,
        `Outstanding: ${x.gaps.length ? x.gaps.join("; ") : "nothing"}.`,
        `Caveats: ${x.caveats.length ? x.caveats.join("; ") : "none"}.`,
        `Written by the incoming watcher. This is an annotation, not an edit and not a closure - terminal:annotation is in the NOTING family.`,
      ].join(" "),
      ...(rec ? { recommend: rec } : {}),
      seen: true,
      confidence: "measured",
      triggers: "terminal:annotation",
      owner: r.owner || r.dimension || "architecture",
    };
  }

  // An accepted deposit becomes a contract through triageRecord and nothing
  // else. A hand-rolled acceptance is a second shape for one act, and the belt
  // would then carry two ways of saying the same thing - which is how every
  // vocabulary in this factory has drifted so far.
  function actFor(x) {
    const r = x.r;
    const why = [
      `Re-verified: ${x.rv.verdict}${x.rv.why ? ` (${x.rv.why})` : ""}`,
      `Decided: ${x.outcome} - ${x.why}`,
      `Outstanding: ${x.gaps.length ? x.gaps.join("; ") : "nothing"}.`,
      x.caveats.length ? `Caveats: ${x.caveats.join("; ")}.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    const kind = x.outcome === "PROMOTE" ? KIND.CONTRACT : x.outcome === "RETIRE" ? KIND.NOTE : KIND.DECISION;
    return triageRecord({
      id: String(r.id),
      kind,
      dimension: r.dimension,
      owner: r.owner,
      to: String(r.triggers || "").startsWith("contract:") ? String(r.triggers).slice("contract:".length) : r.dimension,
      by: "the incoming watcher",
      why,
    });
  }

  // ANNOTATIONS ARE NOT SUBJECT TO --arm-limit. The limit exists to stop the
  // open-contract count jumping in one step; an annotation accepts nothing,
  // transfers no authority and changes no count, so throttling it would only
  // withhold the reasoning from the records that most need it.
  // AN ANNOTATION IS WRITTEN ONLY WHEN IT WOULD SAY SOMETHING NEW.
  //
  // The newest prior annotation for each record carries a `watchSig`. If this
  // round's signature matches it, the verdict has not moved and re-stating it
  // adds a line that nothing will ever read. Silence here is the same discipline
  // as HOLD being silent: a watcher that repeats itself teaches everyone to stop
  // reading it, and this one is meant to run on a clock.
  //
  // A record annotated BEFORE this field existed has no signature, so it is
  // annotated once more and gains one. That is a one-time cost, not a loop.
  // KEYED BY ZONE AND SUBJECT, NOT BY SUBJECT ALONE. Zone 2 annotates the same
  // record ids zone 1 does, so a single-key map would let one zone's verdict
  // suppress the other's - two different observations about one record, and the
  // second one silently lost. A record annotated before this field existed has
  // no zone and belongs to incoming, which is where all of them came from.
  const lastSig = new Map();
  for (const rec of records) {
    if (!/^watched-/.test(String(rec.id || ""))) continue;
    lastSig.set(`${rec.zone || "incoming"}|${String(rec.subject)}`, rec.watchSig === undefined ? null : rec.watchSig);
  }
  const moved = (a) => {
    const prior = lastSig.get(`${a.zone || "incoming"}|${String(a.subject)}`);
    return prior === undefined || prior === null || prior !== a.watchSig;
  };

  const annotationCandidates = byOutcome.COMPLETE.map(annotationFor);
  const wouldAnnotate = annotationCandidates.filter(moved);
  const annotationsUnchanged = annotationCandidates.length - wouldAnnotate.length;

  // ---- what zones 2 to 5 write, which is annotations and nothing else -------
  //
  // TWO SHAPES, AND THE DIFFERENCE IS A LIVE TRAP.
  //
  // Zones 2 and 5 annotate a REAL BELT RECORD, so their subject is that record's
  // id exactly - which is the same convention every closer and annotator here
  // has to follow, and the one twelve records already got wrong. Those
  // annotations MUST NOT carry a `kind` field: kind.cjs attaches a declared kind
  // to the SUBJECT when the subject names a known record, so setting one would
  // silently reclassify the record being annotated. That is a rule about the
  // later-wins mechanism, not about this file, and it is why zone 1's annotation
  // has never carried one either.
  //
  // Zones 3 and 4 annotate a rhythm or a door, which are not belt records, so
  // there is no id to name. They take a specific synthetic subject - the same
  // `rhythm:<id>` and `door:<key>` the board already uses for its own panels,
  // rather than a second vocabulary - and they DO declare `kind: note`, because
  // with a subject that names no record the kind attaches to the annotation
  // itself, and a note is exactly what it is: a statement to read, with nothing
  // owed. Without it they would infer as finished contracts and pile up on the
  // resolution table as work nobody did.
  //
  // Never a shared programme label in either shape. One subject, one thing.
  const ZONE_SEVERITY = {
    ADRIFT: 0,
    UNRECOVERABLE: 1,
    "NEVER OBSERVED": 1,
    UNREADABLE: 1,
    "FAILED RUNS": 1,
    "NEVER RUN": 1,
    "DRIVER SILENT": 1,
    "DRIVER UNOBSERVED": 2,
    UNDECLARED: 2,
    UNSCHEDULABLE: 2,
    PHANTOM: 2,
    UNDRIVEN: 2,
    LATE: 2,
    FAULTED: 2,
    DRIFTED: 2,
    QUIET: 3,
    "NEAR MISS": 3,
    STALE: 3,
    UNSEEN: 3,
    OFF: 4,
  };

  function zoneAnnotationFor(zoneId, row) {
    const namesARecord = zoneId === "belt" || zoneId === "closed-pile";
    const subject = namesARecord ? String(row.id) : zoneId === "rail" ? `rhythm:${row.id}` : `door:${row.door}`;
    const target = namesARecord ? records.find((r) => String(r.id) === String(row.id)) : null;
    const label = namesARecord ? String(row.id) : subject;
    return {
      id: `watched-${zoneId}-${label.replace(/[^A-Za-z0-9]+/g, "-").slice(0, 44)}-${now.toString(36)}`,
      run: new Date(now).toISOString(),
      zone: zoneId,
      // The comparable reduction of what this says. Same discipline as zone 1:
      // an id carries a timestamp and is therefore never recognisable twice, so
      // without a signature a clock-driven watcher re-states every verdict every
      // cycle and the belt dies by flooding rather than by leaking.
      watchSig: `${row.outcome}|${row.evidence ? row.evidence.strength : ""}|${row.appearsToMean || row.reportState || row.running || ""}`,
      driver: "I7",
      tier: (ZONE_SEVERITY[row.outcome] ?? 3) <= 1 ? 1 : 2,
      dimension: (target && target.dimension) || row.owns || "architecture",
      subject,
      ...(namesARecord ? {} : { kind: KIND.NOTE }),
      claim: `Watched in ${zoneId}: ${row.outcome}. ${row.why}`,
      evidence: [
        `Zone ${ZONES.find((z) => z.id === zoneId).n} of the watcher's round, which asks: ${ZONES.find((z) => z.id === zoneId).asks}.`,
        row.evidence ? `Liveness evidence: ${row.evidence.where || "none"} at ${row.evidence.at || "never"}, strength ${row.evidence.strength} - ${row.evidence.strengthNote}.` : "",
        row.driverRuns && row.driverRuns.observable
          ? `Run history read from ${row.driverRuns.where}: ${row.driverRuns.inspected} attempt(s) inspected in 24h, ${row.driverRuns.failed} of which could not start${row.driverRuns.runsWithNoReadableTranscript ? `, and ${row.driverRuns.runsWithNoReadableTranscript} whose transcript could not be read and were therefore counted as neither` : ""}.`
          : "",
        `This zone may ${ZONES.find((z) => z.id === zoneId).can}. It may NOT ${ZONES.find((z) => z.id === zoneId).cannot}.`,
        `Written by the watcher. This is an annotation, not an edit and not a closure - terminal:annotation is in the NOTING family.`,
      ]
        .filter(Boolean)
        .join(" "),
      seen: true,
      confidence: "measured",
      triggers: "terminal:annotation",
      owner: (target && (target.owner || target.dimension)) || row.owns || "architecture",
    };
  }

  const zoneCandidates = [];
  for (const [zid, z] of Object.entries(zoneResults)) {
    if (!z.asked) continue;
    for (const row of z.rows) zoneCandidates.push({ zid, row, sev: ZONE_SEVERITY[row.outcome] ?? 3, ann: zoneAnnotationFor(zid, row) });
  }
  zoneCandidates.sort((a, b) => a.sev - b.sev || a.zid.localeCompare(b.zid) || String(a.ann.subject).localeCompare(String(b.ann.subject)));
  const zoneMoved = zoneCandidates.filter((c) => moved(c.ann));
  const zoneUnchanged = zoneCandidates.length - zoneMoved.length;
  const zoneAllowed = zoneMoved.slice(0, ZONE_ANNOTATE_LIMIT);
  const zoneDeferred = zoneMoved.length - zoneAllowed.length;

  // ACTS ARE TAKEN IN QUEUE ORDER, NOT GROUPED BY OUTCOME. Built by outcome
  // first, and it was wrong: --arm-limit then always spent itself on promotions
  // because they were listed first, so a RETIRE - which removes work rather than
  // adding it, and is the cheapest act on the list - could be starved forever by
  // a limit that never reached it. The watcher owns ORDER; the limit owns COUNT,
  // and a limit that reorders is quietly making the judgement.
  //
  // RAISE writes nothing when the belt already holds it for him - re-declaring a
  // decision as a decision is an act that changed nothing, and triage.cjs refuses
  // that same no-op for the same reason.
  const wouldAct = judged.filter(
    (x) => x.outcome === "PROMOTE" || x.outcome === "RETIRE" || (x.outcome === "RAISE" && IX.kindOf(x.r) !== KIND.DECISION),
  );
  const actsAllowed = wouldAct.slice(0, ARM_LIMIT === Infinity ? wouldAct.length : ARM_LIMIT);

  let written = [];
  let deferredByLimit = wouldAct.length - actsAllowed.length;
  if (ARM && !DRY) {
    const lines = [...wouldAnnotate, ...zoneAllowed.map((c) => c.ann), ...actsAllowed.map(actFor)];
    for (const rec of lines) {
      fs.appendFileSync(BELT, JSON.stringify(rec) + "\n", "utf8");
      written.push(rec.id);
    }
  }

  // ---- 6. PASS ON - a STANDING ordered ready-list ---------------------------
  //
  // `auto-intake-drains-a-standing-queue`: a per-tick message would starve the
  // door on every tick where the watcher did not wake, which will be most of
  // them. A standing list lets both share one clock without either waiting on
  // the other.
  //
  // IT CARRIES A FRESHNESS STAMP so intake can REFUSE a stale one. A long-unrun
  // watcher's list is a decayed judgement - the same rot one level up.
  //
  // `ready` IS EMPTY WHILE PROMOTION IS DISARMED, AND IT SAYS SO IN WORDS.
  // Intake may only pull a CONTRACT, and nothing becomes a contract until the
  // acceptance is written. An empty list with no explanation would read as
  // "nothing to do" on a morning when twenty items are waiting on one flag -
  // absence is not failure, and here the difference is the whole authority
  // question.
  const GOOD_FOR = 30 * MS.m;
  const row = (x) => ({
    rank: x.rank,
    handle: H(x.r),
    id: String(x.r.id),
    outcome: x.outcome,
    band: x.priority.bandName,
    priority: x.priority.score,
    priorityParts: x.priority.parts,
    priorityInputsAbsent: x.priority.absent,
    blockedBehindIt: x.priority.blockers,
    tier: Number.isFinite(Number(x.r.tier)) ? Number(x.r.tier) : null,
    dimension: x.r.dimension || null,
    addressedTo: x.r.triggers || null,
    waitedHours: x.priority.waitedHours,
    timer: x.timer,
    reverify: x.rv,
    gaps: x.gaps,
    caveats: x.caveats,
    hasRecommendation: !!x.advice,
    why: x.why,
    claim: String(x.r.claim || "").replace(/\s+/g, " ").slice(0, 180),
  });

  const queue = {
    producedAt: new Date(now).toISOString(),
    goodFor: humanMs(GOOD_FOR),
    staleAfter: new Date(now + GOOD_FOR).toISOString(),
    watcher: "five zones",
    zonesCovered: ZONES.filter((z) => z.covered).map((z) => z.id),
    zonesNotCovered: ZONES.filter((z) => !z.covered).map((z) => ({ id: z.id, what: z.what })),
    zonesNotAsked: ZONES.filter((z) => z.covered && !zoneAsked(z.id)).map((z) => z.id),
    // What each zone is allowed to do, carried in the output rather than only in
    // the source, so nothing downstream has to read this file to know whether a
    // verdict is going to cause anything. The answer for four of the five is no.
    zoneAuthority: ZONES.map((z) => ({ id: z.id, n: z.n, asks: z.asks, can: z.can, cannot: z.cannot })),
    zones: zoneResults,
    repo: path.basename(ROOT),
    root: ROOT.replace(/\\/g, "/"),
    invokedFrom: CWD.replace(/\\/g, "/"),
    armed: ARM,
    dry: DRY,
    armLimit: ARM_LIMIT === Infinity ? null : ARM_LIMIT,
    beltLinesUnreadable: unreadableLines,
    counts: {
      incoming: incoming.length,
      hold: byOutcome.HOLD.length,
      complete: byOutcome.COMPLETE.length,
      promote: byOutcome.PROMOTE.length,
      retire: byOutcome.RETIRE.length,
      raise: byOutcome.RAISE.length,
    },
    // What intake may pull. Only an ACCEPTED contract is pullable.
    ready: ARM ? byOutcome.PROMOTE.map(row) : [],
    readyEmptyBecause: ARM ? null : "promotion is disarmed. The watcher has judged these as ready but has not accepted them, and only a contract may be dispatched. Nothing here is pullable until --arm is used or somebody triages them by hand. This is not an empty morning.",
    // The full ordered judgement. HOLD is deliberately absent - see below.
    queue: judged.filter((x) => x.outcome !== "HOLD").map(row),
    holdsSilent: byOutcome.HOLD.length,
    holdsSilentBecause: "HOLD means fresh and correct with its decision timer still running. Listing them would be noise, and noise is how a board stops being read. They are counted so the total still reconciles.",
    lockClearedStale: lockState.cleared ? { host: lockState.cleared.host, pid: lockState.cleared.pid, takenAt: lockState.cleared.takenAt, unreadable: !!lockState.cleared.unreadable, reason: lockState.cleared.reason || null } : null,
    wouldWrite: ARM ? written : [...wouldAnnotate.map((a) => a.id), ...zoneAllowed.map((c) => c.ann.id), ...actsAllowed.map((x) => `triaged-${String(x.r.id).slice(0, 60)}-*`)],
    deferredByArmLimit: deferredByLimit,
    zoneAnnotations: {
      // Zones 2 to 5 accept nothing, so this counts writes rather than authority.
      limit: ZONE_ANNOTATE_LIMIT,
      candidates: zoneCandidates.length,
      unchanged: zoneUnchanged,
      wouldWrite: zoneAllowed.length,
      deferred: zoneDeferred,
      deferredBecause: zoneDeferred
        ? `${zoneDeferred} annotation(s) were computed and held back by --zone-annotate-limit ${ZONE_ANNOTATE_LIMIT}. They are ordered by severity, so what was held back is the least serious of what moved. Nothing was dropped - the next run will offer them again.`
        : null,
    },
  };

  if (!DRY) {
    fs.mkdirSync(CTX, { recursive: true });
    fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + "\n", "utf8");
  }

  // ---- report ---------------------------------------------------------------
  if (JSON_OUT) {
    console.log(JSON.stringify(SHOW_HOLDS ? { ...queue, holds: byOutcome.HOLD.map(row) } : queue, null, 2));
    return;
  }

  const c = queue.counts;
  console.log(`watcher  ${queue.repo}  ${c.incoming} in incoming${DRY ? "   DRY - nothing written" : ""}${ARM ? "   ARMED (zone 1 only; zones 2-5 annotate and nothing more)" : ""}`);
  console.log(`  zone 1 INCOMING - what should be judged, in what order, by when?`);
  if (lockState.cleared)
    console.log(
      lockState.cleared.unreadable
        ? `  cleared an UNREADABLE lock (${lockState.cleared.reason}) - it named no holder, so nothing could be reasoned about it. If this recurs, something is writing the lock badly.`
        : `  cleared a stale lock from ${lockState.cleared.host} pid ${lockState.cleared.pid}, taken ${lockState.cleared.takenAt} - a run was killed mid-flight`,
    );
  if (unreadableLines) console.log(`  ${unreadableLines} belt line(s) would not parse and were skipped`);
  console.log(`  RAISE ${c.raise}   RETIRE ${c.retire}   PROMOTE ${c.promote}   COMPLETE ${c.complete}   HOLD ${c.hold} (silent)`);
  const notAsked = ZONES.filter((z) => z.covered && !zoneAsked(z.id)).map((z) => z.id);
  const notCovered = ZONES.filter((z) => !z.covered).map((z) => z.id);
  console.log(
    `  zones: ${ZONES.filter((z) => z.covered && zoneAsked(z.id)).map((z) => `${z.n} ${z.id}`).join(", ")} covered` +
      (notAsked.length ? `; ${notAsked.join(", ")} NOT ASKED this round - not clean, just not run` : "") +
      (notCovered.length ? `; ${notCovered.join(", ")} NOT COVERED` : ""),
  );
  console.log("");
  for (const x of judged) {
    if (x.outcome === "HOLD" && !SHOW_HOLDS) continue;
    // A score computed with an input MISSING is marked, because a total that
    // silently omits a term is the most convincing fabrication available - it
    // looks exactly like a measured low score.
    const mark = x.priority.absent.length ? "*" : " ";
    console.log(`  ${String(x.rank).padStart(3)}. ${x.outcome.padEnd(8)} ${H(x.r).padEnd(5)} ${String(x.priority.score).padStart(3)}${mark} ${x.priority.bandName.padEnd(8)} ${String(x.r.id).slice(0, 52)}`);
    if (x.priority.absent.length) console.log(`       * priority is short ${x.priority.absent.join(" and ")} - the score is a partial sum, not a low one`);
    console.log(`       ${x.why}`);
    if (x.rv.required) console.log(`       re-verified: ${x.rv.verdict} - ${x.rv.why}`);
    for (const cv of x.caveats) console.log(`       caveat: ${cv}`);
  }
  // ---- zones 2 to 5 ---------------------------------------------------------
  //
  // Each block leads with what the zone asked, then the distribution, then only
  // the rows that are not silent. The distribution is printed even when every
  // row is silent, because "I looked at fourteen and all fourteen were fine" and
  // "I looked at nothing" must not print identically.
  for (const z of ZONES) {
    if (z.id === "incoming") continue;
    const r = zoneResults[z.id];
    console.log("");
    if (!r.asked) {
      console.log(`  zone ${z.n} ${z.id.toUpperCase()} - NOT ASKED this round. ${r.why}`);
      continue;
    }
    const dist = Object.entries(r.counts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join("   ") || "nothing to classify";
    console.log(`  zone ${z.n} ${z.id.toUpperCase()} - ${z.asks}?`);
    console.log(`    ${dist}${r.silentCount ? `   (${r.silentCount} silent)` : ""}`);
    console.log(`    covers: ${r.coverage}`);
    for (const row of r.rows) {
      const name = row.door || row.id;
      console.log(`    ${String(row.outcome).padEnd(14)} ${String(name).slice(0, 52)}`);
      console.log(`       ${row.why}`);
    }
    if (!r.rows.length) console.log(`    nothing to report - every row landed on ${r.silentOutcomes.join(" or ")}, which this zone keeps silent.`);
    console.log(`    cannot see: ${r.cannotSee}`);
    console.log(`    authority: may ${z.can}. May NOT ${z.cannot}.`);
  }
  console.log("");

  if (!ARM) {
    console.log(`  Not armed. ${wouldAct.length} act(s) from zone 1, plus ${wouldAnnotate.length} incoming and ${zoneAllowed.length} zone annotation(s), were computed and NOT written.`);
    if (zoneUnchanged) console.log(`  ${zoneUnchanged} zone annotation(s) suppressed - their verdict has not moved since the last one.`);
    if (zoneDeferred) console.log(`  ${zoneDeferred} zone annotation(s) held back by --zone-annotate-limit ${ZONE_ANNOTATE_LIMIT}, least serious first. Nothing dropped.`);
    if (annotationsUnchanged) console.log(`  ${annotationsUnchanged} annotation(s) suppressed - their verdict has not moved since the last one.`);
    console.log(`  The queue is judgement only; accepting work stays a deliberate act. --arm writes them.`);
  } else {
    console.log(`  wrote ${written.length} record(s) to the belt${deferredByLimit ? `; ${deferredByLimit} act(s) held back by --arm-limit ${ARM_LIMIT}` : ""}`);
    console.log(`  of those, ${zoneAllowed.length} came from zones 2-5, which accept nothing - annotations only.`);
    if (annotationsUnchanged) console.log(`  ${annotationsUnchanged} incoming annotation(s) suppressed - their verdict has not moved since the last one.`);
    if (zoneUnchanged) console.log(`  ${zoneUnchanged} zone annotation(s) suppressed - their verdict has not moved since the last one.`);
    if (zoneDeferred) console.log(`  ${zoneDeferred} zone annotation(s) held back by --zone-annotate-limit ${ZONE_ANNOTATE_LIMIT}, least serious first. Nothing dropped.`);
  }
  if (!DRY) console.log(`  queue -> ${path.relative(ROOT, QUEUE).replace(/\\/g, "/")}  (good for ${humanMs(GOOD_FOR)})`);
}

// ---------------------------------------------------------------------------
function round1(n) {
  return Math.round(n * 10) / 10;
}
function fmt(v) {
  // An absent input renders as "absent", never as 0. A default for a missing
  // measurement is a fabrication, and 0 is the most convincing one available.
  return v === null || v === undefined ? "absent" : String(v);
}
function humanMs(v) {
  if (v === null || v === undefined) return "absent";
  const m = Math.round(v / MS.m);
  if (m < 60) return `${m}m`;
  const h = v / MS.h;
  if (h < 48) return `${h % 1 ? h.toFixed(1) : h}h`;
  return `${(v / MS.d).toFixed(1)}d`;
}
