# Zo Computer — Devices (Beta)
**Source:** `docs.zocomputer.com/devices`
**Captured:** 2026-04-20
**Status:** Beta feature

---

## What Are Devices?

Devices is a **Beta feature** that allows your cloud Zo to reach back into your local desktop:

> "Let Zo use your desktop to browse the web, run commands, send messages, and access files"

This is the **reverse bridge** — instead of you SSHing from your machine to Zo, **Zo reaches back to your machine**.

---

## Setup

1. Install the [Zo Desktop App](https://docs.zocomputer.com/desktop) (Mac or Windows)
2. Log in — your device registers automatically
3. Go to `Settings > Advanced > Devices`
4. Add the capabilities you want to enable

---

## Capabilities

### Browser Control
- Uses [agent-browser](https://github.com/vercel-labs/agent-browser) under the hood
- Allows Zo to operate your local browser (click, navigate, fill forms)
- Useful for sites that are hard to access via Zo's cloud browser (single sign-on, 2FA, local tokens)

### iMessage (macOS only)
- Module: `imsg`
- Allows Zo to send iMessages from your Mac
- Useful for automations that should send messages from your local identity

### Shell Commands
- Allows Zo to run arbitrary shell/terminal commands on your local machine
- Useful for running local scripts, interacting with local dev tools

### File Access
- Allows Zo to read and write files on your local machine
- Enables Zo to directly modify your local projects

### Custom
- Define custom capabilities with allow/deny patterns
- Example: `Bash(docker *)` — allow all docker commands
- Example: `!Bash(docker rm *)` — deny destructive docker commands

---

## Sandboxing (macOS only)

On macOS, you can apply sandboxing restrictions to Devices capabilities to limit what Zo can do on your local machine.

---

## Keep Computer Awake

For Devices to work, your desktop must stay awake.
The Zo desktop app includes a "Keep Computer Awake" setting to prevent sleep.

---

## Security Considerations

REFER.OS note: Devices gives your cloud Zo direct access to your local machine. This is a high-trust configuration. Only enable the capabilities you specifically need. For REFER.OS, consider:
- Shell Commands: useful for triggering local scripts
- File Access: useful for syncing and reading local files
- Browser: useful for authenticated local workflows
- Keep disabled: iMessage, unless specifically needed for automations
