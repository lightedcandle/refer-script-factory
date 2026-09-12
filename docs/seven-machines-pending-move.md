# The seven still living in the product repo

Seven files in `E:/Telechurch-e2e-v2/tools/factory/` pass P13's test for a
machine and belong in this repo. **None of them moved on 2026-09-12, deliberately**,
and this records what each move would actually cost so that whoever does it is
not discovering it at the keyboard.

Two reasons nothing moved:

1. All seven resolve their subject from `__dirname`. Moving them is not a file
   move, it is rewriting how each one finds the repo it acts on — and one of
   them is the scheduler that runs everything else.
2. The operator is mid-decision on whether REFER.OS and this factory become one
   portable runtime, installed and versioned rather than read off a working
   tree. If they do, moving files between two working trees now is the wrong
   shape of work.

## The one-line pattern is not the work

Six of the seven carry the identical line:

```js
const ROOT = path.resolve(__dirname, "../..");
```

Changing it to `process.cwd()` is trivial in every case and is not what makes
this hard. What makes it hard is that **`__dirname` is being used for three
different jobs, and only one of them is wrong.**

| Use | Example | Correct after a move? |
| --- | ------- | --------------------- |
| **Subject** — the repo being acted on | `build-tracker`, `node-heartbeat`, `serve-tracker`, `gate-style-coverage`, `schedule` | **No.** Must become `process.cwd()`. This is the P13 rule. |
| **Sibling** — another factory file beside me | `clock.cjs` → `schedule.cjs` | **Yes.** Leave it. The factory locating its own parts is not a subject reference. |
| **Companion data** — a file shipped beside me | `gate-style-coverage` → `style-coverage-baseline.json` | **Neither.** It is per-repo data in the wrong place, and a move would make every repo share one baseline. |

A sweep that mechanically replaced `__dirname` with `process.cwd()` would break
`clock.cjs` and silently corrupt `gate-style-coverage`. That is the trap.

## Per machine

### `schedule.cjs` — 30 KB — **the engine. Move this last, or not at all.**

Reads the repo's `*.trigger.json` declarations, resolves `factory:<name>` to
`<factoryRoot>/machines/<name>.cjs`, and spawns each with `cwd: ROOT`. **It is
the thing that makes every other machine `cwd`-resolved.** It also carries the
guard that refuses to run a file with uncommitted changes.

- **To `cwd`-resolve:** one line. But that only moves the question. `ROOT` would
  then come from whoever sets the working directory — the Windows Scheduled
  Task — which is invisible configuration held outside every repository. Today
  `__dirname` makes it *impossible* to get wrong: the engine sits inside the
  repo it drives. Tomorrow a task registered with the wrong working directory
  points the entire factory at the wrong repo, and **every machine inherits the
  error at once**, with plausible numbers. That is the worst failure available
  here, and it is the reason this one is different in kind rather than in size.
- **Depends on it:** everything. All 14 trigger declarations; `npm run schedule`,
  `clock`, `pulse`, `autonomy`, `schedule:list`; the Claude routine
  `living-factory-pulse` (cron `*/5 * * * *`), which is the primordial tick; and
  `clock.cjs`.
- **What moving it really is:** changing the factory from *one engine per repo,
  adjacent to its subject* to *one engine, told which repo to drive*. That is
  the same architecture decision as the multi-host question, not a smaller one.

### `clock.cjs` — 1.6 KB — **delete, do not move**

A pure delegation shim from the `clock` → `schedule` rename, so a Windows task
still asking for the old filename does not kill the heartbeat. Its own header
says it is removed once nothing asks for it.

- **To `cwd`-resolve:** nothing. Its `__dirname` resolves its sibling
  `schedule.cjs` and is **correct**; changing it would break the shim.
- **Depends on it:** the Windows Scheduled Task, if it has not yet been
  re-registered on `schedule.cjs`. Check that before deleting.

### `build-tracker.cjs` — 282 KB — **closest to ready**

Renders the board from the repo's own state. Already resolves `machines/kind.cjs`
and the hive registry through `REFER_FACTORY_ROOT` → known path → sibling, which
is the pattern every other machine is told to copy.

- **To `cwd`-resolve:** one line. Everything it reads (`findings.jsonl`,
  `board-read.json`, schedule state) is already under `ROOT` and per-repo.
- **Depends on it:** `build-tracker.trigger.json` (1h); `npm run tracker`;
  `serve-tracker.cjs`, which serves its output; `board-see.cjs` and
  `board-serve-check.cjs`, which already live here and check it; `manager.cjs`,
  which reads the board state it writes.
