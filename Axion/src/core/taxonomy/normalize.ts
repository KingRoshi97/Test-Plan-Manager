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

export function formatErrorMessage(
  template: string,
  params: Record<string, unknown>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(String(value ?? ""));
  }
  return result;
}

export function normalizeError(
  error: unknown,
  errorDef: ErrorCode,
  context?: Record<string, unknown>,
): NormalizedError {
  const ctx = context ?? {};

  const rawMessage = extractMessage(error);
  const templateParams: Record<string, unknown> = {
    ...ctx,
    raw_message: rawMessage,
  };
  const message = errorDef.message_template
    ? formatErrorMessage(errorDef.message_template, templateParams)
    : rawMessage;

  return {
    code: errorDef.code,
    domain: errorDef.domain,
    severity: errorDef.severity,
    message,
    timestamp: new Date().toISOString(),
    context: sanitizeContext(ctx),
    retryable: errorDef.retryable,
    action: errorDef.action,
  };
}

export function normalizeUnknownError(
  error: unknown,
  domain: string = "SYS",
  context?: Record<string, unknown>,
): NormalizedError {
  const rawMessage = extractMessage(error);
  const ctx = context ?? {};

  return {
    code: `ERR-${domain}-000`,
    domain,
    severity: "error",
    message: rawMessage,
    timestamp: new Date().toISOString(),
    context: sanitizeContext(ctx),
    retryable: false,
    action: "Investigate unclassified error. Consider adding to error registry.",
  };
}

function extractMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error !== null && typeof error === "object" && "message" in error) {
    return String((error as Record<string, unknown>).message);
  }
  return String(error);
}

function sanitizeContext(
  context: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (value instanceof Error) {
      sanitized[key] = { message: value.message, name: value.name };
    } else if (typeof value === "function") {
      continue;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function isNormalizedError(value: unknown): value is NormalizedError {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.code === "string" &&
    typeof obj.domain === "string" &&
    typeof obj.severity === "string" &&
    typeof obj.message === "string" &&
    typeof obj.timestamp === "string" &&
    typeof obj.retryable === "boolean" &&
    typeof obj.action === "string" &&
    obj.context !== null &&
    typeof obj.context === "object"
  );
}
