STK-04
STK-04 — Approval Gates (who signs
what, when)
Header Block
   ●​   template_id: STK-04
   ●​   title: Approval Gates (who signs what, when)
   ●​   type: stakeholders_governance
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/governance/STK-04_Approval_Gates.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.GOV
   ●​   upstream_dependencies: ["STK-01", "STK-03"]
   ●​   inputs_required: ["STK-01", "STK-03", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the approval checkpoints for the kit so builds can be gated deterministically. This
specifies which docs/artifacts require sign-off, by whom, and under what pass conditions.


Inputs Required
   ●​ STK-01: {{xref:STK-01}}
   ●​ STK-03: {{xref:STK-03}} | OPTIONAL
   ●​ Standards: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Gate list (minimum 5 for non-trivial products)
   ●​ For each gate:
         ○​ gate_id
         ○​ name
         ○​ stage (requirements/design/architecture/implementation/security/qa/release)
         ○​ required_artifacts (doc IDs)
         ○​ approver_stakeholder_id(s)
         ○​ pass_conditions (human-verifiable)
         ○​ evidence_required (links/proof pointers)
         ○​ SLA (approval time expectation)
               ○​ failure_path (what happens if rejected)


Optional Fields
     ●​ Delegated approvals | OPTIONAL
     ●​ Conditional gates (only for certain targets) | OPTIONAL


Rules
     ●​ Approvers must exist in STK-01.
     ●​ Gates must align to the pipeline’s gating model; do not invent gate semantics that
        conflict with TMP-05.
     ●​ Each gate must declare evidence_required; otherwise it is not enforceable.
     ●​ If a gate references artifacts that don’t exist, mark UNKNOWN and block completeness.


Output Format
1) Approval Gates (canonical)
 g         name      stage    required    approver     pass_condi   evidenc       sla     failure_pa
at                            _artifact     _ids          tions     e_requir                   th
e_                               s                                     ed
id

ga        {{gates[   {{gates[ {{gates[0   {{gates[0]   {{gates[0].p {{gates[0   {{gate    {{gates[0].f
te        0].nam     0].stag ].artifact   .approver    ass_conditio ].evidenc   s[0].sl   ailure_pat
_0        e}}        e}}      s}}         s}}          ns}}         e}}         a}}       h}}
1

ga        {{gates[   {{gates[ {{gates[1   {{gates[1]   {{gates[1].p {{gates[1   {{gate    {{gates[1].f
te        1].nam     1].stag ].artifact   .approver    ass_conditio ].evidenc   s[1].sl   ailure_pat
_0        e}}        e}}      s}}         s}}          ns}}         e}}         a}}       h}}
2


2) Gate Coverage by Stage (required)

     ●​    requirements gates: {{coverage.requirements}}
     ●​    design gates: {{coverage.design}}
     ●​    architecture gates: {{coverage.architecture}}
     ●​    implementation gates: {{coverage.implementation}}
     ●​    security gates: {{coverage.security}}
     ●​    qa gates: {{coverage.qa}}
     ●​    release gates: {{coverage.release}}
3) Escalation for Stuck Gates (required)

  ●​ Escalate after: {{stuck.escalate_after}}
  ●​ Escalate to: {{stuck.escalate_to_stakeholder_id}}
  ●​ Method: {{stuck.method}}


Cross-References
  ●​ Upstream: {{xref:STK-01}}, {{xref:STK-03}} | OPTIONAL
  ●​ Downstream: {{xref:TRC-03}} | OPTIONAL, {{xref:TRC-04}} | OPTIONAL, {{xref:REL-01}}
     | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Define gates + approvers + required artifacts.
  ●​ intermediate: Required. Add evidence requirements and failure paths.
  ●​ advanced: Required. Add conditional gates and tighter pass conditions aligned to
     release criteria.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: delegated_approvals, conditional_gates
  ●​ If any gate has UNKNOWN approver_ids or UNKNOWN required_artifacts → block
     Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.GOV
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ gates_count >= 5
        ○​ all_gates_have_approvers == true
        ○​ all_gates_have_evidence == true
        ○​ coverage_by_stage_complete == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
Domain Model & Glossary (DMG)
Domain Model & Glossary (DMG)

●​ DMG-01 Domain Glossary (canonical terms)​

●​ DMG-02 Concept Model (entities + relationships, narrative)​

●​ DMG-03 Invariants & Definitions (must-always-be-true rules)​

●​ DMG-04 Event Vocabulary (canonical events/actions)​
