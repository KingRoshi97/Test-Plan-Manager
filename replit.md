# Axion Project

## Overview
Axion is a document-generation and compliance-enforcement system. It takes intake submissions, resolves standards, builds canonical specs, plans work, fills templates, and packages everything into versioned "kits" for agent consumption.

## Project Structure
All source code lives under `Axion/`:

- `Axion/src/` — TypeScript runner/toolchain
  - `cli/` — CLI entry and commands
  - `core/` — Domain modules (intake, standards, canonical, planning, templates, kit, state, gates, ids)
  - `types/` — Shared type definitions
  - `utils/` — Utility helpers
- `Axion/docs_system/` — System documentation organized by domain (SYS, INT, CAN, STD, TMP, ORD, PLAN, VER, KIT, STATE, GOV, EXEC)
- `Axion/libraries/` — Persistent system assets (intake enums/schemas, standards packs, template registry)
- `Axion/test/` — Unit tests, integration tests, fixtures, golden kits, and helpers
- `Axion/scripts/` — Dev convenience shell scripts

## Key Config Files (in Axion/)
- `package.json`, `tsconfig.json`, `vitest.config.ts`
- `.env.example`, `.gitignore`

## Tech Stack
- TypeScript
- Vitest (testing)
- pnpm (package manager)
