# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions through a 10-stage Mechanics pipeline (S1_INGEST_NORMALIZE → S10_PACKAGE), resolves standards, builds canonical specs, selects and renders templates, plans work, runs gates, and packages everything into versioned "kits."

## Current State
Full Mechanics pipeline implemented with 10 stages, 7 enforced gates (G1–G6, G8), template selector + renderer, and `json_eq` evaluator op. All stages pass, all gates pass, zero TypeScript errors.

### File Counts
- **105+ non-empty .ts source files**
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
  - `core/` — Domain modules:
    - Pipeline: intake, standards, canonical, templates, planning, kit, state
    - Enforcement: controlPlane, gates, verification, proofLedger
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy, ids
  - `types/` — Shared type definitions (RunManifest, StageRun, StageReport, StageId, ArtifactIndexEntry, etc.)
  - `utils/` — Utilities (writeJson, readJson, appendJsonl, ensureDir, sha256, isoNow, NotImplementedError, canonicalJson)
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
npx tsx src/cli/axion.ts run start                             # Allocate RUN-NNNNNN, write manifest
npx tsx src/cli/axion.ts run stage <run_id> <stage_id>         # Execute a single stage
npx tsx src/cli/axion.ts run                                   # Full run: init + start + all 10 stages
npx tsx src/cli/axion.ts run gates <run_id> <stage_id>         # Run gates for a stage
npx tsc --noEmit                                               # Type check (zero errors)
```

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

### Stage ID Aliases (deprecated, one-release transition)
Old → New: S2_INTAKE_VALIDATION→S2_VALIDATE_INTAKE, S3_STANDARDS_RESOLUTION→S5_RESOLVE_STANDARDS, S4_CANONICAL_BUILD→S3_BUILD_CANONICAL, S5_TEMPLATE_SELECTION→S6_SELECT_TEMPLATES, S6_PLAN_GENERATION→S8_BUILD_PLAN, S7_TEMPLATE_FILL→S7_RENDER_DOCS, S9_KIT_PACKAGE→S10_PACKAGE. Dropped: S0_INIT, S8_GATE_EVALUATION, S10_CLOSE.

## Gate Engine
Architecture: GATE_REGISTRY.json → registry loader → path templating → evaluator (6 ops) → gate report writer → manifest update

### Gate Registry (registries/GATE_REGISTRY.json)
7 enforced gates mapped to pipeline stages:
- G1_INTAKE_VALIDITY → S2_VALIDATE_INTAKE (file_exists + json_valid)
- G2_CANONICAL_INTEGRITY → S4_VALIDATE_CANONICAL (file_exists + json_valid + json_has)
- G3_STANDARDS_RESOLVED → S5_RESOLVE_STANDARDS (file_exists + json_valid)
- G4_TEMPLATE_SELECTION → S6_SELECT_TEMPLATES (file_exists + json_valid + json_has)
- G5_TEMPLATE_COMPLETENESS → S7_RENDER_DOCS (file_exists + json_valid + json_eq)
- G6_PLAN_COVERAGE → S8_BUILD_PLAN (file_exists + json_valid + coverage_gte)
- G8_PACKAGE_INTEGRITY → S10_PACKAGE (file_exists + json_valid + verify_hash_manifest)

### Evaluator Ops (6 primitives)
- `file_exists(path)` → E_FILE_MISSING
- `json_valid(path)` → E_JSON_INVALID
- `json_has(path, pointer)` → E_REQUIRED_FIELD_MISSING
- `json_eq(path, pointer, expected)` → E_VALUE_MISMATCH (also E_FILE_MISSING, E_JSON_INVALID, E_REQUIRED_FIELD_MISSING)
- `coverage_gte(path, pointer, min)` → E_COVERAGE_BELOW_MIN
- `verify_hash_manifest(manifest_path, bundle_root)` → E_PACK_*

### Gate Report v1 Format
Written to `gates/<gate_id>.gate_report.json` using canonical JSON (deep-sorted keys, 2-space indent, LF, trailing newline).
Fields: run_id, gate_id, stage_id, status (pass/fail), evaluated_at, engine {name, version}, checks[] {check_id, status, failure_code, evidence[]}, failure_codes[], evidence[]

## Template System
### Selector (src/core/templates/selector.ts)
- Source: `libraries/templates/template_index.json` (177 templates)
- Default profile filter: `status == "active"` AND `requiredness == "always"` → 8 templates
- Output: SelectedTemplate[] with template_id, template_version, source paths, output_path

### Renderer (src/core/templates/renderer.ts)
- Placeholder regex: `/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g`
- `renderTemplate(content, context)` — dotted-path resolution, primitives as-is, objects → JSON.stringify
- `scanUnresolvedPlaceholders(content)` → `{ key, occurrences }[]`
- `countPlaceholders(content)` → total count
- `buildAutoContext(templateContents, overrides)` — scan all keys, stub to `"__AXION_VALUE__"`, apply overrides (run_id, generated_at)

### Evidence (src/core/templates/evidence.ts)
- `writeSelectionResult(runDir, runId, generatedAt, baseDir)` → templates/selection_result.json + selection_report.json
- `writeRenderedDocs(runDir, runId, generatedAt, baseDir)` → templates/rendered_docs/*.md + render_report.json

## MVP Evidence Artifacts (generated during `axion run`)
- S1: intake/validation_result.json
- S3: canonical/canonical_spec.json
- S5: standards/resolved_standards_snapshot.json
- S6: templates/selection_result.json + selection_report.json
- S7: templates/rendered_docs/{ARC-01,DES-04,DES-06,PRD-01..05}.md + render_report.json
- S8: planning/coverage_report.json
- S10: kit/bundle/{kit_manifest,entrypoint,version_stamp}.json + kit/packaging_manifest.json

## Run Spine (output of `axion run`)
Run IDs: `RUN-NNNNNN` (sequential, from `.axion/run_counter.json`)

Under `.axion/runs/RUN-NNNNNN/`:
- `run_manifest.json` — Full manifest with pipeline, stage_order (10 stages), stage_gates, gates_required (7)
- `artifact_index.json` — Index of all artifacts with sha256 hashes
- `stage_reports/` — Per-stage reports (S1 through S10)
- `gates/` — Gate reports (G1, G2, G3, G4, G5, G6, G8)
- Subdirectories: intake, standards, canonical, planning, templates, templates/rendered_docs, gates, proof, verification, kit, state

### Canonical JSON (src/utils/canonicalJson.ts)
- deepSortKeys: recursively sort object keys lexicographically, arrays keep order
- canonicalJsonString: deep-sort + JSON.stringify(null, 2) + "\n"
- writeCanonicalJson: write canonical JSON to file
- canonicalHash: sha256 of canonical JSON bytes

### Gate Files
- `src/core/gates/registry.ts` — GateDefinition types (with `expected?` field), loadGateRegistry, filterGatesByStage, templateGatePaths
- `src/core/gates/evaluator.ts` — CheckResult/EvidenceEntry types, evalCheck (6 ops incl. json_eq)
- `src/core/gates/run.ts` — runGatesForStage (orchestrator)
- `src/core/gates/report.ts` — GateReportV1 type, writeGateReport
- `src/core/gates/evidence.ts` — MVP evidence generators (intake, canonical, standards, coverage, packaging)

## Tech Stack
- TypeScript (strict mode, ES2022 target, Node16 module resolution)
- tsx (dev runner)
- Node.js >= 18
- ESM imports with `.js` extensions (Node16 resolution)

## Key Config Files
- `Axion/package.json`, `Axion/tsconfig.json`, `Axion/.gitignore`
- `Filetree.md` — Canonical file tree reference
