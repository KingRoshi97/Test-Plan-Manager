import type { SelectedTemplate } from "./selector.js";
import { isoNow } from "../../utils/time.js";
import type { KnowledgeContext, KIDEntry } from "../knowledge/resolver.js";
import { getKnowledgeCitationsForDomain } from "../knowledge/resolver.js";
import { recordUsage } from "../usage/tracker.js";

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
  knowledge?: KnowledgeContext;
}

export interface CAN03Unknown {
  unknown_id: string;
  created_at: string;
  status: "open" | "resolved";
  unknown_type: "missing_requirement" | "ambiguous_requirement" | "contradiction" | "unresolved_decision" | "missing_reference" | "missing_constraint";
  severity: "low" | "medium" | "high";
  blocking: boolean;
  summary: string;
  detail: string;
  impact: string;
  what_is_needed_to_resolve: string;
  template_ref?: { template_id: string; section_title: string };
  field_path?: string;
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
  generated_unknowns: CAN03Unknown[];
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
    case "derived":
      return resolveDerived(syntax.name, syntax.args, context);
    case "optional":
      return resolveFromContext(context, syntax.path);
    case "unknown_allowed":
      return resolveFromContext(context, syntax.path);
  }
}

function resolveDerived(name: string, args: string[], ctx: FillContext): unknown {
  switch (name) {
    case "ROLE_PERMISSION_MATRIX": {
      const roles = (ctx.spec.entities as Record<string, unknown>)?.roles as Array<Record<string, unknown>> ?? [];
      const workflows = (ctx.spec.entities as Record<string, unknown>)?.workflows as Array<Record<string, unknown>> ?? [];
      if (roles.length === 0) return "No roles defined.";

      const header = ["Role", ...workflows.map((w) => String(w.name ?? w.workflow_id ?? "Workflow"))];
      const rows = roles.map((r) => {
        const roleName = String(r.name ?? r.role_id ?? "Role");
        const wfCols = workflows.map(() => "✓");
        return [roleName, ...wfCols];
      });

      return [
        `| ${header.join(" | ")} |`,
        `| ${header.map(() => "---").join(" | ")} |`,
        ...rows.map((r) => `| ${r.join(" | ")} |`),
      ].join("\n");
    }
    default:
      return `_Derived function '${name}' not implemented._`;
  }
}

interface OutputHeading {
  title: string;
  level: number;
  description: string;
  tableColumns: string[];
}

function isGarbledHeading(title: string): boolean {
  const t = title.trim();
  if (/^\d/.test(t)) return false;
  if (/[A-Z]/.test(t)) return false;
  return true;
}

