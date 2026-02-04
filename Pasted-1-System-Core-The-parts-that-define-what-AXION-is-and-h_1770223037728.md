1) System Core

The parts that define what AXION is and how it runs.

Pipeline definition (stage order, gating rules, module mode rules)

Reason code taxonomy (deterministic failures, blocked_by semantics)

Output contracts (final JSON on stdout, artifact schemas)

2) Source of Truth Layer

The inputs that everything else derives from.

Product truth: RPBS_Product (seeded from user input)

Engineering truth: REBS_Product (derived/expanded rules)

(Optional) Import truth: summaries from existing codebase analysis

3) Template Layer

Reusable blank-state templates that agents populate.

ROSHI core templates (DDES/UX/UI/ALRP/ERC/TIES/SROL, etc.)

Domain/module templates (your 19 module README templates)

Template contract markers + required sections rules

4) Registry and Governance Layer

The “guardrails” and enforcement mechanisms.

Registries (glossary, action vocabulary, reason codes, module index, domain maps/build order)

Stage markers + verify status/report

Drift detection/hashing (template revisioning)

Seam governance (if enabled), repair mode outputs

5) Execution Layer

The scripts/commands that actually run the system.

Docs pipeline scripts: init/generate/seed/draft/review/verify/lock/package

Reliability wrappers: preflight/run lock/run history

Two-root tooling: kit-create, project/workspace root creation

Routing tooling: activate + active build pointer

6) Build and Application Layer

Where AXION turns locked docs into real code workflows.

scaffold-app (creates app skeleton)

build-plan (task graph from locked docs)

build-exec (if/when you add it)

test (test_report + gates)

run-app (starts active build)

deploy (optional)

7) Packaging and Portability Layer

How outputs become reusable deliverables.

Runnable Agent Kit format (duplicated axion snapshot + project workspace)

Manifests (what revision, what commands, what gates)

Export bundles and reproducibility metadata

8) Validation and Test Harness

Everything that keeps AXION stable as it scales.

Fixture workspaces (two-root fixtures, failure fixtures)

Test runner + suites (pipeline, governance, routing, determinism, E2E)

Schema regression tests for all JSON artifacts

“No pollution” checks (no writes into system root)