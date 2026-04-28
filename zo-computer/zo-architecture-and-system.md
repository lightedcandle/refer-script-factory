# Zo Computer Architecture and System

Last updated: 2026-04-22
Verification status: Confirmed

## Scope

This file summarizes Zo's documented architecture, provider posture, and system boundaries.

## Confirmed Architecture Model

Zo's security documentation describes three main components:

1. `Zo Application`
   - the end-user application
   - runs on the user's personal server
2. `Zo Agent`
   - hosted on Modal
   - orchestrates interactions between the user, model providers, and tools
3. `Zo Server`
   - internal services hosted on Modal and Cloudflare
   - handles authentication, user accounts, agent tasks, storage, and usage tracking

Source:

- https://docs.zocomputer.com/information/security

## Confirmed Infrastructure Providers

Documented providers include:

- Modal
- Neon
- Upstash
- Cloudflare
- Vercel

Source:

- https://docs.zocomputer.com/information/security

## Confirmed Inference Providers

Documented providers include:

- OpenAI
- Anthropic
- Google Cloud Vertex AI
- Fireworks
- Deepgram
- FAL

Source:

- https://docs.zocomputer.com/information/security

## Confirmed System Posture

- Zo uses a Linux server model.
- The visible workspace path for user files is `/home/workspace`.
- Paid plans are positioned as always-on.
- The free plan can sleep.
- Zo documents support for HTTP, HTTPS, TCP, and SSH service use.
- Zo documents filesystem snapshots for recovery.
- Zo states it does not train models on user data.

Sources:

- https://docs.zocomputer.com/ssh-zo
- https://docs.zocomputer.com/servers
- https://docs.zocomputer.com/information/security
- https://www.zo.computer/

## Architectural Cautions

- Zo is not purely local or self-contained.
- Zo still depends on Zo-operated control services and third-party model providers.
- Long-term portability vision should not be confused with current full operational portability.
- Free tier public `*.zo.space` sites and public self-hosted services should not be treated as always-on; they can sleep with the computer.
- Free tier automations are the preferred unattended execution path but should be planned at 30-minute-or-slower cadence unless a paid plan or external runtime is used.
- API calls to Zo child sessions are not a keep-alive mechanism for the interactive computer.
- Durable cross-session files should live under `/home/workspace/`; conversation workspaces are not durable shared state.

## Open Questions

- what level of outage tolerance exists if Zo-managed services are unavailable
- what parts of system state are fully exportable today in practice
- how much of the current architecture is stable versus research-preview evolution

## Observed `refer` Computer Specs

Point-in-time observation on 2026-04-21:

- CPU: 3 cores
- CPU clock: 1.8 GHz
- architecture: x86_64
- OS: Linux 6.12
- processes: 18
- memory: 1.0 GB / 4.0 GB, 3.0 GB free
- uptime: 2h 25m
- hostnames / addresses:
  - `refer.zo.computer`
  - `refer.zo.space`
  - `refer@zo.computer`

The Zo UI states that specs can change dynamically depending on workloads and plan.

## Shell Validation

Read-only shell validation on 2026-04-21 returned:

- `pwd`: `/home/workspace`
- `uname -a`: `Linux modal 4.4.0 #1 SMP Sun Jan 10 15:06:54 PST 2016 x86_64 GNU/Linux`
- `REFER` directory was visible from the shell

Note:

- Shell-reported kernel differs from the UI-reported `Linux 6.12`. Treat this as unresolved until Zo's UI/kernel reporting model is better understood.
