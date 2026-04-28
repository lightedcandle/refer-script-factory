# Zo Computer Capability Reference

Last updated: 2026-04-20
Status: Living reference
Scope: Fact-checked capability map for Zo Computer as a potential VIPC substrate

## Purpose

This document keeps a stable universal reference for what Zo Computer is confirmed to support, what remains unverified, and where Zo may fit into a future VIPC infrastructure.

Rules for maintaining this file:

- Separate confirmed facts from inference.
- Prefer official Zo sources first.
- Record the source for every material claim.
- Mark gaps explicitly instead of filling them with assumptions.
- Add new discoveries as deltas, not rewrites, unless a prior claim is disproven.

## Working Definition

VIPC stands for `Virtual Intelligent Private Computer`.

For this universal context, Zo is being evaluated as a possible substrate for:

- a personal intelligent cloud computer
- professional domain-specific Zo environments
- future client-facing personal or corporate intelligent computer deployments
- a possible network of managed Zo-backed instances

## Source Priority

Use this order when expanding this file:

1. Official Zo documentation: `docs.zocomputer.com`
2. Official Zo product pages: `www.zo.computer`
3. Official Zo blog or help material
4. Direct product testing
5. Community discussion, only as supplemental evidence

## Confirmed Capabilities

### Core product model

- Zo is positioned as a `personal cloud computer` and `personal server`.
  - Source: https://www.zo.computer/
  - Source: https://docs.zocomputer.com/intro
  - Source: https://docs.zocomputer.com/vision

- Zo is presented as always online and able to run while the user is away.
  - Source: https://www.zo.computer/

- Zo combines files, AI, hosting, automations, and integrations in one environment.
  - Source: https://docs.zocomputer.com/intro
  - Source: https://www.zo.computer/

### Files and workspace

- Zo supports file-centric work across many file types including notes, spreadsheets, code, documents, audio/video, images, PDFs, and ebooks.
  - Source: https://www.zo.computer/

- Zo provides cloud storage, and the free plan includes 100GB according to the pricing page.
  - Source: https://www.zo.computer/pricing
  - Source: https://www.zo.computer/

- Zo provides desktop sync for files between a local machine and Zo.
  - Source: https://docs.zocomputer.com/intro

- Zo aims to store files using open file formats.
  - Source: https://docs.zocomputer.com/vision

### Hosting, apps, and services

- Zo can host sites directly on the Zo instance.
  - Source: https://docs.zocomputer.com/sites

- Zo sites are private by default and can be published publicly.
  - Source: https://docs.zocomputer.com/sites

- Published site URLs can use `sitename-yourhandle.zocomputer.io`.
  - Source: https://docs.zocomputer.com/sites

- Zo's built-in site tool uses Hono and Bun.
  - Source: https://docs.zocomputer.com/sites

- Zo can run services beyond the built-in site tool, including websites, APIs, databases, and self-hosted services such as `n8n`.
  - Source: https://docs.zocomputer.com/intro
  - Source: https://docs.zocomputer.com/sites

- Zo uses SQLite by default when asked to create a database for a site.
  - Source: https://docs.zocomputer.com/sites

- Zo can connect a site to externally hosted databases such as Convex or Supabase.
  - Source: https://docs.zocomputer.com/sites

### Development and remote access

- Zo can be used as a remote development environment over SSH.
  - Source: https://docs.zocomputer.com/ssh-zo

- Zo documents a supported path for IDE-based remote development, including Cursor over SSH.
  - Source: https://docs.zocomputer.com/ssh-zo

- The primary workspace path exposed in the Zo app is `/home/workspace`.
  - Source: https://docs.zocomputer.com/ssh-zo

- Zo can run Python notebook environments such as Marimo as a service.
  - Source: https://docs.zocomputer.com/marimo

### AI and automation

- Zo supports multiple AI models and model providers.
  - Source: https://www.zo.computer/
  - Source: https://docs.zocomputer.com/vision
  - Source: https://docs.zocomputer.com/information/security

- Zo states users can bring their own API keys for providers such as OpenAI, Anthropic, Cerebras, and Groq.
  - Source: https://www.zo.computer/

- Zo supports scheduled automations.
  - Source: https://docs.zocomputer.com/intro

- Zo can notify users by email or text for automation results or conditional outcomes.
  - Source: https://docs.zocomputer.com/intro
  - Source: https://docs.zocomputer.com/updates

- Zo supports built-in tooling for research, coding, browsing, and file manipulation.
  - Source: https://docs.zocomputer.com/intro
  - Source: https://docs.zocomputer.com/updates

### Integrations and channels

- Zo supports app integrations with permission scopes such as read-only and read/write.
  - Source: https://docs.zocomputer.com/connections
  - Source: https://docs.zocomputer.com/integrations

