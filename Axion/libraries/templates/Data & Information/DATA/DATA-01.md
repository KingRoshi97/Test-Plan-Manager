DATA-01
DATA-01 — Entity Definitions (canonical
fields)
Header Block
   ●​ template_id: DATA-01​

   ●​ title: Entity Definitions (canonical fields)​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-01_Entity_Definitions.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DMG-01", "DMG-02", "PRD-04", "BRP-01"]​

   ●​ inputs_required: ["DMG-01", "DMG-02", "PRD-04", "BRP-01", "DGP-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical data entities and their fields. This is the authoritative entity-level schema
reference used by DB modeling, API contracts, validation schemas, and data governance.


Inputs Required
   ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​

   ●​ DMG-02: {{xref:DMG-02}} | OPTIONAL​

   ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​
  ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​

  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Entity list (minimum 8 for non-trivial products; justify if smaller)​

  ●​ For each entity:​

          ○​ entity_id (stable)​

          ○​ name​

          ○​ description​

          ○​ ownership boundary/service (ARC/SBDT reference)​

          ○​ identifiers (primary key, external ids)​

          ○​ lifecycle states (if any) pointer (DLR)​

          ○​ fields table:​

                  ■​ field_name​

                  ■​ type​

                  ■​ required (true/false)​

                  ■​ default rule​

                  ■​ pii_classification (none/low/med/high) or pointer​

                  ■​ validation rule pointer (DATA-06/DQV)​

                  ■​ notes​

          ○​ invariants (must-always-be-true rules) pointer (DMG-03)​
              ○​ audit requirements (if entity is sensitive)​

    ●​ Coverage check: PRD features reference existing entity_ids where needed​



Optional Fields
    ●​ Example records | OPTIONAL​

    ●​ Notes | OPTIONAL​



Rules
    ●​ Terms and meanings must align to DMG glossary.​

    ●​ Do not define relationships here (that lives in DATA-02) beyond “foreign key exists”
       notes.​

    ●​ PII classification must be explicit for any user-related field.​

    ●​ Every required field must have either a source or a default rule (no silent required).​

    ●​ Field names must follow consistent casing convention (tie to standards).​



Output Format
1) Entity Index (required)
 entity_i        name          owner        primary     pii_sensitive       detail_block_         notes
    d                                        _key                              present

 {{entities   {{entities[0   {{entities[0] {{entities   {{entities[0].pii   {{entities[0].blo   {{entities[0
 [0].id}}     ].name}}       .owner}}      [0].pk}}     _sensitive}}        ck_present}}        ].notes}}


2) Entity Detail Blocks (required, one per entity)

{{entities[0].entity_id}} — {{entities[0].name}}

    ●​ Description: {{entities[0].description}}​
    ●​ Owner boundary/service: {{entities[0].owner}}​

    ●​ Identifiers: {{entities[0].identifiers}}​

    ●​ Lifecycle pointer: {{xref:DLR-01}} | OPTIONAL​

    ●​ Invariants pointer: {{xref:DMG-03}} | OPTIONAL​


Fields (canonical)

 field_nam          type        required       default_rul     pii_class     validation_re          notes
      e                                            e                               f

 {{entities[0    {{entities[0 {{entities[0].   {{entities[0]   {{entities[   {{entities[0].fie   {{entities[0
 ].fields[0].n   ].fields[0].t fields[0].req   .fields[0].de   0].fields[0   lds[0].validatio    ].fields[0].n
 ame}}           ype}}         uired}}         fault}}         ].pii}}       n_ref}}             otes}}

 {{entities[0    {{entities[0 {{entities[0].   {{entities[0]   {{entities[   {{entities[0].fie   {{entities[0
 ].fields[1].n   ].fields[1].t fields[1].req   .fields[1].de   0].fields[1   lds[1].validatio    ].fields[1].n
 ame}}           ype}}         uired}}         fault}}         ].pii}}       n_ref}}             otes}}

Audit Requirements (required if sensitive)

    ●​ Must audit create/update/delete: {{entities[0].audit.must_audit}} | OPTIONAL​

    ●​ Audit fields: {{entities[0].audit.fields}} | OPTIONAL​



3) Coverage Checks (required)

    ●​ PRD feature → entity coverage complete: {{coverage.features_have_entities}} |
       OPTIONAL​

    ●​ Entity IDs unique: {{coverage.unique_entity_ids}}​



Cross-References
    ●​ Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:DMG-02}} | OPTIONAL​

    ●​ Downstream: {{xref:DATA-02}}, {{xref:DATA-03}}, {{xref:DATA-06}} | OPTIONAL,
       {{xref:DGL-01}} | OPTIONAL, {{xref:API-02}} | OPTIONAL​
  ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Entity list + core fields + required flags.​

  ●​ intermediate: Required. Add PII classification and owner mapping.​

  ●​ advanced: Required. Add invariants pointers and audit requirements.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: example_records, notes, audit_requirements (if not
     sensitive), lifecycle_states (if none)​

  ●​ If any entity lacks primary identifiers → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DATA​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ entities_count >= 8 (or justified)​

         ○​ fields_tables_present == true​

         ○​ unique_entity_ids == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true​
