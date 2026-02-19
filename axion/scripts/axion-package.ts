#!/usr/bin/env node
/**
 * AXION Package (Consolidated)
 * 
 * Single packager for Agent Kit bundles. Replaces the legacy .mjs packager.
 * 
 * Modes:
 * - docs: Locked documentation only
 * - scaffold: Docs + scaffold-app skeleton
 * - full: Docs + complete application code
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-package.ts --mode docs
 *   node --import tsx axion/scripts/axion-package.ts --mode full --app-path ./axion-app
 *   node --import tsx axion/scripts/axion-package.ts --build-root ./workspaces/my-project --mode docs
 * 
 * Flags:
 *   --mode <docs|scaffold|full>     Packaging mode (default: full)
 *   --app-path <path>               Path to application code (scaffold/full modes)
 *   --build-root <path>             Workspace root directory
 *   --output <path>                 Output directory for zip
 *   --project-name <name>           Project name for manifest
 *   --stack-profile <id>            Stack profile ID to include (e.g. default-web-saas)
 *   --skip-validation               Skip pre-packaging validation
 *   --json                          Output result as JSON
 *   --dry-run                       Validate without writing zip
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
import { fileURLToPath } from 'url';
import { generateKitIndex } from './lib/knowledge-resolver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let REGISTRY_PATH = path.join(AXION_ROOT, 'registry');
let DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
let CONFIG_PATH = path.join(AXION_ROOT, 'config');
let KNOWLEDGE_PATH = path.join(AXION_ROOT, 'knowledge');

type PackageMode = 'docs' | 'scaffold' | 'full';

interface PackageResult {
  status: 'success' | 'failed';
  stage: string;
  mode: PackageMode;
  output_path?: string;
  files_included?: number;
  zip_size_bytes?: number;
  zip_sha256?: string;
  warnings?: string[];
  hint?: string[];
}

interface ManifestEntry {
  path: string;
  size: number;
  sha256: string;
}

interface ValidationWarning {
  type: 'unknown_content' | 'empty_file' | 'missing_stack_profile' | 'missing_overview' | 'seed_unfilled' | 'missing_seed';
  message: string;
  file?: string;
}

interface AgentKitManifest {
  version: string;
  created_at: string;
  mode: PackageMode;
  project_name?: string;
  files: ManifestEntry[];
  locked_modules: string[];
  stack_profile?: Record<string, unknown>;
  domain_dependencies: Record<string, string[]>;
  knowledge_files: string[];
  reading_order: string[];
  validation: {
    unknown_count: number;
    empty_files: number;
    warnings: string[];
  };
}

function sha256(data: Buffer | string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function walkDir(dir: string, basePath: string = ''): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      files.push(...walkDir(fullPath, relativePath));
    } else {
      files.push(relativePath);
    }
  }
  return files;
}

function getLockedModules(): string[] {
  const lockManifestPath = path.join(REGISTRY_PATH, 'lock_manifest.json');
  if (fs.existsSync(lockManifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(lockManifestPath, 'utf-8'));
      return manifest.modules || [];
    } catch {
      // Fall through to directory scan
    }
  }
  if (!fs.existsSync(DOMAINS_PATH)) return [];
  return fs.readdirSync(DOMAINS_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function getProcessedModules(): string[] {
  const processed = new Set<string>();

  const consolidatedPath = path.join(REGISTRY_PATH, 'stage_markers.json');
  if (fs.existsSync(consolidatedPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(consolidatedPath, 'utf-8'));
      const markers = data.markers || data;
      for (const mod of Object.keys(markers)) {
        const stages = markers[mod];
        if (stages && typeof stages === 'object') {
          const hasSuccess = Object.values(stages).some((s: any) =>
            s && (s.status === 'success' || s.status === 'DONE' || s.status === 'pass')
          );
          if (hasSuccess) processed.add(mod);
        }
      }
    } catch {}
  }

  const markersDir = path.join(REGISTRY_PATH, 'stage_markers');
  if (fs.existsSync(markersDir)) {
    try {
      const stageDirs = fs.readdirSync(markersDir, { withFileTypes: true })
        .filter(d => d.isDirectory());
      for (const stageDir of stageDirs) {
        const stagePath = path.join(markersDir, stageDir.name);
        const moduleFiles = fs.readdirSync(stagePath).filter(f => f.endsWith('.json'));
        for (const mf of moduleFiles) {
          try {
            const marker = JSON.parse(fs.readFileSync(path.join(stagePath, mf), 'utf-8'));
            if (marker.status === 'DONE' || marker.status === 'success' || marker.status === 'pass') {
              processed.add(mf.replace(/\.json$/, ''));
            }
          } catch {}
        }
      }
    } catch {}
  }

  return [...processed];
}

function getDomainDependencies(): Record<string, string[]> {
  const domainsJsonPath = path.join(CONFIG_PATH, 'domains.json');
  if (!fs.existsSync(domainsJsonPath)) return {};
  try {
    const config = JSON.parse(fs.readFileSync(domainsJsonPath, 'utf-8'));
    const deps: Record<string, string[]> = {};
    if (Array.isArray(config.modules)) {
      for (const mod of config.modules) {
        deps[mod.slug] = mod.dependencies || [];
      }
    }
    return deps;
  } catch {
    return {};
  }
}

function getStackProfile(profileId?: string): Record<string, unknown> | undefined {
  const profilesPath = path.join(CONFIG_PATH, 'stack_profiles.json');
  if (!fs.existsSync(profilesPath)) return undefined;
  try {
    const data = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
    if (profileId && data.profiles?.[profileId]) {
      return data.profiles[profileId];
    }
    if (data.profiles?.['default-web-saas']) {
      return data.profiles['default-web-saas'];
    }
    const keys = Object.keys(data.profiles || {});
    return keys.length > 0 ? data.profiles[keys[0]] : undefined;
  } catch {
    return undefined;
  }
}

function computeReadingOrder(): string[] {
  const domainsJsonPath = path.join(CONFIG_PATH, 'domains.json');
  if (!fs.existsSync(domainsJsonPath)) return [];
  try {
    const config = JSON.parse(fs.readFileSync(domainsJsonPath, 'utf-8'));
    if (!Array.isArray(config.modules)) return [];
    const modules = config.modules as Array<{ slug: string; dependencies: string[] }>;
    const resolved: string[] = [];
    const seen = new Set<string>();
    function visit(slug: string) {
      if (seen.has(slug)) return;
      seen.add(slug);
      const mod = modules.find(m => m.slug === slug);
      if (mod) {
        for (const dep of mod.dependencies || []) {
          visit(dep);
        }
      }
      resolved.push(slug);
    }
    for (const mod of modules) {
      visit(mod.slug);
    }
    return resolved;
  } catch {
    return [];
  }
}

function validateKit(): { warnings: ValidationWarning[]; unknownCount: number; emptyCount: number } {
  const warnings: ValidationWarning[] = [];
  let unknownCount = 0;
  let emptyCount = 0;

  if (!fs.existsSync(DOMAINS_PATH)) {
    warnings.push({ type: 'empty_file', message: 'Domains directory does not exist' });
    return { warnings, unknownCount, emptyCount };
  }

  const domainFiles = walkDir(DOMAINS_PATH).filter(f => f.endsWith('.md'));
  for (const file of domainFiles) {
    const fullPath = path.join(DOMAINS_PATH, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    if (content.trim().length === 0) {
      emptyCount++;
      warnings.push({ type: 'empty_file', message: `Empty file: domains/${file}`, file: `domains/${file}` });
    }

    const matches = content.match(/UNKNOWN/g);
    if (matches) {
      unknownCount += matches.length;
      warnings.push({
        type: 'unknown_content',
        message: `${matches.length} UNKNOWN placeholder(s) in domains/${file}`,
        file: `domains/${file}`,
      });
    }
  }

  const profilesPath = path.join(CONFIG_PATH, 'stack_profiles.json');
  if (!fs.existsSync(profilesPath)) {
    warnings.push({ type: 'missing_stack_profile', message: 'No stack_profiles.json found in config' });
  }

  const workspaceRoot = path.dirname(AXION_ROOT);
  const overviewPath = path.join(workspaceRoot, 'PROJECT_OVERVIEW.md');
  if (!fs.existsSync(overviewPath)) {
    warnings.push({ type: 'missing_overview', message: 'PROJECT_OVERVIEW.md not found — agent kit will lack project context' });
  }

  const seedFiles = ['RPBS_Product.md', 'REBS_Product.md'];
  const seedSearchDirs = [
    path.join(AXION_ROOT, 'source_docs', 'product'),
    path.join(AXION_ROOT, 'docs', 'product'),
  ];
  for (const sf of seedFiles) {
    let sfFound = false;
    for (const dir of seedSearchDirs) {
      const sfPath = path.join(dir, sf);
      if (fs.existsSync(sfPath)) {
        sfFound = true;
        const sfContent = fs.readFileSync(sfPath, 'utf-8');
        const sfMatches = sfContent.match(/UNKNOWN/g);
        if (sfMatches && sfMatches.length > 10) {
          warnings.push({
            type: 'seed_unfilled',
            message: `Seed doc ${sf} has ${sfMatches.length} UNKNOWN placeholders — assembly data may not have been injected`,
            file: `source_docs/${sf}`,
          });
        }
        break;
      }
    }
    if (!sfFound) {
      warnings.push({ type: 'missing_seed', message: `Seed doc ${sf} not found in source_docs/ or docs/product/` });
    }
  }

  return { warnings, unknownCount, emptyCount };
}

function getModulesByType(): Record<string, Array<{ slug: string; dependencies: string[] }>> {
  const domainsJsonPath = path.join(CONFIG_PATH, 'domains.json');
  if (!fs.existsSync(domainsJsonPath)) return {};
  try {
    const config = JSON.parse(fs.readFileSync(domainsJsonPath, 'utf-8'));
    const byType: Record<string, Array<{ slug: string; dependencies: string[] }>> = {};
    if (Array.isArray(config.modules)) {
      for (const mod of config.modules) {
        const t = mod.type || 'core';
        if (!byType[t]) byType[t] = [];
        byType[t].push({ slug: mod.slug, dependencies: mod.dependencies || [] });
      }
    }
    return byType;
  } catch {
    return {};
  }
}

function extractErcSection(sectionName: string): string {
  const ercPaths = [
    path.join(REGISTRY_PATH, 'ERC.md'),
    path.join(DOMAINS_PATH, 'contracts', 'ERC.md'),
  ];
  for (const ercPath of ercPaths) {
    if (!fs.existsSync(ercPath)) continue;
    try {
      const content = fs.readFileSync(ercPath, 'utf-8');
      const regex = new RegExp(`^##\\s+.*${sectionName}.*$`, 'im');
      const match = content.match(regex);
      if (!match || match.index === undefined) continue;
      const startIdx = match.index + match[0].length;
      const nextSection = content.slice(startIdx).match(/^##\s+/m);
      const sectionContent = nextSection && nextSection.index !== undefined
        ? content.slice(startIdx, startIdx + nextSection.index).trim()
        : content.slice(startIdx).trim();
      if (sectionContent.length > 0) return sectionContent;
    } catch {}
  }
  return '';
}

function collectOpenQuestions(): string {
  const questions: string[] = [];
  if (fs.existsSync(DOMAINS_PATH)) {
    const files = walkDir(DOMAINS_PATH).filter(f => f.includes('OPEN_QUESTIONS'));
    for (const file of files) {
      const fullPath = path.join(DOMAINS_PATH, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
        for (const line of lines) {
          const cleaned = line.trim().replace(/^[-*]\s+/, '');
          if (cleaned.length > 0 && !cleaned.includes('UNKNOWN')) {
            questions.push(cleaned);
          }
        }
      } catch {}
    }
  }
  return questions.length > 0 ? questions.map(q => `- ${q}`).join('\n') : 'No open questions identified.';
}

function generateAllowedPaths(mode: PackageMode, kitRoot: string): string {
  const paths: string[] = [];
  if (mode === 'docs') {
    paths.push(`- \`${kitRoot}/app/**\` — Application code (you create this)`);
    paths.push(`- \`${kitRoot}/tests/**\` — Test files`);
  } else if (mode === 'scaffold') {
    paths.push(`- \`${kitRoot}/app/**\` — Application code (extend the scaffold)`);
    paths.push(`- \`${kitRoot}/tests/**\` — Test files`);
  } else {
    paths.push(`- \`${kitRoot}/app/**\` — Application code`);
    paths.push(`- \`${kitRoot}/tests/**\` — Test files`);
  }
  paths.push(`- \`${kitRoot}/app/src/**\` — Source code`);
  paths.push(`- \`${kitRoot}/app/public/**\` — Static assets`);
  paths.push(`- Project configuration files (\`package.json\`, \`tsconfig.json\`, etc.) — only when required by the task`);
  return paths.join('\n');
}

function generateForbiddenPaths(kitRoot: string): string {
  const paths: string[] = [];
  paths.push(`- \`${kitRoot}/docs/**\` — Locked documentation (read-only)`);
  paths.push(`- \`${kitRoot}/domains/**\` — Domain specifications (read-only)`);
  paths.push(`- \`${kitRoot}/registry/**\` — Pipeline state and contracts (read-only)`);
  paths.push(`- \`${kitRoot}/knowledge/**\` — Knowledge base (read-only)`);
  paths.push(`- \`${kitRoot}/config/**\` — Kit configuration (read-only)`);
  paths.push(`- \`${kitRoot}/AGENT_PROMPT.md\` — This file (read-only)`);
  paths.push(`- Any files outside the workspace root`);
  return paths.join('\n');
}

function generateVerificationCommands(stackProfile: Record<string, unknown>): string {
  const tooling = (stackProfile.tooling || {}) as Record<string, string>;
  const testing = (stackProfile.testing || {}) as Record<string, string>;
  const pkgMgr = tooling.package_manager || 'npm';
  const installCmd = pkgMgr === 'pnpm' ? 'pnpm install --frozen-lockfile' : pkgMgr === 'yarn' ? 'yarn install --frozen-lockfile' : 'npm ci';
  const testFramework = testing.framework || 'vitest';

  const commands: string[] = [];
  commands.push(`| Gate | Command | Required |`);
  commands.push(`|------|---------|----------|`);
  commands.push(`| Install | \`${installCmd}\` | All phases |`);
  commands.push(`| Typecheck | \`${pkgMgr} run typecheck\` | Phase 2+ |`);
  commands.push(`| Lint | \`${pkgMgr} run lint\` | Phase 2+ |`);
  commands.push(`| Unit Tests | \`${pkgMgr} run test\` (${testFramework}) | Phase 3+ |`);
  commands.push(`| Build | \`${pkgMgr} run build\` | Phase 4 |`);
  commands.push(`| Smoke Test | Start the app and verify core screens load | Phase 3+ |`);
  return commands.join('\n');
}

function generateAgentPrompt(
  mode: PackageMode,
  modules: string[],
  readingOrder: string[],
  dependencies: Record<string, string[]>,
  stackProfile?: Record<string, unknown>,
  projectName?: string,
  validation?: { unknownCount: number; emptyCount: number }
): string {
  const TEMPLATES_DIR = path.join(path.dirname(__dirname), 'templates');
  const templatePath = path.join(TEMPLATES_DIR, 'AGENT_PROMPT.template.md');

  if (!fs.existsSync(templatePath)) {
    return generateAgentPromptFallback(mode, modules, readingOrder, dependencies, stackProfile, projectName, validation);
  }

  let template = fs.readFileSync(templatePath, 'utf-8');

  template = template.replace(/<!--\s*AXION:AGENT_GUIDANCE[\s\S]*?-->/g, '');
  template = template.replace(/<!--\s*AXION:TEMPLATE_CONTRACT:\w+\s*-->/g, '');
  template = template.replace(/<!--\s*AXION:CORE_DOC:\w+\s*-->/g, '');
  template = template.replace(/<!-- AGENT:.*?-->/g, '');

  const sp = (stackProfile || {}) as Record<string, unknown>;
  const fe = (sp.frontend || {}) as Record<string, string>;
  const be = (sp.backend || {}) as Record<string, string>;
  const db = (sp.database || {}) as Record<string, string>;

  const modulesByType = getModulesByType();
  const phase2Types = ['foundation', 'data', 'security'];
  const phase2Modules = readingOrder.filter(slug => {
    const typeEntry = Object.entries(modulesByType).find(([, mods]) => mods.some(m => m.slug === slug));
    return typeEntry && phase2Types.includes(typeEntry[0]);
  });
  const phase2Order = phase2Modules.map((slug, i) => {
    const deps = dependencies[slug] || [];
    const depStr = deps.length > 0 ? ` (depends on: ${deps.join(', ')})` : '';
    return `${i + 1}. \`${slug}/\`${depStr}`;
  }).join('\n');

  const buildOrder = readingOrder.map((slug, i) => {
    const deps = dependencies[slug] || [];
    const typeEntry = Object.entries(modulesByType).find(([, mods]) => mods.some(m => m.slug === slug));
    const domainType = typeEntry ? typeEntry[0] : 'core';
    let phase = 'Phase 3';
    if (phase2Types.includes(domainType)) phase = 'Phase 2';
    else if (['quality', 'crosscutting', 'operations', 'developer'].includes(domainType)) phase = 'Phase 4';
    const depStr = deps.length > 0 ? ` → depends on: ${deps.join(', ')}` : '';
    return `${i + 1}. **${slug}** (${domainType}, ${phase})${depStr}`;
  }).join('\n');

  const acceptanceCriteria = extractErcSection('Acceptance') || 'Refer to `registry/ERC.md` for acceptance criteria.';
  const inScope = extractErcSection('Scope') || extractErcSection('In Scope') || 'Refer to `registry/ERC.md` for scope boundaries.';
  const forbidden = extractErcSection('Forbidden') || 'Refer to `registry/ERC.md` for forbidden changes.';
  const openQuestions = collectOpenQuestions();

  let upgradeNotes = '';
  if (mode === 'full') {
    const lockManifestPath = path.join(REGISTRY_PATH, 'lock_manifest.json');
    if (fs.existsSync(lockManifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(lockManifestPath, 'utf-8'));
        if (manifest.upgrade_notes) upgradeNotes = manifest.upgrade_notes;
      } catch {}
    }
  }
  if (!upgradeNotes) {
    upgradeNotes = 'This is the initial version. No upgrade notes.';
  }

  let kitVersion = '1.0';
  const lockManifestPath = path.join(REGISTRY_PATH, 'lock_manifest.json');
  if (fs.existsSync(lockManifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(lockManifestPath, 'utf-8'));
      if (manifest.version) kitVersion = manifest.version;
      if (manifest.revision) kitVersion = `${kitVersion} (rev ${manifest.revision})`;
    } catch {}
  }

  const kitType = mode === 'docs' ? 'documentation-only' : mode === 'scaffold' ? 'scaffold' : 'full';

  const purpose = projectName
    ? `Build and deploy the ${projectName} application according to its specification documents.`
    : 'Build and deploy the application according to its specification documents.';

  const kitRoot = projectName || 'agent_kit';
  const allowedPaths = generateAllowedPaths(mode, kitRoot);
  const forbiddenPaths = generateForbiddenPaths(kitRoot);
  const verificationCommands = generateVerificationCommands(sp);

  const replacements: Record<string, string> = {
    '{{PROJECT_NAME}}': projectName || 'Untitled Project',
    '{{PROJECT_PURPOSE}}': purpose,
    '{{KIT_VERSION}}': kitVersion,
    '{{KIT_TYPE}}': kitType,
    '{{KIT_ROOT}}': kitRoot,
    '{{RUNTIME}}': be.runtime || 'N/A',
    '{{FRAMEWORK}}': be.framework || fe.framework || 'N/A',
    '{{LANGUAGE}}': fe.language || 'TypeScript',
    '{{DATABASE}}': db.engine || 'N/A',
    '{{ORM}}': db.orm || 'N/A',
    '{{UI_LIBRARY}}': fe.framework || fe.styling || 'N/A',
    '{{STATE_MANAGEMENT}}': fe.state || 'N/A',
    '{{TEST_FRAMEWORK}}': (sp.testing as Record<string, string>)?.framework || 'N/A',
    '{{PACKAGE_MANAGER}}': (sp.tooling as Record<string, string>)?.package_manager || 'npm',
    '{{BUILD_ORDER}}': buildOrder || 'No domain modules found.',
    '{{PHASE_2_DOMAIN_ORDER}}': phase2Order || 'No foundation domains found.',
    '{{ACCEPTANCE_CRITERIA}}': acceptanceCriteria,
    '{{IN_SCOPE}}': inScope,
    '{{FORBIDDEN_CHANGES}}': forbidden,
    '{{UPGRADE_NOTES}}': upgradeNotes,
    '{{OPEN_QUESTIONS}}': openQuestions,
    '{{DOMAIN_SLUG}}': '{slug}',
    '{{ALLOWED_PATHS}}': allowedPaths,
    '{{FORBIDDEN_PATHS}}': forbiddenPaths,
    '{{VERIFICATION_COMMANDS}}': verificationCommands,
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.split(placeholder).join(value);
  }

  if (validation && (validation.unknownCount > 0 || validation.emptyCount > 0)) {
    let warningsBlock = '\n## Validation Warnings\n\n';
    if (validation.unknownCount > 0) {
      warningsBlock += `- **${validation.unknownCount} UNKNOWN placeholder(s)** remain in the documentation. These represent gaps that need human input before implementation.\n`;
    }
    if (validation.emptyCount > 0) {
      warningsBlock += `- **${validation.emptyCount} empty file(s)** exist in domains. These documents have not been filled yet.\n`;
    }
    const openQIdx = template.indexOf('## Open Questions');
    if (openQIdx !== -1) {
      template = template.slice(0, openQIdx) + warningsBlock + '\n' + template.slice(openQIdx);
    } else {
      template += warningsBlock;
    }
  }

  template = template.replace(/\n{4,}/g, '\n\n\n');

  return template;
}

function generateAgentPromptFallback(
  mode: PackageMode,
  modules: string[],
  readingOrder: string[],
  dependencies: Record<string, string[]>,
  stackProfile?: Record<string, unknown>,
  projectName?: string,
  validation?: { unknownCount: number; emptyCount: number }
): string {
  let p = '';
  p += `# AXION Agent Kit${projectName ? `: ${projectName}` : ''}\n\n`;
  p += `Generated by AXION on ${new Date().toISOString()} in **${mode}** mode.\n\n`;
  p += `> **Note:** The AGENT_PROMPT template was not found. This is a simplified fallback prompt.\n\n`;
  p += `## Reading Order\n\n`;
  for (let i = 0; i < readingOrder.length; i++) {
    const slug = readingOrder[i];
    const deps = dependencies[slug] || [];
    const depStr = deps.length > 0 ? ` (depends on: ${deps.join(', ')})` : '';
    p += `${i + 1}. **${slug}/**${depStr}\n`;
  }
  p += `\n## Locked Modules\n\n`;
  for (const mod of modules) p += `- ${mod}\n`;
  if (validation && (validation.unknownCount > 0 || validation.emptyCount > 0)) {
    p += `\n## Warnings\n\n`;
    if (validation.unknownCount > 0) p += `- ${validation.unknownCount} UNKNOWN placeholder(s) remain.\n`;
    if (validation.emptyCount > 0) p += `- ${validation.emptyCount} empty file(s) exist.\n`;
  }
  return p;
}

async function createZip(
  outputPath: string,
  mode: PackageMode,
  appPath: string | null,
  stackProfile: Record<string, unknown> | undefined,
  projectName: string | undefined,
  readingOrder: string[],
  dependencies: Record<string, string[]>,
  validation: { unknownCount: number; emptyCount: number; warnings: ValidationWarning[] }
): Promise<{ files: ManifestEntry[]; size: number; hash: string }> {
  const files: ManifestEntry[] = [];

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      const zipBuffer = fs.readFileSync(outputPath);
      resolve({
        files,
        size: archive.pointer(),
        hash: sha256(zipBuffer),
      });
    });

    archive.on('error', reject);
    archive.pipe(output);

    const appendFile = (content: Buffer | string, archivePath: string) => {
      archive.append(content, { name: archivePath });
      const buf = typeof content === 'string' ? Buffer.from(content) : content;
      files.push({ path: archivePath, size: buf.length, sha256: sha256(buf) });
    };

    const workspaceRoot = path.dirname(AXION_ROOT);
    const projectOverviewPath = path.join(workspaceRoot, 'PROJECT_OVERVIEW.md');
    if (fs.existsSync(projectOverviewPath)) {
      appendFile(fs.readFileSync(projectOverviewPath), 'PROJECT_OVERVIEW.md');
    }

    const seedDocDirs = [
      path.join(AXION_ROOT, 'source_docs', 'product'),
      path.join(AXION_ROOT, 'docs', 'product'),
    ];
    const seedDocFiles = ['RPBS_Product.md', 'REBS_Product.md'];
    for (const file of seedDocFiles) {
      let found = false;
      for (const dir of seedDocDirs) {
        const fullPath = path.join(dir, file);
        if (fs.existsSync(fullPath)) {
          appendFile(fs.readFileSync(fullPath), `source_docs/${file}`);
          found = true;
          break;
        }
      }
    }

    if (fs.existsSync(DOMAINS_PATH)) {
      const lockedModules = getLockedModules();
      const processedModules = getProcessedModules();
      const activeModules = new Set([...lockedModules, ...processedModules]);

      const domainFiles = walkDir(DOMAINS_PATH);

      const readmeModuleVariants = new Set<string>();
      for (const file of domainFiles) {
        const match = file.match(/^([^/]+)\/README_\w+\.md$/);
        if (match) readmeModuleVariants.add(match[1]);
      }

      for (const file of domainFiles) {
        const moduleName = file.split('/')[0];

        if (activeModules.size > 0 && !activeModules.has(moduleName)) continue;

        if (file.endsWith('/README.md') && readmeModuleVariants.has(moduleName)) continue;

        const fullPath = path.join(DOMAINS_PATH, file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.trim().length === 0) continue;

        appendFile(Buffer.from(content), `domains/${file}`);
      }
    }

    if (fs.existsSync(REGISTRY_PATH)) {
      for (const file of ['verify_report.json', 'lock_manifest.json', 'stage_markers.json']) {
        const fullPath = path.join(REGISTRY_PATH, file);
        if (fs.existsSync(fullPath)) {
          appendFile(fs.readFileSync(fullPath), `registry/${file}`);
        }
      }
    }

    if (fs.existsSync(CONFIG_PATH)) {
      for (const file of ['domains.json', 'presets.json', 'stack_profiles.json']) {
        const fullPath = path.join(CONFIG_PATH, file);
        if (fs.existsSync(fullPath)) {
          appendFile(fs.readFileSync(fullPath), `config/${file}`);
        }
      }
    }

    const knowledgeFiles: string[] = [];
    if (fs.existsSync(KNOWLEDGE_PATH)) {
      const kFiles = walkDir(KNOWLEDGE_PATH);
      for (const file of kFiles) {
        const fullPath = path.join(KNOWLEDGE_PATH, file);
        appendFile(fs.readFileSync(fullPath), `knowledge/${file}`);
        knowledgeFiles.push(`knowledge/${file}`);
      }

      try {
        const stackId = stackProfile?.stack_id as string || 'default-web-saas';
        const activeDomains = Object.keys(dependencies).length > 0
          ? Object.keys(dependencies)
          : getLockedModules();
        const indexMd = generateKitIndex(stackId, activeDomains);
        appendFile(indexMd, 'knowledge/INDEX.md');
        knowledgeFiles.push('knowledge/INDEX.md');
      } catch (e) {
        // Non-fatal: INDEX.md generation failed, knowledge files still included
      }
    }

    if ((mode === 'scaffold' || mode === 'full') && appPath && fs.existsSync(appPath)) {
      const appFiles = walkDir(appPath);
      for (const file of appFiles) {
        const fullPath = path.join(appPath, file);
        appendFile(fs.readFileSync(fullPath), `app/${file}`);
      }
    }

    const modules = getLockedModules();
    const agentPrompt = generateAgentPrompt(
      mode, modules, readingOrder, dependencies, stackProfile, projectName,
      { unknownCount: validation.unknownCount, emptyCount: validation.emptyCount }
    );
    appendFile(agentPrompt, 'AGENT_PROMPT.md');

    const manifest: AgentKitManifest = {
      version: '2.1',
      created_at: new Date().toISOString(),
      mode,
      project_name: projectName,
      files: files.map(f => ({ path: f.path, size: f.size, sha256: f.sha256 })),
      locked_modules: modules,
      stack_profile: stackProfile,
      domain_dependencies: dependencies,
      knowledge_files: knowledgeFiles,
      reading_order: readingOrder,
      validation: {
        unknown_count: validation.unknownCount,
        empty_files: validation.emptyCount,
        warnings: validation.warnings.map(w => w.message),
      },
    };

    const manifestJson = JSON.stringify(manifest, null, 2);
    appendFile(manifestJson, 'manifest.json');

    archive.finalize();
  });
}

async function main() {
  const startTime = Date.now();

  const args = process.argv.slice(2);
  const getArg = (flag: string): string | null => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
  };
  const hasFlag = (flag: string): boolean => args.includes(flag);

  const buildRoot = getArg('--build-root');
  const projectName = getArg('--project-name') || undefined;
  const stackProfileId = getArg('--stack-profile') || undefined;
  const skipValidation = hasFlag('--skip-validation');
  const jsonMode = hasFlag('--json');
  const dryRun = hasFlag('--dry-run');

  const receipt: {
    ok: boolean;
    script: string;
    stage: string;
    dryRun: boolean;
    errors: string[];
    warnings: string[];
    elapsedMs: number;
    mode: PackageMode;
    output_path?: string;
    files_included?: number;
    zip_size_bytes?: number;
    zip_sha256?: string;
    hint?: string[];
  } = {
    ok: true,
    script: 'axion-package',
    stage: 'package',
    dryRun,
    errors: [],
    warnings: [],
    elapsedMs: 0,
    mode: 'full',
  };

  function emitOutput() {
    receipt.elapsedMs = Date.now() - startTime;
    if (jsonMode) {
      process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    } else {
      if (receipt.ok) {
        console.log(`\n[SUCCESS] Created Agent Kit (v2.1)`);
        if (receipt.output_path) console.log(`Output: ${receipt.output_path}`);
        if (receipt.files_included != null) console.log(`Files: ${receipt.files_included}`);
        if (receipt.zip_size_bytes != null) console.log(`Size: ${(receipt.zip_size_bytes / 1024).toFixed(2)} KB`);
        if (receipt.zip_sha256) console.log(`SHA256: ${receipt.zip_sha256.slice(0, 16)}...`);
        if (receipt.warnings.length > 0) console.log(`Warnings: ${receipt.warnings.length}`);
        if (dryRun) console.log(`[DRY-RUN] No zip was written.`);
        console.log(`Elapsed: ${receipt.elapsedMs}ms`);
        console.log('');
      } else {
        console.error(`\n[FAILED] axion-package`);
        for (const e of receipt.errors) console.error(`  ERROR: ${e}`);
        if (receipt.hint) for (const h of receipt.hint) console.error(`  HINT: ${h}`);
        console.error(`Elapsed: ${receipt.elapsedMs}ms\n`);
      }
    }
  }

  if (buildRoot) {
    AXION_ROOT = path.join(buildRoot, 'axion');
    REGISTRY_PATH = path.join(AXION_ROOT, 'registry');
    DOMAINS_PATH = path.join(AXION_ROOT, 'domains');
    CONFIG_PATH = path.join(AXION_ROOT, 'config');
    KNOWLEDGE_PATH = path.join(AXION_ROOT, 'knowledge');
  }

  let mode: PackageMode = (getArg('--mode') as PackageMode) || 'full';
  let appPath = getArg('--app-path');

  const outputDir = getArg('--output') || path.join(buildRoot || AXION_ROOT, 'dist');

  if (!jsonMode) {
    console.log('\n[AXION] Package (v2.1 — Consolidated)\n');
    if (buildRoot) console.log(`[INFO] Workspace: ${buildRoot}`);
    console.log(`Mode: ${mode}`);
    if (dryRun) console.log(`[DRY-RUN] enabled`);
  }

  if (!['docs', 'scaffold', 'full'].includes(mode)) {
    receipt.ok = false;
    receipt.mode = mode;
    receipt.errors.push('Invalid mode. Use: docs, scaffold, or full');
    receipt.hint = ['Invalid mode. Use: docs, scaffold, or full'];
    emitOutput();
    process.exit(1);
  }

  receipt.mode = mode;

  if (mode !== 'docs' && !appPath) {
    const candidates = buildRoot
      ? [path.join(buildRoot, 'app'), path.join(buildRoot, 'axion-app')]
      : [path.join(process.cwd(), 'axion-app'), path.join(process.cwd(), 'app')];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) { appPath = candidate; break; }
    }
    if (!appPath) {
      if (!jsonMode) console.log(`[WARN] No app path found for ${mode} mode, falling back to docs mode`);
      receipt.warnings.push(`No app path found for ${mode} mode, falling back to docs mode`);
      mode = 'docs';
      receipt.mode = mode;
    }
  }

  if (!jsonMode && appPath) console.log(`App: ${appPath}`);

  const validation = skipValidation
    ? { warnings: [] as ValidationWarning[], unknownCount: 0, emptyCount: 0 }
    : validateKit();

  if (validation.warnings.length > 0) {
    for (const w of validation.warnings) {
      receipt.warnings.push(w.message);
    }
  }

  if (!skipValidation && !jsonMode && validation.warnings.length > 0) {
    console.log(`\n[VALIDATION] ${validation.warnings.length} warning(s):`);
    const grouped = {
      unknowns: validation.warnings.filter(w => w.type === 'unknown_content').length,
      empty: validation.warnings.filter(w => w.type === 'empty_file').length,
      other: validation.warnings.filter(w => w.type === 'missing_stack_profile').length,
    };
    if (grouped.unknowns > 0) console.log(`  - ${validation.unknownCount} UNKNOWN placeholders across ${grouped.unknowns} file(s)`);
    if (grouped.empty > 0) console.log(`  - ${grouped.empty} empty file(s)`);
    if (grouped.other > 0) console.log(`  - Missing stack profile`);
    console.log('');
  }

  const stackProfile = getStackProfile(stackProfileId);
  const readingOrder = computeReadingOrder();
  const dependencies = getDomainDependencies();

  if (dryRun) {
    receipt.ok = true;
    if (!jsonMode) console.log(`\n[DRY-RUN] Would package mode=${mode}, outputDir=${outputDir}`);
    emitOutput();
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const zipFilename = `agent_kit_${mode}_${timestamp}.zip`;
  const zipPath = path.join(outputDir, zipFilename);

  if (!jsonMode) {
    console.log(`Output: ${zipPath}`);
    console.log('');
  }

  try {
    const { files, size, hash } = await createZip(
      zipPath, mode, appPath, stackProfile, projectName,
      readingOrder, dependencies, validation
    );

    receipt.ok = true;
    receipt.output_path = zipPath;
    receipt.files_included = files.length;
    receipt.zip_size_bytes = size;
    receipt.zip_sha256 = hash;

    emitOutput();
  } catch (error) {
    receipt.ok = false;
    receipt.errors.push(error instanceof Error ? error.message : 'Unknown error');
    receipt.hint = [error instanceof Error ? error.message : 'Unknown error'];
    emitOutput();
    process.exit(1);
  }
}

main().catch((err) => {
  const fallback = {
    ok: false,
    script: 'axion-package',
    stage: 'package',
    dryRun: false,
    errors: [err instanceof Error ? err.message : String(err)],
    warnings: [],
    elapsedMs: 0,
  };
  process.stdout.write(JSON.stringify(fallback, null, 2) + '\n');
  process.exit(1);
});
