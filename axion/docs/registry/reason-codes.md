# Reason Codes

> **Registry Guardrail.** Every diagnostic message, gate failure, and error condition in the AXION system uses a SCREAMING_SNAKE_CASE reason code from this registry. Scripts must use codes listed here — inventing ad-hoc codes is prohibited.

---

## Code Format

All reason codes use SCREAMING_SNAKE_CASE. Codes are grouped by the subsystem that emits them.

---

## Environment & System (Doctor / Preflight)

Emitted by `axion-doctor.ts` and `axion-preflight.ts` during system health checks.

| Code | Severity | Description |
|------|----------|-------------|
| `ENV_NODE_MISSING` | ERROR | Node.js is not installed or not on PATH |
| `ENV_NODE_VERSION_LOW` | ERROR | Node.js version is below the minimum required |
| `ENV_TSX_MISSING` | ERROR | tsx runtime is not installed |
| `ENV_PERMS_DENIED` | ERROR | File system permissions prevent read/write |
| `AXION_SYSTEM_NOT_FOUND` | ERROR | The `axion/` system root directory was not found |
| `CFG_FILE_MISSING` | ERROR | Required configuration file not found |
| `CFG_JSON_INVALID` | ERROR | Configuration file contains invalid JSON |
| `CFG_SCHEMA_INVALID` | ERROR | Configuration file does not match expected schema |
| `DOCTOR_FAILED` | ERROR | One or more doctor checks failed |
| `PRECHECK_FAILED` | ERROR | Preflight validation did not pass |

---

## Workspace & Path Safety

Emitted by workspace management scripts and `lib/path-safety.ts`.

| Code | Severity | Description |
|------|----------|-------------|
| `WORKSPACE_NOT_FOUND` | ERROR | Target workspace directory does not exist |
| `MISSING_WORKSPACE_CONTEXT` | ERROR | Workspace lacks required context files (manifest, config) |
| `BAD_WORKDIR` | ERROR | Current working directory is not a valid workspace root |
| `ROOT_EXISTS_NONEMPTY` | ERROR | Target directory already exists and is not empty |
| `ROOT_EXISTS_REFUSED` | ERROR | Workspace creation refused — directory already exists |
| `ROOT_NOT_WRITABLE` | ERROR | Workspace root directory is not writable |
| `UNSAFE_ROOT` | ERROR | Target path resolves to an unsafe location |
| `PATH_TRAVERSAL` | ERROR | Path contains traversal sequences (`../`) that escape allowed boundaries |
| `SYSTEM_ROOT_WRITE_ATTEMPT` | ERROR | Attempted to write into the immutable `axion/` system root |
| `SYSTEM_ROOT_POLLUTED` | ERROR | Files were detected inside the system root that should not be there |
| `TARGET_EXISTS` | ERROR | Target file or directory already exists |
| `TARGET_MISSING` | ERROR | Expected target file or directory is missing |
| `TARGET_OUTSIDE_WORKSPACE` | ERROR | Target path resolves outside the workspace boundary |
| `SOURCE_NOT_FOUND` | ERROR | Source file for copy/move operation not found |
| `SOURCE_INSIDE_WORKSPACE` | ERROR | Import source must be outside the target workspace |
| `WORKSPACE_INSIDE_SOURCE` | ERROR | Workspace path is inside the source directory (circular reference) |
| `OUTPUT_NOT_WRITABLE` | ERROR | Output path is not writable |

---

## Pipeline Gates

Emitted by the orchestrator when gate conditions are not met. Defined in `presets.json`.

| Code | Severity | Description |
|------|----------|-------------|
| `DRAFT_BLOCKED_SEED_INCOMPLETE` | ERROR | Draft stage blocked — seed has not completed for target modules |
| `VERIFY_BLOCKED_REVIEW_INCOMPLETE` | ERROR | Verify stage blocked — review has not completed |
| `LOCK_REFUSED_VERIFY_NOT_PASS` | ERROR | Lock refused — latest verify result is not PASS |
| `SCAFFOLD_BLOCKED_DOCS_NOT_LOCKED` | ERROR | Scaffold-app blocked — docs are not locked (override: `dev_build`) |
| `BUILD_BLOCKED_SCAFFOLD_INCOMPLETE` | ERROR | Build blocked — scaffold-app has not completed |
| `DEPLOY_BLOCKED_TESTS_NOT_PASS` | ERROR | Deploy blocked — tests have not passed (overridable) |
| `DOCS_NOT_LOCKED` | ERROR | Operation requires locked docs but they are not locked |
| `VERIFY_NOT_PASSED` | ERROR | Verify result is not PASS |

