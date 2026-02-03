# AXION — Documentation Generation System

AXION is a docs-first documentation generation pipeline that produces comprehensive "Agent Kits" for software projects. It enforces a strict sequential process to ensure consistency, traceability, and completeness.

## How It Works

### The Pipeline

AXION operates through a 6-stage pipeline, where each stage must complete before the next can run:

```
init → generate → seed → draft → review → verify → lock
```

| Stage | What It Does |
|-------|--------------|
| **init** | Creates workspace and config files |
| **generate** | Creates module folders and empty doc templates |
| **seed** | Populates baseline registry docs (glossary, reason codes, etc.) |
| **draft** | Fills templates with content extracted from RPBS/REBS |
| **review** | Validates docs, counts UNKNOWNs, checks cross-references |
| **verify** | Final gate check — blocks lock if critical issues remain |
| **lock** | Freezes module, generates ERC (Execution Readiness Contract) |

### The 19 Modules

Documentation is organized into 19 modules, each covering a specific domain:

| Type | Modules |
|------|---------|
| **Foundation** | architecture, systems, contracts |
| **Data** | database, data |
| **Security** | auth |
| **Core** | backend, integrations |
| **Frontend** | state, frontend |
| **Integration** | fullstack |
| **Quality** | testing, quality |
| **Crosscutting** | security |
| **Operations** | devops, cloud, devex |
| **Platform** | mobile, desktop |

Modules have **dependencies**. For example, `frontend` depends on `state` and `backend`, so those must be processed first.

### Module Mode

Every pipeline script supports module-by-module execution:

```bash
# Process single module
node axion/scripts/axion-generate.mjs --module architecture

# Process all modules in dependency order
node axion/scripts/axion-generate.mjs --all
```

If prerequisites aren't met, the script outputs a `blocked_by` JSON and exits:

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
│   ├── domains.json      # Module definitions (name, slug, prefix, type)
│   └── sources.json      # Source document paths
├── source_docs/
│   ├── product/          # User input: RPBS, REBS (the project brain)
│   └── registry/         # Cross-cutting standards: glossary, reason codes
├── domains/              # Generated output: one folder per module
│   └── <module>/         # Contains BELS, DDES, DIM, etc. for that module
├── templates/            # Document templates (.template.md files)
└── scripts/              # Pipeline scripts (axion-generate.mjs, etc.)
```

## Core Principles

### No Invention
If information is missing from the source docs, the system marks it as `UNKNOWN` rather than making something up. This ensures traceability and forces decisions to be explicit.

### No Overwrite
Existing files are never overwritten by the pipeline. This protects manual edits and ensures idempotent runs.

### Isolated Workspaces
Each assembly runs in its own workspace folder, preventing cross-contamination between projects.

### Stage Markers
Progress is tracked via JSON markers in `source_docs/registry/stage_markers/`. Each marker records:
- Stage name
- Module name  
- Timestamp
- Status (DONE)

## Running the Pipeline

```bash
# Full pipeline for architecture module
node axion/scripts/axion-generate.mjs --module architecture
node axion/scripts/axion-seed.mjs --module architecture
node axion/scripts/axion-draft.mjs --module architecture
node axion/scripts/axion-review.mjs --module architecture
node axion/scripts/axion-verify.mjs --module architecture
node axion/scripts/axion-lock.mjs --module architecture

# Or run all modules in order
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

## Output

After successful completion, each module folder contains:
- **BELS** — Business Entity Logic Specification
- **DDES** — Domain Design & Entity Specification
- **DIM** — Domain Integration Map
- **SCREENMAP** — UI screen definitions
- **TESTPLAN** — Testing strategy and cases
- And more...

The final `lock` stage produces an **ERC (Execution Readiness Contract)** — a frozen snapshot ready for handoff to implementation.

## Data Flow

```
User fills web form
        ↓
RPBS_Product.md (Overview section populated)
        ↓
Pipeline reads RPBS + REBS
        ↓
Templates filled with extracted data
        ↓
UNKNOWNs marked where info is missing
        ↓
Review & verify stages validate completeness
        ↓
Lock produces final ERC
        ↓
Agent Kit (zip) ready for implementation
```
