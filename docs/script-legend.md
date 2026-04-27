# Script Legend

Give humans, agents, and local LLMs one deterministic language for scripts, script relationships, statuses, and context flow.

## Dictionary
### Forge
- Plain English: Conversion Unit
- Meaning: One bounded unit that turns defined inputs into defined outputs.
- Deterministic use: Use Forge for a repeatable conversion unit. Do not use Factory when only one conversion unit is meant.

### Factory
- Plain English: Governed Forge Domain
- Meaning: A governance domain that coordinates multiple forges or manages governance around them.
- Deterministic use: Use Factory when the domain owns multiple forges or the rules around those forges; use Forge for one bounded conversion unit.

### Script Forge
- Plain English: Script Conversion Unit
- Meaning: A forge that performs one script-specific conversion.
- Deterministic use: Use it for a script that has inputs, transformation, outputs, status, and feedback.

### Factory System
- Plain English: Coordinated Factory Network
- Meaning: The complete network of factories across domains.
- Deterministic use: Use it for the whole body of coordinated factories, not for the Script Factory alone.

### Local-First Maturity
- Plain English: Less Remote Dependence
- Meaning: The process of making future turns resolvable from local scripts, context, artifacts, and local models.
- Deterministic use: Use it to decide what each chat turn should leave behind for the next similar turn.

### Self-Healing
- Plain English: Gap Repair
- Meaning: Detecting missing or ambiguous structure and turning it into governed scripts, context, tests, statuses, or doctrine.
- Deterministic use: Use it after each resolved turn to identify what was missing, ambiguous, or manually inferred.

### Script Factory
- Plain English: Script Governance System
- Meaning: The workspace and governance layer that creates, manages, and runs script forges.
- Deterministic use: Use this term for the whole script governance system, not for one script, one forge, or one card.

### Single Script
- Plain English: Single Operation
- Meaning: One bounded script entry that performs one main action.
- Deterministic use: A Single Script may call helpers, but it is presented as one direct operation.

### Multi Script
- Plain English: Script Pipeline
- Meaning: A bundled script entry made from ordered child scripts.
- Deterministic use: A Multi Script must list child_scripts in execution or conceptual order.

### Scriptionary
- Plain English: Script Dictionary
- Meaning: Definitions of script terms and vocabulary.
- Deterministic use: Use it to explain words; do not use it as the relationship map.

### Scriptograph
- Plain English: Script Relationship Map
- Meaning: A map of how scripts connect, call each other, and move data.
- Deterministic use: Use it to answer what calls what, what feeds what, and what output is produced.

### Scriptographer
- Plain English: Script Cartographer
- Meaning: The scanner/builder that maintains script maps and definitions.
- Deterministic use: Use it for the tool or process that creates scriptograph and scriptionary artifacts.

### Scriptonomy
- Plain English: Script Taxonomy
- Meaning: The classification blueprint for script kinds, surfaces, points, and status rules.
- Deterministic use: Use it for allowed categories and validation rules, not for prose definitions alone.

### Context Picker
- Plain English: Context Pack Builder
- Meaning: The script that selects relevant assets for a prompt-specific model package.
- Deterministic use: It chooses context; it does not answer the user by itself.

### Script Registry
- Plain English: Registered Script List
- Meaning: The source list of governed script entries and request categories.
- Deterministic use: Use it for registered entries from src/contracts/scriptFactory.ts, not for arbitrary UI group names.

### Script Registry Entries
- Plain English: Visible Registered Script List
- Meaning: The UI section that lists the current Script Factory registry entries.
- Deterministic use: Use it for the rendered list of registered entries; each row label must come from Registered Script Label.

### Request Intake
- Plain English: Request Entry Layer
- Meaning: The governed layer that classifies how work enters REFER.
- Deterministic use: Use it only for request-type entries such as chat, HTTP, or command requests.

### Runtime Entrypoints
- Plain English: Runnable Entry Paths
- Meaning: The governed layer for ways work starts running through REFER.
- Deterministic use: Use it for @refer chat, local HTTP, and explicit command starts that route into scripts.

### Command Surface
- Plain English: VS Code Command Layer
- Meaning: The governed layer for actions exposed through the VS Code Command Palette.
- Deterministic use: Use it for vscode-command entries and do not use Command Prompts as a competing label.

### HTTP Endpoint Surface
- Plain English: Local Server Route Layer
- Meaning: The governed layer for local HTTP routes that expose REFER to other tools.
- Deterministic use: Use it for http-endpoint entries and route labels such as Server Chat Route.

