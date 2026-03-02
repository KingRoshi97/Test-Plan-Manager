import { NotImplementedError } from "../../utils/errors.js";

export interface ErrorCode {
  code: string;
  domain: string;
  severity: "critical" | "error" | "warning" | "info";
  retryable: boolean;
  message_template: string;
  action: string;
  docs_ref?: string;
}

export interface ErrorRegistry {
  version: string;
  entries: ErrorCode[];
  by_code: Record<string, ErrorCode>;
  by_domain: Record<string, ErrorCode[]>;
}

export function loadErrorRegistry(_registryPath: string): ErrorRegistry {
  throw new NotImplementedError("loadErrorRegistry");
}

export function lookupErrorCode(_code: string, _registry: ErrorRegistry): ErrorCode | undefined {
  throw new NotImplementedError("lookupErrorCode");
}

export function validateErrorCode(_code: string): boolean {
  throw new NotImplementedError("validateErrorCode");
}
