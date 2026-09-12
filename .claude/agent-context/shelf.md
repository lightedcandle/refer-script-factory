# Thread register — refer-script-factory

Open threads, what is shelved and why, and what closed. A thread leaves this
conversation by being ratified, closed or shelved — never by going quiet.

Shelving is an act. Each entry records **what must become true to bring it
back**. "Later" is not a revival condition.

---

## SHELVED

### The factory as a platform — database, sovereign node, HQ/outpost

**Raised** 2026-09-12 by the operator: *"I think the script factory is going to
need a database, and we might need to use the sovereign node db capabilities for
this so we can have it live and accessible on the web... tied into anyone's
claude for tracking deposits and remote management and building. akin to hq and
outpost."*

**Shelved the same day**, by him: *"lets keep this under horizon, and we'll see
what is natively happening and it will derive its needs naturally."*

**Revival condition — a second host writing to a belt.** Not size, and not the
web. The belt is 194 records / 207 KB, fully re-parsed by roughly ten machines
every five minutes; that is fine now and fine at ten thousand. What append-only
JSONL cannot survive is concurrent writers on different disks, because today the
ordering guarantee is the filesystem and nothing else. The moment a deposit
arrives from a host that is not this one, the storage question is live and
answered — and not before.

**What was derived while it was open, so it does not have to be derived again:**

- If the belt moves, it moves to an **append-only event log**, never a mutable
  `findings` table. `kind.cjs` infers kind at read time *because* nothing is ever
  edited or backfilled; an UPDATE statement silently deletes the property that
  makes the belt its own audit log.
- **The read half is already specified and is safe to ship alone.**
  `src/integrations/sovereign-node/` implements `refer-script-factory-node-read-v1`
  — six tools, read-only — and `AGENTS.md` forbids moving Node authority or
  mutation into the provider-neutral core. Remote *tracking* is that contract.
  Remote *management and building* is a different product with a different risk
  profile, and the seam between them already exists.
- **A remote deposit must arrive as DEPOSIT, never CONTRACT.** `kind.cjs` already
  refuses to infer contract-ness, and triage is a recorded act. That rule
  survives the move to a platform unchanged, and it is exactly what makes it
  safe to let a stranger's agent deposit: they can spend storage, never
  judgement.
- The never-autonomous list must be refused **server-side**. An agent that can be
  argued with must not be the thing holding that line.
- **HQ/outpost is already the shape.** P13's "one machine, many working
  directories" *is* the outpost model, and `node-to-outpost-map.json` and
  `hive-node-registry.json` are already the roster. A platform is that plus a
  network hop and an identity per outpost — nothing in the machine layer has to
  change, which is the strongest evidence the design is right.
- **Do not make the board the interaction surface.** Its value is that it is a
  pure projection of the belt. Once it holds its own state it can disagree with
  the belt, and catching exactly that is one of `manager.cjs`'s four questions.
  Actions go behind it as recorded acts that append and re-render.
- **Separate the two halves.** The factory needs a database. REFER.OS needs a
  version number — it is 86 markdown documents, and what makes it installable
  rather than read off a working tree is packaging and a resolver, not storage.
  Conflating them turns a two-month job into a two-year one.

**Not the revival condition, and confirmed so by measurement:** board staleness.
Raised the same day as *"the board is currently static and stale and has long
delays"*, with a Docker database proposed as the fix. Measured instead: a
rebuild costs **0.28 seconds** and is scheduled **hourly**, and the page already
polls `/stamp` and reloads only on a real change. Realtime is a transport
property, not a storage one, and the transport already exists. Deposited to
Telechurch's belt as **A73**, recommending `every: 5m`. A database would not
have fixed it.

---

## OPEN

### There are two REFER.OS installers and they disagree

