CDX-02
CDX-02 — UI Copy Inventory (labels,
buttons, helper text)
Header Block
   ●​ template_id: CDX-02​

   ●​ title: UI Copy Inventory (labels, buttons, helper text)​

   ●​ type: content_design_ux_writing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/content/CDX-02_UI_Copy_Inventory.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CONTENT​

   ●​ upstream_dependencies: ["DES-02", "DES-03", "CDX-01"]​

   ●​ inputs_required: ["DES-02", "DES-03", "CDX-01", "DMG-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Create the canonical inventory of UI copy strings used across screens: titles, labels, buttons,
helper text, tooltips, and confirmations. This enables consistency, localization, and
implementation without copy drift.


Inputs Required
   ●​ DES-02: {{xref:DES-02}} | OPTIONAL​

   ●​ DES-03: {{xref:DES-03}} | OPTIONAL​

   ●​ CDX-01: {{xref:CDX-01}}​
  ●​ DMG-01: {{xref:DMG-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Copy entries list (minimum 50 for non-trivial products; justify if smaller)​

  ●​ For each entry:​

         ○​ copy_id​

         ○​ screen_id (or global)​

         ○​ component_id (optional)​

         ○​ location (header, field label, button, tooltip, helper text)​

         ○​ string_key (implementation key)​

         ○​ default_text​

         ○​ intent (what it communicates)​

         ○​ tone context (from CDX-01)​

         ○​ placeholders (if any)​

         ○​ accessibility note (if SR/aria label differs)​

         ○​ max length guidance (if constrained)​

         ○​ localization note (if special)​

  ●​ Canonical naming rules for string_key​



Optional Fields
  ●​ Variants by platform (web/mobile) | OPTIONAL​
    ●​ Notes | OPTIONAL​



Rules
    ●​ Must comply with CDX-01 voice/tone/terminology.​

    ●​ Placeholders must be explicit and consistent (e.g., {name}, {count}).​

    ●​ Avoid embedding PII in logs; copy entries should not require showing sensitive values
       unless allowed.​

    ●​ If the visible label differs from the aria label, both must be specified.​



Output Format
1) String Key Rules (required)

    ●​ Key format: {{keys.format}} (e.g., screen.<screen_id>.<location>.<name>)​

    ●​ Allowed characters: {{keys.allowed_chars}}​

    ●​ Versioning/change rules: {{keys.change_rules}} | OPTIONAL​



2) UI Copy Inventory (canonical)
c    stri   scree     compo     locat    def     inte    ton     placeh a11y        max_    l10n note
o    ng_     n_id     nent_i     ion     ault     nt     e_c     olders _alt_t      lengt   _no   s
p    key                d                _te             ont             ext          h      tes
y                                         xt             ext
_
i
d

c   {{co    {{copy    {{copy[   {{cop    {{co    {{co    {{co    {{copy[   {{cop    {{cop   {{co    {{co
_   py[0    [0].scr   0].com    y[0].l   py[0    py[0]   py[0    0].plac   y[0].a   y[0].   py[0    py[0
0   ].ke    een_i     ponent    ocati    ].tex   .inte   ].ton   eholde    11y_a    max_    ].l10   ].not
0   y}}     d}}       _id}}     on}}     t}}     nt}}    e}}     rs}}      lt}}     len}}   n}}     es}}
1
c   {{co   {{copy    {{copy[   {{cop    {{co    {{co    {{co    {{copy[   {{cop    {{cop   {{co    {{co
_   py[1   [1].scr   1].com    y[1].l   py[1    py[1]   py[1    1].plac   y[1].a   y[1].   py[1    py[1
0   ].ke   een_i     ponent    ocati    ].tex   .inte   ].ton   eholde    11y_a    max_    ].l10   ].not
0   y}}    d}}       _id}}     on}}     t}}     nt}}    e}}     rs}}      lt}}     len}}   n}}     es}}
2


3) Coverage Checks (required)

    ●​ Screens covered: {{coverage.screens}} | OPTIONAL​

    ●​ Global copy present (app name, generic CTAs): {{coverage.global}}​

    ●​ A11y alt text present where needed: {{coverage.a11y_alt}}​



Cross-References
    ●​ Upstream: {{xref:CDX-01}}, {{xref:DES-02}} | OPTIONAL, {{xref:DES-03}} | OPTIONAL​

    ●​ Downstream: {{xref:CDX-03}}, {{xref:CDX-04}}, {{xref:CDX-05}} | OPTIONAL, {{xref:FE-}}
       | OPTIONAL, {{xref:L10N-}} | OPTIONAL​

    ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
    ●​ beginner: Required. Inventory with keys + default text + screen mapping.​

    ●​ intermediate: Required. Add placeholders, max length guidance, and intent.​

    ●​ advanced: Required. Add a11y alt labels and localization notes.​



Unknown Handling
    ●​ UNKNOWN_ALLOWED: component_id, variants_by_platform, max_length,
       l10n_notes, notes, a11y_alt_text​
 ●​ If string_key rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.CONTENT​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ copy_entries_count >= 50 (or justified)​

        ○​ string_keys_unique == true​

        ○​ cdX01_compliance == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
