BRP-04
BRP-04 — Exceptions & Edge-Case Policy
Header Block
   ●​   template_id: BRP-04
   ●​   title: Exceptions & Edge-Case Policy
   ●​   type: business_rules_policy
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/policy/BRP-04_Exceptions_EdgeCases.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.POLICY
   ●​   upstream_dependencies: ["BRP-01", "PRD-09", "DMG-03"]
   ●​   inputs_required: ["BRP-01", "PRD-09", "DMG-03", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical handling for edge cases and exceptions so behavior is consistent across
UI/API/ops and is testable. This prevents ad-hoc “special cases” being implemented differently
across the system.


Inputs Required
   ●​   BRP-01: {{xref:BRP-01}} | OPTIONAL
   ●​   PRD-09: {{xref:PRD-09}} | OPTIONAL
   ●​   DMG-03: {{xref:DMG-03}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Known edge case notes: {{inputs.edge_notes}} | OPTIONAL


Required Fields
   ●​ Exceptions list (minimum 10 for non-trivial products)
   ●​ For each exception:
         ○​ ex_id
         ○​ triggering_condition
         ○​ affected_rule_ids / invariant_ids / feature_ids
         ○​ expected_system_behavior
         ○​ user_experience (what user sees)
         ○​ enforcement_points (UI/API/DB/ops)
         ○​ logging/audit requirements
          ○​ test cases required (tc pointers or descriptions)
          ○​ severity (P0/P1/P2)
    ●​ Global policy for “unknown/unhandled cases”


Optional Fields
    ●​ Support playbook pointer | OPTIONAL
    ●​ Open questions | OPTIONAL


Rules
    ●​ Every exception must be testable (must map to a test case requirement).
    ●​ P0 exceptions must define logging/audit requirements and a user-facing experience.
    ●​ If “unhandled case” behavior is not defined, default must be explicit (fail-safe vs
       permissive).


Output Format
1) Exceptions Catalog (canonical)
e conditio affected_ expecte            user_     enforce     logging test_r        severit    notes
x    n        refs   d_beha             exper     ment_po      _audit equire          y
_                      vior             ience       ints              ments
i
d

e   {{excepti   {{exceptio   {{except   {{exce    {{excepti   {{except    {{exce    {{except   {{exce
x   ons[0].c    ns[0].affe   ions[0].   ptions    ons[0].en   ions[0].l   ptions[   ions[0].   ptions[
_   ondition}   cted_refs    behavio    [0].ux}   forcemen    ogging}     0].test   severity   0].note
0   }           }}           r}}        }         t}}         }           s}}       }}         s}}
1


2) Global Edge-Case Policy (required)

    ●​ Default behavior: {{policy.default_behavior}} (fail-safe / permissive / block + escalate)
    ●​ Reason codes: {{policy.reason_codes}} | OPTIONAL
    ●​ Support escalation: {{policy.support_escalation}} | OPTIONAL

3) Open Questions (optional)

    ●​ {{open_questions[0]}} | OPTIONAL
Cross-References
  ●​ Upstream: {{xref:BRP-01}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL
  ●​ Downstream: {{xref:API-03}} | OPTIONAL, {{xref:ARC-06}} | OPTIONAL, {{xref:QA-02}} |
     OPTIONAL, {{xref:ADMIN-02}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Capture top exceptions + expected behavior.
  ●​ intermediate: Required. Add enforcement points and logging requirements.
  ●​ advanced: Required. Add reason codes and explicit test requirement pointers.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: reason_codes, support_playbook_pointer, notes,
     open_questions
  ●​ If severity == P0 and expected_behavior is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.POLICY
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ exceptions_count >= 10
        ○​ every_exception_has_behavior_and_tests == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
Success Metrics & Instrumentation Plan
(SMIP)
Success Metrics & Instrumentation Plan (SMIP)​
SMIP-01 KPI/OKR Definitions (targets + owners)​
SMIP-02 Analytics Event Spec (event names + properties)​
SMIP-03 Funnel/Conversion Definitions​
SMIP-04 Experiment Measurement Plan (guardrails + success)
