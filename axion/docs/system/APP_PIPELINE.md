# App Pipeline

The app pipeline transforms locked documentation into a running application.

## Pipeline Stages

```
scaffold-app → build → test → deploy → activate → run-app
```

| Stage | Purpose | Output |
|-------|---------|--------|
| `scaffold-app` | Generate app skeleton | `app/` directory with code structure |
| `build` | Compile and bundle | Build artifacts |
| `test` | Run test suite | `registry/test_report.json` |
| `deploy` | Deploy to target | Deployment URL |
| `activate` | Set active build pointer | `ACTIVE_BUILD.json` |
| `run-app` | Start application | Running server |

---

## scaffold-app

Creates the application skeleton based on locked documentation.

### Prerequisites
- Docs must be locked (or use `--override`)

### Output Structure
```
app/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── README.md
├── client/
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── pages/
│   │       ├── Home.tsx
│   │       └── NotFound.tsx
├── server/
│   ├── index.ts
│   └── routes.ts
└── shared/
    └── schema/
        ├── index.ts
        └── tables.ts
```

### Usage
```bash
npx tsx axion/scripts/axion-scaffold-app.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

Or via orchestrator:
```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap
```

---

## build

Compiles the application.

### Prerequisites
- scaffold-app must complete

### Usage
```bash
npx tsx axion/scripts/axion-build.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

---

## test

Runs the test suite.

### Output
Creates `registry/test_report.json`:
```json
{
  "generated_at": "2026-02-04T10:00:00Z",
  "passed": true,
  "total": 42,
  "passed_count": 42,
  "failed_count": 0,
  "suites": [...]
}
```

### Usage
```bash
npx tsx axion/scripts/axion-test.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

---

## deploy

Deploys the application to target environment.

### Prerequisites
- Tests must PASS (or use `--override`)

### Usage
```bash
npx tsx axion/scripts/axion-deploy.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

---

## activate

Sets the active build pointer after successful deployment.

### Prerequisites (Gates)
1. **docs_locked** - All modules must be locked
2. **verify_pass** - Latest verify must PASS
3. **tests_pass** - Tests must PASS (or `--allow-no-tests`)

### Output
Creates `ACTIVE_BUILD.json` at build root:
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

### Usage
```bash
npx tsx axion/scripts/axion-activate.ts \
  --build-root /path/to/build \
  --project-name "MyApp" \
  --allow-no-tests  # Skip test requirement
```

---

## run-app

Starts the application in development mode.

### Usage
```bash
npx tsx axion/scripts/axion-run-app.ts \
  --build-root /path/to/build \
  --project-name "MyApp"
```

---

## Full App Workflow

```bash
# 1. Scaffold (requires locked docs or --override)
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty --override

# 2. Build
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:build \
  --allow-nonempty

# 3. Test
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:test \
  --allow-nonempty

# 4. Deploy
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:ship \
  --allow-nonempty

# 5. Activate
npx tsx axion/scripts/axion-activate.ts \
  --build-root . --project-name MyApp

# 6. Run
npx tsx axion/scripts/axion-run-app.ts \
  --build-root . --project-name MyApp
```

---

## Stage Plans Reference

| Plan | Stages | Use Case |
|------|--------|----------|
| `app:bootstrap` | scaffold-app | Create app skeleton only |
| `app:build` | build | Compile only |
| `app:test` | test | Run tests only |
| `app:full` | scaffold-app, build, test | Complete app pipeline |
| `app:ship` | deploy | Deploy only |
