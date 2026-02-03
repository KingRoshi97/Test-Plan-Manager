# AXION — Documentation Generation System

AXION is a docs-first documentation generation pipeline that produces comprehensive "Agent Kits" for software projects. It enforces a strict sequential process (the ROSHI flow) to ensure consistency, traceability, and completeness.

## Core Philosophy

### The Three-Folder System

AXION separates concerns into three distinct areas:

```
axion/source_docs/
├── product/              # INPUT: User's project-specific content (RPBS, REBS)
│                         # The "spark" that drives all downstream generation
├── registry/             # GUARDRAILS: Standards that prevent agent drift
│                         # Glossary, reason codes, action vocabulary
└── ...

axion/templates/          # BLUEPRINTS: Reusable document structures
                          # Copied and populated into domain folders

axion/domains/<module>/   # OUTPUT: Filled-in docs ready for agent coding
```

### The ROSHI Sequential Flow

Each document feeds the next to maintain continuity and prevent drift:

```
RPBS (Product Truth)
  ↓
REBS (Engineering Philosophy)
  ↓
DDES (Domain Design & Entity Structure)
  ↓
UX_Foundations (User Mental Model)
  ↓
UI_Constraints (Structural UI Rules)
  ↓
───────── POINT OF NO RETURN ─────────
  ↓
ALRP (Agent Logic & Reasoning Protocol)
  ↓
ERC (Execution Ready Contract)
  ↓
TIES (Technical Implementation Standards) ← BUILD PHASE
  ↓
SROL (System Refinement & Optimization Log) ← POST-BUILD
```

**Key principle:** You cannot skip steps. DDES requires RPBS/REBS. ERC requires everything above it.

## How It Works

### The Pipeline

AXION operates through a 6-stage pipeline:

```
init → generate → seed → draft → review → verify → lock
```

| Stage | What It Does |
|-------|--------------|
| **init** | Creates workspace and config files |
| **generate** | Creates module folders and copies doc templates |
| **seed** | Populates baseline scaffolding with neutral placeholders |
| **draft** | AI agent fills templates with content from RPBS/REBS |
| **review** | Validates docs, counts UNKNOWNs, checks cross-references |
| **verify** | Final gate check — blocks lock if critical issues remain |
| **lock** | Freezes module, generates ERC (Execution Readiness Contract) |

### The 19 Modules

Documentation is organized into 19 modules with dependency tracking:

| Category | Modules |
|----------|---------|
| **Foundation** | architecture, systems, contracts |
| **Data** | database, data |
| **Security** | auth, security |
| **Core Backend** | backend, integrations |
| **Core Frontend** | state, frontend |
| **Integration** | fullstack |
| **Quality** | testing, quality |
| **Operations** | devops, cloud, devex |
| **Platform** | mobile, desktop |

Modules have **dependencies**. For example, `frontend` depends on `state` and `backend`.

### Module Mode

Every pipeline script supports module-by-module execution:

```bash
# Process single module
node axion/scripts/axion-generate.mjs --module frontend

# Process all modules in dependency order
node axion/scripts/axion-generate.mjs --all
```

If prerequisites aren't met, the script outputs a `blocked_by` JSON:

```json
{
  "status": "blocked_by",
  "stage": "seed",
  "module": "frontend",
  "missing": ["state", "backend"],
  "hint": ["run: node axion/scripts/axion-seed.mjs --module state"]
}
```

## Directory Structure

```
axion/
├── config/
│   ├── domains.json          # Module definitions (name, slug, prefix, type)
│   └── sources.json          # Source document paths
│
├── source_docs/
│   ├── product/              # User input: RPBS, REBS (the project brain)
│   │   ├── RPBS_Product.md   # Product Requirements Brief
│   │   └── REBS_Product.md   # Engineering Requirements Brief
│   └── registry/             # Cross-cutting standards
│       ├── glossary.md       # Term definitions
│       ├── reason-codes.md   # Decision justification codes
│       └── stage_markers/    # Pipeline progress tracking
│
├── templates/                # Document templates (29 total)
│   ├── core/                 # ROSHI flow templates (7)
│   │   ├── DDES.template.md
│   │   ├── UX_Foundations.template.md
│   │   ├── UI_Constraints.template.md
│   │   ├── ALRP.template.md
│   │   ├── ERC.template.md
│   │   ├── TIES.template.md
│   │   └── SROL.template.md
│   │
│   │   # 19 Module templates (each has README.template.md)
│   ├── architecture/         # Foundation: arch prefix
│   ├── systems/              # Foundation: sys prefix
│   ├── contracts/            # Foundation: contract prefix
│   ├── database/             # Data: db prefix
│   ├── data/                 # Data: data prefix
│   ├── auth/                 # Security: auth prefix
│   ├── backend/              # Core: be prefix
│   ├── integrations/         # Core: integ prefix
│   ├── state/                # Frontend: state prefix
│   ├── frontend/             # Frontend: fe prefix
│   ├── fullstack/            # Integration: fs prefix
│   ├── testing/              # Quality: test prefix
│   ├── quality/              # Quality: qa prefix
│   ├── security/             # Crosscutting: sec prefix
│   ├── devops/               # Operations: devops prefix
│   ├── cloud/                # Operations: cloud prefix
│   ├── devex/                # Operations: dx prefix
│   ├── mobile/               # Platform: mobile prefix
│   ├── desktop/              # Platform: desktop prefix
│   │
│   │   # 3 Extended templates
│   ├── governance/           # Process & governance
│   ├── specialized/          # Game, embedded, blockchain, AR/VR
│   └── platform/             # Internal developer platform
│
├── domains/                  # Generated output: one folder per module
│   └── <module>/             # Contains populated docs for that module
│
├── scripts/                  # Pipeline automation
│   ├── axion-generate.mjs
│   ├── axion-seed.mjs
│   ├── axion-draft.mjs
│   ├── axion-review.mjs
│   ├── axion-verify.mjs
│   ├── axion-lock.mjs
│   └── _axion_module_mode.mjs  # Shared module/prereq helpers
│
└── docs/                     # This documentation folder
```

