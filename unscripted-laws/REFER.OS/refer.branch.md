# Law 14: refer.branch.md — Branch Management Reference

`refer.branch` covers branch creation, switching, rollback, and stabilization so the router keeps lineage work coordinated with RETURN/COMMIT/PUBLISH.

## Article 14.1: 1. Branch intent

- **Trigger:** `refer.branch: <command>` or an instruction around git branches (e.g., create `feat-beta/<feature>`, stash/un-stash, restore a clean state).
- **Purpose:** Keep branching in sync with the REFER.OS lifecycles and the Git relation (`refer.github.md`).

## Article 14.2: 2. Branch flow

1. **Phase enforcement:** Respect the refer-enforced phase order (`ui→workflow→broadcast`) while creating or switching branches.
2. **Naming conventions:** Follow conventions like `feat-beta/<feature>` for new work, `hotfix/<ticket>` for repairs, or `refer.governance/<topic>` for governance changes. For plan execution, the branch name must include the Plan ID as the first token after the lane (example: `feat-beta/PLAN-123--<dev>--<feature>`). The developer prefix is required; the suffix is feature-scoped.
3. **Cleanup:** If switching contexts, ensure working tree is clean (stash if necessary) and document stashes so RETURN can close the loop. Always commit before branching (`git add .` + `git commit -m "pre-branch snapshot"`), then branch from the tip of `main`; no branch may be created while unstaged/uncommitted work exists.
4. **Context preservation:** The forward-only lineage rule forbids rolling back. Repairs stay on `main` as forward fixes. New work runs from `main`’s tip—no branching from older commits or sideways forks. Experiments live as `/experiments/<feature>` workspaces (not Git branches) and only promote to real branches through `refer.build`. Document these sandbox paths so merges remain linear and conflict-free.
5. **Plan-first execution:** Plans are created/updated on `main` first. Execution happens on a plan-named branch and the plan registry records `branch_name` when execution begins.
6. **Conflict visibility:** Plan entries must include explicit `target_paths` before execution. Use `npm run plan:conflicts` to identify branch-to-branch overlap; main drift is informational only.

## Article 14.3: 3. Integration

- Cross-reference this action from `refer.commit` and `refer.build` whenever branch operations are part of the flow; logging must reference the branch intent so MVR/tracing can follow the lineage.
