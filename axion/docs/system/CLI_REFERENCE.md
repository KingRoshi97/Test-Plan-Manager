# CLI Reference

Complete reference for all AXION scripts. Scripts live in `axion/scripts/`.

## Orchestration

### axion-run.ts
Main pipeline orchestrator. Chains stages, enforces gates, manages presets.

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root <path>      # Parent directory containing axion/ and workspace
  --project-name <name>    # Workspace folder name
  --preset <preset>        # Module preset (system, web, mobile, etc.)
  --plan <plan>            # Stage plan (docs:full, app:bootstrap, etc.)
  [--module <name>]        # Target specific module (alternative to --preset)
  [--all]                  # Target all modules (alternative to --preset)
  [--allow-nonempty]       # Continue with existing workspace
  [--archive-existing]     # Archive existing workspace first
  [--override]             # Bypass gates where allowed
  [--json]                 # JSON output mode
```

### axion-orchestrate.ts
Standalone orchestrator with additional control options.

```bash
npx tsx axion/scripts/axion-orchestrate.ts \
  --build-root <path>
  --project-name <name>
  [--plan <plan>]          # Stage plan to execute
  [--steps <steps>]        # Comma-separated stage list
  [--start-from <stage>]   # Resume from specific stage
  [--modules <modules>]    # Comma-separated module list
  [--dry-run]              # Show what would execute
  [--list-plans]           # List available plans
```

---

## Setup

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

### axion-init.mjs
Initialize fresh workspace with templates.

```bash
node axion/scripts/axion-init.mjs \
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

### axion-generate.mjs
Generate module directory scaffolds.

```bash
node axion/scripts/axion-generate.mjs \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-seed.mjs
Seed templates into modules from RPBS/REBS.

```bash
node axion/scripts/axion-seed.mjs \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-draft.mjs
AI-generate detailed documentation content.

```bash
node axion/scripts/axion-draft.mjs \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-content-fill.ts
UNKNOWN detection, doc-type-aware AI prompting, cascading fills.

```bash
npx tsx axion/scripts/axion-content-fill.ts \
  [--scan]                 # Scan for UNKNOWNs
  [--fill]                 # Fill UNKNOWNs with AI
  [--cascade]              # Fill and cascade to downstream docs
  [--find-next]            # Find next highest-priority doc with UNKNOWNs
  [--upgrade]              # Upgrade mode
```

### axion-review.mjs
AI-review documentation quality.

```bash
node axion/scripts/axion-review.mjs \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-verify.mjs
Validate documentation against contracts.

```bash
node axion/scripts/axion-verify.mjs \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

### axion-lock.mjs
Lock documentation (make immutable with checksum).

```bash
node axion/scripts/axion-lock.mjs \
  --root <path>            # Workspace root
  [--module <name>]        # Single module
  [--all]                  # All modules
```

---

## App Pipeline

### axion-scaffold-app.ts
Generate application skeleton from locked docs.

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
  --build-root <path>
  --project-name <name>
```

### axion-build-exec.ts
Execute the build plan, generating manifest and applying file operations.

```bash
npx tsx axion/scripts/axion-build-exec.ts \
  --build-root <path>
  --project-name <name>
```

### axion-build.ts
Compile application.

```bash
npx tsx axion/scripts/axion-build.ts \
  --build-root <path>
  --project-name <name>
```

### axion-test.ts
Run test suite.

```bash
npx tsx axion/scripts/axion-test.ts \
  --build-root <path>
  --project-name <name>
```

### axion-deploy.ts
Deploy application.

```bash
npx tsx axion/scripts/axion-deploy.ts \
  --build-root <path>
  --project-name <name>
  [--override]             # Bypass test gate
```

### axion-activate.ts
Set active build pointer.

```bash
npx tsx axion/scripts/axion-activate.ts \
  --build-root <path>
  --project-name <name>
  [--allow-no-tests]       # Skip test requirement
```

### axion-run-app.ts
Start application in dev mode.

```bash
npx tsx axion/scripts/axion-run-app.ts \
  --build-root <path>
  --project-name <name>
```

---

## Status and Inspection

### axion-status.ts
Show current pipeline status per module.

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
  --build-root <path>
```

---

## Analysis

### axion-import.ts
Analyze an existing repository (read-only). Produces import reports and documentation seeds without modifying source.

```bash
npx tsx axion/scripts/axion-import.ts \
  --root <path>            # Repository to analyze
```

### axion-reconcile.ts
Compare imported facts against build outputs to detect drift.

```bash
npx tsx axion/scripts/axion-reconcile.ts \
  --root <path>            # Workspace root
```

### axion-iterate.ts
Orchestration wrapper that chains primitives, enforces gates, produces `next_commands`.

```bash
npx tsx axion/scripts/axion-iterate.ts \
  --root <path>            # Workspace root
  [--allow-apply]          # Allow changes (default is dry-run)
