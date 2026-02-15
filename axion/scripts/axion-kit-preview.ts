#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateKitIndex } from './lib/knowledge-resolver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AXION_ROOT = path.resolve(__dirname, '..');

type PreviewMode = 'docs' | 'scaffold' | 'full';
type ReadinessStatus = 'READY' | 'READY_WITH_WARNINGS' | 'NOT_READY';

interface KitPreviewResult {
  status: ReadinessStatus;
  stage: 'kit-preview';
  mode: string;
  stats: {
    total_files: number;
    total_size_bytes: number;
    domain_count: number;
    complete_domains: number;
    unknown_count: number;
    knowledge_files: number;
  };
  file_tree: string[];
  domains: Array<{
    name: string;
    docs_present: string[];
    docs_missing: string[];
    unknown_count: number;
    completeness_pct: number;
  }>;
  missing_required: string[];
  warnings: string[];
  knowledge_index_preview: string;
  summary: string;
  hint?: string[];
}

const ALL_DOC_TYPES = [
  'README', 'DDES', 'BELS', 'DIM', 'SCREENMAP',
  'COMPONENT_LIBRARY', 'COPY_GUIDE', 'TESTPLAN', 'OPEN_QUESTIONS',
];

const REQUIRED_DOC_TYPES = [
  'README', 'DDES', 'BELS', 'DIM', 'SCREENMAP', 'TESTPLAN',
];

function parseArgs(): { root: string; mode: PreviewMode; stackProfile?: string; json: boolean } {
  const args = process.argv.slice(2);
  let root: string | undefined;
  let mode: PreviewMode = 'docs';
  let stackProfile: string | undefined;
  let json = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--root' && args[i + 1]) {
      root = args[++i];
    } else if (args[i] === '--mode' && args[i + 1]) {
      mode = args[++i] as PreviewMode;
    } else if (args[i] === '--stack-profile' && args[i + 1]) {
      stackProfile = args[++i];
    } else if (args[i] === '--json') {
      json = true;
    }
  }

  const resolvedRoot = root ? path.resolve(root) : AXION_ROOT;
  return { root: resolvedRoot, mode, stackProfile, json };
}

function log(msg: string): void {
  console.error(msg);
}

function walkDir(dir: string, basePath: string = ''): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '_archive') continue;
      files.push(...walkDir(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

function buildFileTree(rootDir: string): string[] {
  const tree: string[] = [];
  const dirsToScan = ['domains', 'config', 'knowledge'];

  for (const dir of dirsToScan) {
    const fullDir = path.join(rootDir, dir);
    if (!fs.existsSync(fullDir)) continue;
    tree.push(`${dir}/`);
    const files = walkDir(fullDir);
    for (const file of files) {
      const depth = file.split(path.sep).length;
      const indent = '  '.repeat(depth);
      tree.push(`${indent}${file}`);
    }
  }

  return tree;
}

function buildIndentedTree(rootDir: string): string[] {
  const lines: string[] = [];
  const dirsToScan = ['domains', 'config', 'knowledge'];

  function walkForTree(dir: string, prefix: string, isLast: boolean, isRoot: boolean) {
    const name = path.basename(dir);
    if (isRoot) {
      lines.push(`${name}/`);
    } else {
      lines.push(`${prefix}${isLast ? '└── ' : '├── '}${name}/`);
    }

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

    const childPrefix = isRoot ? '' : `${prefix}${isLast ? '    ' : '│   '}`;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '_archive') continue;
      const childIsLast = i === entries.length - 1;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkForTree(fullPath, childPrefix, childIsLast, false);
      } else {
        lines.push(`${childPrefix}${childIsLast ? '└── ' : '├── '}${entry.name}`);
      }
    }
  }

  for (const dir of dirsToScan) {
    const fullDir = path.join(rootDir, dir);
    if (!fs.existsSync(fullDir)) continue;
    walkForTree(fullDir, '', false, true);
  }

  return lines;
}

