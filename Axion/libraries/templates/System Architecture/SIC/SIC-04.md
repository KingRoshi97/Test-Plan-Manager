SIC-04
SIC-04 — Data Mapping Contract (field
mappings + transforms + validation)
Header Block
   ●​ template_id: SIC-04​

   ●​ title: Data Mapping Contract (field mappings + transforms + validation)​

   ●​ type: system_interfaces_integration_contracts​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/integrations/SIC-04_Data_Mapping_Contract.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.INTEGRATION​

   ●​ upstream_dependencies: ["SIC-02", "DATA-01", "DMG-01"]​

   ●​ inputs_required: ["SIC-02", "DATA-01", "DMG-01", "DGP-01", "ERR-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic field-level mappings between external interface schemas and internal
canonical models: transforms, defaults, validation, and rejection rules. This prevents “silent
mapping drift” and makes integration behavior auditable.


Inputs Required
   ●​ SIC-02: {{xref:SIC-02}} | OPTIONAL​

   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ One mapping block per interface + object type​

  ●​ For each mapping:​

         ○​ mapping_id​

         ○​ interface_id​

         ○​ external_object​

         ○​ internal_entity_or_dto​

         ○​ direction (inbound/outbound)​

         ○​ field mapping table:​

                ■​ external_field​

                ■​ internal_field​

                ■​ type conversion​

                ■​ transform rule​

                ■​ default value rule​

                ■​ required/optional​

                ■​ validation rule​

                ■​ redaction/classification note (PII)​

                ■​ failure behavior (drop/reject/quarantine)​
                  ■​ reason_code on failure (if reject)​

          ○​ normalization rules (dates, enums, currency, casing)​

          ○​ semantic validation rules (cross-field)​

          ○​ versioning notes (what happens when vendor adds fields)​



Optional Fields
   ●​ Example input/output pairs | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Required fields must not be silently defaulted unless explicitly allowed.​

   ●​ Any transformation must be reversible or documented if lossy.​

   ●​ If validation fails, behavior must be deterministic and mapped to reason codes.​

   ●​ PII classification must be explicit; no hidden sensitive fields.​



Output Format
Mapping: {{mappings[0].mapping_id}}

   ●​ interface_id: {{mappings[0].interface_id}}​

   ●​ direction: {{mappings[0].direction}}​

   ●​ external_object: {{mappings[0].external_object}}​

   ●​ internal_entity_or_dto: {{mappings[0].internal_object}}​


1) Field Map (canonical)
 extern     intern     type_c      transfo     defaul     requir     validati    pii_n     failure    reason
 al_fiel    al_fiel      onv          rm         t          ed         on         ote      _beha       _code
   d           d                                                                            vior

 {{mapp     {{mapp     {{mappi     {{mappi     {{map      {{mapp     {{mappi     {{map     {{map      {{mappi
 ings[0].   ings[0]    ngs[0].fi   ngs[0].f    pings[     ings[0].   ngs[0].f    pings     pings[     ngs[0].fi
 fields[0   .fields[   elds[0].t   ields[0].   0].field   fields[0   ields[0].   [0].fie   0].field   elds[0].r
 ].exter    0].inter   ype_co      transfor    s[0].de    ].requir   validati    lds[0]    s[0].fai   eason_
 nal}}      nal}}      nv}}        m}}         fault}}    ed}}       on}}        .pii}}    lure}}     code}}

2) Normalization Rules (required)

   ●​ Dates/times: {{mappings[0].normalize.dates}}​

   ●​ Enums: {{mappings[0].normalize.enums}}​

   ●​ Currency/number formats: {{mappings[0].normalize.numbers}} | OPTIONAL​

   ●​ Casing/whitespace: {{mappings[0].normalize.casing}} | OPTIONAL​


3) Semantic Validation (required if any)

   ●​ {{mappings[0].semantic_validation[0]}} | OPTIONAL​


4) Vendor Field Evolution Rules (required)

   ●​ Unknown fields behavior: {{mappings[0].evolution.unknown_fields}}​

   ●​ New required fields behavior: {{mappings[0].evolution.new_required_fields}}​

   ●​ Deprecation behavior: {{mappings[0].evolution.deprecations}} | OPTIONAL​


5) Example Pairs (optional)

   ●​ Example input: {{mappings[0].examples.input}} | OPTIONAL​

   ●​ Example output: {{mappings[0].examples.output}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:SIC-02}} | OPTIONAL, {{xref:DATA-01}} | OPTIONAL, {{xref:DMG-01}} |
     OPTIONAL​

  ●​ Downstream: {{xref:SIC-05}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Field map + basic transforms + required flags.​

  ●​ intermediate: Required. Add deterministic failure behaviors + reason codes.​

  ●​ advanced: Required. Add semantic validation and vendor evolution rules.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: example_pairs, notes, currency_formats,
     semantic_validation (if none)​

  ●​ If any required field has failure_behavior UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.INTEGRATION​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ field_map_present == true​

         ○​ failure_behaviors_defined == true​

         ○​ pii_notes_present == true​

         ○​ evolution_rules_present == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