---

## Pipeline Execution (Run / Orchestrate)

Emitted during pipeline run execution.

| Code | Severity | Description |
|------|----------|-------------|
| `MISSING_TARGET` | ERROR | No target workspace or module specified for the run |
| `PREPARE_ROOT_FAILED` | ERROR | Failed to prepare the workspace root for execution |
| `PLAN_NOT_FOUND` | ERROR | Specified stage plan does not exist in `presets.json` |
| `PRESET_NOT_FOUND` | ERROR | Specified module preset does not exist in `presets.json` |
| `MODULE_NOT_FOUND` | ERROR | Specified module slug does not exist in `domains.json` |
| `DUPLICATE_TARGET` | ERROR | Same module specified more than once in run target |
| `RUN_LOCK_STALE` | WARNING | A stale run lock was detected and will be overridden |
| `TIMEOUT` | ERROR | Pipeline step exceeded its execution time limit |
| `MODE_NOT_SPECIFIED` | ERROR | Required mode flag (e.g., `--scan`, `--fill`) not provided |

---

## Content & Verification

Emitted by verify, lock, and content-fill stages.

| Code | Severity | Description |
|------|----------|-------------|
| `UNKNOWN_WITHOUT_QUESTION` | ERROR | An UNKNOWN marker exists without a corresponding OPEN_QUESTIONS entry |
| `EMPTY_SECTION` | WARNING | A required document section is empty |
| `MISSING_SECTION` | ERROR | A required document section is entirely absent |
| `TBD_IN_REQUIRED` | ERROR | A required field contains TBD/TODO instead of real content or UNKNOWN |
| `INCOMPLETE_CHECKLIST` | ERROR | A mandatory checklist has unchecked items |
| `MISSING_ACCEPTANCE` | ERROR | Acceptance criteria are missing from a required section |
| `ANCHOR_NOT_FOUND` | ERROR | Expected AXION anchor comment not found in target file |

---

## Build & Scaffold

Emitted by build-plan, build-exec, scaffold-app, and activate.

| Code | Severity | Description |
|------|----------|-------------|
| `PROJECT_NAME_MISSING` | ERROR | Build plan cannot proceed — project name not set in manifest |
| `SCAFFOLD_NOT_FOUND` | ERROR | Expected scaffold output directory not found |
| `BUILD_PLAN_NOT_FOUND` | ERROR | No build plan file exists for the workspace |
| `MISSING_BUILD_PLAN` | ERROR | Build-exec invoked but no plan has been generated |
| `INVALID_BUILD_PLAN` | ERROR | Build plan file is malformed or contains invalid operations |
| `MISSING_BUILD_CONTEXT` | ERROR | Build context files (locked docs, stack profile) are missing |
| `BUILD_ROOT_MISSING` | ERROR | Build root directory does not exist |
| `BUILD_ROOT_NOT_FOUND` | ERROR | Build root path could not be resolved |
| `BUILDS_DIR_NOT_FOUND` | ERROR | The `builds/` directory does not exist in the workspace |
| `MANIFEST_NOT_FOUND` | ERROR | `manifest.json` not found in workspace root |
| `MANIFEST_GENERATION_FAILED` | ERROR | Failed to generate build manifest |
| `INVALID_PATCH_OP` | ERROR | Build plan contains an invalid file operation type |
| `UNKNOWN_OP_TYPE` | ERROR | Unrecognized operation type in build plan |
| `APPLY_FAILED` | ERROR | Build plan apply operation failed |
| `READY_TO_APPLY` | INFO | Build plan validated and ready for application |
| `FILE_EXISTS` | WARNING | Target file already exists (may need overwrite) |
| `FILE_NOT_FOUND` | ERROR | Expected file not found during build execution |

---

## Build Activation & Runs

Emitted by activate and run-app scripts.

| Code | Severity | Description |
|------|----------|-------------|
| `NO_ACTIVE_BUILD` | ERROR | No build is currently activated for this workspace |
| `ACTIVATE_BLOCKED` | ERROR | Activation blocked — gate conditions not met |
| `ACTIVATE_FAILED` | ERROR | Build activation failed |
| `ACTIVE_BUILD_ROOT_MISSING` | ERROR | Active build root directory is missing |
| `ACTIVE_BUILD_STRUCTURE_INVALID` | ERROR | Active build has invalid directory structure |
| `ACTIVE_BUILD_GATES_UNSATISFIED` | ERROR | Active build does not satisfy required gates |
| `APP_PATH_NOT_FOUND` | ERROR | Application entry point path not found |
| `APP_PATH_OUTSIDE_BUILD_ROOT` | ERROR | App path resolves outside the build root (security violation) |
| `INSTALL_FAILED` | ERROR | `npm install` failed during build activation |
| `START_FAILED` | ERROR | Application start command failed |
| `TESTS_FAILED` | ERROR | Test suite execution reported failures |

