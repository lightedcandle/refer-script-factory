export type OrchestratorRoadmapStatus =
  | "scaffolded"
  | "available"
  | "integrated"
  | "deferred";

export interface OrchestratorRoadmapCapability {
  id: string;
  capability: string;
  status: OrchestratorRoadmapStatus;
  integrate_when_available: string;
  target_hook: string;
}

export interface OrchestratorRoadmap {
  schema_version: 1;
  capabilities: OrchestratorRoadmapCapability[];
}

export function createOrchestratorRoadmap(): OrchestratorRoadmap {
  return {
    schema_version: 1,
    capabilities: [
      {
        id: "ORCH-001",
        capability: "Stronger intent extraction",
        status: "scaffolded",
        integrate_when_available:
          "A deterministic extractor can derive task type, framework, target paths, risk, and missing fields from raw prompt text.",
        target_hook: "createReferIntakeRecord",
      },
      {
        id: "ORCH-002",
        capability: "Intake preview and execution-ratification boundary",
        status: "scaffolded",
        integrate_when_available:
          "An operator interface can show the intake envelope and planning artifact, then separately capture or hand off a ratified Execution Contract before execution.",
        target_hook: "interactive host and runtime session viewer",
      },
      {
        id: "ORCH-003",
        capability: "Script registry lookup",
        status: "scaffolded",
        integrate_when_available:
          "A registry file or service can map ratified Execution Contract intents to existing Script DNA routes.",
        target_hook: "needs_script and resolved_as_is paths",
      },
      {
        id: "ORCH-004",
        capability: "Script execution protocol",
        status: "scaffolded",
        integrate_when_available:
          "A safe runner can execute registered scripts with bounded inputs and return packets.",
        target_hook: "script_execution station",
      },
      {
        id: "ORCH-005",
        capability: "Adapter file-operation interpreters",
        status: "scaffolded",
        integrate_when_available:
          "Angular/React/Node/generic adapters can translate portable JSON operations into concrete file edits.",
        target_hook: "framework_operations packets",
      },
      {
        id: "ORCH-006",
        capability: "Response validation",
        status: "scaffolded",
        integrate_when_available:
          "A validator can check model/script output against schema, policy, target paths, and acceptance criteria.",
        target_hook: "post-model resolution envelope",
      },
      {
        id: "ORCH-007",
        capability: "Drill-down form mechanics",
        status: "scaffolded",
        integrate_when_available:
          "A host adapter can render missing fields through its operator interface; the current VS Code adapter may use Quick Pick, InputBox, or view controls.",
        target_hook: "needs_more_info terminal",
      },
      {
        id: "ORCH-008",
        capability: "Script creation workflow",
        status: "scaffolded",
        integrate_when_available:
          "needs_script can emit a Script DNA seed, register the gap, and prompt the user to approve script creation.",
        target_hook: "needs_script terminal",
      },
      {
        id: "ORCH-009",
        capability: "Process event logging for chat cycles",
        status: "scaffolded",
        integrate_when_available:
          "Intake, pass decisions, terminal states, and failures can be collapsed into .refer-factory/process-state.json.",
        target_hook: "every @refer pass",
      },
      {
        id: "ORCH-010",
        capability: "Sensitive-data guard for raw fallback",
        status: "scaffolded",
        integrate_when_available:
          "Raw prompt fallback can redact or refuse secrets before the second model pass.",
        target_hook: "scan_raw_input path",
      },
      {
        id: "ORCH-011",
        capability: "Token savings telemetry",
        status: "scaffolded",
        integrate_when_available:
          "The factory can estimate raw prompt tokens versus compact intake-envelope tokens and record savings.",
        target_hook: "intake and dashboard metrics",
      },
      {
        id: "ORCH-012",
        capability: "Resolution-rate telemetry",
        status: "scaffolded",
        integrate_when_available:
          "Terminal states can be counted over time to show resolved, needs-info, needs-script, blocked, and failed rates.",
        target_hook: "dashboard/process panel",
      },
      {
        id: "ORCH-013",
        capability: "REFER Coach",
        status: "scaffolded",
        integrate_when_available:
          "A coach mode can inspect local readiness and guide the user through Ollama/Qwen/provider setup, workspace hygiene, and REFER usage patterns.",
        target_hook: "@refer coach",
      },
    ],
  };
}
