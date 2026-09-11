#!/usr/bin/env node
/**
 * BOARD SERVE CHECK - the watcher for the thing that shows the watchers.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "So who manages the factory page server and makes sure
 * it's always running? Is there a watcher and resolution for that?"
 *
 * There was not, and the gap was the worst-shaped one in the system. Probed
 * before fixing: with the server killed, an already-loaded board kept its clock
 * ticking and eleven animations running. It looked perfectly alive. On a wall
 * monitor - where nobody is checking, which is the entire point of a wall
 * monitor - a frozen board that looks alive is worse than a blank screen.
 *
 * This is the same recursion the factory keeps meeting and has to keep closing:
 * nothing watched the watcher, so the pulse was built; nothing read the board,
 * so the critic was built; nothing watched the thing SERVING the board. Each
 * time the answer is the same and it is not "another supervisor" - it is a
 * station whose output triggers something, exactly like every other.
 *
 * TWO HALVES, because either alone still lies:
 *
 *   THIS FILE          revives the server when it is not listening, and
 *                      deposits when it had to.
 *   THE PAGE ITSELF    stops moving, dims, and says how long it has been
 *                      frozen when it stops hearing from the server.
 *
 * The page half matters even with this running: a revive takes a cycle, and
 * during that cycle the display must not pretend. And this machine cannot help
 * at all if the whole host is down - only the page can be honest about that.
 *
 *   node <factory>/machines/board-serve-check.cjs [--port 4399]
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const SERVER = path.join(ROOT, "tools/factory/serve-tracker.cjs");

// The server writes down which port it actually took, because a port it had to
// fall back from is one nothing else would guess. Read that first; the flag and
// the default are only fallbacks.
const PORTFILE = path.join(CTX, "board-port.txt");
const i = process.argv.indexOf("--port");
const PORT =
  i >= 0
    ? Number(process.argv[i + 1])
    : (() => {
        try {
          return Number(fs.readFileSync(PORTFILE, "utf8").trim()) || 47390;
        } catch {
          return 47390;
        }
      })();

// IT MUST BE OUR SERVER, not merely something answering.
//
// The first version opened a TCP connection and called that healthy. If any
// other process took the address, the check would have reported the board fine
// forever while the display sat frozen - a check that passes for the wrong
// reason, which is worse than no check because it is trusted. The board server
// sets an x-living-factory header; nothing else will.
const listening = () =>
  new Promise((resolve) => {
    const req = http.get({ host: "127.0.0.1", port: PORT, path: "/stamp", timeout: 1500 }, (res) => {
      const ours = res.headers["x-living-factory"] === "board";
      res.resume();
      resolve(ours ? true : "foreign");
    });
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
  });

(async () => {
  if (!fs.existsSync(SERVER)) {
    console.log(`board-serve-check: no server script at ${path.relative(ROOT, SERVER)} - nothing to keep alive`);
    process.exit(0);
  }

  const up = await listening();
  if (up === true) {
    console.log(`board-serve-check: board server is listening on ${PORT}`);
    process.exit(0);
  }
  if (up === "foreign") {
    // Something else owns the address. Starting another server here would just
    // lose the race again, so this reports rather than fights - and the server
    // itself will pick the next free port when it is next started.
    console.error(
      `board-serve-check: port ${PORT} is held by something that is NOT the board server.\n` +
        `  Not starting a second one - it would lose the same race. The board server\n` +
        `  falls back to the next free port on its next start and writes the choice to\n` +
        `  .claude/agent-context/board-port.txt.`,
    );
    process.exit(1);
  }

  console.log(`board-serve-check: NOT listening on ${PORT} - reviving`);
  // detached + unref so the server outlives this station's process. A child that
  // dies with its parent would come back for exactly as long as the check runs,
  // which is a revival that revives nothing.
  const child = spawn(process.execPath, [SERVER, "--port", String(PORT)], {
    cwd: ROOT,
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  await new Promise((r) => setTimeout(r, 2500));
  const back = await listening();
  console.log(`board-serve-check: ${back ? "revived" : "REVIVE FAILED"}`);

  // Deposit once per outage, keyed to the day so a server that dies repeatedly
  // earns one record a day rather than one per cycle - the flooding rule.
  const id = `board-server-down-${new Date().toISOString().slice(0, 10)}`;
  const beltText = fs.existsSync(BELT) ? fs.readFileSync(BELT, "utf8") : "";
  if (!beltText.includes(`"${id}"`)) {
    fs.appendFileSync(
      BELT,
      JSON.stringify({
        id,
        run: new Date().toISOString(),
        driver: "I6",
        tier: 6,
        dimension: "hive",
        subject: `board server on port ${PORT}`,
        claim: back
          ? "The board server was not running and was revived. Anything watching the wall display was looking at a frozen page until then."
          : "The board server was not running and could NOT be revived. The wall display is showing stale data.",
        evidence: `Port ${PORT} was not accepting connections. Revive ${back ? "succeeded" : "failed"}. A loaded board keeps its clock ticking and its animations running with the server dead, so an outage is invisible to anyone glancing at it - which is why this check exists and why the page also dims and says so.`,
        seen: false,
        confidence: "measured",
        triggers: back ? "terminal:revived" : "operator",
        owner: back ? "spirit" : "operator",
      }) + "\n",
      "utf8",
    );
    console.log("  deposited");
  }

  process.exit(back ? 0 : 1);
})();
