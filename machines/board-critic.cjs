#!/usr/bin/env node
/**
 * BOARD CRITIC - the thing that reads the board and asks why nothing happened.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "That problem could have been discovered just by looking
 * at the page. So apparently nothing is looking at the page and extrapolating,
 * and wondering, why are there issues on the page that are not being addressed?"
 *
 * He is right, and it is the largest structural gap the factory has had.
 *
 * THE BOARD WAS THE BIGGEST LEAK IN THE SYSTEM. Section 3.1 says an output
 * nobody picks up is a leak, and a leak is the only way this system dies
 * quietly. The board is the terminal display of everything the factory knows -
 * and nothing read it. Watchers deposited, the board rendered, and there the
 * chain stopped. Every defect found on it so far was found by a person looking
 * at it, which is exactly the labour this whole system exists to remove.
 *
 * So this reads the board's own state and asks the questions a person asks when
 * they look at it:
 *
 *   Is anything shown as needing attention that nobody has touched?
 *   Is any domain carrying work with nobody watching it?
 *   Is the same thing being reported again and again without resolving?
 *   Does any count on the board disagree with what it counts?
 *
 * WHY THIS IS A SCRIPT AND NOT A SESSION. Most of "looking at the page" is not
 * looking - it is arithmetic over the data the page renders, and arithmetic
 * needs no judgement. What genuinely needs eyes (does this LOOK wrong, is the
 * layout broken) stays with the seer. Splitting them is what makes the cheap
 * half run every cycle instead of once a day.
 *
 *   node <factory>/machines/board-critic.cjs         report
 *   node <factory>/machines/board-critic.cjs --json  machine-readable
 *
 * Exit 1 when it finds something nobody is acting on.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");

const MS = { h: 36e5, d: 864e5 };
const STALE_HOURS = 24; // open, untouched, and older than this = nobody picked it up

if (!fs.existsSync(BELT)) {
  console.error(`board-critic: no belt in ${ROOT}`);
  process.exit(2);
}

const belt = fs
  .readFileSync(BELT, "utf8")
  .replace(/^﻿/, "")
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

const stations = [];
for (const rel of ["tools", "tools/factory", "scripts", "machines"]) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".station.json")) continue;
    try {
      const d = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
      if (d && d.id) stations.push(d);
    } catch {
      /* the clock reports unreadable declarations; not this machine's job */
    }
  }
}

const now = Date.now();
const runAt = (r) => {
  const t = Date.parse(r.run || "");
  return Number.isNaN(t) ? null : t;
};
// A later record naming this one as its subject, and terminal itself, closes it.
// The belt is append-only, so this is the only way a finding can ever die - and
// without it the critic's own rules counted finished work as outstanding. It was
// re-raising a recurrence built from three records that were all already closed.
const TERMINAL = (t) => /^(terminal:.+|closed)$/.test(String(t || "").trim());

// NOT EVERY TERMINAL RECORD CLOSES WHAT IT NAMES. A word that means NOTED does
// not resolve anything - attaching a lesson or a recommendation to a finding
// explains it, which is the opposite of fixing it.
//
// This machine disagreed with the board for about ten minutes because the rule
// was fixed in one place and not the other, and THE CROSS-SOURCE CHECK BELOW
// CAUGHT IT: the belt said 13 open, the board drew 20. That check exists exactly
// for a divergence between two definitions of the same thing, and the first
// thing it found was this machine's own.
//
// Seventh place one rule has been written twice on this board. The vocabulary is
// factory law (precedent P13) and both readers must keep it identical.
const NOTING = /^terminal:(recorded|definition|annotation|note)$/;
const closedIds = new Set(
  belt.filter((r) => TERMINAL(r.triggers) && !NOTING.test(String(r.triggers || "").trim()) && r.subject).map((r) => String(r.subject)),
);
const isClosed = (r) => TERMINAL(r.triggers) || closedIds.has(String(r.id));
const isOpen = (r) => /^(contract:|seer$|operator$)/.test(String(r.triggers || "")) && !isClosed(r);
const ago = (t) => (!t ? "never" : `${Math.round((now - t) / MS.h)}h ago`);

// A later record acts on an earlier one by naming it as subject. Append-only
// means the whole history is the state, so "has anyone touched this" is a
// question about what came after it, never about the record itself.
const actedOn = new Set(belt.filter((r) => r.subject).map((r) => String(r.subject)));

const findings = [];
const say = (key, claim, evidence, triggers, owner, dimension) =>
  findings.push({ key, claim, evidence, triggers, owner, dimension });

