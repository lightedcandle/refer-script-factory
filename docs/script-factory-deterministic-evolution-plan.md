# Script Factory Deterministic Evolution Plan

Status: Draft for review  
Date: 2026-04-30  
Scope: Provider-neutral Script Factory doctrine, Zo/Alliance Smart Intake lessons, script classification, lineage, authority references, and modification loops.

## Purpose

Turn the recent Smart Intake and Script Factory discoveries into an executable evolution plan.

The core shift:

```text
static lawbook
-> minimal deterministic constitution
-> executable script governance
-> authority-grounded forges
-> user/project-specific methodology
-> lineage-backed modification loops
```

## Core Principles

### 1. Determinism Is The Law

Prose can guide, but executable scripts prove.

```text
Law says what should happen.
Script proves what happens.
Fixture proves the script.
Receipt/talkback preserves evidence.
```

Operational laws should not remain prose after they become repeatable. They should become one of:

- script;
- forge;
- resolver;
- schema;
- fixture;
- validator;
- registry entry;
- repair loop;
- installer check;
- lineage packet.

### 2. Scripts Are Not Good Or Bad

A script is evaluated by effect.

```text
intent contract
-> script attempt
-> observed effect
-> compare observed effect to intended effect
```

Possible effect states:

- `functional`: intended effect achieved and verified.
- `mismatched`: observed effect does not match intended effect.
- `blocked`: missing authority, input, permission, environment, or boundary decision.
- `superseded`: another script or forge now owns the intended effect.
- `unverified`: effect may be right, but evidence is missing.

### 3. Failure Detector Owns Gap Classification

Script output must be deterministic for the same contract and inputs. The basic
competence check is simple:

```text
expected deterministic output
-> observed script output
-> exact canonical comparison
-> match: functional
-> mismatch: failure detector writes lineage + modification flag
-> missing comparison input or authority: failure detector writes blocked flag
```

The failure detector is the single authority for non-functional gap
classification. It must identify the gap type and repair layer before any repair
executor runs. A repair executor that re-detects or reclassifies the gap is
redundant; it should consume the detector's flag, repair the named layer, rerun
the same contract, and hand the result back to the detector.

This makes the detector the durable verdict recorder, not the executor and not
the repair brain. The AI watcher runs script and AI inspection in parallel,
compares the result, and submits expected and observed effects to the detector.
The detector writes lineage, flags mismatches, or marks a functional script as
ready for future script-first use. The loop continues by AI-watched verdict:

```text
detector functional -> continue / promote if eligible
detector mismatched -> repair flagged layer -> rerun -> detector
detector blocked -> wait for missing authority/input/permission/environment
detector superseded -> stop and point to new owner
```

AI is the watcher and repair actor. No extra selector, resolver, or repair
dispatcher script should be added to decide what AI already sees from intake,
registry, readiness, lineage, and flags. The rule is:

```text
intake + registry + readiness
-> AI watcher runs script and inspection in parallel
-> AI watcher submits expected/observed verdict to detector
-> functional detector receipt marks script ready for future script-first use
-> mismatched detector flag tells AI watcher what layer to repair
-> AI repairs, reruns, and resubmits verdict
```

Intake is the choke point that declares the gate. It does not need to contain
every script; it must carry the execution-gate policy that every resolver-selected
script route obeys:

```text
refer.intake.routing.execution_gate = failure_detector
resolver selects script route
-> AI watcher executes script route and parallel inspection
-> AI watcher submits expected/observed effects to failure:detect
-> direct execution is treated as ungoverned
```

```text
effect mismatch
-> classify mismatch
-> apply smallest responsible repair
-> rerun same contract
-> compare effect again
-> repeat until functional, blocked, or superseded
```

Mismatch classes:

- contract unclear;
- input missing;
- script logic mismatch;
- forge pattern mismatch;
- resolver mismatch;
- schema mismatch;
- fixture/check missing;
- boundary conflict;
- environment missing;
- authority missing;
- user preference mismatch.

