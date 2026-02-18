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

function computeContentFillBatches(projectRoot: string, targetModules: string[]): string[][] {
  const configPath = path.join(projectRoot, 'axion', 'config', 'domains.json');
  if (!fs.existsSync(configPath)) return [targetModules];
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const allModules = config.modules || [];
    const depMap: Record<string, string[]> = {};
    for (const m of allModules) {
      depMap[m.slug] = ((m.dependencies || []) as string[]).filter((d: string) => targetModules.includes(d));
    }

    const targetSet = new Set(targetModules);
    const placed = new Set<string>();
    const batches: string[][] = [];

    while (placed.size < targetSet.size) {
      const batch: string[] = [];
      for (const slug of targetModules) {
        if (placed.has(slug)) continue;
        const deps = depMap[slug] || [];
        if (deps.every((d: string) => placed.has(d))) {
          batch.push(slug);
        }
      }
      if (batch.length === 0) {
        const remaining = targetModules.filter(m => !placed.has(m));
        process.stderr.write(`[content-fill] Warning: circular dependencies detected, skipping modules: ${remaining.join(', ')}\n`);
        break;
      }
      batches.push(batch);
      for (const slug of batch) placed.add(slug);
    }

    return batches;
  } catch {
    return [targetModules];
  }
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

// ─── System Context Assembly ─────────────────────────────────────────────────
// The AXION system is the AI's single source of truth. Before filling any document,
// the AI must read: (a) the template's AGENT_GUIDANCE block, (b) full knowledge files,
// and (c) upstream docs referenced by the template. This prevents drift and reduces
// reasoning load — the system has everything the AI needs.

const AXION_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(AXION_ROOT, 'templates', 'core');
const KNOWLEDGE_DIR_PATH = path.join(AXION_ROOT, 'knowledge');

interface SystemContext {
  templateGuidance: string;
  knowledgeContext: string;
  upstreamDocsContext: string;
}

function extractTemplateGuidance(docType: string): string {
  const templateMap: Record<string, string> = {
    'BELS': 'BELS.template.md',
    'DDES': 'DDES.template.md',
    'DIM': 'DIM.template.md',
    'SCREENMAP': 'SCREENMAP.template.md',
    'TESTPLAN': 'TESTPLAN.template.md',
    'COMPONENT_LIBRARY': 'COMPONENT_LIBRARY.template.md',
    'COPY_GUIDE': 'COPY_GUIDE.template.md',
    'UI_Constraints': 'UI_Constraints.template.md',
    'UX_Foundations': 'UX_Foundations.template.md',
    'ALRP': 'ALRP.template.md',
    'SROL': 'SROL.template.md',
    'TIES': 'TIES.template.md',
    'ERC': 'ERC.template.md',
  };

  const templateFile = templateMap[docType];
  if (!templateFile) return '';

  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  if (!fs.existsSync(templatePath)) return '';

  try {
    const content = fs.readFileSync(templatePath, 'utf8');
    const guidanceMatch = content.match(/<!-- AXION:AGENT_GUIDANCE\n([\s\S]*?)-->/);
    if (!guidanceMatch) return '';

    return `--- TEMPLATE GUIDANCE (from ${templateFile}) ---\n${guidanceMatch[1].trim()}\n--- END TEMPLATE GUIDANCE ---`;
  } catch {
    return '';
  }
}

