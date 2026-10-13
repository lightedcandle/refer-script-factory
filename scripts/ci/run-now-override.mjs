#!/usr/bin/env node
/**
 * RUN NOW - proves the operator's queue override does what kind.cjs says it
 * does, and nothing it says it does not.
 *
 * Runs the real watcher and the real intake door against throwaway fixture
 * repos. The door is only ever run with --dry, so this starts no agent.
 *
 *   node scripts/ci/run-now-override.mjs
 *
 * WHAT IT DOES NOT PROVE: that a session actually starts under Manual. That
 * path spawns a real agent and is proven only by a real run.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MACHINES = resolve(dirname(fileURLToPath(import.meta.url)), "../../machines");
const now = Date.now();
const at = (minutesAgo) => new Date(now - minutesAgo * 60000).toISOString();
const stamp = { by: "operator", via: "run-now proof", at: at(1) };

// Two contracts accepted long ago, two fresh deposits whose timers are still
// running, and one decision held for him. Fresh matters: without the override a
// tier-6 deposit filed minutes ago is HOLD, so a PROMOTE can only be the stamp.
const base = [
  { id: "old-contract-a", run: at(6000), tier: 4, dimension: "body", claim: "Old work A.", recommend: "Do A.", triggers: "contract:body", owner: "claude" },
  { id: "accept-a", run: at(5990), tier: 4, dimension: "body", subject: "old-contract-a", claim: "Accepted as work.", kind: "contract", triggers: "terminal:triaged", owner: "claude" },
  { id: "old-contract-b", run: at(5000), tier: 4, dimension: "body", claim: "Old work B.", recommend: "Do B.", triggers: "contract:body", owner: "claude" },
  { id: "accept-b", run: at(4990), tier: 4, dimension: "body", subject: "old-contract-b", claim: "Accepted as work.", kind: "contract", triggers: "terminal:triaged", owner: "claude" },
  { id: "fresh-deposit-d", run: at(10), tier: 6, dimension: "body", claim: "Fresh work D.", recommend: "Do D.", triggers: "contract:body", owner: "claude" },
  { id: "fresh-deposit-e", run: at(9), tier: 6, dimension: "body", claim: "Fresh work E.", recommend: "Do E.", triggers: "contract:body", owner: "claude" },
  { id: "his-decision-h", run: at(8), tier: 1, dimension: "architecture", claim: "A taste call.", triggers: "operator", owner: "operator" },
];
const stamps = [
  { id: "run-now-d", run: at(1), subject: "fresh-deposit-d", claim: "Run now.", runNow: stamp, triggers: "terminal:recorded" },
  { id: "run-now-b", run: at(1), subject: "old-contract-b", claim: "Run now.", runNow: stamp, triggers: "terminal:recorded" },
  { id: "run-now-h", run: at(1), subject: "his-decision-h", claim: "Run now.", runNow: stamp, triggers: "terminal:recorded" },
  // Names nobody, so it is not his direction and must be ignored.
  { id: "run-now-e", run: at(1), subject: "fresh-deposit-e", claim: "Run now.", runNow: { by: "a session", at: at(1) }, triggers: "terminal:recorded" },
];

function fixture(records) {
  const root = mkdtempSync(join(tmpdir(), "run-now-"));
  mkdirSync(join(root, ".claude/agent-context"), { recursive: true });
  mkdirSync(join(root, "tools/factory"), { recursive: true });
  writeFileSync(join(root, ".claude/agent-context/findings.jsonl"), records.map((r) => JSON.stringify(r)).join("\n") + "\n");
  writeFileSync(join(root, "tools/factory/pulse.trigger.json"), JSON.stringify({ id: "pulse", run: "factory:pulse-check", every: "1h", floor: "5m", why: "run-now proof" }) + "\n");
  return root;
}

function run(root, machine, args) {
  const r = spawnSync(process.execPath, [join(MACHINES, machine), ...args], { cwd: root, encoding: "utf8", windowsHide: true });
  if (r.status !== 0) throw new Error(`${machine} ${args.join(" ")} exited ${r.status}: ${(r.stderr || r.stdout).slice(0, 400)}`);
  return JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
}

let failed = 0;
const check = (name, ok, got) => {
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${name}`);
  if (!ok) {
    failed++;
    console.log(`        got: ${JSON.stringify(got)}`);
  }
};

const roots = [];
try {
  // ---- control: no stamps ---------------------------------------------------
  const plain = fixture(base);
  roots.push(plain);
  const q0 = run(plain, "watcher.cjs", ["--arm", "--json"]);
  const ready0 = q0.ready.map((x) => x.id);
  check("without a stamp, a fresh deposit waits its timer and is not listed", !ready0.includes("fresh-deposit-d"), ready0);
  check("without a stamp, accepted work is listed oldest first", ready0[0] === "old-contract-a" && ready0[1] === "old-contract-b", ready0);
  const d0 = run(plain, "intake-worker.cjs", ["--dry", "--json"]);
  check("without a stamp, a Manual door would send nothing", d0.runNow.wouldSendUnderManual.length === 0 && d0.armed === false, d0.runNow);

  // ---- with the operator's stamps ------------------------------------------
  const marked = fixture([...base, ...stamps]);
  roots.push(marked);
  const q1 = run(marked, "watcher.cjs", ["--arm", "--json"]);
  const ready1 = q1.ready.map((x) => x.id);
  const top = ready1.slice(0, 2).sort();
  check("stamped work is at the top of the list, promoted and carried alike", top[0] === "fresh-deposit-d" && top[1] === "old-contract-b", ready1);
  check("unstamped accepted work keeps its place behind it", ready1[2] === "old-contract-a", ready1);
  check("a stamp that does not name the operator is ignored", !ready1.includes("fresh-deposit-e"), ready1);
  check("a stamp does not turn what is his into work", !ready1.includes("his-decision-h"), ready1);

  const belt = readFileSync(join(marked, ".claude/agent-context/findings.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const accepted = belt.filter((r) => r.triggers === "terminal:triaged" && String(r.kind).toLowerCase() === "contract").map((r) => r.subject);
  check("the stamped deposit was accepted by a recorded act, not skipped past acceptance", accepted.includes("fresh-deposit-d"), accepted);
  check("the decision was not accepted as work", !accepted.includes("his-decision-h"), accepted);

  const d1 = run(marked, "intake-worker.cjs", ["--dry", "--json"]);
  const would = [...d1.runNow.wouldSendUnderManual].sort();
  check("a Manual door would send exactly the stamped items", would.length === 2 && would[0] === "fresh-deposit-d" && would[1] === "old-contract-b", d1.runNow);
  check("and the door still reports itself as not armed", d1.armed === false && d1.mode === "manual", { armed: d1.armed, mode: d1.mode });
  check("a dry run starts nothing", d1.dispatched.length === 0 && d1.runNow.override === false, { dispatched: d1.dispatched, override: d1.runNow.override });
  check("unstamped work selected alongside is marked as not overridden", d1.selected.some((s) => s.id === "old-contract-a" && s.runNow === false), d1.selected);
} catch (err) {
  failed++;
  console.log(`  FAIL  the proof could not run: ${err.message}`);
} finally {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
}

console.log(failed ? `\nrun-now override: ${failed} FAILED` : "\nrun-now override: all passed");
process.exit(failed ? 1 : 0);
