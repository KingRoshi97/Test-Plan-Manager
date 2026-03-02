DLR-02
DLR-02 — Retention Policy Matrix (by data
class/entity)
Header Block
   ●​ template_id: DLR-02​

   ●​ title: Retention Policy Matrix (by data class/entity)​

   ●​ type: data_lifecycle_retention​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_lifecycle/DLR-02_Retention_Policy_Matrix.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DLR​

   ●​ upstream_dependencies: ["DGP-01", "DATA-01", "DLR-01"]​

   ●​ inputs_required: ["DGP-01", "DATA-01", "DLR-01", "COMP-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the canonical retention periods and deletion requirements for each entity/data class: how
long data is kept, what triggers retention timers, what rules apply for archival, and what
legal/compliance constraints exist.


Inputs Required
   ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DLR-01: {{xref:DLR-01}} | OPTIONAL​
  ●​ COMP-01: {{xref:COMP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Retention matrix entries (minimum 15 for non-trivial products)​

  ●​ For each entry:​

          ○​ entity_id / dataset​

          ○​ data_class (PII level / regulated type)​

          ○​ retention_period (duration)​

          ○​ retention_start_trigger (created_at, last_active_at, closed_at, etc.)​

          ○​ storage tier (hot/cold) pointer (DLR-05/STORE)​

          ○​ deletion type (soft/hard/anonymize)​

          ○​ legal hold override (yes/no)​

          ○​ access constraints while retained​

          ○​ export requirements (if any)​

          ○​ owner​

  ●​ Compliance notes (regulatory requirements)​

  ●​ Verification checklist​



Optional Fields
  ●​ Region-specific retention differences | OPTIONAL​
   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Retention must reference data classification (DGP/DGL).​

   ●​ Legal holds override deletion and must be explicitly defined.​

   ●​ Deletion type must align with DLR-03 procedures.​

   ●​ Reporting and search retention must align to lifecycle state constraints.​



Output Format
1) Applicability

   ●​ applies: {{retention.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{retention.na_block}} | OPTIONAL​



2) Retention Matrix (canonical)
 entity   data_     retent   start_   stor      deleti     legal_h     acces    expor   owne   notes
  _id     class     ion_p    trigge   age_      on_ty      old_ov      s_con    t_req     r
                    eriod       r      tier      pe         erride     strain
                                                                         ts

{{matr    {{mat     {{matri {{matri   {{mat     {{matri    {{matrix    {{matri {{matri {{matr {{matr
ix[0].e   rix[0].   x[0].p x[0].tri   rix[0]    x[0].de    [0].legal   x[0].a x[0].e ix[0].o ix[0].n
ntity}}   class}    eriod}} gger}}    .tier}}   letion}}   _hold}}     ccess} xport}} wner}} otes}}
          }                                                            }

{{matr    {{mat     {{matri {{matri   {{mat     {{matri    {{matrix    {{matri {{matri {{matr {{matr
ix[1].e   rix[1].   x[1].p x[1].tri   rix[1]    x[1].de    [1].legal   x[1].a x[1].e ix[1].o ix[1].n
ntity}}   class}    eriod}} gger}}    .tier}}   letion}}   _hold}}     ccess} xport}} wner}} otes}}
          }                                                            }


3) Compliance Notes (required if applies)
   ●​ Regulated data constraints: {{compliance.regulated}} | OPTIONAL​

   ●​ Default minimum retention: {{compliance.default_min}} | OPTIONAL​

   ●​ Evidence required: {{compliance.evidence}} | OPTIONAL​



4) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DGP-01}} | OPTIONAL, {{xref:DLR-01}} | OPTIONAL​

   ●​ Downstream: {{xref:DLR-03}}, {{xref:DLR-04}}, {{xref:DLR-05}} | OPTIONAL,
      {{xref:STORE-*}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Not required.​

   ●​ intermediate: Required if applies. Matrix + start triggers + deletion type.​

   ●​ advanced: Required if applies. Add legal holds and compliance evidence notes.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: region_differences, notes, export_requirements,
       compliance_notes​
 ●​ If applies == true and any entity lacks retention_period → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DLR​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_matrix_present == true​

        ○​ start_triggers_present == true​

        ○​ deletion_types_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
