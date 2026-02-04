# CLI Reference

Complete reference for all AXION scripts.

## Orchestration

### axion-run.ts
Main pipeline orchestrator.

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root <path>      # Parent directory containing axion/ and workspace
  --project-name <name>    # Workspace folder name
  --preset <preset>        # Module preset (system, web, mobile, etc.)
  --plan <plan>            # Stage plan (docs:scaffold, app:bootstrap, etc.)
  [--module <name>]        # Target specific module (alternative to --preset)
  [--all]                  # Target all modules (alternative to --preset)
  [--allow-nonempty]       # Continue with existing workspace
  [--archive-existing]     # Archive existing workspace first
  [--override]             # Bypass gates where allowed
  [--json]                 # JSON output mode
```

---

## Setup Scripts

### axion-kit-create.ts
Create a new AXION kit workspace.

```bash
npx tsx axion/scripts/axion-kit-create.ts \
  --build-root <path>      # Where to create kit
  --project-name <name>    # Project name
```

### axion-prepare-root.ts
Stage 0: Prepare workspace directories.

```bash
npx tsx axion/scripts/axion-prepare-root.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
  [--allow-nonempty]       # Allow existing files
  [--archive-existing]     # Archive existing first
```

### axion-init.ts
Initialize fresh workspace with templates.

```bash
npx tsx axion/scripts/axion-init.ts \
  --mode fresh             # Fresh initialization
  [--root <path>]          # Workspace root
```

### axion-preflight.ts
Validate prerequisites before running.

```bash
npx tsx axion/scripts/axion-preflight.ts \
  [--root <path>]          # Workspace root
```

---

## Documentation Pipeline

### axion-generate.ts
Generate module scaffolds.

```bash
npx tsx axion/scripts/axion-generate.ts \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-seed.ts
Seed templates into modules.

```bash
npx tsx axion/scripts/axion-seed.ts \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-draft.ts
AI-generate documentation content.

```bash
npx tsx axion/scripts/axion-draft.ts \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-review.ts
AI review documentation.

```bash
npx tsx axion/scripts/axion-review.ts \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-verify.ts
Validate documentation quality.

```bash
npx tsx axion/scripts/axion-verify.ts \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-lock.ts
Lock documentation (make immutable).

```bash
npx tsx axion/scripts/axion-lock.ts \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

---

## Application Pipeline

### axion-scaffold-app.ts
Generate application skeleton.

```bash
npx tsx axion/scripts/axion-scaffold-app.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
  [--override]             # Bypass lock gate
```

### axion-build-plan.ts
Generate build execution plan.

```bash
npx tsx axion/scripts/axion-build-plan.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
```

### axion-build.ts
Compile application.

```bash
npx tsx axion/scripts/axion-build.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
```

### axion-test.ts
Run test suite.

```bash
npx tsx axion/scripts/axion-test.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
```

### axion-deploy.ts
Deploy application.

```bash
npx tsx axion/scripts/axion-deploy.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
  [--override]             # Bypass test gate
```

### axion-activate.ts
Set active build pointer.

```bash
npx tsx axion/scripts/axion-activate.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
  [--allow-no-tests]       # Skip test requirement
```

### axion-run-app.ts
Start application.

```bash
npx tsx axion/scripts/axion-run-app.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
```

---

## Status and Inspection

### axion-status.ts
Show current pipeline status.

```bash
npx tsx axion/scripts/axion-status.ts \
  --root <path>            # Workspace root
  [--json]                 # JSON output
```

### axion-next.ts
Show recommended next step.

```bash
npx tsx axion/scripts/axion-next.ts \
  --root <path>            # Workspace root
```

### axion-active.ts
Show current active build.

```bash
npx tsx axion/scripts/axion-active.ts \
  --build-root <path>      # Parent directory
```

---

## Maintenance

### axion-doctor.ts
Diagnose workspace issues.

```bash
npx tsx axion/scripts/axion-doctor.ts \
  --root <path>            # Workspace root
```

### axion-repair.ts
Fix detected issues.

```bash
npx tsx axion/scripts/axion-repair.ts \
  --root <path>            # Workspace root
```

### axion-clean.ts
Clean generated files.

```bash
npx tsx axion/scripts/axion-clean.ts \
  --root <path>            # Workspace root
  [--dry-run]              # Show what would be deleted
```

### axion-overhaul.ts
Archive existing and rebuild.

```bash
npx tsx axion/scripts/axion-overhaul.ts \
  --root <path>            # Workspace root
```

### axion-upgrade.ts
Upgrade existing project.

```bash
npx tsx axion/scripts/axion-upgrade.ts \
  --root <path>            # Workspace root
```

---

## Export

### axion-package.ts
Export kit artifact.

```bash
npx tsx axion/scripts/axion-package.ts \
  --build-root <path>      # Parent directory
  --project-name <name>    # Workspace folder name
  [--output <path>]        # Output path for package
```

---

## Utilities

### axion-hash-templates.ts
Generate template content hashes.

```bash
npx tsx axion/scripts/axion-hash-templates.ts
```

### axion-verify-seams.ts
Validate seam ownership markers.

```bash
npx tsx axion/scripts/axion-verify-seams.ts \
  --root <path>            # Workspace root
```

---

## Common Patterns

### Fresh Project
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:scaffold
```

### Continue Existing
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:content \
  --allow-nonempty
```

### Quick Status Check
```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
npx tsx axion/scripts/axion-next.ts --root ./MyApp
```

### Development Build
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty --override
```
