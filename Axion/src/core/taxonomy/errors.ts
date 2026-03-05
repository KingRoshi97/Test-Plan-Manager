import * as fs from "fs";
import * as path from "path";

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

const ERROR_CODE_PATTERN = /^ERR-[A-Z][A-Z0-9_]+-\d{3}$/;

const KNOWN_DOMAINS = [
  "INT",
  "GATE",
  "STD",
  "TMP",
  "KIT",
  "PLAN",
  "CAN",
  "SCAN",
  "REF",
  "COV",
  "DIFF",
  "REPRO",
  "REL",
  "CACHE",
  "CAS",
  "POL",
  "TAX",
  "SYS",
] as const;

export type ErrorDomain = (typeof KNOWN_DOMAINS)[number];

const SEVERITY_ORDER: Record<ErrorCode["severity"], number> = {
  critical: 0,
  error: 1,
  warning: 2,
  info: 3,
};

export function validateErrorCode(code: string): boolean {
  return ERROR_CODE_PATTERN.test(code);
}

export function extractDomain(code: string): string | null {
  if (!validateErrorCode(code)) return null;
  const parts = code.split("-");
  return parts.slice(1, -1).join("-");
}

export function loadErrorRegistry(registryPath: string): ErrorRegistry {
  const resolvedPath = path.resolve(registryPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `ERR-TAX-001: Error registry file not found: ${resolvedPath}`,
    );
  }

  let raw: string;
  try {
    raw = fs.readFileSync(resolvedPath, "utf-8");
  } catch (err) {
    throw new Error(
      `ERR-TAX-002: Failed to read error registry file: ${(err as Error).message}`,
    );
  }

  let parsed: { version?: string; entries?: unknown[] };
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `ERR-TAX-003: Error registry file is not valid JSON: ${(err as Error).message}`,
    );
  }

  if (typeof parsed.version !== "string") {
    throw new Error(
      "ERR-TAX-004: Error registry missing required 'version' field",
    );
  }

  if (!Array.isArray(parsed.entries)) {
    throw new Error(
      "ERR-TAX-005: Error registry missing required 'entries' array",
    );
  }

  const entries: ErrorCode[] = [];
  const by_code: Record<string, ErrorCode> = {};
  const by_domain: Record<string, ErrorCode[]> = {};
  const seenCodes = new Set<string>();

  for (const entry of parsed.entries) {
    const e = entry as Record<string, unknown>;
    const code = e.code as string;

    if (!code || typeof code !== "string") {
      throw new Error(
        "ERR-TAX-006: Error entry missing required 'code' field",
      );
    }

    if (!validateErrorCode(code)) {
      throw new Error(
        `ERR-TAX-007: Invalid error code format '${code}', expected ERR-DOMAIN-NNN`,
      );
    }

    if (seenCodes.has(code)) {
      throw new Error(`ERR-TAX-008: Duplicate error code '${code}'`);
    }
    seenCodes.add(code);

    const severity = e.severity as ErrorCode["severity"];
    if (!["critical", "error", "warning", "info"].includes(severity)) {
      throw new Error(
        `ERR-TAX-009: Invalid severity '${severity}' for code '${code}'`,
      );
    }

    const errorCode: ErrorCode = {
      code,
      domain: (e.domain as string) || extractDomain(code) || "UNKNOWN",
      severity,
      retryable: Boolean(e.retryable),
      message_template: (e.message_template as string) || "",
      action: (e.action as string) || "",
      docs_ref: (e.docs_ref as string) || undefined,
    };

    entries.push(errorCode);
    by_code[code] = errorCode;

    if (!by_domain[errorCode.domain]) {
      by_domain[errorCode.domain] = [];
    }
    by_domain[errorCode.domain].push(errorCode);
  }

  return {
    version: parsed.version,
    entries,
    by_code,
    by_domain,
  };
}

export function lookupErrorCode(
  code: string,
  registry: ErrorRegistry,
): ErrorCode | undefined {
  return registry.by_code[code];
}

export function listDomains(registry: ErrorRegistry): string[] {
  return Object.keys(registry.by_domain).sort();
}

export function listByDomain(
  domain: string,
  registry: ErrorRegistry,
): ErrorCode[] {
  return registry.by_domain[domain] || [];
}

export function listBySeverity(
  severity: ErrorCode["severity"],
  registry: ErrorRegistry,
): ErrorCode[] {
  return registry.entries.filter((e) => e.severity === severity);
}

export function compareSeverity(
  a: ErrorCode["severity"],
  b: ErrorCode["severity"],
): number {
  return SEVERITY_ORDER[a] - SEVERITY_ORDER[b];
}

export function createInMemoryRegistry(
  entries: ErrorCode[],
  version: string = "1.0.0",
): ErrorRegistry {
  const by_code: Record<string, ErrorCode> = {};
  const by_domain: Record<string, ErrorCode[]> = {};
  const seenCodes = new Set<string>();

  for (const entry of entries) {
    if (seenCodes.has(entry.code)) {
      throw new Error(`ERR-TAX-008: Duplicate error code '${entry.code}'`);
    }
    seenCodes.add(entry.code);

    by_code[entry.code] = entry;
    if (!by_domain[entry.domain]) {
      by_domain[entry.domain] = [];
    }
    by_domain[entry.domain].push(entry);
  }

  return { version, entries: [...entries], by_code, by_domain };
}
