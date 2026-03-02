RISK-01
RISK-01 — Assumptions Register
Header Block
   ●​   template_id: RISK-01
   ●​   title: Assumptions Register
   ●​   type: risk_assumptions
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/risk/RISK-01_Assumptions_Register.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.RISK
   ●​   upstream_dependencies: ["PRD-01", "PRD-02", "PRD-06", "URD-01"]
   ●​   inputs_required: ["PRD-01", "PRD-02", "PRD-06", "URD-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Maintain the canonical list of assumptions the product/build depends on, including validation
plans and timelines. Assumptions are not constraints; they are beliefs that must be tested or
monitored.


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   PRD-06: {{xref:PRD-06}} | OPTIONAL
   ●​   URD-01: {{xref:URD-01}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Assumptions list (minimum 10 for non-trivial products)
   ●​ For each assumption:
         ○​ assumption_id
         ○​ statement
         ○​ category (market/user/tech/ops/legal/financial)
         ○​ why_it_matters
         ○​ risk_if_false
         ○​ validation_plan
         ○​ validate_by (date or milestone) (or UNKNOWN)
            ○​    owner
            ○​    status (unvalidated/validated/invalidated/monitoring)
            ○​    evidence (if validated) | OPTIONAL
            ○​    impacted_feature_ids / domains / docs


Optional Fields
     ●​ Monitoring signals | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ Each assumption must have a validation_plan (no exceptions).
     ●​ If status is validated/invalidated, evidence must be present.
     ●​ If validate_by is UNKNOWN, include a mitigation note.


Output Format
1) Assumptions Register (canonical)
as     statem      categ     why_    risk_     valid    validat     owne     statu    eviden     impacte
su       ent        ory      it_m    if_fal    ation     e_by         r        s        ce        d_refs
m                            atter     se      _pla
pti                            s                 n
on
_i
 d

a_     {{assu      {{assu    {{ass   {{ass     {{ass    {{assu      {{assu   {{assu   {{assu     {{assum
01     mption      mption    umpti   umpti     umpti    mptions     mptio    mptio    mption     ptions[0]
       s[0].sta    s[0].ca   ons[0   ons[0     ons[0    [0].valid   ns[0].   ns[0].   s[0].evi   .impacte
       tement      tegory}   ].why   ].risk}   ].plan   ate_by}     owner    status   dence}     d_refs}}
       }}          }         }}      }         }}       }           }}       }}       }

a_     {{assu      {{assu    {{ass   {{ass     {{ass    {{assu      {{assu   {{assu   {{assu     {{assum
02     mption      mption    umpti   umpti     umpti    mptions     mptio    mptio    mption     ptions[1]
       s[1].sta    s[1].ca   ons[1   ons[1     ons[1    [1].valid   ns[1].   ns[1].   s[1].evi   .impacte
       tement      tegory}   ].why   ].risk}   ].plan   ate_by}     owner    status   dence}     d_refs}}
       }}          }         }}      }         }}       }           }}       }}       }


2) Status Summary (required)

     ●​ unvalidated: {{summary.unvalidated_count}}
  ●​ validated: {{summary.validated_count}}
  ●​ invalidated: {{summary.invalidated_count}}
  ●​ monitoring: {{summary.monitoring_count}}

3) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL,
     {{xref:URD-01}} | OPTIONAL
  ●​ Downstream: {{xref:URD-05}} | OPTIONAL, {{xref:RISK-02}}, {{xref:STK-02}} |
     OPTIONAL, {{xref:IMP-01}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. 10 assumptions with validation plans.
  ●​ intermediate: Required. Add validate_by + impacted_refs.
  ●​ advanced: Required. Add monitoring signals and evidence trails.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: validate_by (must include mitigation),
     monitoring_signals, open_questions
  ●​ If validation_plan is UNKNOWN → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RISK
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ assumptions_count >= 10
        ○​ every_assumption_has_validation_plan == true
        ○​ validated_or_invalidated_have_evidence == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
