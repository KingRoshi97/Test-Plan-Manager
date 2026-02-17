#!/usr/bin/env node
/**
 * AXION Content Fill Script
 * 
 * Standalone CLI for UNKNOWN detection, document priority ordering,
 * doc-type-aware AI prompting, and cascading fills.
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-content-fill.ts --project <name> --scan
 *   npx tsx axion/scripts/axion-content-fill.ts --project <name> --fill [--module <mod>]
 *   npx tsx axion/scripts/axion-content-fill.ts --project <name> --cascade --target <file> --target-module <mod>
 *   npx tsx axion/scripts/axion-content-fill.ts --project <name> --find-next
 *   npx tsx axion/scripts/axion-content-fill.ts --project <name> --upgrade --target <file> --target-module <mod>
 * 
 * Environment:
 *   AXION_PROJECT_NAME  — Project name (fallback for --project)
 *   AXION_PROJECT_IDEA  — Project idea/description for AI context
 *   AXION_REVISION      — Current revision number (for upgrade-aware fills)
 *   AXION_UPGRADE_NOTES — User upgrade notes (for upgrade-aware fills)
 *   AXION_KIT_TYPE      — 'original' or 'upgrade'
 *   AI_INTEGRATIONS_OPENAI_API_KEY — OpenAI API key
 *   AI_INTEGRATIONS_OPENAI_BASE_URL — OpenAI base URL
 */

import * as fs from 'fs';
import * as path from 'path';
import { resolveForDomain, resolveForDocType, buildPromptContext, type ResolvedKnowledge } from './lib/knowledge-resolver';
// @ts-ignore — .mjs module, types inferred at runtime
import { isStageDone, markStageDone, markStageFailed, ensurePrereqs } from './_axion_module_mode.mjs';

// ─── Document Priority & Type System ────────────────────────────────────────

export const DOC_PRIORITY_ORDER = [
  'RPBS',
  'REBS',
  'README',
  'DDES',
  'UX_Foundations',
  'UI_Constraints',
  'DIM',
  'SCREENMAP',
  'TESTPLAN',
  'COMPONENT_LIBRARY',
  'COPY_GUIDE',
  'BELS',
  'OPEN_QUESTIONS',
];

export function getDocPriority(fileName: string): number {
  for (let i = 0; i < DOC_PRIORITY_ORDER.length; i++) {
    if (fileName.startsWith(DOC_PRIORITY_ORDER[i])) return i;
  }
  return DOC_PRIORITY_ORDER.length;
}

export const DOC_TYPE_MAP: Record<string, { label: string; guidance: string }> = {
  'RPBS': {
    label: 'Requirements & Product Behavior Specification (RPBS)',
    guidance: `For RPBS documents:
   - Product overview should describe the application's core purpose and value proposition.
   - Target users should define specific personas with realistic demographics and needs.
   - Feature descriptions should be concrete and actionable, not vague.
   - Non-functional requirements should have specific, measurable targets.
   - Business rules should reflect real constraints for this type of application.`,
  },
  'REBS': {
    label: 'Requirements & Entity Behavior Specification (REBS)',
    guidance: `For REBS documents:
   - Entity definitions should model the core business objects of this application.
   - Behaviors should describe realistic state transitions and business rules.
   - Relationships between entities should reflect actual domain logic.
   - Validation rules should be specific and enforceable.`,
  },
  'BELS': {
    label: 'Business Entity Logic Specification (BELS)',
    guidance: `For BELS documents:
   - Policy rules should describe real business logic for this type of application.
   - Invariant guarantees should define conditions that must always be true regardless of state.
   - State machines should model realistic entity lifecycles for this domain.
   - Validation rules should cover fields that would exist in this kind of application.
   - Side effect rules should define what happens after a business event succeeds (notifications, cascades, sync).
   - Reason codes should be specific SCREAMING_SNAKE_CASE identifiers.
   - Error codes should follow the pattern: MODULE_PREFIX_SPECIFIC_ERROR.
   - Computed/derived values should specify formulas and where computation happens (server/client/both).
   - Authorization rules should define who can perform what actions, derived from actors and permissions.
   - Rate limits and quotas should specify throttling rules per resource, scope, and exceeded behavior.`,
  },
  'OPEN_QUESTIONS': {
    label: 'Open Questions',
    guidance: `For Open Questions documents:
   - Questions should be specific to the project's domain and implementation challenges.
   - Resolution tracking should have meaningful statuses and resolution notes.`,
  },
  'DDES': {
    label: 'Domain-Driven Entity Specification (DDES)',
    guidance: `For DDES documents:
   - Purpose should explain why the domain exists and what value it provides.
   - Entity definitions should model real data structures for this application domain.
   - Relationships between entities should reflect actual business relationships.
   - Attributes should have realistic types, constraints, and descriptions.
   - Include proper primary keys, foreign keys, and indexes.
   - Entity lifecycle rules should define creation, update, and deletion policies for each owned entity.
   - Data retention and archival should specify how long data is kept and what happens to old data.
   - Domain events should list events emitted and consumed, with payload summaries and consumer lists.`,
  },
  'DIM': {
    label: 'Domain Integration Map (DIM)',
    guidance: `For DIM documents:
   - Integration points should reflect real external services or internal module boundaries.
   - Data flows should model realistic input/output between systems.
   - Protocols and authentication methods should be appropriate for the integration type.
   - Error handling strategies should be specific to each integration point.
   - Standard error response contract should define the JSON shape all error responses use.
   - API versioning strategy should specify the versioning mechanism and deprecation policy.
   - Interface dependencies graph should summarize data flow between domains as a text diagram.`,
  },
  'TESTPLAN': {
    label: 'Test Plan',
    guidance: `For Test Plan documents:
   - Test cases should cover realistic scenarios for this application domain.
   - Include unit, integration, and end-to-end test scenarios.
   - Acceptance criteria should be specific and measurable.
   - Edge cases should reflect real-world usage patterns.
   - Accessibility tests should verify WCAG 2.1 AA compliance for keyboard nav, screen readers, and focus management.
   - Security tests should cover authentication bypass, authorization bypass, input sanitization, and rate limiting.
   - Regression test strategy should define CI gate tests, merge gate tests, and bug fix policies.`,
  },
  'COMPONENT_LIBRARY': {
    label: 'Component Library',
    guidance: `For Component Library documents:
   - Components should be real UI components needed for this application.
   - Props and variants should reflect actual component API designs.
   - Usage examples should show realistic implementation patterns.
   - Accessibility requirements should define ARIA roles, keyboard navigation, screen reader support, and focus management for each interactive component.
   - Component theming should specify light/dark mode adaptations and semantic color tokens used.
   - Animation and transition specs should define subtle motion (150-300ms), triggers, and reduced-motion fallbacks.`,
  },
  'COPY_GUIDE': {
    label: 'Copy Guide',
    guidance: `For Copy Guide documents:
   - Tone and voice guidelines should match the application's target audience.
   - Error messages should be user-friendly and actionable.
   - Microcopy examples should cover real UI touchpoints in this application.
   - Terminology should be consistent with the project's domain.
   - Notification copy should define text for in-app, email, and push notifications triggered by business events.
   - Accessibility copy should define ARIA labels, alt text patterns, and screen reader announcements for all interactive elements.
   - Localization notes should specify string concatenation policy, plural handling, and date/number format rules.`,
  },
  'SCREENMAP': {
    label: 'Screen Map',
    guidance: `For Screen Map documents:
   - Screens should represent real views/pages needed for this application.
   - Navigation flows should model realistic user journeys.
   - Screen descriptions should include key components and data displayed.
   - User actions on each screen should be specific and actionable.
   - Loading and error states should define what the user sees during data fetching and when errors occur for each screen.
   - Responsive breakpoint behavior should specify layout adaptations at mobile, tablet, and desktop breakpoints.
   - Deep linking requirements should define which screens support direct URL access and auth redirect behavior.`,
  },
  'UI_Constraints': {
    label: 'UI Constraints',
    guidance: `For UI Constraints documents:
   - Layout rules should reflect real responsive design requirements.
   - Spacing and sizing constraints should be practical for the application type.
   - Accessibility constraints should follow WCAG guidelines relevant to this domain.
   - Performance constraints should be realistic for the target platform.`,
  },
  'UX_Foundations': {
    label: 'UX Foundations',
    guidance: `For UX Foundations documents:
   - Design principles should align with the application's purpose and target users.
   - Interaction patterns should be appropriate for the application type.
   - User personas should represent realistic target users for this project.
   - Usability heuristics should be specific and measurable.`,
  },
  'README': {
    label: 'Module README',
    guidance: `For README documents:
   - Module purpose should clearly describe what this domain module handles.
   - Key responsibilities should be specific to the application's needs.
   - Dependencies on other modules should be accurate and meaningful.
   - Setup or configuration notes should be practical.`,
  },
};

