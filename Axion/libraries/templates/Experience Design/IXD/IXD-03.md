IXD-03
IXD-03 — Transition Map (screen
transitions + durations)
Header Block
   ●​ template_id: IXD-03​

   ●​ title: Transition Map (screen transitions + durations)​

   ●​ type: interaction_design_motion​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design/IXD-03_Transition_Map.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IXD​

   ●​ upstream_dependencies: ["DES-02", "IXD-02", "IAN-01", "IAN-02"]​

   ●​ inputs_required: ["DES-02", "IXD-02", "IAN-01", "IAN-02", "DSYS-01", "A11YD-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical transition behavior between screens and navigation contexts. This ensures
consistent mental model, supports accessibility (reduced motion), and avoids ad-hoc transition
choices in implementation.


Inputs Required
   ●​ DES-02: {{xref:DES-02}}​

   ●​ IAN-01: {{xref:IAN-01}} | OPTIONAL​

   ●​ IAN-02: {{xref:IAN-02}} | OPTIONAL​
  ●​ IXD-02: {{xref:IXD-02}}​

  ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​

  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Navigation contexts covered (stack/tab/drawer/modal/web route changes)​

  ●​ Transition types list (push/pop, modal open/close, tab switch, deep link jump, replace)​

  ●​ Default transition per context​

  ●​ Per-transition mapping:​

         ○​ from_screen_id​

         ○​ to_screen_id​

         ○​ transition_type​

         ○​ intent (why this transition)​

         ○​ duration_ms (must be within IXD-02 bounds)​

         ○​ reduced_motion behavior​

         ○​ interactive gesture (if any) + fallback​

  ●​ Exceptions list (where defaults do not apply) with rationale​



Optional Fields
  ●​ Platform-specific variants | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
  ●​ Transition durations must comply with IXD-02 min/max.​

  ●​ Reduced motion must have an equivalent (instant or minimal) transition.​

  ●​ “Replace” navigation must not look like “back” navigation (avoid confusion).​

  ●​ Modal transitions must respect focus rules and dismissal patterns (IXD-01).​

  ●​ If DES-02 route is unknown, still map via screen_id; route mapping can be filled later.​



Output Format
1) Navigation Context Defaults (required)
 conte   default_transiti         duration_ms        reduced_motion_beha              notes
   xt       on_type                                          vior

stack_ {{defaults.stack_       {{defaults.stack_pu   {{defaults.stack_push.re {{defaults.stack_
push   push.type}}             sh.duration}}         duced_motion}}           push.notes}}

stack_ {{defaults.stack_       {{defaults.stack_po   {{defaults.stack_pop.re    {{defaults.stack_
pop    pop.type}}              p.duration}}          duced_motion}}             pop.notes}}

modal    {{defaults.modal      {{defaults.modal_o    {{defaults.modal_open.r    {{defaults.modal_
_open    _open.type}}          pen.duration}}        educed_motion}}            open.notes}}

modal {{defaults.modal         {{defaults.modal_cl   {{defaults.modal_close.r {{defaults.modal_
_close _close.type}}           ose.duration}}        educed_motion}}          close.notes}}

tab_s    {{defaults.tab_sw {{defaults.tab_switc      {{defaults.tab_switch.re   {{defaults.tab_swi
witch    itch.type}}       h.duration}}              duced_motion}}             tch.notes}}

deep_    {{defaults.deep_l     {{defaults.deep_lin   {{defaults.deep_link.red   {{defaults.deep_li
link     ink.type}}            k.duration}}          uced_motion}}              nk.notes}}


2) Transition Map (required)
from_    to_s   contex       transi   intent   duratio   reduced_      gestur    gestur    notes
scree    cree     t          tion_t             n_ms     motion_be       e       e_fallb
 n_id    n_id                  ype                         havior                 ack
{{map[ {{ma     {{map[    {{map     {{map[    {{map[0    {{map[0].re     {{map[      {{map[0 {{map[
0].fro p[0].t   0].cont   [0].typ   0].inte   ].durati   duced_mot       0].gest     ].fallbac 0].not
m}}    o}}      ext}}     e}}       nt}}      on}}       ion}}           ure}}       k}}       es}}


3) Exceptions (required if any)
 excepti        scope               description              rationale             replacement_rule
  on_id    (context/route/sc
              reen_pair)

ex_01      {{exceptions[0].sc   {{exceptions[0].des      {{exceptions[0].ra    {{exceptions[0].repl
           ope}}                cription}}               tionale}}             acement}}


4) Compliance Checks (required)

   ●​ All durations within bounds: {{checks.durations_within_bounds}}​

   ●​ Reduced motion defined for all transitions: {{checks.reduced_motion_complete}}​

   ●​ Gesture fallbacks present where gestures exist: {{checks.gesture_fallbacks_complete}}​



Cross-References
   ●​ Upstream: {{xref:DES-02}}, {{xref:IXD-02}}, {{xref:IXD-01}} | OPTIONAL​

   ●​ Downstream: {{xref:MOB-01}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL,
      {{xref:ROUTE-*}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Define defaults per context and basic map rows.​

   ●​ intermediate: Required. Add intent, reduced motion behavior, and exceptions.​

   ●​ advanced: Required. Add gesture interaction and enforce compliance checks.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: platform_variants, notes, exceptions (if none,
    explicitly state none)​

 ●​ If any transition lacks reduced_motion_behavior → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.IXD​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ defaults_present_for_all_contexts == true​

        ○​ transition_map_present == true​

        ○​ durations_within_bounds == true​

        ○​ reduced_motion_complete == true​

        ○​ gesture_fallbacks_complete == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
