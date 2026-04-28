# Zo Computer — Server, SSH & Remote Access
**Source:** `docs.zocomputer.com/servers`, `/ssh-zo`, `/ssh-computer`
**Captured:** 2026-04-20

---

## The Personal Server Concept

Zo IS a server. Unlike a personal computer that sleeps, a server is:
- Always on (with stable, high-speed networking)
- Built for reliability and continuous load
- Accessible from anywhere via network protocols

Your Zo server runs at: `/home/workspace` (root workspace)
Hostname pattern: `ts1.zocomputer.io` (example)

---

## What Is a Service?

A **Service** on your Zo server is a process that listens on a network port and serves requests.

Types of services:
- Web sites/apps (HTTP)
- APIs (HTTP/HTTPS)
- Databases (TCP)
- Custom long-running processes

### Service URLs:
- **HTTP Proxy URL** — for web services and APIs (most use cases)
- **Direct Tunnel URL** — for non-web services or when HTTP Proxy doesn't work

### Port Ranges:
- Valid ports: 1024–65535
- Standard: 80 (HTTP), 443 (HTTPS), 22 (SSH), 2222 (SSH alternative)

---

## Protocols Supported

| Protocol | Purpose |
|----------|---------|
| TCP | Foundation — reliable ordered data transport |
| HTTP | Web requests and APIs |
| HTTPS | Secure HTTP (TLS encryption) |
| SSH | Secure remote shell access |

---

## SSH: Connect to Your Zo from Your Machine

Source: `docs.zocomputer.com/ssh-zo`

Use case: Use Zo as a remote development environment, accessible from VSCode, Cursor, etc.

### Step 1: Generate SSH key on YOUR computer
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub  # copy the output
```

### Step 2: Register your public key on Zo
In Zo's terminal (via the app):
```bash
nano ~/.ssh/authorized_keys
# paste your public key, save with Ctrl+X, Y, Enter
```

### Step 3: Set up SSH service on Zo
Create a service in Zo:
- Name: `ssh`
- Port: `2222`
- Type: `tcp`
- Command: `/usr/sbin/sshd -D -p 2222`

### Step 4: Connect from your machine
```bash
ssh -p <port> root@<host>
# example: ssh -p 10000 root@ts1.zocomputer.io
```

### Step 4b: Create an SSH shortcut (optional)
```
# ~/.ssh/config
Host zo
  HostName ts1.zocomputer.io
  Port 10872
  User root
  ServerAliveInterval 30
  ServerAliveCountMax 3
  IdentityFile ~/.ssh/id_ed25519
```
Then connect with just: `ssh zo`

### Step 5: Connect your IDE (Cursor)
- Install: Cursor's Remote SSH extension
- Command: `Remote-SSH: Connect to Host...`
- Host: `zo`
- Open folder: `/home/workspace`

---

## SSH: Control OTHER Computers from Zo

Source: `docs.zocomputer.com/ssh-computer`

Use case: Let your Zo AI control your local laptop or another server via SSH.
This creates a **cloud-to-local** control path.

### Step 1: Generate SSH key on Zo
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub  # copy output
```

### Step 2: Register Zo's public key on your computer
```bash
nano ~/.ssh/authorized_keys  # paste Zo's key
```

### Step 3: Enable SSH on your computer
- macOS: System Settings → General → Sharing → Enable Remote Login
- Windows: Settings → Apps → Optional Features → Enable OpenSSH Server

### Step 4: Set up ngrok (exposes your computer's SSH)
```bash
brew install ngrok
ngrok config add-authtoken $YOUR_TOKEN
ngrok tcp 22 --url=<number>.tcp.ngrok.io:<port>
```
Requires ngrok paid plan for reserved TCP addresses.

### Step 5: Tell Zo to connect
```bash
# Zo runs this from its terminal:
ssh -p <port> <username>@<host>
```

Or create a shortcut in Zo's `~/.ssh/config`:
```
Host laptop
  HostName <ngrok-host>
  Port <ngrok-port>
  User <your-mac-username>
  ServerAliveInterval 30
  ServerAliveCountMax 3
  IdentityFile ~/.ssh/id_ed25519
```

Then create a **Zo Rule**: "When I say 'check laptop', SSH into laptop and run a status command"

---

## Why `/home/workspace`?

This is the designated workspace directory in your Zo server. It is:
- Persistent across sessions
- The correct place for your projects, files, and synced content
- The directory you should open in Cursor/VSCode via Remote SSH

**Do not use** `/root` or other directories for project work — they may not be persistent.
