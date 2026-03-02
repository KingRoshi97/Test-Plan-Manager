IXD-04
IXD-04 — Micro-interactions Spec
(hover/press/drag/feedback)
Header Block
   ●​ template_id: IXD-04​

   ●​ title: Micro-interactions Spec (hover/press/drag/feedback)​

   ●​ type: interaction_design_motion​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design/IXD-04_Micro_Interactions_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IXD​

   ●​ upstream_dependencies: ["IXD-01", "IXD-02", "DES-05", "DES-06", "A11YD-01"]​

   ●​ inputs_required: ["IXD-01", "IXD-02", "DES-05", "DES-06", "DSYS-02", "A11YD-01",
      "A11YD-02", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the small, repeatable interaction feedback behaviors (micro-interactions) that
communicate system state and affordances: hover, press, focus, drag, loading spinners,
success confirmations, and subtle error feedback. These must be accessible, consistent, and
implementable across platforms.


Inputs Required
   ●​ IXD-01: {{xref:IXD-01}} | OPTIONAL​

   ●​ IXD-02: {{xref:IXD-02}} | OPTIONAL​
  ●​ DES-05: {{xref:DES-05}} | OPTIONAL​

  ●​ DES-06: {{xref:DES-06}} | OPTIONAL​

  ●​ DSYS-02: {{xref:DSYS-02}} | OPTIONAL​

  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ A11YD-02: {{xref:A11YD-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Interaction types covered (minimum: hover, press/tap, focus, drag, disabled, loading,
     success, error)​

  ●​ For each interaction:​

         ○​ interaction_id​

         ○​ target element types (button, list item, input, card, icon, etc.)​

         ○​ trigger (what user does / what system state)​

         ○​ visual feedback description (non-visual wording, no colors)​

         ○​ motion behavior (if any) + duration bounds compliance​

         ○​ haptic/audio (if mobile) + default off policy​

         ○​ accessibility behavior (focus, SR announcement if applicable)​

         ○​ do/don’t rules​

         ○​ reduced motion behavior​

  ●​ Consistency rules (priority order if multiple micro-interactions apply)​



Optional Fields
   ●​ Component-specific overrides | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Micro-interactions must never be the only signal; pair with non-motion cues.​

   ●​ Hover interactions must have keyboard/focus equivalents.​

   ●​ Drag interactions must have a non-drag alternative (buttons, menus, etc.).​

   ●​ Loading must have a maximum “no feedback” time; if longer, show progress state.​

   ●​ Do not encode meaning only in color; describe feedback in state terms.​



Output Format
1) Micro-interactions Catalog (canonical)
inte   eleme     trigg     feedb     motio    durati   reduced      a11y    mobil    do_do   note
ract   nt_typ      er       ack       n       on_m     _motion      _beh    e_hap      nt     s
 ion     es                                     s                   avior   tics_a
 _id                                                                         udio

mi_    {{micro   {{micr    {{micro   {{micr   {{micr   {{micro[0]   {{mic {{micro {{micr     {{mic
hov    [0].ele   o[0].tr   [0].fee   o[0].m   o[0].d   .reduced     ro[0]. [0].mo o[0].d     ro[0].
er     ments}    igger}    dback}    otion}   uratio   _motion}}    a11y} bile}}  o_don      notes
       }         }         }         }        n}}                   }             t}}        }}

mi_    {{micro   {{micr    {{micro   {{micr   {{micr   {{micro[1]   {{mic {{micro {{micr     {{mic
pre    [1].ele   o[1].tr   [1].fee   o[1].m   o[1].d   .reduced     ro[1]. [1].mo o[1].d     ro[1].
ss     ments}    igger}    dback}    otion}   uratio   _motion}}    a11y} bile}}  o_don      notes
       }         }         }         }        n}}                   }             t}}        }}


2) Detailed Rules (required)

Hover / Focus

   ●​ Hover feedback: {{rules.hover.feedback}}​
   ●​ Focus feedback: {{rules.focus.feedback}}​

   ●​ Keyboard equivalence: {{rules.hover.keyboard_equivalence}}​


Press / Tap

   ●​ Press down: {{rules.press.down}}​

   ●​ Release: {{rules.press.release}}​

   ●​ Disabled press: {{rules.press.disabled}}​


Drag / Reorder / Swipe

   ●​ Drag affordance: {{rules.drag.affordance}}​

   ●​ Drag start threshold: {{rules.drag.threshold}} | OPTIONAL​

   ●​ Drop confirmation: {{rules.drag.confirmation}}​

   ●​ Non-drag fallback: {{rules.drag.fallback}}​


Loading / Success / Error micro-feedback

   ●​ Loading feedback: {{rules.loading.feedback}}​

   ●​ Max no-feedback time: {{rules.loading.max_no_feedback_ms}}​

   ●​ Success feedback: {{rules.success.feedback}}​

   ●​ Error feedback: {{rules.error.feedback}}​



3) Consistency / Precedence (required)

   ●​ If disabled, disabled state overrides all: {{precedence.disabled_overrides_all}}​

   ●​ If loading, loading overrides hover/press: {{precedence.loading_overrides}}​

   ●​ If error, error feedback overrides success: {{precedence.error_overrides_success}}​
4) Overrides (optional)
target (component_id/pattern_id)            override                     rationale

{{overrides[0].target}}             {{overrides[0].override}}   {{overrides[0].rationale}}


Cross-References
  ●​ Upstream: {{xref:IXD-01}}, {{xref:IXD-02}}, {{xref:DES-05}} | OPTIONAL, {{xref:DES-06}}
     | OPTIONAL​

  ●​ Downstream: {{xref:DSYS-02}} | OPTIONAL, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} |
     OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Cover hover/press/focus/loading/error/success with clear feedback
     rules.​

  ●​ intermediate: Required. Add drag fallbacks and precedence rules.​

  ●​ advanced: Required. Add mobile haptics/audio defaults and overrides.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: mobile_haptics_audio, overrides, notes,
      drag_start_threshold​

  ●​ If max_no_feedback_ms is UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IXD​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ interaction_types_minimum_covered == true​

       ○​ hover_has_focus_equivalent == true​

       ○​ drag_has_fallback == true​

       ○​ precedence_rules_present == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true​
