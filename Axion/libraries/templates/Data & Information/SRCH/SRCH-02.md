SRCH-02
SRCH-01 — Search Scope & Surfaces
(what is searchable, where)
Header Block
   ●​ template_id: SRCH-01​

   ●​ title: Search Scope & Surfaces (what is searchable, where)​

   ●​ type: search_indexing​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/search/SRCH-01_Search_Scope_Surfaces.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.SRCH​

   ●​ upstream_dependencies: ["PRD-04", "DISC-03", "IAN-01", "DGL-04"]​

   ●​ inputs_required: ["PRD-04", "DISC-03", "IAN-01", "DGL-04", "DGP-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define what content/entities are searchable and where search appears in the product
(surfaces): global search, per-page search, admin search, filters, and discovery surfaces. This
prevents inconsistent search scope and makes indexing requirements deterministic.


Inputs Required
   ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

   ●​ DISC-03: {{xref:DISC-03}} | OPTIONAL​

   ●​ IAN-01: {{xref:IAN-01}} | OPTIONAL​
  ●​ DGL-04: {{xref:DGL-04}} | OPTIONAL​

  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Search surfaces list (minimum 5 if search exists; otherwise mark N/A)​

  ●​ For each surface:​

         ○​ surface_id​

         ○​ platform (web/mobile/admin)​

         ○​ location (nav, page, modal)​

         ○​ purpose​

         ○​ searchable entity types​

         ○​ permissions requirements (who can see results)​

         ○​ UX constraints pointer (DES/CDX/A11Y)​

  ●​ Searchable entity inventory:​

         ○​ entity_id​

         ○​ fields searchable​

         ○​ sensitivity constraints (PII)​

         ○​ access control rule pointer (DGL-04/PMAD)​

  ●​ Exclusions list (what must NOT be searchable)​

  ●​ Coverage check: every searchable entity has an index strategy (SRCH-03)​



Optional Fields
   ●​ SEO/public discovery notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Search results must respect authorization; never leak existence of private entities.​

   ●​ Sensitive fields must be excluded or transformed (hash/redact).​

   ●​ Surfaces must specify empty/error states pointers.​



Output Format
1) Applicability

   ●​ applies: {{search.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{search.na_block}} | OPTIONAL​



2) Search Surfaces (canonical)
 surf    platform       location       purpose      entity_typ     perms_ru     ux_poi       notes
 ace                                                    es           le_ref      nter
 _id

srf_    {{surfaces[    {{surfaces[    {{surfaces[   {{surfaces[    {{surfaces   {{surfac   {{surface
glob    0].platform}   0].location}   0].purpose    0].entities}   [0].perms}   es[0].ux   s[0].notes
al      }              }              }}            }              }            }}         }}

srf_    {{surfaces[    {{surfaces[    {{surfaces[   {{surfaces[    {{surfaces   {{surfac   {{surface
adm     1].platform}   1].location}   1].purpose    1].entities}   [1].perms}   es[1].ux   s[1].notes
in      }              }              }}            }              }            }}         }}


3) Searchable Entities (required if applies)
 entity_id     searchable_f      sensitivity      access_rule_        exclusions           notes
                   ields                              ref
{{entities[0]   {{entities[0].fi   {{entities[0].s {{entities[0].ac   {{entities[0].exclu   {{entities[0].n
.id}}           elds}}             ens}}           cess}}             sions}}               otes}}


4) Exclusions (required if applies)

   ●​ Must NOT be searchable: {{exclusions.list}}​

   ●​ Rationale: {{exclusions.rationale}} | OPTIONAL​



5) Coverage Checks (required if applies)

   ●​ Every searchable entity has SRCH-03 plan: {{coverage.index_strategy_present}}​

   ●​ Permissions defined for each surface: {{coverage.perms_present}}​



Cross-References
   ●​ Upstream: {{xref:DISC-03}} | OPTIONAL, {{xref:DGL-04}} | OPTIONAL, {{xref:IAN-01}} |
      OPTIONAL​

   ●​ Downstream: {{xref:SRCH-02}}, {{xref:SRCH-03}} | OPTIONAL, {{xref:SRCH-05}} |
      OPTIONAL, {{xref:SRCH-06}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
      {{standards.rules[STD-A11Y]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required if applies. Surfaces + searchable entities list.​

   ●​ intermediate: Required if applies. Add access rules and exclusions.​

   ●​ advanced: Required if applies. Add coverage checks and sensitivity constraints.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: seo_notes, notes, ux_pointer (if not designed yet but
    must be planned)​

 ●​ If applies == true and access_rule_ref is UNKNOWN → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.SRCH​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_surfaces_present == true​

        ○​ if_applies_then_entities_present == true​

        ○​ perms_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
