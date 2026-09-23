#!/usr/bin/env node
/**
 * ACCOUNT BUDGET - is the account refusing to run work RIGHT NOW?
 *
 * UNIVERSAL MACHINE. Reads the CLI's own transcript store, which is per-user
 * rather than per-repo, so it answers the same for every repo this factory
 * ticks. Nothing here is Telechurch-specific.
 *
 * Deposit `the-tick-shares-a-budget-with-the-work-it-watches`, 2026-09-12:
 * "The factory's heartbeat stopped for 25 minutes tonight because the work it
 * was watching spent the budget it needed to run." Its second recommendation is
 * the reason this file exists, and it names the address: "Throttle heavy
 * dispatch against the pulse: never let the factory spend on work what the
 * heartbeat needs to report that work. That is a scheduling rule, not a code
 * change, and IT BELONGS WHEREVER DISPATCH CAPACITY IS DECIDED - WHICH IS
 * INTAKE."
 *
 * ---------------------------------------------------------------------------
 * WHAT THE RULE TURNED OUT TO BE, NOW THAT THE HEARTBEAT IS SAFE
 * ---------------------------------------------------------------------------
 *
 * The deposit was written while the beat was a Claude routine on a five-minute
 * cron, so the thing it asked to protect was the beat. The beat moved out of
 * band on 2026-09-14 and is now a Windows task running node, and that it really
 * does survive a starved account is no longer assumed: Telechurch's
 * budget-independence station measured it on 2026-09-23 and returned PROVEN -
 * 172 account refusals across 375 minutes, 37 out-of-band readings inside that
 * stretch, every one of them ALIVE.
 *
 * So the heartbeat no longer needs protecting. The SPENDING does, and the same
 * measurement is what shows it: 311 refusals in twenty-four hours on that one
 * machine. Every one of those was a run the account would not serve. Among them
 * was the first dispatch of this very deposit - intake started it at 01:20Z, it
 * died at 01:37Z on "You've hit your session limit", and the item sat on the
 * belt marked HELD until the watcher noticed an hour later.
 *
 * That is the deposit's sentence with one word changed, and the change is the
 * whole finding: never let the factory spend A BELT SLOT on work THE ACCOUNT
 * CANNOT RUN. A door that keeps dispatching into a refusal manufactures dead
 * sessions at its own cadence, and every one of them looks exactly like work in
 * progress until something else goes and reads its transcript.
 *
 * ---------------------------------------------------------------------------
 * THE TEST, AND WHY EACH PART OF IT IS THE PART THAT CANNOT BE LEFT OUT
 * ---------------------------------------------------------------------------
 *
 * STARVED means all three at once:
 *
 *   1. The newest api-error naming a limit is inside the lookback.
 *   2. NOTHING HAS SUCCEEDED SINCE IT. Any assistant turn newer than that
 *      refusal, anywhere in the store, proves the account is serving again -
 *      because during a real starvation nothing can produce one. This is the
 *      release that matters, and it is instant.
 *   3. THE RESET TIME THE MESSAGE NAMES HAS NOT PASSED. "You've hit your
 *      session limit - resets 1:10am (America/New_York)" carries its own expiry,
 *      so the hold has an end the factory did not invent.
 *
 * WITHOUT (2) the door would hold through a recovery it could not see. WITHOUT
 * (3) IT WOULD DEADLOCK, and this is the failure worth stating plainly: the only
 * thing that starts Claude sessions here is this door. Hold it shut and nothing
 * runs; nothing running means no successful turn is ever written; no successful
 * turn means (2) never fires. The door would wait forever for evidence only it
 * could have produced. The reset stamp is the way out, and it is the account's
 * own statement rather than a timeout somebody chose.
 *
 * AN UNREADABLE RESET STAMP LICENSES NO HOLD. If the message names no reset
 * time this can parse, the answer is NOT STARVED and the door opens. That is
 * keep-alive.cjs's doctrine applied here - "a watchdog that acts on an absent
 * measurement acts forever" - and it fails in the cheap direction: the cost of
 * opening wrongly is one dead session, the cost of holding wrongly is a factory
 * that never starts another one.
 *
 * SELF-CORRECTING BY CONSTRUCTION. If the reset stamp is optimistic, the door
 * opens, the dispatch it sends dies on the limit, and that death writes a FRESH
 * refusal carrying a fresh reset time - so the door closes again having spent
 * one session to learn it. There is no state to get stuck in, because there is
 * no state: every run reads the record from scratch.
 *
 * ---------------------------------------------------------------------------
 * NOT THE SAME FILE AS budget-independence.cjs, AND DELIBERATELY SO
 * ---------------------------------------------------------------------------
 *
 * Telechurch carries tools/factory/budget-independence.cjs, which reads the same
 * transcripts. It asks a different question - did the BEAT keep beating through
 * a starvation that already happened - and answers it from history, overlapping
 * the account's refusals with the keep-alive watchdog's ten-minute readings.
 * This file asks whether the account is refusing NOW and acts on the answer.
 * One is a proof about the past, the other is a gate on the present; merging
 * them would give a gate that has to be right about history to let work out.
 * They live in different repos and cannot share code in any case.
 *
 *   node machines/account-budget.cjs             report
 *   node machines/account-budget.cjs --json      machine-readable
 *   node machines/account-budget.cjs --self-test drive every case, read nothing
 */
