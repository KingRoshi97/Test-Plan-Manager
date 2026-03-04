import { NotImplementedError } from "../../utils/errors.js";

export interface ValidationIssue {
  issue_id: string;
  severity: "error" | "warning";
  error_code: ValidationErrorCode;
  rule_id: string;
  field_path: string;
  message: string;
  meta?: Record<string, unknown>;
}

export type ValidationErrorCode =
  | "REQUIRED"
  | "DEPENDENCY_MISSING"
  | "MIN_ITEMS"
  | "INVALID_ENUM"
  | "INVALID_ENUM_FOR_CONTEXT"
  | "INVALID_FORMAT"
  | "INVALID_URL"
  | "INVALID_FILETYPE"
  | "INVALID_REFERENCE"
  | "DUPLICATE_VALUE"
  | "WARNING_INCOMPLETE";

export interface ValidationSummary {
  error_count: number;
  warning_count: number;
  blocking_rule_ids: string[];
}

export interface ValidationResult {
  submission_id: string;
  validated_at: string;
  is_valid: boolean;
  schema_version_used: string;
  form_version_used: string;
  ruleset_version_used: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: ValidationSummary;
}

export function validateIntake(_submission: unknown, _schemaVersion: string): ValidationResult {
  throw new NotImplementedError("validateIntake");
}
