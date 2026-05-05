#!/usr/bin/env node
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const cwd = process.cwd();
loadEnv(resolve(cwd, ".env.local"));
loadEnv(resolve(cwd, ".env"));
loadEnv(resolve(cwd, "..", ".env.master"));
loadEnv(resolve(cwd, "..", "refer-zo-bootstrap", ".env.local"));
if (process.env.ALLIANCE_SUPABASE_ENV) loadEnv(process.env.ALLIANCE_SUPABASE_ENV);
loadEnv("E:\\telechurch-e2e\\.env.master");

const bridgeUrl = trimSlash(process.env.ALLIANCE_SMS_BRIDGE_URL || "http://127.0.0.1:8787");
const bridgeToken = process.env.ALLIANCE_SMS_BRIDGE_TOKEN || "";
const dispatcherToken = process.env.ALLIANCE_DISPATCHER_TOKEN || "";
const allianceHubUrl = trimSlash(process.env.ALLIANCE_HUB_URL || process.env.ALLIANCE_SITE_URL || "https://alliance.telechurchlive.com");
const edgeFunction = process.env.ALLIANCE_SUPABASE_FUNCTION || "alliance-record-write";
const inboundMessages = [];
const relayJobs = [];

const command = process.argv[2] || "status";
const args = parseArgs(process.argv.slice(3));

