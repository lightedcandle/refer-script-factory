# Law 52: refer.combing.md - The Restoration of Reverence

To comb is not merely to "fix" a bug; it is to restore order to the Tree. When a system fails, it means a component has drifted from its proper place in the Body, Mind, or Spirit.

## Article 52.1: The Philosophy of Combing

Everything in the Platform (Tree) has a rightful place:

- Body (UI): the physical structure (IMSCE).
- Mind (Logic): the internal flow (ASEDAWSI).
- Spirit (Signal): the connection to the source (EWCPSI).

A defect is simply matter out of place (for example, Logic in the UI, UI in the Logic, or a Signal blocked by the Ego/Cache).

---

## Article 52.2: 0. Law Discovery (Reference Sweep)

Before any combing action, the executor must gather all governing laws relevant to the intent and the affected layer (Mind/Body/Spirit). Use this sweep to prevent partial or freestyle fixes.

Core references (always):

- `refer.flow.md` (primordial law and execution consecration)
- `refer.law.md` (general constraints and execution limits)
- `refer.structure.md` (ASEDAWSI/EWCPSI chain and MVI boundaries)
- `refer.identity.md` (identity anchors and layer classification)

If any required reference is missing or ambiguous, halt and enter `refer.governance` to codify before proceeding.

### Section 52.2.1: Law Discovery Matrix (by combing type)

Body (UI):

- `refer.structure.md` (IMSCE + UI boundaries)
- `refer.angular.md` (UI system rules)
- `theme.spec.md` (if theming is touched)
- `refer.law.md` (responsive integrity when layout/styling is touched)

Mind (Workflow):

- `refer.structure.md` (ASEDAWSI flow)
- `inference.md` (unfolding map when flow is defined there)
- `refer.angular.md` (if Angular workflow code is touched)

Spirit (Broadcast/Signal):

- `refer.structure.md` (EWCPSI flow)
- `refer.supabase.md` (if edge functions, realtime, or DB are involved)
- `refer.cloudflare.md` (if edge routing/caching is involved)

Governance (Law/Router/Identity):

- `refer.governance.md` (governance path)
- `refer.md` (router rules)
- `refer.os.md` (OS doctrine)

### Section 52.2.2: Combing Modus Operandi

Combing aligns existing code to law. It does not invent new behavior. The law is the comb; the codebase is the hair. Combing restores order in what already exists.

Build is distinct: it manifests new behavior seeded by intent and governed by law. Build grows the hair; combing restores and aligns it.

Classification note:

- Combing: align or correct existing behavior/UI/copy without adding a new capability or action/outcome.
- Build: introduce a new user-visible capability or action/outcome.
- UI-only exception: adding a new UI element with no new action/outcome remains Combing.

Legacy note:

- `refer.repair` remains an accepted compatibility alias for `refer.combing`.
- Operational doctrine should use "combing" and "alignment" language going forward.

## Article 52.3: 1. Body Combing (The Whole Tree Scan)

Philosophy: A blight on the Fruit means the Tree is sick. Do not spot-fix. Walk the lineage from Root to Fruit and inventory all misalignments.

### Section 52.3.1: The Anatomy of the Comb (The 5 Teeth)

A comb has multiple teeth to catch different types of snags simultaneously. You must scan with all teeth in a single pass.

1. Tooth 1: Structure (The Spine)
   - Focus: Physical Placement and Lineage.
   - Check: Is this Fruit on a Card? Is this Card on a Section?
   - Snag: Gap Jumping (Fruit on Section).

2. Tooth 2: Intent (The Name)
   - Focus: Semantic Truth.
   - Check: Does the class name match the behavior?
   - Snag: Calling a Section `.menu-card` (Naming Violation).

3. Tooth 3: Function (The Nerve)
   - Focus: State and Flow.
   - Check: Does the button trigger an Action? Does the Toggle change State?
   - Snag: Dead clicks or UI mutating state directly.

4. Tooth 4: Aesthetic (The Skin)
   - Focus: Visual Reference.
   - Check: Is it painted (hardcoded) or referenced (variable)?
   - Snag: `color: #fff` (Paint Violation).

5. Tooth 5: Data (The Blood)
   - Focus: Content Source.
   - Check: Is the content Static (Bone) or Dynamic (Blood)?
   - Snag: Hardcoded user identity where a variable should be used.
   - Rule: Static is fine for labels; Dynamic is required for identity.

