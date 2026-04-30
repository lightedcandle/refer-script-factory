#!/usr/bin/env node
/**
 * token-useage.mjs
 *
 * Lightweight token-use tracking for the active chat surface and parallel
 * factory lanes. Exact provider token counts are not always exposed, so every
 * record must declare whether counts are measured, estimated, or manual.
 * Estimate rule: 4 characters = 1 token.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SUMMARY_FILE = "token useage.md";
const HTML_FILE = "token useage.html";
const LEDGER_FILE = ".refer-factory/chat-surface/token-useage.jsonl";
const DEFAULT_CODEX_ACCOUNT = "lightedcandle2018@gmail.com";

const LANES = {
  script_factory_spawned_agent: "Script Factory spawned agent",
  zo_bootstrap_spawned_agent: "Zo Bootstrap spawned agent",
  current_chat_window: "Current Chat window",
  zo_local_chat: "Zo local chat",
};

function parseArgs(argv) {
  const args = {
    command: argv[0] || "summary",
    lane: "",
    agent: "",
    agentId: "",
    script: "",
    account: process.env.REFER_TOKEN_ACCOUNT || process.env.CODEX_ACCOUNT || DEFAULT_CODEX_ACCOUNT,
    zoComputer: "",
    parent: "",
    model: "",
    inputTokens: "",
    outputTokens: "",
    inputChars: "",
    outputChars: "",
    inputText: "",
    outputText: "",
    ceilingTokens: "",
    source: "estimated",
    status: "done",
    note: "",
    noteContains: "",
    scope: "active",
    contractId: "",
    dryRun: false,
  };
  for (let i = 1; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--lane" && value) args.lane = value, i += 1;
    else if (key === "--agent" && value) args.agent = value, i += 1;
    else if (key === "--agent-id" && value) args.agentId = value, i += 1;
    else if (key === "--script" && value) args.script = value, i += 1;
    else if (key === "--account" && value) args.account = value, i += 1;
    else if (key === "--zo-computer" && value) args.zoComputer = value, i += 1;
    else if (key === "--parent" && value) args.parent = value, i += 1;
    else if (key === "--model" && value) args.model = value, i += 1;
    else if (key === "--input-tokens" && value) args.inputTokens = value, i += 1;
    else if (key === "--output-tokens" && value) args.outputTokens = value, i += 1;
    else if (key === "--input-chars" && value) args.inputChars = value, i += 1;
    else if (key === "--output-chars" && value) args.outputChars = value, i += 1;
    else if (key === "--input-text" && value) args.inputText = value, i += 1;
    else if (key === "--output-text" && value) args.outputText = value, i += 1;
    else if (key === "--ceiling-tokens" && value) args.ceilingTokens = value, i += 1;
    else if (key === "--source" && value) args.source = value, i += 1;
    else if (key === "--status" && value) args.status = value, i += 1;
    else if (key === "--note" && value) args.note = value, i += 1;
    else if (key === "--note-contains" && value) args.noteContains = value, i += 1;
    else if (key === "--scope" && value) args.scope = value, i += 1;
    else if (key === "--contract-id" && value) args.contractId = value, i += 1;
    else if (key === "--dry-run") args.dryRun = true;
  }
  if (args.command === "chat") {
    args.lane ||= "current_chat_window";
    args.agent ||= "Codex: Chat";
    args.note ||= "casual chat";
  }
  if (args.command === "reset-chat") {
    args.lane ||= "current_chat_window";
    args.agent ||= "Codex: Chat";
    args.source = "manual";
    args.status = "reset";
    args.note ||= "context ceiling reset";
  }
  if (args.command === "zo-chat") {
    args.lane ||= "zo_local_chat";
    args.agent ||= "Zo local chat";
    args.zoComputer ||= "telechurch";
    args.note ||= "Zo local chat";
  }
  return args;
}

function toInt(value) {
  if (value === "" || value === undefined || value === null) return 0;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function estimateTokensFromChars(chars) {
  return Math.ceil(Math.max(chars, 0) / 4);
}

function normalizeLane(lane) {
  const key = String(lane || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (LANES[key]) return key;
  throw new Error(`Unknown lane "${lane}". Use one of: ${Object.keys(LANES).join(", ")}`);
}

function readLedger() {
  if (!existsSync(LEDGER_FILE)) return [];
  return readFileSync(LEDGER_FILE, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function createRecord(args) {
  const lane = normalizeLane(args.lane);
  const inputChars = toInt(args.inputChars) || String(args.inputText || "").length;
  const outputChars = toInt(args.outputChars) || String(args.outputText || "").length;
  const inputTokens = toInt(args.inputTokens) || estimateTokensFromChars(inputChars);
  const outputTokens = toInt(args.outputTokens) || estimateTokensFromChars(outputChars);
  const agent = args.script ? `Script ${args.script}` : args.agent || LANES[lane];
  const zoComputer = args.zoComputer || inferZoComputer(args.account);
  const account = lane === "zo_local_chat" && zoComputer ? `zo:${zoComputer}` : args.account;
  return {
    ts: new Date().toISOString(),
    lane,
    lane_label: LANES[lane],
    agent,
    agent_id: args.agentId,
    account,
    zo_computer: zoComputer,
    parent: args.parent,
    model: args.model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
    input_chars: inputChars,
    output_chars: outputChars,
    source: args.source,
    status: args.status,
    contract_id: args.contractId,
    note: args.note,
    ceiling_tokens: toInt(args.ceilingTokens),
    unmeasured: inputTokens + outputTokens === 0 && args.status !== "reset",
  };
}

function inferZoComputer(account) {
  const value = String(account || "");
  return value.startsWith("zo:") ? value.slice(3) : "";
}

function totalsByLane(records) {
  const totals = {};
  for (const key of Object.keys(LANES)) {
    totals[key] = {
      lane: key,
      label: LANES[key],
      calls: 0,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
      agents: new Set(),
    };
  }
  for (const record of records) {
    if (!totals[record.lane]) continue;
    const row = totals[record.lane];
    row.calls += 1;
    row.input_tokens += toInt(record.input_tokens);
    row.output_tokens += toInt(record.output_tokens);
    row.total_tokens += toInt(record.total_tokens);
    if (record.agent || record.agent_id) {
      row.agents.add([record.agent, record.agent_id].filter(Boolean).join(" / "));
    }
  }
  return Object.values(totals).map((row) => ({ ...row, agents: Array.from(row.agents) }));
}

function writeSummary(records) {
  const totals = totalsByLane(records);
  const audit = auditCurrentChat(records);
  const grand = totals.reduce(
    (acc, row) => {
      acc.calls += row.calls;
      acc.input_tokens += row.input_tokens;
      acc.output_tokens += row.output_tokens;
      acc.total_tokens += row.total_tokens;
      return acc;
    },
    { calls: 0, input_tokens: 0, output_tokens: 0, total_tokens: 0 },
  );
  const recent = records.slice(-12).reverse();
  const lines = [
    "# Token Useage",
    "",
    "> Counts may be measured, estimated, or manual. When exact provider token usage is unavailable, the script estimates `4 characters = 1 token` and marks `source=estimated`.",
    "",
    `Updated: ${new Date().toISOString()}`,
    "",
    "## Totals",
    "",
    "| Lane | Calls | Input | Output | Total | Agents |",
    "|---|---:|---:|---:|---:|---|",
    ...totals.map((row) =>
      `| ${row.label} | ${row.calls} | ${row.input_tokens} | ${row.output_tokens} | ${row.total_tokens} | ${row.agents.join("<br>") || ""} |`,
    ),
    `| **All tracked** | **${grand.calls}** | **${grand.input_tokens}** | **${grand.output_tokens}** | **${grand.total_tokens}** | |`,
    "",
    "## Recent Activity",
    "",
    "| Time | Lane | Agent | Account | In | Out | Source | Status | Note |",
    "|---|---|---|---|---:|---:|---|---|---|",
    ...recent.map((record) =>
      `| ${record.ts} | ${record.lane_label} | ${escapeCell([record.agent, record.agent_id].filter(Boolean).join(" / "))} | ${escapeCell(record.account || "")} | ${record.input_tokens} | ${record.output_tokens} | ${record.source} | ${record.status} | ${escapeCell(record.note || record.contract_id || "")} |`,
    ),
    "",
    "## Lanes",
    "",
    "- Script Factory spawned agent: Codex-side delegated/subagent work for `refer-script-factory`.",
    "- Zo Bootstrap spawned agent: delegated/subagent work for `refer-zo-bootstrap`.",
    "- Current Chat window: this human-facing Codex chat surface.",
    "- Zo local chat: live Zo chat usage. Prefer file/API tandem and keep this near zero.",
    "",
    "## Ledger",
    "",
    `Visual dashboard: \`${HTML_FILE}\``,
    `Detailed records: \`${LEDGER_FILE}\``,
    "",
    "## Audit",
    "",
    `Current-chat zero-count non-reset records: ${audit.zero_count_non_reset}`,
    `Current-chat records after last reset/account switch with zero counts: ${audit.active_zero_count}`,
    "",
  ];
  writeFileSync(SUMMARY_FILE, `${lines.join("\n")}\n`, "utf8");
  writeFileSync(HTML_FILE, renderHtml(records, totals, grand), "utf8");
}

function writeLedger(records) {
  mkdirSync(dirname(LEDGER_FILE), { recursive: true });
  writeFileSync(
    LEDGER_FILE,
    records.map((record) => JSON.stringify(record)).join("\n") + (records.length ? "\n" : ""),
    "utf8",
  );
}

function backfillZoComputer(args) {
  const zoComputer = args.zoComputer || "telechurch";
  const records = readLedger();
  let changed = 0;
  const updated = records.map((record) => {
    if (record.lane !== "zo_local_chat") return record;
    if (record.account && String(record.account).startsWith("zo:") && record.zo_computer) {
      return record;
    }
    changed += 1;
    return {
      ...record,
      account: `zo:${zoComputer}`,
      zo_computer: zoComputer,
    };
  });
  if (!args.dryRun) {
    writeLedger(updated);
    writeSummary(updated);
  }
  return { changed, zo_computer: zoComputer, dry_run: args.dryRun };
}

function backfillCurrentChat(args) {
  const records = readLedger();
  const account = args.account || DEFAULT_CODEX_ACCOUNT;
  const inputTokens = toInt(args.inputTokens) || estimateTokensFromChars(toInt(args.inputChars) || String(args.inputText || "").length);
  const outputTokens = toInt(args.outputTokens) || estimateTokensFromChars(toInt(args.outputChars) || String(args.outputText || "").length);
  if (inputTokens + outputTokens <= 0) {
    throw new Error("tokens:backfill-chat requires --input-tokens/--output-tokens, --input-chars/--output-chars, or --input-text/--output-text");
  }
  const eligibleIndexes = selectBackfillIndexes(records, account, args);
  if (!eligibleIndexes.length) {
    return { changed: 0, account, scope: args.scope, note_contains: args.noteContains, dry_run: args.dryRun };
  }
  const inputParts = distribute(inputTokens, eligibleIndexes.length);
  const outputParts = distribute(outputTokens, eligibleIndexes.length);
  const updated = records.map((record, index) => {
    const selectedAt = eligibleIndexes.indexOf(index);
    if (selectedAt < 0) return record;
    const input = inputParts[selectedAt];
    const output = outputParts[selectedAt];
    return {
      ...record,
      input_tokens: input,
      output_tokens: output,
      total_tokens: input + output,
      input_chars: toInt(record.input_chars) || input * 4,
      output_chars: toInt(record.output_chars) || output * 4,
      source: args.source || "manual",
      note: `${record.note || ""} [backfilled usage]`.trim(),
      unmeasured: false,
    };
  });
  if (!args.dryRun) {
    writeLedger(updated);
    writeSummary(updated);
  }
  return {
    changed: eligibleIndexes.length,
    account,
    scope: args.scope,
    note_contains: args.noteContains,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
    dry_run: args.dryRun,
  };
}

function selectBackfillIndexes(records, account, args) {
  const currentIndexes = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => record.lane === "current_chat_window" && (record.account || DEFAULT_CODEX_ACCOUNT) === account);
  const resetIndex = currentIndexes.reduce((latest, row) => (row.record.status === "reset" ? row.index : latest), -1);
  return currentIndexes
    .filter(({ record, index }) => args.scope === "all" || index > resetIndex)
    .filter(({ record }) => isZeroCountRecord(record))
    .filter(({ record }) => !args.noteContains || String(record.note || "").toLowerCase().includes(String(args.noteContains).toLowerCase()))
    .map(({ index }) => index);
}

function distribute(total, count) {
  const base = Math.floor(total / count);
  const remainder = total % count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

function escapeCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(records, totals, grand) {
  const recent = records.slice(-50).reverse();
  const zoTotals = totalsByZoComputer(records);
  const chatContexts = currentChatContexts(records);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="10">
  <title>Token Useage</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f7f7f4;
      --text: #1f2528;
      --muted: #657076;
      --line: #d6dad7;
      --panel: #ffffff;
      --accent: #176c72;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #101315;
        --text: #edf0ef;
        --muted: #a8b0b3;
        --line: #30383b;
        --panel: #171c1f;
        --accent: #61c3c9;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    main {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }
    h1, h2 { margin: 0; font-weight: 700; letter-spacing: 0; }
    h1 { font-size: 28px; }
    h2 { font-size: 18px; margin-top: 28px; }
    .meta {
      color: var(--muted);
      margin: 8px 0 18px;
      font-size: 14px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(4, minmax(180px, 1fr));
      gap: 12px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      min-width: 0;
    }
    .card strong {
      display: block;
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card .total {
      font-size: 24px;
      font-weight: 700;
      color: var(--accent);
    }
    .card .detail {
      margin-top: 6px;
      font-size: 13px;
      color: var(--muted);
      white-space: nowrap;
    }
    .table-wrap {
      margin-top: 12px;
      overflow-x: auto;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    table {
      width: 100%;
      min-width: 980px;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--line);
      text-align: left;
      vertical-align: top;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    th {
      color: var(--muted);
      font-weight: 650;
      background: var(--panel);
      position: sticky;
      top: 0;
      z-index: 1;
    }
    td.num, th.num { text-align: right; }
    .recent-table {
      min-width: 860px;
      table-layout: fixed;
    }
    .recent-table th,
    .recent-table td {
      padding: 7px 8px;
      width: 100px;
      max-width: 100px;
      cursor: default;
    }
    .recent-table tbody tr {
      cursor: pointer;
    }
    .recent-table tbody tr:hover td {
      background: color-mix(in srgb, var(--accent) 10%, transparent);
    }
    .note, .agents, .time, .lane, .account, .small {
      width: 100px;
      max-width: 100px;
    }
    dialog {
      width: min(760px, calc(100vw - 32px));
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--text);
      padding: 0;
    }
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.42);
    }
    .dialog-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px solid var(--line);
      padding: 12px 14px;
    }
    .dialog-head strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dialog-head button {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      padding: 6px 10px;
      cursor: pointer;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      gap: 8px 12px;
      padding: 14px;
      font-size: 13px;
    }
    .detail-grid dt {
      color: var(--muted);
    }
    .detail-grid dd {
      margin: 0;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .empty {
      padding: 24px;
      color: var(--muted);
    }
    .context-card strong {
      white-space: normal;
    }
    .context-account {
      display: block;
      margin-top: 2px;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .card button {
      margin-top: 10px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      padding: 6px 8px;
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .card button:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    @media (max-width: 860px) {
      main { padding: 16px; }
      .cards { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
    }
  </style>
</head>
<body>
  <main>
    <h1>Token Useage</h1>
    <p class="meta">Updated ${escapeHtml(new Date().toISOString())}. Estimate rule: 4 characters = 1 token. Exact counts should be marked measured when available.</p>
    ${chatContexts.length ? renderChatContextSection(chatContexts) : ""}
    <section class="cards" aria-label="Token totals">
      ${totals.map(renderTotalCard).join("\n      ")}
    </section>
    ${zoTotals.length ? renderZoComputerSection(zoTotals) : ""}
    <h2>Totals</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="lane">Lane</th>
            <th class="num small">Calls</th>
            <th class="num small">Input</th>
            <th class="num small">Output</th>
            <th class="num small">Total</th>
            <th class="agents">Agents</th>
          </tr>
        </thead>
        <tbody>
          ${totals.map(renderTotalRow).join("\n          ")}
          <tr>
            <td><strong>All tracked</strong></td>
            <td class="num"><strong>${grand.calls}</strong></td>
            <td class="num" title="${grand.input_tokens}"><strong>${formatCompactNumber(grand.input_tokens)}</strong></td>
            <td class="num" title="${grand.output_tokens}"><strong>${formatCompactNumber(grand.output_tokens)}</strong></td>
            <td class="num" title="${grand.total_tokens}"><strong>${formatCompactNumber(grand.total_tokens)}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2>Recent Activity</h2>
    <div class="table-wrap">
      ${recent.length ? renderRecentTable(recent) : '<div class="empty">No token activity recorded yet.</div>'}
    </div>
    <dialog id="activityDialog">
      <div class="dialog-head">
        <strong id="activityDialogTitle">Activity Details</strong>
        <button type="button" onclick="document.getElementById('activityDialog').close()">Close</button>
      </div>
      <dl class="detail-grid" id="activityDialogBody"></dl>
    </dialog>
  </main>
  <script>
    const activityRows = ${JSON.stringify(recent.map((record) => ({
      time: formatLocalTime(record.ts),
      timestamp: record.ts,
      lane: record.lane_label,
      agent: [record.agent, record.agent_id].filter(Boolean).join(" / "),
      account: record.account || "",
      input: toInt(record.input_tokens),
      output: toInt(record.output_tokens),
      total: toInt(record.total_tokens),
      source: record.source || "",
      status: record.status || "",
      contract: record.contract_id || "",
      note: record.note || "",
      zo_computer: record.zo_computer || "",
      model: record.model || "",
    }))).replace(/</g, "\\u003c")};
    function openActivity(index) {
      const row = activityRows[index];
      if (!row) return;
      const dialog = document.getElementById('activityDialog');
      const title = document.getElementById('activityDialogTitle');
      const body = document.getElementById('activityDialogBody');
      title.textContent = row.agent || 'Activity Details';
      const entries = [
        ['Time', row.time],
        ['Timestamp', row.timestamp],
        ['Lane', row.lane],
        ['Agent', row.agent],
        ['Account', row.account],
        ['Zo computer', row.zo_computer],
        ['Input tokens', row.input],
        ['Output tokens', row.output],
        ['Total tokens', row.total],
        ['Source', row.source],
        ['Status', row.status],
        ['Contract', row.contract],
        ['Model', row.model],
        ['Note', row.note],
      ];
      body.innerHTML = entries
        .filter(([, value]) => value !== undefined && value !== null && String(value) !== '')
        .map(([key, value]) => '<dt>' + escapeHtmlJs(key) + '</dt><dd>' + escapeHtmlJs(String(value)) + '</dd>')
        .join('');
      dialog.showModal();
    }
    function escapeHtmlJs(value) {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
    async function copyResetCommand(index) {
      const button = document.querySelector('[data-reset-index="' + index + '"]');
      if (!button) return;
      const command = button.getAttribute('data-command') || '';
      try {
        await navigator.clipboard.writeText(command);
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy reset command'; }, 1600);
      } catch {
        window.prompt('Run this command to log and reset the chat context:', command);
      }
    }
  </script>
</body>
</html>
`;
}

function totalsByZoComputer(records) {
  const totals = new Map();
  for (const record of records) {
    const zoComputer = record.zo_computer || inferZoComputer(record.account);
    if (!zoComputer) continue;
    const current = totals.get(zoComputer) || {
      zo_computer: zoComputer,
      calls: 0,
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0,
    };
    current.calls += 1;
    current.input_tokens += toInt(record.input_tokens);
    current.output_tokens += toInt(record.output_tokens);
    current.total_tokens += toInt(record.total_tokens);
    totals.set(zoComputer, current);
  }
  return Array.from(totals.values()).sort((a, b) => b.total_tokens - a.total_tokens);
}

function currentChatContexts(records) {
  const accounts = new Map();
  for (const record of records) {
    if (record.lane !== "current_chat_window") continue;
    const account = record.account || DEFAULT_CODEX_ACCOUNT;
    const current = accounts.get(account) || {
      account,
      records: [],
      unmeasured_records: [],
      last_reset: "",
      ceiling_tokens: 0,
    };
    if (record.status === "reset") {
      current.records = [];
      current.unmeasured_records = [];
      current.last_reset = record.ts;
      current.ceiling_tokens = toInt(record.ceiling_tokens) || toInt(record.total_tokens) || current.ceiling_tokens;
    } else {
      current.records.push(record);
      if (isZeroCountRecord(record)) current.unmeasured_records.push(record);
    }
    accounts.set(account, current);
  }
  return Array.from(accounts.values())
    .map((context) => {
      const inputTokens = context.records.reduce((sum, record) => sum + toInt(record.input_tokens), 0);
      const outputTokens = context.records.reduce((sum, record) => sum + toInt(record.output_tokens), 0);
      return {
        account: context.account,
        calls: context.records.length,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
        unmeasured_calls: context.unmeasured_records.length,
        last_reset: context.last_reset,
        ceiling_tokens: context.ceiling_tokens,
      };
    })
    .sort((a, b) => b.total_tokens - a.total_tokens);
}

function renderChatContextSection(chatContexts) {
  return `<h2>Current Context</h2>
    <section class="cards" aria-label="Current chat context token totals">
      ${chatContexts.map(renderChatContextCard).join("\n      ")}
    </section>`;
}

function renderChatContextCard(row, index) {
  const command = `npm run tokens:reset-chat -- --account ${quoteShellArg(row.account)} --ceiling-tokens ${row.total_tokens} --note "context ceiling reached"`;
  const resetDetail = row.last_reset
    ? `reset ${formatLocalTime(row.last_reset)} - ceiling ${formatCompactNumber(row.ceiling_tokens)}`
    : "no reset marker";
  return `<article class="card context-card">
        <strong>Codex: Chat <span class="context-account" title="${escapeHtml(row.account)}">${escapeHtml(row.account)}</span></strong>
        <div class="total" title="${row.total_tokens}">${formatCompactNumber(row.total_tokens)}</div>
        <div class="detail">${row.calls} calls - in ${formatCompactNumber(row.input_tokens)} - out ${formatCompactNumber(row.output_tokens)}</div>
        ${row.unmeasured_calls ? `<div class="detail" title="Current-chat rows logged without input/output counts">${row.unmeasured_calls} unmeasured calls</div>` : ""}
        <div class="detail" title="${escapeHtml(resetDetail)}">${escapeHtml(resetDetail)}</div>
        <button type="button" data-reset-index="${index}" data-command="${escapeHtml(command)}" onclick="copyResetCommand(${index})">Copy reset command</button>
      </article>`;
}

function renderZoComputerSection(zoTotals) {
  return `<h2>Zo Computers</h2>
    <section class="cards" aria-label="Zo computer token totals">
      ${zoTotals.map((row) => `<article class="card">
        <strong title="${escapeHtml(row.zo_computer)}">💬 ${escapeHtml(row.zo_computer)}</strong>
        <div class="total" title="${row.total_tokens}">${formatCompactNumber(row.total_tokens)}</div>
        <div class="detail">${row.calls} calls - in ${formatCompactNumber(row.input_tokens)} - out ${formatCompactNumber(row.output_tokens)}</div>
      </article>`).join("\n      ")}
    </section>`;
}

function quoteShellArg(value) {
  const text = String(value || "");
  if (/^[A-Za-z0-9_@.:/-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
}

function renderTotalCard(row) {
  return `<article class="card">
        <strong title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</strong>
        <div class="total" title="${row.total_tokens}">${formatCompactNumber(row.total_tokens)}</div>
        <div class="detail">${row.calls} calls - in ${formatCompactNumber(row.input_tokens)} - out ${formatCompactNumber(row.output_tokens)}</div>
      </article>`;
}

function renderTotalRow(row) {
  return `<tr>
            <td title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</td>
            <td class="num">${row.calls}</td>
            <td class="num" title="${row.input_tokens}">${formatCompactNumber(row.input_tokens)}</td>
            <td class="num" title="${row.output_tokens}">${formatCompactNumber(row.output_tokens)}</td>
            <td class="num" title="${row.total_tokens}">${formatCompactNumber(row.total_tokens)}</td>
            <td title="${escapeHtml(row.agents.join(", "))}">${escapeHtml(row.agents.join(", "))}</td>
          </tr>`;
}

function renderRecentTable(recent) {
  return `<table class="recent-table">
        <thead>
          <tr>
            <th class="agents">Agent</th>
            <th class="num small">Input</th>
            <th class="num small">Output</th>
            <th class="note">Note</th>
            <th class="time">Time</th>
            <th class="lane">Lane</th>
            <th class="account">Account</th>
            <th class="small">Status</th>
          </tr>
        </thead>
        <tbody>
          ${recent.map(renderRecentRow).join("\n          ")}
        </tbody>
      </table>`;
}

function renderRecentRow(record, index) {
  const agent = [record.agent, record.agent_id].filter(Boolean).join(" / ");
  const displayAgent = `${categoryIcon(record)} ${agent}`.trim();
  const note = record.note || record.contract_id || "";
  const unmeasured = isZeroCountRecord(record) ? " [unmeasured]" : "";
  return `<tr onclick="openActivity(${index})">
            <td title="${escapeHtml(agent)}">${escapeHtml(displayAgent)}</td>
            <td class="num" title="${toInt(record.input_tokens)}">${formatCompactNumber(toInt(record.input_tokens))}</td>
            <td class="num" title="${toInt(record.output_tokens)}">${formatCompactNumber(toInt(record.output_tokens))}</td>
            <td title="${escapeHtml(note + unmeasured)}">${escapeHtml(note + unmeasured)}</td>
            <td title="${escapeHtml(record.ts)}">${escapeHtml(formatLocalTime(record.ts))}</td>
            <td title="${escapeHtml(record.lane_label)}">${escapeHtml(record.lane_label)}</td>
            <td class="account" title="${escapeHtml(record.account || "")}">${escapeHtml(record.account || "")}</td>
            <td title="${escapeHtml(record.status)}">${escapeHtml(record.status)}</td>
          </tr>`;
}

function isZeroCountRecord(record) {
  return record.status !== "reset" && toInt(record.input_tokens) === 0 && toInt(record.output_tokens) === 0;
}

function auditCurrentChat(records) {
  const currentChat = records.filter((record) => record.lane === "current_chat_window");
  const zeroCount = currentChat.filter(isZeroCountRecord);
  const lastResetIndex = currentChat.reduce((latest, record, index) => (record.status === "reset" ? index : latest), -1);
  const activeRecords = lastResetIndex >= 0 ? currentChat.slice(lastResetIndex + 1) : currentChat;
  return {
    zero_count_non_reset: zeroCount.length,
    active_zero_count: activeRecords.filter(isZeroCountRecord).length,
    last_reset_at: lastResetIndex >= 0 ? currentChat[lastResetIndex].ts : "",
  };
}

function categoryIcon(record) {
  const agent = String(record.agent || "");
  const lane = String(record.lane || "");
  if (agent.startsWith("Script ")) return "⚙️";
  if (lane === "current_chat_window") return "🤖";
  if (lane.includes("spawned_agent")) return "🧩";
  if (lane === "zo_local_chat") return "💬";
  return "•";
}

function formatLocalTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  const month = date.toLocaleString(undefined, { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function formatCompactNumber(value) {
  const num = toInt(value);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${trimDecimal(num / 1_000_000_000)}b`;
  if (abs >= 1_000_000) return `${trimDecimal(num / 1_000_000)}m`;
  if (abs >= 1_000) return `${trimDecimal(num / 1_000)}k`;
  return String(num);
}

function trimDecimal(value) {
  const fixed = Math.abs(value) >= 100 ? value.toFixed(0) : value.toFixed(1);
  return fixed.replace(/\.0$/, "");
}

function logRecord(args) {
  const record = createRecord(args);
  mkdirSync(dirname(LEDGER_FILE), { recursive: true });
  if (!args.dryRun) {
    appendFileSync(LEDGER_FILE, `${JSON.stringify(record)}\n`, "utf8");
    writeSummary(readLedger());
  }
  return record;
}

function printUsage() {
  console.log(`Usage:
  npm run tokens:summary
  npm run tokens:chat -- --input-chars 1200 --output-chars 800 --note "casual chat"
  npm run tokens:chat -- --input-text "user prompt" --output-text "assistant response" --note "casual chat"
  npm run tokens:reset-chat -- --ceiling-tokens 12000 --note "context ceiling reached"
  npm run tokens:zo-chat -- --zo-computer telechurch --input-chars 80 --output-chars 200 --note "minimal Zo activation"
  npm run tokens:log -- --lane current_chat_window --input-chars 1200 --output-chars 800 --note "summary"
  npm run tokens:log -- --lane script_factory_spawned_agent --agent Harvey --agent-id <id> --input-tokens 1000 --output-tokens 500 --source manual
  npm run tokens:script -- --script dispatch-contract --lane zo_bootstrap_spawned_agent --account codex-main --input-chars 1200 --output-chars 800 --note "script run"
  npm run tokens:backfill-zo -- --zo-computer telechurch
  npm run tokens:backfill-chat -- --account digitizedbusiness@gmail.com --scope active --input-tokens 300 --output-tokens 600 --source manual
  npm run tokens:backfill-chat -- --account digitizedbusiness@gmail.com --note-contains "deployment pack" --input-tokens 120 --output-tokens 220 --source manual
  npm run tokens:audit-chat

Lanes:
  ${Object.keys(LANES).join("\n  ")}`);
}

const args = parseArgs(process.argv.slice(2));
try {
  if (["log", "script", "chat", "reset-chat", "zo-chat"].includes(args.command)) {
    if (args.command === "script" && !args.script) {
      throw new Error("tokens:script requires --script <name>");
    }
    const record = logRecord(args);
    console.log(JSON.stringify(record, null, 2));
  } else if (args.command === "summary") {
    writeSummary(readLedger());
    console.log(`Wrote ${resolve(SUMMARY_FILE)}`);
  } else if (args.command === "audit-chat") {
    console.log(JSON.stringify(auditCurrentChat(readLedger()), null, 2));
  } else if (args.command === "lanes") {
    console.log(JSON.stringify(LANES, null, 2));
  } else if (args.command === "backfill-zo") {
    console.log(JSON.stringify(backfillZoComputer(args), null, 2));
  } else if (args.command === "backfill-chat") {
    console.log(JSON.stringify(backfillCurrentChat(args), null, 2));
  } else {
    printUsage();
    process.exit(args.command === "help" ? 0 : 2);
  }
} catch (error) {
  console.error(error?.message || String(error));
  process.exit(1);
}
