CDX-03
CDX-03 — Empty States & Onboarding
Copy
Header Block
   ●​ template_id: CDX-03​

   ●​ title: Empty States & Onboarding Copy​

   ●​ type: content_design_ux_writing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/content/CDX-03_EmptyStates_Onboarding_Copy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CONTENT​

   ●​ upstream_dependencies: ["DES-05", "DES-03", "CDX-01", "CDX-02"]​

   ●​ inputs_required: ["DES-05", "DES-03", "CDX-01", "CDX-02", "URD-03",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical copy for empty states and onboarding moments so the product
consistently guides users when there’s nothing to show yet, or when users are learning the
system. This includes messaging, CTAs, and intent—mapped to screens and states.


Inputs Required
   ●​ DES-05: {{xref:DES-05}} | OPTIONAL​

   ●​ DES-03: {{xref:DES-03}} | OPTIONAL​

   ●​ CDX-01: {{xref:CDX-01}}​
  ●​ CDX-02: {{xref:CDX-02}} | OPTIONAL​

  ●​ URD-03: {{xref:URD-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Empty state entries (minimum 10)​

  ●​ Onboarding entries (minimum 5)​

  ●​ For each entry:​

         ○​ copy_id​

         ○​ screen_id​

         ○​ state (empty/onboarding/first_run/no_results/no_access)​

         ○​ title text​

         ○​ body text​

         ○​ CTA text (if any)​

         ○​ CTA action intent (what it does)​

         ○​ eligibility/access condition (if relevant)​

         ○​ linked feature_id(s) (optional)​

         ○​ tone context (from CDX-01)​

         ○​ accessibility notes (SR-friendly wording)​

         ○​ localization notes (if any)​



Optional Fields
    ●​ Visual companion guidance (what an illustration should convey) | OPTIONAL​

    ●​ Progressive onboarding sequence (steps) | OPTIONAL​

    ●​ Notes | OPTIONAL​



Rules
    ●​ Must comply with CDX-01 voice/tone rules.​

    ●​ Empty states must be actionable where possible (suggest next step).​

    ●​ Never blame the user; keep language constructive.​

    ●​ If state is “no access,” language must align to entitlements and avoid exposing restricted
       details.​

    ●​ Keep onboarding steps short; one concept per step.​



Output Format
1) Empty States Catalog (required)
c    scree    state_    title     bod     cta     cta_in    acce     featur    tone    a11y    l10n    note
o     n_id     type                y      _te      tent     ss_c     e_ids             _not    _not     s
p                                          xt               ondit                       es      es
y                                                            ion
_
i
d

e   {{empt    {{empt    {{em      {{em    {{e     {{empt    {{em     {{empt    {{em    {{em    {{em    {{em
s   y[0].sc   y[0].st   pty[      pty[0   mpt     y[0].ct   pty[0]   y[0].fe   pty[0   pty[0   pty[0   pty[0
_   reen_i    ate_ty    0].titl   ].bod   y[0].   a_inte    .acce    ature_i   ].ton   ].a11   ].l10   ].not
0   d}}       pe}}      e}}       y}}     cta}    nt}}      ss}}     ds}}      e}}     y}}     n}}     es}}
0                                         }
1

e   {{empt {{empt       {{em      {{em    {{e     {{empt {{em {{empt           {{em {{em       {{em {{em
s   y[1].sc y[1].st     pty[      pty[1   mpt     y[1].ct pty[1] y[1].fe       pty[1 pty[1     pty[1 pty[1
_                                         y[1].
0   reen_i    ate_ty     1].titl ].bod cta}         a_inte   .acce    ature_i    ].ton     ].a11     ].l10    ].not
0   d}}       pe}}       e}}     y}}   }            nt}}     ss}}     ds}}       e}}       y}}       n}}      es}}
2


2) Onboarding Copy Catalog (required)
c screen      onbo       title     body    cta_t      cta_int     feature    tone        a11y      l10n_     notes
o   _id       ardin                         ext         ent         _ids                 _not       note
p             g_st                                                                        es         s
y              ep
_
i
d

o   {{onbo    {{onb    {{onb      {{onb    {{onb      {{onbo      {{onboa    {{onb    {{onb        {{onb     {{onb
b   arding[   oardi    oardi      oardi    oardi      arding[     rding[0]   oardi    oardi        oardi     oardi
_   0].scre   ng[0].   ng[0].     ng[0].   ng[0]      0].cta_i    .feature   ng[0].   ng[0].       ng[0].    ng[0].
0   en_id}}   step}    title}}    body}    .cta}}     ntent}}     _ids}}     tone}    a11y}        l10n}}    notes
0             }                   }                                          }        }                      }}
1


3) Coverage Checks (required)

    ●​ Empty states cover all screens with empty state in DES-05:
       {{coverage.empty_states_complete}}​

    ●​ Onboarding exists for primary first-run flows: {{coverage.onboarding_complete}}​



4) Visual Companion Guidance (optional)
        copy_id                  concept_to_convey               do_not_convey

{{visuals[0].copy_id}}       {{visuals[0].concept}}          {{visuals[0].avoid}}


Cross-References
    ●​ Upstream: {{xref:CDX-01}}, {{xref:CDX-02}} | OPTIONAL, {{xref:DES-05}} | OPTIONAL,
       {{xref:URD-03}} | OPTIONAL​

    ●​ Downstream: {{xref:VAP-01}} | OPTIONAL, {{xref:FE-}} | OPTIONAL, {{xref:MOB-}} |
       OPTIONAL​
  ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. 10 empty states + 5 onboarding entries with titles/bodies/CTAs.​

  ●​ intermediate: Required. Add access conditions and CTA intent mapping.​

  ●​ advanced: Required. Add a11y/l10n notes and visual companion guidance.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: feature_ids, visual_companion_guidance,
     progressive_sequence, notes, l10n_notes​

  ●​ If an empty state has a CTA, cta_intent cannot be UNKNOWN.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.CONTENT​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ empty_entries_count >= 10​

         ○​ onboarding_entries_count >= 5​

         ○​ coverage_checks_present == true​

         ○​ placeholder_resolution == true​

         ○​ no_unapproved_unknowns == true
