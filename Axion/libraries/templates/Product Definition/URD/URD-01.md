URD-01
URD-01 — Research Plan (questions,
methods, sample)
Header Block
   ●​ template_id: URD-01
   ●​ title: Research Plan (questions, methods, sample)
   ●​ type: user_research
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/research/URD-01_Research_Plan.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.RESEARCH
   ●​ upstream_dependencies: ["PRD-01", "PRD-02", "PRD-03"]
   ●​ inputs_required: ["PRD-01", "PRD-02", "PRD-03", "GLOSSARY",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Define a lightweight, execution-ready research plan that validates core product assumptions,
clarifies user needs, and de-risks the highest-impact decisions. This plan is a guide for
discovery work; it must remain aligned with product goals and avoid redefining requirements.


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-02: {{xref:PRD-02}} | OPTIONAL
   ●​   PRD-03: {{xref:PRD-03}} | OPTIONAL
   ●​   GLOSSARY: {{glossary.terms}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing research notes: {{inputs.research_notes}} | OPTIONAL


Required Fields
   ●​   Research objectives (2–8)
   ●​   Key research questions (5–20)
   ●​   Hypotheses / assumptions under test (3–15)
   ●​   Methods (interviews, surveys, usability tests, diary study, etc.)
   ●​   Participant criteria (who qualifies)
  ●​   Sample size target (per method)
  ●​   Recruitment plan (how participants will be found)
  ●​   Script/guide outline (topics, not full script)
  ●​   Study logistics (tools, timeline, session length)
  ●​   Data capture plan (notes, recordings, consent)
  ●​   Analysis plan (how findings become themes)
  ●​   Output artifacts (what deliverables will be produced)


Optional Fields
  ●​   Incentives | OPTIONAL
  ●​   Risks / limitations | OPTIONAL
  ●​   Accessibility accommodations | OPTIONAL
  ●​   Open questions | OPTIONAL


Rules
  ●​ Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
  ●​ Research questions must map back to:
          ○​ product goals: {{xref:PRD-02}}
          ○​ personas/roles: {{xref:PRD-03}} | OPTIONAL
          ○​ major assumptions: {{xref:RISK-01}} | OPTIONAL
  ●​ Do not claim results; this is a plan only.
  ●​ If sample size or recruitment approach is uncertain, mark UNKNOWN and include
     mitigation.
  ●​ Consent/recording must be explicitly addressed if any data is captured.


Output Format
1) Study Overview

  ●​   Study name: {{research.study_name}}
  ●​   Owner: {{research.owner}}
  ●​   Stakeholders: {{research.stakeholders}} | OPTIONAL
  ●​   Timeline: {{research.timeline}}
  ●​   Session length: {{research.session_length}}
  ●​   Tools: {{research.tools}} | OPTIONAL

2) Objectives

  ●​ {{research.objectives[0]}}
  ●​ {{research.objectives[1]}}
3) Key Questions
 rq        question         mapped_goal_ids       mapped_persona_i        mapped_assumption_
 _i                                                     ds                       ids
  d

rq      {{research.questi   {{research.question   {{research.questions[   {{research.questions[0].
_0      ons[0].text}}       s[0].goal_ids}}       0].persona_ids}}        assumption_ids}}
1

rq      {{research.questi   {{research.question   {{research.questions[   {{research.questions[1].
_0      ons[1].text}}       s[1].goal_ids}}       1].persona_ids}}        assumption_ids}}
2


4) Hypotheses / Assumptions Under Test
 h_i            hypothesis                   why_it_matters               validation_signal
  d

h_0      {{research.hypotheses[0].t   {{research.hypotheses[0].im    {{research.hypotheses[0].si
1        ext}}                        pact}}                         gnal}}

h_0      {{research.hypotheses[1].t   {{research.hypotheses[1].im    {{research.hypotheses[1].si
2        ext}}                        pact}}                         gnal}}


5) Methods (what + why)
 met         method            purpose       sample_size_tar         format            notes
 hod                                              get
 _id

m_0       {{research.me     {{research.met   {{research.metho    {{research.met {{research.me
1         thods[0].name     hods[0].purpos   ds[0].sample_siz    hods[0].format} thods[0].notes
          }}                e}}              e}}                 }               }}


6) Participants

      ●​ Target personas: {{research.participants.target_persona_ids}} | OPTIONAL
      ●​ Inclusion criteria:
             ○​ {{research.participants.inclusion[0]}}
             ○​ {{research.participants.inclusion[1]}}
      ●​ Exclusion criteria:
             ○​ {{research.participants.exclusion[0]}} | OPTIONAL
      ●​ Recruitment channels: {{research.participants.recruitment_channels}}
      ●​ Incentives: {{research.participants.incentives}} | OPTIONAL
7) Script / Guide Outline

   ●​ Intro + consent
   ●​ Background questions
   ●​ Core tasks / prompts
   ●​ Concept reactions
   ●​ Wrap-up + follow-ups​
      (Outline bullets)
   ●​ {{research.guide_outline[0]}}
   ●​ {{research.guide_outline[1]}}

8) Logistics

   ●​   Scheduling approach: {{research.logistics.scheduling}}
   ●​   Recording: {{research.logistics.recording_policy}}
   ●​   Consent handling: {{research.logistics.consent_policy}}
   ●​   Storage location: {{research.logistics.storage_location}} | OPTIONAL
   ●​   Accessibility accommodations: {{research.logistics.accommodations}} | OPTIONAL

9) Analysis Plan

   ●​   Approach: {{research.analysis.approach}} (e.g., thematic analysis)
   ●​   Coding scheme: {{research.analysis.coding_scheme}} | OPTIONAL
   ●​   How themes will be produced: {{research.analysis.theme_process}}
   ●​   How conflicts will be resolved: {{research.analysis.conflict_resolution}} | OPTIONAL

10) Outputs / Deliverables

   ●​   URD-02 Findings Summary: {{xref:URD-02}}
   ●​   URD-03 Needs & Pain Points: {{xref:URD-03}}
   ●​   URD-04 Journey Map: {{xref:URD-04}} | OPTIONAL
   ●​   URD-05 Validation Plan: {{xref:URD-05}} | OPTIONAL

11) Risks / Limitations (optional)

   ●​ {{research.risks[0]}} | OPTIONAL
   ●​ {{research.risks[1]}} | OPTIONAL

12) Open Questions (optional)

   ●​ {{open_questions[0]}} | OPTIONAL
   ●​ {{open_questions[1]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-03}} | OPTIONAL,
     {{xref:RISK-01}} | OPTIONAL
  ●​ Downstream: {{xref:URD-02}}, {{xref:URD-03}}, {{xref:URD-04}} | OPTIONAL,
     {{xref:URD-05}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Use 1–2 methods; keep plan short but complete.
  ●​ intermediate: Required. Map questions to goals/personas/assumptions; define analysis
     approach.
  ●​ advanced: Required. Add clear hypotheses and validation signals; include risk mitigation
     and rigor notes.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: sample_size_target, recruitment_channels,
     incentives, tools, storage_location, coding_scheme, accommodations,
     risks, open_questions
  ●​ If data capture is planned and consent_policy is UNKNOWN → block Completeness
     Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESEARCH
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ questions_count >= 5
        ○​ methods_count >= 1
        ○​ participant_criteria_present == true
        ○​ consent_policy_present == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
