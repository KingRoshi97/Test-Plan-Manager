#!/usr/bin/env node
/**
 * AXION Seed Script
 * 
 * Adds neutral scaffolding (placeholders, headings) to generated docs.
 * Must be idempotent - running twice produces same result.
 * 
 * Usage:
 *   npx ts-node axion/scripts/axion-seed.ts --module <name>
 *   npx ts-node axion/scripts/axion-seed.ts --all
 *   npx ts-node axion/scripts/axion-seed.ts --root <workspace> --module <name>
 */

import * as fs from 'fs';
import * as path from 'path';

// Parse --root argument for two-root mode
function parseRootArg(): string | null {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--root');
  if (rootIdx !== -1 && args[rootIdx + 1]) {
    return path.resolve(args[rootIdx + 1]);
  }
  return null;
}

// Two-root mode: system folder for templates/config, workspace for outputs
const WORKSPACE_ROOT = parseRootArg();
const AXION_ROOT = process.env.AXION_WORKSPACE || path.join(process.cwd(), 'axion');

// System paths (read-only, from axion/ system folder)
const CONFIG_PATH = path.join(AXION_ROOT, 'config', 'domains.json');
const COVERAGE_MAP_PATH = path.join(AXION_ROOT, 'config', 'coverage_map.json');
const AGENT_PROMPT_TEMPLATE_PATH = path.join(AXION_ROOT, 'templates', 'AGENT_PROMPT.template.md');

// Workspace paths (writable, from workspace root or axion/ for legacy mode)
const WORKSPACE_BASE = WORKSPACE_ROOT || AXION_ROOT;
const DOMAINS_PATH = path.join(WORKSPACE_BASE, 'domains');
const MARKERS_PATH = path.join(WORKSPACE_BASE, 'registry', 'stage_markers.json');
const AGENT_PROMPT_OUTPUT_PATH = path.join(WORKSPACE_BASE, 'registry', 'AGENT_PROMPT.md');
const REGISTRY_PATH = path.join(WORKSPACE_BASE, 'registry');

// Core modules requiring RPBS_DERIVATIONS blocks
const CORE_MODULES = ['contracts', 'database', 'auth', 'backend', 'state', 'frontend', 'fullstack', 'systems'];

interface CoverageMap {
  version: string;
  core_modules: string[];
  blocks: Record<string, {
    source: string;
    source_section: string;
    required_for: string[];
    notes: string;
  }>;
}

interface Module {
  name: string;
  slug: string;
  prefix: string;
  type: string;
  dependencies?: string[];
}

interface Config {
  modules: Module[];
  canonical_order: string[];
}

// Flat markers structure: { moduleName: { stageName: { ... } } }
type StageMarkers = Record<string, Record<string, any>>;

function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadMarkers(): StageMarkers {
  if (!fs.existsSync(MARKERS_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(MARKERS_PATH, 'utf-8'));
}

function saveMarkers(markers: StageMarkers): void {
  fs.writeFileSync(MARKERS_PATH, JSON.stringify(markers, null, 2));
}

function checkPrerequisites(mod: Module, markers: StageMarkers, config: Config): string[] {
  const missing: string[] = [];
  
  if (!markers[mod.slug]?.generate) {
    missing.push(`generate:${mod.slug}`);
  }
  
  if (mod.dependencies) {
    for (const dep of mod.dependencies) {
      if (!markers[dep]?.generate) {
        missing.push(dep);
      }
    }
  }
  
  return missing;
}

function loadCoverageMap(): CoverageMap | null {
  if (!fs.existsSync(COVERAGE_MAP_PATH)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(COVERAGE_MAP_PATH, 'utf-8'));
}

function generateAgentPrompt(config: Config, markers: StageMarkers): void {
  let template: string;
  
  if (fs.existsSync(AGENT_PROMPT_TEMPLATE_PATH)) {
    template = fs.readFileSync(AGENT_PROMPT_TEMPLATE_PATH, 'utf-8');
  } else {
    template = `# AXION Draft Instructions

You are an AI coding agent helping to draft documentation for a software project.

## Your Task

Read the user's project input and generate content for each module's documentation.

## Source Materials

1. **User Input**: \`{{ATTACHMENTS_CONTENT_PATH}}\`
2. **Product Requirements (RPBS)**: \`{{RPBS_PATH}}\`
3. **Engineering Requirements (REBS)**: \`{{REBS_PATH}}\`

## Modules to Draft

{{MODULE_LIST}}

## After Drafting

Run: \`node --import tsx axion/scripts/axion-verify.ts --all\`

---
**Generated**: {{TIMESTAMP}}
`;
  }
  
  const modulesToDraft = config.canonical_order
    .filter(slug => markers[slug]?.seed && !markers[slug]?.draft)
    .map((slug, i) => {
      const mod = config.modules.find(m => m.slug === slug);
      const deps = mod?.dependencies?.length ? ` (depends on: ${mod.dependencies.join(', ')})` : '';
      return `${i + 1}. **${mod?.name || slug}**: \`axion/domains/${slug}/README.md\`${deps}`;
    });
  
  const attachmentsPath = fs.existsSync(path.join(REGISTRY_PATH, 'attachments_content.md'))
    ? 'registry/attachments_content.md'
    : 'source_docs/product/attachments/START_HERE.txt';
  
  const output = template
    .replace('{{ATTACHMENTS_CONTENT_PATH}}', attachmentsPath)
    .replace('{{RPBS_PATH}}', 'axion/source_docs/product/RPBS_Product.md')
    .replace('{{REBS_PATH}}', 'axion/source_docs/product/REBS_Product.md')
    .replace('{{MODULE_LIST}}', modulesToDraft.join('\n'))
    .replace('{{MODULE_COUNT}}', String(modulesToDraft.length))
    .replace('{{TIMESTAMP}}', new Date().toISOString());
  
  const registryDir = path.dirname(AGENT_PROMPT_OUTPUT_PATH);
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true });
  }
  
  fs.writeFileSync(AGENT_PROMPT_OUTPUT_PATH, output);
}

