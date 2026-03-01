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
│   ├── intake/
│   │   ├── enums.v1.json
│   │   ├── schema.v1.json
│   │   └── rules.v1.json
│   ├── standards/
│   │   ├── standards_index.json
│   │   └── packs/
│   │       ├── eng_core@1.0.0.json
│   │       ├── sec_baseline@1.0.0.json
│   │       ├── qa_baseline@1.0.0.json
│   │       └── ...more packs...
│   └── templates/
│       ├── template_index.json
│       │
│       ├── Product Definition/                    # Group 1
│       │   ├── PRD/                               # Product & Requirements
│       │   │   ├── PRD-01.md ... PRD-09.md
│       │   ├── URD/                               # User Research & Discovery
│       │   │   ├── URD-01.md ... URD-05.md
│       │   ├── STK/                               # Stakeholders & Governance
│       │   │   ├── STK-01.md ... STK-04.md
│       │   ├── DMG/                               # Domain Model & Glossary
│       │   │   ├── DMG-01.md ... DMG-04.md
│       │   ├── RSC/                               # Roadmap & Scope Control
│       │   │   ├── RSC-01.md ... RSC-04.md
│       │   ├── RISK/                              # Risk & Assumptions
│       │   │   ├── RISK-01.md ... RISK-04.md
│       │   ├── BRP/                               # Business Rules & Policy
│       │   │   ├── BRP-01.md ... BRP-04.md
│       │   └── SMIP/                              # Success Metrics & Instrumentation Plan
│       │       ├── SMIP-01.md ... SMIP-04.md
│       │
│       ├── Experience Design/                     # Group 2
│       │   ├── DES/                               # Design & UX/UI
│       │   │   ├── DES-01.md ... DES-08.md
│       │   ├── IXD/                               # Interaction Design & Motion
│       │   │   ├── IXD-01.md ... IXD-05.md
│       │   ├── CDX/                               # Content Design & UX Writing
│       │   │   ├── CDX-01.md ... CDX-05.md
│       │   ├── DSYS/                              # Design System & UI Tokens
│       │   │   ├── DSYS-01.md ... DSYS-05.md
│       │   ├── IAN/                               # Information Architecture & Navigation
│       │   │   ├── IAN-01.md ... IAN-05.md
│       │   ├── A11YD/                             # Accessibility Design
│       │   │   ├── A11YD-01.md ... A11YD-05.md
│       │   ├── RLB/                               # Responsive Layout & Breakpoints
│       │   │   ├── RLB-01.md ... RLB-05.md
│       │   └── VAP/                               # Visual Asset Production
│       │       ├── VAP-01.md ... VAP-05.md
│       │
│       ├── System Architecture/                   # Group 3
│       │   ├── ARC/                               # Architecture & Contracts
│       │   │   ├── ARC-01.md ... ARC-10.md
│       │   ├── SIC/                               # System Interfaces & Integration Contracts
│       │   │   ├── SIC-01.md ... SIC-06.md
│       │   ├── SBDT/                              # Service Boundaries & Deployment Topology
│       │   │   ├── SBDT-01.md ... SBDT-06.md
│       │   ├── PMAD/                              # Permission Model & Authorization Design
│       │   │   ├── PMAD-01.md ... PMAD-06.md
│       │   ├── ERR/                               # Error Model & Reason Codes
│       │   │   ├── ERR-01.md ... ERR-06.md
│       │   ├── RTM/                               # Realtime & Messaging Architecture
│       │   │   ├── RTM-01.md ... RTM-06.md
│       │   ├── WFO/                               # Workflow & Orchestration Design
│       │   │   ├── WFO-01.md ... WFO-06.md
│       │   └── APIG/                              # API Governance & Versioning
│       │       ├── APIG-01.md ... APIG-06.md
│       │
│       ├── Data & Information/                    # Group 4
│       │   ├── DATA/                              # Data Model & Schema
│       │   │   ├── DATA-01.md ... DATA-08.md
│       │   ├── DLR/                               # Data Lifecycle & Retention
│       │   │   ├── DLR-01.md ... DLR-06.md
│       │   ├── DGL/                               # Data Governance & Lineage
│       │   │   ├── DGL-01.md ... DGL-06.md
│       │   ├── DQV/                               # Data Quality & Validation
│       │   │   ├── DQV-01.md ... DQV-06.md
│       │   ├── SRCH/                              # Search & Indexing
│       │   │   ├── SRCH-01.md ... SRCH-06.md
│       │   ├── CACHE/                             # Caching & Data Access Patterns
│       │   │   ├── CACHE-01.md ... CACHE-06.md
│       │   └── RPT/                               # Reporting & Aggregations
│       │       ├── RPT-01.md ... RPT-06.md
│       │
│       ├── Application Build/                     # Group 5 (subcategory folders only, templates TBD)
│       │   ├── API/                               # Backend/API
│       │   ├── JBS/                               # Background Jobs & Scheduling
│       │   ├── EVT/                               # Eventing & Webhooks
│       │   ├── RLIM/                              # Rate Limits & Abuse Controls
│       │   ├── FFCFG/                             # Feature Flags & Config
│       │   ├── PFS/                               # API Pagination/Filtering/Sorting
│       │   ├── FPMP/                              # File Processing & Media Pipelines
│       │   ├── ADMIN/                             # Admin & Internal Tools APIs
│       │   ├── FE/                                # Frontend/UI Implementation
│       │   ├── SMD/                               # State Management & Data Fetching
│       │   ├── CPR/                               # Client Performance & Rendering
│       │   ├── FORM/                              # Forms & Validation
│       │   ├── ROUTE/                             # Client Routing & Deep Links
│       │   ├── UICP/                              # UI Composition & Layout Patterns
│       │   ├── CER/                               # Client Error Handling & Recovery
│       │   ├── CSec/                              # Client Security
│       │   ├── MOB/                               # Mobile Implementation
│       │   ├── MDC/                               # Mobile Device Capabilities
│       │   ├── OFS/                               # Offline & Sync
│       │   ├── MBAT/                              # Mobile Performance & Battery
│       │   ├── MDL/                               # Mobile Deep Links & Universal Links
│       │   ├── MPUSH/                             # Push Notifications
│       │   └── SIGN/                              # App Store Release & Signing
│       │
│       ├── Integrations & External Services/      # Group 6 (subcategory folders only, templates TBD)
│       │   ├── INT/                               # Integration & External Systems
│       │   ├── SSO/                               # Third-Party Auth & SSO
│       │   ├── CRMERP/                            # CRM/ERP Integrations
│       │   ├── WHCP/                              # Webhooks Consumers & Providers
│       │   ├── PAY/                               # Payments & Billing
│       │   ├── NOTIF/                             # Notifications & Comms
│       │   └── FMS/                               # Files/Media & Storage
│       │
│       ├── Security, Privacy & Compliance/        # Group 7 (subcategory folders only, templates TBD)
│       │   ├── SEC/                               # Security & Privacy
│       │   ├── IAM/                               # Identity & Access
│       │   ├── TMA/                               # Threat Modeling & Abuse Prevention
│       │   ├── SKM/                               # Secrets & Key Management
│       │   ├── PRIV/                              # Privacy Modeling & Data Minimization
│       │   ├── AUDIT/                             # Audit Logging & Forensics
│       │   └── COMP/                              # Compliance & Risk
│       │
│       └── Operations & Reliability/              # Group 8 (subcategory folders only, templates TBD)
│           ├── OBS/                               # Observability
│           ├── ANL/                               # Analytics & Telemetry
│           ├── LTS/                               # Logging & Tracing Standards
│           ├── ALRT/                              # Monitoring & Alerting
│           ├── SLO/                               # SLOs/SLAs & Error Budgets
│           ├── PERF/                              # Performance & Scalability
│           ├── LOAD/                              # Load/Stress Planning
│           ├── COST/                              # Capacity & Cost Modeling
│           ├── PBP/                               # Performance Budgets & Profiling
│           ├── QA/                                # Quality & Testing
│           ├── QAH/                               # QA Automation & Harnesses
│           ├── RJT/                               # Regression & Journey Tests
│           ├── TDE/                               # Test Data & Environments
│           ├── RELIA/                             # Reliability & Resilience
│           ├── IRP/                               # Incident Response & Postmortems
│           ├── OPS/                               # DevOps & Deployment
│           ├── IAC/                               # Infrastructure as Code
│           ├── CICD/                              # CI/CD Pipelines
│           ├── REL/                               # Release & Change Management
│           ├── ENV/                               # Environment Management
│           ├── SDR/                               # Secrets Deployment & Rotation
│           ├── BDR/                               # Backup/Restore & DR
│           ├── DOC/                               # Documentation & Runbooks
│           └── L10N_A11Y/                         # Localization & Accessibility
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
├── features/                             # NEW: per-feature "artifact packs" (source of truth)
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
