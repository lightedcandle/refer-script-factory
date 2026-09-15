#!/usr/bin/env node
/**
 * Serves the built board on localhost so it can be LOOKED AT.
 *
 * The board is published as an artifact, and the artifact needs a claude.ai
 * login the in-app browser does not have - so on 2026-09-11 the board was
 * verified structurally and never actually seen. "Look at it rendered" is this
 * repo's own rule and it was being skipped for want of two dozen lines.
 *
 * Serving it over http makes it a web page rather than a local file, which is
 * the difference between a browser that can screenshot it and one that cannot.
 *
 * WHERE THIS FILE LIVES, since 2026-09-14: `<factory>/engine/serve-tracker.cjs`.
 * It was `E:/Telechurch-e2e-v2/tools/factory/serve-tracker.cjs` until then. It
 * is not a machine - a machine asks what is true in the repo it is pointed at,
 * and this asks nothing: it is ONE process for ALL repos, and every request
 * names its own subject with ?repo=. That is why it sits in engine/ beside the
 * scheduler rather than in machines/, and why its ROOT below is its own HOME
 * and never a subject.
 *
 *   node <factory>/engine/serve-tracker.cjs [--port 47390]
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

// THIS IS THE SERVER'S HOME, NOT A SUBJECT. Nothing served comes from here:
// every route resolves its files through repoOf(), from the ecosystem map, so
// the board of any repo is `<that repo>/.claude/agent-context/...`. ROOT is
// used for exactly three things - the port file this process writes down, the
// pulse belt's universal state, and the single-repo fallback when no map can be
// read - and all three belong to the factory rather than to whichever repo is
// being looked at. So it is the directory above this file.
const ROOT = path.resolve(__dirname, "..");
// The port this process took, written down so nothing has to guess it. It is
// the server's OWN state - one server, one port - so it lives in the factory
// beside the server, and board-serve-check.cjs reads this exact path.
const PORTFILE = path.join(ROOT, ".claude/agent-context/board-port.txt");
// FILE, SCHEDULE, SNAPS, READ and BELT used to stand here, all `path.join(ROOT,
// ".claude/agent-context/...")`. The ?repo= refactor replaced every one of them
// with repoOf()'s per-subject paths and left the constants behind, unreferenced.
// They are removed with the move rather than repointed, because repointing them
// at the new ROOT would have written down that the FACTORY has a belt - and the
// belt is per consuming repo and never in this one. A dead constant that states
// something false is worse than a dead constant.
//
// A byte-order mark, built from its code point so no escape sits in this file.
// PowerShell 5.1 writes one at the head of every UTF-8 file it saves, and a
// regex written with the escape was saved as the literal character four times
// today - invisible in every editor, diff and grep, which is exactly why the
// factory's gate forbids it in parsed files.
const BOM_RE = new RegExp("^" + String.fromCharCode(0xfeff));

// The belt's kind vocabulary, so the triage door writes the same record shape
// every other door writes. It is a SIBLING now - `<factory>/machines/kind.cjs`,
// one directory across from this one - so it is resolved by location and not
// searched for. The three-candidate search that stood here (environment, then a
// hardcoded E:/refer-script-factory, then a guess at a sibling of the subject)
// existed only because this server lived in the product repo; keeping it after
// the move would be a way to load a DIFFERENT factory's vocabulary than the one
// this file shipped with. If it is missing, the install is broken: /triage
// answers 503 rather than inventing a record format - a record nothing else can
// read is worse than a door that is honestly shut.
const KINDLIB = (() => {
  const tried = [path.join(__dirname, "../machines/kind.cjs")];
  for (const p of tried) {
    if (!fs.existsSync(p)) continue;
    try {
      return require(p);
    } catch {
      return null;
    }
  }
  return null;
})();

// The one definition of "alive" - session-life.cjs - resolved as a sibling for
// the same reason the kind vocabulary is above. Without it /activity cannot say
// how many contracts have a live agent, and says so rather than guessing.
const LIFELIB = (() => {
  const tried = [path.join(__dirname, "../machines/session-life.cjs")];
  for (const p of tried) {
    if (!fs.existsSync(p)) continue;
    try {
      return require(p);
    } catch {
      return null;
    }
  }
  return null;
})();

// ---- ONE SERVER, ONE BOARD PER REPO ----------------------------------------
//
// Operator, 2026-09-14: "lets wire the script factory repo in the board, and
// select it as default ... a dropdown under the Repo Label in the header to
// quickly select a new repo for observable."
//
// Every request names its subject with ?repo=<id>; the id is the ecosystem
// map's repo_id, and the map is the operator's file. Each subject has its own
// belt, schedule state, read receipts, snapshots and built board, all under
// that repo's .claude/agent-context - nothing here merges two repos' state,
// because a belt is about a repo. The default subject is the factory: the
// thing that watches everything should at least be able to watch itself.
//
// /pulse is the one exception: the pulse belt is universal state, one file,
// whichever repo is being looked at.
const ECOSYSTEM_MAP = [process.env.REFER_ECOSYSTEM_MAP, "E:/e2e-bridge/governance/ecosystem-map.json"].filter(Boolean).find((p) => fs.existsSync(p)) || null;
const DEFAULT_REPO = "refer-script-factory";
const REPOS = (() => {
  const out = {};
  if (ECOSYSTEM_MAP) {
    try {
      for (const r of JSON.parse(fs.readFileSync(ECOSYSTEM_MAP, "utf8").replace(/^\uFEFF/, "")).repos || []) {
        if (r && r.repo_id && r.path) out[String(r.repo_id)] = { id: String(r.repo_id), name: String(r.name || r.repo_id), path: String(r.path), active: r.status === "active" };
      }
    } catch {
      /* fall through to the one repo this server can vouch for */
    }
  }
  // Without a map the server still serves the repo it lives in, under its
  // own basename, so a missing map degrades to the old single-board behaviour
  // rather than to nothing.
  if (!Object.keys(out).length) out[path.basename(ROOT)] = { id: path.basename(ROOT), name: path.basename(ROOT), path: ROOT, active: true };
  return out;
})();
const declaresTriggers = (root) =>
  ["tools", "tools/factory", "scripts"].some((rel) => {
    try {
      return fs.readdirSync(path.join(root, rel)).some((f) => f.endsWith(".trigger.json") || f.endsWith(".station.json"));
    } catch {
      return false;
    }
  });
