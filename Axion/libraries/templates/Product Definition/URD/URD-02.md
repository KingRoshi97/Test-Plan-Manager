URD-02
URD-02 — Findings Summary (themes +
evidence)
Header Block
   ●​ template_id: URD-02​

   ●​ title: Findings Summary (themes + evidence)​

   ●​ type: user_research​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/research/URD-02_Findings_Summary.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RESEARCH​

   ●​ upstream_dependencies: ["URD-01"]​

   ●​ inputs_required: ["URD-01", "PRD-01", "PRD-02", "PRD-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Capture research outcomes as clear themes supported by evidence. This document turns raw
notes into actionable insights and creates traceable inputs for needs/pain points, journey
mapping, PRD refinements, and risk reduction.


Inputs Required
   ●​ URD-01: {{xref:URD-01}}​

   ●​ PRD-01: {{xref:PRD-01}} | OPTIONAL​

   ●​ PRD-02: {{xref:PRD-02}} | OPTIONAL​
  ●​ PRD-03: {{xref:PRD-03}} | OPTIONAL​

  ●​ Raw notes/transcripts: {{inputs.raw_notes}} | OPTIONAL​

  ●​ Recordings: {{inputs.recordings}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Study metadata (dates, methods used, sample)​

  ●​ Participants summary (count + key segments)​

  ●​ Themes list (minimum 3)​

  ●​ For each theme:​

         ○​ theme_id​

         ○​ statement (1–2 sentences)​

         ○​ supporting evidence (quotes/observations)​

         ○​ frequency/strength signal (qualitative)​

         ○​ impacted personas​

         ○​ mapped research question IDs​

         ○​ implications (what it means for product)​

  ●​ Top insights (top 3–7)​

  ●​ Recommendations (what to do next) (3–10)​

  ●​ Limitations / confidence notes​



Optional Fields
  ●​ Contradictions / outliers | OPTIONAL​

  ●​ Artifact links (notes repository) | OPTIONAL​

  ●​ Open questions | OPTIONAL​



Rules
  ●​ Must align to: {{standards.rules[STD-PRIVACY]}} | OPTIONAL​

  ●​ Evidence must be anonymized unless explicitly allowed.​

  ●​ Themes must map back to URD-01 research questions where possible.​

  ●​ Do not convert recommendations into requirements here; PRD updates happen
     downstream and must be tracked as decisions if changed.​

  ●​ If evidence is missing for a theme, the theme cannot be included (fails gate).​



Output Format
1) Study Metadata

  ●​ Study name: {{study.name}}​

  ●​ Dates: {{study.dates}}​

  ●​ Methods used: {{study.methods_used}}​

  ●​ Owner: {{study.owner}}​

  ●​ Stakeholders: {{study.stakeholders}} | OPTIONAL​



2) Participants Summary

  ●​ Total participants: {{participants.total}}​

  ●​ Segments represented: {{participants.segments}} | OPTIONAL​
   ●​ Primary personas: {{participants.persona_ids}} | OPTIONAL​

   ●​ Recruitment notes: {{participants.recruitment_notes}} | OPTIONAL​



3) Themes (required)
 them    theme_statem     strength_sig     impacted_pers      mapped_rq         implications
  e_id       ent               nal            ona_ids           _ids

th_01 {{themes[0].sta     {{themes[0].st   {{themes[0].pers   {{themes[0].r   {{themes[0].impli
      tement}}            rength}}         ona_ids}}          q_ids}}         cations}}

th_02 {{themes[1].sta     {{themes[1].st   {{themes[1].pers   {{themes[1].r   {{themes[1].impli
      tement}}            rength}}         ona_ids}}          q_ids}}         cations}}

th_03 {{themes[2].sta     {{themes[2].st   {{themes[2].pers   {{themes[2].r   {{themes[2].impli
      tement}}            rength}}         ona_ids}}          q_ids}}         cations}}


4) Evidence Blocks (required, per theme)

th_01 — {{themes[0].statement}}

   ●​ Evidence (anonymized):​

           ○​ {{themes[0].evidence[0]}}​

           ○​ {{themes[0].evidence[1]}} | OPTIONAL​

   ●​ Notes: {{themes[0].notes}} | OPTIONAL​


th_02 — {{themes[1].statement}}

   ●​ Evidence (anonymized):​

           ○​ {{themes[1].evidence[0]}}​

           ○​ {{themes[1].evidence[1]}} | OPTIONAL​



5) Top Insights (required)

   1.​ {{insights[0]}}​
   2.​ {{insights[1]}}​

   3.​ {{insights[2]}}​



6) Recommendations / Next Actions (required)
 rec_i    recommendatio            rationale           impacted_area            priority
   d           n                                     (PRD/DES/ARC/etc.)

rec_0     {{recs[0].text}}   {{recs[0].rationale}}   {{recs[0].area}}     {{recs[0].priority}}
1

rec_0     {{recs[1].text}}   {{recs[1].rationale}}   {{recs[1].area}}     {{recs[1].priority}}
2


7) Contradictions / Outliers (optional)

   ●​ {{contradictions[0]}} | OPTIONAL​

   ●​ {{contradictions[1]}} | OPTIONAL​



8) Limitations / Confidence (required)

   ●​ Limitations: {{limitations.text}}​

   ●​ Confidence level: {{limitations.confidence}} (low/medium/high)​

   ●​ Why: {{limitations.rationale}}​



9) Open Questions (optional)

   ●​ {{open_questions[0]}} | OPTIONAL​

   ●​ {{open_questions[1]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:URD-01}}, {{xref:PRD-01}} | OPTIONAL, {{xref:PRD-02}} | OPTIONAL,
      {{xref:PRD-03}} | OPTIONAL​
  ●​ Downstream: {{xref:URD-03}}, {{xref:URD-04}} | OPTIONAL, {{xref:URD-05}} |
     OPTIONAL, {{xref:PRD-04}} | OPTIONAL, {{xref:RISK-02}} | OPTIONAL, {{xref:STK-02}}
     | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Minimum 3 themes with 1 evidence item each; keep
     recommendations concrete.​

  ●​ intermediate: Required. Map themes to research questions and personas; add
     confidence notes.​

  ●​ advanced: Required. Add contradictions/outliers and clearer implications + traceability to
     downstream changes.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: segments, stakeholders, recruitment_notes,
     artifact_links, contradictions, open_questions​

  ●​ If any theme has zero evidence items → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESEARCH​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ themes_count >= 3​

         ○​ every_theme_has_evidence == true​

         ○​ recommendations_count >= 3​
○​ limitations_present == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
