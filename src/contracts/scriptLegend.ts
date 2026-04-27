import * as fs from "node:fs";
import * as path from "node:path";
import { scriptFactoryEntries } from "./scriptFactory";

export interface ScriptLegendTerm {
  term: string;
  plain_name: string;
  meaning: string;
  deterministic_use: string;
}

export interface ScriptLegendCategory {
  name: string;
  allowed_values: string[];
  rule: string;
}

export interface ScriptLegendField {
  field: string;
  required: boolean;
  meaning: string;
  rule: string;
}

export interface ScriptLegendTransition {
  from: string;
  to: string[];
  rule: string;
}

export interface ScriptLegendArtifact {
  path: string;
  owner: string;
  meaning: string;
  freshness_rule: string;
}

export interface ScriptLegendExample {
  title: string;
  body: string;
}

export interface ScriptLegend {
  schema_version: 1;
  title: "Script Legend";
  purpose: string;
  terms: ScriptLegendTerm[];
  taxonomy: ScriptLegendCategory[];
  fields: ScriptLegendField[];
  surface_rules: ScriptLegendCategory[];
  status_transitions: ScriptLegendTransition[];
  artifacts: ScriptLegendArtifact[];
  authority_order: string[];
  examples: ScriptLegendExample[];
  graph_symbols: ScriptLegendTerm[];
  deterministic_rules: string[];
}

const factoryLayerLabels = [
  "Factory System",
  "Factories",
  "Factory",
  "Forges",
  "Map",
  "Script Factory",
  "Forge",
  "Script Forge",
  "Single Script",
  "Multi Script",
  "Script Creation Forges",
  "Script Inspection Forges",
  "Script Runtime Forges",
  "Script Verification Forges",
  "Request Intake",
  "Runtime Entrypoints",
  "Command Surface",
  "HTTP Endpoint Surface",
  "Scriptionary",
  "Scriptonomy",
  "Scriptograph",
  "Scriptographer",
  "Script Legend",
  "Script Registry",
  "Scanners",
  "Verification",
  "Context Factory",
  "Model Factory",
  "Artifact Factory",
  "Script Inoculation Registry",
];

const scriptActionLabels = [
  "Run Scan",
  "View Treefile",
  "Run Gap Scan",
  "View Gap Report",
  "Run Scriptographer",
  "View Scriptographer Report",
];

const cockpitViewLabels = [
  "REFER",
  "Refer Library",
  "Refer Factory System",
  "Factory System",
  "Dashboard",
  "@Refer Chat History",
  "Process",
  "Bootstrap Library",
];

export function scriptLegendPath(workspaceRoot: string): string {
  return path.join(workspaceRoot, ".refer-factory", "script-legend.md");
}

