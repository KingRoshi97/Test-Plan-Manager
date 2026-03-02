BRP-02
BRP-02 — Eligibility & Entitlement Rules
Header Block
   ●​   template_id: BRP-02
   ●​   title: Eligibility & Entitlement Rules
   ●​   type: business_rules_policy
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/policy/BRP-02_Eligibility_Entitlements.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.POLICY
   ●​   upstream_dependencies: ["BRP-01", "PRD-03"]
   ●​   inputs_required: ["BRP-01", "PRD-03", "PRD-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Specify who is eligible for what and what entitlements they receive (features, limits,
permissions). This is the canonical source for gating capabilities (often used by IAM,
PAY/REVOPS, and UI/UX).


Inputs Required
   ●​   BRP-01: {{xref:BRP-01}}
   ●​   PRD-03: {{xref:PRD-03}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Plan/tier notes: {{inputs.tier_notes}} | OPTIONAL


Required Fields
   ●​ Eligibility criteria list (minimum 5)
   ●​ Entitlement catalog (minimum 10 entitlements)
   ●​ Mapping matrix:
          ○​ role/persona/tier → entitlements
   ●​ For each eligibility rule:
          ○​ elig_id
          ○​ statement
          ○​ evaluated_inputs
          ○​ decision_output (eligible/ineligible + reason)
           ○​ enforcement_points
           ○​ exceptions
     ●​ For each entitlement:
           ○​ ent_id
           ○​ entitlement_name
           ○​ description
           ○​ scope (feature/limit/permission)
           ○​ related_feature_ids
           ○​ limit_value (if applicable)
           ○​ enforcement_points
           ○​ audit_event (if applicable)


Optional Fields
     ●​ Trial rules | OPTIONAL
     ●​ Grace periods | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ Any eligibility/entitlement must be enforceable at API level (even if also enforced in UI).
     ●​ If tiers exist, entitlements must be deterministic by tier.
     ●​ Limit entitlements must declare units (e.g., per day, per month, per org).


Output Format
1) Eligibility Rules (canonical)
 elig     statement        evaluated       output      enforcement_        exceptions         notes
 _id                        _inputs                       points

elig     {{elig[0].state   {{elig[0].inp {{elig[0].out {{elig[0].enforc   {{elig[0].excep   {{elig[0].no
_01      ment}}            uts}}         put}}         ement}}            tions}}           tes}}


2) Entitlements Catalog (canonical)
e       name     scope      descri   feature_i    limit_    units    enforcem      audit_ev     notes
nt                          ption       ds        value              ent_point       ent
_i                                                                       s
d
e      {{ents[   {{ents[   {{ents[    {{ents[0].f   {{ents[    {{ents[   {{ents[0].e   {{ents[0].   {{ents[
nt     0].nam    0].scop   0].des     eature_id     0].limit   0].unit   nforceme      audit_eve    0].note
_      e}}       e}}       c}}        s}}           }}         s}}       nt}}          nt}}         s}}
0
1


3) Eligibility/Entitlement Mapping (required)
     subject_type                    subject_id           granted_entitlement_id              notes
  (role/tier/persona)                                               s

role                        {{map[0].subject_id}}         {{map[0].ent_ids}}            {{map[0].notes}}


4) Open Questions (optional)

     ●​ {{open_questions[0]}} | OPTIONAL


Cross-References
     ●​ Upstream: {{xref:BRP-01}}, {{xref:PRD-03}} | OPTIONAL
     ●​ Downstream: {{xref:IAM-03}} | OPTIONAL, {{xref:REVOPS-01}} | OPTIONAL,
        {{xref:API-04}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL
     ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
     ●​ beginner: Required. Define entitlements + who gets them.
     ●​ intermediate: Required. Add enforcement points and units for limits.
     ●​ advanced: Required. Add audit_event mapping and exception handling.


Unknown Handling
     ●​ UNKNOWN_ALLOWED: exceptions, trial_rules, grace_periods,
        audit_event, open_questions
     ●​ If any entitlement has UNKNOWN scope or enforcement_points → block Completeness
        Gate.


Completeness Gate
     ●​ Gate ID: TMP-05.PRIMARY.POLICY
     ●​ Pass conditions:
○​   required_fields_present == true
○​   eligibility_rules_count >= 5
○​   entitlements_count >= 10
○​   mapping_present == true
○​   placeholder_resolution == true
○​   no_unapproved_unknowns == true