### 4. Forge Owns Pattern Modification

The script is the executable unit. The forge is the production pattern.

```text
one run mismatch -> inspect script/run
repeated or pattern mismatch -> flag forge for modification
forge modified -> regenerate or patch scripts
script rerun -> promote when functional
```

### 5. REFER Means Reference-Grounded

Domain scripts must not be built from memory.

```text
domain intent
-> authority resolver
-> official docs/spec/source when available
-> extracted reference packet
-> script or forge generated from packet
-> checks against reference and local evidence
-> lineage preserved
```

If no authoritative source exists:

```text
no authority found
-> experimental forge
-> trial and evidence
-> created local authority
-> ratify within stated scope
```

Authority classes:

- external authority: official docs, specs, SDK docs, source repositories, standards;
- created authority: local experiments, fixtures, receipts, talkback, build traces, user acceptance.

### 6. Clarification Must Reduce Ambiguity

The primary clarification model is bounded choice.

```text
ambiguous input
-> identify missing boundary
-> present 2-3 concrete choices
-> define each choice briefly
-> map each choice to deterministic route
-> store selected resolver
```

Example:

```text
Do you mean a Zo site page or a Zo Space page?
- Zo site page: public page or app surface users visit.
- Zo Space page: workspace/runtime container for files, tools, and automation.
```

### 7. Laws Become Active By Context

Do not ship all domain laws as always-active force.

The clean factory install ships only the kernel laws needed to operate Smart
Intake and the Script Factory itself. Historical REFER laws live as unscripted
references until a user or authorized process asks the factory to compile them.

```text
clean install
-> Script Factory kernel rules
-> Smart Intake resolver rules
-> internal reference source library
-> user/project/domain rules compiled from natural intake
-> verified scripts registered as active governance
```

Law/rule packs should be classified:

- kernel laws: always active, minimal determinism rules;
- domain laws: activated by domain, such as Stripe, Cloudflare, UI, database, storage;
- user method laws: learned from user preference, complaints, and accepted repairs;
- project laws: scoped to a repo/product;
- provider laws: Zo, Codex, OpenAI, Stripe, Cloudflare, etc.;
- inactive source laws: internal reference material compiled only when triggered.

Internal law source for this repo lives under:

```text
unscripted-laws/REFER.OS/
```

Those files are source material for doctrine compilation, not proof that a rule
is active. Users do not need to name or classify this state.

User-facing rule intake is natural:

```text
user uploads document / states preference / corrects output / gives a rule
-> Smart Intake captures rule material
-> doctrine compiler categorizes internally
-> fixtures and modification loop verify effect
-> registry activates only the verified scoped rule
```

Activation should be scripted:

```text
prompt/error/context
-> domain detector
-> activate relevant rule pack
-> record why activated
-> apply only active rules
```

## Target Architecture

### Hierarchy

```text
Factory System
  -> Factory
     -> Forge Family
        -> Forge
           -> Script Class
              -> Script
                 -> Run
                    -> Evidence Packet
```

Definitions:

- `Forge`: production pattern or conversion unit.
- `Script`: executable unit produced or governed by a forge.
- `Run`: one execution of a script against one contract.
- `Evidence Packet`: proof of effect, checks, receipts, talkback, and state.
- `Lineage Packet`: full chain from reference/contract to forge, script, run, repair, and promotion.

### Canonical Execution Sequence

The hierarchy needs a stable execution alphabet so the scriptionary can rebuild
the system from text. Use `SEQ-A` through `SEQ-L` as the canonical order:

```text
SEQ-A Kernel Governance
SEQ-B Request Intake
SEQ-C Clarification Resolver
SEQ-D Authority And Context
SEQ-E Strategy Selection
SEQ-F Forge Or Script Generation
SEQ-G Script Execution
SEQ-H Evidence Capture
SEQ-I Effect Comparison
SEQ-J Modification Loop
SEQ-K Promotion And Registration
SEQ-L Scriptionary Refresh
```

Rules:

- lower ranks execute before higher ranks when they both apply;
- a named method or strategy must declare which ranks it uses;
- a script registry entry should include its rank once the class registry exists;
- a lineage packet should preserve rank transitions so the run can be replayed;
- new ranks are added only when the behavior cannot fit an existing rank.

Sub-sequences use dotted ranks inside a parent step:

```text
SEQ-E.1 Condition Read
SEQ-E.2 Chain Decision
SEQ-E.3 Collision Check

SEQ-J.1 Mismatch Classifier
SEQ-J.2 Repair Action
SEQ-J.3 Replay Gate
```

The conditional chain controller owns deterministic chain actions:

```text
continue
branch
fork
merge
modify
delete
skip
block
supersede
promote
```

Rules:

- a condition must be read from measured state, contract data, registry data, or durable evidence;
- a branch chooses one path from known alternatives;
- a fork starts parallel branches only after collision checks prove their read, write, and lock surfaces do not collide;
- a merge rejoins forked or conditional branches into one evidence packet or effect comparison;
- modify changes the smallest responsible script, forge, resolver, schema, fixture, method, or rule pack;
- delete removes a chain link only with reason, affected surfaces, archive or rollback path, and registry update;
- skip records why a valid chain link did not apply;
- block records the missing input, authority, permission, environment, or boundary decision;
- supersede points to the new owner;
- promote requires evidence and scope.

### Named Methods And Strategies

Methods and strategies are part of the blueprint, not casual labels.

```text
Method Name
-> repeatable way of working
-> activation trigger
-> sequence ranks used
-> intended effect
-> evidence path
```

```text
Strategy Name
-> coordinated plan pattern
-> ordered methods/scripts
-> allowed parallelism
-> collision rules
-> success evidence
```

The scriptionary should carry enough information for another factory instance
to reconstruct the hierarchy and rerun the behavior without relying on chat
memory.

### Script Classes

Initial governed classes:

- `Governing Script`: enforces doctrine, schema, registry, law, boundary, or policy.
- `Resolver Script`: converts ambiguity into deterministic routing.
- `Sequencer Script`: orders scripts and prevents collision.
- `Collision Guard Script`: detects read/write conflicts and locks affected surfaces.
- `Forge Script`: generates, modifies, or regenerates scripts from contracts, references, laws, or patterns.
- `Reference Script`: fetches and extracts authoritative source material.
- `Domain Script`: performs work in a domain such as Stripe, Cloudflare, auth, database, storage.
- `UI Script`: builds, checks, or repairs interface output.
- `Function Script`: performs one bounded operation.
- `Validator Script`: checks schema, output, fixtures, effect, or safety.
- `Repair Script`: executes modification-loop patches.
- `Installer Script`: installs, verifies, repairs, or migrates a bundle.
- `Telemetry Script`: records process, evidence, talkback, usage, receipts.

### Status Split

Script status:

```text
draft
ready
running
functional
mismatched
blocked
superseded
unverified
```

Forge status:

```text
draft
stable
needs_modification
modifying
regenerating
ratified
superseded
blocked
```

### Lineage Packet

Minimum shape:

```json
{
  "lineage_packet_id": "lineage.<domain>.<timestamp>",
  "created_at": "",
  "intent_contract": {},
  "authority_refs": [],
  "factory": "Script Factory",
  "forge_family": "",
  "forge_id": "",
  "forge_version": "",
  "script_class": "",
  "script_id": "",
  "script_version": "",
  "run_id": "",
  "intended_effect": {},
  "observed_effect": {},
  "allowed_boundary": {},
  "effect_state": "functional | mismatched | blocked | superseded | unverified",
  "mismatch": {
    "type": "",
    "detail": "",
    "repair_layer": ""
  },
  "checks": [],
  "evidence": [],
  "repair_history": [],
  "promotion": {
    "status": "",
    "promoted_at": "",
    "receipt": ""
  }
}
```

### Script Class Registry Entry

Minimum shape:

