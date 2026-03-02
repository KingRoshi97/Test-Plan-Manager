STK-02
STK-02 — Decision Log (what/why/when)
Header Block
   ●​   template_id: STK-02
   ●​   title: Decision Log (what/why/when)
   ●​   type: stakeholders_governance
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/governance/STK-02_Decision_Log.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.GOV
   ●​   upstream_dependencies: ["STK-01"]
   ●​   inputs_required: ["STK-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Create the canonical audit of material decisions that affect scope, architecture, security, data,
UX, release, and operations. This log is the source of truth for “why we chose X,” and is used to
prevent re-litigating decisions.


Inputs Required
   ●​ STK-01: {{xref:STK-01}}
   ●​ Standards: {{standards.index}} | OPTIONAL
   ●​ Decision notes: {{inputs.decision_notes}} | OPTIONAL


Required Fields
   ●​ Decision entries (can be 0, but must be explicit)
   ●​ For each decision:
         ○​ decision_id
         ○​ date
         ○​ decision_title
         ○​ decision_area (product/design/architecture/security/data/release/ops)
         ○​ decision_statement
         ○​ context
         ○​ options_considered
         ○​ rationale
         ○​ approver_stakeholder_id
           ○​ status (proposed/approved/reversed)
           ○​ affected_docs (IDs)
           ○​ reversal_pointer (if reversed)


Optional Fields
   ●​ Evidence/links | OPTIONAL
   ●​ Follow-ups | OPTIONAL


Rules
   ●​ Decision IDs must be stable and unique (dec_YYYYMMDD_<slug> or dec_<seq>).
   ●​ Approver must be a stakeholder from STK-01.
   ●​ If a decision changes PRD scope or requirements, it must reference PRD-04 and
      RSC-04.
   ●​ Reversals must be explicit and point to the reversing decision.


Output Format
1) Decision Log (canonical)
  de     date      area      title     decision     approver_     status     affected_d     links
 cis                                   _stateme     stakehold                    ocs
 ion                                      nt          er_id
 _id

 dec {{decisi    {{decisi   {{decisi   {{decision   {{decisions   {{decisi   {{decisions[ {{decisi
 _0 ons[0].      ons[0].    ons[0].t   s[0].state   [0].approv    ons[0].s   0].affected_ ons[0].li
 1   date}}      area}}     itle}}     ment}}       er_id}}       tatus}}    docs}}       nks}}


2) Decision Detail Blocks (required per entry)

{{decisions[0].decision_id}} — {{decisions[0].title}}

   ●​   Area: {{decisions[0].area}}
   ●​   Date: {{decisions[0].date}}
   ●​   Approver: {{decisions[0].approver_id}}
   ●​   Status: {{decisions[0].status}}

Context​
{{decisions[0].context}}

Options considered
   ●​ {{decisions[0].options[0]}}
   ●​ {{decisions[0].options[1]}} | OPTIONAL

Decision​
{{decisions[0].statement}}

Rationale​
{{decisions[0].rationale}}

Affected docs​
{{decisions[0].affected_docs}}

Follow-ups

   ●​ {{decisions[0].followups[0]}} | OPTIONAL

Reversal (if reversed)

   ●​ reversal_pointer: {{decisions[0].reversal_pointer}} | OPTIONAL


Cross-References
   ●​ Upstream: {{xref:STK-01}}
   ●​ Downstream: {{xref:RSC-04}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL, {{xref:ARC-*}}
      | OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Required. Capture decisions + rationale + approver.
   ●​ intermediate: Required. Include options considered and affected docs.
   ●​ advanced: Required. Maintain reversals and follow-ups with traceability.


Unknown Handling
   ●​ UNKNOWN_ALLOWED: links, followups, options_considered (minimum 1
      option still required)
   ●​ If status == approved and approver_stakeholder_id is UNKNOWN → block
      Completeness Gate.


Completeness Gate
   ●​ Gate ID: TMP-05.PRIMARY.GOV
●​ Pass conditions:
      ○​ required_fields_present == true
      ○​ decision_ids_unique == true
      ○​ approved_decisions_have_approver == true
      ○​ placeholder_resolution == true
      ○​ no_unapproved_unknowns == true
