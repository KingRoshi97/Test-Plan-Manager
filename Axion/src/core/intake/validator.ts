import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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

interface SchemaField {
  type: string;
  required?: boolean;
  min_length?: number;
  max_length?: number;
  min_items?: number;
  enum_ref?: string;
  format?: string;
  allowed_filetypes?: string[];
  must_be?: unknown;
  items?: SchemaField & { fields?: Record<string, SchemaField> };
  fields?: Record<string, SchemaField>;
}

interface SchemaSection {
  required: boolean;
  condition?: string;
  fields: Record<string, SchemaField>;
}

interface Schema {
  schema_version: string;
  sections: Record<string, SchemaSection>;
}

interface RuleEntry {
  rule_id: string;
  description: string;
  when: string;
  then: string;
  error_code: string;
  pointer_paths: string[];
  severity: string;
}

interface RulesFile {
  rules_version: string;
  rules: RuleEntry[];
}

interface EnumDef {
  values?: string[];
  values_by_category?: Record<string, string[]>;
}

interface EnumsFile {
  schema_version: string;
  enums: Record<string, EnumDef>;
}

function findLibrariesDir(): string {
  try {
    const thisDir = dirname(fileURLToPath(import.meta.url));
    return resolve(thisDir, "../../../libraries/intake");
  } catch {
    return resolve(process.cwd(), "Axion/libraries/intake");
  }
}

let _schema: Schema | null = null;
let _rules: RulesFile | null = null;
let _enums: EnumsFile | null = null;

function loadSchema(): Schema {
  if (_schema) return _schema;
  const dir = findLibrariesDir();
  _schema = JSON.parse(readFileSync(resolve(dir, "schema.v1.json"), "utf-8"));
  return _schema!;
}

function loadRules(): RulesFile {
  if (_rules) return _rules;
  const dir = findLibrariesDir();
  _rules = JSON.parse(readFileSync(resolve(dir, "rules.v1.json"), "utf-8"));
  return _rules!;
}

function loadEnums(): EnumsFile {
  if (_enums) return _enums;
  const dir = findLibrariesDir();
  _enums = JSON.parse(readFileSync(resolve(dir, "enums.v1.json"), "utf-8"));
  return _enums!;
}

function getPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

let issueCounter = 0;

function makeIssue(
  severity: "error" | "warning",
  errorCode: ValidationErrorCode,
  ruleId: string,
  fieldPath: string,
  message: string,
  meta?: Record<string, unknown>
): ValidationIssue {
  issueCounter++;
  return {
    issue_id: `VI-${String(issueCounter).padStart(4, "0")}`,
    severity,
    error_code: errorCode,
    rule_id: ruleId,
    field_path: fieldPath,
    message,
    ...(meta ? { meta } : {}),
  };
}

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

function isValidHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

function evaluateCondition(condition: string, sub: Record<string, unknown>): boolean {
  const eqMatch = condition.match(/^(\S+)\s*==\s*'([^']*)'$/);
  if (eqMatch) {
    return getPath(sub, eqMatch[1]) === eqMatch[2];
  }
  return false;
}

