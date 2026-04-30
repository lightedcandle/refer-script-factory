# Law 72: refer.spirit.md - Spirit Execution Contract

Spirit is Telechurch's flow control plane.
Mind remains relational authority.
Body remains presentation and interaction.

Runtime authority for Spirit execution is codified in `REFER.OS/refer.spirit-runtime.md`.
This file governs rollout and capability migration; `refer.spirit-runtime.md` governs runtime authority and operational invariants.
Both documents are normative and must be applied together.

## 0. Scope Partition (Normative)

This document contains rollout law and migration invariants.

- **Agnostic REFER law** remains in `REFER.OS/*`.
- **Telechurch app scope** (surfaces, thresholds, trigger values, concrete inventory rows) is bound through app artifacts under `refer.app/spirit/*`.

Canonical Telechurch app-scope artifacts:

- `refer.app/spirit/spirit-capability-inventory.json`
- `refer.app/spirit/spirit-route-classes.json`
- `refer.app/spirit/spirit-parity-gates.json`
- `refer.app/spirit/spirit-route-class-triggers.json`
- `refer.app/spirit/spirit-rollout-checklist.md`
- `refer.app/spirit/spirit-rollout-state.json`

## 1. Purpose

Spirit governs:

- public entry routing,
- realtime coordination,
- cache discipline,
- webhook ingress,
- upload orchestration,
- edge security and rate controls.

Front-end service build method:

- Front-end services MUST target Spirit runtime-authorized surfaces and behaviors defined in `REFER.OS/refer.spirit-runtime.md`.

Spirit does not own relational authority, identity issuance, or schema truth.

## 2. Layer Boundaries

- Body: UI rendering, local state, intent dispatch.
- Spirit: edge routing, policy enforcement, ephemeral coordination, cache and transport decisions.
- Mind: Supabase auth issuance, relational writes, permanent history, schema/migration authority.

No layer may absorb another layer's authority under load.

## 3. Canonical Surface Policy

Each app must define stable public surfaces and reserved realtime namespace.
For Telechurch, concrete surface bindings are app-scope and declared in `refer.app/spirit/spirit-capability-inventory.json`.

Default law remains: path/module isolation first; avoid per-capability subdomain expansion unless justified.

## 4. Capability Inventory (Canonical Spirit Runtime)

Capability inventory is mandatory and app-scoped.
For Telechurch, use `refer.app/spirit/spirit-capability-inventory.json` as the canonical inventory contract.

## 5. Lifecycle Switch Model

Each capability domain moves through:

1. `legacy`
2. `dual-path`
3. `spirit-default`
4. `legacy-retired`

Cutover is per-capability, never global.

## 6. Canonical Header Contract

Required for Spirit-routed requests:

- `x-tc-org`: resolved org id/slug
- `x-tc-actor`: `visitor|member|leader`
- `x-tc-request-id`: correlation id
- `authorization`: preserved or absent by auth class policy

Request-id law:

- preserve inbound `x-tc-request-id` when present,
- generate UUIDv4/ULID when absent,
- propagate downstream,
- echo on response,
- require both Spirit and Mind logs to include it.

## 7. Route Class Registry

Required route classes:

- `public_cacheable`
- `public_volatile`
- `auth_write`
- `webhook`
- `upload`
- `rt_ephemeral`

Class-level policy values are app-scoped.
For Telechurch, canonical values are in `refer.app/spirit/spirit-route-classes.json`.

## 8. Cache vs Realtime Law

Cache-key law:

- key must include host + path + query,
- if org is header-resolved, include `x-tc-org`,
- requests with `Authorization` default to `no-store` unless route-class exception is explicit.

Realtime law:

- ephemeral coordination stays in Spirit,
- permanent truth writes go to Mind,
- realtime and caching policies must not conflict.

## 9. Realtime v1 Scope

Realtime namespace and scope are mandatory per app profile.
For Telechurch v1 values (namespace, ephemeral lanes, flush cadence, and transport defaults), use `refer.app/spirit/spirit-parity-gates.json` and `refer.app/spirit/spirit-route-classes.json`.

## 10. Webhook Security Law

All vendor callbacks terminate at Spirit.

Required behavior:

- verify signature,
- store `event_id` in 24h dedupe store (KV/DO),
- reject duplicates,
- dispatch normalized event to Mind.

## 11. Parity Gates (Release Criteria)

Response parity:

- status and key fields match for N golden requests.

Latency, DO/RT, and error budget values are app-scoped and must be machine-readable.
For Telechurch values, use `refer.app/spirit/spirit-parity-gates.json`.

Logging parity:

- request correlation id present in both Spirit and Mind traces.

Golden distribution and minimum request count are app-scoped.
For Telechurch, use `refer.app/spirit/spirit-golden-requests.json` and `refer.app/spirit/spirit-parity-gates.json`.

## 12. Rollback Triggers

Rollback is mandatory on:

- sustained error budget breach,
- golden-request mismatch,
- webhook signature or replay-defense failure,
- cache poisoning detection.

