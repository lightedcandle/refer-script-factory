# Law 25: refer.cron.md

## Article 25.1: Purpose

This document defines the **Cron + Scheduling Doctrine** for the E2E architecture. It establishes how time-based behavior is governed, executed, and revealed across the system.

**Governance Canonical:** This file is the single canonical reference for all cron, scheduling, recurrence, and task compiler doctrine.

This document is **authoritative** for:

* Scheduled execution
* Deferred workflows
* Time-based state transitions
* Cron + Realtime coordination

This document is consumed by **Codex** for construction and enforcement.

---

## Article 25.2: Core Principle

> **Cron governs time. Execution governs work. Realtime governs visibility.**

Cron never performs domain work. It only **triggers evaluation of time**.

---

## Article 25.3: Conceptual Model

### Section 25.3.1: Roles

* **Cron**: the clock pulse
* **Scheduler Table**: the declaration of intent
* **Dispatcher Edge**: routing + locking
* **Execution Edges**: domain-specific work
* **Realtime**: optional visibility channel
* **UI**: renders truth, never resolves time

---

## Article 25.4: Single Cron Rule

There SHALL be:

* **One cron trigger per environment** (dev / prod)
* **One cron-dispatcher edge function**

Cron:

* runs at a fixed interval (recommended: 1 minute)
* performs a fast query
* exits immediately after dispatch

Cron SHALL NOT:

* contain business logic
* execute heavy work
* listen for events
* personalize behavior

---

## Article 25.5: Scheduler Table (Temporal Authority)

The scheduler table is the **single source of truth for future actions**.

### Section 25.5.1: Canonical Table

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

* Domain data NEVER lives here
* This table stores **intent, not state**

---

## Article 25.6: Recurrence Templates (Optional, For Repeatable Schedules Only)

Templates exist **only** for recurring schedules. One-off tasks live exclusively in `cron_scheduled_tasks`.

### Section 25.6.1: Canonical Template Table

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

* If `repeat_cron` is set, it overrides `repeat_unit + repeat_every`.
* `next_run_at` is authoritative and is advanced after each materialized run.
* Templates only **materialize** tasks; they do not execute work.

---

## Article 25.7: Hybrid Scheduling UX (Presets + Custom)

For users and systemwide schedulers:

* Presets (dropdown): minute, hourly, daily, weekly, monthly.
* `repeat_every` supports “every other day/week” without extra templates.
* Custom option fills `repeat_cron` (or explicit `repeat_interval`).

This keeps UX simple while supporting edge-case schedules.

---

## Article 25.8: Task Compiler (Table-Driven Watchers)

The **Task Compiler** is the "watcher" for time-based conditions. It is a cron-triggered
edge that **materializes tasks** from domain data. It does not execute work; it only
creates `cron_scheduled_tasks`.

The compiler is invoked directly by `cron-dispatcher` when due rules exist. This keeps
heartbeat execution centralized while avoiding a `compiler.run` entry per minute.

### Section 25.8.1: Rule Table (Table-Driven)

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

* Compiler only scans **due rules** (`next_run_at <= now()`).
* Rules can be paused/canceled without redeploying code.
* Minimal rule schema; no full interpreter unless needed.
* `repeat_cron` is supported for custom cadences.

### Section 25.8.2: Compiler Responsibilities

* Load due rules
* Query target tables with rule filters and time windows
* **Upsert** into `cron_scheduled_tasks` with a de-dup key
* Advance `next_run_at`
* Exit quickly

### Section 25.8.3: Watcher Clarification (No Event Triggers)

The watcher is **not** an event listener. It is a **time-based scanner**:

* It runs on cron heartbeat.
* It detects **time windows** (e.g., "3 hours before starts_at").
* It does **not** react to DB changes in real time.

If we need true change detection, that is a **separate event system** (realtime,
DB triggers, or Edge webhooks) and is **outside cron**.

### Section 25.8.4: De-dup Guard (Required)

Prevent duplicate tasks with a unique fingerprint, e.g.:

```
unique(task_type, target_table, target_id, run_at)
```

If a task already exists, the compiler skips insert.

### Section 25.8.5: Workload Cost Notes

