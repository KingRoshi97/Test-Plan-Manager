IAN-01
IAN-01 — Navigation Map
(primary/secondary, tabs/drawers)
Header Block
   ●​ template_id: IAN-01​

   ●​ title: Navigation Map (primary/secondary, tabs/drawers)​

   ●​ type: information_architecture_navigation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/ia/IAN-01_Navigation_Map.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IAN​

   ●​ upstream_dependencies: ["PRD-04", "DES-01", "PRD-03"]​

   ●​ inputs_required: ["PRD-04", "DES-01", "PRD-03", "RSC-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical navigation structure users experience: primary navigation surfaces,
secondary navigation, and the rules that govern how users move between sections. This is the
source of truth for navigation intent and structure (not implementation code).


Inputs Required
   ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

   ●​ DES-01: {{xref:DES-01}} | OPTIONAL​

   ●​ PRD-03: {{xref:PRD-03}} | OPTIONAL​
  ●​ RSC-02: {{xref:RSC-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Navigation paradigm(s) used (tabs, drawer, stack, sidebar, top nav)​

  ●​ Primary navigation items (minimum 3)​

  ●​ Secondary navigation items (if any)​

  ●​ For each nav item:​

         ○​ nav_id​

         ○​ label (ties to CDX inventory later)​

         ○​ destination (screen_id or route_id)​

         ○​ visibility rules (role/tier/access)​

         ○​ ordering/priority​

         ○​ icon (optional pointer)​

         ○​ badges/indicators rules (optional)​

  ●​ Global navigation rules:​

         ○​ default landing​

         ○​ back behavior policy (high level)​

         ○​ how modal overlays interact with nav​

         ○​ auth gating behavior (what happens when not signed in)​

  ●​ Role-based navigation differences (if applicable)​



Optional Fields
      ●​ Search entry points | OPTIONAL​

      ●​ Deep link entry points | OPTIONAL​

      ●​ Notes | OPTIONAL​



Rules
      ●​ Do not invent roles; use PRD-03 / IAM concepts.​

      ●​ Destinations should use screen_id where possible; route_id is finalized in IAN-02.​

      ●​ Navigation must avoid dead ends: every destination must offer an exit path.​

      ●​ If visibility rules exist, define a deterministic fallback (hide vs disabled vs upsell).​



Output Format
1) Navigation Overview (required)

      ●​ Paradigms: {{nav.paradigms}}​

      ●​ Default landing destination: {{nav.default_landing}} (screen_id or route_id)​

      ●​ Auth gating behavior: {{nav.auth_gating_behavior}}​



2) Primary Navigation (required)
 n       label      destinati    destinati     visibility_    order     icon_re     badge_r      notes
 a                  on_scree     on_route        rules                     f          ules
 v                    n_id         _id
 _i
 d

n       {{primar   {{primary[ {{primary[      {{primary[ {{primar       {{primar    {{primary {{primar
a       y[0].lab   0].screen_ 0].route_i      0].visibility y[0].ord    y[0].ico    [0].badg y[0].note
v       el}}       id}}       d}}             }}            er}}        n}}         e}}       s}}
_
0
1
n      {{primar    {{primary[ {{primary[       {{primary[ {{primar      {{primar   {{primary {{primar
a      y[1].lab    1].screen_ 1].route_i       1].visibility y[1].ord   y[1].ico   [1].badg y[1].note
v      el}}        id}}       d}}              }}            er}}       n}}        e}}       s}}
_
0
2


3) Secondary Navigation (optional)
 na        label         destination_     destination_      visibility_rul     order            notes
 v_i                      screen_id         route_id             es
  d

na {{secondar           {{secondary[0     {{secondary[     {{secondary[0 {{secondary {{secondary
v_s y[0].label}}        ].screen_id}}     0].route_id}}    ].visibility}} [0].order}} [0].notes}}
01


4) Global Navigation Rules (required)

    ●​ Back behavior policy: {{rules.back_behavior}}​

    ●​ Modal overlay policy: {{rules.modal_policy}}​

    ●​ Dead-end prevention rule: {{rules.no_dead_ends}}​

    ●​ Fallback when not visible: {{rules.visibility_fallback}} (hide/disable/upsell)​



5) Role/Tier Variants (required if applicable)
 variant_id               applies_to                differences                 notes

var_01            {{variants[0].applies_to}}    {{variants[0].diff}}    {{variants[0].notes}}


Cross-References
    ●​ Upstream: {{xref:PRD-03}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL, {{xref:DES-01}} |
       OPTIONAL, {{xref:RSC-02}} | OPTIONAL​

    ●​ Downstream: {{xref:IAN-02}}, {{xref:DES-02}} | OPTIONAL, {{xref:MAP-01}} |
       OPTIONAL, {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} | OPTIONAL​
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Primary nav + default landing + auth gating.​

  ●​ intermediate: Required. Add visibility rules and global policies.​

  ●​ advanced: Required. Add variants, badge rules, and deeper policy definitions.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: secondary_nav, icon_ref, badge_rules, variants,
     notes, route_id (until IAN-02)​

  ●​ If default landing is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IAN​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ primary_nav_count >= 3​

         ○​ default_landing_present == true​

         ○​ no_dead_ends_rule_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