```json
{
  "script_id": "smart-intake.ambiguity-resolver",
  "label": "Ambiguity Resolver",
  "script_class": "Resolver Script",
  "factory": "Script Factory",
  "forge_family": "Smart Intake",
  "forge_id": "request-intake-forge",
  "source_authority": ["docs/smart-intake-build-plan.md"],
  "reads": ["datasets/user-patterns/records/{handle}.json"],
  "writes": [],
  "before": ["domain-dispatch"],
  "after": ["vocabulary-extractor"],
  "locks": ["user-patterns:{handle}"],
  "effect_contract": {
    "intended_effect": "Produce bounded clarification or resolver route.",
    "allowed_boundary": "No mutation without confirmed resolver."
  },
  "status": "ready"
}
```

## Required Scripts / Forges

### 1. Script Class Registry

Purpose: give every script a governed class, forge owner, read/write surface, lock set, and lineage pointers.

Artifacts:

- `schemas/script-class-registry.schema.json`
- `.refer-factory/script-class-registry.json`
- `.refer-factory/script-class-registry.md`
- `scripts/registry/script-class-registry.mjs`

Checks:

- every registered operational script has `script_class`;
- every script declares read/write/lock surfaces;
- every script has a forge owner or explicit exception;
- package check includes registry validation.

### 2. Forge Registry

Purpose: record production patterns that generate, modify, or govern scripts.

Artifacts:

- `schemas/forge-registry.schema.json`
- `.refer-factory/forge-registry.json`
- `.refer-factory/forge-registry.md`
- `scripts/registry/forge-registry.mjs`

Fields:

- forge id;
- forge family;
- generated script classes;
- authority refs;
- current status;
- modification status;
- fixtures;
- lineage packets;
- generated scripts.

### 3. Lineage Packet Writer

Purpose: write durable lineage packets for script generation, runs, repairs, and promotion.

Artifacts:

- `schemas/lineage-packet.schema.json`
- `.refer-factory/lineage/`
- `scripts/lineage/lineage-packet.mjs`

Commands:

```powershell
node scripts/lineage/lineage-packet.mjs create
node scripts/lineage/lineage-packet.mjs record-run
node scripts/lineage/lineage-packet.mjs record-mismatch
node scripts/lineage/lineage-packet.mjs promote
node scripts/lineage/lineage-packet.mjs report
```

### 4. Authority Resolver

Purpose: find authoritative references for a domain before a script is generated or modified.

Artifacts:

- `scripts/reference/authority-resolver.mjs`
- `.refer-factory/authority/`
- `schemas/authority-reference.schema.json`

Flow:

```text
intent/domain
-> official authority lookup
-> reference packet extraction
-> if none, experimental local authority path
```

Domain examples:

- Stripe -> official Stripe docs and SDK docs;
- Cloudflare -> official Cloudflare docs;
- OpenAI -> official OpenAI docs;
- UI design -> project design rules, Figma/system docs, accepted user method;
- local factory behavior -> ratified build trace and fixtures.

### 5. Doctrine Compiler

Purpose: convert existing prose laws, rules, preferences, and methods into candidate executable governance.

Artifacts:

- `scripts/doctrine/doctrine-compiler.mjs`
- `.refer-factory/doctrine-candidates/`

Flow:

```text
prose law/rule
-> extract invariant
-> classify domain and activation trigger
-> identify allowed and forbidden effects
-> generate script/validator/forge blueprint
-> generate fixtures
-> run modification loop until functional or blocked
-> promote to active rule pack
```

User-facing rule: the user should not have to ask for an unscripted law to be
compiled. Any natural rule input should enter this path automatically unless
Smart Intake needs bounded clarification.

Output:

```json
{
  "source": "unscripted-laws/REFER.OS/refer.stripe.md",
  "classification": "domain_rule",
  "domain": "stripe",
  "activation_trigger": "payment checkout subscription",
  "invariant": "",
  "script_blueprint": "",
  "fixtures": [],
  "status": "candidate"
}
```

### 6. Script Sequencer

