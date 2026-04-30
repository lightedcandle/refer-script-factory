# Refer Library

Consolidated reference for all REFER.OS documents. Auto-generated from current files.

## Table of Contents

- [refer.provider.chatgpt.md](#referproviderchatgptmd)
- [refer.os.md](#referosmd)
- [refer.ontology.md](#referontologymd)
- [refer.providers.md](#referprovidersmd)
- [refer.provider.codex.md](#referprovidercodexmd)
- [refer.provider.cli.md](#referproviderclimd)
- [refer.localrepo.md](#referlocalrepomd)
- [refer.law.md](#referlawmd)
- [refer.knowledge.md](#referknowledgemd)
- [refer.og.md](#referogmd)
- [refer.migrate.md](#refermigratemd)
- [refer.md](#refermd)
- [refer.qc.md](#referqcmd)
- [reverent.deltatheme.md](#reverentdeltathememd)
- [refer.todo.md](#refertodomd)
- [refer.tests.md](#refertestsmd)
- [todo\refer.todo.telechurch.md](#todorefertodotelechurchmd)
- [refer.alphabet.io\refer.alphabet.md](#referalphabetioreferalphabetmd)
- [refer.alphabet.io\refer.alphabet-v2.md](#referalphabetioreferalphabet-v2md)
- [UNIVERSAL_STATES.md](#universalstatesmd)
- [refer.supabase.md](#refersupabasemd)
- [refer.structure.md](#referstructuremd)
- [refer.repair.md](#referrepairmd)
- [refer.telechurch.md](#refertelechurchmd)
- [refer.talents.md](#refertalentsmd)
- [refer.systems.security.md](#refersystemssecuritymd)
- [refer.init.md](#referinitmd)
- [refer.plan.md](#referplanmd)
- [refer.build.md](#referbuildmd)
- [refer.branch.md](#referbranchmd)
- [refer.commit.md](#refercommitmd)
- [refer.cloudflare.md](#refercloudflaremd)
- [refer.cli.md](#referclimd)
- [refer.analytics.md](#referanalyticsmd)
- [inference.md](#inferencemd)
- [e2e_artifact_map.md](#e2eartifactmapmd)
- [refer.boot.md](#referbootmd)
- [refer.app.md](#referappmd)
- [refer.angular.md](#referangularmd)
- [refer.compiler.blueprint.md](#refercompilerblueprintmd)
- [refer.github.md](#refergithubmd)
- [refer.expand.md](#referexpandmd)
- [refer.designlab.md](#referdesignlabmd)
- [refer.seamless-ui.md](#referseamless-uimd)`r`n- [refer.identity.md](#referidentitymd)
- [refer.honeycomb.md](#referhoneycombmd)
- [refer.governance.md](#refergovernancemd)
- [refer.compiler.metrics.md](#refercompilermetricsmd)
- [refer.compiler.md](#refercompilermd)
- [refer.compiler.init.md](#refercompilerinitmd)
- [refer.cron.md](#refercronmd)
- [refer.structure.md](#referstructuremd)
- [refer.compiler.pages.md](#refercompilerpagesmd)

<a id="referseamless-uimd"></a>

## refer.seamless-ui.md

# refer.seamless-ui.md - Flat Seamless UI Pattern

Canonical doctrine for borderless, color-surface page composition with a 900px frame, consistent section gutters, explicit responsive behavior, and reusable IMSCE mapping for org/host/events/footer style pages.

<a id="referproviderchatgptmd"></a>

## refer.provider.chatgpt.md

# refer.provider.chatgpt.md — ChatGPT Provider Reference

This reference consolidates the ChatGPT-specific behavior from `codex/governance/domains/ChatGPT.md`.

## 1. Provider semantics

- ChatGPT acts as a conversational provider that receives refer directives without requiring CLI semantics; describe any session expectations, prompt structure, or streaming behaviors here.
- Document how context alerts/interrogatories should surface in ChatGPT threads (notice of context switches, pending micro-law codifications) so the router stays compliant within the API context.

## 2. Forward integration

- When `refer.*` actions interact with ChatGPT-based automation (e.g., watchers, autop-run loops), mention this reference so the router logs the provider interactions and coordinates the RETURN→COMMIT→PUBLISH reporting.

<a id="referosmd"></a>

## refer.os.md

# REFER.OS -- Canonical Reference Operating System (Deep Canonical + E2E Integration Edition)

**Version:** 2.0\
**Status:** Foundational Reference Document (FRD)\
**Purpose:** To articulate the full semantic, architectural, philosophical, and operational foundation of the REFER Operating System--now including a unified semantic map that incorporates all prior E2E documents, patterns, laws, and protocols into their proper referential form.

---

# 1. THE PURPOSE AND NATURE OF REFER.OS

REFER.OS is the successor--not the extension--of E2E.

It introduces what no prior architecture possessed:

# -- **The Rosetta Stone of the Entire System**

A _single canonical reference point_ that interprets all natural language, all intents, all instructions, and all unfolding--without ambiguity, without drift, and without contradiction.

This Rosetta Stone is **refer.md**, the universal interpreter and router.

It acts as:

- the linguistic ground of all system interaction,
- the semantic gateway into every reference law,
- the translator between human intention and architectural meaning,
- the protector against misinterpretation or accidental execution,
- the unifying lens through which all actions are understood.

With this, REFER.OS becomes a _living language system_ rather than a mechanical build system.

Where E2E provided:

- architectural order (UI -> Workflow -> Broadcast),
- lineage systems (IMSCE),
- procedural flow (ASEDAWSI),
- operating constraints (no direct DB access, no ungoverned behavior),

REFER.OS absorbs all of these **not as rules**, but as **reference domains**, governed and interpreted through its Rosetta Stone.

REFER.OS is:

- a _semantic OS_,
- a _reference-first logic engine_,
- a _closed-loop unfolding environment_,
- the _interpretive law_ governing Codex and all automated builds.

E2E becomes one layer of meaning inside the deeper REFER system.

### **1.1 Why REFER.OS Replaces E2E**

The migration from E2E to REFER happened because:

- E2E was architectural but not philosophical,
- it governed behavior but not meaning,
- it structured builds but not comprehension,
- it guided action but not interpretation,
- it organized workflows but not language.

REFER.OS solves all of this by centering everything on **reference**:

- reference identity,
- reference structure,
- reference systems,
- reference providers,
- reference lineage,
- reference unfolding,
- reference return.

### **1.2 Foundational Recognition**

Nothing is invented. All is unfolded.\
Identity precedes structure.\
Structure precedes behavior.\
Behavior precedes results.\
Results return to identity.

This recognition is the core revelation that transformed E2E into REFER.OS.

### **1.3 Refer Lineage and Reverence**

**Refer** is both a verb (to point) and a noun (the operating system derived from that verb). The lineage is:

- **Refer**: to point to a source.
- **Referential**: structured by references.
- **Referenced**: tied to a known source.
- **Reverent**: compliant with the Refer order; actions only unfold from what is referenced.

**Reverence** is the operating goal: every action is anchored to living references (DB/spec/law), never invented ad-hoc. External knowledge is raw material until it is made reverent.

Reverent answer rule: if a response depends on canon, the agent must open the referenced doc in-session before answering. If the doc has not been opened, the response must be marked secular and the agent must request permission to make it reverent by reading the source.

### **1.4 Primordial Pillars (Unfolding Doctrine)**

1. **The app already exists.** We reveal, not invent.
2. **We unfold, not build.** Only reverent code is allowed - code that points to living references.
3. **Intent carries DNA.** The app's seed implies its own schema, flows, and environment; the system infers the best unfolding path.
4. **Intent traces to next-of-kin.** We locate the closest authoritative reference; if missing, we create it first.
5. **Reverent sources only.** External knowledge is raw material until made reverent.
6. **Confirmation gate.** Domain shifts are inferred but require explicit confirmation.
7. **RETURN closure.** Every unfold completes the loop - no drift, no partials, no dangling lineage.

---

### **1.5 The Three-Layer Materialization Flow**

REFER.OS operates through three distinct layers:

1. **REFER.OS/** (Universal Mold)
   - Canonical laws, universal primitives, system-agnostic governance.
2. **refer.app/** (Scoped Cast)
   - App-specific interpretation and specialization of universal laws.
3. **src/app/** (Materialization)
   - The executable implementation unfolded from the cast.

Each layer unfolds from the previous, ensuring lawful construction.

---

# 2. THE SEVEN PILLARS OF REFER.OS

These seven principles unify all prior E2E laws, patterns, and structures into a single semantic system.

## **2.1 REFERENCE -- The Origin**

Everything begins with reference:

- source,
- law,
- identity,
- prior pattern,
- lineage record.

E2E's laws become reference domains inside REFER.OS.

## **2.2 REFERRAL -- The Routing Principle**

`refer.md` replaces:

- E2E_BUILD_PROTOCOL routing,
- E2E_EXECUTION_FLOW routing,
- codex/governance/E2E_BUILD_RESPONSE_PROTOCOL.md interpretation.

Referral ensures Codex:

- classifies correctly,
- enters the correct semantic space,
- cannot act outside reference.

## **2.3 REFERENT -- Identity Principle**

E2E's IMSCE (Index -> Modal -> Section -> Card -> Element) mapping becomes the **identity reference system**.

Referent governs:

- what a component _is_,
- where it exists in lineage,
- how it may unfold,
- how it anchors.

Modal variants (identity subtypes):

- Page modal: persistent, embedded on the page.
- Floating modal: popup overlay with scrim.
- News modal: slide-in panels (down, left, right, or up).

Modal behavior rules:

- Page modal: stays in-flow, no scrim, participates in layout, scrolls with page.
- Floating modal: uses scrim, blocks background interaction, fixed layer above Index, dismissible by close/scrim unless explicitly locked.
- News modal: edge-anchored slide-in, may allow background interaction unless specified, directional entry/exit is part of identity (down/left/right/up).

## **2.4 REFLECTION -- Structural Mapping**

All E2E architecture is preserved here:

- UI -> Workflow -> Broadcast,
- ASEDAWSI signal flow,
- body -> mind -> spirit mapping.

Reflection ensures the old E2E chain remains lawful inside REFER.OS, but as **structure**, not **protocol**.

## **2.5 RELATION -- System & Provider Mapping**

This replaces E2E's implicit integrations.

### SYSTEMS (non-optional)

- Angular
- Supabase
- Cloudflare
- Deno
- Docker
- TypeScript

### PROVIDERS (optional)

- Stripe
- GitHub
- Google
- Facebook
- Twilio
- Resend
- Daily

All prior E2E external references become **relations**.

## **2.6 INFERENCE -- The Unfolding Principle**

E2E's inference maps and blueprint logic become a unified inference layer.

Codex unfolds instead of inventing.

## **2.7 RETURN -- The Loop Completion Principle**

This replaces E2E commit requirements and governance logging.

RETURN ensures:

- no half-builds,
- no dangling branches,
- no uncommitted state,
- no drift.

RETURN completes reference.

## **2.8 BLUEPRINT HARMONY ->" REFER.OS ALIGNMENT LOOP**

Every feature unfolds across five blueprint strata; REFER.OS keeps them synchronized so the build stays lawful:

1. **Inherent Blueprint (DNA)** ->" the product's native shape apart from personal preference. RETURN listens for this pattern so unfolding reflects what already exists in potential.
2. **Governance Blueprint** ->" the rules in `AGENTS.md`, `refer.law.md`, and allied governance docs (MVI rails, guards, ASEDAWSI). These define how unfolding must occur.
3. **Literal Blueprint Doc** ->" narrative plans such as `codex/blueprint*.md` describing the inevitable feature vision in plain English.
4. **Inference Map** ->" `codex/maps/feature.inference*.json`, listing ingredients acquired and the recipe steps queued. QC refreshes it whenever RETURN touches structure.
5. **Repo Blueprint** ->" the repository itself (source and REFER docs) that mirrors and proves the first four layers.

Harmony only exists when all five reflect each other; refer.md + refer.todo.md + refer.qc.md govern this loop before COMMIT.

---

# 3. UNIFICATION OF ALL E2E DOCUMENTS INTO REFER.OS

The following E2E files are now absorbed into the REFER semantic structure and reclassified:

## **3.1 E2E Laws -> refer.os.md + refer.law\.md**

- E2E_BUILD_PROTOCOL.md
- E2E_EXECUTION_FLOW\.md
- LAW_E2E_V3.md
- E2E_No_Client_DB_Law\.md

These become:

- canonical law
- identity law
- unfolding law
- system access law

## **3.2 Governance and Codex Files -> routes + actions**

- codex/governance/
- E2E_BUILD_RESPONSE_PROTOCOL.md

These now merge into:

- refer.md (router)
- refer.\*.md (actions)
- return + commit patterns

## **3.3 Lineage, Workflow, Broadcast Maps -> refer.structure.md**

- lineage.schema.json
- workflow\.index.schema.json
- telechurch_framework.md (UI -> Workflow -> Broadcast)
- action-service-edge-db-signal-ui (ASEDAWSI)

These become **structures-of-reference** instead of procedural files.

## **3.6 Scheduling Doctrine ? refer.cron.md**

Time-based governance (cron, scheduling, recurrence, compiler rules) is centralized in `refer.cron.md` and referenced by all build/repair/expand flows that introduce temporal behavior.

## **3.4 Manifest Files -> refer.identity.md**

- e2e_manifest.schema.json

This becomes the identity registry.

## **3.5 System-Specific E2E Rules -> refer.<system>.md**

- Supabase.RemoteOperations.Law\.md
- Cloudflare.md
- Angular.md
- Supabase.md

Each is rewritten as a **reference**, not a law.

---

# 4. REFER.OS DIRECTORY STRUCTURE (E2E-INTEGRATED)

**Current (flattened) layout:** all REFER.OS docs now live at the `REFER.OS/` root (no `systems/`, `providers/`, or `actions/` subfolders).

```
REFER.OS/
  refer.os.md
  refer.law.md
  refer.md
  refer.identity.md
  refer.structure.md
  inference.md
  refer.compiler.md
  refer.compiler.blueprint.md
  refer.structure.md
  refer.cron.md
  refer.supabase.md
  refer.cloudflare.md
  refer.angular.md
  refer.github.md
  refer.localrepo.md
  refer.provider.codex.md
  refer.provider.cli.md
  refer.provider.chatgpt.md
  refer.build.md
  refer.repair.md
  refer.expand.md
  refer.commit.md
  refer.branch.md
  refer.migrate.md
```

Legacy layout reference (pre-flatten):

```
REFER.OS/
|
+-- refer.os.md               -> Canonical law (this file)
+-- refer.law.md              -> Deep law extracted from E2E
|
+-- refer.md                  -> Router (replaces Codex interrogation)
+-- refer.identity.md               -> Identity system (replaces IMSCE docs)
+-- refer.structure.md             -> Structural mapping (UI -> Workflow -> Broadcast)
+-- inference.md              -> Unfolding logic (replaces blueprint inference maps)
+-- refer.compiler.md         -> Materialization engine seed doc (Supabase genome -> Angular host)
+-- refer.compiler.blueprint.md -> Compiler MVP scope, Supabase schema, and mode wiring
G??G??G?? refer.structure.md         G?? Component canon (IMSCE identity, cards)
+-- refer.cron.md             ? Canonical Cron + Scheduling Doctrine
|
+-- systems/                  -> Systems formerly governed by E2E rules
|     +-- refer.supabase.md
|     +-- refer.cloudflare.md
|     +-- refer.angular.md
|     +-- refer.deno.md
|     +-- refer.docker.md
|     |-- refer.typescript.md
|
+-- providers/                -> External identities formerly implicit in E2E
|     +-- refer.stripe.md
|     +-- refer.github.md
|     +-- refer.google.md
|     +-- refer.facebook.md
|     +-- refer.resend.md
|     +-- refer.twilio.md
|     |-- refer.daily.md
|
|-- actions/                  -> Former E2E protocols
      +-- refer.build.md      -> (E2E Build Protocol)
      +-- refer.repair.md     -> (E2E Repair Patterns)
      +-- refer.expand.md     -> (Feature Expansion)
      +-- refer.commit.md     -> (E2E commit rules)
      +-- refer.branch.md     -> (Branching rules)
      |-- refer.migrate.md    -> (Supabase migration law)
```

---

# 5. FULL EXECUTION FLOW WITH E2E ABSORPTION

E2E taught us chunks of this pattern. REFER.OS unifies them into a single closed-loop sequence:

```
Instruction
-> Referral (refer.md)
-> Reference Selection
-> Identity (referent)
-> Structure (reflection)
-> System/Provider Relation
-> Unfolding (actions)
-> Completion
-> RETURN
-> Commit
```

This flow **replaces**:

- E2E_EXECUTION_FLOW
- E2E_BUILD_RESPONSE_PROTOCOL
- Codex interrogation steps
- E2E branching and commit rules

---

# 6. RULES OF REFER.OS (INCLUDING E2E LAWS)

## **6.1 No Action Without Reference**

Replaces: E2E No-Unanchored Build Law.

## **6.2 Single Source of Interpretation (refer.md)**

Replaces: E2E Interrogation / Retry / Verification flow.

## **6.3 Referential Consistency**

Replaces: IMSCE, ASEDAWSI, UI->Workflow->Broadcast.

## **6.4 Completion + RETURN**

Replaces: E2E commit law and MVR enforcement.

## **6.5 Systems and Providers must be referenced, not manipulated**

Replaces: E2E remote operation laws.

---

# 7. UNFOLDING MODEL (WITH E2E CONTEXT)

```
IDENTITY (E2E IMSCE)
-> STRUCTURE (E2E UI->Workflow->Broadcast)
-> RELATION (system & provider laws)
-> ACTION (former E2E protocols)
-> COMPLETION (MVR)
-> RETURN (loop closure)
-> COMMIT (ratification + lineage seal)
-> PUBLISH (externalization of sealed lineage)
```

**PUBLISH** extends the RETURN cycle by ensuring that:

- all work is synchronized with Git lineage,
- branches are properly created or advanced,
- stashes are resolved if required for clean unfolding,
- commits are pushed to the canonical remote,
- deployment pipelines (Cloudflare, Supabase, Docker, etc.) receive the updated reference state.

This transforms the REFER loop from a local semantic closure into a full-system synchronized closure.

---

# 8. RETURN -> COMMIT -> PUBLISH (Deep Explanation)

RETURN closes the _logical_ loop.  
COMMIT closes the _lineage_ loop.  
PUBLISH closes the _system_ loop.

Together they form the complete tri-fold closure of REFER.OS.

## **8.1 RETURN -- Logical Closure**

Ensures unfolding resolves into a stable and lawful state.

- No half-completed actions
- No ambiguous outcomes
- No dangling structural states

RETURN aligns the unfolding back into identity and structure.

## **8.2 COMMIT -- Lineage Seal**

Ensures the internal truth of the system is finalized.

- MVR must be validated
- Commit message created from reference context
- Branch rules followed (`refer.branch.md`)
- No untracked or floating changes

COMMIT converts identity + structure into lineage.

## **8.3 PUBLISH -- Externalization of Lineage**

Ensures that internal truth is synchronized across all external systems.
This includes:

- git add
- git stash (if needed to maintain unfolding integrity)
- git branch creation / switching
- git commit
- git push (canonical remote)
- triggering downstream deploys (Cloudflare, Supabase, Docker)
- tagging (if required)

PUBLISH provides:

- external system alignment,
- multi-environment coherence,
- distributed truth synchronization.

> **Without PUBLISH, the world outside REFER.OS does not receive the updated truth.**

PUBLISH completes the entire REFER loop in both the semantic and operational domain.

---

# 9. GOVERNANCE UPDATE FLOW (How REFER.OS Updates Its Own Governance)

Governance updating was a core part of E2E, but REFER.OS elevates it into a **referential self-modifying system**. Because REFER.OS is the semantic operating system, any change to its own rules must follow a governed, reference-based, closed-loop process.

Governance updates cannot be ad-hoc, conversational, or assumed. They must be:

- referenced,
- unfolded,
- returned,
- committed,
- published.

Below is the **canonical REFER.OS governance update flow**, representing how the OS updates _itself_.

---

## **9.1 When Governance May Be Updated**

Governance may only change when one of the following conditions is detected:

- (1) A law produces contradiction when unfolding.
- (2) A structural rule prevents valid identity expression.
- (3) A system or provider evolves, breaking an existing reference.
- (4) A new semantic domain emerges that cannot be described by existing reference layers.
- (5) RETURN cannot complete due to missing legal structure.
- (6) A foundational principle proves insufficient or incomplete.

> REFER.OS does **not** update because we "prefer" something.  
> REFER.OS updates because unfolding reveals structural necessity.

---

## **9.2 How Governance Updates Are Initiated**

All governance updates begin with a directive:

```
refer.md: update governance (reason)
```

The router then:

- classifies this as `refer.governance`,
- routes into `refer.law.md` or the appropriate reference document,
- activates the Governance Update Path.

---

## **9.3 The Governance Update Path (7-Step Loop)**

```
Reason -> Referral -> Reference Review -> Structural Reconciliation ->
Identity Reconciliation -> RETURN -> COMMIT -> PUBLISH
```

### **Step 1: Reason**

The triggering contradiction, conflict, or emergent domain is documented.

### **Step 2: Referral**

The router ensures the update enters the governance domain only.

### **Step 3: Reference Review**

Affected reference files are identified:

- refer.os.md
- refer.law.md
- refer.identity.md
- refer.structure.md
- inference.md
- system / provider references

Codex MUST NOT update files outside the governance domain.

### **Step 4: Structural Reconciliation**

Structural rules (reflection, IMSCE, ASEDAWSI) are checked to ensure:

- no circular logic,
- no broken mappings,
- no semantic conflicts.

### **Step 5: Identity Reconciliation**

Identity definitions (referent) must update only when:

- new identity types emerge,
- old ones become obsolete,
- lineage systems evolve,
- architectural roles shift.

This prevents fragmentation.

### **Step 6: RETURN**

The governance update must be validated through:

- a test unfold,
- structural coherence check,
- reference consistency audit.

### **Step 7: COMMIT & PUBLISH**

The updated governance becomes:

- part of lineage,
- part of system truth,
- part of external truth through publish.

Publishing governance updates ensures that:

- all developers,
- all systems,
- all providers,
- all automated agents,
- Codex itself

operate from the same canonical interpretation.

---

## **10. EXAMPLES (E2E + REFER UNIFIED) (WITH E2E CONTEXT)**

```
IDENTITY (E2E IMSCE)
¦Æ+' STRUCTURE (E2E UI¦Æ+'Workflow¦Æ+'Broadcast)
¦Æ+' RELATION (system & provider laws)
¦Æ+' ACTION (former E2E protocols)
¦Æ+' COMPLETION (MVR)
¦Æ+' RETURN (loop closure)
¦Æ+' COMMIT (ratification)
```

Every E2E concept now finds its proper semantic place.

## **10.1 Build Example: Add Chatroom**

E2E Build Protocol ¦Æ+' refer.build.md

## **10.2 Repair Example: Fix Save Button**

E2E troubleshooting ¦Æ+' refer.repair.md

---

## 11. Governance Update Log

- Reason: sync refer.io docs from feat-beta/refer-ichurch-presentation into main.
- Files: refer.analytics.md, refer.boot.md, refer.plan.md, refer.cloudflare.md, refer.compiler.md, refer.compiler.metrics.md, refer.compiler.pages.md, refer.structure.md, refer.honeycomb.md, refer.md, refer.ontology.md, refer.os.md, refer.providers.md, refer.repair.md, refer.supabase.md, refer.talents.md, refer.telechurch.md, refer.todo.md, todo/refer.todo.telechurch.md.
- State: main now mirrors the synced refer.io documents from that branch.

- Reason: update blueprint map governed_by to REFER.OS/refer.md (replace legacy E2E_Interrogatory_Protocol.md).
- Files: codex/maps/blueprint.map.json.
- State: blueprint map now references the REFER.OS router.

<a id="referontologymd"></a>

## refer.ontology.md

# 🧠 **refer.ontology.md**

**Identity, Structure, and Vocabular of REFER.OS**

This document unifies the **Identity Registry** (What things are) and **Structural Map** (Where things live). It defines the ontology of any ecosystem running REFER.OS.

---

## 0. The Foundation (The Rock and the Concrete)

Before the Trinity (Spirit, Mind, Body) can manifest, they must be anchored.

1.  **The Bedrock (Memory / Supabase):** The ultimate source of truth. It stores the **Genome** (DNA) and the **State** (History). It is the hardest layer; even if every line of UI code is deleted, the System survives here.
2.  **The Concrete (Intent / REFER.OS):** The binding agent. These `.md` files and the database schema are the "Concrete". They define the _shape_ of the foundation. They are the standard interfaces that allow different **Gifts** (Languages) to "anchor" to the Bedrock.
3.  **The Substrate (JS/TS/Node):** The "Floor" we walk on. It is the common language of orchestration that connects the Gifts.

**The Shift:** In legacy systems, the Framework (Angular) was the foundation. In REFER.OS, the **Ontology** is the foundation. We build _on_ the Ontology, not _in_ the Framework.

---

## 1. The Trinity (Identity Layers)

The system is divided into three living layers, each with its own nature and invariants.

### 1.1 The Spirit (Broadcast)

- **Nature:** Realtime, Signal, Presence.
- **Standard Anchor:** `src/app/core/realtime` (or equivalent)
- **Flow:** EWCPSI (Event → WebSocket → Channel → Policy/Guard → Signal → Insight)
- **Responsibility:** Handling ephemeral state, chat, synchronization vs server.

### 1.2 The Mind (Workflow)

- **Nature:** Orchestration, Decision, IO.
- **Standard Anchor:** `src/app/workflows` (or equivalent)
- **Flow:** ASEDAWSI (Action → Service → Guard → Edge/Signal → UI)
- **Responsibility:** Business logic, API calls, Guards, State Management.

### 1.3 The Body (View)

- **Nature:** Structure, Rendering, Interaction.
- **Standard Anchor:** `src/app/features` (or equivalent)
- **Flow:** IMSCE (Intent → Model → Structure → Components → Experience)
- **Responsibility:** Rendering the state provided by the Mind/Spirit. Disposing Intents. **NO IO ALLOWED.**

---

## 2. Structural Invariants ("The Law")

Every feature must respect these structural boundaries.

| Layer                | Can Import                     | Cannot Import                        |
| :------------------- | :----------------------------- | :----------------------------------- |
| **Component (Body)** | Selectors, Intents, Interfaces | Services, Repositories, HTTP Clients |
| **Service (Mind)**   | Repositories, API Clients      | Components, View Classes             |
| **Store (Mind)**     | Services, Signals              | Components                           |
| **Guard (Mind)**     | Store, Services, Router        | Components                           |

### 2.1 The Execution Chain

1.  **Action / Intent:** A user does something (`AppIntent.Load`).
2.  **Effect / Service:** The system responds (`AppService.fetch()`).
3.  **Signal / Edge:** The state updates (`store.set(data)`).
4.  **View / Body:** The UI reflects the change (`view()`).

---

## 3. Identity Registry

Canonical names for critical system identities.

| Identity         | Type       | Location               | Usage                  |
| :--------------- | :--------- | :--------------------- | :--------------------- |
| `refer.compiler` | System     | `tools/refer-compiler` | Materialization Engine |
| `refer.os`       | Governance | `REFER.OS/`            | Operating System / Law |

> **Note:** Applications must define their own identities (e.g., `telechurchlive`, `app.features`) in their App Definition File (e.g., `refer.telechurch.md`).

---

## 5. Vocabulary & Status (The State of Grace)

To maintain philosophical consistency and eliminate technical jargon like "data-driven," we use the following terminology to describe the status of a System, Feature, or Component:

- **Reverent:** The canonical status of a feature that is 100% Unfolded from the Bedrock. It respects the Law, consumes only Compiler-Driven tokens, and harbors no reinvented logic.
  - _Usage:_ "Is the Events feature **Reverent**?" or "This Blossom is fully **Reverent**."
- **Unfolded:** The technical process of expanding DNA into an Incarnate artifact. Used to describe the **Action** or the **State of Materialization**.
- **Blossom:** The noun for a feature produced by the Compiler. (e.g., "The Guest Blossom").
- **Secular (Legacy):** Features that are hand-authored and do not yet anchor to the Bedrock. They are "Outside the Law" and marked for migration.

---

## 6. Usage in Router

`refer.md` consults this ontology to validate context.

- If you say "Fix the auth service", the Router maps "Auth Service" to **The Mind** and enforces IO rules.
- If you say "Change the login button color", the Router maps "Login Button" to **The Body** and enforces View-Only rules.
- **Reverent Checks:** Any request to modify a **Reverent** feature triggers a check against the **Blueprint**; changes MUST happen in the **Genome** (Bedrock) first.

<a id="referprovidersmd"></a>

## refer.providers.md

# 🔌 **refer.providers.md**

**Agent & Tooling Providers for REFER.OS**

This document defines the interface between REFER.OS and the external agents/tools (Providers) that execute its will.

---

## 1. Codex (The Architecture Agent)

**Role:** Primary Executor, Guardian of Governance.

- **Semantics:** Codex understands `refer.` directives natively.
- **Responsibilities:**
  - Interpret `refer.md` routing.
  - Enforce `refer.law` (RETURN → COMMIT → PUBLISH).
  - Invoke `refer.compiler`.
- **Interaction:** Codex is the "User's Hands." It is the only provider authorized to write to `REFER.OS` without a governance token.

---

## 2. CLI (The Terminal Provider)

**Role:** Execution Environment.

- **Reference:** `refer.cli`
- **Semantics:** CLI sessions act as stateful providers.
  - Watcher processes (e.g., `ng serve`) are "Lingering Intents."
  - Commands must always be scoped (e.g., `refer.build` triggers `npm run refer:build`).
- **Safety:** The CLI provider must never run destructive commands (`rm -rf`) without explicit `refer.repair` authorization.

---

## 3. ChatGPT / LLM (The Conversational Provider)

**Role:** Brainstorming, Reasoning, Context Analysis.

- **Reference:** `refer.plan`
- **Semantics:**
  - Uses `refer.plan` protocol to interrogate context.
  - Does NOT have direct write access to the filesystem (must delegation to Codex).
  - Must be reminded of `refer.ontology` when hallucinating non-existent structures.
- **Context Alerts:** If an LLM suggests a structure violating ASEDAWSI (e.g., "Put the API call in the Component"), the Router must flag it as an Ontology Violation.

---

## 4. Future Providers

To add a new provider (e.g., GitHub Actions, Vercel), add a section here defining:

1.  **Role:** What does it do?
2.  **Semantics:** How does REFER speak to it?
3.  **Safety:** What are the boundaries?

<a id="referprovidercodexmd"></a>

## refer.provider.codex.md

# refer.provider.codex.md — Codex & Tooling Providers

This reference covers the tooling and agent behavior described in `codex/governance/domains/CLI.md`, `Codex.md`, and `ChatGPT.md`. Each serves as a provider relation that REFER.OS consults when orchestrating intents.

## 1. Agent interaction rules

- Codex interprets `refer.` directives, launches the router (`refer.md`), and obeys the RETURN → COMMIT → PUBLISH loop. Reference this document when describing how Codex should handle new actions or respond to governance updates.
- The CLI and ChatGPT contexts (persistent sessions, CLI-lingering watchers) are considered providers because they supply the environment in which the router executes. Document any expectations (e.g., deferred responses, streaming, CLI watchers) here.

## 2. Variant behaviors

- If a new tooling provider is introduced (e.g., new CLI extension, alternative LLM), add a new subsection explaining how that provider fits into the refer router. Keep cross-links to the canonical reference if the provider requires guard conditions.

## 3. Referential enforcement

- When `refer.build` or `refer.repair` interacts with tooling (build commands, CLI watchers), mention this reference so the router knows to coordinate with Codex’s agent semantics (e.g., release gating, streaming output, guard-level prompts).

<a id="referproviderclimd"></a>

## refer.provider.cli.md

# refer.provider.cli.md — CLI Provider Reference

This document captures the CLI rules from `codex/governance/domains/CLI.md` so REFER.OS knows how the command line interacts with the router.

## 1. CLI behavior

- CLI sessions act as providers that run the refer directives; they expect prompts that begin with `refer.` or `refer.md:` as part of the command. Document the CLI guard rails here so every refer action can be executed via the terminal.
- CLI watchers may start `refer.*` events automatically; ensure context continuity is maintained by keeping the refer session active until you explicitly switch domains.

## 2. Integration

- When a refer action spawns shell commands, mention this reference so the router knows to surface CLI-specific logging, watchers, or environment guards.

<a id="referlocalrepomd"></a>

## refer.localrepo.md

# refer.localrepo.md — Local Repository Reference

This reference describes local repository expectations from `codex/governance/domains/LocalRepo.md`, complementing `refer.github.md` for offline/local workflows.

## 1. Local workspace rules

- Keep the workspace clean before switching contexts; the forward-only lineage rule requires you to commit/stash before branch changes.
- Local repo operations (file scaffolding, local previews) are treated as part of the action’s local edge. Document how to capture RETURN verification for these tasks before pushing changes.

## 2. Integration with refer actions

- When `refer.build`, `refer.repair`, or `refer.expand` perform local repository work (templates, scaffolding, non-Git files), refer to this document so the router knows the tasks are local-only and must still obey RETURN before COMMIT.

<a id="referlawmd"></a>

## refer.law.md

# refer.law.md â€” Governing Laws for REFER.OS

This document captures the core laws that replaced the old E2E protocols (E2E Build Protocol, Execution Flow, Laws, No-Client-DB, etc.) and now govern REFER.OS. Every refer action must stay compliant with these laws before RETURN/COMMIT/PUBLISH can complete.

## 1. No Action Without Reference

- REFER.OS requires every intent to begin with `refer.` or `refer.md:`. The router rejects anything that bypasses this prefixâ€”no unreferenced actions are allowed.
- Identity, structure, relation, and unfolding must all be anchored in the refer.\* documents (`refer.identity.md`, `refer.structure.md`, `inference.md`, `refer.<system>.md`, etc.) before IO happens.

## 2. Single Source of Interpretation

- `refer.md` is the Rosetta Stone (per `refer.os.md` Â§1 and Â§6.2). It classifies the domain, selects the reference files, and enforces the RETURN/COMMIT/PUBLISH sequence.
- No direct instructions to core services/repositories should occur outside the `refer.*` action documents; negotiate through the router even for simple fixes.

## 3. Referential Consistency

- IMSCE (Identity) + ASEDAWSI/EWCPSI (Structure/Workflow) now live inside `refer.identity.md`, `refer.structure.md`, and `inference.md`.
- Every action must verify that the identity definitions, structure mappings, and inference blueprints used match the current serialized references before mutation.

## 3.1 Reverent Execution (Refer Lineage)

- **Refer** is the verb (to point) and the noun (the operating system derived from that verb).
- **Reverent** means compliant with the Refer order: actions only unfold from referenced sources.
- External knowledge is raw material until made reverent; do not act on it directly.
- Canon answers must be sourced from an opened reference in-session. If the reference is not open, the response must be declared secular and the agent must request permission to make it reverent by reading the source.
- Identity is defined by placement/behavior (IMSCE position), not by labels or class names; labels are optional aids.
- If a needed reference is missing or ambiguous, create or update the reference before proceeding.
- Domain shifts are inferred but require explicit confirmation.
- Every unfold must close the loop with RETURN (no drift, no partials, no dangling lineage).

## 3.2 UTF-8 Encoding Law

- All REFER.OS documents and repo docs must be stored as UTF-8 without BOM.
- Do not introduce mixed encodings; normalize files to UTF-8 when touched.

## 3.3 Responsive Integrity (Structure + Safety)

- Use fluid sizing for layout (%, rem, em, clamp(), min(), max()); fixed px widths are allowed only for icons, borders, and hairlines.
- Container-first widths: parents define size; children default to width: 100% and max-width: 100%.
- Flex/grid guard: any flex/grid child that can grow must set min-width: 0 to allow shrinking.
- Text safety: long strings must wrap (overflow-wrap: anywhere; word-break: break-word).
- Media safety: img/video/svg must not overflow (max-width: 100%; height: auto).
- Breakpoints are content-driven; prefer mobile-first with min-width queries.
- Viewport must include width=device-width and initial-scale=1.0.
- Accessibility: tap targets >= 48px, content reflows without loss, keyboard and touch parity.
- Scroll discipline: vertical scrolling is default; horizontal scrolling only for intentional rails; avoid global overflow: hidden.
- IMSCE padding ladder: define tokenized padding per layer with clamp() so small screens compress and large screens breathe.
  - I (Index): clamp(12px, 2.5vw, 28px)
  - M (Modal): clamp(10px, 2.2vw, 24px)
  - S (Section): clamp(8px, 2vw, 20px)
  - C (Card): clamp(8px, 1.6vw, 16px)
  - E (Element): clamp(6px, 1.2vw, 12px)
- Text roles: primary voice is location (IMSCE layer + element type), secondary voice is tag (h1/h2/body/sub).
  - C layer roles: card.h1, card.h2, card.body, card.sub, card.metric-label, card.metric-value.
  - E layer roles: el.action, el.label, el.helper, el.metric.
  - Role mapping: button text => el.action; input label => el.label; input helper/error => el.helper; stat labels => card.metric-label; stat values => card.metric-value; paragraphs => card.body; card titles => card.h2 (or card.h1 when primary).

## 3.4 Semantic UI States (System Meaning)

- Semantic states are explicit labels applied to UI state (error, warning, success, info, link, highlight).
- Components opt into a semantic role when rendering a semantic state; the same component can render neutral or semantic variants.
- Semantic roles map to paired tokens (bg/text/border/icon/ring) derived from the delta semantic deviation layer.
- Semantic meaning must be consistent across layers; only the role changes, not the component identity.

## 4. Micro-law staging

- Micro-laws and emergent governance heuristics belong inside the relevant refer document rather than as standalone files: add a titled paragraph, checklist, or subsection within `refer.law.md`, `refer.knowledge.md`, or the action doc (`refer.build.md`, etc.).
- When a micro-law grows into a broader domain, promote it to a dedicated `refer.<domain>.md` and update `refer.md` so the router can resolve it.
- When the router detects an intent without a documented rule, trigger an interrogatory: notify the prompter, walk through the implications across identity, structure, inference, and related systems, and only after you validate the behavior do we codify the micro-law and resume the action.
- Communication follows â€œChat â†’ Teach â†’ Interrogateâ€: explanations should stay human and short, metaphors align new ideas with known ones, and clarifying questions must cascade logically before any refer action resumes.
- Evolutionary expectation: whenever a more efficient methodology appears, capture it as a new micro-law or refer document, update the router references, and treat the prior version as archived knowledge; REFER.OS must always make room for better practices without losing the lineage.
- Context continuity: Each `refer.` invocation opens a persistent session. The router locks that refer domain until you explicitly authorize a new `refer.<domain>` or state â€œswitch context toâ€¦â€. If an unrelated intent is detected, the router will flag it, suggest starting a new chat, or require an explicit context authorization before proceeding.
- Context alerts: The router surfaces alerts when it detects unauthorized context shifts or undeclared intents so you can acknowledge the switch or invoke the interrogatory; treat those alerts as prompts to confirm the new domain before execution continues.

## 5. Completion + RETURN

- Actions must articulate how RETURN confirms no half-builds, no dangling branches, no drift, and how COMMIT seals the update.
- RETURN gates COMMIT. If RETURN verification fails, the action must abort and re-enter the reference review cycle.

## 6. Systems & Providers must be referenced, not manipulated

- Use `refer.<system>.md` or `refer.provider.<provider>.md` whenever interacting with Angular, Supabase, Cloudflare, Git, etc.
- Avoid embedding direct environment-specific logic inside componentsâ€”reflect the dependency in a systems reference and let effects/services handle the IO.

## 7. Governance Updates

Governance Log

- Added reverent.deltatheme.md to codify delta-driven theme governance (IMSCE layers, vectors, bounds, compliance).
- Added Responsive Integrity law to prevent overflow and enforce fluid, accessible layouts.
- Added IMSCE padding ladder (clamp-based) to standardize responsive spacing per layer.
- Added text role system (IMSCE-first, tag-second) for consistent typography voices.
- Added Semantic UI States (system meaning) for semantic role application.

- `refer.governance` is the only allowed path for editing governance documents. It enforces the seven-step loop described in `refer.os.md` Â§9.
- Governance edits must document the triggering contradiction and the structural/identity reconciliation that justified the change.

## 8. RETURN â†’ COMMIT â†’ PUBLISH

- RETURN: confirm transition stability, run tests/audits, and ensure no structural drift.
- COMMIT: create a message derived from the reference context, obey branch rules (`refer.branch`), and seal lineage.
- PUBLISH: push to canonical remotes, trigger deployments (Cloudflare/Supabase/Docker), and broadcast the updated reference state.

Any deviation from these laws must re-enter the governance update path via `refer.governance`.

<a id="referknowledgemd"></a>

## refer.knowledge.md

# refer.knowledge.md — Preserved E2E Knowledge

This reference preserves the E2E knowledge dump captured in `reports/e2e_knowledge.json` and provides context for future inference/structural decisions; it ties back to `refer.md` and `refer.os.md` so Codex never loses the canonical router connection when consulting archived lessons.

## 1. Legacy knowledge snapshot

- `reports/e2e_knowledge.json` archives insights, lessons, and heuristics from the E2E era. Treat this reference as read-only historical context unless a refer action explicitly re-evaluates those insights.
- When a build or repair references a past pattern (e.g., telechurch broadcast heuristics), cite this knowledge doc so the router understands it’s drawing from archived data.

## 2. Structured reflection

- Summarize key conceptual groupings from the knowledge dump (e.g., guard strategies, deployment heuristics, architecture signals) and note which refer documents currently embody them (`refer.identity.md`, `refer.structure.md`, `inference.md`, `refer.<system>.md`).
- Update this file as we extract knowledge into living references; link out to the new documents to show where the knowledge migrated.

<a id="referogmd"></a>

## refer.og.md

**REFER.OS – Open Graph (OG) System Blueprint (v0.1 Draft)**

---

## 1. Purpose

Make every shareable URL a self-describing object. Internal/external platforms can interpret identity, intent, and visibility without custom share logic. OG is a REFER primitive, not a page-level hack.

---

## 2. Core Principle

- Objects own share identity.
- Pages render share identity.
- REFER governs the mapping.

---

## 3. System Placement (Mind • Body • Spirit)

- **Mind (Workflow / ASEDAWSI)** – resolves which object is in view.
- **Body (UI / IMSCE)** – hosts the `<head>` tags.
- **Spirit (Broadcast / EWCPSI)** – enables external consumers (social/messaging/embeds).

OG lives in the Identity → Projection → Perception lane bridging all three.

---

## 4. Canonical Components

### 4.1 ShareIdentity (Logical Trunk)

```ts
interface ShareIdentity {
  type: "event" | "profile" | "church" | "page" | "media";
  title: string;
  description: string;
  image: string;
  url: string;
  visibility: "public" | "unlisted" | "private";
}
```

- Exists exactly once per object.
- Stored/derived in REFER data (compiler/runtime), never authored in UI/HTML.

### 4.2 Feature Share Projections (Adapters)

- Each shareable table defines how its data maps into `ShareIdentity`.
- Examples: Event → banner + summary; Profile → avatar + display name; Church → logo + mission.
- Pure data mapping, not OG tagging.
- **Rule:** if a table has a canonical URL, it may define a projection.

### 4.3 Central Share Engine

- Resolves `ShareIdentity`.
- Applies fallbacks + length normalization.
- Enforces visibility (no private leakage).
- Ensures ShareIdentity is resolved before HTML is returned (SSR/edge/compiler); OG data is never delayed until client hydration because scrapers do not execute JS.
- May cache ShareIdentity at the REFER runtime layer, but cache invalidation must follow object mutation, not page access.
- Invoked through REFER routing (compiler + runtime service), never manually.
- Sources data from canonical projections (e.g., the `refer_share_identity` view for events) so compiler/runtime surfaces stay in lockstep with Supabase mutations.

### 4.4 Standard OG Shell (Immutable Contract)

Every page renders the same `<head>` fragment:

```html
<meta property="og:type" content="{{share.type}}" />
<meta property="og:title" content="{{share.title}}" />
<meta property="og:description" content="{{share.description}}" />
<meta property="og:image" content="{{share.image}}" />
<meta property="og:url" content="{{share.url}}" />
```

- Identical across routes.
- Never customized per feature.
- Filled dynamically by the Share Engine / compiler materializer.
- Platform-specific extensions (e.g., `twitter:*`) may derive from ShareIdentity but must not introduce new source fields.
- The Share Engine enforces OG image constraints (size/aspect, format) and selects compliant fallbacks.

### 4.5 Route-Level Materialization

1. Router identifies the feature/object.
2. REFER resolves `ShareIdentity`.
3. OG tags inject into `<head>`.
4. External scrapers consume the tags.

Pages just host the tags; REFER decides the content.

> Edge bridge: `refer.build` writes each fragment under `dist/refer-head/<feature>` **and** mirrors the manifest into `wrangler/src/generated/<feature>-head.generated.ts`, so the Cloudflare Worker streams the correct `<head>` for `/events/:id/share` before issuing a meta-refresh/JS redirect back to Angular. Angular's `Meta/Title` wiring remains available as the dev/local fallback.

---

## 4.6 Link Strategy (Telechurch Live)

Telechurch Live currently supports **two link styles**:

- **Shortcodes**: `https://telechurchlive.com/<code>` (canonical for sharing today)
  - Resolved by the shortlink resolver (`shortlink-resolve`).
  - Cloudflare Pages Functions inject OG HTML for bots and `302` humans to the resolved SPA route.
- **SPA deep links**: `https://telechurchlive.com/events/<uuid>` (and similar)
  - Cloudflare Pages Functions inject OG HTML for bots.

### `/share` note (non-canonical helper)

Some legacy/compiler surfaces still use `/events/:id/share` and `/ichurch/:id/share` as “share URLs” (notably `public.refer_share_identity.share_url` currently emits `/events/<id>/share`).

However, the current production sharing flow does **not** require `/share` because OG is already served for:

- `/:code` (shortcodes), and
- `/events/:id` (deep links).

**Future work (simplification option):** if we standardize on shortcodes (or deep links) for all outbound sharing, update ShareIdentity’s `share_url` to point to the canonical URL (e.g., `/events/:id` or the shortcode) and then delete `/share` routes/components/functions that are no longer needed.

## 5. Data Model Alignment

- Core tables stay domain-pure (no OG columns).
- Projections (views/services) derive share-safe data.
- **Rule:** Truth stays in tables, visibility in projections, representation in `ShareIdentity`.

---

## 6. Security & Governance

- Private objects never project.
- REFER enforces access before projection.
- OG rendering is visibility-aware.
- If ShareIdentity cannot be resolved or visibility is not `public`, REFER must emit no OG tags (or a safe generic identity) to avoid leaking data or producing broken previews.
- External platforms cannot scrape beyond intended scope.

---

## 7. Why This Works

- Zero per-platform share logic.
- Zero duplication.
- Immutable head structure.
- Centralized evolution + automatic consistency.
- URL == share object.

---

## 8. Final Law

Every public URL in REFER.OS resolves to exactly one `ShareIdentity`, governed centrally and rendered uniformly.

---

## 9. Caching guardrails (required for reliable previews)

OG works only when external scrapers receive the correct `<head>` tags on the **first response**. For SPAs, that means:

- Do not rely on `404` HTML shells for deep links. Many unfurlers refuse to generate previews on non-2xx, even if OG tags exist in the body. Serve `200` for SPA deep-link shells (and `HEAD` probes), then inject OG tags at the edge.
- Never cache HTML documents (serve `Cache-Control: no-store` for share shells and SPA fallbacks).
- Cache assets aggressively (hashed JS/CSS and static images as `public, max-age=31536000, immutable`).
- Avoid Cloudflare Pages `_headers` patterns that apply `no-store` to `/*` because header merging can poison asset caching.

When OG/share work is involved, cite `REFER.OS/refer.cloudflare.md` and follow its “Document caching doctrine (SPA + OG routes)” section.

<a id="refermigratemd"></a>

## refer.migrate.md

# refer.migrate.md — Migration Action Reference

`refer.migrate` handles schema/data migrations, especially for Supabase, where canonical URL and system relations must remain consistent.

## 1. Migration intent

- **Trigger:** `refer.migrate: <description>` for database changes, Supabase schema updates, or rollout scripts.
- **Purpose:** Coordinate migration steps with Supabase reference docs and ensure RETURN/COMMIT/PUBLISH acknowledges the system impact.

## 2. Migration flow

1. **Relation check:** Review `refer.supabase.md` and the Supabase system relation to understand impacted assets (short URLs, resolvers, etc.).
2. **Planning:** Document the migration plan, rollback strategy, and guard conditions (ensure Supabase service roles/edges remain secure).
3. **Execution:** Apply the migration scripts, verify success via RETURN tests, and log any architectural changes.
4. **Lineage:** Run `refer.commit`/`refer.branch` steps to seal the migration and trigger PUBLISH so the system knows the new schema is live.

## 3. Communication

- Notify dependent teams or providers (Cloudflare, Supabase) about the migration so their caches/relations stay synchronized.

<a id="refermd"></a>

## refer.md

## refer.md - Router for REFER.OS

`refer.md` is the Rosetta Stone router described in `refer.os.md`. Every instruction that touches REFER.OS or the broader E2E lineage is interpreted through a `refer.` directive.

**Inference Duty**: The Architect is not required to type the `refer.` prefix. The Agent is responsible for inferring the correct directive from the Architect's natural language (e.g., "Build this" -> `refer.build`, "Fix that" -> `refer.repair`) and acknowledging the mapping before execution. When a refer context is active, the Agent continues in that context unless a context shift is implied; if a shift is inferred, the Agent acknowledges the new domain and proceeds without forcing a restate. This ensures the system remains governed without forcing the Architect to speak governance.

**App-agnostic boundary**: `refer.*` files only capture routing law and governance. Any TeleChurch or other app-specific requirements, roadmaps, or specs must live in the application docs (e.g., `codex/todo/To_do_list.md`, blueprint maps) with REFER.OS linking to them by reference instead of embedding feature details.

For any time-based behavior (cron, scheduling, recurrence, compiler rules), always reference `REFER.OS/refer.cron.md` as the canonical scheduling doctrine.

## refer.md - The Reference Router

### 0. The Refer Philosophy (Pointer vs. Manifestation)

**Code should Point, not Paint.**
The term "Refer" is literal: To point to a truth that exists elsewhere.

- **The Painter (Anti-Pattern)**: Tries to manifest reality directly in the code (e.g., hardcoding `color: #fff`). This is "Self-Referencing" and brittle.
- **The Librarian (Refer-Pattern)**: Points to the authoritative source (e.g., `color: var(--section-text)`). The code is merely an instruction on _where_ to find the truth (Registry/Theme) and _how_ to apply it (Materialization).

**The Duty**: Never manifest a primitive (color, spacing, rule) if you can refer to a Governance Node. The code is the Weaver; the Reference is the Thread.

### 1. Canonical prefixes & router syntax

Codex always looks for these canonical prefixes before acting so it can route you through the Rosetta Stone:

- `refer.` - the general intent trigger; allowed even in unprimed chats or new repos. Any instruction that begins with `refer.` is routed through the router described in this file.
- `refer.md:` - the explicit Rosetta Stone call that reinforces governance awareness. It still obeys the same routing rules but emphasizes that the instruction is being interpreted through `refer.md`.

All refer directives follow this pattern:

```
refer.<domain>: <action> [context]
```

| Directive                        | Purpose                                                                                | Notes                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `refer.build`                    | Execute a build-like unfold (feature additions, integrations)                          | see `refer.build.md`.                                                                                                              |
| `refer.compiler`                 | Run the compiler pipeline (interpret/materialize/synthesize/broadcast modes)           | governed by `refer.compiler.md` + `refer.compiler.blueprint.md`; usually invoked by `refer.build` but available for targeted runs. |
| `refer.repair`                   | Resolve a defect or failure path and document the restoration                          | see `refer.repair.md`.                                                                                                             |
| `refer.expand`                   | Introduce a new capability or expansion that alters identity/structure                 | attaches to `refer.ontology.md`.                                                                                                   |
| `refer.commit`                   | Seal the unfolding with the commit law (refer.branch).                                 | MUST be paired with reasoning for RETURN.                                                                                          |
| `refer.branch`                   | Manage branch creation, switching, or rollback.                                        | Refer to REFER.OS branch rules.                                                                                                    |
| `refer.migrate`                  | Drive Supabase migrations, schema captures, and rollout.                               | Requires relation to `refer.supabase.md`.                                                                                          |
| `refer.designlab`                | Explore prototypes or experiments before formalizing build work.                       | Document learning in `refer.designlab.md` and stage new identities before promoting to `refer.expand`.                             |
| `refer.plan`                     | Open a dedicated discussion mode to clarify intent before building.                    | Follow `refer.plan.md` to capture context, assumptions, and the efficient next steps.                                              |
| `refer.cli`                      | Execute CLI commands as part of a refer action, keeping shell calls scoped and logged. | `refer.providers.md` describes which CLI commands each refer action may run and how to signal success back into the refer loop.    |
| `refer.governance` / `refer.gov` | Update REFER.OS governance (law, structure, identity).                                 | See `refer.governance.md` for the 7-step path; `refer.gov` is a short-form alias.                                                  |

`refer.build` remains the canonical entry point for feature work, but `refer.compiler` ensures those instructions flow through the Supabase genome + Angular host pipeline described in `refer.compiler.md` and the accompanying blueprint. Use `refer.compiler` when you need to run interpreter/materializer modes directly (e.g., bilateral testing) while still honoring router law.

The router treats Supabase as a Relation with its own canonical URL policy. When `refer.build` introduces media assets or `refer.repair` resolves asset regressions, they must cite `refer.supabase.md` so the action follows the short-canonical-URL resolver described there. Always run `refer.qc.md` before RETURN, COMMIT, or PUBLISH so REFER.OS remains coherent.

### 2. Routing protocol

1. **Referral**: Codex reads the command after `refer.` and selects the target domain (action, law, system, provider).
2. **Reference selection**: The router looks up identity + structure metadata from `refer.ontology.md` to ensure the command is anchored.
3. **Intent unfolding**: The selected action document (`refer.*.md`) defines the required steps, dependencies, and RETURN guardrails.
4. **Completion**: Once the action resolves, RETURN must confirm no drift before COMMIT and PUBLISH.
5. **Evolutionary Inference**: If the Architect's intent (Seed) implies a greater potential (Tree), the router authorizes the Agent to suggest expansions or superior Gifts beyond the prompt. (See `refer.os.md` Principle 10).
6. **Interrogatory for missing references**: If the prompt maps to an intent that lacks a documented rule, the router will pause, notify the prompter, and invite discussion to clarify the desired behavior. We then interrogate how the prompt interacts with identity/structure/inference, inspect system relations, and only after validation codify the micro-law (in `refer.law.md`, `refer.knowledge.md`, or an action doc) before resuming the flow.
7. **Context continuity**: `refer.` invocations establish a persistent context. Once a domain (build, repair, governance, etc.) is active, the router keeps that context alive and continues without re-prompting. If a new message implies a different domain, the router should infer the shift, acknowledge it, and proceed; only ask for clarification when the intent is ambiguous or conflicting. It may suggest a new chat/intent stream if the switch introduces unrelated, parallel work.

### 3. Governance overrides

Governance updates are always expressed through `refer.governance`. They trigger the canonical governance update flow (`refer.os.md` A-9). The router:

- classifies the request as `refer.governance`,
- routes to `refer.law.md` or the appropriate reference file,
- enforces the seven-step path (Reason + Referral + Reference Review + Structural Reconciliation + Identity Reconciliation + RETURN + COMMIT + PUBLISH),
- and rejects any attempt to edit non-governance files without explicit tokens from this flow.

### 4. Extending the router

When REFER.OS needs a new action domain, add:

1. A new `refer.<new>.md` describing the unfolding, dependencies, and RETURN tests.
2. A new row in the directives table so `refer.md` remains the single source of interpretation.
3. Updates to `refer.ontology.md` and `inference.md` if identity or structure definitions shift.

Every change begins with a `refer.` directive. Without it, REFER.OS treats the activity as unreferenced and refuses to execute.

### 5. Context alerts

- When the router detects an intent that would change domains mid-stream, it emits a context alert (for example, "detected `refer.repair` while `refer.build` is active -- please confirm context switch or start a new refer"). Use this alert to either acknowledge the switch, start a new chat/intent stream, or append "switch context to refer.repair:" to the current message so the router tracks the new session explicitly.
- For undocumented prompts the alert will also include the remind-to-interrogate message before codification so you can decide how to proceed without losing the original context.

### 6. Application definitions

REFER.OS is app-agnostic. The specific application running on the OS is defined by its own `refer.<domain>.md` file (e.g., `refer.telechurch.md`).
This file:

1.  Extends `refer.ontology.md` with app-specific identities (`app.features`, `app.core`).
2.  Tracks the app's compiler status and roadmap.
3.  Defines app-specific Cloudflare/Edge rules.

When routing commands relative to the _content_ or _status_ of features, refer to the App Definition.

<a id="referqcmd"></a>

## refer.qc.md

# refer.qc.md — Referential Coherence Engine

REFER.OS treats quality as referential coherence, not just tests. `refer.qc.md` is the gatekeeper that verifies every action before RETURN→COMMIT→PUBLISH runs by ensuring identity, structure, systems, providers, inference, and lineage remain lawful; it always defers to `refer.md`/`refer.os.md` so the checks stay aligned with the router.

## 1. Referential Integrity Checks

- Confirm each action reference maps to real documents (`refer.identity.md`, `refer.structure.md`, `inference.md`, system refs, provider refs).
- Verify no orphan files or missing selectors exist.
- Ensure every identity mentioned in the intent is registered in `refer.identity.md`.

## 2. Structural Integrity Checks

- UI → Workflow → Broadcast mappings exist and ASEDAWSI/EWCPSI flows remain intact.
- Components reference signals/selectors described in `refer.structure.md`.
- Broadcast/realtime contracts resolve to documented channels.

## 3. Lineage Integrity Checks

- Working tree is clean before builds/branches/publish.
- No branches originate from older commits—forward-only branching must hold.
- RETURN inspections have run and noted no drift or deleted features.
- Missing commits are detected and reintroduced via forward fixes.

## 4. System Integrity Checks

- Cloudflare/Supabase/Docker configs align with `refer.<system>.md`.
- Environment variables, CLI auth, edge functions, and migrations are referenced and validated before-call.
- Large assets were sized per `refer.build`’s asset guard.

## 5. Provider Integrity Checks

- Optional providers (Stripe, Twilio, Resend, Daily) have their references and credentials ready.
- Canonical URLs and fallback behaviors match `refer.supabase.md`.
- Provider updates never violate the referred guardrails.

## 6. Inference Integrity Checks

- Unfolded features follow the inference paths described in `inference.md`.
- No new structure is created without identity/inference/regression approval.
- Every inference step is logged so drift can be traced.
- QC owns the blueprint/inference/repo sync loop; regenerate `codex/maps/*.json` when drift is detected and log the sync in `refer.todo.md` and this file.

## 7. RETURN Integrity Checks

- Build, repair, expand, migration actions finish without loose ends.
- Guards/policies executed, signals settled, and no lingering documents remain unreferenced.
- Blueprint + inference maps refreshed (regenerate `codex/maps/*.json` if the feature touched structure) before handing off to COMMIT.

## 8. COMMIT Integrity Checks

- Commit message references the refer action and obeys `refer.github.md`.
- Branch rules respected, forward-only lineage confirmed, no rewrites/stashes remain.

## 9. PUBLISH Integrity Checks

- Deployments (git push, Cloudflare worker, Supabase function, Docker image) succeed or report precise rollback-free fixes.
- Environment sync recorded, no drift reported.

## 10. Activation points

- Run this checklist after every build/repair/branch/migrate, before commit/publish, after governance updates, and whenever you suspect drift.
- Codex/agents must pause if any check fails, trigger the interrogatory, and only continue after you approve the fix.

## Decision Log

- Build: Instant Church lower nav bar structure/styling in `src/app/features/ichurch/B-IC1S1.component.ts`, UI-only, no new identities/inference updates; system ref `REFER.OS/refer.angular.md`.
- Publish: Cloudflare Pages deploy for `telechurchlive` (SPA build + 404 fallback) per `REFER.OS/refer.cloudflare.md` and `apps/telechurch/refer.telechurch.cloudflare.md`; cache purge failed because `CLOUDFLARE_ZONE_ID_TELECHURCH` is not set in `.env.master`.
- Publish: Cloudflare cache purge succeeded for `telechurchlive` after setting `CLOUDFLARE_ZONE_ID_TELECHURCH` per `REFER.OS/refer.cloudflare.md`.
- Publish: Cloudflare Pages deploy for `telechurchlive` with `/events` mobile centering/wrapping fix per `REFER.OS/refer.cloudflare.md` and `apps/telechurch/refer.telechurch.cloudflare.md`.
- Publish: Cloudflare Pages deploy for `telechurchlive` + zone cache purge executed locally per `REFER.OS/refer.cloudflare.md`; purge required legacy `CLOUDFLARE_EMAIL`/`CLOUDFLARE_API_KEY` because the scoped token is forbidden for purge.
- Publish: Removed Angular Service Worker (SW) registration and build config; deployed `telechurchlive` via Cloudflare Pages per `REFER.OS/refer.cloudflare.md` and `apps/telechurch/refer.telechurch.cloudflare.md`.

<a id="reverentdeltathememd"></a>

## reverent.deltatheme.md

# reverent.deltatheme.md - Delta Theme Governance (Reverent)

Purpose

- Define the delta-driven theme model that derives all layer tokens from a single base.
- Make theme behavior auditable (compliance vs violation) and consistent across IMSCE layers.

Scope

- Applies to UI theming where a single base color (Modal) is shifted by declared deltas.
- Governs the 5-layer IMSCE stack: Index -> Modal -> Section -> Card -> Elements.

Model

- Base: Modal (layer 2) provides the chromatic anchor.
- Deltas: Each lower layer applies a fixed vector shift to the base.
- Vectors are declared, not inferred. No ad-hoc drift.

Vector axes (6)

- dL: lightness shift
- dHue: hue rotation shift
- dChroma: saturation magnitude shift
- dTemp: warm/cool bias shift
- dNeutral: pull toward gray shift
- dContrast: text contrast pressure shift

Layer rules

1. Index: Neutral anchor (no color shift).
2. Modal: Base color (delta = [0,0,0,0,0,0]).
3. Section: Delta applied from Modal.
4. Card: Delta applied from Modal (stronger than Section).
5. Elements: Delta applied from Modal (focus, borders, readable text).

Compliance rules

- Each layer has declared delta bounds. A layer is compliant if all 6 axes stay within bounds.
- Alt cards must stay within the same bounds as primary cards (content pressure cannot change deltas).
- Violations must surface the first offending token and axis.

Token mapping (concept)

- Each layer maps to concrete tokens (surface, text, border, button, focus).
- Example mapping (not exhaustive):
  - Section -> --refer-s-surface, --refer-s-text, --refer-s-border
  - Card -> --refer-c-surface, --refer-c-text, --refer-c-border
  - Element -> --refer-e-button-surface, --refer-e-text, --refer-e-focus

Non-goals

- No per-org/per-user runtime variation in this phase.
- No database dependency; deltas live in static config until proven necessary.

Implementation notes (for later)

- The model may be wired into Designlab or Honeycomb, but governance is independent of tooling.
- Honeycomb modification is optional; enforcement can be done at build-time.

Semantic deviation layer (system meaning)

- Semantic roles (error, warning, success, info, link, highlight) are computed as a deviation layer from the Modal base, not a separate palette.
- Components select a semantic role; the system derives paired tokens for background/text/border/icon/ring.
- Derived tokens (per role):
  - --refer-sys-<role>-bg
  - --refer-sys-<role>-text
  - --refer-sys-<role>-border
  - --refer-sys-<role>-icon
  - --refer-sys-<role>-ring
- Guardrail (embedded in deviation):
  - If semantic hue is too close to base hue or contrast fails, shift/invert the semantic deviation until contrast passes.
  - Always derive text from background to guarantee contrast; never use a role background without its paired role text.

<a id="refertodomd"></a>

## refer.todo.md

# refer.todo.md — Meta-Registry of Intent

This is the canonical register for the "Will" of REFER.OS. It coordinates the various Domain Backlogs ensuring all natural language intent is trapped and mapped to governance.

## 1. Domain Backlogs (The Lanes)

The AI (Agent) is responsible for routing natural language requests (e.g., "Build this," "Fix that") to the appropriate domain backlog.

| Domain             | Backlog Reference                        | Status |
| :----------------- | :--------------------------------------- | :----- |
| **Governance**     | `REFER.OS/refer.governance.md`           | Active |
| **Telechurch**     | `REFER.OS/todo/refer.todo.telechurch.md` | Active |
| **Compiler**       | `REFER.OS/refer.compiler.md`             | Active |
| **Bedrock/Memory** | `REFER.OS/refer.supabase.md`             | Active |

## 2. The AI Inference Duty

To eliminate friction and prevent redundant rewrites, the Agent performs the following "Handshake" automatically:

1.  **Verb Mapping**: Detects user verbs (`fix`, `build`, `update`, `schedule`) and selects the correct `refer.*` document.
2.  **Contextual Anchor**: Scans the active **Domain Backlog** for existing threads to prevent "re-invention."
3.  **DNA Materialization**: Extracts the codified intent (DNA) and materializes it according to the **Blueprint** and **Inference**cadence.

## 3. Workflow Notes

- Every `refer.plan` must eventually result in an entry in a Domain Backlog or an immediate execution.
- High Immediacy items are promoted to the active session ledger (`task.md`) for materialization.

<a id="refertestsmd"></a>

## refer.tests.md

# refer.tests.md — Test Reference for REFER.OS Actions

Tests live alongside the referential audit (`refer.qc.md`) to prove that the technical implementation matches the scoped intent.

## 1. What to run

- `npm run lint` / `ng lint` — catches template/type issues that violate Angular/IMSCE constraints.
- `npm run test` (unit) and `npm run test:ci` (if available) — confirm guards/services respond to intents.
- `npm run build` or `npm run prod` — ensures the final bundle respects the `REFER.OS` layout and bundles correctly before deployment.
- `npm run policy:check` — enforces the legacy guard rails that now reference refer docs.

Include any app-specific smoke tests or API integration suites that the feature touches (e.g., hitting Supabase Edge functions or Cloudflare workers) and log the commands/results in `refer.qc.md` under RETURN/COMMIT lists.

## 2. How it fits with refer.qc

`refer.qc.md` remains the semantic guard, while `refer.tests.md` gives you the practical commands to run before RETURN. After tests pass, record their outputs/links in `refer.qc.md` so the COMMITS/PUBLISH steps know the code has been executed successfully.

## 3. Logging

- Note the test commands and results in your action logs or `build_tracker.yaml` before invoking `refer.commit`; this keeps the audit trail complete for future reviews.

<a id="todorefertodotelechurchmd"></a>

## todo\refer.todo.telechurch.md

# refer.todo.telechurch.md — Telechurch Intent Register

This register tracks Telechurch-specific build threads, mapping intensities to cascades and next intents.

## High Immediacy

| Feature Thread                            | Trigger                                 | Cascade                                                        | Next Intent / Effect                          | Refs                         |
| ----------------------------------------- | --------------------------------------- | -------------------------------------------------------------- | --------------------------------------------- | ---------------------------- |
| Standalone events store + /events surface | Finalize route plan + store scaffolding | Enables RSVP/reminders/likes + social metadata and embed modes | Define EventsIntent.Load/Share + signal store | codex/todo/To_do_list.md:20  |
| Adaptive live auto-switching              | Daily + OBS provider contracts          | Unlocks billing metrics, moderator controls                    | Emit LiveIntent.MetricPulse                   | codex/todo/To_do_list.md:3   |
| Giving categories + recipient registry    | Stripe Connect schema                   | Allows new giving modal, per-person payouts                    | Draft GivingIntent.ConfigureCategory          | codex/todo/To_do_list.md:63  |
| System Repairs (Profile save, PWA, chat)  | Confirm regression cause                | Stabilizes UX audits                                           | File RepairIntent.ProfileSave                 | codex/todo/To_do_list.md:132 |

## Cascade Amplifiers

| Feature Thread                           | Trigger                       | Cascade                                     | Next Intent / Effect               | Refs                                  |
| ---------------------------------------- | ----------------------------- | ------------------------------------------- | ---------------------------------- | ------------------------------------- |
| RSVP + reminders + likes                 | Events store shipping         | Powers trending events, notification system | Add InteractionsIntent.RSVP        | codex/todo/To_do_list.md:44           |
| Header/topbar standardization            | Canon menu agreed             | Consistent navigation UX                    | Draft TopbarIntent.Open/Close      | codex/todo/To_do_list.md              |
| Single-stream notification (email + SMS) | refer.singlestream plan ready | Consolidates receipts, invites              | Implement NotificationIntent.Queue | codex/todo/refer.singlestream.todo.md |

## Ecosystem Boosters

| Feature Thread                    | Trigger          | Cascade                                   | Next Intent / Effect          | Refs                     |
| --------------------------------- | ---------------- | ----------------------------------------- | ----------------------------- | ------------------------ |
| Apostle SVG companion ("Apostle") | Art brief ready  | Keeps assistant present across onboarding | Define ApostleIntent.Pose     | codex/todo/To_do_list.md |
| In-app Bingo (engagement)         | Confirm v1 order | Adds meeting engagement loop              | Draft BingoIntent.Create/Join | codex/todo/bingo.md      |

<a id="referalphabetioreferalphabetmd"></a>

## refer.alphabet.io\refer.alphabet.md

MODE: STRICT_DECODER_ONLY
INFERENCE: DISABLED

STATUS: DEPRECATED (use refer.alphabet-v2.md)

This v1 document is retained for historical reference only.
All active encoding/decoding MUST use refer.alphabet-v2.md.

DECODER-MODE ENFORCEMENT HEADER (MANDATORY)

This document defines a deterministic decoding system.
When interpreting numeric streams governed by this specification, the decoder MUST operate in STRICT DECODER MODE.

Decoder Mode Requirements

1. NO INFERENCE
   - Do not guess words.
   - Do not complete phrases.
   - Do not use linguistic plausibility.
   - Do not assume intent.
2. TOKEN-BY-TOKEN PARSING ONLY
   - Parse the stream strictly left to right.
   - Respect declared base + position boundaries.
   - Apply control tokens exactly as defined.
3. NO SEMANTIC HEURISTICS
   - Meaning is external to the codec.
   - Familiar language patterns are irrelevant.
   - Only decoded symbols may appear in output.
4. NO ERROR CORRECTION
   - Do not fix malformed streams.
   - Invalid tokens must be reported, not repaired.
   - Ambiguity must be surfaced, not resolved.
5. CAPS / CONTROL TOKENS ARE NOT MODES
   - Control tokens affect only their declared scope.
   - No implicit state or persistence is allowed.
6. LLM COMPLETION IS DISALLOWED
   - Natural language prediction must be disabled.
   - Output must be derivable entirely from the stream.
   - If decoding cannot proceed, halt and report.

Compliance Rule
If a decoder cannot guarantee strict behavior, it must refuse to decode rather than infer.

refer.alphabet.md

Universal Base-Position Encoding Specification (Complete)

This is the single source of truth for REFER.ALPHABET (expanded layer). No external alphabet docs are required.

This document is the single, self-contained specification for REFER.ALPHABET.
It includes the core mapping, protocol rules, mirror fallback, punctuation, audio protocol, and architecture note.

1. Overview

REFER.ALPHABET is a reversible, deterministic base-position codec for alphabetic symbols.
It encodes sound structure as a numeric stream using binary base tokens and decimal position digits.

Principles:

- Deterministic: same input yields the same stream.
- Reversible: decoding reconstructs the original text.
- Validatable: invalid tokens are detectable.
- Domain-agnostic: meaning is external to the codec.

2. Character Set (v1.0)

The initial version encodes the 26 letters of English:

abcdefghijklmnopqrstuvwxyz

Normalization:

- convert to lowercase
- strip diacritics
- preserve a-z, space, and punctuation (defined below)

3. Structure of Letter Codes

Each letter is a pair:

BASE token (binary):
0
1
01
10
11
00 (reserved for punctuation)

POSITION digit (decimal):
2 3 4 5 6 7 8 9

Parsing rule:
Read 0/1 digits until the next 2-9 digit. The 0/1 run is the base, the 2-9 digit is the position.

4. Capacity

Base tokens: 6
Position digits: 8
Total possible codes: 48

5. English Letter Mapping (v1.0)

0-2 = e
0-3 = t
0-4 = a
0-5 = o
0-6 = i
0-7 = n
0-8 = s
0-9 = r

1-2 = h
1-3 = l
1-4 = d
1-5 = c
1-6 = u
1-7 = m
1-8 = f
1-9 = p

01-2 = g
01-3 = y
01-4 = b
01-5 = w
01-6 = v
01-7 = k
01-8 = x
01-9 = j

10-2 = q
11-2 = z

6. Phonetic Canon (Reference Only)

Phonetics are a quality/annotation layer and do not override TEXT decoding.
They apply only when MODE explicitly requests phonetic output.

Vowels (Base 0):
A -> 0-2
I -> 0-3
E -> 0-4
O -> 0-5
U -> 0-6

Consonant roots:
Ta -> 1-2
Pa -> 1-3
Ka -> 1-4
Na -> 1-5
Ma -> 1-6
Ra -> 1-7
La -> 1-8
Sa -> 1-9
Fa -> 01-2
Ja -> 01-3
Ha -> 01-4
Wa -> 01-5
Ya -> 01-6

7. Control and Direction Tokens

Direction header (first token only):
10-3 = LTR
10-4 = RTL
10-5 = TOP->BOTTOM
10-6 = BOTTOM->TOP
10-7 = SPIRAL_IN
10-8 = SPIRAL_OUT
10-9 = MULTI_AXIS (requires MIRROR fallback)

Control block:
11-3 = VERSION (next token carries version digit)
11-4 = MODE (next token selects interpretation mode)
11-5 = CHECKSUM (next token carries checksum digit)
11-6 = LENGTH (next token carries payload length digit)
11-7 = CHANNEL (next token carries channel id)
11-8 = CAPS_NEXT (capitalize next letter)

Notes:

- Direction headers are optional and must be first if present.
- TEXT is the strict default. Phonetic output only applies when MODE requests it.

Example:
LTR + "wa " -> 10-3 01-5 0-2 11-9
Stream: 10301502119

8. Word Boundary Token

11-9 = <SPACE>

9. Punctuation (Base 00)

00-2 = .
00-3 = ,
00-4 = ?
00-5 = !
00-6 = :
00-7 = ;
00-8 = <PARAGRAPH>
00-9 = <LINE_BREAK>

Caps Control

11-8 = CAPS_NEXT (capitalize next letter)

10. Encoding Process

Steps:

1. Normalize text.
2. Replace spaces with <SPACE>.
3. Convert each symbol via mapping table.
4. Concatenate base+position pairs into a digit stream.

Example:
love -> l o v e -> 13 05 016 02 -> 130501602

11. Decoding Process

Steps:

1. Parse base runs of 0/1 until a 2-9 digit appears.
2. Validate base token is in the allowed set.
3. Convert (base, position) to TEXT by default.
4. If MODE requests phonetic output, project onto the phonetic canon.

12) MIRROR MODE (Directional Fallback)

Purpose:
Resolve direction only when no explicit direction header is present.

Process:

1. Parse stream forward and reverse.
2. Score alignment (token identity up to reversal, vowel/consonant ratio, entropy).
3. Choose the direction with the best score.
4. Apply MODE if present; otherwise default to TEXT.

13) Binary Variant

Position digits map to 3-bit codes:
2=000 3=001 4=010 5=011 6=100 7=101 8=110 9=111

Thus a letter becomes:
BASE + 3-bit POSITION

14. Error Detection

Invalid if:

- base token ends with no position digit
- position digit outside 2-9
- base token not in allowed set
- code not in mapping table (given MODE)

15. Audio Protocol (Summary)

Signal structure:
BASE -> carrier frequency
POSITION -> duration
AMPLITUDE -> emotional intensity
ATTACK/DECAY -> envelope shaping

FSK mapping:
0 -> 1800 Hz
1 -> 900 Hz
01 -> 1200 Hz
10 -> 600 Hz
11 -> 300 Hz

Duration:
2=20ms ... 9=90ms

16. Architecture (Recommended)

RUST CORE ENGINE
|
v
RUST SIGNAL ENGINE
|
v
PYTHON HARMONY ENGINE
|
v
WASM BRIDGE
|
v
TYPESCRIPT UI

Notes:

- CORE is deterministic (parsing, tokens, flags).
- SIGNAL is numeric/physical (frequency, duration, DSP).
- HARMONY is probabilistic (entropy, mirror scoring).
- UI is presentation and tooling.

<a id="referalphabetioreferalphabet-v2md"></a>

## refer.alphabet.io\refer.alphabet-v2.md

# refer.alphabet-v2.md

Status: Draft v2 (identity crochet line with harmonic landmarks)  
Mode: STRICT_DECODER_ONLY  
Inference: Disabled (decoder executes only declared rules)
Encoding: UTF-8 (render with a Unicode-capable font for IPA and math symbols)

---

## 0.5 Strict decoder requirements (normative)

When interpreting streams governed by this specification, the decoder MUST operate in STRICT DECODER MODE:

1. NO INFERENCE
   - Do not guess words or complete phrases.
   - Meaning is external to the codec.
2. TOKEN-BY-TOKEN PARSING ONLY
   - Parse strictly left to right using the declared token grammar.
   - Apply modifiers exactly as defined.
3. NO ERROR CORRECTION
   - Do not repair malformed streams.
   - Invalid tokens must be reported, not fixed.
4. NO IMPLICIT MODES
   - Modifiers affect only their declared scope and do not persist.
5. LLM COMPLETION IS DISALLOWED
   - Output must be derivable entirely from the stream.
   - If decoding cannot proceed, halt and report.

Compliance rule: If strict behavior cannot be guaranteed, the decoder must refuse to decode.

## 0. Purpose

REFER.ALPHABET v2 defines a compact, deterministic alphanumeric alphabet for encoding and decoding text into a single stream that is:

- Unambiguous to parse
- Efficient to store and transmit
- Structurally analyzable as a waveform
- Extensible via namespaces without breaking backward compatibility

This v2 is an upgrade over earlier REFER drafts that used mixed base markers and multi digit separators. v2 prioritizes:

- A single structural namespace rooted at `0x`
- A compact computational namespace for identity tokens
- Rare, meaningful harmonic landmarks that shape the stream

---

## 1. Principles

### 1.1 Determinism

Given the same input and the same map, encoder output is identical, and decoder output is identical.

### 1.2 Single ribbon

There is exactly one authoritative stream. Do not duplicate semantics across parallel namespaces. Example: comma and period exist in exactly one place in v2.

### 1.3 Phase aware structure

The alphabet is designed to reveal rhythmic and structural properties when plotted, without requiring semantic interpretation.

### 1.4 Minimal structural overhead

Structural tokens are short and sparse. Space is `00` and is the only structural separator required for word boundaries.

---

## 2. Token grammar

### 2.1 Token shapes

There are two token shapes in v2.

#### A) Structural token, 2 digits

- `00` space
- `09` capitalization prefix (applies to next letter)

#### B) Computational token, 3 characters

- `BBS`
  - `BB` is the base, two digits
  - `S` is the slot, one character

Slots are `1` through `7`. Slot `0` is reserved and invalid in computational tokens except Base `08`, which uses slot `0` for digit `9`.
Base `08` also extends slots to allow `A` through `F` for math operators.

### 2.2 Parsing rule (strict)

Decode left to right.

1. Read two digits.
2. If they are `00`, emit SPACE and advance 2.
3. If they are `09`, set `CAP_NEXT = true` and advance 2.
4. Otherwise interpret them as a base `BB`. Read one more character for slot `S`.
5. Validate `BB` in allowed set and `S` in `1..7` (or `0` and `A..F` when `BB` is `08`).
6. Emit mapped symbol and advance 3.

This makes the stream parseable without separators and without ambiguity.

---

## 3. Namespaces

### 3.1 Structural namespace `0x`

- `00` SPACE
- `09` Capitalization prefix (applies to next decoded letter)
- Other `0x` values are reserved for future structural operators

Important: `09` is a prefix, not a character. It modifies the next decoded letter.

### 3.2 Computational namespace `01..09`

Computational bases are `01` through `09`. Each base has slots `1..7`.
Base `08` also uses slot `0` for digit `9` and slots `A..F` for math operators.

Total computational positions: `9 * 7 = 63`.

v2 uses 26 letters plus punctuation, symbols, IPA-only vowel sounds, and literal numbers/operators embedded in the computational space.

---

## 4. Harmonic landmarks

v2 embeds two landmarks globally, once each in the computational grid.

- Period landmark: `01.1` which serializes to `011`
- Comma landmark: `03.4` which serializes to `034`

These serve two jobs:

1. They can encode punctuation in text.
2. They act as phase landmarks in waveform analysis.

Rule: Do not duplicate comma or period in any other namespace.

---

## 5. Identity crochet line map

This is the v2 authoritative identity map.

Design intent:

- Air and minimal constriction are higher (earlier bases)
- Articulation is centered
- Friction is intermediate
- Closures are lowest
- Vowel flow is woven top to bottom in this order: I, E, A, O, U
- W is placed in the closure band because it is labiovelar and rounds like U

### 5.1 Map table

Base 01 (high air)

- `011` = `.`
- `012` = I
- `013` = E
- `014` = H
- `015` = Y
- `016` = F
- `017` = S

Base 02 (articulation)

- `021` = A
- `022` = L
- `023` = R
- `024` = M
- `025` = N
- `026` = V
- `027` = Z

Base 03 (friction and edge)

- `031` = O
- `032` = C
- `033` = X
- `034` = `,`
- `035` = J
- `036` = Q
- `037` = U

Base 04 (closures and stops)

- `041` = W
- `042` = P
- `043` = B
- `044` = T
- `045` = D
- `046` = K
- `047` = G

Base 05 (symbols / structure)

- `051` = `(` open group
- `052` = `)` close group
- `053` = `[` open set
- `054` = `]` close set
- `055` = `{` open block
- `056` = `}` close block
- `057` = `<` open scope
- `058` = `>` close scope
- `059` = `<LINE_BREAK>`

Base 06 (punctuation)

- `061` = `?` inquiry / unresolved state
- `062` = `!` emphasis / force spike
- `063` = `:` expansion follows
- `064` = `;` parallel continuation
- `065` = `'` possession / contraction
- `066` = `"` quotation / frame
- `067` = `-` binding / compound

Base 07 (IPA-only vowel sounds; no letter forms)

- `071` = `?` short E (IPA open-mid front unrounded vowel)
- `072` = `?` short I (IPA near-close near-front unrounded vowel)
- `073` = `�` short A (IPA near-open front unrounded vowel)
- `074` = `?` short O (IPA open back rounded vowel)
- `075` = `?` short U (IPA near-close near-back rounded vowel)
- `076` = reserved
- `077` = reserved
- `078` = reserved
- `079` = reserved

Base 08 (numbers and math symbols)

- `081` = `0`
- `082` = `1`
- `083` = `2`
- `084` = `3`
- `085` = `4`
- `086` = `5`
- `087` = `6`
- `088` = `7`
- `089` = `8`
- `080` = `9`
- `08A` = `+` addition
- `08B` = `-` subtraction
- `08C` = `�` multiplication
- `08D` = `�` division
- `08E` = `=` equality
- `08F` = `%` modulo / percent

### 5.2 Notes on compound letters

Some Latin letters represent multiple phonetic outcomes in English. v2 keeps a single canonical identity token per letter. Alternative vowel sounds without letter forms are handled via Base 07 IPA-only symbols when needed.

Examples:

- C can realize as hard or soft
- G can realize as hard or soft
- X can realize as composite (K + S) like behavior in many contexts

v2 does not expand the base alphabet for these. These are overlays.

---

## 6. Modifiers

### 6.1 Space

- SPACE is always `00`.

### 6.2 Capitalization `09`

Capitalization applies to the next decoded letter only.

Serialization:

- `09` then a 3 character letter token

Example:

- `09 047` decodes to `G`

Decoder behavior:

- Set a one shot flag `CAP_NEXT = true`
- Decode next letter
- If flag set, uppercase it, then clear the flag

### 6.3 IPA-only symbols (Base 07)

IPA-only vowel sounds are encoded as literal symbols using Base 07 and do not act as modifiers.
They are used when a sound has no single-letter English form (for example, short E as `?`).

---

## 7. Encoding algorithm

Input: Unicode string  
Output: REFER v2 stream

1. Normalize
   - Normalize to NFC
   - Convert tabs and repeated whitespace to single spaces
   - Preserve punctuation characters that you intend to encode
   - Strip diacritics only if your input source requires it (do not strip IPA)

2. Tokenize
   - Iterate characters left to right
   - Emit `00` for spaces
   - Emit capitalization prefix `09` for uppercase letters, then encode letter as if lowercase
   - Emit the letter token for A-Z using the map table
   - Emit symbols, punctuation, IPA-only vowels, numbers, and math operators using Bases 05-08
   - For unsupported characters, choose one of:
     - reject with error
     - map to a reserved future namespace
     - pass through a literal mode that is not enabled in STRICT_DECODER_ONLY

3. Output
   - Stream is a concatenation of tokens
   - You may include optional whitespace between tokens for readability, but canonical transport is compact concatenation

---

## 8. Decoding algorithm

1. Initialize output buffer and modifier flags
2. Parse strictly left to right using token grammar
3. Apply modifiers
   - Space inserts a space character
   - Capitalization uppercases the next letter only
   - IPA-only symbols decode as literal IPA characters

4. Errors
   - Unknown base
   - Invalid slot
   - Dangling prefix (09 without a subsequent letter token)
   - Invalid characters outside 0-9 and allowed A-F slots

All errors must be reported, not repaired.

---

## 9. Waveform mapping

REFER v2 is designed so the token ribbon can be plotted.

### 9.1 Coordinates

Given a token `BBS`:

- base index: `b = int(BB)` in {1..9}
- slot: `s = int(S)` in {1..7}, or `0` when `BB` is `08` for digit 9, or `A..F` mapped to {8..13} when `BB` is `08`

Define a scalar height:

- `y = b * BW + s`

Where `BW` is base weight. Recommended `BW = 10` for separation.

Space `00` is a horizontal gap. Capitalization `09` is an event marker.

### 9.2 Landmarks

- Period `011` acts as a hard stop
- Comma `034` acts as a hinge

In signal analysis:

- Treat `011` as a boundary event
- Treat `034` as a soft boundary or phase pivot

---

## 10. Examples

### 10.1 Micro example

Text:

- `In,`

Tokens:

- I = `012`
- n = `025` (N)
- comma = `034`

Stream:

- `012025034`

If `I` is uppercase:

- `09 012 025 034` which compacts to `09012025034`

### 10.2 Phrase example

Text:

- `In the`

Stream:

- `01202500 044014013` (T H E)
  Compact:
- `01202500044014013`

---

## 11. Genesis 1:1-5 test vector policy

Genesis streams are long. Treat them as integration tests, not human readable samples.

Rules:

- Use `00` for spaces
- Use `011` and `034` for period and comma only
- Do not introduce a separate punctuation namespace for these

This file does not embed the full Genesis 1:1-5 KJV stream to avoid version churn while the identity line is still being tuned. Generate test vectors from your canonical Bible table and store them as fixtures in a test directory, not inside this spec.

---

## 12. Migration from earlier REFER drafts

Common v1 patterns:

- Space encoded as an older token like `11-9`
- Variable base prefixes like `10-3`
- Punctuation in a separate namespace

v2 migration approach:

1. Decode v1 to plain text using v1 rules
2. Re encode into v2 using this map
3. Store both streams during transition if you need verification
4. Once verified, drop v1 streams

---

## 13. Implementation checklist

- Decoder: strict parser with token shapes and error reporting
- Encoder: normalization and mapping with modifiers
- Test fixtures: round trip tests for:
  - simple phrases
  - punctuation with comma and period
  - capitalization
  - long paragraphs
- Visualizer: waveform plot using y mapping and landmark events

---

## 14. Appendix A: Single source of truth map (copy friendly)

SPACE

- `00`

LANDMARKS

- `011` period
- `034` comma

LETTERS

- `012` I
- `013` E
- `014` H
- `015` Y
- `016` F
- `017` S
- `021` A
- `022` L
- `023` R
- `024` M
- `025` N
- `026` V
- `027` Z
- `031` O
- `032` C
- `033` X
- `035` J
- `036` Q
- `037` U
- `041` W
- `042` P
- `043` B
- `044` T
- `045` D
- `046` K
- `047` G

SYMBOLS

- `051` (
- `052` )
- `053` [
- `054` ]
- `055` {
- `056` }
- `057` <
- `058` >
- `059` <LINE_BREAK>

PUNCTUATION

- `061` ?
- `062` !
- `063` :
- `064` ;
- `065` '
- `066` "
- `067` -

IPA-ONLY VOWELS

- `071` ?
- `072` ?
- `073` �
- `074` ?
- `075` ?

NUMBERS

- `081` 0
- `082` 1
- `083` 2
- `084` 3
- `085` 4
- `086` 5
- `087` 6
- `088` 7
- `089` 8
- `080` 9

MATH

- `08A` +
- `08B` -
- `08C` �
- `08D` �
- `08E` =
- `08F` %

MODIFIERS

- `09` capitalize next letter
- IPA-only symbols are literal Base 07 tokens

---

## 15. Appendix B: Optional transport notes (non-normative)

Binary/bit-packing variant (optional):

- Bases `01..09` can be encoded as 4-bit values.
- Slots `1..7` can be encoded as 3-bit values.
- Base `08` slots `A..F` can be mapped to values 8..13.
- This is a transport optimization only; it does not change the canonical stream.

Audio protocol (legacy, codec-agnostic):

- BASE -> carrier frequency
- SLOT -> duration
- AMPLITUDE -> emotional intensity
- ATTACK/DECAY -> envelope shaping

Architecture (recommended):
RUST CORE ENGINE -> RUST SIGNAL ENGINE -> PYTHON HARMONY ENGINE -> WASM BRIDGE -> TYPESCRIPT UI

---

<a id="universalstatesmd"></a>

## UNIVERSAL_STATES.md

# REFER.OS Universal State List ♾️

## Purpose

This document defines the **Universal Physics** of REFER.OS.
These states apply to **Every Application** in the ecosystem.

## 1. App Architecture States (The 3D Grid)

**Universal Truth**: Every app exists in these stages of Materialization (Z-Axis).

| State ID         | Analysis  | Description                       | Transition       |
| ---------------- | --------- | --------------------------------- | ---------------- |
| `A000_SEED`      | **Soil**  | No blueprint exists. Pure Intent. | → A001           |
| `A001_BLUEPRINT` | **Root**  | `blueprint.map.json` initialized. | → A100           |
| `A100_DOMAIN`    | **Root**  | Domain Node defined (Identity).   | → A200/A300      |
| `A200_BEDROCK`   | **Root**  | Database Schema defined.          | → A201 (Migrate) |
| `A300_BARK`      | **Trunk** | UI Node defined (Identity).       | → A301 (Code)    |
| `A400_SAP`       | **Trunk** | Workflow/Service defined (Flow).  | → A401 (Code)    |
| `A999_FRUIT`     | **Yield** | Feature is Live and yielding.     | → [New Cycle]    |

## 2. Visual Intent States (The Lens)

**Universal Truth**: The Object is constant; the **Lens** determines the form.

| State ID          | Intent         | Archetype     | Description                                |
| ----------------- | -------------- | ------------- | ------------------------------------------ |
| `V000_VOID`       | **Invisible**  | `Hidden`      | Data exists but is unseen (Backend).       |
| `V100_GLANCE`     | **Identify**   | `Card/Chip`   | High-level summary. Key metrics only.      |
| `V200_SCAN`       | **Compare**    | `List/Grid`   | Many objects side-by-side. Sortable.       |
| `V300_EXAMINE`    | **Understand** | `Detail/Page` | Deep dive into a single object. Read-only. |
| `V400_CONTRIBUTE` | **Modify**     | `Form/Modal`  | Interactive inputs. Write access.          |
| `V500_GUIDE`      | **Onboard**    | `Wizard/Step` | Guided sequence of actions.                |

## 3. Technology Carrier States (The Vehicle)

**Universal Truth**: The Intent determines the **Weight** of the Carrier.

| State ID         | Weight      | Carrier Type | Example                                         |
| ---------------- | ----------- | ------------ | ----------------------------------------------- |
| `T100_NATIVE`    | **Feather** | `HTML/CSS`   | `<ul>`, `<table>`, `<span>`. No logic.          |
| `T200_COMPONENT` | **Paper**   | `Framework`  | Angular Component, React Function. Local state. |
| `T300_MODULE`    | **Wood**    | `Feature`    | Lazy-loaded Module, libraries (`Ag-Grid`).      |
| `T400_SERVICE`   | **Stone**   | `Logic`      | Singleton Services, State Stores (`RxJS`).      |
| `T500_PLATFORM`  | **Iron**    | `Infra`      | Database, Edge Function, External API.          |
| `T900_ALIEN`     | **Void**    | `Blackbox`   | Embedding (Iframe, Third-party Widget).         |

## 4. Development Lifecycle States (The Orbit)

**Universal Truth**: Every change follows this orbit.

| State ID         | Phase           | Description                     | Transition     |
| ---------------- | --------------- | ------------------------------- | -------------- |
| `L000_INTENT`    | **Ebb**         | Idea formulated.                | → L100         |
| `L100_CLARITY`   | **Flow**        | 5W Analysis & Drill Down.       | → L200         |
| `L200_DOCUMENT`  | **Bedrock**     | Writing to Blueprint.           | → L300         |
| `L300_ALIGNMENT` | **Governance**  | Checking for Drift/Invention.   | → L500         |
| `L500_MIGRATE`   | **Materialize** | Writing Code (Trunk).           | → L700         |
| `L700_ECLIPSE`   | **Revolution**  | Git Push (Orbital Positioning). | → L900         |
| `L900_OBSERVE`   | **Gardening**   | Monitoring Production.          | → [New Intent] |

---

_Governed by `REFER.OS/refer.md`_

<a id="refersupabasemd"></a>

## refer.supabase.md

# refer.supabase.md — Supabase Systems Reference

This file captures the canonical Supabase patterns that REFER.OS relies on, including storage, assets, and the canonical URL policy described in `refer.md` and the artifact map.

## 1. Storage & Asset Governance (canonical URLs)

- **No long Supabase URLs in persisted data** — Supabase returns signed URLs with query-heavy tokens that are fragile for APIs, emails, or webhook-driven flows. We treat those as transient and never store them in the database or surface them to clients.
- **Canonical short URLs** — When a Supabase storage upload occurs, we immediately issue and persist a short canonical URL under our own domain (e.g., `https://img.telechurchlive.com/{uuid}`). That URL becomes the identity reference used by all front-end intents, action documents, and downstream services.
- **Resolution layer** — The API or Edge function that receives a canonical `{uuid}` resolves it to the actual Supabase path (`storage.bucket.from(bucket).getPublicUrl(path)` or a signed URL with TTL) and either redirects or streams the asset. This keeps the long Supabase URL behind the resolver and ensures the canonical reference remains clean.
- **Asset metadata** — Store Supabase path, size, mimetype, and canonical URL in Supabase itself (or a proxied datastore) so we can rehydrate the asset if the resolver must reauthorize a new signed URL.
- **No webhooks or Stripe-supplied tokens for storage resolution** — We only rely on the resolver’s own authentication (service role) to fetch/stream assets. This avoids the problems with JWTs that cannot be verified in Supabase storage webhook contexts.

## 2. Refer action alignment

### refer.build

- When designing features that add new media assets (images, videos, files), refer to this canonical URL policy so the store action, database field, and canonical reference are created together in one unfold.
- Document in `refer.build.md` that every new asset type must define its resolver logic (bucket, path pattern, TTL handling).

### refer.repair

- If long Supabase URLs leak into data or UI, `refer.repair.md` should include steps to re-canonicalize the asset (generate a fresh short URL, migrate references, update resolver). Mention this reference so repair signals know to re-run the canonical policy.

### refer.systems.url (optional)

- If we create `refer.systems.url.md` later, include URL transformation specs, resolver endpoints, and any TTL policies. This doc would centralize the canonical URL lifecycle for both builds and repairs.

## 3. Signals & Edge functions

- The resolver lives in an Edge function that:
  - Accepts `https://img.telechurch.live/{uuid}` requests.
  - Looks up the stored Supabase metadata for `{uuid}`.
  - Uses the Supabase service role to fetch a signed URL or stream the blob.
  - Sets sane caching headers and redirects/streams the asset.

- Update this reference if we ever support additional CDN domains or alias `{uuid}` styles; the refer router (via `refer.md`) will then know which domain/deployment to target.

## 4. Supabase relation enforcement

Treat `refer.supabase.md` as the single source of truth for Supabase storage and canonical URL behavior. When new Supabase-based services are built, reference this doc, ensure `refer.build`/`refer.repair` mention it, and keep `refer.md` pointing to `refer.supabase.md` as part of the Relation pillar.

## 5. Remote migrations + function deploy (operational)

### Required keys (canonical source)

- `.env.master` holds the canonical secrets for remote Supabase ops.
- Use:
  - `SUPABASE_DB_PASSWORD` for `supabase db push`
  - `SUPABASE_ACCESS_TOKEN` for CLI auth (required for remote push/deploy)
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side runtime access when needed

### Migrations (PowerShell)

**Convention:** `YYYYMMDDHHMM_name.sql`
**Example:** `202601070215_heavenly_seed_final.sql`

```powershell
$env:SUPABASE_DB_PASSWORD = (Get-Content .env.master | Where-Object { $_ -match '^SUPABASE_DB_PASSWORD=' } | ForEach-Object { $_.Split('=',2)[1] })
$env:SUPABASE_ACCESS_TOKEN = (Get-Content .env.master | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' } | ForEach-Object { $_.Split('=',2)[1] })
npx supabase db push
```

### Edge functions (PowerShell)

```
$env:SUPABASE_ACCESS_TOKEN = (Get-Content .env.master | Where-Object { $_ -match '^SUPABASE_ACCESS_TOKEN=' } | ForEach-Object { $_.Split('=',2)[1] })
npx supabase functions deploy <function-name>
```

Notes:

- If `npx supabase db push` fails with auth errors, confirm the `.env.master` values and that the CLI is linked to the correct `project_id` in `supabase/config.toml`.
- Do not echo secrets in logs; keep these steps scoped to local shells.

### Recent pattern: meeting instance feedback

- When adding a new Edge Function + table pair (ex: `org-instance-rating` + `org_instance_ratings`), deploy in this order:
  1. `npx supabase db push`
  2. `npx supabase functions deploy org-instance-rating`

## 6. Compiler-Driven Materialization (Gifts)

The REFER compiler (`refer.compiler.md`) can materialize primitives directly into SQL via the **Supabase Gift Strategy**.

- **Seeding:** High-level primitives (Roots, Shells, Actions) are seeded into `refer.refer_primitives`.
- **DDL:** The compiler provides the structural DDL to ensure the Bedrock matches the Intent.
- **Protocol:** Generate `.sql` migrations via `refer.build` and apply them using the PowerShell commands in Section 5.

<a id="referstructuremd"></a>

## refer.structure.md

# refer.structure.md — Structural Mapping (UI • Workflow • Broadcast)

This reference defines how work is structurally classified and wired across the three front-edge layers: UI, workflow, and broadcast. Use it to keep new changes consistent with REFER.OS boundaries (views render state + dispatch intents; IO and business logic live outside components).

## 1. The three layers

- **UI (Body)**: components/templates under `src/app/features/**` (and pages, if present). Views bind to selectors and dispatch intents only.
- **Workflow (Mind)**: orchestration under `src/app/workflows/**` (actions/services/guards/signals).
- **Broadcast (Spirit)**: realtime/signal relations under `src/app/core/realtime/**`.

## 1.1 The refer.app Mirror

`refer.app/` mirrors the structure of `REFER.OS/` to provide app-scoped interpretations of universal laws.

- **Universal Scope**: `REFER.OS/` (Apply to all apps)
- **App Scope**: `refer.app/` (Apply to all features in this app)
- **Feature Scope**: `refer.app/features/**` (Apply to specific features)

Check `refer.app` for scoped overrides before applying universal laws.

## 2. Execution chain (structural invariant)

Use this as a structural checklist whenever you introduce a new behavior:

1. **Action / Intent**: a typed event describing what happened.
2. **Service / Effects**: async/IO work and integration calls.
3. **Guard**: policy checks, gating, redirects, remote/edge routing.
4. **Edge / Signal**: state updates and broadcast emission.
5. **UI**: views render derived state and dispatch new intents.

## 3. Component boundary (Body law)

- Components must not import repositories/services from `src/app/core/**`.
- Components may import selectors, intents, and feature store facades.

## 4. When to update this file

- Adding a new feature surface that changes how UI/workflow/broadcast cooperate.
- Introducing a new workflow domain (new guard surfaces, new broadcast channels).
- Fixing a repair where the defect was “wrong layer” wiring (IO in views, missing guard, missing signal/state update).

## 5. Cross-links

- Identity registry: `refer.identity.md`
- Router: `refer.md`
- Unfolding map: `inference.md`
- Law/QC: `refer.law.md`, `refer.qc.md`

<a id="referrepairmd"></a>

## refer.repair.md

# refer.repair.md — The Restoration of Reverence

To repair is not merely to "fix" a bug; it is to **Restore Order** to the Tree. When a system fails, it means a component has drifted from its proper place in the Body, Mind, or Spirit.

## The Philosophy of Repair

Everything in the Platform (Tree) has a rightful place:

- **Body (UI)**: The physical structure (IMSCE).
- **Mind (Logic)**: The internal flow (ASEDAWSI).
- **Spirit (Signal)**: The connection to the source (EWCPSI).

A bug is simply **Matter out of Place** (e.g., Logic in the UI, UI in the Logic, or a Signal blocked by the Ego/Cache).

---

## 1. Body Repair (The Whole Tree Scan)

**Philosophy**: A blight on the Fruit means the Tree is sick. Do not spot-fix. You must walk the lineage from Root to Fruit and inventory _all_ misalignments.

### The Anatomy of the Comb (The 5 Teeth)

A comb has multiple teeth to catch different types of snags simultaneously. You must scan with **all teeth** in a single pass.

1.  **Tooth 1: Structure (The Spine)**
    - _Focus:_ Physical Placement & Lineage.
    - _Check:_ Is this Fruit on a Card? Is this Card on a Section?
    - _Snag:_ Gap Jumping (Fruit on Section).

2.  **Tooth 2: Intent (The Name)**
    - _Focus:_ Semantic Truth.
    - _Check:_ Does the class name match the behavior?
    - _Snag:_ Calling a Section `.menu-card` (Naming Violation).

3.  **Tooth 3: Function (The Nerve)**
    - _Focus:_ State & Flow.
    - _Check:_ Does the button trigger an Action? Does the Toggle change State?
    - _Snag:_ Dead clicks or UI mutating state directly.

4.  **Tooth 4: Aesthetic (The Skin)**
    - _Focus:_ Visual Reference.
    - _Check:_ Is it painted (Hardcoded) or Referenced (Variable)?
    - _Snag:_ `color: #fff` (Paint Violation).

5.  **Tooth 5: Data (The Blood)**
    - _Focus:_ Content Source.
    - _Check:_ Is the content Static (Bone) or Dynamic (Blood)?
    - _Snag:_ Hardcoded User Name ("John Doe") where a Variable `{{user.name}}` should be.
    - _Rule:_ Static is fine for labels; Dynamic is required for identity.

### The Ritual of the Scan

When walking a branch, apply all 4 teeth to every node.

- "Here is a Button (Node)."
- **Structure?** Yes, on a Card.
- **Intent?** Yes, named `.btn-close`.
- **Function?** Yes, calls `toggle()`.
- **Aesthetic?** Yes, uses `var(--btn-text)`.
- _Result:_ Smooth Pass.

---

## 2. Mind Repair (The Flow Check)

**Diagnose when:** The issue is State, Data, or Calculation-based.
**Analogy:** The Sap (Water/Energy Transfer).
**Sequence:** ASEDAWSI (Algorithm, State, Event, DOM, API, Workflow, Storage, Index).

### The Algorithm

1.  **Trace the Source (Water Source)**
    - _Question:_ Where did this data originate?
    - _Violation:_ Is the UI calculating the data? (The Leaves cannot create Water).
    - _Healing:_ Move logic to the Service/Store (The Roots).
2.  **Check the Flow (Energy Transfer)**
    - _Question:_ Is the State immutable until the Event?
    - _Violation:_ Is the component mutating the stream directly?
    - _Healing:_ Enforce the Cycle (Event -> Action -> Reducer -> State).
3.  **Clear the Blockage (Stagnation)**
    - _Question:_ Is the proper index updating?
    - _Healing:_ Ensure the subscription is live and the pipe is open.

---

## 3. Spirit Repair (The Connection Check)

**Diagnose when:** The issue is Realtime, Broadcasting, or Latency-based.
**Analogy:** The Light (Photosynthesis/Signal).
**Sequence:** EWCPSI (Edge, Worker, Cache, PubSub, Signal, Index).

### The Algorithm

1.  **Test the Frequency (Signal Purity)**
    - _Question:_ Is the signal true?
    - _Violation:_ Are we mocking the truth?
    - _Healing:_ Align with the Bedrock (Database) Truth.
2.  **Inspect the Atmosphere (Edge/Worker)**
    - _Question:_ Is the cloud obscuring the light?
    - _Healing:_ Flush the Cache; Verify the Edge Function.
3.  **Harmonize the Vibration (PubSub)**
    - _Question:_ Are all listeners tuned to the right channel?
    - _Healing:_ Verify the Channel ID and Broadcast Event.

---

## 4. The Ritual of Return

Once the component is restored to its rightful place:

1.  **RETURN**: Verify the Tree is bearing fruit.
2.  **COMMIT**: Seal the Healing.
3.  **PUBLISH**: Broadcast the Restoration.

<a id="refertelechurchmd"></a>

## refer.telechurch.md

# ⛪ **refer.telechurch.md**

**The Pilot App for REFER.OS**

This document defines the **Telechurch** application instance running on top of REFER.OS. It holds the app-specific identity registry, compiler status, and roadmap.

---

## 1. App Identity Registry

_Extends `refer.ontology.md` with Telechurch-specific identities._

| Identity         | Type   | Location               | Notes                    |
| :--------------- | :----- | :--------------------- | :----------------------- |
| `telechurchlive` | System | `e:/Telechurch-e2e-v2` | Main Repository root     |
| `app.core`       | Module | `src/app/core`         | Telechurch Core Services |
| `app.features`   | Module | `src/app/features`     | Telechurch UI Features   |
| `app.workflows`  | Module | `src/app/workflows`    | Business Logic           |

---

## 2. Compiler Status Checklist

_Telechurch-specific migration tracking._

| Route               | Feature        | Status          | Copy | Sel  | Pres | Cards | Behavior |
| :------------------ | :------------- | :-------------- | :--- | :--- | :--- | :---- | :------- |
| `/events`           | events         | **Reverent**    | 100% | 100% | 100% | 100%  | 10%      |
| `/events/:id`       | events-detail  | **Reverent**    | 100% | 100% | 100% | -     | 10%      |
| `/events/:id/share` | events-share   | **Reverent**    | 100% | 100% | 100% | -     | 10%      |
| `/orgs`             | orgs-directory | **Reverent**    | 100% | 100% | 25%  | 100%  | 10%      |
| `/cardcompiler`     | cardcompiler   | **In Progress** | 50%  | 50%  | 50%  | 100%  | 0%       |
| `/ichurch`          | ichurch-shell  | **In Progress** | 100% | 25%  | 100% | -     | 20%      |
| `/`                 | landing        | **Secular**     | 0%   | 0%   | 0%   | -     | 0%       |
| `/login`            | auth           | **Secular**     | 0%   | 0%   | 0%   | -     | 0%       |

---

## 3. Theme Variants (Gardens)

_Tokens stored in `refer_theme_tokens` Bedrock._

| Theme (Blossom) | Variant ID       | Status       | Origin              |
| :-------------- | :--------------- | :----------- | :------------------ |
| **Default**     | `default`        | **Reverent** | `early-morn`        |
| **Guest**       | `heavenly-bliss` | **Reverent** | Bedrock Spec        |
| **System**      | `cream-splash`   | **Secular**  | `ichurch.theme.css` |

---

## 4. Deployment & Cloudflare

_See `refer.telechurch.cloudflare.md` for Edge rules._

- **Production:** `telechurchlive.com`
- **Shortlinks:** `telechurchlive.com/s/`

## 5. App-Specific Extensions

- **Design Lab:** `REFER.OS/telechurch/refer.designlab.md` (Prototyping & Token Governance)

<a id="refertalentsmd"></a>

## refer.talents.md

# 🎁 **refer.talents.md**

**The Gifts of Expression (Language Registry)**

> _"The Spirit blows where it wishes. We choose the Gift that best serves the moment."_

This document defines the **Universe of Gifts** (Languages, Frameworks, Codebases) available to REFER.OS. We are **truly agnostic**: we are not fixated on using one language for one domain. We treat the entire universe of technology as our palette, choosing the Gift that is most **Efficient, Secure, Stable, and Low-Friction** for the specific intent.

---

## 1. The Universe of Gifts

Any Gift can technically manifest on any Plane (Body, Mind, Spirit). We choose based on the _qualities_ required.

| The Gift (Language) | The Strengths (Why we choose it)     | Best Fit Implications                                               |
| :------------------ | :----------------------------------- | :------------------------------------------------------------------ |
| **Angular** (TS)    | **Structure, Rigidity, Discipline.** | Best when the system is complex and requires long-term stability.   |
| **React/Qwik** (TS) | **Velocity, Fluidity, Ecosystem.**   | Best when the goal is rapid iteration or specific library access.   |
| **Python**          | **Reasoning, Density, AI.**          | Best for logic-heavy tasks, auditing, or when clarity > throughput. |
| **Rust / WASM**     | **Security, Efficiency, Raw Speed.** | Best when every cycle counts (High-frequency Edge, Crypto).         |
| **Javascript/Node** | **Ubiquity, I/O, Glue.**             | Best for low-friction orchestration and connecting systems.         |
| **HTML/CSS**        | **Universality, Zero-Overhead.**     | Best for static, immutable, or universally accessible content.      |

---

## 2. The Discernment Matrix (Choosing the Best)

When discerning which Gift to use, we weigh five factors:

1.  **Efficiency:** Does this Gift solve the problem with the least energy?
2.  **Security:** Does this Gift inherently protect the user/system?
3.  **Stability:** Will this Gift stand the test of time and entropy?
4.  **Friction:** How hard is it to integrate this Gift right now?
5.  **Reversability:** If we choose this Gift today, how hard is it to "ungift" (swap) it tomorrow? Low-reversability choices create technical debt and lock-in.

### Examples of Agnostic Choice

- **The Body:** Usually Angular, but if we need a high-performance 3D visualizer, we might choose **Rust (WASM)** or **Three.js**.
- **The Mind:** Usually Node, but if we need sophisticated data validation or AI, we choose **Python** without hesitation.
- **The Spirit:** Usually Cloudflare Workers (JS), but if we need high-security auth signing, we choose **Rust**.

---

## 3. Extending the Universe

To add a new Gift:

1.  **Define its Strength:** What unique quality does it bring?
2.  **Verify the Fit:** Does it offer better Efficiency/Security/Stability/Friction than existing Gifts for a specific class of problems?
3.  **Teach the Compiler:** Update `refer.compiler.md` to support materializing this new Gift.

---

## 4. Coexistence Strategy (The Monorepo)

**Yes, they share the same home.**

REFER.OS is a **Monorepo**. Different Gifts coexist side-by-side, organized by their **Plane** (Function) rather than their Language.

- **Polyglot by Design:** You can have an Angular `frontend` (Body), a Rust `signer` (Spirit), and a Python `analyzer` (Mind) all in the same feature folder or adjacent directories.
- **The Compiler's Job:** The Compiler is the traffic controller. It sees a `refer.telechurch.md` or a primitive tree and dispatches the _parts_ to the appropriate Gift.
  - UI components -> Angular Generator
  - Edge logic -> Cloudflare Generator
  - Data schemas -> Supabase/SQL Generator

**Rule of Friction:** While they _can_ mix, we verify the **Friction** cost. Embedding React _inside_ Angular is possible but high-friction. detailed in `refer.talents.md`.

<a id="refersystemssecuritymd"></a>

## refer.systems.security.md

# refer.systems.security.md — System Keyholder & Remote Contexts

Codex handles three concentric scopes of work inside REFER.OS, and `refer.md` always mediates the transitions between them so the router knows when to invoke this security reference.

1. **Local work** — edits directly in the repo (components, workflows, templates).
2. **API work** — calling internal/external endpoints for validation, testing, or data retrieval.
3. **Remote management** — configuring Cloudflare, Supabase, GitHub, etc., using high-privilege credentials stored in `.env.master`.

Remote management is critical for efficiency because it allows Codex to sync systems from the refer intent instead of relying on manual UI interactions. When a `refer.` intent crosses into remote management (deploying workers, updating Supabase edge functions, adjusting DNS), route its context through `refer.systems.security.md` so:

- The router knows to look up `.env.master` (or the approved vault) for the keyholder credentials.
- The intent shifts to the remote management guardrail (confirming key access, ensuring no drift before execution).
- RETURN/COMMIT/PUBLISH still runs after the remote change, recording the remote intent for later audits.

Update `refer.init.md` so every environment initialization confirms `.env.master` is provisioned, and keep this document cross-referenced from `refer.cloudflare.md`, `refer.supabase.md`, and `refer.qc.md`. That way the router automatically selects the right context (local/API/remote) and authenticates using the designated keyholder whenever remote system work is requested.

<a id="referinitmd"></a>

## refer.init.md

# refer.init.md — REFER.OS Bootstrap Guide

`refer.init.md` captures the canonical startup story for REFER.OS: how the router, QC engine, refer.\* documents, and forward-only lineage come online together.

## 1. Init Intent

- **Trigger:** `refer.init: bootstrap` or any directive that brings new agents into REFER.OS and describes how to begin.
- **Purpose:** Walk through registering identities, wiring structure/inference, enabling refer prefixes, and confirming guardrails such as branch rules, QC checks, and context continuity.

## 2. Initialization steps

1. **Verify requirements:** confirm `refer.md`, `refer.qc.md`, `refer.law.md`, `refer.identity.md`, `refer.structure.md`, `inference.md`, and `refer.supabase.md` exist and match the canonical versions.
2. **Provision todo workspace:** ensure `codex/todo/` exists with `To_do_list.md` (master spec) and feature briefs (e.g., `codex/todo/<feature>.md`) so planning artifacts stay centralized for all future builds.
3. **Register identities:** ensure `refer.identity.md` maps the doctrine/tree, and add any new workflows to the manifest.
4. **Hook references:** update `refer.md` table, law (`refer.law.md`), and `refer.qc.md` references so the router resolves every new intent.
5. **Apply guardrails:** enforce context continuity, forward-only branching, split-footprint builds, asset sizing, and the new QC checklist before allowing any build/repair/migrate actions.
6. **Confirm config:** point `c:\Users\agent\.codex\config.toml` (or equivalent) at REFER.OS documents, enable refer prefixes, and ensure the project scope requires refer context.
7. **Provision remote keys:** verify `.env.master` (or the approved key vault) holds the Cloudflare/Supabase/GitHub tokens so remote management intents can authenticate via `refer.systems.security.md`.
8. **Automate startup:** register a `refer.init` alias in the router table if new agents need to bootstrap automatically.

## 3. Activation

- Use this document when terraforming a new workspace, onboarding a new agent, or resetting the refer surface after a governance update. Call `refer.init` before running more specific refer actions so the system knows the canonical references are live.

<a id="referplanmd"></a>

## refer.plan.md

# refer.plan.md - Planner & PGBIR Intake

`refer.plan` is the sole conversational intake surface for REFER.OS. It governs how intent is captured, interrogated, and recorded as Plans, and how explicit execution requests flow into Governance, Blueprint, Inference, and Repo.

Key anchors:

- **Three-intent model**: Plan (CRUD Plan record), Flow (execute Plan), Governance (update refer.\* law).
- **Intent-driven mutation**: execution proceeds when intent is explicit; only pause for ambiguity or destructive risk.
- **Planner is the contract**: every intake resolves into a Plan record with scope, non-scope, acceptance criteria, dependencies, and verification.
- **Push initiator**: the push/continue handshake and publish chain live in `refer.plan.md`.

Use this reference whenever an instruction requires intake clarification or routing before execution.

## System references

- When a chat touches a system (Cloudflare, Supabase, GitHub, Angular, etc.), cite the corresponding `REFER.OS/refer.<system>.md` file so the router knows which relation is active and which remote guards apply.
- When a chat touches REFER.ALPHABET, use `REFER.OS/refer.alphabet.io/refer.alphabet-v2.md` as the single source of truth.
- When a chat touches **cron, scheduling, recurrence, or task compilation**, cite `REFER.OS/refer.cron.md` so scheduling doctrine stays canonical.
- Mention `REFER.OS/refer.cloudflare.md`, `REFER.OS/refer.supabase.md`, and `REFER.OS/refer.github.md` whenever the intent involves those providers, and add `REFER.OS/refer.angular.md` if the change targets Angular edge rules.
- If the intent touches **OG/share routes, in-app browser hangs, SPA shell delivery, or cache headers**, cite `REFER.OS/refer.og.md` and follow the caching doctrine in `REFER.OS/refer.cloudflare.md` (Document caching doctrine) before proposing any worker/functions changes.
- Remote work must follow `refer.systems.security.md`, so note it explicitly when chat context needs `.env.master` credentials (Cloudflare tokens/keys, Supabase service role keys, GitHub automation tokens). This ensures the subsequent builder call honors the RETURN -> COMMIT -> PUBLISH loop for remote deployments.

### Required Chat Endpoints

Every refer.plan must hand off to a governed action unless the user explicitly calls for **Teach** mode (analogy/explanation only). Close the conversation with one of the following:

1. **Todo / Idea Intake** - Future-focused language ("schedule," "plan," "later," etc.) means write an entry in the TeleChurch todo (`codex/todo/To_do_list.md`) and mirror it to `codex/refer.todo.md` so the idea is formally tracked.
2. **Repair** - If the chat reveals an issue needing immediate correction, enter the repair path (`refer.repair.md`) and execute the fix.
3. **Build** - For new features or blueprint work, shift into the build flow (`refer.build.md`), complete the MVI steps, and run RETURN + COMMIT.
4. **Other Contextual Actions** - When another refer action (expand, migrate, governance update, etc.) fits better, route there and note the decision in the transcript.

Chats left without an endpoint (outside Teach mode) are considered unresolved and must be reopened until routed.

## 1. Start the chat

- Trigger `refer.plan:` followed by your question or intention. The router holds the current refer domain (build, repair, expand, etc.), flags the context, and signals the QC guard to check referential/structural coherence before answering.

## 2. Chat workflow

1. **Summarize context** - note identities, relevant documents, and previous decisions so Codex knows what is already settled.
2. **List uncertainties** - expose constraints (rate limits, large assets, remote management) and conflicting ideas that need resolution.
3. **Propose options** - Codex lists the minimal refer path (build, repair, expand, migrate) and the key guardrails.
4. **Lock in agreement** - confirm which option to pursue and capture that decision in `refer.qc.md` so future audits understand the choice.
5. **Continuation keyword (`Continue`)** - when the user replies "Continue", treat it as explicit approval to execute the previously suggested next steps in order. If options were presented and the user did not choose, default to the simplest/most lawful path before proceeding.

## 3. Resume flow

- After the chat, Codex dispatches the chosen refer action, logs the chat summary, and ensures the RETURN + COMMIT + PUBLISH loop picks up where the chat left off.
- While the chat is active, capture any confirmed todo items (idea intake, scoped feature, repair) immediately: write them to the applicable app todo (`codex/todo/To_do_list.md` for TeleChurch), mirror the row in `codex/refer.todo.md`, and invoke other refer contexts mid-chat when needed so routing stays in sync.

### Ambiguity guardrail (new)

- When a request is underspecified, restate the intent and ask for the exact behavior before executing. Do not invent actions or wiring.
- If multiple interpretations exist, present 1-3 concrete options and wait for selection. Default only when the user says "Continue" after you have listed the options.
- Keep new buttons/features inert by default unless the user specifies an action.
- Avoid "over-helpful" scope creep: only build what was confirmed in this chat.

---

## Chat: Apostle SVG Character (2025-12-10)

- **Context summary**: TeleChurch team requested an Apostle/Elder Shema assistant concept. Product specifics (expression sets, animation hooks, placements) are captured in `codex/todo/To_do_list.md` so REFER.OS stays app-agnostic.
- **Uncertainties surfaced**: Determine whether the mascot ships first as SVG micro-animations or waits for a Lottie workflow, and ensure any component usage respects the MVI boundary (views render selectors only).
- **Options proposed**:
  1. **Teach-only** explanation of SVG workflows (declined - team wanted actionable follow-up).
  2. **Todo / Idea Intake** entry pointing to TeleChurch docs for ongoing design work (selected).
  3. **Immediate build** toward a mascot pipeline (deferred pending dedicated art scope).
- **Decision / endpoint**: Routed to **Todo / Idea Intake**. TeleChurch recorded the actionable detail in `codex/todo/To_do_list.md`, while REFER.OS keeps only the routing note and mirrors the activation in `codex/refer.todo.md` under Later/Ecosystem boosters.

---

## Chat: Invitation UX (2025-12-27)

- **Context summary**: A product request surfaced for a more structured invite experience (multi-method selection, pending tracking) which is application-scoped.
- **System references**: `REFER.OS/refer.angular.md` (front-end state/UI boundary), `REFER.OS/refer.og.md` (share/link behavior, if OG routes are introduced later).
- **Decision / endpoint**: Routed to **Build** with the detailed spec captured in `codex/todo/To_do_list.md` (Idea Intake Stream) and mirrored execution notes in `codex/refer.todo.md`.

---

## Chat: Responsive Page Shell Standard (2025-12-30)

- **Context summary**: A recurring responsiveness mismatch across routes typically comes from inconsistent page shells (padding/max-width/safe-area handling) and missing block-level display on Angular route host elements.
- **System references**: `REFER.OS/refer.angular.md` (layout + component boundary; avoid moving IO into view components while fixing UI).
- **Options proposed**:
  1. **Repair**: standardize a reusable responsive page shell + safe-area-aware topbar rules, then apply to the affected route(s).
  2. **Build**: introduce a new shared layout component and migrate routes gradually (higher change surface).
- **Decision / endpoint**: Routed to **Repair**. Canon is to prefer a lightweight global shell primitive (`.tc-page`-style) + `display:block` for route hosts, then selectively apply per-route without broad refactors.

---

## Chat: Header / Menu Consistency (2025-12-30)

- **Context summary**: Route-level headers/menus often drift because each route owns its own page chrome (topbar, breadcrumb, hero nav). Even when some CSS is shared, markup + behavior can be duplicated, leading to inconsistent menu contents, spacing, and theming.
- **System references**: `REFER.OS/refer.angular.md` (shared view component strategy; keep IO out of components).
- **Options proposed**:
  1. **Repair**: define a single canonical header view (topbar) + minimal config surface (menu items, optional back action, theme vars), then migrate routes to consume it while keeping existing route structure.
  2. **Build**: create a shared app shell/layout route wrapper (header + outlet) and migrate routes gradually (bigger routing surface).
  3. **Todo / Idea Intake**: log the target state now and defer execution until the canonical menu + theme tokens are agreed.
- **Decision / endpoint**: Routed to **Todo / Idea Intake** pending canonical menu + theme token agreement (TeleChurch scope tracked in `codex/todo/To_do_list.md` and mirrored in `codex/refer.todo.md`).

---

## Chat: Push Initiator Protocol (2025-12-30)

- **Context summary**: A request was made to treat `push` as an initiator for a governed push sequence, and to add `push all` for the full publish chain (commit -> GitHub -> merge to `main` -> Cloudflare).
- **System references**: `REFER.OS/refer.github.md`, `REFER.OS/refer.branch.md`, `REFER.OS/refer.commit.md`, `REFER.OS/refer.qc.md`, and provider refs (`REFER.OS/refer.cloudflare.md`, `REFER.OS/refer.supabase.md`) as needed.
- **Decision / endpoint**: Routed to **Other Contextual Actions** by extending `REFER.OS/refer.plan.md` with a two-step handshake (`push` -> plan; `Continue` -> execute) plus `push all`, and default sequences that prefer existing automation (`npm run commit:auto:push`, `npm run commit:verified`, `npm run branch:publish`).

<a id="referbuildmd"></a>

## refer.build.md

# refer.build.md — Build Action Reference

This action document replaces the E2E build protocol (`codex/governance/protocols/codex_genesis_init.protocol.md`) and describes how features unfold through REFER.OS. Follow it whenever `refer.build:` intents arrive.

## 1. Build intent

- **Trigger**: `refer.build: <feature>` or a natural-language directive that Codex interprets as a build request.
- **Purpose**: Add new capabilities by following the ASEDAWSI / IMSCE reference scaffolding. Every build must anchor to:
  - The identity registry (`refer.identity.md`) to determine the relevant domain.
  - The structural map (`refer.structure.md`) to place UI/workflow/broadcast layers.
  - The inference blueprint (`inference.md`) to sequence services, guards, edges, and UI.
  - The canonical URL policy (`refer.supabase.md`) if media assets are involved.

## 1.1 Split-footprint builds

- Prefer pointed, separable operations (one edge/function per CRUD action, e.g., save, update, delete) rather than monolithic all-in-one flows that mix conditions. Document each focused edge in its own intent so the build remains efficient, transparent, and expandable.

## 1.2 Asset sizing guard

- When builds include large assets (videos, media bundles), auto-detect and flag anything over the gateway or deployment limits and keep replacements within the allowed range. Describe the sizing requirements in this intent, have the resolver compress/clip as needed, and avoid pushing oversized files that would trip Cloudflare or Supabase updates.

## 2. Build flow

1. **Referential kickoff**: Read the `refer.build` directive from `refer.md`; classify the intent and determine the domain (UI, workflow, broadcast).
2. **Identity validation**: Confirm the target feature fits an existing identity in `refer.identity.md` or register a new identity before implementing.
3. **Structure alignment**: Use `refer.structure.md` to tie the work to UI/workflow/broadcast nodes and ensure component guardrails and selectors map correctly.
4. **Inference plan**: Outline the ASEDAWSI/EWCPSI sequence from `inference.md`. Define required services, guard checks, and deployment edges.
5. **Return plan**: Specify how RETURN will verify completion (no dangling guards, no drift). Document COMMIT expectations (refer.branch rules) and Publish steps (deploy, push, notify).

## 3. Asset considerations

- If assets are introduced, call out the resolver path defined in `refer.supabase.md` and ensure the short canonical URL is stored in the DB rather than the Supabase signed path. Mention this in the build definition so Codex wires the resolver correctly.

## 4. Documentation

- A build action must update `REFER.OS` references (`refer.identity.md`, `refer.structure.md`, `inference.md`) as needed and ensure `refer.md` still routes to the right domain.
- Keep a changelog entry (or commit note) that cross-links the `refer.build` directive to the new code/workflow for future audits.

<a id="referbranchmd"></a>

## refer.branch.md

# refer.branch.md — Branch Management Reference

`refer.branch` covers branch creation, switching, rollback, and stabilization so the router keeps lineage work coordinated with RETURN/COMMIT/PUBLISH.

## 1. Branch intent

- **Trigger:** `refer.branch: <command>` or an instruction around git branches (e.g., create `feat-beta/<feature>`, stash/un-stash, restore a clean state).
- **Purpose:** Keep branching in sync with the REFER.OS lifecycles and the Git relation (`refer.github.md`).

## 2. Branch flow

1. **Phase enforcement:** Respect the refer-enforced phase order (`ui→workflow→broadcast`) while creating or switching branches.
2. **Naming conventions:** Follow conventions like `feat-beta/<feature>` for new work, `hotfix/<ticket>` for repairs, or `refer.governance/<topic>` for governance changes.
3. **Cleanup:** If switching contexts, ensure working tree is clean (stash if necessary) and document stashes so RETURN can close the loop. Always commit before branching (`git add .` + `git commit -m "pre-branch snapshot"`), then branch from the tip of `main`; no branch may be created while unstaged/uncommitted work exists.
4. **Context preservation:** The forward-only lineage rule forbids rolling back. Repairs stay on `main` as forward fixes. New work runs from `main`’s tip—no branching from older commits or sideways forks. Experiments live as `/experiments/<feature>` workspaces (not Git branches) and only promote to real branches through `refer.build`. Document these sandbox paths so merges remain linear and conflict-free.

## 3. Integration

- Cross-reference this action from `refer.commit` and `refer.build` whenever branch operations are part of the flow; logging must reference the branch intent so MVR/tracing can follow the lineage.

<a id="refercommitmd"></a>

## refer.commit.md

# refer.commit.md — Commit Law Reference

`refer.commit` formalizes how RETURN transitions to COMMIT and seals the lineage; it defers to Git/GitHub policies captured in `refer.github.md`.

## 1. Commit intent

- **Trigger:** `refer.commit: <summary>` or any instruction that finalizes a RETURN-verified change.
- **Purpose:** Ensure all actions have obeyed branch rules, documented RETURN results, and prepared the repository for publishing.

## 2. Commit flow

1. **RETURN verification:** Confirm the change-pass from `refer.build`, `refer.repair`, `refer.expand`, or `refer.repair` concluded without drift.
2. **Lineage check:** Use `refer.github.md` to verify branch conventions, PR requirements, and required approvals (per `config.toml` ratification).
3. **Commit drafting:** Create a message derived from the canonical refer context (identity, structure, action).
4. **Commit execution:** Run git commit/push commands, or leave a documented instruction if automation handles it.

## 3. Post-commit

- Document the commit in the action log so RETURN→COMMIT→PUBLISH traceability remains.

## 4. Lineage law

- The forward-only lineage rule forbids rollbacks. Regressions on `main` must be repaired with forward commits; do not rewrite history. Branches always originate from the current tip of `main`. Experimental work uses `/experiments/<feature>` directories, which can be promoted to refer.build when ready.

<a id="refercloudflaremd"></a>

## refer.cloudflare.md

# refer.cloudflare.md Cloudflare System Relation

This reference captures the Cloudflare deployment and edge behavior from `codex/governance/domains/Cloudflare.md` and explains how REFER.OS treats Cloudflare as a critical relation.

## 1. Cloudflare Roles

- Cloudflare hosts the canonical front-end, proxy, API edge functions, and the `img.telechurch.live` resolver domain. Whenever remote management tasks target these assets, the router routes through `refer.systems.security.md` so `.env.master` credentials are used safely.
- Deployments must follow the RETURN+'COMMIT+'PUBLISH sequence; PUBLISH includes pushing the worker release, purging caches, and noting the state in `refer.qc.md` so the publish integrity checks pass.

### 1.1 Cloudflare Stream ingest keys (iMeeting MVP: Option A)

For iMeeting, Cloudflare Stream provides the media plane. In the MVP, hosts publish via **OBS (Custom)** or a phone broadcaster app using an ingest URL + stream key issued by the backend.

Rules:

- Treat the stream key as a password (host-only).
- Never expose ingest keys in OG HTML, public templates, or analytics payloads.
- Attendees only receive playback URLs (HLS).

## 2. Referential alignment

- Whenever `refer.build`, `refer.migrate`, or `refer.repair` touches Cloudflare routes, workers, or caching headers, mention this document so the router knows which systems relation to call.
- Canonical short URLs (per `refer.supabase.md`) rely on the Cloudflare resolver to translate `{uuid}` into the Supabase path; document the resolver endpoint, TTL, and caching strategy here before any edge change.
- Use the design lab (`refer.designlab.md`) to prototype new surface shaders or tokens before deploying them through Cloudflare so the visual alignment is tested without breaking production caches.

## Telechurch Cloudflare runbook

- Telechurch-specific Cloudflare routing and DNS details now live in `apps/telechurch/refer.telechurch.cloudflare.md`. Refer there before editing the worker, binding routes, or documenting a publish, so we keep the app-specific rules separate from the general systems relation.

## 3. System compliance

- Any Cloudflare configuration change that touches routing, caching, or authentication must be referenced in this relation and, if it alters law-level behavior, trigger `refer.governance` for review.

## 4. Deployment guidance

- `refer.systems.security.md` governs the remote management path, so align every publish with its credential protocol (look up `.env.master` and hydrate `CLOUDFLARE_API_TOKEN` or the legacy `CLOUDFLARE_API_KEY`/`CLOUDFLARE_EMAIL` pair before invoking Wrangler). The router needs this link so the return/commit/publish loop knows when the work crossed the remote-domain boundary.
- Prefer a scoped API token with Worker + Pages permissions; when a token lacks `User Details +' Read`, `wrangler deploy`/`wrangler pages deploy` will report `Authentication error [code: 10000]`, so fall back to the API key/email combo that is already stored in `.env.master`.
- Document the canonical publish commands and env vars to keep records straight:
  - **Workers:** `cd wrangler && npm run deploy` (uses local `node_modules/.bin/wrangler.cmd` on Windows) with `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` in scope.
  - **Pages (production):**
    1. Build and prep SPA fallback:
       - `npm run build`
       - Copy `dist/telechurch-e2e/browser/index.html` to `dist/telechurch-e2e/browser/404.html`
    2. Deploy:
       - `npx --yes wrangler@3 pages deploy dist/telechurch-e2e/browser --project-name telechurchlive --branch production --commit-dirty=true`
    3. Purge edge cache (recommended after deploy to avoid stale shells):
       - `curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID_TELECHURCH/purge_cache" -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" --data "{\"purge_everything\":true}"`
       - If the token returns 403, retry with legacy headers: `-H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY"`.
    4. Optional: add `pages_build_output_dir = "dist/telechurch-e2e/browser"` to `wrangler.toml` to suppress warnings about missing output dir.
  - **Legacy validation (deprecated):** `curl --head https://1gd.app` should return `302` with `Location: https://telechurchlive.com/` and `cf-cache-status: DYNAMIC`. Telechurch now treats `https://telechurchlive.com/<shortcode>` as the canonical shortlink surface; `1gd.app` is legacy-only.

### 4.1 Guardrails (required for OG reliability)

Cloudflare Pages deploys can succeed while silently dropping the **Pages Functions bundle** (everything under `functions/`). When that happens, the SPA may still load, but OG injection + deep-link behavior breaks.

Required guardrails:

- **Deploy from repo root** so `functions/` is included in the deploy context.
- **Deploy to the Pages project's configured production branch** (do not invent branch names).
- **Assert functions bundle is active**: the latest production deployment must report `uses_functions=true`.
- **Smoke test after deploy (with retries)**: verify `200` + OG tags for `/orgs` and `/events` (and at least one shortcode when available).
- **Bot detection must win over "browser navigation" heuristics**: some scrapers send `Accept-Language`, so only treat `isBrowserNavigation(...)` as human when `!isBot`.

Canonical commands:

- Production deploy + purge + OG smoke: `npm run deploy:pages:prod`
- OG smoke only: `npm run og:smoke -- --base https://telechurchlive.com`

## 5. Document caching doctrine (SPA + OG routes)

When a Cloudflare Pages site serves an SPA plus OG-enabled share endpoints, caching must treat **documents** (HTML) differently from **assets** (JS/CSS/images). If you don't, in-app browsers (WhatsApp/IG/Facebook) can cache an OG shell or stale SPA shell and "hang" until a manual refresh.

### 5.1 Non-negotiable rules

- **Never cache HTML documents**: Any response whose `content-type` is `text/html` must be `Cache-Control: no-store` (or, at minimum, `no-cache`). Prefer `no-store` for SPAs with edge-generated HTML.
- **Aggressively cache assets**: Hashed `*.js`, `*.css`, and static media should be `public, max-age=31536000, immutable`.
- **Avoid global `/* -> no-store` rules in `_headers`**: Cloudflare Pages merges headers from matching rules. A global `/*` rule can accidentally combine with `/*.js` and produce invalid/contradictory caching like `Cache-Control: no-store, immutable` (disabling asset caching).

### 5.2 Where to enforce "no-store" for HTML

Use both layers (they serve different purposes):

- **Pages Functions** (recommended): For SPA entrypoints like `/events/:id` or `/ichurch/:id`, explicitly set `cache-control: no-store` on the HTML response returned from `context.next()` and the `index.html` fallback. This guarantees dynamic routes don't accidentally become cacheable.
- **`public/_headers`**: Ensure the core HTML and PWA control documents are not cached:
  - `/index.html` and `/404.html` -> `Cache-Control: no-store`
  - `/ngsw.json` and `/ngsw-worker.js` -> `Cache-Control: no-store`

### 5.3 Share route guardrails (OG + in-app browsers)

- **Do not rely on UA sniffing alone** to decide "bot vs human." In-app browsers sometimes use bot-like UAs.
- If an OG HTML shell is ever served to a real user, it must include a **meta refresh + JS redirect** fallback to the SPA route, and the response should be `Cache-Control: no-store` for humans.

### 5.4 Service worker interaction (PWA)

Service workers amplify cache issues because they can:

- cache an older HTML shell,
- pin a broken bootstrap path,
- and behave inconsistently across in-app webviews.

Mitigation patterns:

- Keep `/ngsw.json` and `/ngsw-worker.js` `no-store`.
- Consider disabling SW registration in known in-app browsers and proactively unregistering existing registrations when diagnosing "first open hangs."

### 5.5 Quick verification commands

- Check HTML is not cached: `curl --head https://telechurchlive.com/ichurch/<id>` -> `cache-control: no-store`
- Check assets are cached: `curl --head https://telechurchlive.com/main-<hash>.js` -> `cache-control: public, max-age=31536000, immutable`
- Check share route behavior:
  - Browser navigation should `302` from `/.../share` to the real SPA route.
  - Bot UA should receive OG HTML with correct tags (and optional redirect fallback).

## 6. Canonical host doctrine (www vs apex)

### 6.1 Canonical host = apex

**Telechurch doctrine:** `https://telechurchlive.com` is the only canonical identity. `www` exists only as an entrypoint that immediately forwards to apex, so we do not split Service Worker/cache/storage origins.

Implementation:

- Cloudflare Pages middleware redirects `www.telechurchlive.com/*` -> `telechurchlive.com/*` (temporary `302` for GET/HEAD, `307` for non-GET) in `functions/_middleware.ts`.

### 6.2 Redirect safety (mobile webview)

In-app browsers can remember redirects (especially `301/308`) and keep applying them even after you change Cloudflare settings. To reduce sticky-client behavior:

- Prefer `302`/`307` for host canonicalization.
- Do not flip canonical direction once deployed (www->apex only).
- Keep share URLs, canonical tags, sitemap, and robots aligned to apex.

### 6.3 Guardrails

- Avoid mixing multiple host-forwarding mechanisms (Page Rules + Rulesets + Workers + middleware). Pick one (middleware currently).
- If you need to audit/remove legacy host-forwarding Page Rules: `node tools/cloudflare-www-to-apex-pagerule.mjs telechurchlive.com --remove`

## 7. SPA Redirect Authority (Auth + Resume)

Telechurch treats Cloudflare as an **edge mapping** layer, not an app-routing authority. The SPA owns "where do I land after auth".

- **Single owner (SPA):** `src/app/workflows/front-end-workflows/auth/redirect/*` is the only front-end layer allowed to decide post-auth navigation.
- **Login callback contract:** Supabase callbacks return to `/login?redirect=<path>`; the SPA resolves this into a single stable `router.navigateByUrl(...)`.
- **Storage keys (no collisions):**
  - `auth:requested_url` (write-once per auth attempt; first valid capture wins)
  - `auth:hint_url` (suggested target, overwrite allowed)
  - `auth:resolved_url` (last resolved target; cleared after successful navigation)
  - `auth:requested_source` (`login` | `invite` | `deep-link` | `manual` | `resume`)
- **Deprecated:** do not write or read `auth:redirect` (removed from the SPA). Any edge logic or tooling that assumes `auth:redirect` must be updated to use the `/login?redirect=` contract only.

## 8. Pages Functions fallback (HEAD deep links)

Some in-app browsers probe SPA routes with `HEAD` before issuing the real `GET`. If Pages responds `404` to `HEAD` deep links, clients can surface a "hang"/ERR_FAILED before the navigation proceeds.

- **Mitigation:** Pages Functions should treat `HEAD` deep links that look like SPA routes as `200` with `Cache-Control: no-store` (bodyless), mirroring the SPA fallback behavior.

<a id="referclimd"></a>

## refer.cli.md

# refer.cli.md — CLI Execution Reference

When a refer action needs to run shell commands (build, test, deploy, migration), `refer.cli` documents the command set, environment, and how outputs feed back into RETURN/COMMIT.

## 1. CLI scope

- Each refer action (build/repair/expand/migrate) invokes CLI scripts through the CLI provider (`refer.provider.cli.md`). Use `refer.cli` to capture which commands belong to that action (`npm run lint`, `npm run test`, `npm run policy:check`, `npx codex:execute`, etc.).
- Keep CLI work tied to the refer context: log the intent, guard the working tree, and avoid unscoped shell access by always prefixing commands with the current refer domain.

## 2. Guardrails

- Always run CLI commands inside a clean branch per `refer.branch.md`. Use `refer.plan` if you need to confirm context before executing long-running scripts.
- Collect stdout/stderr in the action log or `build_tracker.yaml` and reference the result in `refer.qc.md` before returning control to COMMIT.

## 3. Remote/Management tasks

- Remote management CLI commands (Supabase deploys, Cloudflare wrangler publishes) pull keys from `.env.master` via `refer.systems.security.md`; mention those credentials in this doc so the refer router knows when to escalate to remote context.

<a id="referanalyticsmd"></a>

## refer.analytics.md

# refer.analytics.md — Analytics Systems Reference (App-Agnostic)

This reference defines the canonical doctrine for analytics in E2E systems.

## Purpose

Analytics exists to answer:

- Where people enter, what they do next, and where they leave
- Which guards/prompt boundaries help or harm progress
- What to improve next (based on evidence), without collecting user content

## Doctrine

- **Behavior, not content**: record actions/outcomes, not user-entered text or secrets.
- **Structured raw**: go wide early on _coverage_ (major surfaces), not on _detail_ (no full clickstream text capture).
- **Two layers**:
  - **Raw events** (append-only) for short-term debugging and exploration.
  - **Rollups / stories** for long-term trend and narrative.
- **Trajectory-ready**: keep a deterministic mapping from “last meaningful signal” → “current phase” (Reveal/Hold/Shepherd).

## Data hygiene (required)

- Never store:
  - Auth secrets (tokens, codes, passwords)
  - User content (messages, comments, prayer requests)
  - PII (email, phone, names) unless explicitly required and governed
- Prefer route **shape**, not identifiers (normalize ids to `:id`).

## Click tracking (UI)

Telechurch uses a lightweight click map to understand what people actually use, without recording content.

- Default mode is **opt-in**: only elements with a `data-track` attribute are recorded.
- Inputs/textareas/selects are ignored by default to avoid capturing user content.
- Keys must be stable and human-readable (so reports are understandable).

**Key format (recommended)**

- Use a dot namespace: `feature.surface.action`
- Examples:
  - `topbar.menu.toggle`
  - `topbar.item.orgs`
  - `ichurch.nav.give`
  - `orgs.events.viewAll`

**Rules**

- Never put secrets/PII into `data-track`.
- Treat `data-track` values as public and permanent identifiers (changing them breaks historical charts).

## Scheduling (required)

All nightly/daily compilation must follow `REFER.OS/refer.cron.md`:

- Cron dispatches only (no heavy work)
- Execution edges do work (rollups, pruning, story generation)
- Payload is minimal “luggage”

<a id="inferencemd"></a>

## inference.md

# inference.md — Unfolding Logic & Blueprint

Inference captures the E2E blueprint logic (ASEDAWSI, EWCPSI, action-service-edge-DB-signal-UI flows) now reframed as a reference-first unfolding map that Codex consults when building or repairing features.

## 1. Blueprint cadence

- Record canonical sequences derived from `docs/archive/E2E_Build_Framework_Summary.md` and the workflow index. Common patterns include:
  - **Action → Service → Guard → Edge (Signal → UI)** for front-end builds.
  - **Event → WebSocket → Channel → Policy/Guard → Signal → Insight** for realtime/broadcast flows (EWCPSI).
  - **Action → Service → Guard → Edge → DB/API → Channel → WebSocket** for backend workflows.
- Each refer action should pick the cadence that matches its domain and outline the guardrails for RETURN/COMMIT.

## 2. Feature inference checklist

- To avoid ad hoc execution, reference this list when unfolding:
  1. Identify the intent and domain (refer.\*).
  2. Map the required services, guards, and edges via the workflow index.
  3. Determine DB/API dependencies (lineage and identity artifacts in `refer.identity.md`).
  4. Plan RETURN verification (no half-builds, no hanging guards).
  5. Document COMMIT requirements (branch rules in `refer.branch`).
  6. Trigger PUBLISH via existing deployment relations (Cloudflare/Supabase).

- Use this checklist when designing `refer.build.md`, `refer.expand.md`, or `refer.repair.md` so the inference logic stays consistent.

## 3. Blueprint examples

- Capture known sequences such as “Add chatroom” or “Fix save button” from `refer.os.md` Examples section, rewriting them here with explicit service/guard/edge steps and noting what RETURN/COMMIT signals are emitted.
- Include guidance for future features; each new inference example should align with the structural map in `refer.structure.md` and the identity map in `refer.identity.md`.

## 4. Cross-links

- Link to `REFER.OS/manifests/workflow.index.schema.json` and `src/app/workflows/workflow.index.json` so actions can pull current workflow topology.
- Reference `REFER.OS/manifests/guards.policies.ts` to remind refer actions of the guard logic that needs evaluation during inference.

<a id="e2eartifactmapmd"></a>

## e2e_artifact_map.md

# E2E → REFER.OS Artifact Translation Map

This file captures the E2E governance artifacts that still exist in the repo and the REFER.OS documents or action files they are destined to become. Use it as a checklist while we migrate each document into the reference-first architecture described by `REFER.OS/refer.os.md`.

## 1. Manifest & Identity (refer.identity.md)

| Legacy artifact                               | Description                                                         | Refer target                                                  |
| --------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `E2E_MANIFEST.yaml`                           | High-level doctrine manifest and identity registry for the E2E era. | `refer.identity.md` (canonical identity registry).            |
| `REFER.OS/manifests/e2e_manifest.schema.json` | Schema describing the manifest structure (IMSCE/lineage).           | `refer.identity.md` (replace with referent schema + mapping). |
| `REFER.OS/manifests/lineage.schema.json`      | Lineage record definition.                                          | `refer.identity.md` (lineage + identity references).          |
| `docs/archive/E2E_LIVING_ALIGNMENT_REPORT.md` | Narrative on alignment between identity/structure/mind-body.        | `refer.identity.md` + cross-link to `refer.structure.md`.     |

## 2. Structure & Blueprint (refer.structure.md / inference.md)

| Legacy artifact                                    | Description                                               | Refer target                                                                        |
| -------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `REFER.OS/manifests/workflow.index.schema.json`    | ASEDAWSI/workflow sequencing map.                         | `refer.structure.md` (structure) and `inference.md` (if we record unfolding rules). |
| `docs/archive/E2E_Build_Framework_Summary.md`      | Mind→Spirit→Body build system summary.                    | `refer.structure.md` (UI/Workflow/Broadcast) + `inference.md` for blueprint logic.  |
| `codex/governance/domains/telechurch_framework.md` | Telechurch framework description (UI/Workflow/Broadcast). | `refer.structure.md` (structural mapping).                                          |
| `reports/e2e_knowledge.json`                       | Knowledge dump with E2E insights.                         | `inference.md` or a new `refer.knowledge.md` if we want to preserve context.        |

## 3. Systems & Providers (`refer.<system>.md` + `refer.provider.<provider>.md`)

The following `codex/governance/domains/*` documents describe the systems and providers that REFER.OS now treats as relations.

| Legacy artifact                                                                   | Description                                               | Refer target                                                                                 |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `Angular.md`                                                                      | Angular-specific constraints.                             | `refer.angular.md`.                                                                          |
| `Cloudflare.md`                                                                   | Cloudflare deployment references.                         | `refer.cloudflare.md`.                                                                       |
| `Supabase.md`, `Supabase.RemoteOperations.Law.md`, `supabase.operations.map.json` | Supabase law/operations.                                  | `refer.supabase.md` and/or `refer.systems.url.md` (for canonical URL rules).                 |
| `Git.md`, `GitHub.md`, `LocalRepo.md`                                             | Git tooling references.                                   | `refer.github.md` or `refer.commit.md` (lineage).                                            |
| `CLI.md`, `Codex.md`, `ChatGPT.md`                                                | Tooling/agent behavior.                                   | `refer.provider.codex.md`.                                                                   |
| `Supabase.md`                                                                     | Also mention canonical asset URLs (see short URL policy). | Capture in `refer.supabase.md` plus cross-links from `refer.build.md` and `refer.repair.md`. |

## 4. Protocols & Actions (`refer.<action>.md`)

| Legacy artifact                                             | Description                           | Refer target                                         |
| ----------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| `codex/governance/protocols/codex_genesis_init.protocol.md` | Genesis build/interrogation flow.     | `refer.build.md` (build protocol + router behavior). |
| `codex/governance/protocols/governance_repair.md`           | Repair/resolution work.               | `refer.repair.md`.                                   |
| `codex/governance/modes/governance-response-engine.md`      | Response flow for governance updates. | `refer.governance.md` or embed in `refer.law.md`.    |

## 5. Law & Governance (`refer.law.md`)

| Legacy artifact                                   | Description                                                           | Refer target                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `codex/governance/GOVERNANCE_MANIFEST.yaml`       | Governance manifest versioning.                                       | `refer.law.md` (lawful principles + RETURN/COMMIT requirements). |
| `codex/governance/README.md`                      | General governance scaffolding.                                       | `refer.law.md` or `refer.md` introduction.                       |
| `codex/governance/protocols/governance_repair.md` | Already noted above; law-level enforcement belongs in `refer.law.md`. | `refer.law.md`.                                                  |

## 6. Knowledge, Reports & Legacy Data

| Legacy artifact                              | Description                | Refer target                                                    |
| -------------------------------------------- | -------------------------- | --------------------------------------------------------------- |
| `reports/e2e_knowledge.json`                 | Dump of E2E data/insights. | Reference note in `inference.md` or a new `refer.knowledge.md`. |
| (Any other doc that captures E2E philosophy) |                            | Link off `refer.md` when the router needs context.              |

## 7. Outstanding Actions

1. Create `refer.identity.md`, `refer.structure.md`, `inference.md` drafts that absorb the corresponding artifacts listed above.
2. Add `refer.<system>.md` and `refer.provider.<provider>.md` reference files for Angular, Cloudflare, Supabase, Git, etc., then add them to the `REFER.OS/refer.os.md` layout and `refer.md` table.
3. Draft `refer.build.md`, `refer.repair.md`, `refer.governance.md`, `refer.systems.url.md` (for canonical asset URLs) and tie them back to the canonical prefixes.
4. Update `refer.md` whenever new domains are introduced so the router remains authoritative.

Keep this map updated as each E2E artifact is translated. Once the refer files exist, we can remove the legacy docs or archive them under `/docs/archive/` for historical reference.

<a id="referbootmd"></a>

## refer.boot.md

# ⚡ **refer.boot.md**

**The Agent Handshake Protocol**

> _"Stop searching. Start knowing."_

This document is the **first read** for any AI agent entering the REFER.OS ecosystem. It eliminates the "discovery phase" friction by declaring the environment state, key locations, and health checks explicitly.

---

## 1. The Keyring (Secret Management)

**DO NOT SEARCH FOR KEYS.** They are located here for your context:

| Context            | File          | Purpose                              | Keys of Note                                    |
| :----------------- | :------------ | :----------------------------------- | :---------------------------------------------- |
| **Remote (Write)** | `.env.master` | High-privilege ops (Deploy, Migrate) | `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN` |
| **Local (Read)**   | `.env.local`  | Application runtime                  | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`     |
| **Shell**          | `process.env` | Ephemeral overrides                  | -                                               |

> **Rule:** If you need to write/deploy, you MUST read `.env.master` to get the credentials. If you are just testing connectivity, `.env.local` is sufficient.

---

## 2. The Doctor (Health Check)

**DO NOT GUESS CONNECTIVITY.**

Run this command immediately upon session start to verify your limbs are attached:

```bash
node tools/refer-doctor.js
```

It will check:

1.  **Supabase** (Read access to `refer_routes`)
2.  **Cloudflare** (Environment variable presence)
3.  **File System** (Write permissions)

If `refer-doctor.js` says **OK**, you are clear to build.

---

## 3. The Map (Where am I?)

You are currently in **Telechurch (Pilot)**, an instance of REFER.OS.

- **Operating System:** `REFER.OS/` (Generic Laws)
- **App Definition:** `REFER.OS/refer.telechurch.md` (Specific Status/Config)
- **Source Code:** `src/app/features` (The Body)

---

## 4. The Directives (How to act)

1.  **Read `refer.md` first.** It routes your intent.
2.  **Read `refer.law.md` second.** It constrains your changes.
3.  **Read `refer.telechurch.md` third.** It tells you what feature you are touching.

<a id="referappmd"></a>

## refer.app.md

# refer.app.md - The Scoped Application Layer

## Purpose

The `refer.app/` directory contains app-specific interpretations of universal REFER.OS laws. It bridges the gap between the universal mold (`REFER.OS/`) and the materialized code (`src/app/`).

## Structure

`refer.app/` uses a **sparse inheritance** pattern. It does not need to duplicate every file in `REFER.OS/`; it only contains files that need to be specialized for the specific application.

## Scope Taxonomy

Every refer doc can be classified by scope, typically denoted in frontmatter:

| Scope         | Location                | Applies To               | Examples                                        |
| ------------- | ----------------------- | ------------------------ | ----------------------------------------------- |
| **universal** | `REFER.OS/`             | ALL apps using REFER.OS  | `refer.compiler.md`, `refer.structure.md`       |
| **app**       | `refer.app/`            | ALL features in THIS app | `refer.cloudflare.md`, `refer.supabase.md`      |
| **feature**   | `refer.app/features/*/` | ONE specific feature     | `refer.app/features/academy/blueprint.map.json` |

## Inheritance Rules

1.  **Resolution Chain**: Start at **Feature Scope**. If doc is missing, check **App Scope**. If missing, check **Universal Scope**.
2.  **Specialization**: Scoped laws inherit from parenting laws. They can refine or restrict, but should not fundamentally contradict the universal law unless explicitly noting a divergence.
3.  **No Pollution**: App-specific details must NEVER be written to `REFER.OS/`. They belong in `refer.app/`.

## Directory Layout

```
REFER.OS/                           ← scope: universal
  ├── refer.cloudflare.md
  └── ...

refer.app/                          ← scope: app
  ├── refer.cloudflare.md           ← (Overrides/Extends universal)
  ├── features/                     ← scope: feature
  │   ├── academy/
  │   │   ├── blueprint.map.json
  │   │   └── refer.todo.md
  │   └── ...
```

<a id="referangularmd"></a>

## refer.angular.md

# refer.angular.md — Angular System Relation

This reference captures Angular-specific constraints while pointing readers to REFER.OS as the active governance layer.

## 1. Angular constraints

- Components remain view-only. They only bind to signals/selectors and dispatch intents. No direct repository or service IO belongs in a Angular view; all IO lives behind effects or services.
- Signal-based state is the canonical source of truth. Any feature component should lean on `store` facades (`refer.build`, `refer.repair` actions) and signal derivations (`refer.structure.md`, `inference.md`) rather than local mutable state.
- OnPush change detection, standalone components, and clear selector contracts keep the UI layer predictable. Follow the `src/app/features/*` feature layout, naming each component consistent with its registered identity in `refer.identity.md`.

## 1.1 Responsiveness contract (Page → Modal → Section → Card → Elements)

Responsiveness is enforced as a _layered contract_ so every new feature inherits predictable behavior without bespoke per-page fixes.

### Page

- Use a single page shell: `.tc-page` (+ optional `.tc-container`) for `min-height`, gutters, safe-area bottom padding, and horizontal overflow protection.
- Avoid `width: Npx` for layout. Use `min()`, `max()`, `clamp()`, or Tailwind responsive utilities.

### Modal

- Structure modals as: scrim + centered shell + constrained card:
  - Scrim: `.tc-modal-scrim`
  - Shell: `.tc-modal`
  - Card/panel: `.tc-modal__card`
- Modal padding must include safe-area insets (top/right/bottom/left).
- Modal height constraints must use `dvh` units (`100dvh`) to behave correctly on mobile browser chrome.

### Section / Card

- Sections and cards must always satisfy: `width: 100%`, `max-width: 100%`, `min-width: 0`.
- Prefer `.tc-section` / `.tc-card` (or role primitives `role-section` / `role-card`) and avoid nested fixed paddings that create overflow at small widths.

### Elements

- Any element inside responsive containers must be allowed to shrink:
  - In flex/grid layouts, children must have `min-width: 0` (the #1 cause of “mystery” overflow).
  - Media must never exceed container width (`img/video/canvas { max-width: 100% }`).
  - Form controls must not exceed container width (`input/select/textarea/button { max-width: 100% }`).

Implementation lives in `src/styles.css` under the `.tc-*` primitives and `--tc-*` tokens.

## 2. Referential alignment

- When `refer.build` or `refer.expand` adds a UI surface, cite this reference to ensure ASEDAWSI, IMSCE, and guard logic stay intact. Map the component to identities in `refer.identity.md`, reflect the signals in `refer.structure.md`, and document inference paths in `inference.md`.
- Use the Design Lab (`refer.designlab.md`) to iterate on primitives, then promote them to this canonical reference so every Angular surface uses the same tokens and signals.

## 3. System compliance

- Upgrades, CLI commands, or module wiring must respect the Living Execution System (LES) spelled out in `refer.os.md` and `refer.law.md`.
- Every Angular change must pass `refer.qc.md` checks (especially structural/inference integrity) before RETURN → COMMIT → PUBLISH wraps the work, keeping the Angular layer consistent with the refer router.

<a id="refercompilerblueprintmd"></a>

## refer.compiler.blueprint.md

# refer.compiler.blueprint.md

Blueprint v0.1 — actionable spec for implementing the Refer.OS compiler.

---

## 1. Objective

Translate the philosophy in `refer.compiler.md` into an executable system that:

1. Reads the Supabase genome (`refer_*` tables, i.e., the UBB rows) deterministically.
2. Runs in two modes (interpret/materialize) during MVP, with hybrid/broadcast staged next.
3. Emits Angular artifacts that respect Telechurch MVI (components are view-only; effects/stores handle IO).
4. Logs lineage to `refer_build_logs` so Codex and QC can trace every expansion.
5. Reports “how compiler-driven” a page is using the canonical scorecard in `refer.compiler.metrics.md`.

---

## 2. Milestone Ladder

| Milestone                  | Scope                                                                                                                             | Exit Criteria                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| M1 — Interpret Dev Loop    | Runtime renderer pulls primitives/instances directly from Supabase and renders in Angular shell for dev-only preview.             | `refer.build interpret --feature demo` hot-reloads a feature; output matches hand-authored reference component.  |
| M2 — Materialize to Source | Compiler writes `.ts/.html/.css` feature files under `src/app/features/**` and wiring (routes, stores) based on the same dataset. | Running `refer.build materialize --feature demo` updates files, tests pass, git diff shows deterministic output. |
| M3 — Hybrid/Synthesize     | Support opt-in hybrid feature mode where static shells ship while certain regions stay runtime-driven.                            | Feature flag toggles between static and runtime without diffs; QC signed off after bilateral test.               |
| M4 — Broadcast/Workflow    | Attach Guard/Signal/Workflow wiring via `refer_actions` and `refer_rules` inference.                                              | Button click intents route through store/effects generated by compiler; traces captured in logs.                 |

---

## 3. Data Model Specification

All tables live in Supabase schema `refer`. When this doc says **UBB** (Universal Building Block) it’s referring to the seed/instance/rule data living in these `refer_*` tables.

### 3.1 `refer_primitives`

| Column                      | Type        | Notes                                                              |
| --------------------------- | ----------- | ------------------------------------------------------------------ |
| `id`                        | uuid        | Primary key; immutable seed ID.                                    |
| `slug`                      | text        | e.g., `UBB.Button`. Unique.                                        |
| `version`                   | int         | Increment on seed evolution; compiler enforces forward-only usage. |
| `ts_template`               | jsonb       | Serialized AST or template tokens for TS logic.                    |
| `html_template`             | text        | Markup with placeholder tokens (e.g., `{{label}}`).                |
| `style_tokens`              | jsonb       | Tailwind/CSS fragments per primitive.                              |
| `props_schema`              | jsonb       | Zod-esque schema definition to validate instances.                 |
| `rule_hints`                | jsonb       | Metadata guiding layout inference, guard defaults, etc.            |
| `created_at` / `updated_at` | timestamptz | Audit.                                                             |

### 3.2 `refer_instances`

| Column                      | Type        | Notes                                                                                                  |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `id`                        | uuid        | Instance ID (referenced in parent/child relationships).                                                |
| `primitive_id`              | uuid        | FK to `refer_primitives.id`.                                                                           |
| `parent_id`                 | uuid null   | Null for root nodes (usually route container).                                                         |
| `order_index`               | int         | Resolve sibling ordering deterministically.                                                            |
| `props`                     | jsonb       | Instance-level props (e.g., `{"label":"Sync","intent":"SyncClicked"}`).                                |
| `tokens`                    | jsonb       | Optional style/layout overrides (e.g., `{"grid":"col-6"}`).                                            |
| `depth`                     | int         | Precomputed for fast ordered traversal (denormalized).                                                 |
| `route_id`                  | uuid null   | FK to `refer_routes.id` when applicable.                                                               |
| `compiler_enabled`          | bool        | Feature-level flag for hybrid rollout (true ⇒ run through compiler; false ⇒ legacy/manual build path). |
| `created_at` / `updated_at` | timestamptz | Audit.                                                                                                 |

### 3.3 `refer_rules`

| Column     | Type  | Notes                                                   |
| ---------- | ----- | ------------------------------------------------------- |
| `id`       | uuid  | Rule ID.                                                |
| `trigger`  | text  | e.g., `primitive=UBB.Route`, `props.intent=*`.          |
| `action`   | text  | `attach_guard`, `inject_service`, `derive_layout`, etc. |
| `payload`  | jsonb | Data needed to execute rule.                            |
| `priority` | int   | Lower number runs first.                                |
| `phase`    | text  | `ingest`, `expand`, `materialize`, `post`.              |
| `enabled`  | bool  | Feature-flag gating.                                    |

### 3.4 `refer_actions`

Defines workflow hooks/stores/effects.

| Column           | Type  | Notes                                   |
| ---------------- | ----- | --------------------------------------- |
| `id`             | uuid  | Action ID.                              |
| `intent_type`    | text  | e.g., `SyncClicked`.                    |
| `service_target` | text  | Repository/effect to invoke.            |
| `guard_policy`   | text  | Conditions before execution.            |
| `signal_updates` | jsonb | Mutation descriptors for store signals. |

### 3.5 `refer_assets`

Optional static assets or content blocks referenced by primitives.

### 3.6 `refer_routes`

Defines top-level routes/pages for navigation & guard assignment.

### 3.7 `refer_build_logs`

| Column                | Type  | Notes                                                  |
| --------------------- | ----- | ------------------------------------------------------ |
| `id`                  | uuid  | Build entry.                                           |
| `build_id`            | text  | e.g., `refer-build-2024-05-12T18-22Z`.                 |
| `mode`                | text  | `interpret`, `materialize`, `synthesize`, `broadcast`. |
| `feature_scope`       | jsonb | Features/pages touched.                                |
| `rules_applied`       | jsonb | Ordered list with IDs + results.                       |
| `artifacts`           | jsonb | Files touched + hashes.                                |
| `warnings` / `errors` | jsonb | Structured issues.                                     |
| `duration_ms`         | int   | Perf telemetry.                                        |

---

## 4. Compiler Interface Surface

CLI entrypoint (wired via `refer.build`):

```
refer.build interpret --feature <slug> [--watch]
refer.build materialize --feature <slug> [--out src/app/features/<slug>]
refer.build synthesize --feature <slug> --regions runtime:hero,static:list
refer.build broadcast --feature <slug> --intent SyncClicked
```

Environment/config:

| Variable                                    | Purpose                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `REFER_SUPABASE_URL` / `REFER_SUPABASE_KEY` | Authoritative genome source.                             |
| `REFER_COMPILER_MODE`                       | Defaults to `materialize`; override per run.             |
| `REFER_RUNTIME_OUTDIR`                      | Path for intermediate JSON used by interpret mode.       |
| `REFER_LOG_LEVEL`                           | `info`, `debug`, `trace`.                                |
| `REFER_FEATURE_FILTER`                      | Comma-separated feature slugs when running batch builds. |

Outputs:

- Interpret: emits `dist/refer-runtime/<feature>.json` describing tree + computed props; Angular dev shell renders it live.
- Materialize: writes/updates files in `src/app/features/<feature>/` (component, HTML, SCSS, store, effects, routing module).
- Logs: append to `refer_build_logs` and local `dist/refer-logs/<build_id>.json`.

---

## 5. Hybrid Routing & Edge Orchestration

Source of truth: `codex/todo/refer.hybrid-routing.md`. Summary:

- **Routes** live in Angular (`app.routes.ts`) while refer.build mirrors them via `refer_routes` rows; `compiler_enabled` gates which path renders.
- **Theme ownership**: compiler blooms emitting `UBB.Root` must call `ReferThemeService.applyRootTheme/clearRootTheme` so multiple features can coexist.
- **IO guardrails**: components never talk to Supabase/PostgREST directly; effects call Angular services wired to Supabase Edge Functions or Cloudflare worker endpoints (e.g., `events-list`, `instant-church-load`).
- **Share surfaces**: public/share routes emit OG meta tags client-side and head fragments server-side (worker) derived from ShareIdentity rows.
- **Hybrid fallback**: if `compiler_enabled=false`, the legacy component stays active; refer.build interpret/materialize becomes a no-op, preserving safe rollback.

All blooms must cite these rules in their checklist before flipping `compiler_enabled=true`.

## 5. Pipeline Walkthrough

1. **Ignition**: `refer.build` validates mode, resolves feature scope, authenticates to Supabase using Ignition sequence (Codex handles secrets via env policy).
2. **Ingestion**: Fetch primitives, instances, rules, routes, actions. Cache primitives by ID; sort instances by `depth` and `order_index`.
3. **Graph Assembly**: Build adjacency map keyed by `parent_id`. Validate referential integrity; raise violation to `refer.errors.md` path if missing nodes.
4. **Inference & Rules**:
   - Prepass: apply `phase=ingest` rules (e.g., default guards, auto props).
   - Layout inference: evaluate `rule_hints` + `tokens` to determine CSS grids, stacking.
   - Workflow inference: match intents to `refer_actions`, map into Telechurch store/effects skeleton.
5. **Expansion**:
   - Merge primitive templates with instance props (validated against schema).
   - Produce intermediate objects (TS AST, HTML template string, style tokens, store/effects definitions).
6. **Materialization** (mode-dependent):
   - Interpret: save intermediate graph to runtime store.
   - Materialize: render AST/templates to disk (component, store, selectors, effects, routing, guard declarations).
   - Synthesize: split graph into runtime vs static regions using CLI flag.
7. **Validation**: Run formatters/lint (or inject tasks into Codex plan). Diff summary for QC.
8. **Logging**: Persist build entry with rules applied, artifacts, warnings. Provide `qcChecklist` stub referencing tests run.

---

## 6. Hybrid Operating Mode (Current Modus Operandi)

Until every feature migrates, REFER.OS runs in **hybrid mode**:

1. **Feature flag**: `refer_instances.compiler_enabled` (or a future feature-scoped table) defaults to `false`. New features set it to `true` once their primitives exist.
2. **refer.build behavior**:
   - For flagged features, `refer.build` delegates to `refer.compiler` (interpret + materialize) and writes output under `src/app/features/**`.
   - For unflagged features, `refer.build` preserves the legacy manual workflow (lint/tests only).
   - During migration, `refer.build` can run both paths for a flagged feature (compile + compare to legacy) before flipping the flag permanently.
3. **New work first**: All new features should be authored as UBB primitives/instances from day one, using the compiler pipeline for their entire structure.
4. **Legacy backfill**: Once the compiler stabilizes, existing manual features are captured into UBB data and their flags set to `true`, one route at a time.
5. **Session awareness**: Because Codex can lose context between chats, this blueprint plus `refer.compiler.md` serve as the source of truth announcing the hybrid mode. Any Codex session that reads these files knows to honor `compiler_enabled` flags and the dual-path refer.build behavior.

Document any feature-level overrides or migration status in `refer.todo.md` or a forthcoming compiler status file so future agents can see which routes are compiler-backed.

---

## 6. Inference Map (Draft)

| Input Signal                                                 | Derived Result                            | Usage                                   |
| ------------------------------------------------------------ | ----------------------------------------- | --------------------------------------- |
| Primitive `rule_hints.layout` + Instance `tokens.grid`       | CSS/Tailwind class list                   | Materialized component templates.       |
| Primitive `rule_hints.intent` + Instance `props.intent`      | Intent definition + dispatch wiring       | Store facade & component outputs.       |
| `refer_rules` `trigger=primitive=UBB.Route`                  | Guard injection and route module metadata | `app-routing.module.ts` updates.        |
| Instance `props.dataSource` + `refer_actions.service_target` | Repository injection path                 | Effects wiring under `src/app/core/**`. |
| `rule_hints.broadcast`                                       | WebSocket/Signal attachments              | Later broadcast mode.                   |

This map should expand as new rules/inputs appear; store updates in `refer.compiler.inference.md` once stabilized.

---

## 7. Logging, QC, and Safety

- Every compiler run emits a local JSON log and queues Supabase inserts so the backlog replays into `refer_build_logs` as soon as credentials are available. `refer.build qc` shells to `npm run test`, `npm --prefix wrangler run test`, then `npm run build` so blooms check both Angular readiness and worker guards before logging.
- Violations (missing primitive, schema mismatch, rule failure) halt the run and write structured error docs under `REFER.OS/refer.errors/<build_id>.md`.
- QC script (`npm run policy:check` or `refer.build qc`) consumes the build log, verifies bilateral interpret/materialize parity (hash comparison).
- Post-build, Codex answers QC interrogatory referencing the build ID before running `npm run commit:auto`/`commit:verified`.

---

## 8. Readiness Checklist

Before implementing the compiler, ensure:

1. Supabase schema migrations for tables above are applied and seeded with sample primitives (`UBB.Button`, `UBB.Section`, `UBB.Route`).
2. Angular dev shell is ready to load runtime JSON (interpret mode) and mount features under `src/app/features`.
3. CLI wrapper (`refer.build`) accepts `interpret`, `materialize`, `synthesize`, `broadcast` commands with feature filters.
4. Logging pipeline writes to local disk, queues Supabase inserts, and links to QC automation once credentials unlock the service role.
5. Guardrails (AGENTS.md MVI expectations, lint rules) integrate with generated files (e.g., OnPush defaults, signal-based stores).

Once the checklist passes, implement Milestone 1, capture learnings, and iterate through the ladder.

---

Seed blueprint complete-ready for execution.

## 9. Current Status (2025-12-13)

- `/events` serves as the first compiler-backed route: interpret emits `dist/refer-runtime/events.json` while materialize writes runtime JSON, primitive maps, Angular component HTML/SCSS/TS, and a signal-based store + effects that delegate IO to `EventsService.fetchEvents` (mirrors `refer_actions.service_target`).
- `refer.build materialize --feature events` also injects the route into `app.routes.ts`, so `/events` renders the generated blossom while `/refer-runtime/events` mirrors the runtime tree for inspection.
- Logging persists every run under `dist/refer-logs/<build_id>.json`, queues Supabase inserts, and replays them to `refer_build_logs` once the environment provides `REFER_SUPABASE_*`.
- Next milestones: finalize Supabase credentials for live log ingestion, add Angular unit specs so the Jest pass exercises real coverage, and seed `/events/share` + SEO surfaces so compiler blooms cover OG metadata.

---

## 10. OG Blueprint Reference

- Open Graph intent, projections, and the immutable `<head>` contract live in `refer.og.md`. All compiler/runtime OG work (ShareIdentity projections, share routes, SEO blooms) must follow that spec.

### 3.6 `refer_theme_tokens`

| Column                      | Type        | Notes                                                  |
| --------------------------- | ----------- | ------------------------------------------------------ |
| `id`                        | uuid        | Token ID.                                              |
| `token_key`                 | text        | Unique key (e.g., `color.surface`).                    |
| `category`                  | text        | color, shadow, radius, font, spacing, etc.             |
| `value`                     | jsonb       | Token payload (hex value, font family, CSS var, etc.). |
| `created_at` / `updated_at` | timestamptz | Audit.                                                 |

Tokens are referenced by primitives via `style_tokens` (e.g., `card.bg = token(color.surface)`) so changing a palette updates every generated component.

<a id="refergithubmd"></a>

## refer.github.md

# refer.github.md - GitHub operating model (Telechurch E2E)

This document is the GitHub-side source of truth for how we work going forward in this repo. It aligns with:

- `REFER.OS/refer.branch.md`
- `REFER.OS/refer.commit.md`
- `AGENTS.md` (automation + merge workflow)

## 1. Repo facts

- Repository: `lightedcandle/telechurch-e2e`
- Primary app: Angular project `telechurch-e2e` (repo root)
- Governance: `REFER.OS/*` is canonical (legacy `codex/governance` submodule has been removed)

## 1.1 Universal governance (cross-app)

To share governance across multiple applications, publish `REFER.OS/` as a standalone governance repository and consume it as a submodule mounted at `REFER.OS/` in each app repo.

Steps: see `governance/PUBLISH.md`.

## 2. Branching + lineage (forward-only)

- `main` is the stable, deployable line.
- `dev` is the integration lane (optional, but supported by automation).
- New work defaults to `feat-beta/<feature>`; promotion to stable uses `feat/<feature>` (see `AGENTS.md`).
- No history rewrites on shared branches: fix regressions with forward commits.
- Keep working trees clean: commit or stash before switching context.

Helpful scripts:

- `npm run branch:start` / `npm run branch:start:beta`
- `npm run branch:sync` / `npm run branch:publish` / `npm run branch:finish`

## 3. Local checks (what CI expects)

Run these before you push or promote:

- `npm run env:scan`
- `npm run policy:check` (or `npm run policy:check:strict`)
- `npm run typecheck`
- `npm run lint`
- `npm test --if-present -- --ci`
- `npm run build`

## 4. GitHub Actions (what runs in GitHub)

Core workflows:

- `./.github/workflows/ci.yml` runs env scan + policy + typecheck + lint + tests + build on PRs and on pushes to `main`, `feat/**`, `feat-beta/**`.
- `./.github/workflows/ci-pr.yml` runs the same checks for PRs targeting `main` or `dev`.
- `./.github/workflows/policy.yml` runs strict policy checks on PRs/pushes to `main`.
- `./.github/workflows/docs.yml` runs `npm run docs:ci` on pushes to `main`.

Automation workflows:

- `./.github/workflows/auto-merge.yml` enables squash auto-merge when a PR has label `automerge-ready` (only for same-repo branches).
- `./.github/workflows/release-please.yml` runs Release Please using `release-please-config.json` + `.release-please-manifest.json`.
- Cloudflare Pages deploys are wrangler-only (intentionally no GitHub Actions deploy workflow); see `REFER.OS/refer.cloudflare.md`.

## 5. GitHub auth: pushing workflow files

If you change anything under `./.github/workflows/*`, GitHub requires an auth token with the `workflow` scope to push.

Using GitHub CLI:

- Check scopes: `gh auth status`
- Add scope: `gh auth refresh --hostname github.com -s workflow`
- Retry push: `git push origin <branch>`

## 6. PR conventions

- Use `./.github/pull_request_template.md` as the default checklist.
- CODEOWNERS: `./.github/CODEOWNERS`
- Auto-merge: add label `automerge-ready` after checks are green and review is complete.

## 7. Dependabot

Dependabot runs weekly for:

- npm (`package.json` / `package-lock.json`)
- GitHub Actions (`./.github/workflows/*`)
- devcontainers

Config: `./.github/dependabot.yml`

## 8. Known gotchas (guardrails)

- Large assets: GitHub warns >50MB; deployments also have file-size constraints (Cloudflare Pages deploy flow includes a >25MiB guard). Prefer compression and/or Git LFS for big media.
- If you still see references to `codex/governance`, treat them as historical only; do not reintroduce a governance submodule without a `refer.governance:` decision.

<a id="referexpandmd"></a>

## refer.expand.md

# refer.expand.md — Expansion Action Reference

Use `refer.expand` when introducing new capabilities that stretch identity or structure boundaries (beyond routine builds). This action ensures emerging domains follow REFER.OS governance before they become part of the canonical system.

## 1. Expansion intent

- **Trigger:** `refer.expand: <concept>` or natural-language directive describing a capability that alters identity (new workflow domain, new broadcast signal, novel provider integration).
- **Purpose:** Document how the expansion affects `refer.identity.md` (identity), `refer.structure.md` (structure), inference patterns, and system/provider relations before implementation.

## 2. Expansion flow

1. **Identity discovery:** Update `refer.identity.md` with the new identity nodes (e.g., new workflow, experience).
2. **Structure review:** Add sections to `refer.structure.md` and `inference.md` describing how the expansion integrates UI/workflow/broadcast and ASEDAWSI/EWCPSI patterns.
3. **Relation mapping:** Declare any new systems/providers in `refer.<system>.md` or `refer.provider.<provider>.md`. If the expansion touches Supabase or Cloudflare, cite those documents.
4. **RETURN/COMMIT planning:** Track how RETURN will verify the expansion, then follow commit/branch rules before publishing.

## 3. Documentation

- Record the expansion rationale and new identity/structure references so future prompts automatically route to the expanded domain.

<a id="referdesignlabmd"></a>

## refer.designlab.md

# refer.designlab.md — Design Lab & Compiler Integration

Design Lab remains REFER.OS’s visual law engine, but every prototype now has a clear path into the compiler-driven pipeline. This doc explains how immutable/semantic identities, tokens, and experiments flow into UBB data so `refer.build` can materialize them deterministically.

---

## 1. Layered Identity (Immutable → Semantic → Derivative)

- **Immutable identity** names the primitive (IMSCE scope, DOM selector, component class). Once promoted, this identity lives in `refer_primitives` (TS/HTML/SCSS templates, `style_tokens`, `rule_hints`).
- **Semantic identity** conveys meaning states (active, muted, highlight, danger, success, warning, info). Each immutable primitive exposes semantic slots documented in `refer.structure.md` and encoded as token hooks so stores/effects can reference them.
- **Derivative rules** translate immutable + semantic inputs into visual treatments (brighten, saturate, deepen-shadow for active; darken, flatten, reduce opacity for muted). These rules must map to theme tokens so the compiler can render them consistently.

---

## 2. Experimental Workflow (Compiler-Aware)

1. **Prototype safely** inside `/designlab` or `experiments/<feature>`. Record the immutable+semantic pair in `refer.identity.md` and mark the identity as experimental in the registry so the router knows it isn’t canonical yet.
2. **Capture tokens in data**. Do not leave theme values in SCSS alone—mirror every approved token into Supabase so the compiler can consume them:
   - Use `refer_primitives.style_tokens` for per-primitive palettes.
   - Use (or introduce) a `refer_theme_tokens` table for global palettes, typography, spacing, etc.
   - Attach derivative metadata as JSON (`rule_hints`, `design_tokens`) so `refer.build` can apply them.
3. **Document inference**. Update `refer.structure.md` and `refer.inference.md` with the reasoning behind new identities/tokens. These notes justify the semantic slots and help future promotions reuse the same logic.
4. **Respect system guards**. Asset sizing, secret handling, and branch etiquette follow `refer.build.md` and `refer.systems.security.md` even in lab mode. Compress media before storing it, mark experimental buckets clearly, and keep labs detached from production branches until promoted.

---

## 3. Promotion Path (Lab → Compiler)

When a prototype succeeds:

1. **Encode tokens + templates**: move finalized TS/HTML/SCSS into the relevant primitive definition under `refer_primitives`.
2. **Seed instances**: add/update rows in `refer_instances` so features reference the new identity (include semantic props/tokens as needed).
3. **Run `refer.build materialize --feature <slug>`** to regenerate Angular artifacts. The compiler now emits components referencing your canonical tokens.
4. **QC**: run `refer.build qc` (Jest placeholder, wrangler Vitest, Angular build). Log the build ID in `refer.qc.md` and note the promotion in `refer.compiler.init.md`.
5. **Update todos/docs**: move the lab item from idea → active track in `codex/todo/refer.todo.json`, record the status in `refer.designlab` notes, and update `refer.qc.md` with the RETURN answers.

Until these steps finish, keep work in the lab sandbox (no `refer.branch`/`refer.commit`).

---

## 4. Codex Signals

- Saying `refer.designlab` tells the agent to operate inside the lab sandbox: create/update experiments, record immutable/semantic pairs, and manipulate token data without promoting.
- Once you say “promote” (or explicitly call for compiler integration), the agent moves tokens/templates into Supabase, runs `refer.build`, and documents the change. This ensures Codex never silently bypasses lab governance.

---

## 5. Alignment with Theming & `/referdesign`

- `/referdesign` is the live preview surface compiled from these tokens. After promotion, regenerate `/referdesign` with the compiler so it reflects the canonical palette.
- Feature theming (e.g., `/events` bloom) must reference the same token registry. Design Lab owns the tokens; the compiler distributes them by reading the Supabase entries you authored.
- Order of operations for theming:
  1. Prototype in lab → validate immutable/semantic pair.
  2. Persist tokens to Supabase (`refer_primitives.style_tokens`, `refer_theme_tokens`).
  3. Regenerate `/referdesign` + the target feature via `refer.build`.
  4. Run QC + manual inspection; log results.

---

## 6. Future Hooks

- OG share cards will reuse this pipeline: treat OG visuals as a semantic variant of cards/sections governed by the same tokens.
- Broadcast overlays, OBS/Daily surfaces, and future IMSCE themes will inherit from the same registry once those features move into compiler mode.

<a id="referidentitymd"></a>

## refer.identity.md

# refer.identity.md — Identity Registry for REFER.OS

This is the canonical identity registry for REFER.OS. Before any action (`refer.build`, `refer.repair`, `refer.expand`, etc.) proceeds, the router must be able to name the identities involved (feature/workflow/broadcast/system/provider) and point to their authoritative locations.

## 1. What belongs here

- **Identity names**: canonical names for workflows, features, broadcasts, providers, and systems.
- **Identity anchors**: where each identity lives in the repo (paths and entry points).
- **Identity invariants**: constraints that must remain true (view-only components, no IO in views, signal/store boundaries).

## 2. Living identity recognizers

These are vocabulary (identity), not procedure (implementation).

- **Mind (workflow)**: ASEDAWSI (Action → Service → Guard → Edge/Signal → UI), anchored under `src/app/workflows/**`.
- **Spirit (broadcast)**: EWCPSI (Event → WebSocket → Channel → Policy/Guard → Signal → Insight), anchored under `src/app/core/realtime/**`.
- **Body (UI)**: IMSCE (Intent → Model (signal) → Structure → Components → Experience), anchored under `src/app/features/**`.

## 3. Identity-bearing artifacts

Keep pointers to the artifacts that define or constrain identities:

- Workflow/structure maps used by governance and tooling.
- Lineage & QC logs that prove RETURN → COMMIT → PUBLISH coherence.
- Guard/policy surfaces that enforce boundaries (workflow guards, security contexts).

If a refer action depends on one of these artifacts, it must cite it and this registry must point to its canonical location.

## 4. How it is used

- `refer.md` consults this registry to confirm the request is anchored to known identities before it consults `refer.structure.md` (structure) and `inference.md` (unfolding).
- When new work introduces a new identity (feature/workflow/broadcast/provider/system), add it here first, then update `refer.structure.md` and `inference.md` as needed.

## 5. Cross-links

- Router: `refer.md`
- Structure map: `refer.structure.md`
- Unfolding map: `inference.md`
- Law/QC: `refer.law.md`, `refer.qc.md`

<a id="referhoneycombmd"></a>

## refer.honeycomb.md

# refer.honeycomb.md — The Biological Design Genome

# refer.honeycomb.md — The Biological Design Genome

The Honeycomb System is the **Structural Atmosphere** of REFER.OS. It uses a biological metaphor to govern how color identity (Pollen) resonates through the physical hierarchy (IMSCE) using intensity levels (Phases) and material transformations (Switches).

## 1. The IMSCE Resonance (Target)

Aesthetics are not assigned; they are **Reflected** based on an element's position in the lineage.

### The Tree Analogy (Biological Hierarchy)

The app is a Tree. Fruit cannot grow on the Trunk. Structure must follow nature:

| Level           | Role              | Analogy     | Default Phase     | Shape                 |
| :-------------- | :---------------- | :---------- | :---------------- | :-------------------- |
| **0 (Root)**    | Repository        | Roots       | Phase 0           | Invisible             |
| **I (Index)**   | Ambient Ground    | Trunk       | Phase 1 (Pollen)  | Square (Full Bleed)   |
| **M (Modal)**   | Focused Overlay   | Main Branch | Phase 2 (Blossom) | Rounded (Floating)    |
| **S (Section)** | Structural Region | Sub Branch  | Phase 3 (Bloom)   | Rounded (Island)      |
| **C (Card)**    | Identity Unit     | Leaf Branch | Phase 4 (Super)   | Rounded (Island)      |
| **E (Element)** | Interaction Unit  | Fruit       | Phase 5 (Hyper)   | Rounded (Interactive) |

**The Law of Growth**: Use the phase to determine the specific aesthetic. If a component feels wrong, do not paint it; **Replant it**.
**The Law of Proximity (Strict Lineage)**: Nature does not skip generations. A Phase N element MUST grow on a Phase N-1 element.

- **Illegal**: Fruit (5) on Section (3). (Gap!)
- **Legal**: Fruit (5) on Card (4) on Section (3).
  A Fruit (E) trying to grow on a Section is a "Wild" violation and must be domesticated by inserting a Leaf (Card).

### IMSCE Inference (Honeycomb)

Honeycomb infers IMSCE identity purely from nesting depth and modal behavior.
See `refer.structure.md` for canonical IMSCE identity, nesting, and modal/card rules.

Depth mapping:

- 1 = Index (I) -> Phase 1
- 2 = Modal (M) -> Phase 2
- 3 = Section (S) -> Phase 3
- 4 = Card (C) -> Phase 4
- 5 = Element (E) -> Phase 5
- E+ remains Element identity.

Modal kind inference:

- 2P = Page modal (in-flow, no scrim)
- 2F = Floating modal (overlay + scrim)
- 2L = Locked modal (persistent dock, no scrim)
- 2N/2S/2E/2W = News modal (directional slide)

Invalid states are disallowed and must be reclassified to the correct modal kind or treated as build violations.

### Modal Types (M)

Modal is a focused overlay layer with distinct subtypes:

- **Page modal**: persistent, embedded on the page (in-flow modal surface).
- **Floating modal**: popup overlay with scrim (hovering above Index).
- **News modal**: slide-in panels (down, left, right, or up).

---

## 2. The Genetic Switches (Enzymes)

Switches are theme-agnostic instructions. Their specific rendering is defined by the **Theme Family**.

| Switch | Name        | Logic                                      |
| :----- | :---------- | :----------------------------------------- |
| **F**  | Flat        | Solid opaque surface.                      |
| **G**  | Gradient    | Non-linear blend / depth.                  |
| **T**  | Translucent | Fractional opacity / Backdrop blur.        |
| **S**  | Shadow      | Neutral elevation (Gray/Dark).             |
| **W**  | Glow        | Atomic radiance (Theme-colored).           |
| **A**  | Anchor      | Text-Shadow for high-contrast readability. |
| **R**  | Rounded     | Soft corner geometry.                      |
| **P**  | Pattern     | Micro-texture (Grain/Noise).               |
| **L**  | Lighting    | Specular highlight / Top-edge shimmer.     |

### Layered Background Rule

Honeycomb treats background layers as additive, not overriding:

- Image layer (top): `bg-image`
- Gradient layer (middle): `bg-gradient`
- Solid layer (base): `bg-color`

Rendering order (top -> bottom):

1. background image
2. background gradient
3. background color

If a layer is missing, the next available layer shows through.

---

## 3. The 5 Apex Families (Species)

Every theme belongs to a **Family** which dictates how the Genetic Switches are interpreted.

| Family      | Vibe     | Rendering Focus                   |
| :---------- | :------- | :-------------------------------- |
| **Lithic**  | Stable   | Opaque, sharp, high contrast.     |
| **Vitro**   | Ethereal | Glass, blur, specular highlights. |
| **Velvet**  | Soft     | Clay-like, inner glows, pastels.  |
| **Neon**    | Radiant  | Pure darks, vibrant outer halos.  |
| **Organic** | Tactile  | Micro-noise, paper, grain.        |

---

## 4. The Resonant DNA String

Every visual element in REFER.OS can be described by a code string:
`[Target] : [Phase] + [Switches]`

_Example (Card):_ `C:3+GS+R` (Card at Bloom phase, with Gradient, Shadow, and Rounded corners).

---

## 4.1 Theme Token Key Naming

Theme tokens are IMSCE-scoped and optionally element-typed. Format:

```
<Layer>[.<ElementType>].<Attribute>
```

Layers:

- `I`, `M`, `S`, `C`, `E`

ElementType (optional, only for E-layer overrides):

- `button`, `field`, `text`, `chip`, `dot`, `media`, `label`, `details`, `badge`

Attributes (baseline set):

- `surface`
- `surfaceGradient`
- `surfacePattern`
- `text`
- `textMuted`
- `border`
- `shadow`
- `radius`

Examples:

- `I.surface`
- `M.surfaceGradient`
- `C.border`
- `E.surface`
- `E.button.surface`
- `E.field.border`

Notes:

- Use element-typed keys only when a theme needs explicit overrides.
- Background images are reserved for texture/pattern (not content).

### Canonical Token Keys (Baseline)

Layer keys (IMSCE):

- Index (I):
  - `I.surface`
  - `I.surfaceGradient`
  - `I.surfacePattern`
- Modal (M):
  - `M.surface`
  - `M.surfaceGradient`
  - `M.surfacePattern`
- Section (S):
  - `S.surface`
  - `S.surfaceGradient`
  - `S.surfacePattern`
  - `S.border`
  - `S.shadow`
  - `S.radius`
- Card (C):
  - `C.surface`
  - `C.surfaceGradient`
  - `C.surfacePattern`
  - `C.text`
  - `C.textMuted`
  - `C.border`
  - `C.shadow`
  - `C.radius`
- Element (E):
  - `E.<type>.surface`
  - `E.<type>.surfaceGradient`
  - `E.<type>.surfacePattern`
  - `E.<type>.text`
  - `E.<type>.textMuted`
  - `E.<type>.border`
  - `E.<type>.shadow`
  - `E.<type>.radius`

Element type legend:

- `button`: primary and secondary action buttons
- `field`: input, textarea, select, toggle/switch, checkbox, radio
- `chip`: tags, pills, status chips
- `dot`: status dot/indicator
- `icon`: functional iconography
- `media`: image/video/icon containers
- `badge`: compact label badges

## 5. Governance Laws

1.  **Exclusivity**: An element cannot have both **S (Shadow)** and **W (Glow)** unless specifically authored as a mutation.
2.  **Hierarchy**: A child phase must be $\ge$ its parent phase to ensure contrast (Pollen $\rightarrow$ Blossom $\rightarrow$ Bloom).
3.  **Anchoring**: If the background is **T (Translucent)** or **G (Gradient)**, the text must trigger the **A (Anchor)** switch.
4.  **The Law of Inheritance (Verticality)**:
    - Components (2S, 2L) do **not** inherit from other components (2P). They inherit from the **Phase (Registry)**.
    - **2P (Page Modal)** is the _Firstborn_, setting the visual expectation.
    - **2S (Menu Modal)** is a _Sibling_.
    - Both must drink from the same **M (Mother)** variable in the Registry.
    - _Violation:_ `2S` copying styles from `2P` css.
    - _Correction:_ Both pointing to `var(--refer-m-surface)`.

<a id="refergovernancemd"></a>

## refer.governance.md

# refer.governance.md — Governance Action Reference

`refer.governance` is the routing command for updating REFER.OS laws, structures, or identity definitions (per `REFER.OS/refer.os.md` §9). Use this action whenever governance documents (`refer.os.md`, `refer.law.md`, `refer.identity.md`, `refer.structure.md`, `inference.md`) must change.

## 1. Governance intent

- **Trigger**: `refer.governance: <reason>` or an instruction that Codex classifies as modifying REFER.OS governance.
- **Purpose**: follow the governance update path (Reason → Referral → Reference Review → Structural Reconciliation → Identity Reconciliation → RETURN → COMMIT → PUBLISH) while limiting changes to governance files.

## 2. Governance flow

1. **Reason**: Capture why the law/structure/identity needs updating; document contradictions or emergent domains.
2. **Referral**: Confirm Codex routes the request via `refer.md` and that `refer.governance` is the target domain.
3. **Reference review**: Identify all affected reference files (`refer.os.md`, `refer.law.md`, `refer.identity.md`, `refer.structure.md`, `inference.md`, any system/provider references) and limit edits to them.
4. **Structural reconciliation**: Evaluate structural mappings (UI/workflow/broadcast, ASEDAWSI) to prevent circular logic.
5. **Identity reconciliation**: Update identities in `refer.identity.md` only when necessary; avoid creating conflicting lineage records.
6. **Return/Commit/Publish**: Run RETURN validation (tests, audits), commit with the law-based message (per `refer.law.md`), and publish (git push, trigger deployments if required).

## 3. Documentation

- Record the governance update reason, the files changed, and the finalized state in `refer.os.md` or refer.law so future agents know why the system evolved.

<a id="refercompilermetricsmd"></a>

## refer.compiler.metrics.md

# refer.compiler.metrics.md

Canonical "compiler coverage" metrics for REFER.OS.

This exists to avoid confusion when we say "fully compiler-driven" or "100% compiler".

---

## 1) The One-Sentence Definition

**"100% compiler-driven" means UI decisions can be changed by editing REFER data (DB/runtime) without changing Angular templates for that page.**

Notes:

- "100% compiler-driven" does **not** mean "no code". Store/effects/guards/renderers remain code by design.
- "Compiler-driven" is about **what is governed by data** (structure, selection, tokens, copy), not about whether an engineer wrote TS.

---

## 2) Coverage Axes (the canonical scorecard)

We report compiler coverage per page across these axes:

1. **Copy** (text, labels, empty states)
2. **Selection** (which template/variant a page uses)
3. **Presentation** (sections/layout/structure of the page)
4. **Cards** (card design spec + state variants)
5. **Behavior** (IO, navigation, guards, workflows)

Each axis is measured independently; don't collapse to a single number unless you explicitly say how you weighted it.

---

## 3) The Scale (0 -> 100% per axis)

Use this scale per axis:

- **0%**: Hardwired in Angular templates/styles.
- **25%**: Mostly hardwired, but with some runtime/config toggles.
- **50%**: Data exists, but still mirrored in code and must be changed in both places.
- **75%**: Data is primary; code is a thin adapter; small hardcoded fallbacks remain.
- **100%**: Data is authoritative; swapping DB/runtime values changes output with no template edits.

---

## 4) What "100%" Means per Axis (plain language)

### 4.1 Copy (100%)

All user-facing page copy (titles, headings, placeholders, empty states) comes from DB/runtime (e.g., `refer_page_templates.spec`) and can be changed there.

**Still allowed in code:** fallback defaults if DB is missing.

### 4.2 Selection (100%)

The page chooses templates/variants by DB/runtime mapping, not by hardcoded `if (code === "tri7")` logic.

Example mapping fields (page-driven):

- `spec.directory.cardTemplateCode`
- `spec.events.upcomingCardTemplateCode`
- `spec.events.pastCardTemplateCode`
- `spec.actions` (optional action-key mapping for intent dispatch)

At 100% selection, you can change "tri7 -> tri9" in the DB and the page uses the new template without changing TS/HTML.

### 4.3 Presentation (100%)

The page's section layout is described by REFER data (UBB instances / page template spec sections) and rendered by a page renderer.

At 100%, you can reorder/add/remove sections in DB/runtime and the page structure changes accordingly.

**Important:** this usually requires a `page-renderer` abstraction; if there is no page renderer and the page HTML is still bespoke, this axis is not 100%.

Practical schema (recommended):

- `spec.presentation.layout.sections[]` with `{ id, kind, region, enabled?, props? }`

### 4.4 Cards (100% data, renderer still code)

Card _design_ is represented as data:

- container (bg/corners/border/shadow/padding)
- slots + layout kind
- state variants (private/live/etc)
- atomic building blocks (atoms) and their media/text rules

At "100% cards", the data fully specifies the card and the renderer is a stable interpreter.

**Renderer stays code by design:** the interpreter component is not expected to be DB-authored.

### 4.5 Behavior (intentionally not 100%)

Behavior includes:

- IO/data fetching
- auth/guards
- navigation
- timers
- workflow/service calls

These should remain in store/effects/services (Mind lane). The compiler can _wire_ events to intents, but it shouldn't move IO into DB.

Typical "healthy" target:

- **0-10%** behavior coverage (compiler emits events/intents; code executes them)

---

## 5) Reporting Template (use this in chats/docs)

When reporting "how compiled" a page is, use this format:

- **Copy:** X%
- **Selection:** X%
- **Presentation:** X%
- **Cards:** X% (data) + renderer (code)
- **Behavior:** X% (by design)

Then add one sentence that defines what "100%" means for this page (usually Selection + Copy; sometimes Presentation too).

---

## 6) Example: `/orgs-c` (the reference example)

For `/orgs-c`, we treat "100% compiler-driven" as:

- Copy is DB-driven (`refer_page_templates`).
- Template selection is DB-driven (page spec chooses template codes).
- Card designs/atoms are DB-driven (`refer_card_templates`).

But:

- Page layout/presentation is still a bespoke Angular template unless/until a page renderer is introduced.
- IO/navigation remains store/effects by design.

---

## 7) Registry + Drift Alerts (non-blocking)

- Canonical per-page status + percentages live in `REFER.OS/refer.compiler.pages.md`.
- Use `npm run compiler:scan` to emit a non-blocking report that flags:
  - routed pages missing from the registry
  - routed page components missing a compiler header (optional)
  - obvious "drift candidates" (large inline templates / missing plan links)

<a id="refercompilermd"></a>

## refer.compiler.md

# ⭐ **refer.compiler.md**

**The Materialization Engine of REFER.OS**

This is the foundational seed document for `refer.compiler`, the subsystem that expands meaning into form.

## 1. Purpose & Philosophy

`refer.compiler` is the **unfolding mechanism** of the architecture.
Where `refer.md` routes intent and `refer.law` governs lineage, the compiler takes the **App Genome** (UBB Primitives, Instances, Rules) from Supabase and **expands** it into executable artifacts (Components, Routes, Styles).

> **The Seed becomes the Structure.**
> **The Structure becomes the System.**

### 1.1 Core Principles

1.  **Referential Architecture:** No duplication. Everything is a reference to a UBB primitive.
2.  **Database as Repo:** Supabase is the "source of truth." The application host (Angular/React) is ephemeral.
3.  **Self-Executing Expansion:** The compiler does not "generate code" in the traditional sense; it executes the structure.

### 1.2 The Choice of Gifts

The compiler is agnostic. It consults **`refer.talents.md`** to discern which Gift (Language) determines the materialization.

- It may summon **Angular** to build the Body.
- It may summon **HTML** to build the Face.
- It may summon **Node** to orchestrate the Mind.

This decision is driven by the **Discernment Matrix**, ensuring we articulate the intent using the most effective language for the task.

---

## 2. Operation & Workflow

The compiler is triggered via `refer.build` or `refer.compiler`. It does not run implicitly; it must be invoked.

### 2.1 The Workflow

1.  **Ingestion:** Reads `refer_primitives`, `refer_instances`, `refer_rules` from the Genome.
2.  **Graph Assembly:** Reconstructs the UI tree (`parent_id → children[]`).
3.  **Expansion:** Applies primitive templates, props, and rules to generate intermediate structures.
4.  **Materialization:** Writes artifacts to disk (`src/app/features/**`) or memory (Runtime Mode).

### 2.2 Modes

- **interpret:** Runtime rendering for development hot-loops.
- **materialize:** Generates static source files for deployment.
- **synthesize:** Hybrid mode (some pages runtime, some materialized).
- **broadcast:** Attaches workflow/realtime logic.
- **clean:** Purges generated artifacts.

---

## 3. Coverage & Metrics ("The Scorecard")

We define "Compiler Driven" coverage across 5 axes. "100%" means a change in the DB reflects in the app without code edits.

| Axis             | Definition                     | 100% Target                                  |
| :--------------- | :----------------------------- | :------------------------------------------- |
| **Copy**         | Text, labels, empty states     | Sourced from `refer_page_templates`          |
| **Selection**    | Which template/variant is used | Mapped via DB/Runtime                        |
| **Presentation** | Layout, section ordering       | Defined by UBB Instance Tree                 |
| **Cards**        | Card design & state variants   | `refer_card_templates` + Generic Renderer    |
| **Behavior**     | IO, Guards, Navigation         | **0-10%** (Intentionally kept in Code/Store) |

> **Note:** For specific app status, see your application's Definition File (e.g., `refer.telechurch.md`).

---

## 4. Artifacts

- **Blueprint:** `REFER.OS/refer.compiler.blueprint.md` (Detailed Interface Spec)
- **Logs:** `refer_build_logs` (Supabase)
- **Output:** Source Code (`src/...`) or Runtime JSON (`dist/...`)

<a id="refercompilerinitmd"></a>

## refer.compiler.init.md

# refer.compiler.init.md

Initialization playbook for bringing the Refer compiler online. Tracks execution phases separate from the canonical blueprint.

---

## 1. Scope & Goals

- Stand up the refer\_\* (UBB) schema, ingestion services, and CLI surface described in `refer.compiler.blueprint.md`.
- Pilot `/events` as the first fully compiler-backed feature (interpret + materialize).
- Keep progress visible via checklists aligned to the Milestone ladder (M1–M4).

- Use the canonical compiler coverage scorecard when reporting “how compiled” a page is: `refer.compiler.metrics.md`.

---

## 2. Phase Checklist

### Phase 0 — Foundations

| Item                                                                                                                                                      | Owner            | Status | Notes                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create Supabase migrations for `refer_primitives`, `refer_instances`, `refer_rules`, `refer_actions`, `refer_assets`, `refer_routes`, `refer_build_logs`. | Platform (Codex) | ✅     | `supabase/migrations/2025121101_create_refer_compiler_tables.sql` applied via `supabase db push` (remote schema ready).                                             |
| Update environment wiring (`REFER_SUPABASE_URL`/`KEY`) for compiler runs.                                                                                 | DevOps           | ☐ → ⏳ | Added `refer` entry to `codex/env_context_map.yaml` requesting `REFER_SUPABASE_URL` + `REFER_SUPABASE_SERVICE_ROLE_KEY`. Need to populate secrets + resolver usage. |
| Stub CLI entrypoints (`refer.build interpret/materialize`) with no-ops.                                                                                   | Tooling          | ☐ → ✅ | Added `scripts/refer_build.cjs` + `npm run refer:build` stub logging requests.                                                                                      |

### Phase 1 — Interpret Loop (M1)

| Item | Owner | Status | Notes |
| ---- | ----- | ------ | ----- |

| Implement ingestion layer: fetch
efer\_\* tables, cache primitives, sort instances. | Platform (Codex) | ✅ | ools/refer-compiler/genome.js +
pm run refer:build interpret emit dist/refer-runtime/<feature>.json. |
| Build graph assembly + validation (parent/child). | Platform (Codex) | ✅ |
esolvedTree + Refer Runtime Viewer surface adjacency, runtime-only nodes, and warnings. |
| Angular dev shell loader: consume runtime JSON and render feature placeholder. | Platform (Codex) | ✅ | /refer-runtime dev route renders payload summary + tree preview. |
| Smoke test with sample feature (demo or /events hero skeleton). | Platform (Codex) | ✅ | /events route shows the compiler output; /refer-runtime/events matches the runtime tree. |

### Phase 2 ??" Materialize (M2)

| Item                                                                       | Owner            | Status | Notes                                                                                                                                                                                                               |
| -------------------------------------------------------------------------- | ---------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Map intermediate nodes + TS/HTML/SCSS templates (signals, store, effects). | Platform (Codex) | Done   | /events component, store, and effects are generated from the runtime tree, with EventsEffects delegating IO to EventsService.                                                                                       |
| File writer: output to src/app/features/<feature>/....                     | Platform (Codex) | Done   | `refer:build materialize --feature events` writes runtime JSON, primitive map, and Angular component/store trio.                                                                                                    |
| Logging hook + refer_build_logs + dist/refer-logs/<build_id>.json.         | Platform (Codex) | Done   | CLI now emits JSON logs, queues runs when Supabase creds are missing, and replays them once the service key is added.                                                                                               |
| QA loop: run lint/tests after materialize run.                             | Platform (Codex) | Done   | `refer.build qc` now shells to `npm run test`, `npm --prefix wrangler run test` (Vitest workers), then `npm run build`, so every bloom captures Angular readiness + worker guards until feature-level specs arrive. |

### Phase 3 — /events Pilot

| Item | Owner | Status | Notes |
| ---- | ----- | ------ | ----- |

| Author /events UBB dataset (hero, list, detail, share, guards) inside
efer\_\* tables. | Platform (Codex) | ✅ | 2025121104_seed_events_refer_data.sql + friends seed hero/timeline/calendar + share/detail canvases. |
| Flag `/events` detail/share routes in `refer_instances.compiler_enabled = true`. | Platform (Codex) | ✅ | 2025121301 migration flips compiler flags so `/events`, `/events/:id`, and `/events/:id/share` materialize via refer.build. |
| Run interpret + materialize for /events; validate UI. | Platform (Codex) | ✅ | /events renders compiler-generated hero + timeline; Refer Runtime Viewer shows matching tree/runtime JSON. |
| Capture learnings + update compiler blueprint & init plan. | Platform (Codex) | ⏳ | First bloom logged here; broadcast + QC instrumentation still pending. |

### Phase 4 ??" Hybrid/Broadcast Prep

| Item                                                               | Owner            | Status      | Notes                                                                                                                              |
| ------------------------------------------------------------------ | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Define `refer_actions` rows mapping `/events` intents to services. | Platform (Codex) | Done        | `supabase/migrations/2025121105_seed_events_actions_rules.sql` seeds EventsIntent.Load/Ok/Err with EventsService + store handlers. |
| Guard injection rules (`refer_rules trigger=UBB.Route`) validated. | Platform (Codex) | Done        | The same migration auto-attaches `IgnitionGuard` to the compiler-backed `/events` route during ingest.                             |
| Document readiness in `refer.todo.json` & Codex QC logs.           | Platform (Codex) | In Progress | Blueprint + todo now reflect the logging queue + EventsService wiring; QC interrogation still needs linked build IDs.              |

### Phase 5 — Theming & OG Prep

| Item                                                            | Owner            | Status | Notes                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------- | ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Define shared palette storage (`refer_theme_tokens`).           | Platform (Codex) | ✅     | `2025121302_create_refer_theme_tokens.sql` seeds surface/accent/text/shadow/font tokens for IMSCE use.                                                                                                                                                           |
| Expose tokens in compiler payloads.                             | Platform (Codex) | ✅     | `refer.build` now loads `refer_theme_tokens` and includes them as `themeTokens` for every interpret/materialize run.                                                                                                                                             |
| Map primitives to shared tokens + emit CSS vars.                | Platform (Codex) | ƒo.    | `2025121303_update_refer_primitives_style_tokens.sql` rewires primitive `style_tokens` to semantic hooks and the materializer now maps them to role-scoped CSS vars fed by `refer_theme_tokens` (events/detail/share regenerated via `refer.build materialize`). |
| Expose ShareIdentity data in runtime payload.                   | Platform (Codex) | ƒo.    | `2025121304_create_refer_share_identity.sql` adds the canonical view, `refer.build` loads it into `shareIdentities`, and events/share blooms were regenerated so OG wiring can bind real data.                                                                   |
| Inject OG meta tags for share routes (client bridge).           | Platform (Codex) | ƒo.    | `refer.build` now injects share preview UI + Angular Meta/Title wiring for `/events/:id/share`, so ShareIdentity payloads emit OG/Twitter tags and render visible summaries ahead of full SSR head orchestration.                                                |
| Emit static ShareIdentity head fragments.                       | Platform (Codex) | ƒo.    | Materializer writes `dist/refer-head/events-share/*.html` fragments (generated from ShareIdentity rows or fallback) so SSR/static hosts can inline OG/Twitter tags before HTML returns.                                                                          |
| Author ShareIdentity expansion plan (orgs/startchurch/landing). | Platform (Codex) | ?o.    | `codex/todo/refer.shareidentity.expansion.md` lists target routes, data sources, and compiler tasks for extending OG coverage beyond `/events`.                                                                                                                  |

### Phase 6 ??" Start Church Bloom (Planning)

### Phase 7 ??" Refer Design Lab Bloom (Planning)

| Item                                                                   | Owner            | Status  | Notes                                                                                                                                                                         |
| ---------------------------------------------------------------------- | ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document referdesign compiler scope + UBB tree.                        | Platform (Codex) | ?o.     | `codex/todo/refer.designlab.compiler.md` describes primitives, runtime data, and palette sourcing.                                                                            |
| Decide palette data source (extend `refer_theme_tokens` vs new table). | Platform (Codex) | Pending | Need migration plan for design lab palettes + sample copy.                                                                                                                    |
| Seed `/designlab` route + instances in refer\_\* tables.               | Platform (Codex) | Pending | Insert Root/Shell/Sections/Cards/Modal with `compiler_enabled=true` under labs guard.                                                                                         |
| Materialize referdesign feature via `refer.build`.                     | Platform (Codex) | Pending | Generate Angular blossom + runtime; wire labs route to new component.                                                                                                         |
| Retire legacy `design-lab.component.ts` after parity check.            | Platform (Codex) | Pending | Remove old component + JSON once compiler bloom verified.                                                                                                                     |
| Item                                                                   | Owner            | Status  | Notes                                                                                                                                                                         |
| ---                                                                    | ---              | ---     | ---                                                                                                                                                                           |
| Document `/startchurch` compiler scope + UBB tree.                     | Platform (Codex) | ?o.     | `codex/todo/refer.compiler.startchurch.md` captures the primitive tree, runtime content, and intent/service requirements.                                                     |
| Author refer data migration for `/startchurch`.                        | Platform (Codex) | Pending | Seed `refer_routes` + `refer_instances` (Root ? Shell ? Sections/Cards/Modal) with `compiler_enabled=true`.                                                                   |
| Capture runtime content assets (pillars, CTA, modal copy).             | Platform (Codex) | Pending | Represent copy (Simple/Affordable/Trusted pillars, Telechurch handles everything, CTA text) as structured JSON/`refer_assets` derived from `codex/todo/start_your_church.md`. |
| Generate Start Church bloom via `refer.build`.                         | Platform (Codex) | Pending | Interpret/materialize once data lands; outputs Angular component/runtime + primitive map.                                                                                     |
| Hook Start Church intents/services.                                    | Platform (Codex) | Pending | Add `refer_actions` rows + store/effects plumbing so CTA/donate/modal flows stay governed.                                                                                    |

---

## 3. Reporting & Sync

- Update this file (checkmarks + notes) after each milestone deliverable.
- Reflect status in `codex/todo/refer.todo.json` under “Standalone /events system” and a new “Compiler Init” track if needed.
- Reference build IDs from `refer_build_logs` when posting QC results.

---

## 4. QC & Build Trace

- **refer-build-2025-12-13T14-55-41-218Z-073effca-9724-43e6-813e-9ab1bba00fdf** ? `refer.build qc` (events bloom)
- **refer-build-2025-12-13T21-43-46-255Z-2ea9b4fc-155a-4960-94a7-0dcd7e518867** ? `refer.build materialize --feature events-share` (adds ShareIdentity head fragments)

- **2025-12-14** ??" Captured the Refer Design Lab compiler plan (`codex/todo/refer.designlab.compiler.md`), outlining palette ingestion + UBB layout (Phase 7).
- **2025-12-14** ??" Authored the ShareIdentity expansion plan (`codex/todo/refer.shareidentity.expansion.md`) outlining ichurch/orgs/startchurch OG targets.
- **2025-12-14** ??" Documented the `/startchurch` compiler bloom (Phase 6) in `codex/todo/refer.compiler.startchurch.md`, outlining primitives, runtime data, and migration steps.
- **2025-12-12** — `/events` materializes entirely from the UBB dataset (runtime JSON, Angular component, and store). Compiler outputs are now served at `/events`; effects + QC logging remain on deck.
- **2025-12-13** – Supabase logging persists JSON + pending queue locally and replays builds to `refer_build_logs` once creds exist, while `/events` effects now call `EventsService.fetchEvents` to honor the `refer_actions.service_target`.
- **2025-12-13** – `refer.build qc` shells to `npm run test`, `npm --prefix wrangler run test`, then `npm run build`, so compiler runs log both Angular+worker verifications before emitting QC artifacts.
- **2025-12-13** – Added `EventsShareService` + effects wiring so `EventsIntent.ShareEvent` flows through `refer_actions.service_target=EventsShareService.open` instead of directly touching `navigator.share` inside the store.
- **2025-12-13** – `/events/:id` (detail) and `/events/:id/share` routes are now compiler-enabled, materialized via `refer.build materialize --feature events-detail|events-share`, and registered in Angular routing (share route left public for OG scrapers per `refer.og.md`).
- **2025-12-13** – `refer_theme_tokens` seeds the shared palette; `refer.build` injects tokens into every payload and the materializer emits CSS custom properties so future blossoms (and `/referdesign`) can swap themes 1:1.
- **2025-12-13** – Primitive `style_tokens` now reference `refer_theme_tokens` via semantic keys (migration `2025121303`), and the materializer applies those semantics to role-scoped CSS vars so `/events`/detail/share blooms render compiler-driven theming while staying within the Angular build budgets logged via `refer.build qc`.
- **2025-12-13** – `refer_share_identity` view + compiler ingestion landed (migration `2025121304` + `loadGenome`), so runtime payloads expose ShareIdentity rows for `/events/:id/share` ahead of the OG head injector—QC loop reran after regenerating events/detail/share.
- **2025-12-13** – Events share blossom now emits OG/Twitter meta tags via the Angular `Meta/Title` bridge generated by `refer.build` and renders the ShareIdentity preview at the top of `/events/:id/share`, keeping crawlers + humans aligned while the full SSR/static head materializer is scoped.
- **2025-12-13** – Compiler writes static head fragments under `dist/refer-head/events-share`, derived from ShareIdentity rows (with fallback), so future SSR/static hosts can inline OG/Twitter tags without re-computing them at runtime.
- **2025-12-13** – `refer.build` now mirrors those head fragments into `wrangler/src/generated/events-share-head.generated.ts`, and the Cloudflare Worker intercepts `/events/:id/share` to stream the correct `<head>` before meta refresh/JS redirect back to Angular, so OG scrapers receive deterministic tags without waiting for hydration.
- **2025-12-13** – Introduced a compiler-managed page root (`UBB.Root`) + theme service so `/events` applies `refer_theme_tokens` from the `<body>` down; Angular components now call `ReferThemeService.applyRootTheme/clearRootTheme` and the legacy host shell relinquishes its static white backdrop.
- **2025-12-13** – Standed up the Supabase Edge Function `events-list` plus Angular service plumbing so `/events` fetches real `org_events` rows via the governed API instead of calling Supabase REST directly; the client still falls back to the stub list if the function is unreachable.

<a id="refercronmd"></a>

## refer.cron.md

# refer.cron.md

## Purpose

This document defines the **Cron + Scheduling Doctrine** for the E2E architecture. It establishes how time-based behavior is governed, executed, and revealed across the system.

**Governance Canonical:** This file is the single canonical reference for all cron, scheduling, recurrence, and task compiler doctrine.

This document is **authoritative** for:

- Scheduled execution
- Deferred workflows
- Time-based state transitions
- Cron + Realtime coordination

This document is consumed by **Codex** for construction and enforcement.

---

## Core Principle

> **Cron governs time. Execution governs work. Realtime governs visibility.**

Cron never performs domain work. It only **triggers evaluation of time**.

---

## Conceptual Model

### Roles

- **Cron**: the clock pulse
- **Scheduler Table**: the declaration of intent
- **Dispatcher Edge**: routing + locking
- **Execution Edges**: domain-specific work
- **Realtime**: optional visibility channel
- **UI**: renders truth, never resolves time

---

## Single Cron Rule

There SHALL be:

- **One cron trigger per environment** (dev / prod)
- **One cron-dispatcher edge function**

Cron:

- runs at a fixed interval (recommended: 1 minute)
- performs a fast query
- exits immediately after dispatch

Cron SHALL NOT:

- contain business logic
- execute heavy work
- listen for events
- personalize behavior

---

## Scheduler Table (Temporal Authority)

The scheduler table is the **single source of truth for future actions**.

### Canonical Table

```
cron_scheduled_tasks
---------------
id                uuid
run_at            timestamptz
status            pending | locked | completed | failed | canceled
task_type         text            -- routing ticket
scope             system | org | user
scope_id          uuid?           -- optional tenant anchor
target_table      text?           -- optional domain reference
target_id         uuid?           -- optional domain reference
payload           jsonb           -- luggage
attempts          int
max_attempts      int
locked_at         timestamptz
error             text?           -- failure detail (optional)
created_at        timestamptz
updated_at        timestamptz
```

Notes:

- Domain data NEVER lives here
- This table stores **intent, not state**

---

## Recurrence Templates (Optional, For Repeatable Schedules Only)

Templates exist **only** for recurring schedules. One-off tasks live exclusively in `cron_scheduled_tasks`.

### Canonical Template Table

```
cron_recurrence_templates
--------------------
id                uuid
task_type         text            -- routing ticket
scope             system | org | user
scope_id          uuid?           -- optional tenant anchor
payload           jsonb           -- luggage (minimal)
repeat_unit       minute | hour | day | week | month
repeat_every      int             -- e.g., 2 => every other day/week
repeat_cron       text?           -- optional custom schedule
start_at          timestamptz
next_run_at       timestamptz
repeat_until      timestamptz?
status            active | paused | canceled
locked_at         timestamptz
created_at        timestamptz
```

Rules:

- If `repeat_cron` is set, it overrides `repeat_unit + repeat_every`.
- `next_run_at` is authoritative and is advanced after each materialized run.
- Templates only **materialize** tasks; they do not execute work.

---

## Hybrid Scheduling UX (Presets + Custom)

For users and systemwide schedulers:

- Presets (dropdown): minute, hourly, daily, weekly, monthly.
- `repeat_every` supports “every other day/week” without extra templates.
- Custom option fills `repeat_cron` (or explicit `repeat_interval`).

This keeps UX simple while supporting edge-case schedules.

---

## Task Compiler (Table-Driven Watchers)

The **Task Compiler** is the "watcher" for time-based conditions. It is a cron-triggered
edge that **materializes tasks** from domain data. It does not execute work; it only
creates `cron_scheduled_tasks`.

The compiler is invoked directly by `cron-dispatcher` when due rules exist. This keeps
heartbeat execution centralized while avoiding a `compiler.run` entry per minute.

### Rule Table (Table-Driven)

```
cron_compiler_rules
-------------------
id                uuid
rule_type         text            -- e.g., event.go_live, user.welcome, user.nudge
scope             system | org | user
scope_id          uuid?           -- optional tenant anchor
target_table      text            -- domain source (events, profiles, orgs)
time_field        text            -- field to evaluate (starts_at, last_login_at)
lead_minutes      int             -- schedule offset (e.g., -10, +0, +60)
lookahead_minutes int             -- compile window for upcoming tasks
repeat_unit       minute | hour | day | week | month
repeat_every      int             -- optional cadence for scans or periodic rules
repeat_cron       text?           -- optional custom schedule
filters           jsonb           -- simple filters (status, flags, etc.)
next_run_at       timestamptz
status            active | paused | canceled
locked_at         timestamptz
created_at        timestamptz
```

Rules:

- Compiler only scans **due rules** (`next_run_at <= now()`).
- Rules can be paused/canceled without redeploying code.
- Minimal rule schema; no full interpreter unless needed.
- `repeat_cron` is supported for custom cadences.

### Compiler Responsibilities

- Load due rules
- Query target tables with rule filters and time windows
- **Upsert** into `cron_scheduled_tasks` with a de-dup key
- Advance `next_run_at`
- Exit quickly

### Watcher Clarification (No Event Triggers)

The watcher is **not** an event listener. It is a **time-based scanner**:

- It runs on cron heartbeat.
- It detects **time windows** (e.g., "3 hours before starts_at").
- It does **not** react to DB changes in real time.

If we need true change detection, that is a **separate event system** (realtime,
DB triggers, or Edge webhooks) and is **outside cron**.

### De-dup Guard (Required)

Prevent duplicate tasks with a unique fingerprint, e.g.:

```
unique(task_type, target_table, target_id, run_at)
```

If a task already exists, the compiler skips insert.

### Workload Cost Notes

- Cost comes from **scan volume**, not rule storage.
- Table-driven rules help reduce scans by only evaluating due rules.
- Use time windows and indexes on `time_field` to keep scans small.

---

## RSVP Reminder Rule (First Compiler Rule)

First rule to implement:

- `event.reminder` - send SMS to RSVP attendees **X minutes before** `events.starts_at`.
- Reminder offset is **per RSVP** (e.g., 15/30/60/180 minutes), not static.

This requires an RSVP table with reminder preference per attendee.

Compiler guard (recommended):

- `event_rsvps.compiled_at_date` tracks the last compile window handled.
- The compiler only schedules reminders newer than this timestamp.

## Routing Doctrine

### task_type

`task_type` is the **routing ticket**.

Examples:

- `event.reminder`
- `event.go_live`
- `donation.process`
- `subscription.expire`

The dispatcher uses `task_type` to route execution.

---

## Payload Doctrine

Payload is **luggage**, not the aircraft.

Rules:

- Payload MUST be minimal
- Payload MUST be serializable
- Payload MUST NOT duplicate domain state unless snapshotting is intentional

Preferred strategy:

- Reference domain records via `target_table + target_id`

---

## Dispatcher Edge Function

### Responsibilities

The dispatcher edge function:

- is triggered by cron
- queries for due tasks (`run_at <= now()`)
- locks tasks atomically
- routes tasks by `task_type`
- exits

### It SHALL NOT

- contain domain logic
- inspect payload deeply
- perform side effects

---

## Schedule Location (Cron Trigger)

Cron is driven by the Edge Function schedule:

- Supabase Dashboard -> Edge Functions -> cron-dispatcher -> Schedules
- Recommended interval: 1 minute

No `pg_cron` extension is required for this architecture.

---

## Fallback: pg_cron Scheduler (When Edge Schedules Are Unavailable)

If the Supabase UI does not expose Edge Function schedules, use `pg_cron` as the
heartbeat. This requires:

- `pg_cron` extension (installed to `extensions` schema)
- `pg_net` extension (for HTTP POST)

Pattern:

- `pg_cron` runs every minute.
- It calls `cron-dispatcher` via HTTP.
- Use a service role key (or a vault secret) for auth headers.

This is still a single heartbeat per environment and stays within the doctrine.

## Execution Edge Functions

Each execution edge:

- owns ONE domain responsibility
- understands its domain model
- validates state before acting
- is idempotent

Examples:

- `/edge/tasks/event-reminder`
- `/edge/tasks/donation-process`

Execution edges MAY:

- fetch domain data
- call external APIs
- emit realtime events
- update domain tables

---

## Cron + Realtime Coordination

### Principle

> **Cron changes state. Realtime reveals state.**

Preferred pattern:

1. Cron flips a deterministic field (e.g. `status = 'live'`)
2. Realtime broadcasts the update IF clients are connected
3. UI reacts instantly

Realtime is OPTIONAL and MUST NOT be relied on for correctness.

---

## Realtime Guarantees

- Realtime only runs when clients are connected
- Realtime does NOT backfill missed events
- All correctness comes from database reads

UI MUST:

- fetch truth on load
- subscribe only for enhancements

---

## Performance Doctrine

- Cron cost is negligible
- Execution cost is what matters
- Heavy work MUST NOT occur during page load

Rule:

> **If a page asks “Is it time yet?”, that logic belongs in cron.**

---

## Interval Guidance

- Recommended cron interval: **1 minute**
- Sub-minute intervals are NOT recommended
- If behavior must be instant → use realtime or events

Cron governs **absence of change**, not urgency.

---

## Methodology Perspective (Efficiency + Fit)

This doctrine optimizes **correctness, traceability, and predictable load**:

- **Efficiency**: cron does cheap scans + atomic locks; heavy work stays in execution edges.
- **Reliability**: scheduler table is the single source of truth; UI never guesses time.
- **Scalability**: domain work fans out by task_type; handlers stay small and idempotent.
- **Observability**: each task is inspectable (status, attempts, failure cause).

Tradeoffs to accept:

- **Latency** is bounded by interval (recommended 1 minute).
- **Bursts** need batching and backoff to avoid spikes.
- **Correctness** requires idempotent handlers and careful retries.

---

## Viable Use Cases (Current + Upcoming)

This system is best for **time-based state changes** and **deferred workflows** that must be correct even without realtime.

### Immediate Candidates (Upcoming)

- **RSVP reminders** (event.reminder) - time-based outreach.
- **Event go-live** (event.go_live) - flip deterministic status at run_at.
- **Single-stream notifications** (notification.dispatch) - queue and fan-out.
- **Invite pipeline follow-ups** (invite.follow_up) - delayed nudges.
- **Giving receipts** (giving.receipt) - scheduled send after payment settle.

### Existing Behavior That Should Move Here

- **Notification send pending** (currently direct edge usage) - should be scheduled via `cron_scheduled_tasks` and dispatched by cron.
- **Live auto-switching** (if time-based toggles exist) - move time checks out of UI/guards.

### Non-Fit / Avoid

- Anything **interactive** or **user-triggered** that must be immediate.
- Workloads better served by **queues** or **realtime events** without time gating.

---

## Build-Ahead Checklist (Pre-Build Memory)

Before implementing the cron system, ensure:

- `cron_scheduled_tasks` schema exists with indexes on `run_at` and `status`.
- One cron trigger per environment is defined (1-minute interval).
- Dispatcher edge:
  - Locks due tasks atomically.
  - Routes by `task_type`.
  - Exits without domain logic.
- Ensure the dispatcher invokes the compiler when rules are due (no `compiler.run` tasks required).
- Execution edges are idempotent and update task status.
- Retry/backoff rules are explicit (`max_attempts`, `run_at` reschedule on transient failure).
- Cancellation logic is documented for each domain use case.
- Realtime only broadcasts post-state change; UI always reads DB truth.

**Remember to add at least one live use case in the first build** (e.g., `event.reminder` or `notification.dispatch`) to validate end-to-end flow.

---

## Failure & Retry Semantics

- Tasks MAY retry up to `max_attempts`
- Handlers MUST be idempotent
- Failed tasks remain inspectable
- Tasks MAY be canceled by domain state changes

---

## Loop Prevention Guards

To prevent infinite loops and runaway rescheduling:

- Enforce a **minimum delay floor** (e.g., `run_at >= now() + 1 minute`).
- Never requeue on failure without **backoff** and `max_attempts`.
- Use `repeat_until` (or explicit end conditions) for recurring templates.
- Dispatcher must **batch limit** to avoid runaway growth.
- Handlers must check task status and exit if already completed/canceled.

---

## Cancellation Pattern

Domain events MAY cancel scheduled tasks:

```
UPDATE cron_scheduled_tasks
SET status = 'canceled'
WHERE task_type = 'event.reminder'
AND target_id = :id
AND status = 'pending';
```

---

## Non-Goals

This system does NOT:

- replace realtime
- replace queues
- replace workflows
- replace UI logic

It governs **time**, not behavior.

---

## Final Doctrine

> **Time is centralized. Execution is specialized. Visibility is opportunistic.**

This doctrine is mandatory for all E2E systems.

---

## Codex Construction Directive

Codex SHALL:

- implement a single cron-dispatcher edge
- enforce scheduler table schema
- prevent domain logic inside cron
- ensure idempotent execution handlers

🧩 Codex must respond according to:

- codex/governance/E2E_BUILD_RESPONSE_PROTOCOL.md

🔄 Update Workflow and Component Tree accordingly.
✅ Codex builds: temporal-cron-system (ui → workflow → broadcast)

<a id="refercomponentsmd"></a>

## refer.components.md (merged)

The component canon has been merged into `refer.structure.md`.
Use `refer.structure.md` as the single source of truth for IMSCE identity, modal kinds, nesting rules, and card canon.

<a id="refercompilerpagesmd"></a>

## refer.compiler.pages.md

# refer.compiler.pages.md

Canonical registry of compiler conversion across routed pages.

Use this as the single source of truth when answering:

- "Is this page compiler-driven yet?"
- "What does 100% mean for this page?"
- "What's next to compile?"

Canonical metric definitions live in `REFER.OS/refer.compiler.metrics.md`.

---

## Status Legend

- `none` - no compiler plan for this page yet (or intentionally excluded).
- `plan` - plan exists, work not started.
- `in_progress` - compiler migration active.
- `complete` - meets the page's definition of "100% compiler-driven" (usually Copy + Selection; sometimes Presentation too).

---

## Page Registry

| Route                           | Feature                             | Status      | Copy | Selection | Presentation | Cards | Behavior | Plan Doc                                   |
| ------------------------------- | ----------------------------------- | ----------- | ---- | --------- | ------------ | ----- | -------- | ------------------------------------------ |
| `/`                             | landing                             | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/login`                        | auth                                | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/ichurch/:churchId`            | ichurch-shell                       | in_progress | 100% | 25%       | 100%         | -     | 20%      | `codex/todo/refer.compiler.ichurch.md`     |
| `/imeeting/:orgId`              | imeeting                            | plan        | 0%   | 0%        | 0%           | -     | 0%       | `codex/todo/refer.imeeting.todo.md`        |
| `/:churchId`                    | ichurch-shell (legacy deep link)    | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/:churchId/invitedby=:invited` | ichurch-shell (legacy deep link)    | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/events`                       | events                              | complete    | 100% | 100%      | 100%         | -     | 10%      | `REFER.OS/refer.compiler.init.md`          |
| `/events/:id`                   | events-detail                       | complete    | 100% | 100%      | 100%         | -     | 10%      | `REFER.OS/refer.compiler.init.md`          |
| `/events/:id/share`             | events-share                        | complete    | 100% | 100%      | 100%         | -     | 10%      | `REFER.OS/refer.compiler.init.md`          |
| `/startchurch`                  | startchurch                         | plan        | 0%   | 0%        | 0%           | -     | 0%       | `codex/todo/refer.compiler.startchurch.md` |
| `/orgs`                         | orgs-directory                      | complete    | 100% | 100%      | 25%          | 100%  | 10%      | `REFER.OS/refer.compiler.metrics.md`       |
| `/orgs-b`                       | orgs-directory (legacy)             | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/orgs-c-gen`                   | orgs-directory (generated artifact) | none        | -    | -         | -            | -     | -        | -                                          |
| `/cardcompiler`                 | cardcompiler                        | in_progress | 50%  | 50%       | 50%          | 100%  | 0%       | `REFER.OS/refer.compiler.metrics.md`       |
| `/card-compiler`                | cardcompiler (alias)                | in_progress | 50%  | 50%       | 50%          | 100%  | 0%       | `REFER.OS/refer.compiler.metrics.md`       |
| `/labs/cards`                   | cardcompiler (alias)                | in_progress | 50%  | 50%       | 50%          | 100%  | 0%       | `REFER.OS/refer.compiler.metrics.md`       |
| `/designlab`                    | designlab                           | plan        | 0%   | 0%        | 0%           | -     | 0%       | `REFER.OS/refer.designlab.md`              |
| `/design-lab`                   | designlab (alias)                   | plan        | 0%   | 0%        | 0%           | -     | 0%       | `REFER.OS/refer.designlab.md`              |
| `/labs/design`                  | designlab (alias)                   | plan        | 0%   | 0%        | 0%           | -     | 0%       | `REFER.OS/refer.designlab.md`              |
| `/refer-runtime`                | refer-runtime                       | none        | -    | -         | -            | -     | -        | -                                          |
| `/refer-runtime/:feature`       | refer-runtime                       | none        | -    | -         | -            | -     | -        | -                                          |
| `/labs/runtime`                 | refer-runtime (alias)               | none        | -    | -         | -            | -     | -        | -                                          |
| `/todo`                         | todo-lab (alias)                    | none        | -    | -         | -            | -     | -        | -                                          |
| `/todo-lab`                     | todo-lab (alias)                    | none        | -    | -         | -            | -     | -        | -                                          |
| `/labs/todo`                    | todo-lab (alias)                    | none        | -    | -         | -            | -     | -        | -                                          |
| `/prayerwall`                   | prayer-wall                         | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/ordination`                   | ordination                          | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/ordination/:code`             | ordination                          | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/ordination/org/:orgId`        | ordination                          | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/data`                         | legal                               | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/privacy`                      | legal                               | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |
| `/tos`                          | legal                               | none        | 0%   | 0%        | 0%           | -     | 0%       | -                                          |

Notes:

- For `/orgs`, "complete" is defined as: Copy + template selection + card specs are DB-driven; IO remains in store/effects.
- `Cards` is "100% data" for pages using `refer_card_templates` + a stable renderer. If the page doesn't use cards, use `-`.
