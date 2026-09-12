#!/usr/bin/env node
/**
 * COMPOSITION WATCH - the first station that watches the PRODUCT.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-12: "so is this going to run overnight without doing any
 * work?"
 *
 * Audited rather than reassured, and he was right. Ten of the eleven stations
 * examined the belt, the board or each other - the factory watching itself.
 * Exactly one looked at the application, once a day. A factory whose sensors
 * are all pointed at its own instruments is busy, not useful.
 *
 * This one looks at the app, and at the single number in this repo that has been
 * MEASURED rather than guessed: a component's rebuild time is set by its count
 * of structural directives, because Angular emits a type-check block per
 * embedded view. 63 of them rebuild in about 6 seconds; 73 takes over three
 * minutes. Those two numbers are measurements; the edge between them has never
 * been measured, which is why the law targets under 60.
 *
 * Signal was checked before the station was written, having learned that lesson
 * expensively on the mind surface: four of five plausible checks there were
 * pure noise. Across 152 components this finds THREE - 191, 117 and 63 - and
 * nothing else above 57. That is a watcher, not a flood.
 *
 * It reports CHANGES against a baseline, with one exception: the first run
 * records what was already over the line, because a change watcher is otherwise
 * permanently blind to whatever it inherited.
 *
 *   node <factory>/machines/composition-watch.cjs           check
 *   node <factory>/machines/composition-watch.cjs --json    machine-readable
 *   node <factory>/machines/composition-watch.cjs --mark    accept current as baseline
 *   node <factory>/machines/composition-watch.cjs --dry     check, write nothing
 *
 * Exit 1 when a component has crossed a measured threshold upward.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const BASE = path.join(CTX, "composition-baseline.json");
const JSON_OUT = process.argv.includes("--json");
const REMARK = process.argv.includes("--mark");
const DRY = process.argv.includes("--dry");

// The two measured points. Not round numbers, and deliberately not smoothed into
// one: they mean different things and earn different words.
const SLOW = 73; // measured at over three minutes
const EDGE = 63; // measured at about six seconds; above here is unmeasured

const now = Date.now();
const findings = [];
const say = (key, claim, evidence, recommend) =>
  findings.push({ key, claim, evidence, recommend, triggers: "contract:body", owner: "body" });

const SRC = path.join(ROOT, "src/app");
if (!fs.existsSync(SRC)) {
  // Not an Angular repo. Not a fault - this station simply has no subject here,
  // and says so rather than reporting a clean bill of health it never checked.
  const out = { checkedAt: new Date(now).toISOString(), repo: path.basename(ROOT), applicable: false, note: "no src/app - nothing for this station to watch" };
  fs.mkdirSync(CTX, { recursive: true });
  fs.writeFileSync(path.join(CTX, "composition-watch.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`composition-watch: not applicable in ${path.basename(ROOT)} - no src/app`);
  process.exit(0);
}

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.component\.(ts|html)$/.test(e.name)) files.push(p);
  }
})(SRC);

// A component is its .ts and .html together - the directives live in whichever
// holds the template, and counting them separately would halve the number for
// every component that uses an external template.
const RE = /\*ngIf|\*ngFor|\*ngSwitch|@if\b|@for\b|@switch\b/g;
const counts = {};
for (const f of files) {
  const key = path.relative(ROOT, f).replace(/\.(ts|html)$/, "").replace(/\\/g, "/");
  // Block comments stripped, so a commented-out block does not count against a
  // component that has already been cleaned up.
  const src = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  counts[key] = (counts[key] || 0) + (src.match(RE) || []).length;
}

const prev = (() => {
  try {
    return JSON.parse(fs.readFileSync(BASE, "utf8")).counts || null;
  } catch {
    return null;
  }
})();

const over = Object.entries(counts)
  .filter(([, n]) => n >= EDGE)
  .sort((a, b) => b[1] - a[1]);

const word = (n) =>
  n >= SLOW
    ? `${n} structural directives - past the point measured at over three minutes to rebuild`
    : `${n} structural directives - at the point measured at about six seconds, with everything above it unmeasured`;

if (!prev || REMARK) {
  if (!REMARK && over.length) {
    say(
      "standing-state-at-first-watch",
      `The app is now watched for composition. Already over the line: ${over.map(([f, n]) => `${path.basename(f)} (${n})`).join(", ")}.`,
      `Counted across ${Object.keys(counts).length} components. The composition law's two measured points are 63 directives at about six seconds and 73 at over three minutes; nothing else in this repo is above 57, so these are genuinely exceptional rather than the top of a gradient. Deposited once so a change watcher does not begin blind to what it inherited.`,
      `${over[0] ? path.basename(over[0][0]) : "The worst offender"} is the one that costs real time every day it is edited. Extract along a seam that takes logic with it, not just markup - the law's own test - and re-measure rather than assuming the split helped.`,
    );
  }
} else {
  for (const [file, n] of over) {
    const was = Number(prev[file] || 0);
    // Only upward crossings. A component that has been sitting at 191 for weeks
    // is already on the belt from the first run; re-reporting it every cycle is
    // what turns a finding into wallpaper.
    const crossed = (n >= SLOW && was < SLOW) || (n >= EDGE && was < EDGE);
    if (!crossed) continue;
    say(
      `crossed-${path.basename(file)}`,
      `${path.basename(file)} has crossed a measured rebuild threshold: ${word(n)}, up from ${was}.`,
      `The composition law: Angular emits a type-check block per embedded view, so rebuild time is set by this count and not by template size or binding count, both of which were tested and ruled out. Counted from the component's .ts and .html together.`,
      `Split it before it grows further. A good seam takes logic with it rather than only markup, and styles do NOT follow a child - an extracted panel with no styleUrls renders completely unstyled and nothing errors.`,
    );
  }
  // Improvement is worth saying too. A board that only ever reports decay
  // teaches its reader that work never helps.
  for (const [file, was] of Object.entries(prev)) {
    const n = Number(counts[file] ?? -1);
    if (n < 0) continue;
    if (was >= EDGE && n < EDGE) {
      say(
        `recovered-${path.basename(file)}`,
        `${path.basename(file)} is back under the line: ${n} structural directives, down from ${was}.`,
        `It was above the measured six-second point and is no longer. Recorded because a factory that reports only decay teaches its reader that nothing they do helps.`,
        "Nothing needed. Re-measure the rebuild to confirm the time came back with the count.",
      );
    }
  }
}

function deposit() {
  if (DRY || !fs.existsSync(BELT)) return 0;
  const beltText = fs.readFileSync(BELT, "utf8");
  const day = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
  let n = 0;
  for (const f of findings) {
    const id = `composition-${f.key}-${day}`;
    if (beltText.includes(`"${id}"`)) continue;
    fs.appendFileSync(
      BELT,
      JSON.stringify({
        id,
        run: new Date(now).toISOString(),
        driver: "I4",
        tier: 2,
        dimension: "body",
        subject: `composition: ${f.key}`,
        claim: f.claim,
        evidence: f.evidence,
        recommend: f.recommend,
        seen: true,
        confidence: "measured",
        triggers: f.triggers,
        owner: f.owner,
      }) + "\n",
      "utf8",
    );
    n++;
  }
  return n;
}

const deposited = deposit();
if (!DRY) fs.writeFileSync(BASE, JSON.stringify({ at: new Date(now).toISOString(), counts }, null, 1) + "\n");

const report = {
  checkedAt: new Date(now).toISOString(),
  repo: path.basename(ROOT),
  components: Object.keys(counts).length,
  overEdge: over.map(([f, n]) => ({ file: f, directives: n })),
  found: findings.length,
  deposited,
  findings,
};
fs.mkdirSync(CTX, { recursive: true });
fs.writeFileSync(path.join(CTX, "composition-watch.json"), JSON.stringify(report, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`composition-watch: ${Object.keys(counts).length} components, ${over.length} over the measured line  [${report.repo}]`);
  for (const [f, n] of over) console.log(`     ${String(n).padStart(4)}  ${f}`);
  for (const f of findings) {
    console.log(`\n  ${f.claim}`);
    console.log(`    -> ${f.recommend}`);
  }
  if (!findings.length) console.log("  Nothing has crossed a threshold since the last check.");
  if (deposited) console.log(`\n  deposited ${deposited}`);
}
process.exit(findings.length ? 1 : 0);
