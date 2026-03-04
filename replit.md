# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, runs gates, writes proof ledger entries, and packages everything into versioned "kits." Every pipeline stage produces real, derived artifacts — no placeholders.

## Current State
Full Mechanics pipeline implemented with 10 stages, 7 enforced gates (G1–G6, G8), ICP RunController orchestration, run profile resolution, secrets/PII scanning, variant-filtered kit packaging, hash-chained proof ledger, retention/pruning, and deterministic repro. All stages pass, all gates pass, zero TypeScript errors.

### Key Numbers
- **105+ non-empty .ts source files**
- **446 filled template .md files** (8 groups)
- **395 KID knowledge files** (3 pillars)
- **12 registry JSON files**
- **17 CLI commands** (all wired)
- **22 core modules** (15 real, 7 auxiliary stubs)
- **241 artifacts per run** (real, derived)

## Architecture
Two top-level directories: `App/` (UI + backend) → `Axion/` (pipeline engine).
- App uses a Vite plugin backend (`App/server/index.ts`) that adds Express middleware directly to the dev server
- One process, one port (5000), no CORS — the Vite plugin spawns Axion CLI commands as child processes
- API returns structured responses with action outcomes + artifact pointers; App renders real artifacts via pointer reads
- All screens are wired to real API calls — Dashboard actions, Runs list, RunDetail with stage execution, artifact/log drawers

## Project Structure

### App/ — Operator Console (React + Vite + TypeScript)
Internal-only UI for operating AXION. Port 5000 (webview workflow).
- **11 screens**: Dashboard(/), Runs(/runs), RunDetail(/runs/:runId), GateFailures(/runs/:runId/gates), Verify(/runs/:runId/verify), Kits(/runs/:runId/kits), ProofLedger(/runs/:runId/proofs), Registries(/registries), Commands(/commands), Knowledge(/knowledge), Settings(/settings)
- **15 components**: Layout, Nav, StatusBadge, IdPill, DataTable, JsonViewer, ArtifactLink, ArtifactDrawer, LogDrawer, ActionBar, StartRunForm, ActionResultPanel, StageTimeline, GateReportViewer
- **Design system**: CSS custom properties — dark mode (#0f1117 base), indigo accent (#6366f1), emerald accent (#10b981), Inter font stack, JetBrains Mono for code

### App/server/ — Vite Plugin Backend
Express middleware injected into Vite dev server via `axionApiPlugin()`. Spawns Axion CLI as child processes.
- **API surface (11 endpoints)**:
  - POST: /api/doctor, /api/run/start, /api/run/advance, /api/run/stage, /api/run/gates, /api/run/full
  - GET: /api/runs, /api/runs/:run_id, /api/artifact?path=, /api/log?path=, /api/stages

### Axion/ — Pipeline Engine
- `src/cli/` — CLI entry (`axion.ts`) and 17 commands
- `src/core/` — 22 domain modules (intake, canonical, standards, templates, planning, kit, gates, proofLedger, controlPlane, scanner, state, repro, verification, kitControlPlane, maintenanceControlPlane, artifactStore, cache, coverage, diff, ids, refs, taxonomy)
- `src/types/` — Shared type definitions
- `src/utils/` — Utilities (writeJson, sha256, isoNow, canonicalJson, etc.)
- `.axion/` — Runtime artifact root (gitignored)
- `docs_system/` — 50 system docs across 12 domains
- `libraries/` — intake schemas, 3 standards packs, 446 templates, 395 knowledge items
- `registries/` — 12 global registry JSON files
- `features/` — 17 feature packs

## Pipeline Stages (Mechanics Order)
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
| S9_VERIFY_PROOF | G7_VERIFICATION | No (not yet) |
| S10_PACKAGE | G8_PACKAGE_INTEGRITY | Yes |

## CLI Commands
```bash
cd Axion
npx tsx src/cli/axion.ts run                                   # Full run: ICP RunController orchestration
npx tsx src/cli/axion.ts run start [--submission <path>]       # Create new run with profile resolution
npx tsx src/cli/axion.ts run stage <run_id> <stage_id>         # Execute single stage
npx tsx src/cli/axion.ts run gates <run_id> <stage_id>         # Run gates for a stage
npx tsx src/cli/axion.ts validate-intake <path> [version]       # Validate intake submission
npx tsx src/cli/axion.ts build-spec <run_dir>                  # Build canonical spec
npx tsx src/cli/axion.ts resolve-standards <run_dir>           # Resolve standards
npx tsx src/cli/axion.ts fill-templates <run_dir>              # Fill templates
npx tsx src/cli/axion.ts repro <run_id> [output_path]          # Reproduce run deterministically
npx tsx src/cli/axion.ts generate-kit <run_dir> [--variant]    # Generate kit
npx tsx src/cli/axion.ts export-bundle <run_dir> [--profile]   # Export bundle (6 profiles)
npx tsx src/cli/axion.ts release <run_dir> <version>           # Release a completed run
npx tsx src/cli/axion.ts write-proof <run_id> <run_dir>        # Write proof entries
npx tsx src/cli/axion.ts verify <run_id> <run_dir>             # Verify run
npx tsx src/cli/axion.ts plan-work <run_id> <run_dir>          # Generate work breakdown
npx tsx src/cli/axion.ts write-state <run_id> <run_dir>        # Write state snapshot
npx tsx src/cli/axion.ts prune [--rendered-only]               # Prune old runs
npx tsc --noEmit                                               # Type check (zero errors)
```

## Gate Engine
7 enforced gates, 6 evaluator ops: file_exists, json_valid, json_has, json_eq, coverage_gte, verify_hash_manifest. Unknown operators FAIL. Gate reports written as canonical JSON.

## Proof Ledger
Hash-chained JSONL entries linking gate evidence pointers. Proof type registry enforcement. SHA-256 integrity validation.

## Kit Packaging
Variant filtering (internal/external), secrets/PII scanner (8 secret patterns + 3 PII patterns), doc file exclusion from scanner. 7 bundle profiles (full, internal, external, thin, audit, public, repro).

## Run Profiles
6 profiles (WEB_APP_BASIC, API_SERVICE_BASIC, FULLSTACK_SAAS, MOBILE_APP_BASIC, REALTIME_CHAT, DEFAULT) with match rules. 3 mode overlays (fast, strict, audit). Profile resolution + effective config written as auditable artifacts.

## Retention & Pruning
Policy-driven: max_runs=50, max_age_days=90 defaults. Golden run promotion. Doc envelopes with content hashes. `axion prune` command.

## Control Planes
- **ICP** (Internal): Orchestrates pipeline via RunController. State: QUEUED→RUNNING→RELEASED/FAILED
- **KCP** (Kit): Kit execution lifecycle. State: READY→EXECUTING→VERIFYING→COMPLETE
- **MCP** (Maintenance): Post-build lifecycle. State: PLANNED→APPLYING→VERIFYING→COMPLETE

## Tech Stack
- TypeScript (strict mode, ES2022 target, Node16 module resolution)
- tsx (dev runner)
- Node.js >= 18
- ESM imports with `.js` extensions

## Key Config Files
- `Axion/package.json`, `Axion/tsconfig.json`, `Axion/.gitignore`
- `Axion/SYSTEM_MAP.md` — Complete system map