const fs = require("fs");
const path = require("path");

const HOME = process.env.USERPROFILE || process.env.HOME || "";
const PROJECTS = path.join(HOME, ".claude", "projects");

const MS = { m: 60000, h: 3600000 };

// HOW FAR BACK A REFUSAL STILL COUNTS. Six hours covers the longest reset
// horizon these messages have been seen to name on this machine ("resets 6:10am"
// stamped at 06:27, and five-hour windows elsewhere). Older than that and the
// reset test in (3) would have released it anyway, so the lookback only bounds
// the scan rather than deciding anything.
const LOOKBACK_MS = 6 * MS.h;

// Only the end of each transcript is read. Both facts this needs - the newest
// refusal and the newest success - are by definition at the end, and a session
// transcript can run to megabytes.
const TAIL_BYTES = 256 * 1024;
const MAX_FILES = 3000;

// A reset stamp further out than this is not a reset stamp, it is a misparse.
// Weekly limits name a time of day, never a date, so the true answer is always
// inside a day; two is margin, not a measurement.
const MAX_RESET_AHEAD_MS = 2 * 24 * MS.h;

// See budget-independence.cjs for the same pattern and the case that forced it.
// "<hit|reached> your <one word> limit" and not the two words loose in a
// sentence: "I have reached your file and found no limit on what it can do"
// matched the looser version.
const LIMIT_RE = /\b(?:hit|reached) your [\w-]+ limit\b/i;

// "- resets 1:10am (America/New_York)" and "- resets 3pm (America/New_York)".
// The zone is required, not optional: a wall-clock time with no zone cannot be
// turned into an instant, and guessing the machine's own zone would be a
// judgement dressed as a read.
const RESET_RE = /resets?\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*\(([A-Za-z_]+\/[A-Za-z_+-]+)\)/i;

// ---------------------------------------------------------------------------
// wall-clock in a named zone -> an instant
// ---------------------------------------------------------------------------

function partsIn(ms, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = {};
  for (const part of dtf.formatToParts(new Date(ms))) if (part.type !== "literal") p[part.type] = part.value;
  // Some ICU builds render midnight as hour 24 under hour12:false.
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
}

/** The zone's offset from UTC at that instant, in ms. */
function offsetAt(ms, timeZone) {
  const p = partsIn(ms, timeZone);
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
}

/** The instant at which the zone's wall clock reads that date and time. */
function epochOfLocal(y, mo, d, h, mi, timeZone) {
  const wall = Date.UTC(y, mo - 1, d, h, mi, 0);
  // Two passes: the first uses the offset at the wrong instant, the second uses
  // the offset at very nearly the right one, which settles every case except an
  // hour that does not exist - and a reset stamp inside a spring-forward gap is
  // reported as unreadable rather than guessed at.
  let ms = wall - offsetAt(wall, timeZone);
  ms = wall - offsetAt(ms, timeZone);
  return ms;
}

/**
 * The first instant after `afterMs` at which the zone's clock reads h:mm.
 * @returns {number|null} null when the wall time does not exist that day
 */
