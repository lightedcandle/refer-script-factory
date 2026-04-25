# refer.spirit-runtime.md - Spirit Runtime Authority Contract

## Operational Boundary Contract for Edge Systems

This document defines target-state runtime authority for Spirit at the edge.
Execution and phased rollout remain governed by `REFER.OS/refer.spirit.md` and `REFER.OS/refer.flow.md`.
`refer.spirit.md` and `refer.spirit-runtime.md` are a coupled law set and must be interpreted together.
If any conflict exists, `refer.plan.md` and `refer.flow.md` take precedence.

## 0. Scope Partition Law (Normative)

This document is **agnostic REFER law**. It defines runtime invariants that must hold across applications.

Application-specific bindings (domains, thresholds, route maps, rollout state, and trigger values) are **not** defined here and MUST be read from app artifacts.

For Telechurch, app scope is bound by:

- `refer.app/spirit/spirit-capability-inventory.json`
- `refer.app/spirit/spirit-route-classes.json`
- `refer.app/spirit/spirit-parity-gates.json`
- `refer.app/spirit/spirit-route-class-triggers.json`
- `refer.app/spirit/spirit-rollout-state.json`

## 1. Perimeter Authority: Worker

All external traffic SHALL terminate at the Cloudflare Spirit Worker. The Worker is the authoritative perimeter and boundary of trust.

The Worker is responsible for:

- identity authentication,
- coarse scope validation,
- rate governance,
- input normalization,
- request classification and routing,
- canonical header projection (`x-tc-org`, `x-tc-actor`, `x-tc-request-id`).

The Worker SHALL NOT:

- own long-lived domain state,
- coordinate domain mutation sequencing,
- maintain coordination maps as authority,
- execute domain workflows beyond boundary enforcement and routing.

The Worker determines eligibility to enter the system. It does not determine contextual mutation authority.

---

## 2. Stateful Authority: Durable Objects

Durable Objects SHALL govern coordinated mutation and live state sequencing.

Durable Objects are serialized domain actors responsible for:

- contextual scope authorization,
- concurrency control through serialized execution,
- deterministic sequencing,
- live participant coordination,
- integrity enforcement of in-progress state.

Each Durable Object SHALL have:

- singular responsibility,
- deterministic identity derivation,
- explicit mutation boundaries.

Runtime state MAY exist in memory for performance.
If loss of in-memory state compromises correctness, state SHALL be persisted through approved storage authority.

Durable Objects are authoritative for coordinated and sequenced state. They are not archival storage.

---

## 3. Persistence Authority: Supabase Edge Write Gateway

Supabase Edge Functions SHALL remain the authoritative database mutation gateway for Spirit v1.

All persistent Postgres writes SHALL occur through Supabase Edge Functions unless a governance exception is ratified.

Direct database writes from external compute are prohibited by default because they weaken:

- RLS enforcement discipline,
- centralized audit surface,
- key exposure boundaries,
- mutation-policy consistency.

Durable Objects SHALL NOT write directly to Postgres while Supabase Edge is designated persistence authority.

Approved coordinated mutation path:
Client -> Cloudflare Spirit Worker -> Durable Object -> Supabase Edge Function -> Postgres

Approved non-coordinated mutation path:
Client -> Cloudflare Spirit Worker -> Supabase Edge Function -> Postgres

Supabase Edge Functions are stateless persistence executors.
Durable Objects are sequencing and coordination authorities.

---

## 4. Realtime Path vs Persistence Commit Path

Realtime synchronization SHALL NOT depend on storage latency.

Realtime path:
Client -> Cloudflare Spirit Worker -> Durable Object -> Realtime response

Persistence path:
Durable Object -> Supabase Edge Function -> Postgres

For soft state, Durable Objects MAY apply local state first and persist asynchronously or in batches.

Soft-state examples:

- presence updates,
- reactions and counters,
- live room status,
- non-critical UI transitions.

