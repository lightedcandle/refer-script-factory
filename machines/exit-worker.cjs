#!/usr/bin/env node
/**
 * EXIT WORKER - takes finished work off the conveyor and puts it on the table.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-12: "We are going to have an intake worker and an exit
 * worker. The intake worker is responsible for pulling deposits off the incoming
 * and placing them on the conveyor, and the output worker removes them and
 * places them on the resolution table."
 *
 * This is the second half, and it is the safe half: it decides nothing about
 * what to work on and writes no code. It reads what is on the belt, asks whether
 * the agent carrying each item is still alive, and deals with the ones that are
 * not.
 *
 * THREE OUTCOMES, and the distinction between the last two is the whole value:
 *
 *   still working   the session is alive. Leave it alone.
 *   delivered       the session is gone AND the item was closed while it was
 *                   held. The work happened; the card moves to RESOLVED on its
 *                   own, and this says so.
 *   abandoned       the session is gone and the item was NOT closed. Somebody
 *                   picked the work up and put it down. The item goes back to
 *                   INCOMING and the abandonment is recorded, because a silent
 *                   return would look exactly like work that was never started.
 *
 * An abandoned item is worse than one never dispatched, and the board has to be
 * able to tell them apart - the same rule that separates NEVER RUN from STALLED
 * and an absent month from a zero month.
 *
 *   node <factory>/machines/exit-worker.cjs         run
 *   node <factory>/machines/exit-worker.cjs --json  machine-readable
 *   node <factory>/machines/exit-worker.cjs --dry   decide, write nothing
 *
 * Exit 1 when something was abandoned.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const JSON_OUT = process.argv.includes("--json");
const DRY = process.argv.includes("--dry");

const MS = { m: 6e4, h: 36e5 };
const ALIVE_MS = 30 * MS.m;
const now = Date.now();

if (!fs.existsSync(BELT)) {
  console.error(`exit-worker: no belt in ${ROOT}`);
  process.exit(2);
}

const records = fs
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

// The belt's vocabulary, kept identical to the board's. Precedent P13: one rule,
// and both readers must hold the same copy.
const NOTING = /^terminal:(recorded|definition|annotation|note)$/;
const selfTerminal = (r) => /^(terminal:.+|closed)$/.test(String(r.triggers || "").trim());
const closedBy = new Map();
for (const r of records) {
  if (!selfTerminal(r) || NOTING.test(String(r.triggers || "").trim())) continue;
  if (r.subject) closedBy.set(String(r.subject), r);
}
const isDone = (r) => selfTerminal(r) || closedBy.has(String(r.id));

const dispatchFor = new Map();
for (const r of records) {
  const s = r.subject && String(r.subject);
  if (s && r.dispatch) dispatchFor.set(s, { ...r.dispatch, recordedAt: Date.parse(r.run || "") || null });
}

// Proven from disk, never believed. A dispatch is a claim that somebody is
// working; the only evidence that survives a process dying is a file.
//
// ONE DEFINITION, in session-life.cjs, shared with intake-worker. It used to be
// written out here and could not see a spawned agent at all: a worktree session
// writes its transcript to its OWN project directory, and the filename is a uuid
// rather than the session id, so the prefix match never matched and this fell
// through to the worktree folder's mtime - which does not move while work is
// happening. Every spawned agent went invisible about half an hour after its
// folder last changed, and THIS is the file that turns invisible into
// "abandoned". Full account in session-life.cjs.
const { sessionLife: lifeOf } = require("./session-life.cjs");
const sessionLife = (id) => lifeOf(id, ROOT, ALIVE_MS);

const held = records.filter((r) => dispatchFor.has(String(r.id)));
const outcomes = { working: [], delivered: [], abandoned: [] };

for (const r of held) {
  const d = dispatchFor.get(String(r.id));
  const life = sessionLife(d.session);
  const alive = !!(life && life.alive);
  const done = isDone(r);
  if (alive) {
    outcomes.working.push({ id: r.id, session: d.session, label: d.label || "" });
  } else if (done) {
    outcomes.delivered.push({ id: r.id, session: d.session, label: d.label || "", closedAs: (closedBy.get(String(r.id)) || {}).triggers || r.triggers });
  } else {
    outcomes.abandoned.push({
      id: r.id,
      session: d.session,
      label: d.label || "",
      heldFor: d.recordedAt ? Math.round((now - d.recordedAt) / MS.h) : null,
      lastSeen: life ? new Date(life.at).toISOString() : "never seen on disk",
    });
  }
}

// Only abandonment needs writing down. "Delivered" already shows as a closure,
// and re-announcing it would be the board congratulating itself twice for one
// piece of work.
let deposited = 0;
if (!DRY) {
  const beltText = fs.readFileSync(BELT, "utf8");
  for (const a of outcomes.abandoned) {
    const id = `abandoned-${String(a.id).slice(0, 40)}-${new Date(now).toISOString().slice(0, 10).replace(/-/g, "")}`;
    if (beltText.includes(`"${id}"`)) continue;
    fs.appendFileSync(
      BELT,
      JSON.stringify({
        id,
        run: new Date(now).toISOString(),
        driver: "I7",
        tier: 1,
        dimension: "architecture",
        subject: String(a.id),
        claim: `Dispatched and abandoned. ${a.label || "An agent"} took this${a.heldFor !== null ? ` ${a.heldFor}h ago` : ""} and its session is gone with the work unfinished.`,
        evidence: `Session ${a.session}, last seen ${a.lastSeen}. The item returns to incoming. This is recorded rather than quietly reversed, because an item that silently reappears in incoming looks exactly like one that was never started - and those are opposite facts about how much attention this has already cost.`,
        recommend: "Read what the session did before dispatching it again. A second agent starting cold repeats whatever the first one already learned.",
        seen: true,
        confidence: "measured",
        triggers: "contract:architecture",
        owner: "architecture",
      }) + "\n",
      "utf8",
    );
    deposited++;
  }
}

const report = { checkedAt: new Date(now).toISOString(), repo: path.basename(ROOT), held: held.length, ...outcomes, deposited };
fs.mkdirSync(CTX, { recursive: true });
fs.writeFileSync(path.join(CTX, "exit-worker.json"), JSON.stringify(report, null, 2) + "\n");

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`exit-worker: ${held.length} held  [${report.repo}]`);
  console.log(`  still working: ${outcomes.working.length}   delivered: ${outcomes.delivered.length}   abandoned: ${outcomes.abandoned.length}`);
  for (const w of outcomes.working) console.log(`     working   ${w.label || w.session}  ${w.id}`);
  for (const d of outcomes.delivered) console.log(`     delivered ${d.label || d.session}  ${d.id}  (${d.closedAs})`);
  for (const a of outcomes.abandoned) console.log(`     ABANDONED ${a.label || a.session}  ${a.id}  last seen ${a.lastSeen}`);
  if (deposited) console.log(`  deposited ${deposited}`);
}
process.exit(outcomes.abandoned.length ? 1 : 0);
