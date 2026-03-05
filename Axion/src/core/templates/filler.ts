import type { SelectedTemplate } from "./selector.js";
import { isoNow } from "../../utils/time.js";

export interface FillContext {
  spec: Record<string, unknown>;
  standards: Record<string, unknown>;
  work: Record<string, unknown>;
  acceptance: Record<string, unknown>;
  normalizedInput: Record<string, unknown>;
  submission_id: string;
  spec_id: string;
  standards_id: string;
  run_id: string;
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

  if (trimmed.startsWith("derive:")) {
    const rest = trimmed.slice(7);
    const parenIdx = rest.indexOf("(");
    if (parenIdx >= 0) {
      const name = rest.slice(0, parenIdx);
      const argsStr = rest.slice(parenIdx + 1, rest.lastIndexOf(")"));
      const args = argsStr.split(",").map((a) => a.trim()).filter(Boolean);
      return { type: "derived", name, args };
    }
    return { type: "derived", name: rest, args: [] };
  }

  if (trimmed.endsWith("|OPTIONAL")) {
    return { type: "optional", path: trimmed.replace(/\|OPTIONAL$/, "").trim() };
  }

  if (trimmed.endsWith("|UNKNOWN_ALLOWED")) {
    return { type: "unknown_allowed", path: trimmed.replace(/\|UNKNOWN_ALLOWED$/, "").trim() };
  }

  if (trimmed.endsWith("[]")) {
    return { type: "array", path: trimmed.slice(0, -2) };
  }

  return { type: "direct", path: trimmed };
}

function resolvePath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function resolveFromContext(ctx: FillContext, path: string): unknown {
  const sources = [ctx.spec, ctx.standards, ctx.work, ctx.acceptance, ctx.normalizedInput];
  for (const src of sources) {
    const val = resolvePath(src, path);
    if (val !== undefined) return val;
  }
  const directMap: Record<string, unknown> = {
    submission_id: ctx.submission_id,
    spec_id: ctx.spec_id,
    standards_id: ctx.standards_id,
    run_id: ctx.run_id,
  };
  if (path in directMap) return directMap[path];
  return undefined;
}

export function resolvePlaceholder(syntax: PlaceholderSyntax, context: FillContext): unknown {
  switch (syntax.type) {
    case "direct":
      return resolveFromContext(context, syntax.path);
    case "array":
      return resolveFromContext(context, syntax.path);
    case "optional":
      return resolveFromContext(context, syntax.path) ?? null;
    case "unknown_allowed":
      return resolveFromContext(context, syntax.path) ?? undefined;
    case "derived":
      return runDerivedFunction(syntax.name, syntax.args, context);
  }
}

function runDerivedFunction(name: string, _args: string[], ctx: FillContext): unknown {
  const entities = (ctx.spec.entities ?? {}) as Record<string, unknown[]>;
  const roles = (entities.roles ?? []) as Array<Record<string, unknown>>;
  const features = (entities.features ?? []) as Array<Record<string, unknown>>;
  const workflows = (entities.workflows ?? []) as Array<Record<string, unknown>>;

  switch (name) {
    case "ROLE_TO_WORKFLOWS": {
      const mapping: Record<string, string[]> = {};
      for (const wf of workflows) {
        const actorRef = String(wf.actor_role_ref ?? "");
        if (actorRef) {
          if (!mapping[actorRef]) mapping[actorRef] = [];
          mapping[actorRef].push(String(wf.name ?? wf.workflow_id));
        }
      }
      return mapping;
    }
    case "FEATURE_TO_OPERATIONS": {
      return features.map((f) => ({
        feature_id: f.feature_id,
        name: f.name,
        operations: [`implement_${f.feature_id}`, `test_${f.feature_id}`],
      }));
    }
    case "ROLE_PERMISSION_MATRIX": {
      const perms = (entities.permissions ?? []) as Array<Record<string, unknown>>;
      return roles.map((r) => ({
        role_id: r.role_id,
        role_name: r.name,
        permissions: perms
          .filter((p) => p.role_ref === r.role_id)
          .map((p) => p.allowed_capabilities),
      }));
    }
    default:
      return undefined;
  }
}

