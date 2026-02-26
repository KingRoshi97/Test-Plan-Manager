axion/
├── README.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vitest.config.ts
├── .gitignore
├── .env.example
│
├── docs_system/
│   └── ... (unchanged)
│
├── libraries/
│   └── ... (unchanged)
│
├── registries/                           # NEW: compiled global views (built from /features + libraries)
│   ├── FEATURE_REGISTRY.json             # all FEAT entries (id, deps, status, owner, category)
│   ├── ERROR_CODE_REGISTRY.json          # all error codes (domain, severity, retryability, action)
│   ├── GATE_REGISTRY.json                # all gates (gate_id, version, applies_when, required evidence)
│   ├── PROOF_TYPE_REGISTRY.json          # all proof types (schema versions + required fields)
│   ├── OBJECT_MODEL.json                 # canonical object types (Run, StageRun, Artifact, etc.)
│   ├── POLICY_REGISTRY.json              # policy definitions + versions (if stored centrally)
│   └── PACKAGING_PROFILES.json           # bundle profiles (thin/full/audit/public/internal/repro)
│
├── features/                             # NEW: per-feature “artifact packs” (source of truth)
│   ├── FEAT-001_control_plane_core/
│   │   ├── 00_registry.json
│   │   ├── 01_contract.md
│   │   ├── 02_errors.md
│   │   ├── 03_security.md
│   │   ├── 04_gates_and_proofs.md
│   │   ├── 05_tests.md
│   │   ├── 06_observability.md
│   │   ├── 07_docs.md
│   │   └── 08_api.md
│   ├── FEAT-002_operator_ui_core/
│   │   ├── 00_registry.json
│   │   ├── 01_contract.md
│   │   ├── 02_errors.md
│   │   ├── 03_security.md
│   │   ├── 04_gates_and_proofs.md
│   │   ├── 05_tests.md
│   │   ├── 06_observability.md
│   │   ├── 07_docs.md
│   │   └── 08_api.md
│   ├── FEAT-003_gate_engine_core/
│   │   └── (same 8+ files)
│   ├── FEAT-004_artifact_store_registry/
│   │   └── (same 8+ files)
│   ├── FEAT-005_cache_incremental_planner/
│   │   └── (same 8+ files)
│   ├── FEAT-006_standards_resolution_engine/
│   │   └── (same 8+ files)
│   ├── FEAT-007_template_registry_renderer/
│   │   └── (same 8+ files)
│   ├── FEAT-008_proof_ledger/
│   │   └── (same 8+ files)
│   ├── FEAT-009_export_bundles/
│   │   └── (same 8+ files)
│   ├── FEAT-010_release_objects_signing/
│   │   └── (same 8+ files)
│   ├── FEAT-011_policy_engine_core/
│   │   └── (same 8+ files)
│   ├── FEAT-012_secrets_pii_scanner_quarantine/
│   │   └── (same 8+ files)
│   ├── FEAT-013_ref_integrity_engine/
│   │   └── (same 8+ files)
│   ├── FEAT-014_coverage_scoring_engine/
│   │   └── (same 8+ files)
│   ├── FEAT-015_run_diff_engine/
│   │   └── (same 8+ files)
│   ├── FEAT-016_minimal_repro_exporter/
│   │   └── (same 8+ files)
│   └── FEAT-017_error_taxonomy_registry/
│       └── (same 8+ files)
│
├── src/
│   ├── index.ts
│   ├── cli/
│   │   ├── axion.ts
│   │   └── commands/
│   │       ├── generateKit.ts
│   │       ├── validateIntake.ts
│   │       ├── resolveStandards.ts
│   │       ├── buildSpec.ts
│   │       ├── planWork.ts
│   │       ├── fillTemplates.ts
│   │       ├── packageKit.ts
│   │       ├── runGates.ts
│   │       ├── runControlPlane.ts         # NEW (FEAT-001): CP service/daemon start
│   │       ├── exportBundle.ts            # NEW (FEAT-009)
│   │       ├── release.ts                 # NEW (FEAT-010)
│   │       └── repro.ts                   # NEW (FEAT-016)
│   ├── core/
│   │   ├── ids/
│   │   ├── intake/
│   │   ├── standards/
│   │   ├── canonical/
│   │   ├── planning/
│   │   ├── templates/
│   │   ├── kit/
│   │   ├── state/
│   │   ├── gates/
│   │   ├── controlPlane/                  # NEW (FEAT-001)
│   │   │   ├── api.ts                     # request/response shapes (internal)
│   │   │   ├── model.ts                   # core CP types (Run, StageRun, Artifact, Proof...)
│   │   │   ├── store.ts                   # persistence adapter (sqlite/json first)
│   │   │   ├── audit.ts                   # audit log hash chain
│   │   │   ├── pins.ts
│   │   │   ├── releases.ts
│   │   │   └── policies.ts
│   │   ├── artifactStore/                 # NEW (FEAT-004)
│   │   │   ├── cas.ts
│   │   │   ├── refs.ts                    # storage_ref format parsing
│   │   │   └── gc.ts
│   │   ├── cache/                         # NEW (FEAT-005)
│   │   │   ├── keys.ts
│   │   │   ├── planner.ts
│   │   │   └── integrity.ts
│   │   ├── diff/                          # NEW (FEAT-015)
│   │   │   ├── runDiff.ts
│   │   │   └── classify.ts
│   │   ├── repro/                         # NEW (FEAT-016)
│   │   │   ├── selector.ts
│   │   │   └── builder.ts
│   │   ├── refs/                          # NEW (FEAT-013)
│   │   │   ├── extractor.ts
│   │   │   ├── resolver.ts
│   │   │   └── graph.ts
│   │   ├── coverage/                      # NEW (FEAT-014)
│   │   │   ├── scorer.ts
│   │   │   └── rules.ts
│   │   ├── proofLedger/                   # NEW (FEAT-008)
│   │   │   ├── registry.ts
│   │   │   └── validate.ts
│   │   ├── scanner/                       # NEW (FEAT-012)
│   │   │   ├── packs.ts
│   │   │   ├── scan.ts
│   │   │   └── quarantine.ts
│   │   └── taxonomy/                      # NEW (FEAT-017)
│   │       ├── errors.ts                  # registry loader + validator
│   │       └── normalize.ts               # normalized error object builder
│   ├── types/
│   └── utils/
│
├── test/
│   ├── fixtures/
│   │   ├── ... (existing)
│   │   ├── control_plane_expected/        # NEW: CP object fixtures + snapshots
│   │   ├── bundles_expected/              # NEW: bundle manifests + verify reports
│   │   ├── diff_expected/                 # NEW: run diff report fixtures
│   │   ├── repro_expected/                # NEW: repro selection + manifest fixtures
│   │   └── scan_expected/                 # NEW: scanner findings + quarantine fixtures
│   ├── golden_kits/
│   ├── unit/
│   ├── integration/
│   └── helpers/
│
└── scripts/
    ├── dev_generate_kit.sh
    ├── dev_run_gates.sh
    ├── dev_run_tests.sh
    ├── dev_run_cp.sh                       # NEW: run control plane locally
    ├── dev_export_bundle.sh                # NEW
    └── dev_verify_bundle.sh                # NEW