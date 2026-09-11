#!/usr/bin/env node
/**
 * THE MIND WATCHER - durable truth, where failure is silent and permanent.
 *
 * UNIVERSAL MACHINE. Runs against the repo it is invoked in (process.cwd()).
 *
 * Operator, 2026-09-11: "Are you waiting on me to tell you to build the watcher
 * for mind?"
 *
 * No, and he should not have had to ask. board-critic reported "mind is carrying
 * N open items and nobody watches it" every cycle for a day, and reporting it
 * every cycle is what turned an actionable finding into a status update. The
 * critic exists to catch exactly that failure and I became the thing it watches
 * for. Recorded as a discipline failure, not a missing rule.
 *
 * WHAT THIS WATCHER LEARNED BEFORE IT WAS WRITTEN, which is the useful part:
 *
 * Five plausible checks were drafted by reading the repo. FOUR WERE NOISE, and
 * each was killed by checking it against reality rather than shipping it:
 *
 *   edge functions reading SUPABASE_URL   138 hits, ALL CORRECT - the Supabase
 *                                         edge runtime provides it. The recorded
 *                                         trap was about Cloudflare Pages, a
 *                                         different surface entirely.
 *   CORS missing x-client-info            1 hit, and it uses a "*" wildcard,
 *                                         which already covers it.
 *   migrations with a short timestamp      280 hits. The pattern was invented,
 *                                         not observed; ten-digit prefixes run
 *                                         perfectly well.
 *   SECURITY DEFINER without search_path   3 hits, all inside SQL COMMENTS.
 *   tables created with no RLS             14 hits. Queried live: every one has
 *                                         RLS on and anon locked out.
 *
 * A watcher built on any of those would have deposited hundreds of false
 * findings into his column. The belt can die by flooding as easily as by
 * leaking, and a watcher that cries wolf teaches its reader to ignore the board
 * - which is worse than having no watcher at all, because nobody knows it.
 *
 * So the rule this station is built on: FOR DURABLE TRUTH, THE SOURCE LIES. The
 * repo says what was intended; only the database says what is. Static scanning
 * of migrations tells you about the history of somebody's intentions.
 *
 * Therefore it asks the database - cheaply, rarely, and about the three things
 * that are genuinely silent and permanent. One HTTPS call per run, catalog
 * metadata only, never row data. At six hours that is four calls a day, which
 * respects "fed by local resources" in the way that matters: the factory does
 * not RUN on metered cloud, it occasionally asks it a question.
 *
 * AND IT REPORTS CHANGES, NOT STATE. The first run writes a baseline and says
 * nothing. After that it speaks only when the answer has moved, because a
 * watcher that re-reports a standing condition every cycle is the exact failure
 * that prompted it being built.
 *
 *   node <factory>/machines/mind-watch.cjs           check
 *   node <factory>/machines/mind-watch.cjs --json    machine-readable
 *   node <factory>/machines/mind-watch.cjs --rebase  accept current state as the
 *                                                    new baseline, deposit nothing
 *
 * Exit 1 when durable truth has moved in a direction nobody asked for.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CTX = path.join(ROOT, ".claude/agent-context");
const BELT = path.join(CTX, "findings.jsonl");
const BASELINE = path.join(CTX, "mind-baseline.json");
const JSON_OUT = process.argv.includes("--json");
const REBASE = process.argv.includes("--rebase");

// --dry runs every check and writes nothing: no deposits, no baseline.
//
// Added after testing this station's regression detection by rewinding its own
// baseline, which deposited three records onto the REAL belt - two of them
// describing changes that had never happened. The seer already had this (a probe
// run cannot deposit); this station shipped without it and immediately did the
// damage that proves why it is needed. A test that can write to the belt is not
// a test, it is an edit.
const DRY = process.argv.includes("--dry");

const now = Date.now();
const findings = [];
const say = (key, claim, evidence, triggers = "contract:mind", owner = "mind") =>
  findings.push({ key, claim, evidence, triggers, owner });

// ---- credentials, from the repo's own env file ------------------------------
//
// Read rather than required: a repo with no .env.master is not a broken repo,
// it is a repo this station cannot serve. Absence of capability is reported
// once, never treated as absence of a problem and never as a fault.
function env() {
  const out = {};
  for (const f of [".env.master", ".env.local", ".env"]) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !out[m[1]]) out[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  return out;
}

function projectRef() {
  const p = path.join(ROOT, "supabase/config.toml");
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, "utf8").match(/project_id\s*=\s*"([^"]+)"/);
  return m ? m[1] : null;
}

// ---- the three questions ----------------------------------------------------
//
// Each one is a failure that is SILENT (nothing errors), PERMANENT (it does not
// heal) and CONSEQUENTIAL (it exposes data or bypasses the rules). Anything that
// would merely be untidy is deliberately not here.
const QUERY = `
select
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r'
       and c.relrowsecurity = false
       and has_table_privilege('anon', c.oid, 'SELECT')) as anon_readable_tables,
  (select coalesce(string_agg(c.relname, ', ' order by c.relname), '')
     from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r'
       and c.relrowsecurity = false
       and has_table_privilege('anon', c.oid, 'SELECT')) as anon_readable_names,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r'
       and c.relrowsecurity = true
       and not exists (select 1 from pg_policies p where p.schemaname='public' and p.tablename=c.relname)) as rls_on_no_policy,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.prosecdef
       and not exists (select 1 from unnest(coalesce(p.proconfig,'{}')) cfg where cfg like 'search_path=%')) as definer_no_searchpath,
  (select coalesce(string_agg(p.proname, ', ' order by p.proname), '')
     from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.prosecdef
       and not exists (select 1 from unnest(coalesce(p.proconfig,'{}')) cfg where cfg like 'search_path=%')) as definer_names,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and has_function_privilege('anon', p.oid, 'EXECUTE')) as anon_executable_functions,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r') as tables
`;

// https rather than global fetch, and agent:false so the socket is closed
// instead of parked in a keep-alive pool.
//
// The first version used fetch and died on exit with a libuv assertion -
// process.exit() while the connection pool still held a handle. It had already
// done its work and written its baseline, so the failure was invisible unless
// somebody read the exit code, which is the kind of thing that quietly turns a
// station red forever. One require, no dependency, clean exit.
const https = require("https");
function ask(ref, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: QUERY });
    const req = https.request(
      {
        host: "api.supabase.com",
        path: `/v1/projects/${ref}/database/query`,
        method: "POST",
        agent: false,
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
          connection: "close",
        },
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (c) => (text += c));
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`management API ${res.statusCode}: ${text.slice(0, 160)}`));
          let rows;
          try {
            rows = JSON.parse(text);
          } catch {
            return reject(new Error("management API returned unparseable JSON"));
          }
          if (!Array.isArray(rows) || !rows[0]) return reject(new Error("management API returned no row"));
          resolve(rows[0]);
        });
      },
    );
    req.setTimeout(20000, () => req.destroy(new Error("management API timed out after 20s")));
    req.on("error", reject);
    req.end(body);
  });
}

// ---- migration drift, which needs no network --------------------------------
function drift() {
  const MIG = path.join(ROOT, "supabase/migrations");
  const REPORT = path.join(ROOT, "reports/auto-migration-runner.json");
  if (!fs.existsSync(MIG) || !fs.existsSync(REPORT)) return null;
  let rep;
  try {
    rep = JSON.parse(fs.readFileSync(REPORT, "utf8"));
  } catch {
    return null;
  }
  const at = Date.parse(rep.timestamp || "");
  if (Number.isNaN(at)) return null;
  const files = fs.readdirSync(MIG).filter((f) => f.endsWith(".sql"));
  const newer = files.filter((f) => fs.statSync(path.join(MIG, f)).mtimeMs > at);
  // Parked migrations: renamed so the runner skips them. Intentional, and worth
  // saying once rather than every cycle - which is what the baseline is for.
  const parked = fs.readdirSync(MIG).filter((f) => /\.sql\.[A-Z]+$/.test(f));
  return { lastPush: rep.timestamp, onDisk: files.length, sinceLastPush: newer.map((f) => f).sort(), parked };
}

function deposit() {
  if (DRY) return 0;
  if (!fs.existsSync(BELT)) return 0;
  const beltText = fs.readFileSync(BELT, "utf8");
  const day = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
  let n = 0;
  for (const f of findings) {
    const id = `mind-${f.key}-${day}`;
    if (beltText.includes(`"${id}"`)) continue;
    fs.appendFileSync(
      BELT,
      JSON.stringify({
        id,
        run: new Date(now).toISOString(),
        driver: "I3",
        tier: 1,
        dimension: "mind",
        subject: `mind: ${f.key}`,
        claim: f.claim,
        evidence: f.evidence,
        seen: true,
        confidence: "measured",
        triggers: f.triggers,
        owner: f.owner,
      }) + "\n",
      "utf8",
    );
    n++;
  }
  return n;
}

function finish(state, note) {
  const deposited = REBASE ? 0 : deposit();
  if (state && !DRY) fs.writeFileSync(BASELINE, JSON.stringify({ at: new Date(now).toISOString(), state }, null, 2) + "\n");
  const report = { checkedAt: new Date(now).toISOString(), repo: path.basename(ROOT), found: findings.length, deposited, note, state, findings };
  fs.mkdirSync(CTX, { recursive: true });
  fs.writeFileSync(path.join(CTX, "mind-watch.json"), JSON.stringify(report, null, 2) + "\n");

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`mind-watch: ${findings.length} change(s) in durable truth  [${report.repo}]`);
    if (note) console.log(`  ${note}`);
    for (const f of findings) {
      console.log(`\n  ${f.claim}`);
      console.log(`    ${f.evidence}`);
      console.log(`    -> ${f.triggers}`);
    }
    if (!findings.length && !note) console.log("  Nothing that is silent and permanent has moved.");
  }
  process.exit(findings.length ? 1 : 0);
}

(async () => {
  const e = env();
  const ref = projectRef();
  const token = e.SUPABASE_ACCESS_TOKEN;

  const d = drift();
  const prev = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, "utf8")) : null;

  if (!ref || !token) {
    // Said once a day and never as a fault: this repo simply has no database
    // for this station to watch, or no way in.
    say(
      "no-database-access",
      "The mind watcher cannot reach the database, so nothing is watching durable truth.",
      `${!ref ? "No project_id in supabase/config.toml." : "No SUPABASE_ACCESS_TOKEN in the repo's env files."} Static scanning of migrations was tried and rejected: five plausible source checks were drafted and four were pure noise, one of them 280 false hits. For durable truth the source says what was intended and only the database says what is.`,
      "operator",
      "operator",
    );
    finish(prev ? prev.state : null, "no database access");
  }

  let state;
  try {
    state = await ask(ref, token);
  } catch (err) {
    say(
      "database-unreachable",
      "The mind watcher could not read the database this cycle.",
      `${err.message}. Reported rather than swallowed - a watcher that fails quietly produces an empty report, and an empty report reads exactly like a clean one.`,
      "contract:mind",
      "mind",
    );
    finish(prev ? prev.state : null, "database unreachable");
  }

  const num = (v) => Number(v || 0);
  state = {
    anon_readable_tables: num(state.anon_readable_tables),
    anon_readable_names: String(state.anon_readable_names || ""),
    rls_on_no_policy: num(state.rls_on_no_policy),
    definer_no_searchpath: num(state.definer_no_searchpath),
    definer_names: String(state.definer_names || ""),
    anon_executable_functions: num(state.anon_executable_functions),
    tables: num(state.tables),
    migrationsOnDisk: d ? d.onDisk : null,
    migrationsSinceLastPush: d ? d.sinceLastPush.length : null,
    lastRecordedPush: d ? d.lastPush : null,
  };

  if (!prev || REBASE) {
    // A change-only watcher has a blind spot on its first day: whatever is
    // ALREADY wrong is, by definition, not a change, and would stay invisible
    // forever. So the first run deposits one record stating where things stand -
    // once, not every cycle - and everything after that is movement.
    //
    // This is not theoretical. The very first baseline found a SECURITY DEFINER
    // function with no pinned search path already sitting in the database. A
    // pure change watcher would never have mentioned it.
    if (!REBASE) {
      const standing = [];
      if (state.definer_no_searchpath) standing.push(`${state.definer_no_searchpath} function(s) run with owner privileges and no pinned search path (${state.definer_names})`);
      if (state.anon_readable_tables) standing.push(`${state.anon_readable_tables} table(s) readable signed-out with no row-level security (${state.anon_readable_names})`);
      if (state.migrationsSinceLastPush) standing.push(`${state.migrationsSinceLastPush} migration file(s) newer than the last recorded push`);
      if (standing.length) {
        say(
          "standing-state-at-first-watch",
          `Mind is now watched. What was already true when watching began: ${standing.join("; ")}.`,
          `Baseline of the live catalog: ${state.tables} tables, ${state.anon_executable_functions} functions the signed-out role can execute, ${state.rls_on_no_policy} tables with row-level security on and no policies. Deposited once so a change-only watcher does not start blind to whatever was already wrong - everything after this is movement, not state. A SECURITY DEFINER function without SET search_path resolves table names using the CALLER's path, so a caller able to create a schema can redirect it; it is small, real, and was invisible until something looked.`,
        );
      }
    }
    finish(state, prev ? "baseline re-taken on request; nothing deposited" : "first watch - baseline written. From here this station reports CHANGES, not state.");
  }

  const p = prev.state;

  // 1. A table anon can read with no row-level security. The catastrophe.
  if (state.anon_readable_tables > num(p.anon_readable_tables)) {
    say(
      "anon-readable-table",
      `${state.anon_readable_tables} table(s) can be read by anyone signed out, with no row-level security. That is up from ${num(p.anon_readable_tables)}.`,
      `Now: ${state.anon_readable_names || "(none named)"}. Previously: ${p.anon_readable_names || "(none)"}. This is the failure that is silent, permanent and consequential all at once - nothing errors, nothing heals, and the data is simply public. Verified against the live catalog, not inferred from migrations.`,
    );
  }

  // 2. A SECURITY DEFINER function with no pinned search_path runs as its owner
  //    and can be pointed at a different schema by the caller.
  if (state.definer_no_searchpath > num(p.definer_no_searchpath)) {
    say(
      "definer-without-search-path",
      `${state.definer_no_searchpath} function(s) run with the owner's privileges and no pinned search path, up from ${num(p.definer_no_searchpath)}.`,
      `Now: ${state.definer_names || "(none named)"}. A SECURITY DEFINER function without SET search_path resolves its table names using the CALLER's path, so a caller who can create a schema can redirect it. Read from pg_proc.proconfig, which is the only place this is knowable - the same check against migration text found three hits and all three were inside SQL comments.`,
    );
  }

  // 3. The signed-out role gaining the ability to run more functions.
  if (state.anon_executable_functions > num(p.anon_executable_functions)) {
    say(
      "anon-gained-function-access",
      `The signed-out role can now execute ${state.anon_executable_functions} functions, up from ${num(p.anon_executable_functions)}.`,
      `ALTER DEFAULT PRIVILEGES in this project already grants anon, so a new function is reachable by anyone unless it is explicitly revoked. Growth here is usually an omission rather than a decision. Confirmed with has_function_privilege against the live catalog.`,
    );
  }

  // 4. Schema on disk that nothing local proves was ever applied.
  if (d && d.sinceLastPush.length && d.sinceLastPush.length !== num(p.migrationsSinceLastPush)) {
    say(
      "migrations-newer-than-last-push",
      `${d.sinceLastPush.length} migration file(s) are newer than the last recorded push, so nothing locally proves the database matches the repo.`,
      `Last recorded push ${d.lastPush}. Files: ${d.sinceLastPush.join(", ")}. Not a claim that they are unapplied - a later push may simply not have written a report - but a claim that the repo can no longer show it. Schema drift is the definition of silent and permanent.`,
    );
  }

  // A table losing its policies entirely is worth knowing about, in the safe
  // direction: RLS on with no policy means nobody but service_role can reach it,
  // which locks the app out rather than letting the world in. Reported quietly.
  if (state.rls_on_no_policy > num(p.rls_on_no_policy)) {
    say(
      "table-locked-to-everyone",
      `${state.rls_on_no_policy} table(s) have row-level security on and no policies at all, up from ${num(p.rls_on_no_policy)}.`,
      `This is the SAFE failure, not the dangerous one: nobody except the service role can read or write them. It is reported because it usually means a table is either dead or reachable only through an edge function, and the difference matters when somebody later wonders why a query returns nothing.`,
    );
  }

  finish(state, null);
})().catch((err) => {
  say(
    "mind-watch-crashed",
    "The mind watcher crashed, so nothing checked durable truth this cycle.",
    `${err.message.split("\n")[0]}. A watcher that dies quietly is worse than one that was never built, because the empty report reads as a clean one.`,
    "operator",
    "operator",
  );
  finish(null, "crashed");
});
