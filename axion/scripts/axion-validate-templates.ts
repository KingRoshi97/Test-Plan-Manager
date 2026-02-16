#!/usr/bin/env node
/**
 * AXION Template Validation Guardrail
 * 
 * Validates template anchors, detects orphaned anchors, surviving UNKNOWN
 * placeholders, and missing required doc types across domains.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-validate-templates.ts
 *   node --import tsx axion/scripts/axion-validate-templates.ts --root ./my-workspace
 *   node --import tsx axion/scripts/axion-validate-templates.ts --strict --json
 *   node --import tsx axion/scripts/axion-validate-templates.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = path.resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────────────────────
// CLI Flags
// ─────────────────────────────────────────────────────────────────────────────

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

// ─────────────────────────────────────────────────────────────────────────────
// Standard Receipt
// ─────────────────────────────────────────────────────────────────────────────

const receipt: {
  ok: boolean;
  script: string;
  errors: string[];
  warnings: string[];
  elapsedMs: number;
  dryRun: boolean;
  summary: string;
  validationResult: any;
} = {
  ok: true,
  script: 'axion-validate-templates',
  errors: [],
  warnings: [],
  elapsedMs: 0,
  dryRun,
  summary: '',
  validationResult: null,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CheckStatus = 'PASS' | 'FAIL' | 'WARN';

interface DuplicateAnchor {
  id: string;
  files: string[];
}

interface OrphanedAnchor {
  id: string;
  file: string;
  line: number;
}

interface UnknownFile {
  file: string;
  count: number;
  lines: number[];
}

interface MissingDocDomain {
  domain: string;
  missing: string[];
}

interface TemplateValidationResult {
  status: CheckStatus;
  stage: 'validate-templates';
  checks: {
    duplicate_anchors: { status: CheckStatus; duplicates: DuplicateAnchor[] };
    orphaned_anchors: { status: CheckStatus; orphans: OrphanedAnchor[] };
    unknown_placeholders: { status: CheckStatus; total_count: number; files: UnknownFile[] };
    missing_doc_types: { status: CheckStatus; domains: MissingDocDomain[] };
  };
  summary: string;
  hint?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(): { root?: string; strict: boolean } {
  const args = process.argv.slice(2);
  let root: string | undefined;
  let strict = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && args[i + 1]) {
      root = args[++i];
    } else if (args[i] === '--strict') {
      strict = true;
    }
  }

  return { root, strict };
}

function log(status: CheckStatus | 'SKIP', message: string): void {
  const prefix: Record<string, string> = {
    PASS: '\x1b[32m[PASS]\x1b[0m',
    FAIL: '\x1b[31m[FAIL]\x1b[0m',
    WARN: '\x1b[33m[WARN]\x1b[0m',
    SKIP: '\x1b[90m[SKIP]\x1b[0m',
  };
  console.error(`${prefix[status]} ${message}`);
}

function dirExists(p: string): boolean {
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function collectFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  if (!dirExists(dir)) return results;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectFiles(fullPath, pattern));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch {
    // gracefully skip unreadable directories
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Check 1: Duplicate Anchors
// ─────────────────────────────────────────────────────────────────────────────

const ANCHOR_REGEX = /<!--\s*AXION:ANCHOR:([A-Za-z0-9_-]+)\s*-->/g;

interface AnchorEntry {
  id: string;
  file: string;
  line: number;
}

function scanAnchors(files: string[]): AnchorEntry[] {
  const anchors: AnchorEntry[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let match: RegExpExecArray | null;
        const lineRegex = new RegExp(ANCHOR_REGEX.source, 'g');
        while ((match = lineRegex.exec(lines[i])) !== null) {
          anchors.push({ id: match[1], file, line: i + 1 });
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  return anchors;
}

function checkDuplicateAnchors(anchors: AnchorEntry[]): { status: CheckStatus; duplicates: DuplicateAnchor[] } {
  const idToFiles = new Map<string, Set<string>>();

  for (const anchor of anchors) {
    if (!idToFiles.has(anchor.id)) {
      idToFiles.set(anchor.id, new Set());
    }
    idToFiles.get(anchor.id)!.add(anchor.file);
  }

  const duplicates: DuplicateAnchor[] = [];

  // Within-file duplicates
  const fileIdCounts = new Map<string, Map<string, number>>();
  for (const anchor of anchors) {
    if (!fileIdCounts.has(anchor.file)) {
      fileIdCounts.set(anchor.file, new Map());
    }
    const counts = fileIdCounts.get(anchor.file)!;
    counts.set(anchor.id, (counts.get(anchor.id) || 0) + 1);
  }

  const seenDupIds = new Set<string>();

  for (const [file, counts] of fileIdCounts) {
    for (const [id, count] of counts) {
      if (count > 1 && !seenDupIds.has(id)) {
        seenDupIds.add(id);
        duplicates.push({ id, files: [file] });
      }
    }
  }

  // Cross-file duplicates
  for (const [id, files] of idToFiles) {
    if (files.size > 1 && !seenDupIds.has(id)) {
      duplicates.push({ id, files: Array.from(files) });
    } else if (files.size > 1 && seenDupIds.has(id)) {
      const existing = duplicates.find(d => d.id === id);
      if (existing) {
        existing.files = Array.from(files);
      }
    }
  }

  return {
    status: duplicates.length > 0 ? 'FAIL' : 'PASS',
    duplicates,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Check 2: Orphaned Anchors
// ─────────────────────────────────────────────────────────────────────────────

function checkOrphanedAnchors(anchors: AnchorEntry[], scriptsDir: string): { status: CheckStatus; orphans: OrphanedAnchor[] } {
  const scriptFiles = collectFiles(scriptsDir, /\.(ts|mjs)$/);

  let allScriptContent = '';
  for (const file of scriptFiles) {
    try {
      allScriptContent += fs.readFileSync(file, 'utf-8') + '\n';
    } catch {
      // skip unreadable
    }
  }

  const uniqueIds = new Map<string, AnchorEntry>();
  for (const anchor of anchors) {
    if (!uniqueIds.has(anchor.id)) {
      uniqueIds.set(anchor.id, anchor);
    }
  }

  const orphans: OrphanedAnchor[] = [];
  for (const [id, entry] of uniqueIds) {
    if (!allScriptContent.includes(id)) {
      orphans.push({ id, file: entry.file, line: entry.line });
    }
  }

  return {
    status: orphans.length > 0 ? 'WARN' : 'PASS',
    orphans,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Check 3: UNKNOWN Placeholders
// ─────────────────────────────────────────────────────────────────────────────

function checkUnknownPlaceholders(domainsDir: string): { status: CheckStatus; total_count: number; files: UnknownFile[] } {
  const mdFiles = collectFiles(domainsDir, /\.md$/);
  const filesWithUnknown: UnknownFile[] = [];
  let totalCount = 0;

  for (const file of mdFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');
      const matchingLines: number[] = [];
      let fileCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        let idx = 0;
        while ((idx = lineText.indexOf('UNKNOWN', idx)) !== -1) {
          fileCount++;
          if (!matchingLines.includes(i + 1)) {
            matchingLines.push(i + 1);
          }
          idx += 7;
        }
      }

      if (fileCount > 0) {
        filesWithUnknown.push({ file, count: fileCount, lines: matchingLines });
        totalCount += fileCount;
      }
    } catch {
      // skip unreadable
    }
  }

  return {
    status: totalCount > 0 ? 'FAIL' : 'PASS',
    total_count: totalCount,
    files: filesWithUnknown,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Check 4: Missing Doc Types
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_DOC_PATTERNS = [
  { label: 'README.md', pattern: /^README\.md$/ },
  { label: 'DDES_*.md', pattern: /^DDES_.*\.md$/ },
  { label: 'BELS_*.md', pattern: /^BELS_.*\.md$/ },
  { label: 'DIM_*.md', pattern: /^DIM_.*\.md$/ },
  { label: 'SCREENMAP_*.md', pattern: /^SCREENMAP_.*\.md$/ },
  { label: 'TESTPLAN_*.md', pattern: /^TESTPLAN_.*\.md$/ },
];

function checkMissingDocTypes(domainsDir: string): { status: CheckStatus; domains: MissingDocDomain[] } {
  if (!dirExists(domainsDir)) {
    return { status: 'PASS', domains: [] };
  }

  const domainDirs: string[] = [];
  try {
    const entries = fs.readdirSync(domainsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        domainDirs.push(entry.name);
      }
    }
  } catch {
    return { status: 'PASS', domains: [] };
  }

  const domainsWithMissing: MissingDocDomain[] = [];

  for (const domain of domainDirs) {
    const domainPath = path.join(domainsDir, domain);
    let files: string[] = [];
    try {
      files = fs.readdirSync(domainPath);
    } catch {
      continue;
    }

    const missing: string[] = [];
    for (const { label, pattern } of REQUIRED_DOC_PATTERNS) {
      const found = files.some(f => pattern.test(f));
      if (!found) {
        missing.push(label);
      }
    }

    if (missing.length > 0) {
      domainsWithMissing.push({ domain, missing });
    }
  }

  return {
    status: domainsWithMissing.length > 0 ? 'WARN' : 'PASS',
    domains: domainsWithMissing,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main(): void {
  const { root, strict } = parseArgs();

  if (dryRun) {
    if (!jsonMode) console.log('[DRY-RUN] axion-validate-templates would run validation checks.');
    receipt.summary = 'Dry-run mode — no validation performed.';
    emitOutput();
    process.exit(0);
  }

  const workspaceRoot = root ? path.resolve(root) : undefined;

  const templatesDir = path.join(AXION_ROOT, 'templates');
  const scriptsDir = path.join(AXION_ROOT, 'scripts');
  const domainsDir = workspaceRoot
    ? path.join(workspaceRoot, 'domains')
    : path.join(AXION_ROOT, 'domains');

  const hints: string[] = [];

  const templateFiles = dirExists(templatesDir)
    ? collectFiles(templatesDir, /\.template\.md$/)
    : [];
  const domainMdFiles = dirExists(domainsDir)
    ? collectFiles(domainsDir, /\.md$/)
    : [];

  const allMdFiles = [...templateFiles, ...domainMdFiles];

  if (!dirExists(templatesDir)) {
    if (!jsonMode) log('SKIP', 'Templates directory not found — skipping anchor checks');
    hints.push('Create axion/templates/ with .template.md files');
  }

  if (!dirExists(domainsDir)) {
    if (!jsonMode) log('SKIP', 'Domains directory not found — skipping domain checks');
    hints.push('Create domains/ directory or use --root to specify workspace');
  }

  // 1. Scan anchors and check duplicates
  const anchors = scanAnchors(allMdFiles);
  const duplicateResult = checkDuplicateAnchors(anchors);

  if (!jsonMode) {
    if (duplicateResult.status === 'PASS') {
      log('PASS', 'No duplicate anchors found');
    } else {
      log('FAIL', `${duplicateResult.duplicates.length} duplicate anchor(s) detected`);
      for (const dup of duplicateResult.duplicates) {
        console.error(`       ${dup.id} in: ${dup.files.map(f => path.relative(process.cwd(), f)).join(', ')}`);
      }
    }
  }

  // 2. Check orphaned anchors
  const orphanResult = checkOrphanedAnchors(anchors, scriptsDir);

  if (!jsonMode) {
    if (orphanResult.status === 'PASS') {
      log('PASS', 'No orphaned anchors found');
    } else {
      log('WARN', `${orphanResult.orphans.length} orphaned anchors detected`);
      for (const orphan of orphanResult.orphans) {
        console.error(`       ${orphan.id} in ${path.relative(process.cwd(), orphan.file)}:${orphan.line}`);
      }
      hints.push('Add injector references in axion/scripts/ for orphaned anchors, or remove unused anchors');
    }
  }

  // 3. Check UNKNOWN placeholders
  const unknownResult = checkUnknownPlaceholders(domainsDir);

  if (!jsonMode) {
    if (unknownResult.status === 'PASS') {
      log('PASS', 'No surviving UNKNOWN placeholders');
    } else {
      log('FAIL', `${unknownResult.total_count} UNKNOWN placeholders in ${unknownResult.files.length} files`);
      for (const f of unknownResult.files) {
        console.error(`       ${path.relative(process.cwd(), f.file)}: ${f.count} occurrences (lines: ${f.lines.join(', ')})`);
      }
      hints.push('Replace all UNKNOWN placeholders with actual content in domain docs');
    }
  }

  // 4. Check missing doc types
  const missingDocsResult = checkMissingDocTypes(domainsDir);

  if (!jsonMode) {
    if (missingDocsResult.status === 'PASS') {
      log('PASS', 'All domains have required doc types');
    } else {
      const totalMissing = missingDocsResult.domains.reduce((sum, d) => sum + d.missing.length, 0);
      log('WARN', `${totalMissing} missing doc types across ${missingDocsResult.domains.length} domains`);
      for (const d of missingDocsResult.domains) {
        console.error(`       ${d.domain}: missing ${d.missing.join(', ')}`);
      }
      hints.push('Generate missing doc types using axion-generate or create them manually');
    }
  }

  // Determine overall status
  const checkStatuses = [
    duplicateResult.status,
    orphanResult.status,
    unknownResult.status,
    missingDocsResult.status,
  ];

  let overallStatus: CheckStatus = 'PASS';
  if (checkStatuses.includes('FAIL')) {
    overallStatus = 'FAIL';
  } else if (checkStatuses.includes('WARN')) {
    overallStatus = strict ? 'FAIL' : 'WARN';
  }

  // Build summary
  const parts: string[] = [];
  if (duplicateResult.duplicates.length > 0) parts.push(`${duplicateResult.duplicates.length} duplicate anchors`);
  if (orphanResult.orphans.length > 0) parts.push(`${orphanResult.orphans.length} orphaned anchors`);
  if (unknownResult.total_count > 0) parts.push(`${unknownResult.total_count} UNKNOWN placeholders`);
  if (missingDocsResult.domains.length > 0) parts.push(`${missingDocsResult.domains.length} domains with missing docs`);

  const summary = parts.length > 0
    ? `Issues found: ${parts.join('; ')}`
    : 'All template validation checks passed';

  const result: TemplateValidationResult = {
    status: overallStatus,
    stage: 'validate-templates',
    checks: {
      duplicate_anchors: duplicateResult,
      orphaned_anchors: orphanResult,
      unknown_placeholders: unknownResult,
      missing_doc_types: missingDocsResult,
    },
    summary,
  };

  if (hints.length > 0) {
    result.hint = hints;
  }

  if (!jsonMode) {
    console.error('');
    console.error(`Overall: ${overallStatus}${strict ? ' (strict mode)' : ''}`);
    console.error('');
  }

  // Populate receipt
  receipt.ok = overallStatus !== 'FAIL';
  receipt.summary = summary;
  receipt.validationResult = result;

  if (overallStatus === 'FAIL') {
    receipt.errors.push(summary);
  }
  if (checkStatuses.includes('WARN')) {
    receipt.warnings.push(...parts.filter(p => p.includes('orphaned') || p.includes('missing docs')));
  }

  if (!jsonMode) {
    console.log(JSON.stringify(result, null, 2));
  }

  emitOutput();
  process.exit(overallStatus === 'FAIL' ? 1 : 0);
}

try {
  main();
} catch (err: any) {
  receipt.ok = false;
  receipt.errors.push(err?.message || String(err));
  receipt.summary = `Fatal error: ${err?.message || String(err)}`;
  emitOutput();
  if (!jsonMode) {
    console.error(`[FATAL] ${err?.message || err}`);
  }
  process.exit(1);
}