* Cost comes from **scan volume**, not rule storage.
* Table-driven rules help reduce scans by only evaluating due rules.
* Use time windows and indexes on `time_field` to keep scans small.

---

## Article 25.9: RSVP Reminder Rule (First Compiler Rule)

First rule to implement:

* `event.reminder` - send SMS to RSVP attendees **X minutes before** `events.starts_at`.
* Reminder offset is **per RSVP** (e.g., 15/30/60/180 minutes), not static.

This requires an RSVP table with reminder preference per attendee.

Compiler guard (recommended):

* `event_rsvps.compiled_at_date` tracks the last compile window handled.
* The compiler only schedules reminders newer than this timestamp.

## Article 25.10: Routing Doctrine

### Section 25.10.1: task_type

`task_type` is the **routing ticket**.

Examples:

* `event.reminder`
* `event.go_live`
* `donation.process`
* `subscription.expire`

The dispatcher uses `task_type` to route execution.

---

## Article 25.11: Payload Doctrine

Payload is **luggage**, not the aircraft.

Rules:

* Payload MUST be minimal
* Payload MUST be serializable
* Payload MUST NOT duplicate domain state unless snapshotting is intentional

Preferred strategy:

* Reference domain records via `target_table + target_id`

---

## Article 25.12: Dispatcher Edge Function

### Section 25.12.1: Responsibilities

The dispatcher edge function:

* is triggered by cron
* queries for due tasks (`run_at <= now()`)
* locks tasks atomically
* routes tasks by `task_type`
* exits

### Section 25.12.2: It SHALL NOT

* contain domain logic
* inspect payload deeply
* perform side effects

---

## Article 25.13: Schedule Location (Cron Trigger)

Cron is driven by the Edge Function schedule:

* Supabase Dashboard -> Edge Functions -> cron-dispatcher -> Schedules
* Recommended interval: 1 minute

No `pg_cron` extension is required for this architecture.

---

## Article 25.14: Fallback: pg_cron Scheduler (When Edge Schedules Are Unavailable)

If the Supabase UI does not expose Edge Function schedules, use `pg_cron` as the
heartbeat. This requires:

* `pg_cron` extension (installed to `extensions` schema)
* `pg_net` extension (for HTTP POST)

Pattern:

* `pg_cron` runs every minute.
* It calls `cron-dispatcher` via HTTP.
* Use a service role key (or a vault secret) for auth headers.

This is still a single heartbeat per environment and stays within the doctrine.

## Article 25.15: Execution Edge Functions

Each execution edge:

* owns ONE domain responsibility
* understands its domain model
* validates state before acting
* is idempotent

Examples:

* `/edge/tasks/event-reminder`
* `/edge/tasks/donation-process`

Execution edges MAY:

* fetch domain data
* call external APIs
* emit realtime events
* update domain tables

---

## Article 25.16: Cron + Realtime Coordination

### Section 25.16.1: Principle

> **Cron changes state. Realtime reveals state.**

Preferred pattern:

1. Cron flips a deterministic field (e.g. `status = 'live'`)
2. Realtime broadcasts the update IF clients are connected
3. UI reacts instantly

Realtime is OPTIONAL and MUST NOT be relied on for correctness.

---

## Article 25.17: Realtime Guarantees

* Realtime only runs when clients are connected
* Realtime does NOT backfill missed events
* All correctness comes from database reads

UI MUST:

* fetch truth on load
* subscribe only for enhancements

---

## Article 25.18: Performance Doctrine

* Cron cost is negligible
* Execution cost is what matters
* Heavy work MUST NOT occur during page load

Rule:

> **If a page asks “Is it time yet?”, that logic belongs in cron.**

---

## Article 25.19: Interval Guidance

* Recommended cron interval: **1 minute**
* Sub-minute intervals are NOT recommended
* If behavior must be instant → use realtime or events

Cron governs **absence of change**, not urgency.

---

## Article 25.20: Methodology Perspective (Efficiency + Fit)

This doctrine optimizes **correctness, traceability, and predictable load**:

