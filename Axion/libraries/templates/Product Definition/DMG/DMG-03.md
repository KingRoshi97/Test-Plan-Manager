DMG-03
DMG-03 — Invariants & Definitions
(must-always-be-true rules)
Header Block
   ●​   template_id: DMG-03
   ●​   title: Invariants & Definitions (must-always-be-true rules)
   ●​   type: domain_model_glossary
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/domain/DMG-03_Invariants_Definitions.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DOMAIN
   ●​   upstream_dependencies: ["DMG-02", "BRP-01"]
   ●​   inputs_required: ["DMG-02", "BRP-01", "PRD-06", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the non-negotiable domain truths (invariants) and formal definitions that must hold
across all implementations. These rules anchor validation, database constraints, authorization,
and test assertions.


Inputs Required
   ●​   DMG-02: {{xref:DMG-02}}
   ●​   BRP-01: {{xref:BRP-01}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Invariants list (minimum 10 for non-trivial products)
   ●​ For each invariant:
          ○​ inv_id
          ○​ statement (must/never)
          ○​ scope (entity/relationship/system)
          ○​ related_entity_ids
          ○​ related_business_rule_ids (optional)
          ○​ enforcement points (API/DB/UI/ops)
          ○​ test strategy (how to verify)
          ○​ severity (hard/soft)
    ●​ Definitions list (if any must be formalized beyond glossary)


Optional Fields
    ●​ Exception cases | OPTIONAL
    ●​ Open questions | OPTIONAL


Rules
    ●​ Invariants must be testable (can be asserted).
    ●​ If an invariant conflicts with BRP rules, escalate to STK-02 decision.
    ●​ “Hard” invariants must declare at least one enforcement point and a test strategy.


Output Format
1) Invariants (canonical)
i    stateme     scope      entity_id     br_rule   enforcem     test_strat   severity    exceptio
n       nt                      s          _ids     ent_point       egy                      ns
v                                                       s
_
i
d

i   {{invarian   {{invari   {{invarian    {{invaria {{invariant {{invariant   {{invaria   {{invarian
n   ts[0].stat   ants[0].   ts[0].entit   nts[0].br s[0].enforc s[0].test_s   nts[0].se   ts[0].exce
v   ement}}      scope}}    y_ids}}       _ids}}    ement}}     trategy}}     verity}}    ptions}}
_
0
1

i   {{invarian   {{invari   {{invarian    {{invaria {{invariant {{invariant   {{invaria   {{invarian
n   ts[1].stat   ants[1].   ts[1].entit   nts[1].br s[1].enforc s[1].test_s   nts[1].se   ts[1].exce
v   ement}}      scope}}    y_ids}}       _ids}}    ement}}     trategy}}     verity}}    ptions}}
_
0
2


2) Formal Definitions (optional)
def_id        term_id          formal_definition            notes

def_01 {{defs[0].term_id}}   {{defs[0].definition}}   {{defs[0].notes}}


3) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:DMG-02}}, {{xref:BRP-01}} | OPTIONAL
  ●​ Downstream: {{xref:DATA-03}}, {{xref:API-02}}, {{xref:QA-02}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Capture 10 core invariants; simple enforcement points.
  ●​ intermediate: Required. Add test strategies and severity.
  ●​ advanced: Required. Tighten enforcement mapping to DB/API/UI and document
     exceptions.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: br_rule_ids, exceptions, formal_definitions,
     open_questions
  ●​ If severity == hard and enforcement_points is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DOMAIN
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ invariants_count >= 10
        ○​ hard_invariants_have_enforcement_and_tests == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
