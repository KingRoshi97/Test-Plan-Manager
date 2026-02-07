# Two-Root Architecture

AXION uses a **two-root model** to separate immutable system files from mutable project outputs.

## Why Two Roots?

| Problem | Solution |
|---------|----------|
| System files getting corrupted by outputs | Separate roots prevent cross-contamination |
| Multi-project support | One `axion/` folder can serve multiple workspaces |
| Version control clarity | System changes vs project outputs are distinct |
| Safe upgrades | Update `axion/` without touching workspace |

---

## Directory Structure

```
<BUILD_ROOT>/
├── axion/                      # SYSTEM ROOT (immutable)
│   ├── scripts/                # Pipeline scripts (axion-*.ts)
│   ├── templates/              # Document templates
│   ├── config/                 # domains.json, presets.json, sources.json
│   ├── docs/                   # This documentation
│   └── QUICKSTART.md
│
└── <PROJECT_NAME>/             # WORKSPACE ROOT (mutable)
    ├── source_docs/            # Input documents
    │   ├── product/            # RPBS, REBS, attachments
    │   └── registry/           # Glossary, reason codes
    ├── domains/                # Generated module documentation
    │   ├── architecture/
    │   ├── backend/
    │   └── ...19 modules
    ├── registry/               # Pipeline state
    │   ├── stage_markers.json  # Stage completion tracking
    │   ├── verify_report.json  # Latest verify results
    │   ├── run_history/        # Execution logs
    │   └── locks/              # Locked document checksums
    └── app/                    # Scaffolded application code
        ├── client/
        ├── server/
        ├── shared/
        └── package.json
```

---

## CLI Arguments

All scripts accept these arguments for two-root operation:

### For `axion-run.ts` (orchestrator):

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root /path/to/build    # Parent directory containing axion/ and workspace
  --project-name "MyApp"         # Name of workspace folder to create/use
  --preset system                # Module preset to use
  --plan docs:scaffold           # Stage plan to execute
```

### For individual doc scripts (generate, seed, draft, review, verify, lock):

```bash
node axion/scripts/axion-generate.mjs \
  --root /path/to/workspace      # Direct path to workspace root
  --module architecture          # Specific module (or --all)
```

### For app scripts (scaffold-app, build, test, deploy, activate):

```bash
npx tsx axion/scripts/axion-scaffold-app.ts \
  --build-root /path/to/build    # Parent directory
  --project-name "MyApp"         # Workspace folder name
```

---

## Path Resolution

The orchestrator (`axion-run.ts`) resolves paths like this:

```
buildRoot     = /home/user/projects
projectName   = MyApp
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

## Safety Policies

### 1. Refuse Non-Empty Workspace (Default)
```bash
# Fails if workspace exists and has files
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp ...
```

### 2. Allow Non-Empty (Development)
```bash
# Continues with existing workspace
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --allow-nonempty ...
```

### 3. Archive Existing (Production)
```bash
# Moves existing workspace to _axion_archive/<timestamp>/
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --archive-existing ...
```

---

## Stage 0: prepare-root

Before any pipeline stage runs, `axion-prepare-root.ts` executes to:

1. Validate build root exists and contains `axion/`
2. Create workspace directory if missing
3. Create standard subdirectories: `source_docs/`, `domains/`, `registry/`, `app/`
4. Handle archive/allow-nonempty policies

This ensures a consistent workspace structure before any stage writes outputs.

---

## Environment Variable

All child processes receive:

```bash
AXION_WORKSPACE=/path/to/axion   # Points to system root
```

Scripts use this to locate templates and configs when needed.

---

## Examples

### Fresh Project
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root /home/user/projects \
  --project-name "TodoApp" \
  --preset system \
  --plan docs:scaffold
```

Creates: `/home/user/projects/TodoApp/` with full structure.

### Existing Workspace
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root /home/user/projects \
  --project-name "TodoApp" \
  --allow-nonempty \
  --preset system \
  --plan docs:content
```

Continues work in existing workspace.

### Multiple Projects
```bash
# Same axion/, different workspaces
npx tsx axion/scripts/axion-run.ts --build-root . --project-name "AppA" --preset web --plan docs:full
npx tsx axion/scripts/axion-run.ts --build-root . --project-name "AppB" --preset mobile --plan docs:full
```

Both workspaces share the same `axion/` system root.
