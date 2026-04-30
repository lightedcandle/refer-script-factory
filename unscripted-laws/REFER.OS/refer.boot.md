# Law 13: ⚡ **refer.boot.md**

**The Agent Handshake Protocol**

> *"Stop searching. Start knowing."*

This document is the **first read** for any AI agent entering the REFER.OS ecosystem. It eliminates the "discovery phase" friction by declaring the environment state, key locations, and health checks explicitly.

---

## Article 13.1: 1. The Keyring (Secret Management)

**DO NOT SEARCH FOR KEYS.** They are located here for your context:

| Context | File | Purpose | Keys of Note |
| :--- | :--- | :--- | :--- |
| **Remote (Write)** | `.env.master` | High-privilege ops (Deploy, Migrate) | `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN` |
| **Local (Read)** | `.env.local` | Application runtime | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Shell** | `process.env` | Ephemeral overrides | - |

> **Rule:** If you need to write/deploy, you MUST read `.env.master` to get the credentials. If you are just testing connectivity, `.env.local` is sufficient.

---

## Article 13.2: 2. The Doctor (Health Check)

**DO NOT GUESS CONNECTIVITY.**

Run this command immediately upon session start to verify your limbs are attached:

```bash
node tools/refer-doctor.js
```

It will check:
1.  **Supabase** (Read access to `refer_routes`)
2.  **Cloudflare** (Environment variable presence)
3.  **File System** (Write permissions)

If `refer-doctor.js` says **OK**, you are clear to build.

---

## Article 13.3: 3. The Map (Where am I?)

You are currently in **Telechurch (Pilot)**, an instance of REFER.OS.

*   **Operating System:** `REFER.OS/` (Generic Laws)
*   **App Definition:** `refer.app/refer.telechurch.md` (Specific Status/Config)
*   **Source Code:** `src/app/features` (The Body)

---

## Article 13.4: 4. The Directives (How to act)

1.  **Read `refer.md` first.** It routes your intent.
2.  **Read `refer.law.md` second.** It constrains your changes.
3.  **Read `refer.app/refer.telechurch.md` third.** It tells you what feature you are touching.
