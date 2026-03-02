DATA-04
DATA-04 — Migration Plan (schema
evolution)
Header Block
   ●​ template_id: DATA-04​

   ●​ title: Migration Plan (schema evolution)​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-04_Migration_Plan.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DATA-01", "DATA-02", "APIG-06", "REL-04"]​

   ●​ inputs_required: ["DATA-01", "DATA-02", "DATA-03", "APIG-06", "REL-04", "SBDT-06",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the deterministic plan for evolving the database schema safely: migration sequencing,
expand/contract approach, backfills, verification steps, and rollback posture. This prevents
breaking running systems and supports mixed-version deployments.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DATA-02: {{xref:DATA-02}} | OPTIONAL​

   ●​ DATA-03: {{xref:DATA-03}} | OPTIONAL​
  ●​ APIG-06: {{xref:APIG-06}} | OPTIONAL​

  ●​ REL-04: {{xref:REL-04}} | OPTIONAL​

  ●​ SBDT-06: {{xref:SBDT-06}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Migration philosophy (expand/contract default stance)​

  ●​ Migration categories:​

         ○​ additive (safe)​

         ○​ backfill required​

         ○​ destructive (breaking)​

  ●​ Migration runbook (high level):​

         ○​ create migration​

         ○​ apply in stage​

         ○​ verify​

         ○​ apply in prod​

  ●​ Migration registry (minimum 10 if system evolves; justify if initial)​

  ●​ For each planned migration:​

         ○​ mig_id​

         ○​ description​

         ○​ affected entities/tables​

         ○​ category​
         ○​ steps (ordered)​

         ○​ backfill required (yes/no)​

         ○​ verification queries/checks​

         ○​ rollback strategy (rollback/roll-forward)​

         ○​ compatibility notes (old+new code)​

         ○​ owner​

  ●​ Safety constraints:​

         ○​ no long locks policy​

         ○​ batching rules for backfills​

         ○​ maintenance window policy (if any)​



Optional Fields
  ●​ Tooling (Drizzle/Prisma/etc) notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Destructive migrations require explicit approval and a rollback/roll-forward plan.​

  ●​ Backfills must be resumable and observable.​

  ●​ All migrations must include verification steps.​

  ●​ Migration steps must align with deployment constraints (SBDT-06).​



Output Format
1) Migration Philosophy (required)
      ●​ Default stance: {{philosophy.default}} (expand/contract)​

      ●​ Compatibility rule: {{philosophy.compatibility}}​

      ●​ Verification requirement: {{philosophy.verification}}​



2) Migration Runbook (required)

      1.​ Create migration: {{runbook.create}}​

      2.​ Stage apply: {{runbook.stage_apply}}​

      3.​ Verify: {{runbook.verify}}​

      4.​ Prod apply: {{runbook.prod_apply}}​

      5.​ Post-apply monitor: {{runbook.monitor}} | OPTIONAL​



3) Migration Registry (canonical)
 m      descr    tables    catego       steps     backfil   verific   rollbac   compa     owner   notes
 ig     iption               ry                     l        ation       k      t_note
 _i                                                                                s
  d

mi {{mig         {{migs {{migs[         {{migs    {{migs[   {{migs {{migs[      {{migs[   {{migs[ {{migs
g s[0].d         [0].tabl 0].cate       [0].ste   0].back   [0].veri 0].rollb   0].com    0].own [0].not
_ esc}}          es}}     gory}}        ps}}      fill}}    fy}}     ack}}      pat}}     er}}    es}}
0
0
1

mi {{mig         {{migs {{migs[         {{migs    {{migs[   {{migs {{migs[      {{migs[   {{migs[ {{migs
g s[1].d         [1].tabl 1].cate       [1].ste   1].back   [1].veri 1].rollb   1].com    1].own [1].not
_ esc}}          es}}     gory}}        ps}}      fill}}    fy}}     ack}}      pat}}     er}}    es}}
0
0
2


4) Safety Constraints (required)

      ●​ No long locks policy: {{safety.no_long_locks}}​
  ●​ Backfill batching: {{safety.backfill_batching}}​

  ●​ Maintenance window policy: {{safety.maintenance_window}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:APIG-06}} | OPTIONAL, {{xref:SBDT-06}} | OPTIONAL​

  ●​ Downstream: {{xref:REL-04}} | OPTIONAL, {{xref:BDR-03}} | OPTIONAL, {{xref:QA-05}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Philosophy + runbook + registry skeleton.​

  ●​ intermediate: Required. Add verification and compatibility notes per migration.​

  ●​ advanced: Required. Add rollback/roll-forward posture and safety constraints.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: tooling_notes, maintenance_window, notes​

  ●​ If any migration lacks verification steps → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DATA​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​
○​ runbook_present == true​

○​ registry_present == true​

○​ verification_present_for_all_migrations == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
