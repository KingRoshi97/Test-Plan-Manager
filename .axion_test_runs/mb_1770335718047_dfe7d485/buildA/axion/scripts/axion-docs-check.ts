#!/usr/bin/env npx tsx
/**
 * axion-docs-check.ts
 * 
 * Lightweight documentation validator that enforces:
 * - All web-invoked scripts in Script Inventory exist
 * - No orphan scripts (exist but not mapped)
 * - WEBAPP_FEATURE_MAPPING stays capability-focused (no test milestone noise)
 * - Required docs exist
 * 
 * Usage:
 *   npx tsx axion/scripts/axion-docs-check.ts [--strict]
 * 
 * Outputs final JSON to stdout with:
 *   status: PASS | FAIL | WARN
 *   issues: { missing_scripts, orphan_scripts, contamination, missing_docs }
 *   suggestions: string[]
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const AXION_ROOT = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(AXION_ROOT, '..');

const WEBAPP_MAPPING_PATH = path.join(PROJECT_ROOT, 'docs/product/WEBAPP_FEATURE_MAPPING.md');
const SCRIPTS_DIR = path.join(AXION_ROOT, 'scripts');
const DOCS_DIR = path.join(AXION_ROOT, 'docs');

// Scripts that are internal-only and don't need to be in the mapping
const INTERNAL_SCRIPTS_ALLOWLIST = [
  'axion-docs-check' // This script itself
];

// Banned tokens in WEBAPP_FEATURE_MAPPING (indicates contamination with dev milestones)
// These are dev-speak phrases that shouldn't appear in capability-focused mapping
const BANNED_TOKENS = [
  'tests pass',
  'tests passing',
  'test suite',
  'test fixtures',
  'schema regression',
  'unit test',
  'integration test',
  'test coverage',
  'passing tests',
  'failing tests',
  'core contract',
  'doctor extension tests',
  'vitest',
  'jest'
];

// Required documentation files
const REQUIRED_DOCS = [
  { path: 'docs/product/WEBAPP_FEATURE_MAPPING.md', name: 'Web App Feature Mapping' },
  { path: 'axion/docs/SYSTEM_UPGRADE_LOG.md', name: 'System Upgrade Log' },
  { path: 'axion/docs/INDEX.md', name: 'Documentation Index' }
];

// ============================================================================
// Types
// ============================================================================

interface ScriptEntry {
  name: string;
  webInvoked: boolean;
  category: string;
  usage: string;
}

interface DocsCheckResult {
  status: 'PASS' | 'FAIL' | 'WARN';
  issues: {
    missing_scripts: string[];
    orphan_scripts: string[];
    contamination: { token: string; line: number; context: string }[];
    missing_docs: string[];
  };
  summary: {
    scripts_mapped: number;
    scripts_exist: number;
    web_invoked: number;
    internal_only: number;
  };
  suggestions: string[];
}

// ============================================================================
// Helpers
// ============================================================================

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function listScriptFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir)
      .filter(f => f.startsWith('axion-') && f.endsWith('.ts'))
      .map(f => f.replace('.ts', ''));
  } catch {
    return [];
  }
}

/**
 * Parse the Script Inventory table from WEBAPP_FEATURE_MAPPING.md
 * 
 * Expected format:
 * | Script | Web Invoked | Category | Web App Usage |
 * |--------|-------------|----------|---------------|
 * | `axion-kit-create` | Yes | Build | New Build Wizard creates kits |
 */