For hard state, persistence SHALL be confirmed before final acknowledgment.

Hard-state examples:

- financial transactions,
- membership/authority changes,
- role/capability assignments,
- bans/discipline,
- irreversible workflow milestones.

Realtime experience SHALL be decoupled from archival persistence whenever correctness allows.

---

## 5. Validation Boundary: Structural vs Coordinated

All mutation requires validation, but not all validation requires serialized coordination.

Structural validation includes:

- required fields,
- format/shape constraints,
- single-record integrity.

Structural validation MAY be enforced by Worker checks, Supabase Edge Functions, and DB constraints.

Coordinated validation includes:

- shared-resource mutation,
- capacity limits,
- ordering constraints,
- authority transitions,
- concurrency-sensitive state.

Coordinated validation SHALL be enforced by Durable Objects.

Durable Objects exist for coordination integrity, not basic CRUD validation.

---

## 6. Direct Database Access Policy

No external client SHALL write authoritative domain state directly to Postgres.
No external compute path may bypass approved mutation gateways without ratified exception.

Client -> Supabase PostgREST -> DB is prohibited for authoritative mutation.

Client -> Cloudflare Spirit Worker -> Supabase Edge -> DB is permitted for:

- read-only operations,
- archival or isolated single-record mutations,
- non-coordinated CRUD with no shared-state impact.

Client -> Cloudflare Spirit Worker -> Durable Object -> Supabase Edge -> DB is required for:

- shared resource mutation,
- workflow progression,
- moderation controls,
- capacity-sensitive updates,
- authority transitions,
- concurrency-sensitive state.

Distinction is based on authoritative impact, not convenience.

---

## 7. Canonical Header Contract

Spirit-routed requests SHALL include:

- `x-tc-org`: resolved tenant identity,
- `x-tc-actor`: `visitor|member|leader`,
- `x-tc-request-id`: correlation id,
- `authorization`: preserved or absent per route auth class.

Request-id law:

- preserve inbound `x-tc-request-id` when present,
- generate UUIDv4 or ULID when absent,
- propagate to downstream systems,
- echo on response,
- require presence in both Spirit and Mind logs.

---

## 8. Route Class and Cache Law

All Spirit endpoints SHALL map to a route class.

Required v1 route classes:

- `public_cacheable`,
- `public_volatile`,
- `auth_write`,
- `webhook`,
- `upload`,
- `rt_ephemeral`.

Cache-key law:

- key includes host + path + query,
- if tenant resolution is header-based, include `x-tc-org`,
- requests with `Authorization` default to `no-store` unless an explicit class exception is declared.

Realtime and cache policy SHALL not conflict for the same capability path.

---

## 9. Shared Space and Realtime Requirement

A shared space SHALL be treated as realtime by definition.

For shared spaces, the responsible Durable Object SHALL:

- expose snapshot hydration,
- own authoritative sync state,
- broadcast authoritative events to participants.

Transport policy:

- default transport: WebSocket,
- Worker may perform upgrade,
- Durable Object owns socket lifecycle and broadcast,
- fallback transport (for degraded clients/observers) may use SSE, but authoritative model remains realtime-first.

---

## 10. Elastic Realtime Strategy

Shared spaces SHALL keep singular authority per logical resource while supporting elastic participation.

Load principle:

- connection count alone does not define capacity,
- throughput and broadcast frequency define operational pressure.

Durable Objects MAY batch/aggregate/throttle outbound events.

Flush cadence, flush-class assignments, and room sharding thresholds are app-scope values and MUST be sourced from the app parity/route artifacts.

System SHALL separately control:

- mutation processing rate,
- broadcast synchronization rate.

Concurrency guardrails MUST exist for each app profile and include:

- DO mutation latency budget,
- broadcast latency budget,
- max broadcast loop duration budget,
- room socket ceiling plus sharding policy.

### Runtime verification chain for DO route contracts

