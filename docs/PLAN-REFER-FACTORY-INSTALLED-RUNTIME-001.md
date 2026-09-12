# PLAN-REFER-FACTORY-INSTALLED-RUNTIME-001

Title: REFER.OS and the Script Factory as an Installed, Versioned Runtime
Status: Draft for ratification
Date: 2026-09-12
Contract: none. No Execution Contract exists for this work. This document
proposes the scope one would bound; it is not authority and no stage below may
be executed on the strength of it.
Target: `E:\refer-script-factory`, plus a declared read of `E:\refer.os`
Execution branch: not allocated. The lineage token is allocated, not invented.
Primary owner: unassigned
Method lineage: Construct Method. No assimilation, publish, or deploy method.

## Why this document exists

`docs/seven-machines-pending-move.md` records that nothing moved on 2026-09-12
and names the reason: the operator is mid-decision on whether REFER.OS and this
factory become one portable runtime, installed and versioned rather than read
off a working tree. The seven-machines move is blocked on that decision, and so
is the ENGINE category that document proposes for P13.

This plan answers the decision. It does not re-derive what that document or
`.claude/agent-context/shelf.md` already established, and it cites both rather
than restating them.

## The two halves, and the warning that separates them

The shelf states it plainly, and it is the load-bearing sentence of this plan:

> Separate the two halves. The factory needs a database. REFER.OS needs a
> version number — it is 86 markdown documents, and what makes it installable
> rather than read off a working tree is packaging and a resolver, not storage.
> Conflating them turns a two-month job into a two-year one.

| | Half A — REFER.OS | Half B — the factory |
| --- | --- | --- |
| What it is | a document library | executable code |
| What "installed" means | a declared source set, a release id, integrity hashes, a resolver | a discoverable root with a version and a declared export surface |
| What it needs | packaging and a resolver | package identity; the discovery already exists |
| Ships alone | **yes** — no stage touches `machines/`, no stage is a cross-repo act | **yes** — no stage depends on Half A |

They are independent in both directions. The only ordering constraints are
inside each half. **Half A is the one to do first**, not because Half B depends
on it but because Half A is almost entirely already built and mis-wired, and
finding that out is cheaper than building anything.

## What already exists — findings, before proposing any work

Every claim in this section was established by reading a file. The corrections
it contains are the reason the plan is short.

**REFER.OS is already versioned and already packaged, upstream.**
`E:/refer.os/REFER.OS/manifests/release.manifest.json` declares
`release_id: refer-os-1.0.0`, `version: 1.0.0`, MIT licence, and a byte-stable
bundle at `tools/refer-distribution/artifacts/refer-os-1.0.0.bundle.json`.
`REFER.OS/manifests/distribution.manifest.json` is a content-hashed declaration
with a `source_set_hash` and per-path SHA-256. A governed command family exists
in `E:/refer.os/tools/refer-distribution/package.json`: `build`, `verify`,
`verify-bundle`, `attach`, `verify-consumer`, `refresh`, `prove`, `test`.

**But the declared source set is 26 paths — seven documents plus the manifests
— not the library.** `refer.consumer.md`, `refer.evidence.md`,
`refer.harmony.md`, `refer.method.md`, `refer.qc.md`, `refer.release.md`,
`refer.systems.security.md`, `LICENSE`, `SECURITY.md`. `refer.agent.md`,
`refer.law.md`, `refer.structure.md` and the other 110 live documents are not in
it. So the packaging is real and the packaged thing is the portable consumer
contract, not the corpus.

**And `attach`/`refresh`/`prove` cannot target a live consumer.**
`E:/refer.os/tools/refer-distribution/src/core.js` freezes `supportedFixture` to
the single selector `tools/refer-distribution/fixtures/clean-consumer`.
`refer.consumer.md` says the same in prose; the code is the proof. The upstream
installer has never been pointed at a real repository.

**This repository already contains a REFER.OS installer, and it ships no
version and no integrity.** `src/updates/updateSync.ts` has
`createPackagedLawManifest(channel, version)` building an artifact per document
from `src/bootstrap/lawManifest.ts` (86 entries, matching the 86 files under
`unscripted-laws/REFER.OS/`), and `applyReferUpdate` writes each into a target
workspace with a backup and a workspace-containment check. Two defects in it:

- **The version stamped on REFER.OS is the factory's version.** The only caller,
  `loadUpdateManifest`, passes `packagedVersion(context.extensionRoot)`, which
  reads this repo's `package.json`. REFER.OS therefore installs as `0.0.1`.
  That is the conflation the shelf warns about, already committed in code.
