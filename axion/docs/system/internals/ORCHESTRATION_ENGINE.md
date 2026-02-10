# Orchestration Engine

The orchestration engine (`axion-run.ts`) is the main entry point for pipeline execution. It coordinates presets, plans, gates, stage execution, and progress tracking.

## Basic Usage

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

---

## Execution Flow

```
1. Parse arguments
2. Run prepare-root (Stage 0)
3. Run preflight checks
4. Acquire run lock (prevent concurrent runs)
5. Resolve modules from preset (with dependency expansion if configured)
6. For each stage in plan:
   a. Check gate prerequisites
   b. For each module (respecting dependency order):
      - Execute stage script
      - Update stage markers
   c. Log to run history
7. Release run lock
8. Output result (human-readable or JSON)
```

---

## Presets (Module Selection)

Presets define which modules to process. They live in `config/presets.json` under `"presets"`.

| Preset | Modules | Description |
|--------|---------|-------------|
| `system` | All 19 | Full AXION system |
| `foundation` | architecture, systems, contracts | Core boundaries and APIs |
| `core-spec` | contracts, database, auth | Stabilize early dependencies |
| `web` | frontend, state + deps | Web application focus |
| `mobile` | mobile + deps | Mobile client |
| `desktop` | desktop + deps | Desktop client |
| `backend-api` | backend + deps | Backend service |
| `fullstack-web` | fullstack, frontend, state, backend | End-to-end web |
| `cross-platform-app` | mobile, frontend, state, backend, fullstack | Mobile + web sharing backend |
| `prelock` | All 19 (disallow lock) | Full readiness loop, stops before lock |
| `release` | All 19 (lock requires verify pass) | Verify + lock for release |

### Dependency Resolution

Presets with `include_dependencies: true` automatically include prerequisite modules. Module dependencies are defined in `config/domains.json`.

```
frontend depends on: contracts, state
state depends on: contracts
backend depends on: contracts, database
```

So `--preset web` resolves to: `[contracts, state, frontend]`

Presets with `include_dependencies: false` process only the listed modules and will block if prerequisites are missing.

---

## Stage Plans

Plans define which stages to run. They live in `config/presets.json` under `"stage_plans"`.

| Plan | Stages | Purpose |
|------|--------|---------|
| `docs:full` | generate, seed, draft, content-fill, review, verify | Complete docs pipeline |
| `docs:release` | verify, lock | Quality gate and lock |
| `app:bootstrap` | scaffold-app | Create app skeleton |
| `app:full` | scaffold-app, build, test | Full app pipeline |
| `app:build-exec` | scaffold-app, build-plan, build-exec, test | Build with execution plan |
| `system:full` | generate → … → deploy, package | Everything end-to-end |
| `system:import` | import | Analyze existing codebase |
| `export:package` | package | Export Agent Kit artifact |

---

## Stage Markers

Stage markers track pipeline progress in `<workspace>/registry/stage_markers.json`. They use a flat structure: `{ moduleName: { stageName: data } }`.

### Structure

```json
{
  "architecture": {
    "generate": {
      "completed_at": "2026-02-04T10:00:00Z",
      "status": "success"
    },
    "seed": {
      "completed_at": "2026-02-04T10:01:00Z",
      "status": "success"
    },
    "verify": {
      "completed_at": "2026-02-04T10:15:00Z",
      "status": "pass",
      "report": {}
    },
    "lock": {
      "completed_at": "2026-02-04T10:20:00Z",
      "status": "success",
      "checksum": "abc123..."
    }
  }
}
```

### Stage Status Values

| Stage | Possible Status Values |
|-------|------------------------|
| `generate` | `success`, `failed` |
| `seed` | `success`, `failed` |
| `draft` | `success`, `failed` |
| `review` | `success`, `failed` |
| `verify` | `pass`, `fail`, `partial` |
| `lock` | `success`, `failed` |

### Reading Markers

```typescript
const markers = JSON.parse(fs.readFileSync(markersPath, 'utf-8'));

const isSeeded = markers['architecture']?.['seed']?.status === 'success';

const seededModules = Object.keys(markers).filter(
  m => markers[m]?.['seed']?.status === 'success'
);
```

### Gate Checks Using Markers

```typescript
function canDraft(module: string, markers: object): boolean {
  return markers[module]?.['seed']?.status === 'success';
}

function canLock(module: string, markers: object): boolean {
  return markers[module]?.['verify']?.status === 'pass';
}
```

### Resetting Markers

```typescript
delete markers['architecture']['draft'];   // Reset single stage
delete markers['architecture'];             // Reset all stages for module
```

Or use the clean script:
```bash
npx tsx axion/scripts/axion-clean.ts --root ./MyApp
```

---

## Lock Records

The lock stage writes checksums to `<workspace>/registry/locks/`:

```json
{
  "module": "architecture",
  "locked_at": "2026-02-04T10:20:00Z",
  "files": [
    {
      "path": "domains/architecture/README.md",
      "checksum": "sha256:abc123..."
    }
  ]
}
```

---

## Verify Report

The verify stage writes `<workspace>/registry/verify_report.json`:

```json
{
  "generated_at": "2026-02-04T10:15:00Z",
  "current_revision": 1,
  "modules": {
    "architecture": {
      "status": "pass",
      "issues": [],
      "warnings": []
    },
    "backend": {
      "status": "fail",
      "issues": [
        {
          "rule": "unknown_placeholder",
          "message": "UNKNOWN placeholder found in section X",
          "severity": "error"
        }
      ]
    }
  },
  "summary": {
    "total": 19,
    "passed": 18,
    "failed": 1
  }
}
```

---

## Run History

Each run creates a history file in `<workspace>/registry/run_history/`:

```json
{
  "run_id": "run_2026-02-04T10-30-00_abc123",
  "started_at": "2026-02-04T10:30:00Z",
  "finished_at": "2026-02-04T10:35:00Z",
  "preset": "system",
  "plan": "docs:scaffold",
  "modules": ["architecture", "systems"],
  "stages_executed": ["generate", "seed"],
  "overall_status": "success",
  "stages": [
    { "stage": "generate", "status": "success" },
    { "stage": "seed", "status": "success" }
  ]
}
```

---

## Output Modes

**Human-readable (default):** Shows progress with `[INFO]`, `[PASS]`, `[FAIL]` markers.

**JSON mode (`--json`):** Outputs structured JSON for automation.

---

## Transient Failure Retry

The orchestrator retries transient failures with exponential backoff. Retried error types:

| Error | Description |
|-------|-------------|
| `ENOENT` | File not found (race condition) |
| `ETIMEDOUT` | Network timeout |
| `ECONNRESET` | Connection reset |
| Exit code `137` | OOM kill |

Retry logic lives in `scripts/lib/retry.ts`.

---

## SSE Streaming (Dashboard)

When triggered from the web dashboard, the orchestrator streams progress via Server-Sent Events:

- Step start/complete events with timing
- Per-module progress updates
- Error details on failure
- Retry attempt notifications

The Assembly Control Room in the dashboard renders this stream as a real-time stepper with step-level timing.
