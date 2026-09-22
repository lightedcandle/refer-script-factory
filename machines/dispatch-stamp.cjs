#!/usr/bin/env node
/**
 * DISPATCH STAMP - the dispatcher writes down which door the work came through.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 *   node <factory>/machines/dispatch-stamp.cjs --subject <belt-id> \
 *        --session <worktree-name|uuid> --via spawn [--label <text>] [--dry]
 *
 * WHY THIS EXISTS. The board draws three intake doors - AUTO, CHAT, SPAWN - and
 * they are the trigger classes, not a new vocabulary: fired by a schedule,
 * opened by a person, started by an agent. A dispatch record carries `via` and
 * build-tracker's viaOf reads exactly `auto`, `chat` or `spawn`, reporting
 * anything else as UNKNOWN, deliberately, because an attribution invented to
 * make three lanes look busy is the same defect as a count that does not count.
 *
 * Only one writer ever fed that field: intake-worker, stamping its own scheduled
 * dispatches. A chat forking an unattended worker - an agent starting an agent,
 * the SPAWN door by definition (P15) - wrote nothing at all, so the door that
 * has been built and correct since the doors were drawn had never once been fed.
 * This is the supply.
 *
 * `--via` IS REQUIRED AND VALIDATED, NEVER DEFAULTED. The realistic caller is an
 * agent spawning an agent, so `spawn` would be a safe-looking default and it is
 * refused anyway: the deposit that asked for this machine asked for the door the
 * work ACTUALLY came through and forbade inferring one after the fact. A writer
 * that assumes is a writer that can be wrong silently.
 *
 * THE SESSION ID IS THE WORKTREE NAME, for spawns. session-life.cjs resolves an
 * id two ways - a directory `<repo>/.claude/worktrees/<id>` and a transcript
 * directory `~/.claude/projects/<token>--claude-worktrees-<id>` - and only the
 * main-checkout case uses a uuid. Name the worktree and every reader can find
 * the agent; name anything else and none of them can.
 *
 * IT PROVES THE SESSION FROM DISK BEFORE IT WRITES. A stamp whose session cannot
 * be resolved is worse than no stamp: exit-worker reads an unresolvable dispatch
 * as ABANDONED and hands the work back as thrown away. So an unresolvable
 * session is refused here, loudly, with the live worktrees listed - the
 * dispatcher mistyped a name, and the honest answer is to say which names exist
 * rather than to write a card nobody can match.
 *
 * NO `kind` FIELD, AND THIS IS LOAD-BEARING. kind.cjs attaches a declared kind
 * to the record's SUBJECT when that subject is a known id, so a dispatch stamp
 * carrying `kind` would silently RECLASSIFY THE ITEM IT NAMES. With `triggers:
 * terminal:recorded` and no kind the record reads as an ANNOTATION: bookkeeping,
 * drawn in no column, counted in no tally, and - because terminal:recorded is in
 * the NOTING family - it does NOT close the item it names.
 *
 * Exit 0 written or already stamped, 1 refused because the session could not be
 * proven, 2 a usage error. Exit 1 is not a warning: nothing was written.
 */
const fs = require("fs");
const path = require("path");
const { sessionLife, repoRootOf } = require("./session-life.cjs");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const ALIVE_MS = 30 * 60 * 1000; // intake-worker's window and exit-worker's, to the minute

// The board's whole vocabulary for this field. A literal here rather than an
// import, so that minting a fourth door means editing the reader and this writer
// in one change - which is the review anybody minting a door should get.
const DOORS = ["auto", "chat", "spawn"];

const argv = process.argv.slice(2);
const flag = (name) => {
  const i = argv.indexOf("--" + name);
  if (i === -1) return null;
  const v = argv[i + 1];
  return v === undefined || String(v).startsWith("--") ? "" : v;
};
const DRY = argv.includes("--dry");
const subject = (flag("subject") || "").trim();
const session = (flag("session") || "").trim();
const via = (flag("via") || "").trim().toLowerCase();
const label = (flag("label") || "").trim() || subject.slice(0, 28);