export function detectDocType(fileName: string): { label: string; guidance: string } {
  for (const [prefix, info] of Object.entries(DOC_TYPE_MAP)) {
    if (fileName.startsWith(prefix)) return info;
  }
  return {
    label: 'Software Specification Document',
    guidance: `Fill in all UNKNOWN placeholders with content that is specific, realistic, and appropriate for this project and domain.`,
  };
}

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface UnknownScanResult {
  module: string;
  file: string;
  relativePath: string;
  unknownCount: number;
  sections: string[];
  docType?: string;
}

export interface SectionDetail {
  name: string;
  unknownCount: number;
  snippet: string;
}

export interface HierarchicalUnknownTarget {
  file: string;
  relativePath: string;
  module: string;
  docType: string;
  docTypeLabel: string;
  priority: number;
  unknownCount: number;
  sections: SectionDetail[];
}

export interface ScanReport {
  totalUnknowns: number;
  totalFiles: number;
  filesWithUnknowns: UnknownScanResult[];
}

export interface ContentFillResult {
  file: string;
  module: string;
  status: 'filled' | 'skipped' | 'error';
  unknownsBefore: number;
  unknownsAfter: number;
  error?: string;
}

export interface ContentFillReport {
  totalFilesFilled: number;
  totalFilesSkipped: number;
  totalFilesErrored: number;
  results: ContentFillResult[];
}

export interface CascadeFillResult {
  targetFilled: ContentFillResult;
  cascadeResults: ContentFillResult[];
  remainingScan: ScanReport;
  nextTarget: HierarchicalUnknownTarget | null;
}

// ─── Core Functions ─────────────────────────────────────────────────────────

const UNKNOWN_FALSE_POSITIVE_PATTERNS = [
  /write\s+[`"']UNKNOWN[`"']/,
  /\[TBD\]\s+or\s+[`"']?UNKNOWN[`"']?/,
  /No raw.*UNKNOWN.*markers/,
  /UNKNOWN_DETECTION/,
  /PLACEHOLDER_POLICY/,
];

export function countUnknowns(content: string): number {
  const lines = content.split('\n');
  let count = 0;
  for (const line of lines) {
    if (UNKNOWN_FALSE_POSITIVE_PATTERNS.some(p => p.test(line))) continue;
    const matches = line.match(/UNKNOWN/g);
    if (matches) count += matches.length;
  }
  return count;
}

export function findSectionsWithUnknowns(content: string): string[] {
  const sections: string[] = [];
  const sectionRegex = /^## (.+)$/gm;
  let match;
  const sectionPositions: { name: string; start: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    sectionPositions.push({ name: match[1], start: match.index });
  }

  for (let i = 0; i < sectionPositions.length; i++) {
    const start = sectionPositions[i].start;
    const end = i + 1 < sectionPositions.length ? sectionPositions[i + 1].start : content.length;
    const sectionContent = content.substring(start, end);
    if (countUnknowns(sectionContent) > 0) {
      sections.push(sectionPositions[i].name);
    }
  }

  return sections;
}

function getAllMdFilesInModule(moduleDir: string): string[] {
  if (!fs.existsSync(moduleDir)) return [];
  return fs.readdirSync(moduleDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(moduleDir, f));
}

function getSectionDetails(content: string): SectionDetail[] {
  const details: SectionDetail[] = [];
  const sectionRegex = /^## (.+)$/gm;
  let match;
  const positions: { name: string; start: number }[] = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    positions.push({ name: match[1], start: match.index });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].start;
    const end = i + 1 < positions.length ? positions[i + 1].start : content.length;
    const sectionContent = content.substring(start, end);
    const unkCount = countUnknowns(sectionContent);
    if (unkCount > 0) {
      const lines = sectionContent.split('\n').slice(0, 8);
      details.push({
        name: positions[i].name,
        unknownCount: unkCount,
        snippet: lines.join('\n').substring(0, 400),
      });
    }
  }

  return details;
}

