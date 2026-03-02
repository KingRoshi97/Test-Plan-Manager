CACHE-03
CACHE-03 — Consistency Model
(strong/eventual/stale-while-revalidate)
Header Block
   ●​ template_id: CACHE-03​

   ●​ title: Consistency Model (strong/eventual/stale-while-revalidate)​

   ●​ type: caching_data_access_patterns​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/caching/CACHE-03_Consistency_Model.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CACHE​

   ●​ upstream_dependencies: ["DATA-07", "DATA-08", "ERR-05", "DES-05"]​

   ●​ inputs_required: ["DATA-07", "DATA-08", "ERR-05", "DES-05", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical consistency guarantees for cached and read-model data: which parts of
the system must be strongly consistent, which can be eventually consistent, and where
stale-while-revalidate (SWR) is allowed. This aligns backend behavior with UX expectations and
prevents “mystery staleness.”


Inputs Required
   ●​ DATA-07: {{xref:DATA-07}} | OPTIONAL​

   ●​ DATA-08: {{xref:DATA-08}} | OPTIONAL​

   ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​
  ●​ DES-05: {{xref:DES-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Consistency modes definitions:​

         ○​ strong​

         ○​ eventual​

         ○​ stale-while-revalidate (SWR)​

  ●​ Consistency requirements by domain surface (minimum 12 entries):​

         ○​ surface/operation (screen_id/endpoint_id/read_model_id/cache_id)​

         ○​ consistency mode​

         ○​ maximum staleness (if not strong)​

         ○​ user-visible behavior (loading/stale badge/retry)​

         ○​ reconciliation behavior (when fresh data arrives)​

         ○​ reason_code/UX mapping pointer (ERR/DES/CDX) | OPTIONAL​

  ●​ Default consistency stance (system-wide)​

  ●​ Exceptions policy (when strong is mandatory)​



Optional Fields
  ●​ Multi-region notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Any operation that changes money, permissions, or critical state should default to strong
     consistency unless explicitly justified.​

  ●​ SWR must specify UI behavior and max staleness.​

  ●​ Eventual consistency must specify convergence path (what triggers revalidation).​

  ●​ Consistency definitions must be used by CACHE-01 candidates and DATA-07 read
     models.​



Output Format
1) Mode Definitions (required)

  ●​ strong: {{modes.strong}}​

  ●​ eventual: {{modes.eventual}}​

  ●​ swr: {{modes.swr}}​



2) Consistency Requirements Matrix (canonical)
  target          kind            mode      max_stale      user_visi      reconcile_      notes
            (screen/endpoint                  ness         ble_beha        behavior
            /read_model/cac                                   vior
                   he)

{{matrix[0 {{matrix[0].kind}}    {{matrix[0 {{matrix[0].   {{matrix[0].   {{matrix[0].   {{matrix[
].target}}                       ].mode}} staleness}}      ux}}           reconcile}}    0].notes}
                                                                                         }

{{matrix[1 {{matrix[1].kind}}    {{matrix[1 {{matrix[1].   {{matrix[1].   {{matrix[1].   {{matrix[
].target}}                       ].mode}} staleness}}      ux}}           reconcile}}    1].notes}
                                                                                         }


3) Default Stance (required)

  ●​ Default mode: {{defaults.mode}}​

  ●​ Default max staleness (if applicable): {{defaults.max_staleness}} | OPTIONAL​
4) Exceptions Policy (required)

  ●​ Strong required when: {{exceptions.strong_required_when}}​

  ●​ Approval needed for eventual/SWR on critical flows: {{exceptions.approval}} |
     OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DATA-07}} | OPTIONAL, {{xref:DES-05}} | OPTIONAL, {{xref:ERR-05}} |
     OPTIONAL​

  ●​ Downstream: {{xref:CACHE-01}}, {{xref:CACHE-02}} | OPTIONAL, {{xref:CACHE-06}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Mode definitions + default stance.​

  ●​ intermediate: Required. Add matrix with max staleness + UX behavior.​

  ●​ advanced: Required. Add reconciliation rules and exceptions governance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: multi_region_notes, notes, approval_policy​

  ●​ If any non-strong entry lacks max_staleness or user-visible behavior → block
     Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.CACHE​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ mode_definitions_present == true​

       ○​ matrix_present == true​

       ○​ non_strong_have_staleness_and_ux == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