## 13. Do Not Move Yet (v1)

Remain in Mind for v1:

- Supabase auth issuance,
- relational writes,
- schema migrations via Supabase CLI,
- Supabase Realtime retirement (deferred).

## 14. Phased Migration Path

1. Proxy passthrough
2. JWT validation + routing authority
3. Upload orchestration
4. Webhook centralization
5. Realtime coordination evolution

Each phase requires parity evidence before advancing.

## 15. Route Class Evolution Triggers

Trigger artifact:

- `refer.app/spirit/spirit-route-class-triggers.json` is mandatory and versioned.
- Trigger checks run in `npm run spirit:parity-harness`.

Trigger names and threshold values are app-scoped and must be maintained in the trigger artifact.

Execution trigger behavior:

- Tooling emits a trigger report and marks class state `modification_required`.
- Tooling must not self-repair; it may only emit bounded repair artifacts and block promotion.

## 15.1 Durable Object Verification Tooling (Mandatory)

Any Spirit realtime change that touches `/rt/*`, Durable Object room routing, or websocket coordination SHALL execute:

1. `npm run do:contract-check`
2. `npm run do:smoke -- --base <target-spirit-api>`
3. `npm run do:deploy:verify` before declaring production-ready

Required reports:

- `reports/do-contract-check.json`
- `reports/do-smoke.json`

## 15.2 Reminder Alarm Verification Tooling (Mandatory when touching reminder DO flow)

Any Spirit change that touches reminder reseed/bootstrap, due-key scheduling, DO alarms, or reminder dispatch SHALL also verify:

1. Reseed metrics are non-zero for seeded test data (`fetched`, `normalized`, `scheduled`).
2. Internal reminder diagnostics show an active future alarm immediately after reseed.
3. After due time, diagnostics show alarm completion (`last_alarm_ok_iso`) or a captured error marker.
4. Reminder notification side effect is present (`notification_stream` row with expected reminder template and intent reference).

These checks are blocking for promotion.

- `reports/do-deploy-verify.json`

Promotion is blocked when any DO verification report fails.

## 16. MaxSpirit Completion Contract (Target State)

When MaxSpirit completion is declared, runtime authority SHALL be:

- Worker owns perimeter enforcement and canonical request projection.
- Durable Objects own live coordination, sequencing, and shared-state authority.
- Spirit edge durability handlers own persistence orchestration.
- Database is ledger/archive authority (durable record), not live coordination authority.
- Supabase Realtime is retired from authoritative production sync paths.

Completion contract supersedes v1 deferrals only after cutover gates pass.

## 17. Realtime Retirement Cutover Gates

Supabase Realtime retirement is permitted only when all gates pass:

- 14 consecutive days with no Sev-1 realtime incidents on Spirit-authoritative paths.
- DO/RT budgets remain within app profile law for 14 consecutive days.
- Room-capacity policy verified against app profile socket/sharding gates.
- Parity and error budgets remain green through dual-path and Spirit-default windows.
- Rollback drills pass for realtime lane (`trigger -> rollback -> verification`) in current release cycle.
- Supabase Realtime consumers are removed from authoritative call paths and retained only where explicitly declared non-authoritative.
- Room sharding policy is active and verified against app profile thresholds.

If any gate fails, retirement is blocked and lane state returns to `spirit-default with legacy fallback`.

## 18. Cost-Mature Spirit Asset Strategy (Telechurch)

Telechurch SHALL implement Spirit with a cost-mature split across edge assets.
This section binds rollout decisions to the runtime law in `REFER.OS/refer.spirit-runtime.md`.

### 18.1 Target Usage by Asset

| Asset             | Telechurch Usage                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Durable Objects   | Meeting-room live authority: presence, segment control events, sequence ordering, lease/expiry, websocket fanout |
| D1 / relational   | Durable timeline: attendance sessions, segment transitions, moderation/audit records, historical aggregates      |
| KV                | Global low-cost reads: org config, precomputed room snapshots, feature flags, cacheable "up next"/scene metadata |
| Queues            | Async durability and fanout: batched writes, notification dispatch, analytics pipelines                          |
| R2/object storage | Media payloads only (videos/images/audio/thumbnails), never control-plane authority                              |

### 18.2 Rollout Rules

- New realtime features MUST declare the asset split before implementation.
- A feature SHALL fail design review if DO is used for archival/reporting concerns that fit D1/KV/Queues.
- Push-first transport is default; periodic polling requires explicit temporary waiver and removal criteria.
- Telechurch app artifacts under `refer.app/spirit/*` MUST capture route class, parity gates, and cost guardrails per capability.

### 18.3 Cost Guardrails (Telechurch v1+)

- Prefer one room stream per audience scope rather than parallel polling/state loops.
- Use snapshot + delta envelopes for late join and reconnection.
- Batch noisy low-risk event classes and persist asynchronously unless hard-state policy overrides.
- Reduce hidden-tab/background heartbeat pressure and reconnect aggressively but with bounded backoff.