function parseUpstreamDocRefs(guidanceBlock: string): string[] {
  const refs: string[] = [];

  const sourcesMatch = guidanceBlock.match(/SOURCES TO DERIVE FROM:\n([\s\S]*?)(?=\n(?:RULES|CASCADE|$))/);
  if (!sourcesMatch) return refs;

  const lines = sourcesMatch[1].split('\n');
  for (const line of lines) {
    if (/RPBS/i.test(line) && !refs.includes('RPBS')) refs.push('RPBS');
    if (/REBS/i.test(line) && !refs.includes('REBS')) refs.push('REBS');
    if (/DDES/i.test(line) && !refs.includes('DDES')) refs.push('DDES');
    if (/BELS/i.test(line) && !refs.includes('BELS')) refs.push('BELS');
    if (/DIM/i.test(line) && !refs.includes('DIM')) refs.push('DIM');
    if (/SCREENMAP/i.test(line) && !refs.includes('SCREENMAP')) refs.push('SCREENMAP');
    if (/UX_Foundations/i.test(line) && !refs.includes('UX_Foundations')) refs.push('UX_Foundations');
    if (/UI_Constraints/i.test(line) && !refs.includes('UI_Constraints')) refs.push('UI_Constraints');
    if (/ERC/i.test(line) && !refs.includes('ERC')) refs.push('ERC');
    if (/TIES/i.test(line) && !refs.includes('TIES')) refs.push('TIES');
    if (/domain.?map|domains\.json/i.test(line) && !refs.includes('domains.json')) refs.push('domains.json');
  }

  return refs;
}

function resolveUpstreamDocs(
  projectRoot: string,
  moduleName: string,
  docRefs: string[],
  maxCharsPerDoc: number = 6000
): string {
  if (docRefs.length === 0) return '';

  const chunks: string[] = [];

  for (const ref of docRefs) {
    let docContent = '';
    let docLabel = ref;

    if (ref === 'RPBS') {
      const rpbsPath = path.join(projectRoot, 'axion', 'docs', 'product', 'RPBS_Product.md');
      if (fs.existsSync(rpbsPath)) {
        docContent = fs.readFileSync(rpbsPath, 'utf8');
        docLabel = 'RPBS_Product.md (Product Requirements)';
      }
    } else if (ref === 'REBS') {
      const rebsPath = path.join(projectRoot, 'axion', 'docs', 'product', 'REBS_Product.md');
      if (fs.existsSync(rebsPath)) {
        docContent = fs.readFileSync(rebsPath, 'utf8');
        docLabel = 'REBS_Product.md (Engineering Requirements)';
      }
    } else if (ref === 'DDES') {
      const ddesPath = path.join(projectRoot, 'axion', 'domains', moduleName, `DDES_${moduleName}.md`);
      if (fs.existsSync(ddesPath)) {
        docContent = fs.readFileSync(ddesPath, 'utf8');
        docLabel = `DDES_${moduleName}.md (Domain Entity Spec)`;
      }
    } else if (ref === 'BELS') {
      const belsPath = path.join(projectRoot, 'axion', 'domains', moduleName, `BELS_${moduleName}.md`);
      if (fs.existsSync(belsPath)) {
        docContent = fs.readFileSync(belsPath, 'utf8');
        docLabel = `BELS_${moduleName}.md (Business Logic)`;
      }
    } else if (ref === 'DIM') {
      const dimPath = path.join(projectRoot, 'axion', 'domains', moduleName, `DIM_${moduleName}.md`);
      if (fs.existsSync(dimPath)) {
        docContent = fs.readFileSync(dimPath, 'utf8');
        docLabel = `DIM_${moduleName}.md (Integration Map)`;
      }
    } else if (ref === 'SCREENMAP') {
      const smPath = path.join(projectRoot, 'axion', 'domains', moduleName, `SCREENMAP_${moduleName}.md`);
      if (fs.existsSync(smPath)) {
        docContent = fs.readFileSync(smPath, 'utf8');
        docLabel = `SCREENMAP_${moduleName}.md (Screen Map)`;
      }
    } else if (ref === 'UX_Foundations') {
      const uxPath = path.join(projectRoot, 'axion', 'domains', moduleName, `UX_Foundations_${moduleName}.md`);
      if (fs.existsSync(uxPath)) {
        docContent = fs.readFileSync(uxPath, 'utf8');
        docLabel = `UX_Foundations_${moduleName}.md`;
      }
    } else if (ref === 'UI_Constraints') {
      const uiPath = path.join(projectRoot, 'axion', 'domains', moduleName, `UI_Constraints_${moduleName}.md`);
      if (fs.existsSync(uiPath)) {
        docContent = fs.readFileSync(uiPath, 'utf8');
        docLabel = `UI_Constraints_${moduleName}.md`;
      }
    } else if (ref === 'ERC') {
      const ercPaths = [
        path.join(projectRoot, 'registry', 'ERC.md'),
        path.join(projectRoot, 'axion', 'registry', 'ERC.md'),
      ];
      for (const p of ercPaths) {
        if (fs.existsSync(p)) {
          docContent = fs.readFileSync(p, 'utf8');
          docLabel = 'ERC.md (Execution Readiness Contract)';
          break;
        }
      }
    } else if (ref === 'TIES') {
      const tiesPath = path.join(projectRoot, 'axion', 'domains', moduleName, `TIES_${moduleName}.md`);
      if (fs.existsSync(tiesPath)) {
        docContent = fs.readFileSync(tiesPath, 'utf8');
        docLabel = `TIES_${moduleName}.md`;
      }
    } else if (ref === 'domains.json') {
      const djPath = path.join(projectRoot, 'axion', 'config', 'domains.json');
      if (fs.existsSync(djPath)) {
        docContent = fs.readFileSync(djPath, 'utf8');
        docLabel = 'domains.json (Module Config)';
      }
    }

    if (docContent) {
      const trimmed = docContent.length > maxCharsPerDoc
        ? docContent.substring(0, maxCharsPerDoc) + '\n... [truncated]'
        : docContent;
      chunks.push(`### ${docLabel}\n${trimmed}`);
    }
  }

  if (chunks.length === 0) return '';
  return `--- UPSTREAM DOCUMENTS (derive content from these) ---\n\n${chunks.join('\n\n')}\n\n--- END UPSTREAM DOCUMENTS ---`;
}

