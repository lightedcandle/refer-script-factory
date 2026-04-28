# Zo Computer Free Tier Platform Limits

Last updated: 2026-04-22
Verification status: Confirmed

## Source

This record was promoted from the Zo skill:

- `/home/workspace/Skills/zo-free-tier-platform-limits/SKILL.md`
- `E:/refer/zo-computer/skills/zo-free-tier-platform-limits/SKILL.md`

Evidence basis:

- JamaicaEats/Zo experiment on 2026-04-22.
- Zo billing documentation as cited by the originating skill.

## Summary

Free tier Zo should be used as a private, slow-cadence, automation-capable AI workspace. It should not be treated as an always-on public host or low-latency runtime.

## Confirmed Limits

- The interactive computer sleeps when idle.
- Public Zo Space sites and public self-hosted services sleep with the computer.
- Private sites do not count against the Free tier service limit and are the preferred admin/staging surface.
- Automations continue independently of the interactive session and are the right unattended execution path.
- Free tier automations appear to floor around a 30-minute cadence; do not depend on sub-30-minute execution.
- `POST /zo/ask` spawns independent child sessions and does not keep the interactive session awake.
- Durable shared state should live under `/home/workspace/`, not under session-scoped `/home/.z/workspaces/con_*/` paths.

## Architectural Guidance

Good Free tier fits:

- Private admin/operator dashboards.
- Sentinel/advisor memory files, tasklists, ledgers, and digest state under `/home/workspace/`.
- Periodic reviews, summaries, watchdogs, and recommendations at 30-minute-or-slower cadence.
- Design contracts, code review suggestions, capability checks, and non-authoritative planning.
- API child-session AI calls when they do not need to keep the computer awake.

Poor Free tier fits:

- Always-on public production sites.
- Public ministry surfaces where uptime matters.
- Real-time monitoring or rapid alerting.
- Keep-alive loops through the API.
- Runtime-critical services that disappear when the computer sleeps.
- Durable files in conversation workspaces.

## Upgrade or Reroute Rule

If a Zo design requires always-on public availability, sub-30-minute automation, critical uptime, or runtime-sensitive response, route that function to:

1. a paid Zo plan,
2. the canonical app/Cloudflare layer, or
3. a different always-on provider.

Do not build the public or latency-sensitive part against Free tier behavior and hope it works.