Purpose: determine parallel vs serial execution and prevent collision.

Artifacts:

- `scripts/sequencer/script-sequencer.mjs`
- `scripts/sequencer/collision-guard.mjs`
- `schemas/script-execution-plan.schema.json`

Flow:

```text
requested scripts
-> load script class registry
-> compare reads/writes/locks
-> create execution plan
-> run read/read in parallel
-> serialize write/write or read/write collisions
-> record lineage
```

Collision rules:

- read/read: parallel allowed;
- write/write same surface: serialize;
- write/read same surface: serialize or snapshot;
- shared registry/state file: lock;
- unknown surfaces: serialize conservatively.

### 7. Modification Loop Script

Purpose: detect non-functional script output, classify the gap, and emit the
modification-loop flag consumed by repair executors.

Status: Initial deterministic failure detector implemented on 2026-04-30.

Artifacts:

- `scripts/repair/modification-loop.mjs`
- `schemas/effect-comparison.schema.json`

Flow:

```text
contract + script result
-> compare intended_effect and observed_effect
-> if match, mark functional
-> if mismatch, classify gap type and repair layer
-> write lineage packet and modification flag
-> AI watcher consumes the flag, repairs the named layer, and reruns
-> AI watcher submits the new expected/observed verdict
-> repeat until functional, blocked, or superseded
```

Comparison form:

```powershell
npm run failure:detect -- --script-id <id> --expected-file <expected.json> --observed-file <observed.json>
```

Failure detector layer rules:

- one-off behavior: script;
- repeated production-pattern issue: forge;
- unclear target: resolver;
- missing check: fixture/validator;
- domain reference missing: authority resolver;
- preference mismatch: user method/persona;
- boundary mismatch: rule/law/doctrine.

### 8. Dissatisfaction Intake

Purpose: treat user complaint or displeasure as factory training data.

Artifacts:

- `scripts/intake/dissatisfaction-intake.mjs`
- `schemas/dissatisfaction-packet.schema.json`
- `.refer-factory/user-method/`

Flow:

```text
user says output is wrong / not liked
-> classify dissatisfaction
-> ask bounded clarification if needed
-> identify repair layer
-> update user method, forge, resolver, fixture, or script
-> regenerate output
-> observe acceptance
-> promote accepted method
```

Classes:

- visual style;
- wording;
- workflow;
- performance;
- routing;
- data model;
- incorrect assumption;
- missing domain law;
- overactive domain law;
- domain reference mismatch.

### 9. Portable Factory Bundle

Purpose: package Script Factory + Smart Intake + registries + installer into a deterministic portable app-like bundle.

Artifacts:

- `installer.mjs`
- `manifest.json`
- `checksums.json`
- `install-receipt.schema.json`
- bundle directory structure:

```text
refer-factory-bundle/
  manifest.json
  checksums.json
  installer.mjs
  package.json
  scripts/
  datasets/
  docs/
  skills/
  unscripted-laws/
  templates/
  config/
```

Commands:

```powershell
node installer.mjs install --target <path>
node installer.mjs verify --target <path>
node installer.mjs repair --target <path>
```

Rules:

- verify checksums before install;
- preserve local state unless explicit migration or force;
- run check/fixtures after install;
- emit install receipt;
- support Zo Pub as distribution, not authority.

### 10. Zo Pub Distribution

Purpose: publish signed/versioned bundles through Zo Pub.

Flow:

```text
build bundle locally
-> generate manifest + checksums
-> run verify
-> publish to Zo Pub
-> target downloads
-> installer verifies
-> install/upgrade/repair
-> emit talkback and install receipt
```

Authority remains:

```text
manifest + checksums + schema + install receipt + source ratification
```

Zo Pub is transport/distribution.

## Execution Phases

### Phase A — Ratify Vocabulary And Doctrine

Tasks:

- update Script Legend with script classes, effect states, lineage packet, authority reference, doctrine compiler, sequencer, collision guard;
- update factory doctrine with script classification and lineage hierarchy;
- separate active kernel governance from dormant unscripted laws;
- update Zo scriptionary with the same provider-neutral terms.

