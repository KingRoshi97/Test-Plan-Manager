# AXION — Documentation Generation System

AXION is a docs-first documentation generation pipeline that produces comprehensive "Agent Kits" for software projects. It enforces a strict sequential process (the ROSHI flow) to ensure consistency, traceability, and completeness.

## Quick Links

| File | Describes |
|------|-----------|
| `TWO_ROOT_ARCHITECTURE.md` | System root vs workspace root separation |
| `RUN_ORCHESTRATOR.md` | How axion-run.ts works with presets and plans |
| `APP_PIPELINE.md` | App stages: scaffold-app, build, test, deploy, activate |
| `GATES_AND_OVERRIDES.md` | Quality gates and --override flag |
| `STAGE_MARKERS.md` | How registry/stage_markers.json tracks progress |
| `CLI_REFERENCE.md` | All scripts with CLI arguments |
| `../QUICKSTART.md` | Getting started guide |

---

## Core Philosophy

### The Three-Folder System

```
axion/source_docs/
├── product/              # INPUT: User's project-specific content (RPBS, REBS)
│                         # The "spark" that drives all downstream generation
└── registry/             # GUARDRAILS: Standards that prevent agent drift
                          # Glossary, reason codes, action vocabulary

axion/templates/          # BLUEPRINTS: Reusable document structures
                          # Copied and populated into domain folders

axion/domains/<module>/   # OUTPUT: Filled-in docs ready for agent coding
```

### Product Spark (source_docs/product/)

RPBS and REBS are the **source of truth** that flows through the entire ROSHI pipeline:

```
RPBS (Why, Who, What) → REBS (Engineering Philosophy) → All downstream templates
```

The pipeline **reads from** these files but **never writes to** them.

| File | Purpose |
|------|---------|
| `RPBS_Product.md` | **Requirements & Product Baseline Specification** — Defines why the product exists, who it serves, what outcomes must occur, and what is out of scope. LEVEL 0 product truth. |
| `REBS_Product.md` | **Requirements & Engineering Baseline Specification** — Defines engineering philosophy: separation of concerns, discipline, patterns. LEVEL 0 engineering truth. |
| `COMPONENT_SPEC.md` | UI component definitions (optional) |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step build instructions (optional) |
| `SCHEMA_SPEC.md` | Database schema definitions (optional) |

**The "No Invention" Rule:** If RPBS/REBS doesn't contain needed info, the pipeline marks it as `UNKNOWN`. Never fabricated.

### Registry Guardrails (source_docs/registry/)

While `product/` contains the "what", `registry/` contains the "how consistently":

| File | Purpose |
|------|---------|
| `glossary.md` | Project-specific terms. Ensures consistent language. |
| `reason-codes.md` | Standardized codes for decisions and errors. |
| `action-vocabulary.md` | Standardized verbs (create, validate, emit). |
| `domain-map.md` | Maps each module to its responsibilities and boundaries. |

The AI agent must adhere to these standards or get flagged during `review`/`verify`.

---

## The ROSHI Sequential Flow

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

---

## The Pipeline

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

### Running the Pipeline