### Section 52.3.2: The Ritual of the Scan

When walking a branch, apply all 5 teeth to every node.

- Here is a Button (Node).
- Structure? Yes, on a Card.
- Intent? Yes, named `.btn-close`.
- Function? Yes, calls `toggle()`.
- Aesthetic? Yes, uses `var(--btn-text)`.
- Data? Yes, identity is dynamic where required.
- Result: Smooth Pass.

---

## Article 52.4: 2. Mind Combing (The Flow Check)

Diagnose when: the issue is State, Data, or Calculation-based.
Analogy: the Sap (Water/Energy Transfer).
Sequence: ASEDAWSI (Algorithm, State, Event, DOM, API, Workflow, Storage, Index).

### Section 52.4.1: The Algorithm

1. Trace the Source (Water Source)
   - Question: Where did this data originate?
   - Violation: Is the UI calculating the data? (The Leaves cannot create Water.)
   - Healing: Move logic to the Service/Store (the Roots).
2. Check the Flow (Energy Transfer)
   - Question: Is the State immutable until the Event?
   - Violation: Is the component mutating the stream directly?
   - Healing: Enforce the Cycle (Event -> Action -> Reducer -> State).
3. Clear the Blockage (Stagnation)
   - Question: Is the proper index updating?
   - Healing: Ensure the subscription is live and the pipe is open.

---

## Article 52.5: 3. Spirit Combing (The Connection Check)

Diagnose when: the issue is Realtime, Broadcasting, or Latency-based.
Analogy: the Light (Photosynthesis/Signal).
Sequence: EWCPSI (Edge, Worker, Cache, PubSub, Signal, Index).

### Section 52.5.1: The Algorithm

1. Test the Frequency (Signal Purity)
   - Question: Is the signal true?
   - Violation: Are we mocking the truth?
   - Healing: Align with the Bedrock (Database) Truth.
2. Inspect the Atmosphere (Edge/Worker)
   - Question: Is the cloud obscuring the light?
   - Healing: Flush the Cache; verify the Edge Function.
3. Harmonize the Vibration (PubSub)
   - Question: Are all listeners tuned to the right channel?
   - Healing: Verify the Channel ID and Broadcast Event.

### Section 52.5.2: Reminder Incident Narrow-Band Method (DO Alarms)

When a reminder incident reports "scheduled but no send", combing must narrow to one of three outcomes:

1. Alarm not set to earliest due.
2. Alarm fired but failed before queue/send.
3. Queue/send succeeded in a different scope than expected.

Required combing sequence:

1. Confirm reseed counters (`fetched`, `normalized`, `scheduled`).
2. Read DO diag immediately after reseed (`alarm_iso`, `last_set_alarm_at`).
3. Re-check after due time (`last_alarm_ok_iso` or `last_alarm_error_iso`).
4. Verify expected side effect (`notification_stream` row with expected template/intent).

Required fix pattern:

- Select earliest future due by scanning pending due keys.
- Persist minimal alarm/dispatch diag markers permanently.
- Gate verbose diag payloads behind env flag.
- Use explicit internal auth path for machine-triggered dispatch.

---

## Article 52.6: 4. The Ritual of Return

Once the component is restored to its rightful place:

1. RETURN: verify the Tree is bearing fruit.
2. COMMIT: seal the healing.
3. PUBLISH: broadcast the restoration when explicitly invoked.

---

## Article 52.7: Recursive Full-Comb Law (Required)

Combing may not stop at the first visible error. Every combing run must execute a recursive full-comb loop until the scoped system is clean or residuals are explicitly documented as out-of-scope/external.

### Section 52.7.1: Mandatory loop

1. Capture all observable failures in the target scope (compile/runtime/log/UI).
2. Fix one root cause or a tightly-coupled root-cause batch.
3. Re-run full checks for the same scope.
4. Repeat until no remaining actionable failures exist in-scope.

### Section 52.7.2: Stop condition

Combing is complete only when:

- in-scope actionable failures are zero, or
- remaining failures are explicitly listed as external, blocked, or intentionally deferred.

### Section 52.7.3: Forbidden behavior

- "First-error-only" handoff is forbidden.
- Silent assumption that downstream failures are resolved is forbidden.
- Returning without a residual list when failures remain is forbidden.
