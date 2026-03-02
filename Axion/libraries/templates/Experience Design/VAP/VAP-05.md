VAP-05
VAP-05 — Accessibility for Visual Assets
(alt text, meaning)
Header Block
   ●​ template_id: VAP-05​

   ●​ title: Accessibility for Visual Assets (alt text, meaning)​

   ●​ type: visual_asset_production​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/assets/VAP-05_Accessibility_for_Visual_Assets.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ASSETS​

   ●​ upstream_dependencies: ["A11YD-03", "DSYS-04", "VAP-01"]​

   ●​ inputs_required: ["A11YD-03", "DSYS-04", "VAP-01", "CDX-01", "CDX-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define enforceable accessibility rules for visual assets: alt text, decorative vs informative
classification, icon-only control labeling, and how meaning is conveyed. This ensures assets
don’t create accessibility gaps or confuse assistive technologies.


Inputs Required
   ●​ A11YD-03: {{xref:A11YD-03}} | OPTIONAL​

   ●​ DSYS-04: {{xref:DSYS-04}} | OPTIONAL​

   ●​ VAP-01: {{xref:VAP-01}} | OPTIONAL​
  ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

  ●​ CDX-02: {{xref:CDX-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Classification rules:​

         ○​ decorative assets​

         ○​ informative assets​

         ○​ functional assets (icons used as controls)​

  ●​ Alt text requirements:​

         ○​ when required​

         ○​ length guidance​

         ○​ content rules (what to say / what not to say)​

         ○​ localization readiness​

  ●​ Icon-only control rules:​

         ○​ accessible label source (CDX vs custom)​

         ○​ when tooltips are acceptable (not a substitute)​

  ●​ Illustration meaning rules:​

         ○​ ensure copy conveys meaning, not illustration alone​

         ○​ avoid culturally specific signals unless localized​

  ●​ Inventory compliance:​

         ○​ every VAP-01 asset has a11y_class​
            ○​ informative assets have alt_text requirement​

   ●​ Verification checklist​



Optional Fields
   ●​ Audio description rules (video) | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Decorative assets must be hidden from screen readers.​

   ●​ Informative assets must have alt text that conveys purpose, not appearance only.​

   ●​ Icons used as controls must have programmatic labels even if visually unlabeled.​

   ●​ Alt text must not duplicate adjacent visible text unless needed for context.​



Output Format
1) Classification Rules (required)
  class            definition                 examples                     SR_behavior

decorativ {{classes.decorative.d      {{classes.decorative.exam    {{classes.decorative.sr_beha
e         ef}}                        ples}}                       vior}}

informati    {{classes.informative.   {{classes.informative.exam   {{classes.informative.sr_beh
ve           def}}                    ples}}                       avior}}

functiona {{classes.functional.d      {{classes.functional.examp   {{classes.functional.sr_beha
l         ef}}                        les}}                        vior}}


2) Alt Text Rules (required)

   ●​ When required: {{alt.when_required}}​
   ●​ Length guidance: {{alt.length}}​

   ●​ Content rules (do): {{alt.do_rules}}​

   ●​ Content rules (don’t): {{alt.dont_rules}}​

   ●​ Localization readiness: {{alt.l10n}}​



3) Icon-only Controls (required)

   ●​ Label source preference: {{icon_controls.label_source}} (CDX-02 key vs explicit label)​

   ●​ Tooltip policy: {{icon_controls.tooltip_policy}}​

   ●​ Disallowed: {{icon_controls.disallowed}} | OPTIONAL​



4) Illustration Meaning Rules (required)

   ●​ Illustration never sole meaning: {{illustrations.not_sole_meaning}}​

   ●​ Empty state illustration pairing rule: {{illustrations.empty_state_pairing}} | OPTIONAL​



5) Inventory Compliance Checks (required)

   ●​ All assets have a11y_class: {{checks.all_assets_classified}}​

   ●​ Informative assets have alt requirements: {{checks.informative_have_alt}}​

   ●​ Functional icons have labels: {{checks.functional_have_labels}}​



6) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​

   ●​ {{verify[3]}} | OPTIONAL​
Cross-References
  ●​ Upstream: {{xref:VAP-01}} | OPTIONAL, {{xref:A11YD-03}} | OPTIONAL,
     {{xref:DSYS-04}} | OPTIONAL​

  ●​ Downstream: {{xref:FE-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Classification + alt rules + icon-label rules.​

  ●​ intermediate: Required. Add inventory compliance checks and illustration rules.​

  ●​ advanced: Required. Add verification checklist rigor and localization constraints.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: audio_description_rules, notes, disallowed​

  ●​ If classification rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.ASSETS​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ classification_rules_present == true​

         ○​ alt_text_rules_present == true​

         ○​ inventory_checks_present == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