```bash
# Process single module
node axion/scripts/axion-generate.mjs --module frontend

# Process all modules in dependency order
node axion/scripts/axion-generate.mjs --all

# Full pipeline for a module
node axion/scripts/axion-generate.mjs --module architecture
node axion/scripts/axion-seed.mjs --module architecture
node axion/scripts/axion-draft.mjs --module architecture
node axion/scripts/axion-review.mjs --module architecture
node axion/scripts/axion-verify.mjs --module architecture
node axion/scripts/axion-lock.mjs --module architecture
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

---

## The 19 Modules

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

Modules have **dependencies** (defined in `config/domains.json`). For example, `frontend` depends on `state` and `backend`.

---

## Template System

### Core Templates (in `templates/core/`)
DDES, UX_Foundations, UI_Constraints, DIM, SCREENMAP, TESTPLAN, COMPONENT_LIBRARY, COPY_GUIDE, ALRP, ERC, TIES, SROL

### Module Templates (in `templates/<module>/`)
Each module has one `README.template.md` with contract headers and module-specific section keys.

### Template Contract Headers
```markdown
<!-- AXION:TEMPLATE_CONTRACT:v1 -->
<!-- AXION:MODULE:frontend -->
<!-- AXION:PREFIX:fe -->
<!-- AXION:REQUIRED_SECTIONS:enforced -->
```

### Placeholder Policy

| Token | When to Use |
|-------|-------------|
| `[TBD]` | Must be populated during draft stage |
| `N/A — <reason>` | Section not applicable (never leave blank) |
| `UNKNOWN` | Upstream truth is missing; add to Open Questions |
| `[DECISION]` | Needs a choice from stakeholders |
| `[ASSUMPTION]` | Assumed pending confirmation |
| `[OUT-OF-SCOPE]` | Intentionally excluded |

**Key rule:** At verify stage, `[TBD]` is not allowed in required sections.

---

## Governance Features

### Seam Owner Registry

Cross-cutting topics have single ownership to prevent duplication:

| Seam | Owner | Description |
|------|-------|-------------|
| `error_model` | contracts | Error codes, response shapes |
| `schema_truth` | database | Entity schemas, field definitions |
| `identity` | auth | Authentication, authorization |
| `webhooks` | integrations | Event payloads, delivery guarantees |
| `correlation_ids` | systems | Request tracing, correlation ID propagation |
| `api_versioning` | backend | Version strategy, deprecation policy |
| `feature_flags` | state | Feature flag definitions, rollout rules |

**Rule:** Non-owner modules must LINK to owner definitions, not redefine them.

### Repair Mode

```bash
npx ts-node axion/scripts/axion-repair.ts --module <name>
npx ts-node axion/scripts/axion-repair.ts --all --save
```

Produces: missing sections, duplicated definitions, unresolved `[TBD]`, `UNKNOWN` items without Open Questions.

### Template Drift Detection

```bash
npx ts-node axion/scripts/axion-hash-templates.ts --verify
npx ts-node axion/scripts/axion-hash-templates.ts --diff
npx ts-node axion/scripts/axion-hash-templates.ts --generate --bump --note "description"
```

### Verify Rules

A section passes verification if it contains: 2+ bullets, 2+ checklist items, or a table with 2+ data rows. At verify stage, `[TBD]` is not allowed in required sections.

---

## Directory Structure

```
axion/
├── config/
│   ├── domains.json          # Module definitions (name, slug, prefix, deps)
│   └── sources.json          # Source document paths
│
├── source_docs/
│   ├── product/              # User input: RPBS, REBS (the project brain)
│   └── registry/             # Cross-cutting standards (glossary, reason codes)
│
├── templates/
│   ├── core/                 # ROSHI flow templates (12)
│   └── <module>/             # Per-module README.template.md (19)
│
├── domains/                  # Generated output: one folder per module
│   └── <module>/             # Contains populated docs for that module
│
├── scripts/                  # Pipeline automation
│   ├── *.mjs                 # Active pipeline scripts (generate, seed, draft, etc.)
│   ├── *.ts                  # Auxiliary guardrail scripts (doctor, repair, etc.)
│   └── _axion_module_mode.mjs  # Shared module/prereq helpers
│
├── registry/                 # Pipeline state (stage markers, verify status)
├── lib/                      # Shared utilities (atomic-writer)
├── docs/                     # This documentation folder
└── tests/                    # Test suites and fixtures
```

## Configuration

### domains.json
Defines the 19 modules:
```json
{ "modules": [{ "name": "Architecture", "slug": "architecture", "prefix": "arch", "type": "foundation" }] }
```

### sources.json
Points to source documents that feed the draft stage:
```json
{ "sources": ["source_docs/product/RPBS_Product.md", "source_docs/product/REBS_Product.md"] }
```

## Core Principles

1. **No Invention**: Missing info is marked `UNKNOWN`, never fabricated
2. **No Overwrite**: Existing files are not replaced unless explicitly allowed
3. **Sequential Flow**: Each doc feeds the next; no skipping steps
4. **Isolated Workspaces**: Each assembly runs in its own workspace
5. **Module Dependencies**: Prerequisites must complete before dependents
