PMAD-05
PMAD-05 — Privileged Operations Policy
(admin/mod/support actions, approvals)
Header Block
   ●​ template_id: PMAD-05​

   ●​ title: Privileged Operations Policy (admin/mod/support actions, approvals)​

   ●​ type: permission_model_authorization_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/authz/PMAD-05_Privileged_Operations_Policy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.AUTHZ​

   ●​ upstream_dependencies: ["PMAD-01", "PMAD-02", "ADMIN-01", "AUDIT-01"]​

   ●​ inputs_required: ["PMAD-01", "PMAD-02", "ADMIN-01", "AUDIT-01", "STK-04",
      "DGP-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the policy for privileged operations (admin/mod/support): what actions are privileged,
who can perform them, what approvals are required, what safeguards apply (2-person rule,
time-bound access), and what must be audited.


Inputs Required
   ●​ PMAD-01: {{xref:PMAD-01}} | OPTIONAL​

   ●​ PMAD-02: {{xref:PMAD-02}} | OPTIONAL​

   ●​ ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL​
  ●​ AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL​

  ●​ STK-04: {{xref:STK-04}} | OPTIONAL​

  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Privileged action catalog (minimum 15)​

  ●​ For each privileged action:​

         ○​ priv_action_id​

         ○​ action description​

         ○​ resource scope (what it affects)​

         ○​ who can execute (role/tier)​

         ○​ approval required (none/1-step/2-person/manager/legal)​

         ○​ justification required (yes/no + fields)​

         ○​ time-bound requirement (yes/no + duration)​

         ○​ audit event name​

         ○​ data sensitivity (PII level)​

         ○​ UI surface where performed (admin console) | OPTIONAL​

         ○​ emergency override allowed (yes/no) + rules​

  ●​ Break-glass policy (when/why/how)​

  ●​ Post-action review requirements (spot checks, approvals)​

  ●​ Deny behaviors + reason codes policy​
Optional Fields
  ●​ Training requirement | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ All privileged operations must be auditable with before/after context (redacted).​

  ●​ If break-glass exists, it must be time-bound and reviewed.​

  ●​ High-PII operations require stricter approvals and minimum exposure.​

  ●​ Privileged actions must have explicit deny reason codes and consistent UX messaging.​



Output Format
1) Privileged Action Catalog (canonical)
priv desc      scop     exec     appro     justific     time_b     audit_e    pii_l    emerg     note
_ac riptio       e      utor_     val      ation_fi      ound       vent      evel     ency_      s
tion  n                 roles                elds                                      overri
 _id                                                                                    de

pa_   {{acti   {{acti   {{acti   {{actio   {{action     {{action   {{action   {{acti   {{actio   {{acti
01    ons[0    ons[0]   ons[0    ns[0].a   s[0].justi   s[0].tim   s[0].aud   ons[     ns[0].o   ons[0
      ].des    .scop    ].role   pprova    fication}    e_boun     it_event   0].pii   verride   ].note
      c}}      e}}      s}}      l}}       }            d}}        }}         }}       }}        s}}

pa_   {{acti   {{acti   {{acti   {{actio   {{action     {{action   {{action   {{acti   {{actio   {{acti
02    ons[1    ons[1]   ons[1    ns[1].a   s[1].justi   s[1].tim   s[1].aud   ons[     ns[1].o   ons[1
      ].des    .scop    ].role   pprova    fication}    e_boun     it_event   1].pii   verride   ].note
      c}}      e}}      s}}      l}}       }            d}}        }}         }}       }}        s}}


2) Break-Glass Policy (required)

  ●​ When allowed: {{breakglass.when_allowed}}​

  ●​ Who can invoke: {{breakglass.who}}​
  ●​ Time bound duration: {{breakglass.duration}}​

  ●​ Required justification: {{breakglass.justification}}​

  ●​ Required review after: {{breakglass.post_review}}​

  ●​ Logging requirements: {{breakglass.logging}}​



3) Approval Workflow Rules (required)

  ●​ Default approval path: {{approvals.default_path}}​

  ●​ 2-person rule conditions: {{approvals.two_person_conditions}} | OPTIONAL​

  ●​ Denial/timeout handling: {{approvals.denial_handling}} | OPTIONAL​



4) Post-Action Review (required)

  ●​ Review cadence: {{review.cadence}}​

  ●​ Sample size rule: {{review.sample_size}} | OPTIONAL​

  ●​ Who reviews: {{review.owner}}​

  ●​ Escalation rules: {{review.escalation}} | OPTIONAL​



5) Deny Behavior + Reason Codes (required)

  ●​ Deny reason_code source: {{xref:ERR-02}} | OPTIONAL​

  ●​ UX copy pointer: {{xref:CDX-04}} | OPTIONAL​

  ●​ Default deny reason_code: {{deny.default_rc}}​



Cross-References
  ●​ Upstream: {{xref:ADMIN-01}} | OPTIONAL, {{xref:AUDIT-01}} | OPTIONAL,
     {{xref:STK-04}} | OPTIONAL​
  ●​ Downstream: {{xref:PMAD-06}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL,
     {{xref:SECOPS-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Catalog + break-glass + audit event requirement.​

  ●​ intermediate: Required. Add approval workflows and post-action review rules.​

  ●​ advanced: Required. Add PII sensitivity policies and emergency override controls.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: training_requirement, notes, sample_size_rule,
     two_person_conditions​

  ●​ If any privileged action lacks audit_event or approval rule → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.AUTHZ​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ privileged_actions_count >= 15​

         ○​ break_glass_policy_present == true​

         ○​ approvals_defined == true​

         ○​ audit_events_defined == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