- Publicly documented integrations include Google Calendar, Google Tasks, Notion, Linear, Airtable, Google Drive, Dropbox, OneDrive, Spotify, and Gmail.
  - Source: https://docs.zocomputer.com/integrations

- Zo provides a personal Zo email address for each Zo account.
  - Source: https://docs.zocomputer.com/connections
  - Source: https://www.zo.computer/channels/email

- Zo supports SMS/iMessage, email, Telegram, and API access as channels.
  - Source: https://www.zo.computer/channels

- Discord is listed as `Coming Soon`, not as a confirmed currently available channel.
  - Source: https://www.zo.computer/channels

- Zo's public site states the API gives full access to Zo's AI, files, and tools.
  - Source: https://www.zo.computer/channels/api

- Zo's public API page mentions a Zo MCP server for AI-to-AI communication.
  - Source: https://www.zo.computer/channels/api

### Recovery and portability

- Zo states it performs regular snapshots of the computer and allows restore to prior points in time.
  - Source: https://www.zo.computer/

- Zo's vision page states the entire Zo computer can be packaged, saved, and restored on any machine.
  - Source: https://docs.zocomputer.com/vision

## Confirmed Constraints and Risks

- Zo's Terms describe the service as a `Research Preview User` offering.
  - Source: https://docs.zocomputer.com/information/terms

- Zo is not purely local or fully self-contained from an infrastructure standpoint.
  - Source: https://docs.zocomputer.com/information/security

- The security documentation states:
  - the `Zo Application` runs on the user's personal server
  - the `Zo Agent` is hosted on Modal
  - `Zo Server` components handle authentication, user accounts, agent tasks, storage, and usage tracking
  - Source: https://docs.zocomputer.com/information/security

- Zo states prompts and selected local context may be sent to external inference providers.
  - Source: https://docs.zocomputer.com/information/security

- Publicly named inference providers include OpenAI, Anthropic, Google Cloud Vertex AI, and Fireworks.
  - Source: https://docs.zocomputer.com/information/security

- Zo explicitly warns that giving AI read/write access to tools such as Gmail is risky and can expose users to mistakes or prompt injection consequences.
  - Source: https://docs.zocomputer.com/connections

- Zo states it does not train models on user data.
  - Source: https://docs.zocomputer.com/information/security

## Pricing Snapshot

Public pricing observed on 2026-04-20:

- Free: `$0/month`, `1 service`, `100GB`, goes to sleep
- Basic: `$18/month`, `5 services`, custom domains, `4 cores`, `32GB RAM`
- Pro: `$64/month`, `10 services`, `16 cores`, `128GB RAM`
- Ultra: `$200/month`, `50 services`, `64 cores`, `512GB RAM`

Source:

- https://www.zo.computer/pricing

Note:

- Pricing can change. Re-verify before making architectural or financial commitments.

## Unverified or Not Yet Confirmed

The following should be treated as unknown until directly documented or tested:

- a multi-tenant enterprise admin console
- fleet management for many Zo instances
- centralized policy enforcement across separate Zo accounts
- formal customer provisioning workflows for a managed VIPC estate
- cross-instance orchestration between independent Zo accounts
- detailed public API reference covering auth, endpoints, quotas, and control semantics
- formal organization/team permission model for shared administration
- hard guarantees around export/import portability beyond marketing and vision statements
- disaster recovery behavior if Zo-operated control services are unavailable

## Current Inference Boundary

These are reasonable working inferences, but they are not yet confirmed facts:

- Zo appears strong as a single-node intelligent computer substrate.
- Zo appears suitable for personal use and likely suitable for domain-specific internal environments.
- Zo is not yet publicly proven as a mature fleet-control platform for many client VIPCs.
- A future client-management layer may need to be built around Zo rather than assumed to exist inside Zo.

## Architectural Fit for VIPC

Based on confirmed evidence only, Zo currently fits best as:

- a personal intelligent cloud workstation
- a professional zone-specific cloud node
- a deployable hosted environment for apps, automations, APIs, and services
- a programmable AI-backed execution surface with files, channels, and integrations

Zo is not yet fact-validated in this reference as:

- a corporate fleet manager
- a full tenant-orchestration platform
- a centralized multi-customer governance plane

## Test Protocol Backlog

These are the highest-value validations for future hands-on testing:

1. Verify the actual Zo API surface and authentication flow.
2. Verify whether one Zo can safely coordinate workflows involving another Zo.
3. Verify how snapshots and restore behave in practice.
4. Verify service isolation, quotas, and failure handling under load.
5. Verify how custom integrations are created, stored, and permissioned.
6. Verify whether Zo supports practical shared-admin or team operations.
7. Verify exportability of files, apps, services, and environment state.
8. Verify economics per VIPC profile using current pricing tiers.

## Change Log

### 2026-04-20

- Created initial universal capability reference.
- Captured first-pass fact-checked findings from official Zo sources.
- Separated confirmed capabilities, confirmed constraints, and open gaps.