- **Integrity is optional and never supplied.** `applyReferUpdate` checks
  `if (artifact.sha256 && sha256(content) !== artifact.sha256)`, and
  `createPackagedLawManifest` sets no `sha256` on any artifact. Every law
  artifact is written unverified. This is a gate that only looks like one.

**The vendored library is a stale subset whose filenames no longer mean the same
thing.** `unscripted-laws/REFER.OS/` holds 86 markdown documents; the live tree
at `E:/refer.os/REFER.OS/` holds 118. Every vendored filename exists live (no
vendored-only files), and 32 live documents are absent from the vendored copy.
Sizes diverge sharply in both directions, and at least one pair is not the same
document at all: vendored `refer.library.md` is 265,765 bytes and its own header
says *"Consolidated reference for all REFER.OS documents. Auto-generated from
current files"*; live `refer.library.md` is 2,029 bytes and is titled
*"Reference Intelligence Doctrine"*. Live `refer.law.index.md` (180 bytes) now
says it is non-authoritative generated navigation. **Installing the vendored
copy into a consumer would overwrite live law with a differently-meaning
document of the same name.**

**`.refer/source.json` has two schemas and two owners, and one of them is
permanently red.** The file on disk carries the v2 absorption shape
(`required_release_id`, `release_manifest_hash`, `universalAgentBootstrap`,
`universalAgentSurface`), matching `.refer/consumer-binding.json` and
`refer.consumer.md`'s `universal-binding-absorption-method-v2`. But
`scripts/reference/universal-source-sync.mjs` expects a `sources[]` array and
writes an entirely different record. Run today:

```
node scripts/reference/universal-source-sync.mjs check
```

exits 1 with `"source record is missing or has no sources array"` against a
healthy tree. A check that is red for a schema reason cannot report a staleness
reason.

**`machines/` has no version and no package identity.** No `package.json`, no
`manifest.json`, and no version string in any of the 18 `.cjs` files. It is
consumed by path. Factory-root discovery exists and works —
`REFER_FACTORY_ROOT`, then `E:/refer-script-factory`, then a sibling — and a
missing factory is reported as a missing factory. A consumer can find the
factory; it cannot say **which** factory it found.

**The engine already consumes the factory as an installed dependency.**
`E:/Telechurch-e2e-v2/tools/factory/schedule.cjs` resolves its subject from
`__dirname` (`const ROOT = path.resolve(__dirname, "../..")`) and, separately,
resolves `factory:<name>` through the same three-candidate discovery, refusing
to treat a missing factory as a failing station. The engine is already half
installed. The half that is not installed is the engine itself, and the next
section argues that asymmetry is correct.

## Position: the engine does not move, and it is not installed

**`schedule.cjs` stays where it is, one per thing being driven. What becomes
installed and versioned is what the engine consumes, never the engine.**

`docs/seven-machines-pending-move.md` proposes ENGINE as P13's third category —
*it invokes* — and states that an engine's location is its configuration. This
plan adopts that category and takes the position the document left open. The
defence is four observations, not a preference:

**1. The failure modes are not symmetric, and the move converts the loud one
into the silent one.** A wrong `REFER_FACTORY_ROOT` is loud by construction:
`machines/pulse-belt.cjs` refuses a root with no `machines/pulse-belt.cjs`
under it and names both the variable and the path, and
`scripts/ci/pulse-belt-cycle.mjs` case J asserts exactly that refusal. A wrong
*working directory* is silent: every machine resolves its subject from
`process.cwd()`, so one mis-registered Scheduled Task points all fourteen
triggers at the wrong repo simultaneously, each reporting plausible numbers.
Today `__dirname` makes that error unavailable. Installing the engine makes it
available and invisible. `machines/README.md` calls subject-misresolution *"the
worst failure available to a watcher"*; an installed engine generalises it from
one machine to all of them at once.

**2. Cadence authority is already local, already correct, and already written
down.** `machines/README.md`: *"the machine is universal, the cadence is
local."* Trigger declarations live in the repo whose cadence they are, where
they are reviewable, diffable and gated. An engine installed once and told which
repo to drive moves that authority into a Windows Scheduled Task's working
directory — configuration held in no repository, under no gate, visible to
nobody reading the repo. That is the one direction this system has consistently
refused to move: from a reviewable file to an unreviewable environment fact.

**3. An engine per subject IS the HQ/outpost shape the shelf already derived,
not a violation of it.** The shelf records P13's *"one machine, many working
directories"* as the outpost model, with `node-to-outpost-map.json` and
`hive-node-registry.json` as the roster. One engine per subject is that model.
One engine driving N subjects is a different model — one process, N subjects —
that was never derived and meets none of the shelf's revival conditions.

