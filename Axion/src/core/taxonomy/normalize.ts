import { NotImplementedError } from "../../utils/errors.js";
import type { ErrorCode } from "./errors.js";

export interface NormalizedError {
  code: string;
  domain: string;
  severity: string;
  message: string;
  timestamp: string;
  context: Record<string, unknown>;
  retryable: boolean;
  action: string;
}

export function normalizeError(_error: unknown, _errorDef: ErrorCode, _context?: Record<string, unknown>): NormalizedError {
  throw new NotImplementedError("normalizeError");
}

export function formatErrorMessage(_template: string, _params: Record<string, unknown>): string {
  throw new NotImplementedError("formatErrorMessage");
}
