DSYS-05
DSYS-05 — Theming Rules (light/dark,
brand constraints)
Header Block
   ●​ template_id: DSYS-05​

   ●​ title: Theming Rules (light/dark, brand constraints)​

   ●​ type: design_system_tokens​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design_system/DSYS-05_Theming_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DSYS​

   ●​ upstream_dependencies: ["DSYS-01", "A11YD-04", "CDX-01"]​

   ●​ inputs_required: ["DSYS-01", "A11YD-04", "CDX-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the enforceable theming model (light/dark/brand variations) so UI can switch themes
without breaking semantics, accessibility, or product identity. This document sets rules for token
resolution, contrast, and brand constraints.


Inputs Required
   ●​ DSYS-01: {{xref:DSYS-01}}​

   ●​ A11YD-04: {{xref:A11YD-04}} | OPTIONAL​

   ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​
  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Theme list (minimum 1; typically light + dark)​

  ●​ For each theme:​

         ○​ theme_id​

         ○​ intended environments (system/default/user choice)​

         ○​ token value source (DSYS-01 semantic tokens)​

         ○​ contrast compliance rules (text, icons, controls)​

  ●​ Theme switching rules:​

         ○​ system preference handling​

         ○​ app override handling​

         ○​ persistence rules​

  ●​ Brand constraints:​

         ○​ non-negotiable tokens (brand identity anchors)​

         ○​ allowed variation range (where theming can differ)​

         ○​ forbidden changes (e.g., status colors must remain semantic)​

  ●​ Component theming rules:​

         ○​ which components can theme independently (if any)​

         ○​ state token handling across themes (hover/focus/disabled)​

  ●​ Visual regression expectations (what must be tested)​



Optional Fields
  ●​ Seasonal/campaign themes | OPTIONAL​

  ●​ High-contrast theme support | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Theme values must map to semantic tokens, not direct “raw” values in components.​

  ●​ Contrast requirements apply in every theme; exceptions are not allowed for text/controls.​

  ●​ Brand anchors must be preserved across themes (defined explicitly).​

  ●​ If app supports manual theme selection, OS preference must still be respected unless
     explicitly overridden.​



Output Format
1) Themes (required)
theme       name         default_sour      user_selectable       persists          notes
  _id                         ce

theme    {{themes.light {{themes.light. {{themes.light.user   {{themes.light.   {{themes.ligh
_light   .name}}        source}}        _selectable}}         persists}}        t.notes}}

theme    {{themes.dar   {{themes.dark    {{themes.dark.user   {{themes.dark.    {{themes.dar
_dark    k.name}}       .source}}        _selectable}}        persists}}        k.notes}}


2) Switching Rules (required)

  ●​ System preference behavior: {{switching.system_pref}}​

  ●​ App override behavior: {{switching.app_override}}​

  ●​ Persistence: {{switching.persistence}}​

  ●​ Fallback behavior: {{switching.fallback}}​
3) Brand Constraints (required)

  ●​ Brand anchors (must not change): {{brand.anchors}}​

  ●​ Allowed variation: {{brand.allowed_variation}}​

  ●​ Forbidden changes: {{brand.forbidden}}​



4) Token Resolution Rules (required)

  ●​ Components consume semantic tokens only: {{resolution.semantic_only}}​

  ●​ State tokens in each theme: {{resolution.state_tokens}}​

  ●​ “Custom per component” policy: {{resolution.custom_policy}} | OPTIONAL​



5) Contrast Compliance (required)

  ●​ Text contrast requirement: {{contrast.text}}​

  ●​ Icon contrast requirement: {{contrast.icons}}​

  ●​ Control contrast requirement: {{contrast.controls}}​

  ●​ Verification method: {{contrast.verification_method}} | OPTIONAL​



6) Component Theming Rules (required)
 component_id         theming_allowed         theme_variant_rul      state_handling_notes
                                                    es

{{components[0].i   {{components[0].allow     {{components[0].rul   {{components[0].state_no
d}}                 ed}}                      es}}                  tes}}


7) Visual Regression Expectations (required)

  ●​ Screens to snapshot: {{regression.screens}}​

  ●​ Components to snapshot: {{regression.components}} | OPTIONAL​
  ●​ Failure threshold policy: {{regression.threshold_policy}} | OPTIONAL​



8) Optional Themes (optional)

  ●​ Seasonal/campaign themes: {{optional.seasonal}} | OPTIONAL​

  ●​ High-contrast: {{optional.high_contrast}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DSYS-01}}, {{xref:A11YD-04}} | OPTIONAL​

  ●​ Downstream: {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} | OPTIONAL, {{xref:QA-04}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define themes + switching rules + brand anchors.​

  ●​ intermediate: Required. Add token resolution and contrast rules.​

  ●​ advanced: Required. Add component theming allowances and regression expectations.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: seasonal_themes, high_contrast,
     verification_method, threshold_policy, notes​

  ●​ If brand anchors or contrast rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.DSYS​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ themes_defined == true​

       ○​ switching_rules_present == true​

       ○​ brand_constraints_present == true​

       ○​ contrast_rules_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true​
Information Architecture & Navigation
(IAN)
Information Architecture & Navigation (IAN)​
 IAN-01 Navigation Map (primary/secondary, tabs/drawers)​
 IAN-02 Route & Deep Link Spec (route IDs, params)​
 IAN-03 Information Architecture Tree (sections/pages hierarchy)​
 IAN-04 Search/Filter/Sort UX (if applicable)​
 IAN-05 Access-Gated Navigation Rules (role-based visibility)
