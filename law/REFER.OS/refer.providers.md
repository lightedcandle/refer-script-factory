# Law 50: 🔌 **refer.providers.md**

**Agent & Tooling Providers for REFER.OS**

This document defines the interface between REFER.OS and the external agents/tools (Providers) that execute its will.

---

## Article 50.1: 1. Codex (The Architecture Agent)

**Role:** Primary Executor, Guardian of Governance.

- **Semantics:** Codex understands `refer.` directives natively.
- **Responsibilities:**
  - Interpret `refer.md` routing.
  - Enforce `refer.law` (RETURN → COMMIT → PUBLISH).
  - Invoke `refer.compiler`.
- **Interaction:** Codex is the "User's Hands." It is the only provider authorized to write to `REFER.OS` without a governance token.

---

## Article 50.2: 2. CLI (The Terminal Provider)

**Role:** Execution Environment.

- **Reference:** `refer.cli`
- **Semantics:** CLI sessions act as stateful providers.
  - Watcher processes (e.g., `ng serve`) are "Lingering Intents."
  - Commands must always be scoped (e.g., `refer.build` triggers `npm run refer:build`).
- **Safety:** The CLI provider must never run destructive commands (`rm -rf`) without explicit `refer.repair` authorization.

## Article 50.2.1: CLI-first external service doctrine

For operational work against external systems, REFER.OS prefers official authenticated CLIs over browser/manual control or improvised API calls when a stable provider CLI exists.

Provider operation ladder:

1. repo-local config and env
2. official authenticated CLI
3. scripted API usage
4. browser/manual fallback

Rules:

- For provider mutation, prefer the official CLI first.
- For provider inspection, the official CLI is preferred when it exposes the needed state clearly.
- Browser/manual fallback is lawful only when:
  - the provider lacks a stable CLI,
  - the CLI cannot perform the needed action, or
  - the user explicitly requests a manual/browser path.
- Docs and implementation references may still come from official provider documentation; CLI-first governs operations, not all knowledge retrieval.

### Section 50.2.2: CLI install + auth readiness

When a provider relation becomes operationally important for a repo, governance should encourage:

- install the official CLI locally
- authenticate explicitly
- verify account/project selection before mutation
- keep auth material in the approved env or provider login surface

Operational readiness checks should confirm:

- CLI is installed and reachable
- auth is active
- target account/project is explicit
- mutation commands are scoped to the intended repo/task

---

## Article 50.3: 3. ChatGPT / LLM (The Conversational Provider)

**Role:** Brainstorming, Reasoning, Context Analysis.

- **Reference:** `refer.plan`
- **Semantics:**
  - Uses Plan intake protocol to interrogate context.
  - Does NOT have direct write access to the filesystem (must delegation to Codex).
  - Must be reminded of `refer.ontology` when hallucinating non-existent structures.
- **Context Alerts:** If an LLM suggests a structure violating ASEDAWSI (e.g., "Put the API call in the Component"), the Router must flag it as an Ontology Violation.

---

## Article 50.4: 4. Future Providers

To add a new provider (e.g., GitHub Actions, Vercel), add a section here defining:

1.  **Role:** What does it do?
2.  **Semantics:** How does REFER speak to it?
3.  **Safety:** What are the boundaries?

## Article 50.5: Preferred provider CLI surfaces

When applicable, use the official CLI/control surface first:

- GitHub -> `gh`
- Cloudflare -> `wrangler`
- Supabase -> `supabase`
- Google Cloud -> `gcloud`

App-specific providers may extend this list in app law.
