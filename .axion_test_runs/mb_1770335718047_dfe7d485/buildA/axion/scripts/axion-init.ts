#!/usr/bin/env node
/**
 * AXION Init Script
 * 
 * Scaffolds a fresh AXION workspace or prepares an overhaul of an existing project.
 * 
 * Usage:
 *   node --import tsx axion/scripts/axion-init.ts --mode fresh [--target <path>]
 *   node --import tsx axion/scripts/axion-init.ts --mode overhaul [--archive-dir <path>] [--new-root <path>]
 * 
 * Modes:
 *   fresh    - Create a new AXION workspace from scratch
 *   overhaul - Archive existing repo and create a rebuild workspace
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const args = process.argv.slice(2);

interface InitOptions {
  mode: 'fresh' | 'overhaul';
  target: string;
  archiveDir?: string;
  newRoot?: string;
  force: boolean;
}

function parseArgs(): InitOptions {
  const options: InitOptions = {
    mode: 'fresh',
    target: process.cwd(),
    force: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--mode' && args[i + 1]) {
      const mode = args[++i];
      if (mode === 'fresh' || mode === 'overhaul') {
        options.mode = mode;
      }
    } else if (arg === '--target' && args[i + 1]) {
      options.target = args[++i];
    } else if (arg === '--archive-dir' && args[i + 1]) {
      options.archiveDir = args[++i];
    } else if (arg === '--new-root' && args[i + 1]) {
      options.newRoot = args[++i];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function printHelp(): void {
  console.log(`
AXION Init - Workspace Scaffolder

Usage:
  axion-init --mode fresh [--target <path>]
  axion-init --mode overhaul [--archive-dir <path>] [--new-root <path>]

Options:
  --mode <fresh|overhaul>   Mode of operation (default: fresh)
  --target <path>           Target directory for fresh workspace (default: cwd)
  --archive-dir <path>      Archive directory for overhaul (default: _axion_archive/<timestamp>)
  --new-root <path>         New workspace for overhaul (default: _axion_rebuild)
  --force                   Overwrite existing directories
  --help                    Show this help message

Examples:
  # Create fresh AXION workspace in current directory
  node --import tsx axion/scripts/axion-init.ts --mode fresh

  # Create AXION workspace in a new project folder
  node --import tsx axion/scripts/axion-init.ts --mode fresh --target ./my-project

  # Overhaul existing project
  node --import tsx axion/scripts/axion-init.ts --mode overhaul
`);
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeJson(filePath: string, data: any): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function readAttachmentsFolder(attachmentsPath: string): string {
  if (!fs.existsSync(attachmentsPath)) {
    return '';
  }
  
  const files = fs.readdirSync(attachmentsPath);
  const textExtensions = ['.txt', '.md', '.json', '.yaml', '.yml'];
  const contents: string[] = [];
  
  for (const file of files) {
    if (file === 'README.md' || file === 'README.txt') continue;
    
    const ext = path.extname(file).toLowerCase();
    if (textExtensions.includes(ext)) {
      const filePath = path.join(attachmentsPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.trim()) {
          contents.push(`--- ${file} ---\n${content}`);
        }
      }
    }
  }
  
  return contents.join('\n\n');
}

function createFreshWorkspace(target: string): void {
  console.log(`\n[AXION] Creating fresh workspace at: ${target}\n`);
  
  const axionRoot = path.join(target, 'axion');
  
  const directories = [
    'config',
    'domains',
    'templates',
    'registry',
    'source_docs/product',
    'source_docs/product/attachments',
    'source_docs/registry',
    'scripts',
    'docs',
  ];
  
  for (const dir of directories) {
    ensureDir(path.join(axionRoot, dir));
    console.log(`  [+] Created ${dir}/`);
  }
  
  const domainsConfig = {
    axion_root: 'axion',
    domains_dir: 'domains',
    templates_dir: 'templates',
    modules: [
      { name: 'Architecture', slug: 'architecture', prefix: 'arch', type: 'foundation', description: 'System architecture, patterns, and structural decisions', dependencies: [] },
      { name: 'Systems', slug: 'systems', prefix: 'sys', type: 'foundation', description: 'System components, services, and their interactions', dependencies: ['architecture'] },
      { name: 'Contracts', slug: 'contracts', prefix: 'contract', type: 'foundation', description: 'API contracts, interfaces, and data schemas', dependencies: ['architecture', 'systems'] },
      { name: 'Database', slug: 'database', prefix: 'db', type: 'data', description: 'Database schema, migrations, and data models', dependencies: ['contracts'] },
      { name: 'Backend', slug: 'backend', prefix: 'be', type: 'implementation', description: 'Server-side logic and API implementation', dependencies: ['contracts', 'database'] },
      { name: 'Frontend', slug: 'frontend', prefix: 'fe', type: 'implementation', description: 'Client-side UI and user experience', dependencies: ['contracts', 'state'] },
      { name: 'State', slug: 'state', prefix: 'state', type: 'implementation', description: 'Client state management and data flow', dependencies: ['contracts'] },
      { name: 'Auth', slug: 'auth', prefix: 'auth', type: 'security', description: 'Authentication and authorization', dependencies: ['contracts'] },
      { name: 'Testing', slug: 'testing', prefix: 'test', type: 'quality', description: 'Test strategy and coverage', dependencies: ['contracts', 'backend', 'frontend'] },
    ],
    canonical_order: ['architecture', 'systems', 'contracts', 'database', 'auth', 'backend', 'state', 'frontend', 'testing'],
    stages: ['generate', 'seed', 'draft', 'review', 'verify', 'lock'],
  };
  
  writeJson(path.join(axionRoot, 'config', 'domains.json'), domainsConfig);
  console.log('  [+] Created config/domains.json');
  
  const presetsConfig = {
    version: '1.0',
    stage_plans: {
      scaffold: ['generate', 'seed'],
      docs: ['draft', 'review', 'verify'],
      full: ['generate', 'seed', 'draft', 'review', 'verify'],
      release: ['verify', 'lock'],
    },
    presets: {
      system: {
        label: 'Entire System',
        description: 'All modules (full AXION system).',
        modules: domainsConfig.canonical_order,
        include_dependencies: false,
        guards: { lock_requires_verify_pass: true },
      },
      foundation: {
        label: 'Foundation Layer',
        description: 'Architecture, systems, and contracts.',
        modules: ['architecture', 'systems', 'contracts'],
        include_dependencies: true,
      },
      'backend-api': {
        label: 'Backend API',
        description: 'Backend implementation with data layer.',
        modules: ['backend', 'database'],
        include_dependencies: true,
      },
      web: {
        label: 'Web Frontend',
        description: 'Frontend and state management.',
        modules: ['frontend', 'state'],
        include_dependencies: true,
      },
    },
  };
  
  writeJson(path.join(axionRoot, 'config', 'presets.json'), presetsConfig);
  console.log('  [+] Created config/presets.json');
  
  const rpbsTemplate = `<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:core -->
<!-- AXION:PREFIX:rpbs -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# RPBS: Requirements and Product Boundaries Specification

> **Purpose:** Define what the product IS and IS NOT. This is the single source of truth for product scope.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- If upstream meaning is missing, write \`UNKNOWN\` and add it to **Open Questions**.
- If non-applicable, write \`N/A — <reason>\` (never leave blank).

## 1. Product Vision

[TBD] - One paragraph describing the core value proposition.

## 2. Target Users

[TBD] - Define primary and secondary user personas.

## 3. Core Features (MVP)

[TBD] - List essential features for minimum viable product.

## 4. Product Boundaries

### 4.1 In Scope
[TBD] - Features explicitly included.

### 4.2 Out of Scope
[TBD] - Features explicitly excluded.

## 5. Success Metrics

[TBD] - Define measurable success criteria.

## ACCEPTANCE
- [ ] All [TBD] placeholders populated
- [ ] Product vision clearly defined
- [ ] User personas documented
- [ ] Core features prioritized
- [ ] Boundaries explicitly stated

## OPEN_QUESTIONS
- [TBD] - List unresolved product questions
`;
  
  writeFile(path.join(axionRoot, 'source_docs', 'product', 'RPBS_Product.md'), rpbsTemplate);
  console.log('  [+] Created source_docs/product/RPBS_Product.md');
  
  const attachmentsReadme = `# Attachments Folder

This folder stores **user input documents** for the AXION documentation pipeline.

## For IDE-Only Users (No Web App)

If you're using AXION directly from your IDE, this is where you provide your project information:

1. **Start with \`START_HERE.txt\`** - Open this file and paste your project idea, requirements, or any existing documentation
2. **Add supporting files** - Drop any additional materials here:
   - Existing specifications
   - Reference materials
   - Design mockups or wireframes
   - API documentation
   - Database schemas

## How AXION Uses These Files

The AXION pipeline reads ALL files from this folder during the \`generate\` stage and saves the combined content to \`registry/attachments_content.md\`. This content is then available during the \`draft\` stage to populate your documentation. The more detail you provide, the better your Agent Kit will be.

## File Types Supported

- \`.txt\` - Plain text (recommended - editable in Replit)
- \`.md\` - Markdown (read-only preview in Replit)
- \`.json\` - Structured data
- \`.yaml\` / \`.yml\` - Configuration

## Next Steps

After adding your input files, run:
\`\`\`bash
node --import tsx axion/scripts/axion-generate.ts --all
\`\`\`
`;
  
  writeFile(path.join(axionRoot, 'source_docs', 'product', 'attachments', 'README.md'), attachmentsReadme);
  console.log('  [+] Created source_docs/product/attachments/README.md');
  
  const startHereTemplate = `# START HERE

> Paste your project idea, requirements, or existing documentation below.
> Delete these instructions when you're ready.

---

## What are you building?

[Describe your idea in plain language. What problem does it solve?]

## Who is it for?

[Describe your target users or audience]

## Core Features

List the main things users should be able to do:

- [ ] Feature 1: [Description]
- [ ] Feature 2: [Description]
- [ ] Feature 3: [Description]

## User Flows (Optional)

Describe how users will interact with your app:

1. User does X...
2. Then Y happens...
3. Result is Z...

## Technical Preferences (Optional)

If you have specific technology preferences, note them here:

- Frontend: [React, Vue, Svelte, etc.]
- Backend: [Node.js, Python, Go, etc.]
- Database: [PostgreSQL, MongoDB, SQLite, etc.]
- Auth: [Email/password, OAuth, magic links, etc.]

## Non-Functional Requirements (Optional)

- Performance: [Expected load, response times]
- Security: [Compliance needs, data sensitivity]
- Scale: [Expected users, growth]

## Existing Materials

If you have existing docs, paste relevant sections below or add files to this folder:

---

[Paste content here]

---

## Open Questions

Things you're not sure about yet:

- Q1: [Question]
- Q2: [Question]

---

> Next Step: Run \`node --import tsx axion/scripts/axion-generate.ts --all\` to start the AXION pipeline.
`;
  
  writeFile(path.join(axionRoot, 'source_docs', 'product', 'attachments', 'START_HERE.txt'), startHereTemplate);
  console.log('  [+] Created source_docs/product/attachments/START_HERE.txt');
  
  const rebsTemplate = `<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:core -->
<!-- AXION:PREFIX:rebs -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# REBS: Requirements and Engineering Boundaries Specification

> **Purpose:** Define the technical constraints, stack choices, and engineering boundaries.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- If upstream meaning is missing, write \`UNKNOWN\` and add it to **Open Questions**.
- If non-applicable, write \`N/A — <reason>\` (never leave blank).

## 1. Tech Stack Selection

### Frontend
- Framework: [TBD]
- Language: [TBD]
- Styling: [TBD]

### Backend
- Runtime: [TBD]
- Language: [TBD]
- API Style: [TBD]

### Database
- Engine: [TBD]
- ORM: [TBD]

### Deployment
- Platform: [TBD]
- CI/CD: [TBD]

### Rationale
[TBD] - Why these choices?

## 2. Architecture Pattern

[TBD] - Monolith, microservices, serverless, etc.

## 3. Engineering Constraints

### 3.1 Performance Requirements
[TBD] - Define performance targets.

### 3.2 Scalability Requirements
[TBD] - Define scaling expectations.

### 3.3 Security Requirements
[TBD] - Define security baseline.

## 4. Integration Points

[TBD] - List external system dependencies (APIs, services, etc.).

## 5. Development Standards

[TBD] - Define coding standards and practices.

## ACCEPTANCE
- [ ] All [TBD] placeholders populated
- [ ] Tech stack justified
- [ ] Architecture pattern selected
- [ ] Constraints documented
- [ ] Integration points identified

## OPEN_QUESTIONS
- [TBD] - List unresolved engineering questions
`;
  
  writeFile(path.join(axionRoot, 'source_docs', 'product', 'REBS_Product.md'), rebsTemplate);
  console.log('  [+] Created source_docs/product/REBS_Product.md');
  
  const minimalTemplate = `<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:{{SLUG}} -->
<!-- AXION:PREFIX:{{PREFIX}} -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->

# {{MODULE_NAME}} — AXION Module Template

**Module slug:** \`{{SLUG}}\`  
**Prefix:** \`{{PREFIX}}\`  
**Description:** {{DESCRIPTION}}

> Blank-state scaffold. Populate during AXION stages.

## 0) Agent Rules (do not delete)
- Populate every section. Do not add new top-level sections.
- If upstream meaning is missing, write \`UNKNOWN\` and add it to **Open Questions**.
- If non-applicable, write \`N/A — <reason>\` (never leave blank).

## Scope & Ownership
- Owns: [TBD]
- Does NOT own: [TBD]
- Interfaces with: [TBD]

## Key Decisions
[TBD] - Document major architectural/design decisions.

## Implementation Notes
[TBD] - Implementation guidance and constraints.

## ACCEPTANCE
- [ ] All [TBD] placeholders populated
- [ ] Scope clearly defined
- [ ] Key decisions documented

## OPEN_QUESTIONS
- [TBD] - List unresolved questions
`;
  
  writeFile(path.join(axionRoot, 'templates', '_minimal.template.md'), minimalTemplate);
  console.log('  [+] Created templates/_minimal.template.md');
  
  const registryInit = {
    version: '1.0.0',
    markers: {},
  };
  writeJson(path.join(axionRoot, 'registry', 'stage_markers.json'), registryInit);
  console.log('  [+] Created registry/stage_markers.json');
  
  const quickstart = `# AXION Quickstart

## What is AXION?

AXION is a documentation-first development system that generates comprehensive "Agent Kits" for AI-guided software development. It enforces a strict pipeline: **init → generate → seed → draft → review → verify → lock**.

## Getting Started

### 1. Initialize (you just did this!)

Your workspace is ready with:
- \`source_docs/product/attachments/START_HERE.txt\` - **Start here!** Paste your project idea
- \`source_docs/product/attachments/\` - Drop any additional docs here
- \`source_docs/product/RPBS_Product.md\` - Product requirements (auto-populated from attachments)
- \`source_docs/product/REBS_Product.md\` - Engineering requirements
- \`config/domains.json\` - Module definitions
- \`config/presets.json\` - Pipeline presets

### 2. Provide Your Project Input

**Option A: Quick Start (Recommended)**

1. Open \`source_docs/product/attachments/START_HERE.txt\`
2. Paste your project idea, requirements, or any existing docs
3. Add any additional files to the \`attachments/\` folder
4. Run the pipeline - AXION reads ALL files in attachments/

**Option B: Direct Edit**

Edit the source documents directly:

1. **RPBS_Product.md** - Define what you're building:
   - Product vision
   - Target users
   - Core features (MVP)
   - What's in/out of scope

2. **REBS_Product.md** - Define how you'll build it:
   - Tech stack choices
   - Architecture pattern
   - Engineering constraints
   - Integration points

### 3. Run the Pipeline

\`\`\`bash
# Generate all module docs from templates
node --import tsx axion/scripts/axion-generate.ts --all

# Seed placeholders with content stubs
node --import tsx axion/scripts/axion-seed.ts --all

# Draft: populate with real content
node --import tsx axion/scripts/axion-draft.ts --all

# Review: check for completeness
node --import tsx axion/scripts/axion-review.ts --all

# Verify: validate against rules
node --import tsx axion/scripts/axion-verify.ts --all

# Lock: finalize and generate ERC
node --import tsx axion/scripts/axion-lock.ts --all
\`\`\`

Or use presets for a guided flow:

\`\`\`bash
# Run full pipeline on foundation modules
node --import tsx axion/scripts/axion-run.ts --preset foundation --plan full

# Check status
node --import tsx axion/scripts/axion-status.ts

# See what to do next
node --import tsx axion/scripts/axion-next.ts
\`\`\`

### 4. Check Your Progress

\`\`\`bash
# View current status
node --import tsx axion/scripts/axion-status.ts

# Get next steps
node --import tsx axion/scripts/axion-next.ts
\`\`\`

## Pipeline Stages

| Stage | Purpose |
|-------|---------|
| **generate** | Create module docs from templates |
| **seed** | Add placeholder content structure |
| **draft** | Fill in actual content |
| **review** | Check completeness, count UNKNOWNs |
| **verify** | Validate rules, seams, cross-refs |
| **lock** | Finalize and generate execution-ready content |

## Presets

Use presets to run the pipeline on logical module groups:

- \`foundation\` - Architecture, systems, contracts
- \`backend-api\` - Backend + database
- \`web\` - Frontend + state
- \`system\` - Everything

## Tips

1. **Start small** - Begin with \`foundation\` preset
2. **Check status often** - Use \`axion-status.ts\`
3. **Fix issues early** - Don't skip verify failures
4. **Iterate** - Pipeline is designed for incremental progress

## Files You'll Create

After running the pipeline, you'll have:

\`\`\`
axion/
├── domains/           # Generated module docs
│   ├── architecture/
│   ├── contracts/
│   └── ...
├── registry/          # Pipeline state
│   ├── stage_markers.json
│   └── verify_report.json
└── source_docs/       # Your inputs
    └── product/
        ├── RPBS_Product.md
        └── REBS_Product.md
\`\`\`

## Need Help?

- Run \`axion-next.ts\` to see what to do
- Check \`verify_report.json\` for issues
- Review \`stage_markers.json\` for progress
`;
  
  writeFile(path.join(axionRoot, 'QUICKSTART.md'), quickstart);
  console.log('  [+] Created QUICKSTART.md');
  
  console.log('\n[AXION] Workspace initialized successfully!\n');
  console.log('Next steps:');
  console.log('  1. Open axion/source_docs/product/attachments/START_HERE.txt');
  console.log('  2. Paste your project idea, requirements, or any existing docs');
  console.log('  3. Run: node --import tsx axion/scripts/axion-generate.ts --all\n');
  console.log('See axion/QUICKSTART.md for detailed instructions.\n');
  
  const result = {
    status: 'SUCCESS',
    mode: 'fresh',
    workspace: axionRoot,
    created: [
      'config/domains.json',
      'config/presets.json',
      'source_docs/product/attachments/README.md',
      'source_docs/product/attachments/START_HERE.txt',
      'source_docs/product/RPBS_Product.md',
      'source_docs/product/REBS_Product.md',
      'templates/_minimal.template.md',
      'registry/stage_markers.json',
      'QUICKSTART.md',
    ],
    next_commands: [
      `edit ${path.join(axionRoot, 'source_docs', 'product', 'attachments', 'START_HERE.txt')}`,
      'node --import tsx axion/scripts/axion-generate.ts --all',
    ],
  };
  
  console.log(JSON.stringify(result, null, 2));
}

function main(): void {
  const options = parseArgs();
  
  if (options.mode === 'fresh') {
    createFreshWorkspace(options.target);
  } else if (options.mode === 'overhaul') {
    console.log('[INFO] Overhaul mode - use axion-overhaul.ts for full archive functionality');
    console.log('       Run: node --import tsx axion/scripts/axion-overhaul.ts --help');
    process.exit(0);
  }
}

main();
