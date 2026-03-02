PMAD-03
PMAD-03 — Enforcement Points Map
(UI/API/service/DB)
Header Block
   ●​ template_id: PMAD-03​

   ●​ title: Enforcement Points Map (UI/API/service/DB)​

   ●​ type: permission_model_authorization_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/authz/PMAD-03_Enforcement_Points_Map.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.AUTHZ​

   ●​ upstream_dependencies: ["PMAD-02", "ARC-01", "API-01", "DATA-01"]​

   ●​ inputs_required: ["PMAD-02", "ARC-01", "API-01", "DATA-01", "IAN-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define where authorization is enforced across the stack: UI gating, API gateway checks,
service-layer checks, and data-layer guards. This prevents “security gaps” where a permission
is enforced in one layer but bypassable in another.


Inputs Required
   ●​ PMAD-02: {{xref:PMAD-02}} | OPTIONAL​

   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​

   ●​ API-01: {{xref:API-01}} | OPTIONAL​
  ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

  ●​ IAN-05: {{xref:IAN-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Enforcement layer definitions (UI/API/service/DB)​

  ●​ Enforcement point inventory (minimum 20 for non-trivial products)​

  ●​ For each enforcement point:​

         ○​ ep_id​

         ○​ layer (ui/api/service/db)​

         ○​ resource_id​

         ○​ action_id(s)​

         ○​ where_in_code (module/route/service name) | OPTIONAL placeholder​

         ○​ decision function (policy check method)​

         ○​ required inputs (subject, resource, context)​

         ○​ deny behavior (status, reason_code, UX surface pointer)​

         ○​ logging/audit requirement​

         ○​ test requirement (unit/contract/e2e)​

  ●​ Consistency rule: API and service enforcement cannot rely on UI-only checks​

  ●​ Coverage check: every PMAD-02 policy appears in at least one enforcement point​



Optional Fields
      ●​ Caching policy for authz decisions | OPTIONAL​

      ●​ Notes | OPTIONAL​



Rules
      ●​ UI gating is for UX only; real enforcement must occur server-side.​

      ●​ DB-level guards (if used) must align with service-level policies; do not create conflicting
         logic.​

      ●​ Deny responses must map to reason codes and avoid leakage.​

      ●​ Each enforcement point must specify test coverage expectation.​



Output Format
1) Layer Rules (required)

      ●​ UI: {{layers.ui_rule}}​

      ●​ API: {{layers.api_rule}}​

      ●​ Service: {{layers.service_rule}}​

      ●​ DB: {{layers.db_rule}} | OPTIONAL​



2) Enforcement Points Inventory (canonical)
 e      layer    resour     action     decisio    requir    deny     audit    test_    code_r     notes
 p                 ce         s        n_met      ed_in     _beh     _requ    type       ef
 _i                                     hod        puts     avior     ired
 d

e      {{eps[    {{eps[0]   {{eps[0    {{eps[0]   {{eps[    {{eps[   {{eps[   {{eps    {{eps[0]   {{eps[
p      0].lay    .resour    ].action   .decisio   0].inpu   0].den   0].aud   [0].te   .code_r    0].not
_      er}}      ce}}       s}}        n}}        ts}}      y}}      it}}     st}}     ef}}       es}}
0
0
1
e    {{eps[   {{eps[1]      {{eps[1    {{eps[1]   {{eps[    {{eps[   {{eps[   {{eps    {{eps[1]   {{eps[
p    1].lay   .resour       ].action   .decisio   1].inpu   1].den   1].aud   [1].te   .code_r    1].not
_    er}}     ce}}          s}}        n}}        ts}}      y}}      it}}     st}}     ef}}       es}}
0
0
2


3) Coverage Check (required)
         policy_id              has_enforcement_poin                   ep_ids
                                          t

{{policies[0].policy_id}}       {{coverage[0].covered}}       {{coverage[0].ep_ids}}


4) Server-Side Guarantee Statement (required)

    ●​ Server-side enforcement required for all restricted actions:
       {{guarantees.server_side_required}}​

    ●​ UI-only checks are non-authoritative: {{guarantees.ui_non_authoritative}}​



Cross-References
    ●​ Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:IAN-05}} | OPTIONAL​

    ●​ Downstream: {{xref:PMAD-04}}, {{xref:PMAD-06}} | OPTIONAL, {{xref:QA-02}} |
       OPTIONAL, {{xref:TINF-*}} | OPTIONAL​

    ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
    ●​ beginner: Required. Inventory + layer rules + deny behavior.​

    ●​ intermediate: Required. Add audit/test expectations and policy coverage check.​

    ●​ advanced: Required. Add caching policy and DB guard alignment (if used).​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: code_ref, caching_policy, notes, db_layer (if not
    used)​

 ●​ If coverage check shows missing policies → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.AUTHZ​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ enforcement_points_count >= 20​

        ○​ coverage_complete_for_policies == true​

        ○​ deny_behavior_defined == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
