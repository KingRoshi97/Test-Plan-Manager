RISK-02
RISK-02 — Risk Register
(probability/impact/mitigation)
Header Block
   ●​   template_id: RISK-02
   ●​   title: Risk Register (probability/impact/mitigation)
   ●​   type: risk_assumptions
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/risk/RISK-02_Risk_Register.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.RISK
   ●​   upstream_dependencies: ["RISK-01", "PRD-06", "RSC-01"]
   ●​   inputs_required: ["RISK-01", "PRD-06", "RSC-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Track and prioritize risks with clear mitigation, owners, and triggers. This is the canonical list
used for planning tradeoffs, security posture, ops readiness, and release gating.


Inputs Required
   ●​   RISK-01: {{xref:RISK-01}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   RSC-01: {{xref:RSC-01}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Risks list (minimum 10 for non-trivial products)
   ●​ For each risk:
         ○​ risk_id
         ○​ statement
         ○​ category (product/tech/security/data/ops/legal)
         ○​ probability (low/med/high or 1–5)
         ○​ impact (low/med/high or 1–5)
         ○​ severity (derived or explicit)
         ○​ mitigation_plan
             ○​    owner
             ○​    trigger_signals (what indicates it’s happening)
             ○​    status (open/mitigating/accepted/closed)
             ○​    impacted_feature_ids / domains / docs


Optional Fields
    ●​ Contingency plan | OPTIONAL
    ●​ Residual risk | OPTIONAL
    ●​ Links/evidence | OPTIONAL


Rules
    ●​ Every risk must have a mitigation_plan.
    ●​ Any “accepted” risk must include rationale and approver (stakeholder_id) or STK-02
       reference.
    ●​ Top risks (by severity) must have triggers.


Output Format
1) Risk Register (canonical)
r    state        categ     prob     impa       sever     mitiga     trigg     own      statu    impact      note
i    ment          ory      abili     ct         ity      tion_p     er_si      er        s      ed_refs      s
s                            ty                             lan      gnals
k
_
i
d

r   {{risks[      {{risks   {{risk   {{risk     {{risks   {{risks[   {{risks   {{risk   {{risk   {{risks[0   {{risk
_   0].stat       [0].cat   s[0].    s[0].i     [0].se    0].miti    [0].tri   s[0].o   s[0].s   ].impact    s[0].
0   ement         egory}    prob     mpac       verity}   gation}    ggers     wner}    tatus    ed_refs}    note
1   }}            }         }}       t}}        }         }          }}        }        }}       }           s}}


2) Top Risks (required)

    ●​ {{derive:TOP_RISKS(risks, 5)}} | OPTIONAL

3) Accepted Risks (optional)
         risk_id                              rationale              approver_or_decision_ref
{{accepted[0].risk_id}}   {{accepted[0].rationale}}   {{accepted[0].approval_ref}}


Cross-References
  ●​ Upstream: {{xref:RISK-01}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL, {{xref:RSC-01}} |
     OPTIONAL
  ●​ Downstream: {{xref:IMP-01}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL,
     {{xref:SEC-01}} | OPTIONAL, {{xref:STK-02}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. 10 risks with mitigation + owner.
  ●​ intermediate: Required. Add triggers and impacted refs.
  ●​ advanced: Required. Add accepted risk approvals and residual risk notes.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: contingency_plan, residual_risk, links, notes
  ●​ If mitigation_plan is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RISK
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ risks_count >= 10
        ○​ every_risk_has_mitigation == true
        ○​ top_risks_have_triggers == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
