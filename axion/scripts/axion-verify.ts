#!/usr/bin/env node
/**
 * AXION Verify Script
 * 
 * Final gate before lock. Fails if critical issues remain.
 * Runs: module checks + seam verification + template hashing.
 * Writes verify_report.json (consolidated) + verify_status.json + stage_markers.json.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-verify.ts --module <name>
 *   npx ts-node axion/scripts/axion-verify.ts --all
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
const MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
const STATUS_PATH = path.join(AXION_ROOT, 'registry', 'verify_status.json');
const REPORT_PATH = path.join(AXION_ROOT, 'registry', 'verify_report.json');
const SEAMS_PATH = path.join(AXION_ROOT, 'registry', 'seams.json');
const HASH_FILE = path.join(AXION_ROOT, 'registry', 'template_hashes.json');
const TEMPLATES_PATH = path.join(AXION_ROOT, 'templates');

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

interface StageMarkers {
  version: string;
  markers: Record<string, Record<string, any>>;
}

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
    return { version: '1.0.0', markers: {} };
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
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
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));
}

function saveReport(report: VerifyReport): void {
  const dir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

function loadSeamRegistry(): SeamRegistry | null {
  if (!fs.existsSync(SEAMS_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(SEAMS_PATH, 'utf-8'));
}

// ────────────────────────────────────────────────────────────
// Module verification
// ────────────────────────────────────────────────────────────

function verifyModule(mod: Module, markers: StageMarkers): { status: 'PASS' | 'FAIL'; reason_codes: string[]; hints: string[] } {
  const reason_codes: string[] = [];
  const hints: string[] = [];
  
  if (!markers.markers[mod.slug]?.generate) {
    reason_codes.push('PREREQ_NOT_SATISFIED');
    hints.push('Run generate stage first');
  }
  
  if (!markers.markers[mod.slug]?.seed) {
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
  
  const unknownCount = (content.match(/UNKNOWN/g) || []).length;
  if (unknownCount > 0) {
    reason_codes.push('UNKNOWN_WITHOUT_QUESTION');
    hints.push(`Address ${unknownCount} UNKNOWN items`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers.markers[dep]?.verify || markers.markers[dep].verify.status !== 'PASS') {
        reason_codes.push('DEP_NOT_VERIFIED');
        hints.push(`Dependency ${dep} must pass verify first`);
      }
    }
  }
  
  const status = reason_codes.length === 0 ? 'PASS' : 'FAIL';
  return { status, reason_codes, hints };
}

// ────────────────────────────────────────────────────────────
// Seam verification (inline, not external script)
// ────────────────────────────────────────────────────────────

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

const LINK_PATTERNS = [/see\s+\[.*?\]\(.*?\/README\.md\)/i, /refer\s+to\s+\[.*?\]/i, /defined\s+in\s+\[.*?\]/i, /→\s*\[.*?\]/, /link:\s*\[.*?\]/i];

function checkForDefinitions(content: string, seamName: string): { found: boolean; line?: number } {
  const patterns = DEFINITION_PATTERNS[seamName] || [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        return { found: true, line: i + 1 };
      }
    }
  }
  return { found: false };
}

function hasProperLink(content: string, seam: Seam): boolean {
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
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  node --import tsx axion/scripts/axion-verify.ts --module <name>');
    console.log('  node --import tsx axion/scripts/axion-verify.ts --all');
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
    
    if (!markers.markers[mod.slug]) markers.markers[mod.slug] = {};
    markers.markers[mod.slug].verify = { completed_at: new Date().toISOString(), status: result.status };
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
  
  // 3. Template hashing
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
