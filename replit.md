# Axion Assembler

## Overview

Axion Assembler is a web application that serves as the controller interface for the AXION documentation-first development system. AXION generates comprehensive "Agent Kits" for AI-guided software development through a strict pipeline: init → generate → seed → draft → review → verify → lock → package.

This web app provides a UI to control all AXION capabilities:
- Pipeline stage execution (init, generate, seed, draft, review, verify, lock)
- Module targeting (--all, --module with dependency-aware blocking)
- Presets and stage plans from configuration
- Registry artifact visibility (stage markers, verify reports, drift detection)
- Export/packaging of Agent Kit bundles

The app calls existing AXION scripts rather than re-implementing their logic, capturing stdout/stderr and exit codes for auditability.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Two-Root Architecture
AXION uses a two-root model separating immutable system files from mutable project outputs:
- **System Root** (`axion/`): Contains scripts, templates, configs - read-only during execution
- **Workspace Root** (`<project-name>/`): Contains generated docs, registry state, app code - all outputs

### Documentation Pipeline (ROSHI Flow)
Sequential document generation ensuring consistency:
1. RPBS (Product Truth) → REBS (Engineering Philosophy)
2. generate → seed → draft → review → verify → lock
3. Each stage has gates that block progression until prerequisites pass

### Technology Stack
- **Frontend**: React with TypeScript, Tailwind CSS, TanStack Query + Zustand for state
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: Vite for frontend bundling

### Key Design Patterns
- **Script Orchestration**: Backend spawns AXION TypeScript scripts as child processes
- **Deterministic Execution**: All actions logged with timestamps, args, exit codes
- **Gate Enforcement**: Lock requires verify PASS; scaffold requires docs locked
- **Non-Destructive**: Never overwrites RPBS/REBS without explicit user action

### Module System
19 domain modules with defined dependencies:
- Foundation: architecture, systems, contracts
- Data: database, data
- Security: auth
- Application: backend, integrations, state, frontend, fullstack
- Quality: testing, quality, security, devops, cloud, devex
- Clients: mobile, desktop

### Registry Artifacts
Pipeline state tracked in JSON files:
- `stage_markers.json`: Completion status per module/stage
- `verify_report.json`: Verification results with reason codes
- `verify_status.json`: Pass/fail status per module
- `seams.json`: Cross-module ownership rules

## External Dependencies

### Database
- PostgreSQL for persistent storage
- Drizzle ORM for schema management and queries
- Schema tracks assemblies, runs, exports, and pipeline state

### AXION Scripts (External System)
The web app orchestrates these existing TypeScript scripts:
- `axion-init.ts`: Initialize workspace
- `axion-generate.ts`: Create module docs from templates
- `axion-seed.ts`: Add scaffolding placeholders
- `axion-draft.ts`: Fill documentation sections
- `axion-review.ts`: Validate and count issues
- `axion-verify.ts`: Final gate check
- `axion-lock.ts`: Freeze modules, generate ERC
- `axion-package.ts`: Bundle into Agent Kit

### File System
- Reads/writes to workspace directories
- Template copying from system root
- ZIP generation for exports

### Process Execution
- Child process spawning for script execution
- stdout/stderr capture for logging
- Exit code handling for success/failure detection