Found 2026-09-12 while planning the installed runtime
([`docs/PLAN-REFER-FACTORY-INSTALLED-RUNTIME-001.md`](../../docs/PLAN-REFER-FACTORY-INSTALLED-RUNTIME-001.md),
draft, not ratified). **The premise of that work moved:** REFER.OS is not
unpackaged waiting to be made installable. It is already packaged upstream —
`E:/refer.os/REFER.OS/manifests/release.manifest.json` declares
`release_id: refer-os-1.0.0` with a bundle, a content-hashed distribution
manifest, evidence and a licence. Verified by reading the manifest.

Meanwhile this repo carries its own older installer in `src/updates/**`, and the
two do not agree. Each of the following was verified here, not taken on report:

- **`src/updates` stamps REFER.OS with this repo's version.** `updateSync.ts:168`
  passes `packagedVersion(extensionRoot)` from this `package.json`, so REFER.OS
  installs as `0.0.1` against upstream's `1.0.0`. This is exactly the conflation
  the shelved platform thread warns turns a two-month job into a two-year one,
  and it was already committed in code while that warning was being written.
- **Its verification is a gate that only looks like one.** `applyReferUpdate`
  guards with `if (artifact.sha256 && …)` and `createPackagedLawManifest` sets no
  `sha256` on any artifact, so every law file installs unverified.
- **One filename, two different documents.** Vendored `refer.library.md` is
  265,765 bytes of generated concatenation ("Refer Library"); live is 2,029 bytes
  ("Reference Intelligence Doctrine"). The copy path targets
  `REFER.OS/<fileName>`, so applying the packaged manifest overwrites live
  doctrine. Vendored corpus is 86 files, live is 118.
- **`.refer/source.json` has two schemas and two owners.** The file carries the v2
  absorption shape; `scripts/reference/universal-source-sync.mjs` expects a
  `sources[]` array. `node scripts/reference/universal-source-sync.mjs check`
  exits **1** on a healthy tree — *"source record is missing or has no sources
  array"*. Permanently red, so it reports nothing.

**Not dangerous today, and that is the only reason it is shelved rather than
fixed now:** nothing calls `src/updates/**`. Only `updateSync.test.ts` imports it;
the VS Code adapter that invoked it was retired the same day. The README
previously suggested wiring it to the CLI as "a small job" — that line has been
corrected, because following it would have armed all three defects at once.

**Revival condition — anything that would give `src/updates/**` a caller.** Not a
date. The moment someone wants update-checking back, this must be answered first,
and the answer is probably to delete this installer and consume upstream's rather
than repair a second one.

Reported by a planning subagent and independently verified here; two figures it
supplied are *not* verified and should not be relied on without checking: that
upstream's declared source set is 26 paths rather than the corpus, and that
`attach`/`refresh`/`prove` cannot target a live consumer because the fixture
selector is frozen.

### The seven machines still in the product repo

Recorded in full at [`docs/seven-machines-pending-move.md`](../../docs/seven-machines-pending-move.md).
Nothing moved on 2026-09-12 and that was deliberate. Blocked on the same
decision as the shelved thread above — whether the factory becomes an installed,
versioned runtime — because `schedule.cjs` is an engine rather than a machine,
and moving an engine is a decision about where authority over cadence lives.

### `board-serve-check.cjs` passes silently in every repo but Telechurch

A universal machine with a product-shaped path baked in:

```js
const SERVER = path.join(ROOT, "tools/factory/serve-tracker.cjs");
```

`ROOT` is correctly `process.cwd()`, so P13 is satisfied — but
`tools/factory/serve-tracker.cjs` only exists in Telechurch. Verified by reading
the code rather than trusting the note in `docs/seven-machines-pending-move.md`:
when the file is absent the machine prints *"no server script … nothing to keep
alive"* and calls **`process.exit(0)`**.

So in every consuming repo that is not Telechurch, the board's keeper reports
healthy while checking nothing. That is the failure shape `triggers.cjs` names in
its own header as the one *"this whole factory exists to remove"* — not broken,
not reported: absent.

