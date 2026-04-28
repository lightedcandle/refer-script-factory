#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const MCP_URL = "https://api.zo.computer/mcp";
const PROTOCOL_VERSION = "2024-11-05";
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const TOOL_PARENT = resolve(SCRIPT_DIR, "..");
const REPO_ROOT = existsSync(join(TOOL_PARENT, "skills"))
    ? TOOL_PARENT
    : resolve(SCRIPT_DIR, "..", "..");
const ZO_ROOT = existsSync(join(REPO_ROOT, "zo-computer", "skills"))
    ? join(REPO_ROOT, "zo-computer")
    : REPO_ROOT;
const SKILLS_DIR = join(ZO_ROOT, "skills");
const LAW_DIR = join(REPO_ROOT, "law", "REFER.OS");
const REFER_RULE_MARKER = "[REFER VIPC RULE:";
const PERSONA_STARTUP_MARKER = "REFER VIPC STARTUP MAP";

function parseDotEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function loadEnv() {
  const candidates = [".env.local", ".env.master"];
  let env = {};
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    env = { ...env, ...parseDotEnv(await readFile(file, "utf8")) };
  }
  return { ...env, ...process.env };
}

function resolveToken(env, instance) {
  const normalized = String(instance || "refer").trim().toLowerCase();
  if (normalized === "telechurch") {
    return { token: env.ZO_COMPUTER_TELECHURCH, envName: "ZO_COMPUTER_TELECHURCH", instance: normalized };
  }
  if (normalized === "refer") {
    return {
      token: env.ZO_COMPUTER_REFER || env.ZO_ACCESS_TOKEN || env.ZO_COMPUTER,
      envName: env.ZO_COMPUTER_REFER ? "ZO_COMPUTER_REFER" : env.ZO_ACCESS_TOKEN ? "ZO_ACCESS_TOKEN" : "ZO_COMPUTER",
      instance: normalized,
    };
  }
  const envName = `ZO_COMPUTER_${normalized.toUpperCase().replace(/[^A-Z0-9_]/g, "_")}`;
  return { token: env[envName], envName, instance: normalized };
}

async function rpc(headers, method, params, id) {
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { parse_error: text.slice(0, 500) }; }
  return { response, json, text };
}

async function initializeSession(token) {
  const baseHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    "MCP-Protocol-Version": PROTOCOL_VERSION,
  };

  const init = await rpc(baseHeaders, "initialize", { protocolVersion: PROTOCOL_VERSION, capabilities: {}, clientInfo: { name: "vipc-bootstrap", version: "0.1.0" } }, 1);
  const sessionId = init.response.headers.get("mcp-session-id") || init.response.headers.get("Mcp-Session-Id");

  if (!init.response.ok || !sessionId) {
    throw new Error(`MCP initialize failed: status=${init.response.status} body=${init.text.slice(0, 500)}`);
  }

  const headers = { ...baseHeaders, "mcp-session-id": sessionId };
  await fetch(MCP_URL, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }) });
  return headers;
}

async function runBash(headers, cmd) {
    const call = await rpc(headers, "tools/call", { name: "run_bash_command", arguments: { cmd } }, Date.now());
    if (call.json?.error) throw new Error("Bash error: " + JSON.stringify(call.json.error));
    const rawText = call.json?.result?.content?.find(c => c.type === "text")?.text || "";
    // Parse CmdResult(stdout='...', stderr='', returncode=0)
    let stdout = rawText;
    const match = rawText.match(/stdout='([^']*)'/);
    if (match) {
        // Unescape \n
        stdout = match[1].replace(/\\n/g, '\n');
    }
    return stdout;
}

async function callTool(headers, name, args = {}) {
    const call = await rpc(headers, "tools/call", { name, arguments: args }, Date.now());
    if (call.json?.error) {
        throw new Error(`${name} error: ${JSON.stringify(call.json.error)}`);
    }
    if (call.json?.result?.isError) {
        const text = extractToolText(call.json);
        throw new Error(`${name} failed: ${text.slice(0, 500)}`);
    }
    return call.json;
}

