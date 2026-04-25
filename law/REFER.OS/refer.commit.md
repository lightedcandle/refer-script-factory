# Law 19: refer.commit.md — Commit Law Reference

`refer.commit` formalizes how RETURN transitions to COMMIT and seals the lineage; it defers to Git/GitHub policies captured in `refer.github.md`.

## Article 19.1: 1. Commit intent

- **Trigger:** `refer.commit: <summary>` or any instruction that finalizes a RETURN-verified change (including the new textual cues “Global commit” or “Local commit” described below).
- **Purpose:** Ensure all actions have obeyed branch rules, documented RETURN results, and prepared the repository for publishing.

## Article 19.2: 2. Commit flow

1. **RETURN verification:** Run RETURN checks automatically for any commit/publish request. Do not prompt; only skip if the user explicitly requests a skip.
2. **Lineage check:** Use `refer.github.md` to verify branch conventions, PR requirements, and required approvals (per `config.toml` ratification).
3. **Commit drafting:** Create a message derived from the canonical refer context (identity, structure, action). When executing a Plan, the commit message must match the Plan ID/Title (e.g., `PLAN-123: <Title>`). If the router inferred a `push all`/publish chain from Plan intent, it must auto-select **global commit** and derive the commit message from the active Plan without prompting.
4. **Commit execution:** Run git commit/push commands, or leave a documented instruction if automation handles it.

## Article 19.3: 3. Global vs. Local commit guidance

When the Architect specifies a commit command that does not name a refer action (for example “commit”, “commit all”, “global commit”, or “local commit”), Codex must interpret the implied scope before proceeding.

1. **Global commit:** The trigger word `Global commit` signals the Architect’s grant of “power of attorney” across all pending chat windows. The agent may stage every tracked change, run RETURN/QC, and complete the commit/publish sequence as if the Architect authorized a repo-wide seal. Always confirm that no separate REFER flow is already running (e.g., another open Plan thread) before executing global commits.
2. **Local commit:** When the Architect says `Local commit`, restrict the commit scope to the files changed during the current refer action (per the `refer.*` context). Do not automatically include unrelated tracked changes.
3. **Ambiguous `commit` requests:** If the Architect simply says “commit”, “commit all”, or similar, pause and ask: “Do you want a global commit (everything) or a local commit (just the current work)?” Only after they choose may you proceed, still honoring RETURN & QC requirements.

This rule is a governance update and therefore becomes part of the canonical commit law; refer to this section whenever a chat request touches commit/publish semantics.

## Article 19.4: 3. Post-commit

- Document the commit in the action log so RETURN→COMMIT→PUBLISH traceability remains.

## Article 19.5: 4. Lineage law

- The forward-only lineage rule forbids rollbacks. Regressions on `main` must be repaired with forward commits; do not rewrite history. Branches always originate from the current tip of `main`. Experimental work uses `/experiments/<feature>` directories, which can be promoted to refer.build when ready.
