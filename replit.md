# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions, resolves standards, builds canonical specs, plans work, fills templates, and packages everything into versioned "kits" for agent consumption.

## Project Structure
All source code lives under `Axion/`:

- `Axion/src/` — TypeScript runner/toolchain
  - `cli/` — CLI entry and commands (generateKit, validateIntake, resolveStandards, buildSpec, planWork, fillTemplates, packageKit, runGates, runControlPlane, exportBundle, release, repro)
  - `core/` — Domain modules:
    - Original: intake, standards, canonical, planning, templates, kit, state, gates, ids
    - New: controlPlane, artifactStore, cache, diff, repro, refs, coverage, proofLedger, scanner, taxonomy
  - `types/` — Shared type definitions
  - `utils/` — Utility helpers
- `Axion/docs_system/` — System documentation organized by domain (SYS, INT, CAN, STD, TMP, ORD, PLAN, VER, KIT, STATE, GOV, EXEC)
- `Axion/libraries/` — Persistent system assets (intake enums/schemas, standards packs, template registry)
- `Axion/registries/` — Compiled global views (FEATURE_REGISTRY, ERROR_CODE_REGISTRY, GATE_REGISTRY, PROOF_TYPE_REGISTRY, OBJECT_MODEL, POLICY_REGISTRY, PACKAGING_PROFILES)
- `Axion/features/` — Per-feature artifact packs (FEAT-001 through FEAT-017), each with registry, contract, errors, security, gates/proofs, tests, observability, docs, and API files
- `Axion/test/` — Unit tests, integration tests, fixtures (including control_plane_expected, bundles_expected, diff_expected, repro_expected, scan_expected), golden kits, and helpers
- `Axion/scripts/` — Dev convenience shell scripts

## Key Config Files (in Axion/)
- `package.json`, `tsconfig.json`, `vitest.config.ts`
- `.env.example`, `.gitignore`

## Filetree Reference
- `Filetre.md` — Canonical file tree spec for the full project structure

## Tech Stack
- TypeScript
- Vitest (testing)
- pnpm (package manager)