Before any Spirit runtime promotion that changes DO room parsing, route forwarding, or realtime mutation actions:

1. Run `npm run do:contract-check` to enforce URL encoding/decoding and action contract invariants.
2. Run `npm run do:smoke -- --base <target-spirit-api>` to verify `presence-set -> state` persistence roundtrip on `/rt/*`.
3. Run `npm run do:deploy:verify` for deploy + post-deploy smoke confirmation.

These checks are blocking gates. Failed checks must emit repair artifacts and stop promotion.

---

## 11. Parity Gates and Release Criteria

Promotion to next phase requires parity evidence:

- response parity: status codes and key fields match golden set,
- latency budget: app-defined read/write p95 thresholds,
- DO budget: app-defined mutation/broadcast/loop thresholds,
- error budget: app-defined non-2xx threshold over defined window,
- logging parity: request correlation id present in Spirit and Mind traces.

Golden set coverage distribution MUST be defined in app parity artifacts by route class and actor/org coverage.

---

## 12. Rollback Triggers

Immediate rollback is mandatory on:

- sustained error-budget breach,
- golden-request mismatch,
- webhook signature or replay-defense failure,
- tenant cache bleed signal or cache poisoning detection.

Rollback action SHALL be capability-scoped and recorded with verification evidence.

---

## 13. Exception Protocol

Any bypass of Worker validation, Durable Object sequencing authority, or Supabase Edge persistence control SHALL:

- be documented in governance artifacts,
- include safety justification,
- define risk profile,
- define rollback trigger and rollback action,
- name approver/owner,
- define expiry or review date,
- include revalidation evidence cadence.

No exception is perpetual by default.

---

## 14. Internal Durable Object Communication

Durable Objects MAY call other Durable Objects, but SHALL:

- preserve serialized integrity,
- avoid circular dependencies,
- keep mutation ownership explicit.

A Durable Object SHALL NOT directly mutate another Durable Object's storage.
Inter-DO coordination SHALL occur through explicit invocation contracts.

---

## 15. Phase Semantics

This model describes target-state operation.
Rollout remains phased and capability-scoped (`legacy -> dual-path -> spirit-default -> legacy-retired`).

Do-not-move-v1 boundaries and parity harness enforcement remain governed by `REFER.OS/refer.spirit.md`.

---

## 16. MaxSpirit Completion Runtime State

At MaxSpirit completion, runtime ownership SHALL resolve to:

- Worker: perimeter authority and canonical request normalization.
- Durable Objects: live coordination, sequencing, and realtime shared-state authority.
- Spirit edge durability handlers: persistence orchestration and durability policy.
- Database: durable ledger/archive record, not live sync coordinator.

Supabase Realtime SHALL be retired from authoritative production sync at completion.

---

## 17. Cutover Safety Law

Transition from v1 boundaries to completion runtime state is lawful only when:

- realtime retirement cutover gates in `REFER.OS/refer.spirit.md` are fully green,
- rollback drills are current and passing,
- rollback route map remains valid for emergency re-entry,
- observability evidence includes DO mutation, broadcast latency, broadcast loop duration, and room socket load behavior.

Failure of any condition blocks retirement and keeps v1 boundaries active.

---

## 18. System Summary

- Worker protects perimeter and normalizes authority headers.
- Durable Objects govern coordinated state and sequencing.
- Supabase Edge governs persistence mutation in v1; completion-state durability is governed by Spirit edge durability handlers.
- Realtime keeps active participants synchronized.
- Storage preserves durable history.

All mutation requires validation.
Only coordinated mutation requires serialized authority.

This is the enforced operational shape of REFER at the edge.

---

## 19. Regression Prevention Law (Agnostic)

To prevent recurrence of live UI/runtime failures, the following are mandatory:

