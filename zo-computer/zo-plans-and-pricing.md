# Zo Computer Plans and Pricing

Last updated: 2026-04-20
Verification status: Confirmed as of 2026-04-20

## Scope

This file summarizes the public pricing posture that matters for planning Zo-backed VIPC deployments.

## Confirmed Public Plans

| Plan | Price | Availability | Services | Server summary |
| --- | --- | --- | --- | --- |
| Free | $0/month | can sleep | 1 | limited CPU and memory |
| Basic | $18/month | always on | 5 | 4 cores, 32 GB RAM |
| Pro | $64/month | always on | 10 | 16 cores, 128 GB RAM |
| Ultra | $200/month | always on | 50 | 64 cores, 512 GB RAM |

Sources:

- https://www.zo.computer/pricing
- https://docs.zocomputer.com/billing

## Confirmed Notes

- The free tier includes 100 GB storage on the public pricing page.
- Paid plans include AI credits according to the pricing page.
- Zo supports BYOK according to public pricing and BYOK docs.

Sources:

- https://www.zo.computer/pricing
- https://docs.zocomputer.com/byok

## Caution

Pricing and included limits can change. Re-check this file against live pricing before:

- client cost modeling
- fleet economics decisions
- packaging Zo into repeatable service offerings

## Usage Checking

Live account-specific remaining daily AI credits were not visible through the tested Zo chat/API path on 2026-04-21.

Zo provided these account UI routes for manual checking:

- `/?t=account&s=usage`
- `/?t=account&s=usage&d=this-cycle`
- `/?t=account&s=usage&d=past`
- `/?t=account&s=credits`
- `/?t=account&s=payment`
- `/?t=account`

## Local Usage Ledger

Because Zo did not expose remaining daily credits through the tested chat/API path, REFER tracks local Zo API usage separately.

Current ledger:

- `E:\refer\zo-computer\usage\zo-api-usage.jsonl`

Current helper:

- `tools/zo-ask.mjs` in the Telechurch repo

The ledger records request metadata and approximate token counts. It does not store access tokens or full prompt/output content by default.

## Observed Free-Tier Computer Specs

Point-in-time observation for `refer` on 2026-04-21:

- CPU: 3 cores
- CPU clock: 1.8 GHz
- architecture: x86_64
- OS: Linux 6.12
- processes: 18
- memory: 1.0 GB / 4.0 GB, 3.0 GB free
- uptime: 2h 25m

Zo UI notes that specs can change dynamically depending on workloads and plan.

Treat these as observed state, not fixed plan guarantees.
