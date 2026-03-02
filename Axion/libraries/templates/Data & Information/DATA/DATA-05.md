DATA-05
DATA-05 — Seed Data Spec
Header Block
   ●​ template_id: DATA-05​

   ●​ title: Seed Data Spec​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-05_Seed_Data_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DATA-01", "PMAD-01", "DSYS-01"]​

   ●​ inputs_required: ["DATA-01", "PMAD-01", "DSYS-01", "ENV-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic seed data required for the system to run in dev/stage (and sometimes
prod): default roles, permissions, system settings, reference tables, feature flags defaults, and
any canonical lookup sets.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ PMAD-01: {{xref:PMAD-01}} | OPTIONAL​

   ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​

   ●​ ENV-01: {{xref:ENV-01}} | OPTIONAL​
  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Seed set inventory (minimum 8 seed sets; justify if smaller)​

  ●​ For each seed set:​

         ○​ seed_id​

         ○​ target entity/table​

         ○​ environment applicability (dev/stage/prod)​

         ○​ records definition (what values, keyed by stable IDs)​

         ○​ idempotency rule (safe to rerun)​

         ○​ dependencies (must exist before)​

         ○​ owner​

         ○​ verification query (how to confirm seeded)​

  ●​ Secrets exclusion rule (never seed secrets)​

  ●​ Environment safety rules (prod seeding approval policy)​



Optional Fields
  ●​ Data generator rules (synthetic data) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Seed data must be idempotent and safe to rerun.​
   ●​ Seed IDs must be stable; don’t rely on auto-increment values.​

   ●​ Never seed secrets; reference ENV secrets management.​

   ●​ Production seeding must be explicit and approval-gated.​



Output Format
1) Seed Sets (canonical)
 seed     table/en     envs      records_     depend     idempo     verify_q      owner      notes
  _id       tity                  keying      encies     tent_rul     uery
                                                            e

 seed     {{seeds[    {{seeds[   {{seeds[0    {{seeds[   {{seeds[   {{seeds[     {{seeds[   {{seeds[
 _role    0].table}   0].envs}   ].keying}}   0].deps}   0].idem}   0].verify}   0].owner   0].notes
 s        }           }                       }          }          }            }}         }}

 seed     {{seeds[    {{seeds[   {{seeds[1    {{seeds[   {{seeds[   {{seeds[     {{seeds[   {{seeds[
 _setti   1].table}   1].envs}   ].keying}}   1].deps}   1].idem}   1].verify}   1].owner   1].notes
 ngs      }           }                       }          }          }            }}         }}


2) Seed Record Blocks (required, one per seed set)

{{seeds[0].seed_id}} — {{seeds[0].table}}

   ●​ Environments: {{seeds[0].envs}}​

   ●​ Dependencies: {{seeds[0].deps}}​

   ●​ Idempotency: {{seeds[0].idem}}​

   ●​ Verification query: {{seeds[0].verify}}​


Records (canonical, keyed)

records:
 {{seeds[0].records[0].key}}:
   {{seeds[0].records[0].field1}}: {{seeds[0].records[0].value1}}
   {{seeds[0].records[0].field2}}: {{seeds[0].records[0].value2}}

3) Safety Rules (required)
  ●​ Never seed secrets: {{safety.no_secrets}}​

  ●​ Prod seeding policy: {{safety.prod_policy}}​

  ●​ Rollback policy (if prod seeded): {{safety.rollback}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:PMAD-01}} | OPTIONAL, {{xref:ENV-01}} | OPTIONAL​

  ●​ Downstream: {{xref:IMP-01}} | OPTIONAL, {{xref:DX-01}} | OPTIONAL, {{xref:QA-03}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Seed sets table + at least 1 record block example.​

  ●​ intermediate: Required. Add verification queries and dependency ordering.​

  ●​ advanced: Required. Add prod policy and rollback posture.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: data_generator_rules, notes, rollback_policy​

  ●​ If any seed set lacks idempotency rule → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DATA​

  ●​ Pass conditions:​
○​ required_fields_present == true​

○​ seed_sets_present == true​

○​ record_blocks_present == true​

○​ idempotency_defined_for_all == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
