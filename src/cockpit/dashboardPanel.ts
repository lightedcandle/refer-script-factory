import * as vscode from "vscode";
import { cockpitStyles, escapeHtml } from "./html";
import { calculateMetrics, sampleMetricInput } from "../telemetry/metrics";
import { countCodebaseMiles } from "../telemetry/codebaseMiles";
import { getBootstrapHealthSnapshot } from "../telemetry/bootstrapHealth";

export class DashboardPanel implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const miles = workspaceRoot
      ? countCodebaseMiles(workspaceRoot)
      : { codebase_lines: sampleMetricInput.codebase_lines, counted_files: 0 };
    const metrics = calculateMetrics({
      ...sampleMetricInput,
      codebase_lines: miles.codebase_lines,
      repo_file_count: miles.counted_files || sampleMetricInput.repo_file_count,
    });
    const averageMetrics = calculateMetrics({
      ...sampleMetricInput,
      token_groups: 12,
      mutations_count: 72,
      verified_lines_written: 540,
      verified_file_changes: 31,
      codebase_lines: miles.codebase_lines,
      repo_file_count: miles.counted_files || sampleMetricInput.repo_file_count,
    });
    const bootstrapHealth = getBootstrapHealthSnapshot();
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = renderDashboard(
      metrics,
      averageMetrics,
      bootstrapHealth,
    );
  }
}

function renderDashboard(
  metrics: ReturnType<typeof calculateMetrics>,
  averageMetrics: ReturnType<typeof calculateMetrics>,
  bootstrapHealth: ReturnType<typeof getBootstrapHealthSnapshot>,
): string {
  const secondary = metrics.secondary_gears.join(", ") || "none";
  const averageSecondary = averageMetrics.secondary_gears.join(", ") || "none";
  const roadQuality = 100 - metrics.terrain_drag;
  const averageRoadQuality = 100 - averageMetrics.terrain_drag;
  return `<!doctype html>
<html lang="en">
<head>${cockpitStyles()}</head>
<body>
  <main class="surface">
    <h1>REFER Dashboard</h1>
    <p class="summary">Factory metrics and current workspace bootstrap posture.</p>
    <div class="segment-control" role="tablist" aria-label="Metric mode">
      <button class="segment active" type="button" data-mode="live">Live</button>
      <button class="segment" type="button" data-mode="average">Average</button>
    </div>
    <section class="metric-section" data-section="live">
      <h2>Live</h2>
      ${tokenCard("live-tokens", "Live Tokens", metrics.input_tokens, metrics.output_tokens, metrics.response_mpg)}
      <section class="metric-grid" aria-label="Live factory metrics">
        ${metric("miles", "Miles Total", metrics.codebase_lines.toLocaleString(), false, "Total Lines")}
        ${metric("codebase-mpg", "Live Mileage", metrics.codebase_mpg.toFixed(2), false, "Lines Changed")}
        ${metric("files-changed", "Files Changed", String(metrics.verified_file_changes))}
        ${metric("road-quality", "Road Quality", `${roadQuality}/100`)}
        ${metric("dominant-gear", "Main Work Mode", metrics.dominant_gear)}
        ${metric("secondary-gears", "Other Work Modes", secondary, true)}
        ${metric("repo-health", "Repo Health", `${metrics.repo_health_score}/100`)}
      </section>
    </section>
    <section class="metric-section" data-section="average" hidden>
      <h2>Average</h2>
      ${tokenCard("avg-tokens", "Avg Tokens", averageMetrics.input_tokens, averageMetrics.output_tokens, averageMetrics.response_mpg)}
      <section class="metric-grid" aria-label="Average factory metrics">
        ${metric("miles", "Miles Total", averageMetrics.codebase_lines.toLocaleString(), false, "Total Lines")}
        ${metric("avg-codebase-mpg", "Avg Mileage", averageMetrics.codebase_mpg.toFixed(2), false, "Lines Changed")}
        ${metric("avg-files-changed", "Avg Files Changed", averageMetrics.verified_file_changes.toFixed(0))}
        ${metric("avg-road-quality", "Avg Road Quality", `${averageRoadQuality}/100`)}
        ${metric("avg-dominant-gear", "Main Work Mode", averageMetrics.dominant_gear)}
        ${metric("avg-secondary-gears", "Other Work Modes", averageSecondary, true)}
        ${metric("avg-repo-health", "Avg Repo Health", `${averageMetrics.repo_health_score}/100`)}
      </section>
    </section>
    <h2>Bootstrap Health</h2>
    <section class="metric-grid" aria-label="Bootstrap health">
      ${metric("bootstrap-phase", "Phase", bootstrapHealth.phase)}
      ${metric("framework", "Framework", bootstrapHealth.framework ?? "unknown", true)}
      ${metric("create", "Create", String(bootstrapHealth.create_count))}
      ${metric("update", "Update", String(bootstrapHealth.update_count))}
      ${metric("skip", "Skip", String(bootstrapHealth.skip_count))}
      ${metric("unsafe-overwrites", "Unsafe Overwrites", String(bootstrapHealth.unsafe_overwrite_count))}
      ${metric("bootstrap-health", "Bootstrap Health", `${bootstrapHealth.repo_health_score}/100`)}
    </section>
    <aside class="info-popover" id="metric-info" aria-live="polite">
      <div class="info-title" id="metric-info-title"></div>
      <div class="info-body" id="metric-info-body"></div>
      <button class="info-close secondary" type="button" id="metric-info-close">Close</button>
    </aside>
  </main>
  <script>
    const metricInfo = ${JSON.stringify(metricDescriptions)};
    const popover = document.getElementById("metric-info");
    const title = document.getElementById("metric-info-title");
    const body = document.getElementById("metric-info-body");
    const close = document.getElementById("metric-info-close");

    document.querySelectorAll("[data-metric]").forEach((tile) => {
      tile.addEventListener("click", () => {
        const info = metricInfo[tile.dataset.metric];
        if (!info) {
          return;
        }
        title.textContent = info.title;
        body.textContent = info.body;
        popover.classList.add("open");
      });
    });

    close.addEventListener("click", () => {
      popover.classList.remove("open");
    });

    document.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;
        document.querySelectorAll("[data-mode]").forEach((item) => {
          item.classList.toggle("active", item.dataset.mode === mode);
        });
        document.querySelectorAll("[data-section]").forEach((section) => {
          section.hidden = section.dataset.section !== mode;
        });
      });
    });

  </script>
</body>
</html>`;
}

