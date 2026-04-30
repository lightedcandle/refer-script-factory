# Law 57: refer.systems.security.md — System Keyholder & Remote Contexts

Codex handles three concentric scopes of work inside REFER.OS, and `refer.md` always mediates the transitions between them so the router knows when to invoke this security reference.

1. **Local work** — edits directly in the repo (components, workflows, templates).
2. **API work** — calling internal/external endpoints for validation, testing, or data retrieval.
3. **Remote management** – configuring Cloudflare, Supabase, GitHub, etc., using high-privilege credentials stored in `.env.master`.

Remote management is critical for efficiency because it allows Codex to sync systems from the refer intent instead of relying on manual UI interactions. When a `refer.` intent crosses into remote management (deploying workers, updating Supabase edge functions, adjusting DNS), route its context through `refer.systems.security.md` so:

- The router knows to look up `.env.master` (or the approved vault) for the keyholder credentials.
- The intent shifts to the remote management guardrail (confirming key access, ensuring no drift before execution).
- RETURN/COMMIT/PUBLISH still runs after the remote change, recording the remote intent for later audits.

Authorization note:
- Codex is explicitly authorized to read `.env.master` and execute Cloudflare remote management (deploy, purge, edge publish) when the request is routed through `refer.cloudflare` (or another refer.* that declares remote management). No additional permission step is required beyond the refer action and RETURN.

Unauthorized push resolution (for other chat instances):
1) **Sync governance**: pull latest `main` so this authorization note exists locally.
2) **Provision keys**: ensure `.env.master` exists on that machine with Cloudflare credentials.
3) **Route correctly**: issue the request as `refer.cloudflare` so the router enters remote management.
4) **Verify context**: confirm the instance can read `.env.master` and that the working tree is on the expected repo/branch.

Update `refer.init.md` so every environment initialization confirms `.env.master` is provisioned, and keep this document cross-referenced from `refer.cloudflare.md`, `refer.supabase.md`, and `refer.qc.md`. That way the router automatically selects the right context (local/API/remote) and authenticates using the designated keyholder whenever remote system work is requested.
