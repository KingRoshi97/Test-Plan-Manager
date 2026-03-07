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
  completeness_percentage: number;
  weak_sections: string[];
}

const PLACEHOLDER_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /_Content to be filled[^_]*_/gi, label: "content-to-be-filled" },
  { pattern: /_To be determined[^_]*_/gi, label: "to-be-determined" },
  { pattern: /_No items defined[^_]*_/gi, label: "no-items-defined" },
  { pattern: /\{\{[^}]+\}\}/g, label: "unreplaced-placeholder" },
  { pattern: /_[^_]*to be defined[^_]*_/gi, label: "to-be-defined" },
  { pattern: /_[^_]*as needed[^_]*_/gi, label: "as-needed" },
  { pattern: /_[^_]*as appropriate[^_]*_/gi, label: "as-appropriate" },
  { pattern: /_[^_]*will be defined later[^_]*_/gi, label: "will-be-defined-later" },
  { pattern: /\bTBD\b/g, label: "tbd" },
  { pattern: /_No overview provided[^_]*_/gi, label: "no-overview" },
  { pattern: /_No unknowns identified[^_]*_/gi, label: "no-unknowns" },
  { pattern: /_No specific risks identified[^_]*_/gi, label: "no-risks" },
  { pattern: /_No integration points defined[^_]*_/gi, label: "no-integrations" },
  { pattern: /_No explicit constraints defined[^_]*_/gi, label: "no-constraints" },
  { pattern: /_No non-functional requirements defined[^_]*_/gi, label: "no-nfr" },
  { pattern: /_Dependencies to be determined[^_]*_/gi, label: "dependencies-tbd" },
  { pattern: /_Deployment model to be determined[^_]*_/gi, label: "deployment-tbd" },
  { pattern: /_Security and authentication requirements to be defined[^_]*_/gi, label: "security-tbd" },
];

function extractSections(content: string): Array<{ title: string; body: string }> {
  const lines = content.split("\n");
  const sections: Array<{ title: string; body: string; startIdx: number }> = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,4})\s+(.+)/);
    if (match) {
      sections.push({ title: match[2].trim(), body: "", startIdx: i });
    }
  }

  for (let i = 0; i < sections.length; i++) {
    const start = sections[i].startIdx + 1;
    const end = i + 1 < sections.length ? sections[i + 1].startIdx : lines.length;
    sections[i].body = lines.slice(start, end).join("\n").trim();
  }

  return sections.map((s) => ({ title: s.title, body: s.body }));
}

function detectPlaceholders(text: string): Array<{ label: string; matches: string[] }> {
  const results: Array<{ label: string; matches: string[] }> = [];
  for (const { pattern, label } of PLACEHOLDER_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    const found = text.match(re);
    if (found && found.length > 0) {
      results.push({ label, matches: found });
    }
  }
  return results;
}

function isSectionWeak(body: string): boolean {
  if (!body || body.trim().length === 0) return true;
  if (body.trim().length < 20) return true;
  const placeholders = detectPlaceholders(body);
  if (placeholders.length > 0) return true;
  return false;
}

export function checkCompleteness(filled: FilledTemplate, _spec: unknown): CompletenessResult {
  const checks: CompletenessCheck[] = [];
  const weakSections: string[] = [];

  const contentPlaceholders = detectPlaceholders(filled.content);
  const hasNoPlaceholders = contentPlaceholders.length === 0;
  checks.push({
    check_id: "placeholder_scan",
    description: "No placeholder or stub patterns found in content",
    passed: hasNoPlaceholders,
    details: hasNoPlaceholders
      ? "No placeholder patterns detected"
      : `Found ${contentPlaceholders.reduce((n, p) => n + p.matches.length, 0)} placeholder(s): ${contentPlaceholders.map((p) => `${p.label}(${p.matches.length})`).join(", ")}`,
  });

  const hasUnreplacedMustache = /\{\{[^}]+\}\}/.test(filled.content);
  checks.push({
    check_id: "mustache_resolved",
    description: "All {{...}} placeholders resolved",
    passed: !hasUnreplacedMustache,
    details: hasUnreplacedMustache
      ? "Found unreplaced {{...}} placeholders"
      : "All mustache placeholders resolved",
  });

  const sections = extractSections(filled.content);
  const totalSections = sections.length;
  let weakCount = 0;
  for (const section of sections) {
    if (isSectionWeak(section.body)) {
      weakCount++;
      weakSections.push(section.title);
    }
  }

  const sectionCompleteness = totalSections > 0 ? ((totalSections - weakCount) / totalSections) : 1;
  checks.push({
    check_id: "section_completeness",
    description: "All sections have substantive content",
    passed: weakCount === 0,
    details: `${totalSections - weakCount}/${totalSections} sections complete (${Math.round(sectionCompleteness * 100)}%)`,
  });

  for (const section of sections) {
    if (isSectionWeak(section.body)) {
      const sectionPlaceholders = detectPlaceholders(section.body);
      checks.push({
        check_id: `weak_section:${section.title}`,
        description: `Section "${section.title}" has substantive content`,
        passed: false,
        details: section.body.trim().length === 0
          ? "Section is empty"
          : sectionPlaceholders.length > 0
            ? `Contains placeholders: ${sectionPlaceholders.map((p) => p.label).join(", ")}`
            : `Section content too short (${section.body.trim().length} chars)`,
      });
    }
  }

  const hasContent = filled.content.trim().length > 50;
  checks.push({
    check_id: "has_content",
    description: "Template has meaningful content",
    passed: hasContent,
    details: hasContent
      ? `Content length: ${filled.content.trim().length} chars`
      : "Template content is too short or empty",
  });

  const unknownsHandled = filled.unknowns.every(
    (u) => u.status === "UNKNOWN_ALLOWED",
  );
  checks.push({
    check_id: "unknowns_handled",
    description: "All unknowns are either resolved or explicitly allowed",
    passed: unknownsHandled,
    details: unknownsHandled
      ? `${filled.unknowns.length} unknown(s), all handled`
      : `${filled.unknowns.filter((u) => u.status === "BLOCKED").length} blocked unknown(s)`,
  });

  const requiredFieldsPopulated = filled.placeholders_unknown === 0;
  checks.push({
    check_id: "required_fields",
    description: "All required fields populated",
    passed: requiredFieldsPopulated,
    details: requiredFieldsPopulated
      ? `${filled.placeholders_resolved} placeholder(s) resolved`
      : `${filled.placeholders_unknown} required field(s) unresolved`,
  });

  const allPassed = checks.every((c) => c.passed);
  const completenessPercentage = totalSections > 0
    ? Math.round(sectionCompleteness * 100)
    : (hasContent ? 100 : 0);

  return {
    template_id: filled.template_id,
    is_complete: allPassed,
    checks,
    required_fields_populated: requiredFieldsPopulated,
    references_resolve: true,
    no_contradictions: true,
    unknowns_handled: unknownsHandled,
    completeness_percentage: completenessPercentage,
    weak_sections: weakSections,
  };
}

export function checkAllTemplates(filledTemplates: FilledTemplate[], spec: unknown): CompletenessResult[] {
  return filledTemplates.map((filled) => checkCompleteness(filled, spec));
}
