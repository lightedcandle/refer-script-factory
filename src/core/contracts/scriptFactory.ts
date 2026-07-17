export interface ScriptFactoryEntry {
  script_id: string;
  label: string;
  surface:
    | "orchestration"
    | "vscode-command"
    | "npm"
    | "http-endpoint"
    | "request-type";
  entrypoint: string;
  does: string;
  detail: string;
  script_kind?: "Single Script" | "Multi Script";
  input_points?: ScriptPoint[];
  exit_points?: ScriptPoint[];
  child_scripts?: string[];
}

export type ScriptPoint = "Scripts" | "User" | "Agent" | "Repo";

const baseScriptFactoryEntries: ScriptFactoryEntry[] = [
  {
    script_id: "request.type.chat",
    label: "@refer Chat Request",
    surface: "request-type",
    entrypoint: "Interactive Host",
    does: "A user asks REFER for help from an interactive host.",
    detail:
      "This is the host-neutral human-facing request type. A host adapter receives the message and hands the intake record to the REFER Orchestrator script.",
  },
  {
    script_id: "request.type.http",
    label: "HTTP Request",
    surface: "request-type",
    entrypoint: "POST /refer/chat",
    does: "An HTTP host adapter sends REFER a prompt through the local server.",
    detail:
      "A local app or script sends a prompt to the REFER server, and the HTTP host adapter forwards an intake record to the REFER Orchestrator script.",
  },
  {
    script_id: "request.type.command",
    label: "Command Request",
    surface: "request-type",
    entrypoint: "Host Command",
    does: "A user starts a REFER action through an explicit host command.",
    detail:
      "This host-neutral request type covers explicit actions such as Initialize Repo, Check for Updates, or Refresh Codebases. A host adapter maps its command surface to the registered action.",
  },
  {
    script_id: "refer.chat.pipeline",
    label: "@refer Chat Pipeline",
    surface: "orchestration",
    entrypoint: "@refer Participant -> REFER Orchestrator -> Resolution Loop",
    does: "Receives your @refer message, runs the work pipeline, and saves the result.",
    detail:
      "This is the host-neutral interactive workflow bundled as one multi script. A host adapter hands an intake envelope to the orchestrator, the resolution loop uses a host-provided model, and an event/output sink receives the final result.",
    script_kind: "Multi Script",
    input_points: ["User", "Agent", "Scripts"],
    exit_points: ["User", "Agent", "Repo", "Scripts"],
    child_scripts: [
      "refer.chat.participant",
      "refer.orchestrate.chat",
      "refer.context.picker",
      "refer.resolution.loop",
    ],
  },
  {
    script_id: "refer.chat.participant",
    label: "Script Factory VS Code Chat Adapter",
    surface: "orchestration",
    entrypoint: "src/adapters/vscode/referParticipant.ts#registerReferChatParticipant",
    does: "Adapts native VS Code Chat messages to the Script Factory.",
    detail:
      "This adapter-specific entry connects the VS Code Chat box to REFER. It receives @refer messages, maintains legacy intake-session controls, shows progress, and hands intake records to the provider-neutral orchestration flow.",
  },
  {
    script_id: "refer.orchestrate.chat",
    label: "REFER Orchestrator",
    surface: "orchestration",
    entrypoint:
      "src/core/orchestration/referOrchestratorRunner.ts#runReferCoreOrchestratorPrompt",
    does: "Turns an interactive-host message into a tracked intake and saves the answer.",
    detail:
      "Use this when a host adapter sends a message to REFER. It saves an intake record, makes a compact intake envelope, sends bounded input to the host-provided model, tracks the steps, and sends the result to the configured event/output sink.",
  },
  {
    script_id: "refer.resolution.loop",
    label: "Resolution Loop",
    surface: "orchestration",
    entrypoint: "src/core/orchestration/referResolutionLoop.ts#runReferResolutionLoop",
    does: "Keeps asking the model until REFER has a clear final outcome.",
    detail:
      "This is the part that prevents a chat request from wandering forever. It checks each model answer and stops when the request is resolved, needs more information, needs a new script, is blocked, or failed for a clear reason.",
  },
  {
    script_id: "refer.context.picker",
    label: "Context Picker",
    surface: "orchestration",
    entrypoint: ".refer-factory/codebase-tree.json -> .refer-factory/context-packs/<id>.json",
    does: "Builds a compact context pack for one bounded request.",
    detail:
      "Use this when REFER needs to route a prompt through local context instead of sending the whole repo. It reads generated factory artifacts such as the codebase tree, agent context, script legend, and selected source anchors, then writes a prompt-specific context pack under .refer-factory/context-packs/.",
  },
  {
    script_id: "refer.scan.codebase",
    label: "Scan Codebase",
    surface: "orchestration",
    entrypoint: "src/adapters/vscode/commands/scanCodebase.ts#scanCodebaseCommand",
    does: "Builds a local map of the target workspace and emits the treefile.",
    detail:
      "Use this when REFER needs a fresh map of the target workspace. It scans useful source, test, config, docs, and resource files, writes .refer-factory/codebase-tree.json and .refer-factory/agent-context.md, then gives the treefile to the current event/output sink. The current VS Code adapter opens it in the editor.",
  },
  {
    script_id: "refer.script.legend",
    label: "Script Legend",
    surface: "orchestration",
    entrypoint: "src/core/contracts/scriptLegend.ts#createScriptLegend",
    does: "Defines the shared script terminology used by humans, agents, and local LLMs.",
    detail:
      "Use this as the meaning layer for deterministic script work. It explains terms like Single Script, Multi Script, Scriptograph, Scriptionary, Scriptonomy, status colors, input points, exit points, and relationship symbols.",
  },
  {
    script_id: "refer.scriptographer",
    label: "Scriptographer",
    surface: "orchestration",
    entrypoint: "src/contracts/scriptographer.ts#runScriptographer",
    does: "Discovers factory names and classifies whether they are ratified vocabulary.",
    detail:
      "Use this before adding new labels, scripts, or UI surfaces. It scans bounded factory sources, classifies candidate names against the Script Legend and Script Registry, writes .refer-factory/scriptographer-report.json, and leaves unratified names for the gap scanner to report.",
  },
  {
    script_id: "refer.scan.factoryGaps",
    label: "Scan Factory Gaps",
    surface: "orchestration",
    entrypoint:
      "src/adapters/vscode/commands/scanFactoryGaps.ts#scanFactoryGapsCommand",
    does: "Finds missing pieces in the Script Factory system.",
    detail:
      "Use this when REFER needs to inspect itself. It checks doctrine terms, registry entries, command contributions, generated artifacts, status mappings, and self-healing gaps, then writes .refer-factory/factory-gaps.json.",
  },
  {
    script_id: "refer.server.chat",
    label: "Server Chat Route",
    surface: "http-endpoint",
    entrypoint: "POST /refer/chat",
    does: "Lets another app send a prompt to REFER over HTTP.",
    detail:
      "Use this HTTP host adapter when another tool needs to ask REFER for work. It receives a prompt, chooses the target workspace, runs the same provider-neutral orchestration flow, and sends back a structured result.",
  },
  {
    script_id: "refer.server.health",
    label: "Server Health Route",
    surface: "http-endpoint",
    entrypoint: "GET /health",
    does: "Checks whether the local REFER server is running.",
    detail:
      "This is a quick status check. It tells you whether the server is alive, which workspace it is pointed at, which model provider it is using, and which server routes are available.",
  },
  {
    script_id: "refer.server.targets",
    label: "Server Targets Route",
    surface: "http-endpoint",
    entrypoint: "GET /refer/targets",
    does: "Shows which local workspaces the server can work on.",
    detail:
      "Use this before sending a server prompt when you have more than one project. It lists the local workspaces REFER knows about so the server can route the request to the right place.",
  },
  {
    script_id: "refer.initializeRepo",
    label: "Initialize Repo",
    surface: "vscode-command",
    entrypoint: "REFER: Initialize Repo",
    does: "Sets up REFER files in a repo after showing you what will change.",
    detail:
      "Use this when you want to add REFER governance to a project. It scans the workspace, shows a preview of files it would create or update, and only applies those changes after you confirm.",
  },
  {
    script_id: "refer.emitSendContract",
    label: "Emit Send Contract Planning Draft",
    surface: "vscode-command",
    entrypoint: "REFER: Emit Send Contract Planning Draft",
    does: "Opens a non-authorizing planning draft you can review or edit.",
    detail:
      "This creates a planning artifact that describes possible work, target scope, and verification. It does not authorize execution; only a separately ratified REFER Execution Contract does that.",
  },
  {
    script_id: "refer.emitScriptBlueprint",
    label: "Emit Script Blueprint",
    surface: "vscode-command",
    entrypoint: "REFER: Emit Script Blueprint",
    does: "Shows how a chat request can become a reusable script.",
    detail:
      "Use this when you want to understand or design the pipeline from a normal chat message to a repeatable automation. It opens a blueprint showing the stages REFER expects.",
  },
  {
    script_id: "refer.emitScriptDnaSeed",
    label: "Emit Script DNA Seed",
    surface: "vscode-command",
    entrypoint: "REFER: Emit Script DNA Seed",
    does: "Starts a new custom script definition.",
    detail:
      "Use this when a repeated task deserves its own script. It opens a starter template with the script name, expected inputs, expected outputs, rules it should follow, and checks it should pass.",
  },
  {
    script_id: "refer.refreshCodebases",
    label: "Refresh Codebases",
    surface: "vscode-command",
    entrypoint: "REFER: Refresh Codebases",
    does: "Updates REFER's map of the current repo.",
    detail:
      "Use this after files or folders change. It scans the workspace and updates REFER's local map of projects, subfolders, and code areas so future work can target the right place.",
  },
  {
    script_id: "refer.scanCodebase",
    label: "Scan Codebase",
    surface: "vscode-command",
    entrypoint: "REFER: Scan Codebase",
    does: "Runs the codebase scanner from the command palette.",
    detail:
      "Use this command to refresh REFER's codebase treefile and compact agent context file, then open the treefile in the normal VS Code editor.",
  },
  {
    script_id: "refer.viewCodebaseTree",
    label: "View Codebase Tree",
    surface: "vscode-command",
    entrypoint: "REFER: View Codebase Tree",
    does: "Opens the latest codebase treefile in VS Code.",
    detail:
      "Use this after a scan when you want to inspect .refer-factory/codebase-tree.json without running the scanner again.",
  },
  {
    script_id: "refer.scanFactoryGaps",
    label: "Scan Factory Gaps",
    surface: "vscode-command",
    entrypoint: "REFER: Scan Factory Gaps",
    does: "Runs the factory gap scanner from the command palette.",
    detail:
      "Use this command to check whether the Script Factory has missing terminology, missing registry entries, missing command contributions, missing generated artifacts, or unmapped statuses.",
  },
  {
    script_id: "refer.viewFactoryGaps",
    label: "View Factory Gaps",
    surface: "vscode-command",
    entrypoint: "REFER: View Factory Gaps",
    does: "Opens the latest factory gap report in VS Code.",
    detail:
      "Use this after a factory gap scan when you want to inspect .refer-factory/factory-gaps.json without running the scanner again.",
  },
  {
    script_id: "refer.runScriptographer",
    label: "Run Scriptographer",
    surface: "vscode-command",
    entrypoint: "REFER: Run Scriptographer",
    does: "Runs the vocabulary discovery and classification scan.",
    detail:
      "Use this command to discover candidate factory names, classify them against the Script Legend and Script Registry, and write .refer-factory/scriptographer-report.json.",
  },
  {
    script_id: "refer.viewScriptographerReport",
    label: "View Scriptographer Report",
    surface: "vscode-command",
    entrypoint: "REFER: View Scriptographer Report",
    does: "Opens the latest Scriptographer report in VS Code.",
    detail:
      "Use this after running Scriptographer when you want to inspect discovered names and ratification status without running the scanner again.",
  },
  {
    script_id: "refer.checkForUpdates",
    label: "Check For Updates",
    surface: "vscode-command",
    entrypoint: "REFER: Check for Updates",
    does: "Checks whether REFER has updates available.",
    detail:
      "Use this to see whether the dormant REFER reference library, scripts, or packaged files in this repo are behind the current update list. It reports what would need to change without applying anything.",
  },
  {
    script_id: "refer.applyUpdate",
    label: "Apply Update",
    surface: "vscode-command",
    entrypoint: "REFER: Apply Update",
    does: "Installs pending REFER updates after you approve them.",
    detail:
      "Use this after checking for updates. It asks for confirmation, backs up existing files, applies the listed updates, records the update state, and tells you if anything failed.",
  },
  {
    script_id: "refer.contractModeOn",
    label: "Legacy Intake Session On",
    surface: "vscode-command",
    entrypoint: "REFER: Legacy Intake Session On",
    does: "Keeps legacy intake-session tracking on for future host turns.",
    detail:
      "This compatibility command persists intake-session tracking for future @refer runtime sessions. It does not create, ratify, or authorize a REFER Execution Contract; the contractMode command ID remains only for compatibility.",
  },
  {
    script_id: "refer.contractModeOff",
    label: "Legacy Intake Session Off",
    surface: "vscode-command",
    entrypoint: "REFER: Legacy Intake Session Off",
    does: "Turns off persistent legacy intake-session tracking.",
    detail:
      "This compatibility command stops persistent legacy intake-session tracking. Individual runtime sessions may still use transient tracking, but neither state grants or ratifies a REFER Execution Contract.",
  },
  {
    script_id: "refer.contractModeToggle",
    label: "Toggle Legacy Intake Session",
    surface: "vscode-command",
    entrypoint: "REFER: Toggle Legacy Intake Session",
    does: "Switches persistent legacy intake-session tracking to the opposite state.",
    detail:
      "This compatibility command checks the current legacy intake-session setting and flips it. The UI state is runtime tracking, not a ratified REFER Execution Contract.",
  },
  {
    script_id: "npm.compile",
    label: "Compile",
    surface: "npm",
    entrypoint: "npm run compile",
    does: "Builds the current TypeScript project.",
    detail:
      "Use this after editing TypeScript. It checks the code for compile errors and writes the JavaScript output used by the current adapters into the dist folder.",
  },
  {
    script_id: "npm.compile.core",
    label: "Compile Core",
    surface: "npm",
    entrypoint: "npm run compile:core",
    does: "Compiles the provider-neutral core without editor-host ambient types.",
    detail:
      "Use this after changing src/core. It compiles only src/core through tsconfig.core.json with explicit Node types and no editor-host type loading.",
  },
  {
    script_id: "npm.verify.core-boundary",
    label: "Verify Core Boundary",
    surface: "npm",
    entrypoint: "npm run verify:core-boundary",
    does: "Rejects core imports that cross into host adapters or legacy host modules.",
    detail:
      "Use this whenever core or adapter imports change. It parses every TypeScript import under src/core and fails if a relative dependency escapes the core or loads vscode.",
  },
  {
    script_id: "npm.verify.core",
    label: "Verify Core",
    surface: "npm",
    entrypoint: "npm run verify:core",
    does: "Runs the core-only compile and deterministic boundary check together.",
    detail:
      "Use this as the focused provider-neutral core gate before the full extension regression suite.",
    child_scripts: ["npm.compile.core", "npm.verify.core-boundary"],
  },
  {
    script_id: "npm.test",
    label: "Test",
    surface: "npm",
    entrypoint: "npm run test",
    does: "Checks that the project still works after changes.",
    detail:
      "Use this before trusting a change. It builds the project and runs the full set of tests for metrics, process tracking, bootstrap, packets, orchestration, schemas, law documents, and updates.",
  },
  {
    script_id: "npm.verify",
    label: "Verify",
    surface: "npm",
    entrypoint: "npm run verify",
    does: "Runs the same full project check as npm test.",
    detail:
      "Use this as the standard verification command. Right now it simply runs the full test suite, so it is the same quality gate as npm test.",
  },
  {
    script_id: "refer.authority.resolve",
    label: "Authority Resolver",
    surface: "npm",
    entrypoint: "npm run authority:resolve -- --intent <intent>",
    does: "Finds the authority references that must govern a domain request.",
    detail:
      "Use this before generating or modifying domain scripts. It maps known domains such as Stripe, OpenAI, Cloudflare, and Script Factory work to official or local authority references, and creates a scoped experimental authority packet when no known authority exists.",
  },
  {
    script_id: "refer.doctrine.compile",
    label: "Doctrine Compiler",
    surface: "npm",
    entrypoint: "npm run doctrine:compile -- --rule <rule>",
    does: "Turns natural rule input into a candidate script or validator.",
    detail:
      "Use this after Smart Intake captures a user rule, document, correction, or preference. It classifies the rule internally, attaches authority lineage, extracts the invariant, creates fixtures, and writes a candidate packet without activating it until future checks and promotion pass.",
  },
  {
    script_id: "refer.scriptionary.term",
    label: "Scriptionary Term",
    surface: "npm",
    entrypoint: "npm run scriptionary:candidate -- --term <term>",
    does: "Captures or promotes new Script Factory vocabulary.",
    detail:
      "Use this when a new word, method, strategy, sequence rank, chain action, artifact, status, or system effect becomes reusable. Candidate mode records the term without mutating source. Promote mode inserts a vetted term into the Script Legend source so generated scriptionary output can rebuild the vocabulary.",
  },
  {
    script_id: "npm.refer.server",
    label: "REFER Server",
    surface: "npm",
    entrypoint: "npm run refer:server",
    does: "Runs the Script Factory through its current local HTTP adapter.",
    detail:
      "Use this when another tool or app needs to call REFER through HTTP. It builds the project and starts the local server so routes like /refer/chat can receive prompts.",
    child_scripts: [
      "npm.compile",
      "refer.server.health",
      "refer.server.targets",
      "refer.server.chat",
    ],
  },
];

export const scriptFactoryEntries: ScriptFactoryEntry[] =
  baseScriptFactoryEntries.map(withDefaultFlowMetadata);

function withDefaultFlowMetadata(entry: ScriptFactoryEntry): ScriptFactoryEntry {
  if (entry.surface === "request-type") {
    return entry;
  }

  if (entry.surface === "orchestration") {
    return {
      script_kind: "Single Script",
      input_points: ["User", "Agent", "Scripts"],
      exit_points: ["User", "Agent", "Repo", "Scripts"],
      ...entry,
    };
  }

  if (entry.surface === "npm") {
    return {
      script_kind: entry.script_id === "npm.refer.server" ? "Multi Script" : "Single Script",
      input_points: ["User", "Scripts", "Repo"],
      exit_points: ["User", "Repo", "Scripts"],
      ...entry,
    };
  }

  if (entry.surface === "vscode-command") {
    return {
      script_kind: "Single Script",
      input_points: ["User", "Repo"],
      exit_points: ["User", "Repo"],
      ...entry,
    };
  }

  return {
    script_kind: "Single Script",
    input_points: ["Scripts", "User"],
    exit_points: ["Scripts", "User"],
    ...entry,
  };
}
