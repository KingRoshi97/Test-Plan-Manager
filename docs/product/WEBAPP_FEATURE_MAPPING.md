# AXION Web App Feature Mapping
Version: 0.1.0  
Last Updated: 2026-02-05  
Owner: AXION System

## Purpose
This document maps AXION **system features** (scripts + artifacts + contracts) to the future AXION Web App (Axion Assembler) so:
- we always know **what features exist**
- we know **where they live in the system**
- we know **what the web app must invoke/render**
- we prevent UI drift from system reality

---

## Update Protocol

**Update this file whenever any of these change:**
- new/renamed script in `axion/scripts/`
- new/renamed artifact in `<PROJECT_NAME>/registry/` or build root
- changes to stdout final JSON contract
- changes to activation gates / feature flags

**Every new feature entry must include:**
- command(s)
- inputs
- outputs (exact paths)
- UI surface
- backend needs
- status (Implemented/Planned)

---

## Update Rules
- Any time a new AXION script/flag/artifact is added or renamed, update this file.
- The **source of truth** is the system: scripts, config, artifacts, contract tests.
- UI should **invoke** system behavior (not re-implement it).

---

# 1) System Product Areas (Web App Sections)

## 1.1 Build Kits (Two-Root Model)
**Goal:** create self-contained build roots (kits) with immutable AXION snapshot + project workspace.

### System Features
- Kit creation (AXION snapshot copy)
- Project workspace creation (workspace root named by RPBS project name)
- Root safety (refuse writes into system snapshot)
- Build inventory (multiple builds)
- Manifest generation

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| `axion-kit-create` | Create new build kit with AXION snapshot | Implemented |
| `axion-prepare-root` | Prepare build root structure | Implemented |

### Key Artifacts / Paths
- `<BUILD_ROOT>/axion/` (system snapshot)
- `<BUILD_ROOT>/<PROJECT_NAME>/` (workspace root)
- `<BUILD_ROOT>/manifest.json`

### Web App Surfaces
- Build Dashboard (list builds)
- New Build Wizard (kit create)
- Build Detail "Control Room" (per build)

### Web App Needs (Backend)
- list build roots
- read build manifest
- read RPBS project name
- create build root (invoke command)
- create workspace root (invoke command, or validate created)

---

## 1.2 Product Truth Input (RPBS/REBS)
**Goal:** capture user input and produce canonical product truth used by all stages.

### System Features
- Seed RPBS/REBS in kit-create
- RPBS/REBS treated as inputs (not overwritten by pipeline)
- Project name derivation from RPBS

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| (seeded by) `axion-kit-create` | Seeds RPBS/REBS during kit creation | Implemented |

### Key Artifacts / Paths
- `<BUILD_ROOT>/axion/source_docs/product/RPBS_Product.md`
- `<BUILD_ROOT>/axion/source_docs/product/REBS_Product.md`

### Web App Surfaces
- RPBS Editor
- REBS Editor
- Validation hints panel (optional)

### Web App Needs (Backend)
- read/write these markdown files
- optional lightweight validation (required fields present)

---

## 1.3 Documentation Pipeline (Modules + Stages)
**Goal:** generate and validate module documentation deterministically with gates.

### System Features
- canonical stage order + gating
- module-aware execution (`--all` or `--module`)
- dependency enforcement (`blocked_by`)
- deterministic outputs + final JSON stdout

### System Commands (Docs)
| Command | Description | Status |
|---------|-------------|--------|
| `axion-init` | Initialize module documentation structure | Implemented |
| `axion-generate` | Generate module documentation scaffolds | Implemented |
| `axion-seed` | Seed module docs with RPBS content | Implemented |
| `axion-draft` | AI-generate draft content for modules | Implemented |
| `axion-review` | Review module documentation | Implemented |
| `axion-verify` | Verify module documentation completeness | Implemented |
| `axion-repair` | Generate repair suggestions for issues | Implemented |
| `axion-lock` | Lock verified documentation | Implemented |
| `axion-package` | Export/package documentation | Implemented |

