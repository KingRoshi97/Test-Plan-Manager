STK-03
STK-03 — RACI / Ownership Matrix
Header Block
   ●​   template_id: STK-03
   ●​   title: RACI / Ownership Matrix
   ●​   type: stakeholders_governance
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/governance/STK-03_RACI_Ownership.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.GOV
   ●​   upstream_dependencies: ["STK-01"]
   ●​   inputs_required: ["STK-01", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": false}


Purpose
Define operational ownership across recurring responsibilities so execution is deterministic (who
does what). This is the canonical “who is responsible/accountable” table used during build and
release.


Inputs Required
   ●​ STK-01: {{xref:STK-01}}
   ●​ Standards: {{standards.index}} | OPTIONAL


Required Fields
   ●​ Responsibility list (minimum 10 for non-trivial products)
   ●​ For each responsibility:
         ○​ responsibility_id
         ○​ area
         ○​ description
         ○​ R (responsible) stakeholder_id(s)
         ○​ A (accountable) stakeholder_id
         ○​ C (consulted) stakeholder_id(s)
         ○​ I (informed) stakeholder_id(s)


Optional Fields
   ●​ SLA/hand-off notes | OPTIONAL
   ●​ Backup owners | OPTIONAL


Rules
   ●​ A must be exactly one stakeholder.
   ●​ Stakeholder IDs must come from STK-01.
   ●​ Responsibilities must cover at least: product, design, backend, frontend, data, security,
      ops, QA, release.


Output Format
1) RACI Matrix (canonical)
 responsi       area        description        R          A          C          I        notes
  bility_id

resp_01       {{rows[0].   {{rows[0].desc   {{rows[0   {{rows[0   {{rows[0   {{rows[   {{rows[0].
              area}}       ription}}        ].R}}      ].A}}      ].C}}      0].I}}    notes}}


2) Coverage Checklist (required)

   ●​   product covered: {{coverage.product}}
   ●​   design covered: {{coverage.design}}
   ●​   backend covered: {{coverage.backend}}
   ●​   frontend covered: {{coverage.frontend}}
   ●​   data covered: {{coverage.data}}
   ●​   security covered: {{coverage.security}}
   ●​   ops covered: {{coverage.ops}}
   ●​   qa covered: {{coverage.qa}}
   ●​   release covered: {{coverage.release}}


Cross-References
   ●​ Upstream: {{xref:STK-01}}
   ●​ Downstream: {{xref:STK-04}} | OPTIONAL
   ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
   ●​ beginner: Required. Minimum responsibilities + R/A assigned.
   ●​ intermediate: Required. Add C/I lists and coverage checklist.
 ●​ advanced: Not required. (Advanced ops workflows live in OPS/REL.)


Unknown Handling
 ●​ UNKNOWN_ALLOWED: notes, backup_owners
 ●​ If any responsibility has A == UNKNOWN → block Completeness Gate.


Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.GOV
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ responsibilities_count >= 10
       ○​ all_rows_have_A == true
       ○​ coverage_checklist_complete == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
