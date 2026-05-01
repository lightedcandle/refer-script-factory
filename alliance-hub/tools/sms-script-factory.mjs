#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  routeSmsIntent,
  validateSmsScriptRegistry,
} from "../scripts/sms/router.mjs";

const command = process.argv[2] || "validate";

if (command === "validate") {
  const result = validateSmsScriptRegistry();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
}

if (command === "route") {
  const text = argValue("--text") || process.argv.slice(3).join(" ");
  const registered = process.argv.includes("--registered");
  if (!text) fail("missing_text");
  console.log(JSON.stringify(routeSmsIntent(text, { registered }), null, 2));
  process.exit(0);
}

if (command === "cluster-gaps") {
  const file = argValue("--file");
  if (!file) fail("missing_file");
  const rows = readGapRows(file);
  const clusters = clusterGaps(rows);
  console.log(JSON.stringify({ ok: true, clusters }, null, 2));
  process.exit(0);
}

fail(`unknown_command:${command}`);

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function readGapRows(file) {
  const text = readFileSync(file, "utf8").trim();
  if (!text) return [];
  if (text.startsWith("[")) return JSON.parse(text);
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function clusterGaps(rows) {
  const clusters = new Map();
  for (const row of rows) {
    const values = row.values || row;
    const route = routeSmsIntent(values.body || values.normalized_body || "", { registered: true });
    const key = values.suggested_script_id || route.suggested_script_id;
    const cluster = clusters.get(key) || {
      suggested_script_id: key,
      count: 0,
      examples: [],
    };
    cluster.count += 1;
    if (cluster.examples.length < 5) {
      cluster.examples.push(values.body || values.normalized_body || "");
    }
    clusters.set(key, cluster);
  }
  return [...clusters.values()].sort((a, b) => b.count - a.count);
}

function fail(error) {
  console.error(JSON.stringify({ ok: false, error }, null, 2));
  process.exit(1);
}