export function createScriptLegend(): ScriptLegend {
  return {
    schema_version: 1,
    title: "Script Legend",
    purpose:
      "Give humans, agents, and local LLMs one deterministic language for scripts, script relationships, statuses, and context flow.",
    terms: [
      {
        term: "Forge",
        plain_name: "Conversion Unit",
        meaning: "One bounded unit that turns defined inputs into defined outputs.",
        deterministic_use:
          "Use Forge for a repeatable conversion unit. Do not use Factory when only one conversion unit is meant.",
      },
      {
        term: "Factory",
        plain_name: "Governed Forge Domain",
        meaning: "A governance domain that coordinates multiple forges or manages governance around them.",
        deterministic_use:
          "Use Factory when the domain owns multiple forges or the rules around those forges; use Forge for one bounded conversion unit.",
      },
      {
        term: "Script Forge",
        plain_name: "Script Conversion Unit",
        meaning: "A forge that performs one script-specific conversion.",
        deterministic_use:
          "Use it for a script that has inputs, transformation, outputs, status, and feedback.",
      },
      {
        term: "Factory System",
        plain_name: "Coordinated Factory Network",
        meaning: "The complete network of factories across domains.",
        deterministic_use:
          "Use it for the whole body of coordinated factories, not for the Script Factory alone.",
      },
      {
        term: "Local-First Maturity",
        plain_name: "Less Remote Dependence",
        meaning: "The process of making future turns resolvable from local scripts, context, artifacts, and local models.",
        deterministic_use:
          "Use it to decide what each chat turn should leave behind for the next similar turn.",
      },
      {
        term: "Self-Healing",
        plain_name: "Gap Repair",
        meaning: "Detecting missing or ambiguous structure and turning it into governed scripts, context, tests, statuses, or doctrine.",
        deterministic_use:
          "Use it after each resolved turn to identify what was missing, ambiguous, or manually inferred.",
      },
      {
        term: "Script Factory",
        plain_name: "Script Governance System",
        meaning: "The workspace and governance layer that creates, manages, and runs script forges.",
        deterministic_use:
          "Use this term for the whole script governance system, not for one script, one forge, or one card.",
      },
      {
        term: "Single Script",
        plain_name: "Single Operation",
        meaning: "One bounded script entry that performs one main action.",
        deterministic_use:
          "A Single Script may call helpers, but it is presented as one direct operation.",
      },
      {
        term: "Multi Script",
        plain_name: "Script Pipeline",
        meaning: "A bundled script entry made from ordered child scripts.",
        deterministic_use:
          "A Multi Script must list child_scripts in execution or conceptual order.",
      },
      {
        term: "Scriptionary",
        plain_name: "Script Dictionary",
        meaning: "Definitions of script terms and vocabulary.",
        deterministic_use:
          "Use it to explain words; do not use it as the relationship map.",
      },
      {
        term: "Scriptograph",
        plain_name: "Script Relationship Map",
        meaning: "A map of how scripts connect, call each other, and move data.",
        deterministic_use:
          "Use it to answer what calls what, what feeds what, and what output is produced.",
      },
      {
        term: "Scriptographer",
        plain_name: "Script Cartographer",
        meaning: "The scanner/builder that maintains script maps and definitions.",
        deterministic_use:
          "Use it for the tool or process that creates scriptograph and scriptionary artifacts.",
      },
      {
        term: "Scriptonomy",
        plain_name: "Script Taxonomy",
        meaning: "The classification blueprint for script kinds, surfaces, points, and status rules.",
        deterministic_use:
          "Use it for allowed categories and validation rules, not for prose definitions alone.",
      },
      {
        term: "Context Picker",
        plain_name: "Context Pack Builder",
        meaning: "The script that selects relevant assets for a prompt-specific model package.",
        deterministic_use:
          "It chooses context; it does not answer the user by itself.",
      },
      {
        term: "Script Registry",
        plain_name: "Registered Script List",
        meaning: "The source list of governed script entries and request categories.",
        deterministic_use:
          "Use it for registered entries from src/contracts/scriptFactory.ts, not for arbitrary UI group names.",
      },
      {
        term: "Script Registry Entries",
        plain_name: "Visible Registered Script List",
        meaning: "The UI section that lists the current Script Factory registry entries.",
        deterministic_use:
          "Use it for the rendered list of registered entries; each row label must come from Registered Script Label.",
      },
      {
        term: "Request Intake",
        plain_name: "Request Entry Layer",
        meaning: "The governed layer that classifies how work enters REFER.",
        deterministic_use:
          "Use it only for request-type entries such as chat, HTTP, or command requests.",
      },
      {
        term: "Runtime Entrypoints",
        plain_name: "Runnable Entry Paths",
        meaning: "The governed layer for ways work starts running through REFER.",
        deterministic_use:
          "Use it for @refer chat, local HTTP, and explicit command starts that route into scripts.",
      },
      {
        term: "Command Surface",
        plain_name: "VS Code Command Layer",
        meaning: "The governed layer for actions exposed through the VS Code Command Palette.",
        deterministic_use:
          "Use it for vscode-command entries and do not use Command Prompts as a competing label.",
      },
      {
        term: "HTTP Endpoint Surface",
        plain_name: "Local Server Route Layer",
        meaning: "The governed layer for local HTTP routes that expose REFER to other tools.",
        deterministic_use:
          "Use it for http-endpoint entries and route labels such as Server Chat Route.",
      },
      {
        term: "Scanners",
        plain_name: "Inspection Scripts",
        meaning: "Scripts that read local state and write durable factory context or gap artifacts.",
        deterministic_use:
          "Use it for scan scripts such as Scan Codebase and Scan Factory Gaps.",
      },
      {
        term: "Verification",
        plain_name: "Quality Gate",
        meaning: "Checks that factory changes compile, pass tests, and satisfy acceptance criteria.",
        deterministic_use:
          "Use it for compile, test, verify, and contract acceptance checks.",
      },
      {
        term: "Process Events",
        plain_name: "Script Run Records",
        meaning: "Structured records of queued, running, completed, failed, or blocked script work.",
        deterministic_use:
          "Use it as the source for status lights and latest-process details.",
      },
      {
        term: "Latest Process",
        plain_name: "Most Recent Script Run",
        meaning: "The newest process event matched to a script entry.",
        deterministic_use:
          "Use it for status detail text sourced from process-state data; do not use it for guessed activity.",
      },
      {
        term: "Status Light",
        plain_name: "Process Status Indicator",
        meaning: "A UI indicator derived from execution status, not a hand-authored color label.",
        deterministic_use:
          "Use it only when the color maps back to off, queued, running, completed, failed, or blocked.",
      },
      {
        term: "User Prompt",
        plain_name: "Human Request Text",
        meaning: "The text submitted by the user through chat, HTTP, or a command-triggered flow.",
        deterministic_use:
          "Use it only for human-authored request input before it is converted into a contract or script packet.",
      },
      {
        term: "Model",
        plain_name: "LLM Runtime",
        meaning: "The local or remote language model selected to process a bounded prompt.",
        deterministic_use:
          "Use Agent when referring to the participant role; use Model when referring to the runtime that produces completions.",
      },
      {
        term: "Chat History",
        plain_name: "Saved Chat Turns",
        meaning: "Durable records of REFER chat requests, intermediate packets, and final answers.",
        deterministic_use:
          "Use it for .refer-factory/chat/sessions records and visible chat-history panels.",
      },
      {
        term: "Context Factory",
        plain_name: "Context Governance Factory",
        meaning: "A future factory domain for creating, refreshing, and packaging local context assets.",
        deterministic_use:
          "Use it as a Factory System domain label, not as a Script Factory entry unless registered.",
      },
      {
        term: "Model Factory",
        plain_name: "Model Governance Factory",
        meaning: "A future factory domain for local/cloud model routing and model capability policy.",
        deterministic_use:
          "Use it as a Factory System domain label, not as a Script Factory entry unless registered.",
      },
      {
        term: "Artifact Factory",
        plain_name: "Artifact Governance Factory",
        meaning: "A future factory domain for generated files, packets, reports, and durable outputs.",
        deterministic_use:
          "Use it as a Factory System domain label, not as a Script Factory entry unless registered.",
      },
      {
        term: "Codebase Tree",
        plain_name: "Repository Map",
        meaning: "A machine-readable index of useful files, folders, roles, imports, exports, and surfaces.",
        deterministic_use:
          "Use it for local lookup and context selection; do not send the entire tree to a model by default.",
      },
      {
        term: "Agent Context",
        plain_name: "Agent Briefing",
        meaning: "A compact human/model-readable summary of the repo.",
        deterministic_use:
          "Use it as first-pass context before opening full source files.",
      },
      {
        term: "Trojan",
        plain_name: "Catastrophic Implementation",
        meaning: "An implementation pattern that was once accepted but proven to be destructive or unstable.",
        deterministic_use:
          "Use this term for contained failures in the Inoculation Registry; do not use it for simple bugs.",
      },
      {
        term: "Script Inoculation Registry",
        plain_name: "The Exclusion Blacklist",
        meaning: "A registry of identified Trojans used to prevent repeat failures and train future agents.",
        deterministic_use:
          "Use it as a 'never-again' reference during script generation and code review.",
      },
    ],
    taxonomy: [
      {
        name: "Script Kind",
        allowed_values: ["Single Script", "Multi Script"],
        rule:
          "Every runnable Script Factory entry must have exactly one Script Kind.",
      },
      {
        name: "Surface",
        allowed_values: [
          "orchestration",
          "vscode-command",
          "npm",
          "http-endpoint",
          "request-type",
        ],
        rule:
          "Surface describes where the entry appears or how it is invoked. Request Type entries are categories, not runnable scripts.",
      },
      {
        name: "Input Points",
        allowed_values: ["Scripts", "User", "Agent", "Repo"],
        rule:
          "Input Points describe where information enters a script. Use only the allowed values.",
      },
      {
        name: "Exit Points",
        allowed_values: ["Scripts", "User", "Agent", "Repo"],
        rule:
          "Exit Points describe where a script sends results, effects, or messages. Use only the allowed values.",
      },
      {
        name: "Execution Status",
        allowed_values: ["off", "queued", "running", "completed", "failed", "blocked"],
        rule:
          "Status must come from script/process events or explicit state. UI colors are derived from status, not hand-picked.",
      },
      {
        name: "Factory Layer Label",
        allowed_values: factoryLayerLabels,
        rule:
          "Conceptual UI layer labels must come from this list. If a new layer label appears in a panel, add it here or rename it to an existing governed label.",
      },
      {
        name: "Registered Script Label",
        allowed_values: scriptFactoryEntries.map((entry) => entry.label),
        rule:
          "Script card labels must come from the Script Factory registry. Do not invent parallel names in UI panels, status messages, or generated context.",
      },
      {
        name: "Script Action Label",
        allowed_values: scriptActionLabels,
        rule:
          "Script action buttons must use these labels or a label from Registered Script Label. Add a new action label here before showing it in UI.",
      },
      {
        name: "Cockpit View Label",
        allowed_values: cockpitViewLabels,
        rule:
          "VS Code activity-bar and webview names must use these governed labels or be added here before package.json exposes them.",
      },
    ],
    fields: [
      {
        field: "script_id",
        required: true,
        meaning: "Stable machine identifier for a script entry.",
        rule:
          "Use lowercase dotted names. Do not rename casually because status, history, and relationships depend on it.",
      },
      {
        field: "label",
        required: true,
        meaning: "Human-readable card title.",
        rule:
          "Use plain English. Prefer action names such as Scan Codebase or REFER Orchestrator.",
      },
      {
        field: "surface",
        required: true,
        meaning: "Where the entry belongs or how it is invoked.",
        rule:
          "Use one allowed Surface value. Do not place category labels in Script Factory as runnable scripts.",
      },
      {
        field: "script_kind",
        required: true,
        meaning: "Whether the entry is one operation or a pipeline.",
        rule:
          "Required for runnable scripts. Omit only for non-runnable Request Type entries.",
      },
      {
        field: "entrypoint",
        required: true,
        meaning: "The command, function, route, or pipeline start used to enter this item.",
        rule:
          "Use enough detail that an agent can find the implementation or invocation.",
      },
      {
        field: "does",
        required: true,
        meaning: "One-sentence layperson description shown on the card.",
        rule:
          "Avoid implementation jargon. Say what the user gets from the script.",
      },
      {
        field: "detail",
        required: true,
        meaning: "Longer explanation shown in the detail popup.",
        rule:
          "Explain when to use it, what it reads, what it writes, and what happens next.",
      },
      {
        field: "input_points",
        required: true,
        meaning: "Allowed sources that feed the script.",
        rule:
          "Use only Scripts, User, Agent, Repo. Required for runnable scripts.",
      },
      {
        field: "exit_points",
        required: true,
        meaning: "Allowed destinations that receive script output or effects.",
        rule:
          "Use only Scripts, User, Agent, Repo. Required for runnable scripts.",
      },
      {
        field: "child_scripts",
        required: false,
        meaning: "Ordered child script IDs inside a Multi Script.",
        rule:
          "Required for Multi Script. Must list existing script IDs in execution or conceptual order.",
      },
    ],
    surface_rules: [
      {
        name: "orchestration",
        allowed_values: ["Single Script", "Multi Script"],
        rule:
          "Use for internal workflow scripts and pipelines such as @refer Chat Pipeline, REFER Orchestrator, Resolution Loop, Scan Codebase, and Script Legend.",
      },
      {
        name: "vscode-command",
        allowed_values: ["Single Script"],
        rule:
          "Use for command palette actions. They may call orchestration scripts but should be represented as command surfaces.",
      },
      {
        name: "npm",
        allowed_values: ["Single Script", "Multi Script"],
        rule:
          "Use for package.json scripts. Build/test commands are usually Single Script; server commands may be Multi Script if they compile then launch.",
      },
      {
        name: "http-endpoint",
        allowed_values: ["Single Script"],
        rule:
          "Use for local server routes. Endpoints are callable surfaces and may feed orchestration scripts.",
      },
      {
        name: "request-type",
        allowed_values: ["category label"],
        rule:
          "Use only for how work enters REFER. It is not a runnable script and must not show script_kind.",
      },
    ],
    status_transitions: [
      {
        from: "off",
        to: ["queued", "running"],
        rule: "A script with no recent event starts gray/off and may move to queued or running.",
      },
      {
        from: "queued",
        to: ["running", "blocked", "failed"],
        rule: "Queued means waiting for a resource, model, user, or script. It must resolve to running or a terminal problem.",
      },
      {
        from: "running",
        to: ["completed", "failed", "blocked"],
        rule: "Running must end in completed, failed, or blocked.",
      },
      {
        from: "blocked",
        to: ["queued", "running", "failed"],
        rule: "Blocked may resume after missing information or configuration is supplied.",
      },
      {
        from: "failed",
        to: ["queued", "running"],
        rule: "Failed may only move by starting a new run or retry.",
      },
      {
        from: "completed",
        to: ["queued", "running"],
        rule: "Completed is terminal for that run; a new run starts a new transition.",
      },
    ],
    artifacts: [
      {
        path: ".refer-factory/codebase-tree.json",
        owner: "Scan Codebase",
        meaning: "Machine-readable repository map.",
        freshness_rule:
          "Refresh when relevant files are added, deleted, or modified, or when scan schema changes.",
      },
      {
        path: ".refer-factory/agent-context.md",
        owner: "Scan Codebase",
        meaning: "Compact briefing for agents/local LLMs.",
        freshness_rule:
          "Regenerate with the treefile and include the Script Legend as terminology authority.",
      },
      {
        path: ".refer-factory/script-legend.md",
        owner: "Script Legend",
        meaning: "Deterministic terminology and rules for script work.",
        freshness_rule:
          "Regenerate when terms, taxonomy, status rules, or script fields change.",
      },
      {
        path: ".refer-factory/process-state.json",
        owner: "Process Events",
        meaning: "Recent process events used for status lights and Latest Process inspection.",
        freshness_rule:
          "Append events during runs; collapse into bounded recent history.",
      },
      {
        path: ".refer-factory/factory-gaps.json",
        owner: "Scan Factory Gaps",
        meaning: "Machine-readable report of terminology, registry, command, artifact, status, and self-healing gaps.",
        freshness_rule:
          "Refresh after doctrine, registry, command, scanner, status, or UI changes.",
      },
      {
        path: ".refer-factory/scriptographer-report.json",
        owner: "Scriptographer",
        meaning: "Machine-readable report of discovered names, classifications, and ratification status.",
        freshness_rule:
          "Refresh before adding or renaming labels, scripts, UI surfaces, or terminology.",
      },
      {
        path: ".refer-factory/context-packs/<id>.json",
        owner: "Context Picker",
        meaning: "Prompt-specific context package for a model/agent.",
        freshness_rule:
          "Build per request. Do not reuse if prompt, treefile, or selected files changed.",
      },
    ],
    authority_order: [
      "User explicit instruction in the current turn",
      "Repository source code and package.json",
      "Script Legend",
      "Script Registry",
      "Generated codebase tree and agent context",
      "Historical chat/process records",
    ],
    examples: [
      {
        title: "Multi Script Entry",
        body:
          "A valid Multi Script has script_kind = Multi Script and child_scripts = [refer.chat.participant, refer.orchestrate.chat, refer.resolution.loop].",
      },
      {
        title: "Single Script Entry",
        body:
          "A valid Single Script has one primary job, such as Scan Codebase, and lists input_points and exit_points without child_scripts.",
      },
      {
        title: "Request Type Entry",
        body:
          "A valid Request Type describes how work enters REFER, such as @refer Chat Request, and does not pretend to be runnable.",
      },
      {
        title: "Deterministic Chain",
        body:
          "User Prompt -> @refer Participant -> REFER Orchestrator -> Context Picker -> Resolution Loop -> Model -> Chat History.",
      },
    ],
    graph_symbols: [
      {
        term: "A -> B",
        plain_name: "Calls or Feeds",
        meaning: "Script or request A sends control or data to B.",
        deterministic_use:
          "Use this arrow for direct handoff only. Avoid it for vague association.",
      },
      {
        term: "User",
        plain_name: "Human Operator",
        meaning: "A person using VS Code, command palette, chat, or a local tool.",
        deterministic_use:
          "Use User only for human-originated input or human-visible output.",
      },
      {
        term: "Agent",
        plain_name: "Model or Assistant",
        meaning: "The local/cloud LLM or assistant process participating in work.",
        deterministic_use:
          "Use Agent for model-facing prompts, context packs, and model responses.",
      },
      {
        term: "Repo",
        plain_name: "Filesystem or Codebase",
        meaning: "Files, folders, generated artifacts, and project state.",
        deterministic_use:
          "Use Repo when a script reads, writes, scans, or mutates the workspace.",
      },
      {
        term: "Scripts",
        plain_name: "Other Script Entries",
        meaning: "Another registered script, command, endpoint, or pipeline.",
        deterministic_use:
          "Use Scripts when a script calls or returns data to another script surface.",
      },
    ],
    deterministic_rules: [
      "Prefer plain-English labels in UI and keep branded terms as secondary or internal vocabulary.",
      "A Multi Script must list child_scripts; a Single Script must not pretend to be a pipeline.",
      "Request Type entries are category labels and must not be treated as runnable scripts.",
      "Status lights must derive from status data: off is gray, queued/running is yellow, completed is green, failed/blocked is red.",
      "Input Points and Exit Points must use only Scripts, User, Agent, and Repo.",
      "The Context Picker builds prompt packages; it does not replace the Orchestrator.",
      "The Scanner builds inventory artifacts; it does not decide final answers.",
      "The Orchestrator owns the run order and calls supporting scripts.",
      "The Script Legend is authoritative when terms conflict in UI text, registry text, or agent prompts.",
      "Generated agent context should cite this legend instead of redefining terminology ad hoc.",
      "Every resolved turn should ask what was missing, ambiguous, or manually inferred and repair the right factory layer.",
    ],
  };
}

