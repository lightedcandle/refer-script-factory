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
    }

    .summary {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
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
    }

    .process-row {
      display: grid;
      gap: 8px;
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
      white-space: pre-wrap;
      overflow-wrap: anywhere;
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
    }

    .composer-secondary {
      display: flex;
      gap: 6px;
      min-width: 0;
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
  </style>`;
}
