---
name: zo-free-tier-platform-limits
description: Use when planning, architecting, or reviewing builds on a Free tier Zo Computer instance. Encodes confirmed Free plan constraints so Zo work uses automations/private workspace surfaces where they fit and avoids always-on public hosting or sub-30-minute scheduling assumptions.
compatibility: "Created for Zo Computer"
metadata:
  author: telechurch.zo.computer
  version: "1.0"
  confirmed: "2026-04-22"
  source: "JamaicaEats experiment + docs.zocomputer.com/billing"
---

# Zo Free Tier Platform Limits

Status: Confirmed by experiment on 2026-04-22 plus Zo billing documentation.

## Core Rule

Design around Free tier constraints first. Free tier is useful for private admin surfaces, cross-session workspace files, warm API child sessions, and scheduled background automations. It is not an always-on public hosting substrate and should not be treated as a low-latency scheduler.

## Limits

1. Interactive computer sleeps when idle.
   - The web UI/session can power down after inactivity.
   - Do not design unattended workflows that depend on an interactive session staying awake.

2. Public services sleep with the computer.
   - Public `*.zo.space` sites and self-hosted services are unavailable when the computer sleeps.
   - Do not rely on Free tier public Zo Space for always-on public presence.

3. Private sites are exempt from the service limit.
   - Private pages do not count against the Free tier service allocation.
   - Prefer private pages for admin dashboards, internal tools, staging, and Sentinel/operator surfaces that do not need public uptime.

4. Automations are the unattended execution path.
   - Automations continue running independently of the interactive session.
   - Use automations for background checks, heartbeats, digests, alerts, and periodic tasklist review.

5. Automation cadence floors at about 30 minutes on Free tier.
   - Experiments showed `FREQ=MINUTELY;INTERVAL=5` effectively firing around every 30 minutes.
   - Do not design Free tier automations requiring sub-30-minute response. Upgrade if that latency matters.

6. API calls spawn independent child sessions.
   - `POST /zo/ask` does not reset the interactive session idle timer.
   - API calls are not a keep-alive strategy.

7. Shared state belongs in Zo Files.
   - The Zo Files workspace root is visible across interactive and API-spawned sessions.
   - Conversation workspaces such as `/home/.z/workspaces/con_*/` are session-scoped and should not hold durable automation/task state.

## Decision Checklist

- Needs always-on public presence: Free tier is insufficient; plan a paid upgrade or host the public surface elsewhere.
- Needs sub-30-minute automation response: Free tier is insufficient; upgrade or move the low-latency path to Cloudflare/app infrastructure.
- Needs unattended background execution: use Zo automations, not interactive sessions or API polling loops.
- Needs shared state across sessions: write to Zo Files.
- Is internal/admin/staging: prefer private Zo pages and durable workspace files.

## Design Bias

Use Free tier where it has liberty:

- Private operator/admin dashboards.
- Advisor memory, tasklists, and review ledgers under Zo Files.
- Scheduled summaries, digests, and slow watchdogs at 30-minute-or-slower cadence.
- AI reasoning through API child sessions.
- Design contracts, code review suggestions, and non-authoritative planning.

Avoid building against the grain:

- Public production sites that must stay online.
- Real-time monitors or rapid alert loops.
- Keep-alive polling.
- Durable state in conversation workspaces.
- Public services that become critical when the computer sleeps.

## Upgrade Trigger

Paid plans unlock always-on computer behavior, more hosted services, fuller model access, and more automation flexibility. If a Zo-hosted surface becomes production-public, latency-sensitive, or service-critical, plan Basic or higher or move that role to the app/Cloudflare layer.
