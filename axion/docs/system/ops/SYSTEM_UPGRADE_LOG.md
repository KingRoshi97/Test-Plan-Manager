# System Upgrade Log

Version: 0.2.0
Last Updated: 2026-02-10

Append-only record of AXION system upgrades: contract changes, new scripts, flags, schemas, test milestones, and hardening work.

---

## Entries (Append-Only)

### 2026-02-10 — File tree reorganization

**Changes:**
- Consolidated all documentation into `axion/docs/` with three subdirectories: `system/`, `product/`, `registry/`
- Removed `source_docs/` from system root (remains in workspace roots)
- Moved `lib/atomic-writer.ts` to `scripts/lib/atomic-writer.ts`
- Archived workspace artifacts (18 domain folders, duplicate template folders, manifest.json) to `_archive/`
- Moved `QUICKSTART.md` and `README_RUN.md` to `docs/system/`
- Updated 17+ files with new path references
- Rebuilt all system docs from scratch

**New structure:**
```
axion/
├── _archive/      # Archived originals
├── config/        # System configuration
├── docs/          # All documentation
│   ├── system/    # Pipeline, workspace, CLI, troubleshooting
│   ├── product/   # RPBS, REBS product specs
│   └── registry/  # Glossary, reason codes
├── migrations/    # Database migrations
├── registry/      # System-level state
├── scripts/       # Pipeline scripts
│   └── lib/       # Shared utilities
├── templates/     # Base templates (core/)
└── tests/         # Test suite
```

---

### 2026-02-05 — Documentation drift detection (axion-docs-check)

**New script:** `axion-docs-check.ts`

**Checks performed:**
- Script inventory completeness
- Orphan detection (scripts exist but not mapped)
- Contamination scan (banned dev-speak tokens)
- Required docs presence

**Release gate integration:** Added as step 7 in release gate checks.

---

### 2026-02-05 — Core contract + doctor extension milestone

**Tests:** 45 passing (33 core contract + 12 doctor extension)

**Added axion-doctor checks:**
- `ACTIVE_BUILD_PRESENT` — locate and validate ACTIVE_BUILD.json
- `ACTIVE_BUILD_TARGET_EXISTS` — validate build root structure
- `ACTIVE_BUILD_GATES` — verify/lock/tests gate status
- `SYSTEM_ROOT_POLLUTION` — detect forbidden outputs in axion/
- `RUN_LOCK_STALE` — detect stale run locks (>30 min threshold)

---

### 2026-02-05 — Two-root kit workflow completion

**Completed commands:** kit-create, activate, scaffold-app, build-plan, run-app, test

**Key artifacts:** manifest.json, ACTIVE_BUILD.json, build_plan.json, test_report.json

---

### 2026-02-05 — Test suite foundation

**Core Contract Tests (33):** Pipeline definition, reason codes, output contracts, two-root safety

**Doctor Extension Tests (12):** Active build, system root pollution, stale locks, JSON output
