DGL-01
DGL-01 — Data Ownership Map (owner
per entity/dataset)
Header Block
   ●​ template_id: DGL-01​

   ●​ title: Data Ownership Map (owner per entity/dataset)​

   ●​ type: data_governance_lineage​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_governance/DGL-01_Data_Ownership_Map.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DGL​

   ●​ upstream_dependencies: ["DATA-01", "ARC-01", "STK-03"]​

   ●​ inputs_required: ["DATA-01", "ARC-01", "STK-03", "DGP-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define who “owns” each entity/dataset: the accountable party for correctness, schema changes,
access controls, retention policy alignment, and incident response. This prevents orphaned data
with unclear decision rights.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​

   ●​ STK-03: {{xref:STK-03}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Ownership registry entries (minimum: all DATA-01 entities + key derived datasets)​

  ●​ For each entry:​

         ○​ entity_id or dataset_id​

         ○​ owner_role/team​

         ○​ steward (optional second owner)​

         ○​ change approver (who approves schema changes)​

         ○​ access approver (who approves access/export)​

         ○​ oncall/escalation contact (role, not person) | OPTIONAL​

         ○​ sensitivity class (PII level)​

         ○​ criticality (P0/P1/P2)​

  ●​ Ownership change procedure​



Optional Fields
  ●​ Data product classification | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Every entity must have exactly one primary owner.​
   ●​ High-sensitivity entities require explicit access approver.​

   ●​ Ownership must align with boundary ownership (ARC-01); if mismatch, justify.​

   ●​ Ownership changes must be auditable.​



Output Format
1) Ownership Registry (canonical)
 id       kind    owne      stewa      schema_     access_a    escalat    sensiti     critical   notes
         (entit     r         rd       approver     pprover    ion_rol     vity         ity
         y/dat                                                    e
         aset)

{{ow     {{own    {{own     {{owne     {{owners[   {{owners[   {{owner    {{owner     {{owner {{own
ners     ers[0]   ers[0].   rs[0].st   0].schema   0].access   s[0].esc   s[0].se     s[0].crit ers[0]
[0].id   .kind}   owner     eward}     _approver   _approver   alation}   nsitivity   icality}} .notes
}}       }        }}        }          }}          }}          }          }}                    }}

{{ow     {{own    {{own     {{owne     {{owners[   {{owners[   {{owner    {{owner     {{owner {{own
ners     ers[1]   ers[1].   rs[1].st   1].schema   1].access   s[1].esc   s[1].se     s[1].crit ers[1]
[1].id   .kind}   owner     eward}     _approver   _approver   alation}   nsitivity   icality}} .notes
}}       }        }}        }          }}          }}          }          }}                    }}


2) Ownership Change Procedure (required)

   ●​ How to request change: {{change.request}}​

   ●​ Required approvals: {{change.approvals}}​

   ●​ Audit/log requirement: {{change.audit}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:STK-03}} | OPTIONAL, {{xref:DGP-01}} |
      OPTIONAL​

   ●​ Downstream: {{xref:DGL-04}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL,
      {{xref:DQV-04}} | OPTIONAL​
  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Ownership registry with primary owners.​

  ●​ intermediate: Required. Add approvers and sensitivity/criticality.​

  ●​ advanced: Required. Add escalation role and change procedure rigor.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: steward, escalation_role,
     data_product_classification, notes​

  ●​ If any entity lacks primary owner → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DGL​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ ownership_complete_for_entities == true​

         ○​ exactly_one_primary_owner_each == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
