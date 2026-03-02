PMAD-01
PMAD-01 — Permission Model Overview
(roles, resources, actions)
Header Block
   ●​ template_id: PMAD-01​

   ●​ title: Permission Model Overview (roles, resources, actions)​

   ●​ type: permission_model_authorization_design​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/authz/PMAD-01_Permission_Model_Overview.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.AUTHZ​

   ●​ upstream_dependencies: ["PRD-03", "BRP-02", "DMG-02", "ARC-04"]​

   ●​ inputs_required: ["PRD-03", "BRP-02", "DMG-02", "IAM-03", "ARC-04", "STK-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical permission model: roles, resources, actions, and high-level policy
principles. This is the system-wide authorization vocabulary and structure that all enforcement
points must follow.


Inputs Required
   ●​ PRD-03: {{xref:PRD-03}} | OPTIONAL​

   ●​ BRP-02: {{xref:BRP-02}} | OPTIONAL​

   ●​ DMG-02: {{xref:DMG-02}} | OPTIONAL​
  ●​ IAM-03: {{xref:IAM-03}} | OPTIONAL​

  ●​ ARC-04: {{xref:ARC-04}} | OPTIONAL​

  ●​ STK-01: {{xref:STK-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Role model:​

         ○​ role_id list (canonical)​

         ○​ role descriptions​

         ○​ role hierarchy/inheritance rules (if any)​

  ●​ Resource model:​

         ○​ resource_id list (canonical)​

         ○​ resource ownership/tenancy rules (org/user scoped)​

  ●​ Action model:​

         ○​ action_id list (canonical verbs: read/create/update/delete/approve/moderate/etc.)​

         ○​ action semantics (what each means)​

  ●​ Permission expression model (how rules are written):​

         ○​ RBAC and/or ABAC statement​

         ○​ conditions vocabulary (owner, org_member, scope, status, etc.)​

  ●​ Default-deny policy statement​

  ●​ System-wide constraints:​

         ○​ least privilege​
           ○​ separation of duties (if applicable)​

           ○​ sensitive operation classification​



Optional Fields
   ●​ Multi-tenant model notes | OPTIONAL​

   ●​ “Guest/Visitor” access rules | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Do not invent roles/resources/actions that conflict with PRD-03/DMG.​

   ●​ Every permission rule must be expressible using the defined action/resource vocabulary.​

   ●​ Default-deny applies when policy cannot be evaluated.​

   ●​ Sensitive operations must require explicit permissions and audit logging.​



Output Format
1) Roles (canonical)
    role_id            name              description           inherits_from              notes

{{roles[0].id}}   {{roles[0].name}}    {{roles[0].desc}}    {{roles[0].inherits}}   {{roles[0].notes}}

{{roles[1].id}}   {{roles[1].name}}    {{roles[1].desc}}    {{roles[1].inherits}}   {{roles[1].notes}}


2) Resources (canonical)
 resource_id       description            scope                tenancy_key                notes
                                      (user/org/globa
                                             l)

{{resources[0] {{resources[0].d {{resources[0].s           {{resources[0].tenanc    {{resources[0].n
.id}}          esc}}            cope}}                     y_key}}                  otes}}
3) Actions (canonical)
 action_i         description                    notes
    d

read        {{actions.read.desc}}      {{actions.read.notes}}

create      {{actions.create.desc}}    {{actions.create.notes}}

update      {{actions.update.desc}}    {{actions.update.notes}}

delete      {{actions.delete.desc}}    {{actions.delete.notes}}


4) Permission Expression Model (required)

  ●​ Model type: {{policy.model_type}} (RBAC/ABAC/hybrid)​

  ●​ Condition vocabulary: {{policy.conditions}}​

  ●​ Example rule form: {{policy.example_rule_form}} | OPTIONAL​

  ●​ Default deny statement: {{policy.default_deny}}​



5) System-wide Constraints (required)

  ●​ Least privilege: {{constraints.least_privilege}}​

  ●​ Separation of duties: {{constraints.sod}} | OPTIONAL​

  ●​ Sensitive operation classification: {{constraints.sensitive_ops}}​



Cross-References
  ●​ Upstream: {{xref:PRD-03}} | OPTIONAL, {{xref:BRP-02}} | OPTIONAL, {{xref:IAM-03}} |
     OPTIONAL​

  ●​ Downstream: {{xref:PMAD-02}}, {{xref:PMAD-03}}, {{xref:PMAD-05}} | OPTIONAL,
     {{xref:ERR-04}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​
Skill Level Requiredness Rules
  ●​ beginner: Required. Roles/resources/actions tables + default deny.​

  ●​ intermediate: Required. Add expression model and scope/tenancy rules.​

  ●​ advanced: Required. Add sensitive ops classification and separation of duties (if used).​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: role_inheritance, multi_tenant_notes,
     guest_access_rules, notes​

  ●​ If default_deny policy is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.AUTHZ​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ roles_resources_actions_present == true​

         ○​ expression_model_present == true​

         ○​ default_deny_defined == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true​
