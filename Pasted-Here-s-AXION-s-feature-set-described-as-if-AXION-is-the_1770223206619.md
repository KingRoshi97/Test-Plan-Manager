Here’s AXION’s feature set described as if AXION is the product (not the repo). I’m listing them as product-facing capabilities, grouped by product areas.

1) Project Creation and Workspace Management

Create Build Kit (Self-Contained Workspace): generate a new build root containing a full AXION snapshot plus a project workspace.

Project Name Derivation: seed and enforce a canonical project name from product source docs.

Two-Root Isolation: keep the AXION system snapshot immutable while all outputs live in a project-named workspace root.

Workspace Safety Policies: refuse unsafe roots, refuse non-empty roots unless explicitly allowed, optional archive of existing content.

Build Inventory: maintain multiple build roots over time (parallel builds, rollback capability).

2) Product Input Capture and Truth Management

RPBS Generation (Product Truth): capture/seed the product blueprint from user input.

REBS Generation (Engineering Truth): define engineering philosophy/constraints derived from product truth.

Source Doc Persistence: preserve RPBS/REBS as authoritative inputs across all downstream stages.

Optional Import Mode: analyze an existing codebase into “import truth” documents without overwriting canonical truth.

3) Modular Documentation Generation (Docs Pipeline)

Canonical Pipeline Execution: init → generate → seed → draft → review → verify → lock (package as export).

Module Mode Execution: run stages per module or across all modules with strict canonical ordering.

Dependency Enforcement: block execution when prerequisites are missing with deterministic blocked_by output.

Template-to-Docs Generation: copy templates into per-module documentation outputs.

Seeding of Required Structure: inject required sections, placeholders, and contract markers into generated docs.

Agent Drafting: populate docs from RPBS/REBS while preserving cross-module continuity.

4) Compliance, Quality Gates, and Governance

Review Checks: completeness scoring, UNKNOWN/TBD enforcement, cross-reference validation.

Verify Gate: consolidated pass/fail determination per module and overall.

Reason Codes: structured failure taxonomy to explain why a module or run failed.

Repair Suggestions: generate actionable fix lists (and optional patch proposals) when verify fails.

Lock Gate: refuse lock unless latest verify is PASS.

ERC Generation: produce execution readiness certificates/artifacts when locked.

5) Deterministic Execution and Reliability Controls

Preflight Validation: environment/workspace validation prior to running any stage.

Run Locking: prevent concurrent runs against the same workspace.

Run History Ledger: store immutable run records with logs, JSON results, and artifacts written.

Deterministic Outputs: stable module ordering, stable stage sequencing, machine-readable final JSON results.

Dry-Run Mode: resolve and preview actions without executing.

6) Presets, Plans, and Repeatable Build Recipes

Stage Plans: named sequences like scaffold/docs/full/release.

Presets: named module scopes with dependency expansion rules and optional guards.

One-Command Runs: wrapper execution that applies plan + preset deterministically.

Guarded Operations: configurable gates (e.g., activation requires lock, verify, tests).

7) Application Build Pipeline (Code Generation / Implementation Support)

App Scaffold: create app folder structure inside the project workspace based on stack profile.

Build Plan Generator: convert locked docs into an ordered implementation task graph.

(Optional) Build Executor: run tasks and apply changes under controlled policies (if/when enabled).

Test Runner Integration: execute project tests and emit machine-readable test reports.

8) Routing, Activation, and Runtime Control

Active Build Pointer: universal ACTIVE_BUILD.json routing target.

Activation Command: switch the active build only if gates pass (verify/lock/tests).

Run Active App: start the application from the active build path (universal workflow).

Rollback Capability: reactivate a previous build by switching the pointer.

9) Drift Control and Reproducibility

Template Hashing: detect drift in templates and system files via revisioned hashes.

Drift Reporting: list added/removed/modified templates or system artifacts.

Reproducible Kits: build roots contain an AXION snapshot and manifest for portability.

Schema Contracts: JSON artifact schemas remain stable across upgrades (regression checked).

10) Export and Portability

Agent Kit Packaging: bundle system snapshot + project workspace + manifests into a portable artifact.

Manifest Generation: store run metadata (revision, plan, preset, commands, gates, timestamps).

Delivery Ready Output: produce a “handoffable” build folder or zip usable by any coding agent environment.

11) Observability and Developer Experience

Structured Logs: consistent [PASS]/[FAIL]/[INFO] output plus final JSON.

Artifact Browserability: predictable file locations for docs, registry, ERCs, reports.

Failure Explainability: next commands and fix hints emitted on deterministic failures.

12) Test Harness and Continuous Hardening

Fixture Workspaces: reproducible scenarios (pass, fail, blocked, drift, gate failures).

Golden Path E2E Tests: verify the full two-root workflow end-to-end.

Governance Tests: seam/ownership checks (if enabled) and drift checks.

Schema Regression Tests: validate artifact formats remain compatible.

No-Pollution Tests: ensure no outputs leak into system snapshot paths.