RISK-04
RISK-04 — Contingency Triggers (what
causes plan changes)
Header Block
   ●​   template_id: RISK-04
   ●​   title: Contingency Triggers (what causes plan changes)
   ●​   type: risk_assumptions
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/risk/RISK-04_Contingency_Triggers.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.RISK
   ●​   upstream_dependencies: ["RISK-02", "RSC-01", "RELIA-01"]
   ●​   inputs_required: ["RISK-02", "RSC-01", "RELIA-01", "STK-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define explicit trigger conditions that force a plan change (scope, timeline, architecture, rollout).
This makes escalation and contingency behavior deterministic instead of reactive.


Inputs Required
   ●​   RISK-02: {{xref:RISK-02}}
   ●​   RSC-01: {{xref:RSC-01}} | OPTIONAL
   ●​   RELIA-01: {{xref:RELIA-01}} | OPTIONAL
   ●​   STK-04: {{xref:STK-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Trigger list (minimum 8)
   ●​ For each trigger:
          ○​ trig_id
          ○​ related_risk_id
          ○​ condition (clear threshold)
          ○​ detection_method (how we know)
          ○​ response_action (what changes)
          ○​ decision_owner (stakeholder_id)
            ○​ response_sla
            ○​ rollback_or_mitigation_path
            ○​ comms_required (who must be informed)


Optional Fields
     ●​ Severity tiers | OPTIONAL
     ●​ Playbook link | OPTIONAL
     ●​ Notes | OPTIONAL


Rules
     ●​ Conditions must be measurable (thresholds, counts, time windows).
     ●​ Decision owner must exist in STK-01/04 governance.
     ●​ Any trigger that changes scope must reference RSC-04 change control path.


Output Format
1) Contingency Triggers (canonical)
tr    related   conditio     detecti    respon     decisio   respo     mitigati   comms        links
 i    _risk_i      n         on_me      se_acti    n_own     nse_s     on_or_r    _requir
g        d                    thod        on         er        la      ollback      ed
_
 i
d

tr {{trigger    {{triggers   {{trigge   {{trigge   {{trigger {{trigg   {{triggers {{trigger   {{trigge
ig s[0].risk    [0].condit   rs[0].de   rs[0].ac   s[0].ow ers[0].     [0].rollba s[0].co     rs[0].lin
_ _id}}         ion}}        tect}}     tion}}     ner}}     sla}}     ck}}       mms}}       ks}}
0
1


2) Escalation Rules (required)

     ●​ Escalate when: {{escalation.when}}
     ●​ Escalate to: {{escalation.to}}
     ●​ Path: {{xref:STK-04}} | OPTIONAL


Cross-References
     ●​ Upstream: {{xref:RISK-02}}, {{xref:RSC-01}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL
  ●​ Downstream: {{xref:RSC-04}} | OPTIONAL, {{xref:REL-04}} | OPTIONAL,
     {{xref:OPS-05}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. 8 triggers with clear conditions + owners.
  ●​ intermediate: Required. Add response SLAs and comms rules.
  ●​ advanced: Required. Tie triggers to rollback paths and change control.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: links, notes, severity_tiers
  ●​ If condition or response_action is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RISK
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ triggers_count >= 8
        ○​ every_trigger_has_condition_and_action == true
        ○​ owners_present == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
Business Rules & Policy (BRP)
Business Rules & Policy (BRP)​
BRP-01 Business Rules Catalog (by ID)​
BRP-02 Eligibility & Entitlement Rules​
BRP-03 Pricing/Permission Policy Rules (if applicable)​
BRP-04 Exceptions & Edge-Case Policy
