import { NotImplementedError } from "../../utils/errors.js";
import type { FilledTemplate } from "./filler.js";

export interface CompletenessCheck {
  check_id: string;
  description: string;
  passed: boolean;
  details?: string;
}

export interface CompletenessResult {
  template_id: string;
  is_complete: boolean;
  checks: CompletenessCheck[];
  required_fields_populated: boolean;
  references_resolve: boolean;
  no_contradictions: boolean;
  unknowns_handled: boolean;
}

export function checkCompleteness(_filled: FilledTemplate, _spec: unknown): CompletenessResult {
  throw new NotImplementedError("checkCompleteness");
}

export function checkAllTemplates(_filledTemplates: FilledTemplate[], _spec: unknown): CompletenessResult[] {
  throw new NotImplementedError("checkAllTemplates");
}
