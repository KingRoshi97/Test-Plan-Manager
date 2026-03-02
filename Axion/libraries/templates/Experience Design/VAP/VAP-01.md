VAP-01
VAP-01 — Asset Inventory (logos, icons,
illustrations)
Header Block
   ●​ template_id: VAP-01​

   ●​ title: Asset Inventory (logos, icons, illustrations)​

   ●​ type: visual_asset_production​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/assets/VAP-01_Asset_Inventory.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ASSETS​

   ●​ upstream_dependencies: ["DSYS-04", "CDX-03", "DSYS-01"]​

   ●​ inputs_required: ["DSYS-04", "CDX-03", "DSYS-01", "IAN-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Create the canonical inventory of visual assets required for the product (logos, icons,
illustrations, images, animations). This inventory drives deterministic production, export, naming,
and handoff so implementation does not invent assets.


Inputs Required
   ●​ DSYS-04: {{xref:DSYS-04}} | OPTIONAL​

   ●​ CDX-03: {{xref:CDX-03}} | OPTIONAL​

   ●​ DSYS-01: {{xref:DSYS-01}} | OPTIONAL​
  ●​ IAN-01: {{xref:IAN-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Asset list (minimum 20 for non-trivial products; justify if smaller)​

  ●​ For each asset:​

         ○​ asset_id​

         ○​ asset_type (logo/icon/illustration/photo/animation)​

         ○​ name​

         ○​ purpose/where used (screen_id/component_id)​

         ○​ required sizes (px) and densities (1x/2x/3x) if applicable​

         ○​ format (svg/png/webp/mp4/etc.)​

         ○​ theme variants needed (light/dark) (if applicable)​

         ○​ accessibility classification (decorative/informative)​

         ○​ alt text requirement (if informative)​

         ○​ ownership (who produces/approves)​

         ○​ status (needed/in_progress/done)​

         ○​ delivery path (output location) | OPTIONAL​



Optional Fields
  ●​ Source file pointers (figma links, source repo) | OPTIONAL​

  ●​ Licensing notes (for photos/icons) | OPTIONAL​
    ●​ Notes | OPTIONAL​



Rules
    ●​ Asset IDs must be stable and unique (asset_<slug>).​

    ●​ If an asset is informative, alt text requirement must be specified.​

    ●​ If multiple themes exist, required theme variants must be specified for relevant assets.​

    ●​ Formats must align with DSYS-04 style rules and responsive rules (RLB-05/VAP-02).​



Output Format
1) Asset Inventory (canonical)
a    typ     na      used    size    dens      for     the     a11y_     alt_t    own     stat    deli   not
s     e      me       _in     s      ities     mat     me_     class     ext_      er      us     ver    es
s                                                      vari              req                      y_p
e                                                      ants                                       ath
t
_
i
d

a    {{as    {{as    {{ass   {{as    {{ass     {{as    {{ass   {{asse    {{ass    {{as    {{as    {{as   {{as
s    sets    sets    ets[0   sets    ets[0]    sets[   ets[0   ts[0].a   ets[0    sets[   sets[   sets   sets
s    [0].t   [0].n   ].use   [0].s   .dens     0].fo   ].the   11y_c     ].alt_   0].o    0].st   [0].   [0].n
e    ype     ame     d_in}   izes    ities}}   rmat    mes}    lass}}    req}}    wner    atus    pat    otes
t    }}      }}      }       }}                }}      }                          }}      }}      h}}    }}
_
0
0
1

a    {{as    {{as    {{ass   {{as    {{ass     {{as    {{ass   {{asse    {{ass    {{as    {{as    {{as   {{as
s    sets    sets    ets[1   sets    ets[1]    sets[   ets[1   ts[1].a   ets[1    sets[   sets[   sets   sets
s    [1].t   [1].n   ].use   [1].s   .dens     1].fo   ].the   11y_c     ].alt_   1].o    1].st   [1].   [1].n
e    ype     ame     d_in}   izes    ities}}   rmat    mes}    lass}}    req}}    wner    atus    pat    otes
t    }}      }}      }       }}                }}      }                          }}      }}      h}}    }}
_
0
0
2


2) Coverage Checks (required)

    ●​ Assets exist for all referenced empty states/onboarding visuals:
       {{coverage.empty_onboarding}}​

    ●​ Icon inventory aligns with DSYS-04 rules: {{coverage.icon_rules_alignment}}​

    ●​ Theme variants listed where required: {{coverage.theme_variants_complete}}​



Cross-References
    ●​ Upstream: {{xref:DSYS-04}} | OPTIONAL, {{xref:CDX-03}} | OPTIONAL​

    ●​ Downstream: {{xref:VAP-02}}, {{xref:VAP-04}} | OPTIONAL, {{xref:RLB-05}} | OPTIONAL,
       {{xref:FE-*}} | OPTIONAL​

    ●​ Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
    ●​ beginner: Required. 20 assets with types + used_in + format.​

    ●​ intermediate: Required. Add sizes/densities and a11y classification.​

    ●​ advanced: Required. Add theme variants and coverage checks.​



Unknown Handling
    ●​ UNKNOWN_ALLOWED: delivery_path, source_pointers, licensing_notes,
       notes, densities (if not applicable)​

    ●​ If a11y_class is UNKNOWN for any asset → block Completeness Gate.​
Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ASSETS​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ assets_count >= 20 (or justified)​

        ○​ a11y_class_complete == true​

        ○​ coverage_checks_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
