RISK-03
RISK-03 — Dependency Map
(external/internal)
Header Block
   ●​   template_id: RISK-03
   ●​   title: Dependency Map (external/internal)
   ●​   type: risk_assumptions
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/risk/RISK-03_Dependency_Map.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.RISK
   ●​   upstream_dependencies: ["RSC-01", "IMP-01"]
   ●​   inputs_required: ["RSC-01", "PRD-04", "IMP-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": false}


Purpose
List the internal and external dependencies that affect delivery, along with owners, timelines,
and failure modes. This makes sequencing and risk mitigation deterministic.


Inputs Required
   ●​   RSC-01: {{xref:RSC-01}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   IMP-01: {{xref:IMP-01}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Dependency list (minimum 8 for non-trivial products)
   ●​ For each dependency:
         ○​ dep_id
         ○​ name
         ○​ type (internal_team/external_vendor/system/library/legal/infra)
         ○​ description
         ○​ needed_for (milestone_id / feature_id / doc_id)
         ○​ owner
         ○​ due_date (or UNKNOWN)
            ○​ status (not_started/in_progress/blocked/done)
            ○​ failure_mode (what happens if late/broken)
            ○​ mitigation (fallback plan)


Optional Fields
     ●​ Contract/SLA info | OPTIONAL
     ●​ Links | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ Every dependency must have a failure_mode and mitigation.
     ●​ If due_date is UNKNOWN, it must include a tracking plan.


Output Format
1) Dependency Map (canonical)
d      name     type   needed_     owner    due_da     status   failure_m    mitigati    links
e                        for                  te                    ode        on
p
_i
d

d     {{deps   {{deps {{deps[0]. {{deps[    {{deps[0   {{deps[ {{deps[0].f   {{deps[0] {{deps
e     [0].na   [0].typ needed_f 0].own      ].due_d    0].stat ailure_mo     .mitigatio [0].link
p     me}}     e}}     or}}      er}}       ate}}      us}}    de}}          n}}        s}}
_
0
1


2) Critical Dependencies (required)

     ●​ {{derive:CRITICAL_DEPS(deps)}} | OPTIONAL


Cross-References
     ●​ Upstream: {{xref:RSC-01}} | OPTIONAL, {{xref:IMP-01}} | OPTIONAL, {{xref:PRD-04}} |
        OPTIONAL
     ●​ Downstream: {{xref:RISK-02}} | OPTIONAL, {{xref:REL-01}} | OPTIONAL
     ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
  ●​ beginner: Required. List deps + needed_for + mitigation.
  ●​ intermediate: Required. Add failure modes and status tracking.
  ●​ advanced: Not required. (Advanced vendor ops lives in COMP/OPS.)


Unknown Handling
  ●​ UNKNOWN_ALLOWED: due_date, links, contract_sla, open_questions
  ●​ If failure_mode or mitigation is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RISK
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ deps_count >= 8
        ○​ every_dep_has_failure_and_mitigation == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
