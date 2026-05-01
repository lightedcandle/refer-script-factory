#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const defaults = {
  envFile: "E:\\telechurch-e2e\\.env.master",
  bridgeEnv: resolve("..", "alliance-android-sms-bridge", ".env.local"),
  projectName: "alliance-telechurchlive",
  domain: "alliance.telechurchlive.com",
  productionBranch: "production",
  deploy: false,
  configureDomain: true,
};

const args = parseArgs(process.argv.slice(2));
const root = resolve(".");
const outDir = resolve(root, ".deploy");
const packetPath = resolve(outDir, "alliance-cloudflare-pages-latest.json");

await main();

async function main() {
  const envMaster = loadEnv(args.envFile);
  const bridgeEnv = existsSync(args.bridgeEnv) ? loadEnv(args.bridgeEnv) : {};
  const cloudflareEnv = cloudflareCredentials(envMaster);
  const supabaseUrl = envMaster.SUPABASE_URL;
  const supabaseAnonKey = envMaster.SUPABASE_ANON_KEY;
  const serviceRoleKey = envMaster.SERVICE_ROLE_KEY || envMaster.SUPABASE_SERVICE_ROLE_KEY;
  const relayToken = bridgeEnv.ALLIANCE_DISPATCHER_TOKEN || envMaster.ALLIANCE_SMS_RELAY_TOKEN;
  const relayUrl = bridgeEnv.ALLIANCE_SMS_RELAY_URL || envMaster.ALLIANCE_SMS_RELAY_URL || "https://skqmzcdmfaijxpbvcdal.supabase.co/functions/v1/alliance-sms-relay";
  const formSecret = bridgeEnv.ALLIANCE_PROFILE_FORM_SECRET
    || envMaster.ALLIANCE_PROFILE_FORM_SECRET
    || relayToken;
  const adminToken = bridgeEnv.ALLIANCE_ADMIN_TOKEN || envMaster.ALLIANCE_ADMIN_TOKEN || "";

  if (!cloudflareEnv.CLOUDFLARE_ACCOUNT_ID) throw new Error("Missing CLOUDFLARE_ACCOUNT_ID.");
  if (!cloudflareEnv.CLOUDFLARE_API_TOKEN && !(cloudflareEnv.CLOUDFLARE_EMAIL && cloudflareEnv.CLOUDFLARE_API_KEY)) {
    throw new Error("Missing Cloudflare API credentials.");
  }
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) throw new Error("Missing SUPABASE_URL, SUPABASE_ANON_KEY, or service role key.");
  if (!relayToken) throw new Error("Missing ALLIANCE_DISPATCHER_TOKEN or ALLIANCE_SMS_RELAY_TOKEN.");
  if (!formSecret) throw new Error("Missing form secret source. Set ALLIANCE_PROFILE_FORM_SECRET or ALLIANCE_DISPATCHER_TOKEN.");

  mkdirSync(outDir, { recursive: true });
  const packet = {
    schema: "refer.alliance.cloudflare-pages-deploy.v1",
    generated_at: new Date().toISOString(),
    project_name: args.projectName,
    domain: args.domain,
    deploy_requested: args.deploy,
    secret_values_printed: false,
    evidence: ["env:loaded_without_printing_secrets"],
    results: [],
  };

  packet.results.push(run("npm", ["run", "check"], { env: process.env }));

  const wranglerEnv = {
    ...process.env,
    ...cloudflareEnv,
  };

  if (args.deploy) {
    const list = run("npx", ["wrangler", "pages", "project", "list"], { env: wranglerEnv });
    packet.results.push({ step: "pages_project_list", ...list });
    if (!list.stdout.includes(args.projectName)) {
      packet.results.push({
        step: "pages_project_create",
        ...run("npx", ["wrangler", "pages", "project", "create", args.projectName, "--production-branch", args.productionBranch], { env: wranglerEnv }),
      });
    }

    const secretsFile = resolve(outDir, "pages-secrets.json");
    const pageSecrets = {
      SUPABASE_URL: supabaseUrl,
      SUPABASE_ANON_KEY: supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
      ALLIANCE_SUPABASE_FUNCTION: "alliance-record-write",
      ALLIANCE_PROFILE_FORM_SECRET: formSecret,
      ALLIANCE_SMS_RELAY_URL: relayUrl,
      ALLIANCE_SMS_RELAY_TOKEN: relayToken,
    };
    if (adminToken) pageSecrets.ALLIANCE_ADMIN_TOKEN = adminToken;
    writeFileSync(secretsFile, JSON.stringify(pageSecrets, null, 2));
    packet.results.push({
      step: "pages_secret_bulk",
      ...run("npx", ["wrangler", "pages", "secret", "bulk", secretsFile, "--project-name", args.projectName], { env: wranglerEnv }),
    });
    rmSync(secretsFile, { force: true });

    packet.results.push({
      step: "pages_deploy",
      ...run("npx", [
        "wrangler",
        "pages",
        "deploy",
        "public",
        "--project-name",
        args.projectName,
        "--branch",
        args.productionBranch,
        "--commit-dirty=true",
      ], { env: wranglerEnv }),
    });

    if (args.configureDomain) {
      packet.results.push(await configurePagesDomain(args, cloudflareEnv));
      packet.results.push(await upsertDnsRecord(args, cloudflareEnv));
      packet.results.push(await upsertWorkerBypassRoute(args, cloudflareEnv));
    }
  }

  packet.verdict = packet.results.every((item) => item.ok) ? "cloudflare_pages_ready" : "cloudflare_pages_failed";
  writeFileSync(packetPath, JSON.stringify(packet, null, 2));
  console.log(JSON.stringify({ ok: packet.verdict === "cloudflare_pages_ready", packet_path: packetPath, packet }, null, 2));
  if (packet.verdict !== "cloudflare_pages_ready") process.exit(1);
}