function parseScriptInventory(content: string): ScriptEntry[] {
  const entries: ScriptEntry[] = [];
  
  // Find the Script Inventory section
  const sectionMatch = content.match(/# \d+\) Script Inventory.*?\n([\s\S]*?)(?=\n# \d+\)|$)/);
  if (!sectionMatch) {
    return entries;
  }
  
  const section = sectionMatch[1];
  
  // Parse table rows (skip header and separator)
  const lines = section.split('\n');
  let inTable = false;
  
  for (const line of lines) {
    if (line.startsWith('| Script |')) {
      inTable = true;
      continue;
    }
    if (line.startsWith('|---')) {
      continue;
    }
    if (inTable && line.startsWith('|')) {
      // Parse table row: | `axion-foo` | Yes | Category | Usage |
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 4) {
        const scriptName = cells[0].replace(/`/g, '').trim();
        const webInvoked = cells[1].toLowerCase() === 'yes';
        const category = cells[2];
        const usage = cells[3];
        
        if (scriptName.startsWith('axion-')) {
          entries.push({ name: scriptName, webInvoked, category, usage });
        }
      }
    }
    // Stop if we hit Summary or next section
    if (line.startsWith('**Summary:**') || (line.startsWith('#') && !line.includes('Script Inventory'))) {
      break;
    }
  }
  
  return entries;
}

/**
 * Scan for banned tokens in the web mapping
 */
function scanForContamination(content: string): { token: string; line: number; context: string }[] {
  const issues: { token: string; line: number; context: string }[] = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    for (const token of BANNED_TOKENS) {
      if (line.includes(token.toLowerCase())) {
        issues.push({
          token,
          line: i + 1,
          context: lines[i].substring(0, 100)
        });
      }
    }
  }
  
  return issues;
}

// ============================================================================
// Main Check
// ============================================================================

function runDocsCheck(strict: boolean): DocsCheckResult {
  const result: DocsCheckResult = {
    status: 'PASS',
    issues: {
      missing_scripts: [],
      orphan_scripts: [],
      contamination: [],
      missing_docs: []
    },
    summary: {
      scripts_mapped: 0,
      scripts_exist: 0,
      web_invoked: 0,
      internal_only: 0
    },
    suggestions: []
  };
  
  // Check required docs exist
  for (const doc of REQUIRED_DOCS) {
    const fullPath = path.join(PROJECT_ROOT, doc.path);
    if (!fileExists(fullPath)) {
      result.issues.missing_docs.push(doc.name);
      result.suggestions.push(`Create ${doc.path}`);
    }
  }
  
  // Read web mapping
  const mappingContent = readFile(WEBAPP_MAPPING_PATH);
  if (!mappingContent) {
    result.status = 'FAIL';
    result.issues.missing_docs.push('WEBAPP_FEATURE_MAPPING.md');
    result.suggestions.push('Create docs/product/WEBAPP_FEATURE_MAPPING.md');
    return result;
  }
  
  // Parse script inventory
  const inventory = parseScriptInventory(mappingContent);
  result.summary.scripts_mapped = inventory.length;
  result.summary.web_invoked = inventory.filter(s => s.webInvoked).length;
  result.summary.internal_only = inventory.filter(s => !s.webInvoked).length;
  
  // List actual scripts
  const actualScripts = listScriptFiles(SCRIPTS_DIR);
  result.summary.scripts_exist = actualScripts.length;
  
  // Check for missing scripts (in inventory but don't exist)
  for (const entry of inventory) {
    if (!actualScripts.includes(entry.name)) {
      result.issues.missing_scripts.push(entry.name);
      result.suggestions.push(`Script ${entry.name} is in inventory but doesn't exist`);
    }
  }
  
  // Check for orphan scripts (exist but not in inventory)
  const mappedNames = new Set(inventory.map(e => e.name));
  for (const script of actualScripts) {
    if (!mappedNames.has(script) && !INTERNAL_SCRIPTS_ALLOWLIST.includes(script)) {
      result.issues.orphan_scripts.push(script);
      result.suggestions.push(`Add ${script} to Script Inventory in WEBAPP_FEATURE_MAPPING.md`);
    }
  }
  
  // Check for contamination
  result.issues.contamination = scanForContamination(mappingContent);
  if (result.issues.contamination.length > 0) {
    for (const issue of result.issues.contamination) {
      result.suggestions.push(`Remove "${issue.token}" from line ${issue.line} (dev milestone language)`);
    }
  }
  
  // Determine final status
  const hasMissing = result.issues.missing_scripts.length > 0;
  const hasOrphans = result.issues.orphan_scripts.length > 0;
  const hasContamination = result.issues.contamination.length > 0;
  const hasMissingDocs = result.issues.missing_docs.length > 0;
  
  if (hasMissing || hasMissingDocs) {
    result.status = 'FAIL';
  } else if (hasOrphans || (hasContamination && strict)) {
    result.status = strict ? 'FAIL' : 'WARN';
  } else if (hasContamination) {
    result.status = 'WARN';
  }
  
  return result;
}

// ============================================================================
// CLI
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const jsonOnly = args.includes('--json');
  
  const result = runDocsCheck(strict);
  
  // Console output (unless --json)
  if (!jsonOnly) {
    const statusColors: Record<string, string> = {
      PASS: '\x1b[32m',
      WARN: '\x1b[33m',
      FAIL: '\x1b[31m'
    };
    const reset = '\x1b[0m';
    
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════════╗');
    console.error('║                     AXION DOCS CHECK                           ║');
    console.error('╚════════════════════════════════════════════════════════════════╝');
    console.error('');
    
    console.error(`Status: ${statusColors[result.status]}${result.status}${reset}`);
    console.error('');
    console.error('Summary:');
    console.error(`  Scripts mapped: ${result.summary.scripts_mapped}`);
    console.error(`  Scripts exist:  ${result.summary.scripts_exist}`);
    console.error(`  Web-invoked:    ${result.summary.web_invoked}`);
    console.error(`  Internal-only:  ${result.summary.internal_only}`);
    console.error('');
    
    if (result.issues.missing_scripts.length > 0) {
      console.error(`\x1b[31m[FAIL]\x1b[0m Missing scripts: ${result.issues.missing_scripts.join(', ')}`);
    }
    if (result.issues.orphan_scripts.length > 0) {
      console.error(`\x1b[33m[WARN]\x1b[0m Orphan scripts: ${result.issues.orphan_scripts.join(', ')}`);
    }
    if (result.issues.contamination.length > 0) {
      console.error(`\x1b[33m[WARN]\x1b[0m Contamination found:`);
      for (const c of result.issues.contamination) {
        console.error(`       Line ${c.line}: "${c.token}"`);
      }
    }
    if (result.issues.missing_docs.length > 0) {
      console.error(`\x1b[31m[FAIL]\x1b[0m Missing docs: ${result.issues.missing_docs.join(', ')}`);
    }
    
    if (result.suggestions.length > 0) {
      console.error('');
      console.error('Suggestions:');
      for (const s of result.suggestions) {
        console.error(`  → ${s}`);
      }
    }
    
    console.error('');
  }
  
  // Final JSON to stdout
  console.log(JSON.stringify(result, null, 2));
  
  // Exit code
  process.exit(result.status === 'FAIL' ? 1 : 0);
}

main();
