# PLAN-LIVING-FACTORY-ENGINE-HOME-001 — the engine and the board come home

**Registered** 2026-09-14 on main, before execution. Operator: *"Ok i'm ready,
lets get it done"*, after the discussion recorded in the thread register under
*The seven machines still in the product repo*.

## What this is

The Living Factory's machines moved to this repo on 2026-09-11. Its **engine**
(`schedule.cjs`) and its **board** (`build-tracker.cjs`, `serve-tracker.cjs`)
did not: they stayed in `E:/Telechurch-e2e-v2/tools/factory/`, where the
factory was first built, and every one of the eleven wired repos reaches into
that product repo by absolute path to build its own board. The Windows task
`LivingFactory-Schedule` runs the engine from there.

This plan moves the three files here and repoints everything that named them.
Nothing about *what* the factory does changes. What changes is *where the
heart is*, and that every path that crossed into a product repo to find it
disappears.

## Decisions, derived rather than asked

- **`engine/` beside `machines/`.** `schedule.cjs` and `serve-tracker.cjs` are
  not machines — one runs machines, the other serves their output — and the
  machines gate's manifest rule (every file in `machines/` runs read-only
  against a fixture) has no honest form for either. `build-tracker.cjs` *is* a
  machine by P13 (its subject is `process.cwd()`), so it goes to `machines/`
  and the declaration in every repo becomes `factory:build-tracker` — no path,
  no `--root`. That also dissolves the 09-14 worktree-root trap, which only
  existed because the declaration carried a path.
- **`clock.cjs` retires.** It was a pure delegation shim for the clock→schedule
  rename, written so the rename could not stop the heartbeat, and to be
  removed "when nothing asks for it any more". Nothing does.
- **The primary subject stays Telechurch.** The Windows task keeps its working
  directory; only the script path changes. Making the factory the primary is a
  separate change with its own observable (where the beat stamps), and it
  does not ride on a file move.
- **`__dirname` is classified, not swept.** Subject → `process.cwd()`; sibling →
  `__dirname` re-pointed to the new layout; factory root → `__dirname/..` with
  `REFER_FACTORY_ROOT` as the override. The per-line table is in
  `docs/seven-machines-pending-move.md`.
- **What stays in Telechurch:** `gate-style-coverage.cjs` + its baseline,
  `node-heartbeat.cjs`, `host-restart.cjs`, `night-report.cjs` and the rest of
  `tools/factory/` — Telechurch's own tooling on the shared clock.

## Order of landing — the beat must not stop

1. Factory branch: `engine/`, `machines/build-tracker.cjs`, keeper and
   `wire-repo.mjs` repointed, gate manifest, docs. Gates green. Merged.
   *Inert until something points at it* — except `board-serve-check.cjs`, whose
   stale-server check will replace the running server with the new one at the
   next beat. That is the server cutover, and it is the keeper doing its job.
2. Windows task repointed to `E:\refer-script-factory\engine\schedule.cjs`
   between beats, by re-running SovereignNode's `install-factory-schedule.ps1`
   (repointed first) — the installer is the script for this, not an ad-hoc
   command. Next beat proven from the stamp and the fan-out.
3. Telechurch branch merged; its checkout (detached at `origin/main`) advanced
   only after step 2 is proven, because advancing it deletes the old engine.
4. Nine repos' `build-tracker.trigger.json` → `factory:build-tracker`, each
   under its own law. SovereignNode's `factory-board-host.ps1` repointed too.
5. Proof: a full beat with every repo's build-tracker station resolving to
   `machines/build-tracker.cjs`; board served on 47390 from `engine/`;
   `board-serve-check` passes for the right reason in every repo.

## Rollback

Forward-only. If the new engine fails a beat, the fix is a hotfix on this repo;
in the meantime the paused routine `living-factory-pulse-telechurch` is the
standby clock (thread register), and the old engine is one `git checkout` of
Telechurch's previous `origin/main` away from the task — but pointing the task
back is a second change to the task, not a revert of this one.

## Closes when

The stamp of two consecutive beats names `engine/schedule.cjs`; every wired
repo's builder station shows `factory:build-tracker` on its rail; no file under
any wired repo names `Telechurch-e2e-v2/tools/factory/` for the engine or the
board. Then the register's *seven machines* and *board-serve-check passes
silently* threads close.
