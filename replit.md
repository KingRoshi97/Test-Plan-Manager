# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions, resolves standards, builds canonical specs, plans work, fills templates, and packages everything into versioned "kits" for agent consumption.

## Current State
Scaffolding only — types, interfaces, stub CLI are in place. No real enforcement logic yet. Stubs throw `NotImplementedError` or write placeholder JSON artifacts. CLI produces full artifact spine under `.axion/runs/<run_id>/`.

## Project Structure
All source code lives under `Axion/`:

- `Axion/src/` — TypeScript runner/toolchain
  - `cli/` — CLI entry (`axion.ts`) and commands (init, run, planWork, runGates, packageKit, verify, etc.)
  - `core/` — Domain modules:
    - Enforcement: controlPlane, gates, verification, planning, proofLedger, kit, state
    - Original: intake, standards, canonical, templates, ids
    - Extended: artifactStore, cache, diff, repro, refs, coverage, scanner, taxonomy
  - `types/` — Shared type definitions (RunManifest, ArtifactRef, etc.)
  - `utils/` — File I/O helpers (writeJson, appendJsonl, ensureDir), hashing, timestamps, errors
- `Axion/.axion/` — Runtime artifact root (gitignored, created by `axion init`)
- `Axion/docs_system/` — System documentation organized by domain (SYS, INT, CAN, STD, TMP, ORD, PLAN, VER, KIT, STATE, GOV, EXEC)
- `Axion/libraries/` — Persistent system assets:
  - `intake/` — Enums, schemas, validation rules
  - `standards/` — Standards index + packs
  - `templates/` — Template library organized by 8 groups:
    - Group 1: Product Definition (PRD, URD, STK, DMG, RSC, RISK, BRP, SMIP)
    - Group 2: Experience Design (DES, IXD, CDX, DSYS, IAN, A11YD, RLB, VAP)
    - Group 3: System Architecture (ARC, SIC, SBDT, PMAD, ERR, RTM, WFO, APIG)
    - Group 4: Data & Information (DATA, DLR, DGL, DQV, SRCH, CACHE, RPT)
    - Group 5: Application Build (API, JBS, EVT, RLIM, FFCFG, PFS, FPMP, ADMIN, FE, SMD, CPR, FORM, ROUTE, UICP, CER, CSec, MOB, MDC, OFS, MBAT, MDL, MPUSH, SIGN)
    - Group 6: Integrations & External Services (INT, SSO, CRMERP, WHCP, PAY, NOTIF, FMS)
    - Group 7: Security, Privacy & Compliance (SEC, IAM, TMA, SKM, PRIV, AUDIT, COMP)
    - Group 8: Operations & Reliability (OBS, ANL, LTS, ALRT, SLO, PERF, LOAD, COST, PBP, QA, QAH, RJT, TDE, RELIA, IRP, OPS, IAC, CICD, REL, ENV, SDR, BDR, DOC, L10N_A11Y)
- `Axion/registries/` — Global registry JSON files (GATE_REGISTRY, ERROR_CODE_REGISTRY, PROOF_TYPE_REGISTRY, FEATURE_REGISTRY, OBJECT_MODEL, POLICY_REGISTRY, PACKAGING_PROFILES, TEMPLATE_INDEX, VERSION_REGISTRY)
- `Axion/features/` — Per-feature artifact packs (FEAT-001 through FEAT-017)
- `Axion/test/` — Unit tests, integration tests, fixtures, golden kits, helpers
- `Axion/scripts/` — Dev convenience shell scripts

## Running
```bash
cd Axion
npm install
npx tsx src/cli/axion.ts init    # Initialize .axion/ directory
npx tsx src/cli/axion.ts run     # Generate full placeholder artifact spine
npx tsc --noEmit                 # Type check
```

## Key Config Files (in Axion/)
- `package.json`, `tsconfig.json`
- `.env.example`, `.gitignore`

## Filetree Reference
- `Filetre.md` — Canonical file tree spec for the full project structure

## Tech Stack
- TypeScript (strict mode, ES2022 target, Node16 module resolution)
- tsx (dev runner)
- Node.js >= 18
