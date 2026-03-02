APIG-06
APIG-06 — Schema Evolution Rules
(backward compatible changes,
migrations)
Header Block
   ●​ template_id: APIG-06​

   ●​ title: Schema Evolution Rules (backward compatible changes, migrations)​

   ●​ type: api_governance_versioning​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/api_governance/APIG-06_Schema_Evolution_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.APIG​

   ●​ upstream_dependencies: ["APIG-02", "DATA-04", "ERR-03"]​

   ●​ inputs_required: ["APIG-02", "DATA-04", "ERR-03", "STK-04", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the rules for evolving schemas safely (API request/response schemas and shared
models): what changes are backward compatible, how to stage migrations, how to deprecate
fields, and how to avoid breaking clients during mixed-version deployments.


Inputs Required
   ●​ APIG-02: {{xref:APIG-02}} | OPTIONAL​

   ●​ DATA-04: {{xref:DATA-04}} | OPTIONAL​
  ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​

  ●​ STK-04: {{xref:STK-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Compatible change list (allowed)​

  ●​ Breaking change list (requires new version)​

  ●​ Field evolution rules:​

         ○​ add optional field policy​

         ○​ add required field policy (usually breaking)​

         ○​ rename field policy​

         ○​ delete field policy​

         ○​ change type policy​

  ●​ Default values policy​

  ●​ Deprecation annotations policy (how to mark deprecated fields)​

  ●​ Migration staging rules (expand/contract alignment to DATA-04)​

  ●​ Mixed-version compatibility statement (old+new)​

  ●​ Approval requirements for breaking changes​



Optional Fields
  ●​ GraphQL schema evolution notes | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
  ●​ Deleting or changing types is breaking unless versioned.​

  ●​ New required fields are breaking unless defaulting rules are explicit and safe.​

  ●​ Renames require compatibility windows (support both old and new).​

  ●​ Mixed-version deployments must be supported during rollout.​



Output Format
1) Backward-Compatible Changes (required)

  ●​ {{compatible[0]}}​

  ●​ {{compatible[1]}}​

  ●​ {{compatible[2]}} | OPTIONAL​



2) Breaking Changes (required)

  ●​ {{breaking[0]}}​

  ●​ {{breaking[1]}}​

  ●​ {{breaking[2]}} | OPTIONAL​



3) Field Evolution Rules (required)
 change_type       allowed_in_place            required_process                 notes

add_optional_   {{rules.add_optional.allo   {{rules.add_optional.pro   {{rules.add_optional.n
field           wed}}                       cess}}                     otes}}

add_required_   false                       {{rules.add_required.pro   {{rules.add_required.n
field                                       cess}}                     otes}}

rename_field    {{rules.rename.allowed}}    {{rules.rename.process}    {{rules.rename.notes}}
                                            }
delete_field     false                         {{rules.delete.process}}   {{rules.delete.notes}}

change_type      false                         {{rules.change_type.pro    {{rules.change_type.n
                                               cess}}                     otes}}


4) Default Values Policy (required)

  ●​ Client defaulting: {{defaults.client}}​

  ●​ Server defaulting: {{defaults.server}}​

  ●​ Backfill policy pointer: {{xref:DATA-04}} | OPTIONAL​



5) Deprecation Annotations (required)

  ●​ How to mark deprecated: {{deprecations.how}}​

  ●​ Required timeline: {{deprecations.timeline}} | OPTIONAL​



6) Migration Staging Rules (required)

  ●​ Expand/contract stance: {{staging.expand_contract}}​

  ●​ Mixed-version support: {{staging.mixed_version_support}}​

  ●​ Verification requirement: {{staging.verification}} | OPTIONAL​



7) Approval Requirements (required)

  ●​ Breaking change approval: {{approval.breaking}}​

  ●​ Decision log pointer: {{xref:STK-04}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DATA-04}} | OPTIONAL, {{xref:APIG-02}} | OPTIONAL​
  ●​ Downstream: {{xref:REL-04}} | OPTIONAL, {{xref:QA-05}} | OPTIONAL, {{xref:APIG-05}}
     | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Compatible vs breaking list + field evolution table.​

  ●​ intermediate: Required. Add staging rules and default value policy.​

  ●​ advanced: Required. Add verification requirements and approval governance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: graphql_notes, notes, verification_requirement,
     timeline​

  ●​ If rename/delete/type-change policies are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.APIG​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ field_evolution_rules_present == true​

         ○​ staging_rules_present == true​

         ○​ approval_requirements_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