**4. The cheap move is the correct one here.** Re-pointing beats building, and
nothing needs re-pointing: the engine already resolves the factory through the
established discovery chain. The work is to make the engine able to **say** what
it resolved, which is Half B, and to record ENGINE as doctrine, which costs a
document.

**The cheap move would be wrong if** a single host ever had to drive repos it
does not contain — a genuinely remote outpost. That is the same condition as the
shelved platform thread, and it is not met: every consuming repo is a directory
on this disk.

**What this position does not settle.** `host-restart.cjs` is not an engine and
not a machine; `docs/seven-machines-pending-move.md` already says its subject is
the host and that it needs a host-level singleton and a host identity. The
ENGINE category does not supply either, and nothing in this plan does. It stays
open. `clock.cjs` is a shim to an engine, so it is engine-side: deleted when
nothing asks for it, never moved — which is what that document already
concluded, now with a category behind it.

## Stages

Every stage is independently shippable and independently revertible. No stage
edits a file under `machines/` that any repo has declared on a trigger; no stage
is a cross-repo act; no stage runs `npm run gate:prove` or any `--arm` flag.

Standing verification for this repo is `npm run verify`
(`gate:machines && gate:pulse-belt && test && verify:core`). Where a stage names
something narrower it is because the narrow check is the one that proves the
stage's own claim; the full `verify` still runs before any commit.

---

### A1 — Give REFER.OS its own version line

**Does:** stops `createPackagedLawManifest` being handed the factory's
`package.json` version. The law manifest declares an explicit REFER.OS release
identifier from a declared source, and **refuses to build a manifest when that
identifier is absent** rather than defaulting to `0.0.0`.

**Files:** `src/updates/updateSync.ts`, `src/bootstrap/lawManifest.ts` or a new
sibling holding the identifier, `test/updateSync.test.ts`.

**Verified by:** `npm run verify`. The stage's own claim needs one new assertion
— that a manifest built with no declared REFER.OS identifier fails rather than
stamping a factory version. Green without that assertion does not prove this
stage.

**Undone by:** reverting the commit. No state outside the repo changes;
`.refer-factory/updates/state.json` is written only by `applyReferUpdate`, which
this stage does not run.

**Does NOT:** change which documents are vendored, contact `E:/refer.os`,
install anything into any consumer, or alter the factory's own version.

**Ships alone:** yes.

---

### A2 — Make the law installer refuse an unverified artifact

**Does:** populates `sha256` on every law artifact from the vendored bytes, and
turns a missing hash from a skip into a failure. Closes the finding that every
law artifact is currently written unverified.

**Files:** `src/updates/updateSync.ts`, a generator under `scripts/`,
`test/updateSync.test.ts`.

**Verified by:** `npm run verify`, plus a test that flips one byte in a fixture
artifact and requires the apply to fail. A hash check that has never rejected
anything is not evidence.

**Undone by:** reverting the commit.

**Does NOT:** change where the bytes come from, re-point at the live tree, or
make `applyReferUpdate` run anywhere.

**Ships alone:** yes. It touches the same function as A1; sequencing A1 first is
a merge-cost choice, not a dependency.

---

### A3 — Report the drift between the vendored library and upstream, and do not resolve it

**Does:** adds a read-only comparison of `unscripted-laws/REFER.OS/**` against
the live tree and the upstream `distribution.manifest.json`, reporting three
classes: identical, present-but-divergent, upstream-only. It must name
`refer.library.md` as divergent — that pair is the proof case, being two
different documents under one filename.

**Files:** a new script under `scripts/reference/`, one `package.json` script
entry, and this document updated with the result.

**Verified by:** running it and checking it names `refer.library.md`, reports 32
upstream-only documents, and reports zero vendored-only. A drift report that
finds no drift against a tree known to have drifted is the failure to look for.

**Undone by:** deleting the script and the `package.json` line. It writes
nothing but its own report.

**Does NOT:** copy any bytes, modify `unscripted-laws/**`, modify anything under
`E:/refer.os`, or widen the upstream distribution manifest. **Widening that
manifest is REFER.OS's work, in REFER.OS's repo, under REFER.OS's authority.**
This plan reads that repo and never writes to it.

**Ships alone:** yes.

---

### A4 — Resolve the two owners of `.refer/source.json`

**Does:** ends the state where one filename has two schemas and one of them
reports red on a healthy tree. The v2 absorption record is the owner — it is
what `.refer/consumer-binding.json` and `refer.consumer.md` describe, and it is
what is on disk. `universal-source-sync.mjs` either learns that schema or writes
its stamp to its own filename.

