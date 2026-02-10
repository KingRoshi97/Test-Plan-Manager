# AXION System Upgrade Log
Version: 0.1.0  
Last Updated: 2026-02-05

## Purpose
Append-only record of AXION system upgrades: contract changes, new scripts, flags, schemas, test milestones, and hardening work.  
This is **not** a web app spec — see `docs/product/WEBAPP_FEATURE_MAPPING.md` for that.

---

## Entries (Append-Only)

### 2026-02-05 — Documentation drift detection (axion-docs-check)

**New script:** `axion-docs-check.ts`

**Purpose:** Prevent documentation drift as the system evolves

**Checks performed:**
- Script inventory completeness (all scripts in WEBAPP_FEATURE_MAPPING)
- Orphan detection (scripts exist but not mapped)
- Contamination scan (banned dev-speak tokens in web mapping)
- Required docs presence (INDEX, UPGRADE_LOG, FEATURE_MAPPING)

**JSON output:**
- `status`: PASS | WARN | FAIL
- `issues`: { missing_scripts, orphan_scripts, contamination, missing_docs }
- `summary`: { scripts_mapped, scripts_exist, web_invoked, internal_only }
- `suggestions`: array of fix hints

**Release gate integration:** Added as step 7 in tests/release-gate.sh

**Tests:** 6 new tests in tests/suites/docs-check.test.ts

---

### 2026-02-05 — Core contract + doctor extension milestone

**Tests:** 45 passing (33 core contract + 12 doctor extension)

**Added axion-doctor checks:**
- `ACTIVE_BUILD_PRESENT` — locate and validate ACTIVE_BUILD.json
- `ACTIVE_BUILD_TARGET_EXISTS` — validate build root structure exists
- `ACTIVE_BUILD_GATES` — verify/lock/tests gate status per feature flags
- `SYSTEM_ROOT_POLLUTION` — detect forbidden outputs in axion/ directory
- `RUN_LOCK_STALE` — detect stale run locks (>30 minute threshold)

**Doctor JSON stdout extended with:**
- `active_build`: { configured, path, valid, build_root }
- `pollution`: { clean, paths }
- `run_lock`: { exists, stale, age_minutes }

**Notes:**
- ACTIVE_BUILD search order: env var → build root → kits/ → axion-builds/
- Run-lock stale threshold: >30 minutes (configurable constant)
- Corrupt artifacts (invalid JSON) now treated as unsatisfied gates with "corrupt artifact" message
- Total doctor checks: 18 across 8 categories

**Feature flags:**
- `strict_dependency_gating` — enforces verify/lock/tests gates for activation

---

### 2026-02-05 — Two-root kit workflow completion

**Completed commands:**
- `axion-kit-create` — create build kit with AXION snapshot
- `axion-activate` — activate a build with gate validation
- `axion-scaffold-app` — scaffold application structure
- `axion-build-plan` — generate build task graph
- `axion-run-app` — run the active build's app
- `axion-test` — run tests and generate report

**Key artifacts:**
- `manifest.json` — build metadata
- `ACTIVE_BUILD.json` — active build pointer (priority locations defined)
- `build_plan.json` — build task graph
- `test_report.json` — test execution results

---

### 2026-02-05 — Test suite foundation

**Core Contract Tests (33 tests):**
- Pipeline Definition (stage order, module ordering, dependency gating, preset configs)
- Reason Codes (registry, script-level codes, blocked_by semantics)
- Output Contracts (JSON stdout, manifest schema, artifact locations)
- Two-Root Safety (system root protection, kit isolation)

**Doctor Extension Tests (12 tests):**
- ACTIVE_BUILD_PRESENT (WARN/FAIL scenarios)
- ACTIVE_BUILD_TARGET_EXISTS (SKIP/FAIL scenarios)
- SYSTEM_ROOT_POLLUTION (PASS/FAIL scenarios)
- RUN_LOCK_STALE (PASS/WARN/FAIL scenarios)
- JSON Output Extensions (active_build, pollution, run_lock sections)

**Test fixtures created:**
- `tests/fixtures/active_build/` — valid, invalid, missing target scenarios
- `tests/fixtures/pollution/` — clean and polluted system roots
- `tests/fixtures/run_lock/` — fresh and stale locks
