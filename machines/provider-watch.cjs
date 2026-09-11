#!/usr/bin/env node
/**
 * PROVIDER WATCH - the WORLD tier, finally given something behind it.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "Supabase gives us real metrics and issues we need to
 * incorporate in order to fix and make the system more efficient. We need to
 * watch cost and slate for adjustment. Same for Cloudflare, and Docker."
 *
 * WORLD has sat on the board's top edge since the first draft with nothing
 * behind it - an honest label for a gap. This is the first thing behind it, and
 * it matters more than the other tiers because of what it watches: E1, "the
 * world moved". A provider restricts an account, a quota tips, an advisory
 * appears, a daemon stops - nobody touched anything and it broke anyway. The
 * inward tiers cannot see any of that by construction.
 *
 * WHAT THIS MACHINE CAN AND CANNOT DO, stated plainly because the split is not
 * obvious and getting it wrong would produce a watcher that quietly reports on
 * half the world:
 *
 *   DOCKER is local and has a CLI, so it is fully scriptable and lives here.
 *
 *   SUPABASE and CLOUDFLARE are reachable only through MCP connectors, which a
 *   script cannot call - they need a session. So they are a SESSION duty, in the
 *   tick prompt, not a silent omission here. This machine reports them as
 *   "session-only" rather than as healthy, because a provider nobody checked is
 *   not a provider that is fine.
 *
 * A DAEMON THAT IS DOWN IS A FINDING, NOT A CRASH. Docker Desktop is in this
 * machine's startup list and its engine was found stopped on 2026-09-11. A
 * watcher that threw on that would have reported nothing at all, which is the
 * outcome it exists to prevent.
 *
 *   node <factory>/machines/provider-watch.cjs         report
 *   node <factory>/machines/provider-watch.cjs --json  machine-readable
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const OUT = path.join(CTX, "provider-watch.json");
const BELT = path.join(CTX, "findings.jsonl");

const JSON_OUT = process.argv.includes("--json");

if (!fs.existsSync(CTX)) {
  console.error(`provider-watch: no .claude/agent-context in ${ROOT} - run this from a repo that carries a factory.`);
  process.exit(2);
}

const run = (cmd, args) => {
  try {
    return { ok: true, out: execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (err) {
    return { ok: false, out: "", err: String((err && err.stderr) || (err && err.message) || err).trim() };
  }
};

// ---- docker -----------------------------------------------------------------

const bytes = (s) => {
  const m = String(s || "").match(/^([\d.]+)\s*([KMGT]?B)$/i);
  if (!m) return 0;
  const mult = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 }[m[2].toUpperCase()] || 1;
  return Number(m[1]) * mult;
};
const gb = (n) => Number((n / 1e9).toFixed(2));

function docker() {
  const probe = run("docker", ["version", "--format", "{{.Server.Version}}"]);
  if (!probe.ok) {
    const down = /cannot find the file|daemon is not running|connect/i.test(probe.err || "");
    return {
      reachable: false,
      state: down ? "daemon-stopped" : "unavailable",
      detail: (probe.err || "").split("\n")[0].slice(0, 180),
    };
  }

  const df = run("docker", ["system", "df", "--format", "{{.Type}}|{{.TotalCount}}|{{.Active}}|{{.Size}}|{{.Reclaimable}}"]);
  const rows = df.ok
    ? df.out
        .split(/\r?\n/)
        .filter((l) => l.includes("|"))
        .map((l) => {
          const [type, total, active, size, reclaim] = l.split("|");
          return {
            type,
            total: Number(total) || 0,
            active: Number(active) || 0,
            sizeGB: gb(bytes(size)),
            reclaimableGB: gb(bytes(String(reclaim).replace(/\s*\(.*\)$/, ""))),
          };
        })
    : [];

  const ps = run("docker", ["ps", "-a", "--format", "{{.Names}}|{{.State}}"]);
  const containers = ps.ok
    ? ps.out
        .split(/\r?\n/)
        .filter((l) => l.includes("|"))
        .map((l) => {
          const [name, state] = l.split("|");
          return { name, state };
        })
    : [];

  const reclaimableGB = Number(rows.reduce((a, r) => a + r.reclaimableGB, 0).toFixed(2));
  return {
    reachable: true,
    state: "running",
    serverVersion: probe.out.trim(),
    usage: rows,
    reclaimableGB,
    containers: { total: containers.length, running: containers.filter((c) => c.state === "running").length },
  };
}

// ---- the report -------------------------------------------------------------

const d = docker();

// Supabase and Cloudflare are named explicitly as unchecked rather than omitted.
// An absent provider reads as "fine" to anyone skimming, and "nobody looked" is
// a different fact from "nothing wrong" - the same distinction the board already
// draws between an absent month and a zero one.
const report = {
  checkedAt: new Date().toISOString(),
  repo: path.basename(ROOT),
  docker: d,
  supabase: { checked: false, how: "session-only", why: "reachable only through an MCP connector, which a script cannot call" },
  cloudflare: { checked: false, how: "session-only", why: "reachable only through an MCP connector, which a script cannot call" },
};

fs.mkdirSync(CTX, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");

// ---- deposit, once per state change ----------------------------------------
//
// Not once per run. This machine runs on a clock; a record each time would put
// dozens of identical lines on the belt and bury the real ones - the flooding
// failure already recorded in this system from a findings file that died of it.
// The id carries the state, so a change earns a record and a steady state never
// earns a second.

const faults = [];
if (!d.reachable) faults.push({ key: `docker-${d.state}`, claim: `Docker is not reachable (${d.state}), so anything the factory runs on it is stopped.`, evidence: d.detail || "no detail from the CLI" });
else if (d.reclaimableGB >= 10)
  faults.push({
    key: `docker-reclaimable-${Math.floor(d.reclaimableGB / 10) * 10}`,
    claim: `Docker is holding ${d.reclaimableGB}GB that can be reclaimed.`,
    evidence: d.usage.map((r) => `${r.type}: ${r.total} total, ${r.active} active, ${r.reclaimableGB}GB reclaimable`).join(" · "),
  });

let deposited = 0;
const beltText = fs.existsSync(BELT) ? fs.readFileSync(BELT, "utf8") : "";
for (const f of faults) {
  const id = `world-${f.key}`;
  if (beltText.includes(`"${id}"`)) continue;
  const record = {
    id,
    run: new Date().toISOString(),
    driver: "E1",
    tier: 7,
    dimension: "spirit",
    subject: "docker on the factory host",
    claim: f.claim,
    evidence: f.evidence,
    seen: false,
    confidence: "measured",
    triggers: "operator",
    owner: "operator",
  };
  fs.appendFileSync(BELT, JSON.stringify(record) + "\n", "utf8");
  deposited++;
}

if (JSON_OUT) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`provider-watch: [${report.repo}] ${new Date().toISOString()}`);
  console.log(
    `  docker:     ${d.reachable ? `running ${d.serverVersion} · ${d.containers.running}/${d.containers.total} up · ${d.reclaimableGB}GB reclaimable` : `NOT REACHABLE (${d.state})`}`,
  );
  console.log("  supabase:   not checked here - session-only (MCP)");
  console.log("  cloudflare: not checked here - session-only (MCP)");
  if (deposited) console.log(`  deposited ${deposited} finding(s) to the belt`);
}

process.exit(faults.length ? 1 : 0);
