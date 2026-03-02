APIG-02
APIG-02 — Versioning Policy (v1/v2 rules,
compat guarantees)
Header Block
   ●​ template_id: APIG-02​

   ●​ title: Versioning Policy (v1/v2 rules, compat guarantees)​

   ●​ type: api_governance_versioning​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/api_governance/APIG-02_Versioning_Policy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.APIG​

   ●​ upstream_dependencies: ["APIG-01", "ARC-02"]​

   ●​ inputs_required: ["APIG-01", "ARC-02", "STK-04", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the API versioning and compatibility guarantees: what constitutes a breaking change,
how versions are expressed, how clients migrate, and what rules govern forward/backward
compatibility.


Inputs Required
   ●​ APIG-01: {{xref:APIG-01}} | OPTIONAL​

   ●​ ARC-02: {{xref:ARC-02}} | OPTIONAL​

   ●​ STK-04: {{xref:STK-04}} | OPTIONAL​
  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Versioning scheme:​

         ○​ path-based (/v1)​

         ○​ header-based​

         ○​ query-based (discouraged)​

  ●​ Compatibility guarantees (what is safe to change)​

  ●​ Breaking change definition list​

  ●​ Allowed non-breaking changes list​

  ●​ Client migration policy:​

         ○​ how clients discover versions​

         ○​ how long old versions supported​

  ●​ Version ownership + approval (who can bump versions)​

  ●​ Version sunset/deprecation pointer (APIG-03)​



Optional Fields
  ●​ Mobile app compatibility notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ No breaking changes in-place on a stable version.​
  ●​ Version bump requires compatibility tests (APIG-05) and review gate (APIG-04).​

  ●​ Old versions must have explicit sunset timelines.​

  ●​ Any version scheme must be deterministic and documented.​



Output Format
1) Versioning Scheme (required)

  ●​ Primary scheme: {{version.scheme}}​

  ●​ Secondary scheme (if any): {{version.secondary}} | OPTIONAL​

  ●​ Where version is expressed: {{version.location}}​



2) Breaking Changes (required)

  ●​ {{breaking[0]}}​

  ●​ {{breaking[1]}}​

  ●​ {{breaking[2]}} | OPTIONAL​



3) Non-Breaking Changes (required)

  ●​ {{nonbreaking[0]}}​

  ●​ {{nonbreaking[1]}}​

  ●​ {{nonbreaking[2]}} | OPTIONAL​



4) Compatibility Guarantees (required)

  ●​ Backward compatibility promise: {{compat.backward_promise}}​

  ●​ Forward compatibility promise: {{compat.forward_promise}} | OPTIONAL​

  ●​ Schema evolution stance: {{compat.schema_evolution}} | OPTIONAL​
5) Client Migration Policy (required)

   ●​ Discovery method: {{migration.discovery}}​

   ●​ Support window: {{migration.support_window}}​

   ●​ Upgrade guidance: {{migration.guidance}} | OPTIONAL​



6) Ownership + Approval (required)

   ●​ Owner: {{ownership.owner}}​

   ●​ Approval gate: {{ownership.approval_gate}} | OPTIONAL​

   ●​ Decision log pointer: {{xref:STK-04}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:APIG-01}} | OPTIONAL​

   ●​ Downstream: {{xref:APIG-03}}, {{xref:APIG-04}}, {{xref:APIG-05}}, {{xref:APIG-06}} |
      OPTIONAL​

   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Scheme + breaking definition + support window.​

   ●​ intermediate: Required. Add compatibility guarantees and migration policy.​

   ●​ advanced: Required. Add ownership/approval and schema evolution stance.​



Unknown Handling
   ●​ UNKNOWN_ALLOWED: mobile_notes, secondary_scheme, notes​
 ●​ If breaking change definition is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.APIG​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ versioning_scheme_present == true​

        ○​ breaking_changes_present == true​

        ○​ migration_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