function nextOccurrence(afterMs, hour12, minute, ampm, timeZone) {
  let h = hour12 % 12;
  if (/pm/i.test(ampm)) h += 12;
  const p = partsIn(afterMs, timeZone);
  for (const addDays of [0, 1, 2]) {
    const day = new Date(Date.UTC(p.y, p.mo - 1, p.d) + addDays * 24 * MS.h);
    const ms = epochOfLocal(day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate(), h, minute, timeZone);
    // Round-trip: if the instant does not read back as the wall time asked for,
    // that wall time did not happen (a DST gap) and this refuses to invent one.
    const back = partsIn(ms, timeZone);
    if (back.h !== h || back.mi !== minute) continue;
    if (ms > afterMs) return ms;
  }
  return null;
}

/** The instant the limit named in this message lifts, or null if unreadable. */
function resetAtOf(text, refusedAt) {
  const m = RESET_RE.exec(String(text || ""));
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (!(hour >= 1 && hour <= 12) || !(minute >= 0 && minute <= 59)) return null;
  let at;
  try {
    at = nextOccurrence(refusedAt, hour, minute, m[3], m[4]);
  } catch {
    return null; // an unknown zone name is an unreadable stamp, not a crash
  }
  if (at === null || at - refusedAt > MAX_RESET_AHEAD_MS) return null;
  return at;
}

// ---------------------------------------------------------------------------
// THE VERDICT - pure, so every branch can be driven without a starved account
// ---------------------------------------------------------------------------

/**
 * @param {{refusal:{at:number,text:string,resetAt:number|null}|null, lastSuccessAt:number|null, now:number}} f
 */
function decide({ refusal, lastSuccessAt, now }) {
  if (!refusal) {
    return { starved: false, why: `the account has refused nothing in the last ${Math.round(LOOKBACK_MS / MS.h)}h` };
  }
  const when = new Date(refusal.at).toISOString();
  if (lastSuccessAt !== null && lastSuccessAt > refusal.at) {
    return {
      starved: false,
      why: `the account refused a run at ${when}, but something ran successfully at ${new Date(lastSuccessAt).toISOString()} afterwards - it is serving again`,
    };
  }
  if (refusal.resetAt === null) {
    return {
      starved: false,
      why: `the account refused a run at ${when} and nothing has succeeded since, but the message names no reset time this can read ("${String(refusal.text).slice(0, 80)}") - an unreadable measurement licenses no hold, so the door stays open and one dispatch will find out`,
    };
  }
  if (now >= refusal.resetAt) {
    return {
      starved: false,
      why: `the account refused a run at ${when} and the limit it named lifted at ${new Date(refusal.resetAt).toISOString()}`,
    };
  }
  return {
    starved: true,
    why:
      `the account refused a run at ${when}, nothing has succeeded since, and the limit it named does not lift until ` +
      `${new Date(refusal.resetAt).toISOString()} (${Math.round((refusal.resetAt - now) / MS.m)}m away). ` +
      "Dispatching now spends a belt slot on a session the account will not serve.",
    holdsUntil: refusal.resetAt,
  };
}

// ---------------------------------------------------------------------------
// reading the store
// ---------------------------------------------------------------------------

/**
 * The newest limit refusal and the newest successful turn, across every
 * transcript touched inside the lookback.
 */
