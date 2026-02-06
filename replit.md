# AXION Documentation System - Test Suite

## Overview

This repl is dedicated to developing, enhancing, and testing the AXION documentation-first development system. AXION generates comprehensive "Agent Kits" for AI-guided software development.

## Project Structure

```
/
├── axion/                  # AXION system code
│   ├── config/             # Configuration files (domains, presets, stack profiles)
│   ├── scripts/            # AXION TypeScript CLI scripts (30 scripts)
│   ├── templates/          # Document templates for each module
│   ├── tests/              # Legacy test suites
│   └── docs/               # AXION documentation
├── tests/                  # Vitest test suite
│   ├── unit/               # Unit tests for individual scripts
│   ├── integration/        # Pipeline and module dependency tests
│   ├── validation/         # Template and config validation
│   ├── core/               # Core System Contract tests
│   ├── e2e/                # End-to-end workflow tests
│   └── helpers/            # Test utilities
├── vitest.config.ts        # Vitest configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies (vitest, tsx, typescript)
```

## Running Tests

```bash
# Run all tests
npx vitest run

# Run specific test categories
npx vitest run tests/unit
npx vitest run tests/integration
npx vitest run tests/validation
npx vitest run tests/core
npx vitest run tests/e2e

# Watch mode for development
npx vitest

# Run with coverage
npx vitest run --coverage
```

## Release Gate

The release gate validates the entire AXION system before upgrades:

```bash
# Run full release check (TypeScript version)
npx tsx axion/scripts/axion-release-check.ts

# Run with optional checks (e.g., real-results)
npx tsx axion/scripts/axion-release-check.ts --include-optional

# Run specific check only
npx tsx axion/scripts/axion-release-check.ts --filter e2e-portability

# Output JSON report only (logs to stderr)
npx tsx axion/scripts/axion-release-check.ts --json

# Legacy shell gate (deprecated)
./tests/release-gate.sh
```

### Release Check Options

| Option | Description |
|--------|-------------|
| `--strict` | Treat warnings as failures (default: true) |
| `--json` | Output only JSON to stdout, logs to stderr |
| `--timeout-ms <n>` | Timeout per check in ms (default: 120000) |
| `--include-optional` | Run optional checks (e.g., real-results) |
| `--filter <id>` | Run only specific check(s), comma-separated |

### Report Artifact

Located at `axion/registry/release_gate_report.json`:

```json
{
  "version": "1.0.0",
  "generated_at": "2026-02-05T21:30:00Z",
  "producer": { "script": "axion-release-check", "revision": 1 },
  "duration_ms": 45000,
  "passed": true,
  "logs_dir": "axion/registry/release_gate_logs/release_2026-02-05T21-30-00/",
  "checks": [...],
  "failures": [...],
  "next_commands": [...]
}
```

## Test Coverage

The test suite includes:

### Unit Tests (17 tests)
- Kit creation argument validation
- Kit structure creation
- Manifest generation
- RPBS seeding with project descriptions
- Config file validation (domains, presets, stack profiles)

### Validation Tests (102 tests)
- Script existence and structure
- Template completeness
- Config file validation

### Integration Tests (8 tests)
- Module dependency graph validation
- Topological ordering
- Pipeline flow
- Config file consistency

### Core Contract Tests (33 tests)
- **Pipeline Definition**: Stage order, module ordering, dependency gating, preset configurations
- **Reason Codes**: Registry validation, script-level codes, blocked_by semantics
- **Output Contracts**: JSON stdout contract, manifest schema, artifact locations
- **Two-Root Safety**: System root protection, kit isolation

### E2E Tests (9 tests)
- Full kit creation workflow
- Kit isolation
- Snapshot integrity
- README generation

### E2E Suite Tests (tests/suites/)

**Two-Root Golden Path** (`e2e.two-root.test.ts`):
- Full workflow: kit-create → scaffold-app → build-plan → test → activate → run-app dry-run
- Validates documentation-first pipeline gates (docs_locked, verify_pass)
- Two-root safety assertions (no system pollution, artifacts under workspace)
- Uses temp workspace at `.axion_test_runs/<run_id>/` (cleanup on PASS, preserve on FAIL)

**Real Results Smoke Test** (`e2e.real-results.test.ts`):
- Spawns scaffolded app and polls `/api/health` endpoint
- Hardened implementation:
  - Reliable port reservation via OS-assigned port
  - Spawn via `node --import tsx` (more reliable than npx)
  - Deadline-based polling (25s) with bounded backoff (100ms → 500ms)
  - Early-exit detection with stderr capture
  - Guaranteed process cleanup (SIGTERM → wait → SIGKILL)
