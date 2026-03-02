# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions, resolves standards, builds canonical specs, plans work, fills templates, runs gates, and packages everything into versioned "kits" for agent consumption.

## Current State
Run spine implemented — 11-stage pipeline (S0–S10) with stage→gate mapping, sequential run_id allocation (RUN-NNNNNN), stage reports, and artifact indexing. CLI supports `axion init`, `axion run start`, `axion run stage`, and full `axion run`. All stubs throw `NotImplementedError` or write placeholder JSON artifacts. Zero TypeScript errors.

### File Counts
- **105 non-empty .ts source files** (including new `runStage.ts`)
- **50 docs_system specification files** (fully written system contracts)
- **177 filled template .md files** (zero empty — all Groups 1–4 filled from source PDFs)
  - Group 1 Product Definition: 38 templates (PRD, URD, STK, DMG, RSC, RISK, BRP, SMIP)
  - Group 2 Experience Design: 43 templates (DES, IXD, CDX, DSYS, IAN, A11YD, RLB, VAP)
  - Group 3 System Architecture: 52 templates (ARC, SIC, SBDT, PMAD, ERR, RTM, WFO, APIG)
  - Group 4 Data & Information: 44 templates (DATA, DLR, DGL, DQV, SRCH, CACHE, RPT)
  - Groups 5–8: empty directories only (Application Build, Integrations, Security, Operations)
- **136 non-empty feature doc files** (17 features × 8 docs each)
- **17 non-empty feature registry JSON files**
- **9 non-empty global registry JSON files**
- **8 non-empty library JSON files** (intake schemas, standards packs, template index with 177 entries)
- **11 non-empty test files** (unit + integration + helpers)

## Project Structure
All source code lives under `Axion/`:

- `Axion/src/` — TypeScript source
  - `cli/` — CLI entry (`axion.ts`) and commands (init, runControlPlane, runStage, planWork, runGates, packageKit, verify, writeState, writeProof, validateIntake, resolveStandards, buildSpec, fillTemplates, generateKit, exportBundle, release, repro)
  - `core/` — Domain modules (16 modules):
    - Pipeline: intake, standards, canonical, templates, planning, kit, state
    - Enforcement: controlPlane, gates, verification, proofLedger
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy, ids
  - `types/` — Shared type definitions (RunManifest, StageRun, StageReport, StageId, ArtifactIndexEntry, etc.)
  - `utils/` — Utilities (writeJson, readJson, appendJsonl, ensureDir, sha256, isoNow, NotImplementedError)
- `Axion/.axion/` — Runtime artifact root (gitignored, created by `axion init`)
- `Axion/docs_system/` — 50 system docs across 12 domains (SYS, INT, CAN, STD, TMP, ORD, PLAN, VER, KIT, STATE, GOV, EXEC)
- `Axion/libraries/` — Persistent system assets:
  - `intake/` — enums.v1.json, schema.v1.json, rules.v1.json (from INT-02/INT-03)
  - `standards/` — standards_index.json + 3 packs (eng_core, sec_baseline, qa_baseline)
  - `templates/` — template_index.json + 8 template groups (177 total .md files)
- `Axion/registries/` — 9 global registry JSON files
- `Axion/features/` — 17 feature packs (FEAT-001 through FEAT-017), each with 00_registry.json + 8 doc files
- `Axion/test/` — Unit tests, integration tests, fixtures, helpers
- `Axion/scripts/` — Dev convenience shell scripts

## CLI Commands
```bash
cd Axion
npx tsx src/cli/axion.ts init                                  # Initialize .axion/ + run_counter.json
npx tsx src/cli/axion.ts run start                             # Allocate RUN-NNNNNN, write manifest + S0_INIT
npx tsx src/cli/axion.ts run stage <run_id> <stage_id>         # Execute a single stage
npx tsx src/cli/axion.ts run                                   # Full run: init + start + all 10 stages
npx tsc --noEmit                                               # Type check (zero errors)
```

## Run Spine (output of `axion run`)
Run IDs: `RUN-NNNNNN` (sequential, from `.axion/run_counter.json`)

Under `.axion/runs/RUN-NNNNNN/`:
- `run_manifest.json` — Full manifest with pipeline, stage_order, stage_gates, gates_required
- `artifact_index.json` — Index of all artifacts with sha256 hashes
- `stage_reports/S0_INIT.json` through `stage_reports/S10_CLOSE.json` — Per-stage reports
- Subdirectories: intake, standards, canonical, planning, templates, gates, proof, verification, kit, state

### Pipeline Stages
S0_INIT → S1_INGEST_NORMALIZE → S2_INTAKE_VALIDATION → S3_STANDARDS_RESOLUTION → S4_CANONICAL_BUILD → S5_TEMPLATE_SELECTION → S6_PLAN_GENERATION → S7_TEMPLATE_FILL → S8_GATE_EVALUATION → S9_KIT_PACKAGE → S10_CLOSE

### Stage→Gate Mapping
- S2→G1_INTAKE_VALIDITY, S4→G2_CANONICAL_INTEGRITY, S3→G3_STANDARDS_RESOLVED
- S5→G4_TEMPLATE_SELECTION, S7→G5_TEMPLATE_COMPLETENESS, S6→G6_PLAN_COVERAGE
- S8→G7_VERIFICATION, S9→G8_PACKAGE_INTEGRITY

### MVP Required Gates
G1_INTAKE_VALIDITY, G2_CANONICAL_INTEGRITY, G3_STANDARDS_RESOLVED, G6_PLAN_COVERAGE, G8_PACKAGE_INTEGRITY

## Tech Stack
- TypeScript (strict mode, ES2022 target, Node16 module resolution)
- tsx (dev runner)
- Node.js >= 18
- ESM imports with `.js` extensions (Node16 resolution)

## Key Config Files
- `Axion/package.json`, `Axion/tsconfig.json`, `Axion/.gitignore`
- `Filetree.md` — Canonical file tree reference
