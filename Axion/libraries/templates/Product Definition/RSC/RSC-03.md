RSC-03
RSC-03 — Prioritization Framework
(method + scoring)
Header Block
   ●​   template_id: RSC-03
   ●​   title: Prioritization Framework (method + scoring)
   ●​   type: roadmap_scope
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/roadmap/RSC-03_Prioritization_Framework.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.SCOPE
   ●​   upstream_dependencies: ["PRD-04", "URD-03", "PRD-02"]
   ●​   inputs_required: ["PRD-04", "URD-03", "PRD-02", "RISK-02", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": false}


Purpose
Define the repeatable method used to prioritize features and scope decisions (e.g.,
RICE/ICE/WSJF/custom). This makes prioritization explainable, consistent, and auditable.


Inputs Required
   ●​   PRD-04: {{xref:PRD-04}}
   ●​   URD-03: {{xref:URD-03}} | OPTIONAL
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   RISK-02: {{xref:RISK-02}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​   Selected method name
   ●​   Score factors (3–8)
   ●​   Scoring rules (scale definitions)
   ●​   Weighting (if any)
   ●​   Tie-break rules
   ●​   Example scored items (minimum 5 features)
Optional Fields
   ●​ Persona/segment weighting | OPTIONAL
   ●​ Risk adjustment | OPTIONAL
   ●​ Notes | OPTIONAL


Rules
   ●​ If scoring features, only use feature IDs from PRD-04.
   ●​ The framework must be usable without subjective ambiguity (define scales).
   ●​ If weights are used, they must sum to 1.0 or 100.


Output Format
1) Method

   ●​ Method name: {{prior.method}}
   ●​ Why this method: {{prior.rationale}} | OPTIONAL

2) Factors & Scales (required)
 factor_i           name              description               scale                  weight
    d

f_01         {{factors[0].name}}   {{factors[0].desc}}   {{factors[0].scale}}   {{factors[0].weight}}

f_02         {{factors[1].name}}   {{factors[1].desc}}   {{factors[1].scale}}   {{factors[1].weight}}


3) Tie-break Rules (required)

   ●​ {{prior.tie_break[0]}}
   ●​ {{prior.tie_break[1]}} | OPTIONAL

4) Scored Features (required, min 5)
       feature_id           feature_name          factor_scores       total_score         notes

{{spec.features_by_     {{spec.features_by_id     {{scores[feat_x {{scores[feat       {{scores[feat_
id[feat_x].id}}         [feat_x].name}}           ].factors}}     _x].total}}         x].notes}}


Cross-References
  ●​ Upstream: {{xref:PRD-04}}, {{xref:URD-03}} | OPTIONAL
  ●​ Downstream: {{xref:RSC-01}}, {{xref:IMP-01}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Simple method with defined scales.
  ●​ intermediate: Required. Add weights and tie-break rules.
  ●​ advanced: Not required. (Advanced optimization belongs in planning/analytics.)


Unknown Handling
  ●​ UNKNOWN_ALLOWED: weights, persona_weighting, risk_adjustment,
     notes
  ●​ If scales are undefined → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.SCOPE
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ factors_defined == true
        ○​ scales_defined == true
        ○​ scored_items_count >= 5
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
