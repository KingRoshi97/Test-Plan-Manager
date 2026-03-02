RLB-03
RLB-03 — Responsive Component
Behavior (tables/cards/nav)
Header Block
   ●​ template_id: RLB-03​

   ●​ title: Responsive Component Behavior (tables/cards/nav)​

   ●​ type: responsive_layout_breakpoints​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/responsive/RLB-03_Responsive_Component_Behavior.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE​

   ●​ upstream_dependencies: ["RLB-01", "DSYS-02", "DSYS-03", "A11YD-01"]​

   ●​ inputs_required: ["RLB-01", "DSYS-02", "DSYS-03", "A11YD-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how key UI components adapt across breakpoints and input types so responsive
behavior is consistent and accessible. This covers component-level transformations (table →
cards, nav shifts), density shifts, and interaction differences.


Inputs Required
   ●​ RLB-01: {{xref:RLB-01}} | OPTIONAL​

   ●​ DSYS-02: {{xref:DSYS-02}} | OPTIONAL​

   ●​ DSYS-03: {{xref:DSYS-03}} | OPTIONAL​
  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Component adaptation catalog (minimum 10 components/patterns)​

  ●​ For each entry:​

         ○​ target_component_id or pattern name​

         ○​ breakpoint behavior (xs/sm/md/lg)​

         ○​ layout changes (stacking, wrapping, truncation)​

         ○​ interaction changes (hover vs tap, disclosure patterns)​

         ○​ accessibility impacts (focus order, SR semantics)​

         ○​ performance considerations (virtualization, image sizing)​

  ●​ Navigation component behavior (tab/drawer/sidebar adaptations) if applicable​

  ●​ Verification checklist​



Optional Fields
  ●​ Platform notes (mobile web vs native) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Responsive adaptations must preserve meaning and available actions.​

  ●​ If converting tables to cards, sorting/filtering must remain accessible.​
   ●​ Truncation must not hide critical info; provide disclosure or expand.​

   ●​ Keyboard navigation must still work in all breakpoint variants.​



Output Format
1) Responsive Component Catalog (canonical)
 target      type      bp_x     bp_s     bp_m     bp_l     interacti     a11y_     perf_n   notes
           (compo       s        m         d       g       on_chan       notes      otes
           nent/pat                                           ges
             tern)

{{items[   {{items[0   {{item   {{item   {{item   {{item   {{items[0]    {{items   {{items {{items[
0].targe   ].type}}    s[0].x   s[0].s   s[0].m   s[0].l   .interactio   [0].a11   [0].perf 0].note
t}}                    s}}      m}}      d}}      g}}      n}}           y}}       }}       s}}

{{items[   {{items[1   {{item   {{item   {{item   {{item   {{items[1]    {{items   {{items {{items[
1].targe   ].type}}    s[1].x   s[1].s   s[1].m   s[1].l   .interactio   [1].a11   [1].perf 1].note
t}}                    s}}      m}}      d}}      g}}      n}}           y}}       }}       s}}


2) Navigation Component Behavior (required if responsive web)

   ●​ Tabs → drawer rules: {{nav.tabs_to_drawer}} | OPTIONAL​

   ●​ Sidebar collapse rules: {{nav.sidebar_collapse}} | OPTIONAL​

   ●​ Breadcrumbs behavior: {{nav.breadcrumbs}} | OPTIONAL​



3) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​

   ●​ {{verify[3]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RLB-01}} | OPTIONAL, {{xref:DSYS-02}} | OPTIONAL,
     {{xref:DSYS-03}} | OPTIONAL​

  ●​ Downstream: {{xref:RLB-04}}, {{xref:FE-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define 10 responsive component behaviors.​

  ●​ intermediate: Required. Add interaction differences and a11y notes.​

  ●​ advanced: Required. Add perf notes and verification checklist.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: platform_notes, nav_component_behavior (if not
     applicable), notes​

  ●​ If any component lacks breakpoint behavior definition → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESPONSIVE​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ items_count >= 10​

         ○​ breakpoint_behavior_complete == true​

         ○​ verification_present == true​

         ○​ placeholder_resolution == true​
          ○​ no_unapproved_unknowns == true​




RLB-04 — Touch Target & Density Rules
Header Block
   ●​ template_id: RLB-04​

   ●​ title: Touch Target & Density Rules​

   ●​ type: responsive_layout_breakpoints​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/responsive/RLB-04_Touch_Target_Density_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE​

   ●​ upstream_dependencies: ["A11YD-01", "DSYS-03", "RLB-01"]​

   ●​ inputs_required: ["A11YD-01", "DSYS-03", "RLB-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the rules for touch target sizing, spacing, and density modes across devices so UI
remains usable on touch and pointer inputs. This prevents overly dense layouts that break
usability and accessibility.


Inputs Required
   ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

   ●​ DSYS-03: {{xref:DSYS-03}} | OPTIONAL​
  ●​ RLB-01: {{xref:RLB-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Minimum touch target size rule (width/height)​

  ●​ Minimum spacing between interactive targets​

  ●​ Density modes:​

         ○​ comfortable​

         ○​ compact (optional)​

  ●​ Rules for when compact mode is allowed​

  ●​ Pointer vs touch differences (hover availability, hit slop)​

  ●​ Verification checklist​



Optional Fields
  ●​ Per-component exceptions | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Touch target minimums apply regardless of theme.​

  ●​ If compact mode is enabled, it must not reduce touch targets below minimum.​

  ●​ Provide hit slop guidance on mobile where targets are visually small.​

  ●​ Must align with DSYS spacing rules.​
Output Format
1) Minimum Target Rules (required)

   ●​ Minimum target size: {{targets.min_size}}​

   ●​ Minimum spacing: {{targets.min_spacing}}​

   ●​ Hit slop guidance (mobile): {{targets.hit_slop}} | OPTIONAL​



2) Density Modes (required)
  mode             description             allowed_surfaces                   constraints

comforta    {{density.comfortable.d    {{density.comfortable.surf    {{density.comfortable.constr
ble         esc}}                      aces}}                        aints}}

compact     {{density.compact.desc     {{density.compact.surface     {{density.compact.constraint
            }}                         s}}                           s}}


3) Pointer vs Touch Rules (required)

   ●​ Hover availability assumption: {{input.hover_assumption}}​

   ●​ Tap vs click equivalence: {{input.tap_click_equivalence}}​

   ●​ Long-press rules (if used): {{input.long_press}} | OPTIONAL​



4) Exceptions (optional)
 excepti    component_or_             exception             rationale             mitigation
  on_id        screen

ex_01       {{exceptions[0].t    {{exceptions[0].exc   {{exceptions[0].rati   {{exceptions[0].mitig
            arget}}              eption}}              onale}}                ation}}


5) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​
  ●​ {{verify[2]}}​

  ●​ {{verify[3]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:A11YD-01}} | OPTIONAL, {{xref:DSYS-03}} | OPTIONAL,
     {{xref:RLB-01}} | OPTIONAL​

  ●​ Downstream: {{xref:RLB-05}}, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} | OPTIONAL,
     {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Min target + spacing + density definition.​

  ●​ intermediate: Required. Add pointer vs touch rules and verification.​

  ●​ advanced: Required. Add exception governance and hit slop guidance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: compact_mode, exceptions, long_press_rules, notes​

  ●​ If minimum target size is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESPONSIVE​

  ●​ Pass conditions:​

          ○​ required_fields_present == true​
○​ min_target_rules_present == true​

○​ density_modes_present == true​

○​ verification_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
