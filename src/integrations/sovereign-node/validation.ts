import { SovereignNodeReadError } from "./errors";
import type {
  DiscoverNodeResponse,
  GetMethodResponse,
  GetWorkflowResponse,
  ListMethodsResponse,
  ListWorkflowsResponse,
  MethodEntry,
  MethodSummary,
  SubflowEntry,
  ValidateWorkflowLedgerResponse,
  WorkflowEntry,
  WorkflowSummary,
} from "./types";

type JsonRecord = Record<string, unknown>;

function schemaFailure(location: string, expectation: string): never {
  throw new SovereignNodeReadError(
    "NODE_SCHEMA_MISMATCH",
    `Sovereign Node returned an incompatible ${location}; expected ${expectation}.`,
  );
}

function record(value: unknown, location: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    schemaFailure(location, "an object");
  }
  return value as JsonRecord;
}

function nonEmptyString(value: unknown, location: string): string {
  if (typeof value !== "string" || value.length === 0) {
    schemaFailure(location, "a non-empty string");
  }
  return value;
}

function boolean(value: unknown, location: string): boolean {
  if (typeof value !== "boolean") {
    schemaFailure(location, "a boolean");
  }
  return value;
}

function integer(value: unknown, location: string, minimum = 0): number {
  if (!Number.isInteger(value) || (value as number) < minimum) {
    schemaFailure(location, `an integer greater than or equal to ${minimum}`);
  }
  return value as number;
}

function array(value: unknown, location: string): unknown[] {
  if (!Array.isArray(value)) {
    schemaFailure(location, "an array");
  }
  return value;
}

function stringArray(
  value: unknown,
  location: string,
  minimumItems = 0,
): string[] {
  const values = array(value, location);
  if (values.length < minimumItems) {
    schemaFailure(location, `at least ${minimumItems} item(s)`);
  }
  return values.map((item, index) =>
    nonEmptyString(item, `${location}[${index}]`),
  );
}

function workflowSummary(value: unknown, location: string): WorkflowSummary {
  const input = record(value, location);
  integer(input.version, `${location}.version`, 1);
  nonEmptyString(input.updated, `${location}.updated`);
  nonEmptyString(input.scope, `${location}.scope`);
  integer(input.workflowCount, `${location}.workflowCount`);
  integer(input.subflowCount, `${location}.subflowCount`);
  stringArray(input.canonicalWorkflowIds, `${location}.canonicalWorkflowIds`);
  record(input.statusCounts, `${location}.statusCounts`);
  return input as WorkflowSummary;
}

function methodSummary(value: unknown, location: string): MethodSummary {
  const input = record(value, location);
  integer(input.version, `${location}.version`, 1);
  nonEmptyString(input.updated, `${location}.updated`);
  nonEmptyString(input.description, `${location}.description`);
  integer(input.methodCount, `${location}.methodCount`);
  record(input.categories, `${location}.categories`);
  stringArray(input.methodNames, `${location}.methodNames`);
  return input as MethodSummary;
}

function workflowEntry(value: unknown, location: string): WorkflowEntry {
  const input = record(value, location);
  nonEmptyString(input.id, `${location}.id`);
  nonEmptyString(input.title, `${location}.title`);
  nonEmptyString(input.status, `${location}.status`);
  stringArray(input.entrypoints, `${location}.entrypoints`);
  nonEmptyString(input.outcome, `${location}.outcome`);
  stringArray(input.steps, `${location}.steps`, 1);
  return input as WorkflowEntry;
}

function subflowEntry(value: unknown, location: string): SubflowEntry {
  const input = record(value, location);
  nonEmptyString(input.id, `${location}.id`);
  nonEmptyString(input.title, `${location}.title`);
  nonEmptyString(input.outcome, `${location}.outcome`);
  stringArray(input.steps, `${location}.steps`, 1);
  return input as SubflowEntry;
}

function methodEntry(value: unknown, location: string): MethodEntry {
  const input = record(value, location);
  for (const key of [
    "method_id",
    "method_name",
    "category",
    "repo",
    "status",
    "purpose",
    "when_to_use",
  ]) {
    nonEmptyString(input[key], `${location}.${key}`);
  }
  stringArray(input.steps, `${location}.steps`, 1);
  stringArray(input.verification, `${location}.verification`, 1);
  return input as MethodEntry;
}

