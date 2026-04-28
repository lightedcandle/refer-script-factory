# Zo Computer — Files & Workspace
**Source:** `docs.zocomputer.com/files`, `/sync-files`, `/zo-pub`
**Captured:** 2026-04-20

---

## The Workspace

Your Zo workspace root: `/home/workspace`

This is where all your files live. The Zo AI has full access to read, write, search, and execute within this directory.

---

## Adding Files to the Workspace

### Via the App UI:
- Drag and drop files or folders from your computer
- Use the Create (`+`) button → "Upload file" or "Upload folder"
- Right-click on a folder → "Upload file" or "Upload folder"
- Connect Google Drive, Notion, etc. → manually import from those sources

### Via AI commands:
- "Download this URL to my workspace"
- "Search my Google Drive for [file] and import it"
- `@mention` a specific file in your prompt to reference it

---

## Supported File Types

| Type | Format | Notes |
|------|--------|-------|
| Notes | `.md` (Markdown) | Zo stores notes as Markdown |
| Spreadsheets | `.sheet.json` (native) | Has built-in spreadsheet editor; right-click to export as `.xlsx` |
| Spreadsheets (import) | `.csv`, `.xlsx` | Can display these formats |
| Code | All languages | Syntax highlighting; Sites auto-refresh on change |
| Word documents | `.docx` | Right-click to convert to note |
| Audio | Most formats | Can transcribe → `.transcript.jsonl` |
| Video | Most formats | Can transcribe audio + generate video with AI |
| Images | Most formats | Can display + generate + edit with AI |
| PDFs | `.pdf` | Can display and answer questions about PDFs |
| Ebooks | Standard formats | Can display |

---

## Syncing Files from Your Computer

### Method 1: Zo Desktop App (Recommended)

1. Download: Mac → `Zo.dmg` / Windows → `Zo-Setup.exe`
   - Source: https://github.com/zocomputer/Zo/releases/latest/download/
2. Open and sign in
3. Click `Sync > Add Folder` (or `⇧⌘A` on Mac)
4. Choose a local folder to sync with your Zo workspace

### Method 2: SyncThing (Alternative)

Install on your computer:
- Download from https://syncthing.net/downloads/

Install on your Zo (run via Zo terminal):
```bash
mkdir -p /etc/apt/keyrings
curl -L -o /etc/apt/keyrings/syncthing-archive-keyring.gpg https://syncthing.net/release-key.gpg
echo "deb [signed-by=/etc/apt/keyrings/syncthing-archive-keyring.gpg] https://apt.syncthing.net/ syncthing stable-v2" | tee /etc/apt/sources.list.d/syncthing.list
apt-get update
apt-get install syncthing
```

Run on Zo:
```bash
syncthing --no-browser --gui-address=0.0.0.0:28384
```

Run Zo as a service on port `28384` (type: `http`)

Shared folder: `/home/workspace/Laptop` on Zo ↔ `~/Documents/Zo Computer` on your machine

---

## zo.pub — Public File Sharing

`zo.pub` provides an instant public namespace for sharing files and folders.

### URL Structure:
```
zo.pub/<your-handle>               ← Your public page (all published folders)
zo.pub/<your-handle>/<folder>      ← A specific published folder
zo.pub/<your-handle>/<folder>/<file>  ← A specific file
```

### How to publish:
Tell Zo:
- "Publish this folder to zo.pub"
- "Give me a link to share these files"
- "Make this folder public"

### How to update/remove:
- "Update my vacation folder on zo.pub"
- "Republish this folder — I added new files"
- "Take down the folder I published called 'drafts'"

### What zo.pub is NOT:
- Not a web app or server with backend code
- Not a replacement for Sites (no dynamic behavior)
- Not a custom domain destination (for that, use Sites + custom domains)

---

## Knowledge Base Feature

Zo maintains an **Articles directory** in your workspace. You can:
- Ask Zo to "save this webpage" → stores it in Articles
- Reference articles in future prompts with `@articles`
- Build up a personal knowledge base over time

Example: "Save this documentation to my knowledge base" → Zo downloads and stores.