try {
  if (command === "status") {
    const health = await bridgeHealth();
    console.log(JSON.stringify({
      ok: health.ok,
      bridge: health,
      supabase_edge_configured: hasEdgeConfig(),
      edge_function: edgeFunction,
    }, null, 2));
  } else if (command === "send") {
    const to = required(args.to || args.phone, "--to");
    const message = required(args.message || args.body, "--message");
    const result = await sendSms(to, message, true);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "latest") {
    const from = required(args.from || args.phone, "--from");
    const result = await latestSms(from, true);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === "server") {
    const port = Number(args.port || process.env.ALLIANCE_SMS_DISPATCHER_PORT || 8788);
    const host = args.host || process.env.ALLIANCE_SMS_DISPATCHER_HOST || "127.0.0.1";
    assertDispatcherToken();
    startServer(host, port);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(1);
}

async function bridgeHealth() {
  try {
    const response = await fetch(`${bridgeUrl}/health`);
    return {
      ok: response.ok,
      status: response.status,
      body: await response.json().catch(() => null),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      detached_relay_available: true,
    };
  }
}

async function sendSms(to, message, persist) {
  assertBridgeToken();
  const response = await fetch(`${bridgeUrl}/sms/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Bridge-Token": bridgeToken,
    },
    body: JSON.stringify({ to, message }),
  });
  const body = await response.json().catch(() => null);
  const record = persist ? await writeSmsRecord({
    direction: "outbound",
    phone: to,
    body: message,
    bridge_status: body?.status || null,
    http_status: response.status,
  }) : null;

  return {
    ok: response.ok && (!record || record.ok),
    bridge: { ok: response.ok, status: response.status, body },
    supabase: record,
  };
}

async function latestSms(from, persist) {
  assertBridgeToken();
  const response = await fetch(`${bridgeUrl}/sms/latest?from=${encodeURIComponent(from)}`, {
    headers: { "X-Bridge-Token": bridgeToken },
  });
  const body = await response.json().catch(() => null);
  const message = body?.message || null;
  const record = persist && message ? await writeSmsRecord({
    direction: "inbound",
    phone: message.from || from,
    body: message.body || "",
    message_date: message.date || null,
    http_status: response.status,
  }) : null;

  return {
    ok: response.ok && (!record || record.ok),
    bridge: { ok: response.ok, status: response.status, body },
    supabase: record,
  };
}

async function writeSmsRecord(values) {
  if (!hasEdgeConfig()) return { ok: false, configured: false };

  const direction = values.direction || "unknown";
  const phone = values.phone || "unknown";
  const payload = {
    entity: "sms_message",
    label: `SMS ${direction} ${phone}`,
    route: `android-sms-bridge:/sms/${direction}`,
    local_dataset: "alliance-sms-bridge",
    status: direction === "outbound" ? "queued" : "received",
    values: {
      ...values,
      source: "alliance_android_sms_bridge",
      recorded_at: new Date().toISOString(),
    },
  };

  const response = await fetch(`${trimSlash(process.env.SUPABASE_URL)}/functions/v1/${edgeFunction}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  return {
    ok: response.ok,
    configured: true,
    status: response.status,
    edge_function: edgeFunction,
    id: Array.isArray(body) ? body[0]?.id : body?.id,
    error: response.ok ? undefined : body?.message || body?.error || "edge_write_failed",
  };
}

function startServer(host, port) {
  const server = createServer(async (req, res) => {
    try {
      if (req.url === "/health" && req.method === "GET") {
        const health = await bridgeHealth();
        return json(res, 200, {
          ok: health.ok,
          bridge: health,
          supabase_edge_configured: hasEdgeConfig(),
        });
      }

      if (!authorized(req)) return json(res, 401, { ok: false, error: "unauthorized" });

      const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
      if (url.pathname === "/sms/send" && req.method === "POST") {
        const body = await readJson(req);
        if (body.relay === true || url.searchParams.get("relay") === "true") {
          const type = body.type || "sms";
          return json(res, 200, await queueRelayJob(type, body));
        }
        return json(res, 200, await sendSms(required(body.to, "to"), required(body.message, "message"), true));
      }

      if (url.pathname === "/sms/latest" && req.method === "GET") {
        if (url.searchParams.get("relay") === "true") {
          return json(res, 200, {
            ok: true,
            delivery: "cloud_relay",
            message: latestRelayInbound(required(url.searchParams.get("from"), "from")),
          });
        }
        return json(res, 200, await latestSms(required(url.searchParams.get("from"), "from"), true));
      }

      if (url.pathname === "/phone/next" && req.method === "GET") {
        return json(res, 200, { ok: true, job: relayJobs.find((job) => job.status === "queued") || null });
      }

      if (url.pathname === "/phone/report" && req.method === "POST") {
        const body = await readJson(req);
        return json(res, 200, await reportRelaySms(required(body.id, "id"), String(body.status || "unknown"), body.error));
      }

      if (url.pathname === "/phone/inbound" && req.method === "POST") {
        const body = await readJson(req);
        const message = {
          from: required(body.from, "from"),
          body: required(body.body, "body"),
          date: Number(body.date || Date.now()),
          received_at: new Date().toISOString(),
        };
        inboundMessages.push(message);
        inboundMessages.splice(0, Math.max(0, inboundMessages.length - 200));
        const record = await writeSmsRecord({
          direction: "inbound",
          phone: message.from,
          body: message.body,
          message_date: message.date,
          transport: "cloud_relay",
        });
        const profile = await routeProfileIntake(message.from, message.body);
        return json(res, 200, { ok: record.ok && profile.ok, message, supabase: record, profile });
      }

      if (url.pathname === "/phone/pulse" && req.method === "POST") {
        const body = await readJson(req);
        const type = body.type || "minute";
        const pulse = {
          type,
          battery: body.battery,
          timestamp: body.timestamp || Date.now(),
          bridge: url.searchParams.get("bridge") || "unknown",
        };
        console.log(`[PULSE] Received ${type} pulse from ${pulse.bridge}`);
        const record = await writeSmsRecord({
          direction: "telemetry",
          phone: pulse.bridge,
          body: `Pulse: ${type}`,
          pulse_type: type,
          battery: body.battery,
          transport: "cloud_relay",
        });
        const hub = await forwardPulseToHub(pulse);
        return json(res, 200, { ok: record.ok && hub.ok, pulse, supabase: record, hub });
      }

      return json(res, 404, { ok: false, error: "not_found" });
    } catch (error) {
      return json(res, 500, { ok: false, error: error.message });
    }
  });

  server.listen(port, host, () => {
    console.log(JSON.stringify({
      ok: true,
      service: "alliance-sms-dispatcher",
      url: `http://${host}:${port}`,
      bridge_url: bridgeUrl,
      supabase_edge_configured: hasEdgeConfig(),
      edge_function: edgeFunction,
      auth_required: true,
    }, null, 2));
  });
}

async function forwardPulseToHub(pulse) {
  if (!dispatcherToken) {
    return { ok: false, skipped: true, error: "dispatcher_token_not_configured" };
  }

  try {
    const response = await fetch(`${allianceHubUrl}/phone/pulse?bridge=${encodeURIComponent(pulse.bridge || "dispatcher")}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Dispatcher-Token": dispatcherToken,
      },
      body: JSON.stringify({
        type: pulse.type,
        battery: pulse.battery,
        timestamp: pulse.timestamp,
        forwarded_by: "alliance_sms_dispatcher",
      }),
    });
    const body = await response.json().catch(() => null);
    return {
      ok: response.ok && body?.ok !== false,
      status: response.status,
      action: body?.action,
      tasks: body?.tasks,
      error: response.ok ? undefined : body?.error || "hub_pulse_forward_failed",
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

async function routeProfileIntake(from, message) {
  const detection = await runProfileCommand("detect", from, message);
  if (!detection.ok || !detection.body?.should_route) {
    return {
      ok: true,
      routed: false,
      reason: detection.body?.reason || detection.error || "no_profile_route",
    };
  }
  const reply = await runProfileCommand("reply", from, message);
  return {
    ok: reply.ok,
    routed: reply.ok,
    reason: detection.body.reason,
    result: reply.body,
    error: reply.error,
  };
}

function runProfileCommand(command, from, message) {
  return new Promise((resolveRoute) => {
    const child = spawn(process.execPath, [
      resolve(cwd, "tools", "alliance-profile-intake.mjs"),
      command,
      "--from",
      String(from),
      "--message",
      String(message),
    ], {
      cwd,
      env: process.env,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => resolveRoute({ ok: false, routed: false, error: error.message }));
    child.on("close", (code) => {
      const text = stdout || stderr;
      let body = {};
      try {
        body = JSON.parse(text || "{}");
      } catch {
        resolveRoute({ ok: false, error: text || "profile_route_failed" });
        return;
      }
      if (code !== 0) {
        resolveRoute({ ok: false, error: body.error || "profile_route_failed" });
        return;
      }
      resolveRoute({ ok: true, body });
    });
  }).catch((error) => ({ ok: false, routed: false, error: error.message }));
}

function latestRelayInbound(from) {
  const digits = String(from).replace(/\D/g, "");
  for (let index = inboundMessages.length - 1; index >= 0; index--) {
    const message = inboundMessages[index];
    if (String(message.from).replace(/\D/g, "").endsWith(digits)) return message;
  }
  return null;
}

async function queueRelayJob(type, payload) {
  const job = {
    id: `job-${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    ...payload,
    status: "queued",
    queued_at: new Date().toISOString(),
  };
  relayJobs.push(job);
  const record = await writeSmsRecord({
    direction: "rhythmic_job",
    phone: payload.to || "bridge",
    body: `Job: ${type}${payload.repeat_interval ? " (rhythmic)" : ""}`,
    job_type: type,
    repeat_interval: payload.repeat_interval || null,
    transport: "cloud_relay",
    job_id: job.id,
  });
  return { ok: true, delivery: "queued_for_cloud_relay", job, supabase: record };
}

async function reportRelaySms(id, status, error) {
  const job = relayJobs.find((item) => item.id === id);
  if (!job) return { ok: false, error: "job_not_found" };
  job.status = status;
  job.reported_at = new Date().toISOString();
  if (error) job.error = String(error);
  const record = await writeSmsRecord({
    direction: "outbound_report",
    phone: job.to,
    body: job.message,
    bridge_status: status,
    transport: "cloud_relay",
    job_id: job.id,
    error: error || null,
  });
  return { ok: record.ok, job, supabase: record };
}

function authorized(req) {
  return req.headers["x-dispatcher-token"] === dispatcherToken;
}

function readJson(req) {
  return new Promise((resolveJson, reject) => {
    let text = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      text += chunk;
      if (text.length > 32_000) reject(new Error("request_too_large"));
    });
    req.on("end", () => {
      try {
        resolveJson(text ? JSON.parse(text) : {});
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function hasEdgeConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

function assertBridgeToken() {
  if (!bridgeToken) throw new Error("Missing ALLIANCE_SMS_BRIDGE_TOKEN.");
}

function assertDispatcherToken() {
  if (!dispatcherToken) throw new Error("Missing ALLIANCE_DISPATCHER_TOKEN.");
}

function loadEnv(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index < 0) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index++) {
    const item = argv[index];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : "true";
    if (next && !next.startsWith("--")) index++;
  }
  return parsed;
}

function required(value, name) {
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

function trimSlash(value) {
  return String(value || "").replace(/\/$/, "");
}
