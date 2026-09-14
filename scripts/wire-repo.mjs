#!/usr/bin/env node
/**
 * WIRE A REPO INTO THE LIVING FACTORY.
 *
 * Operator, 2026-09-14: "wire up all the repos, and add the all repo option
 * in the drop down. That's why I call it a grand run - to do all at once."
 *
 * A repo is WIRED when it declares triggers where the scheduler searches
 * (tools/, tools/factory/, scripts/). The primary tick fans out a child tick
 * to every wired repo; the board's picker offers every wired repo. Wiring is
 * therefore the same small set of files in every repo, and the Script-First
 * Law says repeating work becomes a script, not a habit. This is that script.
 *
 * WHAT IT WRITES, idempotently (an existing file is left alone and reported):
 *
 *   scripts/pulse.trigger.json          the beat, drivenBy the Windows task
 *   scripts/session-belt.trigger.json   who is working here, every beat
 *   scripts/watcher.trigger.json        looks and deposits, unarmed
 *   scripts/manager.trigger.json        reads the board, asks why nothing moved
 *   scripts/pulse-check.trigger.json    liveness of this repo's rhythms
 *   scripts/autonomy.trigger.json       the eight conditions
 *   scripts/build-tracker.trigger.json  this repo's data board, hourly
 *   .claude/agent-context/findings.jsonl   an EMPTY belt - the machines that
 *                                          read the belt refuse to run without
 *                                          one, so a repo cannot grow its first
 *                                          belt from them alone
 *   .gitignore                          the machine-output block, appended
 *
 * WHAT IT DOES NOT DO: commit. Every repo has its own law about how a change
 * lands, and this script does not read law. It writes files and reports; the
 * caller commits the way that repo commits.
 *
 * The builder is named by absolute path into Telechurch, because the board
 * builder is one of the seven machines still in the product repo. A command
 * that crosses repos says so rather than pretending the builder is local.
 *
 *   node <factory>/scripts/wire-repo.mjs <repo-path> [--dry]
 *
 * Exit 0 when the repo is wired (whether by this run or already). Exit 2 when
 * the path is not a directory.
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const target = args.find((a) => !a.startsWith("--"));
if (!target || !fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
  console.error("wire-repo: give a repo directory");
  process.exit(2);
}
const ROOT = path.resolve(target);
const NAME = path.basename(ROOT);
const BUILDER = "E:/Telechurch-e2e-v2/tools/factory/build-tracker.cjs";
const ROOT_FWD = ROOT.replace(/\\/g, "/");
// A path with a space in it must be quoted in a `run` command: the scheduler
// splits the command on whitespace before handing it to a shell, and the shell
// re-joins quoted spans. Found 2026-09-14 on "E:/omb puppet", whose builder
// exited 1 on its first beat because --root arrived as E:/omb.
const ROOT_ARG = /\s/.test(ROOT_FWD) ? `"${ROOT_FWD}"` : ROOT_FWD;

const TRIGGERS = {
  "pulse.trigger.json": {
    id: "pulse",
    drivenBy: "windows-task:LivingFactory-Schedule",
    every: "5m",
    owns: "architecture",
    why: `The beat, so the rail can draw it and the pulse belt can read its stage length from it. The Windows task LivingFactory-Schedule runs Telechurch's schedule.cjs, which fans out one child tick per wired repo every five minutes - this one included since ${new Date().toISOString().slice(0, 10)}. drivenBy rather than run because an external clock drives this and no scheduler may fire it as well. Written by <factory>/scripts/wire-repo.mjs.`,
  },
  "session-belt.trigger.json": {
    id: "session-belt",
    run: "factory:session-belt",
    every: "5m",
    floor: "5m",
    owns: "architecture",
    why: "The timer puts live sessions on the belt: every beat, the sessions alive in this repo - chat, routine, spawned - from their transcripts and worktrees, written to sessions.json for the board and the watcher. Deposits nothing. Written by <factory>/scripts/wire-repo.mjs.",
  },
  "watcher.trigger.json": {
    id: "watcher",
    run: "factory:watcher",
    every: "30m",
    floor: "5m",
    owns: "architecture",
    why: "This repo watching itself. Unarmed: it reports and does not act until this repo has watched itself long enough to know what its findings look like. Arming is a decision about authority, taken in this file when it is taken. Written by <factory>/scripts/wire-repo.mjs.",
  },
  "manager.trigger.json": {
    id: "manager",
    run: "factory:manager",
    every: "2h",
    floor: "15m",
    owns: "architecture",
    why: "Reads this repo's whole board and asks why nothing moved. Without it the belt would be written and never read. Written by <factory>/scripts/wire-repo.mjs.",
  },
  "pulse-check.trigger.json": {
    id: "pulse-check",
    run: "factory:pulse-check",
    every: "1h",
    floor: "5m",
    owns: "architecture",
    why: "Liveness of this repo's rhythms, from the schedule state the child tick writes here. Written by <factory>/scripts/wire-repo.mjs.",
  },
  "autonomy.trigger.json": {
    id: "autonomy",
    run: "factory:autonomy-check",
    every: "6h",
    floor: "30m",
    why: "The eight conditions of an autonomous factory, asked of this repo. Written by <factory>/scripts/wire-repo.mjs.",
  },
  "build-tracker.trigger.json": {
    id: "build-tracker",
    run: `node ${BUILDER} --root ${ROOT_ARG}`,
    every: "1h",
    floor: "5m",
    why: "Builds this repo's data board - .claude/agent-context/factory-tracker.html - for the board server to serve at ?repo=<id>. The builder still lives in Telechurch and is named by absolute path: a command that crosses repos is honest about it. Written by <factory>/scripts/wire-repo.mjs.",
  },
};

const IGNORE_BLOCK = `
# THE LIVING FACTORY TICKS THIS REPO. The belt (.claude/agent-context/findings.jsonl)
# is the record and is tracked; everything else under agent-context is a machine's
# own output, rewritten every run - the same list every wired repo ignores.
# Written by <factory>/scripts/wire-repo.mjs.
.claude/agent-context/schedule-state.json
.claude/agent-context/sessions.json
.claude/agent-context/clock-state.json
.claude/agent-context/pulse.json
.claude/agent-context/autonomy.json
.claude/agent-context/manager.json
.claude/agent-context/watcher-queue.json
.claude/agent-context/handles.json
.claude/agent-context/board-counts.json
.claude/agent-context/board-read.json
.claude/agent-context/board-port.txt
.claude/agent-context/board-snaps/
.claude/agent-context/board-see.json
.claude/agent-context/board-see-detail.json
.claude/agent-context/factory-tracker.html
.claude/agent-context/exit-worker.json
.claude/agent-context/intake-worker.json
.claude/agent-context/intake-brief.txt
.claude/agent-context/provider-watch.json
.claude/agent-context/mind-watch.json
.claude/agent-context/mind-baseline.json
.claude/agent-context/composition-watch.json
.claude/agent-context/composition-baseline.json
.claude/agent-context/host-restart.json
.claude/agent-context/night-report.txt
.claude/agent-context/night-watch.json
.claude/agent-context/night-watch.mark.json
`;

const did = { wrote: [], kept: [] };
const write = (rel, text) => {
  const p = path.join(ROOT, rel);
  if (fs.existsSync(p)) {
    did.kept.push(rel);
    return;
  }
  if (!DRY) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text, "utf8");
  }
  did.wrote.push(rel);
};

// A repo that already declares triggers anywhere the scheduler searches is
// already wired; add only what is missing rather than a second copy of any.
const declared = new Set();
for (const rel of ["tools", "tools/factory", "scripts"]) {
  try {
    for (const f of fs.readdirSync(path.join(ROOT, rel))) {
      if (f.endsWith(".trigger.json") || f.endsWith(".station.json")) {
        try {
          const j = JSON.parse(fs.readFileSync(path.join(ROOT, rel, f), "utf8"));
          if (j && j.id) declared.add(String(j.id));
        } catch {
          /* unreadable declaration: not this script's to judge */
        }
      }
    }
  } catch {
    /* no such directory */
  }
}

