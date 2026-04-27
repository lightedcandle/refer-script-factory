export interface TrojanEntry {
  id: string;
  label: string;
  symptom: string;
  failure_mode: "Logic Loop" | "Data Leak" | "Semantic Drift" | "State Corruption" | "Infinite Recursion";
  containment_rule: string;
  lesson_learned: string;
}

export const scriptInoculationRegistry: TrojanEntry[] = [
  {
    id: "trojan.recursive-scan",
    label: "Unbounded Recursive Scanner",
    symptom: "VS Code hangs and memory usage spikes to 100%.",
    failure_mode: "Infinite Recursion",
    containment_rule: "Never allow a scanner to follow symlinks or recurse without a depth limit of 5.",
    lesson_learned: "Breadth-first scanning with a strict depth budget is the only safe way to map unknown subspaces.",
  },
  {
    id: "trojan.global-state-drift",
    label: "Shared Global State Store",
    symptom: "Random UI updates and unpredictable script behavior across different panels.",
    failure_mode: "State Corruption",
    containment_rule: "Enforce strict unidirectional data flow and isolate state to the specific Forge context.",
    lesson_learned: "Global state is a trojan for semantic consistency; deterministic scripts require immutable, local-first state.",
  }
];