function resolveFullKnowledge(moduleName: string, fileName: string): string {
  try {
    const domainKnowledge = resolveForDomain(moduleName);
    const docType = fileName.replace(/\.md$/, '').replace(/_[a-z]+$/i, '');
    const docTypeKnowledge = resolveForDocType(docType);

    const seen = new Set<string>();
    const chunks: string[] = [];

    for (const f of [...domainKnowledge.files, ...docTypeKnowledge.files]) {
      if (seen.has(f.filename)) continue;
      seen.add(f.filename);

      const filePath = path.join(KNOWLEDGE_DIR_PATH, f.filename);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      const trimmed = content.length > 8000
        ? content.substring(0, 8000) + '\n... [truncated]'
        : content;
      chunks.push(`### ${f.filename} (${f.priority} — ${f.reason})\n${trimmed}`);
    }

    if (chunks.length === 0) return '';
    return `--- KNOWLEDGE BASE (curated best practices — follow these) ---\n\n${chunks.join('\n\n')}\n\n--- END KNOWLEDGE BASE ---`;
  } catch {
    return '';
  }
}

function assembleSystemContext(
  projectRoot: string,
  moduleName: string,
  fileName: string,
): SystemContext {
  const baseName = path.basename(fileName);
  const docType = baseName.replace(/\.md$/, '').replace(/_[a-z]+$/i, '');

  const templateGuidance = extractTemplateGuidance(docType);

  const upstreamRefs = templateGuidance ? parseUpstreamDocRefs(templateGuidance) : [];
  const upstreamDocsContext = resolveUpstreamDocs(projectRoot, moduleName, upstreamRefs);

  const knowledgeContext = resolveFullKnowledge(moduleName, baseName);

  return { templateGuidance, knowledgeContext, upstreamDocsContext };
}

function formatSystemContext(ctx: SystemContext): string {
  const parts: string[] = [];
  if (ctx.templateGuidance) parts.push(ctx.templateGuidance);
  if (ctx.upstreamDocsContext) parts.push(ctx.upstreamDocsContext);
  if (ctx.knowledgeContext) parts.push(ctx.knowledgeContext);
  if (parts.length === 0) return '';
  return '\n' + parts.join('\n\n') + '\n';
}

