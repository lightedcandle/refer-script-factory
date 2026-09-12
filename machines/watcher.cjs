#!/usr/bin/env node
/**
 * THE WATCHER - ZONE 1, INCOMING. What should be judged, in what order, by when.
 *
 * UNIVERSAL MACHINE. Resolves its subject repo from process.cwd(), never from
 * __dirname (precedent P13), and deposits to that repo's belt.
 *
 * ---------------------------------------------------------------------------
 * FIVE ZONES, AND THIS COVERS ONE
 * ---------------------------------------------------------------------------
 *
 * `watcher-has-five-zones`: the round covers incoming, the belt, the rail of
 * rhythms, the intake doors, and the closed pile - one per place work can stop
 * moving unnoticed. Its own recommendation is the reason this file covers one:
 *
 *   "A watcher that half-covers five zones reports confidently about places it
 *    cannot see, which is worse than a watcher that covers one zone honestly."
 *
 * So ZONES below names all five and marks four NOT COVERED, and every report
 * says so. Absence is not failure - a zone nobody watched is a different fact
 * from a zone that came back clean, and this machine must never let the first
 * read as the second.
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
 * FIVE OUTCOMES, NO MORE
 * ---------------------------------------------------------------------------
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
const { repoRootOf } = require("./session-life.cjs");

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
const ARM_LIMIT = (() => {
  const i = argv.indexOf("--arm-limit");
  if (i < 0) return Infinity;
  const n = Number(argv[i + 1]);
  return Number.isFinite(n) && n >= 0 ? n : Infinity;
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
// THE ZONES. Four of five are NOT COVERED and say so in every report.
// ---------------------------------------------------------------------------
const ZONES = [
  { id: "incoming", covered: true, what: "deposits awaiting triage and decisions held for him" },
  { id: "belt", covered: false, what: "open contracts and whether anything is actually moving" },
  { id: "rail", covered: false, what: "rhythms: declared cadence against what actually fired" },
  { id: "doors", covered: false, what: "auto, chat and spawn intake - are they open, are they pulling" },
  { id: "closed-pile", covered: false, what: "claimed-done work that closed nothing" },
];

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
  const lastSig = new Map();
  for (const rec of records) {
    if (!/^watched-/.test(String(rec.id || ""))) continue;
    lastSig.set(String(rec.subject), rec.watchSig === undefined ? null : rec.watchSig);
  }
  const annotationCandidates = byOutcome.COMPLETE.map(annotationFor);
  const wouldAnnotate = annotationCandidates.filter((a) => {
    const prior = lastSig.get(String(a.subject));
    return prior === undefined || prior === null || prior !== a.watchSig;
  });
  const annotationsUnchanged = annotationCandidates.length - wouldAnnotate.length;

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
    const lines = [...wouldAnnotate, ...actsAllowed.map(actFor)];
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
    watcher: "incoming",
    zonesCovered: ZONES.filter((z) => z.covered).map((z) => z.id),
    zonesNotCovered: ZONES.filter((z) => !z.covered).map((z) => ({ id: z.id, what: z.what })),
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
    wouldWrite: ARM ? written : [...wouldAnnotate.map((a) => a.id), ...actsAllowed.map((x) => `triaged-${String(x.r.id).slice(0, 60)}-*`)],
    deferredByArmLimit: deferredByLimit,
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
  console.log(`watcher [incoming]  ${queue.repo}  ${c.incoming} in incoming${DRY ? "   DRY - nothing written" : ""}${ARM ? "   ARMED" : ""}`);
  if (lockState.cleared)
    console.log(
      lockState.cleared.unreadable
        ? `  cleared an UNREADABLE lock (${lockState.cleared.reason}) - it named no holder, so nothing could be reasoned about it. If this recurs, something is writing the lock badly.`
        : `  cleared a stale lock from ${lockState.cleared.host} pid ${lockState.cleared.pid}, taken ${lockState.cleared.takenAt} - a run was killed mid-flight`,
    );
  if (unreadableLines) console.log(`  ${unreadableLines} belt line(s) would not parse and were skipped`);
  console.log(`  RAISE ${c.raise}   RETIRE ${c.retire}   PROMOTE ${c.promote}   COMPLETE ${c.complete}   HOLD ${c.hold} (silent)`);
  console.log(`  zones: incoming COVERED; ${ZONES.filter((z) => !z.covered).map((z) => z.id).join(", ")} NOT COVERED - this round says nothing about them`);
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
  if (!ARM) {
    console.log(`\n  Not armed. ${wouldAct.length} act(s) and ${wouldAnnotate.length} annotation(s) were computed and NOT written.`);
    if (annotationsUnchanged) console.log(`  ${annotationsUnchanged} annotation(s) suppressed - their verdict has not moved since the last one.`);
    console.log(`  The queue is judgement only; accepting work stays a deliberate act. --arm writes them.`);
  } else {
    console.log(`\n  wrote ${written.length} record(s) to the belt${deferredByLimit ? `; ${deferredByLimit} act(s) held back by --arm-limit ${ARM_LIMIT}` : ""}`);
    if (annotationsUnchanged) console.log(`  ${annotationsUnchanged} annotation(s) suppressed - their verdict has not moved since the last one.`);
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
