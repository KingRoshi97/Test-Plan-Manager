import { NotImplementedError } from "../../utils/errors.js";
import type { ExtractedRef } from "./extractor.js";

export interface RefResolutionResult {
  resolved: Array<{ ref: ExtractedRef; target_path: string }>;
  unresolved: Array<{ ref: ExtractedRef; error: string }>;
  all_valid: boolean;
}

export function resolveRefs(_refs: ExtractedRef[], _spec: unknown): RefResolutionResult {
  throw new NotImplementedError("resolveRefs");
}

export function validateRefIntegrity(_spec: unknown): RefResolutionResult {
  throw new NotImplementedError("validateRefIntegrity");
}