function validateField(
  fieldPath: string,
  fieldDef: SchemaField,
  value: unknown,
  enums: EnumsFile,
  sub: Record<string, unknown>,
  issues: ValidationIssue[]
): void {
  const ruleId = `SCHEMA-${fieldPath}`;

  if (fieldDef.required && (value === undefined || value === null || value === "")) {
    issues.push(makeIssue("error", "REQUIRED", ruleId, fieldPath, `Required field '${fieldPath}' is missing.`));
    return;
  }

  if (value === undefined || value === null) return;

  if (fieldDef.must_be !== undefined && value !== fieldDef.must_be) {
    issues.push(makeIssue("error", "REQUIRED", ruleId, fieldPath, `Field '${fieldPath}' must be ${JSON.stringify(fieldDef.must_be)}.`));
  }

  if (fieldDef.type === "string" && typeof value === "string") {
    if (fieldDef.min_length !== undefined && value.length < fieldDef.min_length) {
      issues.push(makeIssue("error", "REQUIRED", ruleId, fieldPath, `Field '${fieldPath}' must be at least ${fieldDef.min_length} characters.`, { min_length: fieldDef.min_length, actual: value.length }));
    }
    if (fieldDef.max_length !== undefined && value.length > fieldDef.max_length) {
      issues.push(makeIssue("error", "REQUIRED", ruleId, fieldPath, `Field '${fieldPath}' exceeds max length of ${fieldDef.max_length}.`, { max_length: fieldDef.max_length, actual: value.length }));
    }
    if (fieldDef.format === "url" && !isValidUrl(value)) {
      issues.push(makeIssue("error", "INVALID_URL", ruleId, fieldPath, `Field '${fieldPath}' must be a valid URL.`));
    }
    if (fieldDef.format === "hex_color" && !isValidHexColor(value)) {
      issues.push(makeIssue("error", "INVALID_FORMAT", ruleId, fieldPath, `Field '${fieldPath}' must be a valid hex color.`));
    }
  }

  if (fieldDef.type === "enum" && fieldDef.enum_ref) {
    const enumDef = enums.enums[fieldDef.enum_ref];
    if (enumDef) {
      if (enumDef.values) {
        if (!enumDef.values.includes(value as string)) {
          issues.push(makeIssue("error", "INVALID_ENUM", ruleId, fieldPath, `Field '${fieldPath}' has invalid value '${value}'. Allowed: ${enumDef.values.join(", ")}.`, { allowed: enumDef.values }));
        }
      } else if (enumDef.values_by_category) {
        const category = getPath(sub, "routing.category") as string | undefined;
        const allowed = category ? enumDef.values_by_category[category] : undefined;
        if (allowed && !allowed.includes(value as string)) {
          issues.push(makeIssue("error", "INVALID_ENUM_FOR_CONTEXT", ruleId, fieldPath, `Field '${fieldPath}' has value '${value}' invalid for category '${category}'. Allowed: ${allowed.join(", ")}.`, { category, allowed }));
        }
      }
    }
  }

  if (fieldDef.type === "boolean" && typeof value !== "boolean") {
    issues.push(makeIssue("error", "REQUIRED", ruleId, fieldPath, `Field '${fieldPath}' must be a boolean.`));
  }

  if (fieldDef.type === "fileRef" && typeof value === "string" && fieldDef.allowed_filetypes) {
    const ext = value.substring(value.lastIndexOf(".")).toLowerCase();
    if (!fieldDef.allowed_filetypes.includes(ext)) {
      issues.push(makeIssue("error", "INVALID_FILETYPE", ruleId, fieldPath, `Field '${fieldPath}' must have extension: ${fieldDef.allowed_filetypes.join(", ")}.`));
    }
  }

  if (fieldDef.type === "array" && Array.isArray(value)) {
    if (fieldDef.min_items !== undefined && value.length < fieldDef.min_items) {
      issues.push(makeIssue("error", "MIN_ITEMS", ruleId, fieldPath, `Field '${fieldPath}' requires at least ${fieldDef.min_items} items.`, { min_items: fieldDef.min_items, actual: value.length }));
    }
    if (fieldDef.items) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        const itemPath = `${fieldPath}[${i}]`;
        if (fieldDef.items.type === "object" && fieldDef.items.fields && typeof item === "object" && item !== null) {
          for (const [subName, subDef] of Object.entries(fieldDef.items.fields)) {
            validateField(`${itemPath}.${subName}`, subDef, (item as Record<string, unknown>)[subName], enums, sub, issues);
          }
        } else if (fieldDef.items.type === "enum" && fieldDef.items.enum_ref) {
          validateField(itemPath, fieldDef.items, item, enums, sub, issues);
        }
      }
    }
  }

  if (fieldDef.type === "object" && fieldDef.fields && typeof value === "object" && value !== null) {
    for (const [subName, subDef] of Object.entries(fieldDef.fields)) {
      validateField(`${fieldPath}.${subName}`, subDef, (value as Record<string, unknown>)[subName], enums, sub, issues);
    }
  }
}

function validateSchema(sub: Record<string, unknown>, schema: Schema, enums: EnumsFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [sectionName, sectionDef] of Object.entries(schema.sections)) {
    const sectionValue = sub[sectionName] as Record<string, unknown> | undefined;

    if (sectionDef.condition) {
      const conditionMet = evaluateCondition(sectionDef.condition, sub);
      if (!conditionMet) continue;
    }

    if (sectionDef.required && (!sectionValue || typeof sectionValue !== "object")) {
      issues.push(makeIssue("error", "REQUIRED", `SCHEMA-${sectionName}`, sectionName, `Required section '${sectionName}' is missing.`));
      continue;
    }

    if (!sectionValue || typeof sectionValue !== "object") continue;

    for (const [fieldName, fieldDef] of Object.entries(sectionDef.fields)) {
      validateField(`${sectionName}.${fieldName}`, fieldDef, sectionValue[fieldName], enums, sub, issues);
    }
  }

  return issues;
}