function generateDerivationBlock(modSlug: string): string {
  const coverageMap = loadCoverageMap();
  const coreModules = coverageMap?.core_modules || CORE_MODULES;
  
  if (!coreModules.includes(modSlug)) {
    return '';
  }
  
  const lines: string[] = [
    '<!-- AXION:SECTION:RPBS_DERIVATIONS -->',
    '## RPBS_DERIVATIONS (Required)',
    '- Tenancy/Org Model: UNKNOWN (source: RPBS §21 Tenancy / Organization Model)',
    '- Actors & Permission Intents: UNKNOWN (source: RPBS §3 Actors & Permission Intents)',
    '- Core Objects impacted here: UNKNOWN (source: RPBS §4 Core Objects Glossary)',
    '- Non-Functional Profile implications: UNKNOWN (source: RPBS §7 Non-Functional Profile)',
    '- Enabled capabilities in scope for this module (mark Yes/No/N/A):',
    '  - Billing/Entitlements: N/A (source: RPBS §14)',
    '  - Notifications: N/A (source: RPBS §11)',
    '  - Uploads/Media: N/A (source: RPBS §13)',
    '  - Public API: N/A (source: RPBS §22)',
  ];
  
  // Add module-specific fields
  if (['auth', 'backend', 'database', 'frontend'].includes(modSlug)) {
    lines.push('- Privacy Controls (Deletion/Export): UNKNOWN (source: RPBS §29)');
  }
  
  if (['contracts', 'backend', 'frontend', 'fullstack', 'systems'].includes(modSlug)) {
    lines.push('- Stack Selection Policy alignment: UNKNOWN (source: REBS §1)');
  }
  
  lines.push('- OPEN_QUESTIONS impacting this module: NONE (source: RPBS §34)');
  lines.push('');
  
  return lines.join('\n');
}