**Files:** `scripts/reference/universal-source-sync.mjs`,
`test/universalSourceSync.test.ts`, possibly one file under `.refer/`.

**Verified by:** `npm run verify`, and `node
scripts/reference/universal-source-sync.mjs check` exiting 0 on a clean tree.

**Undone by:** reverting the commit.

**Does NOT:** change the absorption method, run an absorption, or touch
`E:/refer.os`.

**Ships alone:** yes.

---

### B1 — Give `machines/` a version and a declared export surface

**Does:** adds `machines/manifest.json` — an id, a version, the machine list,
and a SHA-256 per file. A declaration, not a loader. **Nothing reads it at
runtime.** `scripts/ci/machines-gate.mjs` gains an assertion that the manifest
and the directory agree, so a machine added or changed without a manifest bump
fails the gate.

**Files:** `machines/manifest.json` (new), `scripts/ci/machines-gate.mjs`.

**Why this is not a deploy:** AGENTS.md's rule is that saving a machine is
deploying it, because the scheduler reads `machines/<name>.cjs` off disk when a
trigger fires. `manifest.json` is not a `.cjs` file and no trigger names it, so
no scheduler reads it. It is still a save into a live directory and is treated
with that care: the machines gate parses every `.json` under `machines/`, so a
malformed manifest fails before the save, and the gate must be run **before**
the save, not after the push.

**Verified by:** `npm run gate:machines`, then `npm run verify`. The stage's own
claim needs one case the gate does not have: a manifest that disagrees with the
directory must fail.

**Undone by:** deleting `machines/manifest.json` and reverting the gate change.
Nothing depends on it.

**Does NOT:** change how a machine is resolved, introduce a build or bundle
step, make any machine load the manifest, or change any machine's behaviour.

**Ships alone:** yes.

---

### B2 — Let a consumer say which factory it got

**Does:** adds a read-only machine that prints the resolved factory root, the
manifest version from B1, and any file whose hash disagrees with the manifest.
Today a consumer can find the factory and cannot identify it.

**Files:** one new file under `machines/`, and its entry in
`machines/README.md`.

**Branch policy:** AGENTS.md permits direct to main for *"a machine that no repo
has declared yet."* This machine is declared by no repo on arrival, so it is
inert until some repo writes a trigger for it. **Declaring it in a consuming
repo is a separate act in that repo, and is a pull request there, not here.**

**Verified by:** `npm run gate:machines`, which runs every machine's read-only
path against a throwaway fixture repo and checks its exit code — which is
exactly what this machine is. Then `npm run verify`.

**Undone by:** deleting the file. Nothing declares it, so nothing stops.

**Does NOT:** move `schedule.cjs`, change `__dirname` anywhere, edit any repo
other than this one, or make any existing machine cite the version.

**Ships alone:** yes. Depends on B1 for something to report.

---

### B3 — Record ENGINE as doctrine

**Does:** writes the ENGINE category into this repo's doctrine — the third P13
classification proposed in `docs/seven-machines-pending-move.md`, plus the
position defended above: an engine lives once per thing being driven, `__dirname`
is legitimate for an engine and for nothing else, and moving one is a decision
about cadence authority rather than a file move.

**Files:** `docs/factory-system-doctrine.md` and/or `machines/README.md`;
`docs/seven-machines-pending-move.md` updated to record that its open question
now has an answer.

**Verified by:** `npm run gate:machines` if `machines/README.md` changes;
otherwise nothing executable. **This stage has no runtime verification and
should not pretend to one.** Its evidence is that the next session reading P13
can classify `schedule.cjs` without re-deriving the category — which is only
testable by a later run, not by this one.

**Undone by:** reverting the commit.

**Does NOT:** move, edit, or `cwd`-resolve `schedule.cjs`; touch
`E:/Telechurch-e2e-v2`; unblock the seven-machines move on its own — that move
has its own per-machine costs recorded, and this only removes the decision it was
blocked on.

**Ships alone:** yes.

## What would make this plan wrong

Observations that should cause it to be abandoned or rewritten, rather than
adjusted:

- **A second host writes to a belt.** That is the shelf's stated revival
  condition for the platform thread. If it happens, Half B's premise — one
  factory, many working directories on one disk — stops holding, and the engine
  position's fourth defence ("nothing needs re-pointing") is void. Half A is
  unaffected either way.
- **Upstream REFER.OS widens `distribution.manifest.json` to the full library
  and lifts the single-fixture restriction in `src/core.js`.** Then A1, A2 and
  A3 are all duplicating an upstream mechanism and should be deleted rather than
  maintained; the correct move becomes running upstream `verify-consumer`
  against this repo. **Check this before starting A1.** It is the single most
  likely way to waste the whole of Half A.