### Scanners
- Plain English: Inspection Scripts
- Meaning: Scripts that read local state and write durable factory context or gap artifacts.
- Deterministic use: Use it for scan scripts such as Scan Codebase and Scan Factory Gaps.

### Verification
- Plain English: Quality Gate
- Meaning: Checks that factory changes compile, pass tests, and satisfy acceptance criteria.
- Deterministic use: Use it for compile, test, verify, and contract acceptance checks.

### Process Events
- Plain English: Script Run Records
- Meaning: Structured records of queued, running, completed, failed, or blocked script work.
- Deterministic use: Use it as the source for status lights and latest-process details.

### Latest Process
- Plain English: Most Recent Script Run
- Meaning: The newest process event matched to a script entry.
- Deterministic use: Use it for status detail text sourced from process-state data; do not use it for guessed activity.

### Status Light
- Plain English: Process Status Indicator
- Meaning: A UI indicator derived from execution status, not a hand-authored color label.
- Deterministic use: Use it only when the color maps back to off, queued, running, completed, failed, or blocked.

### User Prompt
- Plain English: Human Request Text
- Meaning: The text submitted by the user through chat, HTTP, or a command-triggered flow.
- Deterministic use: Use it only for human-authored request input before it is converted into a contract or script packet.

### Model
- Plain English: LLM Runtime
- Meaning: The local or remote language model selected to process a bounded prompt.
- Deterministic use: Use Agent when referring to the participant role; use Model when referring to the runtime that produces completions.

### Chat History
- Plain English: Saved Chat Turns
- Meaning: Durable records of REFER chat requests, intermediate packets, and final answers.
- Deterministic use: Use it for .refer-factory/chat/sessions records and visible chat-history panels.

### Context Factory
- Plain English: Context Governance Factory
- Meaning: A future factory domain for creating, refreshing, and packaging local context assets.
- Deterministic use: Use it as a Factory System domain label, not as a Script Factory entry unless registered.

### Model Factory
- Plain English: Model Governance Factory
- Meaning: A future factory domain for local/cloud model routing and model capability policy.
- Deterministic use: Use it as a Factory System domain label, not as a Script Factory entry unless registered.

### Artifact Factory
- Plain English: Artifact Governance Factory
- Meaning: A future factory domain for generated files, packets, reports, and durable outputs.
- Deterministic use: Use it as a Factory System domain label, not as a Script Factory entry unless registered.

### Codebase Tree
- Plain English: Repository Map
- Meaning: A machine-readable index of useful files, folders, roles, imports, exports, and surfaces.
- Deterministic use: Use it for local lookup and context selection; do not send the entire tree to a model by default.

### Agent Context
- Plain English: Agent Briefing
- Meaning: A compact human/model-readable summary of the repo.
- Deterministic use: Use it as first-pass context before opening full source files.

## Taxonomy
### Script Kind
- Allowed values: Single Script, Multi Script
- Rule: Every runnable Script Factory entry must have exactly one Script Kind.

### Surface
- Allowed values: orchestration, vscode-command, npm, http-endpoint, request-type
- Rule: Surface describes where the entry appears or how it is invoked. Request Type entries are categories, not runnable scripts.

### Input Points
- Allowed values: Scripts, User, Agent, Repo
- Rule: Input Points describe where information enters a script. Use only the allowed values.

### Exit Points
- Allowed values: Scripts, User, Agent, Repo
- Rule: Exit Points describe where a script sends results, effects, or messages. Use only the allowed values.

### Execution Status
- Allowed values: off, queued, running, completed, failed, blocked
- Rule: Status must come from script/process events or explicit state. UI colors are derived from status, not hand-picked.

### Factory Layer Label
- Allowed values: Factory System, Factories, Factory, Forges, Map, Script Factory, Forge, Script Forge, Single Script, Multi Script, Script Creation Forges, Script Inspection Forges, Script Runtime Forges, Script Verification Forges, Request Intake, Runtime Entrypoints, Command Surface, HTTP Endpoint Surface, Scriptionary, Scriptonomy, Scriptograph, Scriptographer, Script Legend, Script Registry, Scanners, Verification, Context Factory, Model Factory, Artifact Factory
- Rule: Conceptual UI layer labels must come from this list. If a new layer label appears in a panel, add it here or rename it to an existing governed label.

