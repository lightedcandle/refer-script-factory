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
const { deposit: depositRecord } = require("./deposit.cjs");

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
     where n.nspname='public' and c.relkind='r') as tables,
  -- Secret-shaped columns a stranger holds SELECT on, in a table whose rows a
  -- stranger is admitted to. Names only. "Stranger" is two people: signed out
  -- (a policy for the public or anon role, or no row security at all), and
  -- signed in but owning nothing (a policy for authenticated that is literally
  -- "true"). A policy with a real condition for authenticated is not listed:
  -- the catalog cannot say whose rows it admits, and guessing would flood.
  (select coalesce(string_agg(c.relname || '.' || a.attname, ', ' order by c.relname, a.attname), '')
     from pg_attribute a
     join pg_class c on c.oid=a.attrelid
     join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind in ('r','v','m')
       and a.attnum > 0 and not a.attisdropped
       and a.attname ~* '(secret|password|passwd|api_?key|stream_key|private_key|encrypted|credential|(^|_)token$|_hash$|stripe_customer_id)'
       -- a key's saved-at stamp, its last four characters and a certificate's id
       -- match the words above and are not the secret
       and a.attname !~* '(_at|_last4|credential_id)$'
       and (
         (has_column_privilege('anon', c.oid, a.attnum, 'SELECT')
            and (c.relkind <> 'r' or not c.relrowsecurity or exists (
              select 1 from pg_policy p
              where p.polrelid=c.oid and p.polpermissive and p.polcmd in ('r','*')
                and (0 = any(p.polroles) or (select oid from pg_roles where rolname='anon') = any(p.polroles)))))
         or
         (has_column_privilege('authenticated', c.oid, a.attnum, 'SELECT')
            and c.relkind='r' and c.relrowsecurity and exists (
              select 1 from pg_policy p
              where p.polrelid=c.oid and p.polpermissive and p.polcmd in ('r','*')
                and (0 = any(p.polroles) or (select oid from pg_roles where rolname='authenticated') = any(p.polroles))
                and pg_get_expr(p.polqual, p.polrelid) = 'true'))
       )) as stranger_secret_columns,
  -- The database's own record of what it has run. Asked for here so the
  -- migration check can compare the repo against the DATABASE rather than
  -- against a local report file that goes stale without saying so.
  (select coalesce(string_agg(version, ',' order by version), '')
     from supabase_migrations.schema_migrations) as applied_migrations
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
  // The checkout this runs in is not main. Measured 2026-10-12: the scheduler's
  // tree sat about 170 merges behind, so a migration merged since was not on
  // this disk at all and the unapplied check could not see it. What was merged
  // is what matters, so the last-fetched main is read as well - no network, and
  // when git cannot answer the disk alone is used, as before.
  try {
    const listed = require("child_process").execFileSync("git", ["ls-tree", "-r", "--name-only", "origin/main", "--", "supabase/migrations"], { cwd: ROOT, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
    for (const line of listed.split(/\r?\n/)) {
      const name = line.trim().split("/").pop();
      if (name && name.endsWith(".sql") && !files.includes(name)) files.push(name);
    }
  } catch {}
  const newer = files.filter((f) => {
    const p = path.join(MIG, f);
    return !fs.existsSync(p) || fs.statSync(p).mtimeMs > at;
  });
  // Parked migrations: renamed so the runner skips them. Intentional, and worth
  // saying once rather than every cycle - which is what the baseline is for.
  const parked = fs.readdirSync(MIG).filter((f) => /\.sql\.[A-Z]+$/.test(f));
  return { lastPush: rep.timestamp, onDisk: files.length, sinceLastPush: newer.map((f) => f).sort(), parked, files: files.slice().sort() };
}

// WHICH MIGRATIONS THE DATABASE ITSELF HAS NO RECORD OF.
//
// The local report file answers a different and weaker question - "has a push
// been recorded here lately" - and it goes stale on its own. Measured
// 2026-09-23: it named two files from three weeks earlier as unproven while
// BOTH were already applied; a run somewhere else had pushed them and not
// written a report. An alarm built on that would have cried wolf daily, which
// is how an alarm gets switched off before the day it matters.
//
// The database keeps its own list. Comparing disk against that list answers the
// question actually worth asking, with no room for interpretation: this file
// exists in the repo and the database has never seen it.
function unapplied(d, appliedCsv) {
  if (!d || appliedCsv === null || appliedCsv === undefined) return null;
  const applied = new Set(
    String(appliedCsv)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  // An empty list from a project that plainly has migrations means the question
  // could not be answered - reported as unknown rather than as "all missing",
  // which would be the loudest possible way to be wrong.
  if (!applied.size) return null;
  const out = [];
  for (const f of d.files || []) {
    const m = /^(\d{10,})/.exec(f);
    if (!m) continue; // not version-stamped; the runner would skip it too
    if (!applied.has(m[1])) out.push(f);
  }
  return out;
}

function deposit() {
  if (DRY) return 0;
  const day = new Date(now).toISOString().slice(0, 10).replace(/-/g, "");
  let n = 0;
  for (const f of findings) {
    // THROUGH THE DOOR, which reads the record before it lands and reports a
    // repeat rather than writing one. The once-a-day rule used to be a copy of
    // `beltText.includes` standing right here, in nine machines at once.
    const res = depositRecord(
      {
        id: `mind-${f.key}-${day}`,
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
      },
      { belt: BELT },
    );
    if (res.written) n++;
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
  // Held aside BEFORE the state is rebuilt below. The rebuild keeps only what is
  // compared run to run, and for three weeks it silently dropped this list - so
  // the migration check further down was handed `undefined`, answered "cannot
  // tell", and never spoke once, with a merged migration sitting unapplied
  // (measured 2026-10-12: zero deposits since the check was written 09-23).
  const appliedMigrations = state.applied_migrations;
  const list = (v) =>
    String(v || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  state = {
    anon_readable_tables: num(state.anon_readable_tables),
    anon_readable_names: String(state.anon_readable_names || ""),
    rls_on_no_policy: num(state.rls_on_no_policy),
    definer_no_searchpath: num(state.definer_no_searchpath),
    definer_names: String(state.definer_names || ""),
    anon_executable_functions: num(state.anon_executable_functions),
    tables: num(state.tables),
    stranger_secret_columns: String(state.stranger_secret_columns || ""),
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
      // The database's own record, not the local push report - the report was
      // measured stale on 2026-09-23, naming two already-applied files.
      if (state.stranger_secret_columns) standing.push(`${list(state.stranger_secret_columns).length} secret-shaped column(s) a stranger holds read access to (${state.stranger_secret_columns})`);
      const standingMissing = unapplied(d, appliedMigrations);
      if (standingMissing && standingMissing.length) standing.push(`${standingMissing.length} migration file(s) the database has no record of running`);
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

  // 3b. A credential a stranger can read.
  //
  // Found by hand on 2026-10-12, not by this station: a church's broadcast
  // stream key and its encrypted Daily key had been readable with the browser's
  // own public key for months. The table HAD row security, so question 1 was
  // satisfied - a row policy decides which rows, never which columns, and
  // "the public may see public churches" published every column of them.
  //
  // What the catalog can and cannot say: it knows the column's name, that the
  // role holds SELECT on it, and that a policy admits that role to the table.
  // It cannot know which rows the policy admits, so a listed column may still
  // be protected row by row. It is therefore a list of things to LOOK AT, said
  // once when this question is first asked and afterwards only when a new name
  // appears - which is the moment somebody has just added a secret-shaped
  // column to a table strangers can read, and the cheapest moment to catch it.
  const secretsNow = list(state.stranger_secret_columns);
  if (p.stranger_secret_columns === undefined) {
    if (secretsNow.length) {
      say(
        "stranger-readable-secrets-first-look",
        `${secretsNow.length} secret-shaped column(s) are readable by a stranger as far as the catalog can tell. Each needs one look.`,
        `${secretsNow.join(", ")}. A stranger here is someone signed out, or signed in and owning nothing. Listed when the column name looks like a key, token, secret, hash or payment id, the role holds SELECT on it, and a policy admits that role to the table. The catalog cannot see which rows a policy admits, so some of these are protected row by row and are fine; the ones that are not are settled with has_column_privilege() and a count as that role, never by selecting the value. Said once - from here this station reports only a NEW name.`,
      );
    }
  } else {
    const before = new Set(list(p.stranger_secret_columns));
    const added = secretsNow.filter((name) => !before.has(name));
    if (added.length) {
      say(
        "stranger-can-read-a-new-secret",
        `${added.length} new secret-shaped column(s) became readable by a stranger: ${added.join(", ")}.`,
        `Not on the list last run. Every new table and column is granted to the signed-out and signed-in roles by default, and a row policy does not withhold a column - so a key added to a table strangers can read is public the moment it lands, with no error and no advisory. Put it in a table whose policy admits only its owner, or withhold the column and prove it with has_column_privilege(). Read from the live catalog; no row was read.`,
      );
    }
  }

  // 4. Schema on disk that nothing local proves was ever applied.
  //
  // THIS ONE MUST NOT BE CHANGE-ONLY, and it was, and it cost a live leak.
  //
  // The condition used to be "the count differs from last run". A gap that
  // simply PERSISTS never changes, so it fires once and is never heard from
  // again - and schema drift is the one fault that gets worse the longer it
  // stands still. On 2026-09-23 the database was sitting at a migration from
  // 2026-09-03 while main carried three newer ones, one of which closed a
  // verified anon data leak: two analytics views handing anyone with the
  // browser's own key 944 sessions with user ids, routes, agents and referrers.
  // The fix had been merged that morning. It reached production hours later,
  // and only because an agent ran a push for an unrelated plan. This check had
  // the number in its state file the whole time and said nothing, because the
  // number had stopped moving.
  //
  // So it now speaks on EITHER the gap changing or the gap ageing. Deposits are
  // deduplicated by day one level down, so a standing fault says its piece once
  // a day rather than every cycle - loud enough to be a reminder, quiet enough
  // not to become wallpaper.
  // NOT CHANGE-ONLY, and not the local report file either. Both of those were
  // wrong in different directions and the pair of mistakes is the whole lesson.
  //
  // It used to fire only when the count differed from last run, so a gap that
  // simply PERSISTED went quiet - and schema drift is the one fault that gets
  // worse standing still. Making it louder against the local push report would
  // have been worse than silence: measured the same day, that file named two
  // migrations as unproven while both were already live, so the new alarm would
  // have rung daily about nothing until somebody muted it.
  //
  // The database's own migration table settles it. A file here that the
  // database has no row for is unapplied, full stop, and that is worth saying
  // every day it remains true - deposits are deduplicated by day one level
  // down, so it is a daily reminder rather than a flood.
  //
  // Why it matters, dated: on 2026-09-23 a migration closing a verified anon
  // data leak - two analytics views handing anyone with the browser's own key
  // 944 sessions, with user ids, routes, agents and referrers - sat merged on
  // main and unapplied for hours, and reached production only because an agent
  // ran a push for an unrelated plan. NOTHING IN CI APPLIES MIGRATIONS. This
  // check is the only thing that can notice.
  const missing = unapplied(d, appliedMigrations);
  if (missing && missing.length) {
    say(
      "migrations-not-in-the-database",
      `${missing.length} migration file(s) are in the repo and have no row in the database's own migration table.`,
      `Files: ${missing.join(", ")}. Compared against supabase_migrations.schema_migrations in the live database, not against a local push report - that report was measured stale on 2026-09-23, naming two already-applied files. Nothing in CI applies migrations, so a merged fix stays merged and unapplied until somebody runs a push; on that date the gap held an anon data leak open for hours after its fix landed on main.`,
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