// Legacy wrapper — kept for backward compatibility but now uses full knowledge
function resolveKnowledgeContext(moduleName: string, fileName: string): string {
  return resolveFullKnowledge(moduleName, fileName);
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
  stackProfileContext?: string,
  systemCtx?: SystemContext,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);
  const upgradeContext = buildUpgradeContext();

  const systemContextBlock = systemCtx ? formatSystemContext(systemCtx) : resolveKnowledgeContext(moduleName, fileName);

  return `You are an expert software architect filling out a ${docInfo.label} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${stackProfileContext ? `\n${stackProfileContext}\n\nYou MUST use the technologies listed above. Do NOT suggest or specify alternative frameworks, languages, or tools that contradict the stack profile.\n` : ''}${structuredContext ? `\nDETAILED PROJECT CONTEXT (from the project creator — use this to inform your fills):\n${structuredContext}\n` : ''}${upgradeContext}${systemContextBlock}
Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content based on the project idea and domain module.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content appropriate to this project and domain.
2. When TEMPLATE GUIDANCE is provided above, follow its SOURCES TO DERIVE FROM and RULES exactly — these are the authoritative instructions for this document type.
3. When UPSTREAM DOCUMENTS are provided, derive your fills from the information in those documents — do not invent details that contradict them.
4. When a TECHNOLOGY STACK is specified above, all technical decisions MUST align with it. Never suggest technologies that contradict the stack profile.
5. When detailed project context is provided above, use that information directly — do not invent contradicting details.
6. When KNOWLEDGE BASE best practices are provided, follow their patterns — these are curated industry standards.
7. Keep the exact same Markdown structure, headings, and table formatting.
8. ${docInfo.guidance}
9. Do NOT add new sections or remove existing ones.
10. Do NOT wrap the output in code fences. Return ONLY the filled document content.
11. Make the content realistic and specific to a "${projectIdea}" application in the "${moduleName}" domain.
12. Return the COMPLETE document — do not truncate or abbreviate any sections.

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
  systemCtx?: SystemContext,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);
  const upgradeContext = buildUpgradeContext();

  const answersBlock = Object.entries(userAnswers)
    .map(([section, answer]) => `Section "${section}": ${answer}`)
    .join('\n');

  const systemContextBlock = systemCtx ? formatSystemContext(systemCtx) : resolveKnowledgeContext(moduleName, fileName);

  return `You are an expert software architect filling out a ${docInfo.label} document for a software project.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${stackProfileContext ? `\n${stackProfileContext}\n\nYou MUST use the technologies listed above. Do NOT suggest or specify alternative frameworks, languages, or tools that contradict the stack profile.\n` : ''}${structuredContext ? `\nDETAILED PROJECT CONTEXT (from the project creator — use this to inform your fills):\n${structuredContext}\n` : ''}${upgradeContext}${parentContext ? `CONTEXT FROM HIGHER-LEVEL DOCUMENTS (use this to inform your fills):\n${parentContext}\n` : ''}
${answersBlock ? `USER-PROVIDED ANSWERS (use this information directly):\n${answersBlock}\n` : ''}${systemContextBlock}
Below is the current document that has UNKNOWN placeholders. Your task is to replace every instance of "UNKNOWN" with realistic, project-specific content.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content.
2. When TEMPLATE GUIDANCE is provided above, follow its SOURCES TO DERIVE FROM and RULES exactly — these are the authoritative instructions for this document type.
3. When UPSTREAM DOCUMENTS are provided, derive your fills from the information in those documents — do not invent details that contradict them.
4. When a TECHNOLOGY STACK is specified above, all technical decisions MUST align with it. Never suggest technologies that contradict the stack profile.
5. When user-provided context or answers are available, use that information directly — do not contradict it.
6. When KNOWLEDGE BASE best practices are provided, follow their patterns — these are curated industry standards.
7. Keep the exact same Markdown structure, headings, and table formatting.
8. ${docInfo.guidance}
9. Do NOT add new sections or remove existing ones.
10. Do NOT wrap the output in code fences. Return ONLY the filled document content.
11. Return the COMPLETE document — do not truncate or abbreviate any sections.

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