- **The vendored/live divergence runs the other way for some documents.** This
  plan established that the two trees differ and that at least one filename
  names two different documents. It did **not** establish direction of authorship
  per file. If any vendored document is newer than its live counterpart, A3's
  report is still correct but any later re-point is a data-loss move and must
  become a reconciliation.
- **Something live reads `.refer-factory/updates/state.json`.** Then A1's version
  change is a state migration, not an edit, and needs a rewrite path.
- **A Scheduled Task is found already driving an engine from outside its own
  repo** — an explicit root argument, or a working directory in a different
  tree. Then the engine position is already violated in practice, and the plan
  must deal with the live instance before asserting the rule. Asserting a rule
  that production already breaks is how a gate becomes decoration.
- **`machines/manifest.json` acquires a runtime reader.** At that point B1 has
  become a build step, and AGENTS.md's "there is no deploy step" stops being
  true. If that is wanted, it is a different plan with a deploy story.

## Non-goals

Stated explicitly, because each has been raised and has a recorded disposition.

- **A database, a sovereign-node write path, HQ/outpost as a network product.**
  Shelved on 2026-09-12 by the operator. Revival condition: a second host
  writing to a belt. **Nothing in this plan meets it** — every stage reads and
  writes one disk from one host, adds no network hop, adds no writer, and adds
  no identity. The read-only `refer-script-factory-node-read-v1` contract under
  `src/integrations/sovereign-node/**` is untouched.
- **Moving the seven machines out of `E:/Telechurch-e2e-v2/tools/factory/`.**
  Recorded in full in `docs/seven-machines-pending-move.md`, with its per-machine
  costs and traps. B3 removes the decision it was blocked on; it does not
  perform the move, and the traps that document names still apply.
- **Fixing `board-serve-check.cjs`.** Open thread on the shelf, ready to do now,
  in its own commit. Not this plan's, and tacking it on is the shape of the
  12:50 incident.
- **Splitting the heartbeat out of `.refer-factory/hive-node-registry.json`.**
  Open thread, bounded, not this.
- **Host identity and a host-level singleton for `host-restart.cjs`.** Named as
  unsolved above; no stage supplies either.
- **Publishing to npm or any package registry.** "Installed" here means resolved
  and verified from a declared root. No registry step, credential, or account is
  proposed, and none exists.
- **Writing anything under `E:/refer.os`.** This plan reads that repository.
  Widening its distribution manifest is its own work under its own authority.
- **Any change to the one-way dependency law.** The installer work lives in
  `src/updates/**` and `src/bootstrap/**`, which are outside `src/core/**`.
  `npm run verify:core` would catch a violation; the law that survived the VS
  Code adapter's retirement is not being tested again here.

## Claims in this document that were not verified

- **Direction of divergence between `unscripted-laws/REFER.OS/` and
  `E:/refer.os/REFER.OS/`.** Established: 86 vendored vs 118 live, zero
  vendored-only filenames, 32 live-only, and `refer.library.md` being two
  different documents. Not established: which side is newer for any given file.
  Byte-level or history comparison was not performed.
- **That the upstream `attach`/`refresh`/`prove` family works.** Its scripts and
  its frozen single-fixture restriction were read in `package.json` and
  `src/core.js`. None of the commands was run — running them writes into
  `E:/refer.os`, outside this task's write boundary.
- **That `applyReferUpdate` has ever run against a real consumer.** The code path
  and its callers were read; no evidence of an execution was sought, and
  `.refer-factory/updates/state.json` was not found or looked for.
- **The contents of `E:/Telechurch-e2e-v2/tools/factory/schedule.cjs` beyond the
  matched regions.** `ROOT`, the factory-discovery block, the mid-edit guard and
  the lock comments were read directly. The file is 30 KB and was not read
  whole; claims about it are limited to what was quoted.
- **That no Scheduled Task drives an engine from outside its own repo.** Not
  checked. Scheduled Task registrations were not enumerated — they are host
  configuration, outside every repository, which is precisely the property the
  engine position argues against. This is listed as a plan-invalidating
  observation above for that reason.
- **Every stage's effort and merge cost.** No stage below was implemented or
  prototyped. The sequencing claims are about independence and revertibility,
  which follow from the files each stage touches, not about duration.
- **That `npm run verify` passes on the current tree.** Not run. The brief
  permits it; it was not needed to produce this document, and reporting a pass
  that was not observed would be the failure this repo's own law names.