## Template Contract System

### Template Structure

Each module folder contains one canonical template: `README.template.md`

Templates use a contract header for verification:

```markdown
<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:frontend -->
<!-- AXION:PREFIX:fe -->
<!-- AXION:PLACEHOLDER_POLICY:v1 -->
```

Each template includes:
- **Metadata block**: Module slug, prefix, and description
- **Agent Rules section**: Explicit guidance for population (do not delete)
- **Section keys**: Stable AXION:SECTION markers that never change
- **Acceptance criteria**: Checkboxes for verification
- **Open Questions**: Captures UNKNOWNs and pending decisions

### Section Keys

Required sections use stable keys that never change. Keys use the module prefix from `domains.json`:

| Module | Prefix | Section Key Example |
|--------|--------|---------------------|
| architecture | ARCH | `ARCH_SYSTEM_ARCH` |
| systems | SYS | `SYS_RUNTIME_STANDARDS` |
| contracts | CONTRACT | `CONTRACT_API_CONTRACTS` |
| database | DB | `DB_SCHEMA_DESIGN` |
| data | DATA | `DATA_DATA_ENGINEERING` |
| auth | AUTH | `AUTH_AUTHENTICATION` |
| backend | BE | `BE_API_CONTRACTS` |
| integrations | INTEG | `INTEG_THIRD_PARTY` |
| state | STATE | `STATE_ARCHITECTURE` |
| frontend | FE | `FE_ACCESSIBILITY` |
| fullstack | FS | `FS_END_TO_END_FLOWS` |
| testing | TEST | `TEST_UNIT` |
| quality | QA | `QA_TEST_STRATEGY` |
| security | SEC | `SEC_PRODUCT_SECURITY` |
| devops | DEVOPS | `DEVOPS_CICD_PIPELINES` |
| cloud | CLOUD | `CLOUD_IAC_STANDARDS` |
| devex | DX | `DX_LOCAL_DEV` |
| mobile | MOBILE | `MOBILE_ARCHITECTURE` |
| desktop | DESKTOP | `DESKTOP_ARCHITECTURE` |

Example usage:

```markdown
<!-- AXION:SECTION:FE_ACCESSIBILITY -->
## Accessibility

- [ ] Define keyboard navigation rules
- [ ] Define screen reader behavior
- **Standards:** [TBD]
```

### Placeholder Policy

Templates follow a strict placeholder policy for consistent verification:

| Token | When to Use |
|-------|-------------|
| `[TBD]` | Must be populated with concrete content during draft stage |
| `N/A — <reason>` | Section is not applicable (never leave blank) |
| `UNKNOWN` | Upstream truth is missing; add to Open Questions |
| `[DECISION]` | Needs a choice from stakeholders |
| `[ASSUMPTION]` | Explicitly assumed pending confirmation |
| `[OUT-OF-SCOPE]` | Intentionally excluded from scope |
| `[LINK]` | Reference to another document |

**Key rule:** At verify stage, `[TBD]` is not allowed in required sections. Sections must either be populated or marked `N/A — <reason>`.

## Governance Features

### Seam Owner Registry

Cross-cutting topics (seams) have single ownership to prevent duplication across modules:

| Seam | Owner | Description |
|------|-------|-------------|
| `error_model` | contracts | Error codes, response shapes |
| `schema_truth` | database | Entity schemas, field definitions |
| `identity` | auth | Authentication, authorization |
| `webhooks` | integrations | Event payloads, delivery guarantees |
| `correlation_ids` | systems | Request tracing, correlation ID propagation |
| `api_versioning` | backend | Version strategy, deprecation policy |
| `feature_flags` | state | Feature flag definitions, rollout rules |

