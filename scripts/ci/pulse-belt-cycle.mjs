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

// The cards are UNIVERSAL - they live in the factory, not in the repo being
// ticked - so a fixture needs two directories: a fake factory to hold the cards
// and a fake consuming repo to be ticked from. REFER_FACTORY_ROOT points at the
// first, which is also what keeps this test from ever writing into the real
// factory's .refer-factory.
const CARDS = ".refer-factory/pulse-belt.jsonl";
const REPORT = ".refer-factory/pulse-belt.json";

const failures = [];

function fixture(agesMinutes, declareEvery = "5m", { repos = 1 } = {}) {
  const base = mkdtempSync(join(tmpdir(), "pulse-cycle-"));
  const factory = join(base, "factory");
  mkdirSync(join(factory, ".refer-factory"), { recursive: true });
  mkdirSync(join(factory, "machines"), { recursive: true });
  // Discovery looks for machines/pulse-belt.cjs to identify a factory root, so
  // the fake factory needs one. Its contents are irrelevant - the real machine
  // is invoked by absolute path.
  writeFileSync(join(factory, "machines/pulse-belt.cjs"), "// marker for factory-root discovery\n");

  const repoRoots = [];
  for (let i = 0; i < repos; i++) {
    const repo = join(base, i === 0 ? "app" : `app-${i + 1}`);
    mkdirSync(join(repo, "tools/factory"), { recursive: true });
    writeFileSync(
      join(repo, "tools/factory/pulse.trigger.json"),
      JSON.stringify({ id: "pulse", drivenBy: "cycle test", every: declareEvery, why: "cycle test" }, null, 2) + "\n"
    );
    repoRoots.push(repo);
  }

  if (agesMinutes) {
    const now = Date.now();
    const lines = agesMinutes
      .slice()
      .sort((a, b) => b - a)
      .map((m, i) => JSON.stringify({ id: `seed-${m}m`, at: new Date(now - m * MIN).toISOString(), seq: i + 1, source: "cycle test" }));
    writeFileSync(join(factory, CARDS), lines.join("\n") + "\n");
  }
  return { base, factory, repo: repoRoots[0], repos: repoRoots };
}

function tick(fx, args = ["--json"], fromRepo = null) {
  const r = spawnSync(process.execPath, [MACHINE, ...args], {
    cwd: fromRepo || fx.repo,
    encoding: "utf8",
    timeout: 60000,
    env: { ...process.env, REFER_FACTORY_ROOT: fx.factory },
  });
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
  const fx = fn.root();
  try {
    fn.body(fx);
  } catch (e) {
    console.log(`  FAIL ${label} threw: ${e.message}`);
    failures.push(label);
  } finally {
    rmSync(fx.base, { recursive: true, force: true });
  }
}

console.log("pulse belt cycle\n");

scenario("A. first run, no file at all - must not be drawn as a stopped factory", {
  root: () => fixture(null),
  body: (fx) => {
    const r = tick(fx);
    check("A one card, in incoming", [1, 0, 0], occ(r));
    check("A not reported as a gap", false, r.gap);
    check("A the file now exists", true, existsSync(join(fx.factory, CARDS)));
    check("A first beat is 1", 1, r.beat);
  },
});

scenario("B. steady state, ticks landing exactly on the stage", {
  root: () => fixture([5, 10, 15]),
  body: (fx) => {
    const r = tick(fx);
    check("B one card in each stage", [1, 1, 1], occ(r));
    check("B the oldest was dropped", 1, r.dropped);
    check("B no gap", false, r.gap);
  },
});

scenario("C. jitter - the scheduler fires 20s early, which it will", {
  root: () => fixture([4.67, 9.67, 14.67]),
  body: (fx) => {
    const r = tick(fx);
    check("C still one card in each stage", [1, 1, 1], occ(r));
    check("C an early tick is not a gap", false, r.gap);
  },
});

scenario("D. a missed tick - the hole must show", {
  root: () => fixture([12, 17]),
  body: (fx) => {
    const r = tick(fx);
    check("D belt is empty", 0, r.occupancy.belt);
    check("D reported as a gap", true, r.gap);
    check("D names which stage is empty", ["belt"], r.emptyStages);
  },
});

scenario("E. a long sleep - everything expired, and that is not silence", {
  root: () => fixture([60, 65, 70]),
  body: (fx) => {
    const r = tick(fx);
    check("E only the new card survives", [1, 0, 0], occ(r));
    check("E all three expired", 3, r.dropped);
    check("E reported as a gap", true, r.gap);
  },
});

