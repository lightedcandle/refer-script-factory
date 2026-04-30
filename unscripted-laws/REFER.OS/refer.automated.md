# Law 12: REFER Automated Governance

## Article 12.1: Purpose

Define app-agnostic governance for automation in REFER-compliant systems. This
reference distinguishes **features** (user-facing behavior) from **functions**
(mechanisms that execute behavior) and declares that function governance
prevails when conflicts exist.

## Article 12.2: Scope

Applies to all automation that triggers without direct user input, across
Mind/Body/Spirit domains.

## Article 12.3: Definitions

- **Feature**: user-facing behavior or outcome.
- **Function**: execution mechanism or trigger that runs behavior.
- **Automation**: any function that runs without a user-initiated action.

## Article 12.4: Authority

Function governance prevails. If a feature request conflicts with function
rules in this reference, the function rules override the feature request.

## Article 12.5: Allowed Automation Classes

1. **On Init**
   - Runs during page load, component init, or first render.
   - Must be idempotent and safe to rerun.
2. **Realtime**
   - Triggered by channel events, websockets, or realtime feeds.
   - Must validate event provenance before applying effects.
3. **Cron / Scheduled**
   - Triggered by time-based schedules.
   - Must declare cadence and scope in the governing feature reference.
4. **Timers**
   - Short-lived timeouts/intervals for UX or session flow.
   - Must be bounded and cleanup-safe.
5. **Background Sync**
   - Triggered by reconnect, resume, or idle detection.
   - Must avoid destructive changes without confirmation.

## Article 12.6: Requirements

- Each automated feature must cite a governing reference that:
  - States scope and jurisdiction.
  - Defines allowed and forbidden behavior.
  - Declares assumptions (identity, auth state, environment).
- Automation may only call functions that are already authorized for the
  domain (Mind/Body/Spirit) and role (View/Intent/Service/Guard/Signal).
- Automation must not bypass Guard or Signal stages.
- Automated identity use must respect auth state; cached identity data must
  be cleared on logout to prevent stale labels from driving automated actions.

## Article 12.7: Prohibited

- Automation that performs IO from components.
- Automation that changes persistent state without a reference that explicitly
  permits it.
- Automation that executes in a different domain than the feature reference.

## Article 12.8: Ratification

This reference is non-executable until ratified and logged in `refer.law.md`
and linked from `refer.os.md`.
