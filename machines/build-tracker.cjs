#!/usr/bin/env node
/**
 * BUILD TRACKER - renders the operator's Living Factory Tracker design against
 * real factory state.
 *
 * The design arrived 2026-09-11 as a Design Component export. It is used as
 * designed: same 1920x1080 board scaled to the viewport, same dark oklch
 * palette, same Space Grotesk / JetBrains Mono pairing, same four-corner track
 * with TIMER, WATCHER, SUPERVISOR and BUILDER, same three carriers circulating
 * it on 40s orbits, same deposits feed, NEEDS YOU panel, LOOPS grid, UPCOMING
 * list and footer. Nothing was dropped and nothing was restyled.
 *
 * What changed is only what the design could not know: every value it showed as
 * a demo constant is now read from the factory itself.
 *
 *   feed                .claude/agent-context/findings.jsonl   the belt
 *   openCount/leakCount  ditto, by trigger
 *   NEEDS YOU            .claude/agent-context/pulse.json + operator-addressed
 *                        belt records
 *   LOOPS / UPCOMING     .claude/agent-context/clock-state.json + every
 *                        tools/**\/*.station.json declaration
 *   routes proven        the factory route register
 *   hive channels        tracker-extras.json, written by a session that can see
 *                        them (a script cannot)
 *
 * WHY IT IS BUILT AND REPUBLISHED RATHER THAN FETCHING
 *
 * A published artifact has no network egress, so the page cannot poll. That is
 * not a limitation to work around here - it is the right shape: the board
 * updates when the FACTORY updates it, at factory tempo, which is what the
 * cycle already does. The clock, the animations and the reveal stay live in the
 * page; the data is true as of the last build, and the board says so.
 *
 * WHERE THIS FILE LIVES, since 2026-09-14: `<factory>/machines/build-tracker.cjs`.
 * It was `E:/Telechurch-e2e-v2/tools/factory/build-tracker.cjs` until then, and
 * it is a MACHINE by P13 - it asks what is true in the repo it is pointed at and
 * renders the answer - so one copy now serves every repo, resolving its subject
 * from `--root` or the working directory like every other machine here.
 *
 *   node <factory>/machines/build-tracker.cjs [--root <repo>] [--out <path>]
 */
const fs = require("fs");
const path = require("path");

// THE SUBJECT IS A PARAMETER. `--root <repo>` builds the board FOR that repo:
// its belt, its schedule, its triggers, its transcripts. Without it, the repo
// this file lives in - as it always was. Operator, 2026-09-14: "lets wire the
// script factory repo in the board ... select it as default." The scheduler
// took the same flag the same day; the two must agree on what "the subject"
// means, and they do: the directory whose .claude/agent-context is read.
const ROOT = (() => {
  const i = process.argv.indexOf("--root");
  if (i >= 0 && process.argv[i + 1]) {
    const asked = path.resolve(process.argv[i + 1]);
    // A --root THAT IS NOT A DIRECTORY IS NOT A SUBJECT. On 2026-09-14 the
    // wiring workers ran wire-repo.mjs inside their own worktrees, so eight
    // committed declarations named `--root <repo>/.claude/worktrees/...`, a
    // path that vanished when the worktrees were removed. A build against a
    // missing directory would have written a board about nothing. The child
    // tick runs every station with its working directory set to the subject,
    // so the working directory is the honest fallback - and the fall-back is
    // said out loud on the console, because a declaration that names a dead
    // path is a stale claim to be corrected at its source, not hidden here.
    if (fs.existsSync(asked) && fs.statSync(asked).isDirectory()) return asked;
    console.error(`build-tracker: --root ${asked} is not a directory; building the working directory ${process.cwd()} instead. Correct the declaration.`);
    return process.cwd();
  }
  // No --root: the working directory IS the subject. This was
  // `path.resolve(__dirname, "../..")` while the file lived in the product
  // repo, where it happened to mean the same thing; from `<factory>/machines/`
  // it would mean the factory, whatever repo the board was being built for.
  // The scheduler spawns every station with cwd set to the subject, so the two
  // branches of this function now agree by construction rather than by luck.
  return process.cwd();
})();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
// The schedule. Both filenames are read for one release: the rename cannot land
// in every tree at once, so a board built here may be reading a state file
// written by a tree that has not taken the commit yet. Reading only the new name
// would make every trigger look as though it had never run, which is what the
// liveness lamp escalates on - a rename that reports a dead factory.
const SCHEDULE_FILES = [path.join(CTX, "schedule-state.json"), path.join(CTX, "clock-state.json")];
const PULSE = path.join(CTX, "pulse.json");
const EXTRAS = path.join(CTX, "tracker-extras.json");

const argOf = (f) => {
  const i = process.argv.indexOf(f);
  return i >= 0 ? process.argv[i + 1] : null;
};
// NOT under public/. The board carries internal factory state, and public/ is
// served by Pages - a default that quietly publishes it to the open web would be
// a decision nobody made. It is built here and published deliberately, as an
// artifact, by whoever is asked to.
const OUT = argOf("--out") || path.join(CTX, "factory-tracker.html");

const readJson = (p, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
};

// ---- the belt's KIND vocabulary, from the factory that owns it ---------------
//
// A record has a KIND as well as a state: NOTE, DEPOSIT, CONTRACT or DECISION.
// Only a CONTRACT may ride the belt, be dispatched, or count toward open work.
// The rules live in the machines, next to the manager and the workers that read
// the same belt, because this is factory law rather than this repo's opinion.
//
// REQUIRED, not optional, and the failure is loud. This file has carried eight
// copies of one rule and four of them were wrong in the same direction; a ninth
// copy kept here "just in case the module is missing" would be that mistake made
// deliberately. A board that cannot classify a record cannot honestly draw one,
// and a build that stops is louder than a board that quietly guesses - the last
// build stays served, with its own build time on it, until this is fixed.
//
// IT IS A SIBLING NOW. This file moved into `<factory>/machines/` on
// 2026-09-14, so kind.cjs is the file next to it and is resolved by location.
// The search that stood here - environment, then a hardcoded
// E:/refer-script-factory, then a guess at a sibling of the SUBJECT - was the
// cost of living in a different repo from the vocabulary, and after the move it
// would only be a way to classify this repo's belt with another factory's rules.
const KINDLIB = (() => {
  const tried = [path.join(__dirname, "kind.cjs")];
  for (const p of tried) {
    if (!fs.existsSync(p)) continue;
    return require(p);
  }
  console.error(
    "build-tracker: the belt's kind vocabulary is missing, so no record can be classified.\n" +
      tried.map((p) => `  tried ${p}`).join("\n") +
      "\nIt ships beside this file, so its absence means a broken factory install. Nothing was written.",
  );
  process.exit(2);
})();
const KIND = KINDLIB.KIND;
// Lifted here rather than re-implemented in rowOf, for the reason the README
// gives: there is one copy of the belt's vocabulary and this is part of it.
const headlineOf = KINDLIB.headlineOf;
const reasonOf = KINDLIB.reasonOf;

// ---- the design's own palette, lifted verbatim ------------------------------

const HUE = {
  body: "oklch(0.74 0.13 55)",
  mind: "oklch(0.74 0.13 195)",
  spirit: "oklch(0.74 0.13 310)",
  hive: "oklch(0.74 0.13 310)",
  chat: "oklch(0.74 0.13 310)",
  law: "oklch(0.74 0.13 55)",
  sup: "oklch(0.72 0.13 150)",
  shed: "oklch(0.72 0.13 150)",
  arch: "oklch(0.72 0.13 150)",
  build: "oklch(0.88 0.008 85)",
  dev: "oklch(0.88 0.008 85)",
};

// Belt dimensions -> the tags the design's feed uses.
const TAG = {
  body: "body",
  mind: "mind",
  spirit: "spirit",
  hive: "hive",
  refer: "law",
  development: "dev",
  architecture: "arch",
  practice: "chat",
  pulse: "sup",
};

// ---- read the factory -------------------------------------------------------

const records = fs.existsSync(BELT)
  ? fs
      .readFileSync(BELT, "utf8")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
  : [];

// Normalised on the way in, so nothing downstream has to know the rename
// happened: whichever file and whichever key is on disk, this is `.triggers`.
// `board-critic` became `manager` and its history moves with it - a trigger
// that keeps its work but loses its name would read as NEVER RUN.
// `from` is the file this state was actually read out of. A panel that says
// "last fired 03:55" has to be able to name where it learned that, and the two
// filenames above mean the answer is not knowable from the constant - only from
// which one happened to be on disk.
const schedule = (() => {
  for (const f of SCHEDULE_FILES) {
    const s = readJson(f, null);
    if (!s) continue;
    const triggers = s.triggers || s.stations || {};
    if (triggers["board-critic"] && !triggers.manager) triggers.manager = triggers["board-critic"];
    delete triggers["board-critic"];
    return { triggers, from: path.relative(ROOT, f).replace(/\\/g, "/") };
  }
  return { triggers: {}, from: null };
})();
const pulse = readJson(PULSE, null);
const extras = readJson(EXTRAS, {});

// Trigger declarations carry their own cadence - the schedule lives beside the
// machinery, so this reads it from there rather than repeating it.
//
// Both suffixes for one release, and a declaration seen under both names counts
// ONCE: a tree caught mid-rename would otherwise double every total computed
// from this list, and two clean reads look exactly like one.
const TRIGGER_SUFFIXES = [".trigger.json", ".station.json"];
const stations = [];
{
  const seen = new Set();
  for (const rel of ["tools", "tools/factory", "scripts"]) {
    const dir = path.join(ROOT, rel);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!TRIGGER_SUFFIXES.some((s) => f.endsWith(s))) continue;
      const d = readJson(path.join(dir, f), null);
      if (!d || !d.id || seen.has(d.id)) continue;
      seen.add(d.id);
      // WHERE IT WAS DECLARED, CARRIED WITH IT.
      //
      // Rule 1 of click-to-explain: every field a panel shows names the file and
      // the field it came from, so a claim can be checked without reading code.
      // That is impossible after the fact - by the time the board is drawing a
      // cadence, the path that supplied it has been thrown away - so the path is
      // recorded here, at the only moment it is known. The scheduler already
      // records this under the same name; matching it means the two never
      // disagree about where a trigger lives.
      //
      // AN EXTERNALLY DRIVEN RHYTHM DECLARES `drivenBy` INSTEAD OF `run`. It is
      // discovered, counted and drawn exactly like the others, and this repo's
      // scheduler never fires it. Recorded as its own kind so a panel can say
      // WHAT drives it rather than reporting a missing `run` as a defect.
      stations.push({
        ...d,
        kind: d.kind || (d.drivenBy ? "external" : "schedule"),
        declaredIn: path.relative(ROOT, path.join(dir, f)).replace(/\\/g, "/"),
      });
    }
  }
}

// "Routes proven" counts MACHINERY a route names, over all machinery - the same
// measure the census reports. Counting routes over scripts would mix units and
// read as catastrophically worse than it is (4 routes name 13 scripts).
let scriptsRegistered = null;
let scriptsTotal = null;
try {
  const regCandidates = [
    process.env.REFER_OS_ROOT && path.join(process.env.REFER_OS_ROOT, "REFER.OS/manifests/factory.routes.json"),
    "E:/refer.os/REFER.OS/manifests/factory.routes.json",
  ].filter(Boolean);
  const regPath = regCandidates.find((p) => fs.existsSync(p));
  if (regPath) {
    const named = new Set();
    for (const r of readJson(regPath, { routes: [] }).routes || []) {
      for (const st of r.stations || []) if (st.machinery) named.add(path.basename(String(st.machinery)));
    }
    scriptsRegistered = named.size;
  }
  const countScripts = (dir) => {
    let n = 0;
    if (!fs.existsSync(dir)) return n;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) n += countScripts(path.join(dir, e.name));
      else if (/\.(c?js|mjs|ps1)$/.test(e.name)) n++;
    }
    return n;
  };
  scriptsTotal = countScripts(path.join(ROOT, "tools"));
} catch {
  /* a missing register is reported as unknown, never as zero */
}

// ---- derive every field the design binds ------------------------------------

const now = Date.now();
const MS = { m: 60000, h: 3600000, d: 86400000 };
const pad = (n) => String(n).padStart(2, "0");
const hhmm = (ts) => {
  const d = new Date(ts);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
};
const ago = (ts) => {
  if (!ts) return "never";
  const d = now - ts;
  if (d < MS.h) return Math.max(1, Math.round(d / MS.m)) + "m ago";
  if (d < MS.d) return Math.round(d / MS.h) + "h ago";
  return Math.round(d / MS.d) + "d ago";
};
const inWords = (ms) => {
  if (ms <= 0) return "due";
  if (ms < MS.h) return Math.max(1, Math.ceil(ms / MS.m)) + "m";
  if (ms < MS.d) {
    const h = Math.floor(ms / MS.h);
    const m = Math.round((ms % MS.h) / MS.m);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return Math.round(ms / MS.d) + "d";
};
const durMs = (spec) => {
  const m = String(spec || "").match(/^(\d+(?:\.\d+)?)\s*([smhd])$/i);
  if (!m) return null;
  return Number(m[1]) * { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2].toLowerCase()];
};

const runAt = (r) => {
  const t = Date.parse(r.run || "");
  return Number.isNaN(t) ? null : t;
};

// Open means addressed to somebody AND not yet closed by a later record.
//
// The second half was missing, and it was missing in four separate places -
// this count, the per-carrier loads, the circulating total, and the row split.
// Each one re-derived "open" from the trigger string alone, so a finding that
// had been closed by a later record still rode a carrier, still counted against
// its domain, and still sat in his column. One rule, written four times, wrong
// in all four.
//
// isDone and closedBy are declared below and only read when this is CALLED,
// which happens well after they exist.
//
// OPEN NOW MEANS A CONTRACT SOMEBODY STILL OWES, and nothing else.
//
// Operator, 2026-09-12: "don't put notifications on the belt, only contracts to
// be processed." Open counts, domain tallies and age alarms count contracts
// only. A deposit has not been accepted as work, so nobody is late on it; a note
// is not work at all; a decision is his and is counted in his own column. Every
// number derived from this - the carrier loads, the circulating total, the
// waiting-by-domain list, the stale alarm - inherits the narrowing, which is the
// point: one definition, and the arithmetic follows it.
const isOpen = (r) => IX.isOpenContract(r);
const isAwaitingTriage = (r) => IX.isAwaitingTriage(r);
const isHeldDecision = (r) => IX.isOpenDecision(r);
const isLeak = (r) => !r.triggers || !String(r.triggers).trim();

// ---- the belt has a vocabulary, and a word outside it is a fault -------------
//
// Every record names what it triggers. Four shapes are legal:
//
//   terminal:<word>   finished. The word says how it ended.
//   contract:<dim>    a domain owes work on it.
//   operator          it is his.
//   seer              it needs looking at.
//
// Anything else used to be filed silently as OPEN WORK, which is how two
// resolution records written as "closed" instead of "terminal:closed" ended up
// on the board as unfinished problems - and would have been counted against the
// factory in the trust line below. A typo became a permanent false accusation.
//
// So an unrecognised word is now REPORTED rather than guessed at. The board
// cannot fix a vocabulary mistake, but it can refuse to hide one. "closed" is
// accepted as terminal because its meaning is not in doubt, and the machines
// that wrote it now write terminal:closed.
const TRIGGER_OK = (t) => /^(terminal:.+|contract:.+|operator|seer|closed)$/.test(String(t || "").trim());
const badVocabulary = () => records.filter((r) => !isLeak(r) && !TRIGGER_OK(r.triggers));

// Declared HERE, above every use. It sat below openIds and closedCount, which
// read the same rule by hand instead - three copies of one definition, and the
// copies had already drifted. Moving it up rather than calling it from above is
// the difference between working code and the before-initialization error this
// file has thrown three times.
const selfTerminal = KINDLIB.selfTerminal;

// ---- A FINDING MUST BE ABLE TO DIE ------------------------------------------
//
// Until now it could not. A record counted as finished only if ITS OWN trigger
// was terminal, and an append-only belt cannot rewrite a record - so closing
// something meant appending a new record that named it. The new record appeared
// in RESOLVED and the original stayed in INCOMING, open, forever.
//
// The consequence is the whole complaint: every fix ADDED an item to the left
// column instead of removing one, so the open count could only climb, and the
// harder the factory worked the worse it looked. Two items were sitting in his
// NEEDS YOU column at the moment this was found - both already fixed, both with
// their closures visible in the right column a few inches away.
//
// Found by looking at the photograph. The counts were all self-consistent, every
// arithmetic check passed, and the board was still wrong.
//
// So: a record is finished if it says so itself, OR if a later record names it
// as subject and that record is terminal. That is what "append-only" was always
// supposed to mean - the history is the state, and a later entry can change what
// an earlier one means without touching it.
// NOT EVERY TERMINAL RECORD CLOSES WHAT IT NAMES.
//
// Attaching a lesson to a finding closed it. So did attaching a recommendation.
// Both are annotations - they say "this was written down", not "this was fixed"
// - and reading them as resolutions made four open problems disappear from his
// column the moment somebody explained them. Explaining a problem is the
// opposite of fixing it.
//
// Caught by watching the open count fall from 14 to 10 after writing twelve
// lessons, which is the kind of thing that looks like progress if you are not
// reading carefully.
//
// So the trigger word decides, and the two lists are written down rather than
// implied: a word that means FINISHED closes; a word that means NOTED does not.
// ONE INDEX, READ FROM ONE PLACE. What closes a finding, what is bookkeeping,
// and what KIND a record is were all written out by hand here - and the same
// rules were written out by hand in five machines beside this one. They drifted
// every time, which this file's own comments record seven times over. They now
// come from kind.cjs, which is the only copy.
const IX = KINDLIB.beltIndex(records);
const NOTING = IX.NOTING;
const closedBy = IX.closedBy;
const isDone = IX.isDone;

// A record that exists only to close another one is bookkeeping, not an outcome
// of its own. It must not be counted twice, and it must not show up in RESOLVED
// as a separate achievement next to the thing it closed.
const recordIds = IX.ids;
const isCloser = IX.isCloser;

// An annotation is not shown as a row of its own either. "Lesson recorded from
// the finding above" is not an achievement; the lesson belongs to the finding
// and appears in the classroom, not as twelve extra lines in RESOLVED.
//
// terminal:triaged joins that family. Accepting a deposit as work is not
// finishing it - and because a terminal record naming a subject normally CLOSES
// that subject, a triage act that was not in this family would file work as done
// the instant somebody agreed to do it.
const isAnnotation = IX.isAnnotation;

// The kind of a record, and the three questions the rest of the board asks about
// kind. Only a contract is OPEN WORK; a deposit has not been judged yet and a
// decision is his.
const kindOf = IX.kindOf;

// ---- EVERY FINDING SHOULD ARRIVE WITH A RECOMMENDATION ----------------------
//
// Operator, 2026-09-11: "With the incoming, we need to attach recommendations to
// the metadata so the agent can act on the recommendation, or for the things
// that need me I can see the best options and what the complaint implies is
// needed. I won't always know the best course of action and need
// recommendations."
//
// The board has been handing him diagnoses. A diagnosis with no recommendation
// moves the work to the reader - which for a machine-addressed record means the
// next station has to re-derive what to do, and for one addressed to HIM means
// the board has handed a thought developer an implementation question, which is
// the failure his whole corpus is written against.
//
// Two fields, and both are optional because an honest absence beats an invented
// recommendation:
//
//   recommend   one line: what should happen. For a contract:<dim> record this
//               is the instruction the next agent acts on. For an operator
//               record it is the course being recommended TO him.
//   options     only for records that are genuinely his - two or three named
//               outcomes, each with its consequence, so his answer is a word
//               rather than an afternoon.
//
// A LATER RECORD CAN SUPPLY THEM. The belt is append-only, so a finding
// deposited before this existed can still gain a recommendation: a later record
// naming it as subject and carrying `recommend` is merged onto it. The newest
// one wins, which is also how a recommendation gets REVISED when the first one
// turns out to be wrong.
// ---- THE CLASSROOM: what he knows now that he did not ------------------------
//
// Operator, 2026-09-11: "I should gain understanding of my system. Each time I
// look on the board, the things that I may have not known before, I know now. So
// the board becomes a classroom that's teaching me. It also becomes a planner."
//
// That is a harder standard than it sounds, and it kills the display this board
// used to be. A status board may repeat itself forever; a CLASSROOM MAY NOT.
// If he looks and learns nothing new, the visit was wasted.
//
// Two things follow, and the second is the one with teeth:
//
//   1. The board must know what he has already seen. Opening a row is the read
//      receipt - a deliberate act, unlike the page merely being displayed on an
//      always-on monitor, which proves nothing about whether anyone read it.
//
//   2. A finding is not a lesson. "The filter never filtered" is an incident.
//      "Verify what a person would see, never the flag you just set" is the
//      thing worth carrying to the next problem. Only the second belongs in a
//      classroom, and it has to be WRITTEN rather than derived - a lesson
//      extracted automatically from an incident report is a summary, and a
//      summary teaches nothing that reading the incident would not.
//
// So records carry an optional `lesson`: the transferable principle. Machines
// can emit one, and a later record can attach one to an older finding, exactly
// as recommendations work.
// ---- READ STATE IS NOT A BELT RECORD ----------------------------------------
//
// It lives in board-read.json, beside the belt and outside it.
//
// The belt is append-only and every record in it is evidence about the app. A
// read receipt is evidence about HIM, and mixing the two would inflate the work
// ledger with events that have no bearing on whether anything got built. The
// volume differs by an order of magnitude too: work happens a few times a day,
// glancing happens constantly.
//
// KEYED BY RECORD ID, WITH THE TIME IT WAS READ. An absent key means unread,
// which makes a new record unread by default without anyone writing anything.
// Read is NEVER inferred from age - an unread note stays green however old it
// is, because the whole point is that he has not seen it yet.
//
// Two shapes are accepted for one release. The store began as `{at, ids[]}` - a
// membership set and one global timestamp - and receipts already written in that
// shape must not be thrown away, so `ids` is folded in with an unknown time
// rather than discarded. New receipts are written into `read`.
const readState = (() => {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(CTX, "board-read.json"), "utf8"));
    const at = new Map();
    for (const id of j.ids || []) at.set(String(id), null);
    for (const [id, t] of Object.entries(j.read || {})) at.set(String(id), Date.parse(t) || null);
    return { at: Date.parse(j.at || "") || null, ids: new Set(at.keys()), readAt: at };
  } catch {
    // Never read anything yet. Everything is new, which is true and is the right
    // thing to say on the first visit.
    return { at: null, ids: new Set(), readAt: new Map() };
  }
})();

const lessonFor = new Map();
for (const r of records) {
  const s = r.subject && String(r.subject);
  if (s && r.lesson) lessonFor.set(s, r.lesson);
}
const lessonOf = (r) => lessonFor.get(String(r.id)) || r.lesson || null;

// ---- A HANDLE HE CAN SAY OUT LOUD --------------------------------------------
//
// Operator, 2026-09-11: "can we enumerate deposits for easier reference so I can
// say something like fix deposit S23 as recommended. Prefix S, M, B, F and any
// other prefix."
//
// Record ids are written for machines - "filter-verified-its-own-assignment" is
// precise and unsayable. A handle is the human address: one letter for the
// domain, one number, stable forever.
//
// STABILITY IS THE WHOLE VALUE and it comes free from the belt being
// append-only: the Nth body record is always B<N> because nothing is ever
// removed or reordered. Numbering runs over EVERY record, including the ones the
// board does not draw, so a handle never shifts because a row changed how it is
// displayed.
const HANDLE_LETTER = {
  body: "B",
  mind: "M",
  spirit: "S",
  architecture: "A",
  hive: "H",
  world: "W",
  dev: "D",
  law: "L",
  refer: "R",
  shed: "X",
};
const handles = new Map();
{
  const seq = {};
  for (const r of records) {
    const dim = String(r.dimension || "").toLowerCase();
    // A driver in the X series means the record is about shedding a law, whatever
    // domain it touched, and he reads those as their own kind.
    const letter = /^X\d/.test(String(r.driver || "")) ? "X" : HANDLE_LETTER[dim] || (dim ? dim[0].toUpperCase() : "?");
    seq[letter] = (seq[letter] || 0) + 1;
    handles.set(String(r.id), `${letter}${seq[letter]}`);
  }
  // Written down so a handle can be resolved back to a record without rebuilding
  // the board - which is what happens when he says "fix S23" and something has
  // to go find S23.
  try {
    const out = {};
    for (const [id, h] of handles) out[h] = id;
    fs.writeFileSync(path.join(CTX, "handles.json"), JSON.stringify({ builtAt: new Date(now).toISOString(), handles: out }, null, 1) + "\n");
  } catch {
    /* the board still works; only lookup is degraded */
  }
}

const adviceFor = new Map();
for (const r of records) {
  const s = r.subject && String(r.subject);
  if (!s || !(r.recommend || r.options)) continue;
  adviceFor.set(s, { recommend: r.recommend, options: r.options });
}
const adviceOf = (r) => {
  const own = r.recommend || r.options ? { recommend: r.recommend, options: r.options } : null;
  // A later record's advice supersedes the record's own, because it was written
  // with more of the story.
  return adviceFor.get(String(r.id)) || own;
};

// The word shown on a finished row: its own if it ended itself, otherwise the
// word of whatever closed it. "fixed", "corrected", "shipped" - the how, not
// just the fact.
const endWord = (r) => {
  const own = String(r.triggers || "").trim();
  const src = selfTerminal(r) ? own : String((closedBy.get(String(r.id)) || {}).triggers || "");
  return src.replace(/^terminal:/, "") || "closed";
};

// ---- left in, right out ------------------------------------------------------
//
// Operator, 2026-09-11: "The right side card that says needs - it needs to be a
// list of resolved items that came from the left side deposits. No need to have
// two separate deposits, everything could go on the left side. Things that need
// me, things that are deposited. The middle area is the active digestion, the
// right side is the resolution and output. At least the system will show
// incoming, processing and outgoing, in one left-to-right flow."
//
// This is a better plant than the one it replaces. The board had deposits on the
// left and a NEEDS YOU panel on the right, which put two kinds of INCOMING at
// opposite ends and left the factory's actual output - the work it finished -
// with nowhere to appear at all. Twelve resolved items were scrolling past in
// the same list as the open ones and then vanishing.
//
// So: everything arriving is on the left, including what needs him (marked, not
// separated - it is still incoming). The track in the middle is digestion. The
// right is what came out.
//
// The one risk in folding NEEDS YOU into the feed is burying what needs him, so
// those rows carry their own mark and their count is repeated in the column
// header where it cannot be scrolled away from.
const rowOf = (r) => {
    const tag = TAG[r.dimension] || String(r.dimension || "?").slice(0, 5);
    const t = runAt(r);
    const trig = String(r.triggers || "");
    const done = isDone(r);
    return {
      time: t ? hhmm(t) : "--:--",
      tag: /^X\d/.test(String(r.driver || "")) ? "shed" : tag,
      text: headlineOf(r).slice(0, 74),
      // The row shows 74 characters clamped to two lines. Tapping it opens the
      // rest.
      //
      // Operator, 2026-09-11: "tapping the deposit in or out card item should
      // expand untruncate to see full details toggle retruncate."
      //
      // The evidence comes with it, because the claim alone is the headline and
      // the evidence is the reason to believe it. The board had never shown a
      // single one - the whole argument for a finding was sitting one field away
      // from a display built to make findings legible.
      //
      // "Every record on the belt carries one" is what this said, and it stopped
      // being true the day the Go switch shipped: a plan note carries title and
      // detail and neither claim nor evidence, so this row drew EMPTY for the
      // operator's own notes. headlineOf/reasonOf in kind.cjs read whichever
      // fields the record actually kept its words in.
      full: headlineOf(r),
      why: reasonOf(r),
      rid: String(r.id || ""),
      handle: handles.get(String(r.id)) || "",
      // The door this record came through, if a dispatch names one - drawn as
      // the door's glyph at the head of the row on both sides of the board.
      // Safe to look up here: rows are built at the end, after dispatchFor and
      // viaOf exist.
      via: viaOf(dispatchFor.get(String(r.id)) || r.dispatch),
      dimWord: TAG[r.dimension] || String(r.dimension || "?"),
      advice: adviceOf(r),
      // WHAT THIS RECORD IS, as distinct from what state it is in. A record has
      // both, and collapsing them would lose the one that is currently working.
      kind: kindOf(r),
      // A note has two states and no others, so it carries its own read time
      // rather than the classroom's "is this new to him" flag.
      readAt: readState.readAt.get(String(r.id)) || null,
      read: readState.ids.has(String(r.id)),
      // Unread until he opens it. The first visit marks everything new, which is
      // honest rather than alarming - he genuinely has not seen any of it.
      fresh: !readState.ids.has(String(r.id)),
      // RESOLVED WORK SHOULD READ AS RESOLVED.
      //
      // Operator, 2026-09-11: "it seemed like the board was designed to show off
      // problems instead of to show off that there is no problem."
      //
      // He is right, and this row is where it started. A finished record printed
      // the word "terminal" in the same grey as everything else, so a feed of
      // eight closed items and nine open ones looked like seventeen problems.
      // The board measured INVENTORY and never THROUGHPUT - and the longer the
      // factory worked well, the worse it looked.
      next: done ? endWord(r) : "\u2192 " + trig.replace(/^contract:/, ""),
      // The record's own fields, so an opened row can name what it is made of
      // and where each part came from. Every one of these was already on the
      // belt and none of them had ever reached the screen.
      tier: r.tier == null ? null : String(r.tier),
      subject: r.subject ? String(r.subject) : null,
      address: r.triggers ? String(r.triggers) : null,
      owner: r.owner ? String(r.owner) : null,
      driver: r.driver ? String(r.driver) : null,
      confidence: r.confidence ? String(r.confidence) : null,
      done,
      forYou: trig === "operator",
      status: statusOf(r),
      color: HUE[/^X\d/.test(String(r.driver || "")) ? "shed" : tag] || HUE.build,
    };
};

// ---- what is actually happening to each incoming item -----------------------
//
// Operator, 2026-09-11: "Add status icon to deposits on the left - waiting to be
// processed clock, processing on the conveyor spinning gear, scheduled for later
// calendar, waiting explicitly for me or some external input hourglass, when
// done completely removed."
//
// Four states, and each is a fact the belt already knew and the board never
// said. A row used to show only WHERE it was addressed, never whether anything
// was happening to it - so a thing being actively chewed and a thing nobody is
// scheduled to pick up looked identical.
//
//   HOURGLASS  blocked on him, or on the world. Nothing the factory does moves
//              it, which is the most important distinction on the column.
//   GEAR       its domain's carrier is on the belt right now - being chewed.
//   CALENDAR   a station owns its domain and will come round to it.
//   CLOCK      queued with NOBODY scheduled to take it. This is the state worth
//              noticing: it looks like waiting and it is really orphaned.
//
// "When done, completely removed" was already true - finished work leaves this
// column entirely and appears on the right.
// Three more states, added because the first four could not express them and
// each is a real fact already in the belt rather than a category invented to
// fill the row:
//
//   EYE      triggers "seer" - it cannot proceed until something LOOKS at it.
//            A defined value in the record schema, and a different kind of
//            waiting from queued: the instrument it needs is not built.
//   BLOCKED  its subject is another record that is still open. It is not
//            waiting for capacity, it is waiting for something else to finish.
//   STALE    open, untouched by any later record, and older than a day. This is
//            the one worth having: the critic already reports it in aggregate,
//            and this puts it on the row it belongs to. Queued-for-an-hour and
//            queued-for-a-week look identical without it.
//
// Order matters and is deliberate. Stale outranks both calendar and clock,
// because a thing that is scheduled AND a day old means the schedule is not
// working, and that is the more useful of the two facts.
const openIds = new Set(records.filter((r) => !isDone(r)).map((r) => String(r.id)));
const actedOnIds = new Set(records.filter((r) => r.subject).map((r) => String(r.subject)));
const STALE_AFTER = 24 * MS.h;

const statusOf = (r) => {
  const trig = String(r.triggers || "");
  const driver = String(r.driver || "");
  if (trig === "operator" || /^E\d/.test(driver)) return "hourglass";
  if (trig === "seer") return "eye";

  // A DEPOSIT IS WAITING TO BE JUDGED, WHICH IS NOT WAITING FOR A WORKER.
  //
  // Before this, a deposit addressed to a watched domain drew the CALENDAR - "a
  // trigger owns it and will come round" - which was simply untrue: nothing
  // collects a deposit, because nothing may dispatch one. It looked scheduled
  // and it was unjudged, and those need opposite actions.
  //
  // Staleness still outranks it. A deposit nobody has judged in over a day is a
  // triage queue that is not being worked, and that is the more useful fact -
  // the same reason stale outranks calendar and clock below.
  if (kindOf(r) === KIND.DEPOSIT) {
    const t0 = runAt(r);
    return t0 && now - t0 > STALE_AFTER && !actedOnIds.has(String(r.id)) ? "stale" : "triage";
  }

  const subj = r.subject && String(r.subject);
  if (subj && openIds.has(subj) && subj !== String(r.id)) return "blocked";

  const dim = trig.startsWith("contract:") ? trig.slice("contract:".length) : r.owner;

  // GEAR MEANS AN AGENT IS ON IT, NOT THAT ITS DOMAIN HAS BEEN BUSY.
  //
  // It used to mean "this record's carrier is moving", and a carrier moves when
  // anything in its domain was acted on recently. The triage stage made that
  // visibly wrong within a minute of landing: accepting the Tailwind deposit as
  // work IS an action on a body record, so the carrier started moving, and the
  // contract nobody had dispatched drew a spinning gear reading "being processed
  // now". Motion asserting a fact nobody checked - the same defect this board
  // has been corrected for at the lamp, the carriers and the filter.
  //
  // A dispatch is proven from disk a few hundred lines below; this asks the same
  // question. In practice a dispatched record has already left this column for
  // PROCESSING, so the gear should be rare here - and rare-and-true beats
  // common-and-decorative.
  const d = dispatchFor.get(String(r.id));
  if (d && sessionLife(d.session) && sessionLife(d.session).alive) return "gear";

  const t = runAt(r);
  if (t && now - t > STALE_AFTER && !actedOnIds.has(String(r.id))) return "stale";

  if (watchedDims.has(dim)) return "calendar";
  return "clock";
};

const ICONS = {
  clock: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><circle cx="12" cy="12" r="8.5" stroke="oklch(0.62 0.01 80)" stroke-width="1.8"/><path d="M12 7.5V12l3 1.8" stroke="oklch(0.62 0.01 80)" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><rect x="4" y="6" width="16" height="14" rx="2" stroke="oklch(0.74 0.13 195)" stroke-width="1.8"/><path d="M4 10.5h16M8.5 3.5v4M15.5 3.5v4" stroke="oklch(0.74 0.13 195)" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none; animation:spin 3.2s linear infinite; transform-origin:50% 50%"><circle cx="12" cy="12" r="3.2" stroke="oklch(0.72 0.13 150)" stroke-width="1.8"/><path d="M12 2.6v3M12 18.4v3M21.4 12h-3M5.6 12h-3M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1M18.6 18.6l-2.1-2.1M7.5 7.5L5.4 5.4" stroke="oklch(0.72 0.13 150)" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  hourglass: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><path d="M7 3.5h10M7 20.5h10M8 3.5v3.2c0 2 4 3.9 4 5.3 0 1.4-4 3.3-4 5.3v3.2M16 3.5v3.2c0 2-4 3.9-4 5.3 0 1.4 4 3.3 4 5.3v3.2" stroke="oklch(0.82 0.11 25)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="oklch(0.74 0.13 310)" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.8" stroke="oklch(0.74 0.13 310)" stroke-width="1.8"/></svg>`,
  blocked: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><rect x="4.5" y="10.5" width="15" height="9.5" rx="2" stroke="oklch(0.66 0.01 80)" stroke-width="1.8"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="oklch(0.66 0.01 80)" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  stale: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><path d="M12 3.8 21 19.5H3L12 3.8Z" stroke="oklch(0.80 0.13 75)" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9.8v4.2" stroke="oklch(0.80 0.13 75)" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="16.8" r="1.05" fill="oklch(0.80 0.13 75)"/></svg>`,
  // TRIAGE: an inbox tray. Something has arrived and is sitting in it, which is
  // exactly the state - received, not yet judged, and nobody is late on it.
  triage: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><path d="M3.5 13.5h4l1.4 2.4h6.2l1.4-2.4h4" stroke="oklch(0.70 0.01 80)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 13.5 6.4 5.2h11.2l2.9 8.3v4.1a1.4 1.4 0 0 1-1.4 1.4H4.9a1.4 1.4 0 0 1-1.4-1.4v-4.1Z" stroke="oklch(0.70 0.01 80)" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
};

// ---- ONE ICON PER KIND, SO READING IS NOT MISTAKEN FOR DOING -----------------
//
// Operator, 2026-09-12: "iconize them properly with a chat icon and categorize
// them properly also, so I know chat messages from contracts or deposits to be
// converted into contracts."
//
//   NOTE      a speech bubble, so a message reads as a message.
//   DEPOSIT   a hollow mark - seen, not yet accepted as work.
//   CONTRACT  the same mark filled - somebody owes it.
//   DECISION  the hourglass it already had, which already means waiting on him.
//
// The hollow-to-filled pair is deliberate: a deposit becoming a contract is the
// one transition in this taxonomy, and it should look like the same object
// changing state rather than two unrelated symbols.
const KIND_ICONS = {
  note: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><path d="M20.5 12.6c0 3.6-3.8 6.5-8.5 6.5-1 0-2-.13-2.9-.37L4.2 20.8l1.2-3.3C4.05 16.2 3.5 14.5 3.5 12.6c0-3.6 3.8-6.5 8.5-6.5s8.5 2.9 8.5 6.5Z" stroke="oklch(0.74 0.13 310)" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  deposit: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><circle cx="12" cy="12" r="7.4" stroke="oklch(0.70 0.01 80)" stroke-width="1.9"/></svg>`,
  contract: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" style="flex:none"><circle cx="12" cy="12" r="7.4" stroke="oklch(0.72 0.13 150)" stroke-width="1.9" fill="oklch(0.72 0.13 150)"/></svg>`,
  decision: ICONS.hourglass,
};
const KIND_WORD = {
  note: "a message to read — nothing is owed on it",
  deposit: "seen, not yet judged — not work until somebody accepts it",
  contract: "accepted work — somebody owes this",
  decision: "reserved to you by law",
};

// The plan horizon, as one colour each. Deliberately NOT the kind palette:
// these sit in their own pane and mean something different, and reusing the
// contract green for "being built" would invite the exact reading this whole
// design refuses - that a plan is work somebody owes.
// Everything a one-line plan row cannot hold, on hover. Built with an explicit
// newline character rather than an escape written into the template, because
// an escape sequence typed into a source file by an editor that resolves it
// becomes a real line break inside a string literal and the file stops
// parsing - which is exactly what happened here once, and in this repo a file
// that does not parse silently stops the hourly board build.
const NL = String.fromCharCode(10);
function planTip(r) {
  // The TITLE leads, because four columns in a 700px strip clip most of them
  // mid-phrase. A list you can count but not read is half a list, and the
  // tooltip is where the other half lives until plans get a wider home.
  const head = [r.id, r.owner, r.status].filter(Boolean).join(" · ");
  const top = r.title ? r.title + NL + head : head;
  return r.note ? top + NL + NL + r.note : top;
}

const PLAN_BUCKET_COLOR = {
  now: "oklch(0.72 0.13 150)",
  next: "oklch(0.74 0.12 195)",
  later: "oklch(0.62 0.10 300)",
  held: "oklch(0.66 0.10 60)",
  unplaced: "oklch(0.72 0.12 25)",
};

// Incoming: everything still in flight, newest first. Resolved: everything the
// factory finished, newest first. Nothing belongs to both and nothing is lost.
// Built further down, once carrierStates and watchedDims exist - statusOf needs
// both to tell "being chewed" from "scheduled" from "nobody has it".
let incoming, resolved, forYouCount;

const openCount = records.filter(isOpen).length;
const leaks = records.filter(isLeak);
const pulseFaults = pulse && Array.isArray(pulse.faults) ? pulse.faults : [];

// NEEDS YOU: the design shows two. Real ones, most urgent first - a live fault
// outranks a standing decision, because a fault means something stopped.
// EVERY item, not two.
//
// The design drew two slots and the first wiring filled exactly two, so the
// panel counted 4 and showed 2 - and the operator could not reach the others.
// A panel that names a number and then hides part of it is worse than one that
// shows nothing, because the number is trusted and the omission is invisible.
// needs array removed 2026-09-14: computed the NEEDS YOU list, never rendered
// since that panel folded into the feed - only needsCount below still reads.
// The count must be the count of what is listed. An earlier version counted
// leaks and pulse faults while the panel listed operator-addressed deposits, so
// the board could show "0" above two things waiting on him - the same defect
// this board was criticised for elsewhere, committed in its own wiring.
// isOpen, not the raw trigger. A record addressed to him that has since been
// closed is not something he still needs to do, and counting it here kept two
// already-fixed items in his column with their own closures visible a few
// inches away on the same screen.
//
// Fifth copy of the same rule found in this file. Every one of them re-derived
// "open" from the trigger string by hand, and the four that were wrong were
// wrong in the same direction: they could only ever overstate what was left.
//
// A DECISION IS NOT A CONTRACT, so it is counted here and nowhere else. `isOpen`
// narrowed to open contracts when the kind taxonomy landed, and reading his
// column off it would have silently reported nothing waiting on him however much
// was - the sixth version of this same rule, and the first to fail in the
// opposite direction from the other five.
const needsCount = pulseFaults.length + records.filter(isHeldDecision).length;

// Per-dimension liveness for the three header chips.
const lastFor = (dim) => {
  const hits = records.filter((r) => r.dimension === dim).map(runAt).filter(Boolean);
  return hits.length ? Math.max(...hits) : null;
};
// NOT POSTED IS NOT STALLED.
//
// Operator, 2026-09-11: "it's saying the mind stalled, is that correct?"
//
// It was not. STALLED means something ran and stopped. Nothing was ever posted
// to mind - none of the seven stations watches it - so the chip was reporting a
// death that never happened while hiding the fact that matters: the domain
// carrying the MOST open work of the three has no watcher at all.
//
// Third time this exact conflation has surfaced on this board, after the lamp
// (NEVER RUN vs STALLED) and the year strip (an absent month vs a zero month).
// The rule earns its own line now: absence and failure are different facts, and
// a display that spends one word on both is hiding the more actionable one.
//
// A station declares which dimension it watches, so the board can tell them
// apart instead of inferring from silence.
const watchedDims = new Set(stations.map((s) => s.owns).filter(Boolean));
const chip = (dim) => {
  const t = lastFor(dim);
  if (!watchedDims.has(dim)) {
    return { last: "no watcher", status: "NOT POSTED", stale: true, unposted: true };
  }
  const stale = !t || now - t > 36 * MS.h;
  return { last: t ? ago(t) : "never", at: t, status: stale ? "STALLED" : "WATCHING", stale };
};

// LOOPS and UPCOMING both come from the station declarations plus clock state.
//
// A STATION RUNS ON THE INTERVAL THE CLOCK IS ACTUALLY USING, NOT THE ONE IT
// DECLARED.
//
// The declaration is a CEILING. When a station faults the clock tightens it -
// board-critic declares 2h and was running every 15m; autonomy declares 6h and
// was running every 30m. Every schedule number on this board was computed from
// the ceiling, so the two stations being watched MOST closely were the two the
// board described worst:
//
//   the tile printed  BOARD CRITIC  15m *  ... 1h 44m
//
// - a pace of fifteen minutes beside a countdown of an hour and three quarters,
// inside one tile, with a nearly-full bar between them. The bar was right; the
// number under it was computed from an interval the station had stopped using.
//
// It reached four surfaces from this one line, and the worst was the lamp: with
// the ceiling as the yardstick, a station tightened to 15m could be DEAD for
// nearly six hours and the board would still read ALIVE, over the words "every
// station inside its interval" - a green check measuring an interval nothing
// runs on. Autonomy's margin was eighteen hours.
//
// The effective interval is therefore resolved ONCE, here, and everything
// downstream reads it. The declared string is kept as `declared` for anything
// that wants to show the ceiling, so the two can never again be confused by
// sharing a name.
const effectiveMs = (s) => {
  const st = schedule.triggers[s.id] || {};
  return Number(st.intervalMs) || durMs(s.every) || 0;
};

// THE GRID: the pulse's period, read from its declaration. A run belongs to
// the beat that started it, so "next" is anchored to the grid before the
// interval is added - the same rule schedule.cjs applies since 2026-09-13.
// Before that both computed last + every from a stamp taken seconds AFTER the
// beat, which is why every 10m station actually ran every 15m, and why this
// board printed "due" for eight seconds before the scheduler agreed.
const GRID = durMs((stations.find((s) => s.drivenBy && !s.run) || {}).every) || 5 * MS.m;
const onGrid = (t) => Math.floor(t / GRID) * GRID;

const stationRows = stations
  .map((s) => {
    const st = schedule.triggers[s.id] || {};
    const every = effectiveMs(s);
    const last = st.lastRunAt || null;
    // The pulse row is the grid itself: its next beat is the next boundary,
    // whether or not the scheduler has stamped it.
    const grid = !!s.drivenBy && !s.run;
    const next = grid && every ? Math.ceil(now / every) * every : last && every ? onGrid(last) + every : now;
    // `declared` is the ceiling as written; `everyMs` is what it is running on.
    // Deliberately NOT both called "every" - that single shared name is what let
    // a ceiling be printed as a pace for as long as it was.
    //
    // `decl` and `state` are the two SOURCES kept whole and kept apart, because
    // the explain panel's job is to show them against each other. Flattening
    // them into one object here would be the same collapse that let a ceiling be
    // printed as a pace: once two facts share a shape, nothing downstream can
    // report that they disagree.
    return {
      id: s.id,
      declared: s.every,
      everyMs: every,
      last,
      next,
      grid,
      dueIn: next - now,
      decl: s,
      state: st,
    };
  })
  .sort((a, b) => a.dueIn - b.dueIn);

const byId = (id) => stationRows.find((s) => s.id === id) || null;
const pulseRow = byId("pulse");
const heartRow = byId("node-heartbeat");
const styleRow = byId("style-coverage");

// The loops move to the footer as a compact strip. They were a panel taking a
// third of the right column, and the right column is now the factory's OUTPUT -
// the schedule is neither incoming nor outgoing, so it belongs in the margin
// where a plant puts its clocks.
// ---- every cycle, visibly turning ------------------------------------------
//
// Operator, 2026-09-11: "find a place to show the active pulses - 15min, 1 hour
// etc. All cycles need active representation, including computer restart
// progress countdown cycle."
//
// The footer strip showed five of eight and only their next-due times, which is
// a timetable rather than a representation - it says WHEN, never HOW FAR
// THROUGH. A plant shows its cycles turning, so each one gets a bar filling
// across its own interval: a glance says which are about to fire, which just
// ran, and which is running tighter than it has earned.
//
// The host restart is a cycle too, and the one nobody had drawn: uptime against
// the freshness threshold, or a queued update, counting down like everything
// else. The machine is part of the factory, so its cycle belongs on the board
// with the rest.
// One rename, because two cells otherwise both read HOST RESTART: the STATION
// is the six-hourly check that asks whether a restart is due, and the CYCLE is
// the restart itself counting down. Same words, different things - exactly the
// collision this board keeps being caught on.
const CYCLE_NAME = { "host-restart": "restart check" };

const cycles = stationRows
  .map((s) => {
    const relaxed = durMs(s.declared) || MS.h;
    // Same number the countdown and the sort are built from. The bar and the
    // number under it disagreed for as long as these were resolved separately.
    const interval = s.everyMs || relaxed;
    const elapsed = s.last ? Math.min(now - s.last, interval) : interval;
    return {
      // The id, carried onto the drawn cell. A rail cell is looked up by NAME
      // today, and CYCLE_NAME already renames one - so a panel keyed on the name
      // would attach the wrong explanation to exactly the row whose whole history
      // is being confused with another. Keyed on the id, which nothing renames.
      id: s.id,
      name: CYCLE_NAME[s.id] || s.id.replace(/-/g, " "),
      pct: Math.max(2, Math.min(100, (elapsed / interval) * 100)),
      when: inWords(s.dueIn),
      pace: inWords(interval).replace(/^due$/, "now"),
      tight: interval < relaxed,
      // Kept so the strip can be ordered by the number it actually prints.
      intervalMs: interval,
      // The raw facts, carried onto the cell so the page can keep counting.
      last: s.last,
      grid: s.grid,
      hue: s.id === "pulse" ? HUE.spirit : s.id === "style-coverage" ? HUE.body : s.id === "manager" ? HUE.sup : HUE.mind,
    };
  })
  // Shortest pulse first.
  //
  // Operator, 2026-09-12: "organize the pulse bar from shortest to longest
  // pulse." It was in declaration order, which is an accident of which file was
  // written when, and it made the strip read as a jumble - 10m, 45m, 15m, 6h,
  // 1h, 1h, 30m - so nothing could be found by position.
  //
  // Sorted by the CURRENT pace, not the declared ceiling, because the current
  // pace is the number printed beside each name. Sorting by one number while
  // showing another would put board-critic at the two-hour position with "30m"
  // written on it, which is precisely the kind of quiet disagreement this board
  // has been caught on three times.
  //
  // A consequence worth having: when a station faults it tightens to the floor
  // and MOVES LEFT. The strip reorders itself so whatever is being watched most
  // closely sits at the front.
  .sort((a, b) => a.intervalMs - b.intervalMs || a.name.localeCompare(b.name));

// ---- THE PULSE IS NOT ONE OF THE RHYTHMS, IT IS THE ONE THEY COME FROM -------
//
// Operator, 2026-09-12: "we currently have 13 pulses on the timer rail... move
// the pulse to the first slot on the left, this is the primordial tick for the
// living factory every 5 minutes, in the routines."
//
// FIRST BY INSERTION, NEVER BY SORTING, and the distinction is the whole
// instruction. At five minutes the pulse happens to sort first today - so
// leaving it to the sort would look correct and would silently break the moment
// any trigger declares something faster. Position here encodes a KIND of thing,
// not a duration: everything else on this rail is a derived rhythm, and the
// pulse is the beat they are all downstream of.
//
// Done as a lift-and-unshift on the sorted list rather than as a special case
// inside the comparator, because a comparator that is not a total order is a
// sort that reorders differently on a different engine.
{
  const i = cycles.findIndex((c) => c.name === "pulse");
  if (i > 0) cycles.unshift(cycles.splice(i, 1)[0]);
}

const loopStrip = stationRows.slice(0, 5).map((s) => ({
  id: s.id,
  name: s.id.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
  when: inWords(s.dueIn),
  due: s.dueIn <= 0,
  last: s.last,
  everyMs: s.everyMs,
  grid: s.grid,
  hue: s.id === "pulse" ? HUE.spirit : s.id === "style-coverage" ? HUE.body : s.id === "manager" ? HUE.sup : HUE.mind,
}));

// upcoming removed 2026-09-14: fed upcomingRows below, which was itself never
// interpolated into the page - dead since whatever redesign dropped that block.

// ---- is the factory actually alive? -----------------------------------------
//
// The design drew ALIVE as a fixed green lamp, the carriers as always turning,
// and the header as "14 REPOS - ALWAYS ON". All three assert rather than report,
// and the lamp is the most trusted pixel on the board: a status light that
// cannot deliver bad news is a green check that checks nothing. So liveness is
// derived, and the board is allowed to say the factory has stopped.
//
// The test is whether any station has run inside three times its own declared
// interval. Three times, not one, because a station running late is normal and
// a board that cries wolf is a board nobody reads.
// ---- is the belt ACTUALLY moving? -------------------------------------------
//
// Operator, 2026-09-11: "the conveyor is lying, moving when nothing is running.
// The conveyor should represent something is actually processing and stop when
// deposit is 0 or waiting on schedule."
//
// Right, and it is the third time the same defect has been caught on this board:
// an element that ASSERTS rather than REPORTS. The lamp could only be green. The
// board could only look alarming. The belt ran whenever the stations were
// merely HEALTHY - so a plant sitting idle between runs showed work flowing
// through it, which is a lie told in motion, the most convincing kind.
//
// SUPERSEDED FOR THE BELT'S MOTION, 2026-09-14. Operator: "the conveyor is
// separate from build and runs to show the factory has functional pulse. it's
// like pulse in motion." So the belt no longer turns to mean "work is
// processing" - it turns to mean "the pulse is beating", and it is the PAGE
// that turns it, live, from the pulse's stamp (see powerBelt). The build
// always draws the motion; the pulse powers it. Load is shown by the cards
// riding the belt and the numbers on them, not by whether it moves. The 09-11
// rule still holds for everything it said about asserting versus reporting -
// a belt that turned on a dead pulse would be the same lie - and beltMoving
// is still computed below for the carrier state words. It just no longer
// switches the animation.
//
// Liveness and activity are different facts and the board needs both:
//
//   RUNNING  work moved recently AND there is work on the carriers
//   IDLE     healthy, but waiting on the schedule - the normal resting state
//   STALLED  overdue; this is the red one, and it must not look like IDLE
//
// The window is the shortest station interval. This is a BATCH plant - it works
// for under a second every fifteen minutes - so the honest picture is a belt
// that surges when a cycle lands and parks the rest of the time. Motion then
// carries information: it means work just happened.
const lastAnyRun = stationRows.map((s) => s.last).filter(Boolean).sort((a, b) => b - a)[0] || null;
const fastestMs = Math.min(...stations.map((s) => effectiveMs(s)).filter(Boolean).concat([15 * MS.m]));
const ranRecently = lastAnyRun !== null && now - lastAnyRun < fastestMs;

// The lamp is the most trusted pixel on the board, so it is measured against
// the interval each station is ACTUALLY on - see the note on stationRows. It
// used the declared ceiling, which made it most forgiving of exactly the
// stations the clock had decided to watch most closely.
// HOW LATE IS LATE, named once. Three times a rhythm's own interval, and the
// reason is written above: a station running late is normal and a board that
// cries wolf is a board nobody reads. It was a bare 3 inside the lamp, which
// was fine while the lamp was the only thing that judged lateness. The explain
// panels judge it too now, and a panel saying a rhythm is fine while the lamp
// calls the factory stalled is the exact two-sources-disagree defect the panels
// exist to surface - told about themselves.
const STALL_RATIO = 3;

const liveness = (() => {
  let worst = null;
  for (const s of stationRows) {
    const every = s.everyMs;
    if (!every) continue;
    const overdueBy = s.last ? now - s.last - every : Infinity;
    const ratio = s.last ? (now - s.last) / every : Infinity;
    if (worst === null || ratio > worst.ratio) worst = { id: s.id, ratio, overdueBy };
  }
  const faulted = pulseFaults.length > 0;
  if (!stationRows.length || !worst) return { label: "NOT POSTED", hue: "25", running: false, note: "no station declared" };
  if (worst.ratio === Infinity) return { label: "NEVER RUN", hue: "25", running: false, note: `${worst.id} has never run` };
  if (worst.ratio > STALL_RATIO) return { label: "STALLED", hue: "25", running: false, note: `${worst.id} overdue` };
  if (faulted) return { label: "DEGRADED", hue: "75", running: true, note: `${pulseFaults.length} fault(s)` };
  return { label: "ALIVE", hue: "150", running: true, note: "every station inside its interval" };
})();

// THE REPOS THIS BOARD CAN OBSERVE, from the ecosystem map the operator keeps.
//
// Operator, 2026-09-14: "wire a dropdown under the Repo Label in the header to
// quickly select a new repo for observable. i'm seeing 1 of 14 wired." A repo
// is WIRED when it declares at least one trigger in the places the scheduler
// searches - the same test the scheduler's fan-out applies, so the dropdown
// never offers a repo the scheduler is not ticking. The current subject is
// found by path, never by name.
const ECOSYSTEM_MAP = [process.env.REFER_ECOSYSTEM_MAP, "E:/e2e-bridge/governance/ecosystem-map.json"].filter(Boolean).find((p) => fs.existsSync(p)) || null;
const declaresTriggers = (root) =>
  ["tools", "tools/factory", "scripts"].some((rel) => {
    try {
      return fs.readdirSync(path.join(root, rel)).some((f) => f.endsWith(".trigger.json") || f.endsWith(".station.json"));
    } catch {
      return false;
    }
  });
const samePath = (a, b) => path.resolve(a).replace(/\\/g, "/").toLowerCase() === path.resolve(b).replace(/\\/g, "/").toLowerCase();
const repoList = (() => {
  if (!ECOSYSTEM_MAP) return [];
  const m = readJson(ECOSYSTEM_MAP, { repos: [] });
  return (m.repos || [])
    .filter((r) => r && r.repo_id && r.path)
    .map((r) => ({
      id: String(r.repo_id),
      name: String(r.name || r.repo_id),
      path: String(r.path),
      active: r.status === "active",
      exists: fs.existsSync(r.path),
      wired: fs.existsSync(r.path) && declaresTriggers(r.path),
      current: samePath(r.path, ROOT),
    }));
})();
const REPO_ID = (repoList.find((r) => r.current) || {}).id || path.basename(ROOT);
// How many of the ecosystem's repos actually carry stations. Saying "14 repos"
// when one is instrumented is the board flattering us. Counted from the map
// when it can be read; otherwise the one thing this build can vouch for.
const wiredRepos = repoList.length ? repoList.filter((r) => r.wired).length : stationRows.length ? 1 : 0;

// The host is part of the factory, so its state belongs on the board. It is read
// from the node registry rather than probed again here: node-heartbeat owns that
// block and writes it, and two stations probing the same thing is how two
// answers start disagreeing.
const host = (() => {
  // The registry is the FACTORY's file, and the factory is now the directory
  // above this machine, so it is addressed rather than searched for. The
  // environment override stays ahead of it for a second factory checkout.
  const candidates = [
    process.env.REFER_FACTORY_ROOT && path.join(process.env.REFER_FACTORY_ROOT, ".refer-factory/hive-node-registry.json"),
    path.resolve(__dirname, "../.refer-factory/hive-node-registry.json"),
  ].filter(Boolean);
  const p = candidates.find((x) => fs.existsSync(x));
  if (!p) return null;
  // The registry's node for THIS subject. The ids are the registry's own, so a
  // repo it does not know reads HOST UNKNOWN rather than borrowing Telechurch's.
  const HOST_NODE = { "telechurch-e2e-v2": "telechurch", "refer-script-factory": "codex-script-factory" }[path.basename(ROOT).toLowerCase()] || null;
  const node = HOST_NODE ? (readJson(p, { nodes: [] }).nodes || []).find((n) => n.id === HOST_NODE) : null;
  // `_from` travels with the reading. The candidate list means the path is not
  // knowable from the constant, only from which file was found - and a panel
  // that prints an uptime has to be able to say where it read it.
  return node && node.host ? { ...node.host, _from: `${p.replace(/\\/g, "/")} · nodes[telechurch].host` } : null;
})();

// THE SESSIONS THE TIMER PUT ON THE BELT. session-belt.cjs writes sessions.json
// every beat; one card per session alive in this repo rides the conveyor, chat
// or spawn. Operator, 2026-09-14: "this chat needs to be on the belt, it's the
// timer's job to put it there." Read here for the built board; the page reads
// /sessions and recomputes alive/active from each lastWrite on the wall clock.
const sessionBelt = (() => {
  const p = path.join(CTX, "sessions.json");
  const rep = readJson(p, null);
  if (!rep || !Array.isArray(rep.sessions)) return { seen: false, checkedAt: null, sessions: [], from: p.replace(/\\/g, "/") };
  const aliveMs = Number(rep.aliveMs) || DISPATCH_ALIVE_MS;
  const sessions = rep.sessions
    .map((s) => ({ ...s, at: Date.parse(s.lastWrite) || 0 }))
    .filter((s) => s.at && now - s.at < aliveMs)
    .sort((a, b) => b.at - a.at);
  return { seen: true, checkedAt: Date.parse(rep.checkedAt) || null, sessions, from: p.replace(/\\/g, "/") };
})();

// THE PULSE CARDS - the tick made visible, one card per beat.
//
// Operator, 2026-09-14: "design a pulse card ... an incoming pulse, in the
// deposit, that will show when the next pulse will be, a pulse on the belt
// with the newly designed pulse card [heartbeat saw wave, time released and
// enumeration PU], also the last pulse that exited after the refresh will be
// on the resolved side."
//
// pulse-belt.cjs already writes exactly this: one card per beat, in the
// FACTORY (universal state - one heartbeat, one file), pruned after three
// beats, never a line on findings.jsonl. Stage is DERIVED FROM AGE with the
// machine's own rule and grace, never stored: incoming under one beat old, on
// the belt under two, resolved under three. So when the ticks are regular
// there is one card in each state, and when a beat is missed there is a HOLE,
// drawn as a gap - a pulse belt that always showed three neat cards would be a
// liveness display that cannot report death.
//
// Read here for the built board; the page re-reads /pulse and rolls the cards
// on the wall clock between builds, with the same rule. Found the way the host
// block is found above, and the source travels with the reading.
const pulseBelt = (() => {
  const roots = [process.env.REFER_FACTORY_ROOT, path.resolve(__dirname, "..")].filter(Boolean);
  const root = roots.find((r) => fs.existsSync(path.join(r, ".refer-factory/pulse-belt.jsonl")));
  const empty = { stageMs: GRID, graceMs: Math.round(GRID / 10), cards: [], from: null };
  if (!root) return empty;
  const dir = path.join(root, ".refer-factory");
  const rep = readJson(path.join(dir, "pulse-belt.json"), {});
  const stageMs = Number(rep.stageMs) || GRID;
  const graceMs = Number(rep.graceMs) || Math.round(stageMs / 10);
  const stageOf = (at) => {
    const age = now - at;
    const i = age < 0 ? 0 : Math.floor((age + graceMs) / stageMs);
    return i < 3 ? ["incoming", "belt", "resolved"][i] : null;
  };
  let cards = [];
  try {
    cards = fs
      .readFileSync(path.join(dir, "pulse-belt.jsonl"), "utf8")
      .replace(/^\uFEFF/, "")
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => {
        try {
          const c = JSON.parse(l);
          const at = Date.parse(c && c.at);
          return Number.isFinite(at) ? { at, seq: Number(c.seq) || 0, drivenFrom: c.drivenFrom || null, stage: stageOf(at) } : null;
        } catch {
          return null;
        }
      })
      .filter((c) => c && c.stage)
      .sort((a, b) => a.at - b.at);
  } catch {
    cards = [];
  }
  return { stageMs, graceMs, cards, from: `${path.join(dir, "pulse-belt.jsonl").replace(/\\/g, "/")}` };
})();

const firstDeposit = records.map(runAt).filter(Boolean).sort((a, b) => a - b)[0] || now;
const upDays = Math.floor((now - firstDeposit) / MS.d);
const upHours = Math.floor(((now - firstDeposit) % MS.d) / MS.h);

const runDays = new Set(records.map((r) => String(r.run || "").slice(0, 10)).filter(Boolean));
const shedCount = records.filter((r) => /^X\d/.test(String(r.driver || ""))).length;

// ---- what each corner is actually doing -------------------------------------
//
// Operator, 2026-09-11: "should we have some metrics on the timer, builder,
// watcher and supervisor showing how many active, like a chip on the outer
// edge... no number means no watcher, 10 builder means 10 building."
//
// Each corner gets a DIFFERENT real quantity rather than the same number four
// times - four identical chips would be decoration. And an absent chip means
// none, exactly as he said, so a quiet corner reads as quiet rather than as
// broken.
// `corners` is defined further down, after withLiveAgent - see THE FOUR WORKERS'
// ACTIVE WORK. It used to be here and counted inventory: rhythms on the rail,
// domains ever mentioned. Operator, 2026-09-14: "they need to count their
// active work ... reflective of the work they are doing actively."

// The number on each carrier is that domain's LOAD - work assigned to it, not
// findings merely about it. A first pass counted by `dimension`, which put zero
// on mind while three contracts were addressed to mind: the carrier would have
// read empty for a domain with the most work outstanding.
const ridesCarrier = (r, dim) => r.owner === dim || String(r.triggers) === `contract:${dim}`;
// Any contracted domain counts as circulating, not only the three drawn as
// carriers. An architecture item was being counted as ON NO CARRIER AND NOT
// HELD - a leak - purely because its domain had no card on the belt. The board
// invented a leak out of its own drawing.
const isContracted = (r) => /^contract:/.test(String(r.triggers || ""));
const loadFor = (dim) => records.filter((r) => isOpen(r) && ridesCarrier(r, dim)).length;
const carrierCounts = [loadFor("body"), loadFor("mind"), loadFor("spirit")];

// PER-CARRIER STATE. A domain with nothing to chew has no business on the belt.
//
// Operator, 2026-09-11: "park the cards on the inside of the conveyor when
// nothing from that scope is being processed, keep the belt clean. Add a status
// pill while parked - all clear, scheduled, stalled. Only keep running processes
// actually chewing on the conveyor."
//
// The previous pass made the belt honest as a whole; this makes each carrier
// honest on its own. Three cards going round while two of their domains have
// nothing open is the same lie at one third scale - and worse, it hides the one
// carrier that IS working inside identical motion.
//
// A parked carrier is not a failure. Three states, and only one is bad:
//
//   ALL CLEAR  nothing open for this domain. The good resting state, and it
//              should LOOK good rather than merely look stopped.
//   SCHEDULED  work waiting on it, schedule not come round yet.
//   STALLED    work waiting and the plant overdue. The only red one.
const CARRIER_DIMS = ["body", "mind", "spirit"];

// CIRCULATING MUST EQUAL WHAT THE CARRIERS CARRY.
//
// Operator, 2026-09-11: "the tickets on the conveyor count 5 but the circulating
// open deposits count 8 - where's the mismatch?"
//
// Real, and the arithmetic named it exactly: work addressed to HIM rides no
// carrier, because he is not one of the three domains. The centre was counting
// it as circulating while nothing on the track moved it.
//
// It is not circulating. It is held at the supervisor, waiting on a decision
// only he can make - which is a different state and deserves to be read as one.
// So the big number is what is actually moving, and what is held is named
// directly beneath it rather than folded in or dropped.
//
// The third bucket exists so nothing can vanish between the two: an open record
// that neither rides a carrier nor waits on him would otherwise be counted
// nowhere, which is precisely the leak this board is supposed to expose.
//
// THE THREE BUCKETS ARE NOW THREE KINDS, which is what they were always trying
// to be. Circulating is open CONTRACTS on a domain; held is his DECISIONS;
// awaiting triage is DEPOSITS nobody has judged. Nothing can be in two of them
// and nothing can be in none of them, so the fourth number - a contract on no
// carrier at all - is a real leak rather than an artefact of the drawing.
const openRecords = records.filter(isOpen);
const circulating = openRecords.filter((r) => isContracted(r) || ["body", "mind", "spirit"].some((d) => ridesCarrier(r, d)));
const held = records.filter(isHeldDecision);
const awaitingTriage = records.filter(isAwaitingTriage);
const unplaced = openRecords.length - circulating.length;

// ---- MOTION MUST MEAN WORK, NOT ATTENDANCE ----------------------------------
//
// Operator, 2026-09-12: "The factory says 11 items on the belt, but I don't see
// anything working. What does the spinning on the belt mean?"
//
// It meant: a station ran recently, and there are open items. That is all it
// ever meant. The carriers turned because the WATCHERS ran, while the items
// themselves sat completely still - the oldest for twenty-six hours - because
// nothing in this factory collects a contract item. Twelve watchers, no
// builders.
//
// So the most prominent element on the board was animating attendance and
// reading as progress. Same defect as the clock that kept ticking with the
// server dead, the lamp that could only say ALIVE, and the filter that appeared
// to filter: motion asserting a fact nobody had checked.
//
// Motion now requires EVIDENCE THAT AN ITEM MOVED. A later record closing or
// acting on an open one is that evidence; a station merely running is not.
const actedAt = (() => {
  const ids = new Set(records.map((r) => String(r.id)));
  let latest = null;
  for (const r of records) {
    // A record that names an existing record as its subject did something TO it.
    if (!r.subject || !ids.has(String(r.subject))) continue;
    const t = runAt(r);
    if (t && (latest === null || t > latest)) latest = t;
  }
  return latest;
})();
const actedRecently = actedAt !== null && now - actedAt < fastestMs * 3;
const beltMoving = actedRecently && circulating.length > 0 && liveness.label !== "STALLED";

// ---- ONE CARD PER DEPOSIT, NOT ONE CARD PER DOMAIN --------------------------
//
// Operator, 2026-09-12: "I want a 1 to 1 card representation of items on the
// conveyor instead of 1 to many - so if there are 10 deposits on the conveyor I
// want to see literally 10 cards. The number on the conveyor we'll change to
// the enumeration of the deposit, example [B17]." And: "we can remove the ones
// that are processing from the incoming list, so the deposits shift from
// incoming to processing to resolved."
//
// This is what resolves the conflict he named: a carrier holding a COUNT is an
// aggregate pretending to be a parcel, which is why it could sit still with
// seven things on it and look broken. A card that IS one deposit cannot be in a
// conflicted state - it is either on the belt or it is not.
//
// It also finally makes the three columns mean what they say. A deposit is
// INCOMING until a domain owns it, PROCESSING while it rides the belt, and
// RESOLVED when it closes. Before this, everything sat in incoming forever and
// the middle was a decoration.
// ---- ON THE BELT MEANS AN AGENT IS ACTUALLY WORKING ON IT -------------------
//
// Operator, 2026-09-12: "processing right now is not really actually
// processing - there are no dispatched agents working on this. Each dispatch
// needs to have a chat instance that is visible; until then it's not on the
// belt. So remove everything off the belt that doesn't have an agent attached
// to it and actively working on it."
//
// Owning a domain is not being worked on. Twelve items were riding the belt
// because they were ADDRESSED to body, mind or spirit - an address is a
// destination, not a worker - so the middle of the board was showing intent and
// calling it process. That is the same shape as every other defect on this
// board: a claim nobody checked.
//
// A dispatch is now PROVEN FROM DISK, never asserted. A record claiming an
// agent must name a session, and that session must have a transcript or a
// worktree that has been written to recently. A field saying "agent: X" that
// nothing verifies would be exactly the lie this replaces.
const DISPATCH_ALIVE_MS = 30 * MS.m;

// A SPAWNED AGENT DOES NOT WRITE WHERE THIS WAS LOOKING.
//
// A session working in a git worktree writes its transcript to its OWN project
// directory, not the repo's:
//
//   ~/.claude/projects/E--Telechurch-e2e-v2                             <- all this used to search
//   ~/.claude/projects/E--Telechurch-e2e-v2--claude-worktrees-<name>    <- where a spawned agent writes
//
// And the filename is a random uuid, NOT the session id. The old check matched
// `filename.startsWith(session.slice(0, 8))`, which for a worktree session can
// never match: measured 2026-09-12, the dispatch naming
// `intelligent-nobel-ccd039` had its transcript at `57e082d9-....jsonl`.
//
// It therefore fell through to the worktree FOLDER's mtime, which moves only
// when a file is added or removed at the folder's top level - not when anything
// inside is written. Four worktree folders measured at 22:02-22:26 while two of
// those sessions were actively working. So every spawned agent - the only kind
// that currently exists - went invisible about thirty minutes after its folder
// last changed, whatever it was doing, and the belt then dropped it.
//
// The proof this now works is not that it compiles: asked about the session
// building this very board, it answers ALIVE from a transcript written seconds
// ago, where before it would have answered dead from a folder untouched for
// forty minutes.
//
// THIS IS THE THIRD COPY OF ONE RULE. The other two are in `session-life.cjs`,
// which exit-worker and intake-worker both require.
//
// THE REASON FOR THE DUPLICATION EXPIRED ON 2026-09-14. It was duplicated
// because this file lived in the product repo and session-life.cjs in the
// factory, so importing it would have tied a build to a path that was
// discovered rather than guaranteed. They are SIBLINGS now - the file is
// `path.join(__dirname, "session-life.cjs")`, resolved the same way kind.cjs is
// at the top - and a require would be as safe as the one already there. The
// copy is left standing only because collapsing it is a behaviour change and
// this commit is a move; it is now plain duplication with no argument behind
// it. Until somebody collapses it: if you change the rule, change it in both
// places.
const PROJECTS = path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude/projects");
// A project directory is the repo's absolute path with the colon, separators
// and dots all replaced by "-".
const projectToken = (p) => p.replace(/[:\\/.]/g, "-");
// Run from inside .claude/worktrees/<name>, the repo itself is three levels up.
// Without this, a build in a worktree looks under the worktree's own token and
// finds none of its siblings.
const REPO_ROOT = /[\\/]\.claude[\\/]worktrees[\\/][^\\/]+$/.test(ROOT) ? path.resolve(ROOT, "../../..") : ROOT;
const PROJECT_BASE = projectToken(REPO_ROOT);
const WORKTREES = path.join(REPO_ROOT, ".claude/worktrees");

const dispatchFor = new Map();
for (const r of records) {
  const s = r.subject && String(r.subject);
  if (s && r.dispatch) dispatchFor.set(s, r.dispatch);
}

// Is this session real, and has it done anything lately?
//
// Evidence in order, best first:
//   1. a transcript in the session's OWN worktree project directory. The
//      directory is named for the worktree and a dispatch names the worktree, so
//      the directory itself is the identification - any transcript in it counts.
//   2. a transcript in the repo's project directory whose filename starts with
//      the session id. The main-checkout case, where the id IS the uuid.
//   3. the worktree folder's mtime. LAST RESORT AND BARELY EVIDENCE - it does
//      not move while work happens. Kept only so a session with no transcript is
//      not reported as fictional. Read 1 and 2 before trusting it.
const sessionLife = (id) => {
  if (!id) return null;
  const seen = [];
  try {
    for (const d of fs.readdirSync(PROJECTS)) {
      const own = d === `${PROJECT_BASE}--claude-worktrees-${id}`;
      const base = d === PROJECT_BASE;
      if (!own && !base) continue;
      let files = [];
      try {
        files = fs.readdirSync(path.join(PROJECTS, d));
      } catch {
        continue;
      }
      for (const f of files) {
        if (!f.endsWith(".jsonl")) continue;
        if (!own && !f.startsWith(String(id).slice(0, 8))) continue;
        try {
          seen.push({ where: own ? "transcript (worktree)" : "transcript", at: fs.statSync(path.join(PROJECTS, d, f)).mtimeMs });
        } catch (err) {
          // Vanished between listing and stat. Anything else is a bug.
          if (!expectedFsError(err)) throw err;
        }
      }
    }
  } catch (err) {
    // No projects directory on this host is expected and means no evidence.
    // A programming error here would report a working agent as DEAD and get its
    // work returned to incoming, so it must not be swallowed into that answer.
    if (!expectedFsError(err)) throw err;
  }
  try {
    const p = path.join(WORKTREES, String(id));
    if (fs.existsSync(p)) seen.push({ where: "worktree folder", at: fs.statSync(p).mtimeMs, weak: true });
  } catch {
    /* no worktree */
  }
  if (!seen.length) return null;
  const newest = seen.sort((a, b) => b.at - a.at)[0];
  return { ...newest, alive: now - newest.at < DISPATCH_ALIVE_MS };
};

// Dispatched and then abandoned is its own fact, and a worse one than never
// dispatched: somebody picked the work up and put it down.
// Any open deposit can ride the belt, not only body, mind and spirit.
//
// The three-domain restriction was a leftover of the aggregate model - when a
// carrier WAS a domain, only a domain's work could sit on it. With one card per
// deposit the domain is just a colour, and the thing that decides whether
// something rides is whether somebody is working on it. Caught by dispatching
// real architecture work and watching it fail to appear.
//
// ONLY A CONTRACT MAY RIDE THE BELT. Operator, 2026-09-12: "don't put
// notifications on the belt, only contracts to be processed." A note has no
// worker and no dispatch; a deposit has not been accepted as work yet, so
// dispatching one would be the factory contracting work nobody judged - the
// exact defect this taxonomy removes. A dispatch record naming a deposit is
// therefore not enough to put it on the belt: it has to have been accepted
// first.
const abandoned = [];
const beltCandidates = records.filter((r) => IX.isOpenContract(r));
const withLiveAgent = beltCandidates.filter((r) => {
  const d = dispatchFor.get(String(r.id));
  if (!d) return false;
  const life = sessionLife(d.session);
  if (life && life.alive) return true;
  abandoned.push({ id: String(r.id), session: d.session, lastSeen: life ? life.at : null });
  return false;
});

// ---- THE FOUR WORKERS' ACTIVE WORK ------------------------------------------
//
// Operator, 2026-09-14: "the timer, watcher, supervisor and builder need to
// count their active work, so make sure the corner count pills are reflective
// of the work they are doing actively." The jobs are the plan's (M4, M8, §3):
// the timer says now and holds alarms; the watcher looks and deposits; the
// supervisor receives findings and decides; the builder does contracted work.
// So each pill is that worker's in-tray or its hands, right now - never its
// furniture. The first version counted rhythms on the rail and domains ever
// mentioned, numbers that could not reach zero on an idle factory.
//
//   TIMER       stations firing now or due this beat, plus alarms queued
//   WATCHER     findings deposited in the last hour - looking leaves deposits
//   SUPERVISOR  findings awaiting a decision: the triage queue plus held-for-him
//   BUILDER     contracts with a live agent working them
//
// The same four numbers are served on /activity with the same predicates, and
// the page refreshes the pills every ten seconds - a pill is the most-read
// number in its corner and an hour-old one is the stale board he named.
const corners = {
  TIMER: stationRows.filter((s) => !s.grid && (s.dueIn <= 0 || (s.state.lockedAt && now - s.state.lockedAt < 10 * MS.m))).length + stationRows.filter((s) => s.state.requestedFor != null).length,
  WATCHER: records.filter((r) => runAt(r) && now - runAt(r) < MS.h).length,
  SUPERVISOR: awaitingTriage.length + held.length,
  BUILDER: withLiveAgent.length,
};

const onBelt = withLiveAgent
  .slice()
  .sort((a, b) => (runAt(a) || 0) - (runAt(b) || 0))
  .map((r) => {
    const dim = ["body", "mind", "spirit"].find((d) => ridesCarrier(r, d)) || String(r.dimension || "body");
    const t = runAt(r);
    return {
      handle: handles.get(String(r.id)) || "?",
      rid: String(r.id),
      dim,
      color: HUE[dim],
      time: t ? hhmm(t) : "--:--",
      at: t,
      text: headlineOf(r).slice(0, 74),
      full: headlineOf(r),
      why: reasonOf(r),
      advice: adviceOf(r),
      waited: t ? inWords(now - t) : "unknown",
      fresh: !readState.ids.has(String(r.id)),
      agent: (dispatchFor.get(String(r.id)) || {}).session || "",
      agentLabel: (dispatchFor.get(String(r.id)) || {}).label || "",
      // Which door it came through, so the row can wear the door's glyph.
      via: viaOf(dispatchFor.get(String(r.id))),
      // ---- WHAT PROVED IT ALIVE, AND WHEN --------------------------------
      //
      // The row already asserts "live" in green next to a session id, and that
      // word is the whole basis for the card being on the belt at all. It was an
      // assertion with no shown evidence: `sessionLife` returns WHERE it saw the
      // session and WHEN, and the board threw both away and printed the verdict.
      //
      // A verdict whose evidence is discarded is exactly the shape of claim this
      // feature exists to open up, so the evidence travels with it now.
      life: sessionLife((dispatchFor.get(String(r.id)) || {}).session) || null,
      // The record's own fields, carried whole rather than re-derived in the
      // renderer. `address` is `triggers` under the name the board uses for it
      // out loud - where this deposit is addressed to go next.
      kindWord: kindOf(r),
      tier: r.tier == null ? null : String(r.tier),
      subject: r.subject ? String(r.subject) : null,
      address: r.triggers ? String(r.triggers) : null,
      owner: r.owner ? String(r.owner) : null,
      dimension: r.dimension ? String(r.dimension) : null,
      driver: r.driver ? String(r.driver) : null,
      confidence: r.confidence ? String(r.confidence) : null,
    };
  });

// ---- THE TWO WORKERS, ONE AT EACH END OF THE BELT ---------------------------
//
// Operator, 2026-09-12: "Add a worker to the left side and right side of the
// belt that can light up when working, and have three states: Waiting, Working,
// Closed."
//
// Intake on the left, where deposits arrive; exit on the right, where they
// leave. The belt now has both ends staffed on the drawing, which is the first
// time the diagram has shown WHO moves anything - it has always drawn the
// conveyor and never the hands.
//
// The three states are read as a factory reads them:
//
//   CLOSED   the post is not staffed. Intake is closed until it is armed to
//            dispatch, which is a decision about authority and not a default.
//   WAITING  staffed, able, nothing to do right now. A good resting state.
//   WORKING  moved something within the last cycle.
//
// Read from each worker's own report file, so a worker that has never run shows
// CLOSED rather than a cheerful WAITING it did not earn.
//
// A CATCH IS NOT A MEASUREMENT, and this one used to be treated as one: any
// failure to read the report came back as "has never run". Those are different
// facts. A missing file means the worker has not run; a malformed or unreadable
// one means THE CHECK DID NOT HAPPEN, and reporting that as "never run" sends
// somebody to start a worker that may be running perfectly.
//
// Same rule this board has now had to apply five times - NEVER RUN against
// STALLED, an absent month against a zero month, NOT POSTED against BROKEN,
// absence of progress with a reason against absence without one, and here.
// Absence and failure are different facts and a display that spends one word on
// both is hiding the more actionable one.
const workerState = (file, armedKey) => {
  let j = null;
  try {
    j = JSON.parse(fs.readFileSync(path.join(CTX, file), "utf8"));
  } catch (err) {
    if (err && err.code === "ENOENT") return { state: "CLOSED", why: "has never run", at: null };
    // Present and unreadable. Say so: it is a fault in the report, not a fact
    // about the worker.
    return { state: "UNREADABLE", why: String(err && err.message).slice(0, 18), at: null };
  }
  const at = Date.parse(j.checkedAt || "") || null;
  const stale = at === null || now - at > 6 * MS.h;
  if (stale) return { state: "CLOSED", why: `last ran ${at ? ago(at) : "never"}`, at };
  if (armedKey === "intake") {
    if (!j.armed) return { state: "CLOSED", why: "not armed to dispatch", at };
    if ((j.dispatched || []).length) return { state: "WORKING", why: `dispatched ${j.dispatched.length}`, at };
    return { state: "WAITING", why: j.room ? `room for ${j.room}` : "belt full", at };
  }
  if ((j.abandoned || []).length) return { state: "WORKING", why: `returning ${j.abandoned.length}`, at };
  if ((j.delivered || []).length) return { state: "WORKING", why: `delivered ${j.delivered.length}`, at };
  return { state: "WAITING", why: `${(j.working || []).length} in hand`, at };
};
// ---- THREE DOORS, NOT ONE ---------------------------------------------------
//
// Operator, 2026-09-12: "Intake needs to definitely know what is on the board,
// no matter how it got there. We can then clarify intakes as: Auto Intake
// (Working, Listening, Off), Chat Intake (Working, Listening, Off), Spawn
// Intake (Working, Listening, Off)." And: "We can add count to the intakes to
// know how many came through that door or how many currently processing."
//
// Work reaches the belt through three doors and only one was drawn. AUTO is the
// intake worker dispatching on a schedule. CHAT is a person opening a session.
// SPAWN is an agent starting another agent. Two of the three were invisible, so
// the board described a single INTAKE post that was reporting one third of the
// truth and looked complete.
//
// THE DOOR NAMES ARE NOT A NEW VOCABULARY. They are the trigger classes this
// plan already carries - scheduled, invoked-by-a-person, spawned-by-an-agent -
// and the fact that the same three words answer "what fires a trigger" and
// "which door did this arrive through" is the reason the model is right rather
// than a coincidence. Do not mint a second set of words for either.
//
// A dispatch record carries `via`. Where it does not, the door is UNKNOWN and
// is reported as unknown - never guessed. An attribution invented to make three
// lanes look busy would be the same defect as a count that does not count.
// A FUNCTION DECLARATION, DELIBERATELY, AND NOT A CONST ARROW.
//
// It was a const arrow and the board stopped building: "Cannot access 'viaOf'
// before initialization". Two readers above this line call it while the file is
// still executing top to bottom - the belt row mapper at :654 and the live-agent
// row mapper at :1654 - and a const is in its dead zone until the line that
// defines it runs. A declaration is hoisted, so where it sits in the file stops
// mattering, which is the right property for a pure two-line helper that four
// separate passes need.
function viaOf(d) {
  const v = String((d && d.via) || "").toLowerCase();
  return v === "auto" || v === "chat" || v === "spawn" ? v : "unknown";
}

// Can the board see this door at all? The two evidence sources are the session
// transcripts and the worktrees; either can be absent on a host.
//
// UNREADABLE IS NOT QUIET. A lane whose evidence failed to load must never show
// LISTENING - that is a green light for a check that did not run, which is this
// board's most-repeated defect. It shows UNOBSERVED instead, because absence and
// failure are different facts.
// SWALLOW ONLY THE ERROR YOU EXPECT.
//
// This is the rule the whole board needed and did not have. A bare `catch {}`
// around a filesystem read also catches ReferenceError, TypeError and every
// other programming mistake, and then returns a plausible status - so a broken
// check is indistinguishable from a check that ran and found nothing.
//
// It happened here, and it is worth keeping the instance. The liveness fix
// removed `SESSION_DIR`; this function still referenced it; the ReferenceError
// was swallowed and the CHAT door reported UNOBSERVED. The build succeeded. The
// board went on being confidently wrong, and nothing anywhere said a check had
// not executed. Found by reading the rendered door state, never by the build.
//
// So: a missing directory is expected and answered. Anything else is a bug and
// must be allowed to kill the build, because a crash is a message and a
// plausible status is not.
const expectedFsError = (err) =>
  !!err && ["ENOENT", "ENOTDIR", "EACCES", "EPERM", "EBUSY", "EMFILE", "ELOOP", "ENAMETOOLONG"].includes(err.code);

const canSeeSessions = (() => {
  try {
    return fs.readdirSync(PROJECTS).some((d) => d === PROJECT_BASE || d.startsWith(`${PROJECT_BASE}--claude-worktrees-`));
  } catch (err) {
    if (expectedFsError(err)) return false;
    throw err;
  }
})();
const canSeeWorktrees = fs.existsSync(WORKTREES);

// LIVE CHATS. Operator, 2026-09-14: "check chat instance and give a count that
// will appear in the Chat listening intake ui on the board. Count claude chat
// active."
//
// Alive by the same evidence a dispatch is alive by - a transcript under
// ~/.claude/projects written inside DISPATCH_ALIVE_MS - so the door and the
// belt can never disagree about whether a session is there. Two counts: this
// repo's project directories (the door's own), and the whole host, because a
// chat in another repo is still a chat this door cannot see and the panel
// should say so. The server recomputes this on /chat and the page refreshes
// the door every thirty seconds, so the number on the wall is never an hour
// old. `seen` false means the directory could not be read, which is a
// different fact from zero chats and is drawn differently.
const chatLive = (() => {
  // alive = written inside the belt's window (30m): has this agent walked away?
  // active = written inside one beat: is somebody chatting right now? The door
  // shows active; the panel shows both. Operator: a thirty-minute figure "may
  // make the board look stale" - it did, because it answered the other question.
  const out = { repo: 0, host: 0, active: 0, activeHost: 0, seen: canSeeSessions };
  try {
    for (const d of fs.readdirSync(PROJECTS, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const mine = d.name === PROJECT_BASE || d.name.startsWith(`${PROJECT_BASE}--claude-worktrees-`);
      let files;
      try {
        files = fs.readdirSync(path.join(PROJECTS, d.name));
      } catch (err) {
        if (expectedFsError(err)) continue;
        throw err;
      }
      for (const f of files) {
        if (!f.endsWith(".jsonl")) continue;
        let m;
        try {
          m = fs.statSync(path.join(PROJECTS, d.name, f)).mtimeMs;
        } catch (err) {
          if (expectedFsError(err)) continue;
          throw err;
        }
        if (now - m < DISPATCH_ALIVE_MS) {
          out.host++;
          if (mine) out.repo++;
        }
        if (now - m < GRID) {
          out.activeHost++;
          if (mine) out.active++;
        }
      }
    }
  } catch (err) {
    if (!expectedFsError(err)) throw err;
    out.seen = false;
  }
  return out;
})();

// NOW = open deposits riding the belt through this door, with a live session.
// TODAY = dispatch records through this door stamped today, whatever became of
// them. He asked for both and they answer different questions: one is load, the
// other is throughput.
const startOfDay = (() => {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();
const laneNow = { auto: 0, chat: 0, spawn: 0, unknown: 0 };
for (const r of withLiveAgent) laneNow[viaOf(dispatchFor.get(String(r.id)))]++;
const laneToday = { auto: 0, chat: 0, spawn: 0, unknown: 0 };
for (const r of records) {
  if (!r.dispatch) continue;
  const at = Date.parse(r.dispatch.at || r.run || "") || 0;
  if (at >= startOfDay) laneToday[viaOf(r.dispatch)]++;
}

// AUTO is the only door that can genuinely be switched OFF, because it is the
// only one the factory operates. A person can always open a chat and an agent
// can always spawn one, so OFF is not a state those two can be in - the most
// the board can honestly say is that it cannot see them.
const autoLane = (() => {
  let j = null;
  try {
    j = JSON.parse(fs.readFileSync(path.join(CTX, "intake-worker.json"), "utf8"));
  } catch (err) {
    // Absent and unreadable are different facts - see the note on workerState.
    // Both land on UNOBSERVED, which is honest either way, but the reason has to
    // be true or it sends somebody to fix the wrong thing.
    return { state: "UNOBSERVED", why: err && err.code === "ENOENT" ? "has never run" : "report unreadable" };
  }
  const at = Date.parse(j.checkedAt || "") || null;
  if (at === null || now - at > 6 * MS.h) return { state: "UNOBSERVED", why: `last ran ${at ? ago(at) : "never"}` };
  if (!j.armed) return { state: "OFF", why: "not armed" };
  if ((j.dispatched || []).length) return { state: "WORKING", why: `sent ${j.dispatched.length}` };
  return { state: "LISTENING", why: j.room ? `room for ${j.room}` : "belt full" };
})();

const openDoor = (seen, count, why) => {
  if (!seen) return { state: "UNOBSERVED", why };
  return count ? { state: "WORKING", why: `${count} in hand` } : { state: "LISTENING", why: "nothing arrived" };
};

const lanes = [
  {
    key: "chat",
    name: "CHAT",
    ...openDoor(canSeeSessions, laneNow.chat, "no transcripts"),
    now: laneNow.chat,
    today: laneToday.chat,
    live: chatLive.seen ? chatLive.repo : null,
    liveHost: chatLive.seen ? chatLive.host : null,
    active: chatLive.seen ? chatLive.active : null,
    activeHost: chatLive.seen ? chatLive.activeHost : null,
  },
  {
    key: "auto",
    name: "AUTO",
    ...autoLane,
    now: laneNow.auto,
    today: laneToday.auto,
  },
  {
    key: "spawn",
    name: "SPAWN",
    ...openDoor(canSeeWorktrees, laneNow.spawn, "no worktrees"),
    now: laneNow.spawn,
    today: laneToday.spawn,
  },
];

// WHAT THE DOORS CANNOT SEE, SAID OUT LOUD.
//
// His instruction was that intake know what is on the board however it got
// there, and the honest answer today is that it does not know everything. Two
// gaps, both measured rather than supposed:
//
//   unattributed  a dispatch record with no `via`. The door is unknown.
//   unrecorded    a session the board CAN see, working in this repo, that no
//                 belt record names. Intake's capacity cannot count it, because
//                 there is nothing to count - the gap is a missing record, not a
//                 wrong filter.
//
// Drawn as a line under the three lanes rather than folded into one of them,
// because attributing it to a door would be the invention this whole field
// exists to prevent.
const namedSessions = new Set();
for (const r of records) if (r.dispatch && r.dispatch.session) namedSessions.add(String(r.dispatch.session));
const unrecordedSessions = (() => {
  if (!canSeeWorktrees) return null;
  let n = 0;
  try {
    for (const d of fs.readdirSync(WORKTREES, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      // Judged by the same evidence a dispatch is judged by, not by the folder
      // mtime. Counting these off the folder would have under-reported exactly
      // the busy sessions it exists to notice.
      const life = sessionLife(d.name);
      if (!life || !life.alive) continue;
      if (!namedSessions.has(d.name)) n++;
    }
  } catch {
    return null;
  }
  return n;
})();

const workers = {
  exit: { name: "EXIT", ...workerState("exit-worker.json", "exit") },
};

// ---- WAITING, BY DOMAIN - ALL OF THEM ---------------------------------------
//
// Operator, 2026-09-12: "same for the body mind spirit legend count."
//
// It listed three domains because three were drawn as carriers, so work
// contracted to any other domain was counted nowhere and the column did not sum
// to the waiting total. The same defect as the belt: the drawing decided what
// the data was allowed to say.
//
// Now every domain with waiting work appears, and only domains with waiting
// work. An empty domain is not listed at all rather than shown as a zero -
// absent and none are different facts, and a list of zeroes teaches the eye to
// skip the whole block.
//
// Excludes anything on the belt, because a dispatched item is not waiting.
const waitingByDomain = (() => {
  const beltIds = new Set(onBelt.map((e) => e.rid));
  const tally = {};
  for (const r of circulating) {
    if (beltIds.has(String(r.id))) continue;
    const trig = String(r.triggers || "");
    const dim = trig.startsWith("contract:") ? trig.slice("contract:".length) : String(r.owner || r.dimension || "other");
    tally[dim] = (tally[dim] || 0) + 1;
  }
  return Object.entries(tally)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([dim, count]) => ({ dim, count, color: HUE[dim] || HUE.build }));
})();

// How long the oldest thing has been sitting untouched, because "nothing is
// working on them" is a fact that gets worse with time and should show it.
const oldestWaiting = (() => {
  const ts = circulating.map(runAt).filter(Boolean);
  return ts.length ? Math.min(...ts) : null;
})();

// A carrier moves only if something in ITS OWN domain was acted on. The headline
// said NOBODY IS WORKING while the three cards still flew around the loop, which
// is the same lie in a smaller font - and worse, because the cards are the thing
// the eye follows.
const actedAtInDim = (dim) => {
  const ids = new Map(records.map((r) => [String(r.id), r]));
  let latest = null;
  for (const r of records) {
    const subj = r.subject && ids.get(String(r.subject));
    if (!subj) continue;
    if (!ridesCarrier(subj, dim)) continue;
    const t = runAt(r);
    if (t && (latest === null || t > latest)) latest = t;
  }
  return latest;
};
const carrierStates = CARRIER_DIMS.map((dim) => {
  const count = loadFor(dim);
  const stalled = liveness.label === "STALLED";
  const dimActedAt = actedAtInDim(dim);
  const dimMoving = dimActedAt !== null && now - dimActedAt < fastestMs * 3;
  return {
    dim,
    count,
    moving: count > 0 && dimMoving && !stalled,
    // SCHEDULED was the old word and it was not true: nothing is scheduled to
    // collect these. WAITING says what is actually happening.
    pill: count === 0 ? "ALL CLEAR" : stalled ? "STALLED" : dimMoving ? "MOVING" : "WAITING",
    pillHue:
      count === 0
        ? "oklch(0.66 0.14 150)"
        : stalled
          ? "oklch(0.70 0.15 25)"
          : dimMoving
            ? "oklch(0.72 0.13 150)"
            : "oklch(0.76 0.12 75)",
  };
});
// WAITING is not IDLE, and the difference is the whole point. Idle means there
// is nothing to do. Waiting means there IS work, addressed to a domain, and
// nobody is doing it - which on this board has been the true state all along.
//
// AND UNTRIAGED IS NEITHER. When the kind taxonomy landed, every record on the
// belt became a deposit until somebody accepted it, so `circulating` went to
// zero and this line would have printed IDLE - "nothing to do" - over an
// incoming column holding thirty-three unjudged findings. That is the exact lie
// this board keeps being corrected for, arriving through a new door.
//
// UNJUDGED is the fourth state and it outranks IDLE, because a queue nobody has
// looked at is a fact about the factory and an empty one is not.
const beltState =
  liveness.label === "STALLED"
    ? "STALLED"
    : beltMoving
      ? "RUNNING"
      : circulating.length > 0
        ? "WAITING"
        : awaitingTriage.length > 0
          ? "UNJUDGED"
          : "IDLE";
// SHORT ON THE BOARD, LONG ON HOVER.
//
// Operator, 2026-09-12, on the waiting subtitle: "Waiting on message from 3
// Intake agents." It was a 200-character paragraph standing in the middle of
// the conveyor loop - nine wrapped lines of which eight were a DEFINITION that
// never changes ("a deposit reaches the belt only when a named agent is working
// on it..."). A definition is not a status, and the same explanation is already
// printed under the board where there is room for sentences.
//
// This is also what makes the three intake doors possible: the ring's interior
// had no room to give the margins until the prose came out of it. His request
// and the geometry wanted the same thing.
//
// The reasoning is kept, not deleted - it moves to the title attribute, so it
// is one hover away rather than permanently across the belt. The door count is
// read from the lanes rather than typed as a 3, so adding a fourth door cannot
// leave a stale number behind.
const beltWhy =
  beltState === "RUNNING"
    ? `${onBelt.length} on the belt · acted on ${ago(actedAt)}`
    : beltState === "STALLED"
      ? "triggers overdue"
      : beltState === "IDLE"
        ? "nothing waiting and nothing running"
        : beltState === "UNJUDGED"
          ? `${awaitingTriage.length} deposited, none accepted as work yet`
          : `waiting on word from ${lanes.length} intake doors · ${circulating.length} queued, oldest ${oldestWaiting ? inWords(now - oldestWaiting) : "unknown"}${abandoned.length ? ` · ${abandoned.length} abandoned` : ""}`;

// The full account, for the hover. Never shown on the board itself.
const beltWhyFull =
  beltState === "WAITING"
    ? `${circulating.length} waiting, none dispatched. Oldest ${oldestWaiting ? inWords(now - oldestWaiting) : "unknown"}. A deposit reaches the belt only when a named agent is working on it and that session is alive on disk. ${abandoned.length ? `${abandoned.length} was dispatched and abandoned.` : "Nothing has been dispatched."} The three intake doors are chat, auto and spawn; each shows how many it has on the belt now and how many it admitted today.`
    : beltState === "UNJUDGED"
      ? `${awaitingTriage.length} deposit(s) are waiting to be judged and none has been accepted as work. Only a contract may ride the belt, so nothing can be dispatched until somebody accepts something - open a deposit and press ACCEPT AS WORK, or run triage.cjs. This is not the same as having nothing to do, and the board will not call it that.`
      : beltWhy;

// The same line with its two time-words live. A function, because `live`
// needs `esc`, which is initialised further down; the template calls this.
function beltWhyHtml() {
  if (beltState === "RUNNING") return `${onBelt.length} on the belt · acted on ${live("ago", actedAt, ago(actedAt))}`;
  if (beltState === "WAITING")
    return `waiting on word from ${lanes.length} intake doors · ${circulating.length} queued, oldest ${oldestWaiting ? live("since", oldestWaiting, inWords(now - oldestWaiting)) : "unknown"}${abandoned.length ? ` · ${abandoned.length} abandoned` : ""}`;
  return esc(beltWhy);
}

// Throughput, not just inventory. Eight of seventeen records are finished and
// the board had no way to say so - closed work scrolled past and vanished, so a
// factory that resolved everything would have looked emptiest of all.
// Counted the same way the RESOLVED column is built, because it is the number
// printed beside that column. It used to count closers too, so the centre said
// 22 resolved while the list next to it showed 16 - and a person reading both at
// once has no way to know which to believe.
//
// Sixth place in this file where one rule was written twice and drifted. They
// are consolidated now: isOpen and isDone are the only definitions, and every
// count is derived from them.
//
// SEVENTH, WITHIN MINUTES OF WRITING THAT. Notes were excluded from the RESOLVED
// column and not from this count, so the centre printed "39 resolved" beside a
// column headed "38 out" - the identical defect described two paragraphs up,
// re-committed by the change that was quoting it. Found by looking at the
// rendered board rather than by reading the code, which is the only way it could
// have been found: both numbers were individually correct.
//
// So it is now derived from the column itself. There is nothing left to keep in
// step, because there is only one thing - and it is a function rather than a
// value because the column is built further down, once the belt's live agents
// are known. A const here read `resolved` before it was assigned and threw,
// which is the fourth time this file has been caught ordering a declaration
// after its first use.
const closedCount = () => resolved.length;

// ---- CAN HE STOP WATCHING? ---------------------------------------------------
//
// Operator, 2026-09-11: "We're trying to find out now that we are in autonomous
// proximity. I'm getting closer. What should the purpose of looking at the board
// become?"
//
// The flaw he is pointing at: this board answers "is the factory running", and
// that question dies exactly as autonomy arrives. A display whose value falls as
// the system improves is built backwards.
//
// The question that replaces it is whether the factory's judgement can be
// trusted - and that is not granted by declaration, it is earned by a visible
// record. Without a number he can see, he cannot tell whether he is allowed to
// look away, so he keeps checking, which is the exact cost this whole system was
// built to remove.
//
// WHAT THE NUMBER MAY AND MAY NOT CLAIM. "Held" does not mean right. It means
// NOT LATER UNDONE, which is the only thing the belt can actually prove. The
// label says so, because a trust score that overstates itself destroys the thing
// it is measuring.
//
// It must be able to go down, and a correction counts against it even when the
// factory is the one that caught it. Especially then - a score that only rises
// is decoration.
// THE LABEL IS "CLOSED BY THE FACTORY", NOT "DECIDED WITHOUT YOU".
//
// The second is what he actually wants to know and the belt cannot support it:
// no record says whether he was present when it was resolved. Some of these were
// closed while he was asleep and some were closed with a sentence of his in the
// evidence. A number that quietly counts both as unattended is exactly the kind
// of flattering measurement that makes a trust score worthless.
//
// So it claims only what it can prove - the factory took these to an end state,
// and this many have not since been undone - and the gap is on the belt as its
// own finding rather than papered over. The stronger number is buildable: the
// clock knows which runs were scheduled, and a record deposited during one with
// no operator turn in the window is genuinely alone.
//
// An earlier version of this had a real arithmetic fault, caught by auditing the
// records it named instead of reading the total: reversals were subtracted from
// a population that excluded two of them, so the score punished the factory for
// work it had not been credited with. Both sides now count the same records.
const REVERSAL = /^terminal:(corrected|reverted|superseded|withdrawn|false-alarm)/;
const trust = (() => {
  const terminal = records.filter(isDone);

  // Two exclusions, and only two. A closer is the paperwork on a piece of work
  // that is counted in its own right, so counting it as well would credit the
  // factory twice for one job. A definition is not an outcome at all.
  // Annotations excluded too - writing a lesson down is not a piece of work the
  // factory can claim credit for having closed.
  const counted = terminal.filter((r) => !isCloser(r) && !isAnnotation(r) && !NOTING.test(String(r.triggers || "").trim()));
  // Reversals are drawn from the SAME population, including the bookkeeping ones
  // that mark an earlier answer wrong - a correction has to cost the score even
  // when the factory is the one that caught it. Especially then; a number that
  // only rises is decoration.
  // A record counts as undone when its END WORD is a reversal - its own if it
  // ended itself, or the word of whatever closed it. That way a finding closed
  // by a later "corrected" costs the score, which is the only reason the score
  // is worth reading.
  const reversed = counted.filter((r) => REVERSAL.test("terminal:" + endWord(r))).length;
  const held = Math.max(0, counted.length - reversed);
  const decisions = counted.length;

  // His, by law: deletion, money, identity, and a direction between genuinely
  // different futures. These are not failures of the factory and must never be
  // counted as such - work it declined to do alone is work it correctly refused.
  const his = records.filter((r) => r.operatorDecision).length;

  return {
    decisions,
    held,
    reversed,
    his,
    // Shown as a fraction, never a percentage. A percentage of fourteen reads
    // like a percentage of a thousand, and at this sample size that is a lie of
    // presentation rather than of arithmetic.
    line: `${held} of ${decisions} held`,
  };
})();

// ---- the classroom's material ------------------------------------------------
//
// Lessons, newest first, each shown ONCE. A lesson he has already opened is
// marked known and drops below the ones he has not - it is never deleted,
// because a thing you learned is still a thing you know, but it stops competing
// for the top of the screen with something new.
const learned = (() => {
  const seen = new Set();
  const items = [];
  for (const r of [...records].reverse()) {
    // Walk the FINDINGS, not the annotations. A lesson attached by a later
    // record belongs to the finding it explains, so the context line has to be
    // that finding's claim - the first version printed "Lesson recorded from the
    // finding above", which is the annotation talking about itself and tells the
    // reader nothing about what happened.
    if (isAnnotation(r)) continue;
    const lesson = lessonOf(r);
    if (!lesson) continue;
    const key = String(lesson).slice(0, 120);
    if (seen.has(key)) continue; // the same lesson twice is the failure state
    seen.add(key);
    const t = runAt(r);
    items.push({
      lesson: String(lesson).replace(/\s+/g, " "),
      from: headlineOf(r).slice(0, 90),
      tag: TAG[r.dimension] || String(r.dimension || "?").slice(0, 5),
      color: HUE[TAG[r.dimension]] || HUE.build,
      time: t ? hhmm(t) : "--:--",
      fresh: !readState.ids.has(String(r.id)),
      rid: String(r.id),
    });
  }
  // Unread first, then newest. The board's job is to put the unknown in front of
  // him, not to preserve chronology for its own sake.
  items.sort((a, b) => (a.fresh === b.fresh ? 0 : a.fresh ? -1 : 1));
  return items;
})();

const newCount = learned.filter((l) => l.fresh).length;

// ---- THE HORIZON: where this is heading, and how far along -------------------
//
// Operator, 2026-09-11: "It also lets me see the future of where things are
// heading. The roadmap that has been ahead, whether the repos, the app has
// reached its full maturity and is operating in its peak cycle."
//
// The rule that governs this pane is already written in this repo's CLAUDE.md
// and it is the hard one: DO NOT PRESUME A CEILING. "Amazon sold books, Netflix
// mailed discs." The stage is evidence, never assumption - and where a growth
// stage is genuinely unknown, say so rather than inventing a ladder.
//
// So this pane invents nothing. It reports three things that are measurable and
// one thing that is missing, and the missing one is the honest headline.
// A plan may declare its stage two ways, and only one of them was being read.
//
// The board reported "44 of 57 plans do not say what stage they are at", and a
// sweep of those 44 found several that say it perfectly clearly - as a SECTION
// rather than a field:
//
//     ## 0. Status
//     Executing. Operator-directed, converged in session 2026-09-02...
//
// refer.sms-consent says Executing, refer.tebs.console says paused mid-design,
// refer.sanctuary-bible-list says proposal only. All three were counted as
// silent. The instrument was wrong before the thing it measured was wrong, which
// is the third time today that has been the actual finding.
//
// Both forms are read now. A heading takes the first non-empty line under it,
// which is where the answer always is.
const declaredStatus = (head) => {
  const inline = head.match(/^\s*(?:[-*]\s*)?\*{0,2}(?:status|state|phase|stage)\*{0,2}\s*[:=]\s*(.+)$/im);
  if (inline && inline[1].trim()) return inline[1].trim();
  const lines = head.split("\n");
  for (let i = 0; i < lines.length; i++) {
    // "## Status", "## 0. Status", "**Status**" - a heading whose whole content
    // is the word.
    if (!/^\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?\*{0,2}(status|state|stage)\*{0,2}\s*$/i.test(lines[i])) continue;
    for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
      const v = lines[j].replace(/[*_`>]/g, "").trim();
      if (v) return v;
    }
  }
  return null;
};

const horizon = (() => {
  const planDir = path.join(ROOT, "refer.app/plan");
  // NOT EVERYTHING IN THE PLAN FOLDER IS A PLAN, and counting them as one is
  // what made the road ahead look emptier than it is. The sweep found reference
  // documents describing how video moves through the system, inventories that
  // were complete the moment they were produced, a spec superseded by another
  // file, and two pieces of marketing copy. None of those have a stage, and
  // demanding one of them would be forcing a shape onto documents that are not
  // the shape.
  //
  // Order matters: superseded and reference are checked before the stage words,
  // because "reference for how X works" contains no stage and a loose match
  // would otherwise file it by whatever verb happened to appear.
  const STAGE = [
    { key: "superseded", label: "superseded", re: /\b(superseded|canonical in|replaced by|no longer)\b/i },
    { key: "reference", label: "reference, not a plan", re: /\b(reference|vocabulary|theory|inventory only|research only|decision brief|not a plan|marketing|positioning)\b/i },
    { key: "complete", label: "done", re: /\b(complete|shipped|retired|closed|produced)\b/i },
    { key: "executing", label: "building", re: /\b(executing|contracted|in progress|precommit|green|live tracker)\b/i },
    { key: "complete", label: "done", re: /precommit_green/i },
    { key: "ready", label: "ready to start", re: /\b(ready|draft_ready|scaffolding|entered|approved|final)\b/i },
    // "Still being specified" is the phrase the sweep actually wrote into
    // thirty-odd documents, and the first version of this list did not contain
    // it - so eleven plans that now declare their stage perfectly clearly were
    // still counted as silent. The vocabulary a parser accepts and the
    // vocabulary a writer uses have to be the same list, and the only way to
    // know they are is to read the number back afterwards.
    { key: "intake", label: "still being specified", re: /\b(intake|idea|scoping|unratified|proposal only|rough.?draft|concept|paused|parked|shelved|being specified|not implemented|not yet started)\b/i },
  ];
  const counts = { complete: 0, executing: 0, ready: 0, intake: 0, reference: 0, superseded: 0 };
  let silent = 0;
  let unreadable = 0;
  let total = 0;
  try {
    for (const f of fs.readdirSync(planDir)) {
      if (!f.endsWith(".md")) continue;
      total++;
      const head = fs.readFileSync(path.join(planDir, f), "utf8").slice(0, 4000);
      const declared = declaredStatus(head);
      if (!declared) {
        silent++;
        continue;
      }
      const hit = STAGE.find((s) => s.re.test(declared));
      // DECLARED-BUT-UNREADABLE IS NOT SILENT. sentinel.md says "Status: GBIR
      // FLOW" - a real declaration in a private vocabulary nobody else speaks.
      // Filing that as "says nothing" would be the same conflation this board
      // already has a rule against: absence and failure are different facts.
      // One is a document that never answered; the other answered in a language
      // the reader does not have, and they need opposite fixes.
      if (hit) counts[hit.key]++;
      else unreadable++;
    }
  } catch {
    /* no plan directory is a legitimate state for a repo that has none */
  }

  // Measurable distances, each with a declared target so "how far" is a fact
  // rather than a feeling. A bar with no declared end is a mood, not a measure.
  const tracks = [
    { label: "routes proven", at: scriptsRegistered ?? 0, of: scriptsTotal ?? 0, why: "machinery anyone can find and drive, rather than remember" },
    { label: "repos wired", at: wiredRepos, of: Number(extras.repos) || 14, why: "repos with a trigger watching them" },
    { label: "domains watched", at: ["body", "mind", "spirit"].filter((d) => stations.some((s) => s.owns === d)).length, of: 3, why: "body, mind and spirit each with a watcher" },
  ];

  // THE INSTRUMENT THAT WOULD ANSWER "IS IT MATURE" IS ITSELF STALE, and that is
  // the most useful thing this pane can say. The blueprint is the transition map
  // the whole prediction idea rests on, and it was generated before livestream,
  // the sanctuary stack, Office, Stripe Connect, SMS and replay existed.
  let blueprintAge = null;
  try {
    const bp = JSON.parse(fs.readFileSync(path.join(ROOT, "refer.app/maps/blueprint.map.json"), "utf8"));
    const gen = Date.parse(bp.generatedAt || "");
    if (!Number.isNaN(gen)) blueprintAge = Math.round((now - gen) / MS.d);
  } catch {
    /* absent is different from stale, and the pane says which */
  }

  return { counts, silent, unreadable, total, tracks, blueprintAge };
})();

// THE PLAN REGISTER, which is a different thing from the plan FOLDER above.
//
// Operator, 2026-09-21: "put them on the board ... we might need icons on the
// board or filters on the board that deals with plans. Because I don't think
// the board has a plan thing. It just has intake."
//
// He was right, and the reason is worth keeping. HORIZON reads the markdown
// folder and infers a stage by matching prose - which was the only thing
// available when it was written, and which counts DOCUMENTS. The canonical
// register is `public/assets/plan/refer.plan.json`: plans carrying a real
// status field, an owner, a branch and acceptance criteria. Two sources
// describing the same subject is how a board starts arguing with itself, so
// they are deliberately given different jobs: the register answers WHAT IS
// BEING BUILT, the folder answers WHICH DOCUMENTS EXIST, and the HORIZON pane
// now says so in those words.
//
// A PLAN IS NOT A CONTRACT AND MUST NEVER BE COUNTED AS ONE. `kind.cjs` is
// explicit that a contract is work somebody owes and the only kind that may
// ride the belt, be dispatched, or count toward open work - and that guessing
// something into the work queue is the failure that model exists to prevent.
// Registered intent is not owed by anyone. So plans get their own key, their
// own pane and their own two-letter mark; they touch neither the belt nor the
// kind vocabulary, and `openCount` does not move because this key exists.
//
// A plan therefore has a HORIZON rather than an age. A contract sitting three
// days is an alarm; a plan sitting three months is a plan. The horizon is
// derived from the status the register already carries, never from an invented
// due date - a date nobody committed to would harden into a promise nobody
// made, which is the same class of claim as a green check that checks nothing.
const plans = (() => {
  const file = path.join(ROOT, "public/assets/plan/refer.plan.json");
  const DEAD = /^(completed|archived|retired|superseded)/i;
  // Status words the register actually uses, read off it rather than assumed.
  const NOW = /^(in progress|executing|building|gbir flow|execution flow)/i;
  const NEXT = /^(ratified|ready|registered)/i;
  const LATER = /^(planned|planning|scoping)/i;
  const HELD = /^(postponed|parked|provider-blocked|blocked)/i;
  let doc = null;
  try {
    doc = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    // A repo with no register is a legitimate state, and an empty pane that
    // says so is better than one that invents a roadmap.
    return { present: false, total: 0, live: 0, buckets: [], rows: [] };
  }
  const all = Array.isArray(doc && doc.plans) ? doc.plans : [];
  const live = all.filter((p) => !DEAD.test(String((p && p.status) || "")));
  const bucketOf = (status) => {
    const s = String(status || "");
    if (NOW.test(s)) return "now";
    if (NEXT.test(s)) return "next";
    if (HELD.test(s)) return "held";
    if (LATER.test(s)) return "later";
    // DECLARED BUT UNPLACED is not the same as held, and filing it as held
    // would hide a status word this reader has never met. Named, not guessed -
    // the same rule the pane above already applies to "declared in words the
    // board cannot read".
    return "unplaced";
  };
  const rows = live
    .map((p) => ({
      id: String((p && p.id) || ""),
      title: String((p && p.title) || ""),
      status: String((p && p.status) || ""),
      owner: String((p && p.primary_owner) || ""),
      bucket: bucketOf(p && p.status),
      // The note is where the cleanup pass recorded what it found - which
      // phase a plan actually reached, or why it is held. It is the single
      // most useful sentence on the row, so it travels with the row rather
      // than being summarised away.
      note: String((p && p.notes) || ""),
      // WHAT THE INSPECTION SHOWS. Operator, 2026-09-21: "I need inspection on
      // those plans. Pop up." A row can hold a title; a decision needs the
      // problem it solves, what "done" means, and what it must not touch. All
      // of it is already in the register, so none of it is summarised here -
      // it is carried whole and clipped only where a list would otherwise run
      // to a thousand lines.
      problem: String((p && p.problem) || ""),
      smallest: String((p && p.smallest_end_to_end) || ""),
      constraint: String((p && p.constraint) || ""),
      criteria: (Array.isArray(p && p.acceptance_criteria) ? p.acceptance_criteria : []).slice(0, 12).map(String),
      nonScope: (Array.isArray(p && p.non_scope) ? p.non_scope : []).slice(0, 8).map(String),
      questions: (Array.isArray(p && p.open_questions) ? p.open_questions : []).slice(0, 8).map(String),
      paths: (Array.isArray(p && p.target_paths) ? p.target_paths : []).slice(0, 10).map(String),
      branch: String((p && p.branch_name) || ""),
      spec: String((p && p.spec_markdown) || ""),
      updated: String((p && p.updated_at) || ""),
    }))
    .sort((a, b) => {
      const order = { now: 0, next: 1, later: 2, held: 3, unplaced: 4 };
      return order[a.bucket] - order[b.bucket] || a.id.localeCompare(b.id);
    });
  const buckets = [
    { key: "now", label: "being built", why: "someone is working it now" },
    { key: "next", label: "ready to start", why: "registered or ratified, nobody assigned" },
    { key: "later", label: "written, not begun", why: "planned, or still being scoped" },
    { key: "held", label: "held", why: "postponed, parked or waiting on a provider" },
    { key: "unplaced", label: "status the board cannot place", why: "a word this reader has never met" },
  ]
    .map((b) => Object.assign({}, b, { n: rows.filter((r) => r.bucket === b.key).length }))
    .filter((b) => b.n > 0);
  return { present: true, total: all.length, live: live.length, buckets, rows };
})();

// Now that carriers and watched dimensions are known, each row can say what is
// actually happening to it.
// A closer is not shown on its own. The record it closed now carries that
// closure's word, so printing both would list the same piece of work twice -
// once as the problem and once as the paperwork.
// INCOMING is now only what has NOT been picked up. Anything riding the belt
// has moved to PROCESSING, so a deposit appears in exactly one column and moves
// left to right as it progresses - which is what he asked for the first time
// this board was rebuilt, and what it has never actually done.
// A NOTE IS IN NEITHER COLUMN. It is not incoming work and it never resolves -
// it is read, or it is not. Operator, 2026-09-12: "don't put notifications on
// the belt, only contracts to be processed", and separately: "you can mark
// notifications read by dimming or green and then white."
//
// So there are three destinations rather than one column with four icons: the
// belt for contracts, incoming for deposits and decisions awaiting a judgement,
// and a reading area for notes. A note that is never read is not a failure of
// the factory; a contract that is never worked is, and they cannot share a
// column without one of them lying about the other.
const onBeltIds = new Set(onBelt.map((e) => e.rid));
const isNoteRecord = IX.isNote;
incoming = records
  .filter((r) => !isDone(r) && !isCloser(r) && !isAnnotation(r) && !isNoteRecord(r) && !onBeltIds.has(String(r.id)))
  .reverse()
  .map(rowOf);
resolved = records.filter((r) => isDone(r) && !isCloser(r) && !isAnnotation(r) && !isNoteRecord(r)).reverse().map(rowOf);
forYouCount = incoming.filter((e) => e.forYou).length;
const statusCounts = incoming.reduce((a, e) => ((a[e.status] = (a[e.status] || 0) + 1), a), {});
const kindCounts = incoming.reduce((a, e) => ((a[e.kind] = (a[e.kind] || 0) + 1), a), {});

// THE READING AREA. Newest first, and unread first within that - a green note is
// asking for a glance and a white one is asking for nothing, so the ones asking
// come to the top. Notes carry no worker, no timer, no dispatch and no closure,
// which is why nothing else on this list has a state column.
const notes = records
  .filter((r) => isNoteRecord(r) && !isCloser(r) && !isAnnotation(r))
  .reverse()
  .map(rowOf)
  .sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0));
const unreadNotes = notes.filter((n) => !n.read).length;

// The restart cycle, appended here because it needs `host`, which is resolved
// above. Pending beats elapsed: if an update is queued the machine is already
// due, whatever its uptime says. Nobody had drawn this cycle, and the machine is
// part of the factory - so its countdown belongs on the board with the rest.
const RESTART_FRESH_DAYS = 7;
if (host) {
  const upMs = (host.uptime_hours || 0) * MS.h;
  const span = RESTART_FRESH_DAYS * MS.d;
  const queued = host.reboot_pending === true;
  cycles.push({
    // NOT A TRIGGER, AND NOW IT SAYS SO. This row has always been drawn beside
    // the rhythms and has never been one: no declaration names it and nothing on
    // the schedule fires it. It is a policy value counting down. The rail
    // therefore draws one more cell than the scheduler has triggers, and that
    // difference used to be invisible - which is how a health check came to be
    // mistaken for the tick. Marked here so its panel can say what it is rather
    // than manufacturing a declaration it does not have.
    id: "host-restart-policy",
    policy: true,
    name: "host restart",
    pct: queued ? 100 : Math.max(2, Math.min(100, (upMs / span) * 100)),
    when: queued ? "queued" : inWords(span - upMs),
    pace: `${RESTART_FRESH_DAYS}d`,
    tight: queued,
    hue: queued ? "oklch(0.70 0.15 25)" : HUE.sup,
    // Counts live like the rhythms: boot time is now minus uptime, the span is
    // the policy. Queued is a state, not a countdown, so it carries no facts and
    // the page leaves it alone.
    last: queued ? null : now - upMs,
    intervalMs: queued ? null : span,
    grid: false,
  });
}

const D = {
  liveness,
  wiredRepos,
  host,
  corners,
  carrierStates,
  beltMoving,
  beltState,
  beltWhy,
  carrierCounts,
  dateLine: new Date(now)
    .toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase(),
  hostLine: host
    ? `HOST UP ${Math.round(host.uptime_hours)}H` + (host.reboot_pending ? " · RESTART QUEUED" : "")
    : "HOST UNKNOWN",
  hostWarn: !!(host && host.reboot_pending),
  cycle: runDays.size,
  uptime: `UP ${upDays}d ${upHours}h`,
  pulseBelt,
  sessionBelt,
  chatLive,
  upSince: firstDeposit,
  hostBoot: host ? now - (host.uptime_hours || 0) * MS.h : null,
  hostUpH: host ? `${Math.round(host.uptime_hours)}H` : null,
  cycles,
  loopStrip,
  incoming,
  resolved,
  notes,
  unreadNotes,
  forYouCount,
  statusCounts,
  kindCounts,
  openCount: circulating.length,
  triageCount: awaitingTriage.length,
  heldCount: held.length,
  unplaced,
  leakCount: needsCount,
  leaks: leaks.length,
  closedCount: closedCount(),
  // needs, upcoming, nextPulse, nextHeart, nextDaily D-object entries removed
  // 2026-09-14: fed the removed `needs`/`upcoming` locals and rendered nowhere.
  body: chip("body"),
  mind: chip("mind"),
  spirit: chip("spirit"),
  shedCount,
  trust,
  workers,
  beltWhyFull,
  lanes,
  unattributed: laneNow.unknown,
  unrecordedSessions,
  waitingByDomain,
  onBelt,
  learned,
  horizon,
  plans,
  newCount,
  // NO PLAUSIBLE DEFAULT. This read `extras.detectors || "3/14"`, so a missing
  // or unreadable extras file printed a real-looking measurement that nothing
  // had measured - the one thing the extras file's own header says it exists to
  // prevent ("anything absent renders as unknown rather than as zero"). The
  // three numbers beside it already fall back to a dash; this one did not, and
  // the fallback was the very value it was standing in for, so nobody could tell
  // the difference by looking.
  detectors: extras.detectors != null ? String(extras.detectors) : "—",
  hiveChannels: extras.hiveChannels != null ? String(extras.hiveChannels) : "\u2014",
  routesProven: scriptsRegistered != null && scriptsTotal ? `${scriptsRegistered}/${scriptsTotal}` : "\u2014",
  repos: repoList.length ? String(repoList.length) : extras.repos != null ? String(extras.repos) : "14",
  repoList,
  repoId: REPO_ID,
  builtAt: new Date(now).toISOString(),
  builtLabel: hhmm(now),
};

// ---- CLICK TO EXPLAIN -------------------------------------------------------
//
// Operator, 2026-09-12: "add click info to everything on the board so when
// clicked it shows what this artifact is and what its for. and make sure the
// info correlates to its active wiring as truth."
//
// The second half is the whole constraint, and it is what makes this different
// from documentation. A hand-written description sitting beside a live element
// drifts the moment the wiring changes, and drifts SILENTLY, because nothing
// ever compares the two. This board has two recorded instances of exactly that:
// a rhythm printing a cadence it did not run, and a health check drawn in the
// row belonging to the tick - which is how an instruction to beat every five
// minutes reached the wrong component.
//
// So every panel below is GENERATED from the same values that drew the element.
// Nothing here is authored beside a drawing. Three rules, and the third is the
// one with teeth:
//
//   1. EVERY FIELD NAMES ITS SOURCE - the file and the field it came from - so
//      any claim on this board can be checked without reading code.
//   2. A FACT THE BOARD CANNOT OBTAIN IS SHOWN AS "NOT RECORDED". Never omitted,
//      never inferred, never filled with a plausible default. Omitting it makes
//      an unanswered question look answered.
//   3. WHERE TWO SOURCES DISAGREE, SHOW BOTH AND MAKE THE DISAGREEMENT THE
//      HEADLINE. Do not pick a winner. This is what turns a panel from
//      documentation into a drift detector: click anything, and see whether what
//      it claims matches what it does.
//
// The authored half and the generated half stay visually separate, always.
// PURPOSE is the `why` a person wrote in a declaration - it changes rarely.
// WIRING is derived on every build and changes constantly. Keeping them apart is
// what stops the authored half being quietly trusted as live.

// A wiring row. `value === null` renders as NOT RECORDED - so a caller passes
// the value it actually has and never has to decide whether to omit the row.
const wire = (label, value, source, extra) => ({
  label,
  value: value === null || value === undefined || value === "" ? null : String(value),
  source: source || null,
  ...(extra || {}),
});

// The one place a duration is turned into words for a panel, so a declared
// string and a live millisecond count are never compared in two different
// vocabularies.
const paceWords = (ms) => (ms ? inWords(ms) : null);

const EXPLAIN = {};
const explains = (key, panel) => {
  EXPLAIN[key] = panel;
  return key;
};

// ---- rhythms on the rail ----------------------------------------------------
//
// Purpose comes from the declaration's `why`, which thirteen declarations have
// carried since they were written and the board has never once displayed.
// Wiring comes from the declaration plus the schedule's own state file, and the
// two are shown against each other rather than reconciled.
const explainRhythm = (s) => {
  const d = s.decl || {};
  const st = s.state || {};
  const decl = d.declaredIn ? `${d.declaredIn}` : null;
  const stateOf = (field) => (schedule.from ? `${schedule.from} · triggers.${s.id}.${field}` : null);
  const external = !!d.drivenBy;

  const declaredMs = durMs(d.every) || 0;
  const liveMs = Number(st.intervalMs) || 0;
  const floorMs = durMs(d.floor) || 0;
  const clean = st.lastExit === 0;
  const faulted = st.lastExit != null && st.lastExit !== 0;
  const atFloor = !!floorMs && liveMs === floorMs;

  let headline = null;

  // DECLARED AGAINST ACTUAL. Both numbers, both sources, and the reason where
  // the data supports one - the ladder relaxes on clean runs and drops to the
  // floor on a fault, so a fault plus a tightened interval is a complete
  // explanation. Where the data does NOT explain the difference, the panel says
  // that instead of reaching for the explanation that usually applies. An
  // unexplained difference is a finding, and this is the right place to notice.
  if (declaredMs && liveMs && declaredMs !== liveMs) {
    const tighter = liveMs < declaredMs;
    let because;
    if (!tighter) {
      because =
        "It is running SLOWER than declared, which the adaptive ladder does not do - the ladder only tightens. Nothing in the recorded state explains this, and an unexplained difference is a finding.";
    } else if (faulted) {
      because = `It last exited ${st.lastExit}${s.last ? ` at ${hhmm(s.last)}` : ""}, and the ladder drops to the floor on a fault and only relaxes again on clean runs${atFloor ? " - it is at its floor now" : ""}. It has not earned the time back yet.`;
    } else if (clean && atFloor) {
      because =
        "Its last run was clean and it is sitting on its floor, so the ladder should be letting it out again. Why it has not is NOT RECORDED - the state file keeps the interval and the exit code, not the reason for either.";
    } else if (clean) {
      because =
        "Its last run was clean and this is not its floor, so nothing in the recorded state explains the difference. An unexplained difference is a finding.";
    } else {
      because = "The state file records no exit code for the last run, so the reason for the difference is NOT RECORDED.";
    }
    headline = {
      tone: "disagree",
      text: `Declared every ${d.every || "NOT RECORDED"}, actually running every ${paceWords(liveMs)}. ${because}`,
    };
  } else if (declaredMs && liveMs) {
    headline = { tone: "ok", text: `Declared and actual agree: every ${d.every}.` };
  } else if (declaredMs && !liveMs) {
    headline = {
      tone: "gap",
      text: `Declared every ${d.every}, and the schedule's state file records no interval for it at all. The countdown beside this name is computed from the declaration alone, so it describes what should happen rather than what does.`,
    };
  }

  // AN EXTERNALLY DRIVEN RHYTHM HAS BOTH HALVES TOO, and this panel showed
  // neither against the other. The driver fact replaced the cadence headline
  // outright, so the primordial tick - the one rhythm every other rhythm on
  // this rail is downstream of - was the only cell that never said whether it
  // was keeping its own declared time. Its cadence row read NOT RECORDED beside
  // a declaration of every 5m, on eighty-seven recorded beats.
  //
  // The deposit that asked for this named exactly that case: "the pulse itself
  // read `never fired` while beating every five minutes". The inverse costs
  // more - a stopped tick looking exactly like a beating one - and both are the
  // same defect, which is a panel holding two facts and refusing to subtract.
  //
  // WHO DRIVES IT IS STILL SAID, second. It is the more surprising fact about
  // the row and the reason it looks unlike its neighbours; it is simply not a
  // reason to withhold the comparison.
  //
  // Measured against STALL_RATIO, the same yardstick the liveness lamp uses, so
  // the lamp and this panel can never tell a reader two different stories about
  // one beat.
  if (external) {
    const who = `Driven from outside this repo, by ${d.drivenBy}. It declares no command to run, so there is nothing here for this repo's scheduler to fire - and it is correct that nothing does: this rhythm is what runs the scheduler, so a scheduler that fired it would be firing its own driver. It is declared, discovered, counted and drawn exactly like every other rhythm, which is the point - before it had a declaration of its own the rail had no row for it and borrowed another trigger's row to draw one.`;
    const beats = st.runs == null ? "" : `, on ${st.runs} beats recorded`;
    let tone = "gap";
    let beat;
    if (!declaredMs) {
      beat = "It declares no period either, so there is nothing here to measure its beats against.";
    } else if (!s.last) {
      tone = "disagree";
      beat = `Declared every ${d.every}, and NOT ONE BEAT IS RECORDED. Either it has never fired or its stamp is not reaching this state file, and the board cannot tell which - both are findings.`;
    } else if (now - s.last > declaredMs * STALL_RATIO) {
      tone = "disagree";
      beat = `Declared every ${d.every}, and the last beat landed ${ago(s.last)} - ${Math.floor((now - s.last) / declaredMs)} periods back, past the ${STALL_RATIO}x the liveness lamp allows before it calls the factory stalled. It is NOT keeping its declared time${beats}.`;
    } else {
      tone = "ok";
      beat = `Declared and observed agree: it declares every ${d.every} and its last beat landed ${ago(s.last)}, inside that period${beats}.`;
    }
    headline = { tone, text: `${beat} ${who}` };
  }

  return {
    title: (CYCLE_NAME[s.id] || s.id.replace(/-/g, " ")).toUpperCase(),
    kind: external ? "rhythm on the rail — driven from outside this repo" : "rhythm on the rail — a trigger this repo's scheduler fires",
    headline,
    purpose: d.why
      ? { text: String(d.why), source: decl ? `${decl} · why` : null }
      : { text: null, source: decl ? `${decl} · why` : null },
    wiring: [
      external
        ? wire("driven by", d.drivenBy, decl ? `${decl} · drivenBy` : null)
        : wire("what it runs", d.run, decl ? `${decl} · run` : null),
      wire("fired by this repo's scheduler", external ? "no — it declares a driver, not a command" : "yes", decl ? `${decl} · run / drivenBy` : null),
      wire("what it watches", d.owns, decl ? `${decl} · owns` : null),
      wire("declared cadence", d.every, decl ? `${decl} · every` : null),
      wire(
        "floor — the tightest the ladder may go",
        external ? null : d.floor,
        decl ? `${decl} · floor` : null,
        external ? { note: "an externally driven rhythm has no ladder here, so it declares no floor" } : null,
      ),
      // THE ACTUAL, AND WHERE IT IS READ FROM, WHICH IS NOT THE SAME FIELD FOR
      // BOTH KINDS. A trigger this scheduler fires carries an interval in the
      // state and the row is that interval. An externally driven rhythm never
      // gets one - the scheduler must not fire its own driver, so it never
      // computes a pace for it - and a row reading NOT RECORDED against
      // `intervalMs` named a field that will never hold anything and made a
      // category difference look like a hole in the record. The actual for
      // those is the beat that landed, which the state DOES stamp.
      external
        ? wire(
            "actual cadence",
            s.last ? `last beat ${hhmm(s.last)} · ${ago(s.last)}` : null,
            stateOf("lastRunAt"),
            {
              note: "the scheduler holds no interval for an externally driven rhythm, and that absence is correct rather than missing - so the actual is read from the beats it stamped",
              ...(declaredMs && (!s.last || now - s.last > declaredMs * STALL_RATIO) ? { disagree: true } : {}),
            },
          )
        : wire("actual cadence", paceWords(liveMs), stateOf("intervalMs"), declaredMs && liveMs && declaredMs !== liveMs ? { disagree: true } : null),
      wire("last fired", s.last ? `${hhmm(s.last)} · ${ago(s.last)}` : null, stateOf("lastRunAt"), s.last ? { at: s.last, t: "stampago" } : null),
      wire(
        "how it exited",
        st.lastExit === null || st.lastExit === undefined ? null : st.lastExit === 0 ? "0 — clean" : `${st.lastExit} — fault`,
        stateOf("lastExit"),
      ),
      wire("runs recorded", st.runs === null || st.runs === undefined ? null : st.runs, stateOf("runs")),
      // NAMED PER KIND, because the two are not computed the same way and the
      // single sentence became wrong the moment `actual cadence` started
      // meaning a beat stamp on the grid row. The grid row's next is the next
      // boundary of the declared period; every other row's is its last run plus
      // the interval it is actually on.
      wire(
        "next due",
        inWords(s.dueIn),
        s.grid
          ? "computed on this board as the next boundary of the declared period - the tick keeps the grid whether or not a stamp landed"
          : "computed on this board from last fired plus actual cadence",
        { at: s.next, t: "until" },
      ),
      wire("declared in", d.declaredIn, "found by scanning tools, tools/factory and scripts for *.trigger.json and *.station.json"),
    ],
  };
};

for (const s of stationRows) explains(`rhythm:${s.id}`, explainRhythm(s));

// ---- the rail draws one cell that is not a trigger --------------------------
//
// HOST RESTART is a policy interval - how fresh the machine should be - drawn
// beside the rhythms because it counts down like one. No declaration names it
// and nothing on the schedule fires it, so the rail has always drawn one cell
// more than the scheduler has triggers, and that difference was invisible.
//
// The row is NOT deleted. An element that cannot explain its own wiring is
// precisely what this feature exists to surface, and it is a real countdown
// worth watching. It simply has to say what it is.
{
  const real = stationRows.find((s) => s.id === "host-restart");
  const realDecl = real && real.decl ? real.decl.declaredIn : null;
  // THE THRESHOLD IS A DECLARED VALUE AND THE UPTIME IS A LIVE ONE, so this
  // panel owes the same comparison the rhythms now make. It printed both
  // numbers in the wiring and said nothing about whether they agree, which
  // leaves the reader to do the subtraction - the same by-hand arithmetic the
  // rail's asterisk used to demand, and the reason a machine three days overdue
  // for a restart looked exactly like a fresh one.
  const upH = host ? Number(host.uptime_hours) || 0 : null;
  const restartQueued = host ? host.reboot_pending === true : false;
  const pastThreshold = upH !== null && upH > RESTART_FRESH_DAYS * 24;
  const policyLine =
    upH === null
      ? `Declared threshold ${RESTART_FRESH_DAYS}d, and the machine's uptime is NOT RECORDED - the hive node registry could not be read, so the board cannot say whether a restart is due.`
      : restartQueued
        ? `Declared threshold ${RESTART_FRESH_DAYS}d, uptime ${Math.round(upH)}h - and an update is ALREADY QUEUED, which makes the machine due whatever its uptime says.`
        : pastThreshold
          ? `Declared threshold ${RESTART_FRESH_DAYS}d, uptime ${Math.round(upH)}h - PAST it by ${inWords(upH * MS.h - RESTART_FRESH_DAYS * MS.d)}. A restart is due and nothing has taken it.`
          : `Declared and actual agree: threshold ${RESTART_FRESH_DAYS}d, uptime ${Math.round(upH)}h - inside it, with ${inWords(RESTART_FRESH_DAYS * MS.d - upH * MS.h)} of freshness left.`;
  explains("rhythm:host-restart-policy", {
    title: "HOST RESTART",
    kind: "policy interval — not a trigger, and nothing fires it",
    headline: {
      // The threshold disagreement outranks the not-a-trigger gap whenever
      // there is one. A machine overdue for a restart is a fact about the
      // plant; this cell's wiring is a fact about the board, and the plant wins.
      tone: restartQueued || pastThreshold ? "disagree" : "gap",
      text: `${policyLine} This cell is not a trigger. No declaration names it and nothing on the schedule fires it: it is a policy value - how many days the machine may run before a restart is due - counted against the machine's uptime, and drawn here because it counts down like a rhythm. The trigger that actually asks whether a restart is due is RESTART CHECK${real ? `, every ${real.decl.every}` : ""}${realDecl ? `, declared in ${realDecl}` : ""}. The rail therefore draws ${cycles.length} cells while the scheduler holds ${stationRows.length} triggers, and this cell is the difference.`,
    },
    purpose: {
      text: null,
      source: "no declaration exists for this cell, so there is no authored purpose to read",
    },
    wiring: [
      wire("what it counts", "the machine's uptime against a freshness threshold", "machines/build-tracker.cjs · the cycles list"),
      wire("threshold", `${RESTART_FRESH_DAYS}d`, "machines/build-tracker.cjs · RESTART_FRESH_DAYS"),
      wire(
        "uptime",
        host ? `${Math.round(host.uptime_hours)}h` : null,
        host ? `${host._from}.uptime_hours` : "the hive node registry could not be read",
        restartQueued || pastThreshold ? { disagree: true } : null,
      ),
      wire("restart already queued", host ? (host.reboot_pending === true ? "yes" : "no") : null, host ? `${host._from}.reboot_pending` : null),
      wire("fired by this repo's scheduler", "no — nothing declares it, so nothing can fire it", "no *.trigger.json declares host-restart-policy"),
      wire("the trigger that does run", real ? `restart check, every ${real.decl.every}` : null, realDecl ? `${realDecl} · every` : null),
    ],
  });
}

// ---- the schedule knows about triggers this board cannot explain ------------
//
// The state file is written by whoever ran the scheduler last, which may be a
// tree carrying declarations this one does not have. A trigger with recorded
// runs and no declaration here is not drawn on the rail at all - so it is
// invisible rather than wrong, which is worse. Counted, and said out loud on the
// rail's own panel rather than left for somebody to notice by diffing two files.
const orphanTriggers = Object.keys(schedule.triggers || {}).filter((id) => !stationRows.some((s) => s.id === id));

// ---- the three intake doors -------------------------------------------------
//
// Each door already computes a state AND a reason for that state; the reason has
// only ever been shown as ten clipped characters inside a 104-unit SVG post.
// The panel is where it fits.
const DOOR_MEANING = {
  chat: "A person opens a session and works. This door is open whenever anybody can start a chat, which is always - so it is never OFF, and the most the board can honestly say when it cannot see transcripts is that it does not know.",
  auto: "The intake worker picks work off the belt on a schedule and dispatches it. This is the only door the factory itself operates, so it is the only one that can genuinely be switched OFF.",
  spawn: "An agent spawns another agent into its own worktree. Like chat, it cannot be switched off from here - an agent can always spawn one - so the honest negative state is that the board cannot see it.",
};
const DOOR_EVIDENCE = {
  chat: {
    what: "session transcripts on this machine",
    where: `${PROJECTS.replace(/\\/g, "/")} · directories named for this repo`,
    seen: canSeeSessions,
  },
  auto: {
    what: "the intake worker's own report",
    where: `${path.relative(ROOT, path.join(CTX, "intake-worker.json")).replace(/\\/g, "/")} · checkedAt, armed, dispatched, room`,
    // ASKED, NOT ASSUMED. This was written as a literal `true` and the panel
    // duly reported that the evidence was readable beside a state of UNOBSERVED
    // whose reason was "has never run" - the file does not exist. A hard-coded
    // fact in a panel whose whole purpose is that facts are derived is the defect
    // this feature exists to catch, caught in the feature itself on its first
    // rendered look.
    seen: fs.existsSync(path.join(CTX, "intake-worker.json")),
  },
  spawn: {
    what: "worktree folders",
    where: `${WORKTREES.replace(/\\/g, "/")}`,
    seen: canSeeWorktrees,
  },
};
for (const l of lanes) {
  const ev = DOOR_EVIDENCE[l.key] || {};
  const blind = l.state === "UNOBSERVED" || l.state === "UNREADABLE";
  explains(`door:${l.key}`, {
    title: `${l.name} INTAKE`,
    kind: "one of the three doors work reaches the belt through",
    // BLIND IS A GAP, NOT A DISAGREEMENT. This board has been caught three times
    // spending one word on absence and failure, and the loudest label on the
    // panel has to stay for the case where two sources actually contradict each
    // other - otherwise it stops meaning anything. "Nobody looked" and "the two
    // records disagree" need opposite fixes.
    headline: blind
      ? {
          tone: "gap",
          text: `The board cannot see this door: ${l.why}. That is not the same as the door being quiet - it means the counts below are the most this board can observe, not the whole truth. The evidence it depends on is ${ev.what || "NOT RECORDED"}.`,
        }
      : { tone: "ok", text: `${l.state} — ${l.why}. The state is read, not assumed, from ${ev.what || "NOT RECORDED"}.` },
    purpose: { text: DOOR_MEANING[l.key] || null, source: "machines/build-tracker.cjs · DOOR_MEANING — written here because a door is not a declared trigger and has no file of its own to carry a why" },
    wiring: [
      wire("state", l.state, "machines/build-tracker.cjs · the lanes list"),
      wire("why that state", l.why, "machines/build-tracker.cjs · the lanes list"),
      wire("on the belt now", l.now, "the belt: open contracts with a live dispatch through this door — .claude/agent-context/findings.jsonl · dispatch.via"),
      ...(l.key === "chat"
        ? [
            wire(
              "chats active",
              l.active === null || l.active === undefined ? null : `${l.active} in this repo · ${l.activeHost} on this host`,
              "~/.claude/projects · transcripts written inside one beat (5 minutes) · what the door's pill shows · refreshed by the page from /chat every ten seconds",
            ),
            wire(
              "chats alive",
              l.live === null || l.live === undefined ? null : `${l.live} in this repo · ${l.liveHost} on this host`,
              "~/.claude/projects · transcripts written inside the belt's 30-minute liveness window - the question the belt asks about an agent, not the door's",
            ),
          ]
        : []),
      wire("admitted today", l.today, "the belt: dispatch records stamped since midnight local — .claude/agent-context/findings.jsonl · dispatch.at, dispatch.via"),
      // A SOURCE LINE NAMES WHAT WAS ACTUALLY READ. Where the evidence file is
      // absent, nothing was read out of it, so citing it as the source of these
      // two rows would point a reader at a file that is not there - and a
      // citation that cannot be opened turns the panel from evidence into
      // decoration. When it is missing, the source is the check that looked.
      // Caught by the seer's own new test on the first run, against this file.
      wire("evidence it depends on", ev.what, ev.seen ? ev.where : `machines/build-tracker.cjs · looked for ${ev.where ? ev.where.split(" · ")[0] : "it"} and it is not there`),
      wire("that evidence is readable", ev.seen === undefined ? null : ev.seen ? "yes" : "no", "machines/build-tracker.cjs · checked on disk while this board was built"),
      wire(
        "can this door be switched off",
        l.key === "auto" ? "yes — the factory operates it" : "no — nothing here can close it, so OFF is never an honest state for it",
        "machines/build-tracker.cjs · the note above autoLane",
      ),
    ],
  });
}

// ---- the exit worker --------------------------------------------------------
explains("door:exit", {
  title: "EXIT",
  kind: "the far end of the belt — the post that closes finished work",
  headline: { tone: D.workers.exit.state === "UNOBSERVED" || D.workers.exit.state === "UNREADABLE" ? "disagree" : "ok", text: `${D.workers.exit.state} — ${D.workers.exit.why}.` },
  purpose: {
    text: "Intake is where deposits arrive; exit is where they leave. A card only stops being work when something closes it, and before this post existed nothing on the board said whether anything was doing that.",
    source: "machines/build-tracker.cjs · the note above workerState",
  },
  wiring: [
    wire("state", D.workers.exit.state, "machines/build-tracker.cjs · workerState"),
    wire("why that state", D.workers.exit.why, "machines/build-tracker.cjs · workerState"),
    wire(
      "evidence it depends on",
      "the exit worker's own report",
      fs.existsSync(path.join(CTX, "exit-worker.json"))
        ? ".claude/agent-context/exit-worker.json"
        : "machines/build-tracker.cjs · looked for .claude/agent-context/exit-worker.json and it is not there",
    ),
    wire("closed by the factory", `${D.trust.held} of ${D.trust.decisions} still standing`, ".claude/agent-context/findings.jsonl · records with a terminal trigger"),
  ],
});

// ---- the three domain bands -------------------------------------------------
//
// A band's status is derived from whether any declared trigger says it WATCHES
// that domain, which is a different question from whether anything was recently
// posted to it - and conflating the two is what once had the board reporting a
// death that never happened.
const BAND_OWNS = {
  body: "What a person sees: the Angular application - components, templates, styles and the screens themselves.",
  mind: "Durable truth: the database, migrations, edge functions, stores and workflow logic. Its failures are silent and permanent.",
  spirit: "Live coordination: Cloudflare workers, realtime and presence, webhooks, broadcast and the livestream runtime. Its failures are about sequencing rather than storage.",
};
for (const dim of ["body", "mind", "spirit"]) {
  const c = D[dim];
  const watchers = stations.filter((s) => s.owns === dim);
  const t = lastFor(dim);
  const open = records.filter((r) => isOpen(r) && ridesCarrier(r, dim)).length;
  explains(`band:${dim}`, {
    title: dim.toUpperCase(),
    kind: "a domain of the application, and whether anything is watching it",
    headline: c.unposted
      ? {
          // Never watched is an absence; watched and gone quiet is a
          // contradiction. Same distinction as the lamp's NEVER RUN against
          // STALLED, and the same reason it matters: they send you to different
          // work.
          tone: "gap",
          text: `No declared trigger watches ${dim}. That is why this band reads NOT POSTED rather than STALLED: nothing has stopped, because nothing was ever running. ${open ? `It is carrying ${open} open item${open === 1 ? "" : "s"} with nobody watching.` : "It is carrying no open work."}`,
        }
      : c.stale
        ? {
            tone: "disagree",
            text: `${watchers.length} trigger${watchers.length === 1 ? "" : "s"} declare${watchers.length === 1 ? "s" : ""} that ${dim} is watched, and the last deposit to ${dim} was ${t ? ago(t) : "never"} - past the 36 hour mark. Something that was running has stopped, which is a different fault from never having been watched.`,
          }
        : { tone: "ok", text: `Watched by ${watchers.map((w) => w.id).join(", ")}, and the last deposit landed ${ago(t)}.` },
    purpose: { text: BAND_OWNS[dim] || null, source: "machines/build-tracker.cjs · BAND_OWNS — a domain is a fact about the application, not a declared trigger, so it has no file of its own to carry a why" },
    wiring: [
      wire("watched by", watchers.length ? watchers.map((w) => `${w.id} (every ${w.every})`).join(", ") : null, watchers.length ? watchers.map((w) => `${w.declaredIn} · owns`).join(", ") : "no declaration sets owns to this domain"),
      wire("status", c.status, "machines/build-tracker.cjs · chip()"),
      wire("last deposit", t ? `${hhmm(t)} · ${ago(t)}` : null, ".claude/agent-context/findings.jsonl · newest record with this dimension", t ? { at: t, t: "stampago" } : null),
      wire("counted stale after", "36h with nothing posted", "machines/build-tracker.cjs · chip()"),
      wire("open work riding this domain", open, ".claude/agent-context/findings.jsonl · open contracts whose owner or contract trigger is this domain"),
    ],
  });
}

// ---- the footer numbers -----------------------------------------------------
//
// These are the least legible facts on the board: a number nobody can interpret
// is decoration that looks like rigour, which is worse than no number, because
// it is trusted. Each one gets what it counts, what the denominator is, and
// where it is computed - and where there is no live source behind it, the panel
// says so rather than dressing a hand-written value as a measurement.
explains("foot:detectors", {
  title: "DETECTORS",
  kind: "a footer count — drivers of change that something can notice automatically",
  headline: {
    tone: "disagree",
    text: `Nothing computes this number. It is typed into ${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} by hand and read straight out again, so the board shows a transcription rather than a measurement, and it will keep showing ${D.detectors} after the real figure has moved. The plan that defines it is the live source; nothing connects the two.`,
  },
  purpose: {
    text: "A driver is a reason the application needs to change. A detector is something that notices that reason without a person looking. This is the count of drivers with one - the single number that says how much of the factory can find its own work.",
    source: "refer.app/plan/refer.living-factory.plan.md · section 3.3, and the metrics table",
  },
  wiring: [
    wire("what it counts", "drivers of change that have an automatic detector", "refer.app/plan/refer.living-factory.plan.md · section 3.3"),
    wire("what the denominator is", "the fourteen drivers listed in that plan — NOT the fourteen repos shown elsewhere on this board", "refer.app/plan/refer.living-factory.plan.md · section 3.3"),
    wire("where the shown value comes from", `hand-written: ${D.detectors}`, `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · detectors`),
    wire("how it was arrived at", extras._source || null, `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · _source`),
    wire("when it was last written", extras._updated || null, `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · _updated`),
    wire("recomputed by", "nothing — no trigger and no script counts detectors", "searched: no machinery writes this field", { disagree: true }),
    wire("what a good value looks like", "up. Every watcher built raises it; the plan's own target is that all fourteen drivers have a detector.", "refer.app/plan/refer.living-factory.plan.md · section 3.3"),
  ],
});

explains("foot:hive", {
  title: "HIVE CHANNELS",
  kind: "a footer count — the channels this machine can reach across the hive",
  headline: {
    // A GAP, NOT A DISAGREEMENT - and the difference is the whole verdict on
    // this number. Detectors has a live source that nothing reads, which is
    // fixable and is a contradiction. This one has no live source that could
    // exist, because a script cannot enumerate hive channels at all. Marking
    // both the same way would tell somebody to go and wire up the impossible one.
    tone: "gap",
    text:
      extras.hiveChannels == null
        ? "Not recorded. The extras file carries no channel count, so the board shows a dash rather than a zero - nobody has looked, which is a different fact from there being none."
        : `Nothing computes this number either, and unlike the others it genuinely cannot be: the channels are visible to a session's hive tools and not to a script. So it is written down by a session that could see them, and it is only as current as the date beside it.`,
  },
  purpose: {
    text: "How many channels this node can talk to. It is the width of the factory's reach beyond this one repo.",
    source: `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · _why`,
  },
  wiring: [
    wire("what it counts", "hive channels reachable from this node", `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · hiveChannels`),
    wire("what the denominator is", "none — it is a plain count, not a fraction", "machines/build-tracker.cjs · the footer strip"),
    wire("where the shown value comes from", extras.hiveChannels == null ? null : `hand-written: ${extras.hiveChannels}`, `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · hiveChannels`),
    wire("how it was arrived at", extras._source || null, `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · _source`),
    wire("when it was last written", extras._updated || null, `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · _updated`),
    wire("recomputed by", "nothing — a script cannot enumerate them, which is why the file exists", `${path.relative(ROOT, EXTRAS).replace(/\\/g, "/")} · _why`, { disagree: true }),
  ],
});

explains("foot:routes", {
  title: "ROUTES PROVEN",
  kind: "a footer fraction — how much of the machinery can be found rather than remembered",
  headline:
    scriptsRegistered == null || !scriptsTotal
      ? { tone: "gap", text: "The route register could not be read, so this shows a dash. A missing register is reported as unknown, never as zero." }
      : {
          tone: "ok",
          text: `Live on every build. ${scriptsRegistered} of ${scriptsTotal} scripts are named by a registered route, counted from the register and from the folder at the moment this board was built.`,
        },
  purpose: {
    text: "Every route in the register was worked out from scratch at least once by somebody with no way to find out it already existed, and that cost is invisible - it looks exactly like ordinary work. This fraction is how much of the machinery has stopped costing that.",
    source: "E:/refer.os/REFER.OS/refer.factory.md · section 0",
  },
  wiring: [
    wire("what it counts", "distinct scripts named as machinery by a registered route", "E:/refer.os/REFER.OS/manifests/factory.routes.json · routes[].stations[].machinery"),
    wire("what the denominator is", `every script under tools/ — ${scriptsTotal == null ? "NOT RECORDED" : scriptsTotal} files ending .cjs, .js, .mjs or .ps1, counted recursively`, "machines/build-tracker.cjs · countScripts"),
    wire("counted at", "build time, from the register and the folder", "machines/build-tracker.cjs"),
    wire("recomputed by", "this build, every time", "build-tracker.trigger.json · every 1h"),
    wire("what a good value looks like", "up. A miss is an instruction to author the route, not a dead end.", "E:/refer.os/REFER.OS/refer.factory.md · section 0"),
  ],
});

explains("foot:shed", {
  title: "LAWS SHED",
  kind: "a footer count — rules removed rather than added",
  headline: {
    tone: "ok",
    text: `Live on every build: ${D.shedCount} record${D.shedCount === 1 ? "" : "s"} on the belt carry a shedding driver, counted at the moment this board was built.`,
  },
  purpose: {
    text: "A factory that only ever adds rules accumulates ritual until the method costs more than it saves. This counts the opposite move - a rule, gate or step taken away because it was not earning its place. It is the one footer number where going up means the system got simpler.",
    source: "machines/build-tracker.cjs · the shedCount derivation",
  },
  wiring: [
    wire("what it counts", "belt records whose driver is a shedding driver (an X driver)", ".claude/agent-context/findings.jsonl · driver matching X followed by a digit"),
    wire("what the denominator is", "none — it is a running total over the whole belt, not a fraction", "machines/build-tracker.cjs · shedCount"),
    wire("counted at", "build time, over every record on the belt", "machines/build-tracker.cjs · shedCount"),
    wire("recomputed by", "this build, every time", "build-tracker.trigger.json · every 1h"),
  ],
});

explains("foot:built", {
  title: "BUILT",
  kind: "when the judgements on this board were made",
  headline: {
    tone: "ok",
    text: `Every judgement on this board - stalled, closed, due, phantom - was made at ${D.builtLabel} against real state. Every time beside those judgements - ago, until, on the belt, uptime, the rail - is counted by the page on the wall clock, and each station's last-run is refreshed from the server between builds.`,
  },
  purpose: {
    text: "Two boards. The data board is this file: what the factory checked and decided, written once a beat, on disk where the watcher can audit it. The display board is the page: it shows the data board and counts time on the same clock the factory runs on. Judgement is built; time is live.",
    source: "build-tracker.trigger.json · why",
  },
  wiring: [
    wire("built at", D.builtAt, "machines/build-tracker.cjs · the moment this file was written"),
    wire("rebuilt by", "the build-tracker trigger", "build-tracker.trigger.json · run, every"),
    wire("what happens if the factory stops", "this page dims and says how long it has been frozen, rather than ticking on as though nothing were wrong", "machines/build-tracker.cjs · the disconnected banner"),
  ],
});

// ---- the rail itself --------------------------------------------------------
explains("rail:all", {
  title: "THE RAIL",
  kind: "every rhythm the factory keeps, drawn as a bar filling across its own interval",
  headline:
    orphanTriggers.length || cycles.length !== stationRows.length
      ? {
          tone: "disagree",
          text: [
            cycles.length !== stationRows.length
              ? `The rail draws ${cycles.length} cells and the scheduler holds ${stationRows.length} triggers. The difference is HOST RESTART, which is a policy interval rather than a trigger - click it and it says so.`
              : "",
            orphanTriggers.length
              ? `The schedule's state file also records ${orphanTriggers.length} trigger${orphanTriggers.length === 1 ? "" : "s"} that no declaration in this tree explains - ${orphanTriggers.join(", ")} - so ${orphanTriggers.length === 1 ? "it is" : "they are"} not drawn here at all. A trigger with recorded runs and no declaration is invisible rather than wrong, which is worse.`
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        }
      : { tone: "ok", text: `${cycles.length} cells, ${stationRows.length} triggers, and every cell is one of them.` },
  purpose: {
    text: "A plant shows its cycles turning. A timetable says WHEN; this says how far through. Shortest pace first, so a glance finds anything by position - and when a rhythm faults it tightens to its floor and moves LEFT, which puts whatever is being watched most closely at the front. The pulse is held in the first slot by insertion rather than by sorting, because its position encodes a kind of thing rather than a duration: everything else here is downstream of it.",
    source: "machines/build-tracker.cjs · the notes above cycles",
  },
  wiring: [
    wire("cells drawn", cycles.length, "machines/build-tracker.cjs · cycles"),
    wire("triggers the scheduler holds", stationRows.length, schedule.from ? `${schedule.from} · triggers, matched against the declarations found on disk` : "no schedule state file could be read"),
    wire("declarations found", stations.length, "scanned: tools, tools/factory, scripts for *.trigger.json and *.station.json"),
    wire("state read from", schedule.from, "machines/build-tracker.cjs · SCHEDULE_FILES"),
    wire("in the state but not declared here", orphanTriggers.length ? orphanTriggers.join(", ") : "none", schedule.from ? `${schedule.from} · triggers` : null, orphanTriggers.length ? { disagree: true } : null),
    wire("ordered by", "actual pace, shortest first — never the declared ceiling", "machines/build-tracker.cjs · the sort on cycles"),
  ],
});

// ---- render -----------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// TIME IS LIVE; JUDGEMENT IS BUILT.
//
// Operator, 2026-09-13: "there are two boards, there is the physical display
// board and the data board which the display board displays. I think the data
// board can remain the data and the display board can run completely off the
// clock since the data board is also driven by the clock."
//
// This file writes the data board. What it decides - stalled, closed, phantom,
// due - is judgement, computed here against real state, and it stays a
// sentence in the file where the watcher can audit it. But "12m ago", "UP 3d
// 1h", "on the belt 5m" are not judgements; they are arithmetic against the
// wall clock, and a sentence written once an hour is wrong for fifty-nine
// minutes of it. So every time-word on the display board is wrapped with the
// timestamp it was computed from, and the page's one-second tick - the same one
// that moves the time in the corner - rewrites it. The words are the build's
// own (ago, inWords), reproduced in the page, so a fresh build and a live count
// never say the same interval two ways.
//
// A hoisted function, not a const: it is called from templates and explain
// panels, all of which are evaluated after `esc` above is initialised.
function live(kind, at, text) {
  return at ? `<span data-t="${kind}" data-at="${Math.round(at)}">${esc(text)}</span>` : esc(text);
}

// The pulse is red on its cards - the operator's colour for it - and the same
// red everywhere it appears as a card, so the three states read as one thing.
// Declared here, first among the shared helpers: the session-row palette below
// reads it at module load, and a const read before its line is a
// ReferenceError, not undefined - measured 2026-09-14 when it sat further down.
const PULSE_RED = "oklch(0.64 0.20 25)";

// THE THREE DOOR GLYPHS, drawn once, in any colour, for any surface.
//
// Icons are inline SVG paths, never emoji characters: this board renders in one
// mono face on a wall display, where an emoji either draws a box glyph or drags
// in a colour font at a size nobody can read. The same three shapes stand on
// the intake doors, ride the session cards, and lead every row in PROCESSING,
// INCOMING and RESOLVED that came through a door - operator, 2026-09-14:
// "keeping consistent with the current icons on the intake cards."
//
//   chat   a person: head and shoulders
//   auto   a schedule turning over: a circular arrow (deliberately not the clock
//          face the TIMER corner uses)
//   spawn  a machine: square head, two eyes, one antenna
//
// DOOR_GLYPH returns the raw paths, centred on (0,0) and about 20 units across,
// for use inside an svg; DOOR_ICON_HTML wraps them in their own small svg for
// use inside HTML rows. The page reproduces the same paths in doorGlyphHtml.
function DOOR_GLYPH(kind, ink) {
  if (kind === "auto")
    return `<path d="M7.5 -3A8 8 0 1 0 8 3.5" style="stroke:${ink}; stroke-width:2; fill:none"></path><path d="M4 -7.5L8.5 -3L4 1" style="stroke:${ink}; stroke-width:2; fill:none"></path>`;
  if (kind === "spawn")
    return `<path d="M0 -10.5V-7" style="stroke:${ink}; stroke-width:2"></path><circle cx="0" cy="-12" r="1.8" style="fill:${ink}"></circle><rect x="-8" y="-7" width="16" height="14" rx="4" style="stroke:${ink}; stroke-width:2; fill:none"></rect><circle cx="-3.2" cy="0" r="1.7" style="fill:${ink}"></circle><circle cx="3.2" cy="0" r="1.7" style="fill:${ink}"></circle>`;
  return `<circle cx="0" cy="-5" r="5" style="stroke:${ink}; stroke-width:2; fill:none"></circle><path d="M-8.5 8.5C-8.5 2.5 -4.5 0.5 0 0.5C4.5 0.5 8.5 2.5 8.5 8.5" style="stroke:${ink}; stroke-width:2; fill:none"></path>`;
}
const DOOR_ICON_HTML = (kind, ink, px) =>
  `<svg viewBox="-12 -14 24 26" width="${px}" height="${px}" fill="none" style="flex:none" title="${esc(kind)}">${DOOR_GLYPH(kind, ink)}</svg>`;
const DOOR_INK = { chat: "oklch(0.74 0.13 195)", auto: "oklch(0.80 0.12 75)", spawn: "oklch(0.72 0.13 150)" };

// ONE PROCESSING ROW PER LIVE SESSION, in the shape of a deposit row so the
// list reads as one list. The agent line carries the session id, so "this
// current chat" can be found and referenced from the board.
const SESSION_HUE_ROW = { chat: "oklch(0.74 0.13 195)", auto: "oklch(0.80 0.12 75)", spawn: "oklch(0.72 0.13 150)", pulse: PULSE_RED };
const SESSION_CODE_ROW = { chat: "CH", auto: "AU", spawn: "SP", pulse: "PU" };
function sessionRow(s) {
  const look = s.role === "pulse" ? "pulse" : s.kind;
  const hue = SESSION_HUE_ROW[look] || SESSION_HUE_ROW.chat;
  const handle = `${SESSION_CODE_ROW[look] || "CH"} ${String(s.short || s.id).slice(0, 4)}`;
  const rowIcon = look === "pulse" ? PULSE_GLYPH(hue, 16, 10) : DOOR_ICON_HTML(s.kind, hue, 16);
  // The title the app shows for this session, read from its transcript by
  // session-belt - operator: "I need the chat title to be included in the
  // processing so I can tell." A session never titled says what it is.
  const what = s.title || (s.kind === "spawn" ? `spawned session${s.worktree ? ` · ${s.worktree}` : ""}` : "chat session · untitled");
  return `
          <div class="feedrow beltrow" data-session-row="${esc(s.id)}" title="${esc(s.id)}" style="display:grid; grid-template-columns:76px 56px minmax(0,1fr) 92px; align-items:center; gap:10px; padding:9px 0; border-top:1px solid oklch(0.22 0.012 70)">
            <span style="display:flex; align-items:center; gap:6px; font-family:${mono}; font-size:14px; font-weight:500; letter-spacing:0.04em; color:${hue}">${rowIcon}${esc(handle)}</span>
            <span style="font-family:${mono}; font-size:15px; color:oklch(0.62 0.01 80)">${hhmm(s.at)}</span>
            <span class="rowtext" style="font-size:16px; line-height:1.35; color:oklch(0.90 0.008 85)">${esc(what)}${s.worktree && s.title ? ` <span style="color:oklch(0.58 0.01 80)">· ${esc(s.worktree)}</span>` : ""}</span>
            <span style="font-family:${mono}; font-size:13px; color:oklch(0.76 0.12 75); text-align:right; white-space:nowrap">${live("ago", s.at, ago(s.at))}</span>
            <p class="beltagent" style="grid-column:1 / -1">
              <span class="agentdot" style="background:${hue}"></span>
              <b>${esc(s.role === "pulse" ? "pulse routine" : s.kind === "auto" ? `routine${s.routine ? ` · ${s.routine}` : ""}` : s.kind)}</b>
              <span class="agentsess">${esc(s.id)}</span>
              <span class="agentlive">${s.active ? "active" : "alive"}</span>
            </p>
          </div>`;
}

// ONE PULSE SLOT, pinned at the top of a column. The card design is the
// operator's: heartbeat saw wave, the time, the PU enumeration. Incoming shows
// the time the pulse will be pulled onto the belt - the next beat - and counts
// down to it; resolved shows when the last one exited. An empty stage is drawn
// dim and says GAP, because a missing beat must be visible and must not look
// like a card. The page rolls these from /pulse on the wall clock (rollPulse),
// so what is built here is the honest state at build time and nothing more.
const PULSE_GLYPH = (hue, w, h) =>
  `<svg viewBox="0 0 24 14" width="${w}" height="${h}" fill="none" style="flex:none"><path d="M1 7H7L9.5 1.5L13 12.5L15.5 7H23" stroke="${hue}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
// THE THREE STATES ARE THE OPERATOR'S, NOT THE MACHINE'S BUCKETS.
//
// Operator, 2026-09-14: "Incoming 10:25, Belt 10:20, Resolved 10:15." At 10:22
// the beat that just fired is ON THE BELT; the one before it has RESOLVED; and
// INCOMING is the beat that has not happened yet - there is no card for it,
// its time is simply the last beat plus one, and it counts down. pulse-belt.cjs
// buckets cards by age the other way round (its "incoming" is a card under one
// beat old, i.e. this board's belt), and its 30-second grace moves those
// buckets early - measured 10:39:54: the incoming bucket empty for the last
// half-minute of every cycle, a hole every five minutes that meant nothing. So
// the file is read as the operator's states: belt = newest card, resolved =
// the one before, incoming = computed. The only alarming state is a beat that
// is actually LATE - past its time plus the grace - and that is drawn red.
// Cards older than three beats are ignored here as the machine would have
// pruned them, so a dead pulse empties the belt within fifteen minutes even
// though nothing is running to prune the file.
function pulseStates(cards, S, G, at) {
  const live = cards.filter((c) => at - c.at < 3 * S + G).sort((a, b) => b.at - a.at);
  const newest = live[0] || null;
  const lateBy = newest ? at - (newest.at + S + G) : null;
  return { belt: newest, resolved: live[1] || null, nextAt: newest ? newest.at + S : null, late: newest ? lateBy > 0 : false, lateBy };
}
function pulseSlot(stage) {
  const S = pulseBelt.stageMs;
  const st = pulseStates(pulseBelt.cards, S, pulseBelt.graceMs, now);
  const hue = PULSE_RED;
  // The handle is the static "PU" - no number on any pulse card, by request;
  // the seq stays in the file and in this row's tooltip as the unique id.
  const handle = "PU";
  let c = null, time = "--:--", text, mark, dim = false, alarm = false;
  if (stage === "incoming") {
    c = st.belt; // the card the next beat will be counted from
    if (!c) { text = "no pulse recorded — the tick has not beaten in this window"; mark = "GAP"; dim = true; }
    else if (st.late) { time = hhmm(st.nextAt); text = `pulse overdue · late by ${inWords(st.lateBy)}`; mark = "LATE"; alarm = true; }
    else { time = hhmm(st.nextAt); text = `next pulse · in ${inWords(st.nextAt - now)}`; mark = "PULSE"; }
  } else {
    c = st.resolved;
    if (c) { time = hhmm(c.at); text = "pulse exited the belt"; mark = "&#10003; exited"; }
    else { text = "no previous pulse in this window"; mark = ""; dim = true; }
  }
  return `<div class="pulserow" data-pulse-slot="${stage}" title="the tick, made visible · one card per beat${c ? ` · beat ${c.seq}` : ""} · ${esc(pulseBelt.from || "no pulse-belt file found")}" style="display:grid; grid-template-columns:22px 52px 52px minmax(0,1fr) auto; align-items:center; gap:12px; padding:9px 6px 9px 4px; border-bottom:1px solid oklch(0.26 0.012 70);${dim ? " opacity:0.55" : ""}${alarm ? ` box-shadow:inset 3px 0 0 ${hue};` : ""}">
            ${PULSE_GLYPH(hue, 22, 13)}
            <span data-pulse="time" style="font-family:${mono}; font-size:15px; color:oklch(0.62 0.01 80)">${time}</span>
            <span data-pulse="handle" style="font-family:${mono}; font-size:15px; letter-spacing:0.06em; color:${hue}">${handle}</span>
            <span data-pulse="text" style="font-size:15px; line-height:1.35; color:oklch(0.86 0.008 85); overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${esc(text)}</span>
            <span data-pulse="mark" style="font-family:${mono}; font-size:13px; letter-spacing:0.08em; color:${stage === "resolved" ? "oklch(0.72 0.13 150)" : hue}; white-space:nowrap">${mark}</span>
          </div>`;
}

const mono = "'JetBrains Mono',ui-monospace,monospace";

// ---- ONE PANEL LAYOUT, RENDERED ONCE ----------------------------------------
//
// Every explanation on this board is built by these three functions and by
// nothing else. That is deliberate and it is the enforcement, not a tidiness
// preference: the moment a second place can draw a panel, one of them starts
// omitting the source line, and a claim without a source is the thing this whole
// feature exists to remove.
//
// Rendered on the server rather than assembled in the page, for the same reason
// the board is built rather than fetched - there is exactly one code path, and
// what it produced is in the file, where the seer can look at it.

// A missing fact is DRAWN, in its own colour, saying NOT RECORDED. Never an
// empty row, never a hidden one. An omitted fact reads as an answered question.
const wireHtml = (w) => `
          <div class="xrow${w.disagree ? " xdisagree" : ""}">
            <span class="xlabel">${esc(w.label)}</span>
            <span class="xvalue${w.value === null ? " xmissing" : ""}">${w.value === null ? "NOT RECORDED" : w.at && w.t ? live(w.t, w.at, w.value) : esc(w.value)}</span>
            ${w.note ? `<span class="xnote">${esc(w.note)}</span>` : ""}
            <span class="xsource">${w.source ? esc(w.source) : "source NOT RECORDED"}</span>
          </div>`;

// PURPOSE and WIRING are two blocks and they never share a style. The authored
// half is quoted and warm; the generated half is tabular and cool. A reader can
// tell at a glance which half a sentence came from, which is what stops the
// authored half being trusted as live.
const panelHtml = (p) => `
        <div class="xpanel">
          <div class="xhead">
            <span class="xtitle">${esc(p.title)}</span>
            <span class="xkind">${esc(p.kind)}</span>
          </div>
          ${p.headline ? `<p class="xhead-line x-${p.headline.tone}"><span class="xtone">${p.headline.tone === "disagree" ? "SOURCES DISAGREE" : p.headline.tone === "gap" ? "READ THIS FIRST" : "AGREES"}</span>${esc(p.headline.text)}</p>` : ""}
          <div class="xhalf">
            <span class="xhalflabel">PURPOSE &middot; written by a person, changes rarely</span>
            ${
              p.purpose && p.purpose.text
                ? `<p class="xwhy">${esc(p.purpose.text)}</p><span class="xsource">${p.purpose.source ? esc(p.purpose.source) : "source NOT RECORDED"}</span>`
                : `<p class="xwhy xmissing">NOT RECORDED</p><span class="xsource">${p.purpose && p.purpose.source ? esc(p.purpose.source) : "source NOT RECORDED"}</span>`
            }
          </div>
          <div class="xhalf">
            <span class="xhalflabel">WIRING &middot; generated every build from what it actually does</span>
            ${p.wiring.map(wireHtml).join("")}
          </div>
        </div>`;

// ---- what a deposit is made of ----------------------------------------------
//
// A card on the belt is a record, and a record has parts: what it claims, why
// that was believed, who owns it, where it is addressed, how urgent it is, and -
// if somebody is working on it - which session, and WHAT PROVED THAT SESSION
// ALIVE. The row printed the verdict "live" in green and threw the evidence
// away. Every field here was already on the belt; none of them had reached a
// screen.
//
// Rendered into the row's existing open state rather than into a panel of its
// own, because deposits already open on tap and a second way to do the same
// thing is a second thing to keep honest.
// The belt's path as a reader would type it. Written from the constant rather
// than repeated as a literal, so a panel can never name a file the build is not
// actually reading - which is the first rule turned on itself.
const BELTSRC = path.relative(ROOT, BELT).replace(/\\/g, "/");
const recordWiring = (e, life) => {
  const rows = [
    wire("handle", e.handle, "assigned by this board, stable per record id"),
    wire("record id", e.rid, `${BELTSRC} · id`),
    wire("kind", KIND_WORD[e.kind || e.kindWord] || e.kind || e.kindWord, `${BELTSRC} · kind, classified by the factory's kind vocabulary`),
    wire("dimension", e.dimWord || e.dimension || e.dim, `${BELTSRC} · dimension`),
    wire("tier", e.tier, `${BELTSRC} · tier`),
    wire("owner", e.owner, `${BELTSRC} · owner`),
    wire("addressed to", e.address, `${BELTSRC} · triggers`),
    wire("acts on", e.subject, `${BELTSRC} · subject`),
    wire("driver", e.driver, `${BELTSRC} · driver`),
    wire("confidence", e.confidence, `${BELTSRC} · confidence`),
  ];
  if (life !== undefined) {
    rows.push(
      wire("worked by", e.agentLabel || null, `${BELTSRC} · dispatch.label`),
      wire("in session", e.agent || null, `${BELTSRC} · dispatch.session`),
      // THE EVIDENCE BEHIND THE WORD "LIVE". Without it the belt asserts that
      // somebody is working, and an assertion is what put a card here in the
      // first place - so the claim would be resting on itself.
      wire("what proved that session alive", life ? life.where : null, life ? "machines/build-tracker.cjs · sessionLife" : "sessionLife found no evidence at all"),
      wire("when it was last seen", life ? `${hhmm(life.at)} · ${ago(life.at)}` : null, life ? `${life.where} · modified time` : null, life ? { at: life.at, t: "stampago" } : null),
      wire(
        "counted alive because",
        life ? `last seen inside the ${inWords(DISPATCH_ALIVE_MS)} window` : null,
        "machines/build-tracker.cjs · DISPATCH_ALIVE_MS",
        life && life.weak ? { note: "a worktree folder is weaker evidence than a transcript - the folder can be touched by something other than the session" } : null,
      ),
    );
  }
  return rows;
};
const recordWiringHtml = (e, life) => `
            <div class="xhalf xinrow">
              <span class="xhalflabel">WIRING &middot; generated every build from what this record actually carries</span>
              ${recordWiring(e, life).map(wireHtml).join("")}
            </div>`;

const chipBlock = (name, sub, hue, c) => `
      <div class="xopen" data-explain="band:${name}" title="click for what ${name} owns, what watches it, and when it last heard anything" style="display:flex; align-items:center; gap:12px; padding:8px 16px; background:oklch(0.185 0.012 70); border:1px solid oklch(0.28 0.012 70); border-radius:5px">
        <span style="width:5px; height:34px; border-radius:3px; background:oklch(0.62 0.15 ${hue}); ${c.stale ? "opacity:0.45; " : ""}flex:none"></span>
        <div style="display:flex; flex-direction:column; gap:2px">
          <span style="font-size:18px; font-weight:500; line-height:1.1">${name}</span>
          <span style="font-family:${mono}; font-size:13px; letter-spacing:0.08em; color:oklch(0.62 0.01 80)">${sub}</span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; margin-left:14px">
          <span style="font-family:${mono}; font-size:14px; letter-spacing:0.1em; color:${c.stale ? "oklch(0.82 0.11 25)" : "oklch(0.80 0.10 150)"}">${c.status}</span>
          <span style="font-family:${mono}; font-size:13px; color:oklch(0.62 0.01 80)">${c.unposted ? "no trigger watches it" : "dep " + live("ago", c.at, c.last)}</span>
        </div>
      </div>`;

// One row shape for both columns. A row addressed to him carries a red rail and
// a YOU tag - marked rather than moved, because it is still incoming.
const STATUS_WORD = {
  clock: "queued — no trigger is scheduled to take this",
  calendar: "scheduled — a trigger owns it and will come round",
  gear: "being processed now",
  hourglass: "waiting on you, or on the world",
  eye: "waiting to be looked at — the seer is not wired yet",
  blocked: "blocked — waiting on another item that is still open",
  stale: "open over a day with nothing touching it",
  triage: "waiting to be judged — seen, and not yet accepted as work",
};

// The clamp and the open state live in the STYLESHEET, not inline.
//
// This is the r.hidden lesson applied before it bites rather than after. An
// inline style beats any plain stylesheet rule, so a clamp written inline could
// only be lifted with !important - and the last time inline and class-based
// display fought on this board, the filter silently did nothing for a day. The
// rule is now simply: whatever a click has to change, no element carries
// inline. Everything a click never touches stays inline as before.
const rowHtml = (e, i, side) => `
        <div class="feedrow ${side === "in" ? "inrow" : "outrow"}" data-rid="${esc(e.rid)}" data-handle="${esc(e.handle)}" data-kind="${esc(e.kind)}"${side === "in" ? ` data-status="${e.status}"` : ""} style="display:grid; grid-template-columns:${side === "in" ? "16px 16px 56px 66px minmax(0,1fr) 116px" : "56px 66px minmax(0,1fr) 104px"}; align-items:${side === "in" ? "center" : "baseline"}; gap:10px; padding:9px 0 9px ${e.forYou && side === "in" ? "10px" : "0"}; border-top:1px solid oklch(0.22 0.012 70); ${e.forYou && side === "in" ? "border-left:3px solid oklch(0.66 0.15 25); " : ""}animation:feedIn 0.5s ease-out ${(i * 0.05).toFixed(2)}s backwards">
          <!-- WHAT IT IS, then WHAT IS HAPPENING TO IT. Two icons on the way in,
               because a record has a kind and a state and collapsing them would
               lose the one that is currently working. Kind first: whether he owes
               anything at all decides whether the state is worth reading.
               Nothing on the way OUT carries a kind icon - everything on the
               resolution table is finished work, so the mark would be the same on
               every row, and a constant is decoration rather than information. -->
          ${
            // The door it came through - person, arrow, robot - leads the row on
            // both sides of the board, so a record can be traced to its intake at
            // a glance. Only when a dispatch names a door; a record that never
            // went through one wears nothing rather than a guess.
            e.via && e.via !== "unknown" ? `<span title="through the ${esc(e.via)} door" style="display:flex">${DOOR_ICON_HTML(e.via, DOOR_INK[e.via], 14)}</span>` : ""
          }
          ${side === "in" ? `<span title="${esc(KIND_WORD[e.kind] || e.kind)}" style="display:flex">${KIND_ICONS[e.kind] || ""}</span>` : ""}
          ${side === "in" ? `<span title="${esc(STATUS_WORD[e.status])}" style="display:flex">${ICONS[e.status]}</span>` : ""}
          <span style="font-family:${mono}; font-size:15px; color:oklch(0.62 0.01 80)">${esc(e.time)}</span>
          <!-- The handle sits where the domain word used to, because the letter
               already carries the domain and the number is what he needs to say
               out loud. The full word is one tap away, in the detail. -->
          <span title="${esc(e.dimWord)}" style="font-family:${mono}; font-size:15px; letter-spacing:0.06em; color:${e.color}">${esc(e.handle || e.tag)}</span>
          <span class="rowtext" style="font-size:16px; line-height:1.35; color:oklch(0.90 0.008 85)">${esc(e.text)}</span>
          <span style="font-family:${mono}; font-size:13px; color:${side === "out" ? "oklch(0.72 0.13 150)" : e.forYou ? "oklch(0.82 0.11 25)" : "oklch(0.62 0.01 80)"}; text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${side === "out" ? "&#10003; " : ""}${e.forYou && side === "in" ? "YOU" : esc(e.next)}</span>
          <div class="rowdetail">
            <p class="rowclaim">${esc(e.full)}</p>
            ${
              // ---- TRIAGE IS AN ACT, AND THIS IS WHERE HE TAKES IT -----------
              //
              // Operator's phrasing named a stage the model did not have:
              // "deposits to be converted into contracts". Without a door the
              // conversion could only happen in a terminal, which means in
              // practice it would not happen, and incoming would fill with
              // deposits nobody could promote from the place they are read.
              //
              // DIRECTLY UNDER THE CLAIM, not at the end of the detail. It was
              // written last, after the evidence and the recommendation, and on
              // a real record that put it below the fold of a scrolling column -
              // a control he has to go looking for is one he will not use. The
              // claim is what the judgement is made on; the evidence is there for
              // when he wants it.
              //
              // It appends a belt record rather than editing one. The belt is
              // append-only, so accepting work is itself evidence, with a time
              // and an author, exactly like the work it authorises.
              // NOTES GET THE SWITCH TOO, added 2026-09-21 on the operator's
              // instruction: "add a switch to notes and deposits that can mark
              // it as Go. So it can get picked up."
              //
              // A note is a statement to read and nothing is owed on it - that
              // stays true, and is exactly why it needed this. Before, a note
              // that turned out to matter had no way out of the reading area at
              // all: the only route into work was to write it again as a
              // deposit. The kind model refuses to INFER work from a note; it
              // has never refused a recorded act saying so, which is what this
              // is.
              (side === "in" && e.kind === KIND.DEPOSIT) || e.kind === KIND.NOTE
                ? `<div class="acceptrow"><button class="acceptbtn" data-accept="${esc(e.rid)}" data-dim="${esc(e.dimWord)}">GO &middot; ACCEPT AS WORK</button><span class="acceptwhy">${e.kind === KIND.NOTE ? "a note is only read; Go makes it work somebody owes" : "nothing is owed on this until somebody accepts it"}</span></div>`
                : ""
            }
            ${e.why ? `<p class="rowwhy">${esc(e.why)}</p>` : ""}
            ${
              e.advice && e.advice.recommend
                ? `<p class="rowrec"><span class="reclabel">${e.forYou && side === "in" ? "RECOMMENDED" : "DO THIS"}</span>${esc(e.advice.recommend)}</p>`
                : ""
            }
            ${
              e.advice && Array.isArray(e.advice.options) && e.advice.options.length
                ? `<ul class="rowopts">${e.advice.options
                    .map((o) => `<li><b>${esc(o.label || "")}</b>${o.why ? ` &mdash; ${esc(o.why)}` : ""}</li>`)
                    .join("")}</ul>`
                : ""
            }
            ${
              // Said out loud rather than left blank. A missing recommendation is
              // a real state - it means nobody has worked out what to do yet -
              // and hiding it makes an unanswered finding look considered.
              side === "in" && !(e.advice && e.advice.recommend)
                ? `<p class="rowrec norec"><span class="reclabel">NO RECOMMENDATION YET</span>nothing has worked out what to do about this</p>`
                : ""
            }
            ${recordWiringHtml(e)}
            <p class="rowid"><b style="color:${e.color}; letter-spacing:0.1em">${esc(e.handle)}</b> &middot; ${esc(e.dimWord)} &middot; ${esc(e.rid)}${side === "in" ? ` &middot; ${esc(KIND_WORD[e.kind] || "")} &middot; ${esc(STATUS_WORD[e.status] || "")}` : ""}</p>
          </div>
        </div>`;

const incomingRows = D.incoming.map((e, i) => rowHtml(e, i, "in")).join("");
const resolvedRows = D.resolved.map((e, i) => rowHtml(e, i, "out")).join("");

// upcomingRows removed 2026-09-14: computed off D.upcoming, never interpolated
// into the page.
// needRow removed 2026-09-14: computed since the redesign, never called.

const ICON_CLOCK = `<svg viewBox="0 0 48 48" width="34" height="34" fill="none" style="flex:none">
            <circle cx="24" cy="24" r="13" style="stroke:oklch(0.86 0.008 85); stroke-width:2; opacity:0.6"></circle>
            <path d="M24 16V24H31" style="stroke:oklch(0.66 0.15 25); stroke-width:2.5"></path>
            <circle cx="24" cy="24" r="1.8" style="fill:oklch(0.90 0.008 85)"></circle>
          </svg>`;
const ICON_LEAK = `<svg viewBox="0 0 48 48" width="34" height="34" fill="none" style="flex:none">
            <rect x="18" y="16" width="12" height="16" rx="2" style="stroke:oklch(0.86 0.008 85); stroke-width:2; opacity:0.5"></rect>
            <path d="M5 24H18" style="stroke:oklch(0.86 0.008 85); stroke-width:2; opacity:0.35"></path>
            <path d="M30 24H43" style="stroke:oklch(0.55 0.10 30); stroke-width:2; stroke-dasharray:3 3"></path>
            <path d="M36 18L42 30M42 18L36 30" style="stroke:oklch(0.66 0.15 25); stroke-width:2"></path>
          </svg>`;

const loopCard = (label, value, orbitSecs, hue, glyph) => `
        <div style="display:flex; align-items:center; gap:10px; background:oklch(0.17 0.012 70); border-radius:5px; padding:12px">
          <svg viewBox="0 0 48 48" width="40" height="40" style="flex:none" fill="none">
            <circle cx="24" cy="24" r="15" style="stroke:oklch(0.95 0.008 85); stroke-width:2; opacity:0.25"></circle>
            <g style="transform-box:view-box; transform-origin:24px 24px; animation:orbit ${orbitSecs}s linear infinite"><circle cx="24" cy="9" r="3.4" style="fill:${hue}"></circle></g>
            ${glyph}
          </svg>
          <div style="display:flex; flex-direction:column; gap:3px; font-family:${mono}; min-width:0">
            <span style="font-size:17px; letter-spacing:0.08em; color:oklch(0.92 0.008 85)">${label}</span>
            <span style="font-size:13px; white-space:nowrap; color:oklch(0.62 0.01 80)">${esc(value)}</span>
          </div>
        </div>`;

// The three aggregate carriers that used to ride here, parked when the factory
// was not running, are gone - one card per deposit replaced them (see
// deposit() in the belt svg), and each card carries its own animateMotion.
// The page pauses the svg's SMIL clock when the pulse lamp is red or unknown
// (powerBelt), which stops every card where it is. Deleted 2026-09-14 after
// being found dead: no call site, and an edit to it changed nothing rendered.

// ---- the year ledger --------------------------------------------------------
//
// Operator, 2026-09-11: "we don't have to use dynamic numbers, we can have the
// machine move numbers manually so the chart doesn't have to calculate, just
// read the numbers over time."
//
// That is the better engineering rather than the lazier option, and it is the
// belt's own discipline one level up: a month written once and never recomputed
// survives the belt being trimmed, a definition changing, or a bug in a counter.
// PAST MONTHS ARE FROZEN. Only the current month is rewritten, from live counts.
//
// An absent month and a zero month are DIFFERENT FACTS. Eleven flat zero bars
// would read as eleven months of failure rather than eleven months that had not
// happened yet, so a month with no entry is drawn as absent.
// KEYED BY REPO, from the first month, deliberately.
//
// Operator, 2026-09-11: "I notice the factory is for overall... which repo
// exactly, or split metrics using a bar chart to see relative comparison
// between repos."
//
// He is right that the board is ambiguous: every number on it comes from THIS
// repo while the board carries the factory's name. The scope is meant to be all
// fourteen, and the belt is per-repo by nature - so the board is a ROLL-UP, and
// a roll-up needs each row to know where it came from.
//
// Stamping that now costs nothing and is the whole difference between two belts
// merging cleanly later and an identity field retrofitted after the fact, which
// is the expensive version of the same work. Today it sums one repo; the day a
// second is wired it splits with no rework.
const REPO = path.basename(ROOT);
const LEDGER = path.join(CTX, "factory-ledger.json");
let ledger = readJson(LEDGER, {});
// Migrate the flat first version - months at the top level - under this repo.
if (Object.keys(ledger).some((k) => /^\d{4}-\d{2}$/.test(k))) {
  const flat = ledger;
  ledger = { [REPO]: flat };
}
const monthKey = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const thisMonth = monthKey(now);
const inThisMonth = records.filter((r) => runAt(r) && monthKey(runAt(r)) === thisMonth);
const mine = (ledger[REPO] ||= {});
mine[thisMonth] = {
  found: inThisMonth.length,
  closed: inThisMonth.filter((r) => String(r.triggers || "").startsWith("terminal:")).length,
  routes: scriptsRegistered != null ? scriptsRegistered : (mine[thisMonth] && mine[thisMonth].routes) || 0,
  shed: inThisMonth.filter((r) => /^X\d/.test(String(r.driver || ""))).length,
  updated: new Date(now).toISOString(),
};
fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n");

// The roll-up: sum every repo's ledger for a month. One repo today.
const repos = Object.keys(ledger).sort();
const rollup = {};
for (const repo of repos) {
  for (const [m, v] of Object.entries(ledger[repo])) {
    const t = (rollup[m] ||= { found: 0, closed: 0, routes: 0, shed: 0 });
    for (const k of ["found", "closed", "routes", "shed"]) t[k] += Number(v[k]) || 0;
  }
}

const SERIES = [
  { key: "found", label: "FOUND", color: "oklch(0.68 0.15 55)" },
  { key: "closed", label: "CLOSED", color: "oklch(0.66 0.14 150)" },
  { key: "routes", label: "ROUTES", color: "oklch(0.68 0.14 195)" },
  { key: "shed", label: "SHED", color: "oklch(0.66 0.14 310)" },
];
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const year = new Date(now).getFullYear();

// FOUR BANDS, EACH ON ITS OWN SCALE.
//
// Operator, 2026-09-11: "make it a horizontal line and each [series] using
// their own high-low set of boundaries... the in-between spaces are their
// relative max... or else the comparisons won't make sense because some will be
// in the thousands and some in the hundreds and may dwarf other lines."
//
// He is right, and it is the reason small multiples exist. On one shared axis a
// series in the thousands flattens a series in the tens into a straight line,
// and the straight line is not a finding - it is the scale destroying the only
// thing a year view is for, which is SHAPE. Each band is therefore normalised to
// its own maximum: the heights are not comparable between bands and are not
// meant to be, so no per-month numbers are printed. The value is on demand, by
// clicking a node.
//
// A gap is a gap. Absent months break the line rather than being joined through,
// because a segment drawn across a month with no data asserts a trend that was
// never measured.
// Built once per selectable scope so the selector switches REAL data rather than
// implying it. With one repo wired, "All repos" and that repo render the same
// picture - which is true, not a placeholder, and stops being trivial the moment
// a second repo is wired.
const scopes = [{ id: "__all", label: "All repos", months: rollup }, ...repos.map((r) => ({ id: r, label: r, months: ledger[r] }))];

function chartSvg(months) {
  const W = 1200,
    H = 318,
    L = 118,
    R = 16,
    TOP = 12,
    FLOOR = 268;
  const plot = W - L - R;
  const slot = plot / 12;
  const bands = SERIES.length;
  const bandH = (FLOOR - TOP) / bands;
  const headroom = 0.74; // the tallest point stops short of the band above it

  const monthsOf = (key) =>
    Array.from({ length: 12 }, (_, m) => {
      const row = months[`${year}-${pad(m + 1)}`];
      return row ? Number(row[key]) || 0 : null;
    });

  let out = "";

  SERIES.forEach((sx, bi) => {
    // Band 0 is the floor; each later band sits one band higher. Its own zero.
    const zero = FLOOR - bi * bandH;
    const vals = monthsOf(sx.key);
    const present = vals.filter((v) => v !== null);
    const max = Math.max(1, ...present);
    const yFor = (v) => zero - (v / max) * (bandH * headroom);

    out += `<path d="M${L} ${zero}H${W - R}" style="stroke:oklch(0.26 0.012 70); stroke-width:1"></path>`;
    out += `<text x="${L - 14}" y="${zero - 4}" text-anchor="end" style="font-family:${mono}; font-size:14px; letter-spacing:0.08em; fill:${sx.color}">${sx.label}</text>`;
    out += `<text x="${L - 14}" y="${zero + 13}" text-anchor="end" style="font-family:${mono}; font-size:12px; fill:oklch(0.50 0.01 80)">peak ${max}</text>`;

    // Contiguous runs only - never bridge an absent month.
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        out += `<polyline points="${run.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" style="fill:none; stroke:${sx.color}; stroke-width:2.5; stroke-linejoin:round; stroke-linecap:round"></polyline>`;
      }
      run = [];
    };
    vals.forEach((v, m) => {
      if (v === null) {
        flush();
        return;
      }
      run.push({ x: L + slot * (m + 0.5), y: yFor(v) });
    });
    flush();

    vals.forEach((v, m) => {
      if (v === null) return;
      const x = L + slot * (m + 0.5);
      const y = yFor(v);
      out += `<circle class="nodepick" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" data-v="${v}" data-s="${sx.label}" data-m="${MONTH_NAMES[m]}" data-zero="${zero}" data-color="${sx.color}" style="fill:${sx.color}; cursor:pointer"></circle>`;
    });
  });

  // Month rules and names, drawn once beneath every band.
  for (let m = 0; m < 12; m++) {
    const cx = L + slot * (m + 0.5);
    const has = !!months[`${year}-${pad(m + 1)}`];
    out += `<text x="${cx.toFixed(1)}" y="${FLOOR + 30}" text-anchor="middle" style="font-family:${mono}; font-size:13px; letter-spacing:0.06em; fill:oklch(${has ? "0.74" : "0.36"} 0.01 80)">${MONTH_NAMES[m]}</text>`;
    if (has) out += `<path d="M${cx.toFixed(1)} ${FLOOR + 6}v6" style="stroke:oklch(0.42 0.012 70); stroke-width:1.5"></path>`;
  }

  out += `<path d="M${L} ${FLOOR}H${W - R}" style="stroke:oklch(0.42 0.012 70); stroke-width:1.5"></path>`;
  // The readout a click fills in. Empty until then - nothing is asserted.
  out += `<text id="nodereadout" x="0" y="0" text-anchor="middle" style="font-family:${mono}; font-size:15px; font-weight:500; fill:oklch(0.95 0.008 85); pointer-events:none"></text>`;

  return `<svg id="yearchart" viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="xMidYMax meet" style="display:block" fill="none">${out}</svg>`;
}

// ---- the track, drawn from geometry rather than by hand ----------------------
//
// Repositioned to the top of its card and widened to the card's full width at
// the operator's direction. A square track at full width would be as tall as the
// card and leave nothing beneath it, so the loop is a WIDE rectangle now - which
// also reads more like a conveyor than a square ever did. Every coordinate below
// derives from the four numbers in TRACK, so the shape stays adjustable.
// Narrowed horizontally from 112/1088 to make room for the three intake doors
// down the left margin and a matching EXIT on the right. The old 81-unit margin
// held a post 72 units wide, which FITS and cannot be READ: this canvas is 1200
// units shown in a card about 700px across, so every unit renders at 0.58px and
// a 9px label arrives at five. The first version of the doors passed a geometry
// check on "does the text fit its box" and was illegible in the photograph -
// the wrong question, asked precisely.
//
// x1 and x2 move inward by the same 58 units, so cx stays exactly 600 and the
// centre readout does not shift. Both margins are now 110-unit posts.
const TRACK = { x1: 170, y1: 112, x2: 1030, y2: 528, band: 62 };

// The centre readout is HTML laid over the SVG, so it needs the loop's interior
// width as a percentage of the canvas. It was written as a literal 74%, which
// was correct for the old track and silently wrong the moment the track moved -
// the readout ran out through the conveyor on both sides and the seer caught it.
// Derived here so the drawing and the text over it cannot disagree again.
const BELT_VIEW_W = 1200;
const BELT_INTERIOR_PCT = ((TRACK.x2 - TRACK.band / 2 - (TRACK.x1 + TRACK.band / 2)) / BELT_VIEW_W) * 100;
function boardSvg() {
  const { x1, y1, x2, y2, band } = TRACK;
  const h = band / 2;
  const o = { x1: x1 - h, y1: y1 - h, x2: x2 + h, y2: y2 + h };
  const i = { x1: x1 + h, y1: y1 + h, x2: x2 - h, y2: y2 - h };
  const cx = (x1 + x2) / 2,
    cy = (y1 + y2) / 2;
  const loop = `M${x1} ${y1}H${x2}V${y2}H${x1}Z`;

  const across = (n, a, b) => Array.from({ length: n }, (_, k) => a + ((b - a) * (k + 0.5)) / n);
  const divs = (n, a, b) => Array.from({ length: n - 1 }, (_, k) => a + ((b - a) * (k + 1)) / n);
  const topX = across(6, i.x1, i.x2);
  // Inset from the corners, because the corner boxes reach 42 units in from each
  // end of the rail and the outermost side labels were landing underneath them.
  // Deposit B4: "The CONTRACT label on the track's right edge sits underneath
  // the SUPERVISOR corner box." It did, and it had for days.
  const sideY = across(4, i.y1 + 34, i.y2 - 34);
  const label = (x, yy, t, bright, rot) =>
    rot
      ? `<g transform="translate(${x} ${yy}) rotate(${rot})"><text text-anchor="middle" style="font-family:${mono}; font-size:17px; fill:oklch(${bright ? "0.84" : "0.62"} 0.01 80)">${t}</text></g>`
      : `<text x="${x.toFixed(1)}" y="${yy}" text-anchor="middle" style="font-family:${mono}; font-size:17px; fill:oklch(${bright ? "0.84" : "0.62"} 0.01 80)">${t}</text>`;

  // Held as hue angles, not finished colours, because the card needs two tones of
  // the same hue: the bright accent for the spine, and a deep one behind the
  // count so the number is readable.
  const HUES = [55, 195, 310];
  const dims = HUES.map((a) => `oklch(0.62 0.15 ${a})`);

  // Parked cards sit ABOVE the belt, off the line entirely.
  //
  // They used to sit inside the loop, and the middle one landed directly on top
  // of the centre heading - the MIND label measured at x 951-969, y 403-411,
  // fully inside the "BELT IDLE" box at 900-1020, 396-418. Measured in a real
  // browser, because at a glance it read as a slightly busy middle rather than
  // as two things occupying the same pixels.
  //
  // There is no arrangement that fits both inside the loop: the readout block is
  // about 190px tall and the interior is about 230px, so anything parked in
  // there is either on the heading or on the number. Moving them out is the only
  // honest answer, and it is also the truer picture - a parked carrier is OFF
  // the conveyor, which is exactly what sitting above the line says.
  //
  // The strip above the top rail is free between the two corner boxes, which
  // reach x1+42 and x2-42.
  const parkSlots = [0.22, 0.5, 0.78].map((f) => ({ x: x1 + (x2 - x1) * f, y: y1 - h - 30 }));
  // Operator, 2026-09-11: "The cards on the conveyors - status count should be in
  // black font for visibility, or darken the current front more, or add better
  // contrasting bg, white text with the darkened color for that card behind the
  // count."
  //
  // The count was drawn in the carrier's own mid-tone on a near-white card -
  // around 0.62 lightness on 0.95, which is too close to read at a glance and
  // much too close from across a room, which is where this board lives.
  //
  // The third option, and it is the best of the three: a DEEP badge in the same
  // hue with near-white text on it. Black would have worked and would have
  // thrown away the colour coding, which is the only thing telling body from
  // mind from spirit at that size. This keeps the identity and wins the
  // contrast - roughly 0.34 against 0.97, which is legible at a glance.
  // ONE CARD, ONE DEPOSIT. It carries the deposit's handle - the thing he can
  // say out loud - instead of a count, because a count was the aggregate that
  // made a stationary loaded carrier possible in the first place.
  //
  // They circulate whenever any are present. His rule: "I don't think there
  // should be anything on the carrier if the carrier is not moving, and I don't
  // think the carrier should stop if something is on it." Loaded implies moving,
  // so a parcel on the belt is always in motion.
  //
  // Motion here means IN THE SYSTEM, which is a weaker claim than being worked
  // on - and the headline states the stronger one in words, so the two do not
  // contradict. A belt full of moving parcels under a heading that reads NOBODY
  // IS WORKING is the honest picture of this factory today.
  const deposit = (e, k, n) => {
    const stagger = ((k * 40) / Math.max(1, n)).toFixed(2);
    return `
        <g>
          <g>
            <rect x="-22" y="-10" width="44" height="20" rx="3" style="fill:oklch(0.95 0.008 85)"></rect>
            <rect x="-22" y="-10" width="3.5" height="20" style="fill:${e.color}"></rect>
            <text x="2" y="4.5" text-anchor="middle" style="font-family:${mono}; font-size:12px; font-weight:500; letter-spacing:0.03em; fill:oklch(0.20 0.012 70)">${esc(e.handle)}</text>
          </g>
          <animateMotion dur="${(38 + (k % 3) * 2).toFixed(0)}s" begin="-${stagger}s" repeatCount="indefinite" rotate="0"><mpath href="#board"></mpath></animateMotion>
        </g>`;
  };

  const card = (a, barW, count) =>
    `<rect x="-34" y="-13" width="68" height="26" rx="3" style="fill:oklch(0.95 0.008 85)"></rect>` +
    `<rect x="-34" y="-13" width="5" height="26" style="fill:oklch(0.62 0.15 ${a})"></rect>` +
    `<rect x="-24" y="-6" width="38" height="3.5" rx="1.75" style="fill:oklch(0.32 0.012 70)"></rect>` +
    `<rect x="-24" y="2" width="${barW}" height="3.5" rx="1.75" style="fill:oklch(0.62 0.012 70)"></rect>` +
    (count
      ? `<rect x="14" y="-10" width="22" height="20" rx="4" style="fill:oklch(0.34 0.12 ${a})"></rect>` +
        `<text x="25" y="5" text-anchor="middle" style="font-family:${mono}; font-size:15px; font-weight:500; fill:oklch(0.97 0.006 85)">${count}</text>`
      : `<circle cx="25" cy="0" r="3.4" style="fill:oklch(0.62 0.15 ${a})"></circle>`);

  // One card per deposit. The three aggregate carriers are gone: they were the
  // reason a loaded belt could stand still, and the reason the middle of the
  // board showed a number instead of the work.
  const carriers = D.onBelt.map((e, k) => deposit(e, k, D.onBelt.length)).join("");

  // THE PULSE CARD ON THE BELT. Operator, 2026-09-14: "heartbeat saw wave,
  // time released and enumeration PU." Wider than a deposit card because it
  // carries three things; the stripe and the glyph are the pulse's hue so it
  // reads as the pulse and not as work. Time released is when it was pulled
  // onto the belt - the beat after the one that made it. Hidden, not absent,
  // when no card is in the belt stage, so the page can show it the moment one
  // rolls in without a rebuild. It rides the same SMIL clock as every other
  // card, so a dead pulse stops it too - which is the one thing a pulse card
  // must never do while the pulse is alive, and the one thing it must do when
  // it is not.
  // The belt carries the beat that just fired - the newest card (see
  // pulseStates). Its time is that beat's own time.
  const pc = pulseStates(D.pulseBelt.cards, D.pulseBelt.stageMs, D.pulseBelt.graceMs, now).belt;
  const pulseCard = `
        <g data-pulse-slot="belt" visibility="${pc ? "visible" : "hidden"}">
          <!-- THREE SECTIONS - operator, 2026-09-14: "Icon (red), PU, and TIME.
               The enumeration is a static PU; the number would get too big.
               Keep it in the file for the unique id, remove it from the card -
               not enough space." So: a red heartbeat, the two letters, and the
               beat this card represents, at a size a wall can read. seq rides
               in the file and in the row tooltips, never on a card. -->
          <g>
            <rect x="-42" y="-11" width="84" height="22" rx="3" style="fill:oklch(0.95 0.008 85)"></rect>
            <rect x="-42" y="-11" width="3.5" height="22" style="fill:${PULSE_RED}"></rect>
            <path d="M-35 0H-30.5L-28 -5.5L-24.5 5.5L-22 0H-18" style="stroke:${PULSE_RED}; stroke-width:1.8; fill:none; stroke-linejoin:round; stroke-linecap:round"></path>
            <text data-pulse="handle" x="-7" y="4" text-anchor="middle" style="font-family:${mono}; font-size:11.5px; font-weight:600; letter-spacing:0.06em; fill:oklch(0.20 0.012 70)">PU</text>
            <text data-pulse="time" x="21" y="4" text-anchor="middle" style="font-family:${mono}; font-size:11px; font-weight:500; letter-spacing:0.02em; fill:oklch(0.30 0.012 70)">${pc ? hhmm(pc.at) : ""}</text>
          </g>
          <animateMotion dur="40s" begin="-20s" repeatCount="indefinite" rotate="0"><mpath href="#board"></mpath></animateMotion>
        </g>`;
  const parked = [`translate(${x1} ${y1})`, `translate(${x1 + (x2 - x1) * 0.95} ${y1})`, `translate(${x2 - (x2 - x1) * 0.48} ${y2})`];

  // The count chip sits on the OUTER corner of each box, away from the track, so
  // it never sits over the belt. No count, no chip - an absent chip reads as
  // "none active", which is the operator's own rule and is why it must not be
  // drawn as a zero.
  const chip = (n, ox, oy) =>
    n
      ? `<g transform="translate(${ox} ${oy})"><rect x="-15" y="-13" width="30" height="26" rx="13" style="fill:oklch(0.95 0.008 85)"></rect><text x="0" y="6" text-anchor="middle" style="font-family:${mono}; font-size:17px; font-weight:500; fill:oklch(0.18 0.012 70)">${n}</text></g>`
      : "";

  // A worker post at each end of the belt. Lamp on top, state word under the
  // name - the lamp only pulses when WORKING, because a light that always
  // blinks is decoration and this board has removed three of those already.
  const WSTATE = {
    WORKING: { fill: "oklch(0.66 0.14 150)", text: "oklch(0.80 0.12 150)", border: "oklch(0.40 0.09 150)" },
    WAITING: { fill: "oklch(0.72 0.12 75)", text: "oklch(0.82 0.11 75)", border: "oklch(0.38 0.07 75)" },
    // A door that is open and quiet. Amber like WAITING, because it is the same
    // fact about a different thing - staffed, able, nothing arrived.
    LISTENING: { fill: "oklch(0.72 0.12 75)", text: "oklch(0.82 0.11 75)", border: "oklch(0.38 0.07 75)" },
    CLOSED: { fill: "oklch(0.44 0.01 80)", text: "oklch(0.58 0.01 80)", border: "oklch(0.30 0.012 70)" },
    // Deliberately switched off. Grey, and it has earned its grey.
    OFF: { fill: "oklch(0.44 0.01 80)", text: "oklch(0.58 0.01 80)", border: "oklch(0.30 0.012 70)" },
    // The report is there and cannot be read. NOT grey: this is a fault in the
    // factory's own bookkeeping, and it used to be reported as "has never run",
    // which sent a reader to start a worker that may be running perfectly.
    UNREADABLE: { fill: "oklch(0.60 0.15 25)", text: "oklch(0.78 0.13 25)", border: "oklch(0.38 0.09 25)" },
    // The board cannot see this door. NOT grey, because grey reads as "nothing
    // happening" and the truthful claim is "I do not know" - which is a fault to
    // fix, not a resting state to accept.
    UNOBSERVED: { fill: "oklch(0.60 0.15 25)", text: "oklch(0.78 0.13 25)", border: "oklch(0.38 0.09 25)" },
  };
  // The same 110 width and the same type sizes as an intake door, because the
  // two ends of the belt are peers and a post that reads differently from its
  // opposite number reads as a different kind of thing.
  const worker = (px, py, w) => {
    const c = WSTATE[w.state] || WSTATE.CLOSED;
    return `
        <g class="xopen" data-explain="door:exit" data-door="exit" data-state="${esc(w.state)}" transform="translate(${px} ${py})">
          <rect x="-52" y="-65" width="104" height="130" rx="5" style="fill:oklch(0.15 0.012 70); stroke:${c.border}; stroke-width:2"></rect>
          <circle cx="0" cy="-38" r="8" style="fill:${c.fill}${w.state === "WORKING" ? "; animation:alive 2.2s ease-in-out infinite" : ""}"></circle>
          <text x="0" y="-8" text-anchor="middle" style="font-family:${mono}; font-size:17px; letter-spacing:0.05em; fill:oklch(0.86 0.01 80)">${esc(w.name)}</text>
          <text x="0" y="14" text-anchor="middle" style="font-family:${mono}; font-size:14px; letter-spacing:0.02em; fill:${c.text}">${esc(w.state)}</text>
          <!-- Its reason gets the same 14px the doors' state line gets. At 9px
               this line rendered at five pixels and had done since the post was
               built - measured, not guessed, while widening the doors. -->
          <text x="0" y="40" text-anchor="middle" style="font-family:${mono}; font-size:14px; letter-spacing:0.02em; fill:oklch(0.58 0.01 80)">${esc(String(w.why).slice(0, 10))}</text>
        </g>`;
  };

  // ---- the three intake doors, down the left margin ------------------------
  //
  // Icons are inline SVG paths, never emoji characters. This board renders in
  // one mono face on a wall display, where an emoji either draws a box glyph or
  // drags in a colour font at a size nobody can read.
  // One definition, DOOR_GLYPH, shared with the session cards and every row -
  // operator, 2026-09-14: "use the robot icon for the spawn and the auto icon
  // for the auto and the person icon for the chat, keeping consistent with the
  // current icons on the intake cards, and continue the icons on the
  // processing list and resolved list."
  const DOOR_ICON = { chat: DOOR_GLYPH("chat", "oklch(0.88 0.01 80)"), auto: DOOR_GLYPH("auto", "oklch(0.88 0.01 80)"), spawn: DOOR_GLYPH("spawn", "oklch(0.88 0.01 80)") };

  // SIZED BY WHAT CAN BE READ, THEN PLACED - not placed and then filled.
  //
  // This canvas is 1200 units wide inside a card about 670px across, so one
  // unit renders at 0.558px and a font-size is multiplied by that before it
  // reaches an eye. Everything the board already trusts - corner names, rail
  // labels - is 17px, which arrives at 9.5px. That is the floor, and it was
  // established by measuring the rendered pixels rather than by taste.
  //
  // The first version of these posts was 76 wide with five rows at 8-9px. It
  // passed a check asking "does the text fit its box" and arrived on screen at
  // four and a half pixels: present, correct, and unreadable. Fitting and being
  // legible are different properties and only one of them had been tested.
  //
  // 104 wide, centred at x=59, so a post spans x 7..111. The corner boxes start
  // at x1-42 = 128, so at this width the posts clear them ENTIRELY and are free
  // to use the full canvas height instead of the 332-unit band between them -
  // which is what buys the row space the type needs. 130 tall at 140 spacing
  // puts AUTO on the centre line, where the single INTAKE post stood.
  const door = (py, w) => {
    const c = WSTATE[w.state] || WSTATE.CLOSED;
    const n = (v) => (Number.isFinite(v) ? String(v) : "?");
    return `
        <g class="xopen" data-explain="door:${esc(w.key)}" data-door="${esc(w.key)}" data-state="${esc(w.state)}" transform="translate(59 ${py})">
          <!-- 150 tall, not 130. Operator, 2026-09-14: "make it a little taller
               so the 3rd line, Chat Listening 1 active, doesn't overlap." The
               chat door carries five lines - name, state, ACTIVE, the two
               counts and their labels - and at 130 the ACTIVE line sat on the
               counts. ACTIVE is not redundant with NOW or TODAY: those count
               deposits and dispatches, this counts live sessions. So the post
               grew and the lines were re-spaced with measured air between
               every pair of text boxes; the doors sit 160 apart, 85..555 on a
               640 canvas. -->
          <rect x="-52" y="-75" width="104" height="150" rx="5" style="fill:oklch(0.15 0.012 70); stroke:${c.border}; stroke-width:2"></rect>
          <circle cx="-36" cy="-52" r="8" style="fill:${c.fill}${w.state === "WORKING" ? "; animation:alive 2.2s ease-in-out infinite" : ""}"></circle>
          <g transform="translate(30 -52) scale(1.35)">${DOOR_ICON[w.key] || ""}</g>
          <text x="0" y="-28" text-anchor="middle" style="font-family:${mono}; font-size:17px; letter-spacing:0.05em; fill:oklch(0.86 0.01 80)">${esc(w.name)}</text>
          <!-- 14px, because UNOBSERVED is the longest word any door can show and
               ten characters at 17px need 109 units inside a 96-unit post. The
               post is sized for the longest state, not the shortest. -->
          <text x="0" y="-6" text-anchor="middle" data-door-state="1" style="font-family:${mono}; font-size:14px; letter-spacing:0.02em; fill:${c.text}">${esc(w.state)}</text>
          ${
            // The chat door alone carries a live count of sessions: how many
            // Claude chats have written a transcript in this repo inside the
            // liveness window. Refreshed by the page from /chat. "?" when the
            // transcript directory could not be read - unseen is not zero.
            w.key === "chat"
              ? `<text data-chat-live="1" x="0" y="13" text-anchor="middle" style="font-family:${mono}; font-size:12px; letter-spacing:0.06em; fill:oklch(0.74 0.13 195)">${w.active === null || w.active === undefined ? "? ACTIVE" : `${w.active} ACTIVE`}</text>`
              : ""
          }
          <!-- The two numbers he asked for, and they are the largest type on the
               post because they are the thing being read. A zero is drawn, never
               blanked: for a counter, zero is information. -->
          <text x="-24" y="42" text-anchor="middle" style="font-family:${mono}; font-size:19px; fill:oklch(0.84 0.01 80)">${n(w.now)}</text>
          <text x="24" y="42" text-anchor="middle" style="font-family:${mono}; font-size:19px; fill:oklch(0.70 0.01 80)">${n(w.today)}</text>
          <text x="-24" y="64" text-anchor="middle" style="font-family:${mono}; font-size:14px; letter-spacing:0.04em; fill:oklch(0.52 0.01 80)">NOW</text>
          <text x="24" y="64" text-anchor="middle" style="font-family:${mono}; font-size:14px; letter-spacing:0.04em; fill:oklch(0.52 0.01 80)">TODAY</text>
        </g>`;
  };

  // The chip is always in the markup and hidden at zero, so the page can show
  // it the moment work arrives - an absent chip still reads as "none", exactly
  // as before, but now it can come back without a rebuild.
  const corner = (px, py, name, accent, glyph, count, ox, oy) => `
        <g transform="translate(${px} ${py})" data-corner="${name}">
          <rect x="-42" y="-42" width="84" height="84" rx="5" style="fill:oklch(0.15 0.012 70); stroke:${accent}; stroke-width:2"></rect>
          <g transform="translate(-26 -33) scale(1.1)">${glyph}</g>
          <text x="0" y="33" text-anchor="middle" style="font-family:${mono}; font-size:17px; fill:oklch(0.86 0.01 80)">${name}</text>
          <g data-corner-chip="1" transform="translate(${ox} ${oy})" visibility="${count ? "visible" : "hidden"}"><rect x="-15" y="-13" width="30" height="26" rx="13" style="fill:oklch(0.95 0.008 85)"></rect><text data-corner-n="1" x="0" y="6" text-anchor="middle" style="font-family:${mono}; font-size:17px; font-weight:500; fill:oklch(0.18 0.012 70)">${count || ""}</text></g>
        </g>`;

  // ONE CARD PER LIVE SESSION - chat or spawn - riding with the deposits.
  // Operator, 2026-09-14: "this chat needs to be on the belt ... same for the
  // spawn." A session is work in the system whatever the belt has been told
  // about it, so it rides: a stripe in its kind's colour, a glyph (a speech
  // mark for chat, a fork for spawn), the first four characters of its id as
  // its handle, and the time of its last word. The page re-renders these from
  // /sessions with the same markup (renderSessions), so what the timer placed
  // is on the belt within a beat and off it thirty minutes after it fell
  // silent - the belt's own definition of gone.
  // Operator, 2026-09-14: "I can't see the chat logo so well on the card, use
  // a darker cyan (or black background on the icon), add the chat code CH and
  // the id d4fa." So: the glyph sits in a dark square with a bright stroke,
  // then the kind code in bold, then the id, then the time - five sections on
  // the pulse card's width. The stripe keeps the kind's hue.
  // Three kinds and one role. chat = a person (cyan, person glyph); auto = the
  // factory's own hand, a routine's run (amber, arrow glyph, code AU); spawn =
  // a spawned agent (green, robot glyph). A routine of kind pulse makes its
  // run THE PULSE: heartbeat glyph in pulse red, code PU - operator, 2026-09-14:
  // "it needs to show the pulse icon, unless it's specifically a chat about
  // the pulse." Classified by session-belt from the routines registry; the
  // board only draws what it was told.
  const SESSION_HUE = { chat: "oklch(0.74 0.13 195)", auto: "oklch(0.80 0.12 75)", spawn: "oklch(0.72 0.13 150)", pulse: PULSE_RED };
  const SESSION_INK = { chat: "oklch(0.86 0.14 195)", auto: "oklch(0.88 0.13 75)", spawn: "oklch(0.84 0.14 150)", pulse: "oklch(0.78 0.20 25)" };
  const SESSION_CODE = { chat: "CH", auto: "AU", spawn: "SP", pulse: "PU" };
  const sessionCard = (s, k, n) => {
    const stagger = ((k * 40) / Math.max(1, n) + 13).toFixed(2);
    const look = s.role === "pulse" ? "pulse" : s.kind;
    const hue = SESSION_HUE[look] || SESSION_HUE.chat;
    const ink = SESSION_INK[look] || SESSION_INK.chat;
    // The door's own glyph - a person for chat, a robot for spawn - scaled into
    // the dark square, so a card and the door it came through wear one mark.
    // Operator, 2026-09-14: "remove the time from the cards, not necessary,
    // just the icon and id - this way the font can be more readable, increase
    // font size as much as possible." Three sections on 80: the glyph in its
    // dark square, the code in bold, the id - at 13px, the largest that fits
    // with air (box -> CH 3, CH -> id 4, id -> edge 5, in belt units). The time
    // of the session's last word stays in PROCESSING, where there is room.
    const glyph =
      look === "pulse"
        ? `<path d="M-32 0H-29.5L-27.8 -4L-25.5 4L-23.8 0H-21" style="stroke:${ink}; stroke-width:1.7; fill:none; stroke-linejoin:round; stroke-linecap:round"></path>`
        : `<g transform="translate(-25.5 0.8) scale(0.65)">${DOOR_GLYPH(s.kind, ink)}</g>`;
    return `
        <g data-session="${esc(s.id)}" data-session-kind="${esc(look)}" data-session-at="${s.at}">
          <g>
            <rect x="-40" y="-11" width="80" height="22" rx="3" style="fill:oklch(0.95 0.008 85)"></rect>
            <rect x="-40" y="-11" width="3.5" height="22" style="fill:${hue}"></rect>
            <rect x="-34" y="-8.5" width="17" height="17" rx="3" style="fill:oklch(0.20 0.012 70)"></rect>
            ${glyph}
            <text x="-7" y="4.5" text-anchor="middle" style="font-family:${mono}; font-size:13px; font-weight:700; letter-spacing:0.04em; fill:oklch(0.20 0.012 70)">${SESSION_CODE[look] || "CH"}</text>
            <text x="20" y="4.5" text-anchor="middle" style="font-family:${mono}; font-size:12.5px; letter-spacing:0.02em; fill:oklch(0.28 0.012 70)">${esc(String(s.short || s.id).slice(0, 4))}</text>
          </g>
          <animateMotion dur="${(39 + (k % 3)).toFixed(0)}s" begin="-${stagger}s" repeatCount="indefinite" rotate="0"><mpath href="#board"></mpath></animateMotion>
        </g>`;
  };
  const sessionCards = `<g data-sessions="1">${D.sessionBelt.sessions.map((s, k) => sessionCard(s, k, D.sessionBelt.sessions.length)).join("")}</g>`;

  return `<svg id="conveyor" viewBox="0 0 1200 640" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block" fill="none">
        <path id="board" d="${loop}" style="stroke:oklch(0.255 0.012 70); stroke-width:${band}"></path>
        <path d="${loop}" style="stroke:oklch(0.315 0.012 70); stroke-width:${band}; stroke-dasharray:2 36; animation:trackRun 1.4s linear infinite"></path>
        <path d="M${o.x1} ${o.y1}H${o.x2}V${o.y2}H${o.x1}Z" style="stroke:oklch(0.40 0.012 70); stroke-width:1.5"></path>
        <path d="M${i.x1} ${i.y1}H${i.x2}V${i.y2}H${i.x1}Z" style="stroke:oklch(0.40 0.012 70); stroke-width:1.5"></path>

        <path d="${divs(6, i.x1, i.x2).map((x) => `M${x.toFixed(1)} ${o.y1}V${i.y1}`).join("")}" style="stroke:oklch(0.22 0.012 70); stroke-width:1.5"></path>
        <path d="${divs(6, i.x1, i.x2).map((x) => `M${x.toFixed(1)} ${i.y2}V${o.y2}`).join("")}" style="stroke:oklch(0.22 0.012 70); stroke-width:1.5"></path>
        <path d="${divs(4, i.y1, i.y2).map((yy) => `M${i.x2} ${yy.toFixed(1)}H${o.x2}`).join("")}" style="stroke:oklch(0.22 0.012 70); stroke-width:1.5"></path>
        <path d="${divs(4, i.y1, i.y2).map((yy) => `M${o.x1} ${yy.toFixed(1)}H${i.x1}`).join("")}" style="stroke:oklch(0.22 0.012 70); stroke-width:1.5"></path>

        ${[].map((x, k) => `<rect x="${(x - 24).toFixed(1)}" y="${y1 - 22}" width="48" height="6" rx="3" style="fill:${dims[k]}"></rect>`).join("")}
        <!-- The station names sit lower on the band than they did, and the
             bottom row higher, so a passing deposit card clears them. Parcels
             running past the stations is what a conveyor looks like; parcels
             sitting ON the station names is just an unreadable board. -->
        ${["BODY", "MIND", "SPIRIT", "CHAT", "HIVE", "WORLD"].map((t, k) => label(topX[k], y1 + 24, t, k < 3)).join("")}
        ${["SWEEP", "LEDGER", "SHOUT", "DEPOSIT", "RENDER", "GATES"].map((t, k) => label(topX[k], y2 - 14, t, false)).join("")}
        ${["TRIAGE", "DERIVE", "REVERSE", "CONTRACT"].map((t, k) => label(x2 - 6, sideY[k], t, false, 90)).join("")}
        ${["ALARM", "SHED", "LAW", "SHELF"].map((t, k) => label(x1 + 6, sideY[k], t, false, -90)).join("")}

${corner(x1, y1, "TIMER", "oklch(0.74 0.13 55)", `<circle cx="24" cy="24" r="13" style="stroke:oklch(0.95 0.008 85); stroke-width:2"></circle><path d="M24 16V24H30" style="stroke:oklch(0.74 0.13 55); stroke-width:2"></path><circle cx="24" cy="24" r="1.6" style="fill:oklch(0.95 0.008 85)"></circle>`, D.corners.TIMER, -42, -42)}
${corner(x2, y1, "WATCHER", "oklch(0.42 0.012 70)", `<circle cx="21" cy="21" r="12" style="stroke:oklch(0.95 0.008 85); stroke-width:2"></circle><path d="M29.5 29.5L40 40" style="stroke:oklch(0.95 0.008 85); stroke-width:3"></path><path d="M13 21Q21 13.5 29 21Q21 28.5 13 21Z" style="stroke:oklch(0.74 0.13 55); stroke-width:2"></path><circle cx="21" cy="21" r="2.6" style="fill:oklch(0.74 0.13 55); animation:coreBeat 3.2s ease-in-out infinite"></circle>`, D.corners.WATCHER, 42, -42)}
${corner(x2, y2, "SUPERVISOR", "oklch(0.42 0.012 70)", `<path d="M13 13L35 35M35 13L13 35" style="stroke:oklch(0.95 0.008 85); stroke-width:2.5"></path><circle cx="6.5" cy="24" r="4" style="fill:oklch(0.60 0.15 25); animation:coreBeat 3.4s ease-in-out infinite"></circle><circle cx="41.5" cy="24" r="4" style="fill:oklch(0.64 0.14 150); animation:coreBeat 3.4s ease-in-out 1.7s infinite"></circle>`, D.corners.SUPERVISOR, 42, 42)}
${corner(x1, y2, "BUILDER", "oklch(0.42 0.012 70)", `<rect x="17" y="15" width="14" height="18" rx="3" style="fill:oklch(0.95 0.008 85)"></rect><rect x="22.75" y="20" width="2.5" height="8" rx="1.2" style="fill:oklch(0.15 0.012 70)"></rect><path d="M4 24H17" style="stroke:oklch(0.74 0.13 55); stroke-width:2"></path><path d="M31 24H44" style="stroke:oklch(0.74 0.13 195); stroke-width:2"></path><circle cx="13" cy="13" r="2.5" style="stroke:oklch(0.74 0.13 195); stroke-width:2; animation:coreBeat 3s ease-in-out infinite"></circle>`, D.corners.BUILDER, -42, 42)}
<!-- Clear of the conveyor. The loop's outer edge is 31 units beyond the
             path and the corner boxes reach 42 units past it, so a 110-wide post
             centred 64 from the canvas edge spans x 9..119 against a corner edge
             at 128 and a belt edge at 139. Both margins are verified by
             measuring the rendered boxes, never by reading these numbers. -->
        ${D.lanes.map((l, k) => door(cy + (k - 1) * 160, l)).join("")}
        ${worker(1200 - 64, cy, D.workers.exit)}
${carriers}${pulseCard}${sessionCards}
        <g transform="translate(${cx} ${cy})">
          <circle cx="0" cy="0" r="132" style="stroke:oklch(0.24 0.012 70); stroke-width:1.5"></circle>
          <g style="transform-box:view-box; transform-origin:${cx}px ${cy}px; animation:orbit 40s linear infinite">
            <circle cx="0" cy="-132" r="7" style="fill:oklch(0.64 0.14 150)"></circle>
          </g>
        </g>
      </svg>`;
}

const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Living Factory Tracker</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&display=swap">
<style>
  html, body { margin:0; background:oklch(0.15 0.012 70); }
  a { color:oklch(0.74 0.13 55); }
  a:hover { color:oklch(0.84 0.10 55); }
  @keyframes coreBeat { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
  @keyframes orbit { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes trackRun { to { stroke-dashoffset:-36; } }
  @keyframes alive { 0%,100% { opacity:0.45; transform:scale(0.9); } 50% { opacity:1; transform:scale(1); } }
  @keyframes feedIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes attention { 0%,100% { border-color:oklch(0.42 0.09 25); } 50% { border-color:oklch(0.58 0.14 25); } }
  @keyframes spin { to { transform:rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }

  /* Scrollbars used to sit ON the content. scrollbar-gutter reserves the space
     whether or not a bar is showing, so a card's last few characters are never
     hidden behind one - and the layout does not jump when a list grows past the
     fold. Thin and quiet, because a scrollbar is not information. */
  .scrollcol, .autoscroll {
    overflow-y: auto;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: oklch(0.36 0.012 70) transparent;
  }
  .scrollcol::-webkit-scrollbar, .autoscroll::-webkit-scrollbar { width: 8px; }
  .scrollcol::-webkit-scrollbar-track, .autoscroll::-webkit-scrollbar-track { background: transparent; }
  .scrollcol::-webkit-scrollbar-thumb, .autoscroll::-webkit-scrollbar-thumb {
    background: oklch(0.36 0.012 70); border-radius: 4px;
  }
  .scrollcol::-webkit-scrollbar-thumb:hover, .autoscroll::-webkit-scrollbar-thumb:hover { background: oklch(0.48 0.012 70); }

  /* A deposit row opens on tap and closes on the next one.

     Closed, the claim is clamped to two lines. Open, the clamp lifts and the
     evidence appears underneath - the reason the finding was believed, which
     the board has never shown despite every record carrying one.

     Nothing here is inline, deliberately. Inline beats a stylesheet rule, and
     the filter bug that shipped on this board was exactly that fight. */
  .feedrow { cursor: pointer; }
  .feedrow:hover { background: oklch(0.185 0.012 70); }
  .rowtext {
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .feedrow.open .rowtext { display: none; }
  .rowdetail { display: none; grid-column: 1 / -1; padding: 2px 0 6px; }
  .feedrow.open .rowdetail { display: block; }
  .rowclaim {
    margin: 0 0 8px; font-size: 16px; line-height: 1.4;
    color: oklch(0.92 0.008 85);
  }
  .rowwhy {
    margin: 0 0 8px; font-size: 14px; line-height: 1.5;
    color: oklch(0.70 0.01 80); border-left: 2px solid oklch(0.30 0.012 70);
    padding-left: 10px;
  }
  /* The recommendation is the part that turns a diagnosis into work, so it is
     the most legible thing in an open row - brighter than the evidence, with a
     rail in the colour of action rather than of alarm. */
  .rowrec {
    margin: 0 0 8px; font-size: 15px; line-height: 1.45;
    color: oklch(0.90 0.02 150); border-left: 2px solid oklch(0.56 0.12 150);
    padding-left: 10px;
  }
  .rowrec.norec { color: oklch(0.62 0.01 80); border-left-color: oklch(0.34 0.012 70); }
  .reclabel {
    display: block; font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px; letter-spacing: 0.16em; color: oklch(0.66 0.10 150);
    margin-bottom: 3px;
  }
  .rowrec.norec .reclabel { color: oklch(0.54 0.01 80); }
  .rowopts {
    margin: 0 0 8px; padding-left: 26px; font-size: 14px; line-height: 1.5;
    color: oklch(0.84 0.01 85);
  }
  .rowopts li { margin-bottom: 3px; }
  .rowopts b { font-weight: 600; color: oklch(0.92 0.008 85); }
  .rowid {
    margin: 0; font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px; letter-spacing: 0.06em; color: oklch(0.52 0.01 80);
  }

  /* A NOTE HAS TWO STATES AND NO OTHERS. Green while unread, white and dimmed
     once read - his own design.

     Written as a rule on the row rather than inline on each cell, because the
     state changes on a CLICK: an inline colour would need !important to lift and
     that is the fight this board has lost three times. The class is toggled, the
     stylesheet decides, and nothing inline competes. */
  .noterow .notetext { color: oklch(0.88 0.13 150); }
  .noterow .notepip { color: oklch(0.72 0.13 150); }
  .noterow.noteread .notetext { color: oklch(0.72 0.008 85); opacity: 0.62; }
  .noterow.noteread .notepip { color: oklch(0.50 0.01 80); opacity: 0.62; }

  /* ACCEPT: the act that turns a deposit into a contract.
     Only on a deposit row, because only a deposit can be accepted. Small,
     deliberate, and it says what happens rather than naming a mechanism. */
  .acceptbtn {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.12em; color: oklch(0.80 0.10 150);
    background: transparent; border: 1px solid oklch(0.42 0.08 150);
    border-radius: 3px; padding: 3px 9px; cursor: pointer;
  }
  .acceptbtn:hover { background: oklch(0.28 0.04 150); color: oklch(0.93 0.05 150); }
  .acceptbtn[disabled] { color: oklch(0.56 0.01 80); border-color: oklch(0.32 0.012 70); cursor: default; }
  .acceptrow { margin: 2px 0 8px; display: flex; align-items: center; gap: 10px; }
  .acceptwhy {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
    color: oklch(0.58 0.01 80);
  }

  /* The three panes. Tabs use [hidden] and carry NO inline display, which is the
     r.hidden lesson applied at the moment of writing rather than after somebody
     finds the bug by clicking. */
  .paneltab {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
    letter-spacing: 0.14em; color: oklch(0.62 0.01 80);
    background: transparent; border: 1px solid transparent; border-radius: 4px;
    padding: 4px 10px; cursor: pointer;
  }
  .paneltab:hover { color: oklch(0.86 0.01 85); }
  .paneltab.on {
    color: oklch(0.93 0.008 85);
    border-color: oklch(0.38 0.012 70);
    background: oklch(0.22 0.012 70);
  }
  /* The agent line on a processing row. Quiet, but always present - the point
     is that he can read who is on it without clicking. */
  .beltagent {
    margin: 4px 0 0; display: flex; align-items: center; gap: 8px;
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
    letter-spacing: 0.06em; color: oklch(0.60 0.01 80);
  }
  .beltagent b { color: oklch(0.84 0.01 85); font-weight: 500; letter-spacing: 0.1em; }
  .agentdot { width: 6px; height: 6px; border-radius: 50%; flex: none; }
  .agentsess { color: oklch(0.52 0.01 80); overflow-wrap: anywhere; }
  .agentlive {
    margin-left: auto; color: oklch(0.76 0.12 150); letter-spacing: 0.12em;
  }
  .agentlive::before {
    content: ""; display: inline-block; width: 5px; height: 5px; border-radius: 50%;
    background: oklch(0.70 0.14 150); margin-right: 5px; vertical-align: middle;
    animation: alive 2.4s ease-in-out infinite;
  }
  .tabdot {
    display: inline-block; margin-left: 7px; padding: 1px 5px; border-radius: 7px;
    background: oklch(0.55 0.14 25); color: oklch(0.98 0.01 85);
    font-size: 10px; letter-spacing: 0.08em;
  }
  /* [hidden] LOSES BY DEFAULT WHENEVER YOU ALSO SET display, and moving the
     declaration off the element does not save you: [hidden] is a browser
     stylesheet rule, so ANY author rule that sets display outranks it. Taking
     display:flex out of the tag and putting it in a class here changed nothing
     at all - the year chart still rendered underneath the classroom.

     Caught by the station, not by reading it, which is the only reason this note
     is accurate instead of confident. So the hiding is stated explicitly and
     wins on purpose. */
  .panelbody { flex: 1; min-height: 0; }
  .panelbody.yearpane { display: flex; flex-direction: column; gap: 6px; }
  .panelbody[hidden] { display: none !important; }
  .lessonrow {
    padding: 9px 0 10px; border-top: 1px solid oklch(0.22 0.012 70);
  }
  .lessonrow:first-child { border-top: none; }
  /* Unread is marked, not shouted. A classroom that alarms about every new idea
     trains you to stop reading it. */
  .freshlesson { border-left: 2px solid oklch(0.56 0.12 150); padding-left: 10px; }
  .newpip {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.12em; color: oklch(0.80 0.12 150);
  }

  /* "More" only appears when there IS more. It is set by script after measuring,
     never assumed - a permanent hint that sometimes lies is worse than none. */
  .morehint {
    display: none; align-items: center; gap: 6px; align-self: center;
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
    letter-spacing: 0.1em; color: oklch(0.66 0.10 80); padding-top: 2px;
  }
  .morehint.on { display: flex; }
  @keyframes nudge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
  .morehint svg { animation: nudge 2.2s ease-in-out infinite; }

  /* ---- CLICK TO EXPLAIN ----------------------------------------------------

     Everything drawn from a source can be opened, and says where that source is.
     Anything that can be opened has to LOOK like it can, or the feature is a
     secret: a hairline underline on hover, and a cursor. Quiet enough that the
     board still reads as a board.

     Deposits keep their own inline expansion, because that is what the operator
     asked for and what the seer already guards. Everything else - rail cells,
     intake doors, domain bands, footer numbers - shares ONE panel, which is what
     keeps one-open-at-a-time true by construction rather than by bookkeeping.
     Opening either closes the other, so there is one open thing on this board at
     any moment, whichever kind it is. */
  .xopen { cursor: pointer; }
  .xopen:hover { outline: 1px solid oklch(0.42 0.012 70); outline-offset: 2px; }
  g.xopen:hover { outline: none; }
  g.xopen:hover rect:first-of-type { stroke: oklch(0.72 0.10 85); }

  /* NOT A TRIGGER, said on the cell itself and not only in its panel. The rail
     draws one cell the scheduler does not hold, and it looked exactly like the
     twelve that it does. */
  .xflag {
    align-self: flex-start; padding: 1px 5px; border-radius: 2px;
    background: oklch(0.34 0.08 75); color: oklch(0.94 0.06 85);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9.5px; letter-spacing: 0.08em; white-space: nowrap;
  }

  #xback[hidden], #xwrap[hidden] { display: none !important; }
  /* The dim is a dim and nothing else - pointer-events:none, so a tap goes
     straight through to whatever is under it. With the backdrop catching clicks
     it took two taps to move from one element to the next: one to dismiss, one
     to open. On a wall display that reads as the board ignoring you. Now one tap
     anywhere swaps the panel, and one tap on empty board closes it. */
  #xback { position: absolute; inset: 0; z-index: 39; background: oklch(0.12 0.012 70 / 0.55); pointer-events: none; }
  #xwrap {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    z-index: 40; width: 860px; max-height: 860px; overflow-y: auto;
    background: oklch(0.175 0.012 70); border: 1px solid oklch(0.40 0.012 70);
    border-radius: 8px; box-shadow: 0 24px 70px oklch(0.08 0.01 70 / 0.7);
    scrollbar-width: thin; scrollbar-color: oklch(0.36 0.012 70) transparent;
  }
  #xclose {
    position: sticky; top: 0; float: right; margin: 10px 12px 0 0; z-index: 41;
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
    letter-spacing: 0.14em; color: oklch(0.70 0.01 80);
    background: oklch(0.22 0.012 70); border: 1px solid oklch(0.36 0.012 70);
    border-radius: 4px; padding: 4px 10px; cursor: pointer;
  }
  #xclose:hover { color: oklch(0.95 0.008 85); border-color: oklch(0.52 0.012 70); }

  .xpanel { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 14px; }
  .xhead { display: flex; flex-direction: column; gap: 4px; }
  .xtitle {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 20px;
    letter-spacing: 0.12em; color: oklch(0.95 0.008 85);
  }
  .xkind { font-size: 14px; color: oklch(0.68 0.01 80); line-height: 1.4; }

  /* THE DISAGREEMENT IS THE HEADLINE. Not a footnote, not an asterisk - the
     asterisk is exactly what this replaces, and it explained nothing for as long
     as it existed. Where two sources disagree the panel says so first, shows
     both, and does not pick a winner. */
  .xhead-line {
    margin: 0; padding: 12px 14px; border-radius: 5px; font-size: 15px;
    line-height: 1.5; border-left: 3px solid;
  }
  .xtone {
    display: block; font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px; letter-spacing: 0.18em; margin-bottom: 5px;
  }
  .x-disagree { background: oklch(0.24 0.05 25); border-left-color: oklch(0.66 0.15 25); color: oklch(0.94 0.03 30); }
  .x-disagree .xtone { color: oklch(0.82 0.13 25); }
  .x-gap { background: oklch(0.24 0.04 75); border-left-color: oklch(0.68 0.12 75); color: oklch(0.94 0.03 80); }
  .x-gap .xtone { color: oklch(0.84 0.11 75); }
  .x-ok { background: oklch(0.21 0.03 150); border-left-color: oklch(0.56 0.11 150); color: oklch(0.90 0.02 150); }
  .x-ok .xtone { color: oklch(0.76 0.11 150); }

  /* TWO HALVES THAT MUST NEVER LOOK ALIKE. Purpose is authored and changes
     rarely; wiring is generated on every build. A reader who cannot tell them
     apart will read the authored half as live, which is the drift this whole
     feature exists to catch. */
  .xhalf { display: flex; flex-direction: column; gap: 6px; }
  .xhalflabel {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 10px;
    letter-spacing: 0.16em; color: oklch(0.56 0.01 80);
    border-bottom: 1px solid oklch(0.26 0.012 70); padding-bottom: 5px;
  }
  .xwhy {
    margin: 2px 0 0; font-size: 15px; line-height: 1.55;
    color: oklch(0.88 0.01 85); font-style: italic;
    border-left: 2px solid oklch(0.40 0.03 85); padding-left: 12px;
  }
  .xrow {
    display: grid; grid-template-columns: 210px minmax(0, 1fr);
    gap: 2px 14px; padding: 7px 0; border-top: 1px solid oklch(0.22 0.012 70);
  }
  .xrow:first-of-type { border-top: none; }
  .xlabel {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px;
    letter-spacing: 0.09em; color: oklch(0.62 0.01 80); padding-top: 2px;
  }
  .xvalue { font-size: 14.5px; line-height: 1.45; color: oklch(0.92 0.008 85); overflow-wrap: anywhere; }
  .xnote { grid-column: 2; font-size: 12.5px; line-height: 1.45; color: oklch(0.70 0.01 80); }
  /* A FACT THE BOARD CANNOT OBTAIN IS DRAWN, NOT OMITTED. In its own colour, so
     the eye finds the gaps - an omitted row reads as an answered question. */
  .xmissing {
    font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px;
    letter-spacing: 0.12em; color: oklch(0.72 0.10 75); font-style: normal;
  }
  .xsource {
    grid-column: 2; font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10.5px; letter-spacing: 0.04em; color: oklch(0.52 0.01 80);
    overflow-wrap: anywhere;
  }
  .xhalf > .xsource { grid-column: auto; padding-left: 14px; }
  .xdisagree { background: oklch(0.21 0.03 25); border-radius: 3px; padding-left: 8px; padding-right: 8px; }
  .xdisagree .xvalue { color: oklch(0.90 0.08 30); }

  /* The same panel language inside an open deposit, at the smaller scale that
     column allows. One stylesheet, one vocabulary - a second look would become a
     second standard, and then only one of them would keep its sources. */
  .xinrow { margin: 4px 0 8px; }
  .xinrow .xrow { grid-template-columns: 170px minmax(0, 1fr); padding: 5px 0; }
  .xinrow .xvalue { font-size: 13.5px; }
</style>
</head>
<body data-grid-ms="${GRID}" data-pulse-red="${PULSE_RED}" data-repo="${esc(REPO_ID)}">
<script>
  // Every request this page makes names its subject, so one server can serve
  // one board per repo and never confuse their belts. Defined first, before any
  // other script on the page, because the read-receipt script fetches on load.
  window.BOARD_REPO = document.body.getAttribute('data-repo') || '';
  window.api = function (p) { return p + (p.indexOf('?') >= 0 ? '&' : '?') + 'repo=' + encodeURIComponent(window.BOARD_REPO); };
  // The repo picker: a button and a list of links (not a native select, which
  // would not open inside the scaled stage). Opens on the button, closes on a
  // pick, on a click anywhere else, or on Escape. The links do the navigating.
  document.addEventListener('DOMContentLoaded', function () {
    var pick = document.querySelector('[data-repo-pick]');
    if (!pick) return;
    var btn = pick.querySelector('[data-repo-toggle]');
    var menu = pick.querySelector('[data-repo-menu]');
    function close() { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.setAttribute('aria-haspopup', 'listbox');
    close();
    btn.addEventListener('click', function (ev) { ev.stopPropagation(); menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });
    menu.addEventListener('click', function (ev) { ev.stopPropagation(); });
    document.addEventListener('click', function () { if (!menu.hidden) close(); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !menu.hidden) close(); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('mouseenter', function () { if (a.style.background === 'transparent') a.style.background = 'oklch(0.22 0.012 70)'; });
      a.addEventListener('mouseleave', function () { if (a.style.background === 'oklch(0.22 0.012 70)') a.style.background = 'transparent'; });
    });
  });
</script>

<div id="disconnected" hidden style="position:fixed; top:0; left:0; right:0; z-index:50; background:oklch(0.42 0.14 25); color:oklch(0.97 0.01 85); font-family:${mono}; font-size:15px; letter-spacing:0.1em; text-align:center; padding:10px 14px"></div>
<div id="viewport" style="position:fixed; inset:0; overflow:hidden; background:oklch(0.15 0.012 70)">
<div id="stage" style="position:absolute; left:50%; top:50%; width:1920px; height:1080px; transform-origin:center center; transform:translate(-50%,-50%); background:oklch(0.15 0.012 70); box-sizing:border-box; padding:30px 34px; display:flex; flex-direction:column; gap:20px; font-family:'Space Grotesk',system-ui,sans-serif; color:oklch(0.95 0.008 85)">

  <div style="display:flex; flex-wrap:wrap; align-items:center; gap:26px">
    <svg viewBox="0 0 48 48" width="44" height="44" fill="none">
      <rect x="14" y="12" width="20" height="24" rx="2" style="stroke:oklch(0.95 0.008 85); stroke-width:2"></rect>
      <path d="M19 19V29" style="stroke:oklch(0.95 0.008 85); stroke-width:2; opacity:0.45; animation:coreBeat 3.2s ease-in-out infinite"></path>
      <path d="M24 19V29" style="stroke:oklch(0.95 0.008 85); stroke-width:2; opacity:0.45; animation:coreBeat 3.2s ease-in-out 0.7s infinite"></path>
      <path d="M29 19V29" style="stroke:oklch(0.95 0.008 85); stroke-width:2; opacity:0.45; animation:coreBeat 3.2s ease-in-out 1.4s infinite"></path>
      <path d="M5 18H14M5 24H14M5 30H14" style="stroke:oklch(0.74 0.13 55); stroke-width:2"></path>
      <path d="M34 18H43M34 24H43M34 30H43" style="stroke:oklch(0.74 0.13 195); stroke-width:2"></path>
    </svg>
    <div style="display:flex; flex-direction:column; gap:3px">
      <span style="font-family:${mono}; font-size:13px; letter-spacing:0.16em; color:oklch(0.58 0.01 80); line-height:1">LIVING FACTORY</span>
      <span style="font-size:34px; font-weight:600; letter-spacing:-0.02em; line-height:1.05">${esc(REPO)}</span>
      <!-- THE OBSERVABLE. Operator, 2026-09-14: "wire a dropdown under the
           Repo Label in the header to quickly select a new repo for observable:
           All Repos, Script Factory, Telechurch, Alliance, etc." Every repo in
           the ecosystem map is listed; only a WIRED one - declaring triggers the
           scheduler ticks - can be chosen, and the rest say why not. "All Repos"
           is listed and disabled until a combined board exists: a control that
           implies a view the server does not keep would be the board lying in
           a new place. Choosing one navigates to ?repo=<id>; every fetch the
           page makes carries the same id (see api()). -->
      ${
        // NOT A NATIVE <select>. The first version was one, and the operator
        // could not open it: "I click and it seems impotent." The board lives in
        // #stage, which is scaled with a CSS transform to fit the screen, and a
        // native select's popup inside a transformed box is a known Chromium
        // soft spot - it fails to open, or opens and closes. So this is the
        // board's own control: a button naming the current subject, and a list
        // of plain links, one per repo. A link always navigates, under any
        // transform, and it draws in the board's own type on the board's own
        // dark ground instead of a system widget. Wired repos are links; the
        // rest say why they are not; ALL REPOS links to the server's combined
        // page (?repo=__all), one tile per repo, filled live by that page.
        D.repoList.length
          ? `<div data-repo-pick="1" style="position:relative; margin-top:4px; max-width:300px">
        <button type="button" data-repo-toggle="1" title="which repo this board observes · click to choose another" style="display:flex; align-items:center; gap:10px; width:100%; font-family:${mono}; font-size:12px; letter-spacing:0.08em; color:oklch(0.86 0.01 80); background:oklch(0.16 0.012 70); border:1px solid oklch(0.32 0.012 70); border-radius:4px; padding:5px 10px; cursor:pointer; text-align:left"><span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${esc(((D.repoList.find((r) => r.current) || {}).name || REPO).toUpperCase())}</span><span style="color:oklch(0.62 0.01 80)">▾</span></button>
        <div data-repo-menu="1" hidden style="position:absolute; left:0; top:calc(100% + 4px); z-index:50; min-width:100%; background:oklch(0.17 0.012 70); border:1px solid oklch(0.32 0.012 70); border-radius:4px; padding:4px; box-shadow:0 8px 24px oklch(0 0 0 / 0.5); font-family:${mono}; font-size:12px; letter-spacing:0.06em">
          <a href="/?repo=__all" style="display:flex; justify-content:space-between; gap:14px; padding:6px 10px; border-radius:3px; color:oklch(0.80 0.01 80); text-decoration:none; white-space:nowrap; background:transparent">ALL REPOS<span style="color:oklch(0.62 0.01 80)">${D.repoList.filter((r) => r.wired).length} wired</span></a>
          ${D.repoList
            .map((r) =>
              r.wired
                ? `<a href="/?repo=${encodeURIComponent(r.id)}" style="display:flex; justify-content:space-between; gap:14px; padding:6px 10px; border-radius:3px; color:${r.current ? "oklch(0.92 0.01 85)" : "oklch(0.80 0.01 80)"}; text-decoration:none; white-space:nowrap; background:${r.current ? "oklch(0.24 0.012 70)" : "transparent"}">${esc(r.name.toUpperCase())}${r.current ? `<span style="color:oklch(0.66 0.14 150)">●</span>` : ""}</a>`
                : `<span style="display:block; padding:6px 10px; color:oklch(0.48 0.01 80); white-space:nowrap">${esc(r.name.toUpperCase())} — ${r.exists ? "not wired" : "not on this host"}</span>`,
            )
            .join("\n          ")}
        </div>
      </div>`
          : ""
      }
      <span style="font-family:${mono}; font-size:14px; letter-spacing:0.12em; color:oklch(0.62 0.01 80)">${D.wiredRepos} OF ${esc(D.repos)} REPOS WIRED &middot; <span style="color:${D.hostWarn ? "oklch(0.82 0.11 25)" : "oklch(0.62 0.01 80)"}">${D.host ? "HOST UP " + live("uph", D.hostBoot, D.hostUpH) + (D.hostWarn ? " · RESTART QUEUED" : "") : esc(D.hostLine)}</span></span>
    </div>

    <div title="${esc(D.liveness.note)}" style="display:flex; align-items:center; gap:12px; padding:10px 18px; border:1px solid oklch(0.32 0.05 ${D.liveness.hue}); border-radius:4px">
      <span style="width:12px; height:12px; border-radius:50%; background:oklch(0.66 0.14 ${D.liveness.hue})${D.liveness.running ? "; animation:alive 3s ease-in-out infinite" : ""}"></span>
      <span style="font-family:${mono}; font-size:17px; letter-spacing:0.14em; color:oklch(0.80 0.10 ${D.liveness.hue})">${D.liveness.label}</span>
    </div>

    <!-- CAN HE STOP WATCHING. The one number that answers it, next to the lamp,
         because ALIVE says the factory is running and this says whether its
         judgement has been worth anything. "Held" means not later undone - the
         only claim the belt can actually support - and the words under it say
         exactly that, so the number cannot be read as more than it is. -->
    <div title="Work the factory took to an end state, and how much of it has not since been undone. Still standing is not the same as right - it is what has survived. The board cannot yet tell which of these were closed while you were away; that is a known gap and it is on the belt." style="display:flex; align-items:center; gap:14px; padding:10px 18px; border:1px solid oklch(0.30 0.012 70); border-radius:4px">
      <div style="display:flex; flex-direction:column; gap:2px">
        <span style="font-family:${mono}; font-size:11px; letter-spacing:0.16em; color:oklch(0.56 0.01 80)">CLOSED BY THE FACTORY</span>
        <span style="font-family:${mono}; font-size:17px; letter-spacing:0.06em; color:oklch(0.86 0.008 85)">${D.trust.held}<span style="color:oklch(0.52 0.01 80)"> of </span>${D.trust.decisions}<span style="color:oklch(0.52 0.01 80)"> still standing</span></span>
      </div>
      <div style="display:flex; flex-direction:column; gap:2px; padding-left:14px; border-left:1px solid oklch(0.26 0.012 70)">
        <span style="font-family:${mono}; font-size:11px; letter-spacing:0.16em; color:${D.trust.reversed ? "oklch(0.74 0.12 25)" : "oklch(0.56 0.01 80)"}">UNDONE</span>
        <span style="font-family:${mono}; font-size:17px; color:${D.trust.reversed ? "oklch(0.84 0.11 25)" : "oklch(0.70 0.01 80)"}">${D.trust.reversed}</span>
      </div>
      ${D.trust.his ? `<div style="display:flex; flex-direction:column; gap:2px; padding-left:14px; border-left:1px solid oklch(0.26 0.012 70)">
        <span style="font-family:${mono}; font-size:11px; letter-spacing:0.16em; color:oklch(0.56 0.01 80)">LEFT TO YOU BY LAW</span>
        <span style="font-family:${mono}; font-size:17px; color:oklch(0.70 0.01 80)">${D.trust.his}</span>
      </div>` : ""}
    </div>

    <div style="display:flex; align-items:center; gap:12px; margin-left:auto">
${chipBlock("body", "UI &middot; ANGULAR", 55, D.body)}
${chipBlock("mind", "DATABASE &middot; SUPABASE", 195, D.mind)}
${chipBlock("spirit", "SIGNAL &middot; CLOUDFLARE", 310, D.spirit)}
    </div>

    <div style="display:flex; align-items:flex-end; gap:16px; margin-left:48px">
      <div style="display:flex; flex-direction:column; gap:2px">
        <span style="font-family:${mono}; font-size:21px; font-weight:500; letter-spacing:0.14em; line-height:1; color:oklch(0.74 0.13 195)">${esc(D.dateLine)}</span>
        <span id="clock" style="font-family:${mono}; font-size:44px; font-weight:500; letter-spacing:0.02em; line-height:1">--:--:--</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:3px; font-family:${mono}; font-size:14px; letter-spacing:0.1em; color:oklch(0.62 0.01 80)">
        <span>CYCLE ${D.cycle}</span>
        <span>${live("up", D.upSince, D.uptime)}</span>
      </div>
    </div>
  </div>

  <div class="xopen" data-explain="rail:all" title="click for what the rail is, and what it draws that the scheduler does not hold" style="display:grid; grid-template-columns:repeat(${D.cycles.length}, minmax(0,1fr)); gap:12px; background:oklch(0.175 0.012 70); border:1px solid oklch(0.26 0.012 70); border-radius:6px; padding:11px 14px">
${D.cycles
    .map(
      // The asterisk explained nothing for as long as it existed. It still marks
      // the cell, and now the cell opens and says which two numbers disagree,
      // and why - or that nothing in the data explains it, which is a finding.
      // The two facts behind the countdown ride on the cell - last run and
      // interval - so the page can keep counting on the wall clock between
      // builds. Without them the number under the bar was a sentence written
      // once an hour and read as live: "5m remaining" at 22:38, on a file built
      // at 21:45, beside a clock that was right to the second.
      (c) => `    <div class="xopen" data-explain="rhythm:${esc(c.id)}" data-cycle-id="${esc(c.id)}" data-cycle-last="${c.last || ""}" data-cycle-every="${c.intervalMs}" data-cycle-grid="${c.grid ? 1 : 0}" title="every ${esc(c.pace)}${c.tight ? " — tightened after a fault" : ""} · click to see how it is wired" style="display:flex; flex-direction:column; gap:5px; min-width:0">
      <!-- THE STACK, top to bottom - operator, 2026-09-13: "1. Progress Bar
           2. Colored (Time)  Total Time - both on same line. 3. Stack Label
           4. Any other subtext." The bar leads because it is the thing a
           glance reads; the countdown wears the bar's own colour so the two
           are read as one fact; the total sits opposite it as the yardstick;
           the name is underneath, where a label goes. -->
      <div style="height:5px; background:oklch(0.24 0.012 70); border-radius:3px; overflow:hidden">
        <div data-live="bar" style="height:100%; width:${c.pct.toFixed(1)}%; background:${c.hue}; border-radius:3px"></div>
      </div>
      <div style="display:flex; align-items:baseline; gap:6px; min-width:0">
        <span data-live="when" style="font-family:${mono}; font-size:13px; font-weight:500; color:${c.hue}; white-space:nowrap">${esc(c.when)}</span>
        <span style="font-family:${mono}; font-size:11px; color:${c.tight ? "oklch(0.80 0.11 25)" : "oklch(0.52 0.01 80)"}; margin-left:auto; white-space:nowrap">${esc(c.pace)}${c.tight ? " *" : ""}</span>
      </div>
      <div style="display:flex; align-items:center; gap:6px; min-width:0">
        ${
          // THE BEAT LAMP - operator, 2026-09-14: "check if the ping is alive
          // ... and report a green button beside pulse to show active."
          //
          // Lit from the STAMP, not from Task Scheduler. A registered task
          // proves intent; a stamp within the last two beats proves the fact,
          // and the first without the second is a task failing silently - the
          // exact case a lamp exists to catch. The page reads pulse.lastRunAt
          // from /schedule every thirty seconds and colours this: green inside
          // two beats, amber at one missed, red at three (the same fifteen
          // minutes autonomy-check calls an outage), grey when the page cannot
          // reach the server and therefore does not know. Grey is the default;
          // green has to be earned every thirty seconds.
          c.grid ? `<span data-live="beat" title="pulse: not yet checked" style="width:8px; height:8px; border-radius:50%; background:oklch(0.45 0.01 80); flex:none; display:inline-block"></span>` : ""
        }
        <span style="font-family:${mono}; font-size:12px; letter-spacing:0.08em; color:oklch(0.80 0.01 80); overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${esc(c.name).toUpperCase()}</span>
      </div>
      <!-- ON ITS OWN LINE, NOT BESIDE THE NAME. The first version put this badge
           inside the name span, which is clipped to the cell width - so the badge
           pushed "HOST RESTART" into an ellipsis and then rendered off the end of
           its own cell. Present in the markup, invisible on screen, which is the
           exact failure this board has a station for. Measured, moved, measured
           again. -->
      ${c.policy ? `<span class="xflag">NOT A TRIGGER</span>` : ""}
    </div>`,
    )
    .join("\n")}
  </div>

  <div style="display:grid; grid-template-columns:minmax(0,1fr) 700px minmax(0,1fr); gap:20px; flex:1; min-height:0">

    <div style="background:oklch(0.185 0.012 70); border:1px solid oklch(0.28 0.012 70); border-radius:6px; padding:16px 18px; display:flex; flex-direction:column; gap:10px; min-height:0; overflow:hidden">
      <div style="display:flex; align-items:center; gap:14px">
        <span style="width:9px; height:9px; border-radius:50%; background:oklch(0.66 0.14 150); animation:alive 3s ease-in-out infinite; flex:none"></span>
        <span style="font-family:${mono}; font-size:13px; letter-spacing:0.16em; color:oklch(0.62 0.01 80)">INCOMING</span>
        <!-- THE AUTORUN SWITCH. Operator, 2026-09-21: "an AutoRun switch on the
             incoming section that will flip all to being cued and pulled to the
             board automatically. but when off its manual by the individual
             switch. Automatic *|---* Manual"
             It renders as one track with the live position marked, because the
             two words are the whole state and a checkbox would make the reader
             work out which way is which. It starts nothing itself - it writes a
             setting the scheduled intake worker reads, and MANUAL is what every
             unknown or missing value means. -->
        <span id="autorun" title="Automatic: accepted work is picked up and started on its own, up to three at a time. Manual: nothing starts until you mark each one Go." style="display:inline-flex; align-items:center; gap:7px; margin-left:12px; cursor:pointer; user-select:none; font-family:${mono}; font-size:11px; letter-spacing:0.08em">
          <span id="autorun-auto" style="color:oklch(0.50 0.01 80)">AUTOMATIC</span>
          <span id="autorun-track" style="position:relative; width:34px; height:14px; border-radius:7px; border:1px solid oklch(0.36 0.012 70); background:oklch(0.18 0.012 70); flex:none">
            <span id="autorun-knob" style="position:absolute; top:1px; left:21px; width:10px; height:10px; border-radius:50%; background:oklch(0.62 0.01 80); transition:left 140ms, background 140ms"></span>
          </span>
          <span id="autorun-manual" style="color:oklch(0.86 0.01 80)">MANUAL</span>
        </span>
        <span style="font-family:${mono}; font-size:13px; color:oklch(0.62 0.01 80); margin-left:auto; white-space:nowrap">${D.incoming.length} in flight${D.forYouCount ? ` &middot; <span style="color:oklch(0.82 0.11 25)">${D.forYouCount} for you</span>` : ""}</span>
      </div>
      <!-- TWO ROWS OF CHIPS, BECAUSE THERE ARE TWO QUESTIONS.
           "What needs doing" is a question about KIND; "what is happening to it"
           is a question about STATE. Folding them into one strip would force a
           record to be one or the other, which is the collapse this whole change
           undoes. Each row filters independently and they combine, so he can ask
           for deposits that have gone stale without asking twice.

           Operator, 2026-09-12: "Add kind to the legend filter so he can see only
           what needs doing, or only what needs reading." -->
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; font-family:${mono}; font-size:11px; color:oklch(0.56 0.01 80)">
        <span class="kindpick on" data-pick="all" style="cursor:pointer; padding:2px 7px; border:1px solid oklch(0.34 0.012 70); border-radius:10px; letter-spacing:0.08em">ALL ${D.incoming.length}</span>
${["contract", "deposit", "decision"]
  .filter((k) => D.kindCounts[k])
  .map(
    (k) =>
      `        <span class="kindpick" data-pick="${k}" title="${esc(KIND_WORD[k])}" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:2px 7px; border:1px solid transparent; border-radius:10px">${KIND_ICONS[k]}${D.kindCounts[k]}<span style="letter-spacing:0.08em; opacity:0.75">${k.toUpperCase()}</span></span>`,
  )
  .join("\n")}
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; padding-bottom:4px; font-family:${mono}; font-size:11px; color:oklch(0.56 0.01 80)">
        <span class="statpick on" data-pick="all" style="cursor:pointer; padding:2px 7px; border:1px solid oklch(0.34 0.012 70); border-radius:10px; letter-spacing:0.08em">ALL ${D.incoming.length}</span>
${["gear", "calendar", "clock", "triage", "stale", "blocked", "eye", "hourglass"]
  .filter((k) => D.statusCounts[k])
  .map(
    (k) =>
      `        <span class="statpick" data-pick="${k}" title="${esc(STATUS_WORD[k])}" style="cursor:pointer; display:flex; align-items:center; gap:5px; padding:2px 7px; border:1px solid transparent; border-radius:10px">${ICONS[k]}${D.statusCounts[k]}</span>`,
  )
  .join("\n")}
      </div>
      <div class="scrollcol" style="display:flex; flex-direction:column; gap:2px; flex:1; min-height:0; overflow-x:hidden">${pulseSlot("incoming")}${incomingRows}
      </div>
      <div class="morehint"><span>MORE</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M6 9l6 6 6-6" style="stroke:currentColor; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round"></path></svg></div>
    </div>

    <div style="background:oklch(0.185 0.012 70); border:1px solid oklch(0.28 0.012 70); border-radius:6px; padding:12px 14px 10px; min-height:0; overflow:hidden; display:flex; flex-direction:column; gap:8px">

      <div style="position:relative; flex:0 0 auto; min-height:0">
        ${boardSvg()}
        <!-- TWO HEMISPHERES INSIDE THE BELT: the count on the left, the words on
             the right.

             Operator, 2026-09-11: "fix the text inside the belt exceeding the
             bounds, reduce size or wrap. You can split the space inside the belt
             into two, left and right hemisphere, with the count on the left and
             the text summaries on the right, so things aren't so clustered."

             It was genuinely overflowing, not merely tight: the status line
             measured 646 to 1274 against a loop interior of 704 to 1215, so it
             ran out through the conveyor on BOTH sides. One centred column had
             to be as wide as its longest sentence, and that sentence grows every
             time the belt has more to say.

             Split in two, each half has a job and neither fights the other: a
             number needs width once, prose needs width every line. The block is
             held to the loop's own interior width - COMPUTED from TRACK, not
             typed as a literal, because the literal was right until the track
             moved and then put five lines of text across the conveyor. -->
        <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none">
          <div style="width:${BELT_INTERIOR_PCT.toFixed(1)}%; display:flex; align-items:center; gap:26px">

            <div style="flex:0 0 auto; display:flex; flex-direction:column; align-items:center; min-width:0">
              <!-- The big number is what is ON THE BELT, which is what the
                   drawing beside it shows. It used to print the count of items
                   ADDRESSED to a domain while the belt carried none of them -
                   two numbers for two different things, one label between them.
                   Zero is a stark thing to put in this type and it is the true
                   one.

                   SIZED BY HOW MANY DOMAINS ARE WAITING, because this column
                   has to fit inside the hole in the middle of the conveyor and
                   the domain list underneath it grows. At 88px with a fourth
                   domain the column needed 219px in a 197px interior, and the
                   overflow printed SPIRIT straight across the bottom rail. A
                   fourth domain is not exotic - "architecture" is tier 2 of the
                   plan's own seven - so the number yields rather than the list
                   being silently cut. -->
              <span style="font-size:${D.waitingByDomain.length > 3 ? 68 : 88}px; font-weight:500; line-height:0.95; letter-spacing:-0.02em; color:${D.onBelt.length ? "oklch(0.95 0.008 85)" : "oklch(0.62 0.01 80)"}">${D.onBelt.length}</span>
              <span style="font-family:${mono}; font-size:13px; letter-spacing:0.14em; color:oklch(0.56 0.01 80); margin-top:4px">ON THE BELT</span>

              <!-- The colour key, moved off the conveyor.
                   Operator, 2026-09-12: "Remove the body mind spirit colour
                   legend off the belt and place it on the left side of the belt
                   in the available space."
                   It was three coloured bars sitting ON the top rail, above the
                   BODY / MIND / SPIRIT labels - decoration occupying the track
                   itself, on a diagram whose entire subject is what moves along
                   that track. Here it sits under the count, in space that was
                   empty, and it now carries each domain's load as well as its
                   colour, which the bars never did. -->
              <span style="font-family:${mono}; font-size:11px; letter-spacing:0.16em; color:oklch(0.56 0.01 80); margin-top:${D.waitingByDomain.length > 3 ? 8 : 16}px">WAITING, BY DOMAIN${D.waitingByDomain.length ? ` &middot; ${D.waitingByDomain.reduce((a, w) => a + w.count, 0)}` : ""}</span>
              <div style="display:flex; flex-direction:column; gap:${D.waitingByDomain.length > 3 ? 2 : 5}px; margin-top:6px; align-items:flex-start">
                ${
                  D.waitingByDomain.length
                    ? D.waitingByDomain
                        .map(
                          (w) => `
                <div style="display:flex; align-items:center; gap:8px; font-family:${mono}; font-size:12px; letter-spacing:0.1em; color:oklch(0.66 0.01 80)">
                  <span style="width:16px; height:5px; border-radius:3px; background:${w.color}; flex:none"></span>
                  <span style="min-width:62px">${esc(w.dim.toUpperCase())}</span>
                  <span style="color:oklch(0.86 0.01 85)">${w.count}</span>
                </div>`,
                        )
                        .join("")
                    : `<span style="font-family:${mono}; font-size:12px; color:oklch(0.52 0.01 80)">nothing waiting</span>`
                }
              </div>
            </div>

            <div style="flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:5px; border-left:1px solid oklch(0.26 0.012 70); padding-left:24px">
              <span title="${esc(D.beltWhyFull)}" style="font-family:${mono}; font-size:16px; letter-spacing:0.16em; color:${D.beltState === "RUNNING" ? "oklch(0.72 0.13 150)" : D.beltState === "STALLED" ? "oklch(0.80 0.11 25)" : D.beltState === "WAITING" ? "oklch(0.80 0.12 75)" : D.beltState === "UNJUDGED" ? "oklch(0.80 0.12 75)" : "oklch(0.62 0.01 80)"}">${D.beltState === "RUNNING" ? "CIRCULATING" : D.beltState === "STALLED" ? "BELT STALLED" : D.beltState === "WAITING" ? "NOBODY IS WORKING" : D.beltState === "UNJUDGED" ? "NOTHING JUDGED YET" : "BELT IDLE"}</span>
              <span title="${esc(D.beltWhyFull)}" style="font-family:${mono}; font-size:14px; line-height:1.4; letter-spacing:0.02em; color:oklch(0.62 0.01 80); overflow-wrap:anywhere">${beltWhyHtml()}</span>
              <!-- THE THREE KINDS, EACH COUNTED WHERE IT BELONGS.
                   Contracted work is the only number that means somebody owes
                   something; the triage queue is the number that says how much
                   nobody has judged; held is his. They are printed as three lines
                   rather than summed, because a single "open" figure is what let
                   a notification inflate the factory's own idea of its backlog.
                   The classes are how the seer reads these off the rendered page
                   and checks them against the belt - it reads the text, as a
                   person does, never a value this code set. -->
              <span class="opencount" style="font-family:${mono}; font-size:15px; letter-spacing:0.04em; color:oklch(0.72 0.13 150)">${D.openCount} contracted</span>
              ${D.triageCount ? `<span class="triagecount" style="font-family:${mono}; font-size:15px; letter-spacing:0.04em; color:oklch(0.80 0.12 75)">${D.triageCount} awaiting triage</span>` : ""}
              ${D.heldCount ? `<span style="font-family:${mono}; font-size:15px; letter-spacing:0.04em; color:oklch(0.80 0.11 25)">+${D.heldCount} held for you</span>` : ""}
              <span style="font-family:${mono}; font-size:15px; letter-spacing:0.04em; color:oklch(0.72 0.13 150)">&#10003; ${D.closedCount} resolved</span>
              ${D.unplaced ? `<span style="font-family:${mono}; font-size:13px; line-height:1.35; color:oklch(0.82 0.11 25); overflow-wrap:anywhere">+${D.unplaced} on no carrier and not held &mdash; a leak</span>` : ""}
            </div>

          </div>
        </div>
      </div>

      <!-- CLASSROOM, HORIZON, HISTORY - in that order, and the order is the
           argument.

           The year chart used to own this space outright. By his own rule the
           past is the automation's job and his attention belongs to the path
           ahead, so history is no longer the default view of anything. It is
           still here, one click away, because it answers real questions - it
           just stops being the first thing the room sees.

           LEARNED opens by default. On a wall display nobody clicks, so the
           default view IS the board for most purposes, and what he asked to see
           by default is what he did not know before. -->
      <div style="flex:1 1 auto; min-height:0; display:flex; flex-direction:column; gap:8px; border-top:1px solid oklch(0.24 0.012 70); padding-top:8px">

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap">
          <!-- PROCESSING first, because it is the only tab describing something
               happening right now. Operator: "add to the left of Learned
               Processing as a tab which lists all the deposits that are actually
               on the conveyor." -->
          <button class="paneltab on" data-panel="processing">PROCESSING${D.onBelt.length ? ` <span class="tabdot" style="background:oklch(0.50 0.10 250)">${D.onBelt.length}</span>` : ""}</button>
          <!-- NOTES. A reading area, not a queue. Operator, 2026-09-12: "don't put
               notifications on the belt, only contracts to be processed", and
               "you can mark notifications read by dimming or green and then
               white."

               The unread count is on the tab because that is the only thing about
               a note that is ever urgent, and because this pane is one click away
               rather than in front of him - a note with nobody looking at it is
               the one failure mode a reading area has. -->
          <button class="paneltab" data-panel="notes">NOTES${D.unreadNotes ? ` <span class="tabdot" style="background:oklch(0.66 0.14 150); color:oklch(0.16 0.01 70)">${D.unreadNotes} UNREAD</span>` : D.notes.length ? ` <span class="tabdot" style="background:oklch(0.34 0.012 70)">${D.notes.length}</span>` : ""}</button>
          <button class="paneltab" data-panel="learned">LEARNED${D.newCount ? ` <span class="tabdot">${D.newCount} NEW</span>` : ""}</button>
          <!-- PLANS. Operator, 2026-09-21: "I don't think the board has a plan
               thing. It just has intake. Maybe we can use PL for" - the mark is
               PL, and it is a two-letter code rather than a fifth kind glyph on
               purpose. A kind is a property of a BELT record; a plan never
               rides the belt, so giving it a kind word would have forced it
               into the one vocabulary that decides what counts as owed work. -->
          <button class="paneltab" data-panel="plans">PLANS${D.plans.live ? ` <span class="tabdot" style="background:oklch(0.52 0.12 300)">${D.plans.live}</span>` : ""}</button>
          <button class="paneltab" data-panel="horizon">HORIZON</button>
          <button class="paneltab" data-panel="year">${year}</button>
          <button id="markread" class="paneltab" style="margin-left:auto" title="Mark everything on this board as read, so next time only what is new stands out">MARK ALL READ</button>
        </div>

        <!-- PROCESSING ---------------------------------------------------- -->
        <div class="panelbody scrollcol" data-panel="processing">
          <!-- THE SESSIONS FIRST. Operator, 2026-09-14: "so i should be able to
               see this current chat show up in processing." A live session is
               in process whatever the belt has been told about it; the page
               refreshes these rows from /sessions (renderSessions). -->
          <div data-session-rows="1">${D.sessionBelt.sessions.map((s) => sessionRow(s)).join("")}</div>
          ${
            D.onBelt.length
              ? D.onBelt
                  .map(
                    (e) => `
          <div class="feedrow beltrow" data-rid="${esc(e.rid)}" data-handle="${esc(e.handle)}" style="display:grid; grid-template-columns:76px 56px minmax(0,1fr) 92px; align-items:center; gap:10px; padding:9px 0; border-top:1px solid oklch(0.22 0.012 70)">
            <span style="display:flex; align-items:center; gap:6px; font-family:${mono}; font-size:14px; font-weight:500; letter-spacing:0.04em; color:${e.color}">${e.via && e.via !== "unknown" ? DOOR_ICON_HTML(e.via, DOOR_INK[e.via], 16) : ""}${esc(e.handle)}</span>
            <span style="font-family:${mono}; font-size:15px; color:oklch(0.62 0.01 80)">${esc(e.time)}</span>
            <span class="rowtext" style="font-size:16px; line-height:1.35; color:oklch(0.90 0.008 85)">${esc(e.text)}</span>
            <span style="font-family:${mono}; font-size:13px; color:oklch(0.76 0.12 75); text-align:right; white-space:nowrap">${live("since", e.at, e.waited)}</span>
            <!-- Who is actually on it, on the row, without opening anything.
                 Operator: "once on the processing list it should be appended
                 with the agent information and the chat information so I can
                 reference it." A card on the belt is a claim that somebody is
                 working; the claim is worth nothing if he cannot go and look. -->
            <p class="beltagent" style="grid-column:1 / -1">
              <span class="agentdot" style="background:${e.color}"></span>
              <b>${esc(e.agentLabel || "agent")}</b>
              <span class="agentsess">${esc(e.agent)}</span>
              <span class="agentlive">live</span>
            </p>
            <div class="rowdetail">
              <p class="rowclaim">${esc(e.full)}</p>
              ${e.why ? `<p class="rowwhy">${esc(e.why)}</p>` : ""}
              ${e.advice && e.advice.recommend ? `<p class="rowrec"><span class="reclabel">DO THIS</span>${esc(e.advice.recommend)}</p>` : `<p class="rowrec norec"><span class="reclabel">NO RECOMMENDATION YET</span>nothing has worked out what to do about this</p>`}
              ${recordWiringHtml(e, e.life)}
              <p class="rowid"><b style="color:${e.color}; letter-spacing:0.1em">${esc(e.handle)}</b> &middot; ${esc(e.dim)} &middot; ${esc(e.rid)} &middot; on the belt ${live("since", e.at, e.waited)} &middot; worked by ${esc(e.agentLabel || "agent")} in session ${esc(e.agent)}</p>
            </div>
          </div>`,
                  )
                  .join("")
              : `<p data-belt-empty="1"${D.sessionBelt.sessions.length ? " hidden" : ""} style="font-family:${mono}; font-size:14px; color:oklch(0.58 0.01 80); line-height:1.6">The conveyor is empty. Nothing is in process.</p>`
          }
          <p style="font-family:${mono}; font-size:12px; color:oklch(0.56 0.01 80); margin:14px 0 0; line-height:1.5">
            These are the cards on the belt: one per live session - chat or spawned - put there by the timer each beat, and one per deposit. The last column is how long each has ridden without being collected.
            Each intake door shows how many it has on the belt now and how many it admitted today.
          </p>
          <!-- WHAT NO DOOR CAN ACCOUNT FOR.
               His instruction was that intake know what is on the board however
               it got there, and it does not yet know everything. Two different
               gaps, kept apart because their remedies differ: a dispatch with no
               via field needs the dispatcher to start writing one, while a live
               session with no record needs a record to exist at all.
               (No backticks in this comment. It sits inside a JS template
               literal, so one backtick ends the string and the file stops
               parsing - the same trap already recorded for CSS comments inside
               an Angular styles block, met again in a different host.)
               Said in a sentence down here rather than as a chip on the diagram.
               The first version was an 8px line in the SVG margin, which renders
               at four and a half pixels - the same mistake the doors themselves
               had to be rebuilt to fix, made again in the one element that had
               not been remeasured. Prose goes where prose has room. -->
          ${
            D.unattributed || D.unrecordedSessions
              ? `<p style="font-family:${mono}; font-size:12px; color:oklch(0.80 0.11 75); margin:8px 0 0; line-height:1.5">Not attributed to any door: ${[
                  D.unattributed ? `${D.unattributed} dispatch${D.unattributed === 1 ? "" : "es"} on the belt carr${D.unattributed === 1 ? "ies" : "y"} no door` : "",
                  D.unrecordedSessions ? `${D.unrecordedSessions} live session${D.unrecordedSessions === 1 ? "" : "s"} no belt record names` : "",
                ]
                  .filter(Boolean)
                  .join("; ")}. Intake cannot count what nothing records.</p>`
              : ""
          }
        </div>

        <!-- NOTES: THE READING AREA ---------------------------------------- -->
        <!--
             A note has exactly two states, unread and read, and no others.
             Operator, 2026-09-12: "you can mark notifications read by dimming or
             green and then white."

             GREEN asks for a glance. WHITE, dimmed, asks for nothing. There is
             deliberately no third state - no archive, no dismiss, no
             acknowledge - because each would need a rule about when it is wrong
             and none of them is what he asked for.

             No status icon, no waiting time, no next station, no closure. Every
             one of those would be a control implying a guarantee this pane does
             not keep: nothing collects a note, because nothing is owed on it.
        -->
        <div class="panelbody scrollcol" data-panel="notes" hidden>
          ${
            D.notes.length
              ? D.notes
                  .map(
                    (e) => `
          <div class="feedrow noterow${e.read ? " noteread" : ""}" data-rid="${esc(e.rid)}" data-handle="${esc(e.handle)}" data-kind="${esc(e.kind)}" data-read="${e.read ? "1" : "0"}" style="display:grid; grid-template-columns:16px 54px 56px minmax(0,1fr) 74px; align-items:center; gap:10px; padding:9px 0; border-top:1px solid oklch(0.22 0.012 70)">
            <span title="${esc(KIND_WORD.note)}" style="display:flex">${KIND_ICONS.note}</span>
            <span style="font-family:${mono}; font-size:14px; font-weight:500; letter-spacing:0.04em; color:${e.color}">${esc(e.handle)}</span>
            <span style="font-family:${mono}; font-size:15px; color:oklch(0.62 0.01 80)">${esc(e.time)}</span>
            <!-- The FULL claim, clamped to two lines by the stylesheet rather
                 than cut at 74 characters like the narrow columns. This pane is
                 twice as wide, so 74 characters fit inside two lines and the
                 browser never adds its ellipsis - the sentence simply stopped
                 mid-word, which reads as a rendering fault rather than as a
                 clamp. Found by looking at it; every count and class was
                 correct. -->
            <span class="rowtext notetext" style="font-size:16px; line-height:1.35">${esc(e.full)}</span>
            <span class="notepip" style="font-family:${mono}; font-size:11px; letter-spacing:0.1em; text-align:right">${e.read ? "READ" : "UNREAD"}</span>
            <div class="rowdetail">
              <p class="rowclaim">${esc(e.full)}</p>
              ${e.why ? `<p class="rowwhy">${esc(e.why)}</p>` : ""}
              <p class="rowid"><b style="color:${e.color}; letter-spacing:0.1em">${esc(e.handle)}</b> &middot; ${esc(e.dimWord)} &middot; ${esc(e.rid)} &middot; a message, nothing owed</p>
            </div>
          </div>`,
                  )
                  .join("")
              : `<p style="font-family:${mono}; font-size:14px; color:oklch(0.58 0.01 80); line-height:1.6">No notes.<br><span style="color:oklch(0.50 0.01 80)">A note is a statement to read with nothing owed on it &mdash; "the host no longer sleeps" rather than "this is broken". Nothing is ever inferred into this pane: a record becomes a note only by declaring itself one, because filing a real defect as a message would hide it somewhere nothing collects.</span></p>`
          }
          <p style="font-family:${mono}; font-size:12px; color:oklch(0.56 0.01 80); margin:14px 0 0; line-height:1.5">
            Green is unread, white is read. Tapping one reads it. Nothing here rides the belt, is dispatched, or counts as open work.
          </p>
        </div>

        <!-- LEARNED ------------------------------------------------------- -->
        <div class="panelbody scrollcol" data-panel="learned" hidden>
          ${
            D.learned.length
              ? D.learned
                  .map(
                    (l) => `
          <div class="lessonrow${l.fresh ? " freshlesson" : ""}">
            <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:3px">
              <span style="font-family:${mono}; font-size:12px; letter-spacing:0.06em; color:${l.color}">${esc(l.tag)}</span>
              <span style="font-family:${mono}; font-size:12px; color:oklch(0.52 0.01 80)">${esc(l.time)}</span>
              ${l.fresh ? `<span class="newpip">NEW</span>` : `<span style="font-family:${mono}; font-size:11px; letter-spacing:0.1em; color:oklch(0.46 0.01 80)">KNOWN</span>`}
            </div>
            <p style="margin:0 0 3px; font-size:16px; line-height:1.4; color:oklch(0.93 0.008 85)">${esc(l.lesson)}</p>
            <p style="margin:0; font-size:13px; line-height:1.35; color:oklch(0.58 0.01 80)">from: ${esc(l.from)}</p>
          </div>`,
                  )
                  .join("")
              : `<p style="font-family:${mono}; font-size:14px; color:oklch(0.58 0.01 80); line-height:1.6">Nothing has been written down as a lesson yet.<br><span style="color:oklch(0.50 0.01 80)">A lesson is not a finding. "The filter never filtered" is an incident; "verify what a person would see, never the flag you just set" is the thing worth carrying. Only the second belongs here, and it has to be written rather than derived.</span></p>`
          }
        </div>

        <!-- PLANS ---------------------------------------------------------- -->
        <div class="panelbody scrollcol" data-panel="plans" hidden>
          ${
            !D.plans.present
              ? `<p style="margin:0; font-size:14px; line-height:1.5; color:oklch(0.62 0.01 80)">This repo has no plan register at <span style="font-family:${mono}">public/assets/plan/refer.plan.json</span>. Nothing is drawn here rather than a roadmap being invented for it.</p>`
              : `
          <!-- EVERY LINE OF CHROME HERE IS PAID FOR IN ROWS. The panelbody is
               163px; a heading of its own cost 22 of them, which is one whole
               row of plans in every column. So the count sits in the filter
               strip and the explanation is one line, not a paragraph - the
               thing he asked to see is the list. -->
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:4px">
            <span title="Registered intent, never on the belt and never counted as open work. A contract sitting three days is an alarm; a plan sitting three months is a plan - which is why no row here carries a timer and nothing here can be dispatched. Hover any row for its id, owner and finding." style="font-family:${mono}; font-size:11px; letter-spacing:0.16em; color:oklch(0.50 0.01 80); cursor:help">${D.plans.live} LIVE OF ${D.plans.total}</span>
            <span class="planpick on" data-pick="all" style="cursor:pointer; font-family:${mono}; font-size:11px; color:oklch(0.56 0.01 80); padding:2px 7px; border:1px solid oklch(0.52 0.012 70); background:oklch(0.22 0.012 70); border-radius:10px; letter-spacing:0.08em">ALL ${D.plans.live}</span>
            ${D.plans.buckets
              .map(
                (b) =>
                  `<span class="planpick" data-pick="${esc(b.key)}" title="${esc(b.why)}" style="cursor:pointer; display:inline-flex; align-items:center; gap:5px; font-family:${mono}; font-size:11px; color:oklch(0.56 0.01 80); padding:2px 7px; border:1px solid transparent; border-radius:10px; letter-spacing:0.08em"><span style="width:6px; height:6px; border-radius:50%; background:${PLAN_BUCKET_COLOR[b.key] || "oklch(0.50 0.01 80)"}"></span>${b.n} ${esc(b.label.toUpperCase())}</span>`,
              )
              .join("")}
          </div>

          <!-- THE WHOLE LIST, VISIBLE AT ONCE. Operator, 2026-09-21: "I still
               need to see the list, not just count."
               Every panelbody on this board is about 160 stage-pixels tall, so
               a one-plan-per-line list showed five of twenty-seven and hid the
               rest behind a scroll - which is a count wearing a list's
               clothes. Three columns of one-line rows put all of them on
               screen together. What a row cannot hold - the id, the owner, the
               status and the finding - is on hover, because the thing he asked
               to see is WHICH PLANS EXIST, and that is the title. -->
          <!-- The sentence that was here is now on the count chip's tooltip.
               It cost 16px, which is one row in every one of four columns -
               four plans traded for a caption, on the pane whose entire job is
               to show the plans. The honesty is kept; the height is not. -->
          <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:0 14px; align-content:start">
          ${D.plans.rows
            .map(
              (r) => `
            <div class="planrow" data-plan-bucket="${esc(r.bucket)}" data-plan-id="${esc(r.id)}" title="${esc(planTip(r))}" style="display:flex; align-items:baseline; gap:5px; padding:1px 0; border-bottom:1px solid oklch(0.20 0.012 70); min-width:0; cursor:pointer">
              <span style="flex:0 0 auto; font-family:${mono}; font-size:9px; letter-spacing:0.06em; color:oklch(0.72 0.11 300); border:1px solid oklch(0.38 0.08 300); border-radius:2px; padding:0 3px">PL</span>
              <span style="flex:0 0 auto; width:6px; height:6px; border-radius:50%; background:${PLAN_BUCKET_COLOR[r.bucket] || "oklch(0.50 0.01 80)"}" ></span>
              <span style="flex:1 1 auto; min-width:0; font-size:11px; line-height:1.35; color:oklch(0.88 0.008 85); white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${esc(r.title)}</span>
            </div>`,
            )
            .join("")}
          </div>

`
          }
        </div>

        <!-- HORIZON ------------------------------------------------------- -->
        <div class="panelbody scrollcol" data-panel="horizon" hidden>

          <div style="display:flex; flex-wrap:wrap; gap:10px 26px; margin-bottom:14px">
            ${D.horizon.tracks
              .map(
                (t) => `
            <div style="min-width:180px">
              <div style="display:flex; align-items:baseline; gap:8px">
                <span style="font-family:${mono}; font-size:19px; color:oklch(0.92 0.008 85)">${t.at}<span style="color:oklch(0.50 0.01 80)"> / ${t.of}</span></span>
                <span style="font-family:${mono}; font-size:12px; letter-spacing:0.1em; color:oklch(0.62 0.01 80)">${esc(t.label.toUpperCase())}</span>
              </div>
              <div style="height:4px; border-radius:2px; background:oklch(0.26 0.012 70); margin:5px 0 3px; overflow:hidden">
                <div style="height:100%; width:${t.of ? Math.round((t.at / t.of) * 100) : 0}%; background:oklch(0.62 0.13 150)"></div>
              </div>
              <span style="font-size:12px; color:oklch(0.56 0.01 80)">${esc(t.why)}</span>
            </div>`,
              )
              .join("")}
          </div>

          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:6px">
            <!-- RENAMED 2026-09-21, and the rename is the point. This block
                 counts DOCUMENTS in refer.app/plan/ by matching their prose,
                 which is all that existed when it was written. The canonical
                 register is public/assets/plan/refer.plan.json and it is now
                 drawn in its own PLANS pane. Two panes describing "the plans"
                 with different numbers is how a board starts arguing with
                 itself, so each one now says which question it answers. -->
            <span style="font-family:${mono}; font-size:12px; letter-spacing:0.16em; color:oklch(0.62 0.01 80)">THE PLAN DOCUMENTS</span>
            <span style="font-family:${mono}; font-size:12px; color:oklch(0.50 0.01 80)">${D.horizon.total} in the folder</span>
            ${D.plans.present ? `<span style="font-family:${mono}; font-size:12px; color:oklch(0.72 0.11 300)">&middot; the register itself is in PLANS &mdash; ${D.plans.live} live</span>` : ""}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:8px 18px; margin-bottom:12px">
            <!-- Every document in the folder appears in exactly one of these,
                 and they add to the total. An earlier version counted reference
                 documents and superseded specs but drew neither, so the numbers
                 beside the word "57" added to 46 - the same defect this board
                 was caught with twice before, committed again in the pane built
                 to measure honesty. -->
            ${[
              ["building", D.horizon.counts.executing, "oklch(0.72 0.13 150)"],
              ["ready to start", D.horizon.counts.ready, "oklch(0.74 0.12 195)"],
              ["still being specified", D.horizon.counts.intake, "oklch(0.76 0.12 75)"],
              ["done", D.horizon.counts.complete, "oklch(0.62 0.01 80)"],
              ["reference, not plans", D.horizon.counts.reference, "oklch(0.62 0.01 80)"],
              ["superseded", D.horizon.counts.superseded, "oklch(0.62 0.01 80)"],
              ["say nothing at all", D.horizon.silent, "oklch(0.72 0.12 25)"],
              ["declared in words the board cannot read", D.horizon.unreadable, "oklch(0.76 0.12 75)"],
            ]
              .filter(([, n]) => n > 0)
              .map(
                ([label, n, col]) => `
            <span style="display:flex; align-items:baseline; gap:7px; font-family:${mono}; font-size:13px; color:oklch(0.70 0.01 80)"><span style="font-size:17px; color:${col}">${n}</span>${esc(label)}</span>`,
              )
              .join("")}
          </div>

          <p style="margin:0 0 10px; font-size:13px; line-height:1.5; color:oklch(0.62 0.01 80); border-left:2px solid oklch(0.42 0.10 25); padding-left:10px">
            <!-- The sentence adapts, because "most of the road ahead is not
                 written down" was true at 44 and became a lie at 12. A caption
                 that does not move with its number is a stale claim waiting to
                 happen, and this board has been caught by exactly that before. -->
            ${
              D.horizon.silent === 0
                ? D.horizon.unreadable
                  ? `Every document in this folder declares what it is, except ${D.horizon.unreadable} that answers in a private vocabulary &mdash; a real declaration nobody else can read, which is a different problem from saying nothing and needs a different fix.`
                  : `Every document in this folder declares what it is. The road ahead is written down.`
                : D.horizon.silent > D.horizon.total / 2
                  ? `${D.horizon.silent} of ${D.horizon.total} plans do not say what stage they are at, so most of the road ahead is not written down anywhere a machine can read. That is the honest state of the map, not a rendering gap.`
                  : `${D.horizon.silent} of ${D.horizon.total} plans still do not say what stage they are at. The rest declare it, so the road ahead is mostly legible - these are the remaining blind spots.`
            }
          </p>

          <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:5px">
            <span style="font-family:${mono}; font-size:12px; letter-spacing:0.16em; color:oklch(0.62 0.01 80)">IS THE APP AT ITS PEAK?</span>
          </div>
          <p style="margin:0; font-size:14px; line-height:1.5; color:oklch(0.86 0.01 85)">
            ${
              D.horizon.blueprintAge === null
                ? "There is no blueprint in this repo, so nothing here can answer that. An answer would be invented, and an invented ceiling is the one mistake this pane must never make."
                : `Not answerable from evidence today. The blueprint that predicts what comes next was generated <b style="color:oklch(0.84 0.11 25)">${D.horizon.blueprintAge} days ago</b> &mdash; before livestream, the sanctuary stack, Office, Stripe Connect, SMS and replay existed. Prediction has been reasoning from a stale picture of the app.`
            }
            <span style="display:block; margin-top:7px; color:oklch(0.62 0.01 80); font-size:13px">Amazon sold books. Netflix mailed discs. The stage is evidence, never assumption &mdash; so where the evidence does not reach, this says so instead of drawing a ladder.</span>
          </p>
        </div>

        <!-- HISTORY ------------------------------------------------------- -->
        <!-- No inline display here. It had one - display:flex - and an inline
             style beats [hidden], so this pane rendered underneath the
             classroom no matter which tab was selected. Third time this exact
             fight has been lost in this file, and the second time inside a
             change whose own comment warns about it. The stylesheet owns
             .panelbody's layout now, so there is nothing inline left to win. -->
        <div class="panelbody yearpane" data-panel="year" hidden>
          <div style="display:flex; align-items:baseline; gap:16px; flex-wrap:wrap">
            <select id="scopepick" style="font-family:${mono}; font-size:13px; letter-spacing:0.06em; color:oklch(0.92 0.008 85); background:oklch(0.17 0.012 70); border:1px solid oklch(0.34 0.012 70); border-radius:4px; padding:3px 8px; cursor:pointer">
              ${scopes.map((sc) => `<option value="${esc(sc.id)}"${sc.id === REPO ? " selected" : ""}>${esc(sc.label)}</option>`).join("")}
            </select>
            ${SERIES.map((sx) => `<span style="display:flex; align-items:center; gap:6px; font-family:${mono}; font-size:12px; letter-spacing:0.08em; color:oklch(0.70 0.01 80)"><span style="width:10px; height:10px; border-radius:2px; background:${sx.color}"></span>${sx.label}</span>`).join("")}
            <span style="font-family:${mono}; font-size:12px; color:oklch(0.50 0.01 80); margin-left:auto">a month is written once, then frozen</span>
          </div>
          <div style="flex:1; min-height:0">${scopes.map((sc) => `<div class="scopechart" data-scope="${esc(sc.id)}" style="height:100%${sc.id === REPO ? "" : "; display:none"}">${chartSvg(sc.months)}</div>`).join("")}</div>
        </div>

      </div>

    </div>

    <div style="background:oklch(0.185 0.012 70); border:1px solid oklch(0.28 0.012 70); border-radius:6px; padding:16px 18px; display:flex; flex-direction:column; gap:10px; min-height:0; overflow:hidden">
      <div style="display:flex; align-items:center; gap:14px">
        <span style="width:9px; height:9px; border-radius:50%; background:oklch(0.66 0.14 150); flex:none"></span>
        <span style="font-family:${mono}; font-size:13px; letter-spacing:0.16em; color:oklch(0.62 0.01 80)">RESOLVED</span>
        <span style="font-family:${mono}; font-size:13px; color:oklch(0.72 0.13 150); margin-left:auto; white-space:nowrap">${D.resolved.length} out</span>
      </div>
      <div class="scrollcol" style="display:flex; flex-direction:column; gap:2px; flex:1; min-height:0; overflow-x:hidden">${pulseSlot("resolved")}${resolvedRows}
      </div>
      <div class="morehint"><span>MORE</span><svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d="M6 9l6 6 6-6" style="stroke:currentColor; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round"></path></svg></div>
    </div>

  </div>

  <div style="display:flex; flex-wrap:wrap; align-items:center; gap:14px 32px; font-family:${mono}; font-size:14px; color:oklch(0.62 0.01 80)">
    <!-- THE LEAST LEGIBLE FACTS ON THE BOARD, AND NOW THE MOST EXPLAINED.
         A number nobody can interpret is decoration that looks like rigour,
         which is worse than no number because it is trusted. Each of these now
         opens and says what it counts, what its denominator is, and where it is
         computed - and where nothing computes it, it says that instead. -->
    <span class="xopen" data-explain="foot:detectors" title="click for what a detector is, and where this number comes from" style="display:flex; align-items:baseline; gap:10px"><span style="font-size:22px; color:oklch(0.92 0.008 85)">${esc(D.detectors)}</span>detectors</span>
    <span class="xopen" data-explain="foot:hive" title="click for what a hive channel is, and where this number comes from" style="display:flex; align-items:baseline; gap:10px"><span style="font-size:22px; color:oklch(0.92 0.008 85)">${esc(D.hiveChannels)}</span>hive channels</span>
    <span class="xopen" data-explain="foot:routes" title="click for what is counted and what the denominator is" style="display:flex; align-items:baseline; gap:10px"><span style="font-size:22px; color:oklch(0.92 0.008 85)">${esc(D.routesProven)}</span>routes proven</span>
    <span class="xopen" data-explain="foot:shed" title="click for what shedding a law means" style="display:flex; align-items:baseline; gap:10px"><span style="font-size:22px; color:oklch(0.92 0.008 85)">${D.shedCount}</span>laws shed</span>
    <span class="xopen" data-explain="foot:built" title="click for when the judgements on this board were made - the times beside them are live" style="display:flex; align-items:baseline; gap:10px"><span style="color:oklch(0.50 0.01 80)">built ${esc(D.builtLabel)}</span></span>
    <span style="display:flex; align-items:center; gap:14px; margin-left:auto">
      <span style="color:oklch(0.50 0.01 80); letter-spacing:0.14em">LOOPS</span>
      ${D.loopStrip
        .map(
          (l) =>
            `<span data-cycle-id="${esc(l.id)}" data-cycle-last="${l.last || ""}" data-cycle-every="${l.everyMs}" data-cycle-grid="${l.grid ? 1 : 0}" style="display:flex; align-items:center; gap:6px"><span data-live="dot" style="width:7px; height:7px; border-radius:50%; background:${l.hue}${l.due ? "" : "; opacity:0.4"}"></span><span style="color:oklch(0.78 0.01 80)">${esc(l.name)}</span><span data-live="when" style="color:oklch(0.58 0.01 80)">${esc(l.when)}</span></span>`,
        )
        .join("")}
    </span>
  </div>
  <div style="display:flex; align-items:center; gap:10px; font-family:${mono}; font-size:12.5px; color:oklch(0.50 0.01 80); margin-top:-8px">
    <span>ask what its output triggers, never who supervises it</span>
    <span style="margin-left:auto; color:oklch(0.58 0.01 80)">tap anything to see how it is wired</span>
    <span id="screen-control" style="display:flex; align-items:center; gap:6px; margin-left:14px"></span>
  </div>

  <!-- EVERY PANEL, RENDERED AT BUILD TIME ------------------------------------
       They live in the file rather than being assembled in the page, for the
       same reason the board is built rather than fetched: one code path, and
       what it produced is on disk where the seer can read it. The store is
       hidden and the click handler copies out of it. -->
  <div id="xstore" hidden>
${Object.entries(EXPLAIN)
  .map(([k, p]) => `    <div data-explain-for="${esc(k)}">${panelHtml(p)}</div>`)
  .join("\n")}
  </div>
  <div id="xback" hidden></div>
  <div id="xwrap" hidden role="dialog" aria-label="how this is wired">
    <button id="xclose" type="button">CLOSE</button>
    <div id="xbody"></div>
  </div>

</div>
</div>

<script>
  // The design scales a fixed 1920x1080 board to whatever it is shown on, so it
  // reads the same on a laptop and on a wall. Kept exactly as designed - but the
  // first implementation CROPPED when the window narrowed instead of shrinking.
  //
  // Three causes, all fixed here rather than one guessed at:
  //
  //  1. The board kept its full 1920x1080 LAYOUT footprint. transform:scale is
  //     painted, not laid out, so a centred flex child wider than its parent
  //     overflowed both edges and the clip won. It is now absolutely positioned
  //     and centred by translate(-50%,-50%), so it occupies no layout width at
  //     all and cannot push or be pushed.
  //  2. height:100vh is not the visible area inside an embedded frame. The
  //     wrapper is position:fixed; inset:0, which is the visible area by
  //     definition, whatever the document does.
  //  3. A frame resized by its host does not always fire window.resize. A
  //     ResizeObserver on the wrapper catches every change, including that one.
  //
  // Measurement uses clientWidth/clientHeight, which exclude a scrollbar -
  // innerWidth includes it, so the scale came out a few pixels too large and
  // clipped the edges it was supposed to fit.
  var stage = document.getElementById('stage');
  var viewport = document.getElementById('viewport');

  function fit() {
    var w = viewport.clientWidth || document.documentElement.clientWidth;
    var h = viewport.clientHeight || document.documentElement.clientHeight;
    if (!w || !h) return;
    var s = Math.min(w / 1920, h / 1080);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s.toFixed(4) + ')';
  }

  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(viewport);
  // Web fonts change nothing about the fixed board size, but the first frame can
  // measure before layout settles; one re-fit costs nothing and removes the race.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  // The scope selector switches the year strip between repos and the roll-up.
  // It only controls the chart, because the chart is the only thing on this
  // board whose data is genuinely per-repo - the belt, the stations and the
  // gates below are this repo's. Wiring it to the header, where it would look
  // like it switched everything, would have been a control promising what the
  // data cannot keep.
  var pick = document.getElementById('scopepick');
  if (pick) {
    pick.addEventListener('change', function () {
      document.querySelectorAll('.scopechart').forEach(function (c) {
        c.style.display = c.getAttribute('data-scope') === pick.value ? '' : 'none';
      });
    });
  }

  // "MORE" appears only when a list actually overflows, and disappears once it
  // is scrolled to the end. A permanent hint that sometimes lies is worse than
  // no hint - the same rule as the lamp that could never go red.
  document.querySelectorAll('.scrollcol').forEach(function (col) {
    var hint = col.parentElement && col.parentElement.querySelector('.morehint');
    if (!hint) return;
    function sync() {
      var more = col.scrollHeight - col.clientHeight - col.scrollTop > 6;
      hint.classList.toggle('on', more);
    }
    col.addEventListener('scroll', sync);
    window.addEventListener('resize', sync);
    if (window.ResizeObserver) new ResizeObserver(sync).observe(col);
    sync();
  });

  // NEEDS YOU cycles on its own. Nobody is standing at a wall board to drag a
  // list, and this is the one panel where an unread item is the whole point -
  // it counted four and showed two before this. Pauses on hover so a person who
  // IS there can read it, and does nothing at all when it fits.
  document.querySelectorAll('.autoscroll').forEach(function (box) {
    var paused = false;
    box.addEventListener('mouseenter', function () { paused = true; });
    box.addEventListener('mouseleave', function () { paused = false; });
    setInterval(function () {
      if (paused) return;
      if (box.scrollHeight - box.clientHeight < 6) return;
      var atEnd = box.scrollHeight - box.clientHeight - box.scrollTop < 2;
      box.scrollTo({ top: atEnd ? 0 : box.scrollTop + 58, behavior: 'smooth' });
    }, 4000);
  });

  // Click a node to read its value. Deliberately on demand rather than printed
  // on every point: the four bands are each normalised to their OWN maximum, so
  // heights are not comparable between bands and a wall of numbers would invite
  // exactly the comparison the banding exists to prevent. One value, where it
  // was asked for, and it stays until another is asked for.
  var readout = document.getElementById('nodereadout');
  var picked = null;
  document.querySelectorAll('.nodepick').forEach(function (n) {
    n.addEventListener('click', function () {
      if (picked) picked.setAttribute('r', '5.5');
      picked = n;
      n.setAttribute('r', '7.5');
      var cx = parseFloat(n.getAttribute('cx'));
      var cy = parseFloat(n.getAttribute('cy'));
      var zero = parseFloat(n.getAttribute('data-zero'));
      // Under the node when the band has room beneath it, above when it does not.
      var y = zero - cy > 26 ? cy + 19 : cy - 13;
      readout.setAttribute('x', cx);
      readout.setAttribute('y', y);
      readout.setAttribute('fill', n.getAttribute('data-color'));
      readout.textContent = n.getAttribute('data-m') + ' ' + n.getAttribute('data-v');
    });
  });

  // The three panes. LEARNED, HORIZON, and the year chart.
  //
  // [hidden] with no inline display anywhere, because an inline style beats a
  // plain rule and that exact fight is what made the legend filter silently do
  // nothing for a day. Written correctly the first time here rather than fixed
  // after he finds it by clicking.
  (function () {
    var tabs = document.querySelectorAll('.paneltab[data-panel]');
    var bodies = document.querySelectorAll('.panelbody[data-panel]');
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        var want = t.getAttribute('data-panel');
        tabs.forEach(function (o) { o.classList.toggle('on', o === t); });
        bodies.forEach(function (b) { b.hidden = b.getAttribute('data-panel') !== want; });
      });
    });
  })();

  // THE READ RECEIPT, which is what makes a classroom possible.
  //
  // Opening a row, or pressing MARK ALL READ, tells the board he has seen it. A
  // classroom may not repeat itself - if he looks and learns nothing new the
  // visit was wasted - and that only means anything if the board can tell what
  // he has already read.
  //
  // Opening is a deliberate act. The page merely BEING displayed proves nothing:
  // this lives on an always-on monitor, where "it was on screen" and "somebody
  // read it" are completely unrelated facts.
  //
  // THE SCREEN CONTROL. Operator, 2026-09-16: a monitor turned off and on again
  // sends this window to screen 1. A page cannot move its own window, so it
  // asks the server, which re-homes the board through the kiosk script. One
  // button per monitor, the one this window is on marked (window.screenX/Y
  // against the monitor rectangles the server reports), and the whole control
  // disappears when there is no server to ask - a published artifact has no
  // screens. Fire and forget: the window this runs in is the one being closed.
  (function screenControl() {
    var host = document.getElementById('screen-control');
    if (!host) return;
    function draw(monitors) {
      if (!monitors || !monitors.length) { host.textContent = ''; return; }
      var x = window.screenX, y = window.screenY;
      var html = '<span style="color:oklch(0.50 0.01 80)">screen</span>';
      for (var i = 0; i < monitors.length; i++) {
        var m = monitors[i];
        var on = x >= m.x && x < m.x + m.width && y >= m.y && y < m.y + m.height;
        html += ' <button type="button" data-monitor="' + m.index + '" title="' + m.width + 'x' + m.height + (m.primary ? ', primary' : '') + '"' +
          ' style="font:inherit; padding:1px 7px; border-radius:3px; background:transparent; cursor:pointer; border:1px solid ' +
          (on ? 'oklch(0.75 0.12 190)' : 'oklch(0.35 0.01 80)') + '; color:' + (on ? 'oklch(0.85 0.10 190)' : 'oklch(0.58 0.01 80)') + '">' + m.index + '</button>';
      }
      host.innerHTML = html;
    }
    host.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('button[data-monitor]') : null;
      if (!b) return;
      var n = Number(b.getAttribute('data-monitor'));
      host.textContent = 'moving to screen ' + n + '...';
      try {
        fetch(api('/display/move'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ monitor: n }) }).catch(function () {});
      } catch (e) { /* the window may be gone before the answer arrives; that is the point */ }
    });
    try {
      fetch(api('/display/monitors'), { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (j) { draw(j.monitors); })
        .catch(function () { host.textContent = ''; });
    } catch (e) { host.textContent = ''; }
  })();

  // Fire and forget. If the server is down the board must still work - the
  // memory degrades, the display does not.
  function markRead(ids) {
    if (!ids.length) return;
    try {
      fetch(api('/seen'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: ids }),
      }).catch(function () {});
    } catch (e) { /* a board that cannot remember is still a board */ }
  }

  // A NOTE'S READ STATE HAS TO SURVIVE A RELOAD, OR IT IS A DECORATION.
  //
  // The build bakes in what was already read, which is correct and is what makes
  // the pane right in a published artifact where there is no server at all. But
  // the board is rebuilt on a cycle, and between two builds a click had no
  // lasting effect: he would tap a note, it would go white, and the next refresh
  // would show it green again. "A state that resets on refresh is not a state."
  //
  // So the page ASKS on load. The server is the memory; the HTML is a snapshot of
  // it. Failure is silent and safe: if the fetch fails the baked-in state stands,
  // which is the last thing known to be true rather than a guess.
  function paintRead(ids) {
    var set = {};
    for (var i = 0; i < ids.length; i++) set[ids[i]] = true;
    document.querySelectorAll('.noterow[data-rid]').forEach(function (row) {
      if (!set[row.getAttribute('data-rid')]) return;
      row.classList.add('noteread');
      row.setAttribute('data-read', '1');
      var pip = row.querySelector('.notepip');
      if (pip) pip.textContent = 'READ';
    });
    // The tab badge counts what is still unread, recomputed from the rows rather
    // than from the number the build printed - otherwise it would keep announcing
    // unread notes he has already read.
    var unread = document.querySelectorAll('.noterow[data-read="0"]').length;
    var tab = document.querySelector('.paneltab[data-panel="notes"]');
    if (!tab) return;
    var dot = tab.querySelector('.tabdot');
    if (unread) { if (dot) dot.textContent = unread + ' UNREAD'; }
    else if (dot) dot.remove();
  }

  (function () {
    if (!document.querySelector('.noterow')) return;
    try {
      fetch(api('/seen'), { headers: { accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
        .then(function (j) { paintRead(Object.keys((j && j.read) || {})); })
        .catch(function () { /* the baked-in state stands */ });
    } catch (e) { /* same */ }
  })();

  // Reading a note is tapping it. There is no separate control, because a second
  // way to do the same thing is a second thing to keep honest - and opening a row
  // is already the read receipt everywhere else on this board.
  document.querySelectorAll('.noterow').forEach(function (row) {
    row.addEventListener('click', function () {
      if (row.getAttribute('data-read') === '1') return;
      paintRead([row.getAttribute('data-rid')]);
    });
  });

  // ---- ACCEPTING A DEPOSIT AS WORK -------------------------------------------
  //
  // Posts the act; the belt records it. The row is NOT redrawn as a contract
  // here: this page is a snapshot, and moving the row would assert an outcome the
  // page cannot verify. It says what it did and waits for the next build, which
  // is the same rule the rest of the board runs on - motion means something
  // happened, and a button that rearranges the screen on its own say-so is
  // motion asserting a fact nobody checked.
  document.querySelectorAll('.acceptbtn').forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation(); // not a row tap
      var id = btn.getAttribute('data-accept');
      var dim = btn.getAttribute('data-dim') || '';
      btn.disabled = true;
      btn.textContent = 'MARKING GO...';
      try {
        fetch(api('/triage'), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: id, kind: 'contract', to: dim, by: 'operator, from the board' }),
        })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
          .then(function () { btn.textContent = 'GO · ON THE NEXT BUILD'; })
          .catch(function () { btn.disabled = false; btn.textContent = 'COULD NOT REACH THE BELT — RETRY'; });
      } catch (e) {
        btn.disabled = false;
        btn.textContent = 'COULD NOT REACH THE BELT — RETRY';
      }
    });
  });

  // AUTORUN. The switch asks the server what the setting is rather than
  // trusting what the page was built with, because the board is a snapshot and
  // this is the one control whose wrong position would be actively misleading -
  // a switch reading MANUAL while the factory dispatches is worse than no
  // switch. Same rule on the way back: the position is set from the server's
  // answer, never from the click.
  (function () {
    var wrap = document.getElementById('autorun');
    if (!wrap) return;
    var knob = document.getElementById('autorun-knob');
    var autoLbl = document.getElementById('autorun-auto');
    var manLbl = document.getElementById('autorun-manual');
    var mode = 'manual';
    var busy = false;
    function paint(next, pending) {
      mode = next;
      // THE KNOB SITS UNDER THE WORD THAT IS TRUE. AUTOMATIC is the left
      // label, so automatic is the left position - the first version had it
      // backwards, parking the knob beside AUTOMATIC while the factory was in
      // Manual. On a control whose whole job is to say whether work starts by
      // itself, reading the wrong way round is the worst thing it can do.
      knob.style.left = next === 'auto' ? '1px' : '21px';
      knob.style.background = next === 'auto' ? 'oklch(0.72 0.13 150)' : 'oklch(0.62 0.01 80)';
      autoLbl.style.color = next === 'auto' ? 'oklch(0.80 0.12 150)' : 'oklch(0.50 0.01 80)';
      manLbl.style.color = next === 'auto' ? 'oklch(0.50 0.01 80)' : 'oklch(0.86 0.01 80)';
      wrap.style.opacity = pending ? '0.55' : '1';
    }
    fetch(api('/intake-mode'), { headers: { accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (j) { paint(j && j.mode === 'auto' ? 'auto' : 'manual', false); })
      .catch(function () { paint('manual', false); });
    wrap.addEventListener('click', function () {
      if (busy) return;
      busy = true;
      var want = mode === 'auto' ? 'manual' : 'auto';
      paint(mode, true);
      fetch(api('/intake-mode'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: want })
      })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('refused')); })
        .then(function (j) { paint(j && j.mode === 'auto' ? 'auto' : 'manual', false); })
        .catch(function () { paint(mode, false); wrap.title = 'Could not reach the board server, so the switch did not move.'; })
        .then(function () { busy = false; });
    });
  })();

  (function () {
    var btn = document.getElementById('markread');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // data-rid, not the text of the id line. That line now leads with the
      // handle, so parsing it would have quietly started recording "B12" as the
      // thing he had read - a silent break in a feature whose whole job is to
      // remember correctly.
      var ids = [];
      document.querySelectorAll('.feedrow[data-rid]').forEach(function (el) {
        var t = el.getAttribute('data-rid');
        if (t) ids.push(t);
      });
      document.querySelectorAll('.lessonrow').forEach(function (el) {
        var pip = el.querySelector('.newpip');
        if (pip) pip.textContent = 'KNOWN';
        el.classList.remove('freshlesson');
      });
      // The LEARNED badge only. Scoped by its tab, because an unscoped
      // querySelector('.tabdot') took the first badge on the strip - which is now
      // PROCESSING's count of cards on the belt, and removing that would have
      // deleted a live number to acknowledge a different pane.
      var learnedTab = document.querySelector('.paneltab[data-panel="learned"]');
      var dot = learnedTab && learnedTab.querySelector('.tabdot');
      if (dot) dot.remove();
      // Notes are read by the same act, and they have to LOOK read immediately -
      // the whole point of green-then-white is that the change is visible.
      paintRead(ids);
      markRead(ids);
      btn.textContent = 'ALL READ';
      // Said plainly rather than left to be inferred from a missing badge.
      setTimeout(function () { btn.textContent = 'MARK ALL READ'; }, 4000);
    });
  })();

  // Tap a deposit to open it, tap again to close it.
  //
  // Operator, 2026-09-11: "tapping the deposit in or out card item should
  // expand untruncate to see full details toggle retruncate."
  //
  // Both columns, because a resolved item's reasoning is worth reading too -
  // arguably more, since that is where you find out whether something was
  // genuinely fixed or merely closed.
  //
  // Only one opens at a time. Several open rows push everything else below the
  // fold, and on a wall display what falls below the fold is simply gone.
  (function () {
    var rows = document.querySelectorAll('.feedrow');
    rows.forEach(function (r) {
      r.addEventListener('click', function () {
        var wasOpen = r.classList.contains('open');
        rows.forEach(function (o) { o.classList.remove('open'); });
        if (!wasOpen) r.classList.add('open');
        // The column just changed height, so the "more" hint has to measure
        // again - it is set from a real measurement rather than assumed, and a
        // stale hint is a small lie in the same family as all the others.
        var col = r.closest('.scrollcol');
        if (col) col.dispatchEvent(new Event('scroll'));
        // Opening it is reading it.
        if (!wasOpen) {
          var id = r.getAttribute('data-rid');
          if (id) markRead([id]);
        }
      });
    });
  })();

  // The legend filters the column. Clicking a state shows only that state;
  // clicking it again, or ALL, restores everything.
  //
  // The count on each chip stays the TOTAL for that state, never the filtered
  // count - a filter that rewrites its own legend leaves you unable to see what
  // you are not looking at, which is how a filter quietly becomes a blindfold.
  //
  // TWO AXES, COMBINED WITH AND. A record has a kind and a state, and he may want
  // either question answered - "only what needs doing", or "only what has gone
  // stale" - or both at once. Two independent selections over one set of rows,
  // which is why the visibility decision is computed from both every time rather
  // than each strip hiding rows on its own. Two strips each toggling display
  // would fight, and the last one clicked would win silently.
  (function () {
    var picks = document.querySelectorAll('.statpick');
    var kinds = document.querySelectorAll('.kindpick');
    var rows = document.querySelectorAll('.inrow');
    var active = 'all';
    var activeKind = 'all';
    function apply(next, nextKind) {
      active = next;
      activeKind = nextKind;
      rows.forEach(function (r) {
        var show =
          (active === 'all' || r.getAttribute('data-status') === active) &&
          (activeKind === 'all' || r.getAttribute('data-kind') === activeKind);
        // style.display, NOT the hidden attribute. Every row carries an inline
        // display:grid, and an inline style beats [hidden]'s display:none unless
        // a rule marks it !important - so setting .hidden set a property that
        // changed nothing on screen.
        //
        // Worse, the check that "verified" this read r.hidden back, which is the
        // property it had just set. It confirmed its own assignment and called
        // that a passing test. The operator found it by clicking. Verify what a
        // person would SEE - rendered height - never the flag you just wrote.
        r.style.display = show ? 'grid' : 'none';
      });
      function light(list, value) {
        list.forEach(function (p) {
          var on = p.getAttribute('data-pick') === value;
          p.classList.toggle('on', on);
          p.style.borderColor = on ? 'oklch(0.52 0.012 70)' : 'transparent';
          p.style.background = on ? 'oklch(0.22 0.012 70)' : 'transparent';
        });
      }
      light(picks, active);
      light(kinds, activeKind);
    }
    picks.forEach(function (p) {
      p.addEventListener('click', function () {
        var k = p.getAttribute('data-pick');
        apply(active === k && k !== 'all' ? 'all' : k, activeKind);
      });
    });
    kinds.forEach(function (p) {
      p.addEventListener('click', function () {
        var k = p.getAttribute('data-pick');
        apply(active, activeKind === k && k !== 'all' ? 'all' : k);
      });
    });
    apply('all', 'all');
  })();

  // PLAN FILTER. One axis, not two: a plan has a horizon and nothing else to
  // cross it with. The lesson from the strip above is carried across rather
  // than relearned - every plan row has an inline display, so the toggle sets
  // style.display and never the hidden attribute, and clicking an active chip
  // clears the filter instead of leaving him looking at a subset he cannot see
  // the edge of.
  (function () {
    var picks = document.querySelectorAll('.planpick');
    var rows = document.querySelectorAll('.planrow');
    if (!picks.length || !rows.length) return;
    var active = 'all';
    function apply(next) {
      active = next;
      rows.forEach(function (r) {
        var show = active === 'all' || r.getAttribute('data-plan-bucket') === active;
        r.style.display = show ? 'flex' : 'none';
      });
      picks.forEach(function (p) {
        var on = p.getAttribute('data-pick') === active;
        p.classList.toggle('on', on);
        p.style.borderColor = on ? 'oklch(0.52 0.012 70)' : 'transparent';
        p.style.background = on ? 'oklch(0.22 0.012 70)' : 'transparent';
      });
    }
    picks.forEach(function (p) {
      p.addEventListener('click', function () {
        var k = p.getAttribute('data-pick');
        apply(active === k && k !== 'all' ? 'all' : k);
      });
    });
    apply('all');
  })();

  // Live reload, AND an honest disconnected state.
  //
  // Reload only fires when the board has actually been rebuilt - it asks the
  // server for the build stamp and compares. A timed refresh would reload
  // whether or not anything changed, which on a board whose whole subject is
  // "is this thing actually running" would be the same lie the belt used to
  // tell.
  //
  // THE DISCONNECTED STATE IS THE IMPORTANT HALF, and it was missing. Probed
  // 2026-09-11: with the server killed, this page kept its clock ticking and
  // eleven animations running, and the only clue was a build time a person
  // would have to compare against their own watch. A frozen board that looks
  // alive is worse than a blank screen - and it was about to live on a wall
  // monitor, where nobody is checking, which is the entire point of a wall
  // monitor.
  //
  // So the page now says when it has stopped hearing from the factory: it stops
  // moving, dims, and states how long ago its data was true. The wall clock
  // keeps running because that IS current; what stops is everything pretending
  // the data is.
  (function () {
    var mine = null;
    var misses = 0;
    var lastContact = Date.now();
    var banner = document.getElementById('disconnected');
    var stage = document.getElementById('stage');

    function mins(ms) {
      var m = Math.round(ms / 60000);
      if (m < 1) return 'less than a minute';
      if (m < 60) return m + (m === 1 ? ' minute' : ' minutes');
      var h = m / 60;
      return h.toFixed(1) + (h < 1.05 ? ' hour' : ' hours');
    }
    function setDisconnected(on) {
      // The rail's countdowns read this. They run on the wall clock, which is
      // always current - but the last-run facts they count from are not, once
      // the factory has gone quiet. A countdown that keeps moving under the
      // frozen banner is the board miming work, which is the one thing this
      // banner exists to stop.
      window.__boardFrozen = on;
      banner.hidden = !on;
      stage.style.filter = on ? 'grayscale(0.55) brightness(0.72)' : '';
      // Stop every animation, so the board visibly STOPS rather than miming work.
      document.getAnimations().forEach(function (a) { try { on ? a.pause() : a.play(); } catch (e) {} });
      if (on) banner.textContent = 'NOT RECEIVING FROM THE FACTORY · this board has been frozen for ' + mins(Date.now() - lastContact);
    }

    setInterval(function () {
      fetch(api('/stamp'), { cache: 'no-store' })
        .then(function (r) { return r.ok ? r.text() : Promise.reject(new Error('bad status')); })
        .then(function (s) {
          misses = 0;
          lastContact = Date.now();
          setDisconnected(false);
          if (mine === null) { mine = s; return; }
          if (s !== mine) location.reload();
        })
        .catch(function () {
          misses++;
          // Two misses, not one: a single failed poll is a hiccup, and a board
          // that cries disconnected every time a packet drops teaches its
          // watcher to ignore it - the same reason a station gets three
          // intervals before it is called stalled.
          if (misses >= 2) setDisconnected(true);
        });
    }, 20000);
  })();

  // ---- CLICK TO EXPLAIN ------------------------------------------------------
  //
  // One panel, one open thing at a time, and the deposit rows share the same
  // open-state rather than running a second one. Opening a panel closes any open
  // row; opening a row closes the panel. On a wall display, two open things push
  // the third off the bottom, and what falls off the bottom is simply gone.
  //
  // The panel content is COPIED OUT OF THE PAGE, never built here. Everything a
  // panel says was generated at build time from the same values that drew the
  // element - so there is no path by which the page can invent a fact the build
  // did not produce, which is the entire guarantee.
  (function () {
    var store = document.getElementById('xstore');
    var wrap = document.getElementById('xwrap');
    var back = document.getElementById('xback');
    var body = document.getElementById('xbody');
    if (!store || !wrap || !back || !body) return;
    var current = null;

    function close() {
      current = null;
      wrap.hidden = true;
      back.hidden = true;
      body.textContent = '';
    }

    function open(key) {
      // Looked up by walking the store rather than by building a selector. Every
      // key here contains a colon, and escaping one for a selector is a rule with
      // two readings - this has none.
      var src = null;
      var all = store.children;
      for (var i = 0; i < all.length; i++) {
        if (all[i].getAttribute('data-explain-for') === key) { src = all[i]; break; }
      }
      // A CLICKABLE ELEMENT WITH NO PANEL SAYS SO. Silently doing nothing would
      // make a wiring gap look like a dead pixel, and the whole point of this
      // feature is that an element which cannot explain itself is the finding.
      if (!src) {
        body.innerHTML =
          '<div class="xpanel"><div class="xhead"><span class="xtitle">NOT RECORDED</span>' +
          '<span class="xkind">This element is marked as explainable and the build produced no panel for it.</span></div>' +
          '<p class="xhead-line x-disagree"><span class="xtone">SOURCES DISAGREE</span>' +
          'The drawing and the explanation come from the same build, so one of them is wired to a key the other does not use. Key asked for: ' +
          key + '</p></div>';
      } else {
        body.innerHTML = src.innerHTML;
      }
      current = key;
      wrap.hidden = false;
      back.hidden = false;
      wrap.scrollTop = 0;
    }

    // Capture, so a click on a rail cell inside the rail container resolves to
    // the CELL. closest() walks outward from the target, so the innermost
    // explainable ancestor wins - which is what a person means by clicking it.
    document.addEventListener('click', function (ev) {
      if (ev.target && ev.target.id === 'xclose') { close(); return; }
      if (wrap.contains(ev.target)) return;
      if (back.contains(ev.target)) { close(); return; }
      var hit = ev.target && ev.target.closest ? ev.target.closest('[data-explain]') : null;
      if (!hit) {
        // A tap on a deposit row is the other half of the same disclosure, so it
        // closes this one. Anywhere else closes it too.
        if (!wrap.hidden) close();
        return;
      }
      var key = hit.getAttribute('data-explain');
      // Tap again to close, exactly like a deposit row.
      if (current === key && !wrap.hidden) { close(); return; }
      // One open thing on the board.
      document.querySelectorAll('.feedrow.open').forEach(function (o) { o.classList.remove('open'); });
      open(key);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !wrap.hidden) close();
    });
  })();

  var el = document.getElementById('clock');
  function pad(n) { return String(n).padStart(2, '0'); }

  // THE RAIL COUNTS DOWN ON THE SAME CLOCK AS THE TIME BESIDE IT.
  //
  // Operator, 2026-09-13: "the pulse progress needs to be animated to match,
  // currently it's saying 22:38 my time but the pulse is saying 5 minutes
  // remaining because my board is static. why can't it tie into the clock
  // since the pulse is tied into the clock also."
  //
  // It could not because the numbers were sentences, written once by the
  // build against the build's own clock, and the page only ever animated the
  // time. Now each cell carries its two facts and this tick - the same one
  // that moves the time - recomputes the bar and the countdown from the wall
  // clock. Same words as the build's inWords, so a fresh build and a live
  // count never disagree about how to say "12m".
  //
  // The grid is the pulse's period. A run belongs to the beat that started
  // it, so "next" is the beat after the one the last run fell in - the same
  // rule the scheduler applies, or the board would say "due" eight seconds
  // before the scheduler agreed. The pulse row itself is the grid: its next
  // beat is simply the next boundary, no last-run needed.
  var GRID = Number(document.body.getAttribute('data-grid-ms')) || 300000;
  function inWords(ms) {
    if (ms <= 0) return 'due';
    if (ms < 3600000) return Math.max(1, Math.ceil(ms / 60000)) + 'm';
    if (ms < 86400000) {
      var h = Math.floor(ms / 3600000);
      var m = Math.round((ms % 3600000) / 60000);
      return m ? h + 'h ' + m + 'm' : h + 'h';
    }
    return Math.round(ms / 86400000) + 'd';
  }
  // The build's ago(), reproduced: same rounding, same words. (No backticks in
  // this script - it is the body of a template literal in build-tracker.cjs,
  // and one closed it on 2026-09-13.)
  function agoWords(ms) {
    if (ms < 3600000) return Math.max(1, Math.round(ms / 60000)) + 'm ago';
    if (ms < 86400000) return Math.round(ms / 3600000) + 'h ago';
    return Math.round(ms / 86400000) + 'd ago';
  }
  function hhmm(t) { var d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  // Every time-word on the board, by kind. Each kind is one of the build's
  // own formats; a kind this page does not know is left as built.
  function liveText(kind, at, now) {
    if (kind === 'ago') return agoWords(now - at);
    if (kind === 'since') return inWords(now - at);
    if (kind === 'until') return inWords(at - now);
    if (kind === 'stampago') return hhmm(at) + ' · ' + agoWords(now - at);
    if (kind === 'up') return 'UP ' + Math.floor((now - at) / 86400000) + 'd ' + Math.floor(((now - at) % 86400000) / 3600000) + 'h';
    if (kind === 'uph') return Math.round((now - at) / 3600000) + 'H';
    return null;
  }
  function countdown(now) {
    if (window.__boardFrozen) return;
    var words = document.querySelectorAll('[data-t][data-at]');
    for (var w = 0; w < words.length; w++) {
      var at = Number(words[w].getAttribute('data-at'));
      if (!at) continue;
      var txt = liveText(words[w].getAttribute('data-t'), at, now);
      if (txt !== null && words[w].textContent !== txt) words[w].textContent = txt;
    }
    var cells = document.querySelectorAll('[data-cycle-every]');
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      var every = Number(c.getAttribute('data-cycle-every'));
      if (!every) continue;
      var next;
      if (c.getAttribute('data-cycle-grid') === '1') {
        next = Math.ceil(now / every) * every;
        if (next === now) next += every;
      } else {
        var last = Number(c.getAttribute('data-cycle-last'));
        if (!last) continue;
        next = Math.floor(last / GRID) * GRID + every;
      }
      var left = next - now;
      var elapsed = Math.min(every, every - left);
      var bar = c.querySelector('[data-live="bar"]');
      if (bar) bar.style.width = Math.max(2, Math.min(100, (elapsed / every) * 100)).toFixed(1) + '%';
      var when = c.querySelector('[data-live="when"]');
      if (when) when.textContent = inWords(left);
      var dot = c.querySelector('[data-live="dot"]');
      if (dot) dot.style.opacity = left <= 0 ? '' : '0.4';
    }
  }
  // The last-run facts are refreshed from the server between builds, so a
  // station that fired ten minutes after the build counts down from when it
  // actually fired rather than reading "due" until the next build. Only the
  // last-run moves; the interval stays the built one so the countdown never
  // disagrees with the pace printed beside it. A failed fetch keeps what the
  // page has - that is the disconnected banner's job to report, not this.
  function refreshFacts() {
    fetch(api('/schedule'), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
      .then(function (t) {
        var cells = document.querySelectorAll('[data-cycle-id]');
        for (var i = 0; i < cells.length; i++) {
          var id = cells[i].getAttribute('data-cycle-id');
          if (t[id] && t[id].lastRunAt) cells[i].setAttribute('data-cycle-last', String(t[id].lastRunAt));
        }
        window.__factsAt = Date.now();
      })
      .catch(function () {});
  }
  // The beat lamp beside PULSE. Judged from the stamp the page last fetched;
  // if that fetch is itself stale the lamp goes grey, because a lamp that
  // stays green on old news is the failure it exists to catch.
  // THE PULSE POWERS THE CONVEYOR - operator, 2026-09-14: "tie the conveyor
  // belt into the pulse so the pulse is what keeps the conveyor moving. if the
  // pulse stops the conveyor stops."
  //
  // Then, the same day: "the conveyor is separate from build and runs to show
  // the factory has functional pulse. it's like pulse in motion." So the build
  // always draws the belt WITH its motion - track, orbit, carriers - and this
  // is the only switch: the belt runs while the pulse is beating and stops
  // when it is not. Red - three beats missed, the same fifteen minutes
  // autonomy-check calls an outage - or unknown cuts it. Amber, one late beat,
  // does not: a late beat is not a stopped plant. Load is on the cards, not in
  // the motion.
  //
  // Both kinds of motion have to be stopped, because the carriers ride SMIL
  // animateMotion, which CSS play-state cannot touch: pauseAnimations() on the
  // svg for those, getAnimations() for the CSS track and orbit. Applied every
  // second and idempotent, so the reconnect handler's blanket play() cannot
  // leave the belt running on a dead pulse for more than a tick.
  function powerBelt(on) {
    var svg = document.getElementById('conveyor');
    if (!svg) return;
    var run = on && !window.__boardFrozen;
    try { run ? svg.unpauseAnimations() : svg.pauseAnimations(); } catch (e) {}
    try { svg.getAnimations({ subtree: true }).forEach(function (a) { run ? a.play() : a.pause(); }); } catch (e) {}
    if (svg.getAttribute('data-power') !== (run ? 'on' : 'off')) svg.setAttribute('data-power', run ? 'on' : 'off');
  }
  function beatLamp(now) {
    var cells = document.querySelectorAll('[data-cycle-grid="1"]');
    var power = false;
    for (var i = 0; i < cells.length; i++) {
      var lamp = cells[i].querySelector('[data-live="beat"]');
      if (!lamp) continue;
      var every = Number(cells[i].getAttribute('data-cycle-every')) || GRID;
      var last = Number(cells[i].getAttribute('data-cycle-last'));
      var factsAge = window.__factsAt ? now - window.__factsAt : Infinity;
      var colour, word;
      if (factsAge > 90000 || !last) {
        colour = 'oklch(0.45 0.01 80)'; word = 'pulse: unknown - the page has not heard from the server';
      } else {
        var since = now - last;
        if (since < 2 * every) { colour = 'oklch(0.78 0.16 145)'; word = 'pulse: alive - beat ' + agoWords(since); power = true; }
        else if (since < 3 * every) { colour = 'oklch(0.80 0.14 75)'; word = 'pulse: one beat missed - last ' + agoWords(since); power = true; }
        else { colour = 'oklch(0.70 0.15 25)'; word = 'pulse: NOT BEATING - last ' + agoWords(since); }
      }
      if (lamp.style.background !== colour) lamp.style.background = colour;
      if (lamp.title !== word) lamp.title = word;
    }
    powerBelt(power);
  }
  // THE PULSE CARDS ROLL ON THE WALL CLOCK. /pulse gives the cards and the
  // machine's stage and grace; each second the stage of every card is derived
  // from its age with the machine's own rule, and the three slots - incoming
  // row, belt card, resolved row - are filled from whichever card is in that
  // stage, or drawn as a GAP when none is. So a beat rolls incoming -> belt ->
  // resolved on this page at the moment it happens, with no rebuild, and a
  // missed beat opens a hole at the moment it is missed. The stage rule is
  // duplicated from pulse-belt.cjs deliberately and fed the same numbers; a
  // page that asked the server which stage each card was in would be asking
  // it to do the page's arithmetic on the page's clock.
  function refreshPulse() {
    fetch(api('/pulse'), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
      .then(function (p) { if (p && p.cards) window.__pulse = p; })
      .catch(function () {});
  }
  // The three states are the operator's: belt = the beat that just fired (the
  // newest card), resolved = the one before, incoming = the next beat, computed
  // as last beat plus one and counting down. Same rule as pulseStates in the
  // build, fed the same numbers. The only alarm is a beat that is LATE - past
  // its time plus the machine's grace. Cards older than three beats are ignored
  // as the machine would have pruned them, so a dead pulse empties the belt
  // within fifteen minutes even though nothing is running to prune the file.
  function rollPulse(now) {
    var p = window.__pulse;
    if (!p) return;
    var S = Number(p.stageMs) || GRID;
    var G = Number(p.graceMs) || Math.round(S / 10);
    var live = [];
    for (var i = 0; i < p.cards.length; i++) {
      var at = Date.parse(p.cards[i].at);
      if (at && now - at < 3 * S + G) live.push({ at: at, seq: p.cards[i].seq });
    }
    live.sort(function (a, b) { return b.at - a.at; });
    var newest = live[0] || null, prev = live[1] || null;
    var nextAt = newest ? newest.at + S : null;
    var lateBy = newest ? now - (newest.at + S + G) : null;
    var late = newest ? lateBy > 0 : false;
    var RED = document.body.getAttribute('data-pulse-red') || 'oklch(0.64 0.20 25)';
    var slots = document.querySelectorAll('[data-pulse-slot]');
    for (var j = 0; j < slots.length; j++) {
      var el = slots[j];
      var stage = el.getAttribute('data-pulse-slot');
      var time = el.querySelector('[data-pulse="time"]');
      var text = el.querySelector('[data-pulse="text"]');
      var mark = el.querySelector('[data-pulse="mark"]');
      if (el.tagName.toLowerCase() === 'g') {
        var vis = newest ? 'visible' : 'hidden';
        if (el.getAttribute('visibility') !== vis) el.setAttribute('visibility', vis);
        if (time) time.textContent = newest ? hhmm(newest.at) : '';
        continue;
      }
      var t = '--:--', x, m, dim = false, alarm = false;
      if (stage === 'incoming') {
        if (!newest) { x = 'no pulse recorded — the tick has not beaten in this window'; m = 'GAP'; dim = true; }
        else if (late) { t = hhmm(nextAt); x = 'pulse overdue · late by ' + inWords(lateBy); m = 'LATE'; alarm = true; }
        else { t = hhmm(nextAt); x = 'next pulse · in ' + inWords(nextAt - now); m = 'PULSE'; }
      } else {
        if (prev) { t = hhmm(prev.at); x = 'pulse exited the belt'; m = '✓ exited'; }
        else { x = 'no previous pulse in this window'; m = ''; dim = true; }
      }
      el.style.opacity = dim ? '0.55' : '';
      el.style.boxShadow = alarm ? 'inset 3px 0 0 ' + RED : '';
      if (time && time.textContent !== t) time.textContent = t;
      if (text && text.textContent !== x) text.textContent = x;
      if (mark && mark.textContent !== m) mark.textContent = m;
    }
  }
  function tick() {
    var d = new Date();
    el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    countdown(d.getTime());
    beatLamp(d.getTime());
    rollPulse(d.getTime());
  }
  tick();
  setInterval(tick, 1000);
  refreshFacts();
  setInterval(refreshFacts, 30000);
  refreshPulse();
  setInterval(refreshPulse, 30000);

  // LIVE CHATS on the chat door, from /chat every thirty seconds: how many
  // Claude sessions have written a transcript in this repo inside the belt's
  // liveness window. The host-wide count travels on the element for the
  // explain panel to read. A failed fetch leaves the built number; the frozen
  // banner is what reports a server that has gone quiet.
  function refreshChat() {
    fetch(api('/chat'), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
      .then(function (c) {
        var el = document.querySelector('[data-chat-live]');
        if (!el) return;
        var txt = c && c.seen && typeof c.active === 'number' ? c.active + ' ACTIVE' : '? ACTIVE';
        if (el.textContent !== txt) el.textContent = txt;
        if (c && typeof c.host === 'number') el.setAttribute('data-chat-host', String(c.host));
      })
      .catch(function () {});
  }
  refreshChat();
  setInterval(refreshChat, 10000);

  // THE FOUR CORNERS COUNT ACTIVE WORK, every ten seconds from /activity, with
  // the same predicates the build used. A pill at zero is hidden, not blanked,
  // so "none" still reads as none and comes back the moment work arrives.
  function setCorner(name, n) {
    var g = document.querySelector('[data-corner="' + name + '"] [data-corner-chip]');
    if (!g) return;
    var vis = n ? 'visible' : 'hidden';
    if (g.getAttribute('visibility') !== vis) g.setAttribute('visibility', vis);
    var t = g.querySelector('[data-corner-n]');
    var txt = n ? String(n) : '';
    if (t && t.textContent !== txt) t.textContent = txt;
  }
  function refreshActivity() {
    fetch(api('/activity'), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
      .then(function (a) {
        if (!a) return;
        if (a.timer) setCorner('TIMER', (a.timer.running || 0) + (a.timer.due || 0) + (a.timer.queued || 0));
        if (a.watcher) setCorner('WATCHER', a.watcher.findingsLastHour || 0);
        if (a.supervisor) setCorner('SUPERVISOR', (a.supervisor.awaitingTriage || 0) + (a.supervisor.held || 0));
        if (a.builder) setCorner('BUILDER', a.builder.building || 0);
      })
      .catch(function () {});
  }
  refreshActivity();
  setInterval(refreshActivity, 10000);

  // THE SESSION CARDS, from /sessions every ten seconds. The set the timer
  // placed is re-drawn only when it changes - adding a card restarts nothing
  // else - and a session that has fallen silent for the belt's thirty minutes
  // is dropped on the wall clock before the next beat would drop it. Same
  // markup as the build's sessionCard, so a fresh build and a live re-render
  // draw the same card.
  var RED = document.body.getAttribute('data-pulse-red') || 'oklch(0.64 0.20 25)';
  var SESSION_HUE = { chat: 'oklch(0.74 0.13 195)', auto: 'oklch(0.80 0.12 75)', spawn: 'oklch(0.72 0.13 150)', pulse: RED };
  var SESSION_INK = { chat: 'oklch(0.86 0.14 195)', auto: 'oklch(0.88 0.13 75)', spawn: 'oklch(0.84 0.14 150)', pulse: 'oklch(0.78 0.20 25)' };
  var SESSION_CODE = { chat: 'CH', auto: 'AU', spawn: 'SP', pulse: 'PU' };
  var lookOf = function (s) { return s.role === 'pulse' ? 'pulse' : s.kind; };
  var sessionKey = '';
  // The same three door glyphs the build draws (DOOR_GLYPH): person, arrow,
  // robot. Duplicated here by necessity, so a live redraw and a fresh build
  // wear the same mark.
  function doorGlyph(kind, ink) {
    if (kind === 'auto') return '<path d="M7.5 -3A8 8 0 1 0 8 3.5" style="stroke:' + ink + '; stroke-width:2; fill:none"></path><path d="M4 -7.5L8.5 -3L4 1" style="stroke:' + ink + '; stroke-width:2; fill:none"></path>';
    if (kind === 'spawn') return '<path d="M0 -10.5V-7" style="stroke:' + ink + '; stroke-width:2"></path><circle cx="0" cy="-12" r="1.8" style="fill:' + ink + '"></circle><rect x="-8" y="-7" width="16" height="14" rx="4" style="stroke:' + ink + '; stroke-width:2; fill:none"></rect><circle cx="-3.2" cy="0" r="1.7" style="fill:' + ink + '"></circle><circle cx="3.2" cy="0" r="1.7" style="fill:' + ink + '"></circle>';
    return '<circle cx="0" cy="-5" r="5" style="stroke:' + ink + '; stroke-width:2; fill:none"></circle><path d="M-8.5 8.5C-8.5 2.5 -4.5 0.5 0 0.5C4.5 0.5 8.5 2.5 8.5 8.5" style="stroke:' + ink + '; stroke-width:2; fill:none"></path>';
  }
  function doorIconHtml(kind, ink, px) {
    return '<svg viewBox="-12 -14 24 26" width="' + px + '" height="' + px + '" fill="none" style="flex:none">' + doorGlyph(kind, ink) + '</svg>';
  }
  function sessionCardHtml(s, k, n) {
    var stagger = ((k * 40) / Math.max(1, n) + 13).toFixed(2);
    var look = lookOf(s);
    var hue = SESSION_HUE[look] || SESSION_HUE.chat;
    var ink = SESSION_INK[look] || SESSION_INK.chat;
    var glyph = look === 'pulse'
      ? '<path d="M-32 0H-29.5L-27.8 -4L-25.5 4L-23.8 0H-21" style="stroke:' + ink + '; stroke-width:1.7; fill:none; stroke-linejoin:round; stroke-linecap:round"></path>'
      : '<g transform="translate(-25.5 0.8) scale(0.65)">' + doorGlyph(s.kind, ink) + '</g>';
    // Single quotes only: the computed family is "JetBrains Mono", ui-monospace,
    // monospace, and its double quotes split a style attribute into garbage -
    // measured 2026-09-14, three <text> nodes with fill:none, a card with a
    // glyph and no words.
    var mono = getComputedStyle(document.getElementById('clock')).fontFamily.replace(/"/g, "'");
    return '<g data-session="' + s.id + '" data-session-kind="' + look + '" data-session-at="' + s.at + '"><g>'
      + '<rect x="-40" y="-11" width="80" height="22" rx="3" style="fill:oklch(0.95 0.008 85)"></rect>'
      + '<rect x="-40" y="-11" width="3.5" height="22" style="fill:' + hue + '"></rect>'
      + '<rect x="-34" y="-8.5" width="17" height="17" rx="3" style="fill:oklch(0.20 0.012 70)"></rect>' + glyph
      + '<text x="-7" y="4.5" text-anchor="middle" style="font-family:' + mono + '; font-size:13px; font-weight:700; letter-spacing:0.04em; fill:oklch(0.20 0.012 70)">' + (SESSION_CODE[look] || 'CH') + '</text>'
      + '<text x="20" y="4.5" text-anchor="middle" style="font-family:' + mono + '; font-size:12.5px; letter-spacing:0.02em; fill:oklch(0.28 0.012 70)">' + String(s.short || s.id).slice(0, 4) + '</text>'
      + '</g><animateMotion dur="' + (39 + (k % 3)) + 's" begin="-' + stagger + 's" repeatCount="indefinite" rotate="0"><mpath href="#board"></mpath></animateMotion></g>';
  }
  function renderSessions(list) {
    var box = document.querySelector('[data-sessions]');
    if (!box) return;
    var now = Date.now();
    var alive = list.filter(function (s) { return s.at && now - s.at < 30 * 60000; }).sort(function (a, b) { return b.at - a.at; });
    var key = alive.map(function (s) { return s.id; }).join(',');
    if (key === sessionKey) return;
    sessionKey = key;
    box.innerHTML = alive.map(function (s, k) { return sessionCardHtml(s, k, alive.length); }).join('');
    // The belt's power still applies to whatever was just drawn.
    powerBelt(document.getElementById('conveyor').getAttribute('data-power') === 'on');
    // And the PROCESSING list, one row per session, same shape as a deposit row.
    var rows = document.querySelector('[data-session-rows]');
    if (rows) {
      var mono = getComputedStyle(document.getElementById('clock')).fontFamily.replace(/"/g, "'");
      rows.innerHTML = alive.map(function (s) {
        var look = lookOf(s);
        var hue = SESSION_HUE[look] || SESSION_HUE.chat;
        var handle = (SESSION_CODE[look] || 'CH') + ' ' + String(s.short || s.id).slice(0, 4);
        var rowIcon = look === 'pulse'
          ? '<svg viewBox="0 0 24 14" width="16" height="10" fill="none" style="flex:none"><path d="M1 7H7L9.5 1.5L13 12.5L15.5 7H23" stroke="' + hue + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>'
          : doorIconHtml(s.kind, hue, 16);
        var who = s.role === 'pulse' ? 'pulse routine' : (s.kind === 'auto' ? 'routine' + (s.routine ? ' · ' + s.routine : '') : s.kind);
        var esc = function (t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
        var what = s.title ? esc(s.title) : (s.kind === 'spawn' ? 'spawned session' + (s.worktree ? ' · ' + esc(s.worktree) : '') : 'chat session · untitled');
        if (s.worktree && s.title) what += ' <span style="color:oklch(0.58 0.01 80)">· ' + esc(s.worktree) + '</span>';
        var active = now - s.at < GRID;
        return '<div class="feedrow beltrow" data-session-row="' + s.id + '" title="' + s.id + '" style="display:grid; grid-template-columns:76px 56px minmax(0,1fr) 92px; align-items:center; gap:10px; padding:9px 0; border-top:1px solid oklch(0.22 0.012 70)">'
          + '<span style="display:flex; align-items:center; gap:6px; font-family:' + mono + '; font-size:14px; font-weight:500; letter-spacing:0.04em; color:' + hue + '">' + rowIcon + handle + '</span>'
          + '<span style="font-family:' + mono + '; font-size:15px; color:oklch(0.62 0.01 80)">' + hhmm(s.at) + '</span>'
          + '<span class="rowtext" style="font-size:16px; line-height:1.35; color:oklch(0.90 0.008 85)">' + what + '</span>'
          + '<span data-t="ago" data-at="' + s.at + '" style="font-family:' + mono + '; font-size:13px; color:oklch(0.76 0.12 75); text-align:right; white-space:nowrap">' + agoWords(now - s.at) + '</span>'
          + '<p class="beltagent" style="grid-column:1 / -1"><span class="agentdot" style="background:' + hue + '"></span><b>' + esc(who) + '</b><span class="agentsess">' + s.id + '</span><span class="agentlive">' + (active ? 'active' : 'alive') + '</span></p>'
          + '</div>';
      }).join('');
      var empty = document.querySelector('[data-belt-empty]');
      if (empty) empty.hidden = alive.length > 0 || document.querySelectorAll('.beltrow[data-rid]').length > 0;
    }
  }
  function refreshSessions() {
    fetch(api('/sessions'), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad status')); })
      .then(function (p) {
        if (!p || !Array.isArray(p.sessions)) return;
        window.__sessions = p.sessions.map(function (s) { return { id: s.id, short: s.short, kind: s.kind, role: s.role || null, routine: s.routine || null, worktree: s.worktree || null, title: s.title || null, at: Date.parse(s.lastWrite) || 0 }; });
        renderSessions(window.__sessions);
      })
      .catch(function () {});
  }
  refreshSessions();
  setInterval(refreshSessions, 10000);
  // And on the wall clock between fetches, so a silent session leaves on time.
  setInterval(function () { if (window.__sessions) renderSessions(window.__sessions); }, 30000);
</script>

<!-- PLAN INSPECTION. Operator, 2026-09-21: "I need inspection on those plans.
     Pop up, and if possible an Add Notes to it and on save ai will read the
     notes and act on it."
     It sits OUTSIDE #stage on purpose. #stage is a fixed 1920x1080 surface
     scaled to whatever the board is being shown on, so anything inside it is
     scaled too - and an inspection panel that shrinks to 43% on a laptop is
     the one thing here that must stay readable. -->
<!-- display:none INLINE, and NOT the hidden attribute. This element carries an
     inline display:flex for its centring, and an inline style beats the hidden
     attribute's display:none unless a rule marks it !important - so the first
     version set the attribute and nothing moved on screen: Close appeared
     dead, and a refresh showed an empty collapsed overlay sitting over the
     board. The operator found it by using it. This file already carried that
     exact warning, on the incoming filter, and it was read and then not
     applied here.
     No backticks in this comment either: it is emitted from a template
     literal, so one would end the literal and stop the file parsing - which it
     did, once, while this very comment was being written. -->
<div id="planmodal" style="position:fixed; inset:0; z-index:60; background:oklch(0.10 0.01 70 / 0.82); display:none; align-items:center; justify-content:center; padding:24px">
  <div id="planmodalcard" style="background:oklch(0.17 0.012 70); border:1px solid oklch(0.34 0.012 70); border-radius:10px; width:min(760px, 96vw); max-height:88vh; overflow:auto; padding:18px 20px; box-shadow:0 18px 60px oklch(0.05 0.01 70 / 0.7)">
    <div id="planmodalbody"></div>
  </div>
</div>

<script>
  // The register, keyed by plan id, for the inspection panel. Serialised with
  // JSON.stringify rather than interpolated field by field, and with the one
  // sequence that can end a script block neutralised - a title containing
  // "&lt;/script&gt;" would otherwise close this tag and break every script after it.
  window.__plans = ${JSON.stringify(
    Object.fromEntries(D.plans.rows.map((r) => [r.id, r])),
  ).replace(/<\//g, "<\\/")};
</script>

<script>
  // THE NOTE IS NOT A COMMENT FIELD. Saving one appends a DEPOSIT to the belt -
  // the same channel every other piece of work enters by, and the same one the
  // intake worker already drains. So "an agent reads it and acts on it" is not
  // a new capability wired up here; it is the existing one reached from a new
  // place. What it is NOT is instant: a deposit is seen, not yet judged, and it
  // waits in incoming for triage exactly like everything else. The panel says
  // that in those words, because a box that implies an agent is already working
  // would be the kind of promise this board exists to refuse.
  (function () {
    var PLANS = window.__plans || {};
    var modal = document.getElementById('planmodal');
    var body = document.getElementById('planmodalbody');
    if (!modal || !body) return;
    var openId = null;
    // UNSENT NOTES SURVIVE A CLOSE. The panel rebuilds its body every time it
    // opens, so the first version lost whatever was typed the moment Escape was
    // pressed - and Escape is the fastest way to close anything. A half-written
    // thought is the most expensive thing on this panel: it is the one part
    // that exists nowhere else yet. Kept per plan, in memory, cleared only when
    // the note actually reaches the belt.
    var drafts = {};
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    function list(title, arr) {
      if (!arr || !arr.length) return '';
      return '<div style="margin-top:12px"><div style="font-family:ui-monospace,monospace; font-size:11px; letter-spacing:0.14em; color:oklch(0.60 0.01 80); margin-bottom:4px">' + esc(title) + '</div><ul style="margin:0; padding-left:18px; font-size:13px; line-height:1.5; color:oklch(0.84 0.01 85)">' + arr.map(function (x) { return '<li style="margin-bottom:3px">' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    }
    function para(title, text) {
      if (!text) return '';
      return '<div style="margin-top:12px"><div style="font-family:ui-monospace,monospace; font-size:11px; letter-spacing:0.14em; color:oklch(0.60 0.01 80); margin-bottom:4px">' + esc(title) + '</div><p style="margin:0; font-size:13px; line-height:1.55; color:oklch(0.84 0.01 85)">' + esc(text) + '</p></div>';
    }
    function render(p) {
      body.innerHTML =
        '<div style="display:flex; align-items:flex-start; gap:12px">' +
          '<span style="flex:0 0 auto; font-family:ui-monospace,monospace; font-size:10px; letter-spacing:0.08em; color:oklch(0.72 0.11 300); border:1px solid oklch(0.42 0.08 300); border-radius:3px; padding:1px 4px; margin-top:4px">PL</span>' +
          '<div style="flex:1 1 auto; min-width:0">' +
            '<div style="font-size:18px; line-height:1.3; color:oklch(0.94 0.008 85)">' + esc(p.title) + '</div>' +
            '<div style="font-family:ui-monospace,monospace; font-size:11px; color:oklch(0.56 0.01 80); margin-top:3px">' + esc(p.id) + (p.owner ? ' &middot; ' + esc(p.owner) : '') + ' &middot; ' + esc(p.status) + (p.updated ? ' &middot; updated ' + esc(String(p.updated).slice(0, 10)) : '') + '</div>' +
          '</div>' +
          // A 23px-tall target is too small, and this project has already paid
          // for that lesson once: a 13px link was missed over and over until it
          // was given a padded 28px target. This one is 34px and says the two
          // other ways out, because a dialog whose only exit is a small button
          // is one bad click from feeling stuck.
          //
          // NO INLINE onmouseover HERE, AND THE REASON MATTERS. This whole
          // script is emitted from a Node template literal, so a backslash in
          // it is consumed before it is ever written: an escaped quote inside
          // an inline handler arrived in the page as a bare quote, which is a
          // syntax error that killed this entire script - the panel stopped
          // opening at all. Hover is attached as a listener below, where no
          // quote has to survive two layers of escaping. Same class of bug as
          // the newline that stopped the file parsing earlier today.
          '<button id="planclose" title="Close - or press Escape, or click outside" style="flex:0 0 auto; cursor:pointer; background:oklch(0.22 0.012 70); border:1px solid oklch(0.40 0.012 70); color:oklch(0.86 0.01 80); border-radius:7px; padding:8px 16px; font-size:13px; line-height:1; transition:background 120ms, border-color 120ms">Close</button>' +
        '</div>' +
        (p.note ? '<div style="margin-top:12px; font-size:13px; line-height:1.55; color:oklch(0.80 0.01 85); border-left:2px solid oklch(0.42 0.08 300); padding-left:10px">' + esc(p.note) + '</div>' : '') +
        para('THE PROBLEM', p.problem) +
        para('SMALLEST END TO END', p.smallest) +
        para('CONSTRAINT', p.constraint) +
        list('ACCEPTANCE CRITERIA', p.criteria) +
        list('NOT IN SCOPE', p.nonScope) +
        list('OPEN QUESTIONS', p.questions) +
        list('TOUCHES', p.paths) +
        (p.branch || p.spec
          ? '<div style="margin-top:12px; font-family:ui-monospace,monospace; font-size:11px; color:oklch(0.56 0.01 80)">' + (p.branch ? 'branch ' + esc(p.branch) : '') + (p.branch && p.spec ? ' &middot; ' : '') + (p.spec ? esc(p.spec) : '') + '</div>'
          : '') +
        '<div style="margin-top:16px; border-top:1px solid oklch(0.26 0.012 70); padding-top:12px">' +
          '<div style="font-family:ui-monospace,monospace; font-size:11px; letter-spacing:0.14em; color:oklch(0.60 0.01 80); margin-bottom:5px">ADD A NOTE</div>' +
          '<textarea id="plannote" rows="3" placeholder="What should happen with this plan?" style="width:100%; box-sizing:border-box; background:oklch(0.13 0.01 70); color:oklch(0.90 0.008 85); border:1px solid oklch(0.32 0.012 70); border-radius:7px; padding:8px 10px; font-size:13px; line-height:1.5; font-family:inherit; resize:vertical"></textarea>' +
          '<div style="display:flex; align-items:center; gap:10px; margin-top:8px; flex-wrap:wrap">' +
            '<button id="plansave" style="cursor:pointer; background:oklch(0.30 0.06 300); color:oklch(0.94 0.01 300); border:1px solid oklch(0.46 0.08 300); border-radius:7px; padding:8px 14px; font-size:13px; font-weight:600">Save to the belt</button>' +
            // THE GO SWITCH. Off, a note is a deposit: seen, not yet judged,
            // and nobody owes anything on it. On, the same save also performs
            // the triage act, so it lands as a contract - work somebody owes -
            // without having to be found again in INCOMING afterwards.
            //
            // It is a real switch rather than a second button because the
            // decision belongs WITH the writing: by the time a note is written
            // its author already knows whether it is a thought or a job, and
            // making them come back later to say so is how a queue fills with
            // things nobody ever promoted.
            '<label id="plangowrap" title="Go marks this as work somebody owes, instead of a thought waiting to be judged. It does not start an agent this second." style="display:inline-flex; align-items:center; gap:7px; cursor:pointer; padding:7px 11px; border:1px solid oklch(0.34 0.012 70); border-radius:7px; font-size:13px; color:oklch(0.78 0.01 80)">' +
              '<input id="plango" type="checkbox" style="width:15px; height:15px; accent-color:oklch(0.62 0.13 150); cursor:pointer">' +
              '<span>Go</span>' +
            '</label>' +
            '<span id="planstatus" style="font-size:12px; color:oklch(0.60 0.01 80)">Saved without Go it waits in INCOMING as a thought. With Go it becomes work somebody owes.</span>' +
          '</div>' +
        '</div>';
      var close = document.getElementById('planclose');
      if (close) {
        close.addEventListener('click', hide);
        close.addEventListener('mouseenter', function () {
          close.style.background = 'oklch(0.28 0.012 70)';
          close.style.borderColor = 'oklch(0.56 0.012 70)';
        });
        close.addEventListener('mouseleave', function () {
          close.style.background = 'oklch(0.22 0.012 70)';
          close.style.borderColor = 'oklch(0.40 0.012 70)';
        });
      }
      var save = document.getElementById('plansave');
      if (save) save.addEventListener('click', function () { submit(p); });
      var ta = document.getElementById('plannote');
      if (ta) {
        if (drafts[p.id]) ta.value = drafts[p.id];
        ta.addEventListener('input', function () { drafts[p.id] = ta.value; });
      }
    }
    function submit(p) {
      var ta = document.getElementById('plannote');
      var status = document.getElementById('planstatus');
      var note = ta && ta.value ? ta.value.trim() : '';
      if (!note) {
        if (status) { status.textContent = 'Nothing to save yet.'; status.style.color = 'oklch(0.76 0.12 75)'; }
        return;
      }
      var goBox = document.getElementById('plango');
      var go = !!(goBox && goBox.checked);
      if (status) { status.textContent = go ? 'Saving and marking Go...' : 'Saving...'; status.style.color = 'oklch(0.60 0.01 80)'; }
      fetch('/plan-note' + (location.search || ''), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId: p.id, title: p.title, status: p.status, owner: p.owner, note: note, go: go })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (out) {
          if (!out.ok) throw new Error((out.j && out.j.error) || 'refused');
          if (status) {
            // Three outcomes, three sentences. Asking for Go and not getting it
            // is the one that must never read like success: the note is safe,
            // and it is still only a thought.
            if (out.j.go) {
              status.textContent = 'Marked Go. It is now work somebody owes, and shows on the belt at the next build.';
              status.style.color = 'oklch(0.72 0.13 150)';
            } else if (out.j.goWhy) {
              status.textContent = out.j.goWhy;
              status.style.color = 'oklch(0.76 0.12 75)';
            } else {
              status.textContent = 'Saved as a thought in INCOMING. Nothing is owed on it until it is marked Go.';
              status.style.color = 'oklch(0.72 0.13 150)';
            }
          }
          // Cleared only here, where the record exists on the belt. Anywhere
          // else and a failed save would quietly take the note with it.
          delete drafts[p.id];
          if (ta) ta.value = '';
        })
        .catch(function (err) {
          // AN HONEST FAILURE, NOT A SILENT ONE. A board opened as a saved file
          // has no server to post to, and saying "saved" there would be a lie
          // that loses the note. So it says where it is and hands it back.
          if (status) {
            status.textContent = 'Could not save (' + (err && err.message ? err.message : 'no board server') + '). Your note is still in the box - copy it before closing.';
            status.style.color = 'oklch(0.76 0.12 25)';
          }
        });
    }
    // Shown and hidden by the property that actually paints, never by a flag.
    // isOpen asks the computed style rather than a variable, so nothing here
    // can confirm its own assignment and call that working.
    function isOpen() {
      return window.getComputedStyle(modal).display !== 'none';
    }
    function show(id) {
      var p = PLANS[id];
      if (!p) return;
      openId = id;
      render(p);
      modal.style.display = 'flex';
    }
    function hide() {
      modal.style.display = 'none';
      openId = null;
    }
    document.addEventListener('click', function (e) {
      var row = e.target && e.target.closest ? e.target.closest('.planrow') : null;
      if (row && row.getAttribute('data-plan-id')) { show(row.getAttribute('data-plan-id')); return; }
      if (e.target === modal) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) hide();
    });
  })();
</script>

</body></html>
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, "utf8");

// ---- WHAT THE BOARD INTENDED TO DRAW ----------------------------------------
//
// The manager compares the belt against the board, which is the only check that
// can catch two readers sharing a wrong assumption. It used to do that by
// re-deriving the board's row rule from the belt itself - a ninth copy of a rule
// this file already holds - and the copy was wrong in a way no single-source
// check could see: it counted every open item, while the column legitimately
// omits whatever is on the belt.
//
// So the board states its own numbers here, with the time it built them. The
// manager compares the seer's RENDERED count against this, and this against the
// belt. Two comparisons, two sources each, and neither reader re-derives the
// other's rule.
const counts = {
  builtAt: new Date(now).toISOString(),
  records: records.length,
  incomingRows: D.incoming.length,
  resolvedRows: D.resolved.length,
  noteRows: D.notes.length,
  unreadNotes: D.unreadNotes,
  onBelt: D.onBelt.length,
  openContracts: IX.counts.openContracts,
  awaitingTriage: IX.counts.awaitingTriage,
  heldDecisions: IX.counts.openDecisions,
  circulating: circulating.length,
  unplaced,
  byStatus: D.statusCounts,
  byKind: D.kindCounts,
  badKinds: IX.badKinds,
};
try {
  fs.writeFileSync(path.join(CTX, "board-counts.json"), JSON.stringify(counts, null, 2) + "\n");
} catch {
  /* the board still draws; only the cross-source check is degraded, and it says so */
}

console.log(`tracker: ${path.relative(ROOT, OUT)}`);
console.log(
  `  belt ${records.length} (${D.openCount} open, ${leaks.length} leak)  |  needs-you ${D.leakCount}  |  triggers ${stations.length}  |  cycle ${D.cycle}  |  routes ${D.routesProven}`,
);
console.log(
  `  kinds: ${IX.counts.openContracts} contract(s) open, ${IX.counts.awaitingTriage} awaiting triage, ${IX.counts.openDecisions} for you, ${D.notes.length} note(s) (${D.unreadNotes} unread)`,
);
if (IX.badKinds.length) {
  console.log(`  FAULT: ${IX.badKinds.length} record(s) declare a kind outside the vocabulary and were read as deposits:`);
  for (const b of IX.badKinds) console.log(`    ${b.id} -> "${b.kind}"`);
}
if (!pulse) console.log("  note: no pulse.json - run npm run pulse first for live fault detection");
if (!Object.keys(extras).length) console.log("  note: no tracker-extras.json - hive channel count shows as unknown");
