# Run Orchestrator

`axion-run.ts` is the main pipeline orchestrator. It coordinates presets, plans, gates, and stage execution.

## Basic Usage

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root /path/to/build \
  --project-name "MyApp" \
  --preset <preset-name> \
  --plan <plan-name> \
  [--module <name>]       # Target specific module
  [--all]                 # Target all modules
```

---

## Presets (Module Selection)

Presets define which modules to process. From `config/presets.json`:

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

### Dependency Resolution

Presets with `include_dependencies: true` automatically include prerequisite modules:

```
frontend depends on: contracts, state
state depends on: contracts
backend depends on: contracts, database
```

So `--preset web` resolves to: `[contracts, state, frontend]`

---

## Stage Plans

Plans define which stages to run. From `config/presets.json`:

| Plan | Stages | Purpose |
|------|--------|---------|
| `docs:scaffold` | generate, seed | Create module structure |
| `docs:content` | draft, review, verify | AI-generate and validate docs |
| `docs:full` | generate → verify | Complete docs pipeline |
| `docs:release` | verify, lock | Quality gate and lock |
| `app:bootstrap` | scaffold-app | Create app skeleton |
| `app:build` | build | Compile application |
| `app:test` | test | Run test suite |
| `app:full` | scaffold-app, build, test | Full app pipeline |
| `app:ship` | deploy | Deploy application |
| `system:full` | All stages | Complete pipeline |
| `export:package` | package | Export kit artifact |

---

## Gates

Gates enforce prerequisites before stages run:

| Stage | Gate | Override |
|-------|------|----------|
| `draft` | seed must complete | No |
| `verify` | review must complete | No |
| `lock` | verify must PASS | No |
| `scaffold-app` | docs must be locked | `--override` |
| `build` | scaffold-app must complete | No |
| `deploy` | tests must PASS | `--override` |

### Using Override

```bash
# Bypass lock gate for development
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --override
```

---

## Execution Flow

```
1. Parse arguments
2. Run prepare-root (Stage 0)
3. Run preflight checks
4. Acquire lock (prevent concurrent runs)
5. Resolve modules from preset
6. For each stage in plan:
   a. Check gate prerequisites
   b. Execute stage script
   c. Update stage markers
   d. Log to run history
7. Release lock
8. Output JSON result
```

---

## Output Modes

### Human-Readable (default)
```bash
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --preset system --plan docs:scaffold
```

Shows progress with `[INFO]`, `[PASS]`, `[FAIL]` markers.

### JSON Mode
```bash
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --preset system --plan docs:scaffold --json
```

Outputs structured JSON for automation.

---

## Run History

Each run creates a history file in `registry/run_history/`:

```json
{
  "run_id": "run_2026-02-04T10-30-00_abc123",
  "started_at": "2026-02-04T10:30:00Z",
  "finished_at": "2026-02-04T10:35:00Z",
  "preset": "system",
  "plan": "docs:scaffold",
  "modules": ["architecture", "systems", ...],
  "stages_executed": ["generate", "seed"],
  "overall_status": "success",
  "stages": [
    { "stage": "generate", "status": "success", ... },
    { "stage": "seed", "status": "success", ... }
  ]
}
```

---

## Common Workflows

### New Project
```bash
# 1. Scaffold docs
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --preset system --plan docs:scaffold

# 2. Generate content
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --preset system --plan docs:content --allow-nonempty

# 3. Lock and build app
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --preset system --plan docs:release --allow-nonempty
npx tsx axion/scripts/axion-run.ts --build-root . --project-name MyApp --preset system --plan app:bootstrap --allow-nonempty
```

### Development Iteration
```bash
# Re-run content pipeline, bypass lock gate
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset web --plan docs:content \
  --allow-nonempty --override
```

### Status Check
```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
npx tsx axion/scripts/axion-next.ts --root ./MyApp
```
