URD-04
URD-04 — Journey Map (current vs target)
Header Block
   ●​ template_id: URD-04
   ●​ title: Journey Map (current vs target)
   ●​ type: user_research
   ●​ template_version: 1.0.0
   ●​ output_path: 10_app/research/URD-04_Journey_Map.md
   ●​ compliance_gate_id: TMP-05.PRIMARY.RESEARCH
   ●​ upstream_dependencies: ["URD-02", "URD-03"]
   ●​ inputs_required: ["URD-02", "URD-03", "PRD-03", "PRD-04", "GLOSSARY",
      "STANDARDS_INDEX"]
   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": false}


Purpose
Document the user journey in two states—current and target—to clarify steps, emotions/friction,
and opportunities for intervention. This provides a bridge between research findings and design
flows without specifying UI layout or implementation.


Inputs Required
   ●​   URD-02: {{xref:URD-02}}
   ●​   URD-03: {{xref:URD-03}}
   ●​   PRD-03: {{xref:PRD-03}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   GLOSSARY: {{glossary.terms}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL


Required Fields
   ●​   Persona(s) covered (at least 1)
   ●​   Journey scope (which user goal / scenario)
   ●​   Journey phases (3–10)
   ●​   For each phase (current and target):
           ○​ user goal
           ○​ user actions
           ○​ touchpoints/channels
          ○​ pain points/friction
          ○​ evidence pointer(s)
          ○​ opportunity notes
     ●​ Summary of top frictions (top 3–7)
     ●​ Summary of target improvements (top 3–7)


Optional Fields
     ●​    Emotional curve (qualitative) | OPTIONAL
     ●​    Ownership/actor mapping (who does what) | OPTIONAL
     ●​    Mapped feature IDs | OPTIONAL
     ●​    Open questions | OPTIONAL


Rules
     ●​    Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
     ●​    Every major friction should map to URD-02 themes and URD-03 items when possible.
     ●​    Do not define screens/routes; that belongs in DES templates.
     ●​    If mapping to features, only use existing IDs from PRD-04.
     ●​    Evidence pointers must exist for any claimed pain point.


Output Format
1) Journey Setup

     ●​    Persona(s): {{journey.persona_ids}}
     ●​    Scenario / goal: {{journey.scenario}}
     ●​    Scope boundaries: {{journey.scope}} | OPTIONAL
     ●​    Channels/touchpoints in scope: {{journey.channels}} | OPTIONAL

2) Journey Map — Current State (required)
ph        phase_na      user_     user_a      touchpoi     friction/   evidenc   opportun     emotion
as           me          goal     ctions         nts         pain      e_point   ity_notes    _signal
e_                                                                       ers
id

ph        {{current[0   {{curre   {{curren    {{current[   {{current {{current[ {{current[    {{current
_0        ].phase_n     nt[0].g   t[0].acti   0].touchp    [0].frictio 0].eviden 0].opportu   [0].emoti
1         ame}}         oal}}     ons}}       oints}}      n}}         ce}}      nity}}       on}}
ph     {{current[1   {{curre   {{curren    {{current[    {{current {{current[ {{current[         {{current
_0     ].phase_n     nt[1].g   t[1].acti   1].touchp     [1].frictio 1].eviden 1].opportu        [1].emoti
2      ame}}         oal}}     ons}}       oints}}       n}}         ce}}      nity}}            on}}


3) Journey Map — Target State (required)
ph      phase_n      user_     user_a      touchpoi     reduced_fr      enablin     mapped        emotio
as        ame         goal     ctions         nts          iction       g_chan      _feature      n_sign
e_                                                                        ges         _ids          al
id

ph     {{target[0]   {{targe   {{target[ {{target[0]    {{target[0].r   {{target[   {{target[0   {{target[
_0     .phase_n      t[0].go   0].actio .touchpoi       educed_fric     0].enabl    ].feature_   0].emoti
1      ame}}         al}}      ns}}      nts}}          tion}}          ers}}       ids}}        on}}

ph     {{target[1]   {{targe   {{target[ {{target[1]    {{target[1].r   {{target[   {{target[1   {{target[
_0     .phase_n      t[1].go   1].actio .touchpoi       educed_fric     1].enabl    ].feature_   1].emoti
2      ame}}         al}}      ns}}      nts}}          tion}}          ers}}       ids}}        on}}


4) Top Frictions (required)

     1.​ {{top_frictions[0]}} (maps to: {{top_frictions[0].theme_ids}} / {{top_frictions[0].item_ids}}) |
         OPTIONAL
     2.​ {{top_frictions[1]}} | OPTIONAL
     3.​ {{top_frictions[2]}} | OPTIONAL

5) Target Improvements (required)

     1.​ {{target_improvements[0]}}
     2.​ {{target_improvements[1]}}
     3.​ {{target_improvements[2]}}

6) Actor/Ownership Mapping (optional)

     ●​ {{ownership[0]}} | OPTIONAL

7) Open Questions (optional)

     ●​ {{open_questions[0]}} | OPTIONAL
     ●​ {{open_questions[1]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:URD-02}}, {{xref:URD-03}}, {{xref:PRD-03}} | OPTIONAL
  ●​ Downstream: {{xref:DES-01}}, {{xref:PRD-04}} | OPTIONAL, {{xref:RSC-03}} |
     OPTIONAL
  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. 3–5 phases, 1 persona, current+target tables filled.
  ●​ intermediate: Required. Add evidence pointers and map frictions to themes/items.
  ●​ advanced: Not required. (Advanced system translation happens in DES flows and MAP
     templates.)


Unknown Handling
  ●​ UNKNOWN_ALLOWED: emotion_signal, ownership, mapped_feature_ids,
     channels, open_questions
  ●​ If any phase includes a pain/friction claim with no evidence_pointers → block
     Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.RESEARCH
  ●​ Pass conditions:
        ○​ required_fields_present == true
        ○​ phases_count >= 3
        ○​ current_and_target_present == true
        ○​ friction_claims_have_evidence == true
        ○​ placeholder_resolution == true
        ○​ no_unapproved_unknowns == true
