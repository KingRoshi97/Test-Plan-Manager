#!/usr/bin/env node
/**
 * AXION Verify Script
 * 
 * Final gate before lock. Fails if critical issues remain.
 * Runs: module checks + seam verification + template hashing.
 * Writes verify_report.json (consolidated) + verify_status.json + stage_markers.json.
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-verify.ts --root <workspace> --module <name>
 *   npx tsx axion/scripts/axion-verify.ts --root <workspace> --all
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { writeJsonAtomic } from '../lib/atomic-writer.js';

// Parse --root argument first for two-root support
const args = process.argv.slice(2);
const rootArgIndex = args.indexOf('--root');
const WORKSPACE_ROOT = rootArgIndex !== -1 && args[rootArgIndex + 1]
  ? args[rootArgIndex + 1]
  : process.env.AXION_WORKSPACE || process.cwd();

// System root (read-only) - contains config and templates
const AXION_ROOT = process.env.AXION_SYSTEM_ROOT || path.join(path.dirname(WORKSPACE_ROOT), 'axion');

// Config from system root
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const COVERAGE_MAP_PATH = path.join(AXION_ROOT, 'config', 'coverage_map.json');
const TEMPLATES_PATH = path.join(AXION_ROOT, 'templates');

// Outputs to workspace root
const DOMAINS_PATH = path.join(WORKSPACE_ROOT, 'domains');
const REGISTRY_PATH = path.join(WORKSPACE_ROOT, 'registry');
const MARKERS_PATH = path.join(REGISTRY_PATH, 'stage_markers.json');
const STATUS_PATH = path.join(REGISTRY_PATH, 'verify_status.json');
const REPORT_PATH = path.join(REGISTRY_PATH, 'verify_report.json');
const SEAMS_PATH = path.join(REGISTRY_PATH, 'seams.json');
const HASH_FILE = path.join(REGISTRY_PATH, 'template_hashes.json');

// Core modules requiring RPBS_DERIVATIONS enforcement
const CORE_MODULES = ['contracts', 'database', 'auth', 'backend', 'state', 'frontend', 'fullstack', 'systems'];

interface CoverageMap {
  version: string;
  core_modules: string[];
  blocks: Record<string, {
    source: string;
    source_section: string;
    required_for: string[];
    notes: string;
  }>;
  enforcement_rules: {
    derivation_block_required: boolean;
    unknown_requires_question: boolean;
    capability_mention_required: boolean;
  };
}

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

interface Module {
  name: string;
  slug: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

// Flat markers structure: { moduleName: { stageName: { ... } } }
type StageMarkers = Record<string, Record<string, any>>;

interface VerifyStatus {
  version: string;
  last_verified: string;
  modules: Record<string, {
    status: 'PASS' | 'FAIL';
    verified_at: string;
    reason_codes: string[];
    hints: string[];
  }>;
}

interface Seam {
  owner: string;
  description: string;
  canonical_doc: string;
  sections: string[];
  related_modules: string[];
  link_instruction: string;
}

interface SeamRegistry {
  version: string;
  seams: Record<string, Seam>;
  reason_codes: Record<string, string>;
}

interface SeamViolation {
  module: string;
  seam: string;
  reason_code: string;
  description: string;
  file: string;
  line?: number;
  fix_action: string;
}

interface TemplateDriftChange {
  added: string[];
  removed: string[];
  modified: string[];
}

interface VerifyReport {
  generated_at: string;
  overall_status: 'PASS' | 'FAIL';
  modules: Record<string, {
    status: 'PASS' | 'FAIL';
    reason_codes: string[];
    hints: string[];
  }>;
  seam_violations: SeamViolation[];
  template_drift: {
    status: 'PASS' | 'FAIL';
    current_revision: number;
    changes: TemplateDriftChange;
  };
  next_commands: string[];
}

// ────────────────────────────────────────────────────────────
// File loaders
// ────────────────────────────────────────────────────────────

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadMarkers(): StageMarkers {
  if (!fs.existsSync(MARKERS_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.mkdirSync(REGISTRY_PATH, { recursive: true });
  }
  fs.writeFileSync(MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function loadStatus(): VerifyStatus {
  if (!fs.existsSync(STATUS_PATH)) {
    return { version: '1.0.0', last_verified: '', modules: {} };
  }
  return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8'));
}

function saveStatus(status: VerifyStatus): void {
  const dir = path.dirname(STATUS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  writeJsonAtomic(STATUS_PATH, status);
}

function saveReport(report: VerifyReport): void {
  const dir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  writeJsonAtomic(REPORT_PATH, report);
}

function loadSeamRegistry(): SeamRegistry | null {
  if (!fs.existsSync(SEAMS_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(SEAMS_PATH, 'utf-8'));
}

function loadCoverageMap(): CoverageMap | null {
  if (!fs.existsSync(COVERAGE_MAP_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(COVERAGE_MAP_PATH, 'utf-8'));
}

// ────────────────────────────────────────────────────────────
// Derivation block verification
// ────────────────────────────────────────────────────────────

interface DerivationCheckResult {
  hasBlock: boolean;
  hasTenancy: boolean;
  hasNFP: boolean;
  hasCapabilities: boolean;
  hasOpenQuestions: boolean;
  unresolvedUnknowns: number;
  openQuestionsReferenced: boolean;
}

function checkDerivationBlock(content: string): DerivationCheckResult {
  const result: DerivationCheckResult = {
    hasBlock: false,
    hasTenancy: false,
    hasNFP: false,
    hasCapabilities: false,
    hasOpenQuestions: false,
    unresolvedUnknowns: 0,
    openQuestionsReferenced: false,
  };
  
  // Check for the derivation block header
  result.hasBlock = content.includes('## RPBS_DERIVATIONS (Required)');
  
  if (!result.hasBlock) {
    return result;
  }
  
  // Extract derivation block content
  const blockStart = content.indexOf('## RPBS_DERIVATIONS (Required)');
  const blockEnd = content.indexOf('\n## ', blockStart + 1);
  const blockContent = blockEnd !== -1 
    ? content.slice(blockStart, blockEnd)
    : content.slice(blockStart);
  
  // Check required fields
  result.hasTenancy = /Tenancy\/Org Model:/i.test(blockContent);
  result.hasNFP = /Non-Functional Profile/i.test(blockContent);
  result.hasCapabilities = /Enabled capabilities/i.test(blockContent) || 
    (/Billing\/Entitlements:/i.test(blockContent) && /Notifications:/i.test(blockContent));
  result.hasOpenQuestions = /OPEN_QUESTIONS impacting this module:/i.test(blockContent);
  
  // Count UNKNOWN values in derivation block
  const unknownMatches = blockContent.match(/:\s*UNKNOWN/g) || [];
  result.unresolvedUnknowns = unknownMatches.length;
  
  // Check if UNKNOWN values have corresponding Q-IDs referenced
  const openQLine = blockContent.match(/OPEN_QUESTIONS impacting this module:\s*(.+)/i);
  if (openQLine && openQLine[1]) {
    const qValue = openQLine[1].trim();
    // Check if Q-IDs are referenced (Q-1, Q-2, etc.) or explicitly NONE
    result.openQuestionsReferenced = /Q-\d+/i.test(qValue) || qValue.toUpperCase() === 'NONE';
  }
  
  return result;
}

// ────────────────────────────────────────────────────────────
// Module verification
// ────────────────────────────────────────────────────────────

function verifyModule(mod: Module, markers: StageMarkers): { status: 'PASS' | 'FAIL'; reason_codes: string[]; hints: string[] } {
  const reason_codes: string[] = [];
  const hints: string[] = [];
  
  const coverageMap = loadCoverageMap();
  const coreModules = coverageMap?.core_modules || CORE_MODULES;
  const isCoreModule = coreModules.includes(mod.slug);
  
  if (!markers[mod.slug]?.generate) {
    reason_codes.push('PREREQ_NOT_SATISFIED');
    hints.push('Run generate stage first');
  }
  
  if (!markers[mod.slug]?.seed) {
    reason_codes.push('PREREQ_NOT_SATISFIED');
    hints.push('Run seed stage first');
  }
  
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    reason_codes.push('MISSING_DOC');
    hints.push('Generate module documentation');
    return { status: 'FAIL', reason_codes, hints };
  }
  
  const content = fs.readFileSync(docPath, 'utf-8');
  
  // Derivation block enforcement for core modules
  if (isCoreModule) {
    const derivCheck = checkDerivationBlock(content);
    
    if (!derivCheck.hasBlock) {
      reason_codes.push('MISSING_DERIVATION_BLOCK');
      hints.push('Add ## RPBS_DERIVATIONS (Required) section');
    } else {
      // Check for required derivation fields
      if (!derivCheck.hasTenancy) {
        reason_codes.push('UNRESOLVED_DERIVATION');
        hints.push('Add Tenancy/Org Model field to derivation block');
      }
      
      if (!derivCheck.hasNFP) {
        reason_codes.push('UNRESOLVED_DERIVATION');
        hints.push('Add Non-Functional Profile implications field');
      }
      
      if (!derivCheck.hasCapabilities) {
        reason_codes.push('UNRESOLVED_DERIVATION');
        hints.push('Add enabled capabilities toggles (Billing/Notifications/Uploads/Public API)');
      }
      
      if (!derivCheck.hasOpenQuestions) {
        reason_codes.push('UNRESOLVED_DERIVATION');
        hints.push('Add OPEN_QUESTIONS impacting this module field');
      }
      
      // Check UNKNOWN values have Q-IDs if applicable
      if (derivCheck.unresolvedUnknowns > 0 && !derivCheck.openQuestionsReferenced) {
        reason_codes.push('UNKNOWN_WITHOUT_OPEN_QUESTION');
        hints.push(`${derivCheck.unresolvedUnknowns} UNKNOWN values require Q-IDs in OPEN_QUESTIONS field`);
      }
    }
  }
  
  if (!content.includes('## ACCEPTANCE')) {
    reason_codes.push('MISSING_ACCEPTANCE');
    hints.push('Add ACCEPTANCE criteria section');
  }
  
  const requiredSections = ['## 1.', '## 2.'];
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      reason_codes.push('MISSING_SECTION');
      hints.push(`Add required section: ${section}`);
    }
  }
  
  const tbdCount = (content.match(/\[TBD\]/g) || []).length;
  if (tbdCount > 5) {
    reason_codes.push('TBD_IN_REQUIRED');
    hints.push(`Resolve ${tbdCount} [TBD] placeholders`);
  }
  
  // Skip global UNKNOWN check for derivation blocks (handled separately above)
  const contentWithoutDerivBlock = isCoreModule 
    ? content.replace(/## RPBS_DERIVATIONS \(Required\)[\s\S]*?(?=\n## |$)/, '')
    : content;
  const unknownCount = (contentWithoutDerivBlock.match(/UNKNOWN/g) || []).length;
  if (unknownCount > 0) {
    reason_codes.push('UNKNOWN_WITHOUT_QUESTION');
    hints.push(`Address ${unknownCount} UNKNOWN items outside derivation block`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers[dep]?.verify || markers[dep].verify.status !== 'PASS') {
        reason_codes.push('DEP_NOT_VERIFIED');
        hints.push(`Dependency ${dep} must pass verify first`);
      }
    }
  }
  
  const status = reason_codes.length === 0 ? 'PASS' : 'FAIL';
  return { status, reason_codes, hints };
}

// ────────────────────────────────────────────────────────────
// Seam verification (marker-based + regex fallback)
// ────────────────────────────────────────────────────────────

// Marker patterns for deterministic seam detection
const SEAM_OWNER_MARKER = /<!--\s*AXION:SEAM_OWNER:(\w+)\s*-->/;
const SEAM_DEFINITION_START = /<!--\s*AXION:SEAM_DEFINITION_START\s*-->/;
const SEAM_DEFINITION_END = /<!--\s*AXION:SEAM_DEFINITION_END\s*-->/;

// Regex fallback patterns for legacy compatibility
const DEFINITION_PATTERNS: Record<string, RegExp[]> = {
  error_model: [/error\s*codes?:\s*\[/i, /error\s*taxonomy/i, /error\s*response\s*shape/i, /HTTP\s*\d{3}\s*:/],
  schema_truth: [/entity\s*schema/i, /field\s*definitions?:/i, /data\s*model:/i, /table\s*structure/i],
  identity: [/authentication\s*flow/i, /session\s*management/i, /user\s*identity\s*model/i, /authorization\s*rules?:/i],
  webhooks: [/webhook\s*payload/i, /event\s*schema/i, /delivery\s*guarantee/i, /retry\s*policy/i],
  correlation_ids: [/correlation\s*id\s*format/i, /trace\s*id\s*propagation/i, /distributed\s*tracing\s*standard/i],
  api_versioning: [/version\s*strategy/i, /deprecation\s*policy/i, /breaking\s*change\s*rules?/i],
  feature_flags: [/feature\s*flag\s*definitions?/i, /rollout\s*rules?/i, /targeting\s*logic/i],
};

const MENTION_PATTERNS: Record<string, RegExp[]> = {
  error_model: [/error\s*handling/i, /error\s*response/i, /error\s*codes?/i, /failure\s*modes?/i],
  schema_truth: [/data\s*model/i, /entity\s*schema/i, /database\s*schema/i, /field\s*types?/i],
  identity: [/authentication/i, /authorization/i, /user\s*identity/i, /session\s*management/i, /access\s*control/i],
  webhooks: [/webhook/i, /event\s*payload/i, /event\s*delivery/i, /callback\s*url/i],
  correlation_ids: [/correlation\s*id/i, /trace\s*id/i, /request\s*id/i, /distributed\s*tracing/i],
  api_versioning: [/api\s*version/i, /versioning\s*strategy/i, /deprecation/i, /breaking\s*change/i],
  feature_flags: [/feature\s*flag/i, /feature\s*toggle/i, /rollout/i, /targeting/i],
};

const LINK_PATTERNS = [
  /\((?:\.\.\/)*\w+\/README\.md(?:#[^)]+)?\)/i,
  /see\s+\[.*?\]\(.*?\/README\.md\)/i,
  /refer\s+to\s+\[.*?\]/i,
  /defined\s+in\s+\[.*?\]/i,
  /→\s*\[.*?\]/,
  /link:\s*\[.*?\]/i,
];

interface SeamOwnerMarker {
  found: boolean;
  seam?: string;
  line?: number;
}

interface DefinitionBlock {
  found: boolean;
  startLine?: number;
  endLine?: number;
  content?: string;
  hash?: string;
}

function findSeamOwnerMarker(content: string): SeamOwnerMarker {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(SEAM_OWNER_MARKER);
    if (match) {
      return { found: true, seam: match[1], line: i + 1 };
    }
  }
  return { found: false };
}

function extractDefinitionBlock(content: string): DefinitionBlock {
  const lines = content.split('\n');
  let startLine: number | undefined;
  let endLine: number | undefined;
  
  for (let i = 0; i < lines.length; i++) {
    if (SEAM_DEFINITION_START.test(lines[i])) {
      startLine = i + 1;
    }
    if (SEAM_DEFINITION_END.test(lines[i]) && startLine !== undefined) {
      endLine = i + 1;
      break;
    }
  }
  
  if (startLine !== undefined && endLine !== undefined) {
    const blockContent = lines.slice(startLine, endLine - 1).join('\n');
    const normalized = blockContent.replace(/\s+/g, ' ').toLowerCase().trim();
    const hash = crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
    return { found: true, startLine, endLine, content: blockContent, hash };
  }
  
  return { found: false };
}

function checkForDefinitions(content: string, seamName: string): { found: boolean; line?: number; isMarker?: boolean } {
  const ownerMarker = findSeamOwnerMarker(content);
  if (ownerMarker.found && ownerMarker.seam === seamName) {
    return { found: true, line: ownerMarker.line, isMarker: true };
  }
  
  const defBlock = extractDefinitionBlock(content);
  if (defBlock.found) {
    return { found: true, line: defBlock.startLine, isMarker: true };
  }
  
  const patterns = DEFINITION_PATTERNS[seamName] || [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        return { found: true, line: i + 1, isMarker: false };
      }
    }
  }
  return { found: false };
}

function hasProperLink(content: string, seam: Seam): boolean {
  const canonicalPath = seam.canonical_doc.replace(/\//g, '\\/');
  const exactPathPattern = new RegExp(`\\((?:\\.\\.\\/)*${canonicalPath}(?:#[^)]+)?\\)`, 'i');
  if (exactPathPattern.test(content)) {
    return true;
  }
  
  const ownerRef = new RegExp(seam.owner, 'i');
  return ownerRef.test(content) && LINK_PATTERNS.some(p => p.test(content));
}

function checkForMissingLink(content: string, seamName: string, seam: Seam): boolean {
  const mentionPatterns = MENTION_PATTERNS[seamName] || [];
  const mentionsTopic = mentionPatterns.some(pattern => pattern.test(content));
  if (!mentionsTopic) return false;
  return !hasProperLink(content, seam);
}

function loadOwnerContent(seam: Seam): string | null {
  const ownerPath = path.join(DOMAINS_PATH, seam.owner, 'README.md');
  if (!fs.existsSync(ownerPath)) return null;
  return fs.readFileSync(ownerPath, 'utf-8');
}

function checkForDuplicateDefinition(content: string, seamName: string, ownerContent: string | null): { found: boolean; line?: number } {
  if (!ownerContent) return { found: false };
  
  const ownerBlock = extractDefinitionBlock(ownerContent);
  const nonOwnerBlock = extractDefinitionBlock(content);
  
  if (ownerBlock.found && nonOwnerBlock.found && ownerBlock.hash === nonOwnerBlock.hash) {
    return { found: true, line: nonOwnerBlock.startLine };
  }
  
  const patterns = DEFINITION_PATTERNS[seamName] || [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i]) && pattern.test(ownerContent)) {
        return { found: true, line: i + 1 };
      }
    }
  }
  return { found: false };
}

function verifySeams(modules: string[]): SeamViolation[] {
  const registry = loadSeamRegistry();
  if (!registry) return [];
  
  const violations: SeamViolation[] = [];
  
  for (const moduleName of modules) {
    const modulePath = path.join(DOMAINS_PATH, moduleName);
    if (!fs.existsSync(modulePath)) continue;
    
    const docs = fs.readdirSync(modulePath).filter(f => f.endsWith('.md')).map(f => path.join(modulePath, f));
    
    for (const [seamName, seam] of Object.entries(registry.seams)) {
      if (seam.owner === moduleName) continue;
      if (!seam.related_modules.includes(moduleName)) continue;
      
      const ownerContent = loadOwnerContent(seam);
      
      for (const docPath of docs) {
        const content = fs.readFileSync(docPath, 'utf-8');
        const defCheck = checkForDefinitions(content, seamName);
        
        if (defCheck.found) {
          if (!hasProperLink(content, seam)) {
            violations.push({
              module: moduleName,
              seam: seamName,
              reason_code: 'SEAM_OWNER_VIOLATION',
              description: `Module "${moduleName}" defines ${seamName} content that belongs to "${seam.owner}"`,
              file: path.relative(AXION_ROOT, docPath),
              line: defCheck.line,
              fix_action: seam.link_instruction,
            });
          }
          
          const dupCheck = checkForDuplicateDefinition(content, seamName, ownerContent);
          if (dupCheck.found) {
            violations.push({
              module: moduleName,
              seam: seamName,
              reason_code: 'SEAM_DUPLICATE_DEFINITION',
              description: `Module "${moduleName}" duplicates ${seamName} definition from owner "${seam.owner}"`,
              file: path.relative(AXION_ROOT, docPath),
              line: dupCheck.line,
              fix_action: `Remove duplicate definition and link to ${seam.canonical_doc} instead`,
            });
          }
        } else if (checkForMissingLink(content, seamName, seam)) {
          violations.push({
            module: moduleName,
            seam: seamName,
            reason_code: 'SEAM_MISSING_LINK',
            description: `Module "${moduleName}" references ${seamName} without linking to owner`,
            file: path.relative(AXION_ROOT, docPath),
            fix_action: `Add link to ${seam.canonical_doc} for ${seamName} references`,
          });
        }
      }
    }
  }
  
  return violations;
}

// ────────────────────────────────────────────────────────────
// Stack consistency verification
// ────────────────────────────────────────────────────────────

interface StackViolation {
  module: string;
  issue: string;
  expected: string;
  found: string;
  file: string;
}

function extractArchitectureStack(): Record<string, string> | null {
  const archPath = path.join(DOMAINS_PATH, 'architecture', 'README.md');
  if (!fs.existsSync(archPath)) return null;
  
  const content = fs.readFileSync(archPath, 'utf-8');
  const stack: Record<string, string> = {};
  
  const patterns: Record<string, RegExp> = {
    'frontend_framework': /^- Framework:\s*(.+)$/m,
    'frontend_language': /^- Language:\s*(.+)$/m,
    'backend_runtime': /^- Runtime:\s*(.+)$/m,
    'backend_framework': /^- Framework:\s*(.+)$/m,
    'database_engine': /^- Engine:\s*(.+)$/m,
    'database_orm': /^- ORM:\s*(.+)$/m,
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = content.match(pattern);
    if (match && match[1] && !match[1].includes('[TBD]')) {
      stack[key] = match[1].trim();
    }
  }
  
  return Object.keys(stack).length > 0 ? stack : null;
}

function verifyStackConsistency(modules: string[]): StackViolation[] {
  const violations: StackViolation[] = [];
  const archStack = extractArchitectureStack();
  
  if (!archStack) return violations;
  
  const moduleStackPatterns: Record<string, { key: string; pattern: RegExp }[]> = {
    frontend: [
      { key: 'frontend_framework', pattern: /(?:framework|react|vue|angular|svelte)/i },
      { key: 'frontend_language', pattern: /(?:typescript|javascript|ts|js)\b/i },
    ],
    backend: [
      { key: 'backend_runtime', pattern: /(?:node|python|java|go|rust)\b/i },
      { key: 'backend_framework', pattern: /(?:express|fastify|django|flask|spring)\b/i },
    ],
    database: [
      { key: 'database_engine', pattern: /(?:postgres|mysql|mongodb|sqlite)\b/i },
      { key: 'database_orm', pattern: /(?:drizzle|prisma|typeorm|sequelize)\b/i },
    ],
  };
  
  for (const moduleName of modules) {
    if (moduleName === 'architecture') continue;
    
    const patterns = moduleStackPatterns[moduleName];
    if (!patterns) continue;
    
    const modulePath = path.join(DOMAINS_PATH, moduleName, 'README.md');
    if (!fs.existsSync(modulePath)) continue;
    
    const content = fs.readFileSync(modulePath, 'utf-8');
    
    for (const { key, pattern } of patterns) {
      if (!archStack[key]) continue;
      
      const archValue = archStack[key].toLowerCase();
      const matches = content.match(new RegExp(pattern, 'gi'));
      
      if (matches) {
        for (const match of matches) {
          const matchLower = match.toLowerCase();
          if (!archValue.includes(matchLower) && !matchLower.includes(archValue.split(' ')[0].toLowerCase())) {
            const archValueLower = archStack[key].toLowerCase().split(' ')[0];
            if (!matchLower.includes(archValueLower) && !archValueLower.includes(matchLower)) {
              violations.push({
                module: moduleName,
                issue: `Stack mismatch for ${key}`,
                expected: archStack[key],
                found: match,
                file: `domains/${moduleName}/README.md`,
              });
            }
          }
        }
      }
    }
  }
  
  return violations;
}

// ────────────────────────────────────────────────────────────
// Template hashing (inline, not external script)
// ────────────────────────────────────────────────────────────

interface FileHash {
  path: string;
  hash: string;
  size: number;
  modified: string;
}

interface HashRegistry {
  version: string;
  generated_at: string;
  revision: number;
  templates: FileHash[];
  registries: FileHash[];
  total_files: number;
}

function computeHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

function getFileStats(filePath: string): FileHash {
  const stat = fs.statSync(filePath);
  return {
    path: path.relative(AXION_ROOT, filePath),
    hash: computeHash(filePath),
    size: stat.size,
    modified: stat.mtime.toISOString(),
  };
}

function findTemplates(): string[] {
  const templates: string[] = [];
  if (!fs.existsSync(TEMPLATES_PATH)) return templates;
  
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) scanDir(fullPath);
      else if (entry.endsWith('.template.md') || entry === '_INDEX.md') templates.push(fullPath);
    }
  }
  
  scanDir(TEMPLATES_PATH);
  return templates.sort();
}

function verifyTemplateHashes(): { status: 'PASS' | 'FAIL'; current_revision: number; changes: TemplateDriftChange } {
  if (!fs.existsSync(HASH_FILE)) {
    return { status: 'FAIL', current_revision: 0, changes: { added: [], removed: [], modified: [] } };
  }
  
  const stored: HashRegistry = JSON.parse(fs.readFileSync(HASH_FILE, 'utf-8'));
  const currentTemplates = findTemplates().map(getFileStats);
  
  const storedMap = new Map<string, FileHash>();
  for (const f of stored.templates) storedMap.set(f.path, f);
  
  const currentMap = new Map<string, FileHash>();
  for (const f of currentTemplates) currentMap.set(f.path, f);
  
  const changes: TemplateDriftChange = { added: [], removed: [], modified: [] };
  
  for (const [p, file] of currentMap) {
    const storedFile = storedMap.get(p);
    if (!storedFile) changes.added.push(p);
    else if (storedFile.hash !== file.hash) changes.modified.push(p);
  }
  
  for (const [p] of storedMap) {
    if (!currentMap.has(p)) changes.removed.push(p);
  }
  
  const hasChanges = changes.added.length > 0 || changes.removed.length > 0 || changes.modified.length > 0;
  return { status: hasChanges ? 'FAIL' : 'PASS', current_revision: stored.revision, changes };
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

function main() {
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx tsx axion/scripts/axion-verify.ts --root <workspace> --module <name>');
    console.log('  npx tsx axion/scripts/axion-verify.ts --root <workspace> --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  const status = loadStatus();
  
  const targetMod = config.modules.find(m => m.slug === targetModule);
  
  if (!runAll && !targetMod) {
    console.error(`[ERROR] Module "${targetModule}" not found`);
    process.exit(1);
  }
  
  const modulesToVerify = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Verify\n');
  
  // 1. Module verification
  let allModulesPassed = true;
  const moduleResults: Record<string, { status: 'PASS' | 'FAIL'; reason_codes: string[]; hints: string[] }> = {};
  
  for (const mod of modulesToVerify) {
    if (!mod) continue;
    
    console.log(`[INFO] Verifying ${mod.name}...`);
    const result = verifyModule(mod, markers);
    moduleResults[mod.slug] = result;
    
    status.modules[mod.slug] = {
      status: result.status,
      verified_at: new Date().toISOString(),
      reason_codes: result.reason_codes,
      hints: result.hints,
    };
    
    if (result.status === 'PASS') {
      console.log(`[PASS] ${mod.name}`);
    } else {
      console.log(`[FAIL] ${mod.name}`);
      console.log(`  Reason codes: ${result.reason_codes.join(', ')}`);
      allModulesPassed = false;
    }
    
    if (!markers[mod.slug]) markers[mod.slug] = {};
    markers[mod.slug].verify = { completed_at: new Date().toISOString(), status: result.status };
  }
  
  // 2. Seam verification
  console.log('\n[INFO] Checking seam ownership...');
  const moduleNames = modulesToVerify.filter(Boolean).map(m => m!.slug);
  const seamViolations = verifySeams(moduleNames);
  
  if (seamViolations.length === 0) {
    console.log('[PASS] No seam violations');
  } else {
    console.log(`[FAIL] Found ${seamViolations.length} seam violation(s)`);
    for (const v of seamViolations) {
      console.log(`  - ${v.reason_code}: ${v.module}/${v.seam} (${v.file}${v.line ? ':' + v.line : ''})`);
    }
  }
  
  // 3. Stack consistency
  console.log('\n[INFO] Checking stack consistency...');
  const stackViolations = verifyStackConsistency(moduleNames);
  
  if (stackViolations.length === 0) {
    console.log('[PASS] Stack choices consistent');
  } else {
    console.log(`[WARN] Found ${stackViolations.length} stack mismatch(es)`);
    for (const v of stackViolations) {
      console.log(`  - ${v.module}: expected "${v.expected}" but found "${v.found}"`);
    }
  }
  
  // 4. Template hashing
  console.log('\n[INFO] Checking template hashes...');
  const templateDrift = verifyTemplateHashes();
  
  if (templateDrift.status === 'PASS') {
    console.log(`[PASS] Templates match revision ${templateDrift.current_revision}`);
  } else {
    console.log(`[FAIL] Template drift detected`);
    if (templateDrift.changes.modified.length > 0) console.log(`  Modified: ${templateDrift.changes.modified.join(', ')}`);
    if (templateDrift.changes.added.length > 0) console.log(`  Added: ${templateDrift.changes.added.join(', ')}`);
    if (templateDrift.changes.removed.length > 0) console.log(`  Removed: ${templateDrift.changes.removed.join(', ')}`);
  }
  
  // 4. Build consolidated report
  const overallPassed = allModulesPassed && seamViolations.length === 0 && templateDrift.status === 'PASS';
  
  const nextCommands: string[] = [];
  if (!allModulesPassed) nextCommands.push('node --import tsx axion/scripts/axion-repair.ts --module <failed_module>');
  if (seamViolations.length > 0) nextCommands.push('node --import tsx axion/scripts/axion-repair.ts --seams');
  if (templateDrift.status === 'FAIL') nextCommands.push('node --import tsx axion/scripts/axion-hash-templates.ts --generate --bump');
  
  const report: VerifyReport = {
    generated_at: new Date().toISOString(),
    overall_status: overallPassed ? 'PASS' : 'FAIL',
    modules: moduleResults,
    seam_violations: seamViolations,
    template_drift: templateDrift,
    next_commands: nextCommands,
  };
  
  status.last_verified = new Date().toISOString();
  saveStatus(status);
  saveMarkers(markers);
  saveReport(report);
  
  console.log(`\n[INFO] Report written to: registry/verify_report.json`);
  
  const response = {
    status: overallPassed ? 'success' : 'failed',
    stage: 'verify',
    module: runAll ? 'all' : targetModule,
    all_passed: overallPassed,
    seam_violations: seamViolations.length,
    template_drift: templateDrift.status,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2) + '\n');
  process.exit(overallPassed ? 0 : 1);
}

main();
