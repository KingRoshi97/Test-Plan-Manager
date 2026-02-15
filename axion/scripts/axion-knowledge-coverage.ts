#!/usr/bin/env node
/**
 * AXION Knowledge Coverage Analysis
 *
 * Cross-references knowledge-map.json against actual knowledge files
 * to detect dead references, unmapped files, and coverage gaps.
 *
 * Usage:
 *   node --import tsx axion/scripts/axion-knowledge-coverage.ts
 *   node --import tsx axion/scripts/axion-knowledge-coverage.ts --stack default-web-saas
 *   node --import tsx axion/scripts/axion-knowledge-coverage.ts --strict --json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = path.resolve(__dirname, '..');

const EXCLUDED_FILES = ['README.md', 'INDEX.md'];

type CheckStatus = 'PASS' | 'FAIL' | 'WARN';

interface DomainCoverageEntry {
  domain: string;
  primary: number;
  secondary: number;
  missing: string[];
}

interface StageCoverageEntry {
  stage: string;
  missing: string[];
}

interface DocTypeCoverageEntry {
  doc_type: string;
  missing: string[];
}

interface StackCoverageCheck {
  status: string;
  stack_id: string;
  missing_always: string[];
  missing_recommended: string[];
  missing_optional: string[];
}

interface KnowledgeCoverageResult {
  status: CheckStatus;
  stage: 'knowledge-coverage';
  total_knowledge_files: number;
  total_mapped: number;
  total_unmapped: number;
  coverage_pct: number;
  checks: {
    dead_references: { status: string; files: string[] };
    unmapped_files: { status: string; files: string[] };
    domain_coverage: { status: string; domains: DomainCoverageEntry[] };
    stack_coverage?: StackCoverageCheck;
    stage_coverage: { status: string; stages: StageCoverageEntry[] };
    doc_type_coverage: { status: string; doc_types: DocTypeCoverageEntry[] };
  };
  summary: string;
  hint?: string[];
}

function parseArgs(): { stack?: string; strict: boolean; json: boolean } {
  const args = process.argv.slice(2);
  let stack: string | undefined;
  let strict = false;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--stack' && args[i + 1]) {
      stack = args[++i];
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  return { stack, strict, json };
}

function log(status: CheckStatus | 'INFO', msg: string): void {
  const prefix: Record<string, string> = {
    PASS: '\x1b[32m[PASS]\x1b[0m',
    FAIL: '\x1b[31m[FAIL]\x1b[0m',
    WARN: '\x1b[33m[WARN]\x1b[0m',
    INFO: '\x1b[36m[INFO]\x1b[0m',
  };
  console.error(`${prefix[status]} ${msg}`);
}

function collectAllReferencedFiles(knowledgeMap: any): Set<string> {
  const refs = new Set<string>();

  if (knowledgeMap.domain_knowledge) {
    for (const domain of Object.values(knowledgeMap.domain_knowledge) as any[]) {
      if (domain.primary) domain.primary.forEach((f: string) => refs.add(f));
      if (domain.secondary) domain.secondary.forEach((f: string) => refs.add(f));
    }
  }

  if (knowledgeMap.stack_knowledge) {
    for (const stack of Object.values(knowledgeMap.stack_knowledge) as any[]) {
      if (stack.always) stack.always.forEach((f: string) => refs.add(f));
      if (stack.recommended) stack.recommended.forEach((f: string) => refs.add(f));
      if (stack.optional) stack.optional.forEach((f: string) => refs.add(f));
    }
  }

  if (knowledgeMap.stage_knowledge) {
    for (const stage of Object.values(knowledgeMap.stage_knowledge) as any[]) {
      if (stage.inject) stage.inject.forEach((f: string) => refs.add(f));
      if (stage.inject_global) stage.inject_global.forEach((f: string) => refs.add(f));
    }
  }

  if (knowledgeMap.doc_type_knowledge) {
    for (const files of Object.values(knowledgeMap.doc_type_knowledge) as any[]) {
      if (Array.isArray(files)) files.forEach((f: string) => refs.add(f));
    }
  }

  return refs;
}

function main(): void {
  const { stack, strict, json } = parseArgs();
  const knowledgeMapPath = path.join(AXION_ROOT, 'config', 'knowledge-map.json');
  const knowledgeDir = path.join(AXION_ROOT, 'knowledge');
  const hints: string[] = [];

  if (!json) {
    console.error('\n\x1b[1m[AXION] Knowledge Coverage Analysis\x1b[0m\n');
  }

  if (!fs.existsSync(knowledgeMapPath)) {
    const result: KnowledgeCoverageResult = {
      status: 'FAIL',
      stage: 'knowledge-coverage',
      total_knowledge_files: 0,
      total_mapped: 0,
      total_unmapped: 0,
      coverage_pct: 0,
      checks: {
        dead_references: { status: 'FAIL', files: [] },
        unmapped_files: { status: 'FAIL', files: [] },
        domain_coverage: { status: 'FAIL', domains: [] },
        stage_coverage: { status: 'FAIL', stages: [] },
        doc_type_coverage: { status: 'FAIL', doc_types: [] },
      },
      summary: 'knowledge-map.json not found — cannot perform coverage analysis',
      hint: [`Expected at: ${knowledgeMapPath}`],
    };
    if (!json) log('FAIL', result.summary);
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  let knowledgeMap: any;
  try {
    knowledgeMap = JSON.parse(fs.readFileSync(knowledgeMapPath, 'utf-8'));
  } catch (e: any) {
    const result: KnowledgeCoverageResult = {
      status: 'FAIL',
      stage: 'knowledge-coverage',
      total_knowledge_files: 0,
      total_mapped: 0,
      total_unmapped: 0,
      coverage_pct: 0,
      checks: {
        dead_references: { status: 'FAIL', files: [] },
        unmapped_files: { status: 'FAIL', files: [] },
        domain_coverage: { status: 'FAIL', domains: [] },
        stage_coverage: { status: 'FAIL', stages: [] },
        doc_type_coverage: { status: 'FAIL', doc_types: [] },
      },
      summary: `knowledge-map.json is invalid JSON: ${e.message}`,
      hint: ['Fix JSON syntax in axion/config/knowledge-map.json'],
    };
    if (!json) log('FAIL', result.summary);
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  if (!fs.existsSync(knowledgeDir)) {
    const result: KnowledgeCoverageResult = {
      status: 'FAIL',
      stage: 'knowledge-coverage',
      total_knowledge_files: 0,
      total_mapped: 0,
      total_unmapped: 0,
      coverage_pct: 0,
      checks: {
        dead_references: { status: 'FAIL', files: [] },
        unmapped_files: { status: 'FAIL', files: [] },
        domain_coverage: { status: 'FAIL', domains: [] },
        stage_coverage: { status: 'FAIL', stages: [] },
        doc_type_coverage: { status: 'FAIL', doc_types: [] },
      },
      summary: 'axion/knowledge/ directory not found',
      hint: [`Expected at: ${knowledgeDir}`],
    };
    if (!json) log('FAIL', result.summary);
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }

  const allKnowledgeFiles = fs.readdirSync(knowledgeDir).filter(
    (f) => f.endsWith('.md') && !EXCLUDED_FILES.includes(f)
  );
  const knowledgeFileSet = new Set(allKnowledgeFiles);

  const allReferencedFiles = collectAllReferencedFiles(knowledgeMap);

  if (!json) log('INFO', `Found ${allKnowledgeFiles.length} knowledge files`);
  if (!json) log('INFO', `Found ${allReferencedFiles.size} unique references in knowledge-map.json`);

  // 1. Dead references
  const deadRefs = [...allReferencedFiles].filter((f) => !knowledgeFileSet.has(f)).sort();
  const deadRefStatus: CheckStatus = deadRefs.length > 0 ? 'FAIL' : 'PASS';
  if (!json) {
    if (deadRefs.length > 0) {
      log('FAIL', `Dead references: ${deadRefs.join(', ')}`);
    } else {
      log('PASS', 'No dead references');
    }
  }

  // 2. Unmapped files
  const unmappedFiles = allKnowledgeFiles.filter((f) => !allReferencedFiles.has(f)).sort();
  const unmappedStatus: CheckStatus = unmappedFiles.length > 0 ? 'WARN' : 'PASS';
  if (!json) {
    if (unmappedFiles.length > 0) {
      log('WARN', `Unmapped files: ${unmappedFiles.join(', ')}`);
      hints.push('Add unmapped files to knowledge-map.json or remove them from axion/knowledge/');
    } else {
      log('PASS', 'All knowledge files are mapped');
    }
  }

  // 3. Domain coverage
  const domainEntries: DomainCoverageEntry[] = [];
  let domainStatus: CheckStatus = 'PASS';
  const domainKnowledge = knowledgeMap.domain_knowledge || {};
  for (const [domain, config] of Object.entries(domainKnowledge) as [string, any][]) {
    const primaryFiles = config.primary || [];
    const secondaryFiles = config.secondary || [];
    const missingPrimary = primaryFiles.filter((f: string) => !knowledgeFileSet.has(f));
    const missingSecondary = secondaryFiles.filter((f: string) => !knowledgeFileSet.has(f));
    const missing = [...missingPrimary, ...missingSecondary];

    if (missingPrimary.length > 0 || primaryFiles.length === 0) {
      domainStatus = 'FAIL';
    }
    if (missing.length > 0 && domainStatus !== 'FAIL') {
      domainStatus = 'WARN';
    }

    domainEntries.push({
      domain,
      primary: primaryFiles.length,
      secondary: secondaryFiles.length,
      missing,
    });
  }
  if (!json) {
    for (const entry of domainEntries) {
      if (entry.missing.length > 0) {
        log('FAIL', `Domain "${entry.domain}": missing ${entry.missing.join(', ')}`);
      } else {
        log('PASS', `Domain "${entry.domain}": ${entry.primary} primary, ${entry.secondary} secondary`);
      }
    }
  }

  // 4. Stack coverage (only when --stack provided)
  let stackCoverage: StackCoverageCheck | undefined;
  if (stack) {
    const stackKnowledge = knowledgeMap.stack_knowledge || {};
    if (!stackKnowledge[stack]) {
      stackCoverage = {
        status: 'FAIL',
        stack_id: stack,
        missing_always: [],
        missing_recommended: [],
        missing_optional: [],
      };
      if (!json) log('FAIL', `Stack "${stack}" not found in knowledge-map.json`);
      hints.push(`Available stacks: ${Object.keys(stackKnowledge).join(', ')}`);
    } else {
      const stackConfig = stackKnowledge[stack];
      const missingAlways = (stackConfig.always || []).filter((f: string) => !knowledgeFileSet.has(f));
      const missingRecommended = (stackConfig.recommended || []).filter((f: string) => !knowledgeFileSet.has(f));
      const missingOptional = (stackConfig.optional || []).filter((f: string) => !knowledgeFileSet.has(f));

      let stackStatus: CheckStatus = 'PASS';
      if (missingAlways.length > 0) stackStatus = 'FAIL';
      else if (missingRecommended.length > 0) stackStatus = 'WARN';

      stackCoverage = {
        status: stackStatus,
        stack_id: stack,
        missing_always: missingAlways,
        missing_recommended: missingRecommended,
        missing_optional: missingOptional,
      };

      if (!json) {
        if (missingAlways.length > 0) {
          log('FAIL', `Stack "${stack}" missing always: ${missingAlways.join(', ')}`);
        }
        if (missingRecommended.length > 0) {
          log('WARN', `Stack "${stack}" missing recommended: ${missingRecommended.join(', ')}`);
        }
        if (missingOptional.length > 0) {
          log('WARN', `Stack "${stack}" missing optional: ${missingOptional.join(', ')}`);
        }
        if (missingAlways.length === 0 && missingRecommended.length === 0 && missingOptional.length === 0) {
          log('PASS', `Stack "${stack}" fully covered`);
        }
      }
    }
  }

  // 5. Stage coverage
  const stageEntries: StageCoverageEntry[] = [];
  let stageStatus: CheckStatus = 'PASS';
  const stageKnowledge = knowledgeMap.stage_knowledge || {};
  for (const [stage, config] of Object.entries(stageKnowledge) as [string, any][]) {
    const injectFiles = config.inject || [];
    const injectGlobal = config.inject_global || [];
    const allStageFiles = [...injectFiles, ...injectGlobal];
    const missing = allStageFiles.filter((f: string) => !knowledgeFileSet.has(f));

    if (missing.length > 0 && stageStatus === 'PASS') {
      stageStatus = 'WARN';
    }

    stageEntries.push({ stage, missing });
  }
  if (!json) {
    for (const entry of stageEntries) {
      if (entry.missing.length > 0) {
        log('WARN', `Stage "${entry.stage}": missing ${entry.missing.join(', ')}`);
      } else {
        log('PASS', `Stage "${entry.stage}": all files present`);
      }
    }
  }

  // 6. Doc type coverage
  const docTypeEntries: DocTypeCoverageEntry[] = [];
  let docTypeStatus: CheckStatus = 'PASS';
  const docTypeKnowledge = knowledgeMap.doc_type_knowledge || {};
  for (const [docType, files] of Object.entries(docTypeKnowledge) as [string, any][]) {
    const fileList = Array.isArray(files) ? files : [];
    const missing = fileList.filter((f: string) => !knowledgeFileSet.has(f));

    if (missing.length > 0 && docTypeStatus === 'PASS') {
      docTypeStatus = 'WARN';
    }

    docTypeEntries.push({ doc_type: docType, missing });
  }
  if (!json) {
    for (const entry of docTypeEntries) {
      if (entry.missing.length > 0) {
        log('WARN', `Doc type "${entry.doc_type}": missing ${entry.missing.join(', ')}`);
      } else {
        log('PASS', `Doc type "${entry.doc_type}": all files present`);
      }
    }
  }

  // 7. Coverage summary
  const totalFiles = allKnowledgeFiles.length;
  const mappedFiles = allKnowledgeFiles.filter((f) => allReferencedFiles.has(f));
  const totalMapped = mappedFiles.length;
  const totalUnmapped = totalFiles - totalMapped;
  const coveragePct = totalFiles > 0 ? Math.round((totalMapped / totalFiles) * 10000) / 100 : 0;

  // Determine overall status
  let overallStatus: CheckStatus = 'PASS';
  if (deadRefStatus === 'FAIL' || domainStatus === 'FAIL' || stackCoverage?.status === 'FAIL') {
    overallStatus = 'FAIL';
  } else if (
    unmappedStatus === 'WARN' ||
    stageStatus === 'WARN' ||
    docTypeStatus === 'WARN' ||
    stackCoverage?.status === 'WARN' ||
    domainStatus === 'WARN'
  ) {
    overallStatus = 'WARN';
  }

  if (strict && overallStatus === 'WARN') {
    overallStatus = 'FAIL';
  }

  const summaryParts = [
    `${totalMapped}/${totalFiles} files mapped (${coveragePct}%)`,
  ];
  if (deadRefs.length > 0) summaryParts.push(`${deadRefs.length} dead reference(s)`);
  if (unmappedFiles.length > 0) summaryParts.push(`${unmappedFiles.length} unmapped file(s)`);
  const summary = summaryParts.join(', ');

  if (!json) {
    console.error('');
    log(overallStatus, summary);
    console.error('');
  }

  const result: KnowledgeCoverageResult = {
    status: overallStatus,
    stage: 'knowledge-coverage',
    total_knowledge_files: totalFiles,
    total_mapped: totalMapped,
    total_unmapped: totalUnmapped,
    coverage_pct: coveragePct,
    checks: {
      dead_references: { status: deadRefStatus, files: deadRefs },
      unmapped_files: { status: unmappedStatus, files: unmappedFiles },
      domain_coverage: { status: domainStatus, domains: domainEntries },
      stage_coverage: { status: stageStatus, stages: stageEntries },
      doc_type_coverage: { status: docTypeStatus, doc_types: docTypeEntries },
    },
    summary,
  };

  if (stackCoverage) {
    result.checks.stack_coverage = stackCoverage;
  }

  if (hints.length > 0) {
    result.hint = hints;
  }

  console.log(JSON.stringify(result, null, 2));
  process.exit(overallStatus === 'FAIL' ? 1 : 0);
}

main();
