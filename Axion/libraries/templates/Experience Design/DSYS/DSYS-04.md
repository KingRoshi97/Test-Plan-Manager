DSYS-04
DSYS-04 — Iconography & Illustration
Rules
Header Block
   ●​ template_id: DSYS-04​

   ●​ title: Iconography & Illustration Rules​

   ●​ type: design_system_tokens​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design_system/DSYS-04_Iconography_Illustration_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DSYS​

   ●​ upstream_dependencies: ["DSYS-01", "CDX-01", "A11YD-01"]​

   ●​ inputs_required: ["DSYS-01", "CDX-01", "A11YD-01", "VAP-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the rules for icon and illustration usage so visuals are consistent, accessible, and
semantically correct. This covers style constraints, usage guidance, labeling/accessibility, and
how icons/illustrations map to meaning in the UI.


Inputs Required
   ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​

   ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

   ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​
  ●​ VAP-01: {{xref:VAP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Icon style rules:​

          ○​ stroke/filled policy​

          ○​ weight consistency​

          ○​ corner/angle rules​

          ○​ grid size (e.g., 24px base) and scaling rules​

  ●​ Icon semantic rules:​

          ○​ when icons can be used alone vs must include label​

          ○​ avoid ambiguous icons list​

          ○​ do/don’t examples​

  ●​ Illustration rules:​

          ○​ allowed use cases (empty states, onboarding, marketing surfaces)​

          ○​ forbidden use cases (critical instructions, safety)​

          ○​ tone alignment with CDX-01​

  ●​ Accessibility rules:​

          ○​ decorative vs informative classification​

          ○​ alt text rules​

          ○​ aria-label rules for icon-only buttons​

  ●​ Asset naming and organization rules (ties to VAP)​
Optional Fields
   ●​ Brand mascot/character rules | OPTIONAL​

   ●​ Localization considerations for visuals | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Icons must not be the only indicator of meaning in critical flows; use text where needed.​

   ●​ If an icon is used as a button with no text, it must have an accessible label.​

   ●​ Illustrations must not encode culture-specific meaning unless localized.​

   ●​ Visual meaning must align with terminology and tone (CDX-01).​



Output Format
1) Icon Style Rules (required)

   ●​ Base grid size: {{icons.grid_size}}​

   ●​ Stroke policy: {{icons.stroke_policy}}​

   ●​ Weight rules: {{icons.weight_rules}}​

   ●​ Corner/angle rules: {{icons.corner_rules}} | OPTIONAL​

   ●​ Scaling rules: {{icons.scaling_rules}}​



2) Icon Semantics (required)
  scenario         allowed_icon_only               required_label                rationale

navigation_t   {{semantics.nav.icon_only        {{semantics.nav.label}   {{semantics.nav.rationale
ab             }}                               }                        }}
primary_cta    {{semantics.cta.icon_only}    {{semantics.cta.label}}   {{semantics.cta.rationale}
               }                                                       }

destructive_   {{semantics.destructive.ic    {{semantics.destructiv    {{semantics.destructive.r
action         on_only}}                     e.label}}                 ationale}}


3) Ambiguous / Avoid List (required)

   ●​ {{icons.avoid[0]}}​

   ●​ {{icons.avoid[1]}}​

   ●​ {{icons.avoid[2]}}​

   ●​ {{icons.avoid[3]}} | OPTIONAL​

   ●​ {{icons.avoid[4]}} | OPTIONAL​



4) Do/Don’t Examples (required)
 example_i              do                    dont                      why
    d

ex_01          {{examples[0].do}}    {{examples[0].dont}}       {{examples[0].why}}

ex_02          {{examples[1].do}}    {{examples[1].dont}}       {{examples[1].why}}


5) Illustration Rules (required)

   ●​ Allowed use cases: {{illustrations.allowed_use_cases}}​

   ●​ Forbidden use cases: {{illustrations.forbidden_use_cases}}​

   ●​ Tone alignment rules: {{illustrations.tone_alignment}}​

   ●​ Complexity constraints (keep simple): {{illustrations.complexity}} | OPTIONAL​



6) Accessibility Rules (required)

   ●​ Decorative visuals: {{a11y.decorative_rules}}​
  ●​ Informative visuals: {{a11y.informative_rules}}​

  ●​ Icon-only controls labeling: {{a11y.icon_only_labeling}}​

  ●​ Alt text guidelines: {{a11y.alt_text_rules}} | OPTIONAL​



7) Naming / Organization (required)

  ●​ Naming convention: {{assets.naming_convention}}​

  ●​ Folder organization: {{assets.organization}} | OPTIONAL​

  ●​ Source of truth: {{xref:VAP-01}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DSYS-01}} | OPTIONAL, {{xref:CDX-01}} | OPTIONAL​

  ●​ Downstream: {{xref:VAP-02}} | OPTIONAL, {{xref:DES-03}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define icon rules + avoid list + a11y labeling.​

  ●​ intermediate: Required. Add semantics table and do/don’t examples.​

  ●​ advanced: Required. Add illustration constraints and naming/organization rules tied to
     asset pipeline.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: mascot_rules, visual_localization_notes, notes,
     organization​
 ●​ If icon-only labeling rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DSYS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ icon_style_rules_present == true​

        ○​ semantics_rules_present == true​

        ○​ a11y_rules_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