```

---

## Maintenance

### axion-doctor.ts
Diagnose workspace issues. Checks 18 categories including active build, pollution, stale locks.

```bash
npx tsx axion/scripts/axion-doctor.ts \
  --root <path>            # Workspace root
```

### axion-repair.ts
Fix detected issues.

```bash
npx tsx axion/scripts/axion-repair.ts \
  --root <path>
```

### axion-clean.ts
Clean generated files.

```bash
npx tsx axion/scripts/axion-clean.ts \
  --root <path>
  [--dry-run]              # Show what would be deleted
```

### axion-overhaul.ts
Archive existing workspace and rebuild.

```bash
npx tsx axion/scripts/axion-overhaul.ts \
  --root <path>
```

### axion-upgrade.ts
Upgrade existing project.

```bash
npx tsx axion/scripts/axion-upgrade.ts \
  --root <path>
```

---

## Validation

### axion-docs-check.ts
Detect documentation drift. Checks script inventory, orphans, contamination, required docs.

```bash
npx tsx axion/scripts/axion-docs-check.ts
```

### axion-release-check.ts
Run release gate checks.

```bash
npx tsx axion/scripts/axion-release-check.ts \
  --root <path>
```

### axion-hash-templates.ts
Generate template content hashes.

```bash
npx tsx axion/scripts/axion-hash-templates.ts
```

### axion-verify-seams.ts
Validate seam ownership markers.

```bash
npx tsx axion/scripts/axion-verify-seams.ts \
  --root <path>
```

---

## Export

### axion-package.ts (workspace)
Export workspace as a kit artifact.

```bash
npx tsx axion/scripts/axion-package.ts \
  --build-root <path>
  --project-name <name>
  [--output <path>]        # Output path for package
```

### axion-package.mjs (domain bundles)
Create domain-based zip bundles.

```bash
node axion/scripts/axion-package.mjs \
  --root <path>
  [--module <name>]
  [--all]
```

### axion-package-workspace.mjs
Package workspace contents.

```bash
node axion/scripts/axion-package-workspace.mjs \
  --root <path>
```

---

## Script Index

All 39 scripts at a glance:

| Script | Type | Category |
|--------|------|----------|
| `axion-run.ts` | `.ts` | Orchestration |
| `axion-orchestrate.ts` | `.ts` | Orchestration |
| `axion-kit-create.ts` | `.ts` | Setup |
| `axion-prepare-root.ts` | `.ts` | Setup |
| `axion-init.mjs` | `.mjs` | Setup |
| `axion-preflight.ts` | `.ts` | Setup |
| `axion-generate.mjs` | `.mjs` | Docs Pipeline |
| `axion-seed.mjs` | `.mjs` | Docs Pipeline |
| `axion-draft.mjs` | `.mjs` | Docs Pipeline |
| `axion-content-fill.ts` | `.ts` | Docs Pipeline |
| `axion-review.mjs` | `.mjs` | Docs Pipeline |
| `axion-verify.mjs` | `.mjs` | Docs Pipeline |
| `axion-lock.mjs` | `.mjs` | Docs Pipeline |
| `axion-scaffold-app.ts` | `.ts` | App Pipeline |
| `axion-build-plan.ts` | `.ts` | App Pipeline |
| `axion-build-exec.ts` | `.ts` | App Pipeline |
| `axion-build.ts` | `.ts` | App Pipeline |
| `axion-test.ts` | `.ts` | App Pipeline |
| `axion-deploy.ts` | `.ts` | App Pipeline |
| `axion-activate.ts` | `.ts` | App Pipeline |
| `axion-run-app.ts` | `.ts` | App Pipeline |
| `axion-status.ts` | `.ts` | Inspection |
| `axion-next.ts` | `.ts` | Inspection |
| `axion-active.ts` | `.ts` | Inspection |
| `axion-import.ts` | `.ts` | Analysis |
| `axion-reconcile.ts` | `.ts` | Analysis |
| `axion-iterate.ts` | `.ts` | Analysis |
| `axion-doctor.ts` | `.ts` | Maintenance |
| `axion-repair.ts` | `.ts` | Maintenance |
| `axion-clean.ts` | `.ts` | Maintenance |
| `axion-overhaul.ts` | `.ts` | Maintenance |
| `axion-upgrade.ts` | `.ts` | Maintenance |
| `axion-docs-check.ts` | `.ts` | Validation |
| `axion-release-check.ts` | `.ts` | Validation |
| `axion-hash-templates.ts` | `.ts` | Validation |
| `axion-verify-seams.ts` | `.ts` | Validation |
| `axion-package.ts` | `.ts` | Export |
| `axion-package.mjs` | `.mjs` | Export |
| `axion-package-workspace.mjs` | `.mjs` | Export |
