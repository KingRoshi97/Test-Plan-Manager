#!/usr/bin/env node
/**
 * AXION Repair Mode Script
 * 
 * When verify fails, outputs an actionable repair plan with exact fixes.
 * Converts verification failures into executable fix lists.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-repair.ts --module <name>
 *   npx ts-node axion/scripts/axion-repair.ts --all
 *   npx ts-node axion/scripts/axion-repair.ts --module <name> --save
 */

import * as fs from 'fs';
import * as path from 'path';

interface RepairIssue {
  reason_code: string;
  severity: 'critical' | 'warning' | 'info';
  module: string;
  file: string;
  section?: string;
  line?: number;
  description: string;
  fix_action: string;
  fix_command?: string;
}

interface RepairPlan {
  generated_at: string;
  module: string;
  total_issues: number;
  critical_count: number;
  warning_count: number;
  info_count: number;
  issues: RepairIssue[];
  next_commands: string[];
}

const AXION_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_PATH = path.join(AXION_ROOT, 'templates');
const DOMAINS_PATH = path.join(AXION_ROOT, 'domains');

// Reason codes and their severities
const REASON_CODES: Record<string, { severity: 'critical' | 'warning' | 'info'; description: string }> = {
  MISSING_SECTION: { severity: 'critical', description: 'Required section is missing from document' },
  EMPTY_SECTION: { severity: 'critical', description: 'Section exists but has no content' },
  TBD_IN_REQUIRED: { severity: 'critical', description: '[TBD] placeholder in required section' },
  UNKNOWN_WITHOUT_QUESTION: { severity: 'warning', description: 'UNKNOWN used without Open Questions entry' },
  DUPLICATE_DEFINITION: { severity: 'warning', description: 'Definition duplicated from owner module' },
  MISSING_OWNER: { severity: 'warning', description: 'Section lacks ownership attribution' },
  ORPHAN_CONTRACT: { severity: 'warning', description: 'Contract references non-existent entity' },
  CONFLICTING_DEFINITION: { severity: 'critical', description: 'Definition conflicts with another module' },
  SEAM_OWNER_VIOLATION: { severity: 'warning', description: 'Non-owner module defines seam content' },
  MISSING_ACCEPTANCE: { severity: 'info', description: 'Missing acceptance criteria' },
  INCOMPLETE_CHECKLIST: { severity: 'info', description: 'Acceptance checklist has unchecked items' },
};

function loadTemplate(moduleName: string): string | null {
  const templatePath = path.join(TEMPLATES_PATH, moduleName, 'README.template.md');
  if (!fs.existsSync(templatePath)) {
    return null;
  }
  return fs.readFileSync(templatePath, 'utf-8');
}

function loadDomainDoc(moduleName: string): string | null {
  const docPath = path.join(DOMAINS_PATH, moduleName, 'README.md');
  if (!fs.existsSync(docPath)) {
    return null;
  }
  return fs.readFileSync(docPath, 'utf-8');
}

function extractSections(content: string): Map<string, { start: number; end: number; content: string }> {
  const sections = new Map();
  const lines = content.split('\n');
  const sectionRegex = /<!--\s*AXION:SECTION:(\w+)\s*-->/;
  
  let currentSection: string | null = null;
  let currentStart = 0;
  let currentLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(sectionRegex);
    if (match) {
      // Save previous section
      if (currentSection) {
        sections.set(currentSection, {
          start: currentStart,
          end: i - 1,
          content: currentLines.join('\n').trim(),
        });
      }
      currentSection = match[1];
      currentStart = i;
      currentLines = [];
    } else if (currentSection) {
      currentLines.push(lines[i]);
    }
  }
  
  // Save last section
  if (currentSection) {
    sections.set(currentSection, {
      start: currentStart,
      end: lines.length - 1,
      content: currentLines.join('\n').trim(),
    });
  }
  
  return sections;
}

function checkForTBD(content: string): { found: boolean; lines: number[] } {
  const lines = content.split('\n');
  const tbdLines: number[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (/\[TBD\]/.test(lines[i])) {
      tbdLines.push(i + 1);
    }
  }
  
  return { found: tbdLines.length > 0, lines: tbdLines };
}

function checkForUnknownWithoutQuestion(content: string): { found: boolean; lines: number[] } {
  const hasOpenQuestions = /##\s*Open\s*Questions/i.test(content);
  const lines = content.split('\n');
  const unknownLines: number[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (/\bUNKNOWN\b/.test(lines[i]) && !hasOpenQuestions) {
      unknownLines.push(i + 1);
    }
  }
  
  return { found: unknownLines.length > 0, lines: unknownLines };
}