function parseArgs(argv) {
  const parsed = { ...defaults };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--env-file" && argv[i + 1]) parsed.envFile = argv[++i];
    else if (argv[i] === "--bridge-env" && argv[i + 1]) parsed.bridgeEnv = argv[++i];
    else if (argv[i] === "--project-name" && argv[i + 1]) parsed.projectName = argv[++i];
    else if (argv[i] === "--domain" && argv[i + 1]) parsed.domain = argv[++i];
    else if (argv[i] === "--production-branch" && argv[i + 1]) parsed.productionBranch = argv[++i];
    else if (argv[i] === "--deploy") parsed.deploy = true;
    else if (argv[i] === "--no-domain") parsed.configureDomain = false;
  }
  return parsed;
}

function loadEnv(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    env[match[1]] = value;
  }
  return env;
}

function cloudflareCredentials(env) {
  return {
    CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN: env.CLOUDFLARE_API_TOKEN || env.CLOUDFLARE_USER_API_TOKEN,
    CLOUDFLARE_EMAIL: env.CLOUDFLARE_EMAIL,
    CLOUDFLARE_API_KEY: env.CLOUDFLARE_API_KEY,
  };
}

function run(command, commandArgs, options) {
  const result = spawnSync(command, commandArgs, {
    cwd: root,
    env: cleanEnv(options.env),
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  return {
    step: commandArgs.slice(0, 3).join(" "),
    ok: result.status === 0,
    status: result.status,
    stdout: scrub(result.stdout || ""),
    stderr: scrub(result.stderr || ""),
    error: result.error?.message,
  };
}

async function configurePagesDomain(parsed, env) {
  const response = await cloudflareFetch(env, `/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${parsed.projectName}/domains`, {
    method: "POST",
    body: { name: parsed.domain },
  });
  return {
    step: "pages_domain_create",
    ok: response.ok || response.code === 8000035 || /already/i.test(response.error || ""),
    status: response.status,
    stdout: scrub(JSON.stringify(response.body || {})),
    stderr: response.ok ? "" : scrub(response.error || ""),
  };
}

async function upsertDnsRecord(parsed, env) {
  const zone = await cloudflareFetch(env, `/zones?name=${encodeURIComponent(baseDomain(parsed.domain))}`);
  const zoneId = zone.body?.result?.[0]?.id;
  if (!zone.ok || !zoneId) {
    return {
      step: "dns_zone_lookup",
      ok: false,
      status: zone.status,
      stdout: scrub(JSON.stringify(zone.body || {})),
      stderr: "zone_not_found",
    };
  }

  const name = parsed.domain;
  const existing = await cloudflareFetch(env, `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(name)}`);
  const current = existing.body?.result?.[0];
  const payload = {
    type: "CNAME",
    name,
    content: `${parsed.projectName}.pages.dev`,
    proxied: true,
    ttl: 1,
  };
  const path = current ? `/zones/${zoneId}/dns_records/${current.id}` : `/zones/${zoneId}/dns_records`;
  const method = current ? "PUT" : "POST";
  const update = await cloudflareFetch(env, path, { method, body: payload });
  return {
    step: current ? "dns_record_update" : "dns_record_create",
    ok: update.ok,
    status: update.status,
    stdout: scrub(JSON.stringify(update.body || {})),
    stderr: update.ok ? "" : scrub(update.error || ""),
  };
}

async function upsertWorkerBypassRoute(parsed, env) {
  const zone = await cloudflareFetch(env, `/zones?name=${encodeURIComponent(baseDomain(parsed.domain))}`);
  const zoneId = zone.body?.result?.[0]?.id;
  if (!zone.ok || !zoneId) {
    return {
      step: "worker_bypass_zone_lookup",
      ok: false,
      status: zone.status,
      stdout: scrub(JSON.stringify(zone.body || {})),
      stderr: "zone_not_found",
    };
  }

  const pattern = `${parsed.domain}/*`;
  const routes = await cloudflareFetch(env, `/zones/${zoneId}/workers/routes`);
  const current = routes.body?.result?.find((route) => route.pattern === pattern);
  if (current && !current.script) {
    return {
      step: "worker_bypass_route_exists",
      ok: true,
      status: 200,
      stdout: JSON.stringify({ pattern }),
      stderr: "",
    };
  }

  const payload = { pattern, script: null };
  const path = current ? `/zones/${zoneId}/workers/routes/${current.id}` : `/zones/${zoneId}/workers/routes`;
  const method = current ? "PUT" : "POST";
  const response = await cloudflareFetch(env, path, { method, body: payload });
  return {
    step: current ? "worker_bypass_route_update" : "worker_bypass_route_create",
    ok: response.ok,
    status: response.status,
    stdout: scrub(JSON.stringify(response.body || {})),
    stderr: response.ok ? "" : scrub(response.error || ""),
  };
}

async function cloudflareFetch(env, path, init = {}) {
  const first = await cloudflareFetchWithAuth(env, path, init, "token");
  if (first.ok || first.status !== 403 || !(env.CLOUDFLARE_EMAIL && env.CLOUDFLARE_API_KEY)) return first;
  const fallback = await cloudflareFetchWithAuth(env, path, init, "legacy");
  return {
    ...fallback,
    auth_fallback_used: true,
  };
}

async function cloudflareFetchWithAuth(env, path, init = {}, mode = "token") {
  const headers = { "Content-Type": "application/json" };
  if (mode === "token" && env.CLOUDFLARE_API_TOKEN) {
    headers.Authorization = `Bearer ${env.CLOUDFLARE_API_TOKEN}`;
  } else {
    headers["X-Auth-Email"] = env.CLOUDFLARE_EMAIL;
    headers["X-Auth-Key"] = env.CLOUDFLARE_API_KEY;
  }
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method: init.method || "GET",
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const body = await response.json().catch(() => ({}));
  const error = body?.errors?.map((item) => `${item.code || ""} ${item.message || ""}`.trim()).join("; ");
  return {
    ok: response.ok && body?.success !== false,
    status: response.status,
    body,
    error,
    code: body?.errors?.[0]?.code,
  };
}

function baseDomain(domain) {
  const parts = String(domain).split(".");
  return parts.slice(-2).join(".");
}

function cleanEnv(env) {
  return Object.fromEntries(
    Object.entries(env || {})
      .filter((entry) => typeof entry[1] === "string")
      .map(([key, value]) => [key, value]),
  );
}

function scrub(text) {
  return String(text || "")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .replace(/"SUPABASE_ANON_KEY"\s*:\s*"[^"]+"/g, "\"SUPABASE_ANON_KEY\":\"[redacted]\"")
    .replace(/"SUPABASE_SERVICE_ROLE_KEY"\s*:\s*"[^"]+"/g, "\"SUPABASE_SERVICE_ROLE_KEY\":\"[redacted]\"")
    .replace(/"ALLIANCE_PROFILE_FORM_SECRET"\s*:\s*"[^"]+"/g, "\"ALLIANCE_PROFILE_FORM_SECRET\":\"[redacted]\"")
    .replace(/"ALLIANCE_SMS_RELAY_TOKEN"\s*:\s*"[^"]+"/g, "\"ALLIANCE_SMS_RELAY_TOKEN\":\"[redacted]\"")
    .replace(/"ALLIANCE_ADMIN_TOKEN"\s*:\s*"[^"]+"/g, "\"ALLIANCE_ADMIN_TOKEN\":\"[redacted]\"")
    .trim();
}
