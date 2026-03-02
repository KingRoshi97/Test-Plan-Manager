RSC-04
RSC-04 — Change Control Policy (how
scope changes)
Header Block
   ●​   template_id: RSC-04
   ●​   title: Change Control Policy (how scope changes)
   ●​   type: roadmap_scope
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/roadmap/RSC-04_Change_Control_Policy.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.SCOPE
   ●​   upstream_dependencies: ["RSC-02", "STK-04"]
   ●​   inputs_required: ["RSC-02", "STK-04", "STK-02", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the policy for proposing, evaluating, approving, and recording scope changes. This
prevents silent scope creep and ensures changes are traceable to decisions and roadmap
updates.


Inputs Required
   ●​   RSC-02: {{xref:RSC-02}}
   ●​   STK-04: {{xref:STK-04}} | OPTIONAL
   ●​   STK-02: {{xref:STK-02}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Change request types (bugfix, scope add, scope removal, requirement change, timeline
      change)
   ●​ Required information for a change request
   ●​ Evaluation criteria (impact, risk, cost, schedule, security, UX)
   ●​ Approval rules (who signs off)
   ●​ Decision recording rules (must log to STK-02)
   ●​ Update rules (which docs must be updated when change is approved)
   ●​ Emergency change path (hotfix / security)
Optional Fields
   ●​ SLA for change review | OPTIONAL
   ●​ Limits (max changes per milestone) | OPTIONAL


Rules
   ●​ Approved changes must create a STK-02 decision entry.
   ●​ Any scope change must update PRD-04 and/or RSC-01 as applicable.
   ●​ Emergency path must still record after-the-fact decision within defined SLA.


Output Format
1) Change Request Schema (required)
              field          required               description

change_id                    true       {{change.schema.change_id}}

requester                    true       {{change.schema.requester}}

type                         true       {{change.schema.type}}

description                  true       {{change.schema.description}}

rationale                    true       {{change.schema.rationale}}

impacted_docs                true       {{change.schema.impacted_docs}}

impacted_feature_ids         false      {{change.schema.feature_ids}}

risk_level                   true       {{change.schema.risk_level}}

proposed_timeline_chang      false      {{change.schema.timeline_change}}
e


2) Evaluation Criteria (required)

   ●​ {{change.eval[0]}}
   ●​ {{change.eval[1]}}

3) Approval Rules (required)

   ●​ Approvers by type: {{change.approvers_by_type}}
   ●​ Default approver: {{change.default_approver}} | OPTIONAL
  ●​ Approval gates reference: {{xref:STK-04}} | OPTIONAL

4) Recording & Update Rules (required)

  ●​ Record decision in: {{xref:STK-02}}
  ●​ Update required docs: {{change.update_docs}}
  ●​ Notify stakeholders: {{change.notify}} | OPTIONAL

5) Emergency Change Path (required)

  ●​ When allowed: {{change.emergency.when_allowed}}
  ●​ Who approves: {{change.emergency.approver}}
  ●​ Retroactive logging SLA: {{change.emergency.logging_sla}}


Cross-References
  ●​ Upstream: {{xref:RSC-02}}, {{xref:STK-04}} | OPTIONAL
  ●​ Downstream: {{xref:STK-02}}, {{xref:RSC-01}}, {{xref:PRD-04}}
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Simple schema + approval + logging rules.
  ●​ intermediate: Required. Add evaluation criteria and update rules.
  ●​ advanced: Required. Add emergency path with strict retroactive logging.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: review_sla, limits, notify
  ●​ If approval rules are UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.SCOPE
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ change_request_schema_present == true
        ○​ approval_rules_present == true
        ○​ recording_rules_present == true
        ○​ emergency_path_present == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
Risk & Assumptions (RISK)
Risk & Assumptions (RISK)​
RISK-01 Assumptions Register​
RISK-02 Risk Register (probability/impact/mitigation)​
RISK-03 Dependency Map (external/internal)​
RISK-04 Contingency Triggers (what causes plan changes)
