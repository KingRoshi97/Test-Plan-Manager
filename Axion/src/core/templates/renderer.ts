const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export interface UnresolvedEntry {
  key: string;
  occurrences: number;
}

function resolveDottedPath(context: Record<string, unknown>, path: string): { found: boolean; value: unknown } {
  const parts = path.split(".");
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return { found: false, value: undefined };
    }
    const rec = current as Record<string, unknown>;
    if (!(part in rec)) {
      return { found: false, value: undefined };
    }
    current = rec[part];
  }
  return { found: true, value: current };
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

export function renderTemplate(content: string, context: Record<string, unknown>): string {
  return content.replace(PLACEHOLDER_RE, (match, key: string) => {
    const { found, value } = resolveDottedPath(context, key);
    if (found) {
      return stringifyValue(value);
    }
    return match;
  });
}

export function countPlaceholders(content: string): number {
  const matches = content.match(PLACEHOLDER_RE);
  return matches ? matches.length : 0;
}

export function scanUnresolvedPlaceholders(content: string): UnresolvedEntry[] {
  const counts = new Map<string, number>();
  let match: RegExpExecArray | null;
  const re = new RegExp(PLACEHOLDER_RE.source, "g");
  while ((match = re.exec(content)) !== null) {
    const key = match[1];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const entries: UnresolvedEntry[] = [];
  for (const [key, occurrences] of counts) {
    entries.push({ key, occurrences });
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));
  return entries;
}

export function buildAutoContext(
  templateContents: string[],
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const allKeys = new Set<string>();
  for (const content of templateContents) {
    let match: RegExpExecArray | null;
    const re = new RegExp(PLACEHOLDER_RE.source, "g");
    while ((match = re.exec(content)) !== null) {
      allKeys.add(match[1]);
    }
  }

  const context: Record<string, unknown> = {};
  for (const key of allKeys) {
    const parts = key.split(".");
    let current = context;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = "__AXION_VALUE__";
  }

  for (const [key, value] of Object.entries(overrides)) {
    const parts = key.split(".");
    let current = context;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  return context;
}

export function buildSpecContext(
  canonicalSpec: Record<string, unknown>,
  standardsSnapshot: Record<string, unknown>,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  const context: Record<string, unknown> = {};

  if (canonicalSpec) {
    for (const [key, value] of Object.entries(canonicalSpec)) {
      context[key] = value;
    }
    context["spec"] = canonicalSpec;
  }

  if (standardsSnapshot) {
    context["standards"] = standardsSnapshot;
    if (standardsSnapshot.resolved_standards_id) {
      context["standards_id"] = standardsSnapshot.resolved_standards_id;
    }
  }

  if (canonicalSpec.meta && typeof canonicalSpec.meta === "object") {
    const meta = canonicalSpec.meta as Record<string, unknown>;
    if (meta.spec_id) context["spec_id"] = meta.spec_id;
    if (meta.submission_id) context["submission_id"] = meta.submission_id;
  }

  for (const [key, value] of Object.entries(extra)) {
    context[key] = value;
  }

  return context;
}