// ─── Discovery ──────────────────────────────────────────────────────────────

export function discoverAllMdFiles(projectRoot: string): { file: string; module: string; relativePath: string }[] {
  const results: { file: string; module: string; relativePath: string }[] = [];

  const sourceDocsDir = path.join(projectRoot, 'axion', 'docs', 'product');
  if (fs.existsSync(sourceDocsDir)) {
    const files = fs.readdirSync(sourceDocsDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const fullPath = path.join(sourceDocsDir, f);
      results.push({
        file: fullPath,
        module: '_source',
        relativePath: path.relative(projectRoot, fullPath),
      });
    }
  }

  const domainsDir = path.join(projectRoot, 'axion', 'domains');
  if (fs.existsSync(domainsDir)) {
    const modules = fs.readdirSync(domainsDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name);
    for (const mod of modules) {
      const moduleDir = path.join(domainsDir, mod);
      const mdFiles = getAllMdFilesInModule(moduleDir);
      for (const f of mdFiles) {
        results.push({
          file: f,
          module: mod,
          relativePath: path.relative(projectRoot, f),
        });
      }
    }
  }

  return results;
}

export function getAllModulesInWorkspace(projectRoot: string): string[] {
  const domainsDir = path.join(projectRoot, 'axion', 'domains');
  if (!fs.existsSync(domainsDir)) return [];
  return fs.readdirSync(domainsDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !e.name.startsWith('.'))
    .map(e => e.name);
}

// ─── Scanning ───────────────────────────────────────────────────────────────

export function scanFile(filePath: string, projectRoot: string): UnknownScanResult | null {
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const unknownCount = countUnknowns(content);

  if (unknownCount === 0) return null;

  const module = path.basename(path.dirname(filePath));
  return {
    module,
    file: filePath,
    relativePath: path.relative(projectRoot, filePath),
    unknownCount,
    sections: findSectionsWithUnknowns(content),
  };
}

export function scanModuleForUnknowns(projectRoot: string, moduleName: string): UnknownScanResult[] {
  const moduleDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const results: UnknownScanResult[] = [];

  const mdFiles = getAllMdFilesInModule(moduleDir);
  for (const filePath of mdFiles) {
    const result = scanFile(filePath, projectRoot);
    if (result) results.push(result);
  }

  return results;
}

export function scanAllModulesForUnknowns(projectRoot: string, modules: string[]): ScanReport {
  const filesWithUnknowns: UnknownScanResult[] = [];
  let totalFiles = 0;

  for (const mod of modules) {
    const moduleDir = path.join(projectRoot, 'axion', 'domains', mod);
    const mdFiles = getAllMdFilesInModule(moduleDir);
    totalFiles += mdFiles.length;

    const results = scanModuleForUnknowns(projectRoot, mod);
    filesWithUnknowns.push(...results);
  }

  return {
    totalUnknowns: filesWithUnknowns.reduce((sum, r) => sum + r.unknownCount, 0),
    totalFiles,
    filesWithUnknowns,
  };
}

// ─── Target Finding ─────────────────────────────────────────────────────────

export function findNextTarget(projectRoot: string): HierarchicalUnknownTarget | null {
  const allFiles = discoverAllMdFiles(projectRoot);
  const candidates: HierarchicalUnknownTarget[] = [];

  for (const { file, module, relativePath } of allFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const unkCount = countUnknowns(content);
    if (unkCount === 0) continue;

    const fileName = path.basename(file);
    const docInfo = detectDocType(fileName);
    const priority = getDocPriority(fileName);
    const sections = getSectionDetails(content);

    candidates.push({
      file,
      relativePath,
      module,
      docType: fileName.replace(/\.md$/, '').replace(/_[a-z]+$/, ''),
      docTypeLabel: docInfo.label,
      priority,
      unknownCount: unkCount,
      sections,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.priority - b.priority);
  return candidates[0];
}

export function getAllTargets(projectRoot: string): HierarchicalUnknownTarget[] {
  const allFiles = discoverAllMdFiles(projectRoot);
  const candidates: HierarchicalUnknownTarget[] = [];

  for (const { file, module, relativePath } of allFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const unkCount = countUnknowns(content);
    if (unkCount === 0) continue;

    const fileName = path.basename(file);
    const docInfo = detectDocType(fileName);
    const priority = getDocPriority(fileName);
    const sections = getSectionDetails(content);

    candidates.push({
      file,
      relativePath,
      module,
      docType: fileName.replace(/\.md$/, '').replace(/_[a-z]+$/, ''),
      docTypeLabel: docInfo.label,
      priority,
      unknownCount: unkCount,
      sections,
    });
  }

  candidates.sort((a, b) => a.priority - b.priority);
  return candidates;
}

// ─── Stack Profile Resolution ────────────────────────────────────────────────

function resolveStackProfile(projectRoot: string): string {
  const registryPath = path.join(projectRoot, 'registry', 'stack_profile.json');
  const axionRegistryPath = path.join(projectRoot, 'axion', 'registry', 'stack_profile.json');
  const catalogPath = path.join(projectRoot, 'axion', 'config', 'stack_profiles.json');

  for (const p of [registryPath, axionRegistryPath]) {
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        return `TECHNOLOGY STACK (MANDATORY — do not contradict this):\n${JSON.stringify(data, null, 2)}`;
      } catch { /* ignore parse errors */ }
    }
  }

  if (fs.existsSync(catalogPath)) {
    try {
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
      const profiles = catalog.profiles || catalog;
      const defaultKey = Object.keys(profiles)[0];
      if (defaultKey && profiles[defaultKey]) {
        return `TECHNOLOGY STACK (from default profile "${defaultKey}" — do not contradict this):\n${JSON.stringify(profiles[defaultKey], null, 2)}`;
      }
    } catch { /* ignore parse errors */ }
  }

  return '';
}

