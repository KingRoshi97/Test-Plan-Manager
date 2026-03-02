DQV-01
DQV-01 — Validation Policy (schema vs
semantic)
Header Block
   ●​ template_id: DQV-01​

   ●​ title: Validation Policy (schema vs semantic)​

   ●​ type: data_quality_validation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_quality/DQV-01_Validation_Policy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DQV​

   ●​ upstream_dependencies: ["DATA-01", "BRP-01", "ERR-01"]​

   ●​ inputs_required: ["DATA-01", "BRP-01", "ERR-01", "API-02", "FORM-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the system’s validation policy: what is validated at schema level vs semantic level, where
validation happens (client/server/DB), how failures are handled, and how validation ties into
error taxonomy and reason codes.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​

   ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​
  ●​ API-02: {{xref:API-02}} | OPTIONAL​

  ●​ FORM-01: {{xref:FORM-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Definitions:​

         ○​ schema validation (shape/type/required)​

         ○​ semantic validation (cross-field/business invariants)​

  ●​ Enforcement points:​

         ○​ client (forms)​

         ○​ server (API boundary)​

         ○​ DB (constraints)​

  ●​ Validation responsibilities matrix:​

         ○​ what must be validated where (minimum 12 rules)​

  ●​ Failure handling rules:​

         ○​ reject vs quarantine vs default​

         ○​ error_class assignment​

         ○​ reason_code policy (ERR-02)​

  ●​ Unknown/extra fields policy:​

         ○​ strict vs permissive parsing​

  ●​ Performance rules (avoid expensive validation in hot paths)​

  ●​ Verification checklist​
Optional Fields
   ●​ Streaming/batch validation notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Client validation improves UX but is non-authoritative; server must enforce.​

   ●​ Semantic validation must reference canonical rules (DMG-03/BRP).​

   ●​ Validation failures must map to reason codes where user-visible.​

   ●​ Unknown fields handling must be explicit and consistent across endpoints.​



Output Format
1) Definitions (required)

   ●​ Schema validation: {{defs.schema}}​

   ●​ Semantic validation: {{defs.semantic}}​



2) Enforcement Points (required)

   ●​ Client: {{enforcement.client}}​

   ●​ Server: {{enforcement.server}}​

   ●​ DB: {{enforcement.db}}​



3) Responsibilities Matrix (required)
rul validati    enfor    applies_to     descript   failure_b   error_cl    reason     notes
e_i on_typ      ced_                      ion       ehavior      ass        _code
 d     e         at
v_      schem      serve   {{matrix[0].a    {{matrix[   {{matrix[0]   {{matrix[0 {{matrix   {{matrix[0
01      a          r       pplies_to}}      0].desc}}   .failure}}    ].class}}  [0].rc}}   ].notes}}

v_      semant     serve   {{matrix[1].a    {{matrix[   {{matrix[1]   {{matrix[1 {{matrix   {{matrix[1
02      ic         r       pplies_to}}      1].desc}}   .failure}}    ].class}}  [1].rc}}   ].notes}}


4) Unknown/Extra Fields Policy (required)

     ●​ Input strictness: {{unknown.strictness}}​

     ●​ Extra fields behavior: {{unknown.extra_fields}}​

     ●​ Logging policy: {{unknown.logging}} | OPTIONAL​



5) Performance Rules (required)

     ●​ Hot path rule: {{perf.hot_path}}​

     ●​ Batch validation rule: {{perf.batch}} | OPTIONAL​



6) Verification Checklist (required)

     ●​ {{verify[0]}}​

     ●​ {{verify[1]}}​

     ●​ {{verify[2]}} | OPTIONAL​



Cross-References
     ●​ Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:ERR-01}} | OPTIONAL, {{xref:BRP-01}} |
        OPTIONAL​

     ●​ Downstream: {{xref:DQV-02}}, {{xref:DQV-03}}, {{xref:DATA-06}} | OPTIONAL,
        {{xref:ERR-04}} | OPTIONAL​

     ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
 ●​ beginner: Required. Definitions + enforcement points.​

 ●​ intermediate: Required. Add responsibilities matrix and unknown fields policy.​

 ●​ advanced: Required. Add failure behavior mapping and performance rules.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: streaming_batch_notes, notes, logging_policy​

 ●​ If server enforcement is not specified → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DQV​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ definitions_present == true​

        ○​ enforcement_points_present == true​

        ○​ responsibilities_matrix_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
