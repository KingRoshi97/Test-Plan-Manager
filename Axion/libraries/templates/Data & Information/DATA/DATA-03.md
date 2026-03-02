DATA-03
DATA-03 — Persistence Rules (indexes,
constraints)
Header Block
   ●​ template_id: DATA-03​

   ●​ title: Persistence Rules (indexes, constraints)​

   ●​ type: data_model_schema​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/data/DATA-03_Persistence_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.DATA​

   ●​ upstream_dependencies: ["DATA-01", "DATA-02", "DQV-01"]​

   ●​ inputs_required: ["DATA-01", "DATA-02", "DQV-01", "SRCH-03", "CACHE-03",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the persistence-layer rules: indexes, uniqueness constraints, foreign key enforcement,
nullability rules, and other DB constraints required to enforce correctness and performance. This
makes persistence deterministic and aligned to query/search/caching needs.


Inputs Required
   ●​ DATA-01: {{xref:DATA-01}} | OPTIONAL​

   ●​ DATA-02: {{xref:DATA-02}} | OPTIONAL​

   ●​ DQV-01: {{xref:DQV-01}} | OPTIONAL​
  ●​ SRCH-03: {{xref:SRCH-03}} | OPTIONAL​

  ●​ CACHE-03: {{xref:CACHE-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Constraint catalog (minimum 20 for non-trivial products; justify if smaller)​

  ●​ Index catalog (minimum 15; justify if smaller)​

  ●​ For each constraint:​

         ○​ con_id​

         ○​ entity_id/table​

         ○​ type (pk/unique/fk/check/not_null)​

         ○​ definition (fields + predicate)​

         ○​ enforcement (db/app)​

         ○​ rationale (correctness/perf/security)​

         ○​ related invariants (DMG-03 pointer) | OPTIONAL​

  ●​ For each index:​

         ○​ idx_id​

         ○​ entity_id/table​

         ○​ fields​

         ○​ type (btree/hash/gin/etc)​

         ○​ uniqueness (true/false)​

         ○​ query pattern supported​
            ○​ write impact note (high/med/low)​

            ○​ maintenance notes | OPTIONAL​



Optional Fields
     ●​ Partitioning policy | OPTIONAL​

     ●​ Notes | OPTIONAL​



Rules
     ●​ Constraints enforce truth; app-only enforcement must be justified.​

     ●​ Indexes must be tied to real query/search patterns (SRCH/CACHE/API usage).​

     ●​ Avoid redundant indexes; include write impact note.​

     ●​ Foreign keys should be DB-enforced unless explicitly incompatible with scale/topology.​



Output Format
1) Constraints Catalog (canonical)
c       entity       type       definition      enforceme       rationale      invariant_re     notes
o                                                   nt                               f
n
_i
d

c     {{constrai   {{constra    {{constraint    {{constraints   {{constrain    {{constraints {{constrai
o     nts[0].ent   ints[0].ty   s[0].definiti   [0].enforcem    ts[0].ration   [0].invariant_ nts[0].not
n     ity}}        pe}}         on}}            ent}}           ale}}          ref}}          es}}
_
0
1
c     {{constrai     {{constra    {{constraint    {{constraints   {{constrain    {{constraints {{constrai
o     nts[1].ent     ints[1].ty   s[1].definiti   [1].enforcem    ts[1].ration   [1].invariant_ nts[1].not
n     ity}}          pe}}         on}}            ent}}           ale}}          ref}}          es}}
_
0
2


2) Index Catalog (canonical)
 id       entity         fields       index_ty       unique       query_pat       write_imp      notes
 x_                                      pe                         tern             act
 id

id     {{indexes[     {{indexes[     {{indexes[ {{indexes[0       {{indexes[0    {{indexes[0   {{indexes[
x_     0].entity}}    0].fields}}    0].type}}  ].unique}}        ].pattern}}    ].impact}}    0].notes}}
01

id     {{indexes[     {{indexes[     {{indexes[ {{indexes[1       {{indexes[1    {{indexes[1   {{indexes[
x_     1].entity}}    1].fields}}    1].type}}  ].unique}}        ].pattern}}    ].impact}}    1].notes}}
02


3) Nullability & Defaults Rules (required)

     ●​ Nullability stance: {{nulls.stance}}​

     ●​ Defaults stance: {{defaults.stance}}​

     ●​ Audit timestamps policy: {{defaults.audit_timestamps}} | OPTIONAL​



4) Partitioning Policy (optional)

     ●​ Applies: {{partitioning.applies}} | OPTIONAL​

     ●​ Strategy: {{partitioning.strategy}} | OPTIONAL​



Cross-References
     ●​ Upstream: {{xref:DATA-01}} | OPTIONAL, {{xref:DATA-02}} | OPTIONAL​
  ●​ Downstream: {{xref:DATA-04}} | OPTIONAL, {{xref:SRCH-03}} | OPTIONAL,
     {{xref:CACHE-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Basic constraints + key indexes.​

  ●​ intermediate: Required. Add rationale and query patterns.​

  ●​ advanced: Required. Add write impact and partitioning (if applicable).​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: partitioning_policy, maintenance_notes, notes,
     invariant_ref​

  ●​ If critical uniqueness constraints are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DATA​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ constraints_count >= 20 (or justified)​

         ○​ indexes_count >= 15 (or justified)​

         ○​ query_patterns_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