function metric(
  id: string,
  label: string,
  value: string,
  small = false,
  subtext?: string,
): string {
  return `<button class="metric" type="button" data-metric="${escapeHtml(id)}">
    <div class="label">${escapeHtml(label)}</div>
    <div class="value${small ? " small" : ""}">${escapeHtml(value)}</div>
    ${subtext ? `<div class="subtext">${escapeHtml(subtext)}</div>` : ""}
  </button>`;
}

function tokenCard(
  id: string,
  label: string,
  inputTokens: number,
  outputTokens: number,
  mpg: number,
): string {
  const rawPercent = mpg * 100;
  const score = normalizeMpgScore(rawPercent);
  return `<button class="token-card" type="button" data-metric="${escapeHtml(id)}">
    ${speedometer(score)}
    <div class="token-title">${escapeHtml(label)}</div>
    <div class="subtext">MPG score: token return normalized to 100</div>
    <div class="token-stats">
      <span class="token-stat">IN ${escapeHtml(inputTokens.toLocaleString())}</span>
      <span aria-hidden="true"> · </span>
      <span class="token-stat">OUT ${escapeHtml(outputTokens.toLocaleString())}</span>
    </div>
  </button>`;
}

function speedometer(score: number): string {
  const needle = polarPoint(100, 104, 64, scoreToAngle(score));
  return `<svg class="gauge-svg" viewBox="0 0 200 128" role="img" aria-label="MPG speedometer">
    ${arcPath(100, 104, 74, scoreToAngle(0), scoreToAngle(25), "zone-idle")}
    ${arcPath(100, 104, 74, scoreToAngle(25), scoreToAngle(50), "zone-normal")}
    ${arcPath(100, 104, 74, scoreToAngle(50), scoreToAngle(75), "zone-productive")}
    ${arcPath(100, 104, 74, scoreToAngle(75), scoreToAngle(100), "zone-execution")}
    <text class="gauge-label" x="41" y="97">0</text>
    <text class="gauge-label" x="58" y="66">25</text>
    <text class="gauge-label" x="100" y="50" text-anchor="middle">50</text>
    <text class="gauge-label" x="142" y="66">100</text>
    <line class="needle" x1="100" y1="104" x2="${needle.x.toFixed(2)}" y2="${needle.y.toFixed(2)}"></line>
    <circle class="needle-hub" cx="100" cy="104" r="9"></circle>
    <text class="gauge-value" x="100" y="92" text-anchor="middle">${score}</text>
    <text class="gauge-caption" x="100" y="120" text-anchor="middle">MPG</text>
  </svg>`;
}

function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  className: string,
): string {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `<path class="${className}" d="M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}" fill="none" stroke-width="16" stroke-linecap="butt"></path>`;
}