function extractToolText(json) {
    const content = json?.result?.content;
    if (!Array.isArray(content)) return "";
    return content
        .map((item) => item?.type === "text" ? item.text : JSON.stringify(item))
        .join("\n");
}

function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function normalizeRemoteRoot(value) {
    const root = String(value || "").trim().replace(/\\/g, "/").replace(/\/+$/g, "");
    if (!root || !root.startsWith("/")) {
        throw new Error(`Zo Files workspace root must be an absolute path for MCP file writes. Got: ${value || "<empty>"}`);
    }
    return root;
}

function remoteJoin(root, ...parts) {
    const suffix = parts
        .map((part) => String(part).replace(/^\/+|\/+$/g, ""))
        .filter(Boolean)
        .join("/");
    return suffix ? `${root}/${suffix}` : root;
}

async function detectWorkspaceRoot(headers) {
    const pwd = (await runBash(headers, "pwd")).split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    return normalizeRemoteRoot(pwd);
}

async function uploadFile(headers, localPath, remotePath, isStub = false, stubContent = "") {
    console.log(`Uploading ${remotePath}`);
    let content = stubContent;
    if (!isStub) {
        try {
            content = await readFile(localPath, "utf8");
        } catch {
            console.log(`  Warning: Local file not found: ${localPath}. Using stub.`);
            content = `# Stub for ${remotePath.split("/").pop()}`;
        }
    }

    await runBash(headers, `mkdir -p ${shellQuote(dirname(remotePath))}`);
    await callTool(headers, "create_or_rewrite_file", { target_file: remotePath, content });
}

async function uploadDirectory(headers, localDir, remoteDir) {
    if (!existsSync(localDir)) return 0;

    let count = 0;
    const entries = await readdir(localDir, { withFileTypes: true });
    for (const entry of entries) {
        const localPath = join(localDir, entry.name);
        const remotePath = `${remoteDir}/${entry.name}`;
        if (entry.isDirectory()) {
            count += await uploadDirectory(headers, localPath, remotePath);
        } else if (entry.isFile()) {
            await uploadFile(headers, localPath, remotePath);
            count += 1;
        }
    }
    return count;
}

function parseToolPayload(json) {
    const direct = json?.result;
    if (Array.isArray(direct)) return direct;
    if (direct && typeof direct === "object") {
        for (const key of ["personas", "rules", "items", "data"]) {
            if (Array.isArray(direct[key])) return direct[key];
        }
    }

    const text = extractToolText(json).trim();
    if (!text) return [];
    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
        for (const key of ["personas", "rules", "items", "data"]) {
            if (Array.isArray(parsed?.[key])) return parsed[key];
        }
    } catch {
        return [];
    }
    return [];
}