### Key Artifacts / Paths
Workspace root is always:
- `<BUILD_ROOT>/<PROJECT_NAME>/`

Docs outputs:
- `<PROJECT_NAME>/domains/<module>/README.md`

Registry outputs:
- `<PROJECT_NAME>/registry/stage_markers.json`
- `<PROJECT_NAME>/registry/verify_report.json`
- `<PROJECT_NAME>/registry/verify_status.json`
- `<PROJECT_NAME>/registry/run_history/<run_id>.json`
- `<PROJECT_NAME>/registry/erc/` (lock outputs)

### Web App Surfaces
- Pipeline Stepper (init → … → lock)
- Module Grid (19 modules + stage badges)
- Live Run Console (stdout/stderr + final JSON)
- Verify Dashboard (reason codes + fix hints)
- ERC Viewer

### Web App Needs (Backend)
- run a command and stream logs
- parse final JSON result
- read registry artifacts and render them
- read module docs and allow edits (where permitted)

---

## 1.4 Governance (Drift, Seams, Contracts)
**Goal:** prevent drift and enforce system ownership rules.

### System Features (may vary by current config)
- template hashing + drift detection
- seam ownership verification (if enabled)
- verify_report consolidation

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| `axion-verify` | Includes governance checks | Implemented |
| `axion-verify-seams` | Verify seam ownership | Implemented |
| `axion-hash-templates` | Hash templates for drift detection | Implemented |
| `axion-repair` | Output fix list for violations | Implemented |

### Key Artifacts / Paths
- `<PROJECT_NAME>/registry/verify_report.json` (includes drift/seams when enabled)
- template hash registry (system-defined location)

### Web App Surfaces
- Verification Dashboard (drift + seam violations)
- "Repair suggestions" view

### Web App Needs (Backend)
- read verify report and render structured violations
- optionally run repair and show fix actions

---

## 1.5 Reliability & Diagnostics
**Goal:** make execution reliable for coding agents and at scale.

### System Features
- `axion-doctor` health checks (18 checks across 8 categories)
- Active build validation (ACTIVE_BUILD_PRESENT, TARGET_EXISTS, GATES)
- System pollution detection (SYSTEM_ROOT_POLLUTION)
- Run lock management (RUN_LOCK_STALE with 30-minute threshold)
- run history ledger
- strict output contracts

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| `axion-doctor` | System health checks (system + build mode) | Implemented |
| `axion-run` | Pipeline orchestrator | Implemented |
| `axion-status` | Show current build status | Implemented |
| `axion-next` | Suggest next command | Implemented |
| `axion-clean` | Clean build artifacts | Implemented |

### Key Artifacts / Paths
- `ACTIVE_BUILD.json` (priority locations: env var, build root, kits/, axion-builds/)
- `<PROJECT_NAME>/registry/run_lock.json` (stale after 30 minutes)
- `<PROJECT_NAME>/registry/run_history/*`

### Doctor JSON Output Sections
- `active_build`: { configured, path, valid, build_root }
- `pollution`: { clean, paths }
- `run_lock`: { exists, stale, age_minutes }

### Web App Surfaces
- System Health page (Doctor output with 18 checks)
- Run History viewer
- Concurrency status indicator
- Active Build panel

### Web App Needs (Backend)
- run doctor (system mode)
- run doctor for a build (`--root`)
- show suggested next commands
- show stale lock warnings
- show pollution alerts

---

## 1.6 App Pipeline (Scaffold → Plan → Build → Test → Run)
**Goal:** build real code from locked docs inside the workspace app directory.

### System Features
- scaffold app in workspace
- build plan generation (task graph)
- test execution + test_report.json
- run the active build's app

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| `axion-scaffold-app` | Scaffold application structure | Implemented |
| `axion-build-plan` | Generate build task graph | Implemented |
| `axion-build` | Execute build tasks | Implemented |
| `axion-test` | Run tests and generate report | Implemented |
| `axion-run-app` | Run the active build's app | Implemented |
| `axion-deploy` | Deploy application | Implemented |

