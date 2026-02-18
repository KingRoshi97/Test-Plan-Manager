#!/usr/bin/env node
/**
 * axion:generate - Generate per-module doc packs
 * Creates domain folder structure and doc files from templates.
 *
 * Usage:
 *   node axion/scripts/axion-generate.mjs --all
 *   node axion/scripts/axion-generate.mjs --module <name>
 *   node axion/scripts/axion-generate.mjs --all --json
 *   node axion/scripts/axion-generate.mjs --all --allow-template-fallback
 *   node axion/scripts/axion-generate.mjs --all --dry-run
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  markStageDone,
  markStageFailed,
  AXION_DOC_TYPES,
  getModuleDocTypes,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');
const allowTemplateFallback = args.includes('--allow-template-fallback');
const { modules } = parseModuleArgs(process.argv);

const startTime = Date.now();

const report = {
  stage: 'generate',
  modulesProcessed: [],
  createdFiles: [],
  skippedFiles: [],
  missingTemplates: [],
  warnings: [],
  errors: [],
  ok: true,
};

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function getModuleConfig(config, moduleSlug) {
  const moduleConfig = config.modules?.find(m => m.slug === moduleSlug);
  if (moduleConfig) return moduleConfig;
  return {
    slug: moduleSlug,
    name: moduleSlug.charAt(0).toUpperCase() + moduleSlug.slice(1),
    prefix: moduleSlug,
    type: 'business'
  };
}

function ensureDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    return false;
  }
  if (!dryRun) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  report.createdFiles.push(dirPath);
  return true;
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    report.skippedFiles.push(filePath);
    return false;
  }
  if (!dryRun) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.createdFiles.push(filePath);
  return true;
}

function loadTemplate(templateName, axionRoot) {
  const searchPaths = [
    path.join(axionRoot, 'templates', 'core', `${templateName}.template.md`),
    path.join(axionRoot, 'templates', `${templateName}.template.md`),
  ];
  for (const templatePath of searchPaths) {
    if (fs.existsSync(templatePath)) {
      return { content: fs.readFileSync(templatePath, 'utf8'), found: true };
    }
  }

  report.missingTemplates.push(templateName);

  if (!allowTemplateFallback) {
    return { content: null, found: false };
  }

  const msg = `Template '${templateName}' not found (searched: ${searchPaths.join(', ')}). Using fallback.`;
  report.warnings.push(msg);
  if (!jsonMode) {
    console.error(`[WARN] ${msg}`);
  }

  const fallback = `# ${templateName} — {{DOMAIN_NAME}}

## Overview
**Domain Slug:** {{DOMAIN_SLUG}}
**Domain Type:** {{DOMAIN_TYPE}}
**Prefix:** {{DOMAIN_PREFIX}}

<!-- Content to be filled by the workspace agent -->

## Open Questions
- UNKNOWN
`;
  return { content: fallback, found: false };
}

function applyTemplate(template, domain) {
  return template
    .replace(/\{\{DOMAIN_NAME\}\}/g, domain.name || domain.slug)
    .replace(/\{\{DOMAIN_SLUG\}\}/g, domain.slug)
    .replace(/\{\{DOMAIN_PREFIX\}\}/g, domain.prefix || domain.slug)
    .replace(/\{\{DOMAIN_TYPE\}\}/g, domain.type || 'business');
}

function printHumanReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:generate`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${report.modulesProcessed.join(', ')}`);
  console.log(`Doc Types (available): ${AXION_DOC_TYPES.join(', ')} (per-module filtering applied via domains.json)`);
  console.log(`\nCreated (${report.createdFiles.length}):`);
  report.createdFiles.forEach(f => console.log(`  + ${f}`));
  console.log(`\nSkipped (${report.skippedFiles.length}):`);
  report.skippedFiles.forEach(f => console.log(`  - ${f}`));
  if (report.missingTemplates.length) {
    console.log(`\nMissing Templates (${report.missingTemplates.length}):`);
    report.missingTemplates.forEach(t => console.log(`  ! ${t}`));
  }
  if (report.warnings.length) {
    console.log(`\nWarnings (${report.warnings.length}):`);
    report.warnings.forEach(w => console.log(`  [WARN] ${w}`));
  }
  if (report.errors.length) {
    console.log(`\nErrors (${report.errors.length}):`);
    report.errors.forEach(e => console.log(`  [ERROR] ${e}`));
  }
  console.log(`\nResult: ${report.ok ? 'OK' : 'FAILED'}`);
  console.log('===================================');
}

function printJsonReport() {
  const output = {
    stage: report.stage,
    ok: report.ok,
    modulesProcessed: report.modulesProcessed,
    createdFiles: report.createdFiles,
    skippedFiles: report.skippedFiles,
    missingTemplates: report.missingTemplates,
    warnings: report.warnings,
    errors: report.errors,
    elapsedMs: Date.now() - startTime,
    dryRun,
  };
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

function emitReport() {
  if (jsonMode) {
    printJsonReport();
  } else {
    printHumanReport();
  }
}

try {
  if (!jsonMode) {
    console.log('Running axion:generate...');
  }

  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');

  for (const module of modules) {
    if (!jsonMode) {
      console.log(`Generating module: ${module}`);
    }

    const domainDir = path.join(domainsDir, module);
    ensureDir(domainDir);

    const moduleConfig = getModuleConfig(config, module);
    let moduleFailed = false;

    const moduleDocTypes = getModuleDocTypes(module);
    for (const templateName of moduleDocTypes) {
      const { content, found } = loadTemplate(templateName, axionRoot);

      if (!found && !allowTemplateFallback) {
        const errorMsg = `Missing template '${templateName}' for module '${module}'. ` +
          `Expected at: ${axionRoot}/templates/core/${templateName}.template.md. ` +
          `Use --allow-template-fallback to generate with placeholder content.`;
        report.errors.push(errorMsg);
        report.ok = false;
        moduleFailed = true;
        if (!jsonMode) {
          console.error(`[ERROR] ${errorMsg}`);
        }
        continue;
      }

      if (content) {
        const rendered = applyTemplate(content, moduleConfig);
        const fileName = `${templateName}_${module}.md`;
        const filePath = path.join(domainDir, fileName);
        ensureFile(filePath, rendered);
      }
    }

    report.modulesProcessed.push(module);

    if (!dryRun && !moduleFailed) {
      markStageDone('generate', module);
    } else if (!dryRun && moduleFailed) {
      markStageFailed('generate', module, {
        error: `Missing templates: ${report.missingTemplates.join(', ')}`,
      });
    }
  }

  emitReport();

  if (!report.ok) {
    process.exit(1);
  }

} catch (error) {
  report.errors.push(error.message);
  report.ok = false;
  emitReport();
  process.exit(1);
}