function readStore(now) {
  const notes = { scanned: 0, skipped: 0, unreadable: 0, truncated: false };
  if (!HOME || !fs.existsSync(PROJECTS)) {
    return { observable: false, why: `no transcript store at ${PROJECTS} - this machine cannot see whether the account is serving`, refusal: null, lastSuccessAt: null, notes };
  }
  const since = now - LOOKBACK_MS;
  let refusal = null;
  let lastSuccessAt = null;
  let dirs;
  try {
    dirs = fs.readdirSync(PROJECTS, { withFileTypes: true }).filter((d) => d.isDirectory());
  } catch (e) {
    return { observable: false, why: `transcript store unreadable: ${String(e.message || e).split("\n")[0]}`, refusal: null, lastSuccessAt: null, notes };
  }
  for (const d of dirs) {
    let files;
    try {
      files = fs.readdirSync(path.join(PROJECTS, d.name));
    } catch {
      continue;
    }
    for (const f of files) {
      if (!f.endsWith(".jsonl")) continue;
      if (notes.scanned >= MAX_FILES) {
        notes.truncated = true;
        break;
      }
      const p = path.join(PROJECTS, d.name, f);
      let st;
      try {
        st = fs.statSync(p);
      } catch {
        continue;
      }
      if (st.mtimeMs < since) {
        notes.skipped++;
        continue;
      }
      notes.scanned++;
      let text;
      try {
        const fd = fs.openSync(p, "r");
        try {
          const start = Math.max(0, st.size - TAIL_BYTES);
          if (start > 0) notes.truncated = true;
          const buf = Buffer.alloc(Math.min(st.size, TAIL_BYTES));
          fs.readSync(fd, buf, 0, buf.length, start);
          text = buf.toString("utf8");
        } finally {
          fs.closeSync(fd);
        }
      } catch {
        notes.unreadable++;
        continue;
      }
      for (const line of text.split("\n")) {
        if (line.indexOf('"assistant"') < 0) continue;
        let e;
        try {
          e = JSON.parse(line);
        } catch {
          continue; // a torn first line from the tail cut is not a verdict
        }
        if (!e || e.type !== "assistant") continue;
        const t = Date.parse(e.timestamp || "");
        if (!Number.isFinite(t) || t < since) continue;
        if (e.isApiErrorMessage) {
          const c = e.message && e.message.content;
          const said = typeof c === "string" ? c : Array.isArray(c) ? c.map((b) => (b && typeof b.text === "string" ? b.text : "")).join(" ") : "";
          if (!LIMIT_RE.test(said)) continue; // a lost connection is not a starvation
          if (!refusal || t > refusal.at) refusal = { at: t, text: said.replace(/\s+/g, " ").trim().slice(0, 160), resetAt: null };
          continue;
        }
        // ANY assistant turn that is not an error is the account serving. It
        // does not matter which repo or which session produced it.
        if (lastSuccessAt === null || t > lastSuccessAt) lastSuccessAt = t;
      }
    }
  }
  if (refusal) refusal.resetAt = resetAtOf(refusal.text, refusal.at);
  return { observable: true, refusal, lastSuccessAt, notes };
}

/**
 * Is the account refusing to run work right now?
 *
 * NEVER THROWS AND NEVER HOLDS ON AN UNREADABLE STORE. A caller asking this
 * question is about to decide whether to dispatch, and a gate that fails closed
 * on its own bug stops the factory.
 */
function accountStarved(now = Date.now()) {
  let store;
  try {
    store = readStore(now);
  } catch (e) {
    return { starved: false, why: `could not read the transcript store (${String(e.message || e).split("\n")[0]}) - an unreadable measurement licenses no hold`, observable: false };
  }
  if (!store.observable) return { starved: false, why: `${store.why} - an unreadable measurement licenses no hold`, observable: false };
  const v = decide({ refusal: store.refusal, lastSuccessAt: store.lastSuccessAt, now });
  return {
    ...v,
    observable: true,
    refusal: store.refusal ? { at: new Date(store.refusal.at).toISOString(), text: store.refusal.text, resetAt: store.refusal.resetAt ? new Date(store.refusal.resetAt).toISOString() : null } : null,
    lastSuccessAt: store.lastSuccessAt ? new Date(store.lastSuccessAt).toISOString() : null,
    scan: store.notes,
    store: PROJECTS,
  };
}

module.exports = { accountStarved, decide, resetAtOf, nextOccurrence, LIMIT_RE, RESET_RE, LOOKBACK_MS };

// ---------------------------------------------------------------------------