1. **Action-intent singular wiring**: critical UI actions map to one authoritative intent/handler contract and must be smoke-tested.
2. **Public-live visibility decoupling**: if a capability is declared public-live, UI live-state rendering must not be auth-gated.
3. **Strict route contract semantics**: unknown routes return explicit contract errors (for example `404`), never soft-success fallbacks.
4. **Channel-isolated state updates**: realtime channels (presence, reactions, chat, transitions) must merge/update by channel and never clobber unrelated channel state.
5. **Environment parity gate**: local/dev and deployed runtime paths must be validated against the same route and transport contracts.
6. **Recursive combing**: fixes must run full-scenario re-combs until cascading faults are exhausted; first-fault-only closure is non-compliant.

---

## 20. Cost-Optimized Asset Allocation Law (Agnostic)

Spirit runtime SHALL allocate responsibility by the minimum-cost authority that still preserves correctness.

### 20.1 Philosophy

- Keep expensive strong consistency only where human-visible ordering requires it.
- Push coordination to edge actors, push durability to storage, and push fanout side-effects to async lanes.
- Treat "realtime feel" as a product requirement, not "all state in realtime infrastructure."

### 20.2 Asset Matrix

| Asset              | Primary Responsibility                     | Must Hold                                                                  | Must Not Hold                                               |
| ------------------ | ------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Durable Objects    | Live coordination and sequencing authority | room snapshot, active participants, sequence, lease/expiry timers          | long-term history, analytics archives, broad report queries |
| D1 / relational DB | Durable truth and queryable history        | audit/events ledger, attendance sessions, aggregates, reporting dimensions | websocket authority, live broadcast loops                   |
| KV                 | Low-cost global read cache                 | derived snapshots, config flags, read-mostly payloads                      | authoritative ordered mutation state                        |
| Queues             | Async side-effect conveyor                 | batched persistence tasks, notifications, analytics fanout                 | synchronous user-facing mutation authority                  |
| R2 / object store  | Large binary/media assets                  | clips, thumbnails, large blobs                                             | control-plane mutation logic                                |

### 20.3 Build Law

- Realtime lanes SHALL be push-first (WebSocket/SSE) with snapshot + delta semantics.
- Polling loops SHALL be exceptional and time-bounded; if enabled, they require explicit degradation rationale.
- DO writes to durable systems SHOULD be batched/asynchronous unless a hard-state policy requires inline commit.
- Route budgets SHALL be defined per lane: mutation latency, broadcast latency, payload size, and retry backoff.
- Hidden-tab/background clients SHOULD reduce heartbeat and fanout pressure.

### 20.4 Hard vs Soft State Assignment

- Hard state (financial, irreversible authority transitions, compliance milestones) SHALL commit through persistence authority before final ack.
- Soft state (presence, reactions, ephemeral counters, transient scene cues) MAY commit in DO first and persist asynchronously.

### 20.5 Operational Cost Guardrails

- Prefer one room stream over multi-channel duplicated streams for the same audience scope.
- Coalesce bursty event classes (for example reactions) into bounded windows.
- Keep payload envelopes compact and versioned.
- Record the chosen allocation and guardrails in app-scope artifacts before promotion.

---

## 21. Reminder Alarm Reliability Law (Agnostic)

Durable Object reminder schedulers SHALL maintain explicit alarm and dispatch observability.

Required invariants:

- Alarm target is always the earliest future due entry across pending reminder keys.
- Alarm set operations SHALL be read back and recorded.
- Alarm execution SHALL record start, success, and error markers.
- Dispatch execution SHALL record success or failure markers.

Minimum persistent markers:

- `last_set_alarm_at`
- `alarm_iso`
- `last_alarm_ok_iso`
- `last_alarm_error_iso`
- `last_dispatch_ok_at`
- `last_dispatch_error_at`

Diagnostics surface:

- A guarded internal diagnostics read path MAY expose reminder health state.
- Public paths SHALL NOT expose internal reminder diagnostics.
- Verbose diagnostic payloads SHOULD be feature-flagged; minimal health markers remain always on.