### Key Artifacts / Paths
- `<PROJECT_NAME>/app/` (code)
- `<PROJECT_NAME>/registry/build_plan.json`
- `<PROJECT_NAME>/registry/test_report.json`

### Web App Surfaces
- App Build Center (scaffold/build plan/tests)
- Build Plan viewer
- Test results viewer
- "Run App" button

### Web App Needs (Backend)
- run app stage commands with correct flags
- render build_plan graph/list
- render test_report summary

---

## 1.7 Routing & Activation (Universal)
**Goal:** guarantee the platform runs the correct build.

### System Features
- `ACTIVE_BUILD.json` pointer
- gated activation (verify/lock/tests per strict_dependency_gating flag)
- run-app uses active pointer
- activation eligibility checks

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| `axion-activate` | Activate a build (with gate validation) | Implemented |
| `axion-active` | Show/manage active build | Implemented |
| `axion-run-app` | Run using ACTIVE_BUILD pointer | Implemented |

### Key Artifacts / Paths
- `ACTIVE_BUILD.json` (priority locations):
  1. `AXION_ACTIVE_BUILD_PATH` environment variable
  2. `<BUILD_ROOT>/ACTIVE_BUILD.json`
  3. `kits/ACTIVE_BUILD.json`
  4. `axion-builds/ACTIVE_BUILD.json`
- activation history (optional future)

### Activation Gates (when strict_dependency_gating enabled)
- `verify_report.json` must exist and pass
- `lock.json` must exist
- `test_report.json` must exist and pass