const repoOf = (url) => {
  const q = String(url || "").split("?")[1] || "";
  const m = /(?:^|&)repo=([^&]*)/.exec(q);
  const id = m ? decodeURIComponent(m[1]) : REPOS[DEFAULT_REPO] ? DEFAULT_REPO : Object.keys(REPOS)[0];
  const r = REPOS[id];
  if (!r) return null;
  const ctx = path.join(r.path, ".claude/agent-context");
  return {
    ...r,
    root: r.path,
    ctx,
    file: path.join(ctx, "factory-tracker.html"),
    read: path.join(ctx, "board-read.json"),
    belt: path.join(ctx, "findings.jsonl"),
    schedule: path.join(ctx, "schedule-state.json"),
    snaps: path.join(ctx, "board-snaps"),
  };
};

// 47390, not 4399.
//
// Operator, 2026-09-11: "we might need to select a server less used address so
// nothing fights for that address."
//
// 4399 sat inside the cluster this repo already claims - 4200, 4210, 4300, 4310
// - so the next dev server added here had a real chance of landing on it. 47390
// is above the common registered ports and BELOW 49152, where Windows starts
// handing out ephemeral ports for outbound connections; a listener up there can
// collide with one of those, which is a rare failure that would be miserable to
// diagnose.
//
// But picking a luckier number only moves the problem, so the port is also not
// fought over: if the chosen one is taken, the next free one is used and the
// choice is WRITTEN DOWN. Everything that needs to reach the board reads the
// file rather than assuming.
const DEFAULT_PORT = 47390;
const i = process.argv.indexOf("--port");
const WANTED = i >= 0 ? Number(process.argv[i + 1]) : DEFAULT_PORT;
const MAX_TRIES = 10;

// /stamp returns the board file's mtime. The page polls it and reloads ONLY
// when it changes.
//
// A blind meta-refresh was the obvious alternative and is worse: it reloads on a
// timer whether or not anything happened, which loses scroll position and any
// clicked chart node for nothing, and - on a board whose whole subject is
// whether things are actually running - makes the display look alive on a dead
// factory. Reloading only on a real change keeps the same rule the rest of this
// system runs on: motion should mean something happened.
const stamp = (file) => (fs.existsSync(file) ? String(fs.statSync(file).mtimeMs) : "0");

// The read store, in one shape whichever shape is on disk.
//
// It began as `{at, ids[]}` - a membership set and one global timestamp - and
// receipts already written that way must not be thrown out, so they are folded
// in with a null time. Null means "read, time unknown", which is honest; absent
// means unread, which is the only distinction anything downstream depends on.
const readStore = (readPath) => {
  let raw = {};
  try {
    raw = JSON.parse(fs.readFileSync(readPath, "utf8"));
  } catch {
    /* first read ever */
  }
  const read = {};
  for (const id of raw.ids || []) read[String(id)] = null;
  for (const [id, t] of Object.entries(raw.read || {})) read[String(id)] = t;
  return { at: raw.at || null, read };
};

