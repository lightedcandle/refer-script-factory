#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const required = [
  "public/index.html",
  "public/app.js",
  "public/styles.css",
  "public/_redirects",
  "scripts/sms/registry.json",
  "scripts/sms/router.mjs",
  "functions/_shared/profile.js",
  "functions/api/profile-intake/session/[token].js",
  "functions/api/profile-intake/start.js",
  "functions/api/profile-intake/submit.js",
  "functions/api/profile-intake/edit-link.js",
  "functions/api/profile-intake/profile/[id].js",
  "functions/api/sms-factory/gaps.js",
  "tools/sms-script-factory.mjs",
];

const missing = required.filter((file) => !existsSync(resolve(file)));
if (missing.length) {
  console.error(JSON.stringify({ ok: false, missing }, null, 2));
  process.exit(1);
}

for (const file of required.filter((item) => item.endsWith(".js"))) {
  const text = readFileSync(resolve(file), "utf8");
  if (/\t/.test(text)) {
    console.error(JSON.stringify({ ok: false, error: "tabs_found", file }, null, 2));
    process.exit(1);
  }
}

const { validateSmsScriptRegistry } = await import("../scripts/sms/router.mjs");
const smsRegistry = validateSmsScriptRegistry();
if (!smsRegistry.ok) {
  console.error(JSON.stringify({ ok: false, error: "sms_registry_invalid", details: smsRegistry }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checked: required.length, sms_registry: smsRegistry }, null, 2));
