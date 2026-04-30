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

export interface ScriptLegendSequenceStep {
  rank: string;
  name: string;
  meaning: string;
  rule: string;
  sub_sequence?: ScriptLegendSequenceStep[];
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
  execution_sequence: ScriptLegendSequenceStep[];
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
        term: "Exploratory Build",
        plain_name: "First Working AI Build",
        meaning:
          "An authorized AI-led build used when no script exists yet for a valid intent.",
        deterministic_use:
          "Use it for the first solution pass only. It must produce evidence that can later be distilled and replayed.",
      },
      {
        term: "Build Trace",
        plain_name: "Working Path Record",
        meaning:
          "A durable record of the intent, changed artifacts, errors, fixes, checks, and evidence from an exploratory build.",
        deterministic_use:
          "Use it as the memory that lets the factory turn a successful AI build into a repeatable script.",
      },
      {
        term: "Script Distillation",
        plain_name: "Build-To-Script Conversion",
        meaning:
          "The process of extracting inputs, outputs, operations, checks, and status rules from a working build trace into a reusable script or forge.",
        deterministic_use:
          "Use it after a working build trace exists. Do not mark the script active until replay succeeds.",
      },
      {
        term: "Script Replay",
        plain_name: "Deterministic Re-run",
        meaning:
          "Running a distilled script from the original or equivalent intent to prove it produces the expected output without ad hoc AI rebuilding.",
        deterministic_use:
          "Use it as the determinism gate before registry promotion or ratification.",
      },
      {
        term: "Intended Effect",
        plain_name: "Expected Result",
        meaning:
          "The contract-declared output, side effect, or state change a script is supposed to produce.",
        deterministic_use:
          "Use it as the comparison target for script runs. A script is evaluated by whether its observed effect matches this contract.",
      },
      {
        term: "Observed Effect",
        plain_name: "Actual Result",
        meaning:
          "The output, side effect, or state change actually produced by a script run.",
        deterministic_use:
          "Use it only for evidence gathered from a run, fixture, receipt, talkback, or verification check.",
      },
      {
        term: "Effect Mismatch",
        plain_name: "Result Did Not Match",
        meaning:
          "A script run produced an observed effect that differs from the intended effect or crossed the allowed boundary.",
        deterministic_use:
          "Use it to enter the modification loop. Do not call the script bad; classify the mismatch and repair.",
      },
      {
        term: "Modification Loop",
        plain_name: "Repair And Rerun Loop",
        meaning:
          "The repeated process where the failure detector classifies an effect mismatch, a repair executor applies the smallest named repair, and the same contract reruns through the detector until functional, blocked, or superseded.",
        deterministic_use:
          "Use it whenever a script has not achieved its intended effect. The detector is the loop gate; repair executors consume detector flags and must return reruns to the detector before promotion.",
      },
      {
        term: "Functional Script",
        plain_name: "Effect Achieved",
        meaning:
          "A script that achieved the intended effect for the declared contract and passed the required checks.",
        deterministic_use:
          "Use it as an effect-state label after evidence proves the script achieved the contract; do not use it as a permanent guarantee for all future contracts.",
      },
      {
        term: "Kernel Law",
        plain_name: "Always-On Factory Rule",
        meaning:
          "A minimal shipped rule required for Smart Intake, Script Factory operation, deterministic routing, verification, or safe script execution.",
        deterministic_use:
          "Use it only for the factory's own operating rules. Do not put provider, domain, project, or user preferences in the kernel by default.",
      },
      {
        term: "Unscripted Law",
        plain_name: "Internal Rule Source State",
        meaning:
          "An internal storage state for a prose law, rule, preference, or method document before the factory compiles and verifies it.",
        deterministic_use:
          "Use this term in implementation and storage paths, not user prompts. Users provide rules naturally; Smart Intake routes them into doctrine compilation automatically.",
      },
      {
        term: "Natural Rule Intake",
        plain_name: "User Says The Rule Normally",
        meaning:
          "The user-facing behavior where a user uploads a document, writes a preference, corrects an output, or gives a rule in ordinary language.",
        deterministic_use:
          "Use it as the entry point for user laws. Do not require users to label rules as unscripted, dormant, domain, project, or user method.",
      },
      {
        term: "Doctrine Compiler",
        plain_name: "Rule-To-Script Generator",
        meaning:
          "The forge path that converts prose laws, uploaded rule documents, and prompted preferences into classified candidate scripts, validators, fixtures, and registry entries.",
        deterministic_use:
          "Invoke it automatically from Natural Rule Intake when a rule source needs to become categorized, tested, registered deterministic behavior.",
      },
      {
        term: "Active Rule Pack",
        plain_name: "Verified Applied Rules",
        meaning:
          "A registered set of scripts, validators, or resolvers that has passed fixtures and is allowed to affect future routing or generation.",
        deterministic_use:
          "Promote a rule pack to active only after classification, fixture checks, modification-loop repair if needed, and registry update.",
      },
      {
        term: "User Method Law",
        plain_name: "Learned User Preference",
        meaning:
          "A user-scoped rule learned from uploaded documents, direct prompt instruction, dissatisfaction intake, or accepted repairs.",
        deterministic_use:
          "Compile it into scoped scripts or validators instead of making it a global shipped law.",
      },
      {
        term: "Execution Sequence",
        plain_name: "Ordered Governance Chain",
        meaning:
          "The canonical rank order for how factory rules, intake, resolvers, references, scripts, runs, evidence, repairs, and promotion are applied.",
        deterministic_use:
          "Use the sequence ranks when deciding what executes before what. Do not reorder steps by preference when a canonical rank applies.",
      },
      {
        term: "Sequence Rank",
        plain_name: "Deterministic Step Code",
        meaning:
          "A stable code such as SEQ-A or SEQ-F that names one layer in the execution sequence.",
        deterministic_use:
          "Use rank codes in registries, scriptionary entries, lineage packets, and docs so the hierarchy can be rebuilt from text.",
      },
      {
        term: "Sub-Sequence",
        plain_name: "Nested Deterministic Steps",
        meaning:
          "A stable nested rank such as SEQ-E.1 or SEQ-J.3 that describes ordered work inside a parent execution sequence layer.",
        deterministic_use:
          "Use sub-sequences when a main sequence step needs deterministic internal branching, checks, or repair without creating a new top-level law.",
      },
      {
        term: "Conditional Chain Controller",
        plain_name: "Branch And Fork Manager",
        meaning:
          "The deterministic layer that decides whether a script chain continues, splits, forks, merges, modifies, deletes, skips, blocks, or promotes.",
        deterministic_use:
          "Use it after a condition is measured, never as guesswork. Every split or mutation must record the condition, chosen branch, affected scripts, and evidence.",
      },
      {
        term: "Chain Fork",
        plain_name: "Parallel Deterministic Split",
        meaning:
          "A script chain splits into two or more bounded branches that can run in parallel because their read, write, and lock surfaces do not collide.",
        deterministic_use:
          "Use it only when the sequencer or collision guard proves the branches can run independently.",
      },
      {
        term: "Chain Merge",
        plain_name: "Branch Rejoin",
        meaning:
          "A deterministic point where forked or conditional branches rejoin into one evidence packet, effect comparison, or promotion decision.",
        deterministic_use:
          "Use it after every fork unless a branch is explicitly blocked, deleted, or superseded.",
      },
      {
        term: "Chain Delete",
        plain_name: "Remove Script Link",
        meaning:
          "A governed operation that removes a script, branch, route, or candidate from a chain because it is superseded, unsafe, duplicate, or out of scope.",
        deterministic_use:
          "Use delete only with recorded reason, affected surfaces, rollback or archive path, and registry update.",
      },
      {
        term: "Method Name",
        plain_name: "Named Way Of Working",
        meaning:
          "A stable name for a repeatable way a user, project, domain, forge, or factory prefers to perform work.",
        deterministic_use:
          "Name a method before encoding it. A method can become a strategy, script, validator, or active rule pack after evidence proves its effect.",
      },
      {
        term: "Strategy Name",
        plain_name: "Named Plan Pattern",
        meaning:
          "A stable name for a reusable plan that coordinates methods, scripts, sequence ranks, and checks to reach an intended effect.",
        deterministic_use:
          "Use strategy names to coordinate multi-step behavior. A strategy must state its sequence ranks, activation trigger, and success evidence.",
      },
      {
        term: "Text Map Blueprint",
        plain_name: "Rebuildable System Description",
        meaning:
          "A scriptionary and legend form detailed enough for a future factory to reconstruct terms, hierarchy, sequence, methods, strategies, and activation rules from text.",
        deterministic_use:
          "Use it as the goal for dictionary entries: every new term should name its layer, sequence position, activation rule, and evidence path when applicable.",
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
        name: "Sequence Rank",
        allowed_values: [
          "SEQ-A",
          "SEQ-B",
          "SEQ-C",
          "SEQ-D",
          "SEQ-E",
          "SEQ-F",
          "SEQ-G",
          "SEQ-H",
          "SEQ-I",
          "SEQ-J",
          "SEQ-K",
          "SEQ-L",
        ],
        rule:
          "Execution hierarchy must use these stable ranks. Add a new rank only when a new layer cannot fit an existing rank.",
      },
      {
        name: "Conditional Chain Action",
        allowed_values: [
          "continue",
          "branch",
          "fork",
          "merge",
          "modify",
          "delete",
          "skip",
          "block",
          "supersede",
          "promote",
        ],
        rule:
          "Conditional chain actions must be selected from measured state and recorded with evidence. Forks require non-colliding surfaces; deletes require archive or rollback path.",
      },
      {
        name: "Named Pattern Kind",
        allowed_values: ["Method", "Strategy", "Script", "Validator", "Resolver", "Rule Pack"],
        rule:
          "Every named pattern must declare its kind before it is registered, compiled, or used in orchestration.",
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
      {
        path: "refer-zo-bootstrap/datasets/build-traces/records/<id>.json",
        owner: "Zo Build Trace",
        meaning:
          "Durable evidence from an authorized Zo AI exploratory build before script distillation.",
        freshness_rule:
          "Write after an exploratory build and update through distillation, replay, and ratification.",
      },
    ],
    execution_sequence: [
      {
        rank: "SEQ-A",
        name: "Kernel Governance",
        meaning:
          "Always-on Script Factory and Smart Intake rules that make the system deterministic and safe.",
        rule:
          "Kernel rules execute before user, project, provider, or domain rules.",
      },
      {
        rank: "SEQ-B",
        name: "Request Intake",
        meaning:
          "The user prompt, document, command, or API request is converted into a compact contract.",
        rule:
          "No downstream script should run until the request has a contract or a documented block.",
      },
      {
        rank: "SEQ-C",
        name: "Clarification Resolver",
        meaning:
          "Ambiguity is reduced with bounded choices or a deterministic route.",
        rule:
          "Clarify before researching, building, or mutating when target, intent, or boundary is ambiguous.",
      },
      {
        rank: "SEQ-D",
        name: "Authority And Context",
        meaning:
          "The factory gathers official references, local context, active rule packs, and user method scope.",
        rule:
          "Domain work must prefer authoritative references and recorded local context over memory.",
      },
      {
        rank: "SEQ-E",
        name: "Strategy Selection",
        meaning:
          "The sequencer chooses the named strategy, method, forge, and script route.",
        rule:
          "Strategies must state their activation trigger, sequence ranks, and success evidence.",
        sub_sequence: [
          {
            rank: "SEQ-E.1",
            name: "Condition Read",
            meaning:
              "Read the contract, registry, active rule packs, locks, and evidence needed to choose a route.",
            rule:
              "Conditions must come from measured input or durable artifacts, not speculation.",
          },
          {
            rank: "SEQ-E.2",
            name: "Chain Decision",
            meaning:
              "Choose continue, branch, fork, merge, modify, delete, skip, block, supersede, or promote.",
            rule:
              "Every decision records the condition, selected action, rejected alternatives when relevant, and evidence.",
          },
          {
            rank: "SEQ-E.3",
            name: "Collision Check",
            meaning:
              "Compare read, write, and lock surfaces before allowing parallel branches.",
            rule:
              "Fork only when surfaces do not collide; otherwise serialize or block.",
          },
        ],
      },
      {
        rank: "SEQ-F",
        name: "Forge Or Script Generation",
        meaning:
          "Missing deterministic behavior is generated or modified as a candidate forge, script, resolver, validator, or rule pack.",
        rule:
          "Generated candidates remain inactive until fixtures and effect checks pass.",
      },
      {
        rank: "SEQ-G",
        name: "Script Execution",
        meaning:
          "The selected registered script or candidate script runs against the contract.",
        rule:
          "Script execution must record process status and declared intended effect.",
      },
      {
        rank: "SEQ-H",
        name: "Evidence Capture",
        meaning:
          "The run records observed effect, changed artifacts, checks, receipts, and talkback when available.",
        rule:
          "Evidence must be durable enough to explain the outcome after chat context is gone.",
      },
      {
        rank: "SEQ-I",
        name: "Effect Comparison",
        meaning:
          "Observed effect is compared with intended effect and allowed boundary.",
        rule:
          "Classify as functional, mismatched, blocked, superseded, or unverified.",
      },
      {
        rank: "SEQ-J",
        name: "Modification Loop",
        meaning:
          "The failure detector flags the responsible layer; repair executors apply that repair and rerun the same contract back through the detector.",
        rule:
          "The detector is the automatic loop gate: functional may continue, mismatched repairs and reruns, blocked waits for missing inputs, and superseded points to the new owner.",
        sub_sequence: [
          {
            rank: "SEQ-J.1",
            name: "Mismatch Classifier",
            meaning:
              "Classify the mismatch as contract, resolver, script, forge, schema, fixture, authority, environment, boundary, or user-method mismatch.",
            rule:
              "The classifier chooses the smallest responsible repair layer.",
          },
          {
            rank: "SEQ-J.2",
            name: "Repair Action",
            meaning:
              "Modify, delete, replace, regenerate, or block the affected script chain element.",
            rule:
              "Repair actions must preserve rollback or archive evidence for destructive changes.",
          },
          {
            rank: "SEQ-J.3",
            name: "Replay Gate",
            meaning:
              "Rerun the same contract after repair through the failure detector and compare the observed effect again.",
            rule:
              "Do not promote until replay or fixtures prove the intended effect.",
          },
        ],
      },
      {
        rank: "SEQ-K",
        name: "Promotion And Registration",
        meaning:
          "Verified scripts, methods, strategies, or rule packs are registered as active in their declared scope.",
        rule:
          "Promotion requires evidence, scope, registry update, and replay or fixture success.",
      },
      {
        rank: "SEQ-L",
        name: "Scriptionary Refresh",
        meaning:
          "New terms, sequence changes, methods, strategies, and artifacts are written back to the text map blueprint.",
        rule:
          "The scriptionary must be refreshed when the factory learns a reusable name or hierarchy rule.",
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
      {
        title: "Execution Sequence Rank",
        body:
          "A script that fetches Stripe docs belongs at SEQ-D Authority And Context before a checkout builder runs at SEQ-G Script Execution.",
      },
      {
        title: "Named Strategy",
        body:
          "Strategy Name = Clarify Then Build; sequence = SEQ-B -> SEQ-C -> SEQ-D -> SEQ-E -> SEQ-G -> SEQ-I; evidence = bounded resolver plus passing checks.",
      },
      {
        title: "Conditional Fork",
        body:
          "SEQ-E.2 action = fork only after SEQ-E.3 proves branch A writes docs/* and branch B reads src/* with no shared lock.",
      },
      {
        title: "Modification Delete",
        body:
          "SEQ-J.2 action = delete when a candidate script is superseded; archive the candidate, update registry state, then rerun SEQ-J.3 replay.",
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
      "A script-gap draft is a launch point for authorized exploratory build, build trace, script distillation, replay, and ratification; it is not a terminal state.",
      "AI may build the first working solution inside an approved intent contract; deterministic guarantees apply to the distilled script replay.",
      "A script is not good or bad; it is compared against its intended effect and classified as functional, mismatched, blocked, or superseded for that contract.",
      "The failure detector is the modification-loop gate: it classifies the gap, flags the repair layer, and every repair rerun returns through the detector until functional, blocked, or superseded.",
      "Every resolved turn should ask what was missing, ambiguous, or manually inferred and repair the right factory layer.",
      "Execution Sequence ranks are canonical; use SEQ-A through SEQ-L to decide hierarchy before choosing a script route.",
      "Sub-sequences use dotted ranks such as SEQ-E.1 and must stay inside their parent sequence layer.",
      "Conditional chain actions are deterministic control decisions: continue, branch, fork, merge, modify, delete, skip, block, supersede, or promote.",
      "Forked script chains require collision checks before parallel execution and a merge point before final effect comparison unless blocked or superseded.",
      "Delete is a governed chain action, not an ad hoc removal; record reason, affected surfaces, archive or rollback path, and registry update.",
      "Methods and strategies must be named before they are registered so the scriptionary can rebuild the system from text.",
      "The scriptionary is a text map blueprint: it must capture terms, sequence ranks, activation triggers, evidence paths, and scope for reusable behavior.",
      "Users do not label laws as unscripted or dormant; Smart Intake captures natural rule input and the factory internally compiles, categorizes, tests, and registers it.",
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

## Execution Sequence
${legend.execution_sequence
  .map(renderSequenceStep)
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

function renderSequenceStep(step: ScriptLegendSequenceStep): string {
  const subSequence = step.sub_sequence?.length
    ? `\n\n${step.sub_sequence
        .map(
          (subStep) =>
            `#### ${subStep.rank} ${subStep.name}
- Meaning: ${subStep.meaning}
- Rule: ${subStep.rule}`,
        )
        .join("\n\n")}`
    : "";
  return `### ${step.rank} ${step.name}
- Meaning: ${step.meaning}
- Rule: ${step.rule}${subSequence}`;
}