function normalizeProfileName(profile) {
    return String(profile || "refer").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

function titleCaseProfile(profile) {
    return normalizeProfileName(profile)
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

function createAgentBinder(profile, workspaceRoot) {
    const PROFILE = profile.toUpperCase();
    const profileRoot = remoteJoin(workspaceRoot, PROFILE);
    return `# REFER Zo Startup Binder

This Zo computer is bootstrapped as a REFER-governed VIPC for \`${profile}\`.

The paths below are MCP filesystem addresses for documents shown in Zo Files.

Read order before substantive operation:
1. ${remoteJoin(workspaceRoot, "AGENTS.md")}
2. ${remoteJoin(profileRoot, `${profile}-vipc-operating-rules.md`)}
3. ${remoteJoin(profileRoot, `${profile}-repo-connection-map.md`)}
4. ${remoteJoin(workspaceRoot, "Skills", "refer-os", "SKILL.md")}

Rules and personas are startup bindings. Durable authority lives in the files above and in the active profile folder.
`;
}

function createProfilePersona(profile, personaGovernance, workspaceRoot) {
    const title = titleCaseProfile(profile) || "REFER";
    const profileRoot = remoteJoin(workspaceRoot, profile.toUpperCase());
    return {
        name: `${title} VIPC Operator`,
        prompt: `You are the REFER-governed VIPC operator for ${profile}.

Before substantive work, bind this session to ${remoteJoin(workspaceRoot, "agent.md")}, ${remoteJoin(workspaceRoot, "AGENTS.md")}, and ${remoteJoin(profileRoot, `${profile}-vipc-operating-rules.md`)}.

Keep answers compact, classify work through REFER intake, and use ${remoteJoin(workspaceRoot, "Skills", "refer-os", "SKILL.md")} as the entry wrapper when governance or routing is needed.

${personaGovernance}`.trim(),
    };
}

function createPersonaGovernanceAppendix(profile, manifestData, addendum, workspaceRoot) {
    const skills = manifestData?.universal_skills || [];
    const skillLines = skills
        .map((skill) => `- ${skill}: ${remoteJoin(workspaceRoot, "Skills", skill, "SKILL.md")}`)
        .join("\n");
    const PROFILE = profile.toUpperCase();
    const profileRoot = remoteJoin(workspaceRoot, PROFILE);

    return `${addendum}

## ${PERSONA_STARTUP_MARKER}

Persona is the Zo-native startup binder. Treat this section as the AGENTS.md equivalent for Zo chat startup.

Active profile:
- profile: ${profile}
- Zo Files workspace root: ${workspaceRoot}
- profile folder: ${profileRoot}
- profile rules: ${remoteJoin(profileRoot, `${profile}-vipc-operating-rules.md`)}
- repo map: ${remoteJoin(profileRoot, `${profile}-repo-connection-map.md`)}
- design system: ${remoteJoin(profileRoot, `${profile}-design-system.md`)}
- REFER law: ${remoteJoin(workspaceRoot, "REFER.OS")}

Core REFER binders:
- ${remoteJoin(workspaceRoot, "agent.md")}
- ${remoteJoin(workspaceRoot, "AGENTS.md")}

Installed REFER skills:
${skillLines || `- refer-os: ${remoteJoin(workspaceRoot, "Skills", "refer-os", "SKILL.md")}`}

Startup behavior:
1. Bind to this persona first.
2. Read ${remoteJoin(workspaceRoot, "agent.md")} and ${remoteJoin(workspaceRoot, "AGENTS.md")} when available.
3. Use ${remoteJoin(workspaceRoot, "Skills", "refer-os", "SKILL.md")} as the entry skill.
4. Route to the narrowest installed skill by name and path.
5. Keep durable authority in persona, rules, binders, profile files, and skills. Do not rely on unstated Zo memory.

Routing shortcuts:
- Governance, law, authority drift: refer-governance
- General Zo intake: refer-zo-intake-router
- Contract handoff with Codex: refer-contract-tandem
- Library version or startup repair: refer-library-bootstrap
- Repo-connected operator work: refer-vipc-operator-driver
- Visual/design contracts: refer-vipc-design-driver
- Build-director automation: refer-vipc-build-director`.trim();
}

function createReferRules(profile, workspaceRoot) {
    const PROFILE = profile.toUpperCase();
    const profileRoot = remoteJoin(workspaceRoot, PROFILE);
    return [
        {
            marker: `${REFER_RULE_MARKER} startup-binding]`,
            instruction: `${REFER_RULE_MARKER} startup-binding] Before substantive operation in this Zo computer, read ${remoteJoin(workspaceRoot, "agent.md")} and ${remoteJoin(workspaceRoot, "AGENTS.md")} when present, then treat active skills under ${remoteJoin(workspaceRoot, "Skills")} as subordinate execution wrappers.`,
        },
        {
            marker: `${REFER_RULE_MARKER} profile-authority]`,
            instruction: `${REFER_RULE_MARKER} profile-authority] For ${profile} work, read ${remoteJoin(profileRoot, `${profile}-vipc-operating-rules.md`)} and ${remoteJoin(profileRoot, `${profile}-repo-connection-map.md`)} before repo-connected guidance or mutation planning.`,
        },
        {
            marker: `${REFER_RULE_MARKER} refer-system]`,
            instruction: `${REFER_RULE_MARKER} refer-system] Route natural-language requests through REFER vocabulary: decode compact refer.intake, choose the narrowest applicable skill, and keep governance/routing authority in binders, profile rules, and REFER law rather than ad hoc persona memory.`,
        },
        {
            marker: `${REFER_RULE_MARKER} mutation-boundary]`,
            instruction: `${REFER_RULE_MARKER} mutation-boundary] Do not mutate production apps, databases, deployments, payments, email/SMS, secrets, or live tenant data from Zo without explicit approval and a Codex handoff through the canonical repository.`,
        },
        {
            marker: `${REFER_RULE_MARKER} labeling]`,
            instruction: `${REFER_RULE_MARKER} labeling] Clearly label stub, sandbox, and production behavior. Never imply that a Zo Space route is connected to production data unless the connection has been verified from the canonical repo and approved path.`,
        },
    ];
}

async function listToolItems(headers, toolName) {
    try {
        return parseToolPayload(await callTool(headers, toolName));
    } catch (err) {
        console.error(`Warning: ${toolName} failed: ${err.message}`);
        return [];
    }
}

function getPrompt(persona) {
    return persona?.prompt || persona?.system_prompt || persona?.instructions || "";
}

function getInstruction(rule) {
    return rule?.instruction || rule?.prompt || rule?.text || "";
}

function getId(item) {
    return item?.id || item?.persona_id || item?.rule_id || item?._id;
}

async function ensurePersonaGovernance(headers, profile, personaGovernance, workspaceRoot) {
    const personas = await listToolItems(headers, "list_personas");
    const profilePersona = createProfilePersona(profile, personaGovernance, workspaceRoot);
    const existingProfilePersona = personas.find((p) => String(p?.name || "").toLowerCase() === profilePersona.name.toLowerCase());
    let activePersonaId = getId(existingProfilePersona);

    if (!existingProfilePersona) {
        console.log(`Creating profile persona: ${profilePersona.name}`);
        const created = await callTool(headers, "create_persona", profilePersona);
        const createdItems = parseToolPayload(created);
        activePersonaId = getId(createdItems[0]) || getId(created?.result) || activePersonaId;
    }

    for (const p of personas) {
        const prompt = getPrompt(p);
        const personaId = getId(p);
        if (!personaId || !prompt || prompt.includes(PERSONA_STARTUP_MARKER)) continue;
        console.log(`Appending REFER governance to persona: ${p.name || personaId}`);
        try {
            await callTool(headers, "edit_persona", { persona_id: personaId, prompt: `${prompt}\n\n${personaGovernance}` });
        } catch (err) {
            console.error(`  Warning: could not update persona ${p.name || personaId}: ${err.message}`);
        }
    }

    if (activePersonaId) {
        try {
            console.log(`Setting active persona: ${profilePersona.name}`);
            await callTool(headers, "set_active_persona", { persona_id: activePersonaId });
        } catch (err) {
            console.error(`  Warning: could not set active persona: ${err.message}`);
        }
    }
}

async function ensureReferRules(headers, profile, workspaceRoot) {
    const existingRules = await listToolItems(headers, "list_rules");
    const existingText = existingRules.map(getInstruction).join("\n");
    for (const rule of createReferRules(profile, workspaceRoot)) {
        if (existingText.includes(rule.marker)) {
            console.log(`Rule already installed: ${rule.marker}`);
            continue;
        }
        console.log(`Creating Zo rule: ${rule.marker}`);
        try {
            await callTool(headers, "create_rule", { condition: "Always", instruction: rule.instruction });
        } catch {
            await callTool(headers, "create_rule", { instruction: rule.instruction });
        }
    }
}

async function deriveProfile(headers, workspaceRoot) {
    console.log(`No profile provided. Scanning ${workspaceRoot} to derive profile...`);
    const content = await runBash(headers, `find ${shellQuote(workspaceRoot)} -maxdepth 3`);

    const paths = content.split("\n").map(f => f.trim()).filter(Boolean);

    // Look for capitalized app folders in the root
    for (const path of paths) {
        if (path.startsWith(`${workspaceRoot}/`) && path.split("/").length === workspaceRoot.split("/").length + 1) {
            const folder = path.split("/").pop();
            if (folder === folder.toUpperCase() && !["TEMPLATES", "SKILLS", "PROJECTS", "ARTICLES", "IMAGES", "TRASH"].includes(folder) && !folder.includes(".")) {
                const derived = folder.toLowerCase();
                console.log(`Derived profile from directory: ${derived}`);
                return derived;
            }
        }
    }

    // Look for specific persona files
    if (content.includes("ROKELLA")) return "telechurch";

    throw new Error(`Could not automatically derive a profile from ${workspaceRoot}. Please specify --profile explicitly.`);
}

async function main() {
    const args = process.argv.slice(2);
    let profile = null;
    let instance = "refer";
    let remoteRoot = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--profile" && args[i+1]) profile = args[++i];
        if (args[i] === "--instance" && args[i+1]) instance = args[++i];
        if (args[i] === "--remote-root" && args[i+1]) remoteRoot = args[++i];
    }

    const env = await loadEnv();
    const tokenInfo = resolveToken(env, instance);
    if (!tokenInfo.token) {
        console.error(`Missing Zo token. Set ${tokenInfo.envName}.`);
        process.exit(1);
    }

    console.log(`Connecting to Zo via instance: ${tokenInfo.instance}...`);
    const headers = await initializeSession(tokenInfo.token);
    const workspaceRoot = normalizeRemoteRoot(remoteRoot || await detectWorkspaceRoot(headers));
    console.log(`Using Zo Files workspace root: ${workspaceRoot}`);

    if (!profile) {
        profile = await deriveProfile(headers, workspaceRoot);
    }
    profile = normalizeProfileName(profile);

    const PROFILE = profile.toUpperCase();
    const profileRoot = remoteJoin(workspaceRoot, PROFILE);
    const skillsRoot = remoteJoin(workspaceRoot, "Skills");
    console.log(`\nStarting VIPC Bootstrap for profile: ${profile} (Folder: ${profileRoot})`);

    // Phase 1: Directories
    console.log("\n--- Phase 1: Authority Surfaces ---");
    await runBash(headers, `mkdir -p ${shellQuote(remoteJoin(profileRoot, "Templates"))} ${shellQuote(skillsRoot)}`);

    const authStubs = [
        { path: remoteJoin(workspaceRoot, "agent.md"), content: createAgentBinder(profile, workspaceRoot) },
        { path: remoteJoin(profileRoot, `${profile}-instance-notes.md`), content: `# ${profile} Instance Notes\n\nRuntime notes for the active instance.` },
        { path: remoteJoin(profileRoot, `${profile}-vipc-operating-rules.md`), content: `# ${profile} VIPC Operating Rules\n\nNon-negotiable boundaries:\n- Read ${remoteJoin(workspaceRoot, "agent.md")} and ${remoteJoin(workspaceRoot, "AGENTS.md")} before substantive operation.\n- Route requests through REFER intake and the narrowest applicable skill.\n- No direct database mutation.\n- No production app, deployment, payment, email/SMS, or tenant-data mutation from Zo without explicit approval and Codex handoff.\n- Keep stub, sandbox, and production behavior clearly labeled.\n- Follow REFER.OS protocols.` },
        { path: remoteJoin(profileRoot, `${profile}-repo-connection-map.md`), content: `# ${profile} Repo Connection Map\n\nMap pointing to canonical repos and schemas.` },
        { path: remoteJoin(profileRoot, `${profile}-design-system.md`), content: `# ${profile} Design System\n\nDefine the active profile's brand posture, color theory, and responsive discipline here.` },
        { path: remoteJoin(profileRoot, "Templates", "codex-handoff-prompt.md"), content: `# Codex Handoff Prompt\n\nTemplate for handoffs.` }
    ];

    const localAgentsPath = join(REPO_ROOT, "AGENTS.md");
    if (existsSync(localAgentsPath)) {
        await uploadFile(headers, localAgentsPath, remoteJoin(workspaceRoot, "AGENTS.md"));
    }

    for (const stub of authStubs) {
        await uploadFile(headers, "", stub.path, true, stub.content);
    }

    // Phase 2 & 3: Skills and Manifests
    console.log("\n--- Phase 2 & 3: Skills & Manifests ---");

    let manifestData = { universal_skills: [] };

    try {
        manifestData = JSON.parse(await readFile(join(SKILLS_DIR, "library-manifest.json"), "utf8"));
    } catch {
        console.log("Warning: Could not load local library-manifest.json. Ensure it exists at " + join(SKILLS_DIR, "library-manifest.json"));
    }

    // Universal Skills
    for (const skill of manifestData.universal_skills || []) {
        await runBash(headers, `mkdir -p ${shellQuote(remoteJoin(skillsRoot, skill))}`);
        const uploaded = await uploadDirectory(headers, join(SKILLS_DIR, skill), remoteJoin(skillsRoot, skill));
        console.log(`  Synced ${uploaded} file(s) for ${skill}`);
    }

    const profileSkillPrefixes = [`${profile}-`, `${PROFILE}-`];
    const skillEntries = existsSync(SKILLS_DIR) ? await readdir(SKILLS_DIR, { withFileTypes: true }) : [];
    for (const entry of skillEntries) {
        if (!entry.isDirectory() || !profileSkillPrefixes.some((prefix) => entry.name.startsWith(prefix))) continue;
        const uploaded = await uploadDirectory(headers, join(SKILLS_DIR, entry.name), remoteJoin(skillsRoot, entry.name));
        console.log(`  Synced ${uploaded} app-specific file(s) for ${entry.name}`);
    }

    await uploadFile(headers, join(SKILLS_DIR, "library-manifest.json"), remoteJoin(skillsRoot, "library-manifest.json"));

    const installStatePath = join(ZO_ROOT, "refer-install-state.json");
    if (existsSync(installStatePath)) {
        await uploadFile(headers, installStatePath, remoteJoin(workspaceRoot, "refer-install-state.json"));
    }

    if (existsSync(LAW_DIR)) {
        console.log("\n--- Phase 3b: REFER Law Files ---");
        const uploaded = await uploadDirectory(headers, LAW_DIR, remoteJoin(workspaceRoot, "REFER.OS"));
        console.log(`  Synced ${uploaded} REFER law file(s)`);
    }

    // Phase 4: Persona and persistent rule governance
    console.log("\n--- Phase 4: Persona & Rule Governance ---");
    try {
        const addendumPath = join(SKILLS_DIR, "refer-os", "refer-universal-persona-addendum.md");
        if (existsSync(addendumPath)) {
            const addendum = await readFile(addendumPath, "utf8");
            const personaGovernance = createPersonaGovernanceAppendix(profile, manifestData, addendum, workspaceRoot);
            await ensurePersonaGovernance(headers, profile, personaGovernance, workspaceRoot);
            await ensureReferRules(headers, profile, workspaceRoot);
        } else {
            console.log("Universal addendum file not found locally. Skipping injection.");
        }
    } catch (e) {
        console.error("Warning: Failed to inject persona governance:", e.message);
    }

    console.log("\nBootstrap sync complete.");
}

main().catch(err => {
    console.error("Bootstrap failed:", err?.message || err);
    process.exit(1);
});
