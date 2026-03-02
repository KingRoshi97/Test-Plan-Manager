import { NotImplementedError } from "../../utils/errors.js";
import type { TemplateEntry } from "./selector.js";

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

export function parsePlaceholder(_raw: string): PlaceholderSyntax {
  throw new NotImplementedError("parsePlaceholder");
}

export function resolvePlaceholder(_syntax: PlaceholderSyntax, _context: FillContext): unknown {
  throw new NotImplementedError("resolvePlaceholder");
}

export function fillTemplate(_templateEntry: TemplateEntry, _templateContent: string, _context: FillContext): FilledTemplate {
  throw new NotImplementedError("fillTemplate");
}
