export interface ReferCoachChecklistItem {
  id: string;
  title: string;
  purpose: string;
  evidence: string[];
  next_action: string;
}

export interface ReferCoachPlan {
  coach_id: "refer.coach.local-efficiency";
  title: string;
  target_outcome: string;
  checklist: ReferCoachChecklistItem[];
}

export function createReferCoachPlan(): ReferCoachPlan {
  return {
    coach_id: "refer.coach.local-efficiency",
    title: "REFER Local Efficiency Coach",
    target_outcome:
      "Help the user configure local LLMs, codebase hygiene, and REFER workflows so Codex/cloud models are used only when needed.",
    checklist: [
      {
        id: "coach.ollama",
        title: "Local model runtime",
        purpose: "Check whether Ollama or another local model runtime is installed.",
        evidence: ["ollama executable", "ollama list output", "model storage path"],
        next_action: "Recommend a small Qwen/Coder model before larger downloads.",
      },
      {
        id: "coach.providers",
        title: "Provider routing",
        purpose: "Map local and cloud models to REFER roles.",
        evidence: ["available local models", "models the interactive host offers"],
        next_action:
          "Assign local models to prompt wash and stronger models to code execution.",
      },
      {
        id: "coach.workspace",
        title: "Workspace readiness",
        purpose: "Confirm repo framework, package manager, tests, and target paths.",
        evidence: ["codebase registry", "package scripts", "adapter contract"],
        next_action: "Fill missing workspace metadata before contract execution.",
      },
      {
        id: "coach.usage",
        title: "REFER usage pattern",
        purpose: "Explain transient versus persistent legacy intake-session tracking.",
        evidence: ["legacy intake-session state", "runtime session records"],
        next_action:
          "Use @refer for on-demand runtime sessions and persistent tracking for focused intake; neither state grants execution authority.",
      },
    ],
  };
}
