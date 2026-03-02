DGL-03
DGL-03 — Transformation Rules Catalog
(ETL/ELT, normalization)
Header Block
   ●​ template_id: DGL-03​

   ●​ title: Transformation Rules Catalog (ETL/ELT, normalization)​

   ●​ type: data_governance_lineage​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_governance/DGL-03_Transformation_Rules_Catalog.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DGL​

   ●​ upstream_dependencies: ["DGL-02", "SIC-04", "DLR-06"]​

   ●​ inputs_required: ["DGL-02", "SIC-04", "DLR-06", "DQV-01", "ERR-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the canonical catalog of transformation rules applied to data as it moves through the
system: mapping, normalization, enrichment, redaction, aggregation, and formatting rules. This
prevents undocumented transforms and supports repeatability and audits.


Inputs Required
   ●​ DGL-02: {{xref:DGL-02}} | OPTIONAL​

   ●​ SIC-04: {{xref:SIC-04}} | OPTIONAL​

   ●​ DLR-06: {{xref:DLR-06}} | OPTIONAL​
  ●​ DQV-01: {{xref:DQV-01}} | OPTIONAL​

  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Transformation rule catalog (minimum 20 rules for non-trivial systems; justify if smaller)​

  ●​ For each rule:​

         ○​ rule_id​

         ○​ name​

         ○​ category (normalize/map/enrich/aggregate/redact)​

         ○​ inputs (fields/entities)​

         ○​ output (fields/entities)​

         ○​ transform logic description (deterministic)​

         ○​ validation rule/predicate​

         ○​ failure behavior (reject/quarantine/default)​

         ○​ reason_code on failure (if reject)​

         ○​ owner​

         ○​ applied_in (transform step IDs from DGL-02)​

         ○​ data minimization impact (what is removed/trimmed) | OPTIONAL​



Optional Fields
  ●​ Example input/output pairs | OPTIONAL​
      ●​ Notes | OPTIONAL​



Rules
      ●​ Transform logic must be deterministic and described without code.​

      ●​ Any “default” behavior must be explicit and justified.​

      ●​ Redaction transforms must align with privacy policy and be irreversible where required.​

      ●​ Every reject path must map to a reason_code.​



Output Format
Transformation Rules (canonical)
 ru      categ    nam     input     outpu     logic   validat   failur    rea     appli    owne     note
 le       ory      e        s         ts                ion     e_be      son     ed_i       r       s
 _i                                                             havio     _co     n_st
  d                                                               r        de      eps

tr_     {{rules[ {{rule   {{rule    {{rules   {{rule {{rules[   {{rule    {{rul   {{rule   {{rule   {{rule
rul     0].cate s[0].n    s[0].in   [0].out   s[0].l 0].valid   s[0].fa   es[0    s[0].s   s[0].o   s[0].n
e_      gory}} ame}       puts}}    puts}}    ogic}} ation}}    ilure}}   ].rc}   teps}    wner}    otes}}
01               }                                                        }       }        }

tr_     {{rules[ {{rule   {{rule    {{rules   {{rule {{rules[   {{rule    {{rul   {{rule   {{rule   {{rule
rul     1].cate s[1].n    s[1].in   [1].out   s[1].l 1].valid   s[1].fa   es[1    s[1].s   s[1].o   s[1].n
e_      gory}} ame}       puts}}    puts}}    ogic}} ation}}    ilure}}   ].rc}   teps}    wner}    otes}}
02               }                                                        }       }        }


Example Pairs (optional)

      ●​ Example input: {{examples[0].input}} | OPTIONAL​

      ●​ Example output: {{examples[0].output}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DGL-02}} | OPTIONAL, {{xref:SIC-04}} | OPTIONAL, {{xref:DLR-06}} |
     OPTIONAL​

  ●​ Downstream: {{xref:DQV-02}} | OPTIONAL, {{xref:PIPE-04}} | OPTIONAL, {{xref:BI-03}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Not required.​

  ●​ intermediate: Required if applies. 20 rule entries with failure behaviors.​

  ●​ advanced: Required if applies. Add applied_in_steps mapping and reason codes.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: example_pairs, notes, minimization_impact​

  ●​ If any reject path lacks reason_code → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DGL​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ rules_count >= 20 (or justified)​

         ○​ failure_behaviors_defined == true​

         ○​ reject_paths_have_reason_codes == true​

         ○​ placeholder_resolution == true​
           ○​ no_unapproved_unknowns == true​




DGL-04 — Access Controls for Data (who
can read/write/export)
Header Block
   ●​ template_id: DGL-04​

   ●​ title: Access Controls for Data (who can read/write/export)​

   ●​ type: data_governance_lineage​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_governance/DGL-04_Access_Controls_for_Data.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DGL​

   ●​ upstream_dependencies: ["PMAD-02", "DGP-01", "DGL-01"]​

   ●​ inputs_required: ["PMAD-02", "DGP-01", "DGL-01", "COMP-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the data-layer access control rules: who can read/write/export which entities/datasets,
what constraints apply for sensitive data, and what approval/audit requirements exist.


Inputs Required
   ●​ PMAD-02: {{xref:PMAD-02}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ DGL-01: {{xref:DGL-01}} | OPTIONAL​

  ●​ COMP-01: {{xref:COMP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Access control matrix (minimum 20 entries)​

  ●​ For each entry:​

         ○​ entity_id/dataset_id​

         ○​ action (read/write/export/delete)​

         ○​ allowed roles (role_id)​

         ○​ constraints (tenant/ownership/status/legal hold)​

         ○​ approval required (yes/no + who)​

         ○​ audit required (yes/no + event type)​

         ○​ masking/redaction rules (for sensitive fields)​

  ●​ Export policy (bulk export restrictions)​

  ●​ Break-glass rules pointer (PMAD-05)​

  ●​ Verification checklist​



Optional Fields
  ●​ Data masking patterns | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
  ●​ Export is treated as privileged for high-PII datasets.​

  ●​ Masking/redaction must be explicit for sensitive fields.​

  ●​ Access rules must align with PMAD policy rules; do not create contradictory rules.​

  ●​ All access to sensitive datasets must be auditable.​



Output Format
1) Access Control Matrix (canonical)
  id      kind     action     allowe    constrain     approval     audit_e    masking     notes
                              d_role       ts                       vent       _rules
                                 s

{{matri {{matrix {{matrix[   {{matrix   {{matrix[0]   {{matrix[0   {{matrix   {{matrix[0 {{matrix
x[0].id [0].kind 0].actio    [0].role   .constraint   ].approva    [0].audi   ].maskin [0].note
}}      }}       n}}         s}}        s}}           l}}          t}}        g}}        s}}

{{matri {{matrix {{matrix[   {{matrix   {{matrix[1]   {{matrix[1   {{matrix   {{matrix[1 {{matrix
x[1].id [1].kind 1].actio    [1].role   .constraint   ].approva    [1].audi   ].maskin [1].note
}}      }}       n}}         s}}        s}}           l}}          t}}        g}}        s}}


2) Export Policy (required)

  ●​ Export allowed when: {{export.allowed_when}}​

  ●​ Export denied when: {{export.denied_when}}​

  ●​ Approval requirement: {{export.approval}}​

  ●​ Rate limits for export: {{export.ratelimits}} | OPTIONAL​



3) Break-Glass Pointer (required)

  ●​ PMAD-05 pointer: {{xref:PMAD-05}} | OPTIONAL​
4) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL​

   ●​ Downstream: {{xref:DGL-05}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL,
      {{xref:ADMIN-02}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-SECURITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Matrix with read/write basics and audit flags.​

   ●​ intermediate: Required. Add export rules and masking for sensitive data.​

   ●​ advanced: Required. Add approval governance and verification checklist rigor.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: masking_patterns, notes, ratelimits​

   ●​ If any sensitive dataset lacks audit_event requirement → block Completeness Gate.​



Completeness Gate
   ●​ Gate ID: TMP-05.PRIMARY.DGL​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ matrix_count >= 20​

       ○​ export_policy_present == true​

       ○​ sensitive_access_audited == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
