VAP-03
VAP-03 — Brand Usage Rules (do/don’t,
clearspace)
Header Block
   ●​ template_id: VAP-03​

   ●​ title: Brand Usage Rules (do/don’t, clearspace)​

   ●​ type: visual_asset_production​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/assets/VAP-03_Brand_Usage_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ASSETS​

   ●​ upstream_dependencies: ["VAP-01", "DSYS-01", "DSYS-05"]​

   ●​ inputs_required: ["VAP-01", "DSYS-01", "DSYS-05", "CDX-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the enforceable rules for brand asset usage across the product so logos and brand
visuals remain consistent, legible, and compliant. This includes clearspace, minimum sizes,
acceptable backgrounds, and do/don’t examples.


Inputs Required
   ●​ VAP-01: {{xref:VAP-01}} | OPTIONAL​

   ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​

   ●​ DSYS-05: {{xref:DSYS-05}} | OPTIONAL​
  ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Logo variants list (primary/mono/icon-only/etc.)​

  ●​ For each logo variant:​

         ○​ variant_id​

         ○​ file reference (asset_id)​

         ○​ minimum size rules​

         ○​ clearspace rules​

         ○​ acceptable background rules​

         ○​ forbidden usage rules​

  ●​ Brand color usage rules (ties to DSYS tokens)​

  ●​ Typography usage rules (ties to DSYS tokens)​

  ●​ Do/Don’t examples (minimum 10)​

  ●​ Approval workflow (who approves brand exceptions)​



Optional Fields
  ●​ Co-branding rules | OPTIONAL​

  ●​ Legal trademark notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Brand asset usage must not break accessibility (contrast, legibility).​

  ●​ Logo must not be stretched, skewed, recolored outside allowed variants.​

  ●​ Clearspace must be maintained in all placements.​

  ●​ Any exception requires approval and must be logged (STK).​



Output Format
1) Logo Variants (required)
varia   asset_id       min_size      clearspace_     allowed_bac      forbidden_       notes
nt_id                                    rule          kgrounds           use

logo_ {{logos.prim {{logos.prim      {{logos.prima {{logos.primar     {{logos.prim   {{logos.pri
prim ary.asset_id ary.min_siz        ry.clearspac  y.background       ary.forbidde   mary.note
ary   }}           e}}               e}}           s}}                n}}            s}}

logo_ {{logos.mon {{logos.mon        {{logos.mono {{logos.mono.       {{logos.mon    {{logos.mo
mon o.asset_id}} o.min_size}}        .clearspace}} backgrounds}       o.forbidden}   no.notes}}
o                                                  }                  }


2) Brand Color Usage (required)

  ●​ Token source: {{xref:DSYS-01}} | OPTIONAL​

  ●​ Allowed primary usage: {{brand_colors.allowed_primary}}​

  ●​ Forbidden color usage: {{brand_colors.forbidden}}​

  ●​ Background rules: {{brand_colors.background_rules}} | OPTIONAL​



3) Typography Usage (required)

  ●​ Token source: {{xref:DSYS-01}} | OPTIONAL​

  ●​ Heading rules: {{typography.headings}}​

  ●​ Body rules: {{typography.body}}​
  ●​ Forbidden substitutions: {{typography.forbidden}} | OPTIONAL​



4) Do/Don’t Examples (required, min 10)
 example_i            do                    dont                     why
    d

ex_01        {{examples[0].do}}     {{examples[0].dont}}    {{examples[0].why}}

ex_02        {{examples[1].do}}     {{examples[1].dont}}    {{examples[1].why}}


5) Approval Workflow (required)

  ●​ Default approver: {{approval.approver}}​

  ●​ What requires approval: {{approval.requires}}​

  ●​ Logging requirement: {{approval.logging}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:VAP-01}} | OPTIONAL, {{xref:DSYS-01}} | OPTIONAL, {{xref:DSYS-05}}
     | OPTIONAL​

  ●​ Downstream: {{xref:VAP-04}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Logo variants + min size + clearspace + do/don’t list.​

  ●​ intermediate: Required. Add color/typography token usage rules.​

  ●​ advanced: Required. Add approval workflow and exception logging rules.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: co_branding, legal_notes, notes, approval.logging​

 ●​ If clearspace rules are UNKNOWN for any logo variant → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ASSETS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ logo_variants_present == true​

        ○​ do_dont_examples_count >= 10​

        ○​ approval_workflow_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
