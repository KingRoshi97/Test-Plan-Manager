IAN-03
IAN-03 — Information Architecture Tree
(sections/pages hierarchy)
Header Block
   ●​ template_id: IAN-03​

   ●​ title: Information Architecture Tree (sections/pages hierarchy)​

   ●​ type: information_architecture_navigation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/ia/IAN-03_IA_Tree.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IAN​

   ●​ upstream_dependencies: ["IAN-01", "DES-02", "URD-03"]​

   ●​ inputs_required: ["IAN-01", "DES-02", "URD-03", "PRD-04", "CDX-01",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical information hierarchy: top-level sections, sub-sections, and the
screens/pages that live within each. This makes the product navigable, supports labeling
consistency, and prevents duplicated or orphaned surfaces.


Inputs Required
   ●​ IAN-01: {{xref:IAN-01}} | OPTIONAL​

   ●​ DES-02: {{xref:DES-02}} | OPTIONAL​

   ●​ URD-03: {{xref:URD-03}} | OPTIONAL​
  ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

  ●​ CDX-01: {{xref:CDX-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ IA tree (minimum 2 levels deep for non-trivial products)​

  ●​ Each node includes:​

         ○​ node_id​

         ○​ label (or label key)​

         ○​ type (section/subsection/page/group)​

         ○​ destination (screen_id/route_id) if navigable​

         ○​ visibility rules (role/tier/access)​

         ○​ ordering​

  ●​ Cross-links (where a screen appears in multiple contexts) with primary home​

  ●​ Coverage check: every screen_id from DES-02 appears in exactly one primary place
     (can have secondary links)​



Optional Fields
  ●​ Search taxonomy (tags/categories) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ IA labels must align with CDX-01 style rules; final strings live in CDX-02.​
      ●​ Avoid duplicating screens in multiple primary homes; if needed, choose one primary and
         list others as secondary links.​

      ●​ Visibility rules must be deterministic (no “depends”).​

      ●​ If a screen is “utility” (settings, help), it must still have a home location.​



Output Format
1) IA Tree (required)

Use a structured outline plus a canonical table.

Outline

      ●​ {{ia.root.label}}​

              ○​ {{ia.root.children[0].label}}​

                      ■​ {{ia.root.children[0].children[0].label}} (screen:
                         {{ia.root.children[0].children[0].screen_id}}) | OPTIONAL​

              ○​ {{ia.root.children[1].label}} | OPTIONAL​



2) IA Nodes Table (canonical)
 no       label      type     destinati     destinati    visibility    order     primary_ho      notes
 de                           on_scree      on_rout       _rules                     me
 _i                             n_id          e_id
  d

 no     {{nodes    {{nodes {{nodes[0        {{nodes[0 {{nodes[0 {{nodes          {{nodes[0].p   {{nodes
 de     [0].labe   [0].type ].screen_i      ].route_id ].visibility} [0].orde    rimary_hom     [0].note
 _0     l}}        }}       d}}             }}         }             r}}         e}}            s}}
 1

 no     {{nodes    {{nodes {{nodes[1        {{nodes[1 {{nodes[1 {{nodes          {{nodes[1].p   {{nodes
 de     [1].labe   [1].type ].screen_i      ].route_id ].visibility} [1].orde    rimary_hom     [1].note
 _0     l}}        }}       d}}             }}         }             r}}         e}}            s}}
 2


3) Cross-links (required if any)
      screen_id           primary_node_id        secondary_node_ids             rationale

{{crosslinks[0].screen   {{crosslinks[0].prima   {{crosslinks[0].second   {{crosslinks[0].rationa
_id}}                    ry}}                    ary}}                    le}}


4) Coverage Checks (required)

  ●​ Every DES-02 screen has a primary node: {{coverage.all_screens_have_primary}}​

  ●​ No screen has multiple primaries: {{coverage.no_multiple_primary}}​

  ●​ Utility screens placed: {{coverage.utility_placed}} | OPTIONAL​



5) Search Taxonomy (optional)

  ●​ Tags/categories: {{search.taxonomy}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:IAN-01}}, {{xref:DES-02}} | OPTIONAL, {{xref:URD-03}} | OPTIONAL​

  ●​ Downstream: {{xref:IAN-02}} | OPTIONAL, {{xref:CDX-02}} | OPTIONAL, {{xref:DISC-*}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Basic tree + node table for primary sections and pages.​

  ●​ intermediate: Required. Add visibility rules and cross-links.​

  ●​ advanced: Required. Add coverage checks and search taxonomy if applicable.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: search_taxonomy, notes, secondary_links,
    destination_route_id (until IAN-02)​

 ●​ If any DES-02 screen lacks a primary node → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.IAN​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ tree_present == true​

        ○​ node_ids_unique == true​

        ○​ all_screens_have_primary == true​

        ○​ no_multiple_primary == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