- Records metrics: startup_ms, health_latency_ms, response body
- Writes `real_test_report.json` to registry/
- Optional in release gate (requires npm install)

**Concurrency/Run-Lock Tests** (`e2e.concurrency.test.ts`):
- Validates run lock mechanism that prevents concurrent executions
- Tests:
  - Lock schema validation (version, run_id, created_at, pid, command, args)
  - Lock lifecycle (create on run, release on completion)
  - Stale lock detection (30 minute threshold)
  - Stale lock auto-cleanup
  - Corrupted lock file handling
  - --unlock-if-stale workspace path resolution in two-root mode
  - MISSING_WORKSPACE_CONTEXT failure when project name cannot be resolved
- Uses temp workspace at `.axion_test_runs/<run_id>/` (cleanup on PASS)
- Required in release gate (Step 5d)

**Kit Portability Tests** (`e2e.portability.test.ts`):
- Validates the "universal kit" claim: kits can be moved/copied and still work
- Test phases:
  1. Create kit at location A (kit-create, scaffold-app, activate)
  2. Copy entire build root from A to B
  3. Re-activate in location B (rewrites ACTIVE_BUILD.json)
  4. Run doctor on relocated kit
  5. Run run-app --dry-run on relocated kit
  6. Scan for hardcoded original paths (fail if found)
- Proves kits have no hidden coupling to original filesystem location
- Uses temp workspace at `.axion_test_runs/<run_id>/` (cleanup on PASS)
- Required in release gate (Step 5e)

**Atomic Writes Tests** (`e2e.atomic-writes.test.ts`):
- Validates crash resilience via atomic write patterns (write-to-tmp + rename)
- Tests:
  1. Target artifact survives AFTER_TMP_WRITE failpoint (verify_report.json unchanged after crash)
  2. Orphan .tmp cleanup on next run (stale tmp files from interrupted runs are removed)
  3. Corrupt .tmp doesn't poison reads (valid artifacts read correctly despite corrupt tmp files)
- Uses `AXION_FAILPOINT` env var to simulate crash conditions
- Critical artifacts protected: verify_report.json, stage_markers.json, run.lock, ACTIVE_BUILD.json
- Proves kits survive agent interruptions mid-write
- Uses temp workspace at `.axion_test_runs/<run_id>/` (cleanup on PASS)
- Required in release gate (Step 5f)

**Multi-Build Routing Tests** (`e2e.multi-build-routing.test.ts`):
- Validates pointer-explicit build switching is deterministic and isolated
- Why pointer-explicit mode is required: `axion-run-app` defaults to CWD-relative
  ACTIVE_BUILD.json which makes multi-build routing flaky under automation.
  Using `--pointer` guarantees deterministic resolution regardless of working directory.
- Tests:
  1. Pointer-explicit switching: Creates two kits (A, B), provisions each
     (kit-create → scaffold-app → activate), runs four dry-runs alternating
     A/B pointers, asserts `resolved_app_path` starts with correct build root
  2. CWD-relative default pointer: Spawns `run-app --dry-run` with `cwd=A`
     and no `--pointer`, asserts resolution under A; repeats for B
- Safety assertions:
  - Hash-compare both ACTIVE_BUILD.json files before/after all runs (no cross-contamination)
  - No writes into system snapshots (pollution check)
- Uses temp workspace at `.axion_test_runs/<run_id>/` (cleanup on PASS)
- Required in release gate

**Build Executor Tests** (`e2e.build-exec.test.ts`):
- Validates the axion-build-exec.ts implementation executor
- Tests:
  1. Dry-run golden path: plan in → manifest JSON out, no files created/modified (hash snapshot)
  2. Apply creates file + writes report: manifest with create_file op, file appears with correct content, build_exec_report.json written atomically
  3. Guard refusal: refuses without lock_manifest.json (DOCS_NOT_LOCKED), actionable hints
- Provisions full workspace (kit-create → scaffold-app → build-plan) in beforeAll
- Uses temp workspace at `.axion_test_runs/<run_id>/` (cleanup on PASS)
- Required in release gate

