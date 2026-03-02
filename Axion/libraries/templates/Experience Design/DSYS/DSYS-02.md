DSYS-02
DSYS-02 — Component Variants Spec
(props, variants, states)
Header Block
   ●​ template_id: DSYS-02​

   ●​ title: Component Variants Spec (props, variants, states)​

   ●​ type: design_system_tokens​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design_system/DSYS-02_Component_Variants_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DSYS​

   ●​ upstream_dependencies: ["DSYS-01", "DES-04", "A11YD-01"]​

   ●​ inputs_required: ["DSYS-01", "DES-04", "A11YD-01", "A11YD-02", "A11YD-05",
      "IXD-01", "IXD-04", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the design-system component contract: which components exist, what variants they
support, what states they must handle, and what props/inputs they accept at a conceptual level.
This enables FE/MOB to implement consistently without inventing component behavior.


Inputs Required
   ●​ DSYS-01: {{xref:DSYS-01}}​

   ●​ DES-04: {{xref:DES-04}} | OPTIONAL​

   ●​ IXD-01: {{xref:IXD-01}} | OPTIONAL​
  ●​ IXD-04: {{xref:IXD-04}} | OPTIONAL​

  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ A11YD-02: {{xref:A11YD-02}} | OPTIONAL​

  ●​ A11YD-05: {{xref:A11YD-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Component list (minimum 12 for non-trivial products)​

  ●​ For each component:​

         ○​ dsys_component_id (or component_id alignment to DES-04)​

         ○​ name​

         ○​ purpose​

         ○​ supported variants (e.g., size, style, intent)​

         ○​ required states (default/hover/active/focus/disabled/loading/error)​

         ○​ props/inputs (conceptual; name + meaning)​

         ○​ output events (onClick/onChange/etc.)​

         ○​ accessibility contract (keyboard, focus, labels, SR semantics)​

         ○​ content rules (label length, wrapping, truncation policy)​

         ○​ motion hooks (if any; reference IXD)​

  ●​ Variant consistency rules (what “primary/secondary/destructive” means across
     components)​

  ●​ State precedence rules (disabled overrides hover, etc.)​
Optional Fields
   ●​ Platform-specific differences (web/mobile) | OPTIONAL​

   ●​ Deprecation/compat notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Each component must declare its required states; missing states are not allowed.​

   ●​ “Focus” behavior must be explicit and align with A11Y focus specs.​

   ●​ Variants must be semantic (intent-driven), not “random style names.”​

   ●​ Any motion hooks must respect IXD reduce-motion rules.​

   ●​ Props must be stable; changes require versioning notes.​



Output Format
1) Variant Semantics (required)

Define shared meaning for common variant names.

 variant_            meaning                        do                        dont
  name

primary     {{variant_semantics.primary. {{variant_semantics.pri    {{variant_semantics.prim
            meaning}}                    mary.do}}                  ary.dont}}

seconda     {{variant_semantics.second    {{variant_semantics.sec   {{variant_semantics.seco
ry          ary.meaning}}                 ondary.do}}               ndary.dont}}

destructi   {{variant_semantics.destruc   {{variant_semantics.des   {{variant_semantics.destr
ve          tive.meaning}}                tructive.do}}             uctive.dont}}


2) State Precedence Rules (required)
   ●​ disabled overrides hover/active/focus: {{state_precedence.disabled}}​

   ●​ loading overrides interaction (unless cancel): {{state_precedence.loading}}​

   ●​ error overrides success feedback: {{state_precedence.error}} | OPTIONAL​



3) Component Contract Catalog (canonical)
  co    nam     purp      varia     requi    prop    outp     a11y    conte motio         platfo    note
 mp      e      ose        nts      red_     s_in    ut_ev    _con    nt_ru n_ho          rm_n       s
 one                                state    puts    ents     tract    les   oks           otes
 nt_i                                 s
   d

{{co    {{co    {{com     {{com     {{co     {{co    {{com    {{co    {{com     {{com     {{com     {{co
mpo     mpon    ponen     ponen     mpon     mpon    pone     mpo     pone      pone      ponen     mpo
nent    ents[   ts[0].p   ts[0].v   ents[    ents[   nts[0]   nent    nts[0].   nts[0].   ts[0].p   nents
s[0].   0].na   urpos     ariant    0].sta   0].pr   .even    s[0].   conte     motio     latfor    [0].n
id}}    me}}    e}}       s}}       tes}}    ops}}   ts}}     a11y    nt}}      n}}       m}}       otes}
                                                              }}                                    }

{{co    {{co    {{com     {{com     {{co     {{co    {{com    {{co    {{com     {{com     {{com     {{co
mpo     mpon    ponen     ponen     mpon     mpon    pone     mpo     pone      pone      ponen     mpo
nent    ents[   ts[1].p   ts[1].v   ents[    ents[   nts[1]   nent    nts[1].   nts[1].   ts[1].p   nents
s[1].   1].na   urpos     ariant    1].sta   1].pr   .even    s[1].   conte     motio     latfor    [1].n
id}}    me}}    e}}       s}}       tes}}    ops}}   ts}}     a11y    nt}}      n}}       m}}       otes}
                                                              }}                                    }


4) Coverage Checks (required)

   ●​ Components cover DES-04 inventory: {{coverage.covers_des04}} | OPTIONAL​

   ●​ Required states present for all components: {{coverage.states_complete}}​

   ●​ A11y contract present for all interactive components: {{coverage.a11y_complete}}​



Cross-References
   ●​ Upstream: {{xref:DSYS-01}}, {{xref:DES-04}} | OPTIONAL​
  ●​ Downstream: {{xref:FE-02}} | OPTIONAL, {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} |
     OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Define component list + variants + required states.​

  ●​ intermediate: Required. Add props/events and state precedence.​

  ●​ advanced: Required. Add a11y contracts, content rules, and motion hooks.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: platform_notes, deprecation_notes, notes,
     motion_hooks (if none)​

  ●​ If any interactive component lacks a11y_contract → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DSYS​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ components_count >= 12​

         ○​ required_states_complete == true​

         ○​ a11y_contract_complete == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true​
