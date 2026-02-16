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
  type: 'unknown_content' | 'empty_file' | 'missing_stack_profile';
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

function generateAgentPrompt(
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

  p += `## How to Use This Kit\n\n`;
  p += `This document is your entry point. Follow it step by step.\n\n`;

  p += `### Step 0: Project Context\n\n`;
  p += `Before reading any domain documentation, start with these files for essential project context:\n\n`;
  p += `- **\`PROJECT_OVERVIEW.md\`** — What this project is, its mode (e.g. mobile-pwa, web-saas), target audience, and core requirements\n`;
  p += `- **\`source_docs/RPBS_Product.md\`** — Requirements & Product Backlog Specification (the product vision)\n`;
  p += `- **\`source_docs/REBS_Product.md\`** — Requirements & Engineering Backlog Specification (technical approach)\n\n`;
  p += `These establish the project identity and constraints that all domain documentation builds upon.\n\n`;

  p += `### Step 1: Understand the Mode\n\n`;
  if (mode === 'docs') {
    p += `This kit contains **documentation only**. Your job is to read these docs and build the entire application from scratch based on them. Do not invent features that aren't documented.\n\n`;
  } else if (mode === 'scaffold') {
    p += `This kit contains **documentation + an application skeleton** in the \`app/\` directory. Your job is to read the docs and implement the features within the existing scaffold. Do not restructure the scaffold or invent undocumented features.\n\n`;
  } else {
    p += `This kit contains **documentation + a complete application** in the \`app/\` directory. Your job is to review the implementation against the docs, run tests, fix issues, and prepare for deployment.\n\n`;
  }

  if (stackProfile) {
    p += `### Step 2: Technology Stack\n\n`;
    p += `This project uses the following stack (from \`config/stack_profiles.json\`):\n\n`;
    const sp = stackProfile as Record<string, unknown>;
    if (sp.frontend) {
      const fe = sp.frontend as Record<string, string>;
      p += `**Frontend**: ${fe.framework || 'N/A'} + ${fe.language || 'N/A'} + ${fe.styling || 'N/A'}\n`;
      if (fe.state) p += `**State Management**: ${fe.state}\n`;
    }
    if (sp.backend) {
      const be = sp.backend as Record<string, string>;
      p += `**Backend**: ${be.runtime || 'N/A'} + ${be.framework || 'N/A'} (${be.api_style || 'REST'})\n`;
    }
    if (sp.database) {
      const db = sp.database as Record<string, string>;
      p += `**Database**: ${db.engine || 'N/A'} + ${db.orm || 'N/A'}\n`;
    }
    p += `\n`;
  }

  p += `### Step ${stackProfile ? '3' : '2'}: Reading Order\n\n`;
  p += `Read the domain documentation in this order. Each domain builds on the ones before it (dependencies are resolved):\n\n`;
  for (let i = 0; i < readingOrder.length; i++) {
    const slug = readingOrder[i];
    const deps = dependencies[slug] || [];
    const depStr = deps.length > 0 ? ` (depends on: ${deps.join(', ')})` : ' (no dependencies)';
    p += `${i + 1}. **${slug}/**${depStr}\n`;
  }
  p += `\n`;

  const nextStep = stackProfile ? 4 : 3;
  p += `### Step ${nextStep}: Document Types\n\n`;
  p += `Each domain contains these document types. Here's what each one tells you:\n\n`;
  p += `| Document | What It Contains | What You Build From It |\n`;
  p += `|----------|-----------------|------------------------|\n`;
  p += `| **README.md** | Domain overview and purpose | Understanding of scope |\n`;
  p += `| **DDES** | Entity definitions, relationships, attributes | Database schemas, models, migrations |\n`;
  p += `| **BELS** | Business rules, state machines, validation | Backend logic, middleware, validators |\n`;
  p += `| **DIM** | API contracts, integrations, error models | API routes, service clients, error handling |\n`;
  p += `| **SCREENMAP** | Pages, navigation flows, user actions | Frontend routes, pages, navigation |\n`;
  p += `| **COMPONENT_LIBRARY** | UI components, props, variants | Reusable frontend components |\n`;
  p += `| **UI_Constraints** | Layout rules, spacing, responsive behavior | CSS/styling, layout structure |\n`;
  p += `| **UX_Foundations** | Interaction patterns, design principles | UX decisions, interaction handlers |\n`;
  p += `| **COPY_GUIDE** | Text, labels, error messages, tone | All user-facing copy |\n`;
  p += `| **TESTPLAN** | Test cases, acceptance criteria | Test files, test data |\n`;
  p += `| **OPEN_QUESTIONS** | Unresolved decisions | Areas needing clarification |\n`;
  p += `\n`;

  p += `### Step ${nextStep + 1}: Key Rules\n\n`;
  p += `1. **Do NOT invent features** not documented in the domain files\n`;
  p += `2. **Follow the stack profile** — use the specified technologies, not alternatives\n`;
  p += `3. **Use the error model** defined in the contracts domain DIM\n`;
  p += `4. **Respect domain boundaries** — each domain owns its entities and logic\n`;
  p += `5. **Mark unknowns** — if information is missing, use the UNKNOWN placeholder and log to OPEN_QUESTIONS\n`;
  p += `6. **Follow the cascade** — changes to foundation domains (architecture, systems, contracts) affect all downstream domains\n`;
  p += `\n`;

  if (validation && (validation.unknownCount > 0 || validation.emptyCount > 0)) {
    p += `### Warnings\n\n`;
    if (validation.unknownCount > 0) {
      p += `- **${validation.unknownCount} UNKNOWN placeholder(s)** remain in the documentation. These represent gaps that need human input before implementation.\n`;
    }
    if (validation.emptyCount > 0) {
      p += `- **${validation.emptyCount} empty file(s)** exist in domains. These documents have not been filled yet.\n`;
    }
    p += `\n`;
  }

  p += `### Additional Resources\n\n`;
  p += `- \`config/domains.json\` — Module definitions and dependency graph\n`;
  p += `- \`config/stack_profiles.json\` — Available technology stacks\n`;
  p += `- \`config/presets.json\` — Pipeline configuration and stage plans\n`;
  p += `- \`knowledge/\` — Industry best practices for stacks, security, accessibility, UI patterns, and more\n`;
  p += `- \`registry/\` — Pipeline state (verify reports, lock manifest)\n`;
  if (mode !== 'docs') {
    p += `- \`app/\` — Application code\n`;
  }
  p += `\n`;

  p += `## Locked Modules\n\n`;
  if (modules.length > 0) {
    for (const mod of modules) {
      p += `- ${mod}\n`;
    }
  } else {
    p += `No modules locked yet. All domain documents are available for review.\n`;
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
      const domainFiles = walkDir(DOMAINS_PATH);
      for (const file of domainFiles) {
        const fullPath = path.join(DOMAINS_PATH, file);
        appendFile(fs.readFileSync(fullPath), `domains/${file}`);
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
