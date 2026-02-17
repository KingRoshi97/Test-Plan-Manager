#!/usr/bin/env node
/**
 * axion:seed - Seed starter scaffolding
 * Creates baseline registry docs if missing. Safe prefill only.
 * Reads AXION_PROJECT_IDEA and AXION_PROJECT_NAME from env to generate
 * project-aware RPBS and REBS content.
 *
 * Usage:
 *   node axion/scripts/axion-seed.mjs --all
 *   node axion/scripts/axion-seed.mjs --module <name>
 *   node axion/scripts/axion-seed.mjs --all --json
 *   node axion/scripts/axion-seed.mjs --all --dry-run
 */

import fs from 'fs';
import path from 'path';
import {
  parseModuleArgs,
  ensurePrereqs,
  isStageDone,
  markStageDone,
  markStageFailed,
  failJson,
} from './_axion_module_mode.mjs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const jsonMode = args.includes('--json');
const { modules } = parseModuleArgs(process.argv);

const startTime = Date.now();

const receipt = {
  stage: 'seed',
  ok: true,
  modulesProcessed: [],
  createdFiles: [],
  skippedFiles: [],
  warnings: [],
  errors: [],
  elapsedMs: 0,
  dryRun,
};

function loadConfig() {
  const configPath = 'axion/config/domains.json';
  if (!fs.existsSync(configPath)) {
    throw new Error('axion/config/domains.json not found. Run axion:init first.');
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    receipt.skippedFiles.push(filePath);
    return false;
  }
  if (!dryRun) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
  }
  receipt.createdFiles.push(filePath);
  return true;
}

