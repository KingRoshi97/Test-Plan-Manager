VAP-02
VAP-02 — Export Spec (formats, sizes,
naming, density)
Header Block
   ●​ template_id: VAP-02​

   ●​ title: Export Spec (formats, sizes, naming, density)​

   ●​ type: visual_asset_production​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/assets/VAP-02_Export_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ASSETS​

   ●​ upstream_dependencies: ["VAP-01", "DSYS-04", "RLB-05"]​

   ●​ inputs_required: ["VAP-01", "DSYS-04", "RLB-05", "DSYS-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic export and delivery rules for visual assets: formats, sizes, densities, naming
conventions, and folder layout. This ensures implementation can consume assets without
manual guessing or inconsistent exports.


Inputs Required
   ●​ VAP-01: {{xref:VAP-01}}​

   ●​ DSYS-04: {{xref:DSYS-04}} | OPTIONAL​

   ●​ RLB-05: {{xref:RLB-05}} | OPTIONAL​
  ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Naming convention rules (file names, casing, separators)​

  ●​ Folder organization rules (by type, by feature/screen, by theme)​

  ●​ Export formats by asset type (svg/png/webp/jpg/mp4/etc.)​

  ●​ Size rules:​

         ○​ base size(s)​

         ○​ responsive variants​

         ○​ max size constraints​

  ●​ Density rules:​

         ○​ which densities required (1x/2x/3x)​

         ○​ when to omit densities (svg)​

  ●​ Theme variant rules (light/dark)​

  ●​ Optimization rules (compression targets, stripping metadata)​

  ●​ Verification checklist (how to verify exports match spec)​



Optional Fields
  ●​ CDN/hosting notes | OPTIONAL​

  ●​ Source-of-truth tool notes (Figma) | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
  ●​ Export rules must match responsive media rules (RLB-05).​

  ●​ SVG assets must be optimized and sanitized (no embedded raster unless allowed).​

  ●​ Raster assets must meet compression targets.​

  ●​ Filenames must be deterministic and consistent with asset_id mapping.​



Output Format
1) Naming Rules (required)

  ●​ File naming convention: {{naming.convention}} (e.g.,
     <asset_id><variant><size>@<density>.<ext>)​

  ●​ Casing: {{naming.casing}}​

  ●​ Separator rules: {{naming.separators}}​

  ●​ Theme suffix rules: {{naming.theme_suffix}} | OPTIONAL​



2) Folder Organization (required)

  ●​ Base folder: {{folders.base}}​

  ●​ By type: {{folders.by_type}}​

  ●​ By theme: {{folders.by_theme}} | OPTIONAL​

  ●​ By feature/screen: {{folders.by_feature}} | OPTIONAL​



3) Export Formats (required)
 asset_t       preferred_formats            allowed_formats                   notes
   ype

icon       {{formats.icon.preferred}}   {{formats.icon.allowed}}   {{formats.icon.notes}}
illustrati   {{formats.illustration.preferr   {{formats.illustration.allow   {{formats.illustration.not
on           ed}}                             ed}}                           es}}

photo        {{formats.photo.preferred}}      {{formats.photo.allowed}}      {{formats.photo.notes}}

animatio     {{formats.animation.preferr      {{formats.animation.allowe     {{formats.animation.note
n            ed}}                             d}}                            s}}


4) Sizes & Densities (required)

   ●​ Base sizes policy: {{sizes.base_policy}}​

   ●​ Responsive variants policy: {{sizes.responsive_policy}} | OPTIONAL​

   ●​ Densities required: {{densities.required}}​

   ●​ When to omit densities: {{densities.omit_when}}​



5) Theme Variants (required)

   ●​ When light/dark exports required: {{themes.when_required}}​

   ●​ Naming mapping for theme: {{themes.naming_mapping}} | OPTIONAL​



6) Optimization Rules (required)

   ●​ Compression targets: {{opt.compression_targets}}​

   ●​ Metadata stripping: {{opt.strip_metadata}}​

   ●​ SVG sanitization: {{opt.svg_sanitize}} | OPTIONAL​



7) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​
  ●​ {{verify[3]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:VAP-01}}, {{xref:RLB-05}} | OPTIONAL, {{xref:DSYS-04}} | OPTIONAL​

  ●​ Downstream: {{xref:VAP-04}}, {{xref:FE-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Naming + formats + densities + folder layout.​

  ●​ intermediate: Required. Add optimization rules and theme variants.​

  ●​ advanced: Required. Add verification checklist and responsive variant guidance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: cdn_notes, source_tool_notes,
     responsive_variants, notes​

  ●​ If naming convention is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.ASSETS​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ naming_rules_present == true​

         ○​ formats_present == true​
○​ densities_rules_present == true​

○​ optimization_rules_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