### Web App Surfaces
- Active Build panel (what's active now)
- Activate button (with eligibility checklist)
- Rollback (activate previous build)

### Web App Needs (Backend)
- read ACTIVE_BUILD.json
- run axion-activate (do not write pointer directly)
- show activation gates status from registry artifacts

---

## 1.8 System Maintenance
**Goal:** keep the AXION system healthy and up-to-date.

### System Commands
| Command | Description | Status |
|---------|-------------|--------|
| `axion-upgrade` | Upgrade AXION system | Implemented |
| `axion-overhaul` | Major system overhaul | Implemented |
| `axion-preflight` | Pre-execution checks | Implemented |

---

# 2) Canonical Data Contracts (What the Web App Trusts)

## 2.1 Command Result Contract (stdout final JSON)
Every command returns a final JSON object as the last line of stdout:
- `status: success | failed | blocked_by`
- `stage`
- `mode` (system/build/module/all as applicable)
- `reason_codes?`
- `missing?` (for blocked_by)
- `hint?` (exact next commands)
- `files_created?`
- `marker_written?`

## 2.2 Registry Artifact Schemas
Web app should parse and render (not interpret logs):

| Artifact | Path | Purpose |
|----------|------|---------|
| `manifest.json` | `<BUILD_ROOT>/manifest.json` | Build metadata |
| `ACTIVE_BUILD.json` | Priority locations (see 1.7) | Active build pointer |
| `stage_markers.json` | `<PROJECT_NAME>/registry/` | Pipeline stage progress |
| `verify_report.json` | `<PROJECT_NAME>/registry/` | Verification results |
| `verify_status.json` | `<PROJECT_NAME>/registry/` | Verification summary |
| `run_history/*.json` | `<PROJECT_NAME>/registry/run_history/` | Execution history |
| `build_plan.json` | `<PROJECT_NAME>/registry/` | Build task graph |
| `test_report.json` | `<PROJECT_NAME>/registry/` | Test execution results |
| `run_lock.json` | `<PROJECT_NAME>/registry/` | Concurrency lock (stale after 30 min) |
| `lock.json` | `<PROJECT_NAME>/registry/` | Documentation lock |
| `erc/*` | `<PROJECT_NAME>/registry/erc/` | Lock artifacts |

---

# 3) Feature Inventory (Living Checklist)

> Add a new row whenever you add a script, artifact, or capability.

| Feature | System Command(s) | Primary Artifacts | Web App Surface | Status |
|---------|-------------------|-------------------|-----------------|--------|
| Create Build Kit | axion-kit-create | BUILD_ROOT/axion, manifest.json | New Build Wizard | Implemented |
| Prepare Root | axion-prepare-root | Build root structure | Build Setup | Implemented |
| Edit RPBS/REBS | (file edit) | axion/source_docs/product/* | RPBS/REBS Editor | Implemented |
| Docs Pipeline Run | axion-run + stage scripts | domains/**, registry/** | Build Control Room | Implemented |
| Init Docs | axion-init | domains/ structure | Pipeline Stepper | Implemented |
| Generate Docs | axion-generate | domain READMEs | Pipeline Stepper | Implemented |
| Seed Docs | axion-seed | seeded READMEs | Pipeline Stepper | Implemented |
| Draft Docs | axion-draft | drafted READMEs | Pipeline Stepper | Implemented |
| Review Docs | axion-review | reviewed READMEs | Pipeline Stepper | Implemented |
| Verify Dashboard | axion-verify | verify_report.json | Verification Dashboard | Implemented |
| Verify Seams | axion-verify-seams | seam report | Governance Dashboard | Implemented |
| Hash Templates | axion-hash-templates | template hashes | Drift Detection | Implemented |
| Repair Suggestions | axion-repair | repair report | Repair Center | Implemented |
| Lock + ERC | axion-lock | registry/erc/** | Lock & ERC Viewer | Implemented |
| Package | axion-package | export bundle | Export Center | Implemented |
| Scaffold App | axion-scaffold-app | app/**, scaffold report | App Build Center | Implemented |
| Build Plan | axion-build-plan | build_plan.json | Plan Viewer | Implemented |
| Build Execute | axion-build | build outputs | Build Center | Implemented |
| Tests | axion-test | test_report.json | Test Viewer | Implemented |
| Activate Build | axion-activate | ACTIVE_BUILD.json | Routing & Activation | Implemented |
| Active Build | axion-active | active build info | Active Build Panel | Implemented |
| Run Active App | axion-run-app | runtime logs | Run Panel | Implemented |
| Deploy | axion-deploy | deployment artifacts | Deploy Center | Implemented |
| Doctor | axion-doctor | doctor JSON | System Health | Implemented |
| Status | axion-status | status JSON | Build Status | Implemented |
| Next Command | axion-next | suggestion | Command Hints | Implemented |
| Clean | axion-clean | cleanup report | Maintenance | Implemented |
| Upgrade | axion-upgrade | upgrade report | System Maintenance | Implemented |
| Overhaul | axion-overhaul | overhaul report | System Maintenance | Implemented |
| Preflight | axion-preflight | preflight report | Pre-execution | Implemented |

---

# 4) Open Questions (Track as system evolves)
- Where is the canonical `ACTIVE_BUILD.json` location in system mode? → Resolved: Priority order defined (env var → build root → kits/ → axion-builds/)
- Do we support multiple stack profiles? Where is stack_profile.json stored and locked?
- Do we implement build-exec in-system or keep "agent executes tasks" external?
- What artifact versioning strategy is adopted (version fields, migration tooling)?

---

# 5) Recent Changes

**2026-02-05** — Added axion-doctor active build validation (ACTIVE_BUILD_PRESENT/TARGET_EXISTS/GATES), system pollution scan (SYSTEM_ROOT_POLLUTION), stale run lock detection (RUN_LOCK_STALE with 30-minute threshold); JSON output extended with `active_build`, `pollution`, `run_lock` sections. Total: 18 checks across 8 categories. Corrupt artifacts (invalid JSON) now treated as unsatisfied gates.

**2026-02-05** — Two-root kit workflow completed (kit-create, activate, scaffold-app, build-plan, run-app, test). Feature flags support for strict_dependency_gating.

**2026-02-05** — Initial WEBAPP_FEATURE_MAPPING.md created with Update Protocol. All 29 scripts mapped to web app surfaces.