for (const [file, decl] of Object.entries(TRIGGERS)) {
  if (declared.has(decl.id)) {
    did.kept.push(`scripts/${file} (id "${decl.id}" already declared elsewhere in this repo)`);
    continue;
  }
  write(`scripts/${file}`, JSON.stringify(decl, null, 2) + "\n");
}
write(".claude/agent-context/findings.jsonl", "");

// .gitignore: append the block once, keyed on its first ignore line.
{
  const p = path.join(ROOT, ".gitignore");
  const cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  if (cur.includes(".claude/agent-context/schedule-state.json")) did.kept.push(".gitignore (block present)");
  else {
    if (!DRY) fs.writeFileSync(p, cur + (cur.endsWith("\n") || !cur ? "" : "\n") + IGNORE_BLOCK, "utf8");
    did.wrote.push(".gitignore (block appended)");
  }
}

console.log(`wire-repo: ${NAME} (${ROOT_FWD})${DRY ? "  [dry - nothing written]" : ""}`);
for (const w of did.wrote) console.log(`  ${DRY ? "would write" : "wrote"}  ${w}`);
for (const k of did.kept) console.log(`  kept   ${k}`);
console.log(`  wired: ${did.wrote.length + did.kept.length > 0 ? "yes" : "no"} - the next primary tick will fan out here; the board offers it once its builder has run`);
