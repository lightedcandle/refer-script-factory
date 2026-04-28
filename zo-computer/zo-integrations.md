# Zo Computer — Integrations
**Source:** `docs.zocomputer.com/integrations`
**Captured:** 2026-04-20

---

## Overview

Integrations connect Zo to your external apps and services. There are three types:
1. **Native integrations** — built into Zo's Settings, OAuth-connected
2. **Agent Skills** — use SKILL.md to instruct Zo how to work with an app
3. **MCP** — connect any MCP server to give Zo more tools

---

## Permission Levels

All integrations have two read/write modes:
- **Read Only**: Zo can search, view, and summarize data in the connected app.
- **Read & Write**: Zo can create, edit, upload, send, or otherwise modify data.

---

## Native Integrations (Currently Supported)

### 📧 Email

#### Gmail
- Source: OAuth via Settings
- **Read Only**: Search and view emails
- **Read & Write**: Send emails using your Gmail account

#### Microsoft Outlook
- Source: OAuth via Settings
- **Read Only**: Search and view emails
- **Read & Write**: Send emails using your Outlook account

---

### 📅 Calendar & Tasks

#### Google Calendar
- **Read Only**: Search and view events
- **Read & Write**: Edit and create events

#### Google Tasks
- **Read Only**: Search and view task lists and tasks
- **Read & Write**: Create, edit, and complete tasks

---

### 📝 Knowledge & Project Management

#### Notion
- Download documents from Notion into Zo workspace
- **Read Only**: Search and read documents
- **Read & Write**: Edit and create documents

#### Linear
- **Read Only**: Search and read issues
- **Read & Write**: Edit and create issues

#### Airtable
- Download tables from Airtable into Zo workspace
- **Read Only**: Search and read tables
- **Read & Write**: Edit and create tables

---

### 🗄️ File Storage

#### Google Drive
- Download files from Drive into Zo workspace
- **Read Only**: Search and read files
- **Read & Write**: Upload files to Google Drive

#### Dropbox
- Download files from Dropbox into Zo workspace
- **Read Only**: Search and read files
- **Read & Write**: Upload files to Dropbox

#### OneDrive
- Download files from OneDrive into Zo workspace
- **Read Only**: Search and read files
- **Read & Write**: Upload files to OneDrive

---

### 🎵 Media

#### Spotify
- **Read Only**: Search Spotify and read music library
- **Read & Write**: Manage music library on Spotify

---

### 🌐 Social Media (via Browser-Derived Credentials)

#### LinkedIn
- Connect via: Install local skill + provide browser-derived credentials in Settings
- Use cases: Researching profiles, drafting outreach, using LinkedIn from Zo

#### X (Twitter)
- Connect via: Install local skill + provide browser-derived credentials in Settings
- Use cases: Drafting posts, working with timeline, using X from Zo

---

### 💳 Commerce

#### Stripe
- Connect via: Stripe Connect
- Enables: Products, payment links, orders, fulfillment tracking

---

### 💻 Development

#### GitHub
- Connect via: Personal Access Token + GitHub CLI authentication
- Permissions needed: `repo`, `read:org`, `gist`
- Method: `gh auth login --with-token <your-personal-access-token>`

---

## Multiple Accounts

Zo supports connecting **multiple accounts** for the same service (e.g., two Gmail accounts).

---

## Other Apps (Beyond Native Integrations)

For apps not in the native list:
1. **Agent Skills** — Write a SKILL.md that teaches Zo how to interact with the app
2. **MCP** — Connect any MCP server to Zo's toolset
3. **Zo MCP Server** (reverse) — Expose Zo as an MCP server to other AI clients
4. **File Sync** — Use Zo as a sync destination for any file-based workflow

---

## Syncing with Your Computer

Beyond cloud services, Zo also syncs with your local machine:
- **Desktop App** (Mac/Windows) — built-in sync via `Sync > Add Folder`
- **SyncThing** (alternative) — self-hosted P2P sync to `/home/workspace/`

See `zo-files-and-workspace.md` for details.