function repairModule(moduleName: string): RepairPlan {
  const issues: RepairIssue[] = [];
  const template = loadTemplate(moduleName);
  const doc = loadDomainDoc(moduleName);
  const docPath = `domains/${moduleName}/README.md`;
  
  // Check if domain doc exists
  if (!doc) {
    issues.push({
      reason_code: 'MISSING_SECTION',
      severity: 'critical',
      module: moduleName,
      file: docPath,
      description: `Domain document does not exist for module "${moduleName}"`,
      fix_action: `Create ${docPath} from template`,
      fix_command: `cp axion/templates/${moduleName}/README.template.md axion/domains/${moduleName}/README.md`,
    });
    
    return createPlan(moduleName, issues);
  }
  
  // Extract sections from template and doc
  const templateSections = template ? extractSections(template) : new Map();
  const docSections = extractSections(doc);
  
  // Check for missing required sections
  for (const [sectionKey] of templateSections) {
    if (!docSections.has(sectionKey)) {
      issues.push({
        reason_code: 'MISSING_SECTION',
        severity: 'critical',
        module: moduleName,
        file: docPath,
        section: sectionKey,
        description: `Required section ${sectionKey} is missing`,
        fix_action: `Add section <!-- AXION:SECTION:${sectionKey} --> with content from template`,
      });
    }
  }
  
  // Check each section for issues
  for (const [sectionKey, sectionData] of docSections) {
    // Check for empty sections
    const contentWithoutHeading = sectionData.content.replace(/^##.*$/m, '').trim();
    if (contentWithoutHeading.length < 10) {
      issues.push({
        reason_code: 'EMPTY_SECTION',
        severity: 'critical',
        module: moduleName,
        file: docPath,
        section: sectionKey,
        line: sectionData.start + 1,
        description: `Section ${sectionKey} is empty or nearly empty`,
        fix_action: `Populate section ${sectionKey} with concrete content`,
      });
    }
    
    // Check for [TBD] in sections
    const tbdCheck = checkForTBD(sectionData.content);
    if (tbdCheck.found) {
      issues.push({
        reason_code: 'TBD_IN_REQUIRED',
        severity: 'critical',
        module: moduleName,
        file: docPath,
        section: sectionKey,
        line: sectionData.start + tbdCheck.lines[0],
        description: `[TBD] placeholder found in section ${sectionKey}`,
        fix_action: `Replace [TBD] with concrete content or use "N/A — <reason>" if not applicable`,
      });
    }
  }
  
  // Check for UNKNOWN without Open Questions
  const unknownCheck = checkForUnknownWithoutQuestion(doc);
  if (unknownCheck.found) {
    issues.push({
      reason_code: 'UNKNOWN_WITHOUT_QUESTION',
      severity: 'warning',
      module: moduleName,
      file: docPath,
      line: unknownCheck.lines[0],
      description: `UNKNOWN used but no Open Questions section found`,
      fix_action: `Add Open Questions section and list the UNKNOWN items`,
    });
  }
  
  // Check for acceptance criteria
  if (!/_ACCEPTANCE/.test(doc)) {
    issues.push({
      reason_code: 'MISSING_ACCEPTANCE',
      severity: 'info',
      module: moduleName,
      file: docPath,
      description: `Missing acceptance criteria section`,
      fix_action: `Add acceptance criteria section with checkboxes`,
    });
  }
  
  // Check for incomplete checklists
  const uncheckedItems = (doc.match(/- \[ \]/g) || []).length;
  if (uncheckedItems > 0) {
    issues.push({
      reason_code: 'INCOMPLETE_CHECKLIST',
      severity: 'info',
      module: moduleName,
      file: docPath,
      description: `${uncheckedItems} unchecked items in acceptance criteria`,
      fix_action: `Complete the checklist items or mark as N/A`,
    });
  }
  
  return createPlan(moduleName, issues);
}

function createPlan(moduleName: string, issues: RepairIssue[]): RepairPlan {
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;
  
  // Generate next commands based on issues
  const nextCommands: string[] = [];
  
  if (criticalCount > 0) {
    nextCommands.push(`# Fix critical issues first:`);
    for (const issue of issues.filter(i => i.severity === 'critical')) {
      if (issue.fix_command) {
        nextCommands.push(issue.fix_command);
      } else {
        nextCommands.push(`# Edit ${issue.file}: ${issue.fix_action}`);
      }
    }
    nextCommands.push(`# Then re-run verification:`);
    nextCommands.push(`npx ts-node axion/scripts/axion-repair.ts --module ${moduleName}`);
  } else if (warningCount > 0) {
    nextCommands.push(`# Address warnings:`);
    for (const issue of issues.filter(i => i.severity === 'warning')) {
      nextCommands.push(`# Edit ${issue.file}: ${issue.fix_action}`);
    }
  } else if (infoCount > 0) {
    nextCommands.push(`# Optional improvements:`);
    for (const issue of issues.filter(i => i.severity === 'info')) {
      nextCommands.push(`# ${issue.fix_action}`);
    }
  } else {
    nextCommands.push(`# Module "${moduleName}" is ready for verify stage`);
    nextCommands.push(`npx ts-node axion/scripts/axion-verify.ts --module ${moduleName}`);
  }
  
  return {
    generated_at: new Date().toISOString(),
    module: moduleName,
    total_issues: issues.length,
    critical_count: criticalCount,
    warning_count: warningCount,
    info_count: infoCount,
    issues,
    next_commands: nextCommands,
  };
}

function printPlan(plan: RepairPlan): void {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`AXION REPAIR PLAN: ${plan.module}`);
  console.log(`Generated: ${plan.generated_at}`);
  console.log(`${'═'.repeat(60)}\n`);
  
  if (plan.total_issues === 0) {
    console.log(`[PASS] No issues found. Module "${plan.module}" is ready.\n`);
    return;
  }
  
  // Summary
  console.log(`SUMMARY:`);
  console.log(`  Total issues: ${plan.total_issues}`);
  if (plan.critical_count > 0) console.log(`  [CRITICAL] ${plan.critical_count}`);
  if (plan.warning_count > 0) console.log(`  [WARNING] ${plan.warning_count}`);
  if (plan.info_count > 0) console.log(`  [INFO] ${plan.info_count}`);
  console.log('');
  
  // Group issues by severity
  const grouped = {
    critical: plan.issues.filter(i => i.severity === 'critical'),
    warning: plan.issues.filter(i => i.severity === 'warning'),
    info: plan.issues.filter(i => i.severity === 'info'),
  };
  
  for (const [severity, issues] of Object.entries(grouped)) {
    if (issues.length === 0) continue;
    
    console.log(`[${severity.toUpperCase()}] ISSUES:\n`);
    
    for (const issue of issues) {
      console.log(`  [${issue.reason_code}]`);
      console.log(`    File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
      if (issue.section) console.log(`    Section: ${issue.section}`);
      console.log(`    Problem: ${issue.description}`);
      console.log(`    Fix: ${issue.fix_action}`);
      console.log('');
    }
  }
  
  // Next commands
  console.log(`${'─'.repeat(60)}`);
  console.log(`NEXT STEPS:\n`);
  for (const cmd of plan.next_commands) {
    console.log(`  ${cmd}`);
  }
  console.log('');
}

function savePlan(plan: RepairPlan): void {
  const outDir = path.join(AXION_ROOT, 'registry', 'repair_plans');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const outPath = path.join(outDir, `${plan.module}_repair.json`);
  fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
  console.log(`[INFO] Repair plan saved to: ${path.relative(process.cwd(), outPath)}\n`);
}

function getAllModules(): string[] {
  if (!fs.existsSync(TEMPLATES_PATH)) {
    return [];
  }
  return fs.readdirSync(TEMPLATES_PATH).filter(f => {
    const stat = fs.statSync(path.join(TEMPLATES_PATH, f));
    return stat.isDirectory() && f !== 'core';
  });
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  const saveOutput = args.includes('--save');
  
  console.log('\n[AXION] Repair Mode\n');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-repair.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-repair.ts --all');
    console.log('  npx ts-node axion/scripts/axion-repair.ts --module <name> --save');
    process.exit(1);
  }
  
  const modules = runAll ? getAllModules() : [targetModule!];
  let totalCritical = 0;
  
  for (const mod of modules) {
    const plan = repairModule(mod);
    printPlan(plan);
    
    if (saveOutput) {
      savePlan(plan);
    }
    
    totalCritical += plan.critical_count;
  }
  
  process.exit(totalCritical > 0 ? 1 : 0);
}

main();
