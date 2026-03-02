APIG-05
APIG-05 — Compatibility Test
Requirements (contract tests, schema
checks)
Header Block
   ●​ template_id: APIG-05​

   ●​ title: Compatibility Test Requirements (contract tests, schema checks)​

   ●​ type: api_governance_versioning​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/api_governance/APIG-05_Compatibility_Test_Requirements.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.APIG​

   ●​ upstream_dependencies: ["APIG-01", "APIG-02", "API-02", "ERR-03"]​

   ●​ inputs_required: ["APIG-01", "APIG-02", "API-02", "ERR-03", "TINF-01", "CICD-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the minimum compatibility/contract test suite required to ship and evolve APIs without
breaking clients: schema checks, contract tests, backward-compat enforcement, and CI
requirements.


Inputs Required
   ●​ APIG-01: {{xref:APIG-01}} | OPTIONAL​
  ●​ APIG-02: {{xref:APIG-02}} | OPTIONAL​

  ●​ API-02: {{xref:API-02}} | OPTIONAL​

  ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​

  ●​ TINF-01: {{xref:TINF-01}} | OPTIONAL​

  ●​ CICD-04: {{xref:CICD-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Contract test categories:​

          ○​ schema compatibility checks (OpenAPI/JSON schema)​

          ○​ error contract checks (ERR-03)​

          ○​ authz contract checks (PMAD enforcement)​

          ○​ pagination/filtering contract checks​

          ○​ versioning compatibility checks (APIG-02)​

  ●​ Required CI execution rules (when and where run)​

  ●​ Failure policy (block merges/releases)​

  ●​ Test artifact requirements (reports, diffs)​



Optional Fields
  ●​ Golden files strategy | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Compatibility tests must run in CI for protected branches.​

   ●​ Failing compatibility tests must block release.​

   ●​ Schema diffs must be reviewed and approved when breaking.​



Output Format
1) Applicability

   ●​ applies: {{compat_tests.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{compat_tests.na_block}} | OPTIONAL​



2) Required Test Categories (required if applies)
    category         require      description             tooling_hint                 notes
                        d

schema_compat        true      {{tests.schema.des     {{tests.schema.toolin     {{tests.schema.note
                               c}}                    g}}                       s}}

error_contract       true      {{tests.error.desc}}   {{tests.error.tooling}}   {{tests.error.notes}}

authz_contract       true      {{tests.authz.desc}    {{tests.authz.tooling}}   {{tests.authz.notes}
                               }                                                }

pagination_filteri   true      {{tests.pfs.desc}}     {{tests.pfs.tooling}}     {{tests.pfs.notes}}
ng

versioning           true      {{tests.version.des    {{tests.version.toolin    {{tests.version.note
                               c}}                    g}}                       s}}


3) CI Execution Rules (required if applies)

   ●​ When run: {{ci.when}}​
   ●​ Required branches: {{ci.branches}}​

   ●​ Required environments: {{ci.envs}} | OPTIONAL​

   ●​ Artifacts produced: {{ci.artifacts}}​



4) Failure Policy (required if applies)

   ●​ Block merge on failure: {{policy.block_merge}}​

   ●​ Block release on failure: {{policy.block_release}}​

   ●​ Exception/waiver allowed: {{policy.waiver_allowed}} | OPTIONAL​



5) Artifact Requirements (required if applies)

   ●​ Schema diff report: {{artifacts.schema_diff}}​

   ●​ Contract test report: {{artifacts.test_report}}​

   ●​ Evidence pointers stored: {{artifacts.evidence_store}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:APIG-02}} | OPTIONAL, {{xref:API-02}} | OPTIONAL​

   ●​ Downstream: {{xref:APIG-06}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL,
      {{xref:RELOPS-05}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Categories + CI rules + failure policy.​
 ●​ advanced: Required if applies. Add artifact requirements and waiver controls.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: golden_files, notes, waiver_allowed, envs​

 ●​ If applies == true and CI rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.APIG​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_categories_present == true​

        ○​ if_applies_then_ci_rules_present == true​

        ○​ failure_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