function emitOutput() {
  receipt.elapsedMs = Date.now() - startTime;

  if (jsonMode) {
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
    return;
  }

  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: axion:seed`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
  console.log(`Modules: ${receipt.modulesProcessed.join(', ') || '(none)'}`);
  console.log(`\nCreated (${receipt.createdFiles.length}):`);
  receipt.createdFiles.forEach(f => console.log(`  + ${f}`));
  console.log(`\nSkipped (${receipt.skippedFiles.length}):`);
  receipt.skippedFiles.forEach(f => console.log(`  - ${f}`));
  if (receipt.warnings.length) {
    console.log(`\nWarnings (${receipt.warnings.length}):`);
    receipt.warnings.forEach(w => console.log(`  ? ${w}`));
  }
  if (receipt.errors.length) {
    console.log(`\nErrors (${receipt.errors.length}):`);
    receipt.errors.forEach(e => console.log(`  ! ${e}`));
  }
  console.log(`\nResult: ${receipt.ok ? 'OK' : 'FAILED'}`);
  console.log('===================================');
}

function parseProjectIdea(idea) {
  if (!idea) return { name: 'Application', entities: [], features: [], actions: [] };

  const name = process.env.AXION_PROJECT_NAME || 'Application';

  const entityPatterns = [
    /\b(user|account|profile|member|person|customer|client|admin|owner)s?\b/gi,
    /\b(note|document|file|page|article|post|entry|record|item|task|todo)s?\b/gi,
    /\b(categor(?:y|ies)|tag|label|folder|group|collection|list|board)s?\b/gi,
    /\b(comment|reply|message|notification|alert|email)s?\b/gi,
    /\b(order|payment|invoice|subscription|cart|product|price)s?\b/gi,
    /\b(team|organization|workspace|project|channel|room)s?\b/gi,
    /\b(session|token|permission|role|setting|preference)s?\b/gi,
    /\b(image|photo|video|media|attachment|upload)s?\b/gi,
  ];

  const featurePatterns = [
    /\b(create|add|write|compose|draft|new)\b/gi,
    /\b(edit|update|modify|change|revise)\b/gi,
    /\b(delete|remove|archive|trash)\b/gi,
    /\b(search|find|filter|sort|browse|query)\b/gi,
    /\b(share|collaborate|invite|publish|export)\b/gi,
    /\b(login|signup|register|authenticate|authorize)\b/gi,
    /\b(save|store|persist|sync|backup)\b/gi,
    /\b(view|read|display|show|list|preview)\b/gi,
    /\b(organize|categorize|tag|label|group|folder)\b/gi,
    /\b(notify|alert|remind|schedule)\b/gi,
  ];

  const entitiesSet = new Set();
  const featuresSet = new Set();

  for (const pattern of entityPatterns) {
    const matches = idea.match(pattern);
    if (matches) {
      for (const m of matches) {
        let singular = m.replace(/ies$/i, 'y').replace(/s$/i, '');
        singular = singular.charAt(0).toUpperCase() + singular.slice(1).toLowerCase();
        entitiesSet.add(singular);
      }
    }
  }

  for (const pattern of featurePatterns) {
    const matches = idea.match(pattern);
    if (matches) {
      for (const m of matches) {
        featuresSet.add(m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
      }
    }
  }

  if (entitiesSet.size === 0) {
    const nameWords = name.replace(/[-_]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    for (const w of nameWords) {
      if (!['app', 'test', 'the', 'and', 'for', 'web', 'api'].includes(w.toLowerCase())) {
        entitiesSet.add(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      }
    }
    entitiesSet.add('User');
  }

  if (featuresSet.size === 0) {
    featuresSet.add('Create');
    featuresSet.add('Read');
    featuresSet.add('Update');
    featuresSet.add('Delete');
  }

  const entities = Array.from(entitiesSet);
  const features = Array.from(featuresSet);

  const actions = [];
  for (const f of features) {
    for (const e of entities.slice(0, 3)) {
      actions.push(`${f} ${e}`);
    }
  }

  return { name, entities, features, actions };
}

function generateRPBS(ctx, { isUpgrade, revision, upgradeNotes } = {}) {
  const ruleRows = [];
  let ruleId = 1;

  for (const entity of ctx.entities.slice(0, 5)) {
    ruleRows.push(`| R${String(ruleId++).padStart(3, '0')} | ${entity} must have a valid identifier | data | CRITICAL |`);
    ruleRows.push(`| R${String(ruleId++).padStart(3, '0')} | ${entity} data must pass validation before persistence | backend | HIGH |`);
  }

  if (ctx.entities.some(e => e.toLowerCase() === 'user')) {
    ruleRows.push(`| R${String(ruleId++).padStart(3, '0')} | User must authenticate before accessing protected resources | auth | CRITICAL |`);
    ruleRows.push(`| R${String(ruleId++).padStart(3, '0')} | User sessions expire after inactivity period | auth | HIGH |`);
  }

  ruleRows.push(`| R${String(ruleId++).padStart(3, '0')} | All API responses must include appropriate status codes | backend | HIGH |`);
  ruleRows.push(`| R${String(ruleId++).padStart(3, '0')} | Data modifications must be atomic and consistent | database | CRITICAL |`);

  const policyRows = [];
  let polId = 1;
  policyRows.push(`| P${String(polId++).padStart(3, '0')} | Input validation policy | All user inputs must be sanitized | backend |`);
  policyRows.push(`| P${String(polId++).padStart(3, '0')} | Error handling policy | Errors must be logged and user-friendly messages returned | backend |`);

  for (const entity of ctx.entities.slice(0, 3)) {
    policyRows.push(`| P${String(polId++).padStart(3, '0')} | ${entity} access policy | Only authorized users can modify ${entity.toLowerCase()} data | auth |`);
  }

  let upgradeSection = '';
  if (isUpgrade && upgradeNotes) {
    upgradeSection = `
## Upgrade Context (Revision ${revision})

This RPBS was seeded during an upgrade iteration. The following notes informed rule generation:

> ${upgradeNotes.replace(/\n/g, '\n> ')}

Rules above incorporate constraints from this upgrade cycle. Review and refine as needed.
`;
  }

  return `# Requirements & Policy Baseline Specification (RPBS)

## Overview
This document defines the hard rules and policies for ${ctx.name}.

## Product Name
${ctx.name}

## Hard Rules Catalog

| Rule ID | Description | Domain | Severity |
|---------|-------------|--------|----------|
${ruleRows.join('\n')}

## Policy Definitions

| Policy ID | Description | Default Value | Domain |
|-----------|-------------|---------------|--------|
${policyRows.join('\n')}
${upgradeSection}
## Open Questions
- Specific performance thresholds need to be defined
- Rate limiting policies need stakeholder input
- Data retention policies need to be established
`;
}

function generateREBS(ctx, { isUpgrade, revision, upgradeNotes } = {}) {
  const entityRows = [];
  const domainMap = {
    'User': { domain: 'auth', fields: 'id, email, name, role, createdAt' },
    'Account': { domain: 'auth', fields: 'id, userId, type, status, createdAt' },
    'Profile': { domain: 'auth', fields: 'id, userId, displayName, avatar, bio' },
    'Admin': { domain: 'auth', fields: 'id, userId, permissions, level' },
    'Note': { domain: 'data', fields: 'id, title, content, authorId, createdAt, updatedAt' },
    'Document': { domain: 'data', fields: 'id, title, content, authorId, createdAt, updatedAt' },
    'Page': { domain: 'data', fields: 'id, title, slug, content, authorId, status' },
    'Article': { domain: 'data', fields: 'id, title, body, authorId, publishedAt, status' },
    'Post': { domain: 'data', fields: 'id, title, body, authorId, createdAt, status' },
    'Task': { domain: 'data', fields: 'id, title, description, assigneeId, status, priority, dueDate' },
    'Todo': { domain: 'data', fields: 'id, title, completed, userId, createdAt' },
    'Item': { domain: 'data', fields: 'id, name, description, type, status, ownerId' },
    'Entry': { domain: 'data', fields: 'id, title, content, authorId, type, createdAt' },
    'Record': { domain: 'data', fields: 'id, type, data, createdBy, createdAt' },
    'Category': { domain: 'data', fields: 'id, name, slug, parentId, sortOrder' },
    'Tag': { domain: 'data', fields: 'id, name, slug, color' },
    'Label': { domain: 'data', fields: 'id, name, color, description' },
    'Folder': { domain: 'data', fields: 'id, name, parentId, ownerId, createdAt' },
    'Collection': { domain: 'data', fields: 'id, name, description, ownerId, isPublic' },
    'List': { domain: 'data', fields: 'id, name, ownerId, sortOrder, createdAt' },
    'Board': { domain: 'data', fields: 'id, name, description, ownerId, columns' },
    'Comment': { domain: 'data', fields: 'id, body, authorId, parentId, targetId, createdAt' },
    'Message': { domain: 'data', fields: 'id, content, senderId, recipientId, readAt' },
    'Notification': { domain: 'data', fields: 'id, type, message, userId, readAt, createdAt' },
    'Order': { domain: 'data', fields: 'id, userId, status, total, createdAt' },
    'Product': { domain: 'data', fields: 'id, name, description, price, stock, categoryId' },
    'Payment': { domain: 'data', fields: 'id, orderId, amount, method, status, processedAt' },
    'Team': { domain: 'data', fields: 'id, name, description, ownerId, createdAt' },
    'Project': { domain: 'data', fields: 'id, name, description, teamId, status, createdAt' },
    'Workspace': { domain: 'data', fields: 'id, name, ownerId, plan, createdAt' },
    'Session': { domain: 'auth', fields: 'id, userId, token, expiresAt, createdAt' },
    'Setting': { domain: 'data', fields: 'id, key, value, userId, scope' },
    'Image': { domain: 'data', fields: 'id, url, alt, uploaderId, size, mimeType' },
    'Attachment': { domain: 'data', fields: 'id, filename, url, size, mimeType, uploaderId' },
  };

  for (const entity of ctx.entities) {
    const info = domainMap[entity] || { domain: 'data', fields: `id, name, description, createdAt` };
    entityRows.push(`| ${entity} | Core ${entity.toLowerCase()} entity for the application | ${info.domain} | ${info.fields} |`);
  }

  const relationships = [];
  const hasUser = ctx.entities.some(e => e.toLowerCase() === 'user');
  for (const entity of ctx.entities) {
    if (entity.toLowerCase() !== 'user' && hasUser) {
      relationships.push(`- ${entity} belongs to User (via authorId/ownerId/userId)`);
    }
  }
  if (relationships.length === 0) {
    for (let i = 0; i < ctx.entities.length - 1; i++) {
      relationships.push(`- ${ctx.entities[i]} relates to ${ctx.entities[i + 1]}`);
    }
  }

  let upgradeSection = '';
  if (isUpgrade && upgradeNotes) {
    upgradeSection = `
## Upgrade Context (Revision ${revision})

This REBS was seeded during an upgrade iteration. The following notes informed entity generation:

> ${upgradeNotes.replace(/\n/g, '\n> ')}

Entity definitions above incorporate context from this upgrade cycle. Review and refine as needed.
`;
  }

  return `# Requirements & Entity Baseline Specification (REBS)

## Overview
This document defines the entities and their relationships for ${ctx.name}.

## Core Entities
${ctx.entities.join(', ')}

## Entity Definitions

| Entity | Description | Owner Domain | Key Fields |
|--------|-------------|--------------|------------|
${entityRows.join('\n')}

## Entity Relationships
${relationships.join('\n') || '- Entities are independent'}
${upgradeSection}
## Open Questions
- Entity lifecycle management needs further definition
- Cross-entity validation rules need to be specified
- Cascading delete behavior needs stakeholder input
`;
}

try {
  if (!jsonMode) console.log('Running axion:seed...');

  const config = loadConfig();
  const axionRoot = config.axion_root || 'axion';

  let projectIdea = process.env.AXION_PROJECT_IDEA || '';
  if (process.env.AXION_PROJECT_IDEA_FILE) {
    try { projectIdea = fs.readFileSync(process.env.AXION_PROJECT_IDEA_FILE, 'utf-8'); } catch {}
  }
  const ctx = parseProjectIdea(projectIdea);

  const revision = parseInt(process.env.AXION_REVISION || '1', 10);
  const upgradeNotes = process.env.AXION_UPGRADE_NOTES || '';
  const kitType = process.env.AXION_KIT_TYPE || 'original';
  const isUpgrade = kitType === 'upgrade' && !!upgradeNotes;

  if (isUpgrade && !jsonMode) {
    console.log(`  Upgrade mode: revision=${revision}, kitType=${kitType}`);
    console.log(`  Upgrade notes: ${upgradeNotes.slice(0, 100)}${upgradeNotes.length > 100 ? '...' : ''}`);
  }

  const upgradeCtx = { isUpgrade, revision, upgradeNotes };

  for (const module of modules) {
    if (!isStageDone('generate', module)) {
      const msg = `Module '${module}' has not completed 'generate'. Run: node axion/scripts/axion-generate.mjs --module ${module}`;
      receipt.errors.push(msg);
      receipt.ok = false;
      if (!dryRun) markStageFailed('seed', module, { reason: msg });
      continue;
    }

    try {
      ensurePrereqs({
        stageName: 'seed',
        module,
        stagePrereq: (m) => isStageDone('generate', m),
      });
    } catch (prereqErr) {
      receipt.errors.push(`Prerequisite failed for module '${module}': ${prereqErr.message}`);
      receipt.ok = false;
      if (!dryRun) markStageFailed('seed', module, { reason: prereqErr.message });
      continue;
    }

    if (!jsonMode) console.log(`Seeding module: ${module}`);
    receipt.modulesProcessed.push(module);

    if (module === 'architecture' || modules[0] === module) {
      const registryDocs = {
        [`${axionRoot}/docs/product/RPBS_Product.md`]: generateRPBS(ctx, upgradeCtx),
        [`${axionRoot}/docs/product/REBS_Product.md`]: generateREBS(ctx, upgradeCtx),
      };

      for (const [filePath, content] of Object.entries(registryDocs)) {
        ensureFile(filePath, content);
      }
    }

    if (!dryRun) {
      markStageDone('seed', module);
    }
  }

  emitOutput();

  if (!receipt.ok) process.exit(1);

} catch (error) {
  receipt.ok = false;
  receipt.errors.push(error.message);
  emitOutput();
  process.exit(1);
}
