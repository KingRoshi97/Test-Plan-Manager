#!/usr/bin/env node
/**
 * AXION Build
 * 
 * Invokes AI to implement code from locked documentation.
 * Gate: Blocked unless scaffold-app complete
 * 
 * Two-Root Model Support:
 * - System Root: <BUILD_ROOT>/axion/ (configs, templates)
 * - Workspace Root: <BUILD_ROOT>/<PROJECT_NAME>/ (outputs, app)
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-build.ts --build-root <path> --project-name <name>
 *   node --import tsx axion/scripts/axion-build.ts --app-path ./axion-app  (legacy mode)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonMode = process.argv.includes('--json');
const dryRun = process.argv.includes('--dry-run');
const startTime = Date.now();

const receipt = {
  stage: 'build',
  ok: true,
  modulesProcessed: [] as string[],
  createdFiles: [] as string[],
  modifiedFiles: [] as string[],
  skippedFiles: [] as string[],
  warnings: [] as string[],
  errors: [] as string[],
  elapsedMs: 0,
  dryRun,
};

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;
  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }
  if (receipt.ok) {
    console.log(JSON.stringify({
      status: 'success',
      stage: 'build',
      app_path: receipt.createdFiles[0] || undefined,
      modules_implemented: receipt.modulesProcessed,
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      status: 'failed',
      stage: 'build',
      errors: receipt.errors,
    }, null, 2));
  }
}

let AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');
let WORKSPACE_ROOT = AXION_ROOT;
let STAGE_MARKERS_PATH = path.join(AXION_ROOT, 'registry', 'stage_markers.json');
let DOMAINS_PATH = path.join(AXION_ROOT, 'domains');

function setupTwoRootPaths(buildRoot: string, projectName: string): void {
  AXION_ROOT = path.join(buildRoot, 'axion');
  WORKSPACE_ROOT = path.join(buildRoot, projectName);
  STAGE_MARKERS_PATH = path.join(WORKSPACE_ROOT, 'registry', 'stage_markers.json');
  const wsDomainsPath = path.join(WORKSPACE_ROOT, 'domains');
  const wsAxionDomainsPath = path.join(WORKSPACE_ROOT, 'axion', 'domains');
  DOMAINS_PATH = fs.existsSync(wsDomainsPath) ? wsDomainsPath : wsAxionDomainsPath;
}

interface StageMarkers {
  [module: string]: {
    [stage: string]: {
      completed_at: string;
      status: 'success' | 'failed';
    };
  };
}

interface BuildResult {
  status: 'success' | 'blocked_by' | 'failed';
  stage: string;
  app_path?: string;
  modules_implemented?: string[];
  missing?: string[];
  hint?: string[];
}

function loadStageMarkers(): StageMarkers {
  if (!fs.existsSync(STAGE_MARKERS_PATH)) return {};
  return JSON.parse(fs.readFileSync(STAGE_MARKERS_PATH, 'utf-8'));
}

function saveStageMarkers(markers: StageMarkers): void {
  const dir = path.dirname(STAGE_MARKERS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STAGE_MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function isScaffoldComplete(): boolean {
  const markers = loadStageMarkers();
  const globalMarkers = markers['global'] || {};
  return globalMarkers['scaffold-app']?.status === 'success';
}

function findAppPath(workspaceRoot: string): string | null {
  const candidates = [
    path.join(workspaceRoot, 'app'),
    path.join(workspaceRoot, 'axion-app'),
    path.join(workspaceRoot, 'src'),
    path.join(process.cwd(), 'axion-app'),
    path.join(process.cwd(), 'app'),
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  
  return null;
}

function getLockedDocs(): string[] {
  const docs: string[] = [];
  
  if (!fs.existsSync(DOMAINS_PATH)) return docs;
  
  const modules = fs.readdirSync(DOMAINS_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const module of modules) {
    const readmePath = path.join(DOMAINS_PATH, module, 'README.md');
    if (fs.existsSync(readmePath)) {
      docs.push(readmePath);
    }
  }
  
  return docs;
}

interface DomainModule {
  name: string;
  slug: string;
  type: string;
  description: string;
  dependencies: string[];
  templates: string[];
}

interface DomainsConfig {
  modules: DomainModule[];
  canonical_order: string[];
  build_phase_map: Record<string, number>;
}

function loadDomainsConfig(): DomainsConfig | null {
  const candidates = [
    path.join(AXION_ROOT, 'config', 'domains.json'),
    path.join(WORKSPACE_ROOT, 'axion', 'config', 'domains.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { continue; }
    }
  }
  return null;
}

function loadStackProfile(): Record<string, string> | null {
  const candidates = [
    path.join(WORKSPACE_ROOT, 'registry', 'stack_profile.json'),
    path.join(AXION_ROOT, 'registry', 'stack_profile.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { continue; }
    }
  }
  return null;
}

function getDocSizeKb(filePath: string): number {
  try {
    const stat = fs.statSync(filePath);
    return Math.round(stat.size / 1024);
  } catch { return 0; }
}

function listDomainDocs(domainPath: string): string[] {
  if (!fs.existsSync(domainPath)) return [];
  try {
    return fs.readdirSync(domainPath).filter(f => f.endsWith('.md'));
  } catch { return []; }
}

function generateBuildPrompt(appPath: string, docs: string[]): string {
  const domainsConfig = loadDomainsConfig();
  const stackProfile = loadStackProfile();

  const phaseMap: Record<number, DomainModule[]> = { 2: [], 3: [], 4: [] };
  const presentDomains = new Set<string>();

  if (fs.existsSync(DOMAINS_PATH)) {
    const dirs = fs.readdirSync(DOMAINS_PATH, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    dirs.forEach(d => presentDomains.add(d));
  }

  if (domainsConfig) {
    const bpm = domainsConfig.build_phase_map || {};
    for (const mod of domainsConfig.modules) {
      if (!presentDomains.has(mod.slug)) continue;
      const phase = bpm[mod.type] || 4;
      if (!phaseMap[phase]) phaseMap[phase] = [];
      phaseMap[phase].push(mod);
    }
  }

  const productDocsDir = path.join(WORKSPACE_ROOT, 'axion', 'docs', 'product');
  const hasProductDocs = fs.existsSync(productDocsDir);

  let prompt = `# AXION Build Prompt — Phased Implementation Guide\n\n`;

  prompt += `## Your Role\n\n`;
  prompt += `You are an AI coding agent implementing the application from AXION locked documentation.\n`;
  prompt += `You work in **phases**. Each phase has specific documents to read, specific things to build,\n`;
  prompt += `and a clear definition of "done." Complete one phase fully before moving to the next.\n`;
  prompt += `**Prioritize what the user can see** — visible features before invisible correctness.\n\n`;

  prompt += `## App Location\n\n\`${appPath}\`\n\n`;

  if (stackProfile) {
    prompt += `## Tech Stack\n\n`;
    const fields = ['runtime', 'framework', 'language', 'database', 'orm', 'ui_library', 'state_management', 'test_framework', 'package_manager'];
    for (const f of fields) {
      const val = stackProfile[f] || stackProfile[f.replace(/_/g, '-')];
      if (val) prompt += `- **${f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:** ${val}\n`;
    }
    prompt += `\n`;
  }

  prompt += `---\n\n`;

  prompt += `## Critical Operating Rules\n\n`;
  prompt += `1. **Documentation is authoritative.** Every decision must trace back to a kit document.\n`;
  prompt += `2. **Do not invent requirements.** If something is not specified, ask the user — never guess.\n`;
  prompt += `3. **Work in phases.** Read ONLY the documents listed for your current phase.\n`;
  prompt += `4. **Visible progress first.** A working screen > perfect backend logic the user cannot see.\n`;
  prompt += `5. **Checkpoint after every phase.** Show the user what you built before proceeding.\n`;
  prompt += `6. **Use the specified tech stack.** Do not substitute frameworks unless the ERC allows it.\n`;
  prompt += `7. **Report UNKNOWNs.** If a document has UNKNOWN placeholders, flag them — do not guess.\n`;
  prompt += `8. **Do not read ahead.** Loading all docs at once will exceed context limits and cause drift.\n\n`;

  prompt += `---\n\n`;

  prompt += `## Phase 1: Project Setup & Product Understanding\n\n`;
  prompt += `**Goal:** Understand what you are building and set up the project skeleton.\n\n`;
  prompt += `**Read ONLY these files:**\n\n`;

  if (hasProductDocs) {
    const productFiles = listDomainDocs(productDocsDir);
    for (const f of productFiles) {
      const size = getDocSizeKb(path.join(productDocsDir, f));
      prompt += `- \`axion/docs/product/${f}\` (${size} KB)\n`;
    }
  }

  const registryDir = path.join(WORKSPACE_ROOT, 'registry');
  const stackPath = path.join(registryDir, 'stack_profile.json');
  const ercPath = path.join(registryDir, 'ERC.md');
  if (fs.existsSync(stackPath)) prompt += `- \`registry/stack_profile.json\` (${getDocSizeKb(stackPath)} KB)\n`;
  if (fs.existsSync(ercPath)) prompt += `- \`registry/ERC.md\` (${getDocSizeKb(ercPath)} KB)\n`;

  prompt += `\n**What to build:**\n`;
  prompt += `1. Initialize the project with the specified tech stack\n`;
  prompt += `2. Set up the project directory structure\n`;
  prompt += `3. Install core dependencies\n`;
  prompt += `4. Create the database schema if specified\n`;
  prompt += `5. Ensure the app runs (even if it shows a blank page)\n\n`;
  prompt += `**Done when:** The project runs without errors and the tech stack matches the spec.\n\n`;
  prompt += `**Checkpoint:** Tell the user what you are building and that the project scaffolding is ready.\n\n`;

  prompt += `---\n\n`;

  const phaseLabels: Record<number, { title: string; goal: string; docTiers: string }> = {
    2: {
      title: 'Phase 2: Foundation Domains',
      goal: 'Build the invisible foundation that all features depend on (database, contracts, auth).',
      docTiers: 'Tier 1 only: README, BELS, DDES, DIM'
    },
    3: {
      title: 'Phase 3: Core Features & User Interface',
      goal: 'Build everything the user can see and interact with. This is the most important phase.',
      docTiers: 'Tier 1 + Tier 2: README, BELS, DDES, DIM, SCREENMAP, COMPONENT_LIBRARY, UI_Constraints, UX_Foundations, COPY_GUIDE'
    },
    4: {
      title: 'Phase 4: Polish, Testing & Hardening',
      goal: 'Add quality, security, testing, and operational readiness.',
      docTiers: 'Tier 1 + Tier 3: README, BELS, TESTPLAN'
    },
  };

  for (const phaseNum of [2, 3, 4]) {
    const domains = phaseMap[phaseNum] || [];
    if (domains.length === 0) continue;

    const info = phaseLabels[phaseNum];
    prompt += `## ${info.title}\n\n`;
    prompt += `**Goal:** ${info.goal}\n\n`;

    if (phaseNum === 3) {
      prompt += `**IMPORTANT: Build visual/UI domains FIRST within this phase.**\n`;
      prompt += `The user should see working screens before you perfect backend logic.\n\n`;
      prompt += `**Recommended order within Phase 3:**\n`;
      prompt += `1. State management domain (client-side state setup)\n`;
      prompt += `2. Frontend/UI domain (screens, components, interactions — MOST TIME HERE)\n`;
      prompt += `3. Backend domain (wire up endpoints to serve the UI)\n`;
      prompt += `4. Integrations domain (third-party services)\n`;
      prompt += `5. Fullstack domain (end-to-end flows)\n`;
      prompt += `6. Platform domains (mobile/desktop if applicable)\n\n`;
    }

    prompt += `**Domains in this phase (build in this order):**\n\n`;

    for (const dom of domains) {
      const domPath = path.join(DOMAINS_PATH, dom.slug);
      const domDocs = listDomainDocs(domPath);
      let totalKb = 0;
      for (const f of domDocs) totalKb += getDocSizeKb(path.join(domPath, f));

      prompt += `### ${dom.name} (\`${dom.slug}\`) — ${totalKb} KB total\n`;
      prompt += `> ${dom.description}\n`;
      if (dom.dependencies.length > 0) {
        prompt += `> Dependencies: ${dom.dependencies.join(', ')}\n`;
      }
      prompt += `\n`;
      prompt += `**Read these docs (${info.docTiers}):**\n`;

      const isVisualDomain = ['frontend', 'platform'].includes(dom.type);
      const tier1Prefixes = ['README', 'BELS', 'DDES', 'DIM'];
      const tier2Prefixes = ['SCREENMAP', 'COMPONENT_LIBRARY', 'UI_Constraints', 'UX_Foundations', 'COPY_GUIDE'];
      const tier3Prefixes = ['TESTPLAN'];

      const showTier2 = phaseNum === 3 && isVisualDomain;
      const showTier3 = phaseNum === 4;
      const activePrefixes = [
        ...tier1Prefixes,
        ...(showTier2 ? tier2Prefixes : []),
        ...(showTier3 ? tier3Prefixes : []),
      ];

      for (const f of domDocs) {
        const matchesTier = activePrefixes.some(p => f.startsWith(p) || f === 'README.md');
        if (!matchesTier && phaseNum !== 3) continue;
        if (phaseNum === 3 && !isVisualDomain) {
          const matchesTier1 = tier1Prefixes.some(p => f.startsWith(p) || f === 'README.md');
          if (!matchesTier1) continue;
        }
        if (phaseNum === 3 && isVisualDomain) {
          const matchesAny = [...tier1Prefixes, ...tier2Prefixes].some(p => f.startsWith(p) || f === 'README.md');
          if (!matchesAny) continue;
        }
        const size = getDocSizeKb(path.join(domPath, f));
        prompt += `- \`domains/${dom.slug}/${f}\` (${size} KB)\n`;
      }
      prompt += `\n`;
    }

    if (phaseNum === 2) {
      prompt += `**Done when:** Database schema exists, API contracts are implemented, auth works (if applicable).\n\n`;
      prompt += `**Checkpoint:** Tell the user the foundation is ready and that visible features are next.\n\n`;
    } else if (phaseNum === 3) {
      prompt += `**Done when:** Every screen from SCREENMAP is implemented, core user journeys work, the app is interactive.\n\n`;
      prompt += `**Checkpoint:** Show the user the working app. Walk through each screen. Get confirmation before proceeding.\n\n`;
    } else if (phaseNum === 4) {
      prompt += `**Done when:** Tests pass, security rules enforced, error states handled.\n\n`;
      prompt += `**Checkpoint:** Present the completed application to the user.\n\n`;
    }

    prompt += `---\n\n`;
  }

  prompt += `## Anti-Drift Rules\n\n`;
  prompt += `These are common agent mistakes. Internalize them:\n\n`;
  prompt += `1. **Do NOT go deep on backend before the UI is visible.** A working screen the user can see is\n`;
  prompt += `   always more valuable than perfect validation logic they cannot see.\n`;
  prompt += `2. **Do NOT read all documentation up front.** Load only the docs for your current phase.\n`;
  prompt += `   Reading ahead overloads your context and causes confusion.\n`;
  prompt += `3. **Do NOT implement infrastructure before features.** CI/CD, logging, and deployment come in\n`;
  prompt += `   Phase 4 — after the user can see and interact with the product.\n`;
  prompt += `4. **Do NOT invent requirements.** If it is not in the docs, ask the user. Never silently add\n`;
  prompt += `   features, endpoints, or UI elements that are not specified.\n`;
  prompt += `5. **Do NOT skip checkpoints.** Stop after each phase and show the user what you built.\n`;
  prompt += `   This prevents building the wrong thing for hours.\n`;
  prompt += `6. **Do NOT treat all domains equally.** Visual/frontend domains deserve the most attention.\n`;
  prompt += `   Infrastructure and operations domains are supporting actors.\n`;
  prompt += `7. **Do NOT ignore SCREENMAP and COMPONENT_LIBRARY.** These define exactly what the UI looks\n`;
  prompt += `   like. Read them BEFORE writing any frontend code.\n\n`;

  prompt += `---\n\n`;

  prompt += `## Document Priority Quick Reference\n\n`;
  prompt += `| Priority | Documents | When to Read |\n`;
  prompt += `|----------|-----------|-------------|\n`;
  prompt += `| Tier 1 (Required) | README, BELS, DDES, DIM | Before implementing any domain |\n`;
  prompt += `| Tier 2 (Visual) | SCREENMAP, COMPONENT_LIBRARY, UI_Constraints, UX_Foundations, COPY_GUIDE | Phase 3 for UI domains |\n`;
  prompt += `| Tier 3 (Testing) | TESTPLAN, ERC | Phase 4 for verification |\n`;
  prompt += `| Reference | knowledge/*.md | Consult INDEX.md per domain as needed |\n\n`;

  prompt += `## Quick Reference Card\n\n`;
  prompt += `| Question | Where to Find the Answer |\n`;
  prompt += `|----------|-------------------------|\n`;
  prompt += `| What am I building? | \`axion/docs/product/RPBS_Product.md\` |\n`;
  prompt += `| How should I build it? | \`axion/docs/product/REBS_Product.md\` |\n`;
  prompt += `| What is the tech stack? | \`registry/stack_profile.json\` |\n`;
  prompt += `| What is in/out of scope? | \`registry/ERC.md\` |\n`;
  prompt += `| What does screen X look like? | \`domains/frontend/SCREENMAP_frontend.md\` |\n`;
  prompt += `| What are the business rules? | \`domains/{domain}/BELS_{domain}.md\` |\n`;
  prompt += `| What data entities exist? | \`domains/{domain}/DDES_{domain}.md\` |\n`;
  prompt += `| What APIs does X expose? | \`domains/{domain}/DIM_{domain}.md\` |\n`;
  prompt += `| What components to use? | \`domains/frontend/COMPONENT_LIBRARY_frontend.md\` |\n`;
  prompt += `| Is this feature required? | Check ERC and RPBS — if not mentioned, ask user |\n`;
  prompt += `| Which phase am I in? | Follow the phases above in order |\n`;

  return prompt;
}

function main() {
  const args = process.argv.slice(2);
  const appPathIdx = args.indexOf('--app-path');
  const buildRootIdx = args.indexOf('--build-root');
  const projectNameIdx = args.indexOf('--project-name');
  const overrideFlag = args.includes('--override');

  const isTwoRootMode = buildRootIdx !== -1 && projectNameIdx !== -1;

  let appPath: string | null = appPathIdx !== -1 ? args[appPathIdx + 1] : null;
  let projectName: string | undefined;

  if (isTwoRootMode) {
    const buildRoot = path.resolve(args[buildRootIdx + 1]);
    projectName = args[projectNameIdx + 1];
    setupTwoRootPaths(buildRoot, projectName);

    if (!jsonMode) {
      console.log('\n[AXION] Build (Two-Root Mode)\n');
      console.log(`[INFO] Build root: ${buildRoot}`);
      console.log(`[INFO] Project: ${projectName}`);
      console.log(`[INFO] Workspace: ${WORKSPACE_ROOT}`);
    }
  } else {
    if (!jsonMode) {
      console.log('\n[AXION] Build\n');
    }
  }
  
  if (!isScaffoldComplete() && !overrideFlag) {
    receipt.ok = false;
    receipt.errors.push('build blocked unless scaffold-app complete');
    receipt.warnings.push('Run scaffold-app first', 'Or use --override flag');
    if (!jsonMode) {
      const result: BuildResult = {
        status: 'blocked_by',
        stage: 'build',
        missing: ['scaffold-app'],
        hint: [
          'build blocked unless scaffold-app complete',
          'Run scaffold-app first',
          'Or use --override flag',
        ],
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitOutput();
    }
    process.exit(1);
  }
  
  if (!appPath) {
    appPath = findAppPath(WORKSPACE_ROOT);
  }
  
  if (!appPath || !fs.existsSync(appPath)) {
    receipt.ok = false;
    receipt.errors.push('Could not find app directory');
    receipt.warnings.push('Use --app-path to specify location', 'Or run scaffold-app first');
    if (!jsonMode) {
      const result: BuildResult = {
        status: 'failed',
        stage: 'build',
        hint: [
          'Could not find app directory',
          'Use --app-path to specify location',
          'Or run scaffold-app first',
        ],
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitOutput();
    }
    process.exit(1);
  }
  
  const docs = getLockedDocs();
  if (docs.length === 0) {
    receipt.ok = false;
    receipt.errors.push(`No locked documentation found in ${DOMAINS_PATH}`);
    if (!jsonMode) {
      const result: BuildResult = {
        status: 'failed',
        stage: 'build',
        hint: [`No locked documentation found in ${DOMAINS_PATH}`],
      };
      console.log(JSON.stringify(result, null, 2));
    } else {
      emitOutput();
    }
    process.exit(1);
  }

  receipt.modulesProcessed = docs.map(d => path.basename(path.dirname(d)));
  
  if (!jsonMode) {
    console.log(`App path: ${appPath}`);
    console.log(`Docs: ${docs.length} modules`);
    console.log('');
  }

  if (dryRun) {
    if (!jsonMode) {
      console.log('[DRY-RUN] Would generate build prompt and write stage markers.');
      console.log(`[DRY-RUN] Modules: ${receipt.modulesProcessed.join(', ')}`);
    }
    emitOutput();
    return;
  }
  
  const buildPrompt = generateBuildPrompt(appPath, docs);
  const registryDir = path.join(WORKSPACE_ROOT, 'registry');
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }
  const promptPath = path.join(registryDir, 'build_prompt.md');
  fs.writeFileSync(promptPath, buildPrompt);
  receipt.createdFiles.push(promptPath);
  
  if (!jsonMode) {
    console.log(`[INFO] Build prompt written to: ${promptPath}`);
    console.log('');
    console.log('[INFO] Build stage prepares the prompt for AI implementation.');
    console.log('[INFO] The actual implementation should be done by an AI agent');
    console.log('[INFO] reading the build_prompt.md and locked documentation.');
    console.log('');
  }
  
  const markers = loadStageMarkers();
  markers['global'] = markers['global'] || {};
  markers['global']['build'] = {
    completed_at: new Date().toISOString(),
    status: 'success',
  };
  saveStageMarkers(markers);
  
  emitOutput();
}

try {
  main();
} catch (err: any) {
  receipt.ok = false;
  receipt.errors.push(err?.message || String(err));
  emitOutput();
  process.exit(1);
}