### Registered Script Label
- Allowed values: @refer Chat Request, HTTP Request, Command Request, @refer Chat Pipeline, @refer Participant, REFER Orchestrator, Resolution Loop, Context Picker, Scan Codebase, Script Legend, Scriptographer, Scan Factory Gaps, Server Chat Route, Server Health Route, Server Targets Route, Initialize Repo, Emit Send Contract, Emit Script Blueprint, Emit Script DNA Seed, Refresh Codebases, Scan Codebase, View Codebase Tree, Scan Factory Gaps, View Factory Gaps, Run Scriptographer, View Scriptographer Report, Check For Updates, Apply Update, Contract Mode On, Contract Mode Off, Toggle Contract Mode, Compile, Test, Verify, REFER Server
- Rule: Script card labels must come from the Script Factory registry. Do not invent parallel names in UI panels, status messages, or generated context.

### Script Action Label
- Allowed values: Run Scan, View Treefile, Run Gap Scan, View Gap Report, Run Scriptographer, View Scriptographer Report
- Rule: Script action buttons must use these labels or a label from Registered Script Label. Add a new action label here before showing it in UI.

### Cockpit View Label
- Allowed values: REFER, Refer Library, Factory System, Dashboard, @Refer Chat History, Process, Bootstrap Library
- Rule: VS Code activity-bar and webview names must use these governed labels or be added here before package.json exposes them.

## Field Definitions
### script_id
- Required: yes
- Meaning: Stable machine identifier for a script entry.
- Rule: Use lowercase dotted names. Do not rename casually because status, history, and relationships depend on it.

### label
- Required: yes
- Meaning: Human-readable card title.
- Rule: Use plain English. Prefer action names such as Scan Codebase or REFER Orchestrator.

### surface
- Required: yes
- Meaning: Where the entry belongs or how it is invoked.
- Rule: Use one allowed Surface value. Do not place category labels in Script Factory as runnable scripts.

### script_kind
- Required: yes
- Meaning: Whether the entry is one operation or a pipeline.
- Rule: Required for runnable scripts. Omit only for non-runnable Request Type entries.

### entrypoint
- Required: yes
- Meaning: The command, function, route, or pipeline start used to enter this item.
- Rule: Use enough detail that an agent can find the implementation or invocation.

### does
- Required: yes
- Meaning: One-sentence layperson description shown on the card.
- Rule: Avoid implementation jargon. Say what the user gets from the script.

### detail
- Required: yes
- Meaning: Longer explanation shown in the detail popup.
- Rule: Explain when to use it, what it reads, what it writes, and what happens next.

### input_points
- Required: yes
- Meaning: Allowed sources that feed the script.
- Rule: Use only Scripts, User, Agent, Repo. Required for runnable scripts.

### exit_points
- Required: yes
- Meaning: Allowed destinations that receive script output or effects.
- Rule: Use only Scripts, User, Agent, Repo. Required for runnable scripts.

### child_scripts
- Required: no
- Meaning: Ordered child script IDs inside a Multi Script.
- Rule: Required for Multi Script. Must list existing script IDs in execution or conceptual order.

## Surface Rules
### orchestration
- Allowed kinds: Single Script, Multi Script
- Rule: Use for internal workflow scripts and pipelines such as @refer Chat Pipeline, REFER Orchestrator, Resolution Loop, Scan Codebase, and Script Legend.

### vscode-command
- Allowed kinds: Single Script
- Rule: Use for command palette actions. They may call orchestration scripts but should be represented as command surfaces.

### npm
- Allowed kinds: Single Script, Multi Script
- Rule: Use for package.json scripts. Build/test commands are usually Single Script; server commands may be Multi Script if they compile then launch.

### http-endpoint
- Allowed kinds: Single Script
- Rule: Use for local server routes. Endpoints are callable surfaces and may feed orchestration scripts.

### request-type
- Allowed kinds: category label
- Rule: Use only for how work enters REFER. It is not a runnable script and must not show script_kind.

## Status Transitions
### off
- May move to: queued, running
- Rule: A script with no recent event starts gray/off and may move to queued or running.

### queued
- May move to: running, blocked, failed
- Rule: Queued means waiting for a resource, model, user, or script. It must resolve to running or a terminal problem.

### running
- May move to: completed, failed, blocked
- Rule: Running must end in completed, failed, or blocked.

### blocked
- May move to: queued, running, failed
- Rule: Blocked may resume after missing information or configuration is supplied.

