DQV-06
DQV-05 — Bad Data Handling (quarantine,
repair, backfill)
Header Block
   ●​ template_id: DQV-05​

   ●​ title: Bad Data Handling (quarantine, repair, backfill)​

   ●​ type: data_quality_validation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_quality/DQV-05_Bad_Data_Handling.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DQV​

   ●​ upstream_dependencies: ["DQV-02", "DQV-04", "PIPE-04", "WFO-05"]​

   ●​ inputs_required: ["DQV-02", "DQV-04", "PIPE-04", "WFO-05", "ERR-02", "OBS-04",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how the system handles bad data when detected: quarantine, repair workflows, backfills,
reconciliation, and safe reprocessing. This prevents silent corruption and ensures deterministic
remediation.


Inputs Required
   ●​ DQV-02: {{xref:DQV-02}} | OPTIONAL​

   ●​ DQV-04: {{xref:DQV-04}} | OPTIONAL​

   ●​ PIPE-04: {{xref:PIPE-04}} | OPTIONAL​
  ●​ WFO-05: {{xref:WFO-05}} | OPTIONAL​

  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ OBS-04: {{xref:OBS-04}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Bad data classification (types):​

         ○​ schema invalid​

         ○​ semantic invalid​

         ○​ referential broken​

         ○​ duplicate​

         ○​ stale/out-of-order​

  ●​ Quarantine model:​

         ○​ what data is quarantined​

         ○​ where it is stored​

         ○​ required quarantine record fields​

         ○​ retention policy​

  ●​ Repair workflow definitions (minimum 6):​

         ○​ repair_id​

         ○​ trigger (which check/signal)​

         ○​ remediation steps​

         ○​ approvals required (if any)​
         ○​ safe re-run policy (idempotency)​

         ○​ verification checks​

         ○​ audit/logging requirements​

  ●​ Backfill policy:​

         ○​ how backfills are scoped​

         ○​ rate limiting/impact controls​

         ○​ reprocessing rules​

  ●​ Escalation rules (who owns fixing)​

  ●​ Verification checklist​



Optional Fields
  ●​ Auto-repair rules | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Quarantine must preserve enough context to debug but respect privacy/redaction.​

  ●​ Repairs and backfills must be idempotent and observable.​

  ●​ Any repair that changes user-visible outcomes must be auditable.​

  ●​ Backfills must be throttled and safe for production.​



Output Format
1) Bad Data Types (required)
   ●​ {{types[0]}}​

   ●​ {{types[1]}}​

   ●​ {{types[2]}} | OPTIONAL​



2) Quarantine Model (required)

   ●​ Stored where: {{quarantine.location}}​

   ●​ Required fields: {{quarantine.required_fields}}​

   ●​ Retention policy: {{quarantine.retention}}​

   ●​ Redaction rules: {{quarantine.redaction}} | OPTIONAL​



3) Repair Workflows (canonical, min 6)
 rep     trigger        steps        approvals      idempot        verify        audit        notes
 air_                                               ency_rul
  id                                                   e

rep     {{repairs[0] {{repairs[     {{repairs[0].   {{repairs[   {{repairs[0   {{repairs[   {{repairs[
_01     .trigger}}   0].steps}}     approvals}}     0].idem}}    ].verify}}    0].audit}}   0].notes}}

rep     {{repairs[1] {{repairs[     {{repairs[1].   {{repairs[   {{repairs[1   {{repairs[   {{repairs[
_02     .trigger}}   1].steps}}     approvals}}     1].idem}}    ].verify}}    1].audit}}   1].notes}}


4) Backfill Policy (required)

   ●​ Scope rules: {{backfill.scope}}​

   ●​ Throttling rules: {{backfill.throttle}}​

   ●​ Reprocessing rules: {{backfill.reprocess}}​

   ●​ Stop conditions: {{backfill.stop_conditions}} | OPTIONAL​



5) Escalation Rules (required)

   ●​ Owner assignment: {{escalation.owner_assignment}}​
   ●​ SLA for critical issues: {{escalation.sla}} | OPTIONAL​

   ●​ When to page: {{escalation.paging}} | OPTIONAL​



6) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DQV-04}} | OPTIONAL, {{xref:WFO-05}} | OPTIONAL, {{xref:PIPE-04}} |
      OPTIONAL​

   ●​ Downstream: {{xref:DQV-06}} | OPTIONAL, {{xref:RELIA-05}} | OPTIONAL, {{xref:IRP-*}}
      | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Quarantine model + backfill policy basics.​

   ●​ intermediate: Required. Add repair workflow catalog and verification checks.​

   ●​ advanced: Required. Add approval governance, stop conditions, and audit rigor.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: auto_repair, notes, stop_conditions, sla​

   ●​ If quarantine location or required fields are UNKNOWN → block Completeness Gate.​
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DQV​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ quarantine_model_present == true​

        ○​ repairs_count >= 6​

        ○​ backfill_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
Search & Indexing (SRCH)
Search & Indexing (SRCH)​
SRCH-01 Search Scope & Surfaces (what is searchable, where)​
SRCH-02 Query Model (filters, ranking signals, facets)​
SRCH-03 Index Update Strategy (sync/async, reindex)​
SRCH-04 Search Result Quality Rules (relevance, freshness, dedupe)​
SRCH-05 Search Abuse Controls (gaming, spam, limits)​
SRCH-06 Search Observability (metrics, logging, evaluation)
