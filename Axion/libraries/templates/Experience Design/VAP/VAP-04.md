VAP-04
VAP-04 — Asset Delivery Checklist
(handoff requirements)
Header Block
   ●​ template_id: VAP-04​

   ●​ title: Asset Delivery Checklist (handoff requirements)​

   ●​ type: visual_asset_production​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/assets/VAP-04_Asset_Delivery_Checklist.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ASSETS​

   ●​ upstream_dependencies: ["VAP-01", "VAP-02"]​

   ●​ inputs_required: ["VAP-01", "VAP-02", "RLB-05", "A11YD-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the deterministic handoff checklist for delivering assets to engineering: what must be
provided, where it goes, how it is verified, and what “done” means. This prevents incomplete or
inconsistent asset deliveries.


Inputs Required
   ●​ VAP-01: {{xref:VAP-01}} | OPTIONAL​

   ●​ VAP-02: {{xref:VAP-02}} | OPTIONAL​

   ●​ RLB-05: {{xref:RLB-05}} | OPTIONAL​
  ●​ A11YD-03: {{xref:A11YD-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Delivery package definition (folders + files expected)​

  ●​ Checklist items (minimum 20)​

  ●​ Verification steps (minimum 8)​

  ●​ For each delivered asset set:​

         ○​ asset_ids included​

         ○​ naming compliance check​

         ○​ density coverage check​

         ○​ theme coverage check (if applicable)​

         ○​ accessibility coverage (alt text/classification)​

         ○​ optimization check (size/compression)​

         ○​ version tagging rule (if applicable)​

  ●​ Acceptance criteria for “handoff complete”​



Optional Fields
  ●​ Release milestone mapping | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ Handoff is not complete unless naming and export specs are met (VAP-02).​

   ●​ Accessibility metadata must be included for informative assets (alt/labels).​

   ●​ Engineering must have deterministic paths and keys for consumption.​



Output Format
1) Delivery Package (required)

   ●​ Base path: {{delivery.base_path}}​

   ●​ Folder structure: {{delivery.folder_structure}}​

   ●​ Included file types: {{delivery.file_types}}​



2) Checklist (required, min 20)

   ●​ {{checklist[0]}}​

   ●​ {{checklist[1]}}​

   ●​ {{checklist[2]}}​

   ●​ {{checklist[3]}}​

   ●​ {{checklist[4]}}​

   ●​ {{checklist[5]}} | OPTIONAL​



3) Verification Steps (required, min 8)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​

   ●​ {{verify[3]}}​
  ●​ {{verify[4]}}​

  ●​ {{verify[5]}} | OPTIONAL​



4) Asset Set Validation Table (required)
ass    asset_i        naming_      densities     themes_       a11y_o      optimi     version_    notes
et_s     ds             ok           _ok            ok            k        zation_      tag
et_i                                                                         ok
 d

set_   {{sets[0]      {{sets[0].   {{sets[0].d   {{sets[0].t   {{sets[0]   {{sets[0   {{sets[0].v {{sets[
01     .asset_i       naming_      ensities_o    hemes_o       .a11y_o     ].opt_o    ersion_ta 0].note
       ds}}           ok}}         k}}           k}}           k}}         k}}        g}}         s}}


5) Handoff Complete Criteria (required)

  ●​ All VAP-01 assets delivered or explicitly deferred: {{done.all_assets_accounted}}​

  ●​ Naming/export spec compliance: {{done.spec_compliance}}​

  ●​ A11y metadata complete: {{done.a11y_complete}}​

  ●​ Verified by: {{done.verified_by}}​



Cross-References
  ●​ Upstream: {{xref:VAP-01}} | OPTIONAL, {{xref:VAP-02}} | OPTIONAL, {{xref:RLB-05}} |
     OPTIONAL​

  ●​ Downstream: {{xref:FE-}} | OPTIONAL, {{xref:FPMP-}} | OPTIONAL, {{xref:QA-02}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Checklist + delivery package + done criteria.​
 ●​ intermediate: Required. Add validation table and verification steps.​

 ●​ advanced: Required. Add version tagging and milestone mapping.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: milestone_mapping, version_tagging, notes​

 ●​ If delivery.base_path is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ASSETS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ checklist_count >= 20​

        ○​ verification_steps_count >= 8​

        ○​ asset_set_validation_present == true​

        ○​ done_criteria_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