function extractOutputFormat(templateContent: string): OutputHeading[] {
  const section7Match = templateContent.match(/## 7\.\s*Output Format\b([\s\S]*?)(?=\n## \d+\.|$)/);
  if (!section7Match) return [];

  const lines = section7Match[1].split("\n");
  const rawHeadings: OutputHeading[] = [];
  let inHeadings = false;
  let lastHeading: OutputHeading | null = null;

  for (const line of lines) {
    if (line.includes("Required Headings")) {
      inHeadings = true;
      continue;
    }

    const headingMatch = line.match(/^\d+\.\s*`(#+)\s*(.+?)`/);
    if (!headingMatch) {
      const altMatch = line.match(/^\d+\.\s*(#+)\s*(.+)/);
      if (altMatch) {
        lastHeading = {
          title: altMatch[2].trim(),
          level: altMatch[1].length,
          description: "",
          tableColumns: [],
        };
        rawHeadings.push(lastHeading);
        continue;
      }

      const h2Match = line.match(/^\d+\.\s*`## (.+?)`/);
      if (h2Match) {
        lastHeading = {
          title: h2Match[1].trim(),
          level: 2,
          description: "",
          tableColumns: [],
        };
        rawHeadings.push(lastHeading);
        continue;
      }
    }

    if (headingMatch) {
      lastHeading = {
        title: headingMatch[2].trim(),
        level: headingMatch[1].length,
        description: "",
        tableColumns: [],
      };
      rawHeadings.push(lastHeading);
      continue;
    }

    if (lastHeading && line.trim().startsWith("|") && !line.includes("---")) {
      const cols = line.split("|").map((c) => c.trim()).filter(Boolean);
      if (cols.length > 0 && !cols[0].includes("---")) {
        lastHeading.tableColumns = cols;
      }
    }
  }

  const headings: OutputHeading[] = [];
  for (let i = 0; i < rawHeadings.length; i++) {
    const h = rawHeadings[i];
    if (isGarbledHeading(h.title) && headings.length > 0) {
      const parent = headings[headings.length - 1];
      parent.tableColumns.push(h.title.replace(/\s+/g, ""));
    } else if (headings.length > 0 && !(/^\d/.test(h.title.trim())) && /^\d/.test(headings[headings.length - 1].title.trim())) {
      const parent = headings[headings.length - 1];
      parent.description = parent.description ? `${parent.description}; ${h.title}` : h.title;
    } else {
      headings.push(h);
    }
  }

  return headings;
}

function renderEntityArray(items: unknown[], columns?: string[]): string {
  if (!Array.isArray(items) || items.length === 0) return "_No items defined._\n";

  const records = items.filter(
    (i) => typeof i === "object" && i !== null,
  ) as Array<Record<string, unknown>>;
  if (records.length === 0) {
    if (items.every((i) => typeof i === "string")) {
      return items.map((i) => `- ${i}`).join("\n") + "\n";
    }
    return "_No items defined._\n";
  }

  const allKeys = [...new Set(records.flatMap((r) => Object.keys(r)))];
  const cols = columns ?? allKeys;

  const header = `| ${cols.join(" | ")} |`;
  const separator = `| ${cols.map(() => "---").join(" | ")} |`;

  const rows = records.map((record) => {
    const cells = cols.map((col) => {
      const key = col.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const val = record[col] ?? record[key] ?? record[col.toLowerCase()] ?? "";
      if (typeof val === "object") return JSON.stringify(val);
      return String(val);
    });
    return `| ${cells.join(" | ")} |`;
  });

  return [header, separator, ...rows, ""].join("\n");
}

let _unknownCounter = 0;

function generateUnknown(opts: {
  templateId: string;
  sectionTitle: string;
  fieldPath?: string;
  unknownType?: CAN03Unknown["unknown_type"];
  severity?: CAN03Unknown["severity"];
  blocking?: boolean;
  summary: string;
  detail?: string;
  impact?: string;
  whatIsNeeded?: string;
}): CAN03Unknown {
  _unknownCounter += 1;
  const id = `unk_fill_${String(_unknownCounter).padStart(3, "0")}`;
  return {
    unknown_id: id,
    created_at: isoNow(),
    status: "open",
    unknown_type: opts.unknownType ?? "missing_requirement",
    severity: opts.severity ?? "medium",
    blocking: opts.blocking ?? false,
    summary: opts.summary,
    detail: opts.detail ?? opts.summary,
    impact: opts.impact ?? "Section content incomplete; may require follow-up during build execution.",
    what_is_needed_to_resolve: opts.whatIsNeeded ?? "Provide missing project details or clarify requirements.",
    template_ref: { template_id: opts.templateId, section_title: opts.sectionTitle },
    field_path: opts.fieldPath,
  };
}

function renderCAN03Unknown(unk: CAN03Unknown): string {
  return [
    `**${unk.unknown_id}**: [${unk.unknown_type}] ${unk.summary}`,
    `- Impact: ${unk.severity.charAt(0).toUpperCase() + unk.severity.slice(1)}`,
    `- Blocking: ${unk.blocking ? "Yes" : "No"}`,
    `- Needs: ${unk.what_is_needed_to_resolve}`,
    `- Refs: ${unk.template_ref ? `${unk.template_ref.template_id}/${unk.template_ref.section_title}` : "—"}${unk.field_path ? ` (${unk.field_path})` : ""}`,
  ].join("\n");
}

function renderUnknowns(unknowns: unknown[]): string {
  if (!Array.isArray(unknowns) || unknowns.length === 0) return "_No unknowns identified._\n";
  return unknowns
    .map((u) => {
      const unk = u as Record<string, unknown>;
      if (unk.unknown_id && String(unk.unknown_id).startsWith("unk_")) {
        return renderCAN03Unknown(unk as unknown as CAN03Unknown);
      }
      return [
        `**${unk.unknown_id ?? "UNKNOWN"}**: [${unk.unknown_type ?? unk.area ?? "General"}] ${unk.summary ?? "Unknown item"}`,
        `- Impact: ${unk.severity ?? unk.impact ?? "Unknown"}`,
        `- Blocking: ${unk.blocking ?? "No"}`,
        `- Needs: ${unk.what_is_needed_to_resolve ?? unk.needs ?? "Further analysis"}`,
        `- Refs: ${unk.refs ?? "—"}`,
      ].join("\n");
    })
    .join("\n\n") + "\n";
}

const HEADING_DOMAIN_MAP: Record<string, string[]> = {
  "architecture": ["architecture_design"],
  "security": ["security_fundamentals", "identity_access_management"],
  "auth": ["identity_access_management", "security_fundamentals"],
  "data": ["databases", "storage_fundamentals"],
  "api": ["apis_integrations"],
  "integration": ["apis_integrations"],
  "test": ["testing_qa"],
  "deploy": ["ci_cd_devops", "cloud_fundamentals"],
  "monitor": ["observability_sre"],
  "compliance": ["compliance_governance"],
  "cache": ["caching"],
  "search": ["search_retrieval"],
  "error": ["observability_sre"],
  "performance": ["observability_sre"],
  "permission": ["identity_access_management"],
  "accessibility": ["accessibility", "design"],
  "design": ["design", "ux"],
  "product": ["product", "requirements"],
  "requirement": ["product", "requirements"],
  "user": ["product", "ux"],
  "persona": ["product", "ux"],
};

function getRelevantKnowledge(title: string, knowledge?: KnowledgeContext): KIDEntry[] {
  if (!knowledge || knowledge.resolvedKids.length === 0) return [];

  const titleWords = title.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3);
  const domainKeywords = [...titleWords];

  for (const word of titleWords) {
    for (const [keyword, domains] of Object.entries(HEADING_DOMAIN_MAP)) {
      if (word.includes(keyword)) {
        domainKeywords.push(...domains);
      }
    }
  }

  const citations = getKnowledgeCitationsForDomain(knowledge, [...new Set(domainKeywords)]);
  return citations.slice(0, 5);
}

function buildKnowledgeSourceMaterial(kids: KIDEntry[]): string {
  if (kids.length === 0) return "";

  const parts: string[] = [];
  for (const kid of kids) {
    if (kid.coreContent && kid.coreContent.length > 10) {
      parts.push(`### ${kid.title} [${kid.type}]\n${kid.coreContent}`);
    }
  }
  return parts.join("\n\n");
}

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string | null } }>;
}

