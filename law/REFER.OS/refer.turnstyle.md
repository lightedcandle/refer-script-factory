# Law 52: refer.turnstyle.md - Turnstyle Guard Architecture

`refer.turnstyle` defines the canonical guard system for Telechurch. It standardizes how identity, capability, and state are evaluated across UI, action, and edge boundaries so authorization logic stays centralized and enforceable.

## Article 52.1: Intent

- Establish one vocabulary for authorization and gating.
- Separate user authorization (guards) from non-user behavior toggles (functional controls).
- Keep UI checks advisory and Edge checks authoritative.

## Article 52.2: Three-tier model

- `T1 Identity`: Who is this subject?
  - Examples: `isAuthed`, `isAnonymous`, `hasSession`.
- `T2 Capability`: What capability does this subject possess?
  - Examples: `hasOrgOwnerPermission`, `hasMeetingAdminRole`.
- `T3 State Compatibility`: Is system state compatible with this action?
  - Examples: `isOrgActive`, `isMeetingLiveEditable`, `isEventEditable`.

Rules:

- T3 is volatile by default.
- T3 decisions must be re-validated on Edge.
- T3 must never rely only on client-local state.

## Article 52.3: Lifecycle

1. `UI` check (advisory): gate rendering and affordances.
2. `Action` check: gate intent dispatch and side-effect initiation.
3. `Edge` check (authoritative): re-validate identity/capability/state before any protected IO.

## Article 52.4: Naming discipline

- Predicates:
  - `isX` for state facts.
  - `hasY` for possession/assignment facts.
- Guards:
  - `canZ` only.
- Functional controls:
  - `showX`, `enableY`, `shouldZ` (never treated as authorization guards).

## Article 52.5: Composition

Guard composition is first-class and required to avoid duplication.

Examples:

- `canManageOrgMembers = isAuthed AND hasOrgOwnerPermission AND isOrgActive`
- `canEditEvent = canManageOrgMembers AND isEventEditable`

Composition rules:

- Chain order should be T1 -> T2 -> T3.
- Any deny must stop evaluation and surface a stable reason code.
- Shared composed guards belong in canonical manifests, not ad-hoc per feature.

## Article 52.6: Registry and capability namespace

- Canonical guard registry file: `REFER.OS/manifests/guards.registry.json`.
- Registry entry fields:
  - `artifact`
  - `capability`
  - `requiredGuard`
  - `guardChain`
  - `boundary`
  - `edgeFunction` (when applicable)
  - `stateCompatibility` (for T3 volatile facts)

Capability namespace policy:

- Allowed roots: `org.*`, `event.*`, `meeting.*`, `notification.*`, `system.*`, `profile.*`.
- Use dot-delimited lower snake segments (for example `meeting.go_live`).

## Article 52.7: Guards vs functional controls

- Guard: answers "may this subject perform this action?"
- Functional control: answers "should this feature render or execute?"

Functional controls can change UX behavior; they do not authorize protected actions.

## Article 52.8: Edge deny observability

When Edge denies, emit structured audit data:

- `artifact`
- `subjectId` (or anonymous marker)
- `evaluatedChain`
- `failureReason`
- `boundary` (`Edge`)
- `timestamp`

Audit logs are required for protected registry artifacts.

## Article 52.9: Enforcement

The following checks are mandatory in automation:

- Registry structure and naming validation.
- Capability namespace validation.
- Predicate/guard naming validation.
- Protected edge handler presence for registry edge functions.

CI must fail on violations.

## Article 52.10: Spirit Header and Actor Guard Mapping

For Spirit-routed API paths, guard decisions must bind to the canonical header contract in `REFER.OS/refer.spirit.md`.

Required mappings:

- `x-tc-actor` maps to guard subject class (`visitor|member|leader`).
- `x-tc-org` must be resolved before capability evaluation for tenant-scoped guards.
- `x-tc-request-id` must flow through edge deny observability payloads for parity with Mind logs.

Rules:

- Spirit edge guards are authoritative for route-class policy checks.
- UI and action layer checks remain advisory and must not override Spirit deny outcomes.