const usage = (why) => {
  console.error(
    `dispatch-stamp: ${why}\n` +
      `  node <factory>/machines/dispatch-stamp.cjs --subject <belt-id> --session <worktree-name|uuid> --via ${DOORS.join("|")} [--label <text>] [--dry]`
  );
  process.exit(2);
};

if (!subject) usage("name the deposit this dispatch is FOR with --subject; every reader looks it up by the item's id");
if (!session) usage("name the session with --session - the worktree name for a spawn, the uuid for a main-checkout session");
if (!via) usage("name the door with --via; it is never inferred");
if (!DOORS.includes(via)) usage(`--via must be exactly one of ${DOORS.join(", ")} - "${via}" would be filed as UNKNOWN, so it is refused here instead`);
if (!fs.existsSync(BELT)) {
  console.error(`dispatch-stamp: no belt in ${ROOT}`);
  process.exit(2);
}

const records = fs
  .readFileSync(BELT, "utf8")
  .replace(/^﻿/, "")
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  })
  .filter(Boolean);

// ONE DISPATCH, ONE STAMP. Re-running this after a stall would otherwise write a
// second card for the same agent and inflate the door's throughput with a number
// that came from a retry rather than from work.
const already = records.find((r) => r.dispatch && String(r.dispatch.session) === session);
if (already) {
  console.log(`dispatch-stamp: ${session} is already stamped (${already.id}, via ${already.dispatch.via || "unknown"}). Nothing written.`);
  process.exit(0);
}

// A stamp naming nothing still counts at the door, which is honest throughput,
// but it attaches to no card - so say so rather than let it look filed.
const known = records.some((r) => String(r.id) === subject);
if (!known) {
  console.log(`dispatch-stamp: NOTE - no belt record has the id "${subject}". The stamp counts at the ${via.toUpperCase()} door but will attach to no card.`);
}

// PROVEN FROM DISK, NEVER BELIEVED.
const life = sessionLife(session, ROOT, ALIVE_MS);
if (!life) {
  const dir = path.join(repoRootOf(ROOT), ".claude/worktrees");
  let live = [];
  try {
    live = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    /* no worktree directory: this repo has spawned nothing, which is itself the answer */
  }
  console.error(
    `dispatch-stamp: REFUSED - nothing on disk resolves the session "${session}".\n` +
      `  A stamp whose session cannot be resolved is read as ABANDONED by exit-worker, which hands the\n` +
      `  work back as thrown away. That is worse than no stamp, so none was written.\n` +
      `  ${live.length ? "Worktrees in this repo: " + live.join(", ") : "No worktrees exist under " + dir.replace(/\\/g, "/")}`
  );
  process.exit(1);
}

const at = new Date().toISOString();
const rec = {
  id: `dispatch-${session}`,
  run: at,
  tier: 1,
  dimension: "architecture",
  source: "dispatch-stamp",
  // Keyed by SUBJECT and looked up by the item's ID in all three readers, so
  // this must be the dispatched item itself - never a description of it.
  subject,
  claim: `Dispatched to its own session. ${label} took this at ${at} through the ${via.toUpperCase()} door.`,
  evidence: `Proven from disk rather than believed: ${life.where}, written ${Math.round((Date.now() - life.at) / 1000)}s ago. The door is declared by the dispatcher at the moment of dispatch, never inferred from the record afterwards.`,
  dispatch: { session, label, via, at },
  seen: true,
  confidence: "measured",
  triggers: "terminal:recorded",
  owner: "architecture",
};

if (DRY) {
  console.log("dispatch-stamp: DRY - would append\n" + JSON.stringify(rec, null, 2));
  process.exit(0);
}

// Append. The belt is append-only: a handle is the Nth record of its dimension,
// so rewriting a line renumbers somebody else's deposit under them.
fs.appendFileSync(BELT, JSON.stringify(rec) + "\n", "utf8");
console.log(`dispatch-stamp: ${subject} -> ${session} at the ${via.toUpperCase()} door (${life.where}).`);