function seedModule(mod: Module): void {
  const docPath = path.join(DOMAINS_PATH, mod.slug, 'README.md');
  
  if (!fs.existsSync(docPath)) {
    return;
  }
  
  let content = fs.readFileSync(docPath, 'utf-8');
  
  // Scaffold RPBS_DERIVATIONS block for core modules
  const coreModules = loadCoverageMap()?.core_modules || CORE_MODULES;
  if (coreModules.includes(mod.slug) && !content.includes('## RPBS_DERIVATIONS (Required)')) {
    const derivationBlock = generateDerivationBlock(mod.slug);
    if (derivationBlock) {
      // Insert after Agent Rules section if it exists
      const agentRulesIdx = content.indexOf('## 0) Agent Rules');
      if (agentRulesIdx !== -1) {
        // Find the next ## section after Agent Rules
        const afterAgentRules = content.indexOf('\n## ', agentRulesIdx + 1);
        if (afterAgentRules !== -1) {
          content = content.slice(0, afterAgentRules) + '\n\n' + derivationBlock + content.slice(afterAgentRules);
        } else {
          content += '\n\n' + derivationBlock;
        }
      } else {
        // Insert at beginning if no Agent Rules
        const firstSection = content.indexOf('\n## ');
        if (firstSection !== -1) {
          content = content.slice(0, firstSection) + '\n\n' + derivationBlock + content.slice(firstSection);
        } else {
          content += '\n\n' + derivationBlock;
        }
      }
    }
  }
  
  if (!content.includes('## ACCEPTANCE')) {
    content += '\n\n## ACCEPTANCE\n- [ ] All [TBD] placeholders populated\n';
  }
  
  if (!content.includes('## OPEN_QUESTIONS')) {
    content += '\n\n## OPEN_QUESTIONS\n- [TBD] - List unresolved questions\n';
  }
  
  if (!content.includes('## Agent Rules')) {
    const acceptanceIdx = content.indexOf('## ACCEPTANCE');
    if (acceptanceIdx !== -1) {
      content = content.slice(0, acceptanceIdx) +
        '## Agent Rules\n\n1. [TBD] - Define agent constraints.\n2. [TBD] - Define agent behaviors.\n\n' +
        content.slice(acceptanceIdx);
    } else {
      content += '\n\n## Agent Rules\n\n1. [TBD] - Define agent constraints.\n2. [TBD] - Define agent behaviors.\n';
    }
  }
  
  fs.writeFileSync(docPath, content);
}

function main() {
  const args = process.argv.slice(2);
  const moduleArg = args.indexOf('--module');
  const targetModule = moduleArg !== -1 ? args[moduleArg + 1] : null;
  const runAll = args.includes('--all');
  
  if (!targetModule && !runAll) {
    console.log('Usage:');
    console.log('  npx ts-node axion/scripts/axion-seed.ts --module <name>');
    console.log('  npx ts-node axion/scripts/axion-seed.ts --all');
    process.exit(1);
  }
  
  const config = loadConfig();
  const markers = loadMarkers();
  
  const targetMod = config.modules.find(m => m.slug === targetModule);
  
  if (!runAll && !targetMod) {
    console.error(`[ERROR] Module "${targetModule}" not found`);
    process.exit(1);
  }
  
  const modulesToSeed = runAll
    ? config.canonical_order.map(slug => config.modules.find(m => m.slug === slug)!)
    : [targetMod!];
  
  console.log('\n[AXION] Seed\n');
  
  for (const mod of modulesToSeed) {
    if (!mod) continue;
    
    const missing = checkPrerequisites(mod, markers, config);
    
    if (missing.length > 0) {
      const response = {
        status: 'blocked_by',
        stage: 'seed',
        module: mod.slug,
        missing: missing,
        hint: missing.map(m => {
          if (m.startsWith('generate:')) {
            return `npx ts-node axion/scripts/axion-generate.ts --module ${m.replace('generate:', '')}`;
          }
          return `npx ts-node axion/scripts/axion-generate.ts --module ${m}`;
        }),
      };
      
      console.log(JSON.stringify(response, null, 2));
      
      if (!runAll) {
        process.exit(1);
      }
      continue;
    }
    
    console.log(`[INFO] Seeding ${mod.name}...`);
    seedModule(mod);
    
    if (!markers[mod.slug]) {
      markers[mod.slug] = {};
    }
    markers[mod.slug].seed = {
      completed_at: new Date().toISOString(),
    };
    
    console.log(`[DONE] ${mod.name}`);
  }
  
  saveMarkers(markers);
  
  // Generate AGENT_PROMPT.md for AI agents
  if (runAll) {
    generateAgentPrompt(config, markers);
    console.log('\n[INFO] Generated registry/AGENT_PROMPT.md for AI agent drafting');
  }
  
  const response = {
    status: 'success',
    stage: 'seed',
    module: runAll ? 'all' : targetModule,
    marker_written: true,
    agent_prompt: runAll ? 'registry/AGENT_PROMPT.md' : null,
  };
  
  console.log('\n' + JSON.stringify(response, null, 2));
  
  if (runAll) {
    console.log('\n[NEXT STEP] Ask your AI agent to draft documentation:');
    console.log('            "Please draft the AXION documentation following axion/registry/AGENT_PROMPT.md"\n');
  }
  
  process.exit(0);
}

main();
