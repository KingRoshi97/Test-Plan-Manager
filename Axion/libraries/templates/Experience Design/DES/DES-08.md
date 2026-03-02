DES-08
DES-08 — Acceptance Hooks (screen/flow
→ PRD-09 criteria mapping)
Header Block
   ●​   template_id: DES-08
   ●​   title: Acceptance Hooks (screen/flow → PRD-09 criteria mapping)
   ●​   type: design_ux
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/design/DES-08_Acceptance_Hooks.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DESIGN
   ●​   upstream_dependencies: ["DES-01", "DES-02", "PRD-09"]
   ●​   inputs_required: ["DES-01", "DES-02", "PRD-09", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Create a deterministic mapping from acceptance criteria (PRD-09) to the UX surfaces where
they are satisfied (flows/screens) so QA and implementation can prove completion without
ambiguity.


Inputs Required
   ●​   DES-01: {{xref:DES-01}}
   ●​   DES-02: {{xref:DES-02}}
   ●​   PRD-09: {{xref:PRD-09}}
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Mapping table:
         ○​ ac_id → flow_id(s) + screen_id(s)
   ●​ Coverage check:
         ○​ every P0 acceptance criterion has at least one hook
   ●​ Notes on multi-surface criteria (where multiple screens satisfy one criterion)


Optional Fields
   ●​ Endpoint/component pointers | OPTIONAL
   ●​ Test case pointers | OPTIONAL
   ●​ Notes | OPTIONAL


Rules
   ●​ Only reference existing IDs: ac_* from PRD-09, flow_* from DES-01, screen_* from
      DES-02.
   ●​ This does not define tests; it defines where criteria are satisfied.
   ●​ If any P0 acceptance criterion lacks a hook, gate fails.


Output Format
1) Acceptance Hooks Map (canonical)
  ac_id      feature_id    mapped_f      mapped_s        notes      mapped_en     mapped_co
                            low_ids      creen_ids                  dpoint_ids    mponent_ids

{{hooks[    {{hooks[0].f   {{hooks[0].   {{hooks[0].s   {{hooks[    {{hooks[0].en {{hooks[0].co
0].ac_id}   eature_id}}    flow_ids}}    creen_ids}}    0].notes}   dpoint_ids}}  mponent_ids}}
}                                                       }


2) Coverage (required)
 priority         total_ac                 hooked_ac                 missing_ac_ids

P0          {{coverage.p0.total}}   {{coverage.p0.hooked}}       {{coverage.p0.missing}}

P1          {{coverage.p1.total}}   {{coverage.p1.hooked}}       {{coverage.p1.missing}}


Cross-References
   ●​ Upstream: {{xref:PRD-09}}, {{xref:DES-01}}, {{xref:DES-02}}
   ●​ Downstream: {{xref:QA-02}} | OPTIONAL, {{xref:MAP-04}} | OPTIONAL, {{xref:TRC-02}}
      | OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Required. Map P0 criteria to at least one flow and screen.
   ●​ intermediate: Required. Add feature_id and multi-surface notes.
   ●​ advanced: Required. Add endpoint/component pointers when known.
Unknown Handling
 ●​ UNKNOWN_ALLOWED: mapped_endpoint_ids, mapped_component_ids, notes,
    test_case_pointers
 ●​ If any P0 ac_id is missing mapping → block Completeness Gate.


Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.DESIGN
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ every_p0_ac_has_hook == true
       ○​ ids_reference_valid_sources == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
Interaction Design & Motion (IXD)
Interaction Design & Motion (IXD)​
 IXD-01 Interaction Patterns Catalog (modals, drawers, menus, gestures)​
 IXD-02 Motion Rules (when/why/constraints)​
 IXD-03 Transition Map (screen transitions + durations)​
 IXD-04 Micro-interactions Spec (hover/press/drag/feedback)​
 IXD-05 Accessibility-Safe Motion Rules (reduce motion compliance)
