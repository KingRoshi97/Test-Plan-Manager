IXD-05
IXD-05 — Accessibility-Safe Motion Rules
(reduce motion compliance)
Header Block
   ●​ template_id: IXD-05​

   ●​ title: Accessibility-Safe Motion Rules (reduce motion compliance)​

   ●​ type: interaction_design_motion​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/design/IXD-05_Reduce_Motion_Compliance.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IXD​

   ●​ upstream_dependencies: ["IXD-02", "A11YD-01", "A11YD-05"]​

   ●​ inputs_required: ["IXD-02", "IXD-03", "IXD-04", "A11YD-01", "A11YD-05",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the enforceable ruleset for “reduce motion” support so motion never blocks
understanding or interaction. This document turns accessibility expectations into concrete
constraints that can be implemented and tested.


Inputs Required
   ●​ IXD-02: {{xref:IXD-02}}​

   ●​ IXD-03: {{xref:IXD-03}} | OPTIONAL​

   ●​ IXD-04: {{xref:IXD-04}} | OPTIONAL​
  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ A11YD-05: {{xref:A11YD-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Reduce-motion policy statement (system-wide)​

  ●​ Detection sources (OS setting, app toggle) and precedence​

  ●​ Rules for disabling/replacing motion types:​

         ○​ parallax​

         ○​ large-scale movement​

         ○​ continuous looping animation​

         ○​ auto-play transitions​

         ○​ motion used as feedback (must provide alternate)​

  ●​ Allowed motion under reduce-motion (minimal fades, instant swaps, etc.)​

  ●​ Test checklist (how to validate reduce-motion)​

  ●​ Exceptions policy (rare, must be justified)​



Optional Fields
  ●​ Per-platform implementation notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ Reduce-motion mode must preserve:​

            ○​ navigation clarity​

            ○​ state change visibility​

            ○​ feedback visibility​

   ●​ Any disallowed animation must have an explicit replacement behavior.​

   ●​ If app has its own toggle, it must not override OS reduce-motion by default.​

   ●​ Exceptions must be documented and mapped to approver (STK).​



Output Format
1) Policy (required)

   ●​ Policy: {{reduce_motion.policy}}​

   ●​ Applies to: {{reduce_motion.applies_to}} (all users / only when enabled)​

   ●​ Precedence: {{reduce_motion.precedence}} (OS setting > app toggle, etc.)​



2) Detection (required)
  source         how_detected         precedenc            notes
                                          e

os_setting     {{detect.os.how}}      1            {{detect.os.notes}}

app_toggl      {{detect.app.how}}     2            {{detect.app.notes}}
e


3) Disallowed Motion Types (required)
 motion_type        disallowed_behavior      replacement_behavior                rationale

parallax           {{disallowed.parallax.b   {{disallowed.parallax.repl   {{disallowed.parallax.ra
                   ehavior}}                 acement}}                    tionale}}
large_scale_m         {{disallowed.large.beh    {{disallowed.large.replac    {{disallowed.large.ratio
ovement               avior}}                   ement}}                      nale}}

looping_anima         {{disallowed.looping.be   {{disallowed.looping.repla   {{disallowed.looping.rat
tion                  havior}}                  cement}}                     ionale}}

auto_play_tran        {{disallowed.auto.beha    {{disallowed.auto.replace    {{disallowed.auto.ratio
sition                vior}}                    ment}}                       nale}}

motion_feedba         {{disallowed.feedback.    {{disallowed.feedback.re     {{disallowed.feedback.r
ck                    behavior}}                placement}}                  ationale}}


4) Allowed Motion (required)

   ●​ Allowed minimal transitions: {{allowed.minimal_transitions}}​

   ●​ Duration cap in reduce-motion: {{allowed.duration_cap_ms}}​

   ●​ Allowed easing set: {{allowed.easing}}​



5) Exceptions Policy (required)

   ●​ When exceptions are allowed: {{exceptions.when_allowed}}​

   ●​ Required justification fields: {{exceptions.justification_fields}}​

   ●​ Required approver: {{exceptions.approver_stakeholder_id}} | OPTIONAL​

   ●​ Logging requirement: {{exceptions.logging}} | OPTIONAL​



6) Test Checklist (required)

   ●​ {{tests[0]}}​

   ●​ {{tests[1]}}​

   ●​ {{tests[2]}}​

   ●​ {{tests[3]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:IXD-02}}, {{xref:A11YD-01}} | OPTIONAL​

  ●​ Downstream: {{xref:QA-02}} | OPTIONAL, {{xref:RJT-*}} | OPTIONAL, {{xref:DSYS-01}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Policy + disallowed list + replacements + test checklist.​

  ●​ intermediate: Required. Add detection precedence and allowed motion constraints.​

  ●​ advanced: Required. Add exceptions governance and logging requirements.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: per_platform_notes, exceptions.approver,
     exceptions.logging, notes​

  ●​ If any disallowed motion type lacks replacement_behavior → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IXD​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ policy_defined == true​

         ○​ detection_defined == true​

         ○​ all_disallowed_have_replacements == true​

         ○​ tests_present == true​
○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true​
Content Design & UX Writing (CDX)
Content Design & UX Writing (CDX)​
CDX-01 Content Style Guide (tone, voice, terminology)​
CDX-02 UI Copy Inventory (labels, buttons, helper text)​
CDX-03 Empty States & Onboarding Copy​
CDX-04 Error/Warning/Success Message Catalog​
CDX-05 Notification Copy Templates (push/email/in-app)
