URD-03
URD-03 — User Needs & Pain Points
(ranked)
Header Block
   ●​ template_id: URD-03
   ●​ title: User Needs & Pain Points (ranked)
   ●​ type: user_research
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/research/URD-03_Needs_PainPoints.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.RESEARCH
   ●​ upstream_dependencies: ["URD-02"]
   ●​ inputs_required: ["URD-02", "PRD-03", "PRD-04", "GLOSSARY",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Convert research themes into a ranked catalog of user needs and pain points. This provides a
deterministic input to prioritization, feature shaping, UX flows, and acceptance criteria without
redefining implementation.


Inputs Required
   ●​   URD-02: {{xref:URD-02}}
   ●​   PRD-03: {{xref:PRD-03}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   GLOSSARY: {{glossary.terms}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Raw evidence links: {{inputs.evidence_links}} | OPTIONAL


Required Fields
   ●​ Needs list (minimum 5)
   ●​ Pain points list (minimum 5)
   ●​ For each item:
         ○​ item_id
         ○​ type (need / pain_point)
          ○​ statement
          ○​ impacted persona(s)
          ○​ severity/importance (1–5 or low/med/high)
          ○​ frequency signal (qualitative)
          ○​ supporting evidence pointer(s)
          ○​ mapped theme_id(s)
          ○​ mapped feature_ids (if applicable)
          ○​ rank (overall)
    ●​ Top 3 needs summary
    ●​ Top 3 pain points summary


Optional Fields
    ●​ Segment differences (per persona/tier) | OPTIONAL
    ●​ Opportunity notes (what to build/change) | OPTIONAL
    ●​ Open questions | OPTIONAL


Rules
    ●​   Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
    ●​   Every need/pain point must map to at least one theme_id from URD-02.
    ●​   Evidence pointers must exist for high-ranked items (top 5).
    ●​   Feature mapping is optional at this stage; if present, only use existing IDs from PRD-04.
    ●​   Do not translate directly into requirements here; recommendations live in URD-02 and
         changes are tracked via STK decisions.


Output Format
1) Ranked Needs & Pain Points (canonical)
it ty      statem     person     severit    freque     rank    theme_     eviden     mappe      note
e pe         ent       a_ids     y_or_i     ncy_si               ids      ce_poi     d_featu     s
m                                mporta      gnal                          nters     re_ids
_                                 nce
 i
d

n    ne    {{items[   {{items[   {{items[   {{items[   {{ite   {{items[   {{items    {{items[   {{item
_    ed    0].state   0].perso   0].sever   0].frequ   ms[0]   0].them    [0].evid   0].featu   s[0].n
0          ment}}     na_ids}}   ity}}      ency}}     .rank   e_ids}}    ence}}     re_ids}}   otes}}
1                                                      }}
p    pa   {{items[   {{items[   {{items[   {{items[   {{ite   {{items[   {{items    {{items[   {{item
_    in   1].state   1].perso   1].sever   1].frequ   ms[1]   1].them    [1].evid   1].featu   s[1].n
0    _p   ment}}     na_ids}}   ity}}      ency}}     .rank   e_ids}}    ence}}     re_ids}}   otes}}
1    oi                                               }}
     nt


2) Top Needs Summary (required)

    1.​ {{top_needs[0]}}
    2.​ {{top_needs[1]}}
    3.​ {{top_needs[2]}}

3) Top Pain Points Summary (required)

    1.​ {{top_pains[0]}}
    2.​ {{top_pains[1]}}
    3.​ {{top_pains[2]}}

4) Persona/Segment Differences (optional)

    ●​ {{segment_differences[0]}} | OPTIONAL
    ●​ {{segment_differences[1]}} | OPTIONAL

5) Opportunity Notes (optional)

    ●​ {{opportunities[0]}} | OPTIONAL
    ●​ {{opportunities[1]}} | OPTIONAL

6) Open Questions (optional)

    ●​ {{open_questions[0]}} | OPTIONAL
    ●​ {{open_questions[1]}} | OPTIONAL


Cross-References
    ●​ Upstream: {{xref:URD-02}}, {{xref:PRD-03}} | OPTIONAL
    ●​ Downstream: {{xref:PRD-04}} | OPTIONAL, {{xref:DES-01}} | OPTIONAL,
       {{xref:PRD-09}} | OPTIONAL, {{xref:RSC-03}} | OPTIONAL
    ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
 ●​ beginner: Required. Minimum 5 needs + 5 pain points; keep evidence pointers simple.
 ●​ intermediate: Required. Rank items and map to themes; add persona coverage.
 ●​ advanced: Required. Add opportunity notes and stronger mapping to feature IDs where
    possible.


Unknown Handling
 ●​ UNKNOWN_ALLOWED: mapped_feature_ids, segment_differences,
    opportunities, open_questions, frequency_signal (qualitative)
 ●​ If any top-5 ranked item lacks evidence pointers → block Completeness Gate.


Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.RESEARCH
 ●​ Pass conditions:
       ○​ required_fields_present == true
       ○​ needs_count >= 5
       ○​ pain_points_count >= 5
       ○​ every_item_has_theme_mapping == true
       ○​ top5_have_evidence == true
       ○​ placeholder_resolution == true
       ○​ no_unapproved_unknowns == true
