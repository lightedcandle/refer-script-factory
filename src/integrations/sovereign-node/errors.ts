export type SovereignNodeReadErrorCode =
  | "NODE_CONFIG_INVALID"
  | "NODE_UNAVAILABLE"
  | "NODE_TIMEOUT"
  | "NODE_PROTOCOL_MISMATCH"
  | "NODE_SCHEMA_MISMATCH"
  | "NODE_LEDGER_INVALID"
  | "NODE_NOT_FOUND";

export class SovereignNodeReadError extends Error {
  constructor(
    readonly code: SovereignNodeReadErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "SovereignNodeReadError";
  }
}

export function isSovereignNodeReadError(
  value: unknown,
): value is SovereignNodeReadError {
  return value instanceof SovereignNodeReadError;
}
