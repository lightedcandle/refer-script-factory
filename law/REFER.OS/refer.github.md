# Law 31: refer.github.md - GitHub operating model (App-Agnostic)

This document is the GitHub-side source of truth for how REFER.OS governs GitHub relations across apps. App-specific repo details live in `refer.<app>.md`. It aligns with:

- `REFER.OS/refer.branch.md`
- `REFER.OS/refer.commit.md`
- `AGENTS.md` (automation + merge workflow)

## Article 31.1: 1. Repo facts

- Repository facts are app-specific and must be documented in `refer.<app>.md`.
- Governance: `REFER.OS/*` is canonical (legacy `codex/governance` submodule has been removed).

## Article 31.2: 1.1 Universal governance (cross-app)

To share governance across multiple applications, publish `REFER.OS/` as a standalone governance repository and consume it as a submodule mounted at `REFER.OS/` in each app repo.

Steps: see `REFER.OS/refer.governance.publish.md`.

## Article 31.3: 2. Branching + lineage (forward-only)

- Branch naming and promotion rules are defined by the app governance (`AGENTS.md`) and `refer.branch.md`.
- App-specific branch lanes and helper scripts must be documented in `refer.<app>.md`.

## Article 31.4: 3. Local checks (what CI expects)

- CI expectations and local preflight commands are app-specific. Document them in `refer.<app>.md`.

## Article 31.5: 4. GitHub Actions (what runs in GitHub)

Workflow names, triggers, and deploy policies are app-specific. Document them in `refer.<app>.md`. When deploy behavior is involved, also cite the relevant system relation (e.g., `refer.cloudflare.md`).

## Article 31.6: 5. GitHub auth: pushing workflow files

If you change anything under `./.github/workflows/*`, GitHub requires an auth token with the `workflow` scope to push.

Using GitHub CLI:

- Check scopes: `gh auth status`
- Add scope: `gh auth refresh --hostname github.com -s workflow`
- Retry push: `git push origin <branch>`

CLI-first relation:

- `gh` is the preferred operational control surface for GitHub inspection and auth management when the task is GitHub-specific.
- Prefer `gh auth status`, `gh repo view`, and related CLI inspection over browser/manual checking when the CLI exposes the needed state.

## Article 31.7: 6. PR conventions

- PR templates, CODEOWNERS, and auto-merge labels are app-specific. Document them in `refer.<app>.md`.

## Article 31.8: 7. Dependabot

Dependabot configuration is app-specific. Document it in `refer.<app>.md`.

## Article 31.9: 8. Known gotchas (guardrails)

- App-specific guardrails belong in `refer.<app>.md`.
- If you still see references to `codex/governance`, treat them as historical only; do not reintroduce a governance submodule without a `refer.governance:` decision.
