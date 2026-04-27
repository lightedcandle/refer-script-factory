export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

export type PanelIcon =
  | "archive"
  | "book"
  | "chat"
  | "command"
  | "dashboard"
  | "endpoint"
  | "process"
  | "request"
  | "script";

export function panelTitle(title: string, icon: PanelIcon): string {
  return `<h1 class="panel-title">${panelIcon(icon)}<span>${escapeHtml(title)}</span></h1>`;
}

function panelIcon(icon: PanelIcon): string {
  const paths: Record<PanelIcon, string> = {
    archive:
      '<path d="M3 5h10"></path><path d="M4 5v8h8V5"></path><path d="M6 8h4"></path><path d="M5 3h6l1 2H4l1-2Z"></path>',
    book:
      '<path d="M3 4.5A2.5 2.5 0 0 1 5.5 2H13v11H5.5A2.5 2.5 0 0 0 3 15.5V4.5Z"></path><path d="M5.5 13H13"></path>',
    chat:
      '<path d="M3 4h10v7H7l-3 3v-3H3V4Z"></path><path d="M5.5 6.5h5"></path><path d="M5.5 8.5h3"></path>',
    command:
      '<path d="M6 6H4.5A1.5 1.5 0 1 1 6 4.5V6Z"></path><path d="M10 6h1.5A1.5 1.5 0 1 0 10 4.5V6Z"></path><path d="M6 10H4.5A1.5 1.5 0 1 0 6 11.5V10Z"></path><path d="M10 10h1.5A1.5 1.5 0 1 1 10 11.5V10Z"></path><path d="M6 6h4v4H6z"></path>',
    dashboard:
      '<path d="M3 11a5 5 0 1 1 10 0"></path><path d="M8 11l3-4"></path><path d="M4.5 12.5h7"></path>',
    endpoint:
      '<path d="M4 8h8"></path><circle cx="3" cy="8" r="1.5"></circle><circle cx="13" cy="8" r="1.5"></circle><path d="M8 4v8"></path><circle cx="8" cy="3" r="1.5"></circle><circle cx="8" cy="13" r="1.5"></circle>',
    process:
      '<path d="M3 12h3"></path><path d="M10 12h3"></path><path d="M6 12a2 2 0 0 1 4 0"></path><path d="M5 5h6v4H5z"></path><path d="M8 9v1"></path>',
    request:
      '<path d="M3 5h7"></path><path d="M8 3l2 2-2 2"></path><path d="M13 11H6"></path><path d="M8 9l-2 2 2 2"></path>',
    script:
      '<path d="M6 4 3 8l3 4"></path><path d="M10 4l3 4-3 4"></path><path d="M8.5 3.5 7.5 12.5"></path>',
  };

  return `<svg class="panel-icon" viewBox="0 0 16 16" aria-hidden="true">${paths[icon]}</svg>`;
}

