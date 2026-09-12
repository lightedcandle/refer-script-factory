#!/usr/bin/env node
/**
 * DOES THE PULSE CYCLE ACTUALLY BEHAVE OVER TIME?
 *
 *   npm run gate:pulse-belt
 *
 * The machines gate runs every machine's read-only path and checks its exit
 * code. That proves `pulse-belt.cjs` runs. It cannot prove the thing the machine
 * is FOR - that a card moves incoming -> belt -> resolved -> gone on a real
 * clock, that a missed tick leaves a visible hole, and that a first run is not
 * drawn as a stopped factory.
 *
 * So this seeds cards at known ages and reads back where each one lands. Time is
 * not mocked; the fixture is simply written with backdated timestamps, which is
 * the same thing from the machine's point of view and needs no seam in the
 * machine to support it.
 *
 * THE CASE THAT EARNED THIS FILE IS C. The first version of the machine had no
 * grace window, and a scheduler firing twenty seconds early left the previous
 * card inside its first stage - so INCOMING held two and the cycle stopped
 * showing one card per state, which is the whole request. Windows Scheduled
 * Tasks and cron both drift by seconds, so that would have been most ticks, not
 * a rare one. Nothing in an exit code would ever have shown it.
 *
 * D and E are the other half of the same check: the grace must NOT be large
 * enough to hide a tick that genuinely did not happen. A liveness display that
 * cannot report death is worse than no display, because it is trusted.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const MACHINE = join(REPO, "machines", "pulse-belt.cjs");
const MIN = 60000;
const CARDS = ".claude/agent-context/pulse-belt.jsonl";
const REPORT = ".claude/agent-context/pulse-belt.json";

const failures = [];

function fixture(agesMinutes, declareEvery = "5m") {
  const root = mkdtempSync(join(tmpdir(), "pulse-cycle-"));
  mkdirSync(join(root, ".claude/agent-context"), { recursive: true });
  mkdirSync(join(root, "tools/factory"), { recursive: true });
  writeFileSync(
    join(root, "tools/factory/pulse.trigger.json"),
    JSON.stringify({ id: "pulse", drivenBy: "cycle test", every: declareEvery, why: "cycle test" }, null, 2) + "\n"
  );
  if (agesMinutes) {
    const now = Date.now();
    const lines = agesMinutes
      .slice()
      .sort((a, b) => b - a)
      .map((m, i) => JSON.stringify({ id: `seed-${m}m`, at: new Date(now - m * MIN).toISOString(), seq: i + 1, source: "cycle test" }));
    writeFileSync(join(root, CARDS), lines.join("\n") + "\n");
  }
  return root;
}

function tick(root, args = ["--json"]) {
  const r = spawnSync(process.execPath, [MACHINE, ...args], { cwd: root, encoding: "utf8", timeout: 60000 });
  if (/\n\s+at [\w.<>[\]]+ \(/.test(r.stderr || "")) throw new Error(`machine threw:\n${r.stderr}`);
  try {
    return JSON.parse(r.stdout);
  } catch {
    throw new Error(`no JSON report. exit ${r.status}\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  }
}

function check(name, want, got) {
  const ok = JSON.stringify(want) === JSON.stringify(got);
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `\n         wanted ${JSON.stringify(want)}\n         got    ${JSON.stringify(got)}`}`);
  if (!ok) failures.push(name);
}

const occ = (r) => [r.occupancy.incoming, r.occupancy.belt, r.occupancy.resolved];

function scenario(label, fn) {
  console.log(`\n${label}`);
  const root = fn.root();
  try {
    fn.body(root);
  } catch (e) {
    console.log(`  FAIL ${label} threw: ${e.message}`);
    failures.push(label);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

console.log("pulse belt cycle\n");

scenario("A. first run, no file at all - must not be drawn as a stopped factory", {
  root: () => fixture(null),
  body: (root) => {
    const r = tick(root);
    check("A one card, in incoming", [1, 0, 0], occ(r));
    check("A not reported as a gap", false, r.gap);
    check("A the file now exists", true, existsSync(join(root, CARDS)));
    check("A first beat is 1", 1, r.beat);
  },
});

scenario("B. steady state, ticks landing exactly on the stage", {
  root: () => fixture([5, 10, 15]),
  body: (root) => {
    const r = tick(root);
    check("B one card in each stage", [1, 1, 1], occ(r));
    check("B the oldest was dropped", 1, r.dropped);
    check("B no gap", false, r.gap);
  },
});

scenario("C. jitter - the scheduler fires 20s early, which it will", {
  root: () => fixture([4.67, 9.67, 14.67]),
  body: (root) => {
    const r = tick(root);
    check("C still one card in each stage", [1, 1, 1], occ(r));
    check("C an early tick is not a gap", false, r.gap);
  },
});

scenario("D. a missed tick - the hole must show", {
  root: () => fixture([12, 17]),
  body: (root) => {
    const r = tick(root);
    check("D belt is empty", 0, r.occupancy.belt);
    check("D reported as a gap", true, r.gap);
    check("D names which stage is empty", ["belt"], r.emptyStages);
  },
});

scenario("E. a long sleep - everything expired, and that is not silence", {
  root: () => fixture([60, 65, 70]),
  body: (root) => {
    const r = tick(root);
    check("E only the new card survives", [1, 0, 0], occ(r));
    check("E all three expired", 3, r.dropped);
    check("E reported as a gap", true, r.gap);
  },
});

scenario("F. corrupt lines are counted, never crash, never become cards", {
  root: () => fixture([5, 10]),
  body: (root) => {
    const f = join(root, CARDS);
    writeFileSync(f, readFileSync(f, "utf8") + "{not json\n" + JSON.stringify({ id: "no-at-field" }) + "\n");
    const r = tick(root);
    check("F both bad lines counted", 2, r.unreadable);
    check("F neither became a card", [1, 1, 1], occ(r));
  },
});

scenario("G. the stage length follows the repo's own declaration", {
  root: () => fixture([1, 2, 3], "1m"),
  body: (root) => {
    const r = tick(root);
    check("G stage is 1m", 60000, r.stageMs);
    check("G and says where it read that", "pulse", r.stageFrom);
    check("G the cycle still fills", [1, 1, 1], occ(r));
  },
});

scenario("H. --list writes nothing at all", {
  root: () => fixture([5, 10, 15]),
  body: (root) => {
    const before = readFileSync(join(root, CARDS), "utf8");
    tick(root, ["--list", "--json"]);
    check("H the cards file is untouched", before, readFileSync(join(root, CARDS), "utf8"));
    check("H no report was written", false, existsSync(join(root, REPORT)));
  },
});

console.log("");
if (!failures.length) {
  console.log("PASS - the cycle moves, jitter does not break it, and a missed tick still shows as a hole.");
  process.exit(0);
}
console.error(`FAIL - ${failures.length}: ${failures.join(", ")}`);
process.exit(1);