function validateRules(sub: Record<string, unknown>, rulesFile: RulesFile, enums: EnumsFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const rule of rulesFile.rules) {
    if (!shouldApplyRule(rule, sub)) continue;
    const ruleIssues = evaluateRule(rule, sub, enums);
    issues.push(...ruleIssues);
  }

  return issues;
}

function shouldApplyRule(rule: RuleEntry, sub: Record<string, unknown>): boolean {
  const w = rule.when;
  if (w === "always") return true;

  const eqMatch = w.match(/^(\S+)\s*==\s*'([^']*)'$/);
  if (eqMatch) {
    return getPath(sub, eqMatch[1]) === eqMatch[2];
  }

  const boolTrueMatch = w.match(/^(\S+)\s*==\s*true$/);
  if (boolTrueMatch) {
    return getPath(sub, boolTrueMatch[1]) === true;
  }

  const presentMatch = w.match(/^(\S+)\[\]\s*present$/);
  if (presentMatch) {
    const val = getPath(sub, presentMatch[1]);
    return Array.isArray(val) && val.length > 0;
  }

  const orMatch = w.match(/^(\S+)\s*==\s*'([^']*)'\s*OR\s*(\S+)\s*==\s*'([^']*)'$/);
  if (orMatch) {
    return getPath(sub, orMatch[1]) === orMatch[2] || getPath(sub, orMatch[3]) === orMatch[4];
  }

  return true;
}

