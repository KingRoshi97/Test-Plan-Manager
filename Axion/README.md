# Axion

Document-generation and compliance-enforcement system. Axion takes intake submissions, resolves standards, builds canonical specs, plans work, fills templates, runs gates, and packages everything into versioned kits.

## Current State

This repo is **scaffolding only** — the project structure, types, interfaces, and stub CLI are in place. No real enforcement logic is implemented yet. All stubs either throw `NotImplementedError` or write placeholder JSON artifacts.

## Quick Start

```bash
# Install dependencies
npm install

# Initialize .axion/ runtime directory
npx tsx src/cli/axion.ts init

# Run the full stub pipeline (creates a run with placeholder artifacts)
npx tsx src/cli/axion.ts run
```

## What Exists

- **`src/`** — TypeScript source with types, interfaces, and stub functions
  - `cli/` — CLI commands (init, run)
  - `core/` — Domain modules (controlPlane, gates, verification, planning, proofLedger, kit, state)
  - `types/` — Shared types (RunManifest, ArtifactRef, etc.)
  - `utils/` — File I/O helpers, hashing, timestamps, error classes
- **`docs_system/`** — System documentation (12 domains)
- **`libraries/`** — Template library (8 groups), standards packs, intake schemas
- **`registries/`** — Global registry JSON files (gates, errors, proofs, features, etc.)
- **`features/`** — Per-feature artifact packs (FEAT-001 through FEAT-017)
- **`.axion/`** — Runtime artifact root (gitignored, created by `axion init`)

## Artifact Spine

Running `axion run` produces the following under `.axion/runs/<run_id>/`:

```
run_manifest.json
standards/resolved_standards_snapshot.json
canonical/canonical_spec.json
planning/work_breakdown.json
planning/acceptance_map.json
planning/sequencing_report.json
gates/<gate_id>.gate_report.json
proof/proof_ledger.jsonl
verification/completion_report.json
kit/kit_manifest.json
kit/entrypoint.json
kit/version_stamp.json
state/state_snapshot.json
state/resume_plan.json
state/handoff_packet/
```

## Type Check

```bash
npx tsc --noEmit
```
