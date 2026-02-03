# AXION Quickstart Guide

## What is AXION?

AXION is a documentation-first development system that generates comprehensive "Agent Kits" for AI-guided software development. It enforces a strict pipeline: **init → generate → seed → draft → review → verify → lock**.

The output is a complete documentation package that AI coding agents can use to build your project with consistency and discipline.

---

## Installation

AXION is a folder-based system. To use it in your project:

1. **Copy the `axion/` folder** into your project root
2. **Install dependencies** (if not already present):
   ```bash
   npm install tsx typescript
   ```

---

## Getting Started (Fresh Project)

### Step 1: Initialize Workspace

```bash
node --import tsx axion/scripts/axion-init.ts --mode fresh
```

This creates:
- `axion/source_docs/product/RPBS_Product.md` - Product requirements (edit first!)
- `axion/source_docs/product/REBS_Product.md` - Engineering requirements (edit second!)
- `axion/config/domains.json` - Module definitions
- `axion/config/presets.json` - Pipeline presets

### Step 2: Fill in Your Requirements

Edit the two source documents to define your project:

**RPBS_Product.md** (Product):
- Product vision and value proposition
- Target users
- Core features (MVP scope)
- What's in/out of scope

**REBS_Product.md** (Engineering):
- Tech stack choices
- Architecture pattern
- Engineering constraints
- Integration points

### Step 3: Run the Pipeline

Option A: **Use presets** (recommended for beginners):

```bash
# Scaffold foundation modules (architecture, systems, contracts)
node --import tsx axion/scripts/axion-run.ts --preset foundation --plan scaffold

# Check status
node --import tsx axion/scripts/axion-status.ts

# See what to do next
node --import tsx axion/scripts/axion-next.ts
```

Option B: **Run stages manually**:

```bash
# Generate all module docs from templates
node --import tsx axion/scripts/axion-generate.ts --all

# Seed placeholders
node --import tsx axion/scripts/axion-seed.ts --all

# Draft content
node --import tsx axion/scripts/axion-draft.ts --all

# Review completeness
node --import tsx axion/scripts/axion-review.ts --all

# Verify rules
node --import tsx axion/scripts/axion-verify.ts --all

# Lock and generate ERC
node --import tsx axion/scripts/axion-lock.ts --all
```

---

## Overhauling an Existing Project

If you have an existing codebase you want to rebuild with AXION guidance:

```bash
node --import tsx axion/scripts/axion-overhaul.ts
```

This will:
1. Archive your current project to `_axion_archive/<timestamp>/`
2. Create a fresh workspace at `_axion_rebuild/`
3. Write a manifest documenting what was archived

Then follow the "Fresh Project" steps above in the new workspace.

---

## Pipeline Stages

| Stage | Purpose | Command |
|-------|---------|---------|
| **generate** | Create module docs from templates | `axion-generate.ts --all` |
| **seed** | Add placeholder content structure | `axion-seed.ts --all` |
| **draft** | Fill in actual content | `axion-draft.ts --all` |
| **review** | Check completeness, count UNKNOWNs | `axion-review.ts --all` |
| **verify** | Validate rules, seams, cross-refs | `axion-verify.ts --all` |
| **lock** | Finalize and generate ERC | `axion-lock.ts --all` |

---

## Presets

Presets let you run the pipeline on logical module groups:

| Preset | Modules | Use Case |
|--------|---------|----------|
| `foundation` | architecture, systems, contracts | Start here |
| `core-spec` | contracts, database, auth | Data layer |
| `backend-api` | backend, database | Server implementation |
| `web` | frontend, state | Web client |
| `mobile` | mobile | Mobile client |
| `system` | All modules | Full system |

Run with:
```bash
node --import tsx axion/scripts/axion-run.ts --preset <name> --plan <plan>
```

Plans: `scaffold`, `docs`, `full`, `release`

---

## Checking Progress

```bash
# View current status (all modules × stages)
node --import tsx axion/scripts/axion-status.ts

# Get next recommended steps
node --import tsx axion/scripts/axion-next.ts

# JSON output for scripts
node --import tsx axion/scripts/axion-next.ts --json
```

---

## Key Files

```
axion/
├── config/
│   ├── domains.json       # Module definitions
│   ├── presets.json       # Pipeline presets
│   └── stack_profiles.json # Tech stack options
├── domains/               # Generated module docs
│   ├── architecture/
│   ├── contracts/
│   └── ...
├── registry/              # Pipeline state
│   ├── stage_markers.json
│   └── verify_report.json
├── source_docs/           # Your inputs
│   └── product/
│       ├── RPBS_Product.md
│       └── REBS_Product.md
├── templates/             # Module templates
│   ├── architecture/
│   ├── backend/
│   └── ...
└── scripts/               # Pipeline scripts
    ├── axion-init.ts
    ├── axion-generate.ts
    ├── axion-verify.ts
    └── ...
```

---

## Tips

1. **Start small** - Begin with `foundation` preset, get to verify PASS
2. **Check status often** - Use `axion-status.ts`
3. **Fix issues early** - Don't skip verify failures
4. **Iterate** - Pipeline is designed for incremental progress
5. **Use [TBD] wisely** - Replace all placeholders before locking

---

## Governance Rules

AXION enforces several rules during verify:

- **Seam ownership**: Certain content is owned by specific modules
- **Template hashing**: Tracks drift from original templates
- **Cross-references**: Modules must link to dependencies properly
- **UNKNOWN handling**: Must be resolved or documented in OPEN_QUESTIONS

---

## Need Help?

- Run `axion-next.ts` to see what to do
- Check `axion/registry/verify_report.json` for detailed issues
- Review `axion/registry/stage_markers.json` for progress
- Read the template files to understand expected content

---

## Example: Building a Todo App

```bash
# 1. Initialize
node --import tsx axion/scripts/axion-init.ts --mode fresh

# 2. Edit RPBS_Product.md:
#    - Vision: "Simple todo list for personal productivity"
#    - Users: "Individual users managing daily tasks"
#    - Features: "Add, complete, delete tasks"

# 3. Edit REBS_Product.md:
#    - Stack: React + Node.js + PostgreSQL
#    - Architecture: Monolith

# 4. Generate foundation docs
node --import tsx axion/scripts/axion-run.ts --preset foundation --plan scaffold

# 5. Check status
node --import tsx axion/scripts/axion-status.ts

# 6. Continue filling in docs and running stages...
```

The output is a complete documentation set that any AI coding agent can use to build your todo app consistently.