// ─── Prompt Building ────────────────────────────────────────────────────────

function resolveKnowledgeContext(moduleName: string, fileName: string): string {
  try {
    const domainKnowledge = resolveForDomain(moduleName);
    const docType = fileName.replace(/\.md$/, '').replace(/_[a-z]+$/i, '');
    const docTypeKnowledge = resolveForDocType(docType);

    const merged: ResolvedKnowledge = {
      files: [],
      summary: `Knowledge for domain "${moduleName}" + doc type "${docType}"`,
    };
    const seen = new Set<string>();
    for (const f of [...domainKnowledge.files, ...docTypeKnowledge.files]) {
      if (seen.has(f.filename)) continue;
      seen.add(f.filename);
      merged.files.push(f);
    }

    if (merged.files.length === 0) return '';
    return '\n' + buildPromptContext(merged, 6000) + '\n';
  } catch {
    return '';
  }
}

function formatStructuredInput(structuredInput?: Record<string, string> | null): string {
  if (!structuredInput || Object.keys(structuredInput).length === 0) return '';

  const fieldLabels: Record<string, string> = {
    visionProblem: 'Problem Being Solved',
    visionTargetUsers: 'Target Users',
    visionSuccess: 'Success Criteria',
    visionGoals: 'Primary Goals',
    coreFeatures: 'Core Features (Must-Have)',
    niceToHaveFeatures: 'Nice-to-Have Features',
    coreEntities: 'Core Entities / Objects',
    userJourneys: 'Key User Journeys',
    platform: 'Platform Targets',
    integrations: 'External Integrations',
    techConstraints: 'Technical Constraints',
    dataSensitivity: 'Data Sensitivity Level',
  };

  const lines: string[] = [];
  for (const [key, value] of Object.entries(structuredInput)) {
    if (value && value.trim()) {
      const label = fieldLabels[key] || key;
      lines.push(`${label}: ${value.trim()}`);
    }
  }
  return lines.length > 0 ? lines.join('\n') : '';
}

function buildUpgradeContext(): string {
  const revision = process.env.AXION_REVISION || '1';
  const upgradeNotes = process.env.AXION_UPGRADE_NOTES || '';
  const kitType = process.env.AXION_KIT_TYPE || 'original';

  if (kitType !== 'upgrade' || !upgradeNotes) return '';

  return `\nUPGRADE CONTEXT (Revision ${revision}):
This is an upgrade pass. The user has provided the following critiques and improvement requests:
${upgradeNotes}

IMPORTANT: Incorporate these upgrade notes into your fills. Prioritize the user's upgrade feedback when replacing UNKNOWNs. Existing content that contradicts the upgrade notes should be adjusted where possible.\n`;
}

function buildFillPrompt(
  fileContent: string,
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);
  const upgradeContext = buildUpgradeContext();

  const knowledgeContext = resolveKnowledgeContext(moduleName, fileName);

  return `You are an expert software architect filling out a ${docInfo.label} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${stackProfileContext ? `\n${stackProfileContext}\n\nYou MUST use the technologies listed above. Do NOT suggest or specify alternative frameworks, languages, or tools that contradict the stack profile.\n` : ''}${structuredContext ? `\nDETAILED PROJECT CONTEXT (from the project creator — use this to inform your fills):\n${structuredContext}\n` : ''}${upgradeContext}${knowledgeContext}
Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content based on the project idea and domain module.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content appropriate to this project and domain.
2. When a TECHNOLOGY STACK is specified above, all technical decisions MUST align with it. Never suggest technologies that contradict the stack profile.
3. When detailed project context is provided above, use that information directly — do not invent contradicting details.
4. When KNOWLEDGE BASE CONTEXT is provided, follow its best practices and patterns — these are curated industry standards.
5. Keep the exact same Markdown structure, headings, and table formatting.
6. ${docInfo.guidance}
7. Do NOT add new sections or remove existing ones.
8. Do NOT wrap the output in code fences. Return ONLY the filled document content.
9. Make the content realistic and specific to a "${projectIdea}" application in the "${moduleName}" domain.
10. Return the COMPLETE document — do not truncate or abbreviate any sections.

CURRENT DOCUMENT:
${fileContent}

Return the complete filled document with all UNKNOWNs replaced:`;
}

function buildContextAwareFillPrompt(
  fileContent: string,
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  userAnswers: Record<string, string>,
  parentContext: string,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);
  const upgradeContext = buildUpgradeContext();

  const answersBlock = Object.entries(userAnswers)
    .map(([section, answer]) => `Section "${section}": ${answer}`)
    .join('\n');

  const knowledgeContext = resolveKnowledgeContext(moduleName, fileName);

  return `You are an expert software architect filling out a ${docInfo.label} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${stackProfileContext ? `\n${stackProfileContext}\n\nYou MUST use the technologies listed above. Do NOT suggest or specify alternative frameworks, languages, or tools that contradict the stack profile.\n` : ''}${structuredContext ? `\nDETAILED PROJECT CONTEXT (from the project creator — use this to inform your fills):\n${structuredContext}\n` : ''}${upgradeContext}${parentContext ? `CONTEXT FROM HIGHER-LEVEL DOCUMENTS (use this to inform your fills):\n${parentContext}\n` : ''}
${answersBlock ? `USER-PROVIDED ANSWERS (use this information directly):\n${answersBlock}\n` : ''}${knowledgeContext}
Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content.
2. When a TECHNOLOGY STACK is specified above, all technical decisions MUST align with it. Never suggest technologies that contradict the stack profile.
3. When user-provided context or answers are available, use that information directly — do not contradict it.
4. When KNOWLEDGE BASE CONTEXT is provided, follow its best practices and patterns — these are curated industry standards.
5. Keep the exact same Markdown structure, headings, and table formatting.
6. ${docInfo.guidance}
7. Do NOT add new sections or remove existing ones.
8. Do NOT wrap the output in code fences. Return ONLY the filled document content.
9. Return the COMPLETE document — do not truncate or abbreviate any sections.

CURRENT DOCUMENT:
${fileContent}

Return the complete filled document with all UNKNOWNs replaced:`;
}

