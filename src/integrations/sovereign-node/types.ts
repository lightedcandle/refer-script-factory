export const sovereignNodeReadContractId =
  "refer-script-factory-node-read-v1" as const;

export const sovereignNodeReadTools = [
  "discover_node",
  "validate_workflow_ledger",
  "list_workflows",
  "get_workflow",
  "list_methods",
  "get_method",
] as const;

export type SovereignNodeReadTool = (typeof sovereignNodeReadTools)[number];

export interface WorkflowSummary {
  version: number;
  updated: string;
  scope: string;
  workflowCount: number;
  subflowCount: number;
  canonicalWorkflowIds: string[];
  statusCounts: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MethodSummary {
  version: number;
  updated: string;
  description: string;
  methodCount: number;
  categories: Record<string, unknown>;
  methodNames: string[];
  [key: string]: unknown;
}

export interface WorkflowEntry {
  id: string;
  title: string;
  status: string;
  entrypoints: string[];
  outcome: string;
  steps: string[];
  [key: string]: unknown;
}

export interface SubflowEntry {
  id: string;
  title: string;
  outcome: string;
  steps: string[];
  [key: string]: unknown;
}

export interface MethodEntry {
  method_id: string;
  method_name: string;
  category: string;
  repo: string;
  status: string;
  purpose: string;
  when_to_use: string;
  steps: string[];
  verification: string[];
  [key: string]: unknown;
}

export interface DiscoverNodeResponse {
  repoRoot: string;
  kind: "sovereign-node";
  summary: string;
  hasNodeDocs: boolean;
  hasMcpDocs: boolean;
  composeServiceNames: string[];
  workflowLedger: {
    exists: true;
    path: string;
    summary: WorkflowSummary;
    [key: string]: unknown;
  };
  methodBank: {
    exists: true;
    path: string;
    summary: MethodSummary;
    [key: string]: unknown;
  };
  services: Record<string, unknown>[];
  agentSurfaces: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ValidateWorkflowLedgerResponse {
  exists: true;
  path: string;
  ok: boolean;
  issues: string[];
  summary: WorkflowSummary;
  [key: string]: unknown;
}

export interface ListWorkflowsResponse {
  exists: true;
  path: string;
  summary: WorkflowSummary;
  workflows: WorkflowEntry[];
  subflows: SubflowEntry[];
  [key: string]: unknown;
}

export interface GetWorkflowResponse {
  exists: true;
  path: string;
  workflowId: string;
  entry: WorkflowEntry | SubflowEntry | null;
  [key: string]: unknown;
}

export interface ListMethodsResponse {
  exists: true;
  path: string;
  summary: MethodSummary;
  methods: MethodEntry[];
  [key: string]: unknown;
}

export interface GetMethodResponse {
  exists: true;
  path: string;
  methodId: string;
  entry: MethodEntry | null;
  [key: string]: unknown;
}

export interface SovereignNodeReadClient {
  discover(): Promise<DiscoverNodeResponse>;
  validateWorkflowLedger(): Promise<ValidateWorkflowLedgerResponse>;
  listWorkflows(): Promise<ListWorkflowsResponse>;
  getWorkflow(id: string): Promise<GetWorkflowResponse>;
  listMethods(): Promise<ListMethodsResponse>;
  getMethod(idOrAlias: string): Promise<GetMethodResponse>;
  close(): Promise<void>;
}
