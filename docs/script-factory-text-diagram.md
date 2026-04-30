# Script Factory Text Diagram

This diagram uses the governed Script Legend and the Zo Scriptionary terms.

## Vocabulary Layers

```text
Factory System
  Complete network of coordinated factories across domains.

  -> Script Factory
       Governance system that creates, manages, runs, verifies, and repairs
       script forges.

       -> Scriptionary
            Script dictionary: defines the terms.

       -> Scriptonomy
            Script taxonomy: classifies modes, kinds, surfaces, and statuses.

       -> Script Registry
            Active list of governed script entries.

       -> Scriptograph
            Relationship map: what calls what, what feeds what, what returns.

       -> Forges
            Bounded conversion units that turn defined inputs into outputs.
```

## Request-To-Script Flow

```text
User Prompt
  -> Request Intake
       Classifies intent and mode:
         DISCUSS  free AI chat when no governed script is needed
         MICRO    one bounded local operation
         BUILD    scoped work with enough typed context
         PLAN     novel or complex work before execution

  -> Intake Engine / Compress Prompt
       Matches prompt against Script Registry.

       if matching active forge exists:
         -> Script Forge
              Reads contract or prompt.
              Performs one bounded conversion.
              Writes artifact, status, talkback, or dataset row.

       if no matching active forge exists:
         -> Script Gap Draft
              Records missing valid intent.
         -> Exploratory Build
              First authorized AI build.
         -> Build Trace
              Durable record of intent, changed files, errors, fixes, checks.
         -> Script Distillation
              Converts working trace into repeatable forge.
         -> Script Replay
              Re-runs from original intent.
         -> Script Registry
              Promotes only after replay succeeds.
```

## Local-First Factory Loop

```text
Repo
  -> Scan Codebase
       writes .refer-factory/codebase-tree.json
       writes .refer-factory/agent-context.md

Repo
  -> Scriptographer
       discovers factory names and classifies them against the Script Legend
       and Script Registry

Codebase Tree + Agent Context + Script Registry
  -> Context Picker
       selects compact prompt-specific context packs

  -> Orchestrator
       chooses scripts, context, model/agent lane, and verification

  -> Verification
       compile/test/check/replay

  -> Process Events
       records queued, running, completed, failed, blocked

  -> Self-Healing
       asks what was missing, ambiguous, manually inferred, or reusable
       then updates a script, context asset, test, status, or doctrine rule
```

## Zo Bootstrap Hive Loop

```text
Heartbeat
  Periodic train runner. Owns the tick loop.

  -> train-cars/01-dashboard.mjs
       Refreshes dashboard state and optional hive status ping.

  -> train-cars/02-spawn-worker.mjs
       Runs one bounded contract inbox worker when pending contracts exist.

  -> train-cars/03-scan-workspace.mjs
       Refreshes bounded workspace scan artifacts when stale.

  -> train-cars/04-hive-sync.mjs
       Checks configured hive manifest and records update availability.
```

```text
Hive
  Distribution hub that owns manifest, receives heartbeats, and dispatches work.

  -> scripts/hive/api.mjs
       Serves manifest, node records, registration, heartbeat, and ack routes.

  -> scripts/hive/dispatcher.mjs
       Packages hive/cell bundles and records package dispatch state.

  -> scripts/hive/receive.mjs
       Receives registration, status, and bounded dispatch payloads.

  -> scripts/hive/talkback.mjs
       Reports node status and compact result evidence.

Cell
  Registered Zo node that runs scripts and reports talkback.

  Cell -> Heartbeat -> Hive API
  Hive Dispatcher -> Cell Receive
  Cell Talkback -> Hive / Director
```

## Status Flow

```text
off
  -> queued
  -> running
  -> completed

queued
  -> running
  -> blocked
  -> failed

running
  -> completed
  -> blocked
  -> failed

blocked or failed
  -> queued
  -> running
```

## Compact Scriptograph

```text
User
  -> Request Intake
  -> @refer Participant
  -> refer.intake Contract
  -> REFER Orchestrator
  -> Context Picker
  -> Resolution Loop
  -> Chat History
  -> Process Events
  -> Verification
  -> Self-Healing
  -> Script Registry
```

```text
No Script Match
  -> Script Gap Draft
  -> Exploratory Build
  -> Build Trace
  -> Script Distillation
  -> Script Replay
  -> Registry Promotion
  -> Repeatable Forge
```

```text
Hive Director
  -> Dispatcher
  -> Cell Receive
  -> Cell Worker
  -> Talkback
  -> Hive Registry Evidence
  -> Source Ratification
```

## Mermaid Version

```mermaid
flowchart TD
  FS[Factory System] --> SF[Script Factory]
  FS --> CF[Context Factory]
  FS --> MF[Model Factory]
  FS --> AF[Artifact Factory]

  SF --> SC[Scriptionary]
  SF --> ST[Scriptonomy]
  SF --> SR[Script Registry]
  SF --> SG[Scriptograph]
  SF --> F[Forges]

  subgraph Core["Core Script Factory Runtime"]
    UP[User Prompt] --> RI[Request Intake]
    RI --> RP[@refer Participant]
    RP --> IC[refer.intake Contract]
    IC --> OR[REFER Orchestrator]
    OR --> CP[Context Picker]
    CP --> RL[Resolution Loop]
    RL --> RS{Resolution State}
    RS -->|resolved_as_is| CH[Chat History]
    RS -->|needs_more_info| RU[Raw Input Fallback]
    RU --> RL
    RS -->|needs_script| SD[Script Gap Draft]
    RS -->|blocked_or_failed| PE[Process Events]
    CH --> PE
  end

  subgraph Maturity["Local-First Maturity Loop"]
    Repo[Repo] --> Scan[Scan Codebase]
    Scan --> Tree[Codebase Tree]
    Scan --> AC[Agent Context]
    Repo --> SGR[Scriptographer]
    SGR --> Gaps[Factory Gaps]
    SR --> OR
    Tree --> CP
    AC --> CP
    SD --> EB[Exploratory Build]
    EB --> BT[Build Trace]
    BT --> Distill[Script Distillation]
    Distill --> Replay[Script Replay]
    Replay --> SR
    PE --> Verify[Verification]
    Verify --> Heal[Self-Healing]
    Heal --> SR
    Heal --> SG
  end

  subgraph ZoHive["Zo Bootstrap / Hive Sibling Lane"]
    Contract[Typed Contract] --> Compress[Compression Transport]
    Compress --> Dispatch[Hive Dispatcher]
    Dispatch --> Receive[Cell Receive]
    Receive --> Worker[Cell Worker]
    Worker --> Talkback[Talkback]
    Talkback --> Evidence[Hive Registry Evidence]
    Evidence --> Ratify[Source Commit Ratification]
    Heartbeat[Zo Heartbeat] --> Dashboard[Dashboard Car]
    Dashboard --> Spawn[Spawn Worker Car]
    Spawn --> WorkspaceScan[Scan Workspace Car]
    WorkspaceScan --> HiveSync[Hive Sync Car]
    HiveSync --> HiveAPI[Hive API]
    HiveAPI --> Dispatch
  end

  IC -. typed contract is authority .-> Contract
  Talkback -. evidence .-> PE
  Ratify -. provider-neutral lessons .-> SF
```