function buildUpgradePrompt(
  fileContent: string,
  filePath: string,
  moduleName: string,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const upgradeContext = buildUpgradeContext();

  const knowledgeContext = resolveKnowledgeContext(moduleName, fileName);

  return `You are an expert technical writer upgrading a ${docInfo.label} document for a software project.

MODULE/DOMAIN: ${moduleName}

${docInfo.guidance}
${upgradeContext}${knowledgeContext}
Below is the current document. Your task is to UPGRADE its quality:
1. Make vague or generic content more specific and actionable.
2. Add missing details where sections are thin.
3. Improve clarity, consistency, and technical precision.
4. Ensure all sections are comprehensive and production-ready.
5. Replace any remaining UNKNOWN placeholders with realistic, specific content.
6. Keep the existing structure and formatting intact — improve content, not layout.
7. Do NOT remove existing valid content — only enhance it.

CURRENT DOCUMENT:
${fileContent}

Return ONLY the upgraded document. Preserve all Markdown formatting, headings, and anchors exactly.`;
}

// ─── AI Fill Operations ─────────────────────────────────────────────────────

async function getOpenAI() {
  const OpenAI = (await import('openai')).default;
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

const MAX_FILL_ATTEMPTS = 3;
const MAX_COMPLETION_TOKENS = 16384;
const MAX_UNKNOWNS_PER_FILE = 3;

export async function fillFileWithAI(
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
): Promise<ContentFillResult> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0, error: 'File not found' };
  }

  let currentContent = fs.readFileSync(filePath, 'utf8');
  const unknownsBefore = countUnknowns(currentContent);

  if (unknownsBefore === 0) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0 };
  }

  onProgress?.(`Filling ${path.basename(filePath)} (${unknownsBefore} UNKNOWNs)...`);

  let lastError: string | undefined;
  let unknownsAfter = unknownsBefore;

  for (let attempt = 1; attempt <= MAX_FILL_ATTEMPTS; attempt++) {
    try {
      const openai = await getOpenAI();
      const prompt = buildFillPrompt(currentContent, filePath, projectName, projectIdea, moduleName, structuredInput, stackProfileContext);

      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'You are a precise document editor. You fill in placeholder content in software specification documents. You return only the filled document, preserving all Markdown formatting exactly. You MUST return the COMPLETE document — never truncate.' },
          { role: 'user', content: prompt },
        ],
        max_completion_tokens: MAX_COMPLETION_TOKENS,
      });

      const filledContent = response.choices[0]?.message?.content;
      if (!filledContent) {
        lastError = `Empty response from AI (attempt ${attempt})`;
        onProgress?.(`  Attempt ${attempt}: empty response, retrying...`);
        continue;
      }

      const cleaned = filledContent.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
      unknownsAfter = countUnknowns(cleaned);

      if (unknownsAfter < countUnknowns(currentContent)) {
        currentContent = cleaned;
        fs.writeFileSync(filePath, cleaned, 'utf8');
        onProgress?.(`  Attempt ${attempt}: ${countUnknowns(cleaned) === 0 ? 'all' : unknownsAfter} UNKNOWNs ${unknownsAfter === 0 ? 'resolved' : 'remaining'}`);
      } else {
        onProgress?.(`  Attempt ${attempt}: no improvement (${unknownsAfter} UNKNOWNs remain)`);
      }

      if (unknownsAfter === 0) break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      onProgress?.(`  Attempt ${attempt} error: ${lastError}`);
      if (attempt === MAX_FILL_ATTEMPTS) {
        return { file: filePath, module: moduleName, status: 'error', unknownsBefore, unknownsAfter, error: lastError };
      }
    }
  }

  onProgress?.(`Filled ${path.basename(filePath)}: ${unknownsBefore} → ${unknownsAfter} UNKNOWNs`);
  return { file: filePath, module: moduleName, status: 'filled', unknownsBefore, unknownsAfter };
}

export async function fillFileWithContext(
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  userAnswers: Record<string, string>,
  parentContext: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
): Promise<ContentFillResult> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0, error: 'File not found' };
  }

  let currentContent = fs.readFileSync(filePath, 'utf8');
  const unknownsBefore = countUnknowns(currentContent);
  if (unknownsBefore === 0) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0 };
  }

  onProgress?.(`Filling ${path.basename(filePath)} with user context (${unknownsBefore} UNKNOWNs)...`);

  let lastError: string | undefined;
  let unknownsAfter = unknownsBefore;

  for (let attempt = 1; attempt <= MAX_FILL_ATTEMPTS; attempt++) {
    try {
      const openai = await getOpenAI();
      const prompt = buildContextAwareFillPrompt(currentContent, filePath, projectName, projectIdea, moduleName, userAnswers, parentContext, structuredInput, stackProfileContext);

      const response = await openai.chat.completions.create({
        model: 'gpt-5-mini',
        messages: [
          { role: 'system', content: 'You are a precise document editor. You fill in placeholder content in software specification documents using the user-provided context. You return only the filled document, preserving all Markdown formatting exactly. You MUST return the COMPLETE document — never truncate.' },
          { role: 'user', content: prompt },
        ],
        max_completion_tokens: MAX_COMPLETION_TOKENS,
      });

      const filledContent = response.choices[0]?.message?.content;
      if (!filledContent) {
        lastError = `Empty response from AI (attempt ${attempt})`;
        onProgress?.(`  Attempt ${attempt}: empty response, retrying...`);
        continue;
      }

      const cleaned = filledContent.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
      unknownsAfter = countUnknowns(cleaned);

      if (unknownsAfter < countUnknowns(currentContent)) {
        currentContent = cleaned;
        fs.writeFileSync(filePath, cleaned, 'utf8');
        onProgress?.(`  Attempt ${attempt}: ${unknownsAfter === 0 ? 'all' : unknownsAfter} UNKNOWNs ${unknownsAfter === 0 ? 'resolved' : 'remaining'}`);
      } else {
        onProgress?.(`  Attempt ${attempt}: no improvement (${unknownsAfter} UNKNOWNs remain)`);
      }

      if (unknownsAfter === 0) break;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      onProgress?.(`  Attempt ${attempt} error: ${lastError}`);
      if (attempt === MAX_FILL_ATTEMPTS) {
        return { file: filePath, module: moduleName, status: 'error', unknownsBefore, unknownsAfter, error: lastError };
      }
    }
  }

  onProgress?.(`Filled ${path.basename(filePath)}: ${unknownsBefore} → ${unknownsAfter} UNKNOWNs`);
  return { file: filePath, module: moduleName, status: 'filled', unknownsBefore, unknownsAfter };
}

