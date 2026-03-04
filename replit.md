# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system with a full-stack web application. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, runs gates, and packages everything into versioned "kits." The web dashboard provides a UI for creating assemblies, triggering pipeline runs, and browsing artifacts.

## Current State
Full Mechanics pipeline + web application layer. Pipeline: 10 stages, 7 enforced gates (G1–G6, G8), template selector + renderer, `json_eq` evaluator op. Web app: Express API + React dashboard + PostgreSQL database. All stages pass, all gates pass.

## Repo Layout
```
/Axion/           # Mechanics backbone (CLI pipeline, gates, templates, knowledge library)
/App/             # React frontend (Vite + TailwindCSS + React Query)
/server/          # Express API server (routes, storage, pipeline runner)
/shared/          # Shared types (Drizzle schema, DB types)
drizzle.config.ts # Drizzle ORM config
package.json      # Root package.json with all dependencies
```

## Web Application

### Tech Stack
- Express 5 (API server)
- React 19 + Vite 7 (frontend)
- TailwindCSS v4 (styling)
- Drizzle ORM + PostgreSQL (database)
- React Query (data fetching)
- wouter (routing)
- lucide-react (icons)

### Database Schema (shared/schema.ts)
- `assemblies` — project builds with status, preset, verification, run metrics
- `pipeline_runs` — individual pipeline executions with S1–S10 stage statuses (JSON)
- `module_statuses` — per-module stage tracking
- `reports` — gate reports, run completion reports

### API Endpoints (server/routes.ts)
- `GET/POST /api/assemblies` — list/create assemblies
- `GET/DELETE /api/assemblies/:id` — get/delete assembly (includes runs)
- `POST /api/assemblies/:id/run` — trigger pipeline execution
- `GET /api/assemblies/:id/runs` — list runs for assembly
- `GET /api/assemblies/:id/runs/:runId` — get run detail
- `GET /api/files?dir=` — browse artifact directories
- `GET /api/files/{path}` — read artifact file content
- `GET /api/health` — system health (stages, gates, KIDs, recent runs)
- `GET /api/config` — pipeline configuration
- `GET /api/status` — assembly status summary
- `GET /api/reports/:assemblyId` — get reports

### Pipeline Runner (server/pipeline-runner.ts)
- Spawns `npx tsx Axion/src/cli/axion.ts run` as child process
- Parses stdout for stage progress and gate results
- Updates `pipeline_runs` and `assemblies` in real-time
- Stores run_id and run artifacts path on completion

### Frontend Pages (App/src/pages/)
- `/` — Dashboard: assembly cards with status, metrics, actions
- `/new` — New Assembly: form with project name, idea, preset, start-immediately option
- `/assembly/:id` — Assembly detail: pipeline stage timeline, gate results, artifact browser, run history
- `/files` — File browser: navigate run artifact directories
- `/health` — System health: pipeline, knowledge library, templates, recent runs
- `/logs` — Run logs viewer with status filtering
- `/docs` — Document inventory: 177 templates + 395 KIDs
- `/export` — Export completed kit bundles

### Development
```bash
npm run dev          # Start dev server (Express + Vite on port 5000)
npm run build        # Build React app for production
npm run db:push      # Push database schema
```

## Mechanics Pipeline (Axion/)

### Project Structure
- `Axion/src/` — TypeScript source
  - `cli/` — CLI entry (`axion.ts`) and commands (init, runControlPlane, runStage, planWork, runGates, packageKit, verify, writeState, writeProof, validateIntake, resolveStandards, buildSpec, fillTemplates, generateKit, exportBundle, release, repro)
  - `core/` — Domain modules:
    - Pipeline: intake, standards, canonical, templates, planning, kit, state
    - Enforcement: controlPlane, gates, verification, proofLedger
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy, ids
  - `types/` — Shared type definitions (RunManifest, StageRun, StageReport, StageId, ArtifactIndexEntry, etc.)
  - `utils/` — Utilities (writeJson, readJson, appendJsonl, ensureDir, sha256, isoNow, NotImplementedError, canonicalJson)