interface DocumentSection {
  heading: string;
  startLine: number;
  endLine: number;
  content: string;
  hasUnknowns: boolean;
  unknownCount: number;
}

function parseDocumentSections(content: string): DocumentSection[] {
  const lines = content.split('\n');
  const sections: DocumentSection[] = [];
  let currentHeading = '(preamble)';
  let currentStart = 0;
  const sectionLines: string[] = [];

  function flushSection(endLine: number) {
    const sectionContent = sectionLines.join('\n');
    const unknownCount = countUnknowns(sectionContent);
    sections.push({
      heading: currentHeading,
      startLine: currentStart,
      endLine,
      content: sectionContent,
      hasUnknowns: unknownCount > 0,
      unknownCount,
    });
    sectionLines.length = 0;
  }

  for (let i = 0; i < lines.length; i++) {
    if (/^#{1,3}\s/.test(lines[i]) && i > 0) {
      flushSection(i - 1);
      currentHeading = lines[i].replace(/^#+\s*/, '').trim();
      currentStart = i;
    }
    sectionLines.push(lines[i]);
  }
  if (sectionLines.length > 0) {
    flushSection(lines.length - 1);
  }

  return sections;
}

function buildSectionFillPrompt(
  sections: DocumentSection[],
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
  systemCtx?: SystemContext,
): string {
  const fileName = path.basename(filePath);
  const docInfo = detectDocType(fileName);
  const structuredContext = formatStructuredInput(structuredInput);
  const upgradeContext = buildUpgradeContext();
  const systemContextBlock = systemCtx ? formatSystemContext(systemCtx) : resolveKnowledgeContext(moduleName, fileName);

  const sectionsBlock = sections.map((s, i) =>
    `=== SECTION ${i + 1}: "${s.heading}" (${s.unknownCount} UNKNOWNs) ===\n${s.content}\n=== END SECTION ${i + 1} ===`
  ).join('\n\n');

  return `You are an expert software architect filling UNKNOWN placeholders in specific sections of a ${docInfo.label} document.

PROJECT NAME: ${projectName}
PROJECT IDEA: ${projectIdea}
MODULE/DOMAIN: ${moduleName}
${stackProfileContext ? `\n${stackProfileContext}\n` : ''}${structuredContext ? `\nDETAILED PROJECT CONTEXT:\n${structuredContext}\n` : ''}${upgradeContext}${systemContextBlock}

Below are ONLY the sections that contain UNKNOWN placeholders. Replace every UNKNOWN with specific, project-appropriate content.

Rules:
1. Replace EVERY "UNKNOWN" with specific, meaningful content appropriate to this project and domain.
2. When TEMPLATE GUIDANCE is provided above, follow its SOURCES TO DERIVE FROM and RULES exactly.
3. When UPSTREAM DOCUMENTS are provided, derive your fills from those documents.
4. Keep the exact same Markdown structure, headings, and table formatting within each section.
5. ${docInfo.guidance}
6. Return EACH section with the same === SECTION N ... === delimiters so I can splice them back.
7. Do NOT add new sections or remove existing ones.
8. Do NOT wrap the output in code fences.

SECTIONS TO FILL:

${sectionsBlock}

Return the filled sections with the same === SECTION N === delimiters:`;
}

function parseSectionFillResponse(response: string, sectionCount: number): Map<number, string> {
  const filled = new Map<number, string>();
  const pattern = /=== SECTION (\d+):[^=]*===\n([\s\S]*?)(?==== END SECTION \1 ===)/g;
  let match;

  while ((match = pattern.exec(response)) !== null) {
    const idx = parseInt(match[1], 10) - 1;
    if (idx >= 0 && idx < sectionCount) {
      filled.set(idx, match[2].trimEnd());
    }
  }

  if (filled.size === 0 && sectionCount === 1) {
    const cleaned = response.replace(/^```[\w]*\n/, '').replace(/\n```\s*$/, '').trim();
    const singleSection = cleaned.replace(/^=== SECTION \d+:[^=]*===\n/, '').replace(/\n=== END SECTION \d+ ===$/, '');
    filled.set(0, singleSection.trimEnd());
  }

  return filled;
}

function reassembleDocument(allSections: DocumentSection[], filledSections: Map<number, string>): string {
  const parts: string[] = [];
  for (let i = 0; i < allSections.length; i++) {
    if (filledSections.has(i)) {
      parts.push(filledSections.get(i)!);
    } else {
      parts.push(allSections[i].content);
    }
  }
  return parts.join('\n');
}

const SECTION_FILL_THRESHOLD = 10;

export async function fillFileWithAI(
  filePath: string,
  projectName: string,
  projectIdea: string,
  moduleName: string,
  onProgress?: (message: string) => void,
  structuredInput?: Record<string, string> | null,
  stackProfileContext?: string,
  projectRoot?: string,
): Promise<ContentFillResult> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0, error: 'File not found' };
  }

  let currentContent = fs.readFileSync(filePath, 'utf8');
  const unknownsBefore = countUnknowns(currentContent);

  if (unknownsBefore === 0) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0 };
  }

  const systemCtx = projectRoot ? assembleSystemContext(projectRoot, moduleName, filePath) : undefined;

  const allSections = parseDocumentSections(currentContent);
  const sectionsWithUnknowns = allSections.filter(s => s.hasUnknowns);
  const useSectionFill = allSections.length >= SECTION_FILL_THRESHOLD && sectionsWithUnknowns.length < allSections.length * 0.5;

  onProgress?.(`Filling ${path.basename(filePath)} (${unknownsBefore} UNKNOWNs, mode=${useSectionFill ? 'section' : 'full'}, sections=${sectionsWithUnknowns.length}/${allSections.length}, ctx: guidance=${systemCtx?.templateGuidance ? 'yes' : 'no'}, upstream=${systemCtx?.upstreamDocsContext ? 'yes' : 'no'}, knowledge=${systemCtx?.knowledgeContext ? 'yes' : 'no'})...`);

  let lastError: string | undefined;
  let unknownsAfter = unknownsBefore;

  for (let attempt = 1; attempt <= MAX_FILL_ATTEMPTS; attempt++) {
    try {
      const openai = await getOpenAI();

      if (useSectionFill) {
        const currentSections = parseDocumentSections(currentContent);
        const targetSections = currentSections.filter(s => s.hasUnknowns);
        if (targetSections.length === 0) break;

        const prompt = buildSectionFillPrompt(targetSections, filePath, projectName, projectIdea, moduleName, structuredInput, stackProfileContext, systemCtx);

        const response = await openai.chat.completions.create({
          model: 'gpt-5-mini',
          messages: [
            { role: 'system', content: 'You are a precise document editor. You fill UNKNOWN placeholders in specific sections of software specification documents. Return each section with the same === SECTION N === delimiters. Preserve all Markdown formatting exactly.' },
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
        const filledMap = parseSectionFillResponse(cleaned, targetSections.length);

        const sectionIndexMap = new Map<number, string>();
        let targetIdx = 0;
        for (let i = 0; i < currentSections.length; i++) {
          if (currentSections[i].hasUnknowns) {
            if (filledMap.has(targetIdx)) {
              sectionIndexMap.set(i, filledMap.get(targetIdx)!);
            }
            targetIdx++;
          }
        }

        const reassembled = reassembleDocument(currentSections, sectionIndexMap);
        unknownsAfter = countUnknowns(reassembled);

        if (unknownsAfter < countUnknowns(currentContent)) {
          currentContent = reassembled;
          fs.writeFileSync(filePath, reassembled, 'utf8');
          onProgress?.(`  Attempt ${attempt} (section): ${unknownsAfter === 0 ? 'all' : unknownsAfter} UNKNOWNs ${unknownsAfter === 0 ? 'resolved' : 'remaining'}`);
        } else {
          onProgress?.(`  Attempt ${attempt} (section): no improvement (${unknownsAfter} UNKNOWNs remain)`);
        }
      } else {
        const prompt = buildFillPrompt(currentContent, filePath, projectName, projectIdea, moduleName, structuredInput, stackProfileContext, systemCtx);

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
          onProgress?.(`  Attempt ${attempt}: ${unknownsAfter === 0 ? 'all' : unknownsAfter} UNKNOWNs ${unknownsAfter === 0 ? 'resolved' : 'remaining'}`);
        } else {
          onProgress?.(`  Attempt ${attempt}: no improvement (${unknownsAfter} UNKNOWNs remain)`);
        }
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
  projectRoot?: string,
): Promise<ContentFillResult> {
  if (!fs.existsSync(filePath)) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0, error: 'File not found' };
  }

  let currentContent = fs.readFileSync(filePath, 'utf8');
  const unknownsBefore = countUnknowns(currentContent);
  if (unknownsBefore === 0) {
    return { file: filePath, module: moduleName, status: 'skipped', unknownsBefore: 0, unknownsAfter: 0 };
  }

  const systemCtx = projectRoot ? assembleSystemContext(projectRoot, moduleName, filePath) : undefined;

  onProgress?.(`Filling ${path.basename(filePath)} with user context (${unknownsBefore} UNKNOWNs, ctx: guidance=${systemCtx?.templateGuidance ? 'yes' : 'no'}, upstream=${systemCtx?.upstreamDocsContext ? 'yes' : 'no'})...`);

  let lastError: string | undefined;
  let unknownsAfter = unknownsBefore;

  for (let attempt = 1; attempt <= MAX_FILL_ATTEMPTS; attempt++) {
    try {
      const openai = await getOpenAI();
      const prompt = buildContextAwareFillPrompt(currentContent, filePath, projectName, projectIdea, moduleName, userAnswers, parentContext, structuredInput, stackProfileContext, systemCtx);

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
    const result = await fillFileWithAI(filePath, projectName, projectIdea, moduleName, onProgress, structuredInput, stackProfileContext, projectRoot);
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
    targetFile, projectName, projectIdea, targetModule, userAnswers, '', onProgress, structuredInput, stackProfileContext, projectRoot,
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
      file, projectName, projectIdea, module, {}, updatedParentContent, onProgress, structuredInput, stackProfileContext, projectRoot,
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
  const projectIdea = process.env.AXION_PROJECT_IDEA || projectName!;

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

      async function processOneContentFillModule(mod: string) {
        if (!isStageDone('draft', mod)) {
          const msg = `Module '${mod}' has not completed 'draft'. Skipping.`;
          receipt.warnings.push(msg);
          if (!dryRun) markStageFailed('content-fill', mod, { reason: msg });
          return;
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
          return;
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

      const BATCH_CONCURRENCY = 3;
      if (hasFlag('--batch') && modules.length > 1) {
        const batches = computeContentFillBatches(projectRoot, modules);
        log(`Batch mode: ${batches.length} batch(es), concurrency=${BATCH_CONCURRENCY}`);
        for (let bi = 0; bi < batches.length; bi++) {
          const batch = batches[bi];
          log(`  Batch ${bi + 1}/${batches.length}: [${batch.join(', ')}]`);
          const chunks: string[][] = [];
          for (let i = 0; i < batch.length; i += BATCH_CONCURRENCY) {
            chunks.push(batch.slice(i, i + BATCH_CONCURRENCY));
          }
          for (const chunk of chunks) {
            await Promise.all(chunk.map(m => processOneContentFillModule(m)));
          }
        }
      } else {
        for (const mod of modules) {
          await processOneContentFillModule(mod);
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
