#!/usr/bin/env node
/**
 * axion:generate - Generate per-module doc packs
 * Creates domain folder structure and doc files from templates.
 * 
 * Usage:
 *   node axion/scripts/axion-generate.mjs --all
 *   node axion/scripts/axion-generate.mjs --module <name>
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  markStageDone,
} from './_axion_module_mode.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const { modules } = parseModuleArgs(process.argv);

// Report tracking
const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
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
  report.created.push(dirPath);
  return true;
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    report.skipped.push(filePath);
    return false;
  }
  if (!dryRun) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
  report.created.push(filePath);
  return true;
}

function loadTemplate(templateName, axionRoot) {
  const templatePath = path.join(axionRoot, 'templates', `${templateName}.template.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8');
  }
  // Return default template if not found
  return `# ${templateName} — {{DOMAIN_NAME}}\n\n## Overview\n**Domain Slug:** {{DOMAIN_SLUG}}\n\n<!-- Content to be filled -->\nUNKNOWN\n\n## Open Questions\n- UNKNOWN\n`;
}

function applyTemplate(template, domain) {
  return template
    .replace(/\{\{DOMAIN_NAME\}\}/g, domain.name || domain.slug)
    .replace(/\{\{DOMAIN_SLUG\}\}/g, domain.slug)
    .replace(/\{\{DOMAIN_PREFIX\}\}/g, domain.prefix || domain.slug)
    .replace(/\{\{DOMAIN_TYPE\}\}/g, domain.type || 'business');
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:generate`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${modules.join(', ')}`);
  console.log(`\nCreated (${report.created.length}):`);
  report.created.forEach(f => console.log(`  + ${f}`));
  console.log(`\nModified (${report.modified.length}):`);
  report.modified.forEach(f => console.log(`  ~ ${f}`));
  console.log(`\nSkipped (${report.skipped.length}):`);
  report.skipped.forEach(f => console.log(`  - ${f}`));
  console.log(`\nFailed (${report.failed.length}):`);
  report.failed.forEach(f => console.log(`  ! ${f}`));
  console.log('\n===================================');
}

try {
  console.log('Running axion:generate...');
  
  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';
  const domainsDir = path.join(axionRoot, config.domains_dir || 'domains');
  
  // Document templates to generate
  const docTemplates = [
    'DDES',
    'UX_Foundations',
    'UI_Constraints',
    'BELS',
    'DIM',
    'SCREENMAP',
    'TESTPLAN',
    'COMPONENT_LIBRARY',
    'COPY_GUIDE'
  ];
  
  // Process each module
  for (const module of modules) {
    console.log(`Generating module: ${module}`);
    
    // Generate is the first stage - no prereq check needed
    const domainDir = path.join(domainsDir, module);
    ensureDir(domainDir);
    
    // Get module config from domains.json or use defaults
    const moduleConfig = getModuleConfig(config, module);
    
    for (const templateName of docTemplates) {
      const template = loadTemplate(templateName, axionRoot);
      const content = applyTemplate(template, moduleConfig);
      const fileName = `${templateName}_${module}.md`;
      const filePath = path.join(domainDir, fileName);
      ensureFile(filePath, content);
    }
    
    // Mark stage done for this module
    if (!dryRun) {
      markStageDone('generate', module);
    }
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