Checks:

- root `npm run compile`;
- Alliance `npm run check`;
- scriptographer/gap scan if labels are added to UI or registry.

### Phase B — Build Classification Registries

Status: Implemented initial executable slice on 2026-04-30.

Tasks:

- create Script Class Registry schema and generator;
- create Forge Registry schema and generator;
- classify existing root scripts;
- classify existing Alliance Smart Intake scripts.

Checks:

- every operational script has a class;
- every class is governed vocabulary;
- every script has read/write/lock surfaces or explicit exception;
- registry reports no unclassified scripts.

Implemented artifacts:

- `schemas/script-class-registry.schema.json`
- `schemas/forge-registry.schema.json`
- `scripts/registry/script-class-registry.mjs`
- `scripts/registry/forge-registry.mjs`
- `.refer-factory/script-class-registry.json`
- `.refer-factory/script-class-registry.md`
- `.refer-factory/forge-registry.json`
- `.refer-factory/forge-registry.md`

Remaining follow-up:

- classify Alliance Smart Intake scripts into the same shape;
- promote sequence rank and class fields into the source registry when the
  registry shape is stable.

### Phase C — Build Lineage Packets

Status: Schema and packet writer stub implemented on 2026-04-30.

Tasks:

- create lineage packet schema;
- create lineage packet writer;
- add lineage output to Smart Intake repair evidence and root factory scripts.

Checks:

- create packet fixture;
- record run fixture;
- record mismatch fixture;
- promote fixture;
- verify packet report.

Implemented artifacts:

- `schemas/lineage-packet.schema.json`
- `scripts/lineage/lineage-packet.mjs`
- `.refer-factory/lineage/`

Remaining follow-up:

- connect lineage packet writing to real registry, sequencer, repair, and
  promotion runs instead of manual/stub commands only.

### Phase D — Build Authority Resolver

Status: Initial deterministic resolver implemented on 2026-04-30.

Tasks:

- create authority reference schema;
- implement official-docs authority resolver for known provider domains;
- implement created-authority fallback path;
- add reference packet output.

Checks:

- Stripe intent resolves to official Stripe source;
- OpenAI intent resolves to official OpenAI source;
- unknown/local domain creates experimental authority packet;
- no domain script generation without authority lineage.

Implemented artifacts:

- `schemas/authority-reference.schema.json`
- `scripts/reference/authority-resolver.mjs`
- `.refer-factory/authority/latest.json`
- `.refer-factory/authority/latest.md`
- `test/authorityResolver.test.ts`

Current known authority domains:

- Stripe;
- OpenAI;
- Cloudflare;
- Script Factory local doctrine.

Remaining follow-up:

- add live/freshness verification for official URLs when network use is allowed;
- connect authority packets to Doctrine Compiler and domain script generation;
- expand provider/domain authority mappings through Natural Rule Intake and accepted repairs.

### Phase E — Build Doctrine Compiler

Status: Initial Natural Rule Intake compiler implemented on 2026-04-30.

Tasks:

- parse existing internal REFER law files from `unscripted-laws/REFER.OS` into candidates;
- classify law as kernel/domain/user/project/provider/inactive-source;
- generate candidate script/validator blueprints;
- generate fixtures.

Checks:

- one UI law compiles to validator candidate;
- one Stripe law compiles to domain rule candidate;
- one inactive source law remains inactive until trigger;
- no candidate becomes active without fixtures.

Implemented artifacts:

- `schemas/doctrine-candidate.schema.json`
- `scripts/doctrine/doctrine-compiler.mjs`
- `.refer-factory/doctrine-candidates/latest.json`
- `.refer-factory/doctrine-candidates/latest.md`
- `test/doctrineCompiler.test.ts`

Implemented behavior:

- accepts natural prompt rules or pointed source documents;
- does not require users to label laws as unscripted or dormant;
- classifies internally as kernel, domain, project, provider, user method, or
  inactive source;