### failed
- May move to: queued, running
- Rule: Failed may only move by starting a new run or retry.

### completed
- May move to: queued, running
- Rule: Completed is terminal for that run; a new run starts a new transition.

## Artifacts
### .refer-factory/codebase-tree.json
- Owner: Scan Codebase
- Meaning: Machine-readable repository map.
- Freshness rule: Refresh when relevant files are added, deleted, or modified, or when scan schema changes.

### .refer-factory/agent-context.md
- Owner: Scan Codebase
- Meaning: Compact briefing for agents/local LLMs.
- Freshness rule: Regenerate with the treefile and include the Script Legend as terminology authority.

### .refer-factory/script-legend.md
- Owner: Script Legend
- Meaning: Deterministic terminology and rules for script work.
- Freshness rule: Regenerate when terms, taxonomy, status rules, or script fields change.

### .refer-factory/process-state.json
- Owner: Process Events
- Meaning: Recent process events used for status lights and Latest Process inspection.
- Freshness rule: Append events during runs; collapse into bounded recent history.

### .refer-factory/factory-gaps.json
- Owner: Scan Factory Gaps
- Meaning: Machine-readable report of terminology, registry, command, artifact, status, and self-healing gaps.
- Freshness rule: Refresh after doctrine, registry, command, scanner, status, or UI changes.

### .refer-factory/scriptographer-report.json
- Owner: Scriptographer
- Meaning: Machine-readable report of discovered names, classifications, and ratification status.
- Freshness rule: Refresh before adding or renaming labels, scripts, UI surfaces, or terminology.

### .refer-factory/context-packs/<id>.json
- Owner: Context Picker
- Meaning: Prompt-specific context package for a model/agent.
- Freshness rule: Build per request. Do not reuse if prompt, treefile, or selected files changed.

## Authority Order
1. User explicit instruction in the current turn
2. Repository source code and package.json
3. Script Legend
4. Script Registry
5. Generated codebase tree and agent context
6. Historical chat/process records

## Examples
### Multi Script Entry
A valid Multi Script has script_kind = Multi Script and child_scripts = [refer.chat.participant, refer.orchestrate.chat, refer.resolution.loop].

### Single Script Entry
A valid Single Script has one primary job, such as Scan Codebase, and lists input_points and exit_points without child_scripts.

### Request Type Entry
A valid Request Type describes how work enters REFER, such as @refer Chat Request, and does not pretend to be runnable.

### Deterministic Chain
User Prompt -> @refer Participant -> REFER Orchestrator -> Context Picker -> Resolution Loop -> Model -> Chat History.

## Relationship Map Symbols
### A -> B
- Plain English: Calls or Feeds
- Meaning: Script or request A sends control or data to B.
- Deterministic use: Use this arrow for direct handoff only. Avoid it for vague association.

### User
- Plain English: Human Operator
- Meaning: A person using VS Code, command palette, chat, or a local tool.
- Deterministic use: Use User only for human-originated input or human-visible output.

### Agent
- Plain English: Model or Assistant
- Meaning: The local/cloud LLM or assistant process participating in work.
- Deterministic use: Use Agent for model-facing prompts, context packs, and model responses.

### Repo
- Plain English: Filesystem or Codebase
- Meaning: Files, folders, generated artifacts, and project state.
- Deterministic use: Use Repo when a script reads, writes, scans, or mutates the workspace.

### Scripts
- Plain English: Other Script Entries
- Meaning: Another registered script, command, endpoint, or pipeline.
- Deterministic use: Use Scripts when a script calls or returns data to another script surface.

## Deterministic Rules
- Prefer plain-English labels in UI and keep branded terms as secondary or internal vocabulary.
- A Multi Script must list child_scripts; a Single Script must not pretend to be a pipeline.
- Request Type entries are category labels and must not be treated as runnable scripts.
- Status lights must derive from status data: off is gray, queued/running is yellow, completed is green, failed/blocked is red.
- Input Points and Exit Points must use only Scripts, User, Agent, and Repo.
- The Context Picker builds prompt packages; it does not replace the Orchestrator.
- The Scanner builds inventory artifacts; it does not decide final answers.
- The Orchestrator owns the run order and calls supporting scripts.
- The Script Legend is authoritative when terms conflict in UI text, registry text, or agent prompts.
- Generated agent context should cite this legend instead of redefining terminology ad hoc.
- Every resolved turn should ask what was missing, ambiguous, or manually inferred and repair the right factory layer.