interface OutputHeading {
  level: number;
  title: string;
  tableColumns: string[];
  description: string;
}

export function extractOutputFormat(templateContent: string): OutputHeading[] {
  const headings: OutputHeading[] = [];
  const section7Match = templateContent.match(/## 7\.\s*Output Format\b([\s\S]*?)(?=\n## \d+\.|$)/);
  if (!section7Match) return headings;

  const section7 = section7Match[1];
  const lines = section7.split("\n");

  let currentHeading: OutputHeading | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^\d+\.\s*`## ([^`]+)`/);
    if (headingMatch) {
      if (currentHeading) headings.push(currentHeading);
      currentHeading = {
        level: 2,
        title: headingMatch[1],
        tableColumns: [],
        description: "",
      };
      continue;
    }

    if (currentHeading && line.trim().startsWith("- Table:")) {
      const colStr = line.replace(/.*- Table:\s*/, "").trim();
      currentHeading.tableColumns = colStr.split("|").map((c) => c.trim()).filter(Boolean);
    } else if (currentHeading && line.trim().startsWith("- ") && !line.trim().startsWith("- Table:")) {
      currentHeading.description += line.trim().replace(/^- /, "") + " ";
    }
  }

  if (currentHeading) headings.push(currentHeading);
  return headings;
}

function renderEntityArray(items: unknown[], columns?: string[]): string {
  if (!Array.isArray(items) || items.length === 0) return "_No items defined._\n";

  const sorted = [...items].sort((a, b) => {
    const aId = String((a as Record<string, unknown>).feature_id ?? (a as Record<string, unknown>).role_id ?? (a as Record<string, unknown>).workflow_id ?? (a as Record<string, unknown>).perm_id ?? "");
    const bId = String((b as Record<string, unknown>).feature_id ?? (b as Record<string, unknown>).role_id ?? (b as Record<string, unknown>).workflow_id ?? (b as Record<string, unknown>).perm_id ?? "");
    return aId.localeCompare(bId);
  });

  if (columns && columns.length > 0) {
    const colKeys = columns.map((c) => c.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""));
    const header = "| " + columns.join(" | ") + " |";
    const sep = "| " + columns.map(() => "---").join(" | ") + " |";
    const rows = sorted.map((item) => {
      const rec = item as Record<string, unknown>;
      const vals = colKeys.map((ck) => {
        for (const [k, v] of Object.entries(rec)) {
          if (k.toLowerCase().replace(/\s+/g, "_") === ck || k === ck) {
            return formatCellValue(v);
          }
        }
        const directVal = rec[ck];
        if (directVal !== undefined) return formatCellValue(directVal);
        return "—";
      });
      return "| " + vals.join(" | ") + " |";
    });
    return [header, sep, ...rows].join("\n") + "\n";
  }

  const keys = Object.keys(sorted[0] as Record<string, unknown>);
  const header = "| " + keys.join(" | ") + " |";
  const sep = "| " + keys.map(() => "---").join(" | ") + " |";
  const rows = sorted.map((item) => {
    const rec = item as Record<string, unknown>;
    return "| " + keys.map((k) => formatCellValue(rec[k])).join(" | ") + " |";
  });
  return [header, sep, ...rows].join("\n") + "\n";
}

function formatCellValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (Array.isArray(val)) return val.map((v) => String(v)).join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function renderUnknowns(unknowns: unknown[]): string {
  if (!Array.isArray(unknowns) || unknowns.length === 0) return "_No unknowns identified._\n";
  return unknowns
    .map((u) => {
      const unk = u as Record<string, unknown>;
      return [
        `**${unk.unknown_id ?? "UNKNOWN"}**: [${unk.area ?? "General"}] ${unk.summary ?? "Unknown item"}`,
        `- Impact: ${unk.impact ?? "Unknown"}`,
        `- Blocking: ${unk.blocking ?? "No"}`,
        `- Needs: ${unk.needs ?? "Further analysis"}`,
        `- Refs: ${unk.refs ?? "—"}`,
      ].join("\n");
    })
    .join("\n\n") + "\n";
}

function buildHeadingContent(
  heading: OutputHeading,
  ctx: FillContext,
  resolvedCount: { n: number },
  unknownsList: FilledTemplate["unknowns"],
): string {
  const lines: string[] = [];
  lines.push(`## ${heading.title}\n`);

  const entities = (ctx.spec.entities ?? {}) as Record<string, unknown>;
  const routing = (ctx.spec.routing ?? ctx.normalizedInput.routing ?? {}) as Record<string, unknown>;
  const rules = (ctx.spec.rules ?? {}) as Record<string, unknown>;
  const meta = (ctx.spec.meta ?? {}) as Record<string, unknown>;
  const constraints = (ctx.normalizedInput.constraints ?? ctx.spec.constraints ?? {}) as Record<string, unknown>;
  const unknowns = (ctx.spec.unknowns ?? []) as unknown[];
  const project = (ctx.normalizedInput.project ?? {}) as Record<string, unknown>;
  const standards = ctx.standards;
  const acceptance = ctx.acceptance;
  const work = ctx.work;

  const titleLower = heading.title.toLowerCase();

  if (titleLower.includes("product overview") || titleLower.includes("project overview") || titleLower.includes("overview")) {
    const name = String(project.project_name ?? meta.project_name ?? "Untitled Project");
    const overview = String(project.project_overview ?? project.problem_statement ?? "No overview provided.");
    const audience = String(routing.audience_context ?? "General");
    const buildTarget = String(routing.build_target ?? "production");
    lines.push(`**Project Name:** ${name}\n`);
    lines.push(`**Problem Statement:** ${overview}\n`);
    lines.push(`**Target Audience:** ${audience}\n`);
    lines.push(`**Build Target:** ${buildTarget}\n`);
    resolvedCount.n += 4;
    return lines.join("\n");
  }

  if (titleLower.includes("target users") || titleLower.includes("personas") || titleLower.includes("users & roles")) {
    const roles = (entities.roles ?? []) as unknown[];
    lines.push(renderEntityArray(roles, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    resolvedCount.n += roles.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("functional requirement")) {
    const features = (entities.features ?? []) as unknown[];
    const cols = heading.tableColumns.length > 0 ? heading.tableColumns : ["Feature ID", "Name", "Description", "Priority"];
    lines.push(renderEntityArray(features, cols));
    resolvedCount.n += features.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("non-functional requirement") || titleLower === "nfrs") {
    const nfr = (constraints.nfr ?? {}) as Record<string, unknown>;
    const standardRules = (standards.resolved_rules ?? standards.rules ?? []) as unknown[];
    if (Object.keys(nfr).length > 0) {
      const cols = heading.tableColumns.length > 0 ? heading.tableColumns : ["Category", "Requirement", "Standard Ref"];
      const nfrItems = Object.entries(nfr).map(([cat, val]) => ({
        category: cat,
        requirement: typeof val === "string" ? val : JSON.stringify(val),
        standard_ref: "—",
      }));
      lines.push(renderEntityArray(nfrItems, cols));
      resolvedCount.n += 1;
    } else if (Array.isArray(standardRules) && standardRules.length > 0) {
      const cols = heading.tableColumns.length > 0 ? heading.tableColumns : ["Category", "Requirement", "Standard Ref"];
      lines.push(renderEntityArray(standardRules, cols));
      resolvedCount.n += 1;
    } else {
      lines.push("_No non-functional requirements defined._\n");
    }
    return lines.join("\n");
  }

  if (titleLower.includes("constraint") || titleLower.includes("assumption")) {
    const mustAlways = (rules.must_always ?? []) as string[];
    const mustNever = (rules.must_never ?? []) as string[];
    if (mustAlways.length > 0) {
      lines.push("**Constraints (Must Always):**\n");
      mustAlways.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }
    if (mustNever.length > 0) {
      lines.push("**Constraints (Must Never):**\n");
      mustNever.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }
    if (mustAlways.length === 0 && mustNever.length === 0) {
      lines.push("_No explicit constraints defined._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("success criteria") || titleLower.includes("acceptance criteria")) {
    const criteria = (rules.acceptance_criteria ?? []) as string[];
    const dod = String(rules.definition_of_done ?? "");
    if (dod) lines.push(`**Definition of Done:** ${dod}\n`);
    if (criteria.length > 0) {
      lines.push("**Acceptance Criteria:**\n");
      criteria.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
      lines.push("");
    }
    if (acceptance && Object.keys(acceptance).length > 0) {
      const items = (acceptance.acceptance_items ?? acceptance.items ?? []) as unknown[];
      if (Array.isArray(items) && items.length > 0) {
        lines.push("**Acceptance Map Items:**\n");
        lines.push(renderEntityArray(items, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
      }
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("dependenc")) {
    const deps = (entities.dependencies ?? []) as unknown[];
    if (Array.isArray(deps) && deps.length > 0) {
      lines.push(renderEntityArray(deps, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    } else {
      lines.push("_Dependencies to be determined during build phase._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("unknown") || titleLower.includes("open question")) {
    lines.push(renderUnknowns(unknowns));
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("workflow")) {
    const wfs = (entities.workflows ?? []) as unknown[];
    const cols = heading.tableColumns.length > 0 ? heading.tableColumns : undefined;
    lines.push(renderEntityArray(wfs, cols));
    resolvedCount.n += wfs.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("data") && (titleLower.includes("model") || titleLower.includes("entit") || titleLower.includes("object"))) {
    const dataObjs = (entities.data_objects ?? entities.data_entities ?? []) as unknown[];
    lines.push(renderEntityArray(dataObjs, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    resolvedCount.n += dataObjs.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("permission") || titleLower.includes("authorization") || titleLower.includes("access control")) {
    const perms = (entities.permissions ?? []) as unknown[];
    lines.push(renderEntityArray(perms, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    resolvedCount.n += perms.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("system boundary") || titleLower.includes("system context")) {
    const name = String(project.project_name ?? meta.project_name ?? "System");
    const desc = String(project.project_overview ?? "");
    lines.push(`The **${name}** system provides the following capabilities:\n`);
    if (desc) lines.push(`${desc}\n`);
    const feats = (entities.features ?? []) as Array<Record<string, unknown>>;
    if (feats.length > 0) {
      lines.push("**Core capabilities:**\n");
      feats.forEach((f) => lines.push(`- ${f.name}: ${f.description ?? ""}`));
      lines.push("");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("major component") || titleLower.includes("component")) {
    const feats = (entities.features ?? []) as Array<Record<string, unknown>>;
    const cols = heading.tableColumns.length > 0 ? heading.tableColumns : ["Component ID", "Name", "Responsibility", "Feature Refs"];
    const components = feats.map((f) => ({
      component_id: `COMP-${String(f.feature_id ?? "").replace("FEAT-", "")}`,
      name: String(f.name ?? ""),
      responsibility: String(f.description ?? ""),
      feature_refs: String(f.feature_id ?? ""),
    }));
    lines.push(renderEntityArray(components, cols));
    resolvedCount.n += feats.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("technology stack") || titleLower.includes("tech stack")) {
    const cols = heading.tableColumns.length > 0 ? heading.tableColumns : ["Layer", "Technology", "Rationale", "Standard Ref"];
    lines.push(`| ${cols.join(" | ")} |`);
    lines.push(`| ${cols.map(() => "---").join(" | ")} |`);
    lines.push(`| Frontend | _To be determined_ | — | — |`);
    lines.push(`| Backend | _To be determined_ | — | — |`);
    lines.push(`| Database | _To be determined_ | — | — |`);
    lines.push("");
    unknownsList.push({ placeholder: "technology_stack", status: "UNKNOWN_ALLOWED" });
    return lines.join("\n");
  }

  if (titleLower.includes("integration point")) {
    const intgs = (entities.integrations ?? []) as unknown[];
    if (Array.isArray(intgs) && intgs.length > 0) {
      lines.push(renderEntityArray(intgs, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    } else {
      lines.push("_No integration points defined. To be determined during design phase._\n");
      unknownsList.push({ placeholder: "integration_points", status: "UNKNOWN_ALLOWED" });
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("deployment") || titleLower.includes("infrastructure")) {
    lines.push("_Deployment model to be determined during architecture design phase._\n");
    unknownsList.push({ placeholder: "deployment_model", status: "UNKNOWN_ALLOWED" });
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("scope") || titleLower.includes("goal")) {
    const dod = String(rules.definition_of_done ?? "All features implemented and tested");
    const feats = (entities.features ?? []) as Array<Record<string, unknown>>;
    lines.push(`**Definition of Done:** ${dod}\n`);
    if (feats.length > 0) {
      lines.push("**In Scope Features:**\n");
      feats.forEach((f) => lines.push(`- ${f.feature_id}: ${f.name}`));
      lines.push("");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("feature") && (titleLower.includes("list") || titleLower.includes("capabilit"))) {
    const feats = (entities.features ?? []) as unknown[];
    const cols = heading.tableColumns.length > 0 ? heading.tableColumns : undefined;
    lines.push(renderEntityArray(feats, cols));
    resolvedCount.n += feats.length > 0 ? 1 : 0;
    return lines.join("\n");
  }

  if (titleLower.includes("risk")) {
    const mustNever = (rules.must_never ?? []) as string[];
    if (mustNever.length > 0) {
      lines.push("**Identified Risks:**\n");
      mustNever.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
      lines.push("");
    } else {
      lines.push("_No specific risks identified at this stage._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("standard") || titleLower.includes("compliance")) {
    const resolvedRules = (standards.resolved_rules ?? []) as unknown[];
    if (Array.isArray(resolvedRules) && resolvedRules.length > 0) {
      lines.push(renderEntityArray(resolvedRules, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    } else {
      lines.push("_Standards resolved per standards snapshot._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("work breakdown") || titleLower.includes("work unit")) {
    const units = (work.units ?? work.work_units ?? []) as unknown[];
    if (Array.isArray(units) && units.length > 0) {
      lines.push(renderEntityArray(units, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    } else {
      lines.push("_Work breakdown defined in planning artifacts._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("security") || titleLower.includes("auth")) {
    const auth = (constraints.auth ?? {}) as Record<string, unknown>;
    if (Object.keys(auth).length > 0) {
      for (const [k, v] of Object.entries(auth)) {
        lines.push(`**${k}:** ${typeof v === "string" ? v : JSON.stringify(v)}`);
      }
      lines.push("");
    } else {
      lines.push("_Security and authentication requirements to be defined._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("caching") || titleLower.includes("cache")) {
    lines.push("_Caching strategy to be determined during architecture design._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("search")) {
    lines.push("_Search capabilities to be determined during architecture design._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("test") || titleLower.includes("verification")) {
    lines.push("_Testing strategy and verification approach to be defined during planning._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("monitoring") || titleLower.includes("observability") || titleLower.includes("metric") || titleLower.includes("analytic")) {
    lines.push("_Monitoring and analytics requirements to be defined._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("error") || titleLower.includes("exception")) {
    lines.push("_Error handling strategy to be defined during design._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("api") || titleLower.includes("interface") || titleLower.includes("contract")) {
    const feats = (entities.features ?? []) as Array<Record<string, unknown>>;
    if (feats.length > 0) {
      lines.push("**API surface derived from features:**\n");
      feats.forEach((f) => lines.push(`- \`${f.feature_id}\`: ${f.name}`));
      lines.push("");
    } else {
      lines.push("_API contracts to be defined during design phase._\n");
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("design") || titleLower.includes("visual") || titleLower.includes("ui")) {
    lines.push("_Design specifications to be defined during design phase._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("accessibility")) {
    lines.push("_Accessibility requirements to be defined per WCAG standards._\n");
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  lines.push("_Content to be filled during build execution._\n");
  resolvedCount.n += 1;
  return lines.join("\n");
}

function extractRequiredFieldsTable(templateContent: string): Array<{ field: string; source: string; unknownAllowed: boolean }> {
  const section4Match = templateContent.match(/## 4\.\s*Required Fields\b([\s\S]*?)(?=\n## \d+\.|$)/);
  if (!section4Match) return [];

  const lines = section4Match[1].split("\n");
  const result: Array<{ field: string; source: string; unknownAllowed: boolean }> = [];

  for (const line of lines) {
    const match = line.match(/^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/);
    if (match && !match[1].includes("---") && !match[1].toLowerCase().includes("field name")) {
      result.push({
        field: match[1].trim(),
        source: match[2].trim(),
        unknownAllowed: match[3].trim().toLowerCase() === "yes",
      });
    }
  }
  return result;
}

export function fillTemplate(
  templateEntry: SelectedTemplate,
  templateContent: string,
  context: FillContext,
): FilledTemplate {
  const headings = extractOutputFormat(templateContent);
  const requiredFields = extractRequiredFieldsTable(templateContent);
  const unknownsList: FilledTemplate["unknowns"] = [];
  const resolvedCount = { n: 0 };

  const titleMatch = templateContent.match(/^# (.+)/m);
  const templateTitle = titleMatch ? titleMatch[1] : `${templateEntry.template_id} — Document`;

  const purposeMatch = templateContent.match(/## 2\.\s*Purpose\s*\n([\s\S]*?)(?=\n## \d+\.|$)/);
  const purpose = purposeMatch ? purposeMatch[1].trim().split("\n")[0] : "";

  const meta = (context.spec.meta ?? {}) as Record<string, unknown>;
  const project = (context.normalizedInput.project ?? {}) as Record<string, unknown>;
  const projectName = String(project.project_name ?? meta.project_name ?? "Project");

  const lines: string[] = [];
  lines.push(`# ${templateTitle}\n`);
  lines.push(`> **Project:** ${projectName} | **Spec:** ${context.spec_id} | **Run:** ${context.run_id}\n`);
  if (purpose) lines.push(`_${purpose}_\n`);
  lines.push("---\n");

  if (headings.length > 0) {
    for (const heading of headings) {
      lines.push(buildHeadingContent(heading, context, resolvedCount, unknownsList));
    }
  } else {
    for (const field of requiredFields) {
      lines.push(`## ${field.field}\n`);
      const value = resolveFromContext(context, field.source);
      if (value !== undefined) {
        if (Array.isArray(value)) {
          lines.push(renderEntityArray(value));
        } else if (typeof value === "object" && value !== null) {
          lines.push("```json");
          lines.push(JSON.stringify(value, null, 2));
          lines.push("```\n");
        } else {
          lines.push(`${String(value)}\n`);
        }
        resolvedCount.n += 1;
      } else if (field.unknownAllowed) {
        lines.push("_UNKNOWN — To be determined._\n");
        unknownsList.push({ placeholder: field.field, status: "UNKNOWN_ALLOWED" });
      } else {
        lines.push("_Required field — not yet resolved._\n");
        unknownsList.push({ placeholder: field.field, status: "BLOCKED" });
      }
    }

    if (requiredFields.length === 0) {
      const entities = (context.spec.entities ?? {}) as Record<string, unknown>;
      const routing = (context.spec.routing ?? {}) as Record<string, unknown>;
      const rules = (context.spec.rules ?? {}) as Record<string, unknown>;

      lines.push("## Overview\n");
      lines.push(`**Project:** ${projectName}\n`);
      lines.push(`**Spec ID:** ${context.spec_id}\n`);
      lines.push(`**Category:** ${String(routing.category ?? "—")}\n`);
      resolvedCount.n += 3;

      for (const [key, val] of Object.entries(entities)) {
        if (Array.isArray(val) && val.length > 0) {
          lines.push(`## ${key.charAt(0).toUpperCase() + key.slice(1)}\n`);
          lines.push(renderEntityArray(val));
          resolvedCount.n += 1;
        }
      }

      const unknowns = (context.spec.unknowns ?? []) as unknown[];
      if (unknowns.length > 0) {
        lines.push("## Unknowns\n");
        lines.push(renderUnknowns(unknowns));
      }
    }
  }

  lines.push("\n---\n");
  lines.push(`_Generated by AXION Internal Agent | Template: ${templateEntry.template_id} v${templateEntry.template_version} | ${isoNow()}_`);

  const content = lines.join("\n");

  const totalFields = headings.length > 0 ? headings.length : Math.max(requiredFields.length, 1);

  return {
    template_id: templateEntry.template_id,
    template_version: templateEntry.template_version,
    filled_at: isoNow(),
    output_path: templateEntry.output_path,
    content,
    placeholders_resolved: resolvedCount.n,
    placeholders_unknown: unknownsList.length,
    unknowns: unknownsList,
  };
}