- `Axion/.axion/` — Runtime artifact root (gitignored, created by `axion init`)
- `Axion/docs_system/` — 50 system docs across 12 domains
- `Axion/libraries/` — Persistent system assets:
  - `intake/` — enums.v1.json, schema.v1.json, rules.v1.json
  - `standards/` — standards_index.json + 3 packs
  - `templates/` — template_index.json + 8 template groups (177 total .md files)
  - `knowledge/` — Knowledge Library (395 KIDs across 3 pillars)
- `Axion/registries/` — 9 global registry JSON files
- `Axion/features/` — 17 feature packs (FEAT-001 through FEAT-017)
- `Axion/test/` — Unit tests, integration tests, fixtures, helpers

### CLI Commands
```bash
cd Axion
npx tsx src/cli/axion.ts init                                  # Initialize .axion/
npx tsx src/cli/axion.ts run                                   # Full run: all 10 stages
npx tsx src/cli/axion.ts run stage <run_id> <stage_id>         # Execute a single stage
npx tsx src/cli/axion.ts run gates <run_id> <stage_id>         # Run gates for a stage
```

### Pipeline Stages
S1_INGEST_NORMALIZE → S2_VALIDATE_INTAKE → S3_BUILD_CANONICAL → S4_VALIDATE_CANONICAL → S5_RESOLVE_STANDARDS → S6_SELECT_TEMPLATES → S7_RENDER_DOCS → S8_BUILD_PLAN → S9_VERIFY_PROOF → S10_PACKAGE

### Stage→Gate Mapping
| Stage | Gate | Enforced |
|---|---|---|
| S2_VALIDATE_INTAKE | G1_INTAKE_VALIDITY | Yes |
| S4_VALIDATE_CANONICAL | G2_CANONICAL_INTEGRITY | Yes |
| S5_RESOLVE_STANDARDS | G3_STANDARDS_RESOLVED | Yes |
| S6_SELECT_TEMPLATES | G4_TEMPLATE_SELECTION | Yes |
| S7_RENDER_DOCS | G5_TEMPLATE_COMPLETENESS | Yes |
| S8_BUILD_PLAN | G6_PLAN_COVERAGE | Yes |
| S10_PACKAGE | G8_PACKAGE_INTEGRITY | Yes |

### Gate Engine
- GATE_REGISTRY.json → registry loader → path templating → evaluator (6 ops) → gate report writer
- 6 evaluator ops: file_exists, json_valid, json_has, json_eq, coverage_gte, verify_hash_manifest

### Template System
- Selector: `libraries/templates/template_index.json` (177 templates) → 8 selected for MVP
- Renderer: placeholder resolution with `{{dotted.path}}` syntax
- Evidence: writes selection_result.json, render_report.json, rendered docs

## Knowledge Library (`Axion/libraries/knowledge/`)
Structured, policy-governed knowledge base providing KID files (Knowledge Items) across three pillars.

### Pillars (395 KID files total)
- **IT_END_TO_END** (254 KIDs): 19 domains across 4 groups
  - 01_foundations: networking, operating_systems, security_fundamentals, compute_virtualization, storage_fundamentals
  - 02_software_delivery: architecture_design, apis_integrations, ci_cd_devops, testing_qa, observability_sre
  - 03_data_systems: databases, distributed_systems, caching, search_retrieval
  - 04_platform_ops: cloud_fundamentals, identity_access_management, compliance_governance, release_management, finops_cost
- **INDUSTRY_PLAYBOOKS** (58 KIDs): healthcare, finance, retail_ecommerce, logistics_supply_chain, government_public_sector
- **LANGUAGES_AND_LIBRARIES** (83 KIDs): javascript_typescript (+ nodejs, react, nextjs), python, go, rust, databases/postgres, solidity_evm

### KID File Contract
- YAML frontmatter: kid, title, type, pillar, domains, tags, maturity, use_policy, executor_access, license
- Sections: Summary, When to use, Do/Don't, Core content, Links, Proof/confidence
