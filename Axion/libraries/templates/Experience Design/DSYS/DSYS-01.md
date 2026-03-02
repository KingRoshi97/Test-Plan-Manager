DSYS-01
DSYS-01 — Token Spec (color, type,
spacing, radius, elevation)
Header Block
   ●​ template_id: DSYS-01​

   ●​ title: Token Spec (color, type, spacing, radius, elevation)​

   ●​ type: design_system_tokens​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design_system/DSYS-01_Token_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DSYS​

   ●​ upstream_dependencies: ["CDX-01", "A11YD-04"]​

   ●​ inputs_required: ["CDX-01", "A11YD-04", "RLB-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical design tokens used across UI implementation so styling is consistent,
themeable, and accessible. Tokens are the source of truth for UI values (not component rules),
enabling FE/MOB to implement without inventing new visual constants.


Inputs Required
   ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

   ●​ A11YD-04: {{xref:A11YD-04}} | OPTIONAL​

   ●​ RLB-01: {{xref:RLB-01}} | OPTIONAL​
  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​

  ●​ Existing brand palette: {{inputs.brand_palette}} | OPTIONAL​



Required Fields
  ●​ Token namespaces (color/type/space/radius/elevation/border/shadow/zindex)​

  ●​ Color tokens:​

         ○​ semantic roles (bg/surface/text/border/primary/success/warn/error)​

         ○​ states (hover/active/disabled/focus)​

         ○​ theme variants (light/dark if applicable)​

  ●​ Typography tokens (font families, sizes, weights, line heights)​

  ●​ Spacing scale tokens (consistent step scale)​

  ●​ Radius tokens (corner radii scale)​

  ●​ Elevation tokens (shadows/surfaces) OR depth scale definition​

  ●​ Focus tokens (focus ring width/offset/semantic color)​

  ●​ Token naming rules and stability rules​



Optional Fields
  ●​ Motion tokens (durations/easing) | OPTIONAL (may reference IXD)​

  ●​ Component alias tokens (e.g., button padding) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ Tokens must be semantic-first (meaning-based), not “random values.”​

   ●​ Token names must be stable; changes are versioned and should avoid breaking
      downstream.​

   ●​ All text and interactive tokens must meet contrast requirements (A11YD-04).​

   ●​ If multiple themes exist, every semantic token must have values in each theme.​

   ●​ No “magic numbers” in implementation: all UI values should reference tokens unless
      explicitly exempt.​



Output Format
1) Token Naming Rules (required)

   ●​ Namespace format: {{tokens.naming.namespace_format}} (e.g., color.bg.default)​

   ●​ Allowed characters: {{tokens.naming.allowed_chars}}​

   ●​ Aliasing rules: {{tokens.naming.aliasing_rules}}​

   ●​ Deprecation rules: {{tokens.naming.deprecation_rules}} | OPTIONAL​



2) Color Tokens (required)
   token          semantic      light_valu      dark_valu         states      contrast_no      usage_not
                    _role            e              e                             tes             es

{{colors[0].t    {{colors[0]    {{colors[0].   {{colors[0].    {{colors[0].   {{colors[0].co {{colors[0].
oken}}           .role}}        light}}        dark}}          states}}       ntrast}}       usage}}

{{colors[1].t    {{colors[1]    {{colors[1].   {{colors[1].    {{colors[1].   {{colors[1].co {{colors[1].
oken}}           .role}}        light}}        dark}}          states}}       ntrast}}       usage}}


3) Typography Tokens (required)
  token         font_famil       size          weight         line_height     letter_spacing    usage_n
                    y                                                                             otes

{{type[0].t     {{type[0].fa   {{type[0].   {{type[0].w   {{type[0].line_ {{type[0].letter_    {{type[0].u
oken}}          mily}}         size}}       eight}}       height}}        spacing}}            sage}}
4) Spacing Scale (required)
       token                    value               usage_notes

{{space[0].token}}       {{space[0].value}}    {{space[0].usage}}


5) Radius Scale (required)
       token                     value               usage_notes

{{radius[0].token}}      {{radius[0].value}}    {{radius[0].usage}}


6) Elevation / Depth Scale (required)
        token                   description                  value                usage_notes

{{elevation[0].token}}      {{elevation[0].desc}}    {{elevation[0].value}}   {{elevation[0].usage}}


7) Focus Tokens (required)
       token                    value               usage_notes

{{focus[0].token}}       {{focus[0].value}}    {{focus[0].usage}}


8) Theme Coverage Check (required)

  ●​ Has light theme: {{themes.has_light}}​

  ●​ Has dark theme: {{themes.has_dark}} | OPTIONAL​

  ●​ All semantic tokens covered in each theme: {{themes.coverage_complete}}​

  ●​ Contrast checks complete (A11YD-04): {{themes.contrast_complete}}​



Cross-References
  ●​ Upstream: {{xref:A11YD-04}} | OPTIONAL, {{xref:RLB-01}} | OPTIONAL​

  ●​ Downstream: {{xref:DSYS-02}}, {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​
Skill Level Requiredness Rules
  ●​ beginner: Required. Define core semantic tokens (primary/bg/text/border/status) +
     spacing/radius.​

  ●​ intermediate: Required. Add typography and elevation; define naming rules.​

  ●​ advanced: Required. Add theme coverage + focus tokens + contrast verification notes.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: motion_tokens, component_alias_tokens, notes,
     dark_theme_values (if only light theme)​

  ●​ If contrast_notes are UNKNOWN for text tokens → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DSYS​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ naming_rules_present == true​

         ○​ color_tokens_present == true​

         ○​ typography_tokens_present == true​

         ○​ spacing_radius_elevation_present == true​

         ○​ theme_coverage_complete == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
