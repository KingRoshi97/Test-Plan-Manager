IXD-01
IXD-01 — Interaction Patterns Catalog
(modals, drawers, menus, gestures)
Header Block
   ●​ template_id: IXD-01
   ●​ title: Interaction Patterns Catalog (modals, drawers, menus, gestures)
   ●​ type: interaction_design_motion
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/design/IXD-01_Interaction_Patterns_Catalog.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.IXD
   ●​ upstream_dependencies: ["DES-01", "DES-03", "DES-06", "DES-07"]
   ●​ inputs_required: ["DES-01", "DES-03", "DES-06", "DES-07", "DSYS-02", "A11YD-02",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define the canonical catalog of interaction patterns used across the product so interactions are
consistent, learnable, and implementable. This is the behavioral contract for UI mechanics (not
visual styling), and it must include accessibility expectations and default fallbacks.


Inputs Required
   ●​   DES-01: {{xref:DES-01}} | OPTIONAL
   ●​   DES-03: {{xref:DES-03}} | OPTIONAL
   ●​   DES-06: {{xref:DES-06}} | OPTIONAL
   ●​   DES-07: {{xref:DES-07}} | OPTIONAL
   ●​   DSYS-02: {{xref:DSYS-02}} | OPTIONAL
   ●​   A11YD-02: {{xref:A11YD-02}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Pattern list (minimum 12 for non-trivial products)
   ●​ For each pattern:
         ○​ pattern_id
         ○​ name
         ○​ category (modal/drawer/menu/tooltip/toast/list/detail/wizard/gesture/etc.)
         ○​ purpose (why it exists)
         ○​ when_to_use
         ○​ when_not_to_use
         ○​ trigger (what opens/starts it)
         ○​ dismissal/exit rules (how it closes/ends)
         ○​ primary states (loading/empty/error/disabled)
         ○​ accessibility requirements (focus trap, escape key, announcements, etc.)
         ○​ platform notes (web/mobile differences)
         ○​ mapping to components (optional: component_id)
   ●​ Global consistency rules (priorities when patterns overlap)


Optional Fields
   ●​ Anti-patterns (explicitly forbidden variants) | OPTIONAL
   ●​ Notes | OPTIONAL


Rules
   ●​ Pattern IDs must be stable and unique (pat_<slug>).
   ●​ Must not conflict with DES-05 state rules or DES-07 error rules; reference them.
   ●​ Any pattern that traps focus must define:
         ○​ focus entry point
         ○​ focus loop rules
         ○​ escape behavior
   ●​ Any gesture pattern must define a non-gesture fallback (accessibility + desktop).


Output Format
1) Pattern Index (summary)
 patte      name          category          primary_use        key_accessibilit       platform
 rn_id                                                          y_requirement

pat_     {{patterns[0   {{patterns[0].   {{patterns[0].when_   {{patterns[0].a11y   {{patterns[0].
moda     ].name}}       category}}       to_use_short}}        _key}}               platform}}
l

pat_d    {{patterns[1   {{patterns[1].   {{patterns[1].when_   {{patterns[1].a11y   {{patterns[1].
rawer    ].name}}       category}}       to_use_short}}        _key}}               platform}}


2) Pattern Detail Blocks (required, one per pattern)
{{patterns[0].pattern_id}} — {{patterns[0].name}}

   ●​ Category: {{patterns[0].category}}
   ●​ Purpose: {{patterns[0].purpose}}

When to use

   ●​ {{patterns[0].when_to_use[0]}}
   ●​ {{patterns[0].when_to_use[1]}} | OPTIONAL

When NOT to use

   ●​ {{patterns[0].when_not_to_use[0]}}
   ●​ {{patterns[0].when_not_to_use[1]}} | OPTIONAL

Trigger

   ●​ {{patterns[0].trigger}}

Dismissal / Exit Rules

   ●​ Primary dismissal: {{patterns[0].dismissal.primary}}
   ●​ Secondary dismissal: {{patterns[0].dismissal.secondary}} | OPTIONAL
   ●​ Destructive action confirmation rule: {{patterns[0].dismissal.destructive_confirm}} |
      OPTIONAL

States

   ●​    Loading: {{patterns[0].states.loading}}
   ●​    Error: {{patterns[0].states.error}}
   ●​    Empty: {{patterns[0].states.empty}} | OPTIONAL
   ●​    Disabled: {{patterns[0].states.disabled}} | OPTIONAL

Accessibility Requirements

   ●​    Focus behavior: {{patterns[0].a11y.focus_behavior}}
   ●​    Keyboard support: {{patterns[0].a11y.keyboard}}
   ●​    Screen reader announcements: {{patterns[0].a11y.announcements}}
   ●​    Reduced motion considerations: {{patterns[0].a11y.reduced_motion}} | OPTIONAL

Platform Notes

   ●​ Web: {{patterns[0].platform_notes.web}} | OPTIONAL
   ●​ Mobile: {{patterns[0].platform_notes.mobile}} | OPTIONAL
   ●​ Gesture fallback (if applicable): {{patterns[0].platform_notes.gesture_fallback}} |
      OPTIONAL
Component Mapping (optional)

   ●​ component_id: {{patterns[0].component_id}} | OPTIONAL

References

   ●​ State model: {{xref:DES-05}} | OPTIONAL
   ●​ Error handling: {{xref:DES-07}} | OPTIONAL




3) Global Consistency Rules (required)

   ●​ Pattern precedence when multiple apply: {{global_rules.precedence}}
   ●​ Default pattern for confirmations: {{global_rules.confirmation_default}}
   ●​ Default pattern for non-blocking feedback:
      {{global_rules.nonblocking_feedback_default}}
   ●​ Default pattern for blocking errors: {{global_rules.blocking_error_default}}

4) Anti-Patterns (optional)

   ●​ {{anti_patterns[0]}} | OPTIONAL
   ●​ {{anti_patterns[1]}} | OPTIONAL


Cross-References
   ●​ Upstream: {{xref:DES-03}} | OPTIONAL, {{xref:DES-06}} | OPTIONAL, {{xref:DES-07}} |
      OPTIONAL
   ●​ Downstream: {{xref:DSYS-02}} | OPTIONAL, {{xref:FE-02}} | OPTIONAL, {{xref:MOB-*}} |
      OPTIONAL, {{xref:QA-02}} | OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Required. Define 12 patterns with triggers + dismissal + a11y basics.
   ●​ intermediate: Required. Add when_not_to_use and platform fallbacks.
   ●​ advanced: Required. Add global precedence rules and anti-patterns.


Unknown Handling
   ●​ UNKNOWN_ALLOWED: component_mapping, anti_patterns, platform_notes,
      notes
 ●​ If any pattern lacks dismissal rules or accessibility requirements → block Completeness
    Gate.


Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.IXD
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ patterns_count >= 12
       ○​ every_pattern_has_trigger_and_dismissal == true
       ○​ every_pattern_has_a11y_requirements == true
       ○​ global_rules_present == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
