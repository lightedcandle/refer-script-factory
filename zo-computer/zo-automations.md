# Zo Computer — Automations
**Source:** `docs.zocomputer.com/automations`
**Captured:** 2026-04-20

---

## What Are Automations?

Automations are **scheduled AI tasks** — they allow Zo to run AI-powered workflows on a recurring schedule without manual triggers.

Key facts:
- Zo runs the task at the scheduled time in the background
- Can read your integrations, access the web, and write files
- Can deliver results via SMS, email, Telegram, or any other configured channel
- Uses your existing Rule and Persona configurations

---

## What Makes Automations Powerful

Automations combine:
- **AI reasoning** — Zo understands context and can make decisions
- **Integrations** — access to Gmail, Calendar, Drive, Notion, Linear, etc.
- **Web access** — can visit URLs, monitor websites, research topics
- **Notifications** — can deliver output to any of your channels

---

## Example Use Cases

| Use Case | How |
|----------|-----|
| Habit reminder | Schedule a daily text message at a specific time |
| Daily briefing | Pull from email, calendar, Notion, docs → email you a summary |
| Meeting follow-up | After calendar meetings, compose follow-up emails from your notes |
| Website monitoring | Check if an event occurred (product release, price change) → send SMS if yes |
| Weekly report | Aggregate data from Linear/Airtable → generate summary → email |
| Research digest | Search the web for a topic daily → summarize → send to Telegram |

---

## Creating an Automation

Via AI conversation:
```
"Create an automation that..."
```

Or via the Automations section in the app.

Parameters you can configure:
- **Title** — name of the automation
- **Instruction** — the task Zo should run (this is the full prompt)
- **Schedule** — when to run (cron-style or natural language like "every day at 9am")
- **Delivery method** — how to receive output (SMS, email, Telegram, none)
- **Model** — which AI model to use for this automation

---

## Managing Automations

| Action | Command or Tool |
|--------|----------------|
| Create | "Create an automation to..." |
| List | "List my automations" |
| View details | "Show me the full instruction for [automation name]" |
| Edit | "Change my morning briefing automation to include Spotify" |
| Delete | "Delete my website monitor automation" |

All automation management is also available via the **API** and **MCP Server** tools.

---

## Automation vs. Skill

| Feature | Automation | Skill |
|---------|-----------|-------|
| Trigger | Scheduled (time-based) | On-demand (user prompt) |
| Persistence | Stored, recurring | Stored, invoked when needed |
| Output delivery | Can push notifications | Returns response in chat |
| Use case | Background monitoring, reports | Reusable workflow templates |

---

## REFER.OS Integration Notes

Automations are the primary mechanism to map `refer.os` **Spirit plane** behaviors to Zo:
- Spirit (broadcast, EWCPSI) workflows → Automations
- Scheduled event monitoring → Automations
- Background telemetry aggregation → Automations
- Notification dispatch → Automations + channel delivery
