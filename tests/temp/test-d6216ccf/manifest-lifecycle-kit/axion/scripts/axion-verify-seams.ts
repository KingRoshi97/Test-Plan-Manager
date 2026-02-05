#!/usr/bin/env node
/**
 * AXION Seam Verification Script
 * 
 * Checks that non-owner modules link to seam owners rather than redefining content.
 * Uses seams.json registry to enforce single ownership of cross-cutting topics.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-verify-seams.ts --module <name>
 *   npx ts-node axion/scripts/axion-verify-seams.ts --all
 *   npx ts-node axion/scripts/axion-verify-seams.ts --all --fix
 */

import * as fs from 'fs';
import * as path from 'path';

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

interface Violation {
  module: string;
  seam: string;
  reason_code: string;
  description: string;
  file: string;
  line?: number;
  fix_action: string;
}

const AXION_ROOT = path.resolve(__dirname, '..');
const REGISTRY_PATH = path.join(AXION_ROOT, 'registry', 'seams.json');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');

// Keywords that indicate a module is defining rather than linking
const DEFINITION_PATTERNS: Record<string, RegExp[]> = {
  error_model: [
    /error\s*codes?:\s*\[/i,
    /error\s*taxonomy/i,
    /error\s*response\s*shape/i,
    /HTTP\s*\d{3}\s*:/,
  ],
  schema_truth: [
    /entity\s*schema/i,
    /field\s*definitions?:/i,
    /data\s*model:/i,
    /table\s*structure/i,
  ],
  identity: [
    /authentication\s*flow/i,
    /session\s*management/i,
    /user\s*identity\s*model/i,
    /authorization\s*rules?:/i,
  ],
  webhooks: [
    /webhook\s*payload/i,
    /event\s*schema/i,
    /delivery\s*guarantee/i,
    /retry\s*policy/i,
  ],
  correlation_ids: [
    /correlation\s*id\s*format/i,
    /trace\s*id\s*propagation/i,
    /distributed\s*tracing\s*standard/i,
  ],
  api_versioning: [
    /version\s*strategy/i,
    /deprecation\s*policy/i,
    /breaking\s*change\s*rules?/i,
  ],
  feature_flags: [
    /feature\s*flag\s*definitions?/i,
    /rollout\s*rules?/i,
    /targeting\s*logic/i,
  ],
};

// Link patterns that indicate proper referencing
const LINK_PATTERNS = [
  /see\s+\[.*?\]\(.*?\/README\.md\)/i,
  /refer\s+to\s+\[.*?\]/i,
  /defined\s+in\s+\[.*?\]/i,
  /→\s*\[.*?\]/,
  /link:\s*\[.*?\]/i,
];

function loadSeamRegistry(): SeamRegistry {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`ERROR: Seam registry not found at ${REGISTRY_PATH}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
}

function getModuleDocs(moduleName: string): string[] {
  const modulePath = path.join(DOMAINS_PATH, moduleName);
  if (!fs.existsSync(modulePath)) {
    return [];
  }
  
  const docs: string[] = [];
  const files = fs.readdirSync(modulePath);
  for (const file of files) {
    if (file.endsWith('.md')) {
      docs.push(path.join(modulePath, file));
    }
  }
  return docs;
}

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
  // Check if content links to the owner's canonical doc
  const ownerRef = new RegExp(seam.owner, 'i');
  const hasOwnerRef = ownerRef.test(content);
  
  // Check for link patterns
  const hasLinkPattern = LINK_PATTERNS.some(pattern => pattern.test(content));
  
  return hasOwnerRef && hasLinkPattern;
}

function verifyModule(moduleName: string, registry: SeamRegistry): Violation[] {
  const violations: Violation[] = [];
  const docs = getModuleDocs(moduleName);
  
  for (const [seamName, seam] of Object.entries(registry.seams)) {
    // Skip if this module is the owner
    if (seam.owner === moduleName) {
      continue;
    }
    
    // Skip if this module is not related to the seam
    if (!seam.related_modules.includes(moduleName)) {
      continue;
    }
    
    // Check each doc in this module
    for (const docPath of docs) {
      const content = fs.readFileSync(docPath, 'utf-8');
      const defCheck = checkForDefinitions(content, seamName);
      
      if (defCheck.found) {
        // Found a definition - check if it also has a proper link
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
      }
    }
  }
  
  return violations;
}

function getAllModules(): string[] {
  if (!fs.existsSync(DOMAINS_PATH)) {
    return [];
  }
  return fs.readdirSync(DOMAINS_PATH).filter(f => {
    const stat = fs.statSync(path.join(DOMAINS_PATH, f));
    return stat.isDirectory();
  });
}

function printViolations(violations: Violation[]): void {
  if (violations.length === 0) {
    console.log('\n[PASS] No seam ownership violations found.\n');
    return;
  }
  
  console.log(`\n[FAIL] Found ${violations.length} seam ownership violation(s):\n`);
  
  for (const v of violations) {
    console.log(`─────────────────────────────────────`);
    console.log(`Module:      ${v.module}`);
    console.log(`Seam:        ${v.seam}`);
    console.log(`Reason:      ${v.reason_code}`);
    console.log(`Description: ${v.description}`);
    console.log(`File:        ${v.file}${v.line ? `:${v.line}` : ''}`);
    console.log(`Fix Action:  ${v.fix_action}`);
  }
  console.log(`─────────────────────────────────────\n`);
}

function generateRepairPlan(violations: Violation[]): void {
  if (violations.length === 0) return;
  
  const planPath = path.join(AXION_ROOT, 'registry', 'seam_repair_plan.json');
  const plan = {
    generated_at: new Date().toISOString(),
    total_violations: violations.length,
    violations: violations,
    commands: violations.map(v => ({
      module: v.module,
      action: `Edit ${v.file} - ${v.fix_action}`,
    })),
  };
  
  fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
  console.log(`[INFO] Repair plan written to: ${path.relative(process.cwd(), planPath)}\n`);
}

// Topic mention patterns - lighter touch than definition patterns
// These detect when a module references a seam topic (not necessarily defining it)
const MENTION_PATTERNS: Record<string, RegExp[]> = {
  error_model: [
    /error\s*handling/i,
    /error\s*response/i,
    /error\s*codes?/i,
    /failure\s*modes?/i,
  ],
  schema_truth: [
    /data\s*model/i,
    /entity\s*schema/i,
    /database\s*schema/i,
    /field\s*types?/i,
  ],
  identity: [
    /authentication/i,
    /authorization/i,
    /user\s*identity/i,
    /session\s*management/i,
    /access\s*control/i,
  ],
  webhooks: [
    /webhook/i,
    /event\s*payload/i,
    /event\s*delivery/i,
    /callback\s*url/i,
  ],
  correlation_ids: [
    /correlation\s*id/i,
    /trace\s*id/i,
    /request\s*id/i,
    /distributed\s*tracing/i,
  ],
  api_versioning: [
    /api\s*version/i,
    /versioning\s*strategy/i,
    /deprecation/i,
    /breaking\s*change/i,
  ],
  feature_flags: [
    /feature\s*flag/i,
    /feature\s*toggle/i,
    /rollout/i,
    /targeting/i,
  ],
};

function checkForMissingLink(content: string, seamName: string, seam: Seam): boolean {
  // Check if content mentions seam topic but doesn't link to owner
  const mentionPatterns = MENTION_PATTERNS[seamName] || [];
  const mentionsTopic = mentionPatterns.some(pattern => pattern.test(content));
  
  if (!mentionsTopic) {
    return false; // Doesn't mention the topic, no link needed
  }
  
  return !hasProperLink(content, seam);
}

function checkForDuplicateDefinition(content: string, seamName: string, ownerContent: string | null): { found: boolean; line?: number } {
  if (!ownerContent) {
    return { found: false };
  }
  
  const patterns = DEFINITION_PATTERNS[seamName] || [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of patterns) {
      if (pattern.test(lines[i])) {
        // Check if similar definition exists in owner
        if (pattern.test(ownerContent)) {
          return { found: true, line: i + 1 };
        }
      }
    }
  }
  return { found: false };
}

function loadOwnerContent(seam: Seam): string | null {
  const ownerPath = path.join(DOMAINS_PATH, seam.owner, 'README.md');
  if (!fs.existsSync(ownerPath)) {
    return null;
  }
  return fs.readFileSync(ownerPath, 'utf-8');
}

function verifyModuleEnhanced(moduleName: string, registry: SeamRegistry): Violation[] {
  const violations: Violation[] = [];
  const docs = getModuleDocs(moduleName);
  
  for (const [seamName, seam] of Object.entries(registry.seams)) {
    // Skip if this module is the owner
    if (seam.owner === moduleName) {
      continue;
    }
    
    // Skip if this module is not related to the seam
    if (!seam.related_modules.includes(moduleName)) {
      continue;
    }
    
    const ownerContent = loadOwnerContent(seam);
    
    // Check each doc in this module
    for (const docPath of docs) {
      const content = fs.readFileSync(docPath, 'utf-8');
      const defCheck = checkForDefinitions(content, seamName);
      
      if (defCheck.found) {
        // Check if it also has a proper link
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
        
        // Check for duplicate definitions
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
      } else {
        // Check if content mentions seam topic but lacks proper link
        if (checkForMissingLink(content, seamName, seam)) {
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

// Main execution
function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  const generatePlan = args.includes('--fix');
  
  console.log('\n[AXION] Seam Ownership Verification\n');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-verify-seams.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-verify-seams.ts --all');
    console.log('  npx ts-node axion/scripts/axion-verify-seams.ts --all --fix');
    process.exit(1);
  }
  
  const registry = loadSeamRegistry();
  console.log(`Loaded seam registry v${registry.version}`);
  console.log(`Registered seams: ${Object.keys(registry.seams).join(', ')}\n`);
  
  const modulesToCheck = runAll ? getAllModules() : [targetModule!];
  console.log(`Checking modules: ${modulesToCheck.join(', ')}\n`);
  
  const allViolations: Violation[] = [];
  
  for (const mod of modulesToCheck) {
    const violations = verifyModuleEnhanced(mod, registry);
    allViolations.push(...violations);
  }
  
  printViolations(allViolations);
  
  if (generatePlan && allViolations.length > 0) {
    generateRepairPlan(allViolations);
  }
  
  process.exit(allViolations.length > 0 ? 1 : 0);
}

main();
