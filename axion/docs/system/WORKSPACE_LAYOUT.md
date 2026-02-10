# Workspace Layout

AXION uses a **two-root model** to separate immutable system files from mutable project outputs. One `axion/` folder can serve multiple workspaces without risk of cross-contamination.

## Why Two Roots

| Problem | Solution |
|---------|----------|
| System files corrupted by generated outputs | Separate roots prevent cross-contamination |
| Multi-project support | One `axion/` serves many workspaces |
| Version control clarity | System changes vs project outputs are distinct |
| Safe upgrades | Update `axion/` without touching workspaces |

---

## Directory Structure

```
<BUILD_ROOT>/
├── axion/                          # SYSTEM ROOT (immutable)
│   ├── config/                     # domains.json, presets.json, sources.json
│   │   ├── domains.json            # Module definitions and dependencies
│   │   ├── presets.json            # Stage plans, presets, gates
│   │   └── sources.json           # Document source paths
│   ├── docs/                       # System documentation (this folder)
│   │   ├── system/                 # Pipeline, workspace, CLI reference
│   │   ├── product/                # RPBS, REBS product specs
│   │   └── registry/               # Glossary, reason codes, action vocab
│   ├── migrations/                 # Database migrations
│   ├── registry/                   # System-level state (not per-workspace)
│   ├── scripts/                    # Pipeline scripts (axion-*.ts, axion-*.mjs)
│   │   └── lib/                    # Shared utilities (atomic-writer, retry, path-safety)
│   ├── templates/                  # Base document templates
│   │   └── core/                   # Core templates and change contract
│   ├── tests/                      # Test suite
│   ├── _archive/                   # Archived originals (reference only)
│   └── CHANGELOG.md
│
└── <PROJECT_NAME>/                 # WORKSPACE ROOT (mutable, one per project)
    ├── source_docs/                # Input documents
    │   ├── product/                # RPBS, REBS, attachments
    │   └── registry/               # Glossary, reason codes
    ├── domains/                    # Generated module documentation
    │   ├── architecture/
    │   ├── backend/
    │   ├── frontend/
    │   └── ... (up to 19 modules)
    ├── registry/                   # Pipeline state (per-workspace)
    │   ├── stage_markers.json      # Stage completion tracking
    │   ├── verify_report.json      # Latest verify results
    │   ├── test_report.json        # Latest test results
    │   ├── run_history/            # Execution logs per run
    │   └── locks/                  # Locked document checksums
    └── app/                        # Scaffolded application code
        ├── client/
        ├── server/
        ├── shared/
        └── package.json
```

---

## Path Resolution

The orchestrator (`axion-run.ts`) resolves paths from two arguments:

```
--build-root /home/user/projects
--project-name MyApp

axionRoot     = /home/user/projects/axion       (system root)
workspaceRoot = /home/user/projects/MyApp       (workspace root)
```

Within the workspace:
```
domains/      = /home/user/projects/MyApp/domains
registry/     = /home/user/projects/MyApp/registry
app/          = /home/user/projects/MyApp/app
```

---

## Stage 0: prepare-root

Before any pipeline stage runs, `axion-prepare-root.ts` executes to:

1. Validate build root exists and contains `axion/`
2. Create workspace directory if missing
3. Create standard subdirectories: `source_docs/`, `domains/`, `registry/`, `app/`
4. Enforce workspace safety policy (see below)

This guarantees a consistent workspace structure before any stage writes output.

---

## Workspace Safety Policies

| Policy | Flag | Behavior |
|--------|------|----------|
| Refuse non-empty | (default) | Fails if workspace exists and has files |
| Allow non-empty | `--allow-nonempty` | Continues with existing workspace |
| Archive existing | `--archive-existing` | Moves workspace to `_axion_archive/<timestamp>/` first |

**Default (refuse non-empty):**
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:scaffold
```

**Development (allow non-empty):**
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:content \
  --allow-nonempty
```

**Production (archive existing):**
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:scaffold \
  --archive-existing
```

---

## Environment Variable

All child processes receive:

```bash
AXION_WORKSPACE=/path/to/axion   # Points to system root
```

Scripts use this to locate templates and configs when running in a workspace context.

---

## Workspace Detection

The dashboard and CLI detect workspaces by looking for any of these markers in a sibling directory:

- `manifest.json`
- `registry/`
- `domains/`
- `app/`

---

## System Root Protection

The `axion/` directory is treated as immutable during pipeline runs:

- No pipeline stage writes into `axion/`
- `axion-doctor.ts` checks for pollution (forbidden outputs in `axion/`)
- Generated workspaces are always created as siblings, never children, of `axion/`

See [RELEASE_GATES.md](RELEASE_GATES.md) for the two-root safety contract.
