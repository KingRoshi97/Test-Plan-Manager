DLR-05
DLR-05 — Archival & Cold Storage
Strategy
Header Block
   ●​ template_id: DLR-05​

   ●​ title: Archival & Cold Storage Strategy​

   ●​ type: data_lifecycle_retention​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_lifecycle/DLR-05_Archival_Cold_Storage_Strategy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DLR​

   ●​ upstream_dependencies: ["DLR-01", "DLR-02", "STORE-01", "RPT-04"]​

   ●​ inputs_required: ["DLR-01", "DLR-02", "STORE-01", "RPT-04", "DGP-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define how archived data is stored, accessed, and restored: what moves to cold storage, when
it moves, how it is indexed (if at all), how access is controlled, and how archival impacts
reporting, search, and cost.


Inputs Required
   ●​ DLR-01: {{xref:DLR-01}} | OPTIONAL​

   ●​ DLR-02: {{xref:DLR-02}} | OPTIONAL​

   ●​ STORE-01: {{xref:STORE-01}} | OPTIONAL​
  ●​ RPT-04: {{xref:RPT-04}} | OPTIONAL​

  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Archival candidates list (entities/datasets)​

  ●​ Archival trigger rules (age, inactivity, lifecycle transition)​

  ●​ Storage tiers and locations (hot/cold) (pointer to STORE)​

  ●​ Access policy for archived data:​

          ○​ who can access​

          ○​ how it’s requested (on-demand restore vs direct query)​

          ○​ latency expectation​

  ●​ Indexing/search policy for archived data (SRCH pointer)​

  ●​ Reporting impact policy (RPT pointer)​

  ●​ Restore procedure (high level) + verification​

  ●​ Cost control notes (qualitative)​



Optional Fields
  ●​ Rehydration policy (bring back to hot) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Archived data access must respect permissions and privacy.​

   ●​ Restore must be auditable for sensitive data.​

   ●​ Search and reporting policies must explicitly state whether archived data is included.​



Output Format
1) Applicability

   ●​ applies: {{archival.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{archival.na_block}} | OPTIONAL​



2) Archival Candidates (required if applies)
entity_or    trigger_r    storage     access_       search_i     reporting_    restore_r     notes
_dataset         ule        _tier      mode         ncluded       included      equired

{{candida   {{candida     {{candid {{candida        {{candida    {{candidat    {{candida {{candida
tes[0].na   tes[0].trig   ates[0].ti tes[0].acc     tes[0].sea   es[0].repor   tes[0].rest tes[0].not
me}}        ger}}         er}}       ess}}          rch}}        ting}}        ore}}       es}}


3) Access Policy (required if applies)

   ●​ Who can access: {{access.who}}​

   ●​ How access happens: {{access.how}}​

   ●​ Latency expectation: {{access.latency}} | OPTIONAL​

   ●​ Audit requirement: {{access.audit}} | OPTIONAL​



4) Indexing/Search Policy (required if applies)

   ●​ Included in search: {{search.included}}​

   ●​ If excluded, behavior: {{search.excluded_behavior}} | OPTIONAL​
   ●​ SRCH pointer: {{xref:SRCH-01}} | OPTIONAL​



5) Reporting Policy (required if applies)

   ●​ Included in reporting: {{reporting.included}}​

   ●​ Rollup/snapshot behavior: {{reporting.rollup_behavior}} | OPTIONAL​

   ●​ RPT pointer: {{xref:RPT-04}} | OPTIONAL​



6) Restore Procedure (required if applies)

   1.​ Request/approval: {{restore.request}}​

   2.​ Retrieve/rehydrate: {{restore.retrieve}}​

   3.​ Verify: {{restore.verify}}​

   4.​ Expiry/back to cold (if temporary): {{restore.expiry}} | OPTIONAL​



7) Cost Controls (required if applies)

   ●​ Primary cost drivers: {{cost.drivers}}​

   ●​ Cost control levers: {{cost.levers}}​



Cross-References
   ●​ Upstream: {{xref:STORE-01}} | OPTIONAL, {{xref:DLR-02}} | OPTIONAL​

   ●​ Downstream: {{xref:STORE-02}} | OPTIONAL, {{xref:STORE-03}} | OPTIONAL,
      {{xref:SRCH-03}} | OPTIONAL, {{xref:RPT-03}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
 ●​ beginner: Not required.​

 ●​ intermediate: Required if applies. Candidates + access policy + restore procedure.​

 ●​ advanced: Required if applies. Add audit requirements and reporting/search inclusion
    rules.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: rehydration_policy, notes, latency_expectation,
    audit_requirement​

 ●​ If applies == true and restore procedure is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DLR​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_candidates_present == true​

        ○​ access_policy_present == true​

        ○​ restore_procedure_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