**Governance rule:** Non-owner modules must LINK to owner definitions, not redefine them.

Registry location: `registry/seams.json`

Verify command:
```bash
npx ts-node axion/scripts/axion-verify-seams.ts --module <name>
npx ts-node axion/scripts/axion-verify-seams.ts --all
```

### Repair Mode

When verification fails, the repair script outputs actionable fix lists:

```bash
npx ts-node axion/scripts/axion-repair.ts --module <name>
npx ts-node axion/scripts/axion-repair.ts --all
npx ts-node axion/scripts/axion-repair.ts --module <name> --save
```

Repair mode produces:
- Missing sections with exact fix actions
- Duplicated definitions to remove
- Unresolved `[TBD]` placeholders
- `UNKNOWN` items without Open Questions entries
- Next commands to run after fixes

Reason codes for issues:
- `MISSING_SECTION` (critical): Required section missing
- `EMPTY_SECTION` (critical): Section has no content
- `TBD_IN_REQUIRED` (critical): Placeholder in required section
- `UNKNOWN_WITHOUT_QUESTION` (warning): UNKNOWN without Open Questions
- `SEAM_OWNER_VIOLATION` (warning): Non-owner defines seam content
- `INCOMPLETE_CHECKLIST` (info): Unchecked acceptance items

### Template Drift Detection

Templates and registry docs are hashed to detect unauthorized changes:

```bash
# Generate baseline hashes
npx ts-node axion/scripts/axion-hash-templates.ts --generate

# Verify no drift
npx ts-node axion/scripts/axion-hash-templates.ts --verify

# Show what changed
npx ts-node axion/scripts/axion-hash-templates.ts --diff

# Bump revision to acknowledge changes
npx ts-node axion/scripts/axion-hash-templates.ts --generate --bump --note "description"
```

Hash registry location: `registry/template_hashes.json`

Verification fails if hashes change without a recorded revision bump. This prevents slow "death by edits" drift.

### Verify Rules

A section passes verification if it contains:
- ≥2 bullets (`- `)
- ≥2 checklist items (`- [ ]`)
- A table with ≥2 data rows

At verify stage, `[TBD]` is not allowed in required sections.

## Core Principles

1. **No Invention**: Missing info is marked `UNKNOWN`, never fabricated
2. **No Overwrite**: Existing files are not replaced unless explicitly allowed
3. **Sequential Flow**: Each doc feeds the next; no skipping steps
4. **Isolated Workspaces**: Each assembly runs in its own workspace
5. **Module Dependencies**: Prerequisites must complete before dependents

## Key Documents

| Document | Purpose | Lives In |
|----------|---------|----------|
| RPBS | Product truth: why, who, what | `source_docs/product/` |
| REBS | Engineering philosophy | `source_docs/product/` |
| DDES | Domain structure, features (WHAT) | `domains/<module>/` |
| UX_Foundations | User mental model | `domains/<module>/` |
| UI_Constraints | Screen rules, navigation | `domains/<module>/` |
| ALRP | Agent behavior rules | `domains/<module>/` |
| ERC | Execution lock (frozen before build) | `domains/<module>/` |
| TIES | Code behavior rules | `domains/<module>/` |
| SROL | Post-build optimization | `domains/<module>/` |

## Data Flow

```
User fills web form (Overview section)
        ↓
RPBS_Product.md populated (the "spark")
        ↓
REBS_Product.md adds engineering philosophy
        ↓
Pipeline reads RPBS + REBS
        ↓
Templates filled via ROSHI sequential flow
        ↓
UNKNOWNs marked where info is missing
        ↓
Review & verify stages validate completeness
        ↓
Lock produces final ERC
        ↓
Agent Kit (zip) ready for implementation
```

## Running the Pipeline

```bash
# Full pipeline for a module
node axion/scripts/axion-generate.mjs --module architecture
node axion/scripts/axion-seed.mjs --module architecture
node axion/scripts/axion-draft.mjs --module architecture
node axion/scripts/axion-review.mjs --module architecture
node axion/scripts/axion-verify.mjs --module architecture
node axion/scripts/axion-lock.mjs --module architecture

# Or run all modules in dependency order
node axion/scripts/axion-generate.mjs --all
node axion/scripts/axion-seed.mjs --all
# ... etc.
```

## Configuration

### domains.json
Defines the 19 modules with their metadata:
```json
{
  "modules": [
    { "name": "Architecture", "slug": "architecture", "prefix": "arch", "type": "foundation" }
  ]
}
```

### sources.json
Points to source documents that feed the draft stage:
```json
{
  "sources": [
    "source_docs/product/RPBS_Product.md",
    "source_docs/product/REBS_Product.md"
  ]
}
```
