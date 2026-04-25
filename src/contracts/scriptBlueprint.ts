export type ScriptBlueprintNodeKind =
  | "chat_intake"
  | "contract_interrogatory"
  | "send_contract"
  | "registry_lookup"
  | "script_execution"
  | "correction_contract"
  | "interpreter"
  | "artifact_emission"
  | "verification"
  | "registration";

export interface ScriptBlueprintNode {
  id: string;
  kind: ScriptBlueprintNodeKind;
  title: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  owner: "assistant" | "planner" | "factory" | "engine" | "interpreter" | "qc";
}

export interface ScriptBlueprintEdge {
  from: string;
  to: string;
  condition: string;
  packet: string;
}

export interface ScriptBlueprint {
  blueprint_id: string;
  title: string;
  governing_refs: string[];
  doctrine: string[];
  nodes: ScriptBlueprintNode[];
  edges: ScriptBlueprintEdge[];
  correction_path: string[];
  terminal_outputs: string[];
}

export function createScriptBlueprint(): ScriptBlueprint {
  return {
    blueprint_id: "REFER-SCRIPT-BLUEPRINT-001",
    title: "Chat Intent to Script Factory Blueprint",
    governing_refs: [
      "REFER.OS/refer.plan.md",
      "REFER.OS/refer.factory.md",
      "REFER.OS/refer.engine.md",
      "REFER.OS/refer.efficiency.md",
      "REFER.OS/refer.qc.md",
    ],
    doctrine: [
      "Conversation remains intake, not the execution engine.",
      "The assistant asks for or derives a Send Contract before factory execution.",
      "Known transformations run through existing scripts, interpreters, compilers, or registered routes.",
      "Missing routes produce a correction contract or machinery gap instead of ad hoc repeated code generation.",
      "Every script route declares inputs, outputs, guards, and verification.",
      "Portable script packets use JSON so framework adapters can translate the same inputs into Angular, React, Node, or generic repo operations.",
    ],
    nodes: [
      {
        id: "user_chat_intent",
        kind: "chat_intake",
        title: "User Chat Intent",
        purpose: "Capture natural language intent without mutating the repo.",
        inputs: ["operator prompt", "active workspace context"],
        outputs: ["intent summary", "open questions"],
        owner: "assistant",
      },
      {
        id: "contract_interrogatory",
        kind: "contract_interrogatory",
        title: "Contract Interrogatory",
        purpose: "Ask only for missing contract fields needed to make execution bounded.",
        inputs: ["intent summary", "governing refs", "workspace registry"],
        outputs: ["resolved scope", "target paths", "acceptance checks"],
        owner: "planner",
      },
      {
        id: "send_contract",
        kind: "send_contract",
        title: "Send Contract",
        purpose: "Compress approved intent into a machine-oriented execution packet.",
        inputs: ["resolved scope", "target paths", "acceptance checks"],
        outputs: ["contract json", "station route"],
        owner: "planner",
      },
      {
        id: "script_registry_lookup",
        kind: "registry_lookup",
        title: "Script Registry Lookup",
        purpose: "Find an existing script, interpreter, compiler, or route before manual generation.",
        inputs: ["contract json", "adapter id", "codebase registry"],
        outputs: ["selected route", "route gap"],
        owner: "factory",
      },
      {
        id: "existing_script_execution",
        kind: "script_execution",
        title: "Existing Script Execution",
        purpose: "Run the selected route with explicit parameters and capture its packet output.",
        inputs: ["selected route", "contract json"],
        outputs: ["script packet", "generated artifacts", "execution log"],
        owner: "engine",
      },
      {
        id: "missing_route_correction",
        kind: "correction_contract",
        title: "Missing Route Correction",
        purpose: "Emit the missing machinery request instead of pretending the route exists.",
        inputs: ["route gap", "contract json"],
        outputs: ["correction contract", "tooling gap note"],
        owner: "factory",
      },
      {
        id: "target_interpreter",
        kind: "interpreter",
        title: "Target Interpreter",
        purpose: "Translate portable script output into framework/repo-specific files.",
        inputs: ["script packet json", "adapter contract", "local anchors"],
        outputs: ["file operations json", "dependency changes json"],
        owner: "interpreter",
      },
      {
        id: "artifact_emission",
        kind: "artifact_emission",
        title: "Artifact Emission",
        purpose: "Write or preview the derived artifacts within the authorized target paths.",
        inputs: ["file operations", "allowed mutations"],
        outputs: ["changed files", "blocked writes"],
        owner: "engine",
      },
      {
        id: "verification",
        kind: "verification",
        title: "Verification",
        purpose: "Run the contract's checks and compare output to acceptance criteria.",
        inputs: ["changed files", "verification commands", "acceptance checks"],
        outputs: ["verification result", "return packet"],
        owner: "qc",
      },
      {
        id: "route_registration",
        kind: "registration",
        title: "Route Registration",
        purpose: "Record successful repeatable routes so future work uses machinery first.",
        inputs: ["return packet", "script metadata"],
        outputs: ["registry update", "process event"],
        owner: "factory",
      },
    ],
    edges: [
      {
        from: "user_chat_intent",
        to: "contract_interrogatory",
        condition: "intent is actionable but contract fields are incomplete",
        packet: "intent summary",
      },
      {
        from: "contract_interrogatory",
        to: "send_contract",
        condition: "scope, targets, and checks are resolved",
        packet: "resolved contract fields",
      },
      {
        from: "send_contract",
        to: "script_registry_lookup",
        condition: "contract is ready for factory routing",
        packet: "contract json",
      },
      {
        from: "script_registry_lookup",
        to: "existing_script_execution",
        condition: "matching route exists",
        packet: "selected route",
      },
      {
        from: "script_registry_lookup",
        to: "missing_route_correction",
        condition: "no lawful route exists",
        packet: "route gap",
      },
      {
        from: "existing_script_execution",
        to: "target_interpreter",
        condition: "script emits portable packet",
        packet: "script packet",
      },
      {
        from: "target_interpreter",
        to: "artifact_emission",
        condition: "interpreter resolves local anchors",
        packet: "file operations",
      },
      {
        from: "artifact_emission",
        to: "verification",
        condition: "artifact writes or preview completes",
        packet: "changed files",
      },
      {
        from: "verification",
        to: "route_registration",
        condition: "verification passes and route is repeatable",
        packet: "return packet",
      },
    ],
    correction_path: [
      "Emit correction contract when required contract fields are missing.",
      "Emit tooling gap note when no route exists.",
      "Create or update script machinery under governed scope before using it repeatedly.",
      "Return to registry lookup after the route exists.",
    ],
    terminal_outputs: [
      "send contract",
      "selected route or correction contract",
      "script packet",
      "generated artifacts",
      "verification result",
      "registry/process event",
    ],
  };
}
