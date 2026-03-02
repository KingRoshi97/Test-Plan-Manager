# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions, resolves standards, builds canonical specs, plans work, fills templates, runs gates, and packages everything into versioned "kits" for agent consumption.

## Current State
Scaffolding complete — all types, interfaces, and stub CLI commands are implemented. Core modules export concrete TypeScript types derived from docs_system specifications. Stubs throw `NotImplementedError` or write placeholder JSON artifacts. CLI produces full 15-artifact spine under `.axion/runs/<run_id>/`. Zero TypeScript errors.

### File Counts
- **104 non-empty .ts source files** (zero empty .ts remaining)
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
  - `cli/` — CLI entry (`axion.ts`) and 14 commands (init, run, planWork, runGates, packageKit, verify, validateIntake, resolveStandards, buildSpec, fillTemplates, generateKit, exportBundle, release, repro)
  - `core/` — Domain modules (16 modules):
    - Pipeline: intake, standards, canonical, templates, planning, kit, state
    - Enforcement: controlPlane, gates, verification, proofLedger
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy, ids
  - `types/` — Shared type definitions (RunManifest, ArtifactRef, ArtifactPath, etc.)
  - `utils/` — Utilities (writeJson, appendJsonl, ensureDir, sha256, isoNow, NotImplementedError)
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
npx tsx src/cli/axion.ts init    # Initialize .axion/ directory
npx tsx src/cli/axion.ts run     # Generate full placeholder artifact spine
npx tsc --noEmit                 # Type check (zero errors)
```

## Artifact Spine (output of `axion run`)
Under `.axion/runs/<run_id>/`:
- `run_manifest.json` — Run metadata
- `standards/resolved_standards_snapshot.json`
- `canonical/canonical_spec.json`
- `planning/work_breakdown.json`, `acceptance_map.json`, `sequencing_report.json`
- `gates/gate_placeholder.gate_report.json`
- `proof/proof_ledger.jsonl`
- `verification/completion_report.json`
- `kit/kit_manifest.json`, `entrypoint.json`, `version_stamp.json`
- `state/state_snapshot.json`, `resume_plan.json`, `handoff_packet/`

## Tech Stack
- TypeScript (strict mode, ES2022 target, Node16 module resolution)
- tsx (dev runner)
- Node.js >= 18
- ESM imports with `.js` extensions (Node16 resolution)

## Key Config Files
- `Axion/package.json`, `Axion/tsconfig.json`, `Axion/.gitignore`
- `Filetree.md` — Canonical file tree reference
