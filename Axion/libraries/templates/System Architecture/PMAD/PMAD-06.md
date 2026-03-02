PMAD-06
PMAD-06 — Audit Requirements for AuthZ
(what must be logged)
Header Block
   ●​ template_id: PMAD-06​

   ●​ title: Audit Requirements for AuthZ (what must be logged)​

   ●​ type: permission_model_authorization_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/authz/PMAD-06_Audit_Requirements_for_AuthZ.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.AUTHZ​

   ●​ upstream_dependencies: ["PMAD-03", "PMAD-04", "AUDIT-01", "DGP-01"]​

   ●​ inputs_required: ["PMAD-03", "PMAD-04", "AUDIT-01", "DGP-01", "OBS-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the audit logging requirements specifically for authorization: what decisions and actions
must be logged, what fields are required, how redaction works, retention rules, and how audit
trails support investigations and compliance.


Inputs Required
   ●​ PMAD-03: {{xref:PMAD-03}} | OPTIONAL​

   ●​ PMAD-04: {{xref:PMAD-04}} | OPTIONAL​

   ●​ AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Audit event categories:​

         ○​ auth decisions (allow/deny)​

         ○​ privileged actions​

         ○​ policy changes (if applicable)​

         ○​ access grant/revoke events​

  ●​ Required audit fields:​

         ○​ timestamp​

         ○​ actor (user/service)​

         ○​ actor_role(s)​

         ○​ action​

         ○​ resource + resource identifiers​

         ○​ decision outcome​

         ○​ reason_code​

         ○​ enforcement_point (where decision made)​

         ○​ correlation_id / trace_id​

         ○​ source IP / device (where applicable)​

         ○​ before/after snapshots (for privileged actions) (redacted)​
  ●​ Redaction rules (PII)​

  ●​ Retention rules and access controls (who can view audit logs)​

  ●​ Verification checklist​



Optional Fields
  ●​ Export/reporting requirements | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Audit logs must be tamper-evident or protected (pointer to audit system rules).​

  ●​ Access to audit logs must be least-privilege and itself auditable.​

  ●​ Reason codes are mandatory for denies and privileged actions.​

  ●​ Before/after snapshots must avoid storing sensitive fields unnecessarily.​



Output Format
1) Audit Event Categories (required)

  ●​ Auth decisions: {{categories.auth_decisions}}​

  ●​ Privileged actions: {{categories.privileged}}​

  ●​ Access grants/revokes: {{categories.grants}}​

  ●​ Policy changes: {{categories.policy_changes}} | OPTIONAL​



2) Required Fields (required)
    field       required           description                   redaction_rule
timestamp         true     {{fields.timestamp.desc}}     {{fields.timestamp.redaction}}

actor_id          true     {{fields.actor_id.desc}}      {{fields.actor_id.redaction}}

action            true     {{fields.action.desc}}        {{fields.action.redaction}}

resource          true     {{fields.resource.desc}}      {{fields.resource.redaction}}

decision          true     {{fields.decision.desc}}      {{fields.decision.redaction}}

reason_code       true     {{fields.reason.desc}}        {{fields.reason.redaction}}

correlation_id    true     {{fields.correlation.desc}}   {{fields.correlation.redaction}}


3) Redaction Rules (required)

   ●​ Never store: {{redaction.never_store}}​

   ●​ Store hashed: {{redaction.hash}} | OPTIONAL​

   ●​ Store truncated: {{redaction.truncate}} | OPTIONAL​



4) Retention & Access Control (required)

   ●​ Retention window: {{retention.window}}​

   ●​ Who can view: {{retention.view_roles}}​

   ●​ Access logging required: {{retention.access_logged}}​

   ●​ Export policy: {{retention.export_policy}} | OPTIONAL​



5) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​

   ●​ {{verify[3]}} | OPTIONAL​
Cross-References
  ●​ Upstream: {{xref:AUDIT-01}} | OPTIONAL, {{xref:DGP-01}} | OPTIONAL, {{xref:OBS-01}}
     | OPTIONAL​

  ●​ Downstream: {{xref:ADMIN-03}} | OPTIONAL, {{xref:IRP-*}} | OPTIONAL,
     {{xref:COMP-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Required fields + retention + redaction basics.​

  ●​ intermediate: Required. Add event categories and access control policy.​

  ●​ advanced: Required. Add export/reporting and tamper-evidence pointers.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: export_requirements, notes,
     policy_changes_category​

  ●​ If retention window or view roles are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.AUTHZ​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ reason_code_mandatory == true​

         ○​ retention_defined == true​
○​ access_controls_defined == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
Error Model & Reason Codes (ERR)
●​ Error Model & Reason Codes (ERR)​
   ERR-01 Error Taxonomy (classes, categories, severity)​
   ERR-02 Reason Codes Registry (rc_* catalog + meanings)​
   ERR-03 API Error Contract (shape, status mapping, localization hooks)​
   ERR-04 UX Error Mapping Rules (reason_code → DES/CDX surfaces)​
   ERR-05 Retryability & Idempotency Rules (which errors retry, how)​
   ERR-06 Observability Requirements for Errors (logs/metrics/traces fields)