function evaluateRule(rule: RuleEntry, sub: Record<string, unknown>, _enums: EnumsFile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const severity = rule.severity === "warning" ? "warning" : "error";
  const errorCode = rule.error_code as ValidationErrorCode;
  const fieldPath = rule.pointer_paths[0] || "";

  switch (rule.rule_id) {
    case "INT3-ROUTING-01": {
      const category = getPath(sub, "routing.category") as string | undefined;
      const preset = getPath(sub, "routing.type_preset") as string | undefined;
      if (category && preset) {
        const enumDef = _enums.enums["TypePreset"];
        if (enumDef?.values_by_category) {
          const allowed = enumDef.values_by_category[category];
          if (allowed && !allowed.includes(preset)) {
            issues.push(makeIssue(severity, errorCode, rule.rule_id, "routing.type_preset", rule.description, { category, preset, allowed }));
          }
        }
      }
      break;
    }

    case "INT3-EXIST-01": {
      const repoLink = getPath(sub, "existing.existing_repo_link");
      const summary = getPath(sub, "existing.current_state_summary");
      if (!repoLink || (typeof repoLink === "string" && !isValidUrl(repoLink))) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "existing.existing_repo_link", "Existing project requires a valid repo link."));
      }
      if (!summary) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "existing.current_state_summary", "Existing project requires a current state summary."));
      }
      break;
    }

    case "INT3-CONS-01": {
      const standsFor = getPath(sub, "brand.stands_for");
      const promise = getPath(sub, "brand.brand_promise");
      const voice = getPath(sub, "brand.voice_adjectives") as unknown[] | undefined;
      if (!standsFor) issues.push(makeIssue(severity, errorCode, rule.rule_id, "brand.stands_for", "Consumer-facing requires brand.stands_for."));
      if (!promise) issues.push(makeIssue(severity, errorCode, rule.rule_id, "brand.brand_promise", "Consumer-facing requires brand.brand_promise."));
      if (!voice || !Array.isArray(voice) || voice.length < 1) issues.push(makeIssue(severity, "MIN_ITEMS", rule.rule_id, "brand.voice_adjectives", "Consumer-facing requires at least 1 voice adjective."));
      break;
    }

    case "INT3-CONS-02": {
      const adj = getPath(sub, "design.style_adjectives") as unknown[] | undefined;
      if (!adj || !Array.isArray(adj) || adj.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "design.style_adjectives", rule.description));
      }
      break;
    }

    case "INT3-DATA-01": {
      const objs = getPath(sub, "data.objects") as unknown[] | undefined;
      if (!objs || !Array.isArray(objs) || objs.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "data.objects", rule.description));
      }
      break;
    }

    case "INT3-AUTH-01": {
      const methods = getPath(sub, "auth.methods") as unknown[] | undefined;
      if (!methods || !Array.isArray(methods) || methods.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "auth.methods", rule.description));
      }
      break;
    }

    case "INT3-AUTH-02": {
      const desc = getPath(sub, "auth.approval_flows_description");
      if (!desc) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "auth.approval_flows_description", rule.description));
      }
      break;
    }

    case "INT3-INTEG-01": {
      const items = getPath(sub, "integrations.items") as unknown[] | undefined;
      if (!items || !Array.isArray(items) || items.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "integrations.items", rule.description));
      }
      break;
    }

    case "INT3-REF-01": {
      const roles = getPath(sub, "spec.roles") as Array<{ name: string }> | undefined;
      if (roles && Array.isArray(roles)) {
        const names = roles.map((r) => r.name).filter(Boolean);
        const seen = new Set<string>();
        for (const name of names) {
          if (seen.has(name)) {
            issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.roles", `Duplicate role name: '${name}'.`, { duplicate: name }));
          }
          seen.add(name);
        }
      }
      break;
    }

    case "INT3-REF-02": {
      const roles = getPath(sub, "spec.roles") as Array<{ name: string }> | undefined;
      const perms = getPath(sub, "spec.role_permissions") as Array<{ role_name: string }> | undefined;
      if (perms && Array.isArray(perms)) {
        const validNames = new Set((roles || []).map((r) => r.name));
        for (const perm of perms) {
          if (perm.role_name && !validNames.has(perm.role_name)) {
            issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.role_permissions", `Role permission references unknown role: '${perm.role_name}'.`, { role_name: perm.role_name }));
          }
        }
      }
      break;
    }

    case "INT3-REF-03": {
      const roles = getPath(sub, "spec.roles") as Array<{ name: string }> | undefined;
      const workflows = getPath(sub, "spec.workflows") as Array<{ actor_role: string }> | undefined;
      if (workflows && Array.isArray(workflows)) {
        const validNames = new Set((roles || []).map((r) => r.name));
        for (const wf of workflows) {
          if (wf.actor_role && !validNames.has(wf.actor_role)) {
            issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.workflows", `Workflow references unknown role: '${wf.actor_role}'.`, { actor_role: wf.actor_role }));
          }
        }
      }
      break;
    }

    case "INT3-REF-04": {
      const features = getPath(sub, "spec.must_have_features") as Array<{ name: string }> | undefined;
      const rank = getPath(sub, "spec.feature_priority_rank") as string[] | undefined;
      if (rank && Array.isArray(rank)) {
        const validNames = new Set((features || []).map((f) => f.name));
        for (const entry of rank) {
          if (!validNames.has(entry)) {
            issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.feature_priority_rank", `Priority rank references unknown feature: '${entry}'.`, { feature: entry }));
          }
        }
      }
      break;
    }

    case "INT3-RULES-01": {
      const rules = getPath(sub, "spec.must_always_rules") as unknown[] | undefined;
      if (!rules || !Array.isArray(rules) || rules.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.must_always_rules", rule.description));
      }
      break;
    }

    case "INT3-FMT-01": {
      const zip = getPath(sub, "inputs.zip_upload") as string | undefined;
      if (zip && typeof zip === "string") {
        if (!zip.toLowerCase().endsWith(".zip")) {
          issues.push(makeIssue(severity, errorCode, rule.rule_id, "inputs.zip_upload", rule.description));
        }
      }
      break;
    }

    case "INT3-FMT-02": {
      const links = getPath(sub, "inputs.reference_links") as Array<{ url: string }> | undefined;
      if (links && Array.isArray(links)) {
        for (let i = 0; i < links.length; i++) {
          if (links[i].url && !isValidUrl(links[i].url)) {
            issues.push(makeIssue(severity, "INVALID_URL", rule.rule_id, `inputs.reference_links[${i}].url`, `Reference link URL is invalid: '${links[i].url}'.`));
          }
        }
      }
      break;
    }

    case "INT3-FMT-03": {
      const colors = getPath(sub, "design.brand_colors") as Array<{ hex: string }> | undefined;
      if (colors && Array.isArray(colors)) {
        for (let i = 0; i < colors.length; i++) {
          if (colors[i].hex && !isValidHexColor(colors[i].hex)) {
            issues.push(makeIssue(severity, errorCode, rule.rule_id, `design.brand_colors[${i}].hex`, `Invalid hex color: '${colors[i].hex}'.`));
          }
        }
      }
      break;
    }

    case "INT3-SKILL-01": {
      const features = getPath(sub, "spec.must_have_features") as unknown[] | undefined;
      if (!features || !Array.isArray(features) || features.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.must_have_features", rule.description));
      }
      break;
    }

    case "INT3-SKILL-02": {
      const features = getPath(sub, "spec.must_have_features") as unknown[] | undefined;
      if (!features || !Array.isArray(features) || features.length < 3) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.must_have_features", rule.description, { required: 3, actual: features?.length ?? 0 }));
      }
      break;
    }

    case "INT3-SKILL-03": {
      const features = getPath(sub, "spec.must_have_features") as unknown[] | undefined;
      if (!features || !Array.isArray(features) || features.length < 5) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.must_have_features", rule.description, { required: 5, actual: features?.length ?? 0 }));
      }
      break;
    }

    case "INT3-SKILL-04": {
      const workflows = getPath(sub, "spec.workflows") as unknown[] | undefined;
      if (!workflows || !Array.isArray(workflows) || workflows.length < 3) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.workflows", rule.description, { required: 3, actual: workflows?.length ?? 0 }));
      }
      break;
    }

    case "INT3-SKILL-05": {
      const workflows = getPath(sub, "spec.workflows") as unknown[] | undefined;
      const edgeWorkflows = getPath(sub, "spec.edge_workflows") as unknown[] | undefined;
      const wfLen = Array.isArray(workflows) ? workflows.length : 0;
      const ewLen = Array.isArray(edgeWorkflows) ? edgeWorkflows.length : 0;
      if (!(wfLen >= 5 || (wfLen >= 3 && ewLen >= 2))) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "spec.workflows", rule.description, { workflows: wfLen, edge_workflows: ewLen }));
      }
      break;
    }

    case "INT3-SKILL-06": {
      const oos = getPath(sub, "intent.out_of_scope") as unknown[] | undefined;
      if (!oos || !Array.isArray(oos) || oos.length < 1) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "intent.out_of_scope", rule.description));
      }
      break;
    }

    case "INT3-SKILL-07": {
      const oos = getPath(sub, "intent.out_of_scope") as unknown[] | undefined;
      if (!oos || !Array.isArray(oos) || oos.length < 2) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "intent.out_of_scope", rule.description, { required: 2, actual: oos?.length ?? 0 }));
      }
      break;
    }

    case "INT3-SKILL-08": {
      const oos = getPath(sub, "intent.out_of_scope") as unknown[] | undefined;
      if (!oos || !Array.isArray(oos) || oos.length < 3) {
        issues.push(makeIssue(severity, errorCode, rule.rule_id, "intent.out_of_scope", rule.description, { required: 3, actual: oos?.length ?? 0 }));
      }
      break;
    }

    case "INT3-FINAL-01": {
      const cp = getPath(sub, "final.confirm_priorities");
      const co = getPath(sub, "final.confirm_out_of_scope");
      const cc = getPath(sub, "final.confirm_constraints");
      if (cp !== true) issues.push(makeIssue(severity, errorCode, rule.rule_id, "final.confirm_priorities", "final.confirm_priorities must be true."));
      if (co !== true) issues.push(makeIssue(severity, errorCode, rule.rule_id, "final.confirm_out_of_scope", "final.confirm_out_of_scope must be true."));
      if (cc !== true) issues.push(makeIssue(severity, errorCode, rule.rule_id, "final.confirm_constraints", "final.confirm_constraints must be true."));
      break;
    }

    default:
      break;
  }

  return issues;
}

export function validateIntake(submission: unknown, _schemaVersion: string): ValidationResult {
  issueCounter = 0;

  const schema = loadSchema();
  const rules = loadRules();
  const enums = loadEnums();

  const sub = (submission && typeof submission === "object" ? submission : {}) as Record<string, unknown>;
  const submissionId = (getPath(sub, "submission_id") as string) || "unknown";

  const schemaIssues = validateSchema(sub, schema, enums);
  const ruleIssues = validateRules(sub, rules, enums);

  const allIssues = [...schemaIssues, ...ruleIssues];

  const errors = allIssues.filter((i) => i.severity === "error");
  const warnings = allIssues.filter((i) => i.severity === "warning");

  const blockingRuleIds = [...new Set(errors.map((e) => e.rule_id))];

  return {
    submission_id: submissionId,
    validated_at: new Date().toISOString(),
    is_valid: errors.length === 0,
    schema_version_used: schema.schema_version,
    form_version_used: "1.0.0",
    ruleset_version_used: rules.rules_version,
    errors,
    warnings,
    summary: {
      error_count: errors.length,
      warning_count: warnings.length,
      blocking_rule_ids: blockingRuleIds,
    },
  };
}
