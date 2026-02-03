#!/usr/bin/env node
/**
 * AXION Test Fixtures Setup
 * 
 * Copies real templates to the fixture workspace for testing.
 * Run this after adding new templates to keep fixtures in sync.
 * 
 * Usage:
 *   npx ts-node axion/tests/fixtures/setup-fixtures.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const AXION_ROOT = path.join(__dirname, '..', '..', '..');
const SOURCE_TEMPLATES = path.join(AXION_ROOT, 'axion', 'templates');
const FIXTURE_TEMPLATES = path.join(__dirname, 'workspace', 'templates');

const MODULES = [
  'architecture', 'systems', 'contracts', 'database', 'data', 'auth',
  'backend', 'integrations', 'state', 'frontend', 'fullstack', 'testing',
  'quality', 'security', 'devops', 'cloud', 'devex', 'mobile', 'desktop'
];

function copyMinimalTemplate(): void {
  const minimalTemplate = `<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:{{SLUG}} -->
<!-- AXION:PREFIX:{{PREFIX}} -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# {{MODULE_NAME}} Module Documentation

**Module slug:** \`{{SLUG}}\`  
**Prefix:** \`{{PREFIX}}\`

> Blank-state scaffold. Populate during AXION stages.

## Metadata
- Version: 0.1.0
- Status: DRAFT
- Last Updated: [TBD]
- Module: {{SLUG}}

## 1. Scope and Ownership

[TBD] - Define module scope and ownership.

## 2. Interfaces and Dependencies

### 2.1 Dependencies
[TBD] - List module dependencies.

### 2.2 Exports
[TBD] - List module exports.

## 3. Implementation Details

[TBD] - Describe implementation approach.

## 4. Agent Rules

1. [TBD] - Define agent constraints.
2. [TBD] - Define agent behaviors.

## ACCEPTANCE
- [ ] All [TBD] placeholders populated
- [ ] Scope clearly defined
- [ ] Dependencies documented
- [ ] Agent rules established

## OPEN_QUESTIONS
- [TBD] - List unresolved questions
`;

  const minimalPath = path.join(FIXTURE_TEMPLATES, '_minimal.template.md');
  fs.writeFileSync(minimalPath, minimalTemplate);
  console.log('[DONE] Created _minimal.template.md');
}

function main(): void {
  console.log('\n[AXION] Setting up test fixtures\n');
  
  if (!fs.existsSync(FIXTURE_TEMPLATES)) {
    fs.mkdirSync(FIXTURE_TEMPLATES, { recursive: true });
  }
  
  copyMinimalTemplate();
  
  for (const mod of MODULES) {
    const sourceDir = path.join(SOURCE_TEMPLATES, mod);
    const destDir = path.join(FIXTURE_TEMPLATES, mod);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const sourceTemplate = path.join(sourceDir, 'README.template.md');
    const destTemplate = path.join(destDir, 'README.template.md');
    
    if (fs.existsSync(sourceTemplate)) {
      fs.copyFileSync(sourceTemplate, destTemplate);
      console.log(`[DONE] Copied ${mod}/README.template.md`);
    } else {
      console.log(`[SKIP] ${mod}/README.template.md not found, will use _minimal`);
    }
  }
  
  console.log('\n[COMPLETE] Fixtures ready\n');
}

main();
