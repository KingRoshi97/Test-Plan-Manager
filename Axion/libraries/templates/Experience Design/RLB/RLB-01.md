RLB-01
RLB-01 — Breakpoint Definitions (sizes +
names)
Header Block
   ●​ template_id: RLB-01​

   ●​ title: Breakpoint Definitions (sizes + names)​

   ●​ type: responsive_layout_breakpoints​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/responsive/RLB-01_Breakpoint_Definitions.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RESPONSIVE​

   ●​ upstream_dependencies: ["DSYS-03", "DSYS-01"]​

   ●​ inputs_required: ["DSYS-01", "DSYS-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical breakpoint system (names + pixel ranges) used across web and
responsive surfaces. This document ensures consistent responsive behavior and prevents
ad-hoc breakpoint usage.


Inputs Required
   ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​

   ●​ DSYS-03: {{xref:DSYS-03}} | OPTIONAL​

   ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​
Required Fields
  ●​ Breakpoint list (minimum 4 for responsive web; justify if fewer)​

  ●​ For each breakpoint:​

         ○​ bp_id​

         ○​ name​

         ○​ min_width_px​

         ○​ max_width_px (or open-ended)​

         ○​ intended devices/use cases​

  ●​ Naming convention and stability rules​

  ●​ Orientation notes (if applicable)​

  ●​ Density scaling policy (if applicable)​



Optional Fields
  ●​ Container query notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Breakpoint names must be stable; do not change semantics mid-project.​

  ●​ Breakpoints must not overlap (except boundary edges).​

  ●​ If mobile-native only, breakpoints may be N/A; mark explicitly.​



Output Format
1) Breakpoints (canonical)
bp_id        name          min_width_p       max_width_p        intended_us           notes
                                x                x                   e

bp_xs   {{bps.xs.name}}    {{bps.xs.min}}    {{bps.xs.max}}     {{bps.xs.use}}   {{bps.xs.notes}}

bp_s    {{bps.sm.name}     {{bps.sm.min}}    {{bps.sm.max}} {{bps.sm.use}        {{bps.sm.notes}
m       }                                                   }                    }

bp_m    {{bps.md.name}     {{bps.md.min}}    {{bps.md.max}      {{bps.md.use}    {{bps.md.notes}
d       }                                    }                  }                }

bp_lg   {{bps.lg.name}}    {{bps.lg.min}}    {{bps.lg.max}}     {{bps.lg.use}}   {{bps.lg.notes}}


2) Naming & Stability Rules (required)

   ●​ Naming convention: {{rules.naming}}​

   ●​ Change policy: {{rules.change_policy}}​



3) Orientation / Density Policy (optional)

   ●​ Orientation handling: {{rules.orientation}} | OPTIONAL​

   ●​ Density scaling: {{rules.density}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:DSYS-03}} | OPTIONAL​

   ●​ Downstream: {{xref:RLB-02}}, {{xref:DSYS-05}} | OPTIONAL, {{xref:FE-01}} |
      OPTIONAL, {{xref:VAP-02}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Define at least 4 breakpoints with clear ranges.​

   ●​ intermediate: Required. Add intended use and stability rules.​
 ●​ advanced: Required. Add orientation/density policy where relevant.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: orientation_policy, density_policy,
    container_query_notes, notes​

 ●​ If breakpoint ranges overlap → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.RESPONSIVE​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ breakpoints_count >= 4 (or justified)​

        ○​ breakpoint_ranges_non_overlapping == true​

        ○​ naming_rules_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
