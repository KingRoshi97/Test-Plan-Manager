DLR-04
DLR-04 — Legal Holds & Exceptions
Policy
Header Block
   ●​ template_id: DLR-04​

   ●​ title: Legal Holds & Exceptions Policy​

   ●​ type: data_lifecycle_retention​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data_lifecycle/DLR-04_Legal_Holds_Exceptions_Policy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DLR​

   ●​ upstream_dependencies: ["DLR-02", "COMP-01", "GOVOPS-03"]​

   ●​ inputs_required: ["DLR-02", "COMP-01", "DGP-02", "GOVOPS-03", "AUDIT-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define how legal holds and retention exceptions work: when holds apply, what data is frozen,
how deletion is blocked, who can apply/release holds, and how holds are audited. This ensures
compliance and prevents accidental deletion.


Inputs Required
   ●​ DLR-02: {{xref:DLR-02}} | OPTIONAL​

   ●​ COMP-01: {{xref:COMP-01}} | OPTIONAL​

   ●​ DGP-02: {{xref:DGP-02}} | OPTIONAL​
  ●​ GOVOPS-03: {{xref:GOVOPS-03}} | OPTIONAL​

  ●​ AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, mark N/A.​

  ●​ Legal hold definition and scope​

  ●​ Hold triggers (lawsuit/investigation/compliance request)​

  ●​ Who can place/release holds (roles, approvals)​

  ●​ Hold effects:​

          ○​ block deletion​

          ○​ block anonymization (if required)​

          ○​ allow read-only access​

          ○​ export rules​

  ●​ Exceptions policy:​

          ○​ when retention can be extended​

          ○​ when retention can be shortened (rare)​

  ●​ Hold tracking fields (hold_id, scope, start/end, reason)​

  ●​ Audit requirements​

  ●​ Verification checklist​



Optional Fields
   ●​ Jurisdiction-specific rules | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Holds override deletion procedures (DLR-03) and retention timers (DLR-02).​

   ●​ Any hold action must be auditable with reason and approver.​

   ●​ Hold release must be explicit and recorded.​



Output Format
1) Applicability

   ●​ applies: {{legal_holds.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{legal_holds.na_block}} | OPTIONAL​



2) Legal Hold Policy (required if applies)

   ●​ Definition: {{policy.definition}}​

   ●​ Scope levels: {{policy.scope_levels}} (user/account/entity/dataset)​

   ●​ Effects: {{policy.effects}}​

   ●​ Allowed access during hold: {{policy.access_during_hold}} | OPTIONAL​



3) Roles & Approval (required if applies)

   ●​ Who can place holds: {{roles.place}}​

   ●​ Who can release holds: {{roles.release}}​
   ●​ Approval requirements: {{roles.approval}}​

   ●​ Required justification fields: {{roles.justification}} | OPTIONAL​



4) Exceptions Policy (required if applies)

   ●​ Extend retention when: {{exceptions.extend_when}}​

   ●​ Shorten retention when: {{exceptions.shorten_when}} | OPTIONAL​

   ●​ Required approvals: {{exceptions.approvals}}​

   ●​ Time-bound rule: {{exceptions.time_bound}} | OPTIONAL​



5) Tracking Fields (required if applies)
  field         meaning          required

hold_id    {{fields.hold_id}}    true

scope      {{fields.scope}}      true

reason     {{fields.reason}}     true

start_at   {{fields.start_at}}   true

end_at     {{fields.end_at}}     false


6) Audit Requirements (required if applies)

   ●​ Audit events: {{audit.events}}​

   ●​ Retention of audit logs: {{audit.retention}} | OPTIONAL​



7) Verification Checklist (required if applies)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​
Cross-References
  ●​ Upstream: {{xref:DLR-02}} | OPTIONAL, {{xref:COMP-01}} | OPTIONAL​

  ●​ Downstream: {{xref:DLR-03}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Not required.​

  ●​ intermediate: Required if applies. Define triggers + roles + effects.​

  ●​ advanced: Required if applies. Add exceptions governance and audit rigor.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: jurisdiction_rules, notes, shorten_retention (if
     disallowed)​

  ●​ If applies == true and roles/approval are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DLR​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ if_applies_then_policy_present == true​

         ○​ roles_approval_present == true​

         ○​ tracking_fields_present == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
