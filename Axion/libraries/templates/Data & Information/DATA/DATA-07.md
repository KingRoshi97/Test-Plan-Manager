DATA-07
DATA-07 — Derived/Read Models Spec
(views, projections, denormalized tables)
Header Block
   ●​ template_id: DATA-07​

   ●​ title: Derived/Read Models Spec (views, projections, denormalized tables)​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-07_Derived_Read_Models_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DATA-01", "DATA-02", "SRCH-03", "CACHE-03"]​

   ●​ inputs_required: ["DATA-01", "DATA-02", "SRCH-03", "CACHE-03", "WFO-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the derived/read models used to optimize reads and UX: DB views, materialized views,
projections, denormalized tables, and read-optimized DTOs. This makes derived data explicit,
controlled, and consistent with canonical entities.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DATA-02: {{xref:DATA-02}} | OPTIONAL​

   ●​ SRCH-03: {{xref:SRCH-03}} | OPTIONAL​
  ●​ CACHE-03: {{xref:CACHE-03}} | OPTIONAL​

  ●​ WFO-01: {{xref:WFO-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Read model registry (minimum 6 if system has non-trivial reads)​

  ●​ For each read model:​

          ○​ read_model_id​

          ○​ type (view/materialized_view/projection/denorm_table/dto)​

          ○​ purpose / query pattern served​

          ○​ source entities (canonical)​

          ○​ fields included (list)​

          ○​ refresh/update strategy:​

                  ■​ sync on write​

                  ■​ async projection job​

                  ■​ scheduled recompute​

          ○​ freshness expectation (seconds/minutes/hours)​

          ○​ consistency posture (strong/eventual)​

          ○​ invalidation triggers (events/updates)​

          ○​ ownership (service/boundary)​

          ○​ access controls (who can read)​
          ○​ failure behavior (fallback to canonical query? stale allowed?)​

          ○​ verification query/check (how to validate correctness)​

   ●​ Coverage check: key read endpoints/screens reference a defined read model or
      explicitly “canonical only”​



Optional Fields
   ●​ Storage/cost notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Derived data must never become a hidden truth source; canonical entities remain
      authoritative.​

   ●​ Update strategy must be explicit; “kept in sync” is not acceptable without mechanism.​

   ●​ Access control must match PMAD/DGP policies; do not broaden access via denorm.​

   ●​ Freshness and consistency must be declared and aligned with UX expectations.​



Output Format
1) Applicability

   ●​ applies: {{read_models.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{read_models.na_block}} | OPTIONAL​



2) Read Model Registry (canonical)
 rea   type   purp    sourc    upda    fresh    consis    own    acce    fallba   verif   note
 d_           ose     e_ent    te_st   ness     tency      er     ss       ck      y       s
 mo                    ities   rateg
                                 y
 del
 _id

rm {{mo       {{mod     {{mod     {{mo    {{mod      {{mode     {{mo    {{mo    {{mod     {{mo     {{mo
_01 dels[     els[0].   els[0].   dels[   els[0].f   ls[0].co   dels[   dels[   els[0].   dels[    dels[
    0].ty     purpo     sourc     0].up   reshn      nsisten    0].ow   0].ac   fallba    0].ver   0].no
    pe}}      se}}      es}}      date}   ess}}      cy}}       ner}}   cess}   ck}}      ify}}    tes}}
                                  }                                     }

rm {{mo       {{mod     {{mod     {{mo    {{mod      {{mode     {{mo    {{mo    {{mod     {{mo     {{mo
_02 dels[     els[1].   els[1].   dels[   els[1].f   ls[1].co   dels[   dels[   els[1].   dels[    dels[
    1].ty     purpo     sourc     1].up   reshn      nsisten    1].ow   1].ac   fallba    1].ver   1].no
    pe}}      se}}      es}}      date}   ess}}      cy}}       ner}}   cess}   ck}}      ify}}    tes}}
                                  }                                     }


3) Read Model Detail Block (required, one per read_model_id)

{{models[0].read_model_id}} — {{models[0].purpose}}

   ●​ Type: {{models[0].type}}​

   ●​ Query pattern served: {{models[0].purpose}}​

   ●​ Source entities: {{models[0].sources}}​

   ●​ Fields included: {{models[0].fields}}​

   ●​ Update strategy: {{models[0].update}}​

   ●​ Freshness expectation: {{models[0].freshness}}​

   ●​ Consistency posture: {{models[0].consistency}}​

   ●​ Invalidation triggers: {{models[0].invalidate}}​

   ●​ Access controls: {{models[0].access}}​

   ●​ Failure behavior: {{models[0].failure_behavior}}​

   ●​ Verification: {{models[0].verify}}​



4) Coverage Checks (required if applies)
  ●​ Key read surfaces mapped: {{coverage.read_surfaces_mapped}}​

  ●​ All models have update strategy: {{coverage.update_defined}}​

  ●​ Access controls defined: {{coverage.access_defined}}​



Cross-References
  ●​ Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:SRCH-03}} | OPTIONAL,
     {{xref:CACHE-03}} | OPTIONAL​

  ●​ Downstream: {{xref:CACHE-01}} | OPTIONAL, {{xref:RPT-03}} | OPTIONAL,
     {{xref:QA-04}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Not required.​

  ●​ intermediate: Required if applies. Registry + update strategy + freshness.​

  ●​ advanced: Required if applies. Add access controls, fallback behavior, and verification
     checks.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: storage_cost_notes, notes​

  ●​ If applies == true and any model lacks update strategy or access controls → block
     Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DATA​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ if_applies_then_models_present == true​

       ○​ update_defined == true​

       ○​ access_defined == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