export function renderScriptLegendMarkdown(
  legend = createScriptLegend(),
): string {
  return `# ${legend.title}

${legend.purpose}

## Dictionary
${legend.terms.map(renderTerm).join("\n\n")}

## Taxonomy
${legend.taxonomy
  .map(
    (category) =>
      `### ${category.name}
- Allowed values: ${category.allowed_values.join(", ")}
- Rule: ${category.rule}`,
  )
  .join("\n\n")}

## Field Definitions
${legend.fields
  .map(
    (field) =>
      `### ${field.field}
- Required: ${field.required ? "yes" : "no"}
- Meaning: ${field.meaning}
- Rule: ${field.rule}`,
  )
  .join("\n\n")}

## Surface Rules
${legend.surface_rules
  .map(
    (surface) =>
      `### ${surface.name}
- Allowed kinds: ${surface.allowed_values.join(", ")}
- Rule: ${surface.rule}`,
  )
  .join("\n\n")}

## Status Transitions
${legend.status_transitions
  .map(
    (transition) =>
      `### ${transition.from}
- May move to: ${transition.to.join(", ")}
- Rule: ${transition.rule}`,
  )
  .join("\n\n")}

## Artifacts
${legend.artifacts
  .map(
    (artifact) =>
      `### ${artifact.path}
- Owner: ${artifact.owner}
- Meaning: ${artifact.meaning}
- Freshness rule: ${artifact.freshness_rule}`,
  )
  .join("\n\n")}

## Authority Order
${legend.authority_order.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## Examples
${legend.examples
  .map((example) => `### ${example.title}\n${example.body}`)
  .join("\n\n")}

## Relationship Map Symbols
${legend.graph_symbols.map(renderTerm).join("\n\n")}

## Deterministic Rules
${legend.deterministic_rules.map((rule) => `- ${rule}`).join("\n")}
`;
}

export function writeScriptLegend(workspaceRoot: string): string {
  const target = scriptLegendPath(workspaceRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${renderScriptLegendMarkdown()}\n`, "utf8");
  return target;
}

function renderTerm(term: ScriptLegendTerm): string {
  return `### ${term.term}
- Plain English: ${term.plain_name}
- Meaning: ${term.meaning}
- Deterministic use: ${term.deterministic_use}`;
}
