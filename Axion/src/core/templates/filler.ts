import type { SelectedTemplate } from "./selector.js";
import { renderTemplate, scanUnresolvedPlaceholders, countPlaceholders } from "./renderer.js";
import { isoNow } from "../../utils/time.js";

export interface FillContext {
  spec: unknown;
  standards: unknown;
  work: unknown;
  acceptance: unknown;
  submission_id: string;
  spec_id: string;
  standards_id: string;
}

export interface FilledTemplate {
  template_id: string;
  template_version: string;
  filled_at: string;
  output_path: string;
  content: string;
  placeholders_resolved: number;
  placeholders_unknown: number;
  unknowns: Array<{
    placeholder: string;
    status: "UNKNOWN_ALLOWED" | "BLOCKED";
  }>;
}

export type PlaceholderSyntax =
  | { type: "direct"; path: string }
  | { type: "array"; path: string }
  | { type: "derived"; name: string; args: string[] }
  | { type: "optional"; path: string }
  | { type: "unknown_allowed"; path: string };

export function parsePlaceholder(raw: string): PlaceholderSyntax {
  const trimmed = raw.trim();
  if (trimmed.startsWith("?")) {
    return { type: "optional", path: trimmed.slice(1).trim() };
  }
  if (trimmed.startsWith("~")) {
    return { type: "unknown_allowed", path: trimmed.slice(1).trim() };
  }
  if (trimmed.includes("[]")) {
    return { type: "array", path: trimmed.replace("[]", "") };
  }
  if (trimmed.includes("(")) {
    const match = trimmed.match(/^(\w+)\((.+)\)$/);
    if (match) {
      return { type: "derived", name: match[1], args: match[2].split(",").map((a) => a.trim()) };
    }
  }
  return { type: "direct", path: trimmed };
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

export function resolvePlaceholder(syntax: PlaceholderSyntax, context: FillContext): unknown {
  const flatContext: Record<string, unknown> = {
    spec: context.spec,
    standards: context.standards,
    work: context.work,
    acceptance: context.acceptance,
    submission_id: context.submission_id,
    spec_id: context.spec_id,
    standards_id: context.standards_id,
  };

  switch (syntax.type) {
    case "direct": {
      const { found, value } = resolveDottedPath(flatContext, syntax.path);
      return found ? value : undefined;
    }
    case "optional": {
      const { found, value } = resolveDottedPath(flatContext, syntax.path);
      return found ? value : "";
    }
    case "unknown_allowed": {
      const { found, value } = resolveDottedPath(flatContext, syntax.path);
      return found ? value : "[UNKNOWN]";
    }
    case "array": {
      const { found, value } = resolveDottedPath(flatContext, syntax.path);
      if (found && Array.isArray(value)) {
        return value.join(", ");
      }
      return undefined;
    }
    case "derived": {
      return `[derived:${syntax.name}]`;
    }
  }
}

export function fillTemplate(templateEntry: SelectedTemplate, templateContent: string, context: FillContext): FilledTemplate {
  const flatContext = buildFillContext(context);
  const totalPlaceholders = countPlaceholders(templateContent);
  const rendered = renderTemplate(templateContent, flatContext);
  const unresolved = scanUnresolvedPlaceholders(rendered);

  const unknowns = unresolved.map((u) => ({
    placeholder: u.key,
    status: "BLOCKED" as const,
  }));

  return {
    template_id: templateEntry.template_id,
    template_version: templateEntry.template_version,
    filled_at: isoNow(),
    output_path: templateEntry.output_path,
    content: rendered,
    placeholders_resolved: totalPlaceholders - unresolved.length,
    placeholders_unknown: unresolved.length,
    unknowns,
  };
}

function buildFillContext(context: FillContext): Record<string, unknown> {
  const result: Record<string, unknown> = {
    submission_id: context.submission_id,
    spec_id: context.spec_id,
    standards_id: context.standards_id,
  };

  if (context.spec && typeof context.spec === "object") {
    result["spec"] = context.spec;
    const spec = context.spec as Record<string, unknown>;
    for (const [key, value] of Object.entries(spec)) {
      result[key] = value;
    }
  }

  if (context.standards && typeof context.standards === "object") {
    result["standards"] = context.standards;
  }

  if (context.work && typeof context.work === "object") {
    result["work"] = context.work;
  }

  if (context.acceptance && typeof context.acceptance === "object") {
    result["acceptance"] = context.acceptance;
  }

  return result;
}
