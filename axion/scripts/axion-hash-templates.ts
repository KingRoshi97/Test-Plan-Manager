#!/usr/bin/env node
/**
 * AXION Template Hashing System
 * 
 * Generates and verifies hashes of templates and registry docs to detect drift.
 * Fails verification if hashes change without a recorded revision bump.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-hash-templates.ts --generate
 *   npx ts-node axion/scripts/axion-hash-templates.ts --verify
 *   npx ts-node axion/scripts/axion-hash-templates.ts --diff
 *   npx ts-node axion/scripts/axion-hash-templates.ts --json
 *   npx ts-node axion/scripts/axion-hash-templates.ts --dry-run
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const startTime = Date.now();

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');

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
  revision_note?: string;
  templates: FileHash[];
  registries: FileHash[];
  total_files: number;
}

interface DriftReport {
  verified_at: string;
  status: 'pass' | 'fail';
  current_revision: number;
  changes: {
    added: string[];
    removed: string[];
    modified: string[];
  };
  message: string;
}

interface Receipt {
  script: string;
  ok: boolean;
  dryRun: boolean;
  action: string | null;
  totalFiles: number;
  templateCount: number;
  registryCount: number;
  revision: number | null;
  driftStatus: string | null;
  changes: { added: string[]; removed: string[]; modified: string[] } | null;
  errors: string[];
  elapsedMs: number;
}

const receipt: Receipt = {
  script: 'axion-hash-templates',
  ok: true,
  dryRun,
  action: null,
  totalFiles: 0,
  templateCount: 0,
  registryCount: 0,
  revision: null,
  driftStatus: null,
  changes: null,
  errors: [],
  elapsedMs: 0,
};

function emitOutput(): void {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  }
}

const AXION_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_PATH = path.join(AXION_ROOT, 'templates');
const REGISTRY_PATH = path.join(AXION_ROOT, 'registry');
const HASH_FILE = path.join(REGISTRY_PATH, 'template_hashes.json');

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
  
  if (!fs.existsSync(TEMPLATES_PATH)) {
    return templates;
  }
  
  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.endsWith('.template.md') || entry === '_INDEX.md') {
        templates.push(fullPath);
      }
    }
  }
  
  scanDir(TEMPLATES_PATH);
  return templates.sort();
}

function findRegistryDocs(): string[] {
  const registries: string[] = [];
  
  if (!fs.existsSync(REGISTRY_PATH)) {
    return registries;
  }
  
  const entries = fs.readdirSync(REGISTRY_PATH);
  for (const entry of entries) {
    const fullPath = path.join(REGISTRY_PATH, entry);
    if (entry.endsWith('.json') && entry !== 'template_hashes.json') {
      registries.push(fullPath);
    }
  }
  
  return registries.sort();
}

function generateHashes(): HashRegistry {
  const templates = findTemplates().map(getFileStats);
  const registries = findRegistryDocs().map(getFileStats);
  
  let currentRevision = 0;
  if (fs.existsSync(HASH_FILE)) {
    const existing = JSON.parse(fs.readFileSync(HASH_FILE, 'utf-8'));
    currentRevision = existing.revision || 0;
  }
  
  return {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    revision: currentRevision,
    templates,
    registries,
    total_files: templates.length + registries.length,
  };
}

function saveHashes(registry: HashRegistry): void {
  if (dryRun) {
    if (!jsonMode) console.log('[DRY-RUN] Would save hashes but skipping write.');
    return;
  }
  if (!fs.existsSync(REGISTRY_PATH)) {
    fs.mkdirSync(REGISTRY_PATH, { recursive: true });
  }
  fs.writeFileSync(HASH_FILE, JSON.stringify(registry, null, 2));
}

function loadHashes(): HashRegistry | null {
  if (!fs.existsSync(HASH_FILE)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(HASH_FILE, 'utf-8'));
}

function verifyHashes(): DriftReport {
  const stored = loadHashes();
  
  if (!stored) {
    return {
      verified_at: new Date().toISOString(),
      status: 'fail',
      current_revision: 0,
      changes: { added: [], removed: [], modified: [] },
      message: 'No hash registry found. Run with --generate first.',
    };
  }
  
  const current = generateHashes();
  const changes = {
    added: [] as string[],
    removed: [] as string[],
    modified: [] as string[],
  };
  
  const storedMap = new Map<string, FileHash>();
  for (const f of [...stored.templates, ...stored.registries]) {
    storedMap.set(f.path, f);
  }
  
  const currentMap = new Map<string, FileHash>();
  for (const f of [...current.templates, ...current.registries]) {
    currentMap.set(f.path, f);
  }
  
  for (const [filePath, file] of currentMap) {
    const storedFile = storedMap.get(filePath);
    if (!storedFile) {
      changes.added.push(filePath);
    } else if (storedFile.hash !== file.hash) {
      changes.modified.push(filePath);
    }
  }
  
  for (const [filePath] of storedMap) {
    if (!currentMap.has(filePath)) {
      changes.removed.push(filePath);
    }
  }
  
  const hasChanges = changes.added.length > 0 || changes.removed.length > 0 || changes.modified.length > 0;
  
  return {
    verified_at: new Date().toISOString(),
    status: hasChanges ? 'fail' : 'pass',
    current_revision: stored.revision,
    changes,
    message: hasChanges
      ? `Drift detected! ${changes.modified.length} modified, ${changes.added.length} added, ${changes.removed.length} removed. Bump revision with --generate --bump to acknowledge.`
      : `All ${stored.total_files} files match stored hashes (revision ${stored.revision}).`,
  };
}

function printReport(report: DriftReport): void {
  if (jsonMode) return;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`AXION TEMPLATE DRIFT VERIFICATION`);
  console.log(`${'═'.repeat(60)}\n`);
  
  const statusLabel = report.status === 'pass' ? '[PASS]' : '[FAIL]';
  console.log(`${statusLabel} Status: ${report.status.toUpperCase()}`);
  console.log(`Revision: ${report.current_revision}`);
  console.log(`Verified at: ${report.verified_at}\n`);
  
  if (report.status === 'fail') {
    if (report.changes.modified.length > 0) {
      console.log(`[MODIFIED] (${report.changes.modified.length}):`);
      for (const f of report.changes.modified) {
        console.log(`   ${f}`);
      }
      console.log('');
    }
    
    if (report.changes.added.length > 0) {
      console.log(`[ADDED] (${report.changes.added.length}):`);
      for (const f of report.changes.added) {
        console.log(`   ${f}`);
      }
      console.log('');
    }
    
    if (report.changes.removed.length > 0) {
      console.log(`[REMOVED] (${report.changes.removed.length}):`);
      for (const f of report.changes.removed) {
        console.log(`   ${f}`);
      }
      console.log('');
    }
  }
  
  console.log(`${'─'.repeat(60)}`);
  console.log(report.message);
  console.log('');
}

function printDiff(): void {
  const stored = loadHashes();
  const current = generateHashes();
  
  if (!stored) {
    if (!jsonMode) console.log('No stored hashes to diff against. Run --generate first.');
    return;
  }
  
  if (!jsonMode) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`AXION TEMPLATE DIFF (revision ${stored.revision})`);
    console.log(`${'═'.repeat(60)}\n`);
  }
  
  const storedMap = new Map<string, FileHash>();
  for (const f of [...stored.templates, ...stored.registries]) {
    storedMap.set(f.path, f);
  }
  
  for (const f of [...current.templates, ...current.registries]) {
    const storedFile = storedMap.get(f.path);
    if (!storedFile) {
      if (!jsonMode) console.log(`+ ${f.path} (new)`);
    } else if (storedFile.hash !== f.hash) {
      if (!jsonMode) {
        console.log(`~ ${f.path}`);
        console.log(`    old: ${storedFile.hash} (${storedFile.size} bytes)`);
        console.log(`    new: ${f.hash} (${f.size} bytes)`);
      }
    }
  }
  
  for (const [filePath] of storedMap) {
    const exists = [...current.templates, ...current.registries].some(f => f.path === filePath);
    if (!exists) {
      if (!jsonMode) console.log(`- ${filePath} (removed)`);
    }
  }
  
  if (!jsonMode) console.log('');
}

function main() {
  const args = process.argv.slice(2);
  const generate = args.includes('--generate');
  const verify = args.includes('--verify');
  const diff = args.includes('--diff');
  const bump = args.includes('--bump');
  const noteArg = args.indexOf('--note');
  const note = noteArg !== -1 ? args[noteArg + 1] : undefined;
  
  if (!generate && !verify && !diff && !jsonMode && !dryRun) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-hash-templates.ts --generate');
    console.log('  npx ts-node axion/scripts/axion-hash-templates.ts --generate --bump --note "description"');
    console.log('  npx ts-node axion/scripts/axion-hash-templates.ts --verify');
    console.log('  npx ts-node axion/scripts/axion-hash-templates.ts --diff');
    console.log('  npx ts-node axion/scripts/axion-hash-templates.ts --json');
    console.log('  npx ts-node axion/scripts/axion-hash-templates.ts --dry-run');
    process.exit(1);
  }
  
  if (generate) {
    receipt.action = 'generate';
    const registry = generateHashes();
    
    if (bump) {
      registry.revision += 1;
      registry.revision_note = note || `Revision bump at ${new Date().toISOString()}`;
    }
    
    saveHashes(registry);

    receipt.totalFiles = registry.total_files;
    receipt.templateCount = registry.templates.length;
    receipt.registryCount = registry.registries.length;
    receipt.revision = registry.revision;

    if (!jsonMode) {
      console.log(`\n[DONE] Generated hashes for ${registry.total_files} files`);
      console.log(`   Templates: ${registry.templates.length}`);
      console.log(`   Registries: ${registry.registries.length}`);
      console.log(`   Revision: ${registry.revision}`);
      if (registry.revision_note) {
        console.log(`   Note: ${registry.revision_note}`);
      }
      console.log(`   Saved to: ${path.relative(process.cwd(), HASH_FILE)}\n`);
    }
  }
  
  if (verify) {
    receipt.action = receipt.action ? `${receipt.action}+verify` : 'verify';
    const report = verifyHashes();
    receipt.driftStatus = report.status;
    receipt.revision = report.current_revision;
    receipt.changes = report.changes;
    receipt.totalFiles = report.changes.added.length + report.changes.removed.length + report.changes.modified.length;
    if (report.status === 'fail') {
      receipt.ok = false;
    }
    printReport(report);
    emitOutput();
    process.exit(report.status === 'pass' ? 0 : 1);
  }
  
  if (diff) {
    receipt.action = receipt.action ? `${receipt.action}+diff` : 'diff';
    printDiff();
  }

  if (!generate && !verify && !diff) {
    receipt.action = 'status';
    const registry = generateHashes();
    receipt.totalFiles = registry.total_files;
    receipt.templateCount = registry.templates.length;
    receipt.registryCount = registry.registries.length;
    receipt.revision = registry.revision;
  }

  emitOutput();
}

try {
  main();
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  receipt.errors.push(message);
  receipt.ok = false;
  emitOutput();
  process.exit(1);
}