let _openaiClient: any = null;

async function getOpenAIClient(): Promise<any | null> {
  if (_openaiClient) return _openaiClient;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  if (!apiKey) return null;
  try {
    const mod = await import("openai");
    const OpenAI = mod.default ?? mod;
    _openaiClient = new OpenAI({ apiKey, baseURL });
    return _openaiClient;
  } catch {
    return null;
  }
}

async function synthesizeBatchSections(
  sections: Array<{ title: string; knowledgeContent: string }>,
  templateTitle: string,
  projectContext: string,
): Promise<Record<string, string>> {
  const client = await getOpenAIClient();
  if (!client) return {};

  const sectionList = sections.map((s, i) => {
    if (s.knowledgeContent && s.knowledgeContent.length > 50) {
      return `### SECTION_${i}: ${s.title}\nReference Material:\n${s.knowledgeContent.substring(0, 800)}`;
    }
    return `### SECTION_${i}: ${s.title}\n(No reference material — synthesize from project context and template purpose)`;
  }).join("\n\n---\n\n");

  try {
    console.log(`    [IA-synth] Calling LLM for "${templateTitle}" (${sections.length} sections)...`);
    const response: OpenAIResponse = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an Internal Agent (IA) filling documentation template sections for a software project. Write content for multiple sections at once. Use reference material from the knowledge library when provided; otherwise synthesize content from the project context and the section's purpose.

Rules:
- Write concrete, project-specific content — not generic placeholders or filler
- Adapt knowledge and project context to produce substantive technical documentation
- When no reference material is provided, derive content from the project name, features, constraints, audience, and the section title's implied purpose
- Professional technical documentation style with markdown formatting (use bullet lists, tables, bold headings as appropriate)
- Do not reference KIDs, knowledge library identifiers, or cite sources
- Never write "to be determined" or "to be filled" — always write actionable content based on available context
- Keep each section concise but substantive (50-200 words each)
- Respond with valid JSON: { "sections": { "SECTION_0": "content...", "SECTION_1": "content...", ... } }
- If you truly cannot write meaningful content for a section, set its value to null`,
        },
        {
          role: "user",
          content: `## Template: ${templateTitle}

## Project Context:
${projectContext}

## Sections to Fill:

${sectionList}

Write the content for each section. Return valid JSON with a "sections" object mapping SECTION_N keys to content strings.`,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const usage = (response as any).usage;
    const usedTokens = usage ? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0) : 0;
    console.log(`    [IA-synth] LLM response received for "${templateTitle}" (${usedTokens} tokens)`);
    if (usage) {
      recordUsage({
        stage: "S7_RENDER_DOCS",
        templateId: templateTitle.split(" — ")[0]?.trim(),
        model: "gpt-4o",
        promptTokens: usage.prompt_tokens ?? 0,
        completionTokens: usage.completion_tokens ?? 0,
      });
    }

    const result = response.choices[0]?.message?.content ?? null;
    if (!result) return {};

    try {
      const parsed = JSON.parse(result) as { sections?: Record<string, string> };
      const output: Record<string, string> = {};
      if (parsed.sections) {
        for (const [key, value] of Object.entries(parsed.sections)) {
          if (value && typeof value === "string" && value.length > 10) {
            const idx = parseInt(key.replace("SECTION_", ""), 10);
            if (!isNaN(idx) && sections[idx]) {
              output[sections[idx].title] = value;
            }
          }
        }
      }
      return output;
    } catch {
      return {};
    }
  } catch (err: any) {
    console.log(`  [IA] Batch synthesis failed for "${templateTitle}": ${err.message ?? err}`);
    return {};
  }
}

function buildProjectContext(ctx: FillContext): string {
  const project = (ctx.normalizedInput.project ?? {}) as Record<string, unknown>;
  const routing = (ctx.spec.routing ?? ctx.normalizedInput.routing ?? {}) as Record<string, unknown>;
  const entities = (ctx.spec.entities ?? {}) as Record<string, unknown>;
  const rules = (ctx.spec.rules ?? {}) as Record<string, unknown>;
  const constraints = (ctx.normalizedInput.constraints ?? ctx.spec.constraints ?? {}) as Record<string, unknown>;

  const lines: string[] = [];
  lines.push(`Project Name: ${project.project_name ?? "Untitled"}`);
  lines.push(`Overview: ${project.project_overview ?? "No overview"}`);
  lines.push(`Category: ${routing.category ?? "software"}`);
  lines.push(`Type: ${routing.type_preset ?? "general"}`);
  lines.push(`Audience: ${routing.audience_context ?? "general"}`);
  lines.push(`Build Target: ${routing.build_target ?? "production"}`);

  const features = (entities.features ?? []) as Array<Record<string, unknown>>;
  if (features.length > 0) {
    lines.push(`Features: ${features.map((f) => `${f.feature_id}: ${f.name} — ${f.description ?? ""}`).join("; ")}`);
  }

  const dod = rules.definition_of_done;
  if (dod) lines.push(`Definition of Done: ${dod}`);

  const mustAlways = (rules.must_always ?? []) as string[];
  if (mustAlways.length > 0) lines.push(`Must Always: ${mustAlways.join("; ")}`);

  const mustNever = (rules.must_never ?? []) as string[];
  if (mustNever.length > 0) lines.push(`Must Never: ${mustNever.join("; ")}`);

  if (constraints.auth) lines.push(`Auth: ${JSON.stringify(constraints.auth)}`);
  if (constraints.nfr) lines.push(`NFR: ${JSON.stringify(constraints.nfr)}`);

  const workflows = (entities.workflows ?? []) as Array<Record<string, unknown>>;
  if (workflows.length > 0) {
    lines.push(`Workflows: ${workflows.map((w) => `${w.workflow_id ?? w.name}: ${w.description ?? ""}`).join("; ")}`);
  }

  const roles = (entities.roles ?? []) as Array<Record<string, unknown>>;
  if (roles.length > 0) {
    lines.push(`Roles: ${roles.map((r) => `${r.role_id ?? r.name}: ${r.description ?? ""}`).join("; ")}`);
  }

  const dataObjects = (entities.data_objects ?? entities.data_entities ?? []) as Array<Record<string, unknown>>;
  if (dataObjects.length > 0) {
    lines.push(`Data Objects: ${dataObjects.map((d) => `${d.name ?? d.entity_id}: ${d.description ?? ""}`).join("; ")}`);
  }

  return lines.join("\n");
}

const PLACEHOLDER_TEXT = "_Content to be filled during build execution._\n";

function isPlaceholderContent(text: string): boolean {
  const lower = text.toLowerCase();
  return lower.includes("content to be filled during build execution") ||
    lower.includes("to be determined") ||
    lower.includes("to be defined during") ||
    lower.includes("to be defined per") ||
    lower.includes("no items defined") ||
    lower.includes("no specific risks identified") ||
    lower.includes("standards resolved per standards snapshot") ||
    lower.includes("work breakdown defined in planning artifacts") ||
    lower.includes("deployment model to be determined") ||
    lower.includes("security and authentication requirements to be defined") ||
    lower.includes("no integration points defined") ||
    lower.includes("no explicit constraints defined") ||
    lower.includes("no non-functional requirements defined") ||
    lower.includes("dependencies to be determined") ||
    lower.includes("no overview provided") ||
    lower.includes("no unknowns identified");
}

function collectPlaceholderSections(
  headings: OutputHeading[],
  headingContents: string[],
  knowledge?: KnowledgeContext,
): Array<{ index: number; title: string; knowledgeContent: string }> {
  const sections: Array<{ index: number; title: string; knowledgeContent: string }> = [];
  for (let i = 0; i < headings.length; i++) {
    if (isPlaceholderContent(headingContents[i])) {
      const relevantKids = getRelevantKnowledge(headings[i].title, knowledge);
      const knowledgeSource = relevantKids.length > 0 ? buildKnowledgeSourceMaterial(relevantKids) : "";
      sections.push({ index: i, title: headings[i].title, knowledgeContent: knowledgeSource });
    }
  }
  return sections;
}

function buildHeadingContentInner(
  heading: OutputHeading,
  ctx: FillContext,
  resolvedCount: { n: number },
  unknownsList: FilledTemplate["unknowns"],
  generatedUnknowns?: CAN03Unknown[],
  templateId?: string,
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
    if (generatedUnknowns && templateId) {
      generatedUnknowns.push(generateUnknown({
        templateId,
        sectionTitle: heading.title,
        fieldPath: "technology_stack",
        unknownType: "unresolved_decision",
        severity: "low",
        blocking: false,
        summary: "Technology stack not yet determined",
        detail: "Specific technology choices for frontend, backend, and database layers have not been specified in the project input.",
        impact: "Technology decisions deferred to build execution phase.",
        whatIsNeeded: "Specify preferred technologies for each layer or allow defaults from standards.",
      }));
    }
    return lines.join("\n");
  }

  if (titleLower.includes("integration point")) {
    const intgs = (entities.integrations ?? []) as unknown[];
    if (Array.isArray(intgs) && intgs.length > 0) {
      lines.push(renderEntityArray(intgs, heading.tableColumns.length > 0 ? heading.tableColumns : undefined));
    } else {
      lines.push("_No integration points defined. To be determined during design phase._\n");
      unknownsList.push({ placeholder: "integration_points", status: "UNKNOWN_ALLOWED" });
      if (generatedUnknowns && templateId) {
        generatedUnknowns.push(generateUnknown({
          templateId,
          sectionTitle: heading.title,
          fieldPath: "integration_points",
          unknownType: "missing_requirement",
          severity: "low",
          blocking: false,
          summary: "Integration points not defined",
          detail: "No external integration points were specified in the project input.",
          impact: "Integration design deferred to later phase.",
          whatIsNeeded: "Identify external systems, APIs, or services this project integrates with.",
        }));
      }
    }
    resolvedCount.n += 1;
    return lines.join("\n");
  }

  if (titleLower.includes("deployment") || titleLower.includes("infrastructure")) {
    lines.push("_Deployment model to be determined during architecture design phase._\n");
    unknownsList.push({ placeholder: "deployment_model", status: "UNKNOWN_ALLOWED" });
    if (generatedUnknowns && templateId) {
      generatedUnknowns.push(generateUnknown({
        templateId,
        sectionTitle: heading.title,
        fieldPath: "deployment_model",
        unknownType: "unresolved_decision",
        severity: "low",
        blocking: false,
        summary: "Deployment model not yet determined",
        detail: "Deployment and infrastructure details have not been specified in the project input.",
        impact: "Deployment architecture deferred to design phase.",
        whatIsNeeded: "Define deployment target (cloud, on-prem, hybrid) and infrastructure requirements.",
      }));
    }
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

  lines.push(PLACEHOLDER_TEXT);
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

export async function fillTemplate(
  templateEntry: SelectedTemplate,
  templateContent: string,
  context: FillContext,
): Promise<FilledTemplate> {
  const headings = extractOutputFormat(templateContent);
  const requiredFields = extractRequiredFieldsTable(templateContent);
  const unknownsList: FilledTemplate["unknowns"] = [];
  const generatedUnknowns: CAN03Unknown[] = [];
  _unknownCounter = 0;
  const resolvedCount = { n: 0 };

  const titleMatch = templateContent.match(/^# (.+)/m);
  const templateTitle = titleMatch ? titleMatch[1] : `${templateEntry.template_id} — Document`;

  const purposeMatch = templateContent.match(/## 2\.\s*Purpose\s*\n([\s\S]*?)(?=\n## \d+\.|$)/);
  const purpose = purposeMatch ? purposeMatch[1].trim().split("\n")[0] : "";

  const meta = (context.spec.meta ?? {}) as Record<string, unknown>;
  const project = (context.normalizedInput.project ?? {}) as Record<string, unknown>;
  const projectName = String(project.project_name ?? meta.project_name ?? "Project");

  const projectContext = buildProjectContext(context);

  const lines: string[] = [];
  lines.push(`# ${templateTitle}\n`);
  lines.push(`> **Project:** ${projectName} | **Spec:** ${context.spec_id} | **Run:** ${context.run_id}\n`);
  if (purpose) lines.push(`_${purpose}_\n`);
  lines.push("---\n");

  if (headings.length > 0) {
    const headingContents: string[] = [];
    for (const heading of headings) {
      headingContents.push(buildHeadingContentInner(heading, context, resolvedCount, unknownsList, generatedUnknowns, templateEntry.template_id));
    }

    const placeholderSections = collectPlaceholderSections(headings, headingContents, context.knowledge);

    if (placeholderSections.length > 0) {
      const synthesized = await synthesizeBatchSections(
        placeholderSections.map((s) => ({ title: s.title, knowledgeContent: s.knowledgeContent })),
        templateTitle,
        projectContext,
      );

      for (const section of placeholderSections) {
        const content = synthesized[section.title];
        if (content) {
          headingContents[section.index] = `## ${section.title}\n\n${content}\n`;
        }
      }
    }

    for (const content of headingContents) {
      lines.push(content);
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
        const unk = generateUnknown({
          templateId: templateEntry.template_id,
          sectionTitle: field.field,
          fieldPath: field.source,
          unknownType: "missing_requirement",
          severity: "low",
          blocking: false,
          summary: `${field.field} not resolved from project input`,
          detail: `The field "${field.field}" (source: ${field.source}) could not be resolved from available context data.`,
          impact: "Section left as unknown; may require follow-up.",
          whatIsNeeded: `Provide data for "${field.field}" or update project input.`,
        });
        generatedUnknowns.push(unk);
        lines.push(`> **${unk.unknown_id}**: [${unk.unknown_type}] ${unk.summary}\n> - Impact: ${unk.severity}\n> - Blocking: ${unk.blocking ? "Yes" : "No"}\n> - Needs: ${unk.what_is_needed_to_resolve}\n`);
        unknownsList.push({ placeholder: field.field, status: "UNKNOWN_ALLOWED" });
      } else {
        const unk = generateUnknown({
          templateId: templateEntry.template_id,
          sectionTitle: field.field,
          fieldPath: field.source,
          unknownType: "missing_requirement",
          severity: "high",
          blocking: true,
          summary: `Required field "${field.field}" not resolved`,
          detail: `The required field "${field.field}" (source: ${field.source}) could not be resolved and is not allowed to remain unknown.`,
          impact: "Template completeness blocked; this field must be resolved.",
          whatIsNeeded: `Provide data for required field "${field.field}".`,
        });
        generatedUnknowns.push(unk);
        lines.push(`> **${unk.unknown_id}**: [${unk.unknown_type}] ${unk.summary}\n> - Impact: ${unk.severity}\n> - Blocking: Yes\n> - Needs: ${unk.what_is_needed_to_resolve}\n`);
        unknownsList.push({ placeholder: field.field, status: "BLOCKED" });
      }
    }

    if (requiredFields.length === 0) {
      const entities = (context.spec.entities ?? {}) as Record<string, unknown>;
      const routing = (context.spec.routing ?? {}) as Record<string, unknown>;

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
    generated_unknowns: generatedUnknowns,
  };
}