// ---- 1. A domain carrying work with nobody watching it ----------------------
//
// This is the one he found by eye. Generalised so it is never found by eye again.
{
  const watched = new Set(stations.map((s) => s.owns).filter(Boolean));
  const load = {};
  for (const r of belt) {
    if (!isOpen(r)) continue;
    for (const d of ["body", "mind", "spirit"]) {
      if (r.owner === d || String(r.triggers) === `contract:${d}`) load[d] = (load[d] || 0) + 1;
    }
  }
  for (const [dim, n] of Object.entries(load)) {
    if (watched.has(dim)) continue;
    say(
      `unwatched-dimension-${dim}`,
      `${dim} is carrying ${n} open item${n === 1 ? "" : "s"} and no station watches it.`,
      `Stations declare what they own: ${stations.map((s) => `${s.id}->${s.owns || "nothing"}`).join(", ")}. Nothing owns ${dim}.`,
      `contract:${dim}`,
      dim,
      dim,
    );
  }
}

// ---- 2. Open, untouched, and old -------------------------------------------
//
// The question a person asks looking at the board: this has been sitting here,
// why has nothing happened? A finding nobody picked up is the leak's quieter
// cousin - it HAS an address, and the address never collected.
{
  const stale = belt.filter((r) => {
    if (!isOpen(r)) return false;
    if (actedOn.has(String(r.id))) return false;
    const t = runAt(r);
    return t && now - t > STALE_HOURS * MS.h;
  });
  if (stale.length) {
    const worst = stale.sort((a, b) => runAt(a) - runAt(b))[0];
    say(
      "open-and-untouched",
      `${stale.length} finding${stale.length === 1 ? " has" : "s have"} been open and untouched for over ${STALE_HOURS}h. Nothing has picked ${stale.length === 1 ? "it" : "them"} up.`,
      `Oldest: "${worst.id}" deposited ${ago(runAt(worst))}, addressed to ${worst.triggers}. Full list: ${stale.map((s) => s.id).join(", ")}. A finding with an address that never collects is a leak that passed the leak check.`,
      "operator",
      "operator",
      "architecture",
    );
  }
}

// ---- 3. The same thing, reported again ---------------------------------------
//
// A subject that keeps earning new findings is not being fixed; it is being
// re-noticed. That is a different problem from a single open item and wants a
// different answer.
{
  const bySubject = {};
  for (const r of belt) {
    const s = r.subject && String(r.subject);
    if (!s || s.startsWith("supersedes") || belt.some((x) => String(x.id) === s)) continue;
    (bySubject[s] ||= []).push(r);
  }
  for (const [subj, rs] of Object.entries(bySubject)) {
    // Only findings that are STILL OPEN count toward a recurrence. "The fix has
    // not held" is a claim about a live problem; three closed records on one
    // subject are three problems that were dealt with, and reporting them as a
    // recurrence puts finished work back in front of him.
    const live = rs.filter(isOpen);
    if (live.length < 3) continue;
    say(
      `recurring-${subj.replace(/[^a-z0-9]+/gi, "-").slice(0, 40)}`,
      `"${subj}" has ${live.length} findings still open against it. It is being re-noticed rather than fixed.`,
      `Open: ${live.map((r) => r.id).join(", ")}.${rs.length > live.length ? ` (${rs.length - live.length} more on this subject are already closed and are not counted.)` : ""} Three or more OPEN findings on one subject means the fix has not held, or the subject is really a class of problem wearing one name.`,
      "operator",
      "operator",
      "architecture",
    );
  }
}

// ---- 4. Counts that disagree with what they count ---------------------------
//
// The board has been wrong this way twice - a panel counting 4 and rendering 2,
// and a centre counting held work as circulating. Both were found by eye.
{
  const open = belt.filter(isOpen);
  // ANY contracted domain is carried, not only the three drawn as carriers.
  // This check reported "1 open item counted nowhere" for an architecture item
  // whose only fault was that its domain had no card on the belt - the drawing
  // deciding what the data was allowed to be. Eighth place this one rule lives;
  // the board was corrected first and this followed, which is the drift the
  // cross-source check exists to catch and did.
  const carried = open.filter((r) => /^contract:/.test(String(r.triggers || "")) || ["body", "mind", "spirit"].some((d) => r.owner === d));
  const held = open.filter((r) => String(r.triggers) === "operator" && !carried.includes(r));
  const unplaced = open.length - carried.length - held.length;
  if (unplaced !== 0) {
    say(
      "open-items-counted-nowhere",
      `${unplaced} open item${unplaced === 1 ? " is" : "s are"} counted in neither the carriers nor the held pile.`,
      `open ${open.length} = carried ${carried.length} + held ${held.length} + ${unplaced} unaccounted. Every open record must appear somewhere on the board or it is invisible while being counted.`,
      "contract:body",
      "body",
      "body",
    );
  }
}