export async function fillModuleUnknowns(
  projectRoot: string,
  moduleName: string,
  projectName: string,
  projectIdea: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
): Promise<ContentFillResult[]> {
  const moduleDir = path.join(projectRoot, 'axion', 'domains', moduleName);
  const results: ContentFillResult[] = [];

  const mdFiles = getAllMdFilesInModule(moduleDir);
  for (const filePath of mdFiles) {
    const result = await fillFileWithAI(filePath, projectName, projectIdea, moduleName, onProgress, structuredInput, stackProfileContext);
    results.push(result);
  }

  return results;
}

export async function fillAllModulesUnknowns(
  projectRoot: string,
  modules: string[],
  projectName: string,
  projectIdea: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
): Promise<ContentFillReport> {
  const results: ContentFillResult[] = [];

  for (const mod of modules) {
    onProgress?.(`Processing module: ${mod}`);
    const modResults = await fillModuleUnknowns(projectRoot, mod, projectName, projectIdea, onProgress, structuredInput, stackProfileContext);
    results.push(...modResults);
  }

  return {
    totalFilesFilled: results.filter(r => r.status === 'filled').length,
    totalFilesSkipped: results.filter(r => r.status === 'skipped').length,
    totalFilesErrored: results.filter(r => r.status === 'error').length,
    results,
  };
}

// ─── Cascade Fill ───────────────────────────────────────────────────────────

export async function cascadeFill(
  projectRoot: string,
  targetFile: string,
  targetModule: string,
  projectName: string,
  projectIdea: string,
  userAnswers: Record<string, string>,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
): Promise<CascadeFillResult> {
  const targetResult = await fillFileWithContext(
    targetFile, projectName, projectIdea, targetModule, userAnswers, '', onProgress, structuredInput, stackProfileContext,
  );

  const updatedParentContent = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, 'utf8').substring(0, 3000) : '';

  onProgress?.('Running cascade pass across all documents...');
  const cascadeResults: ContentFillResult[] = [];
  const allFiles = discoverAllMdFiles(projectRoot);

  for (const { file, module } of allFiles) {
    if (file === targetFile) continue;
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    if (countUnknowns(content) === 0) continue;

    const result = await fillFileWithContext(
      file, projectName, projectIdea, module, {}, updatedParentContent, onProgress, structuredInput, stackProfileContext,
    );
    cascadeResults.push(result);
  }

  const moduleList = getAllModulesInWorkspace(projectRoot);
  const remainingScan = scanAllModulesForUnknowns(projectRoot, moduleList);
  const nextTarget = findNextTarget(projectRoot);

  return { targetFilled: targetResult, cascadeResults, remainingScan, nextTarget };
}

// ─── Document Upgrade ───────────────────────────────────────────────────────

export async function upgradeDocumentWithAI(
  filePath: string,
  moduleName: string,
  onProgress?: (message: string) => void,
): Promise<{ file: string; status: 'upgraded' | 'skipped' | 'error'; error?: string }> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, status: 'skipped', error: 'File not found' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.trim().length < 20) {
    return { file: filePath, status: 'skipped', error: 'File too short to upgrade' };
  }

  onProgress?.(`Upgrading ${path.basename(filePath)}...`);

  try {
    const openai = await getOpenAI();
    const prompt = buildUpgradePrompt(content, filePath, moduleName);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: 'You are a precise technical writer. You upgrade software documentation quality while preserving structure. Return only the upgraded document.' },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: 8192,
    });

    const upgraded = response.choices[0]?.message?.content;
    if (!upgraded) {
      return { file: filePath, status: 'error', error: 'Empty response from AI' };
    }

    const cleaned = upgraded.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
    fs.writeFileSync(filePath, cleaned, 'utf8');

    onProgress?.(`Upgraded ${path.basename(filePath)} successfully`);
    return { file: filePath, status: 'upgraded' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    onProgress?.(`Error upgrading ${path.basename(filePath)}: ${msg}`);
    return { file: filePath, status: 'error', error: msg };
  }
}

// ─── Question Generation ────────────────────────────────────────────────────

