CDX-01
CDX-01 — Content Style Guide (tone,
voice, terminology)
Header Block
   ●​ template_id: CDX-01​

   ●​ title: Content Style Guide (tone, voice, terminology)​

   ●​ type: content_design_ux_writing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/content/CDX-01_Content_Style_Guide.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CONTENT​

   ●​ upstream_dependencies: ["DMG-01", "PRD-03", "PRD-01"]​

   ●​ inputs_required: ["DMG-01", "PRD-01", "PRD-03", "A11YD-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical content rules the product uses everywhere (UI copy, onboarding,
notifications, errors): voice, tone, terminology, readability, and accessibility-safe writing. This
prevents copy drift and makes content production deterministic.


Inputs Required
   ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​

   ●​ PRD-01: {{xref:PRD-01}} | OPTIONAL​

   ●​ PRD-03: {{xref:PRD-03}} | OPTIONAL​
  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Brand voice definition (3–8 traits)​

  ●​ Tone rules by context (success, neutral, error, warning, onboarding, empty state)​

  ●​ Terminology rules:​

         ○​ canonical terms (from DMG-01)​

         ○​ forbidden / deprecated terms​

         ○​ naming rules for roles, features, plans (if applicable)​

  ●​ Readability rules (grade level or simplicity rules)​

  ●​ Inclusive language rules​

  ●​ Localization readiness rules (writing to translate well)​

  ●​ Accessibility writing rules (screen reader-friendly text patterns)​

  ●​ Examples: “do/don’t” pairs (minimum 10)​



Optional Fields
  ●​ Legal/compliance wording constraints | OPTIONAL​

  ●​ Brand punctuation/casing preferences | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
   ●​ Canonical terms must match DMG-01; if conflict, update glossary or log decision.​

   ●​ Error copy must be actionable and non-blaming.​

   ●​ Avoid idioms and culture-specific slang if localization is expected.​

   ●​ Do not encode meaning in emoji alone; if emojis are used, they are decorative and
      optional.​

   ●​ Messages should be scannable: front-load key info; keep sentences short.​



Output Format
1) Voice (required)

   ●​ Voice traits: {{voice.traits}}​

   ●​ What we sound like: {{voice.description}}​

   ●​ What we never sound like: {{voice.never}} | OPTIONAL​



2) Tone by Context (required)
  context                tone                      goal                       example

success       {{tone.success.tone}}      {{tone.success.goal}}      {{tone.success.example}}

neutral       {{tone.neutral.tone}}      {{tone.neutral.goal}}      {{tone.neutral.example}}

warning       {{tone.warning.tone}}      {{tone.warning.goal}}      {{tone.warning.example}}

error         {{tone.error.tone}}        {{tone.error.goal}}        {{tone.error.example}}

onboardin     {{tone.onboarding.tone}    {{tone.onboarding.goal}    {{tone.onboarding.example}
g             }                          }                          }

empty_stat    {{tone.empty.tone}}        {{tone.empty.goal}}        {{tone.empty.example}}
e


3) Terminology Rules (required)

   ●​ Canonical terms source: {{xref:DMG-01}} | OPTIONAL​
   ●​ Role naming rules: {{terminology.roles}}​

   ●​ Feature naming rules: {{terminology.features}} | OPTIONAL​

   ●​ Plan/tier naming rules: {{terminology.plans}} | OPTIONAL​

   ●​ Forbidden/deprecated terms: {{terminology.forbidden}} | OPTIONAL​



4) Readability & Structure (required)

   ●​ Sentence length guidance: {{readability.sentence_length}}​

   ●​ Reading level target: {{readability.level}}​

   ●​ Scannability rules (bullets, headings): {{readability.scannability}}​



5) Inclusive Language (required)

   ●​ {{inclusive[0]}}​

   ●​ {{inclusive[1]}} | OPTIONAL​



6) Localization Readiness (required)

   ●​ Avoid: idioms, jokes, region-specific formats unless localized: {{l10n.avoid}}​

   ●​ Date/time/number placeholders rules: {{l10n.placeholders}}​

   ●​ Gendered language policy: {{l10n.gender}} | OPTIONAL​



7) Accessibility Writing (required)

   ●​ Screen reader clarity rules: {{a11y.text_rules}}​

   ●​ Link text rules (no “click here”): {{a11y.links}}​

   ●​ Error message structure (what happened / what to do): {{a11y.error_structure}}​



8) Do/Don’t Examples (required, min 10)
 example_i            do                    dont                     why
    d

ex_01         {{examples[0].do}}    {{examples[0].dont}}    {{examples[0].why}}

ex_02         {{examples[1].do}}    {{examples[1].dont}}    {{examples[1].why}}


9) Legal/Compliance Constraints (optional)

  ●​ {{legal[0]}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:PRD-01}} | OPTIONAL, {{xref:PRD-03}} |
     OPTIONAL​

  ●​ Downstream: {{xref:CDX-02}}, {{xref:CDX-03}}, {{xref:CDX-04}}, {{xref:CDX-05}}​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Voice + tone table + 10 do/don’t examples.​

  ●​ intermediate: Required. Add terminology and localization rules.​

  ●​ advanced: Required. Add accessibility writing patterns and legal constraints if needed.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: legal_constraints, punctuation_preferences,
        notes, forbidden_terms​

  ●​ If tone rules are UNKNOWN for error or warning contexts → block Completeness Gate.​



Completeness Gate
●​ Gate ID: TMP-05.PRIMARY.CONTENT​

●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ voice_traits_present == true​

       ○​ tone_by_context_present == true​

       ○​ do_dont_examples_count >= 10​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
