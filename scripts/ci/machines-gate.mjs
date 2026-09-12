#!/usr/bin/env node
/**
 * THE MACHINES GATE - the only thing in this repo that checks anything.
 *
 * WHY IT HAS TO EXIST, AND WHY IT HAS TO BE RUNNABLE BY HAND.
 *
 * There is no deploy step here. The scheduler reads `machines/*.cjs` off disk at
 * the moment it fires, every five minutes, against a live board. Saving a file
 * IS deploying it. Measured 2026-09-12: a worker was midway through editing
 * `watcher.cjs` when the 12:50 tick fired, ran the half-written file, and armed
 * eight annotations onto the live belt.
 *
 * So a gate that only runs on GitHub is a gate that runs AFTER the damage. It is
 * worth having - it is what makes a pull request mean something - but it is the
 * second line, not the first. THE FIRST LINE IS THIS SCRIPT, RUN BEFORE THE SAVE
 * THAT GOES LIVE:
 *
 *   npm run gate:machines
 *
 * THREE CHECKS, each one bought by a failure that actually happened.
 *
 *   parse   `node --check` every machine. This is the one that would have caught
 *           the half-written watcher. It is cheap and it is the whole reason the
 *           file exists.
 *
 *   bom     No LITERAL U+FEFF anywhere in tracked source. Write the six-character
 *           escape instead. A literal is invisible in every editor, diff and
 *           grep - which is how one ended up inside a lock file and made it read
 *           as unreadable, evicting a live lock holder. Ten were swept out on
 *           2026-09-12; this stops the eleventh. The check is deliberately about
 *           the character and not about byte-order marks at position 0: the one
 *           that did the damage was in the middle of a regex.
 *
 *   smoke   Every machine's read-only path is RUN, against a throwaway fixture
 *           repo, and its exit code compared to what it is supposed to be. This
 *           is what catches a ReferenceError that `node --check` cannot see,
 *           because a parse check proves a file is grammatical and nothing more.
 *
 * THE SMOKE RUNS AGAINST A FIXTURE, NEVER AGAINST THIS REPO OR ANY REAL ONE.
 * Every machine resolves its subject from `process.cwd()` (P13), so the fixture
 * is just a temp directory with a belt in it. That is not only for safety - it
 * is coverage. A machine run in a repo with no belt exercises only its
 * not-applicable branch, and a check that cannot fail is worse than no check
 * because it is trusted. The fixture has records of all four kinds, so the
 * machines do real work and return a real verdict.
 *
 * EACH CASE GETS ITS OWN FIXTURE. Some machines deposit - `manager.cjs` appends
 * two records on the run below - and a shared fixture would make one case's
 * expected exit code depend on which cases ran before it.
 *
 * EXPECTED EXIT CODES ARE EXACT WHERE THE ANSWER IS A PROPERTY OF THE FIXTURE.
 * A non-zero exit is not a failure here: `pulse-check` exiting 1 on this fixture
 * is the CORRECT answer, and it turning 0 would mean something broke. Only
 * `provider-watch` gets a set rather than a number, because it asks the host
 * whether Docker is running and that is not a property of this repo.
 *
 * THE MANIFEST MUST COVER EVERY FILE IN machines/. A machine added without an
 * entry fails the gate. Otherwise the gate silently stops checking the newest
 * thing in the repo, which is the state this repo was already in.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MACHINES = join(REPO, "machines");
const VERBOSE = process.argv.includes("--verbose");

const failures = [];
const fail = (check, detail) => failures.push({ check, detail });
const note = (s) => VERBOSE && console.log(`      ${s}`);

// ---------------------------------------------------------------------------
// THE FIXTURE - a repo-shaped temp directory, built fresh for every case.
// ---------------------------------------------------------------------------

// Five records covering all four kinds, because the machines branch on kind and
// a belt of one shape exercises one branch. `open-deposit-one` is accepted as
// work by the last record, so the fixture has a real contract as well as a real
// untriaged deposit - which is the distinction most of these machines exist to
// make.
const BELT = [
  { id: "belt-opened", run: "2026-09-10T23:50Z", driver: "none", tier: 0, dimension: "architecture", subject: ".claude/agent-context/findings.jsonl", claim: "The belt is open.", evidence: "gate fixture", seen: false, confidence: "measured", triggers: "terminal:definition", owner: "operator" },
  { id: "open-deposit-one", run: "2026-09-11T01:00Z", driver: "I1", tier: 4, dimension: "body", subject: "src/thing.ts", claim: "A thing is wrong.", evidence: "gate fixture", seen: false, confidence: "measured", recommend: "Fix the thing.", owner: "claude" },
  { id: "open-deposit-two", run: "2026-09-11T02:00Z", driver: "I1", tier: 5, dimension: "mind", subject: "public.widgets", claim: "Another thing is wrong.", evidence: "gate fixture", seen: false, confidence: "measured", owner: "claude" },
  { id: "his-decision", run: "2026-09-11T03:00Z", driver: "I1", tier: 1, dimension: "architecture", subject: "direction", claim: "A taste call.", evidence: "gate fixture", seen: false, confidence: "measured", triggers: "operator", owner: "operator" },
  { id: "accept-open-deposit-one", run: "2026-09-11T04:00Z", driver: "I1", tier: 4, dimension: "body", subject: "open-deposit-one", claim: "Accepted as work.", evidence: "gate fixture", seen: false, confidence: "measured", kind: "CONTRACT", triggers: "terminal:triaged", owner: "claude" },
];

// One trigger declaration, so the machines that read a repo's cadence have
// something to read. Its `run` names a machine by the `factory:` form the
// discovery path resolves, because a declaration naming a path would not test
// the resolution.
const TRIGGER = { id: "pulse", run: "factory:pulse-check", every: "1h", floor: "5m", why: "gate fixture" };

function buildFixture() {
  const root = mkdtempSync(join(tmpdir(), "machines-gate-"));
  mkdirSync(join(root, ".claude/agent-context"), { recursive: true });
  mkdirSync(join(root, "tools/factory"), { recursive: true });
  writeFileSync(join(root, ".claude/agent-context/findings.jsonl"), BELT.map((r) => JSON.stringify(r)).join("\n") + "\n");
  writeFileSync(join(root, "tools/factory/pulse.trigger.json"), JSON.stringify(TRIGGER, null, 2) + "\n");
  return root;
}

// ---------------------------------------------------------------------------
// THE MANIFEST - every file in machines/, and what running it proves.
// ---------------------------------------------------------------------------
//
//   args   the read-only invocation. [] means the file is a library: it is
//          `require`d, which proves it loads and its top level does not throw.
//   exit   what that invocation returns against the fixture above. A number, or
//          a set with a reason when the answer is not a property of this repo.
//   writes true when the run appends to the fixture belt. Recorded so nobody
//          ever points the smoke at a real repo believing it to be inert.
//   none   a reason this machine has no path that can be run here. It still gets
//          parsed and BOM-checked; it just cannot be exercised.

const MANIFEST = {
  "autonomy-check.cjs": { args: ["--json"], exit: 1, why: "eight conditions, and a fixture meets one - exit 1 is the honest answer" },
  "board-see.cjs": { none: "drives a real browser against a served board; needs puppeteer and a listening server, neither of which exists in a fixture" },
  "board-serve-check.cjs": { none: "its whole purpose is to REVIVE a dead server - it spawns a long-lived process, so there is no read-only form of it" },
  "composition-watch.cjs": { args: ["--dry", "--json"], exit: 0, why: "no src/app in the fixture, so it reports NOT APPLICABLE and exits clean - which is the behaviour P13 requires of a machine whose subject is absent" },
  "deposit.cjs": { args: ["--open"], exit: 0, why: "three open records, listed by handle" },
  "exit-worker.cjs": { args: ["--dry", "--json"], exit: 0, why: "nothing is held by a live session, so nothing was abandoned" },
  "intake-worker.cjs": { args: ["--json"], exit: 0, why: "selects and briefs without --dispatch; exit 0 always, because an empty morning is healthy" },
  "kind.cjs": { args: [], exit: 0, why: "library - the belt's vocabulary, required by everything that reads it" },
  "manager.cjs": { args: ["--json"], exit: 1, writes: true, why: "finds work nobody is carrying. HAS NO READ-ONLY FLAG: this run appends two records, which is safe only because the fixture is a temp directory" },
  "mind-watch.cjs": { args: ["--dry", "--json"], exit: 1, why: "no database credentials, and it refuses to report a condition as met because it could not check" },
  "night-watch.cjs": { args: ["--json"], exit: 2, why: "no baseline was ever marked. Exit 2 and not 1: never-ran and ran-and-found-nothing are different facts" },
  "provider-watch.cjs": { args: ["--json"], exit: [0, 1], why: "asks the host whether Docker is running, which is not a property of this repo. Both codes are correct; crashing is not, so the run must still emit JSON carrying docker.reachable", expect: (out) => "reachable" in (JSON.parse(out).docker || {}) },
  "pulse-check.cjs": { args: ["--json"], exit: 1, why: "the fixture's trigger has never run and two records name nothing to trigger - both are real faults and it must say so" },
  "session-life.cjs": { args: [], exit: 0, why: "library - the one definition of whether a dispatched agent is still alive" },
  "triage.cjs": { args: ["--list"], exit: 0, why: "lists what is awaiting judgement" },
  "triggers.cjs": { args: [], exit: 0, why: "library - where trigger declarations live and what the schedule state is called" },
  "watcher.cjs": { args: ["--dry", "--json"], exit: 0, why: "judges all five zones and, without --arm, writes nothing to the belt at all" },
};

// ---------------------------------------------------------------------------
// CHECK 1 - every machine parses.
// ---------------------------------------------------------------------------

function checkParse(files) {
  console.log("  parse");
  for (const f of files) {
    const r = spawnSync(process.execPath, ["--check", join(MACHINES, f)], { encoding: "utf8" });
    if (r.status !== 0) fail("parse", `${f}\n${(r.stderr || "").trim()}`);
    else note(`ok  ${f}`);
  }
}

// ---------------------------------------------------------------------------
// CHECK 2 - no literal U+FEFF in tracked source.
// ---------------------------------------------------------------------------

// Written as the escape, which is the whole point of the rule this enforces.
const ZWNBSP = /﻿/;
const BINARY = /\.(png|jpe?g|gif|webp|ico|svg|pdf|zip|gz|woff2?|ttf|eot|mp4|webm|vsix|exe|dll|node)$/i;

// PARSED means something reads this file with a parser or a regex, so a stray
// U+FEFF changes what it means. Those FAIL.
//
// Everything else is prose. A U+FEFF at the front of a markdown file is inert -
// nothing parses it - and failing the build over one would buy an ignore-list,
// which is how a gate rots. Those are REPORTED instead, never suppressed: 86
// vendored law documents under unscripted-laws/ carry five of them, and the
// difference between "none" and "five that do no harm" is a fact worth keeping
// visible rather than a number to hide.
const PARSED = /\.(cjs|mjs|js|jsx|ts|tsx|json|jsonl|mts|cts)$/i;

function trackedFiles() {
  const r = spawnSync("git", ["ls-files", "-z"], { cwd: REPO, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) {
    // Failing open here would be the worse error: a gate that reports green
    // because it could not get the list is exactly the shape this repo is
    // trying to remove.
    fail("bom", `git ls-files failed, so the file list is unknown: ${(r.stderr || "").trim()}`);
    return [];
  }
  return r.stdout.split("\0").filter(Boolean);
}

function checkNoBom() {
  console.log("  bom");
  let scanned = 0;
  const prose = [];
  for (const rel of trackedFiles()) {
    if (BINARY.test(rel)) continue;
    const abs = join(REPO, rel);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue; // a submodule gitlink, or a file removed in the working tree
    }
    if (!st.isFile() || st.size > 8 * 1024 * 1024) continue;
    const buf = readFileSync(abs);
    if (buf.includes(0)) continue; // binary by content, whatever the extension says
    const text = buf.toString("utf8");
    scanned++;
    if (!ZWNBSP.test(text)) continue;
    // Name the line, because the character is invisible and "somewhere in this
    // file" is not an actionable report for something you cannot see.
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!ZWNBSP.test(lines[i])) continue;
      const at = `${rel}:${i + 1}:${lines[i].search(ZWNBSP) + 1}`;
      if (PARSED.test(rel)) fail("bom", `${at} literal U+FEFF in a parsed file - write the six-character escape instead`);
      else prose.push(at);
    }
  }
  note(`scanned ${scanned} tracked text files`);
  if (prose.length) {
    console.log(`      ${prose.length} literal U+FEFF in prose, not failed (nothing parses these):`);
    for (const p of prose) console.log(`        ${p}`);
  }
}

// ---------------------------------------------------------------------------
// CHECK 3 - every machine's read-only path runs, and returns what it should.
// ---------------------------------------------------------------------------

function checkSmoke(files) {
  console.log("  smoke");

  // Coverage first. A machine with no entry is not skipped quietly; it fails.
  for (const f of files) if (!MANIFEST[f]) fail("smoke", `${f} has no manifest entry. Declare its read-only invocation, or record why it has none.`);
  for (const f of Object.keys(MANIFEST)) if (!files.includes(f)) fail("smoke", `manifest names ${f}, which is not in machines/`);

  for (const f of files) {
    const m = MANIFEST[f];
    if (!m) continue;
    if (m.none) {
      note(`-   ${f} - no runnable path: ${m.none}`);
      continue;
    }

    const root = buildFixture();
    try {
      // A library is proved by loading it. `require` and not `import`, because
      // these are .cjs and loading them is exactly what a machine does.
      const argv = m.args.length ? [join(MACHINES, f), ...m.args] : ["-e", `require(${JSON.stringify(join(MACHINES, f))})`];
      const r = spawnSync(process.execPath, argv, {
        cwd: root,
        encoding: "utf8",
        timeout: 120000,
        env: { ...process.env, REFER_FACTORY_ROOT: REPO },
      });

      const label = `${f} ${m.args.join(" ")}`.trim();

      if (r.error) {
        fail("smoke", `${label} could not be run: ${r.error.message}`);
        continue;
      }

      // A stack trace means it threw, whatever the exit code says. This is the
      // check that separates "exited 1 because it found something" from
      // "exited 1 because it fell over", and those are not the same fact.
      const stderr = (r.stderr || "").trim();
      if (/\n\s+at [\w.<>[\]]+ \(/.test(stderr)) {
        fail("smoke", `${label} threw:\n${stderr.split("\n").slice(0, 12).join("\n")}`);
        continue;
      }

      const want = Array.isArray(m.exit) ? m.exit : [m.exit];
      if (!want.includes(r.status)) {
        fail("smoke", `${label} exited ${r.status}, expected ${want.join(" or ")} (${m.why})${stderr ? `\n  stderr: ${stderr.slice(0, 400)}` : ""}`);
        continue;
      }

      if (m.expect) {
        try {
          if (!m.expect(r.stdout)) {
            fail("smoke", `${label} exited ${r.status} but its output did not carry what it promises (${m.why})`);
            continue;
          }
        } catch (e) {
          fail("smoke", `${label} exited ${r.status} but its output could not be read: ${e.message}`);
          continue;
        }
      }

      note(`ok  ${label} -> ${r.status}`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
}

// ---------------------------------------------------------------------------

const files = readdirSync(MACHINES).filter((f) => f.endsWith(".cjs")).sort();
console.log(`machines gate - ${files.length} machines in ${MACHINES}\n`);

checkParse(files);
checkNoBom();
checkSmoke(files);

console.log("");
if (!failures.length) {
  console.log(`PASS - ${files.length} machines parse, no literal U+FEFF in any parsed file, every declared read-only path returned what it should.`);
  process.exit(0);
}

const byCheck = {};
for (const f of failures) (byCheck[f.check] ||= []).push(f.detail);
for (const [check, details] of Object.entries(byCheck)) {
  console.error(`FAIL ${check} - ${details.length}`);
  for (const d of details) console.error(`  - ${d}`);
}
console.error(`\nFAIL - ${failures.length} problem(s).`);
process.exit(1);
