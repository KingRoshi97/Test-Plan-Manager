IAN-04
IAN-04 — Search/Filter/Sort UX (if
applicable)
Header Block
   ●​ template_id: IAN-04​

   ●​ title: Search/Filter/Sort UX (if applicable)​

   ●​ type: information_architecture_navigation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/ia/IAN-04_Search_Filter_Sort_UX.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IAN​

   ●​ upstream_dependencies: ["IAN-03", "DES-03", "URD-03"]​

   ●​ inputs_required: ["IAN-03", "DES-03", "URD-03", "PRD-04", "CDX-01", "CDX-02",
      "A11YD-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": false, "intermediate": true, "advanced": true}​



Purpose
Define the user experience contract for search, filtering, and sorting across the product (when
applicable): where search exists, what it searches, how filters/sorts behave, and what users see
in empty/error states. This is UX-authoritative and feeds implementation and search/index
design.


Inputs Required
   ●​ IAN-03: {{xref:IAN-03}} | OPTIONAL​

   ●​ DES-03: {{xref:DES-03}} | OPTIONAL​
  ●​ URD-03: {{xref:URD-03}} | OPTIONAL​

  ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

  ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

  ●​ CDX-02: {{xref:CDX-02}} | OPTIONAL​

  ●​ A11YD-01: {{xref:A11YD-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Applicability (true/false). If false, explicitly mark N/A.​

  ●​ Search surfaces list (screens/components where search exists)​

  ●​ For each search surface:​

          ○​ surface_id (screen_id/component_id)​

          ○​ search scope (what entities/content)​

          ○​ query input rules (min chars, debounce, submit behavior)​

          ○​ results presentation (list/cards/groups)​

          ○​ ranking expectation (basic relevance / recency / custom)​

          ○​ empty states (no results, no data)​

          ○​ error states (network/server)​

          ○​ accessibility behavior (keyboard nav, SR announcements)​

  ●​ Filter catalog (if applicable):​

          ○​ filter_id, label key, type (multi/single/range), defaults, persistence rules​

  ●​ Sort catalog (if applicable):​
          ○​ sort_id, label key, options, default, persistence rules​

   ●​ Persistence rules (remember last query/filter/sort or not)​

   ●​ Reset/clear behavior​



Optional Fields
   ●​ Advanced search operators | OPTIONAL​

   ●​ Saved searches | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block and do not define catalogs.​

   ●​ Search and filter labels must follow CDX rules; final strings in CDX-02.​

   ●​ Must specify deterministic behavior for: debounce, submit, clear, back behavior.​

   ●​ Must include accessibility rules for keyboard-only use.​

   ●​ Empty/error state UX must align with DES-05 and CDX catalogs.​



Output Format
1) Applicability

   ●​ applies: {{search.applies}} (true/false)​

   ●​ rationale: {{search.rationale}} | OPTIONAL​

   ●​ 00_NA (if not applies): {{search.na_block}} | OPTIONAL​



2) Search Surfaces (if applies)
 surfa      surfac      scope      input_       results      ranking         empty      error_     a11y_        notes
 ce_id      e_typ                   rules       _prese       _expec          _states    states     behavi
              e                                 ntation       tation                                 or

{{surf      {{surfa     {{surfa {{surfa         {{surfac     {{surfac        {{surfac   {{surfac {{surfa       {{surfa
aces[       ces[0].     ces[0]. ces[0].i        es[0].re     es[0].ra        es[0].e    es[0].er ces[0].       ces[0].
0].id}}     type}}      scope}} nput}}          sults}}      nking}}         mpty}}     rors}}   a11y}}        notes}}


3) Filters Catalog (if applies)
 filter_i      label_key          type        options_        default          persistenc      clear_b         notes
     d                                        or_range                             e           ehavior

{{filters[ {{filters[0].l    {{filters[      {{filters[0].   {{filters[0].    {{filters[0].p   {{filters[0   {{filters[0
0].id}}    abel_key}}        0].type}}       options}}       default}}        ersistence}}     ].clear}}     ].notes}}


4) Sort Catalog (if applies)
  sort_id             label_key             options             default             persistence              notes

{{sorts[0].i    {{sorts[0].label_        {{sorts[0].opti     {{sorts[0].def       {{sorts[0].persist    {{sorts[0].no
d}}             key}}                    ons}}               ault}}               ence}}                tes}}


5) Persistence + Reset Rules (if applies)

   ●​ Remember last query: {{rules.remember_query}}​

   ●​ Remember filters: {{rules.remember_filters}}​

   ●​ Remember sort: {{rules.remember_sort}}​

   ●​ Clear all behavior: {{rules.clear_all}}​

   ●​ Back navigation behavior: {{rules.back_behavior}} | OPTIONAL​



6) Accessibility Requirements (required if applies)

   ●​ Keyboard navigation: {{a11y.keyboard}}​

   ●​ Screen reader announcements: {{a11y.sr}}​

   ●​ Focus management for results updates: {{a11y.focus}} | OPTIONAL​
Cross-References
  ●​ Upstream: {{xref:IAN-03}} | OPTIONAL, {{xref:DES-05}} | OPTIONAL, {{xref:CDX-02}} |
     OPTIONAL​

  ●​ Downstream: {{xref:DISC-}} | OPTIONAL, {{xref:SRCH-}} | OPTIONAL, {{xref:FE-}} |
     OPTIONAL, {{xref:MOB-}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Not required unless search exists.​

  ●​ intermediate: Required if applies. Define surfaces + basic filters/sorts.​

  ●​ advanced: Required if applies. Add determinism for ranking expectations and
     persistence rules.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: advanced_operators, saved_searches, notes,
     ranking_expectation (if basic relevance), persistence_rules (must still be
     stated)​

  ●​ If applies == true and input_rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IAN​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ if_applies_then_surfaces_present == true​
○​ if_applies_then_a11y_defined == true​

○​ placeholder_resolution == true​

○​ no_unapproved_unknowns == true
