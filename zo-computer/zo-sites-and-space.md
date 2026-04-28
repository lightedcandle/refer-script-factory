# Zo Computer — Sites, Space & Selling
**Source:** `docs.zocomputer.com/sites`, `/spaces`, `/custom-domains`, `/sell`
**Captured:** 2026-04-20

---

## Two Hosting Surfaces

Zo provides two distinct ways to host content publicly:

| Surface | URL Pattern | Best For |
|---------|-------------|----------|
| **Sites** | `sitename-handle.zocomputer.io` | Full web apps, APIs, databases |
| **zo.space** | `handle.zo.space` | Personal page, widgets, APIs |
| **zo.pub** | `zo.pub/handle/folder` | Static file sharing (no server) |

---

## Sites

Source: `docs.zocomputer.com/sites`

Sites are **full web applications** hosted on your Zo server.

### Stack
- **Backend**: [Hono](https://hono.dev) — the web server framework
- **Runtime**: [Bun](https://bun.sh) — the JavaScript/TypeScript runtime
- **Package manager**: Bun (also handles npm packages)
- **Database**: SQLite (via Bun's built-in SQLite driver)
- **Language**: TypeScript

### Default Site Files
```
site-name/
├── CLAUDE          ← Documentation for Zo coding agent (editable)
├── index.tsx       ← Main code file (frontend + backend in one)
├── package.json    ← Backend dependencies
├── zosite.json     ← Zo hosting settings
├── tsconfig.json   ← TypeScript config
├── .gitignore      ← Version control exclusions
└── bun.lock        ← Locked package versions
```

### Capabilities
- Save form responses to SQLite database in your workspace
- Integrate files/folders from workspace into your site
- Connect to Supabase, Convex, or other external databases if needed
- Serve frontend code that runs in the browser
- Expose APIs via internal routes

### Publishing
- Zo publishes to: `sitename-yourhandle.zocomputer.io`
- Private sites do NOT count against your service limit

### Site Creation
Tell Zo: "Create a site" or "Create a web app that..."

---

## zo.space

Source: `docs.zocomputer.com/spaces`

Your personal domain: `yourhandle.zo.space`

### What it is:
- Your personal programmable web presence
- Built and managed directly by Zo through conversation
- Supports **Pages** (HTML routes) and **APIs** (JSON endpoints)
- Supports uploading **static assets** (images, CSS files, etc.)
- Has full **version history** for every route (undo/redo)

### Example prompts:
- "Make my zo.space home page a landing page with my name and links"
- "Create an API at /api/data on my zo.space that returns JSON"
- "Build a tip calculator widget on my zo.space"

### vs Sites:
- zo.space is AI-managed via conversation (no manual coding required)
- Sites are more full-featured web apps with backend services

---

## Custom Domains

Source: `docs.zocomputer.com/custom-domains`

You can use your own domain (e.g., `blog.example.com`) to point to any Zo Site or Service.

### How it works:
1. Registers your domain with Cloudflare's edge network
2. Auto-provisions TLS certificate (HTTPS) via DigiCert / Let's Encrypt
3. Routes all traffic from your domain to your service

### Requirements:
- **Subdomains only** — `blog.example.com` works; `example.com` (apex) does NOT (no CNAME on apex)
- CNAME record: `blog` → `cname.zocomputer.io`

### Domain Limits by Plan:
| Plan | Custom Domains |
|------|----------------|
| Free | 0 |
| Basic | 3 |
| Pro | 5 |
| Ultra | 10 |

### Troubleshooting:
- If stuck on "Pending CNAME": `dig CNAME blog.example.com` → should show `cname.zocomputer.io`
- If stuck on "Pending SSL": Check CAA records allow `digicert.com` and `letsencrypt.org`; disable existing Cloudflare proxy if conflicting

---

## Selling (Stripe Integration)

Source: `docs.zocomputer.com/sell`

Zo has built-in Stripe Connect integration so you can sell directly from your zo.space or Sites.

### Setup:
1. Create a Stripe Connect account → select your country (cannot change later)
2. Complete Stripe onboarding (business verification + bank details)
3. Start selling — create products, activate payment links

### AI-managed selling:
Zo can manage your Stripe via chat:
- Creating products and payment links
- Viewing orders and payment status
- Managing your Stripe Connect account
- Integrating payment links into Zo Sites

### Order Tracking:
Orders include:
- Product name and price
- Customer email (if provided)
- Purchase date
- Payment status
- Fulfillment status (you mark as fulfilled)

### Access Stripe Dashboard:
From Settings → Selling → "Open Stripe Dashboard"
