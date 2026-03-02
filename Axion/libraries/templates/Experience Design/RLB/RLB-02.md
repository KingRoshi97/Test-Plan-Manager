RLB-02
RLB-02 — Layout Adaptation Rules (per
breakpoint)
Header Block
   ●​ template_id: RLB-02​

   ●​ title: Layout Adaptation Rules (per breakpoint)​

   ●​ type: responsive_layout_breakpoints​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/responsive/RLB-02_Layout_Adaptation_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE​

   ●​ upstream_dependencies: ["RLB-01", "DSYS-03", "DES-03"]​

   ●​ inputs_required: ["RLB-01", "DSYS-03", "DES-03", "IAN-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic layout adaptation rules across breakpoints: how navigation, grids, density,
and content hierarchy change as screen size changes. This ensures responsive behavior is
predictable and implementation-ready.


Inputs Required
   ●​ RLB-01: {{xref:RLB-01}}​

   ●​ DSYS-03: {{xref:DSYS-03}} | OPTIONAL​

   ●​ DES-03: {{xref:DES-03}} | OPTIONAL​
  ●​ IAN-01: {{xref:IAN-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Layout adaptation rules per breakpoint (at minimum for xs/sm/md/lg)​

  ●​ For each breakpoint:​

         ○​ navigation adaptation (tabs/drawer/sidebar)​

         ○​ grid/columns adaptation​

         ○​ density adaptation (spacing adjustments)​

         ○​ content priority rules (what collapses, what stays visible)​

         ○​ component substitution rules (e.g., table → cards)​

         ○​ modal sizing rules (full-screen vs centered)​

  ●​ Cross-breakpoint invariants (what must not change)​

  ●​ Verification checklist​



Optional Fields
  ●​ Platform-specific notes (web vs tablet) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Responsive changes must not break flow completion (DES-01).​

  ●​ Information hierarchy must remain consistent; avoid hiding critical actions.​
   ●​ Navigation changes must align to IAN-01 structure.​

   ●​ Component substitution must preserve accessibility and semantics.​



Output Format
1) Breakpoint Rules (canonical)
 brea   nav_pat        grid_col     density_      content_pr       component_       modal_r         notes
 kpoi     tern          umns         mode         iority_rule      substitution      ules
  nt                                                   s                s

bp_x    {{rules.x      {{rules.x    {{rules.xs.   {{rules.xs.pr    {{rules.xs.sub {{rules.xs. {{rules.xs
s       s.nav}}        s.cols}}     density}}     iority}}         s}}            modal}}     .notes}}

bp_s    {{rules.s      {{rules.s    {{rules.sm    {{rules.sm.p     {{rules.sm.su    {{rules.s     {{rules.s
m       m.nav}}        m.cols}}     .density}}    riority}}        bs}}             m.modal}      m.notes}}
                                                                                    }

bp_     {{rules.       {{rules.m {{rules.md       {{rules.md.p     {{rules.md.su    {{rules.m     {{rules.m
md      md.nav}        d.cols}}  .density}}       riority}}        bs}}             d.modal}}     d.notes}}
        }

bp_l    {{rules.l      {{rules.lg   {{rules.lg.   {{rules.lg.pri   {{rules.lg.sub   {{rules.lg.   {{rules.lg.
g       g.nav}}        .cols}}      density}}     ority}}          s}}              modal}}       notes}}


2) Cross-Breakpoint Invariants (required)

   ●​ {{invariants[0]}}​

   ●​ {{invariants[1]}} | OPTIONAL​

   ●​ {{invariants[2]}} | OPTIONAL​



3) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​
  ●​ {{verify[3]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:RLB-01}}, {{xref:DSYS-03}} | OPTIONAL, {{xref:IAN-01}} | OPTIONAL​

  ●​ Downstream: {{xref:RLB-03}}, {{xref:FE-01}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define nav and grid changes per breakpoint.​

  ●​ intermediate: Required. Add substitutions and modal rules.​

  ●​ advanced: Required. Add invariants and verification checklist.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: platform_notes, notes, density_mode (if single mode)​

  ●​ If any breakpoint lacks nav_pattern or content_priority_rules → block Completeness
     Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESPONSIVE​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ breakpoint_rules_present == true​

         ○​ invariants_present == true​
○​ verification_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
