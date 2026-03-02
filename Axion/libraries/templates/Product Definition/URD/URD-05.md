URD-05
URD-05 — Validation Plan (what to test,
how to measure)
Header Block
   ●​ template_id: URD-05
   ●​ title: Validation Plan (what to test, how to measure)
   ●​ type: user_research
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/research/URD-05_Validation_Plan.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.RESEARCH
   ●​ upstream_dependencies: ["URD-02", "URD-03", "PRD-02"]
   ●​ inputs_required: ["URD-02", "URD-03", "PRD-02", "PRD-04", "SMIP-01",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define what must be validated (assumptions, usability, value, feasibility), how it will be tested,
and what measurement signals will confirm or falsify the hypotheses. This is the bridge from
discovery into build prioritization, metrics instrumentation, and release readiness.


Inputs Required
   ●​   URD-02: {{xref:URD-02}}
   ●​   URD-03: {{xref:URD-03}}
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   SMIP-01: {{xref:SMIP-01}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing experiment notes: {{inputs.experiment_notes}} | OPTIONAL


Required Fields
   ●​ Validation goals (2–8)
   ●​ Hypotheses to validate (3–15)
   ●​ For each hypothesis:
          ○​ hypothesis_id
        ○​ statement
        ○​ type (value/usability/feasibility/risk)
        ○​ mapped needs/pain points (URD-03 item_ids)
        ○​ mapped goals/metrics (PRD-02 metric_ids if available)
        ○​ method (prototype test, A/B, pilot, survey, etc.)
        ○​ success criteria (pass/fail)
        ○​ measurement signals (quant/qual)
        ○​ sample target (or UNKNOWN)
        ○​ timeline
        ○​ owner
  ●​ Decision rules (what happens if pass/fail)
  ●​ Risks/limitations


Optional Fields
  ●​   Tooling | OPTIONAL
  ●​   Variants / experiment design notes | OPTIONAL
  ●​   Guardrails | OPTIONAL
  ●​   Open questions | OPTIONAL


Rules
  ●​   Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
  ●​   Each hypothesis must map to at least one URD-03 need/pain point item.
  ●​   Success criteria must be testable (numbers or explicit qualitative thresholds).
  ●​   If measurement requires instrumentation, reference SMIP docs.
  ●​   Do not define implementation tasks; this is validation only.


Output Format
1) Validation Overview

  ●​   Owner: {{validation.owner}}
  ●​   Timeline: {{validation.timeline}}
  ●​   Scope: {{validation.scope}} | OPTIONAL
  ●​   Tools: {{validation.tools}} | OPTIONAL

2) Validation Goals

  ●​ {{validation.goals[0]}}
  ●​ {{validation.goals[1]}}
3) Hypotheses Matrix (required)
 hy      state    type     mappe mappe             meth    success      signa    samp     owne     timeli
 po      ment              d_urd_i d_met            od     _criteria      ls     le_tar     r        ne
 th                        tem_id ric_ids                                          get
 es                           s
 is
 _i
  d

 vh     {{hypot   {{hyp    {{hypot     {{hypot    {{hypo   {{hypoth     {{hyp    {{hypo   {{hyp    {{hypo
 _0     heses[    othes    heses[0     heses[     these    eses[0].     othes    these    othes    theses
 1      0].stat   es[0].   ].urd_ite   0].metr    s[0].m   success      es[0].   s[0].s   es[0].   [0].tim
        ement}    type}    m_ids}}     ic_ids}}   ethod}   _criteria}   signal   ample    owner    eline}}
        }         }                               }        }            s}}      }}       }}

 vh     {{hypot   {{hyp    {{hypot     {{hypot    {{hypo   {{hypoth     {{hyp    {{hypo   {{hyp    {{hypo
 _0     heses[    othes    heses[1     heses[     these    eses[1].     othes    these    othes    theses
 2      1].stat   es[1].   ].urd_ite   1].metr    s[1].m   success      es[1].   s[1].s   es[1].   [1].tim
        ement}    type}    m_ids}}     ic_ids}}   ethod}   _criteria}   signal   ample    owner    eline}}
        }         }                               }        }            s}}      }}       }}


4) Decision Rules (required)

Define what changes when hypotheses pass/fail.

 rule_i             condition                     decision/action                 affected_docs
   d

 dr_01     {{decision_rules[0].conditi      {{decision_rules[0].actio     {{decision_rules[0].affected_d
           on}}                             n}}                           ocs}}

 dr_02     {{decision_rules[1].conditi      {{decision_rules[1].actio     {{decision_rules[1].affected_d
           on}}                             n}}                           ocs}}


5) Guardrails (optional)

      ●​ {{guardrails[0]}} | OPTIONAL
      ●​ {{guardrails[1]}} | OPTIONAL

6) Risks / Limitations (required)

      ●​ {{risks[0]}}
      ●​ {{risks[1]}} | OPTIONAL
7) Variants / Experiment Notes (optional)

  ●​ {{variants[0]}} | OPTIONAL

8) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL
  ●​ {{open_questions[1]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:URD-02}}, {{xref:URD-03}}, {{xref:PRD-02}} | OPTIONAL
  ●​ Downstream: {{xref:SMIP-01}} | OPTIONAL, {{xref:SMIP-02}} | OPTIONAL,
     {{xref:RSC-03}} | OPTIONAL, {{xref:STK-02}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. 3–5 hypotheses, simple methods, clear pass/fail statements.
  ●​ intermediate: Required. Map hypotheses to URD items and metrics; include decision
     rules.
  ●​ advanced: Required. Add guardrails and tighter success criteria; link outcomes to doc
     updates.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: sample_target, tools, variants, guardrails,
     open_questions
  ●​ If success_criteria is UNKNOWN for any hypothesis → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESEARCH
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ hypotheses_count >= 3
        ○​ every_hypothesis_maps_to_urd_items == true
        ○​ every_hypothesis_has_success_criteria == true
        ○​ decision_rules_present == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
Stakeholders & Governance (STK)
Stakeholders & Governance (STK)

●​ STK-01 Stakeholder Map (roles, decision rights)​

●​ STK-02 Decision Log (what/why/when)​

●​ STK-03 RACI / Ownership Matrix​

●​ STK-04 Approval Gates (who signs what, when)​
