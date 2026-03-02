IXD-02
IXD-02 — Motion Rules
(when/why/constraints)
Header Block
   ●​ template_id: IXD-02​

   ●​ title: Motion Rules (when/why/constraints)​

   ●​ type: interaction_design_motion​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design/IXD-02_Motion_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IXD​

   ●​ upstream_dependencies: ["IXD-01", "DES-05", "DSYS-01", "A11YD-01"]​

   ●​ inputs_required: ["IXD-01", "DES-05", "DSYS-01", "A11YD-01", "A11YD-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the system-wide motion contract: when motion is used, what it communicates, and hard
constraints to keep motion accessible, performant, and consistent. This is not a style guide for
“cool animations”—it is a behavior rulebook.


Inputs Required
   ●​ IXD-01: {{xref:IXD-01}}​

   ●​ DES-05: {{xref:DES-05}} | OPTIONAL​

   ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​
  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ A11YD-05: {{xref:A11YD-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Motion principles (3–8)​

  ●​ Motion use cases (minimum: navigation transitions, state changes, feedback/affordance)​

  ●​ Motion constraints:​

         ○​ reduced motion policy (must)​

         ○​ duration bounds (min/max)​

         ○​ easing rules (allowed set)​

         ○​ performance constraints (avoid layout thrash, GPU-friendly guidance)​

  ●​ Motion semantics mapping (what motion means)​

  ●​ Prohibited motion patterns (at least 5)​

  ●​ Fallback behavior when motion is disabled​



Optional Fields
  ●​ Platform-specific constraints (web vs mobile) | OPTIONAL​

  ●​ Component-specific motion rules | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Motion must always communicate one of: relationship, change, feedback, focus,
     state.​

  ●​ Motion must never be the only indicator of state; pair with non-motion cues.​

  ●​ Reduced-motion users must get functional equivalence (no missing affordances).​

  ●​ Any motion that could induce vestibular discomfort must be disabled in reduced motion
     mode.​

  ●​ If a rule conflicts with accessibility requirements, accessibility wins.​



Output Format
1) Motion Principles (required)

  ●​ {{motion.principles[0]}}​

  ●​ {{motion.principles[1]}}​

  ●​ {{motion.principles[2]}}​



2) Motion Semantics (required)
semanti             meaning                       examples                       not_used_for
   c

relations   {{semantics.relationship.    {{semantics.relationship.ex {{semantics.relationship.
hip         meaning}}                    amples}}                    not_for}}

state_ch    {{semantics.state_change     {{semantics.state_change.      {{semantics.state_chang
ange        .meaning}}                   examples}}                     e.not_for}}

feedbac     {{semantics.feedback.me      {{semantics.feedback.exa       {{semantics.feedback.not
k           aning}}                      mples}}                        _for}}

focus       {{semantics.focus.meanin     {{semantics.focus.example {{semantics.focus.not_for
            g}}                          s}}                       }}


3) Global Constraints (required)
  ●​ Reduced motion policy: {{constraints.reduced_motion.policy}}​

  ●​ Motion OFF fallback: {{constraints.reduced_motion.fallback_behavior}}​

  ●​ Duration bounds: min {{constraints.duration.min_ms}} ms, max
     {{constraints.duration.max_ms}} ms​

  ●​ Allowed easing set: {{constraints.easing.allowed}}​

  ●​ Disallowed easing: {{constraints.easing.disallowed}} | OPTIONAL​

  ●​ Performance rules:​

         ○​ {{constraints.performance[0]}}​

         ○​ {{constraints.performance[1]}} | OPTIONAL​



4) Motion Use Cases (required)
 use_case       when_used             intent           constraints        fallback_when_re
                                                                            duced_motion

navigation_   {{use_cases.nav    {{use_cases.nav.   {{use_cases.nav.co    {{use_cases.nav.fa
transition    .when}}            intent}}           nstraints}}           llback}}

state_chan    {{use_cases.stat   {{use_cases.stat   {{use_cases.state.c   {{use_cases.state.f
ge            e.when}}           e.intent}}         onstraints}}          allback}}

feedback_a {{use_cases.fee       {{use_cases.fee    {{use_cases.feedba    {{use_cases.feedb
ffordance  dback.when}}          dback.intent}}     ck.constraints}}      ack.fallback}}


5) Prohibited Motion Patterns (required)

  ●​ {{prohibited[0]}}​

  ●​ {{prohibited[1]}}​

  ●​ {{prohibited[2]}}​

  ●​ {{prohibited[3]}}​

  ●​ {{prohibited[4]}}​
6) Component/Pattern Overrides (optional)
 pattern_or_component_i         override_rule                 rationale
            d

{{overrides[0].target}}      {{overrides[0].rule}}   {{overrides[0].rationale}}


Cross-References
  ●​ Upstream: {{xref:IXD-01}}, {{xref:DES-05}} | OPTIONAL​

  ●​ Downstream: {{xref:IXD-03}}, {{xref:IXD-04}}, {{xref:DSYS-02}} | OPTIONAL, {{xref:FE-}}
     | OPTIONAL, {{xref:MOB-}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
     {{standards.rules[STD-A11Y]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Principles + reduced motion + duration bounds + prohibited list.​

  ●​ intermediate: Required. Add semantics table and use-case mapping.​

  ●​ advanced: Required. Add performance constraints and overrides tied to
     patterns/components.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: platform_specific_constraints,
      component_overrides, notes, disallowed_easing​

  ●​ If reduced_motion policy or fallback is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IXD​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ principles_count >= 3​

       ○​ reduced_motion_defined == true​

       ○​ duration_bounds_defined == true​

       ○​ prohibited_patterns_count >= 5​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
