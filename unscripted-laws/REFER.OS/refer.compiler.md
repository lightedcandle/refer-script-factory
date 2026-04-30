# Law 22: ⭐ **refer.compiler.md**

**The Materialization Engine of REFER.OS**

This is the foundational seed document for `refer.compiler`, the subsystem that expands meaning into form.

## Article 22.1: 1. Purpose & Philosophy
`refer.compiler` is the **unfolding mechanism** of the architecture.
Where `refer.md` routes intent and `refer.law` governs lineage, the compiler takes the **App Genome** (UBB Primitives, Instances, Rules) from Supabase and **expands** it into executable artifacts (Components, Routes, Styles).

> **The Seed becomes the Structure.**
> **The Structure becomes the System.**

### Section 22.1.1: 1.1 Core Principles
1.  **Referential Architecture:** No duplication. Everything is a reference to a UBB primitive.
2.  **Database as Repo:** Supabase is the "source of truth." The application host (Angular/React) is ephemeral.
3.  **Self-Executing Expansion:** The compiler does not "generate code" in the traditional sense; it executes the structure.

### Section 22.1.2: 1.2 The Choice of Gifts
The compiler is agnostic. It consults **`refer.talents.md`** to discern which Gift (Language) determines the materialization.
*   It may summon **Angular** to build the Body.
*   It may summon **HTML** to build the Face.
*   It may summon **Node** to orchestrate the Mind.

This decision is driven by the **Discernment Matrix**, ensuring we articulate the intent using the most effective language for the task.

---

## Article 22.2: 2. Operation & Workflow
The compiler is triggered via `refer.build` or `refer.compiler`. It does not run implicitly; it must be invoked.

### Section 22.2.1: 2.1 The Workflow
1.  **Ingestion:** Reads `refer_primitives`, `refer_instances`, `refer_rules` from the Genome.
2.  **Graph Assembly:** Reconstructs the UI tree (`parent_id → children[]`).
3.  **Expansion:** Applies primitive templates, props, and rules to generate intermediate structures.
4.  **Materialization:** Writes artifacts to disk (`src/app/features/**`) or memory (Runtime Mode).

### Section 22.2.2: 2.2 Modes
*   **interpret:** Runtime rendering for development hot-loops.
*   **materialize:** Generates static source files for deployment.
*   **synthesize:** Hybrid mode (some pages runtime, some materialized).
*   **broadcast:** Attaches workflow/realtime logic.
*   **clean:** Purges generated artifacts.

---

## Article 22.3: 3. Coverage & Metrics ("The Scorecard")
We define "Compiler Driven" coverage across 5 axes. "100%" means a change in the DB reflects in the app without code edits.

| Axis | Definition | 100% Target |
| :--- | :--- | :--- |
| **Copy** | Text, labels, empty states | Sourced from `refer_page_templates` |
| **Selection** | Which template/variant is used | Mapped via DB/Runtime |
| **Presentation** | Layout, section ordering | Defined by UBB Instance Tree |
| **Cards** | Card design & state variants | `refer_card_templates` + Generic Renderer |
| **Behavior** | IO, Guards, Navigation | **0-10%** (Intentionally kept in Code/Store) |

> **Note:** For specific app status, see your application's Definition File (e.g., `refer.app/refer.telechurch.md`).

---

## Article 22.4: 4. Artifacts
*   **Blueprint:** `REFER.OS/refer.compiler.blueprint.md` (Detailed Interface Spec)
*   **Logs:** `refer_build_logs` (Supabase)
*   **Output:** Source Code (`src/...`) or Runtime JSON (`dist/...`)