**Release Check Tests** (`release-check.test.ts`):
- Validates the axion-release-check.ts script output and behavior
- Tests:
  1. Report schema validation (version, generated_at, producer, checks, failures)
  2. Check entries contain required fields (id, name, passed, duration_ms, log_path)
  3. Optional checks marked as skipped when --include-optional not set
  4. --filter option runs only specified checks
  5. --json flag outputs JSON to stdout, human logs to stderr
  6. Log files created for each check run
- 8 tests total

## Atomic Writer Library

Located at `axion/lib/atomic-writer.ts`, provides crash-resilient file writing:

```typescript
// API
writeJsonAtomic(path: string, data: unknown, opts?: AtomicWriteOptions): void;
writeTextAtomic(path: string, text: string, opts?: AtomicWriteOptions): void;
cleanupOrphanTmp(dir: string, pattern?: RegExp): { removed: string[]; errors: string[] };

// Failpoints for testing (via AXION_FAILPOINT env var)
type Failpoint = 'AFTER_TMP_WRITE' | 'BEFORE_RENAME';
```

Pattern: Write to `.{basename}.tmp`, then atomic rename. Original file preserved if crash occurs.

## AXION Pipeline Stages

1. **kit-create** - Initialize a new Agent Kit workspace
2. **docs:scaffold** - Generate module documentation structure (generate + seed)
3. **docs:content** - Fill documentation with AI-generated content (draft + review + verify)
4. **docs:full** - Run scaffold + content in sequence
5. **app:bootstrap** - Generate application boilerplate
6. **build-exec** - Execute build plan into code (generate manifest → apply file ops)

## Running AXION Commands

```bash
# Create a new kit
npx tsx axion/scripts/axion-kit-create.ts --target ./my-kit --project-name MyProject

# Check status
npx tsx axion/scripts/axion-status.ts --build-root ./my-kit

# Run doctor to check system health
npx tsx axion/scripts/axion-doctor.ts

# Build execution: dry-run (emit manifest, no writes)
npx tsx axion/scripts/axion-build-exec.ts --dry-run --build-root ./my-kit --project-name MyProject --json

# Build execution: apply from manifest
npx tsx axion/scripts/axion-build-exec.ts --apply --manifest ./manifest.json --build-root ./my-kit --project-name MyProject --json
```

## Module System

19 domain modules with defined dependencies:
- **Foundation**: architecture, systems, contracts
- **Data**: database, data
- **Security**: auth
- **Application**: backend, integrations, state, frontend, fullstack
- **Quality**: testing, quality, security, devops, cloud, devex
- **Clients**: mobile, desktop

## Core System Contracts

### Pipeline Guarantees
- Stages execute in order: generate → seed → draft → review → verify → lock
- Module dependencies enforced before execution
- Presets define module scopes with optional guards

### Diagnostic Guarantees
- Reason codes use SCREAMING_SNAKE_CASE
- blocked_by responses include: status, stage, missing list, runnable hints
- Known codes: MISSING_SECTION, TBD_IN_REQUIRED, DEP_NOT_VERIFIED, SEAM_*

### Interface Guarantees
- Kit-create emits JSON with status, stage, kit_root, manifest_path
- Manifest includes version, created_at, project_name, expected_commands
- Artifacts in predictable locations under kit root

## AXION Upgrade Workflow

When upgrading AXION, follow the contracted change workflow:

### 1. Write Change Contract
Create `axion/changes/{feature-name}.md` using the template. This documents:
- Problem being solved
- Scope and affected scripts
- Contract changes (stdout JSON, schemas, reason codes)
- Test plan and rollout strategy

### 2. Add Fixtures
Create fixtures in `tests/fixtures/` that demonstrate expected behavior:
- `blocked_by/` - Scenarios that should block
- `security_gate/` - Security policy violations
- `schema_change/` - Migration test data

### 3. Write Tests First
Add/update tests before implementation. Tests should assert:
- Exact reason codes
- Required JSON fields
- Artifact schema correctness

### 4. Implement (Behind Flag if Risky)
Use feature flags in `axion/config/system.json`:
```json
{
  "feature_flags": {
    "strict_root_safety": { "enabled": true },
    "require_template_hash_match": { "enabled": false }
  }
}
```

### 5. Run Release Gate
```bash
./tests/release-gate.sh
```
All checks must pass before considering the upgrade complete.

### 6. Update Changelog
Document changes in `axion/CHANGELOG.md`.

## Development Notes

- Tests use temp directories in `tests/temp/` which are auto-cleaned
- Test timeout is 30 seconds for long-running kit operations
- Tests run sequentially (fileParallelism: false) for isolation
