# Quickstart

Get from zero to a running AXION-generated application.

## Prerequisites

- Node.js 20+
- `tsx` installed (`npm install -g tsx`)
- A build root directory with `axion/` in it

---

## 1. Create a Workspace

```bash
npx tsx axion/scripts/axion-kit-create.ts \
  --build-root . \
  --project-name MyApp
```

This creates `MyApp/` as a sibling to `axion/` with the standard directory structure (`source_docs/`, `domains/`, `registry/`, `app/`).

## 2. Add Product Docs

Place your project specs in the workspace:

```
MyApp/source_docs/product/RPBS_Product.md    # Project brief
MyApp/source_docs/product/REBS_Product.md    # Requirements
```

These are the "Level 0" inputs that drive all downstream documentation.

## 3. Generate Documentation

Run the full docs pipeline:

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:full
```

This runs: `generate → seed → draft → content-fill → review → verify`

## 4. Lock Documentation

If verify passes, lock the docs:

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan docs:release \
  --allow-nonempty
```

## 5. Scaffold the Application

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty
```

This generates `MyApp/app/` with `client/`, `server/`, `shared/`, and `package.json`.

## 6. Build and Test

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:full \
  --allow-nonempty
```

## 7. Activate and Run

```bash
npx tsx axion/scripts/axion-activate.ts \
  --build-root . --project-name MyApp

npx tsx axion/scripts/axion-run-app.ts \
  --build-root . --project-name MyApp
```

---

## Check Status Anytime

```bash
npx tsx axion/scripts/axion-status.ts --root ./MyApp
npx tsx axion/scripts/axion-next.ts --root ./MyApp
```

---

## Development Shortcuts

Skip gates during rapid iteration:

```bash
npx tsx axion/scripts/axion-run.ts \
  --build-root . --project-name MyApp \
  --preset system --plan app:bootstrap \
  --allow-nonempty --override
```

---

## Using the Dashboard

The web dashboard provides a visual interface for the entire pipeline. Start it with:

```bash
npm run dev
```

From the dashboard you can:

- Create assemblies (project ideas)
- Run the pipeline with real-time SSE streaming
- Retry from failed steps
- Trigger individual pipeline actions
- View pipeline logs and performance metrics
- Export Agent Kits as zip bundles

---

## Next Steps

- [PIPELINE_OVERVIEW.md](PIPELINE_OVERVIEW.md) — Full stage details and plan mapping
- [WORKSPACE_LAYOUT.md](WORKSPACE_LAYOUT.md) — File tree and two-root architecture
- [CLI_REFERENCE.md](CLI_REFERENCE.md) — All scripts with flags
- [RELEASE_GATES.md](RELEASE_GATES.md) — Gate enforcement rules
