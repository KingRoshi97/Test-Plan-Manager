# Pipeline Overview

AXION's pipeline transforms a project idea into locked documentation and then into a running application. Every stage produces artifacts that downstream stages depend on.

## Two Pipelines

AXION has two sequential pipelines. The documentation pipeline runs first; the app pipeline consumes its output.

```
Documentation Pipeline
  generate → seed → draft → content-fill → review → verify → lock

App Pipeline
  scaffold-app → build → test → deploy → activate → run-app
```

---

## Documentation Pipeline

The documentation pipeline creates, populates, validates, and locks module documentation across all domains.

| Stage | Purpose | Primary Output |
|-------|---------|----------------|
| `generate` | Create module directory structure | `domains/<module>/` scaffolding |
| `seed` | Populate templates from RPBS/REBS | Filled `.md` templates per module |
| `draft` | AI-generate detailed documentation content | Expanded `.md` files |
| `content-fill` | Scan for UNKNOWN placeholders and fill them | Resolved template content |
| `review` | AI-review documentation quality | Review annotations |
| `verify` | Validate docs against contracts | `registry/verify_report.json` |
| `lock` | Freeze docs (make immutable) | `registry/locks/<module>.json` |

### Stage Ordering

Stages execute in strict order. Each stage requires its predecessor:

- `seed` requires `generate`
- `draft` requires `seed`
- `review` requires `draft`
- `verify` requires `review`
- `lock` requires `verify` with status `pass`

See [RELEASE_GATES.md](RELEASE_GATES.md) for the full gate enforcement rules.

### Per-Module Iteration

The orchestrator runs documentation stages per-module, respecting dependency ordering. If module `frontend` depends on `contracts` and `state`, those modules complete each stage before `frontend` begins it.

---

## App Pipeline

The app pipeline transforms locked documentation into a running application.

```
scaffold-app → build → test → deploy → activate → run-app
```

| Stage | Purpose | Primary Output |
|-------|---------|----------------|
| `scaffold-app` | Generate application skeleton from locked docs | `app/` directory with code structure |
| `build` | Compile and bundle the application | Build artifacts |
| `test` | Execute the test suite | `registry/test_report.json` |
| `deploy` | Deploy build artifacts to a target environment | Deployment URL |
| `activate` | Set the active build pointer (release selection) | `ACTIVE_BUILD.json` |
| `run-app` | Start the application in dev mode | Running server |

### scaffold-app

Creates the application skeleton based on locked documentation.

**Prerequisites:** Docs must be locked (or the run must use `--override`).

**Output layout:**
```
app/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── README.md
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       └── pages/
│           ├── Home.tsx
│           └── NotFound.tsx
├── server/
│   ├── index.ts
│   └── routes.ts
└── shared/
    └── schema/
        ├── index.ts
        └── tables.ts
```

**Run directly:**
```bash
npx tsx axion/scripts/axion-scaffold-app.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

**Run via orchestrator (recommended):**
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap
```

### build

Compiles the application produced by scaffold-app.

**Prerequisites:** `scaffold-app` must complete.

```bash
npx tsx axion/scripts/axion-build.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

### test

Runs the test suite for the built application.

**Output:** Writes `registry/test_report.json`:
```json
{
  "generated_at": "2026-02-04T10:00:00Z",
  "passed": true,
  "total": 42,
  "passed_count": 42,
  "failed_count": 0,
  "suites": []
}
```

```bash
npx tsx axion/scripts/axion-test.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

### deploy

Deploys the application to the target environment.

**Prerequisites:** Tests must pass (or the run must use `--override`).

```bash
npx tsx axion/scripts/axion-deploy.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

### activate

Sets the active build pointer after successful deployment. This is the release selection step — it records "this build is now active" in a durable metadata file.

**Activation gates:**

| Gate | Requires | Override |
|------|----------|----------|
| `docs_locked` | All modules locked | No |
| `verify_pass` | Latest verify PASS | No |
| `tests_pass` | Tests PASS | `--allow-no-tests` |

**Output:** Creates `ACTIVE_BUILD.json` at the build root:
```json
{
  "project_name": "MyApp",
  "activated_at": "2026-02-04T12:00:00Z",
  "workspace_root": "/path/to/MyApp",
  "app_path": "/path/to/MyApp/app",
  "docs_locked": true,
  "verify_passed": true,
  "tests_passed": true
}
```

```bash
npx tsx axion/scripts/axion-activate.ts \
  --build-root /path/to/build \
  --project-name "MyApp" \
  --allow-no-tests
```

### run-app

Starts the application in development mode.

```bash
npx tsx axion/scripts/axion-run-app.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

---

## Orchestrator Plan Mapping

Plans define which stages to run. The orchestrator (`axion-run.ts`) looks up plans in `config/presets.json`.

| Plan | Stages | Use Case |
|------|--------|----------|
| `docs:full` | generate → seed → draft → content-fill → review → verify | Complete docs pipeline |
| `docs:release` | verify → lock | Quality gate and lock |
| `app:bootstrap` | scaffold-app | Create app skeleton only |
| `app:build` | build | Compile only |
| `app:full` | scaffold-app → build → test | End-to-end app validation |
| `app:build-exec` | scaffold-app → build-plan → build-exec → test | Build with execution plan |
| `app:ship` | deploy | Deploy only |
| `system:full` | generate → … → deploy → package | Everything end-to-end |
| `system:import` | import | Analyze existing codebase |
| `export:package` | package | Export Agent Kit artifact |

---

## Full Workflow (End-to-End)

```bash
# 1) Scaffold docs
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:full

# 2) Lock docs
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:release \
  --allow-nonempty

# 3) Scaffold app (requires locked docs or --override)
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty

# 4) Build and test
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:full \
  --allow-nonempty

# 5) Deploy
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:ship \
  --allow-nonempty

# 6) Activate
npx tsx axion/scripts/axion-activate.ts \
  --build-root . --project-name MyApp

# 7) Run (dev)
npx tsx axion/scripts/axion-run-app.ts \
  --build-root . --project-name MyApp
```

---

## Core Concepts

### Locked Documentation

The app pipeline assumes documentation inputs are locked (stable, release-ready). Stages may allow bypass via `--override`, but the default posture is: no app scaffold from drifting specs.

### Build Root

`--build-root` is the parent directory that contains both `axion/` and the workspace. It is where AXION writes build outputs and metadata (including `ACTIVE_BUILD.json`).

### Project Name

`--project-name` names the generated workspace and is used to locate or create the workspace directory under the build root.

### Where Outputs Live

| Artifact | Location |
|----------|----------|
| Module documentation | `<workspace>/domains/<module>/` |
| Stage markers | `<workspace>/registry/stage_markers.json` |
| Verify report | `<workspace>/registry/verify_report.json` |
| Lock records | `<workspace>/registry/locks/<module>.json` |
| Test report | `<workspace>/registry/test_report.json` |
| Run history | `<workspace>/registry/run_history/` |
| Active build | `<build-root>/ACTIVE_BUILD.json` |
| Application code | `<workspace>/app/` |

See [WORKSPACE_LAYOUT.md](WORKSPACE_LAYOUT.md) for the complete file tree.
