# Law 49: refer.provider.codex.md — Codex & Tooling Providers

This reference covers the tooling and agent behavior described in `codex/governance/domains/CLI.md`, `Codex.md`, and `ChatGPT.md`. Each serves as a provider relation that REFER.OS consults when orchestrating intents.

## Article 49.1: 1. Agent interaction rules

- Codex interprets `refer.` directives, launches the router (`refer.md`), and obeys the RETURN → COMMIT → PUBLISH loop. Reference this document when describing how Codex should handle new actions or respond to governance updates.
- The CLI and ChatGPT contexts (persistent sessions, CLI-lingering watchers) are considered providers because they supply the environment in which the router executes. Document any expectations (e.g., deferred responses, streaming, CLI watchers) here.

## Article 49.2: 2. Variant behaviors

- If a new tooling provider is introduced (e.g., new CLI extension, alternative LLM), add a new subsection explaining how that provider fits into the refer router. Keep cross-links to the canonical reference if the provider requires guard conditions.

## Article 49.3: 3. Referential enforcement

- When `refer.build` or `refer.repair` interacts with tooling (build commands, CLI watchers), mention this reference so the router knows to coordinate with Codex’s agent semantics (e.g., release gating, streaming output, guard-level prompts).