- attaches authority lineage using the Authority Resolver;
- emits candidate script/validator blueprint and fixtures;
- keeps candidates inactive with `status: candidate`.

Remaining follow-up:

- parse batches of historical REFER source files;
- generate richer executable script bodies from candidates;
- connect candidates to Sequencer, Modification Loop, and promotion registry.

### Phase E2 — Build Scriptionary Term Intake

Status: Initial candidate/promote workflow implemented on 2026-04-30.

Purpose: when a new word, method, strategy, sequence rank, chain action,
artifact, status, rule, feature, or system effect becomes reusable, the factory
can capture it as a scriptionary candidate and promote it into the Script Legend
source when vetted.

Implemented artifacts:

- `schemas/scriptionary-term-candidate.schema.json`
- `scripts/scriptionary/scriptionary-term.mjs`
- `.refer-factory/scriptionary/term-candidates/latest.json`
- `.refer-factory/scriptionary/term-candidates/latest.md`
- `test/scriptionaryTerm.test.ts`

Commands:

```powershell
npm run scriptionary:candidate -- --term "New Effect" --plain "New Reusable Effect" --meaning "..." --use "..."
npm run scriptionary:promote -- --term "New Effect" --plain "New Reusable Effect" --meaning "..." --use "..."
npm run scriptionary:report
```

Rules:

- candidate mode records vocabulary without mutating source;
- promote mode inserts a vetted term into `src/contracts/scriptLegend.ts`;
- promoted terms still require compile, legend regeneration, and tests;
- duplicate terms are blocked and recorded as duplicate candidates.

### Phase F — Build Sequencer And Collision Guard

Tasks:

- create execution plan schema;
- implement collision guard from read/write/lock surfaces;
- implement sequencer planning.

Checks:

- read/read scripts parallelize;
- write/write same surface serializes;
- unknown surfaces serialize;
- plan writes lineage packet.

### Phase G — Build Modification Loop

Tasks:

- implement effect comparison schema;
- implement modification loop script;
- connect to lineage packet writer;
- classify repair layer.

Checks:

- functional case promotes;
- mismatch case repairs/reruns;
- repeated script mismatch flags forge;
- blocked case emits missing input/authority;
- superseded case points to new owner.

### Phase H — Build Dissatisfaction Intake

Tasks:

- implement complaint classifier;
- implement bounded clarification for dissatisfaction;
- update user method store;
- trigger modification loop with repair layer.

Checks:

- “too bulky” updates UI density preference and regenerates;
- “wrong target” updates resolver;
- “don’t use that wording” updates response dialect;
- accepted repair promotes user method.

### Phase I — Bundle And Publish

Tasks:

- build installer;
- create manifest/checksum/receipt schemas;
- package Script Factory + Smart Intake;
- add verify/repair commands;
- define Zo Pub publication packet.

Checks:

- install into clean target;
- verify clean target;
- repair missing file;
- preserve local user state;
- emit install receipt;
- publish dry-run packet for Zo Pub.

## Open Design Questions

1. Should script classes be flat, or should `Domain Script` have subtypes such as `Payment Domain Script`, `Auth Domain Script`, and `Storage Domain Script`?
2. Should `functional` be stored on script records, run records, or both?
3. How many repeated mismatches are required before the forge, not the script, is flagged for modification?
4. Should installed inactive references continue to land in `REFER.OS/` for compatibility, or should a future migration install them under `.refer-factory/rule-packs/inactive/`?
5. Should Zo Pub bundle signatures be implemented before or after basic checksum verification?
6. Should user method preferences be global per user, project-scoped, or both?

## Immediate Next Step

Phase B is implemented. Before building the modification loop, complete the Phase C integration step:

```text
Connect lineage packet writing to real registry, sequencer, repair, and promotion runs.
```

Reason: the modification loop now has script/forge classification, but repairs still need durable lineage ownership so a mismatch points to the right script, forge, authority reference, and promotion path.