// ---- 5. the belt says one thing, the board shows another ---------------------
//
// The seer checks that the board agrees with ITSELF - chips against rows, counts
// against what they label. It passed for hours while the board was wrong,
// because the board was perfectly coherent and coherently wrong: a finding
// closed by a later record was still being drawn as open, so the chip and the
// rows agreed on a number that should not have existed.
//
// No single-source check can catch that. This one compares two sources - what
// the belt says is still open, against how many rows the seer actually counted
// on the page - which is the only way a shared assumption gets caught.
{
  const detail = path.join(CTX, "board-see-detail.json");
  if (fs.existsSync(detail)) {
    let seen = null;
    try {
      seen = JSON.parse(fs.readFileSync(detail, "utf8")).seen;
    } catch {
      /* the seer owns reporting its own output; not this machine's job */
    }
    // Only meaningful if the board was BUILT after the newest record. A belt
    // that has grown since the last render is not a board telling lies, it is a
    // board that has not caught up yet - and reporting that as a disagreement
    // would fire after every single deposit, which is a flood, not a check.
    const boardFile = path.join(CTX, "factory-tracker.html");
    const builtAt = fs.existsSync(boardFile) ? fs.statSync(boardFile).mtimeMs : 0;
    const newestRecord = Math.max(0, ...belt.map((r) => Date.parse(r.run || "") || 0));
    const boardIsCurrent = builtAt > newestRecord;

    if (seen && typeof seen.rowTotal === "number" && boardIsCurrent) {
      // One rule, read from one place. This block had its own copy of "what
      // closes a finding" and the copy drifted the moment the real rule changed
      // - which is what this very check then reported. Using closedIds and
      // isOpen means there is nothing left to drift apart from.
      const ids = new Set(belt.map((r) => String(r.id)));
      const isCloser = (r) => TERMINAL(r.triggers) && !NOTING.test(String(r.triggers || "").trim()) && r.subject && ids.has(String(r.subject));
      const stillOpen = belt.filter((r) => isOpen(r) && !isCloser(r)).length;
      if (stillOpen !== seen.rowTotal) {
        say(
          "belt-and-board-disagree",
          `The belt has ${stillOpen} item${stillOpen === 1 ? "" : "s"} still open and the board is drawing ${seen.rowTotal} row${seen.rowTotal === 1 ? "" : "s"}.`,
          `Counted from the belt, against what the seer counted on the rendered page. ${seen.rowTotal > stillOpen ? "The board is showing work that is already finished, which is how two fixed items sat in his column with their own closures visible on the same screen." : "The board is hiding open work, which is worse - it cannot be acted on if it cannot be seen."}`,
          "contract:body",
          "body",
          "body",
        );
      }
    }
  }
}

// ---- deposit, once per distinct finding --------------------------------------

const beltText = fs.readFileSync(BELT, "utf8");
let deposited = 0;
for (const f of findings) {
  const id = `critic-${f.key}`;
  if (beltText.includes(`"${id}"`)) continue;
  fs.appendFileSync(
    BELT,
    JSON.stringify({
      id,
      run: new Date(now).toISOString(),
      driver: "I7",
      tier: 1,
      dimension: f.dimension,
      // The subject is what this finding is ABOUT, and it must be specific.
      //
      // Every board finding used to carry the same string, so rule 3 below -
      // "three findings on one subject means it is being re-noticed rather
      // than fixed" - counted three DIFFERENT problems as one recurring one and
      // raised a false alarm against its own deposits. It reached the operator's
      // NEEDS YOU column, which is the most expensive place in the system to
      // put a thing that is not true.
      //
      // Keyed this way the rule finally means what it says: the same defect,
      // found again, after somebody thought it was fixed.
      subject: `board: ${f.key}`,
      claim: f.claim,
      evidence: f.evidence,
      seen: false,
      confidence: "measured",
      triggers: f.triggers,
      owner: f.owner,
    }) + "\n",
    "utf8",
  );
  deposited++;
}

const report = { checkedAt: new Date(now).toISOString(), repo: path.basename(ROOT), found: findings.length, deposited, findings };
fs.writeFileSync(path.join(CTX, "board-critic.json"), JSON.stringify(report, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`board-critic: ${findings.length} thing(s) the board is showing that nobody is acting on  [${report.repo}]`);
  for (const f of findings) {
    console.log(`\n  ${f.claim}`);
    console.log(`    ${f.evidence}`);
    console.log(`    -> ${f.triggers}`);
  }
  if (!findings.length) console.log("  Nothing shown on the board is going unaddressed.");
  if (deposited) console.log(`\n  deposited ${deposited} (the rest were already on the belt)`);
}

process.exit(findings.length ? 1 : 0);
