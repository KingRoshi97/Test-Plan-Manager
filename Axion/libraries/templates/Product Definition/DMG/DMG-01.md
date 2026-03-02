DMG-01
DMG-01 — Domain Glossary (canonical
terms)
Header Block
   ●​   template_id: DMG-01
   ●​   title: Domain Glossary (canonical terms)
   ●​   type: domain_model_glossary
   ●​   template_version: 1.0.0
   ●​   output_path: 10_app/domain/DMG-01_Domain_Glossary.md
   ●​   compliance_gate_id: TMP-05.PRIMARY.DOMAIN
   ●​   upstream_dependencies: ["PRD-01", "PRD-03"]
   ●​   inputs_required: ["PRD-01", "PRD-03", "PRD-04", "STANDARDS_INDEX"]
   ●​   required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}


Purpose
Create the canonical vocabulary for the product domain so all docs, APIs, schemas, UI copy,
and tests use consistent meanings. This is the authority for naming and definitions (not
implementation).


Inputs Required
   ●​   PRD-01: {{xref:PRD-01}}
   ●​   PRD-03: {{xref:PRD-03}} | OPTIONAL
   ●​   PRD-04: {{xref:PRD-04}} | OPTIONAL
   ●​   STANDARDS_INDEX: {{standards.index}} | OPTIONAL
   ●​   Existing terminology notes: {{inputs.term_notes}} | OPTIONAL


Required Fields
   ●​ Term list (minimum 20 for non-trivial products; justify if smaller)
   ●​ For each term:
         ○​ term_id
         ○​ term
         ○​ definition (1–3 sentences)
         ○​ synonyms (if any)
         ○​ anti-definition (what it is NOT) | OPTIONAL
           ○​ related terms
           ○​ canonical usage examples (1–3)
           ○​ owner (who can change definition)
     ●​ Naming rules (basic, product-specific)
     ●​ Deprecated terms list (if any)


Optional Fields
     ●​ Acronyms list | OPTIONAL
     ●​ External references | OPTIONAL
     ●​ Open questions | OPTIONAL


Rules
     ●​ Definitions must not conflict with PRD and DMG-02; if conflict exists, log in PRD-08
        and/or STK-02.
     ●​ Prefer one canonical term per concept; synonyms must point to canonical term_id.
     ●​ Deprecations must include replacement term_id.
     ●​ Terms used in IDs (feature/entity/endpoint) should match canonical term spellings where
        possible.


Output Format
1) Glossary (canonical)
ter     term     definitio     synonym      not_this   related_t    usage_e      owner      status
 m                  n             s                    erm_ids      xamples
 _i
 d

t_     {{terms   {{terms[0]    {{terms[0]   {{terms[0 {{terms[0].   {{terms[0]   {{terms[   {{terms[
00     [0].ter   .definition   .synonym     ].not_this related_id   .example     0].owne    0].statu
1      m}}       }}            s}}          }}         s}}          s}}          r}}        s}}
                                                                                            (active/
                                                                                            deprec
                                                                                            ated)

t_     {{terms   {{terms[1]    {{terms[1]   {{terms[1 {{terms[1].   {{terms[1]   {{terms[   {{terms[
00     [1].ter   .definition   .synonym     ].not_this related_id   .example     1].owne    1].statu
2      m}}       }}            s}}          }}         s}}          s}}          r}}        s}}


2) Naming Rules (required)
  ●​   Preferred casing: {{naming.casing}}
  ●​   Singular vs plural rules: {{naming.singular_plural}}
  ●​   Forbidden terms (if any): {{naming.forbidden}} | OPTIONAL
  ●​   UI copy rules (if any): {{naming.ui_copy_rules}} | OPTIONAL

3) Deprecated Terms (optional)
  old_term_id          old_term         replacement_ter         reason          deprecated_o
                                              m_id                                   n

{{deprecated[0].   {{deprecated[0].ol   {{deprecated[0].n   {{deprecated[0].r   {{deprecated[0
old_id}}           d_term}}             ew_id}}             eason}}             ].date}}


4) Open Questions (optional)

  ●​ {{open_questions[0]}} | OPTIONAL
  ●​ {{open_questions[1]}} | OPTIONAL


Cross-References
  ●​ Upstream: {{xref:PRD-01}}, {{xref:PRD-03}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL
  ●​ Downstream: {{xref:DMG-02}}, {{xref:DATA-01}} | OPTIONAL, {{xref:API-01}} |
     OPTIONAL, {{xref:FE-*}} | OPTIONAL
  ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL


Skill Level Requiredness Rules
  ●​ beginner: Required. Define core nouns/verbs; keep definitions short.
  ●​ intermediate: Required. Add synonyms and anti-definitions for ambiguous terms.
  ●​ advanced: Required. Maintain deprecations and ownership.


Unknown Handling
  ●​ UNKNOWN_ALLOWED: synonyms, not_this, related_term_ids,
     usage_examples, deprecated_terms, open_questions
  ●​ If a term is used widely but has UNKNOWN definition → block Completeness Gate.


Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.DOMAIN
  ●​ Pass conditions:
○​   required_fields_present == true
○​   terms_count >= 20 (or justified)
○​   no_conflicting_definitions == true
○​   placeholder_resolution == true
○​   no_unapproved_unknowns == true
