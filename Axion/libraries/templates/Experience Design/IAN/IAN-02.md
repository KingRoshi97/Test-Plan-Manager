IAN-02
IAN-02 — Route & Deep Link Spec (route
IDs, params)
Header Block
   ●​ template_id: IAN-02​

   ●​ title: Route & Deep Link Spec (route IDs, params)​

   ●​ type: information_architecture_navigation​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/ia/IAN-02_Route_DeepLink_Spec.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.IAN​

   ●​ upstream_dependencies: ["IAN-01", "DES-02"]​

   ●​ inputs_required: ["IAN-01", "DES-02", "PRD-03", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical routing contract: route IDs/paths, parameters, and deep link behavior. This
makes navigation implementable and prevents route drift across web/mobile and across
releases.


Inputs Required
   ●​ IAN-01: {{xref:IAN-01}}​

   ●​ DES-02: {{xref:DES-02}} | OPTIONAL​

   ●​ PRD-03: {{xref:PRD-03}} | OPTIONAL​
  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Route naming convention (IDs + optional path patterns)​

  ●​ Route list (minimum equals DES-02 screens unless explicitly “screenless”)​

  ●​ For each route:​

         ○​ route_id​

         ○​ screen_id​

         ○​ path pattern (web) | OPTIONAL​

         ○​ deep link pattern(s) (mobile) | OPTIONAL​

         ○​ params schema (name/type/required/default)​

         ○​ access requirements (role/entitlement)​

         ○​ navigation type (push/replace/modal/tab)​

         ○​ canonical back target (where “back” goes)​

         ○​ analytics hook (screen_view event name) | OPTIONAL​

  ●​ Deep link behavior rules:​

         ○​ cold start handling​

         ○​ auth gating handling​

         ○​ invalid param handling​

         ○​ unknown route handling​



Optional Fields
     ●​ Legacy route aliases | OPTIONAL​

     ●​ SEO notes (web) | OPTIONAL​

     ●​ Notes | OPTIONAL​



Rules
     ●​ route_id must be stable and never reused for a different screen.​

     ●​ Params must be explicitly typed; avoid “stringly typed” ambiguity.​

     ●​ Deep links must have deterministic fallbacks (e.g., send to safe landing).​

     ●​ Access requirements must align with PRD-03/IAM/BRP entitlements; do not invent.​

     ●​ If a route is removed, define deprecation/redirect policy (REL).​



Output Format
1) Naming Conventions (required)

     ●​ Route ID format: {{routes.naming.id_format}} (e.g., route_<slug>)​

     ●​ Path format (web): {{routes.naming.web_path_format}} | OPTIONAL​

     ●​ Deep link scheme/host: {{routes.naming.deeplink_scheme}} | OPTIONAL​



2) Route Catalog (canonical)
ro     screen_     path_    deeplin   param      nav_ty     acces    back_tar    analyti    notes
ut        id       patter   k_patte   s_sche       pe       s_req      get       cs_eve
 e                   n        rns       ma                                         nt
_i
 d

ro     {{routes[   {{rout   {{routes[ {{route    {{routes[ {{route   {{routes[   {{routes   {{route
ut     0].scree    es[0].   0].deepli s[0].par   0].nav_t s[0].ac    0].back_t   [0].anal   s[0].no
e      n_id}}      path}}   nks}}     ams}}      ype}}     cess}}    arget}}     ytics}}    tes}}
_
 0
 1

 ro     {{routes[   {{rout   {{routes[ {{route    {{routes[ {{route       {{routes[     {{routes   {{route
 ut     1].scree    es[1].   1].deepli s[1].par   1].nav_t s[1].ac        1].back_t     [1].anal   s[1].no
 e      n_id}}      path}}   nks}}     ams}}      ype}}     cess}}        arget}}       ytics}}    tes}}
 _
 0
 2


3) Params Schema Detail (required)

For complex params, define explicit schema blocks.

{{routes[0].route_id}} params
      param             type          required             default         validation          notes

 {{routes[0].p      {{routes[0].p {{routes[0].par       {{routes[0].pa   {{routes[0].par    {{routes[0].p
 arams_detail       arams_detail ams_detail[0].         rams_detail[0    ams_detail[0].     arams_detail
 [0].name}}         [0].type}}    required}}            ].default}}      validation}}       [0].notes}}


4) Deep Link Rules (required)

      ●​ Cold start routing: {{deeplink.cold_start}}​

      ●​ Auth gating behavior: {{deeplink.auth_gating}}​

      ●​ Invalid params: {{deeplink.invalid_params}}​

      ●​ Unknown route: {{deeplink.unknown_route}}​

      ●​ Post-auth continuation rule: {{deeplink.post_auth_continue}} | OPTIONAL​



5) Deprecation / Redirect Rules (optional)

      ●​ Legacy aliases: {{legacy.aliases}} | OPTIONAL​

      ●​ Redirect policy: {{legacy.redirect_policy}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:IAN-01}}, {{xref:DES-02}} | OPTIONAL​

  ●​ Downstream: {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} | OPTIONAL,
     {{xref:ROUTE-*}} | OPTIONAL, {{xref:REL-02}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Route catalog with IDs, screens, and basic params.​

  ●​ intermediate: Required. Add deep link rules and access requirements.​

  ●​ advanced: Required. Add deprecation rules, analytics hooks, and typed schema details.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: path_pattern, deeplink_patterns, analytics_event,
     legacy_aliases, seo_notes, notes​

  ●​ If any route lacks route_id or screen_id mapping → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.IAN​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ route_ids_unique == true​

         ○​ every_screen_has_route == true​

         ○​ deeplink_rules_present == true​

         ○​ placeholder_resolution == true​
○​ no_unapproved_unknowns == true​
