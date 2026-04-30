# refer.codebases.md - Repo Codebase and Subspace Doctrine

## 1. Purpose

`refer.codebases` governs how REFER treats repos that contain one or more codebases.

The default unit of governance is the installed repo root. A monorepo is one governed workspace with internal subspaces, not a set of separate REFER installs.

## 2. Core Law

If REFER is installed once at a repo root, REFER must track that repo as one relationship.

Repo-level tracking includes:

- one REFER law surface,
- one root agent governance surface,
- one metrics scope,
- one process-state file,
- one update-sync state,
- and one workspace-level plan surface.

Internal codebases may exist inside the repo, but they do not create separate tracking scopes unless the operator installs REFER separately in separate repos.

## 3. Monorepo Assumption

When a repo contains multiple apps, packages, services, workers, or tools, REFER must assume relationship before separation.

The correct model is:

- repo root = governed workspace,
- internal codebase = routable subspace,
- subspace path = scope hint,
- plan target paths = execution boundary,
- metrics/process/update state = repo-level evidence.

Codex must not infer that each internal app or package requires its own REFER install.

## 4. Codebase Registry

REFER may maintain a derived registry at:

`.refer-factory/codebases.json`

The registry is a routing and scope aid. It is not the source of universal law and does not replace root governance.

Each entry should describe:

- `id`
- `path`
- `framework`
- `adapter`
- `status`
- `target_paths`
- optional `alias`
- optional `primary`
- optional `manual`

The registry should also declare:

- `workspace_mode`: `single` or `monorepo`
- `tracking_scope`: `repo`
- `last_scanned_at`
- `ignored_paths`

## 5. Refresh Behavior

The registry should be refreshable.

Refresh rules:

- newly found internal codebases are added as `discovered`,
- existing active entries remain active,
- missing paths are marked `missing`, not deleted,
- ignored paths remain ignored,
- manual aliases and overrides are preserved,
- repo-level tracking remains unchanged.

Refresh may be performed by a command, activation hook, script, or governed automation. It must not silently remove operator annotations.

## 6. Planning and Execution

Plans in monorepos must use the registry as a scope aid.

When intent targets a known subspace, Planner should include target paths for that subspace. When intent crosses subspaces, Planner should name the involved subspaces and declare the relationship.

Execution must respect declared target paths. The existence of a monorepo does not authorize broad writes across unrelated internal apps or packages.

## 7. Metrics and Persistence

Lines of code should be calculated as one repo-level total unless the operator explicitly requests a diagnostic breakdown.

Process evidence should collapse into the repo-level process state. Subspace names may be included as event metadata or script names, but persistence remains repo-level by default.

## 8. Cross-References

- `refer.md`
- `refer.plan.md`
- `refer.factory.md`
- `refer.localrepo.md`
- `refer.structure.md`
- `refer.efficiency.md`
