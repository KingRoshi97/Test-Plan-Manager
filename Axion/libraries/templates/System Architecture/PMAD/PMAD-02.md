PMAD-02
PMAD-02 — AuthZ Policy Rules
(RBAC/ABAC, inheritance, exceptions)
Header Block
   ●​ template_id: PMAD-02​

   ●​ title: AuthZ Policy Rules (RBAC/ABAC, inheritance, exceptions)​

   ●​ type: permission_model_authorization_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/authz/PMAD-02_AuthZ_Policy_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.AUTHZ​

   ●​ upstream_dependencies: ["PMAD-01", "BRP-02", "BRP-04"]​

   ●​ inputs_required: ["PMAD-01", "BRP-02", "BRP-04", "ERR-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the actual authorization policy rules: what roles can perform which actions on which
resources, what ABAC conditions apply, how inheritance works, and how exceptions are
handled. This is the enforceable ruleset used by all authz enforcement points.


Inputs Required
   ●​ PMAD-01: {{xref:PMAD-01}}​

   ●​ BRP-02: {{xref:BRP-02}} | OPTIONAL​

   ●​ BRP-04: {{xref:BRP-04}} | OPTIONAL​
  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Policy rules list (minimum 25 for non-trivial products)​

  ●​ For each rule:​

         ○​ policy_id​

         ○​ role_id(s)​

         ○​ resource_id​

         ○​ action_id(s)​

         ○​ conditions (ABAC predicates)​

         ○​ allow/deny outcome​

         ○​ priority/order (if multiple match)​

         ○​ exception hooks (break-glass/admin override) (if any)​

         ○​ reason_code on deny (rc_*)​

         ○​ audit requirement (yes/no + event type)​

  ●​ Inheritance rules (if role hierarchy exists)​

  ●​ Conflict resolution rules (what happens if allow and deny both match)​



Optional Fields
  ●​ Policy grouping by domain/boundary | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
     ●​ Denies must be explicit when needed; define precedence rules.​

     ●​ Every deny must map to a reason_code or policy fallback reason.​

     ●​ Exception hooks must be auditable and time-bound if possible.​

     ●​ Conditions vocabulary must match PMAD-01; no ad-hoc predicates.​



Output Format
1) Policy Rules (canonical)
p      roles    resour     action     conditi     outco      priorit   excepti   deny_      audit     notes
ol                ce         s         ons         me           y      on_ho     reaso      _requ
ic                                                                       ok      n_cod       ired
 y                                                                                 e
_i
d

p     {{polic   {{polici   {{polici   {{policie   {{polici   {{polici {{polici   {{polici   {{polic   {{polic
ol    ies[0].   es[0].r    es[0].a    s[0].con    es[0].o    es[0].p es[0].e     es[0].d    ies[0].   ies[0].
_     roles}    esourc     ctions}    ditions}    utcom      riority}} xceptio   eny_rc     audit}    notes}
0     }         e}}        }          }           e}}                  n}}       }}         }         }
0
1

p     {{polic   {{polici   {{polici   {{policie   {{polici   {{polici {{polici   {{polici   {{polic   {{polic
ol    ies[1].   es[1].r    es[1].a    s[1].con    es[1].o    es[1].p es[1].e     es[1].d    ies[1].   ies[1].
_     roles}    esourc     ctions}    ditions}    utcom      riority}} xceptio   eny_rc     audit}    notes}
0     }         e}}        }          }           e}}                  n}}       }}         }         }
0
2


2) Inheritance Rules (required if hierarchy exists)

     ●​ Role inheritance model: {{inheritance.model}} | OPTIONAL​

     ●​ Inherited permissions behavior: {{inheritance.behavior}} | OPTIONAL​
  ●​ Override rules: {{inheritance.override}} | OPTIONAL​



3) Conflict Resolution (required)

  ●​ Deny vs allow precedence: {{conflict.precedence}}​

  ●​ Priority ordering rule: {{conflict.priority_rule}}​

  ●​ Fallback deny reason: {{conflict.fallback_reason_code}} | OPTIONAL​



4) Exception Hooks (required if any)
 hook   who_can_u            scope            time_bound          audit_event           notes
  _id      se

exho    {{exceptions[    {{exceptions[     {{exceptions[0].ti   {{exceptions[0].a   {{exceptions[
ok_0    0].who}}         0].scope}}        me_bound}}           udit_event}}        0].notes}}
1


Cross-References
  ●​ Upstream: {{xref:PMAD-01}} | OPTIONAL, {{xref:BRP-02}} | OPTIONAL​

  ●​ Downstream: {{xref:PMAD-03}}, {{xref:PMAD-04}} | OPTIONAL, {{xref:ERR-02}} |
     OPTIONAL, {{xref:AUDIT-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Policy table with roles/resources/actions and outcomes.​

  ●​ intermediate: Required. Add conditions, deny reason codes, and audit flags.​

  ●​ advanced: Required. Add conflict resolution, inheritance, and exception hook details.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: policy_grouping, inheritance_rules (if none),
    exception_hooks (if none), notes​

 ●​ If any deny outcome lacks deny_reason_code → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.AUTHZ​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ policies_count >= 25​

        ○​ deny_reason_codes_present == true​

        ○​ conflict_resolution_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