function polarPoint(
  cx: number,
  cy: number,
  radius: number,
  angleDegrees: number,
): { x: number; y: number } {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function scoreToAngle(score: number): number {
  return -115 + (Math.min(Math.max(score, 0), 100) / 100) * 230;
}

function normalizeMpgScore(rawPercent: number): number {
  return Math.min(Math.max(Math.round(rawPercent), 0), 100);
}

const metricDescriptions: Record<string, { title: string; body: string }> = {
  "live-tokens": {
    title: "Live Tokens",
    body: "Literal:\nIN is input tokens submitted. OUT is output tokens returned. MPG is OUT divided by IN, normalized to a 0-100 score.\n\nAnalogy:\nInput tokens are the gas. Output tokens are the miles returned. The gauge maxes at 100 so the reading stays familiar.\n\nGauge:\n0-25: Idle or review. Low return, still consuming.\n25-50: Normal exchange.\n50-75: Productive. Stronger return.\n75-100: Execution. High return from compact input.\n\nThe driver decides:\nLow MPG can be right for careful review. A maxed gauge can be right for execution. The gauge shows token return, not quality.",
  },
  "avg-tokens": {
    title: "Average Tokens",
    body: "Literal:\nAverage IN, OUT, and MPG across tracked responses. MPG is average output tokens divided by average input tokens, normalized to a 0-100 score.\n\nAnalogy:\nThe usual gas-to-miles return across the route.\n\nHow to read it:\nUse this to see whether prompts usually return enough output for what they consume.",
  },
  miles: {
    title: "Miles Total",
    body: "Literal:\nTotal counted lines of code in the active workspace. Generated folders such as dist and node_modules are excluded.\n\nAnalogy:\nThe total road already built in the codebase.",
  },
  "codebase-mpg": {
    title: "Live Mileage: Lines Changed",
    body: "Literal:\nHow many verified lines of code changed from the latest governed prompt or script result.\n\nAnalogy:\nThe live miles driven on this turn.\n\nHow to read it:\n0: No code moved. Ask what blocked progress.\n1-25: Small controlled drive.\n26-100: Meaningful movement. Review changed files.\n100+: Long drive. Verify tests and ask for a summary.",
  },
  "avg-codebase-mpg": {
    title: "Average Mileage: Lines Changed",
    body: "Literal:\nAverage verified lines of code changed per governed prompt or script result over time.\n\nAnalogy:\nThe usual miles driven per turn.\n\nHow to read it:\nA rising average means responses are moving more code. That can be productive, but it needs stronger review and verification.",
  },
  "files-changed": {
    title: "Files Changed",
    body: "Literal:\nHow many files were touched by the latest verified result.\n\nAnalogy:\nHow many stops or lanes the vehicle touched. It is context, not the primary cost metric.",
  },
  "avg-files-changed": {
    title: "Average Files Changed",
    body: "Literal:\nAverage number of files touched across tracked responses.\n\nAnalogy:\nThe usual number of stops made during each drive.",
  },
  "road-quality": {
    title: "Road Quality",
    body: "Literal:\nHow ready the codebase is for more work, based on repo friction such as dirty files, failing checks, and missing anchors.\n\nAnalogy:\nHow smooth the road is before the next drive.\n\nHow to read it:\nHigher is better. Low road quality means slow down, fix blockers, or verify before adding more change.",
  },
  "avg-road-quality": {
    title: "Average Road Quality",
    body: "Literal:\nAverage codebase readiness over tracked responses.\n\nAnalogy:\nHow smooth the route usually is.\n\nHow to read it:\nIf this trends down, the project is getting harder to move through cleanly.",
  },
  "dominant-gear": {
    title: "Main Work Mode",
    body: "Literal:\nThe main kind of governed work happening now, such as planning, factory/build work, or repo changes.\n\nAnalogy:\nThe gear the vehicle is mostly driving in.",
  },
  "avg-dominant-gear": {
    title: "Main Work Mode",
    body: "Literal:\nThe kind of work most common across tracked responses.\n\nAnalogy:\nThe gear the vehicle usually drives in.",
  },
  "secondary-gears": {
    title: "Other Work Modes",
    body: "Literal:\nOther kinds of work also happening in the same result. For example, a result may mostly change code but also update docs or tests.\n\nAnalogy:\nThe vehicle is mainly in one gear, but other gears are helping carry the drive.",
  },
  "avg-secondary-gears": {
    title: "Other Work Modes",
    body: "Literal:\nOther kinds of work that commonly appear across tracked responses.\n\nAnalogy:\nThe supporting gears that show up during the route.",
  },
  "repo-health": {
    title: "Repo Health",
    body: "Overall health score after terrain drag is applied. Higher is better.",
  },
  "bootstrap-phase": {
    title: "Bootstrap Phase",
    body: "Current bootstrap state: none, dry-run, applied, or cancelled.",
  },
  framework: {
    title: "Framework",
    body: "Framework/runtime supplied during bootstrap. It selects the matching adapter contract when available.",
  },
  create: {
    title: "Create",
    body: "Number of bootstrap targets that would be created or were created.",
  },
  update: {
    title: "Update",
    body: "Number of REFER-owned bootstrap targets that would be updated or were updated.",
  },
  skip: {
    title: "Skip",
    body: "Number of existing targets left untouched by bootstrap.",
  },
  "unsafe-overwrites": {
    title: "Unsafe Overwrites",
    body: "Targets refused because they would write outside the workspace or violate overwrite rules.",
  },
  "bootstrap-health": {
    title: "Bootstrap Health",
    body: "Bootstrap-specific health score derived from pending creates, updates, and unsafe overwrite risk.",
  },
};
