DATA-06
DATA-06 — Validation Schemas
(Zod/JSON Schema mapping)
Header Block
   ●​ template_id: DATA-06​

   ●​ title: Validation Schemas (Zod/JSON Schema mapping)​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-06_Validation_Schemas.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DATA-01", "DQV-01", "API-02"]​

   ●​ inputs_required: ["DATA-01", "DQV-01", "API-02", "FORM-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the validation schema layer mapping from canonical entity fields to enforceable schemas
(Zod/JSON Schema/other): what is validated where, which schemas exist, and how schema
versions track entity evolution.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DQV-01: {{xref:DQV-01}} | OPTIONAL​

   ●​ API-02: {{xref:API-02}} | OPTIONAL​
  ●​ FORM-01: {{xref:FORM-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Schema registry (minimum 12 schemas for non-trivial products)​

  ●​ For each schema:​

          ○​ schema_id​

          ○​ kind (entity_create/entity_update/api_request/api_response/form_input)​

          ○​ target entity_id or endpoint_id​

          ○​ schema language (zod/jsonschema)​

          ○​ version​

          ○​ required fields​

          ○​ optional fields​

          ○​ validation rules (field-level + cross-field)​

          ○​ error mapping policy (reason_code for failures)​

          ○​ reuse policy (shared vs per-endpoint)​

          ○​ enforcement point (client/server/both)​

  ●​ Versioning rule (schema changes align to DATA-04/APIG-06)​

  ●​ Coverage check: all API writes and all forms have schemas​



Optional Fields
   ●​ Codegen notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Schema enforcement must be explicit; “validated somewhere” is not allowed.​

   ●​ Cross-field semantic validation must be captured (DQV).​

   ●​ Validation errors must map to error model (ERR) and accessible error messaging
      (A11Y/CDX pointers).​



Output Format
1) Applicability

   ●​ applies: {{schemas.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{schemas.na_block}} | OPTIONAL​



2) Schema Registry (canonical)
 sch      kind        target     languag       version      enforced_at      error_map          notes
 ema                                e                                           ping
  _id

 sch    {{registry   {{registry[ {{registry   {{registry[   {{registry[0].   {{registry[0].   {{registry[
 _01    [0].kind}}   0].target}} [0].lang}}   0].version}   enforced_at}     error_map}}      0].notes}}
                                              }             }

 sch    {{registry   {{registry[ {{registry   {{registry[   {{registry[1].   {{registry[1].   {{registry[
 _02    [1].kind}}   1].target}} [1].lang}}   1].version}   enforced_at}     error_map}}      1].notes}}
                                              }             }


3) Schema Blocks (required, one per schema_id)

{{registry[0].schema_id}}
   ●​ Kind: {{registry[0].kind}}​

   ●​ Target: {{registry[0].target}}​

   ●​ Version: {{registry[0].version}}​

   ●​ Enforced at: {{registry[0].enforced_at}}​

   ●​ Required fields: {{schema_detail[registry[0].schema_id].required_fields}}​

   ●​ Optional fields: {{schema_detail[registry[0].schema_id].optional_fields}}​

   ●​ Cross-field rules: {{schema_detail[registry[0].schema_id].cross_field_rules}} | OPTIONAL​

   ●​ Error mapping: {{schema_detail[registry[0].schema_id].error_mapping}}​

   ●​ Reuse policy: {{schema_detail[registry[0].schema_id].reuse}}​



4) Versioning Rules (required if applies)

   ●​ Align to DATA-04: {{versioning.data_alignment}}​

   ●​ Align to APIG-06: {{versioning.api_alignment}} | OPTIONAL​



5) Coverage Checks (required if applies)

   ●​ All API writes have schemas: {{coverage.api_writes}}​

   ●​ All forms have schemas: {{coverage.forms}}​



Cross-References
   ●​ Upstream: {{xref:DQV-01}} | OPTIONAL, {{xref:API-02}} | OPTIONAL​

   ●​ Downstream: {{xref:DQV-03}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
 ●​ beginner: Not required.​

 ●​ intermediate: Required if applies. Registry + coverage checks.​

 ●​ advanced: Required if applies. Add versioning alignment and semantic rules mapping.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: codegen_notes, notes, cross_field_rules (if none),
    reuse_policy (if per-target)​

 ●​ If applies == true and coverage checks are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DATA​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_registry_present == true​

        ○​ if_applies_then_coverage_present == true​

        ○​ versioning_rules_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
