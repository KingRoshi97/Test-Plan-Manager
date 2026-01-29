#!/usr/bin/env node
/**
 * roshi:gen - Generate per-domain doc packs
 * Creates domain folder structure and doc files from templates.
 */

import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const domainArg = args.find((_, i, arr) => arr[i - 1] === '--domain');

// Report tracking
const report = {
  created: [],
  modified: [],
  skipped: [],
  failed: []
};

function loadDomainsConfig() {
  const configPath = 'assembler/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('assembler/domains.json not found. Run roshi:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
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

function loadTemplate(templateName, roshiRoot) {
  const templatePath = path.join(roshiRoot, '01_templates', `${templateName}.template.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf8');
  }
  // Return default template if not found
  return `# ${templateName} — {{DOMAIN_NAME}}\n\n## Overview\n**Domain Slug:** {{DOMAIN_SLUG}}\n\n<!-- Content to be filled -->\nUNKNOWN\n\n## Open Questions\n- UNKNOWN\n`;
}

function applyTemplate(template, domain) {
  return template
    .replace(/\{\{DOMAIN_NAME\}\}/g, domain.name)
    .replace(/\{\{DOMAIN_SLUG\}\}/g, domain.slug)
    .replace(/\{\{DOMAIN_PREFIX\}\}/g, domain.prefix)
    .replace(/\{\{DOMAIN_TYPE\}\}/g, domain.type);
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: roshi:gen`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  if (domainArg) console.log(`Domain: ${domainArg}`);
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
  console.log('Running roshi:gen...');
  
  const config = loadDomainsConfig();
  const roshiRoot = config.roshi_root;
  const domainsDir = path.join(roshiRoot, config.domains_dir);
  
  // Validate domain argument if provided
  if (domainArg) {
    const validDomain = config.domains.find(d => d.slug === domainArg);
    if (!validDomain) {
      throw new Error(`Domain "${domainArg}" not found in assembler/domains.json`);
    }
  }
  
  // Document templates to generate
  const docTemplates = [
    'DDES',
    'UX_Foundations',
    'UI_Constraints',
    'BELS',
    'DIM',
    'SCREENMAP',
    'TESTPLAN'
  ];
  
  // Filter domains if --domain specified
  const domainsToProcess = domainArg 
    ? config.domains.filter(d => d.slug === domainArg)
    : config.domains;
  
  for (const domain of domainsToProcess) {
    const domainDir = path.join(domainsDir, domain.slug);
    ensureDir(domainDir);
    
    for (const templateName of docTemplates) {
      const template = loadTemplate(templateName, roshiRoot);
      const content = applyTemplate(template, domain);
      const fileName = `${templateName}_${domain.slug}.md`;
      const filePath = path.join(domainDir, fileName);
      ensureFile(filePath, content);
    }
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