function countUnknowns(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = content.match(/UNKNOWN/g);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function analyzeDomain(domainDir: string, domainName: string): {
  name: string;
  docs_present: string[];
  docs_missing: string[];
  unknown_count: number;
  completeness_pct: number;
} {
  const docsPresent: string[] = [];
  const docsMissing: string[] = [];
  let unknownCount = 0;

  let files: string[];
  try {
    files = fs.readdirSync(domainDir);
  } catch {
    return {
      name: domainName,
      docs_present: [],
      docs_missing: [...REQUIRED_DOC_TYPES],
      unknown_count: 0,
      completeness_pct: 0,
    };
  }

  for (const docType of ALL_DOC_TYPES) {
    const pattern = docType === 'README'
      ? 'README.md'
      : `${docType}_${domainName}.md`;
    const found = files.some(f => f === pattern);
    if (found) {
      docsPresent.push(docType);
      const fullPath = path.join(domainDir, pattern);
      unknownCount += countUnknowns(fullPath);
    } else if (REQUIRED_DOC_TYPES.includes(docType)) {
      docsMissing.push(docType);
    }
  }

  const requiredPresent = REQUIRED_DOC_TYPES.filter(dt => docsPresent.includes(dt)).length;
  const completeness = REQUIRED_DOC_TYPES.length > 0
    ? Math.round((requiredPresent / REQUIRED_DOC_TYPES.length) * 100)
    : 0;

  return {
    name: domainName,
    docs_present: docsPresent,
    docs_missing: docsMissing,
    unknown_count: unknownCount,
    completeness_pct: completeness,
  };
}

function getStackProfileId(rootDir: string, profileArg?: string): string {
  if (profileArg) return profileArg;
  const profilesPath = path.join(rootDir, 'config', 'stack_profiles.json');
  if (!fs.existsSync(profilesPath)) return 'default-web-saas';
  try {
    const data = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
    if (data.profiles?.['default-web-saas']) return 'default-web-saas';
    const keys = Object.keys(data.profiles || {});
    return keys.length > 0 ? keys[0] : 'default-web-saas';
  } catch {
    return 'default-web-saas';
  }
}

function getDomainSlugs(rootDir: string): string[] {
  const domainsDir = path.join(rootDir, 'domains');
  if (!fs.existsSync(domainsDir)) return [];
  try {
    return fs.readdirSync(domainsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();
  } catch {
    return [];
  }
}

function main() {
  const { root, mode, stackProfile, json } = parseArgs();

  const domainsDir = path.join(root, 'domains');
  const configDir = path.join(root, 'config');
  const knowledgeDir = path.join(root, 'knowledge');
  const registryDir = path.join(root, 'registry');

  if (!json) {
    log('\n[AXION] Kit Preview (dry-run)\n');
    log(`Workspace: ${root}`);
    log(`Mode: ${mode}`);
  }

  if (!fs.existsSync(root)) {
    const result: KitPreviewResult = {
      status: 'NOT_READY',
      stage: 'kit-preview',
      mode,
      stats: { total_files: 0, total_size_bytes: 0, domain_count: 0, complete_domains: 0, unknown_count: 0, knowledge_files: 0 },
      file_tree: [],
      domains: [],
      missing_required: ['Workspace directory does not exist'],
      warnings: [`Workspace directory not found: ${root}`],
      knowledge_index_preview: '',
      summary: 'Kit preview failed: workspace directory does not exist.',
      hint: ['Verify the --root path points to a valid AXION workspace'],
    };
    if (!json) log(`\n[NOT_READY] Workspace directory does not exist: ${root}`);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const missingRequired: string[] = [];
  const warnings: string[] = [];

  if (!json) log('\n── Required Files ──');

  const requiredFiles: Array<{ rel: string; required: boolean }> = [
    { rel: 'config/domains.json', required: true },
    { rel: 'config/stack_profiles.json', required: true },
    { rel: 'registry/lock_manifest.json', required: false },
  ];

  for (const { rel, required } of requiredFiles) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) {
      if (required) {
        missingRequired.push(rel);
        if (!json) log(`  [MISSING] ${rel}`);
      } else {
        warnings.push(`Optional file missing: ${rel}`);
        if (!json) log(`  [WARN]    ${rel} (optional)`);
      }
    } else {
      if (!json) log(`  [OK]      ${rel}`);
    }
  }

  const domainSlugs = getDomainSlugs(root);
  if (domainSlugs.length === 0) {
    missingRequired.push('At least one domain directory');
    if (!json) log('  [MISSING] At least one domain directory in domains/');
  } else {
    if (!json) log(`  [OK]      ${domainSlugs.length} domain(s) found`);
  }

  if (!json) {
    log('\n── Projected File Tree ──');
    const treeLines = buildIndentedTree(root);
    for (const line of treeLines) {
      log(`  ${line}`);
    }
  }

  const flatTree = buildFileTree(root);

  if (!json) log('\n── Domain Completeness ──');

  const domainResults: KitPreviewResult['domains'] = [];
  let totalUnknowns = 0;

  for (const slug of domainSlugs) {
    const domainDir = path.join(domainsDir, slug);
    const analysis = analyzeDomain(domainDir, slug);
    domainResults.push(analysis);
    totalUnknowns += analysis.unknown_count;

    if (!json) {
      const statusIcon = analysis.docs_missing.length === 0 && analysis.unknown_count === 0 ? '✓' : '!';
      log(`  [${statusIcon}] ${slug} — ${analysis.completeness_pct}% complete`);
      if (analysis.docs_present.length > 0) {
        log(`      Present: ${analysis.docs_present.join(', ')}`);
      }
      if (analysis.docs_missing.length > 0) {
        log(`      Missing: ${analysis.docs_missing.join(', ')}`);
      }
      if (analysis.unknown_count > 0) {
        log(`      UNKNOWNs: ${analysis.unknown_count}`);
      }
    }
  }

  if (totalUnknowns > 0) {
    warnings.push(`${totalUnknowns} UNKNOWN placeholder(s) across all domain files`);
  }

  const completeDomains = domainResults.filter(
    d => d.docs_missing.length === 0 && d.unknown_count === 0
  ).length;

  let totalFiles = 0;
  let totalSize = 0;

  const dirsToCount = [
    { dir: domainsDir, prefix: 'domains' },
    { dir: configDir, prefix: 'config' },
    { dir: knowledgeDir, prefix: 'knowledge' },
  ];

  for (const { dir } of dirsToCount) {
    const files = walkDir(dir);
    for (const file of files) {
      totalFiles++;
      totalSize += getFileSize(path.join(dir, file));
    }
  }

  let knowledgeFilesCount = 0;
  if (fs.existsSync(knowledgeDir)) {
    knowledgeFilesCount = walkDir(knowledgeDir).length;
  }

  let knowledgeIndexPreview = '';
  if (!json) log('\n── Knowledge INDEX Preview ──');

  try {
    const stackId = getStackProfileId(root, stackProfile);
    const activeDomains = domainSlugs.length > 0 ? domainSlugs : [];
    const indexContent = generateKitIndex(stackId, activeDomains);
    const previewLines = indexContent.split('\n').slice(0, 30);
    knowledgeIndexPreview = previewLines.join('\n');

    if (!json) {
      for (const line of previewLines) {
        log(`  ${line}`);
      }
      if (indexContent.split('\n').length > 30) {
        log(`  ... (${indexContent.split('\n').length - 30} more lines)`);
      }
    }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error';
    knowledgeIndexPreview = `(Failed to generate: ${errMsg})`;
    warnings.push(`Knowledge INDEX generation failed: ${errMsg}`);
    if (!json) log(`  [WARN] Failed to generate INDEX: ${errMsg}`);
  }

  let status: ReadinessStatus;
  let summary: string;
  const hints: string[] = [];

  if (missingRequired.length > 0) {
    status = 'NOT_READY';
    summary = `Kit is NOT READY: ${missingRequired.length} required item(s) missing.`;
    hints.push('Ensure all required config files exist before packaging.');
    if (missingRequired.includes('config/domains.json')) {
      hints.push('Create config/domains.json with module definitions.');
    }
    if (missingRequired.includes('config/stack_profiles.json')) {
      hints.push('Create config/stack_profiles.json with at least one stack profile.');
    }
    if (missingRequired.includes('At least one domain directory')) {
      hints.push('Create at least one domain directory in domains/ with documentation.');
    }
  } else if (warnings.length > 0 || completeDomains < domainResults.length) {
    status = 'READY_WITH_WARNINGS';
    const issues: string[] = [];
    if (totalUnknowns > 0) issues.push(`${totalUnknowns} UNKNOWN(s)`);
    if (completeDomains < domainResults.length) issues.push(`${domainResults.length - completeDomains} incomplete domain(s)`);
    if (warnings.length > 0 && issues.length === 0) issues.push(`${warnings.length} warning(s)`);
    summary = `Kit is READY with warnings: ${issues.join(', ')}.`;
    if (totalUnknowns > 0) hints.push('Replace UNKNOWN placeholders with actual content.');
    if (completeDomains < domainResults.length) hints.push('Complete missing required docs in all domains.');
  } else {
    status = 'READY';
    summary = `Kit is READY. ${domainResults.length} domain(s) complete, ${totalFiles} file(s), ${(totalSize / 1024).toFixed(1)} KB.`;
  }

  if (!json) {
    log('\n── Kit Statistics ──');
    log(`  Total files:       ${totalFiles}`);
    log(`  Total size:        ${(totalSize / 1024).toFixed(2)} KB (${totalSize} bytes)`);
    log(`  Domains:           ${domainResults.length}`);
    log(`  Complete domains:  ${completeDomains}`);
    log(`  UNKNOWN count:     ${totalUnknowns}`);
    log(`  Knowledge files:   ${knowledgeFilesCount}`);
    log('');
    log(`── Readiness: ${status} ──`);
    log(`  ${summary}`);
    if (hints.length > 0) {
      for (const h of hints) {
        log(`  → ${h}`);
      }
    }
    log('');
  }

  const result: KitPreviewResult = {
    status,
    stage: 'kit-preview',
    mode,
    stats: {
      total_files: totalFiles,
      total_size_bytes: totalSize,
      domain_count: domainResults.length,
      complete_domains: completeDomains,
      unknown_count: totalUnknowns,
      knowledge_files: knowledgeFilesCount,
    },
    file_tree: flatTree,
    domains: domainResults,
    missing_required: missingRequired,
    warnings,
    knowledge_index_preview: knowledgeIndexPreview,
    summary,
  };

  if (hints.length > 0) {
    result.hint = hints;
  }

  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (e) {
  const errMsg = e instanceof Error ? e.message : 'Unknown error';
  console.error(`[FATAL] Kit preview crashed: ${errMsg}`);
  const result: KitPreviewResult = {
    status: 'NOT_READY',
    stage: 'kit-preview',
    mode: 'docs',
    stats: { total_files: 0, total_size_bytes: 0, domain_count: 0, complete_domains: 0, unknown_count: 0, knowledge_files: 0 },
    file_tree: [],
    domains: [],
    missing_required: [],
    warnings: [`Script error: ${errMsg}`],
    knowledge_index_preview: '',
    summary: `Kit preview failed with error: ${errMsg}`,
    hint: ['Check the workspace path and try again'],
  };
  console.log(JSON.stringify(result, null, 2));
}