export async function generateQuestionsForTarget(
  target: HierarchicalUnknownTarget,
  projectName: string,
  projectIdea: string,
): Promise<{ sectionName: string; questions: string[] }[]> {
  const openai = await getOpenAI();

  const sectionsInfo = target.sections
    .map(s => `- Section "${s.name}" (${s.unknownCount} UNKNOWNs):\n${s.snippet}`)
    .join('\n\n');

  const prompt = `You are helping a user fill in missing information in a ${target.docTypeLabel} document for the project "${projectName}" (${projectIdea}).

The following sections still have UNKNOWN placeholders that need real information from the user:

${sectionsInfo}

For each section, generate 1-3 clear, specific questions that would help gather the information needed to replace the UNKNOWNs. Questions should be non-technical and easy to understand.

Respond in this exact JSON format (no code fences):
[
  {
    "sectionName": "Section Name Here",
    "questions": ["Question 1?", "Question 2?"]
  }
]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-5-mini',
    messages: [
      { role: 'system', content: 'You generate targeted questions to gather real project information from users. Always respond with valid JSON only, no markdown code fences.' },
      { role: 'user', content: prompt },
    ],
    max_completion_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content || '[]';
  const cleaned = raw.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    return target.sections.map(s => ({
      sectionName: s.name,
      questions: [`What specific information should go in the "${s.name}" section for this project?`],
    }));
  }
}

// ─── CLI Entry Point ────────────────────────────────────────────────────────

const cliArgs = process.argv.slice(2);
const jsonMode = cliArgs.includes('--json');
const dryRun = cliArgs.includes('--dry-run');
const startTime = Date.now();

interface Receipt {
  stage: string;
  subCommand: string;
  ok: boolean;
  modulesProcessed: string[];
  createdFiles: string[];
  modifiedFiles: string[];
  skippedFiles: string[];
  warnings: string[];
  errors: string[];
  elapsedMs: number;
  dryRun: boolean;
  data?: unknown;
}

const receipt: Receipt = {
  stage: 'content-fill',
  subCommand: '',
  ok: true,
  modulesProcessed: [],
  createdFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
};

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:content-fill (${receipt.subCommand})`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${receipt.modulesProcessed.join(', ') || '(none)'}`);
  if (receipt.modifiedFiles.length) {
    console.log(`\nModified (${receipt.modifiedFiles.length}):`);
    receipt.modifiedFiles.forEach(f => console.log(`  ~ ${f}`));
  }
  if (receipt.skippedFiles.length) {
    console.log(`\nSkipped (${receipt.skippedFiles.length}):`);
    receipt.skippedFiles.forEach(f => console.log(`  - ${f}`));
  }
  if (receipt.warnings.length) {
    console.log(`\nWarnings (${receipt.warnings.length}):`);
    receipt.warnings.forEach(w => console.log(`  ? ${w}`));
  }
  if (receipt.errors.length) {
    console.log(`\nErrors (${receipt.errors.length}):`);
    receipt.errors.forEach(e => console.log(`  ! ${e}`));
  }
  console.log(`\nResult: ${receipt.ok ? 'OK' : 'FAILED'}`);
  console.log('===================================');
}

function fail(msg: string): never {
  receipt.ok = false;
  receipt.errors.push(msg);
  emitOutput();
  process.exit(1);
}

async function main() {
  const getArg = (flag: string): string | undefined => {
    const idx = cliArgs.indexOf(flag);
    return idx >= 0 && idx + 1 < cliArgs.length ? cliArgs[idx + 1] : undefined;
  };
  const hasFlag = (flag: string) => cliArgs.includes(flag);

  const projectName = getArg('--project') || process.env.AXION_PROJECT_NAME;
  if (!projectName) fail('--project <name> or AXION_PROJECT_NAME is required');

  const projectRoot = path.resolve(projectName!);
  let projectIdea = process.env.AXION_PROJECT_IDEA || projectName!;
  if (process.env.AXION_PROJECT_IDEA_FILE && fs.existsSync(process.env.AXION_PROJECT_IDEA_FILE)) {
    projectIdea = fs.readFileSync(process.env.AXION_PROJECT_IDEA_FILE, 'utf-8');
  }

  if (!fs.existsSync(projectRoot)) {
    fail(`Project root not found: ${projectRoot}`);
  }

  const stackProfileContext = resolveStackProfile(projectRoot);

  const log = jsonMode ? () => {} : (msg: string) => console.log(`[AXION] ${msg}`);

  if (hasFlag('--scan')) {
    receipt.subCommand = 'scan';
    log(`Scanning ${projectName} for UNKNOWN placeholders...`);
    const modules = getAllModulesInWorkspace(projectRoot);
    receipt.modulesProcessed.push(...modules);
    const report = scanAllModulesForUnknowns(projectRoot, modules);
    receipt.data = report;
    emitOutput();
    return;
  }

  if (hasFlag('--find-next')) {
    receipt.subCommand = 'find-next';
    log(`Finding next fill target in ${projectName}...`);
    const target = findNextTarget(projectRoot);
    receipt.data = target;
    emitOutput();
    return;
  }

  if (hasFlag('--fill')) {
    receipt.subCommand = 'fill';
    const moduleName = getArg('--module');

    if (moduleName) {
      if (!isStageDone('draft', moduleName)) {
        const msg = `Module '${moduleName}' has not completed 'draft'. Run: node axion/scripts/axion-draft.mjs --module ${moduleName}`;
        receipt.errors.push(msg);
        receipt.ok = false;
        if (!dryRun) markStageFailed('content-fill', moduleName, { reason: msg });
        emitOutput();
        process.exit(1);
      }

      try {
        ensurePrereqs({
          stageName: 'content-fill',
          module: moduleName,
          stagePrereq: (m: string) => isStageDone('draft', m),
        });
      } catch (prereqErr: unknown) {
        const errMsg = prereqErr instanceof Error ? prereqErr.message : String(prereqErr);
        receipt.errors.push(`Prerequisite failed for module '${moduleName}': ${errMsg}`);
        receipt.ok = false;
        if (!dryRun) markStageFailed('content-fill', moduleName, { reason: errMsg });
        emitOutput();
        process.exit(1);
      }

      receipt.modulesProcessed.push(moduleName);
      log(`Filling UNKNOWNs in module: ${moduleName}`);

      if (dryRun) {
        const moduleDir = path.join(projectRoot, 'axion', 'domains', moduleName);
        const mdFiles = getAllMdFilesInModule(moduleDir);
        for (const f of mdFiles) {
          const content = fs.readFileSync(f, 'utf8');
          if (countUnknowns(content) > 0) {
            receipt.modifiedFiles.push(f + ' (would fill)');
          } else {
            receipt.skippedFiles.push(f);
          }
        }
      } else {
        const results = await fillModuleUnknowns(projectRoot, moduleName, projectName!, projectIdea, log, undefined, stackProfileContext);
        let totalRemainingUnknowns = 0;
        for (const r of results) {
          if (r.status === 'filled') {
            receipt.modifiedFiles.push(r.file);
            totalRemainingUnknowns += r.unknownsAfter;
          }
          else if (r.status === 'skipped') receipt.skippedFiles.push(r.file);
          else if (r.status === 'error') {
            receipt.errors.push(`${r.file}: ${r.error}`);
            receipt.ok = false;
          }
        }
        const filesExceedingGate = results.filter(r => r.status === 'filled' && r.unknownsAfter > MAX_UNKNOWNS_PER_FILE);
        if (filesExceedingGate.length > 0) {
          for (const f of filesExceedingGate) {
            receipt.errors.push(`UNKNOWN gate failed: ${path.basename(f.file)} has ${f.unknownsAfter} UNKNOWNs (max ${MAX_UNKNOWNS_PER_FILE})`);
          }
          receipt.ok = false;
        }
        if (totalRemainingUnknowns > 0) {
          receipt.warnings.push(`Module '${moduleName}' still has ${totalRemainingUnknowns} UNKNOWN(s) after ${MAX_FILL_ATTEMPTS} fill attempts`);
        }
        receipt.data = results;
        if (receipt.ok) {
          markStageDone('content-fill', moduleName);
        } else {
          markStageFailed('content-fill', moduleName, { reason: 'UNKNOWN gate failed or files had errors' });
        }
      }
    } else {
      log(`Filling all UNKNOWNs in ${projectName}...`);
      const modules = getAllModulesInWorkspace(projectRoot);

      for (const mod of modules) {
        if (!isStageDone('draft', mod)) {
          const msg = `Module '${mod}' has not completed 'draft'. Skipping.`;
          receipt.warnings.push(msg);
          if (!dryRun) markStageFailed('content-fill', mod, { reason: msg });
          continue;
        }

        try {
          ensurePrereqs({
            stageName: 'content-fill',
            module: mod,
            stagePrereq: (m: string) => isStageDone('draft', m),
          });
        } catch (prereqErr: unknown) {
          const errMsg = prereqErr instanceof Error ? prereqErr.message : String(prereqErr);
          receipt.errors.push(`Prerequisite failed for module '${mod}': ${errMsg}`);
          receipt.ok = false;
          if (!dryRun) markStageFailed('content-fill', mod, { reason: errMsg });
          continue;
        }

        receipt.modulesProcessed.push(mod);

        try {
          if (dryRun) {
            const moduleDir = path.join(projectRoot, 'axion', 'domains', mod);
            const mdFiles = getAllMdFilesInModule(moduleDir);
            for (const f of mdFiles) {
              const content = fs.readFileSync(f, 'utf8');
              if (countUnknowns(content) > 0) {
                receipt.modifiedFiles.push(f + ' (would fill)');
              } else {
                receipt.skippedFiles.push(f);
              }
            }
          } else {
            log(`Processing module: ${mod}`);
            const modResults = await fillModuleUnknowns(projectRoot, mod, projectName!, projectIdea, log, undefined, stackProfileContext);
            let modRemainingUnknowns = 0;
            for (const r of modResults) {
              if (r.status === 'filled') {
                receipt.modifiedFiles.push(r.file);
                modRemainingUnknowns += r.unknownsAfter;
              }
              else if (r.status === 'skipped') receipt.skippedFiles.push(r.file);
              else if (r.status === 'error') {
                receipt.errors.push(`${r.file}: ${r.error}`);
              }
            }
            const modFilesExceedingGate = modResults.filter(r => r.status === 'filled' && r.unknownsAfter > MAX_UNKNOWNS_PER_FILE);
            if (modFilesExceedingGate.length > 0) {
              for (const f of modFilesExceedingGate) {
                receipt.errors.push(`UNKNOWN gate failed: ${path.basename(f.file)} has ${f.unknownsAfter} UNKNOWNs (max ${MAX_UNKNOWNS_PER_FILE})`);
              }
            }
            if (modRemainingUnknowns > 0) {
              receipt.warnings.push(`Module '${mod}' still has ${modRemainingUnknowns} UNKNOWN(s) after ${MAX_FILL_ATTEMPTS} fill attempts`);
            }
            const hadErrors = modResults.some(r => r.status === 'error');
            const gateViolation = modFilesExceedingGate.length > 0;
            if (hadErrors || gateViolation) {
              receipt.ok = false;
              markStageFailed('content-fill', mod, { reason: gateViolation ? 'UNKNOWN gate failed' : 'One or more files failed AI fill' });
            } else {
              markStageDone('content-fill', mod);
            }
          }
        } catch (moduleErr: unknown) {
          const errMsg = moduleErr instanceof Error ? moduleErr.message : String(moduleErr);
          receipt.errors.push(`Module '${mod}' failed: ${errMsg}`);
          receipt.ok = false;
          if (!dryRun) markStageFailed('content-fill', mod, { reason: errMsg });
        }
      }
    }

    emitOutput();
    if (!receipt.ok) process.exit(1);
    return;
  }

  if (hasFlag('--cascade')) {
    receipt.subCommand = 'cascade';
    const targetFile = getArg('--target');
    const targetModule = getArg('--target-module');
    if (!targetFile || !targetModule) fail('--cascade requires --target <file> and --target-module <mod>');
    log(`Running cascade fill from ${targetFile}...`);
    if (!dryRun) {
      const result = await cascadeFill(projectRoot, targetFile!, targetModule!, projectName!, projectIdea, {}, log, undefined, stackProfileContext);
      receipt.data = result;
      receipt.modulesProcessed.push(targetModule!);
      if (result.targetFilled.status === 'filled') receipt.modifiedFiles.push(result.targetFilled.file);
      for (const r of result.cascadeResults) {
        if (r.status === 'filled') receipt.modifiedFiles.push(r.file);
        else if (r.status === 'error') {
          receipt.errors.push(`${r.file}: ${r.error}`);
          receipt.ok = false;
        }
      }
    }
    emitOutput();
    if (!receipt.ok) process.exit(1);
    return;
  }

  if (hasFlag('--upgrade')) {
    receipt.subCommand = 'upgrade';
    const targetFile = getArg('--target');
    const targetModule = getArg('--target-module');
    if (!targetFile || !targetModule) fail('--upgrade requires --target <file> and --target-module <mod>');
    log(`Upgrading document: ${targetFile}`);
    if (!dryRun) {
      const result = await upgradeDocumentWithAI(targetFile!, targetModule!, log);
      receipt.data = result;
      receipt.modulesProcessed.push(targetModule!);
      if (result.status === 'upgraded') receipt.modifiedFiles.push(result.file);
      else if (result.status === 'error') {
        receipt.errors.push(`${result.file}: ${result.error}`);
        receipt.ok = false;
      }
    }
    emitOutput();
    if (!receipt.ok) process.exit(1);
    return;
  }

  fail('No action specified. Use --scan, --fill, --cascade, --find-next, or --upgrade');
}

main().catch(err => {
  receipt.ok = false;
  receipt.errors.push(err.message || String(err));
  emitOutput();
  process.exit(1);
});