**Not fixed here on purpose.** It is a live machine, saving is deploying, and
tacking a behaviour change onto a cleanup pass is how the 12:50 incident
happened. It also needs a decision this pass should not make: whether the right
answer is factory-root discovery for the server script, or distinguishing *"this
repo declares a board server and it is missing"* (a fault) from *"this repo has
no board server"* (fine). Those are different machines.

**Revival condition — none needed; it is ready to do now**, in its own commit,
with `npm run gate:machines` before the save and a check that Telechurch's board
keeper still works after. Related: [[seven-machines-pending-move]], whose
`serve-tracker.cjs` section already says this line must change in the same commit
that moves the file. The file has not moved, and the defect is live regardless.

### App material still in the provider-neutral repo

`alliance-android-sms-bridge/` (25 files, a Java/Gradle Android app) and
`The Alliance Story/` (9 files, branding and narrative) are Alliance product
material sitting in the repo whose own README Scope Guard forbids exactly that.
The operator ruled on 2026-09-12: **move both to `alliance-hub`.**

**Blocked on one word, not on a decision.** `alliance-hub/AGENTS.md` permits
pushing git branches only when the operator explicitly says *"push all"*. A local
commit in a worktree would not be enough: this repo's submodule pointer would
then name a commit that exists on no remote, and every clone would break on
`git submodule update`. So the move lands as one cross-repo act or not at all.

**Revival condition — the operator says "push all" for alliance-hub.** At that
point: worktree off alliance-hub `main` (never the checked-out branch, which
carries a concurrent codex lane), copy both directories, commit, push, bump the
submodule pointer here, then `git rm -r` the originals in the same commit as the
bump so the two repos are never both authoritative.

### The submodule points at a feature branch, not at main

`alliance-hub` is checked out on `codex/tier-columns-responsive-fix`. The gitlink
was `cc18f49` while the worktree sat at `ff254a3` — 19 commits of real product
work ahead — so `git status` was permanently dirty on ` M alliance-hub`.

**The pointer is now committed at `ff254a3`, and that was not deliberate.** This
entry previously said the bump was being left alone on purpose; a blanket
`git add -A` in the retirement commit staged it anyway. Recording the slip rather
than quietly rewriting the entry, because the entry was the thing that was
supposed to stop it.

Not reverted, on the merits rather than to excuse it: `ff254a3` is pushed and
reachable on the remote, so clones resolve it, and putting the gitlink back would
restore the permanent dirty line without making anything truer. What is still
wrong is what was wrong before — **this repo is pinned to the head of somebody's
in-flight feature branch, not to `alliance-hub` main.** The submodule working
directory was not touched: still on `codex/tier-columns-responsive-fix`, still
clean, the concurrent lane undisturbed.

**Revival condition — that codex lane merges to `alliance-hub` main.** Then the
pointer goes to main's head and stays there, and a submodule pinned to anything
other than main becomes the reportable anomaly it should always have been.

### A heartbeat is being written into a tracked registry

`.refer-factory/hive-node-registry.json` is rewritten by heartbeats — on
2026-09-12 the only delta across a full working session was `updated_at`,
`last_seen_at`, `next_due_at` and `current_interval_label`. It is tracked, so the
tree is permanently dirty and ` M` on it means nothing.

This is the same defect `.gitignore` already names for the pulse belt — *"a
heartbeat is not a registry, and dirty has to mean something"* — but the fix
cannot be the same one. The pulse belt is heartbeat all the way through and was
simply ignored. This file is a genuine registry (roles, account scope, transport,
datasets, ratification evidence) **with** heartbeat fields embedded in it.
Ignoring it would lose the registry; tracking it keeps the noise.

**Revival condition — none needed; it is a bounded split anyone can do.** Move
the heartbeat fields to a sibling `.refer-factory/hive-node-heartbeat.json`,
ignore that, and leave the registry tracked and quiet. Left undone here only
because it edits a file a live machine writes on a timer, and that wants its own
pass rather than being tacked onto a cleanup.
