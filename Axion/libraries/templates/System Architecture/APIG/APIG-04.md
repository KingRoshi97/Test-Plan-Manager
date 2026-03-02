APIG-04
APIG-04 — Review Gate Checklist (what
must be true before shipping APIs)
Header Block
   ●​ template_id: APIG-04​

   ●​ title: Review Gate Checklist (what must be true before shipping APIs)​

   ●​ type: api_governance_versioning​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/api_governance/APIG-04_Review_Gate_Checklist.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.APIG​

   ●​ upstream_dependencies: ["APIG-01", "ERR-03", "PMAD-03", "QA-05"]​

   ●​ inputs_required: ["APIG-01", "ERR-03", "PMAD-03", "QA-05", "SEC-02", "RLIM-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the mandatory checklist that must pass before an API (endpoint group or version) can
ship. This is the quality/gov gate that enforces consistency, security, compatibility, and test
coverage.


Inputs Required
   ●​ APIG-01: {{xref:APIG-01}} | OPTIONAL​

   ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​

   ●​ PMAD-03: {{xref:PMAD-03}} | OPTIONAL​
  ●​ QA-05: {{xref:QA-05}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ RLIM-01: {{xref:RLIM-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Checklist categories:​

         ○​ spec completeness​

         ○​ security/authz​

         ○​ error contract​

         ○​ pagination/filtering​

         ○​ rate limits​

         ○​ observability​

         ○​ testing​

         ○​ compatibility/versioning​

  ●​ Checklist items (minimum 35)​

  ●​ For each item:​

         ○​ check_id​

         ○​ statement​

         ○​ pass condition (objective)​

         ○​ evidence required (link/pointer)​

  ●​ Failure handling (what happens if a check fails)​
   ●​ Waiver/exception policy (if allowed)​



Optional Fields
   ●​ Review roles (who reviews) | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Checklist items must be testable/verifiable.​

   ●​ Exceptions (if allowed) must be time-bound and recorded.​

   ●​ No shipping if authz enforcement is missing.​

   ●​ Compatibility checks required for stable APIs.​



Output Format
1) Checklist (required, min 35)

   ●​ {{checks[0].statement}} — evidence: {{checks[0].evidence}} | OPTIONAL​

   ●​ {{checks[1].statement}} — evidence: {{checks[1].evidence}} | OPTIONAL​

   ●​ {{checks[2].statement}} — evidence: {{checks[2].evidence}} | OPTIONAL​

   ●​ {{checks[3].statement}} — evidence: {{checks[3].evidence}} | OPTIONAL​

   ●​ {{checks[4].statement}} — evidence: {{checks[4].evidence}} | OPTIONAL​



2) Failure Handling (required)

   ●​ If any check fails: {{failure.if_fail}}​

   ●​ Escalation path: {{failure.escalation}} | OPTIONAL​
3) Waiver Policy (required)

  ●​ Waivers allowed: {{waiver.allowed}}​

  ●​ Required fields for waiver: {{waiver.fields}}​

  ●​ Approval required: {{waiver.approval}}​

  ●​ Time-bound rule: {{waiver.time_bound}}​



Cross-References
  ●​ Upstream: {{xref:APIG-01}} | OPTIONAL, {{xref:PMAD-03}} | OPTIONAL,
     {{xref:ERR-03}} | OPTIONAL​

  ●​ Downstream: {{xref:APIG-05}}, {{xref:REL-01}} | OPTIONAL, {{xref:RELOPS-05}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Checklist with core categories (authz, errors, tests).​

  ●​ intermediate: Required. Add pass conditions and evidence requirements.​

  ●​ advanced: Required. Add waiver governance and escalation paths.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: review_roles, notes, escalation_path​

  ●​ If waiver policy allows unlimited waivers → block Completeness Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.APIG​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ checklist_count >= 35​

       ○​ waiver_policy_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