export function cockpitStyles(): string {
  return `<style>
    :root {
      color-scheme: light dark;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 14px;
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.4;
    }

    body.chat-history-body {
      height: 100vh;
      overflow: hidden;
    }

    body.script-registry-body {
      height: 100vh;
      overflow: hidden;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    h1 {
      font-size: 17px;
      font-weight: 650;
      color: var(--vscode-sideBarTitle-foreground, var(--vscode-foreground));
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      color: var(--vscode-charts-cyan, #00c7d4);
    }

    .panel-title span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .panel-icon {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.45;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    h2 {
      margin-top: 18px;
      font-size: 12px;
      font-weight: 650;
      letter-spacing: 0;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
    }

    .surface {
      display: grid;
      gap: 12px;
      min-width: 0;
      max-width: 100%;
    }

    .chat-history-body .surface {
      grid-template-rows: auto auto auto minmax(0, 1fr);
      height: 100%;
      min-height: 0;
    }

    .script-registry-body .surface {
      grid-template-rows: auto auto minmax(0, 1fr);
      height: 100%;
      min-height: 0;
    }

    .script-registry-body-compact .surface {
      grid-template-rows: auto minmax(0, 1fr);
    }

    .summary {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
      gap: 8px;
    }

    .segment-control {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
      padding: 3px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }

    .segment {
      justify-self: stretch;
      border-radius: 4px;
      background: transparent;
      color: var(--vscode-descriptionForeground);
    }

    .segment.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .metric-section[hidden] {
      display: none;
    }

    .token-card {
      display: grid;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }

    .token-title {
      font-weight: 650;
      text-align: center;
    }

    .gauge-svg {
      width: min(130px, 100%);
      max-width: 130px;
      justify-self: center;
      overflow: visible;
    }

    .gauge-label {
      fill: var(--vscode-descriptionForeground);
      font-size: 9px;
      font-family: var(--vscode-font-family);
    }

    .gauge-value {
      fill: var(--vscode-foreground);
      font-size: 18px;
      font-weight: 650;
      font-family: var(--vscode-font-family);
    }

    .gauge-caption {
      fill: var(--vscode-descriptionForeground);
      font-size: 9px;
      font-family: var(--vscode-font-family);
    }

    .needle {
      stroke: var(--vscode-foreground);
      stroke-width: 3;
      stroke-linecap: round;
    }

    .needle-hub {
      fill: var(--vscode-editor-background);
      stroke: var(--vscode-foreground);
      stroke-width: 2;
    }

    .zone-idle {
      stroke: var(--vscode-descriptionForeground);
    }

    .zone-normal {
      stroke: var(--vscode-charts-green);
    }

    .zone-productive {
      stroke: var(--vscode-charts-yellow);
    }

    .zone-execution {
      stroke: var(--vscode-charts-red);
    }

    .token-stats {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      text-align: center;
    }

    .token-stat {
      display: inline;
    }


    .metric {
      display: grid;
      align-content: center;
      justify-items: center;
      min-height: 72px;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      text-align: center;
      cursor: pointer;
    }

    .metric:hover,
    .metric:focus {
      border-color: var(--vscode-focusBorder);
      outline: none;
    }

    .label {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .value {
      margin-top: 5px;
      color: var(--vscode-foreground);
      font-size: 18px;
      font-weight: 650;
      overflow-wrap: anywhere;
    }

    .value.small {
      font-size: 13px;
      font-weight: 600;
    }

    .subtext {
      margin-top: 4px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .info-popover {
      position: fixed;
      inset: auto 12px 12px 12px;
      z-index: 5;
      display: none;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--vscode-focusBorder);
      border-radius: 6px;
      background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
      color: var(--vscode-editorWidget-foreground, var(--vscode-foreground));
      box-shadow: 0 8px 22px rgb(0 0 0 / 28%);
    }

    .info-popover.open {
      display: grid;
    }

    .info-title {
      font-weight: 650;
    }

    .info-body {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      white-space: pre-wrap;
    }

    .info-close {
      justify-self: end;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      overflow-wrap: anywhere;
    }

    th,
    td {
      padding: 7px 6px;
      border-bottom: 1px solid var(--vscode-panel-border);
      text-align: left;
      vertical-align: top;
    }

    th {
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 650;
    }

    .badge {
      display: inline-block;
      max-width: 100%;
      padding: 2px 6px;
      border-radius: 999px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      font-size: 11px;
      font-weight: 650;
      overflow-wrap: anywhere;
    }

    .process-list {
      display: grid;
      gap: 8px;
      min-width: 0;
      max-width: 100%;
    }

    .chat-history-body .process-list {
      min-height: 0;
      overflow-y: auto;
      padding-right: 2px;
    }

    .process-row {
      display: grid;
      gap: 8px;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }

    .process-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    .process-name {
      min-width: 0;
      font-weight: 650;
      overflow-wrap: anywhere;
    }

    .process-meta {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .process-message {
      color: var(--vscode-foreground);
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .process-error {
      color: var(--vscode-errorForeground);
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .library-row {
      display: grid;
      gap: 8px;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }

    .library-summary {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      cursor: pointer;
    }

    .library-path {
      color: var(--vscode-descriptionForeground);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .library-preview {
      max-height: 220px;
      font-size: 11px;
    }

    .library-open {
      justify-self: start;
    }

    .script-list {
      display: grid;
      align-content: start;
      grid-auto-rows: max-content;
      gap: 5px;
      min-width: 0;
    }

    .script-registry-head {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .factory-breadcrumb {
      position: sticky;
      top: 0;
      z-index: 2;
      min-width: 0;
      padding: 6px 8px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-sideBar-background);
      color: var(--vscode-charts-cyan, #00c7d4);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .script-registry-scroll {
      display: grid;
      align-content: start;
      grid-auto-rows: max-content;
      gap: 10px;
      min-width: 0;
      min-height: 0;
      overflow-y: auto;
      padding-right: 2px;
    }

    .script-kind-toggle {
      max-width: 260px;
    }

    .factory-tree-section,
    .script-list-section {
      display: grid;
      min-width: 0;
      min-height: 0;
    }

    .factory-tree-section > summary,
    .script-list-section > summary {
      width: fit-content;
      max-width: 100%;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .factory-tree-section[open] > summary,
    .script-list-section[open] > summary {
      margin-bottom: 6px;
      color: var(--vscode-charts-cyan, #00c7d4);
    }

    .factory-tree {
      display: grid;
      gap: 5px;
      min-width: 0;
      padding: 8px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: color-mix(in srgb, var(--vscode-editor-background) 92%, var(--vscode-foreground) 8%);
    }

    .factory-tree-node {
      display: grid;
      min-width: 0;
      margin-bottom: 2px;
    }

    .factory-tree-node summary {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      cursor: pointer;
      list-style: none;
      padding: 2px 0;
    }

    .factory-tree-node summary::-webkit-details-marker {
      display: none;
    }

    .factory-tree-node summary::before {
      content: '›';
      display: inline-block;
      width: 12px;
      color: var(--vscode-descriptionForeground);
      font-size: 14px;
      text-align: center;
      transition: transform 0.15s ease;
    }

    .factory-tree-node[open] > summary::before {
      transform: rotate(90deg);
      color: var(--vscode-charts-cyan, #00c7d4);
    }

    .factory-tree-button {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--vscode-foreground);
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
    }

    .factory-tree-button:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .factory-tree-node[open] > summary .factory-tree-button {
      color: var(--vscode-charts-cyan, #00c7d4);
    }

    .factory-tree-children {
      display: grid;
      gap: 2px;
      min-width: 0;
      margin-left: 6px;
      padding-left: 12px;
      border-left: 1px solid var(--vscode-panel-border);
    }

    .factory-tree-subtext {
      padding: 4px 8px;
      color: var(--vscode-descriptionForeground);
      font-size: 11.5px;
      line-height: 1.4;
      background: color-mix(in srgb, var(--vscode-editor-background) 95%, var(--vscode-foreground) 5%);
      border-radius: 4px;
      margin: 2px 0 6px 0;
    }

    .status-light {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--vscode-disabledForeground, #808080);
      flex-shrink: 0;
    }

    .status-light.off { background: var(--vscode-disabledForeground, #808080); opacity: 0.5; }
    .status-light.queued, .status-light.running { 
      background: var(--vscode-charts-yellow, #cca700); 
      box-shadow: 0 0 6px var(--vscode-charts-yellow);
      animation: pulse 2s infinite;
    }
    .status-light.completed { background: var(--vscode-charts-green, #388a3a); }
    .status-light.failed, .status-light.blocked { background: var(--vscode-charts-red, #d13438); }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    .factory-tree-missing {
      min-width: 0;
      padding: 4px 6px;
      color: var(--vscode-errorForeground);
      font-size: 12px;
      overflow-wrap: anywhere;
    }

    .script-registry-body .script-list {
      min-height: 0;
      padding-right: 2px;
    }

    .script-list-section {
      min-height: 0;
      overflow: hidden;
    }

    .script-list-section[open] {
      padding-right: 2px;
    }

    .script-list-section-body {
      display: grid;
      gap: 8px;
      min-width: 0;
      min-height: 0;
    }

    .script-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 6px;
      align-items: center;
      width: 100%;
      min-width: 0;
      padding: 6px 7px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      background: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      text-align: left;
    }

    .script-row:hover,
    .script-row:focus-within {
      border-color: var(--vscode-focusBorder);
      outline: none;
    }

    .script-row-main {
      display: grid;
      gap: 2px;
      min-width: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;
    }

    .script-row-main:hover {
      background: transparent;
    }

    .script-status-button {
      width: 16px;
      height: 16px;
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: inherit;
    }

    .script-status-button:hover {
      background: var(--vscode-toolbar-hoverBackground, var(--vscode-list-hoverBackground));
    }

    .script-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-descriptionForeground);
      opacity: 0.9;
    }

    .script-status-dot.status-off {
      background: var(--vscode-disabledForeground, var(--vscode-descriptionForeground));
      opacity: 0.45;
    }

    .script-status-dot.status-processing {
      background: var(--vscode-charts-yellow);
    }

    .script-status-dot.status-completed {
      background: var(--vscode-charts-green);
    }

    .script-status-dot.status-failed {
      background: var(--vscode-charts-red);
    }

    .script-row-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
    }

    .script-row code {
      min-width: 0;
      color: var(--vscode-descriptionForeground);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 10.5px;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .script-detail-popover {
      gap: 12px;
      max-height: calc(100vh - 24px);
      padding: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .script-detail-header {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      background: var(--vscode-editor-background);
    }

    .script-detail-kicker {
      margin-bottom: 3px;
      color: var(--vscode-descriptionForeground);
      font-size: 10px;
      font-weight: 650;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .script-detail-title {
      font-size: 14px;
      line-height: 1.3;
    }

    .script-detail-grid {
      display: grid;
      gap: 8px;
      padding: 0 12px;
    }

    .script-detail-grid div,
    .script-detail-section {
      display: grid;
      gap: 4px;
      min-width: 0;
      padding: 9px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: color-mix(in srgb, var(--vscode-editor-background) 88%, var(--vscode-foreground) 12%);
    }

    .script-detail-grid span,
    .script-detail-label {
      color: var(--vscode-descriptionForeground);
      font-size: 10px;
      font-weight: 650;
      text-transform: uppercase;
    }

    .script-detail-grid code {
      min-width: 0;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 11px;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .script-detail-section {
      margin: 0 12px;
    }

    .script-detail-section:last-child {
      margin-bottom: 12px;
    }

    .script-detail-copy {
      color: var(--vscode-foreground);
      font-size: 12px;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }

    .script-detail-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin: 0 12px 12px;
      min-width: 0;
      flex-wrap: wrap;
    }

    .status-legend-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 8px;
      align-items: center;
      color: var(--vscode-foreground);
      font-size: 12px;
      line-height: 1.4;
    }

    button:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .icon-row {
      display: flex;
      gap: 4px;
    }

    .message {
      display: grid;
      gap: 8px;
      max-width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
    }

    .message.operator {
      justify-self: end;
      max-width: min(86%, 520px);
      padding: 10px 12px;
      border-radius: 12px;
      background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
    }

    .message-head {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }

    .message.assistant .message-head {
      display: none;
    }

    .message-body {
      min-width: 0;
      max-width: 100%;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .settings-panel {
      display: grid;
      gap: 10px;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }

    .settings-status {
      display: grid;
      gap: 3px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }

    .settings-panel[hidden] {
      display: none;
    }

    label {
      display: grid;
      gap: 4px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }

    textarea {
      width: 100%;
      min-height: 64px;
      max-height: 180px;
      resize: vertical;
      padding: 0;
      border: 0;
      border-radius: 0;
      color: var(--vscode-input-foreground);
      background: transparent;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    textarea:focus {
      outline: none;
    }

    input {
      width: 100%;
      padding: 7px 8px;
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 4px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    .composer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
      max-width: 100%;
      flex-wrap: wrap;
    }

    .composer-secondary {
      display: flex;
      gap: 6px;
      min-width: 0;
    }

    .reader-controls {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .reader-controls summary {
      width: fit-content;
      max-width: 100%;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .reader-controls[open] summary {
      margin-bottom: 8px;
    }

    .reader-controls-body {
      display: grid;
      gap: 8px;
      min-width: 0;
    }

    .reader-separator {
      height: 1px;
      background: var(--vscode-panel-border);
    }

    .reader-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 6px;
      width: 100%;
      max-width: 220px;
    }

    .reader-actions button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 0;
      padding-inline: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .button-icon {
      width: 14px;
      height: 14px;
      flex: 0 0 auto;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .mode-lights {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      align-items: center;
      min-width: 0;
      padding: 8px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }

    .mode-lights .summary {
      grid-column: 1 / -1;
    }

    .mode-light {
      display: grid;
      justify-items: center;
      gap: 4px;
      min-width: 0;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 650;
    }

    .contract-turn {
      gap: 10px;
      padding: 12px 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      border-top: 1px solid var(--vscode-panel-border);
      border-bottom: 1px solid var(--vscode-panel-border);
      box-shadow: none;
    }

    .contract-turn:last-child {
      padding-bottom: 0;
    }

    .contract-turn-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
    }

    .chat-part {
      min-width: 0;
      padding: 7px 8px;
      border-left: 3px solid var(--vscode-panel-border);
      background: color-mix(in srgb, var(--vscode-editor-background) 92%, var(--vscode-foreground) 8%);
    }

    .chat-part summary {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      cursor: pointer;
      list-style-position: outside;
    }

    .chat-speaker {
      flex: 0 0 auto;
      font-size: 11px;
      font-weight: 650;
      line-height: 1.35;
    }

    .chat-preview {
      min-width: 0;
      overflow: hidden;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      line-height: 1.35;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chat-content {
      margin-top: 7px;
      padding-left: 2px;
    }

    .chat-in {
      border-left-color: var(--vscode-charts-yellow);
    }

    .chat-out {
      border-left-color: var(--vscode-charts-blue);
    }

    .chat-machine {
      border-left-color: var(--vscode-descriptionForeground);
    }

    .contract-intent {
      font-size: 12px;
      line-height: 1.35;
    }

    .contract-timestamp {
      display: block;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      line-height: 1.35;
    }

    .contract-footer {
      display: flex;
      justify-content: flex-end;
      min-width: 0;
    }

    .contract-output {
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      font-size: 12px;
      line-height: 1.45;
    }

    .contract-machine {
      min-width: 0;
      border-top: 0;
      padding-top: 6px;
    }

    .contract-machine summary {
      width: fit-content;
      max-width: 100%;
      cursor: pointer;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
      font-weight: 650;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .contract-machine[open] summary {
      margin-bottom: 6px;
      color: var(--vscode-editor-foreground);
    }

    .contract-machine pre {
      margin-top: 8px;
      max-width: 100%;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .contract-meta {
      grid-template-columns: 1fr;
      gap: 4px;
      padding-top: 2px;
    }

    .contract-meta div {
      display: grid;
      grid-template-columns: 52px minmax(0, 1fr);
      gap: 6px;
      min-width: 0;
      align-items: start;
    }

    .contract-meta span {
      color: var(--vscode-descriptionForeground);
    }

    .contract-meta code {
      min-width: 0;
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 10.5px;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .thinking-row {
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      background: color-mix(in srgb, var(--vscode-editor-background) 82%, var(--vscode-focusBorder) 18%);
    }

    .thinking-mark {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      width: 34px;
      height: 22px;
      justify-content: center;
    }

    .thinking-mark span {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: var(--vscode-progressBar-background, var(--vscode-focusBorder));
      animation: refer-thinking 1.05s ease-in-out infinite;
    }

    .thinking-mark span:nth-child(2) {
      animation-delay: 0.14s;
    }

    .thinking-mark span:nth-child(3) {
      animation-delay: 0.28s;
    }

    @keyframes refer-thinking {
      0%,
      80%,
      100% {
        opacity: 0.35;
        transform: translateY(0);
      }

      40% {
        opacity: 1;
        transform: translateY(-3px);
      }
    }

    .mode-dot {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-disabledForeground, var(--vscode-descriptionForeground));
      opacity: 0.35;
    }

    .mode-light.active {
      color: var(--vscode-foreground);
    }

    .mode-light.active .mode-dot {
      opacity: 1;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--vscode-focusBorder) 30%, transparent);
    }

    .mode-light.idle.active .mode-dot {
      background: var(--vscode-descriptionForeground);
    }

    .mode-light.temporary.active .mode-dot {
      background: var(--vscode-charts-green);
    }

    .mode-light.persistent.active .mode-dot {
      background: var(--vscode-charts-blue);
    }

    button {
      padding: 6px 10px;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      cursor: pointer;
    }

    .icon-button {
      width: 28px;
      height: 28px;
      display: inline-grid;
      place-items: center;
      padding: 0;
      border-radius: 999px;
      font-size: 14px;
    }

    button:hover {
      background: var(--vscode-button-hoverBackground);
    }

    button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }

    button.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    .bottom-switch {
      display: flex;
      justify-content: flex-start;
      padding-top: 0;
      border: 0;
      background: transparent;
    }

    .bottom-switch button {
      flex: 0 0 auto;
      justify-self: start;
    }

    .mini-gauge-button {
      width: 75px;
      height: 75px;
      display: grid;
      place-items: center;
      padding: 4px;
      border-radius: 8px;
    }

    .mini-gauge {
      width: 67px;
      height: 67px;
    }

    .mini-gauge text {
      font-family: var(--vscode-font-family);
      fill: var(--vscode-foreground);
    }

    pre {
      margin: 0;
      max-height: 520px;
      overflow: auto;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  </style>
  <script>
    const vscode = acquireVsCodeApi();
    function runScript(scriptId) {
      if (!scriptId) return;
      vscode.postMessage({ command: 'runScript', scriptId });
    }
  </script>`;
}