function existingSource(value: unknown, location: string): JsonRecord {
  const input = record(value, location);
  if (input.exists !== true) {
    schemaFailure(`${location}.exists`, "true");
  }
  nonEmptyString(input.path, `${location}.path`);
  return input;
}

export function validateDiscoverNodeResponse(
  value: unknown,
): DiscoverNodeResponse {
  const input = record(value, "discover_node response");
  nonEmptyString(input.repoRoot, "discover_node.repoRoot");
  if (input.kind !== "sovereign-node") {
    schemaFailure("discover_node.kind", '"sovereign-node"');
  }
  nonEmptyString(input.summary, "discover_node.summary");
  boolean(input.hasNodeDocs, "discover_node.hasNodeDocs");
  boolean(input.hasMcpDocs, "discover_node.hasMcpDocs");
  stringArray(input.composeServiceNames, "discover_node.composeServiceNames");
  const ledger = existingSource(
    input.workflowLedger,
    "discover_node.workflowLedger",
  );
  workflowSummary(ledger.summary, "discover_node.workflowLedger.summary");
  const methods = existingSource(input.methodBank, "discover_node.methodBank");
  methodSummary(methods.summary, "discover_node.methodBank.summary");
  array(input.services, "discover_node.services").forEach((item, index) =>
    record(item, `discover_node.services[${index}]`),
  );
  record(input.agentSurfaces, "discover_node.agentSurfaces");
  return input as DiscoverNodeResponse;
}

export function validateWorkflowLedgerResponse(
  value: unknown,
): ValidateWorkflowLedgerResponse {
  const input = existingSource(value, "validate_workflow_ledger response");
  boolean(input.ok, "validate_workflow_ledger.ok");
  stringArray(input.issues, "validate_workflow_ledger.issues");
  workflowSummary(input.summary, "validate_workflow_ledger.summary");
  return input as ValidateWorkflowLedgerResponse;
}

export function validateListWorkflowsResponse(
  value: unknown,
): ListWorkflowsResponse {
  const input = existingSource(value, "list_workflows response");
  workflowSummary(input.summary, "list_workflows.summary");
  array(input.workflows, "list_workflows.workflows").forEach((item, index) =>
    workflowEntry(item, `list_workflows.workflows[${index}]`),
  );
  array(input.subflows, "list_workflows.subflows").forEach((item, index) =>
    subflowEntry(item, `list_workflows.subflows[${index}]`),
  );
  return input as ListWorkflowsResponse;
}

export function validateGetWorkflowResponse(
  value: unknown,
  requestedId: string,
): GetWorkflowResponse {
  const input = existingSource(value, "get_workflow response");
  const returnedId = nonEmptyString(input.workflowId, "get_workflow.workflowId");
  if (returnedId !== requestedId) {
    schemaFailure("get_workflow.workflowId", `the requested id ${requestedId}`);
  }
  if (input.entry !== null) {
    const entry = record(input.entry, "get_workflow.entry");
    if ("status" in entry || "entrypoints" in entry) {
      workflowEntry(entry, "get_workflow.entry");
    } else {
      subflowEntry(entry, "get_workflow.entry");
    }
  }
  return input as GetWorkflowResponse;
}

export function validateListMethodsResponse(
  value: unknown,
): ListMethodsResponse {
  const input = existingSource(value, "list_methods response");
  methodSummary(input.summary, "list_methods.summary");
  array(input.methods, "list_methods.methods").forEach((item, index) =>
    methodEntry(item, `list_methods.methods[${index}]`),
  );
  return input as ListMethodsResponse;
}

export function validateGetMethodResponse(
  value: unknown,
  requestedId: string,
): GetMethodResponse {
  const input = existingSource(value, "get_method response");
  const returnedId = nonEmptyString(input.methodId, "get_method.methodId");
  if (returnedId !== requestedId) {
    schemaFailure("get_method.methodId", `the requested id ${requestedId}`);
  }
  if (input.entry !== null) {
    methodEntry(input.entry, "get_method.entry");
  }
  return input as GetMethodResponse;
}