scenario("F. corrupt lines are counted, never crash, never become cards", {
  root: () => fixture([5, 10]),
  body: (fx) => {
    const f = join(fx.factory, CARDS);
    writeFileSync(f, readFileSync(f, "utf8") + "{not json\n" + JSON.stringify({ id: "no-at-field" }) + "\n");
    const r = tick(fx);
    check("F both bad lines counted", 2, r.unreadable);
    check("F neither became a card", [1, 1, 1], occ(r));
  },
});

scenario("G. the stage length follows the repo's own declaration", {
  root: () => fixture([1, 2, 3], "1m"),
  body: (fx) => {
    const r = tick(fx);
    check("G stage is 1m", 60000, r.stageMs);
    check("G and says where it read that", "pulse", r.stageFrom);
    check("G the cycle still fills", [1, 1, 1], occ(r));
  },
});

scenario("H. --list writes nothing at all", {
  root: () => fixture([5, 10, 15]),
  body: (fx) => {
    const before = readFileSync(join(fx.factory, CARDS), "utf8");
    tick(fx, ["--list", "--json"]);
    check("H the cards file is untouched", before, readFileSync(join(fx.factory, CARDS), "utf8"));
    check("H no report was written", false, existsSync(join(fx.factory, REPORT)));
  },
});

scenario("I. UNIVERSAL - two repos, one heartbeat, one file, one counter", {
  root: () => fixture(null, "5m", { repos: 2 }),
  body: (fx) => {
    const a = tick(fx, ["--json"], fx.repos[0]);
    check("I the first repo beats", 1, a.beat);
    check("I and the card records which repo drove it", "app", a.cards[0].drivenFrom);
    check("I the cards are in the factory, not the repo", true, a.file.includes("factory/.refer-factory"));
    check("I no per-repo copy was made", false, existsSync(join(fx.repos[0], ".claude/agent-context/pulse-belt.jsonl")));

    // The second repo ticks inside the same stage. Before the cards were moved
    // to the factory this produced a SECOND belt with its own beat 1 - two
    // counters for one heartbeat - and each would have reported the other's
    // ticks as gaps. Now it is the same file and the tick is already recorded.
    const b = tick(fx, ["--json"], fx.repos[1]);
    check("I the second repo adds no second beat", true, b.alreadyBeat);
    check("I the counter did not double", 1, b.beat);
    check("I still exactly one card", 1, b.cards.length);
    check("I and nothing was rewritten, so the board will not flicker", false, b.changed);
  },
});

scenario("J. a wrong REFER_FACTORY_ROOT is refused, never quietly ignored", {
  root: () => fixture([5, 10]),
  body: (fx) => {
    // The danger this guards is specific and was nearly shipped: if a bogus
    // override silently fell back to the real factory, a test run would write
    // LIVE cards. So being set and wrong must stop, not degrade.
    const r = spawnSync(process.execPath, [MACHINE, "--json"], {
      cwd: fx.repo,
      encoding: "utf8",
      timeout: 60000,
      env: { ...process.env, REFER_FACTORY_ROOT: join(fx.base, "nope") },
    });
    check("J exits 2 - a config fault, not a finding and not a crash", 2, r.status);
    check("J names the variable and the path", true, /REFER_FACTORY_ROOT is set to/.test(r.stderr || ""));
    check("J refuses to guess rather than falling back", true, /Refusing to guess/.test(r.stderr || ""));
    check("J says that is not the pulse having stopped", true, /NOT the pulse having stopped/.test(r.stderr || ""));
    check("J created nothing at the bogus path", false, existsSync(join(fx.base, "nope")));
    check("J and left the real fixture cards untouched", 2, readFileSync(join(fx.factory, CARDS), "utf8").trim().split("\n").length);
  },
});

scenario("K. no override at all - it finds its own factory without being told", {
  root: () => fixture(null),
  body: (fx) => {
    const r = spawnSync(process.execPath, [MACHINE, "--list", "--json"], {
      cwd: fx.repo,
      encoding: "utf8",
      timeout: 60000,
      env: { ...process.env, REFER_FACTORY_ROOT: "" },
    });
    const rep = JSON.parse(r.stdout);
    check("K exits clean", 0, r.status);
    check("K resolved to the real factory it lives in", true, rep.factory.endsWith("refer-script-factory") || rep.factory.includes("worktrees"));
    check("K and reports itself as universal", true, rep.universal);
  },
});

console.log("");
if (!failures.length) {
  console.log("PASS - one heartbeat in one universal file, the cycle moves, jitter does not break it, and a missed tick still shows as a hole.");
  process.exit(0);
}
console.error(`FAIL - ${failures.length}: ${failures.join(", ")}`);
process.exit(1);
