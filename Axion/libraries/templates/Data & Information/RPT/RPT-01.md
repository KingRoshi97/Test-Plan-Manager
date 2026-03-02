RPT-01
RPT-01 — Reporting Surfaces Inventory
(dashboards, exports, admin)
Header Block
   ●​ template_id: RPT-01​

   ●​ title: Reporting Surfaces Inventory (dashboards, exports, admin)​

   ●​ type: reporting_aggregations​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/reporting/RPT-01_Reporting_Surfaces_Inventory.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.RPT​

   ●​ upstream_dependencies: ["SMIP-01", "RPT-02", "DGL-04"]​

   ●​ inputs_required: ["SMIP-01", "RPT-02", "DGL-04", "ADMIN-01", "DIST-03",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define where reporting exists in the product: dashboards, admin views, exports, scheduled
reports, and external BI surfaces. This makes reporting scope deterministic and ties it to
permissions, distribution, and metric definitions.


Inputs Required
   ●​ SMIP-01: {{xref:SMIP-01}} | OPTIONAL​

   ●​ RPT-02: {{xref:RPT-02}} | OPTIONAL​

   ●​ DGL-04: {{xref:DGL-04}} | OPTIONAL​
  ●​ ADMIN-01: {{xref:ADMIN-01}} | OPTIONAL​

  ●​ DIST-03: {{xref:DIST-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Reporting surfaces list (minimum 6 if product has reporting; otherwise mark N/A)​

  ●​ For each surface:​

         ○​ surface_id​

         ○​ platform (web/mobile/admin/external)​

         ○​ location (route/screen_id/export type)​

         ○​ purpose​

         ○​ audience (roles)​

         ○​ metrics included (metric_id list)​

         ○​ data freshness expectation (real-time/hourly/daily)​

         ○​ delivery mode (interactive/export/scheduled)​

         ○​ permissions enforcement rule pointer (DGL-04/PMAD)​

         ○​ export constraints (PII redaction, limits)​

         ○​ observability signals (usage, failures)​

  ●​ Exclusions (what is NOT available)​

  ●​ Coverage check: surfaces reference RPT-02 metrics definitions​



Optional Fields
      ●​ Customer-facing vs internal separation notes | OPTIONAL​

      ●​ Notes | OPTIONAL​



Rules
      ●​ Surfaces must not expose metrics without a canonical definition (RPT-02).​

      ●​ Exports are privileged for sensitive data; define redaction and approvals.​

      ●​ Freshness expectations must align with aggregation/snapshot strategy
         (RPT-03/RPT-04).​

      ●​ Permissions must be explicit; “admin-only” still needs role definition.​



Output Format
1) Applicability

      ●​ applies: {{reporting.applies}} (true/false)​

      ●​ 00_NA (if not applies): {{reporting.na_block}} | OPTIONAL​



2) Reporting Surfaces (canonical)
 s      platfo   locati    purp     audie     metri     fresh     delive    perm     expo     obs     note
 u       rm        on      ose      nce_r      cs       ness        ry      s_ref    rt_co             s
 rf                                  oles                                            nstra
 a                                                                                    ints
 c
 e
 _i
 d

rp     {{surfa   {{surf    {{surf   {{surfa   {{surf    {{surfa   {{surf    {{surf   {{surf   {{sur   {{surf
t_     ces[0]    aces[     aces[    ces[0].   aces[     ces[0].   aces[     aces[    aces[    face    aces[
sr     .platfo   0].loc    0].pur   audie     0].me     freshn    0].deli   0].per   0].ex    s[0].   0].no
f_     rm}}      ation}}   pose}    nce}}     trics}}   ess}}     very}}    ms}}     port}}   obs}    tes}}
0                          }                                                                  }
1
rp    {{surfa   {{surf    {{surf   {{surfa    {{surf    {{surfa   {{surf    {{surf   {{surf   {{sur   {{surf
t_    ces[1]    aces[     aces[    ces[1].    aces[     ces[1].   aces[     aces[    aces[    face    aces[
sr    .platfo   1].loc    1].pur   audie      1].me     freshn    1].deli   1].per   1].ex    s[1].   1].no
f_    rm}}      ation}}   pose}    nce}}      trics}}   ess}}     very}}    ms}}     port}}   obs}    tes}}
0                         }                                                                   }
2


3) Exclusions (required if applies)

     ●​ Not available: {{exclusions.list}}​

     ●​ Rationale: {{exclusions.rationale}} | OPTIONAL​



4) Coverage Checks (required if applies)

     ●​ All surfaces reference RPT-02 metrics: {{coverage.metrics_defined}}​

     ●​ All surfaces have permissions refs: {{coverage.perms_defined}}​



Cross-References
     ●​ Upstream: {{xref:SMIP-01}} | OPTIONAL, {{xref:DGL-04}} | OPTIONAL​

     ●​ Downstream: {{xref:RPT-03}}, {{xref:RPT-04}}, {{xref:RPT-05}} | OPTIONAL,
        {{xref:RPT-06}} | OPTIONAL​

     ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
        {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​