if (require.main === module) {
  const argv = process.argv.slice(2);

  if (argv.includes("--self-test")) {
    const NOW = Date.parse("2026-09-23T05:40:00Z"); // 01:40 in America/New_York
    let failed = 0;
    const check = (name, got, want) => {
      const ok = got === want;
      if (!ok) failed++;
      console.log(`  ${ok ? "ok  " : "FAIL"} ${name}  ->  ${got}${ok ? "" : ` (wanted ${want})`}`);
    };

    // the verdict, over every branch
    const ref = (at, resetAt) => ({ at, text: "You've hit your session limit - resets 2am (America/New_York)", resetAt });
    check("no refusal is not starved", decide({ refusal: null, lastSuccessAt: NOW - MS.h, now: NOW }).starved, false);
    check("a success after the refusal releases it", decide({ refusal: ref(NOW - 30 * MS.m, NOW + MS.h), lastSuccessAt: NOW - 5 * MS.m, now: NOW }).starved, false);
    check("a success BEFORE the refusal does not release it", decide({ refusal: ref(NOW - 5 * MS.m, NOW + MS.h), lastSuccessAt: NOW - 30 * MS.m, now: NOW }).starved, true);
    check("no success at all and a live limit is starved", decide({ refusal: ref(NOW - 5 * MS.m, NOW + MS.h), lastSuccessAt: null, now: NOW }).starved, true);
    check("an unreadable reset stamp never holds", decide({ refusal: ref(NOW - 5 * MS.m, null), lastSuccessAt: null, now: NOW }).starved, false);
    check("a reset that has already passed releases it", decide({ refusal: ref(NOW - 2 * MS.h, NOW - MS.h), lastSuccessAt: null, now: NOW }).starved, false);
    check("a reset exactly now releases it", decide({ refusal: ref(NOW - 2 * MS.h, NOW), lastSuccessAt: null, now: NOW }).starved, false);

    // the wordings, from the three seen on this machine
    const wording = [
      ["You've hit your session limit · resets 1:10am (America/New_York)", true],
      ["You've hit your weekly limit · resets 3pm (America/New_York)", true],
      ["You've reached your Fable limit. Switch to another model, or manage usage credits", true],
      ["API Error: Connection lost mid-response. The response above may be incomplete.", false],
      ["Failed to authenticate: OAuth session expired and could not be refreshed", false],
      ["I have reached your file and found no limit on what it can do", false],
    ];
    for (const [text, want] of wording) check(`wording ${want ? "counts" : "ignored"}: "${text.slice(0, 48)}"`, LIMIT_RE.test(text), want);

    // the reset stamp, turned into an instant. 05:40Z is 01:40 in New York, so
    // "resets 2am" is twenty minutes away and "resets 1:10am" is tomorrow.
    check(
      "resets 2am from 01:40 local is 20 minutes later",
      resetAtOf("You've hit your session limit · resets 2am (America/New_York)", NOW),
      Date.parse("2026-09-23T06:00:00Z"),
    );
    check(
      "resets 1:10am from 01:40 local is tomorrow, not forty minutes ago",
      resetAtOf("You've hit your session limit · resets 1:10am (America/New_York)", NOW),
      Date.parse("2026-09-24T05:10:00Z"),
    );
    check(
      "resets 3pm from 01:40 local is this afternoon",
      resetAtOf("You've hit your weekly limit · resets 3pm (America/New_York)", NOW),
      Date.parse("2026-09-23T19:00:00Z"),
    );
    check("a message with no reset stamp reads as unreadable", resetAtOf("You've reached your Fable limit. Switch to another model", NOW), null);
    check("a reset with no zone reads as unreadable", resetAtOf("You've hit your session limit · resets 2am", NOW), null);
    check("an unknown zone reads as unreadable", resetAtOf("resets 2am (Mars/Olympus)", NOW), null);
    check("an impossible hour reads as unreadable", resetAtOf("resets 19pm (America/New_York)", NOW), null);

    // A zone that is not the machine's own, so a bug that quietly used local
    // time would show up here rather than passing by coincidence.
    check(
      "resets 2am in London, read from a New York machine",
      resetAtOf("resets 2am (Europe/London)", NOW),
      Date.parse("2026-09-24T01:00:00Z"),
    );

    // The live path must never throw and must never hold on its own failure.
    const live = accountStarved();
    check("the live reader returns a boolean", typeof live.starved, "boolean");

    console.log(failed ? `\naccount-budget self-test: ${failed} FAILED` : "\naccount-budget self-test: all passed");
    process.exit(failed ? 1 : 0);
  }

  const v = accountStarved();
  if (argv.includes("--json")) {
    console.log(JSON.stringify(v, null, 2));
  } else {
    console.log(`account-budget: ${v.starved ? "STARVED" : "SERVING"}  ${v.why}`);
    if (v.refusal) console.log(`  newest refusal  ${v.refusal.at}  resets ${v.refusal.resetAt || "(unreadable)"}\n                  "${v.refusal.text}"`);
    if (v.lastSuccessAt) console.log(`  newest success  ${v.lastSuccessAt}`);
    if (v.scan) console.log(`  scan            ${v.scan.scanned} transcript(s) read, ${v.scan.skipped} untouched in the window, ${v.scan.unreadable} unreadable`);
  }
  process.exit(0);
}
