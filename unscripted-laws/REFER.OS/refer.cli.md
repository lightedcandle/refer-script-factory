# Law 17: refer.cli.md — CLI Execution Reference

When a refer action needs to run shell commands (build, test, deploy, migration), `refer.cli` documents the command set, environment, and how outputs feed back into RETURN/COMMIT.

## Article 17.1: 1. CLI scope

- Each refer action (build/repair/expand/migrate) invokes CLI scripts through the CLI provider (`refer.provider.cli.md`). Use `refer.cli` to capture which commands belong to that action (`npm run lint`, `npm run test`, policy tooling reset per `REFER.OS/refer.tooling.md`, `npx codex:execute`, etc.).
- Keep CLI work tied to the refer context: log the intent, guard the working tree, and avoid unscoped shell access by always prefixing commands with the current refer domain.

## Article 17.2: 2. Guardrails

- Always run CLI commands inside a clean branch per `refer.branch.md`. Use Plan intake if you need to confirm context before executing long-running scripts.
- Collect stdout/stderr in the action log or `build_tracker.yaml` and reference the result in `refer.qc.md` before returning control to COMMIT.

## Article 17.3: 3. Remote/Management tasks

- Remote management CLI commands (Supabase deploys, Cloudflare wrangler publishes) pull keys from `.env.master` via `refer.systems.security.md`; mention those credentials in this doc so the refer router knows when to escalate to remote context.

## Article 17.4: 4. Active CLI inventory

- Maintain an active installed-CLI reference for the current machine/user environment so REFER actions do not assume a tool is present from memory alone.
- The inventory should record, at minimum, the command name, resolved executable path, install source or package manager (`winget`, `choco`, `scoop`, `npm -g`, direct install), visible version, and whether the install is machine-wide, user-wide, or repo-local when known.
- Refresh the inventory after any CLI install, upgrade, removal, PATH mutation, or shell-profile change, and re-check it before work that depends on management/deploy/migrate tooling.
- Treat the inventory as an operational reference, not shared authority: a committed snapshot may help the current repo, but it does not guarantee availability in other repos, users, CI runners, or remote shells.
- If the inventory is stale or missing an expected tool, re-scan the environment first and update the reference before concluding the CLI is unavailable.
- Default discovery order for the active CLI inventory is: machine-local developer root (`E:\Developer\cli\` or the active developer root), then repo-local `Developer\cli\`, then repo-local artifacts/docs that explicitly declare CLI state.
