# ESCL 2.0 - Schematic Definition and Implementation Brief
version: 2.1.0
status: canonical
audience: Codex (builder, verifier, governor)

This revision incorporates Codex's findings on encoding, bindings, ordering, ID rules, Spirit roles, file placement, and governance behavior. All content is ASCII-only.

-------------------------------------------------------------------------------
1. PURPOSE
-------------------------------------------------------------------------------

This document defines ESCL (E2E Symbolic Composition Language) 2.0 and the role of a schematic: the schematic is the per-feature contract that lists Body/Mind/Spirit identifiers and Bindings, driving generation, verification, and wiring. This is the only supported model, where:

- Blueprint + Schematic are the only authoring inputs Codex needs.
- Domain-prefixed identifiers (B-, M-, S-) are the primary semantic markers.
- File prefixes derived from those identifiers replace the need for any structure.json map.
- The repository itself is the authoritative structure manifest, validated by ID parity.

Codex must update parsing, generation, and verification logic to align with this model.

-------------------------------------------------------------------------------
2. TRIUNE MODEL (BODY, MIND, SPIRIT)
-------------------------------------------------------------------------------

Domains:

- Body (B): UI structure (features, sections, cards, elements).
- Mind (M): Workflow logic (actions, services, edges, data, APIs, websockets, signals, integrations).
- Spirit (S): Broadcast and reflection (events, channels, policies, returns, insights).

Inputs to Codex:

1) Blueprint: prose description of a feature (purpose, flows, constraints).
2) Schematic: ESCL 2.0 document using B- / M- / S- identifiers and Bindings.

Outputs from Codex:

- Angular UI components, templates, and styles.
- Workflow/store/effects code for Mind.
- Realtime/broadcast/channel/policy code for Spirit.
- All files named and prefixed according to ESCL 2.0 identifiers.

No external structure.json is required; structure is derived from filenames plus directory placement.

-------------------------------------------------------------------------------
3. DOMAIN PREFIXES AND NODE IDENTIFIERS
-------------------------------------------------------------------------------

All schematic nodes begin with a domain prefix:

- B- : Body (UI)
- M- : Mind (workflow)
- S- : Spirit (broadcast)

Identifiers are ASCII, uppercase letters for semantic codes, digits for indices.

General rules:

- IDs are case-sensitive. B-, M-, S- must be uppercase.
- Feature tokens are ordinal for uniqueness across features (e.g., A, B, C… then A1, B1, C1… when letters are exhausted); combine with domain prefixes (B-/M-/S-) to keep filenames unique even when different features use the same local sequence.
- Indices may be multi-digit (1, 2, 10, 11, ...). No zero-padding required.
- Numeric ordering is logical, not lexicographic: E2 < E10 is evaluated as 2 < 10.
- Once an ID is adopted and committed, it is treated as immutable. Renames are explicit migrations.

Uppercase expectations (glossary):
- Flow tokens: F, FLOW — MUST be uppercase.
- Spirit role codes: EV, RF, CH, PO, RT, IN — MUST be uppercase.
- Mind step letters: A, S, E, D, P, W, N, I — MUST be uppercase.

3.1 Body Identifiers (B-)

Body IDs encode hierarchical UI structure.

Conceptual pattern (example convention):

- Feature:   B-A1
- Section:   B-A1S1, B-A1S2, ...
- Card:      B-A1S1C1, B-A1S1C2, ...
- Element:   B-A1S1C1E1, B-A1S1C1E2, ...

Where:

- A1 = feature token (could be A1, DASH, PRESENCE, etc., as long as it is stable).
- S = section indicator.
- C = card indicator.
- E = element indicator.
- Numbers are 1-based indices within their parent.

Example:

- B-A1          # Feature A1 root
- B-A1S1        # Section 1 in feature A1
- B-A1S1C1      # Card 1 in section 1
- B-A1S1C1E1    # Element 1 in card 1
- B-A1S1C1E2    # Element 2 in card 1

3.1.1 Body File Naming and Placement

File prefixes:

- Every Body artifact filename must start with its B- ID.

Examples:

- B-A1.component.ts
- B-A1.component.html
- B-A1S1C1E1.component.ts
- B-A1S1C1E1.component.html

Directory placement (aligned with AGENTS.md expectations):

- Body artifacts live under:  features/**

Example (Angular app layout):

- apps/telechurch/src/app/features/<feature-name>/B-A1.component.ts
- apps/telechurch/src/app/features/<feature-name>/components/B-A1S1C1E1.component.ts

Codex must:

- Treat any file whose basename starts with B- as a Body node artifact.
- Map each B- prefix back to a Body ID in the schematic.

3.2 Mind Identifiers (M-)

Mind IDs encode workflow logic as flows and steps.

Two layers:

1) Flow ID: identifies a workflow chain for a feature.
2) Step IDs: identify specific steps (Action, Service, Edge, Data, API, WebSocket, Signal, Integration).

Pattern (example convention):

- Flow:   M-A1F1      # Feature A1, Flow 1 (Flow token is case-sensitive; MUST be uppercase)
- Steps:  M-A1F1A1, M-A1F1S1, M-A1F1E1, M-A1F1D1, M-A1F1P1, M-A1F1W1, M-A1F1N1, M-A1F1I1

Letter mapping for steps (identifier-level):

- A: Action (user/system intent)
- S: Service
- E: Edge
- D: Data
- P: API
- W: WebSocket
- N: Signal (notification/state emission)
- I: Integration

Authoritative ordering (ASEDAWSI-like, adapted to letters):

- A -> S -> E -> D -> P -> W -> N -> I

Codex must enforce this ordering when interpreting a flow.

3.2.1 Mind File Naming and Placement

File prefixes:

- All Mind artifacts must start with an M- prefix.

Two recommended patterns:

A) Single file per flow:

- M-A1F1.workflow.ts

B) Multiple files per flow step:

- M-A1F1A1.action.ts
- M-A1F1S1.service.ts
- M-A1F1E1.edge.ts
- M-A1F1D1.data.ts
- M-A1F1P1.api.ts
- M-A1F1W1.websocket.ts
- M-A1F1N1.signal.ts
- M-A1F1I1.integration.ts

Directory placement:

- Mind artifacts live under:  workflows/**

Example:

- apps/telechurch/src/app/workflows/M-A1F1.workflow.ts
- apps/telechurch/src/app/workflows/feature-A1/M-A1F1P1.api.ts

Codex must:

- Treat any file whose basename starts with M- as a Mind artifact.
- Group files by their Flow ID (M-A1F1) and interpret step suffixes by their codes.

3.3 Spirit Identifiers (S-)

Spirit IDs encode broadcast and reflection flows.

Pattern:

- Flow: S-A1FLOW1    # Broadcast flow 1 for feature A1 (Flow token is case-sensitive; MUST be uppercase)
- Roles within a flow use uppercase role codes appended to the flow ID.

Canonical role codes:

- EV: Event
- RF: Reflection (relay/echo)
- CH: Channel mapping
- PO: Policy
- RT: Return (signal route back to Mind or Body)
- IN: Insight (final reflection into UI)

Examples:

- S-A1FLOW1EV1   # Event 1 in flow 1
- S-A1FLOW1CH1   # Channel mapping 1
- S-A1FLOW1PO1   # Policy 1
- S-A1FLOW1RT1   # Return 1
- S-A1FLOW1IN1   # Insight 1

3.3.1 Spirit File Naming and Placement

Two models are supported:

A) Single-file-per-flow model:

- S-A1FLOW1.broadcast.ts

B) Multi-file-per-role model:

- S-A1FLOW1EV1.event.ts
- S-A1FLOW1CH1.channel.ts
- S-A1FLOW1PO1.policy.ts
- S-A1FLOW1RT1.return.ts
- S-A1FLOW1IN1.insight.ts

Codex must not mix both models for the same flow ID. If both a single-flow file and role-specific files exist for the same flow, Codex must flag this as a configuration error.

Directory placement (aligned with AGENTS.md):

- Spirit artifacts live under: core/realtime/**

Example:

- apps/telechurch/src/app/core/realtime/S-A1FLOW1.broadcast.ts
- apps/telechurch/src/app/core/realtime/flows/S-A1FLOW1CH1.channel.ts

Codex must treat any file whose basename starts with S- as a Spirit artifact.

-------------------------------------------------------------------------------
4. BINDING GRAMMAR (FORMALIZED)
-------------------------------------------------------------------------------

Bindings are not free-form text. They must be expressed in a structured block that Codex can parse deterministically.

Canonical form: a YAML-like block in the schematic, under a "Bindings:" heading.

Reminder: Flow tokens inside M- and S- IDs are uppercase (e.g., M-A1F1, S-A1FLOW1) and must match exactly in bindings.
Validator: reject M-/S- IDs with lowercase flow tokens at parse time.

Example:

Bindings:
  - from: B-A1S1C1E1
    to:   M-A1F1
    kind: ui_to_flow

  - from: M-A1F1N1
    to:   S-A1FLOW1
    kind: flow_to_spirit

  - from: S-A1FLOW1IN1
    to:   B-A1S1C2E1
    kind: spirit_to_ui

Fields:

- from: string (must be a valid B-, M-, or S- ID)
- to: string (must be a valid B-, M-, or S- ID)
- kind: enum
  - ui_to_flow
  - flow_to_spirit
  - spirit_to_ui
  - flow_to_flow (optional future extension)
  - spirit_to_spirit (optional future extension)
- meta: optional object/dictionary for additional metadata (e.g., event names, debounce rules)

Domain constraints (must be enforced):

- ui_to_flow: from=B-, to=M-
- flow_to_spirit: from=M-, to=S-
- spirit_to_ui: from=S-, to=B-
- flow_to_flow: from=M-, to=M- (if used)
- spirit_to_spirit: from=S-, to=S- (if used)

Codex must:

- Parse the Bindings block as a list.
- Validate that all from/to IDs exist in the Body, Mind, or Spirit sections of the schematic.
- Wire code accordingly (UI handlers, effect triggers, channel listeners, etc.).

-------------------------------------------------------------------------------
5. BUILD BEHAVIOR
-------------------------------------------------------------------------------

5.1 Parsing

For each feature schematic file, Codex must:

1) Parse Body registry:
   - Collect all B- IDs, and their hierarchical relationships if indicated.

2) Parse Mind registry:
   - Collect all M- IDs.
   - Group them into flows by Flow ID (e.g., M-A1F1).
   - Enforce ASEDAWSI ordering (A -> S -> E -> D -> P -> W -> N -> I) for each flow.
   - If steps appear out of order, Codex must fail the build for that flow with a clear error.

3) Parse Spirit registry:
   - Collect all S- flow IDs and their role-specific codes (EV, RF, CH, PO, RT, IN).

4) Parse Bindings:
   - Validate type correctness (e.g., ui_to_flow requires from=B- and to=M-).
   - Report errors if bindings reference unknown IDs or cross illegal domains.

5.2 Generation

Codex then:

- Generates or updates Body files for each B- ID.
- Generates or updates Mind files for each M- flow and its steps.
- Generates or updates Spirit files for each S- flow and its roles.
- Wires event handlers, store actions, effects, and broadcast logic based on Bindings.

5.3 No Structure Map

Codex must NOT rely on a structure.json or equivalent.

Instead, Codex must:

1) Scan the filesystem under the expected directories:
   - features/** for B- files.
   - workflows/** for M- files.
   - core/realtime/** for S- files.

2) For each file, extract the leading B- / M- / S- prefix (basename split on first dot or underscore).

3) Compare extracted IDs with schematic registries:

   - Missing implementation:
     - ID in schematic but no corresponding file with that prefix.
     - Behavior: generate file(s) or fail if generation is disabled.

   - Orphaned artifact:
     - File prefix in repo that does not appear in schematic.
     - Behavior: see Governance section.

   - Drift:
     - Multiple implementations for the same ID that conflict with the chosen model (e.g., both single-flow and per-step files for one Mind flow or both broadcast.ts and role-specific files for one Spirit flow).
     - Behavior: fail with clear error.

-------------------------------------------------------------------------------
6. GOVERNANCE AND POLICY
-------------------------------------------------------------------------------

6.1 Orphan Detection

An orphan is defined as:

- Any B- / M- / S- file prefix present in the repo that does not appear in the schematic's registry for that domain.

Codex must:

- List orphans as part of a verification report.

Default behavior modes:

- non_strict_orphans (default for early adoption):
  - Warn on orphans.
  - Do not fail the build.
- strict_orphans (opt-in or future default):
  - Fail the build if orphans exist, unless explicitly annotated.

Mode selection (automation-friendly):
- Default: non_strict_orphans
- To enable strict: set env ESCL_ORPHANS=strict or pass CLI flag --strict-orphans (tooling should support both).

Orphan annotation (optional):

- A file may include an explicit comment (e.g., // ESCL_ORPHAN_OK in TS/SCSS, <!-- ESCL_ORPHAN_OK --> in HTML) that Codex can honor as an override in strict mode.

6.2 Missing Implementations

If an ID appears in the schematic but no file exists with that prefix under the expected domain directory, Codex must:

- In "build" mode: generate the required files.
- In "verify-only" mode: fail the build and list all missing implementations.

6.3 Drift from Binding Model

Codex must fail when:

- Both a single-flow Mind file and multiple per-step Mind files exist for the same Flow ID.
- Both a single-flow Spirit broadcast file and multiple per-role Spirit files exist for the same Flow ID.
- Bindings reference IDs that exist in files but not in the schematic (i.e., schematic was not updated).

6.4 ID Immutability and Migration

- Once a B- / M- / S- ID is issued and the corresponding files are generated and committed, that ID is considered immutable.
- Renaming an ID requires an explicit migration:
  - Update in the schematic.
  - Coordinated rename of all files with that prefix.
  - Optional migration note or tool to track the old-to-new mapping for humans.

Codex must not silently change prefixes or reassign IDs.

-------------------------------------------------------------------------------
7. ANSWERS TO CODEX QUESTIONS (EXPLICIT)
-------------------------------------------------------------------------------

Q1. What is the precise binding schema (fields, types, allowed relations)?

A1. See section 4. Bindings are expressed as a list with keys: from, to, kind, and optional meta.
    Allowed kinds initially: ui_to_flow, flow_to_spirit, spirit_to_ui.
    from/to must be valid IDs in the appropriate domains.

Q2. Should Codex enforce ASEDAWSI ordering and flag violations at build time?

A2. Yes. Codex must enforce the canonical ordering A -> S -> E -> D -> P -> W -> N -> I
    for Mind flows. Out-of-order steps are a build error for that flow.

Q3. Are migration-generated B/M/S IDs ever renamed, or are they immutable once issued?

A3. IDs are immutable once committed. Renames require an explicit migration
    (update schematic, rename files, and optionally record old->new mapping). Codex
    must not auto-rename.

Q4. Should Spirit flows always be single-file or is mixed single/multi-file allowed per flow?

A4. For a given Flow ID, Codex must choose one model:
    - single-file: S-<FlowId>.broadcast.ts
    - multi-file: S-<FlowId><RoleCode><Index>.<role-suffix>.ts
    Mixed models for the same Flow ID are not allowed and must be flagged as errors.

Q5. What is the expected behavior when schematic and filesystem both contain an ID but file suffixes differ?

A5. The semantic identity is the prefix (B- / M- / S- ID). Codex may support multiple
    files per ID as long as they use recognized suffixes (component.ts, component.html,
    signal.ts, api.ts, etc.) and conform to the chosen model (single vs multi-file per flow).
    A differing suffix alone is not drift. Drift is defined when the implementation pattern
    for an ID contradicts the domain's model (e.g., multiple incompatible patterns for the
    same Mind flow).

-------------------------------------------------------------------------------
8. IMPLEMENTATION ORDER FOR CODEX
-------------------------------------------------------------------------------

1) Implement ESCL 2.0 parser for:
   - B- / M- / S- registries.
   - Bindings block.
2) Implement prefix-based repo scan:
   - features/** for B-
   - workflows/** for M-
   - core/realtime/** for S-
3) Implement generator logic that always prefixes new files with the correct ID.
4) Implement verification routines:
   - missing implementations
   - orphan detection
   - ASEDAWSI-order enforcement
   - single-vs-multi-file patterns per Mind / Spirit flow.
5) Reject legacy glyph-based schematics: require conversion to ESCL 2.0 (B- / M- / S-) before processing.
6) Gradually deprecate any structure.json or non-ID-based structure maps.

With this refactor, Codex operates in a closed, deterministic loop:

Blueprint -> Schematic (ESCL 2.0) -> Files (B- / M- / S-prefixed)
    -> Verification by ID parity and policy

No external maps. No inferred names. No ambiguous structure.

-------------------------------------------------------------------------------
9. ERROR REPORTING CONTRACT
-------------------------------------------------------------------------------

When verification detects a violation, emit structured errors with:

- domain: B | M | S
- id: the B-/M-/S- identifier (if applicable)
- path: file path if present
- rule: machine-readable code (e.g., OUT_OF_ORDER_ASEDAWSI, MIXED_MODEL_FLOW, BAD_BINDING_DOMAIN, DISALLOWED_SUFFIX, ORPHAN_ID, MISSING_ID)
- message: concise human-readable description
- mode_action: warn | fail (respecting strict vs non-strict modes)

Example payload (JSON):
```json
{
  "domain": "M",
  "id": "M-A1F1S1",
  "path": "apps/telechurch/src/app/workflows/M-A1F1S1.service.ts",
  "rule": "OUT_OF_ORDER_ASEDAWSI",
  "message": "Mind flow M-A1F1 has steps out of ASEDAWSI order (S1 before A1).",
  "mode_action": "fail"
}
```

-------------------------------------------------------------------------------
9. CANONICAL SUFFIX MATRIX (MINIMAL)
-------------------------------------------------------------------------------

Suffixes do not carry semantic identity; prefixes do. Suffixes only classify files for the toolchain. Generators and linters must enforce the following minimal sets and handling rules:

Body (B-):
- .component.ts
- .component.html
- .component.scss
- optional: .component.spec.ts

Mind (M-): choose one model per flow
- Single-file-per-flow: .workflow.ts
- Multi-file-per-step: .action.ts, .service.ts, .edge.ts, .data.ts, .api.ts, .websocket.ts, .signal.ts, .integration.ts

Spirit (S-): choose one model per flow
- Single-file-per-flow: .broadcast.ts
- Multi-file-per-role: .event.ts, .reflection.ts, .channel.ts, .policy.ts, .return.ts, .insight.ts

Additional files:
- Prefixed backup/stray files (e.g., .bak with a B-/M-/S- prefix) are disallowed. If present, treat as drift: warn in non-strict mode, fail in strict mode unless the canonical file exists and the backup is explicitly annotated as retired. Prefer git history for rollback.
- Domain directories may still contain non-prefixed assets (e.g., README.md); these are ignored by ESCL verification. Unprefixed backups should be kept out of governed directories when possible.

-------------------------------------------------------------------------------
10. FILE-LEVEL ID ANNOTATIONS
-------------------------------------------------------------------------------

- Each implementation file that corresponds to a schematic ID must include a brief top-level comment with that ID (e.g., `// B-IC1S8C1: prayer wall` or `// M-IC1F1: registration flow wiring`). This keeps the ID baked into the file for traceability even if context is lost.
- Multi-ID files (e.g., combined Mind steps) must list all covered IDs in the header comment.
- Generators/linters should enforce presence of the ID annotation for B-/M-/S- prefixed files or their translator-mapped legacy counterparts.