- **Note:** it renders *one* repo's board. `machines/README.md` says the board
  "rolls them up" across repos — that roll-up does not exist. Moving the file
  does not create it, but wanting it is the reason to move the file.

### `serve-tracker.cjs` — 15 KB — **easy, but it has a live cross-repo coupling**

Serves the built board over http, and serves `/stamp` (the board file's mtime)
so the page reloads only on a real change.

- **To `cwd`-resolve:** one line.
- **Depends on it:** `.claude/launch.json`; and `board-serve-check.cjs`, which
  **already lives in this repo** and hardcodes
  `path.join(ROOT, "tools/factory/serve-tracker.cjs")` — a universal machine
  reaching for a path inside the product repo. **That line must change to the
  factory-root discovery in the same commit that moves the file**, or the board
  server loses its keeper silently: `board-serve-check` reports "no server
  script — nothing to keep alive" and exits clean, which reads as healthy.

### `node-heartbeat.cjs` — 12 KB — **already half-moved**

Writes `last_seen_at` and the adaptive heartbeat policy onto this repo's
`.refer-factory/hive-node-registry.json`.

- **To `cwd`-resolve:** one line — but note the inversion. Its *subject* is the
  repo it runs in; its *output* already lands in the factory repo. It is the
  only one of the seven whose output is already in the right place.
- **Depends on it:** `node-heartbeat.trigger.json` (15m).
- **Care:** that registry is written live. It was modified in the working tree
  while this was being read.

### `host-restart.cjs` — 13 KB — **not a `cwd` problem at all**

Decides whether the host machine may be restarted, against the same
four-condition test the deploy authority uses.

- **Its subject is the host, not a repository.** `cwd`-resolving it is close to
  meaningless: run from two repos on one machine, it becomes two things deciding
  to reboot the same computer. What it needs is a **host-level singleton and a
  host identity**, which the repo-per-cwd model does not provide and the hive
  node registry probably should.
- **Depends on it:** `host-restart.trigger.json` (6h); `npm run host:restart`.
- **Do not move this one by analogy with the others.** It is a different
  category wearing the same file extension.

### `gate-style-coverage.cjs` — 12 KB — **the baseline is the blocker**

Sweeps an Angular style fault across every component and refuses it at commit
time.

- **Two `__dirname` uses, and they need opposite treatment.** `ROOT` is the
  subject and becomes `process.cwd()`. `BASELINE` is
  `path.join(__dirname, "style-coverage-baseline.json")` — **per-repo data
  stored beside the machine.** If it travels with the machine, every repo shares
  one Angular baseline, which is wrong in the quiet way: the gate keeps passing.
- **The correct pattern already exists here.** `composition-watch.cjs` keeps its
  baseline at `<repo>/.claude/agent-context/composition-baseline.json`. Move the
  style baseline the same way, into the consuming repo, in the same commit.
- **Depends on it:** `style-coverage.trigger.json` (24h); `npm run guards:composition`,
  which chains it into a commit-time gate; `guards:style-coverage`,
  `style-coverage:list`, `style-coverage:baseline`.
- **Also:** it is stack-specific. `machines/README.md` already says a
  stack-specific gate belongs here but runs only where a repo declares it, so
  this is the first real test of that rule.

## The gap in P13, and why the move stalled on the wrong word

P13's test is: **does it deposit to the belt (machine), or produce an artifact
(script)?**

`schedule.cjs` does **neither**. It observes nothing and deposits nothing. It
produces no artifact. **It invokes.** It reads declarations, resolves names, sets
a working directory, spawns, and records what ran.

So the test as written cannot classify the most universal component in the
system — and a test that cannot classify the thing most in need of classifying
is why this move has stalled since 2026-09-11. P13's consequence paragraph lists
six files and calls them all machines; the seventh, the one everything depends
on, does not fit the sentence that was supposed to justify moving it.

**P13 needs a third category: ENGINE.**

> **It invokes → it is an ENGINE.** It runs machines and scripts, owns the
> working directory it hands them, and is the only component for which
> `__dirname` is defensible — because an engine's location *is* its
> configuration, and the alternative is configuration held outside every
> repository, where being wrong is silent and total.
>
> An engine lives once per *thing being driven*, not once per system. Moving one
> is a decision about where authority over cadence lives, not a file move, and
> it is answered together with the multi-host question rather than before it.

The distinction that makes this operational: a machine asks *what is true here*,
a script *makes something here*, an engine decides *what runs here and when*.
Only the third has a legitimate claim on knowing where it lives.
