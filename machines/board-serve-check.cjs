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
 *   node <factory>/machines/board-serve-check.cjs [--port 47390]
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
//
// AND IT MUST BE THE CURRENT SERVER, not merely a running one.
//
// The board's /seen endpoint was written, its tests failed, and nothing was
// wrong with the change: the process answering requests had started before that
// code existed. A check that asks only "is something listening" cannot see that,
// and the gap is permanent - every future change to the server has the same
// problem, and each one presents as a broken feature rather than a stale
// process, which is a genuinely expensive way to lose an hour.
//
// The server reports its own file's modification time. If the file on disk is
// newer than what is running, the running one is replaced.
const listening = (port) =>
  new Promise((resolve) => {
    const req = http.get({ host: "127.0.0.1", port, path: "/stamp", timeout: 1500 }, (res) => {
      const ours = res.headers["x-living-factory"] === "board";
      const running = Number(res.headers["x-board-version"] || 0);
      res.resume();
      if (!ours) return resolve("foreign");
      let onDisk = 0;
      try {
        onDisk = Math.round(fs.statSync(SERVER).mtimeMs);
      } catch {
        /* no file to compare against; a running server is the best available */
      }
      // A server too old to report its version is also too old to keep.
      if (onDisk && (!running || onDisk - running > 2000)) return resolve("stale");
      resolve(true);
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

  const up = await listening(PORT);
  if (up === true) {
    console.log(`board-serve-check: board server is listening on ${PORT}`);
    process.exit(0);
  }
  if (up === "foreign") {
    // Something else owns the address. The first version stopped here and said
    // "the server will pick the next free port when it is next started" - and
    // nothing ever started it, because this is the thing that starts it. A
    // board with its port taken stayed dead until a person noticed, inside the
    // one machine that exists so nobody has to. Verified 2026-09-13 while moving
    // the board off 4399: `tools/ngserve-benchmark.cjs` defaults to that same
    // port, so the collision was not hypothetical.
    //
    // The server already knows how to lose this race: it tries the next port,
    // up to ten, and writes the winner to board-port.txt. So start it, and read
    // the file afterwards rather than assuming the port we asked for.
    console.log(`board-serve-check: port ${PORT} is held by something that is NOT the board server - starting ours on the next free port`);
  }

  if (up === "stale") {
    // Replace it. The old process is holding the port, so it has to go first -
    // and it is ours, which is the only reason killing it is safe.
    console.log(`board-serve-check: server on ${PORT} is older than the code - replacing it`);
    try {
      const { execSync } = require("child_process");
      const out = execSync(`netstat -ano -p tcp | findstr LISTENING | findstr :${PORT}`, { encoding: "utf8" });
      const pid = (out.trim().split(/\s+/).pop() || "").trim();
      if (pid && /^\d+$/.test(pid)) process.kill(Number(pid));
    } catch {
      console.error("  could not stop the old server; it will keep serving stale code");
    }
    await new Promise((r) => setTimeout(r, 800));
  } else if (up !== "foreign") {
    console.log(`board-serve-check: NOT listening on ${PORT} - reviving`);
  }
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
  // The port the server actually took, which is only the one we asked for when
  // nothing else was there. The file is written by the server on listen.
  let took = PORT;
  try {
    took = Number(fs.readFileSync(PORTFILE, "utf8").trim()) || PORT;
  } catch {
    /* no file yet; the requested port is the best guess */
  }
  // `=== true`, not truthy: listening() also answers "foreign" and "stale", and
  // either of those reported as "revived" is the check passing for the wrong
  // reason.
  const back = (await listening(took)) === true;
  console.log(`board-serve-check: ${back ? `revived on ${took}` : "REVIVE FAILED"}`);

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
        subject: `board server on port ${took}`,
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
