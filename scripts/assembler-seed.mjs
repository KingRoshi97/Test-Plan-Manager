#!/usr/bin/env node
/**
 * roshi:seed - Seed starter scaffolding
 * Creates baseline registry docs if missing. Safe prefill only.
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

function loadTargetOutline() {
  const outlinePath = 'docs/inputs/TARGET_OUTLINE.md';
  if (fs.existsSync(outlinePath)) {
    return fs.readFileSync(outlinePath, 'utf8');
  }
  return null;
}

function printReport() {
  console.log('\n========== ASSEMBLER_REPORT ==========');
  console.log(`Script: roshi:seed`);
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
  console.log('Running roshi:seed...');
  
  const config = loadDomainsConfig();
  const roshiRoot = config.roshi_root;
  
  // Validate domain argument if provided
  if (domainArg) {
    const validDomain = config.domains.find(d => d.slug === domainArg);
    if (!validDomain) {
      throw new Error(`Domain "${domainArg}" not found in assembler/domains.json`);
    }
  }
  
  // Load target outline for PROJECT_OVERVIEW
  const targetOutline = loadTargetOutline();
  
  // Seed baseline registry docs
  const registryDocs = {
    [`${roshiRoot}/00_product/RPBS_Product.md`]: `# Requirements & Policy Baseline Specification (RPBS)

## Overview
This document defines the hard rules and policies for the product.

## Product Name
${targetOutline ? 'Roshi Studio' : 'UNKNOWN'}

## Hard Rules Catalog
<!-- Define immutable business rules here -->

| Rule ID | Description | Domain | Severity |
|---------|-------------|--------|----------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Policy Definitions
<!-- Define configurable policies here -->

| Policy ID | Description | Default Value | Domain |
|-----------|-------------|---------------|--------|
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Open Questions
- UNKNOWN
`,

    [`${roshiRoot}/00_product/REBS_Product.md`]: `# Requirements & Entity Baseline Specification (REBS)

## Overview
This document defines the entities and their relationships for the product.

## Core Entities
${targetOutline ? `Based on TARGET_OUTLINE.md:
- User
- Project
- Run (pipeline run)
- DomainPack (generated docs per domain)
- Artifact (files created/modified)
- VerifyResult (gates + failures)
- ERC (execution readiness contract)
- Bundle (zip handoff)
- TemplatePack (versioned templates)
- SourceRef (citations / known inputs)` : 'UNKNOWN'}

## Entity Definitions

| Entity | Description | Owner Domain | Key Fields |
|--------|-------------|--------------|------------|
| User | System user | platform | id, name, email |
| Project | User project | platform | id, name, userId |
| Run | Pipeline execution | api | id, projectId, status, createdAt |
| DomainPack | Generated docs per domain | api | id, runId, domainSlug |
| Artifact | Files created/modified | api | id, runId, path, type |
| VerifyResult | Verification gates + failures | api | id, runId, passed, failures |
| ERC | Execution readiness contract | api | id, domainSlug, version, locked |
| Bundle | Zip handoff package | api | id, runId, path, createdAt |
| TemplatePack | Versioned templates | platform | id, version, templates |
| SourceRef | Citations / known inputs | platform | id, source, path |

## Entity Relationships
<!-- Define relationships between entities -->
- User has many Projects
- Project has many Runs
- Run has many DomainPacks, Artifacts, VerifyResults
- Run produces one Bundle

## Open Questions
- UNKNOWN
`,

    [`${roshiRoot}/00_registry/domain-map.md`]: `# Domain Map

## Overview
This document maps all domains in the system and their responsibilities.

## Domains

| Domain | Slug | Prefix | Type | Description |
|--------|------|--------|------|-------------|
| Platform | platform | platform | business | Core platform services |
| API | api | api | business | API service layer |
| Web | web | web | business | Web frontend |
| Infrastructure | infra | infra | crosscutting | Infrastructure concerns |
| Security | security | security | crosscutting | Security concerns |

## Domain Boundaries

### Platform
- **Owns:** User, Project, TemplatePack, SourceRef
- **Responsibilities:** User management, project management, template versioning

### API
- **Owns:** Run, DomainPack, Artifact, VerifyResult, ERC, Bundle
- **Responsibilities:** Pipeline execution, artifact generation, verification

### Web
- **Owns:** UI components, views
- **Responsibilities:** User interface, user experience

### Infrastructure
- **Owns:** Storage, deployment
- **Responsibilities:** File storage, deployment infrastructure

### Security
- **Owns:** Authentication, authorization
- **Responsibilities:** Access control, security policies

## Open Questions
- UNKNOWN
`,

    [`${roshiRoot}/00_registry/action-vocabulary.md`]: `# Action Vocabulary

## Overview
This document defines the standard action prefixes and verbs used across domains.

## Action Prefixes by Domain

| Domain | Prefix | Example Actions |
|--------|--------|-----------------|
| platform | platform: | platform:createUser, platform:getProject |
| api | api: | api:createRun, api:generateBundle |
| web | web: | web:renderView, web:handleClick |
| infra | infra: | infra:storeFile, infra:deploy |
| security | security: | security:authenticate, security:authorize |

## Standard Verbs

| Verb | Description | Example |
|------|-------------|---------|
| create | Create a new resource | platform:createUser |
| get | Retrieve a resource | platform:getProject |
| update | Modify a resource | api:updateRun |
| delete | Remove a resource | platform:deleteProject |
| list | List resources | api:listRuns |
| verify | Verify/validate | api:verifyDomain |
| lock | Lock a resource | api:lockDomain |
| generate | Generate output | api:generateBundle |

## Open Questions
- UNKNOWN
`,

    [`${roshiRoot}/00_registry/reason-codes.md`]: `# Reason Codes

## Overview
This document defines all reason codes used for errors, warnings, and informational messages.

## Code Format
Format: \`{DOMAIN}_{CATEGORY}_{CODE}\`

## Reason Codes

### Platform Domain

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| PLATFORM_AUTH_001 | User not authenticated | ERROR | User must be authenticated |
| PLATFORM_AUTH_002 | Session expired | ERROR | User session has expired |
| PLATFORM_USER_001 | User not found | ERROR | Requested user does not exist |
| PLATFORM_PROJECT_001 | Project not found | ERROR | Requested project does not exist |

### API Domain

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| API_RUN_001 | Run not found | ERROR | Requested run does not exist |
| API_RUN_002 | Run in progress | INFO | Run is currently executing |
| API_RUN_003 | Run failed | ERROR | Run execution failed |
| API_VERIFY_001 | Verification failed | ERROR | Domain verification failed |
| API_LOCK_001 | Cannot lock - UNKNOWNs exist | ERROR | Domain has unresolved UNKNOWNs |
| API_BUNDLE_001 | Bundle generation failed | ERROR | Failed to generate bundle |

### Security Domain

| Code | Message | Severity | Description |
|------|---------|----------|-------------|
| SECURITY_ACCESS_001 | Access denied | ERROR | User lacks required permissions |
| SECURITY_TOKEN_001 | Invalid token | ERROR | Authentication token is invalid |

## Open Questions
- UNKNOWN
`,

    [`${roshiRoot}/00_registry/glossary.md`]: `# Glossary

## Overview
This document defines key terms used throughout the Roshi system.

## Terms

| Term | Definition |
|------|------------|
| BELS | Business Entity Logic Specification - defines business rules and state machines |
| DIM | Domain Interface Map - defines interfaces between domains |
| DDES | Domain Design & Entity Specification - defines domain entities |
| ERC | Execution Readiness Contract - locked specification for implementation |
| RPBS | Requirements & Policy Baseline Specification - product-level rules |
| REBS | Requirements & Entity Baseline Specification - product-level entities |
| SourceRef | Citation to an authoritative source document |
| Domain Pack | Set of generated documentation for a single domain |
| UNKNOWN | Placeholder for missing information that needs resolution |
| Open Questions | List of unresolved questions requiring answers |
| Pipeline | Sequence of roshi commands: init, gen, seed, draft, review, verify, lock |
| Bundle | Zip file containing all generated artifacts for handoff |
| Vibecoding Agent | AI agent that consumes Roshi bundles to implement code |

## Open Questions
- UNKNOWN
`,

    [`${roshiRoot}/00_product/PROJECT_OVERVIEW.md`]: targetOutline 
      ? `# Project Overview — Roshi Studio

## Goal
Build "Roshi Studio": a web app + API that runs the Roshi pipeline using an NPM package.
User pastes an idea + minimal context, clicks Generate, and receives a downloadable "Agent Handoff Bundle" (zip) containing Roshi docs + manifests + exports that can be uploaded to a vibecoding agent.

## Product Shape
- NPM engine: @assembler/core (pure logic)
- API service: runs @assembler/core, produces runs + artifacts + bundle zip
- Web app: UI to create runs, view status, download zip, copy agent prompt

## Platforms
- Web (React/Next.js or similar)
- API (Node/Express)
- Storage (local filesystem for this test; later S3-compatible)

## Key Flows
1. Create Run: submit idea + preset -> returns runId
2. Pipeline: init/gen/seed/draft/review/verify/lock (docs-first)
3. Package: create bundle zip containing workspace + handoff manifest + agent prompt + exports
4. Download: user downloads bundle zip
5. Agent Execution: user uploads zip to vibecoding agent, runs commands in manifest

## Core Objects (canonical)
- User
- Project
- Run (pipeline run)
- DomainPack (generated docs per domain)
- Artifact (files created/modified)
- VerifyResult (gates + failures)
- ERC (execution readiness contract)
- Bundle (zip handoff)
- TemplatePack (versioned templates)
- SourceRef (citations / known inputs)

## Constraints (discipline)
- No invention: missing info must become UNKNOWN + logged to Open Questions
- No overwrite: scripts skip if file exists unless explicitly allowed by spec
- Verify before lock
- Always print ASSEMBLER_REPORT after every script run

## Source
Extracted from: docs/inputs/TARGET_OUTLINE.md

## Open Questions
- Specific authentication mechanism: UNKNOWN
- Production storage backend details: UNKNOWN
- Template versioning strategy: UNKNOWN
`
      : `# Project Overview

## Goal
UNKNOWN - TARGET_OUTLINE.md not found

## Product Shape
UNKNOWN

## Platforms
UNKNOWN

## Key Flows
UNKNOWN

## Core Objects
UNKNOWN

## Constraints
UNKNOWN

## Open Questions
- TARGET_OUTLINE.md is missing - please create it
`
  };
  
  for (const [filePath, content] of Object.entries(registryDocs)) {
    ensureFile(filePath, content);
  }
  
  printReport();
  
} catch (error) {
  report.failed.push(error.message);
  printReport();
  process.exit(1);
}