// The server's own version, so a watcher can tell a RUNNING server from a
// CURRENT one.
//
// The /seen endpoint was written, the tests failed, and the cause was that the
// process serving the board had started before the code existed. Nothing was
// wrong with the change; the thing answering requests was simply old. A revive
// check that only asks "is something listening" cannot see that, and the gap is
// permanent: every future change to this file has the same problem.
const OWN_VERSION = (() => {
  try {
    return String(Math.round(fs.statSync(__filename).mtimeMs));
  } catch {
    return "0";
  }
})();

const server = http
  .createServer((req, res) => {
    // The path decides the route; the query decides the subject.
    const P = String(req.url || "/").split("?")[0];
    const R = repoOf(req.url);
    if (P === "/repos") {
      const list = Object.values(REPOS).map((r) => {
        const exists = fs.existsSync(r.path);
        return { id: r.id, name: r.name, active: r.active, exists, wired: exists && declaresTriggers(r.path), hasBoard: fs.existsSync(path.join(r.path, ".claude/agent-context/factory-tracker.html")) };
      });
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify({ default: DEFAULT_REPO, repos: list }));
      return;
    }
    // ---- ALL REPOS: one page, one tile per repo ---------------------------------
    //
    // Operator, 2026-09-14: "wire up all the repos, and add the all repo
    // option in the drop down." This is a DISPLAY page and nothing else: it
    // decides nothing, builds nothing, and stores nothing. Every tile is
    // filled by the page itself from the endpoints that already exist for
    // each repo - /schedule (the beat), /sessions (who is here), /activity
    // (the four workers' in-trays) - every ten seconds on the wall clock. A
    // repo that is wired but has never been ticked says so; one that is not
    // wired says why; none of them is guessed. Served here rather than built,
    // because there is no judgement in it to record - it is the rail's idea
    // applied to repos.
    if (P === "/" && /(?:^|&)repo=__all(?:&|$)/.test(String(req.url || "").split("?")[1] || "")) {
      const repos = Object.values(REPOS).map((r) => {
        const exists = fs.existsSync(r.path);
        return { ...r, exists, wired: exists && declaresTriggers(r.path), hasBoard: exists && fs.existsSync(path.join(r.path, ".claude/agent-context/factory-tracker.html")) };
      });
      const mono = "'JetBrains Mono', ui-monospace, monospace";
      const tile = (r) => `
      <a class="tile${r.wired ? "" : " off"}" href="${r.wired ? `/?repo=${encodeURIComponent(r.id)}` : "#"}" data-repo-tile="${r.id}" data-wired="${r.wired ? 1 : 0}">
        <div class="row"><span class="lamp" data-f="lamp"></span><span class="name">${r.name.replace(/[<>&"]/g, "")}</span><span class="beat" data-f="beat">${r.wired ? "—" : r.exists ? "not wired" : "not on this host"}</span></div>
        <div class="grid">
          <div><b data-f="sessions">—</b><span>sessions</span></div>
          <div><b data-f="timer">—</b><span>timer</span></div>
          <div><b data-f="watcher">—</b><span>watcher</span></div>
          <div><b data-f="supervisor">—</b><span>supervisor</span></div>
          <div><b data-f="builder">—</b><span>builder</span></div>
        </div>
        <div class="foot" data-f="foot">${r.wired ? (r.hasBoard ? "board built" : "wired · board not built yet") : ""}</div>
      </a>`;
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Living Factory — all repos</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body{margin:0;background:oklch(0.15 0.012 70);color:oklch(0.95 0.008 85);font-family:'Space Grotesk',system-ui,sans-serif;padding:30px 34px}
  .head{display:flex;align-items:baseline;gap:18px;margin-bottom:22px}
  .head small{font-family:${mono};font-size:13px;letter-spacing:0.16em;color:oklch(0.58 0.01 80)}
  .head h1{font-size:34px;font-weight:600;letter-spacing:-0.02em;margin:0}
  .head .n{font-family:${mono};font-size:14px;letter-spacing:0.12em;color:oklch(0.62 0.01 80);margin-left:auto}
  .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
  .tile{display:block;text-decoration:none;color:inherit;background:oklch(0.185 0.012 70);border:1px solid oklch(0.28 0.012 70);border-radius:6px;padding:14px 16px}
  .tile:hover{border-color:oklch(0.40 0.012 70)}
  .tile.off{opacity:0.5;pointer-events:none}
  .row{display:flex;align-items:center;gap:10px}
  .lamp{width:9px;height:9px;border-radius:50%;background:oklch(0.45 0.01 80);flex:none}
  .name{font-size:19px;font-weight:600;letter-spacing:-0.01em;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .beat{font-family:${mono};font-size:12px;letter-spacing:0.06em;color:oklch(0.62 0.01 80);white-space:nowrap}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}
  .grid div{display:flex;flex-direction:column;gap:2px}
  .grid b{font-family:${mono};font-size:20px;font-weight:500;color:oklch(0.90 0.008 85)}
  .grid span{font-family:${mono};font-size:10.5px;letter-spacing:0.08em;color:oklch(0.52 0.01 80)}
  .foot{font-family:${mono};font-size:11.5px;color:oklch(0.52 0.01 80);margin-top:10px;min-height:14px}
  .note{font-family:${mono};font-size:12px;color:oklch(0.56 0.01 80);margin-top:18px;line-height:1.6}
</style></head><body>
  <div class="head"><small>LIVING FACTORY</small><h1>All repos</h1><span class="n">${repos.filter((r) => r.wired).length} OF ${repos.length} WIRED · <a href="/" style="color:oklch(0.74 0.13 195);text-decoration:none">back to one board</a></span></div>
  <div class="tiles">${repos.map(tile).join("")}</div>
  <p class="note">One tile per repo in the ecosystem map. Every number is fetched by this page from that repo's own endpoints every ten seconds - the beat, who is working there, and the four workers' in-trays: timer = stations due or firing now, watcher = findings deposited in the last hour, supervisor = findings awaiting a decision, builder = contracts with a live agent. The lamp is the pulse: green inside two beats, amber at one missed, red at three, grey when this page cannot see it. Click a tile for that repo's board.</p>
<script>
  (function () {
    var GRID = 300000;
    function ago(ms) { if (ms < 60000) return Math.round(ms / 1000) + 's ago'; if (ms < 3600000) return Math.round(ms / 60000) + 'm ago'; return Math.round(ms / 3600000) + 'h ago'; }
    function fill(tile, f, v) { var el = tile.querySelector('[data-f="' + f + '"]'); if (el && el.textContent !== String(v)) el.textContent = v; }
    function get(u) { return fetch(u, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
    function refresh() {
      var now = Date.now();
      document.querySelectorAll('[data-repo-tile][data-wired="1"]').forEach(function (tile) {
        var id = encodeURIComponent(tile.getAttribute('data-repo-tile'));
        Promise.all([get('/schedule?repo=' + id), get('/sessions?repo=' + id), get('/activity?repo=' + id)]).then(function (res) {
          var sch = res[0], ses = res[1], act = res[2];
          var lamp = tile.querySelector('[data-f="lamp"]');
          var last = sch && sch.pulse && sch.pulse.lastRunAt ? Number(sch.pulse.lastRunAt) : 0;
          if (!sch) { lamp.style.background = 'oklch(0.45 0.01 80)'; fill(tile, 'beat', 'unreachable'); }
          else if (!last) { lamp.style.background = 'oklch(0.45 0.01 80)'; fill(tile, 'beat', 'never ticked'); }
          else { var since = now - last; lamp.style.background = since < 2 * GRID ? 'oklch(0.78 0.16 145)' : since < 3 * GRID ? 'oklch(0.80 0.14 75)' : 'oklch(0.70 0.15 25)'; fill(tile, 'beat', 'beat ' + ago(since)); }
          if (ses && ses.counts) fill(tile, 'sessions', (ses.counts.active || 0) + '/' + (ses.sessions || []).length); else fill(tile, 'sessions', ses && ses.seen === false ? '—' : '?');
          if (act) {
            fill(tile, 'timer', act.timer ? (act.timer.running || 0) + (act.timer.due || 0) + (act.timer.queued || 0) : '—');
            fill(tile, 'watcher', act.watcher ? act.watcher.findingsLastHour : '—');
            fill(tile, 'supervisor', act.supervisor ? (act.supervisor.awaitingTriage || 0) + (act.supervisor.held || 0) : '—');
            fill(tile, 'builder', act.builder ? act.builder.building + '/' + act.builder.contracts : '—');
          }
        });
      });
    }
    refresh(); setInterval(refresh, 10000);
  })();
</script></body></html>`;
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(html);
      return;
    }
    if (!R && P !== "/pulse") {
      res.writeHead(404, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify({ error: "no such repo in the ecosystem map", known: Object.keys(REPOS) }));
      return;
    }
    if (P === "/stamp") {
      // The marker is deliberate: it lets a checker tell OUR server from
      // whatever else might be holding the port. An earlier check only asked
      // whether something accepted a TCP connection, which would have reported
      // the board healthy forever if any other process took the address.
      res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(stamp(R.file));
      return;
    }
    // ---- THE RAIL'S FACTS, BETWEEN BUILDS -----------------------------------
    //
    // The rail counts down on the wall clock from two facts baked in at build:
    // when each station last ran, and how often. The build is hourly, so once
    // a station fires the page would keep counting from the OLD last-run and
    // read "due" for up to an hour - the same static lie the live countdown
    // was built to end, moved one step along. Same shape as /seen: what is
    // baked in is right at build time, and this is how the page asks for what
    // has changed since. Only lastRunAt is served. The interval a station is
    // on can tighten between builds too, but the label beside the bar was
    // printed from the built one, and a countdown that disagrees with its
    // own label is worse than one that is a rebuild behind.
    if (P === "/schedule" && req.method === "GET") {
      let body = "{}";
      try {
        const s = JSON.parse(fs.readFileSync(R.schedule, "utf8").replace(BOM_RE, ""));
        const t = s.triggers || s.stations || {};
        body = JSON.stringify(Object.fromEntries(Object.entries(t).map(([id, v]) => [id, { lastRunAt: v && v.lastRunAt != null ? v.lastRunAt : null }])));
      } catch {
        /* no state yet, or unreadable: the page keeps the facts it was built with */
      }
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(body);
      return;
    }
    // ---- THE PULSE CARDS ----------------------------------------------------
    //
    // pulse-belt.cjs writes one card per beat to the FACTORY's
    // .refer-factory/pulse-belt.jsonl - universal state, one heartbeat, one
    // file - and prunes them after three beats. The board draws one card per
    // stage and the page rolls them on the wall clock between builds, so it
    // asks here for the cards and the stage length. Stage and grace come from
    // the machine's own report so the page can never use a different rule
    // from the machine that wrote the cards. The factory is this server's own
    // root now, with the environment override kept ahead of it for a second
    // checkout. No cards yet, no cards served: the page draws the gaps, which
    // is the honest picture.
    if (P === "/pulse" && req.method === "GET") {
      const body = { stageMs: null, graceMs: null, cards: [] };
      try {
        const roots = [process.env.REFER_FACTORY_ROOT, path.resolve(__dirname, "..")].filter(Boolean);
        const root = roots.find((r) => fs.existsSync(path.join(r, ".refer-factory/pulse-belt.jsonl")));
        if (root) {
          const dir = path.join(root, ".refer-factory");
          try {
            const rep = JSON.parse(fs.readFileSync(path.join(dir, "pulse-belt.json"), "utf8").replace(/^\uFEFF/, ""));
            body.stageMs = Number(rep.stageMs) || null;
            body.graceMs = Number(rep.graceMs) || null;
          } catch {
            /* no report yet; the page falls back to the grid */
          }
          body.cards = fs
            .readFileSync(path.join(dir, "pulse-belt.jsonl"), "utf8")
            .replace(/^\uFEFF/, "")
            .split("\n")
            .filter((l) => l.trim())
            .map((l) => {
              try {
                const c = JSON.parse(l);
                return c && c.at ? { at: c.at, seq: c.seq, drivenFrom: c.drivenFrom || null } : null;
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        }
      } catch {
        /* unreadable: serve the empty cycle rather than fail the board */
      }
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify(body));
      return;
    }
    // ---- THE FOUR WORKERS' ACTIVE WORK ------------------------------------------
    //
    // Operator, 2026-09-14: "the timer, watcher, supervisor and builder need to
    // count their active work, so make sure the corner count pills are
    // reflective of the work they are doing actively ... tied in with the page
    // loop pulse to check activity."
    //
    // Counted from the belt and the schedule with the SAME predicates the board
    // is built with - kind.cjs's beltIndex, session-life's sessionLife - so the
    // pill on the wall and the panel behind it can never disagree about what a
    // contract or a held decision is. The definitions, one per worker:
    //
    //   TIMER       stations firing now (locked) or due this beat
    //   WATCHER     findings deposited in the last hour - looking leaves deposits
    //   SUPERVISOR  findings awaiting a decision: the triage queue plus held-for-him
    //   BUILDER     contracts with a live agent working them
    //
    // The page refreshes these every ten seconds. Nothing here is judgement; it
    // is the arithmetic the build does, done again on request.
    if (P === "/activity" && req.method === "GET") {
      const out = { at: Date.now(), repo: R.id, timer: null, watcher: null, supervisor: null, builder: null, why: null };
      try {
        const t = out.at;
        let records = [];
        try {
          records = fs
            .readFileSync(R.belt, "utf8")
            .replace(BOM_RE, "")
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
        } catch {
          out.why = "no belt";
        }
        const runAt = (r) => Date.parse(r.run || r.at || "") || 0;
        out.watcher = { findingsLastHour: records.filter((r) => t - runAt(r) < 3600000).length };
        if (KINDLIB) {
          const IX = KINDLIB.beltIndex(records);
          const awaitingTriage = records.filter((r) => IX.isAwaitingTriage(r)).length;
          const held = records.filter((r) => IX.isOpenDecision(r)).length;
          out.supervisor = { awaitingTriage, held };
          const contracts = records.filter((r) => IX.isOpenContract(r));
          const dispatchFor = new Map();
          for (const r of records) if (r.subject && r.dispatch) dispatchFor.set(String(r.subject), r.dispatch);
          let building = 0;
          if (LIFELIB) {
            for (const r of contracts) {
              const d = dispatchFor.get(String(r.id));
              if (!d || !d.session) continue;
              const life = LIFELIB.sessionLife(d.session, R.root, 30 * 60 * 1000);
              if (life && life.alive) building++;
            }
          }
          out.builder = { contracts: contracts.length, building, canSeeSessions: !!LIFELIB };
        } else {
          out.why = (out.why ? out.why + "; " : "") + "kind vocabulary not resolvable";
        }
        try {
          const st = JSON.parse(fs.readFileSync(R.schedule, "utf8").replace(BOM_RE, ""));
          const trig = st.triggers || st.stations || {};
          const GRID = 300000; // the pulse's period; schedule.cjs anchors due-ness to it
          let running = 0, due = 0, queued = 0;
          for (const [id, s] of Object.entries(trig)) {
            if (!s) continue;
            if (s.lockedAt && t - s.lockedAt < 10 * 60 * 1000) running++;
            if (s.requestedFor != null) queued++;
            const every = Number(s.intervalMs);
            if (id === "pulse" || !every || !s.lastRunAt) continue;
            if (Math.floor(s.lastRunAt / GRID) * GRID + every <= t) due++;
          }
          out.timer = { running, due, queued };
        } catch {
          out.why = (out.why ? out.why + "; " : "") + "no schedule state";
        }
      } catch (err) {
        out.why = String(err && err.message);
      }
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify(out));
      return;
    }
    // ---- THE SESSIONS THE TIMER PUT ON THE BELT ----------------------------------
    //
    // session-belt.cjs writes <repo>/.claude/agent-context/sessions.json every
    // beat: one entry per session alive in that repo, chat or spawn, from its
    // transcript. Served as written - this is the timer's act, and the page
    // draws what the timer placed, recomputing alive/active from each entry's
    // lastWrite on the wall clock between beats. Absent is served as absent
    // (seen:false), which the page draws as "the timer has not run here", not
    // as an empty belt.
    if (P === "/sessions" && req.method === "GET") {
      let body = { seen: false, sessions: [] };
      try {
        body = JSON.parse(fs.readFileSync(path.join(R.ctx, "sessions.json"), "utf8").replace(BOM_RE, ""));
        body.seen = true;
      } catch {
        /* never written here */
      }
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify(body));
      return;
    }
    // ---- LIVE CHATS -----------------------------------------------------------
    //
    // Operator, 2026-09-14: "can the page script loop also check chat instance
    // and give a count that will appear in the Chat listening intake ui on the
    // board? Count claude chat active."
    //
    // A chat is alive by the same evidence a dispatch is alive by: a transcript
    // under ~/.claude/projects written inside the belt's liveness window. Two
    // counts, because they answer different questions - chats in THIS repo's
    // project directories (the door's own) and chats on the whole host (a chat
    // in another repo is still a chat this door cannot see). The window and
    // the directory token are the ones build-tracker.cjs and
    // <factory>/machines/session-life.cjs use; change them there and here.
    if (P === "/chat" && req.method === "GET") {
      // ALIVE is the belt's question - has this agent walked away? - and its
      // window is thirty minutes. ACTIVE is the door's question - is somebody
      // chatting right now? - and its window is one beat. Operator, 2026-09-14:
      // "a 30 minute check on chat instance may make the board look stale."
      // Both are served; the door shows ACTIVE, the panel shows both.
      const ALIVE_MS = 30 * 60 * 1000; // DISPATCH_ALIVE_MS
      const ACTIVE_MS = 5 * 60 * 1000; // one beat
      const PROJECTS = path.join(process.env.USERPROFILE || process.env.HOME || "", ".claude/projects");
      const token = R.root.replace(/[:\\/.]/g, "-"); // tokenize() in session-life.cjs
      const out = { repo: 0, host: 0, active: 0, activeHost: 0, aliveMs: ALIVE_MS, activeMs: ACTIVE_MS, seen: false, subject: R.id };
      try {
        const dirs = fs.readdirSync(PROJECTS, { withFileTypes: true });
        out.seen = true;
        const t = Date.now();
        for (const d of dirs) {
          if (!d.isDirectory()) continue;
          const mine = d.name === token || d.name.startsWith(`${token}--claude-worktrees-`);
          let files = [];
          try {
            files = fs.readdirSync(path.join(PROJECTS, d.name));
          } catch {
            continue;
          }
          for (const f of files) {
            if (!f.endsWith(".jsonl")) continue;
            try {
              const age = t - fs.statSync(path.join(PROJECTS, d.name, f)).mtimeMs;
              if (age < ALIVE_MS) {
                out.host++;
                if (mine) out.repo++;
              }
              if (age < ACTIVE_MS) {
                out.activeHost++;
                if (mine) out.active++;
              }
            } catch {
              /* a transcript that vanished mid-scan is not a live chat */
            }
          }
        }
      } catch {
        /* no projects directory: nothing can be seen, and `seen` says so */
      }
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify(out));
      return;
    }
    // ---- what he has already read ------------------------------------------
    //
    // Operator, 2026-09-11: "I should gain understanding of my system. Each time
    // I look on the board, the things that I may have not known before, I know
    // now. So the board becomes a classroom that's teaching me."
    //
    // A classroom has a rule a status display does not: REPEATING YOURSELF IS
    // FAILURE. If he looks and learns nothing new, the visit was wasted. That
    // only means anything if the board can tell what he has already seen - so
    // the page posts here when he opens a row, and the board remembers.
    //
    // Opening a row is the read receipt. It is a deliberate act, unlike the page
    // merely being displayed: this thing lives on an always-on monitor, so "the
    // board was up" is no evidence at all that anybody read it.
    // ---- READING IT BACK IS WHAT MAKES IT A STATE --------------------------
    //
    // The board bakes read state in at build time, which is right and is what
    // makes the pane correct with no server at all. But it is rebuilt on a cycle,
    // and between two builds a click had no lasting effect: tap a note, it goes
    // white, refresh, it is green again.
    //
    // Operator, on notifications: "read state persists per record and must
    // survive a reload; a state that resets on refresh is not a state, it is a
    // decoration." So the page asks on load, and this answers.
    if (P === "/seen" && req.method === "GET") {
      const store = readStore(R.read);
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(JSON.stringify({ at: store.at, read: store.read }));
      return;
    }
    if (P === "/seen" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => {
        body += c;
        if (body.length > 64 * 1024) req.destroy(); // nothing legitimate is this big
      });
      req.on("end", () => {
        let ids = [];
        try {
          const parsed = JSON.parse(body || "{}");
          ids = Array.isArray(parsed.ids) ? parsed.ids.filter((x) => typeof x === "string").slice(0, 2000) : [];
        } catch {
          /* a malformed post is ignored, not fatal - this is a convenience */
        }
        const store = readStore(R.read);
        const at = new Date().toISOString();
        // KEYED BY RECORD, WITH THE TIME. An absent key means unread, which makes
        // a new record unread by default without anyone writing anything - and
        // read is never inferred from age, so an unread note stays green however
        // old it is.
        //
        // FIRST READ WINS. Re-reading something does not make it newer, and
        // overwriting would quietly turn "when did he first see this" into "when
        // did he last click", which is a different question nobody asked.
        for (const id of ids) if (!store.read[id]) store.read[id] = at;
        try {
          fs.mkdirSync(path.dirname(R.read), { recursive: true });
          fs.writeFileSync(R.read, JSON.stringify({ at, read: store.read }, null, 1), "utf8");
        } catch {
          /* the board still works; only the memory is degraded */
        }
        res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
        res.end(JSON.stringify({ known: Object.keys(store.read).length }));
      });
      return;
    }

    // ---- TRIAGE: THE ACT THAT TURNS A DEPOSIT INTO A CONTRACT ---------------
    //
    // Operator's phrasing named a stage the model did not have: "deposits to be
    // converted into contracts". A deposit is seen and unjudged; it becomes work
    // only when somebody accepts it, and that acceptance is recorded rather than
    // inferred - which is the entire difference between this factory contracting
    // work someone agreed to and contracting work nobody judged.
    //
    // It APPENDS to the belt. Nothing is edited, because the belt is append-only
    // and a later record changing what an earlier one means is what append-only
    // was always supposed to buy.
    if (P === "/triage" && req.method === "POST") {
      let body = "";
      req.on("data", (c) => {
        body += c;
        if (body.length > 16 * 1024) req.destroy();
      });
      req.on("end", () => {
        const fail = (code, why) => {
          res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" });
          res.end(JSON.stringify({ error: why }));
        };
        if (!KINDLIB) return fail(503, "the kind vocabulary is not resolvable from this repo, so no record can be written in a shape anything else will read");
        let p = {};
        try {
          p = JSON.parse(body || "{}");
        } catch {
          return fail(400, "unreadable body");
        }
        const id = typeof p.id === "string" ? p.id : "";
        if (!id) return fail(400, "no record named");
        let records = [];
        try {
          records = fs
            .readFileSync(R.belt, "utf8")
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
        } catch {
          return fail(500, "the belt could not be read");
        }
        const target = records.find((r) => String(r.id) === id);
        // A triage act that names nothing is refused rather than recorded. The
        // belt is append-only, so a record written against a typo would sit there
        // forever meaning nothing - and this is the one place where the id comes
        // from a click rather than from a person typing it, so a miss here is a
        // bug rather than a slip.
        if (!target) return fail(404, `no record on the belt is called "${id}"`);
        let rec;
        try {
          rec = KINDLIB.triageRecord({
            id,
            kind: p.kind || "contract",
            dimension: target.dimension,
            owner: target.owner,
            to: p.to || target.dimension,
            by: typeof p.by === "string" ? p.by.slice(0, 80) : "the board",
          });
        } catch (err) {
          return fail(400, err.message);
        }
        try {
          fs.appendFileSync(R.belt, JSON.stringify(rec) + "\n", "utf8");
        } catch {
          return fail(500, "the belt could not be appended to");
        }
        res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
        res.end(JSON.stringify({ accepted: id, kind: rec.kind, record: rec.id }));
      });
      return;
    }

    // The seer photographs the board every cycle. A photograph nobody can open
    // is a log line with extra steps, so they are served: /snaps for the list,
    // /snaps/latest.png for the most recent, and /snaps/<name>.png for the one
    // a finding names when it reports a failure.
    //
    // Read-only, and the filename is stripped to its base so nothing can walk
    // out of that directory - this listens on loopback, but a path traversal
    // that only works locally is still a path traversal.
    if (P === "/snaps" || P === "/snaps/") {
      const files = fs.existsSync(R.snaps) ? fs.readdirSync(R.snaps).filter((f) => f.endsWith(".png")).sort().reverse() : [];
      res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(
        `<meta name="viewport" content="width=device-width,initial-scale=1"><body style="background:#141312; color:#c9c5be; font:14px ui-monospace,monospace; padding:24px">` +
          `<p>${files.length} snapshot(s) of the board, newest first. <a style="color:#8fb8d8" href="/">back to the board</a></p>` +
          files.map((f) => `<p><a style="color:#8fb8d8" href="/snaps/${encodeURIComponent(f)}">${f}</a></p>`).join("") +
          (files.length ? "" : "<p>The seer has not run yet.</p>"),
      );
      return;
    }
    if (P.startsWith("/snaps/")) {
      const name = path.basename(decodeURIComponent(P.slice("/snaps/".length)));
      const p = path.join(R.snaps, name);
      if (!name.endsWith(".png") || !fs.existsSync(p)) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("no such snapshot");
        return;
      }
      res.writeHead(200, { "content-type": "image/png", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(fs.readFileSync(p));
      return;
    }
    if (!fs.existsSync(R.file)) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "x-living-factory": "board", "x-board-version": OWN_VERSION });
      res.end(`no board built yet for ${R.id} (${R.root}) - its build-tracker station has not run against it. Other repos: ${Object.keys(REPOS).join(", ")}`);
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-living-factory": "board", "x-board-version": OWN_VERSION });
    res.end(fs.readFileSync(R.file));
  });

let attempt = 0;
function tryListen(port) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempt < MAX_TRIES) {
      attempt++;
      console.log(`port ${port} is taken - trying ${port + 1}`);
      tryListen(port + 1);
      return;
    }
    console.error(`board server could not listen: ${err.message}`);
    process.exit(2);
  });
  server.listen(port, "127.0.0.1", () => {
    // Written down, so nothing has to guess which port won.
    try {
      fs.mkdirSync(path.dirname(PORTFILE), { recursive: true });
      fs.writeFileSync(PORTFILE, String(port), "utf8");
    } catch {
      /* the server still works; only discovery is degraded */
    }
    console.log(`tracker on http://127.0.0.1:${port}  (/stamp for the build time)`);
  });
}
tryListen(WANTED);
