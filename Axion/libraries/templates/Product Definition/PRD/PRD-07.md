PRD-07
PRD-07 — Constraints & Assumptions
Header Block
   ●​   template_id: PRD-07
   ●​   title: Constraints & Assumptions
   ●​   type: product_requirements
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/requirements/PRD-07_Constraints_Assumptions.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.PROD
   ●​   upstream_dependencies: ["PRD-01", "PRD-06"]
   ●​   inputs_required: ["PRD-01", "PRD-06", "SPEC_INDEX", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Centralize the hard constraints and working assumptions that shape the build. This document
prevents hidden requirements, forces explicit trade-offs, and feeds planning, architecture, risk
management, and release gating.


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   SPEC_INDEX: {{spec.index}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing constraints notes: {{inputs.constraints_notes}} | OPTIONAL


Required Fields
   ●​ Constraints list (minimum 5 unless truly small product)
   ●​ For each constraint:
         ○​ constraint_id
         ○​ statement
         ○​ type (business/technical/legal/time/budget/platform)
         ○​ rationale
         ○​ impacted areas (domains/features)
         ○​ enforcement (how it will be ensured)
         ○​ severity (hard/soft)
   ●​ Assumptions list (minimum 5)
   ●​ For each assumption:
         ○​ assumption_id
         ○​ statement
         ○​ rationale
         ○​ risk if false
         ○​ validation plan
         ○​ owner
         ○​ timeframe (when validated)


Optional Fields
   ●​ Linked NFRs | OPTIONAL
   ●​ Dependencies (external systems) | OPTIONAL
   ●​ Open questions | OPTIONAL


Rules
   ●​ Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
   ●​ Constraints are “must” statements; assumptions are “we believe” statements.
   ●​ Each assumption must include a validation plan (even if minimal).
   ●​ If enforcement or validation plan is unknown, mark UNKNOWN and add to Open
      Questions.
   ●​ If a constraint conflicts with another constraint/NFR, flag explicitly.


Output Format
1) Constraints Catalog (required)
 co     stateme       type      severity    rational     impacte     impacted    enforcem     notes
 nst       nt                                   e        d_doma       _feature      ent
 rai                                                       ins          _ids
 nt_
  id

c_0     {{constrai   {{const    {{constr    {{constra    {{constra   {{constrai {{constrai {{constr
1       nts[0].sta   raints[0   aints[0].   ints[0].ra   ints[0].d   nts[0].feat nts[0].enfo aints[0]
        tement}}     ].type}}   severity}   tionale}}    omains}}    ure_ids}} rcement}} .notes}}
                                }
 c_0    {{constrai    {{const    {{constr    {{constra    {{constra   {{constrai {{constrai {{constr
 2      nts[1].sta    raints[1   aints[1].   ints[1].ra   ints[1].d   nts[1].feat nts[1].enfo aints[1]
        tement}}      ].type}}   severity}   tionale}}    omains}}    ure_ids}} rcement}} .notes}}
                                 }


2) Assumptions Register (required)
 ass     statemen       rationale     risk_if_fal    validation_       owner      validate_b     notes
 ump         t                            se             plan                          y
 tion
  _id

 a_0    {{assumpt      {{assumpt     {{assumpti {{assumptio           {{assum     {{assumpti    {{assum
 1      ions[0].sta    ions[0].rat   ons[0].risk_ ns[0].validati      ptions[0]   ons[0].vali   ptions[0]
        tement}}       ionale}}      if_false}}   on_plan}}           .owner}}    date_by}}     .notes}}

 a_0    {{assumpt      {{assumpt     {{assumpti {{assumptio           {{assum     {{assumpti    {{assum
 2      ions[1].sta    ions[1].rat   ons[1].risk_ ns[1].validati      ptions[1]   ons[1].vali   ptions[1]
        tement}}       ionale}}      if_false}}   on_plan}}           .owner}}    date_by}}     .notes}}


3) Conflicts / Tensions (required if any)

List explicit collisions (constraint vs constraint, constraint vs NFR, assumption vs constraint).

   ●​ {{conflicts[0]}} | OPTIONAL
   ●​ {{conflicts[1]}} | OPTIONAL

4) Derived Impact Summary (optional)

   ●​ Domains most impacted: {{derive:TOP_IMPACTED_DOMAINS(constraints,
      assumptions)}} | OPTIONAL
   ●​ Features most impacted: {{derive:TOP_IMPACTED_FEATURES(constraints,
      assumptions)}} | OPTIONAL

5) Open Questions (optional)

   ●​ {{open_questions[0]}} | OPTIONAL
   ●​ {{open_questions[1]}} | OPTIONAL


Cross-References
   ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-06}} | OPTIONAL
   ●​ Downstream: {{xref:RISK-01}} | OPTIONAL, {{xref:ARC-01}}, {{xref:IMP-01}},
      {{xref:REL-*}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Keep enforcement/validation simple; allow UNKNOWN only with
     open question.
  ●​ intermediate: Required. Add impacted_domains and validate_by dates; reduce
     UNKNOWN.
  ●​ advanced: Required. Add explicit conflict statements and mitigation notes tied to
     planning/release.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: impacted_feature_ids, enforcement (soft constraints
     only), notes, conflicts, open_questions
  ●​ If an assumption.validation_plan is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.PROD
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ constraints_count >= 5 (unless explicitly justified)
        ○​ assumptions_count >= 5 (unless explicitly justified)
        ○​ every_assumption_has_validation_plan == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