* **Efficiency**: cron does cheap scans + atomic locks; heavy work stays in execution edges.
* **Reliability**: scheduler table is the single source of truth; UI never guesses time.
* **Scalability**: domain work fans out by task_type; handlers stay small and idempotent.
* **Observability**: each task is inspectable (status, attempts, failure cause).

Tradeoffs to accept:

* **Latency** is bounded by interval (recommended 1 minute).
* **Bursts** need batching and backoff to avoid spikes.
* **Correctness** requires idempotent handlers and careful retries.

---

## Article 25.21: Viable Use Cases (Current + Upcoming)

This system is best for **time-based state changes** and **deferred workflows** that must be correct even without realtime.

### Section 25.21.1: Immediate Candidates (Upcoming)

* **RSVP reminders** (event.reminder) - time-based outreach.
* **Event go-live** (event.go_live) - flip deterministic status at run_at.
* **Single-stream notifications** (notification.dispatch) - queue and fan-out.
* **Invite pipeline follow-ups** (invite.follow_up) - delayed nudges.
* **Giving receipts** (giving.receipt) - scheduled send after payment settle.

### Section 25.21.2: Existing Behavior That Should Move Here

* **Notification send pending** (currently direct edge usage) - should be scheduled via `cron_scheduled_tasks` and dispatched by cron.
* **Live auto-switching** (if time-based toggles exist) - move time checks out of UI/guards.

### Section 25.21.3: Non-Fit / Avoid

* Anything **interactive** or **user-triggered** that must be immediate.
* Workloads better served by **queues** or **realtime events** without time gating.

---

## Article 25.22: Build-Ahead Checklist (Pre-Build Memory)

Before implementing the cron system, ensure:

* `cron_scheduled_tasks` schema exists with indexes on `run_at` and `status`.
* One cron trigger per environment is defined (1-minute interval).
* Dispatcher edge:
  * Locks due tasks atomically.
  * Routes by `task_type`.
  * Exits without domain logic.
* Ensure the dispatcher invokes the compiler when rules are due (no `compiler.run` tasks required).
* Execution edges are idempotent and update task status.
* Retry/backoff rules are explicit (`max_attempts`, `run_at` reschedule on transient failure).
* Cancellation logic is documented for each domain use case.
* Realtime only broadcasts post-state change; UI always reads DB truth.

**Remember to add at least one live use case in the first build** (e.g., `event.reminder` or `notification.dispatch`) to validate end-to-end flow.

--- 

## Article 25.23: Failure & Retry Semantics

* Tasks MAY retry up to `max_attempts`
* Handlers MUST be idempotent
* Failed tasks remain inspectable
* Tasks MAY be canceled by domain state changes

---

## Article 25.24: Loop Prevention Guards

To prevent infinite loops and runaway rescheduling:

* Enforce a **minimum delay floor** (e.g., `run_at >= now() + 1 minute`).
* Never requeue on failure without **backoff** and `max_attempts`.
* Use `repeat_until` (or explicit end conditions) for recurring templates.
* Dispatcher must **batch limit** to avoid runaway growth.
* Handlers must check task status and exit if already completed/canceled.

---

## Article 25.25: Cancellation Pattern

Domain events MAY cancel scheduled tasks:

```
UPDATE cron_scheduled_tasks
SET status = 'canceled'
WHERE task_type = 'event.reminder'
AND target_id = :id
AND status = 'pending';
```

---

## Article 25.26: Non-Goals

This system does NOT:

* replace realtime
* replace queues
* replace workflows
* replace UI logic

It governs **time**, not behavior.

---

## Article 25.27: Final Doctrine

> **Time is centralized. Execution is specialized. Visibility is opportunistic.**

This doctrine is mandatory for all E2E systems.

---

## Article 25.28: Codex Construction Directive

Codex SHALL:

* implement a single cron-dispatcher edge
* enforce scheduler table schema
* prevent domain logic inside cron
* ensure idempotent execution handlers

🧩 Codex must respond according to:

* codex/governance/E2E_BUILD_RESPONSE_PROTOCOL.md

🔄 Update Workflow and Component Tree accordingly.
✅ Codex builds: temporal-cron-system (ui → workflow → broadcast)
