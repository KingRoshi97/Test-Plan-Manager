DLR-03
DLR-03 — Deletion & Erasure Procedures
(soft/hard delete)
Header Block
   ●​ template_id: DLR-03​

   ●​ title: Deletion & Erasure Procedures (soft/hard delete)​

   ●​ type: data_lifecycle_retention​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_lifecycle/DLR-03_Deletion_Erasure_Procedures.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DLR​

   ●​ upstream_dependencies: ["DLR-01", "DLR-02", "DGP-02", "ERR-05"]​

   ●​ inputs_required: ["DLR-01", "DLR-02", "DGP-02", "DGP-04", "DATA-02", "ERR-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the deterministic procedures for data deletion and erasure: soft delete, hard delete,
anonymization, cascading delete behaviors across relationships, and verification steps. This
ensures privacy compliance and prevents partial/failed deletions.


Inputs Required
   ●​ DLR-01: {{xref:DLR-01}} | OPTIONAL​

   ●​ DLR-02: {{xref:DLR-02}} | OPTIONAL​

   ●​ DGP-02: {{xref:DGP-02}} | OPTIONAL​
  ●​ DGP-04: {{xref:DGP-04}} | OPTIONAL​

  ●​ DATA-02: {{xref:DATA-02}} | OPTIONAL​

  ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Deletion types supported:​

         ○​ soft delete (tombstone)​

         ○​ hard delete (physical removal)​

         ○​ anonymize/pseudonymize (if used)​

  ●​ Deletion triggers:​

         ○​ user request​

         ○​ retention expiry​

         ○​ admin action​

  ●​ Procedure definitions (step-by-step) for each deletion type​

  ●​ Entity deletion matrix (minimum 12 entities):​

         ○​ entity_id​

         ○​ deletion_type(s) allowed​

         ○​ cascade targets (related entities)​

         ○​ constraints/locks (legal hold, open invoices, etc.)​

         ○​ verification query​

         ○​ rollback/undo possibility (soft delete only)​
          ○​ audit requirements​

  ●​ Cross-system deletion scope:​

          ○​ caches​

          ○​ search indexes​

          ○​ analytics/reporting stores​

          ○​ backups policy pointer (BDR/STORE)​

  ●​ Failure handling (partial delete, retries, DLQ)​



Optional Fields
  ●​ Secure deletion verification methods | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Hard delete must be final; define irreversibility.​

  ●​ Cascades must align with DATA-02 relationships; no ad-hoc cascades.​

  ●​ Legal hold overrides deletion; must be checked first.​

  ●​ Deletion must include index/cache invalidation.​

  ●​ Backups: define policy for delete propagation (cannot claim immediate delete from
     immutable backups; must specify retention window).​



Output Format
1) Deletion Types (required)

  ●​ Soft delete definition: {{types.soft}}​
   ●​ Hard delete definition: {{types.hard}}​

   ●​ Anonymize definition: {{types.anonymize}} | OPTIONAL​



2) Triggers (required)

   ●​ User-request deletion: {{triggers.user_request}}​

   ●​ Retention expiry deletion: {{triggers.retention_expiry}}​

   ●​ Admin deletion: {{triggers.admin}} | OPTIONAL​



3) Procedures (required)

Soft Delete Procedure

   1.​ Preconditions: {{proc.soft.preconditions}}​

   2.​ Steps: {{proc.soft.steps}}​

   3.​ Verification: {{proc.soft.verify}}​

   4.​ Undo policy: {{proc.soft.undo_policy}} | OPTIONAL​


Hard Delete Procedure

   1.​ Preconditions: {{proc.hard.preconditions}}​

   2.​ Steps: {{proc.hard.steps}}​

   3.​ Verification: {{proc.hard.verify}}​

   4.​ Irreversible statement: {{proc.hard.irreversible}}​


Anonymize Procedure (optional)

   1.​ Preconditions: {{proc.anon.preconditions}} | OPTIONAL​

   2.​ Steps: {{proc.anon.steps}} | OPTIONAL​
   3.​ Verification: {{proc.anon.verify}} | OPTIONAL​



4) Entity Deletion Matrix (canonical)
entity_id    allowed_      cascade_      constraint     verify_q    undo_p     audit_re    notes
             deletion       targets          s            uery      ossible     quired

{{matrix[    {{matrix[0]   {{matrix[0]   {{matrix[0].   {{matrix[0 {{matrix[   {{matrix[ {{matrix[
0].entity}   .allowed}}    .cascade}     constraints}   ].verify}} 0].undo}    0].audit}} 0].notes}
}                          }             }                         }                      }

{{matrix[    {{matrix[1]   {{matrix[1]   {{matrix[1].   {{matrix[1 {{matrix[   {{matrix[ {{matrix[
1].entity}   .allowed}}    .cascade}     constraints}   ].verify}} 1].undo}    1].audit}} 1].notes}
}                          }             }                         }                      }


5) Cross-System Deletion Scope (required)

   ●​ Cache invalidation: {{scope.cache}}​

   ●​ Search index removal: {{scope.search}}​

   ●​ Analytics/reporting handling: {{scope.analytics_reporting}}​

   ●​ Backup policy pointer: {{scope.backups_pointer}} | OPTIONAL​



6) Failure Handling (required)

   ●​ Partial deletion handling: {{failure.partial}}​

   ●​ Retry policy pointer: {{xref:ERR-05}} | OPTIONAL​

   ●​ DLQ/quarantine rule: {{failure.dlq}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DLR-02}} | OPTIONAL, {{xref:DATA-02}} | OPTIONAL, {{xref:DGP-04}} |
      OPTIONAL​

   ●​ Downstream: {{xref:DLR-04}} | OPTIONAL, {{xref:SRCH-03}} | OPTIONAL,
      {{xref:CACHE-02}} | OPTIONAL, {{xref:BDR-*}} | OPTIONAL​
  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Soft vs hard delete procedures + matrix basics.​

  ●​ intermediate: Required. Add cascade targets, verification, and cross-system scope.​

  ●​ advanced: Required. Add failure handling, backups posture, and anonymization (if
     used).​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: anonymization, secure_delete_verification, notes,
     admin_trigger (if no admin deletes)​

  ●​ If backups policy is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DLR​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ procedures_present == true​

         ○​ entity_matrix_present == true​

         ○​ cross_system_scope_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
