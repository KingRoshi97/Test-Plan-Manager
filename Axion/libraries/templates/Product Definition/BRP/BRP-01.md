BRP-01
BRP-01 — Business Rules Catalog (by ID)
Header Block
   ●​   template_id: BRP-01
   ●​   title: Business Rules Catalog (by ID)
   ●​   type: business_rules_policy
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/policy/BRP-01_Business_Rules_Catalog.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.POLICY
   ●​   upstream_dependencies: ["PRD-04", "DMG-01", "DMG-03"]
   ●​   inputs_required: ["PRD-04", "DMG-01", "DMG-03", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical, testable business rules that govern system behavior. These rules are
referenced by API authorization, data constraints, UI validation, and test cases. This is the “rule
source,” not the implementation.


Inputs Required
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   DMG-01: {{xref:DMG-01}} | OPTIONAL
   ●​   DMG-03: {{xref:DMG-03}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing policy notes: {{inputs.policy_notes}} | OPTIONAL


Required Fields
   ●​ Rule list (minimum 15 for non-trivial products)
   ●​ For each rule:
         ○​ br_id
         ○​ name
         ○​ rule_statement (must/never/only if)
         ○​ category (eligibility/entitlement/pricing/limits/workflow/data)
         ○​ scope (system/feature/entity/endpoint)
         ○​ related_feature_ids
         ○​ related_entity_ids
          ○​     inputs (what the rule evaluates)
          ○​     outputs/effects (what changes)
          ○​     exceptions (if any)
          ○​     enforcement_points (UI/API/DB/ops)
          ○​     testability_notes (how to verify)
          ○​     priority (P0/P1/P2)
          ○​     status (active/deprecated)


Optional Fields
  ●​ Source references (policy docs) | OPTIONAL
  ●​ Versioning notes | OPTIONAL
  ●​ Open questions | OPTIONAL


Rules
  ●​ Rules must be testable; vague language must be converted into measurable conditions.
  ●​ Rule IDs must be stable and unique (br_<slug>).
  ●​ If a rule is “hard” (P0), it must declare at least one enforcement_point and
     testability_notes.
  ●​ If a rule conflicts with another rule or invariant, escalate to STK-02.


Output Format
1) Business Rules Catalog (canonical)
b na     cate     rule    sc     feat     entit    inp    out     exce    enfor    test     prio    sta    not
r me     gor      _sta    op     ure_     y_id     uts    put     ptio    cem      abili    rity    tus    es
_         y       tem      e      ids      s              s/ef     ns     ent_     ty_n
i                 ent                                     fect            point    otes
d                                                          s                s

b {{ru   {{rul    {{rul   {{ru   {{rule   {{rul    {{ru   {{rul   {{rul   {{rule   {{rul    {{rul   {{ru   {{ru
r les[   es[0     es[0]   les[   s[0].f   es[0]    les[   es[0    es[0]   s[0].e   es[0]    es[0    les[   les[
_ 0].    ].cat    .stat   0].s   eatur    .entit   0].i   ].ou    .exc    nforc    .test    ].pri   0].s   0].
0 na     egor     eme     cop    e_id     y_id     npu    tput    eptio   emen     abilit   ority   tatu   not
1 me     y}}      nt}}    e}}    s}}      s}}      ts}}   s}}     ns}}    t}}      y}}      }}      s}}    es}
  }}                                                                                                       }

b {{ru   {{rul    {{rul {{ru     {{rule   {{rul    {{ru   {{rul {{rul     {{rule   {{rul    {{rul {{ru     {{ru
r les[   es[1     es[1] les[     s[1].f   es[1]    les[   es[1 es[1]      s[1].e   es[1]    es[1 les[      les[
_ 1].    ].cat    .stat 1].s     eatur    .entit   1].i   ].ou .exc       nforc    .test    ].pri 1].s     1].
0 na    egor eme      cop   e_id    y_id   npu    tput   eptio   emen abilit   ority tatu not
2 me    y}}  nt}}     e}}   s}}     s}}    ts}}   s}}    ns}}    t}}  y}}      }}    s}} es}
  }}                                                                                      }


2) P0 Rules Summary (required)

   ●​ {{derive:LIST_P0_RULES(rules)}} | OPTIONAL

3) Conflicts (required if any)

   ●​ {{conflicts[0]}} | OPTIONAL

4) Open Questions (optional)

   ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
   ●​ Upstream: {{xref:PRD-04}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL
   ●​ Downstream: {{xref:API-02}} | OPTIONAL, {{xref:DATA-03}} | OPTIONAL, {{xref:QA-02}}
      | OPTIONAL, {{xref:IAM-03}} | OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Required. Capture rule_statement + category + enforcement points at high
      level.
   ●​ intermediate: Required. Add inputs/outputs and testability notes.
   ●​ advanced: Required. Tighten exceptions and map to features/entities.


Unknown Handling
   ●​ UNKNOWN_ALLOWED: exceptions, source_references, notes,
      open_questions
   ●​ If priority == P0 and enforcement_points is UNKNOWN → block Completeness Gate.


Completeness Gate
   ●​ Gate ID: TMP-05.PRIMARY.POLICY
   ●​ Pass conditions:
         ○​ required_fields_present == true
○​   rules_count >= 15
○​   p0_rules_have_enforcement_and_testability == true
○​   placeholder_resolution == true
○​   no_unapproved_unknowns == true
