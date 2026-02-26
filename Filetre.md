axion/
├── README.md
├── LICENSE
├── package.json
├── pnpm-lock.yaml              # or package-lock.json
├── tsconfig.json
├── vitest.config.ts            # or jest.config.ts
├── .gitignore
├── .env.example
│
├── docs_system/                # the umbrella Axion system docs (SYS/INT/CAN/STD/TMP/ORD/PLAN/VER/KIT/STATE/GOV/EXEC)
│   ├── SYS/
│   │   ├── SYS-01_System_Purpose_&_Guarantees.md
│   │   ├── SYS-02_Operating_Principles.md
│   │   ├── SYS-03_End-to-End_Architecture.md
│   │   ├── SYS-04_Artifact_Taxonomy.md
│   │   ├── SYS-05_Roles_&_Responsibilities.md
│   │   ├── SYS-06_Data_&_Traceability_Model.md
│   │   ├── SYS-07_Compliance_&_Gate_Model.md
│   │   ├── SYS-08_Configuration_Model.md
│   │   ├── SYS-09_Terminology_&_Definitions.md
│   │   └── SYS-10_System_Boundaries.md
│   ├── INT/
│   │   ├── INT-01_Intake_Form_Spec.md
│   │   ├── INT-02_Intake_Schema_Spec.md
│   │   ├── INT-03_Intake_Validation_Rules.md
│   │   ├── INT-04_Submission_Record_Format.md
│   │   └── INT-05_Validator_Output_Format.md
│   ├── CAN/
│   │   ├── CAN-01_Canonical_Spec_Model.md
│   │   ├── CAN-02_ID_&_Reference_Rules.md
│   │   └── CAN-03_Unknowns_Model.md
│   ├── STD/
│   │   ├── STD-01_Standards_Library_Structure.md
│   │   ├── STD-02_Standards_Resolution_Rules.md
│   │   └── STD-03_Standards_Snapshot_Format.md
│   ├── TMP/
│   │   ├── TMP-01_Template_Index_Registry.md
│   │   ├── TMP-02_Template_File_Contract.md
│   │   ├── TMP-03_Template_Selection_Rules.md
│   │   ├── TMP-04_Template_Fill_Rules.md
│   │   └── TMP-05_Template_Completeness_Rules.md
│   ├── ORD/
│   │   ├── ORD-01_Build_Order_Graph.md
│   │   ├── ORD-02_Gate_DSL_&_Gate_Rules.md
│   │   └── ORD-03_Per-Doc_Gate_Checklist_Format.md
│   ├── PLAN/
│   │   ├── PLAN-01_Work_Breakdown_Rules.md
│   │   ├── PLAN-02_Acceptance_Map_Rules.md
│   │   └── PLAN-03_Sequencing_Heuristics.md
│   ├── VER/
│   │   ├── VER-01_Proof_Types_&_Evidence_Rules.md
│   │   ├── VER-02_Verification_Command_Policy.md
│   │   └── VER-03_Completion_Criteria.md
│   ├── KIT/
│   │   ├── KIT-01_Kit_Folder_Structure_Contract.md
│   │   ├── KIT-02_Manifest_&_Index_Format.md
│   │   ├── KIT-03_Entrypoint_Contract.md
│   │   └── KIT-04_Version_Stamping_Rules.md
│   ├── STATE/
│   │   ├── STATE-01_State_Snapshot_Format.md
│   │   ├── STATE-02_Resume_Rules.md
│   │   └── STATE-03_Handoff_Rules.md
│   ├── GOV/
│   │   ├── GOV-01_Versioning_Policy.md
│   │   ├── GOV-02_Change_Control_Rules.md
│   │   ├── GOV-03_Deprecation_&_Migration_Rules.md
│   │   └── GOV-04_Audit_&_Traceability_Rules.md
│   └── EXEC/
│       ├── EXEC-01_Internal_Agent_Runbook.md
│       ├── EXEC-02_External_Agent_Prompt_Template.md
│       └── EXEC-03_Failure_Handling_Playbook.md
│
├── libraries/                  # persistent system assets (what the runner consumes)
│   ├── intake/
│   │   ├── enums.v1.json        # SkillLevel, Category, TypePreset, etc.
│   │   ├── schema.v1.json       # machine schema mirror of INT-02 (optional but useful)
│   │   └── rules.v1.json        # machine rules mirror of INT-03 (optional but useful)
│   ├── standards/
│   │   ├── standards_index.json # STD-01 registry (packs + applies_when + priority)
│   │   └── packs/
│   │       ├── eng_core@1.0.0.json
│   │       ├── sec_baseline@1.0.0.json
│   │       ├── qa_baseline@1.0.0.json
│   │       └── ...more packs...
│   └── templates/
│       ├── template_index.json  # TMP-01 registry
│       └── templates/
│           ├── product/
│           │   ├── PRD-01@1.0.0.md
│           │   ├── PRD-02@1.0.0.md
│           │   └── ...
│           ├── design/
│           ├── architecture/
│           ├── implementation/
│           ├── security/
│           ├── quality/
│           ├── ops/
│           ├── data/
│           ├── api_contracts/
│           ├── release/
│           ├── governance/
│           └── analytics/
│
├── src/                         # Axion runner/toolchain (minimal code, but enough to enforce contracts)
│   ├── index.ts
│   ├── cli/
│   │   ├── axion.ts             # CLI entry (generate-kit, validate, run-gates, etc.)
│   │   └── commands/
│   │       ├── generateKit.ts
│   │       ├── validateIntake.ts
│   │       ├── resolveStandards.ts
│   │       ├── buildSpec.ts
│   │       ├── planWork.ts
│   │       ├── fillTemplates.ts
│   │       ├── packageKit.ts
│   │       └── runGates.ts
│   ├── core/
│   │   ├── ids/
│   │   │   ├── slugify.ts
│   │   │   └── idRules.ts        # CAN-02 implementation helpers
│   │   ├── intake/
│   │   │   ├── submissionRecord.ts  # INT-04
│   │   │   ├── validator.ts         # INT-02/03 -> INT-05
│   │   │   └── normalizer.ts        # Normalized Input Record
│   │   ├── standards/
│   │   │   ├── selector.ts          # STD-02 step 2-3
│   │   │   ├── resolver.ts          # STD-02 merge + overrides
│   │   │   └── snapshot.ts          # STD-03 emitter
│   │   ├── canonical/
│   │   │   ├── specBuilder.ts       # CAN-01 build
│   │   │   └── unknowns.ts          # CAN-03
│   │   ├── planning/
│   │   │   ├── workBreakdown.ts     # PLAN-01
│   │   │   ├── acceptanceMap.ts     # PLAN-02
│   │   │   └── sequencing.ts        # PLAN-03
│   │   ├── templates/
│   │   │   ├── index.ts             # TMP-01 loader
│   │   │   ├── selector.ts          # TMP-03
│   │   │   ├── filler.ts            # TMP-04
│   │   │   └── completenessGate.ts  # TMP-05
│   │   ├── kit/
│   │   │   ├── layout.ts            # KIT-01 structure + N/A stubs
│   │   │   ├── manifest.ts          # KIT-02
│   │   │   ├── entrypoint.ts        # KIT-03
│   │   │   ├── versions.ts          # KIT-04
│   │   │   └── packager.ts          # zip + filesystem output
│   │   ├── state/
│   │   │   ├── stateSnapshot.ts     # STATE-01 writer/updater
│   │   │   ├── resume.ts            # STATE-02
│   │   │   └── handoff.ts           # STATE-03
│   │   └── gates/
│   │       ├── dsl.ts               # ORD-02
│   │       ├── runner.ts            # evaluates gate rules
│   │       └── reports.ts           # gate report output contract
│   ├── types/
│   │   ├── intake.ts
│   │   ├── canonical.ts
│   │   ├── standards.ts
│   │   ├── templates.ts
│   │   ├── planning.ts
│   │   ├── kit.ts
│   │   └── state.ts
│   └── utils/
│       ├── hash.ts
│       ├── io.ts
│       └── errors.ts
│
├── test/                        # test suite (unit + integration + golden outputs)
│   ├── fixtures/
│   │   ├── intake_submissions/
│   │   │   ├── consumer_new_beginner.json
│   │   │   ├── internal_existing_expert.json
│   │   │   └── ...
│   │   ├── standards_expected/
│   │   ├── canonical_expected/
│   │   └── templates_expected/
│   ├── golden_kits/             # expected full kit outputs (snapshotted)
│   │   ├── planner_app_minimal/
│   │   │   └── agent_kit/...
│   │   └── ...
│   ├── unit/
│   │   ├── intake.validator.test.ts
│   │   ├── standards.resolver.test.ts
│   │   ├── canonical.specBuilder.test.ts
│   │   ├── planning.workBreakdown.test.ts
│   │   ├── templates.filler.test.ts
│   │   └── gates.runner.test.ts
│   ├── integration/
│   │   ├── generateKit.test.ts    # end-to-end: submission -> kit
│   │   └── resume.test.ts         # state snapshot resume behavior
│   └── helpers/
│       ├── loadFixture.ts
│       ├── diffTree.ts
│       └── assertManifest.ts
│
└── scripts/
    ├── dev_generate_kit.sh
    ├── dev_run_gates.sh
    └── dev_run_tests.sh