---

## Build Manifest & Artifacts

Emitted during manifest validation and artifact processing.

| Code | Severity | Description |
|------|----------|-------------|
| `BLD_MANIFEST_MISSING` | ERROR | Build manifest file is missing |
| `BLD_MANIFEST_CORRUPT` | ERROR | Build manifest contains invalid or corrupt data |
| `BLD_MANIFEST_SCHEMA` | ERROR | Build manifest does not match expected schema |
| `BLD_SNAPSHOT_MISSING` | ERROR | Build snapshot file is missing |
| `ARTIFACT_CORRUPT` | ERROR | An artifact file is corrupt or unreadable |
| `ARTIFACT_SCHEMA_INVALID` | ERROR | Artifact does not match its expected schema |
| `REG_ARTIFACT_CORRUPT` | ERROR | A registry artifact file is corrupt or unreadable |
| `CORRUPT_INPUT_ARTIFACTS` | ERROR | Input artifacts for a stage are corrupt |
| `ARCHIVE_FAILED` | ERROR | Zip/archive creation failed |

---

## Seams & Integration

Emitted by `verify-seams` during cross-domain interface validation.

| Code | Severity | Description |
|------|----------|-------------|
| `SEAM_OWNER_VIOLATION` | ERROR | A seam is claimed by a module that does not own it |
| `SEAM_DUPLICATE_DEFINITION` | ERROR | The same seam is defined in multiple places |
| `SEAM_MISSING_LINK` | ERROR | A seam reference points to a non-existent target |

---

## Import & Reconcile

Emitted during codebase import and reconciliation.

| Code | Severity | Description |
|------|----------|-------------|
| `MISSING_IMPORT_FACTS` | ERROR | Import analysis did not produce expected fact files |
| `MISSING_SOURCE_ROOT` | ERROR | Import source root directory not found |
| `RECONCILE_BLOCKED` | ERROR | Reconciliation cannot proceed — prerequisites missing |
| `RECONCILE_FAILED` | ERROR | Reconciliation found unresolvable mismatches |
| `RECONCILE_CRITICAL_MISMATCHES` | ERROR | Reconciliation found critical mismatches that block pipeline |
| `STACK_ID_MISMATCH` | ERROR | Imported stack profile ID does not match workspace |
| `FINGERPRINT_MATCH` | INFO | File fingerprint matches — no drift detected |

---

## Configuration & Templates

| Code | Severity | Description |
|------|----------|-------------|
| `INVALID_CONFIG` | ERROR | Configuration value is invalid |
| `MISSING_CONFIG` | ERROR | Required configuration key is missing |
| `MISSING_TEMPLATES` | ERROR | Template directory or files are missing |
| `TPL_DIR_MISSING` | ERROR | Template directory does not exist |
| `TPL_MISSING` | ERROR | A specific template file is missing |
| `MISSING_STACK_PROFILE` | ERROR | `stack_profile.json` not found in workspace registry |
| `MISSING_DEPENDENCY` | ERROR | A required module dependency is not satisfied |
| `DEPENDENCY_EXPECTED_NOT_FOUND` | ERROR | Expected dependency output not found |

---

## Health Check & Route Validation

Emitted during application health checking and route reconciliation.

| Code | Severity | Description |
|------|----------|-------------|
| `HEALTH_PATH_NOT_FOUND_IN_SOURCE` | WARNING | Health check path defined in plan but not found in source |
| `HEALTH_PATH_MISMATCH` | ERROR | Health check path does not match expected configuration |
| `ROUTE_PLANNED_NOT_FOUND` | WARNING | A planned route was not found in the generated application |
| `ROUTE_FOUND_NOT_PLANNED` | WARNING | An unplanned route was found in the generated application |
| `ROUTES_NOT_AVAILABLE_IN_PLAN` | INFO | Route validation skipped — routes not defined in build plan |
| `SERVER_ENTRY_MISMATCH` | ERROR | Server entry point does not match stack profile |
| `SERVER_ENTRY_NOT_IN_PROFILE` | WARNING | Server entry point not specified in stack profile |

---

## Cross-References

- **Gate definitions:** See `run-sequences.md`
- **Module dependencies:** See `domain-build-order.md`
- **Term definitions:** See `glossary.md`
