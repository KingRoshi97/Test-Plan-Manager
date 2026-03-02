RTM-01
RTM-01 — Realtime Use Cases Catalog
(presence, chat, streams, updates)
Header Block
   ●​ template_id: RTM-01​

   ●​ title: Realtime Use Cases Catalog (presence, chat, streams, updates)​

   ●​ type: realtime_messaging_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/realtime/RTM-01_Realtime_UseCases_Catalog.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.REALTIME​

   ●​ upstream_dependencies: ["PRD-04", "DES-01", "ARC-05", "PMAD-01", "RISK-02"]​

   ●​ inputs_required: ["PRD-04", "DES-01", "ARC-05", "PMAD-01", "ERR-01", "RISK-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical list of realtime use cases and their required semantics so the system
doesn’t implement “realtime” inconsistently. This sets expectations for presence,
chat/messaging, livestream signaling, live updates, and realtime moderation hooks.


Inputs Required
   ●​ PRD-04: {{xref:PRD-04}} | OPTIONAL​

   ●​ DES-01: {{xref:DES-01}} | OPTIONAL​

   ●​ ARC-05: {{xref:ARC-05}} | OPTIONAL​
  ●​ PMAD-01: {{xref:PMAD-01}} | OPTIONAL​

  ●​ ERR-01: {{xref:ERR-01}} | OPTIONAL​

  ●​ RISK-02: {{xref:RISK-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Use case list (minimum 5 if realtime exists; otherwise mark N/A)​

  ●​ For each use case:​

         ○​ rt_usecase_id​

         ○​ name​

         ○​ purpose​

         ○​ linked_feature_ids​

         ○​ realtime primitive (presence/message/stream_signal/live_state)​

         ○​ criticality (P0/P1/P2)​

         ○​ delivery semantics required (ordering/ack/retry/dedupe)​

         ○​ authorization requirement (who can join/send)​

         ○​ data sensitivity (PII/none)​

         ○​ abuse/moderation hooks needed (yes/no + type)​

         ○​ scaling assumptions (qualitative)​

         ○​ fallback behavior (when realtime unavailable)​

         ○​ observability requirements (key fields/metrics)​

  ●​ Coverage check: every realtime feature has at least one use case defined​
Optional Fields
   ●​ Multi-region notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ If applies == false, include 00_NA block only.​

   ●​ Every use case must specify fallback behavior.​

   ●​ Every use case must specify authorization requirements (join/send).​

   ●​ Delivery semantics must be explicit; “best effort” must state what can be dropped.​



Output Format
1) Applicability

   ●​ applies: {{rtm.applies}} (true/false)​

   ●​ 00_NA (if not applies): {{rtm.na_block}} | OPTIONAL​



2) Realtime Use Cases (canonical)
rt_   nam     primit   featur     critic     sema      auth    sensit     moder     fallba     obs    note
us     e       ive     e_ids      ality      ntics     _req     ivity     ation_      ck       _req    s
ec                                                                        hooks                uire
as                                                                                             men
e_                                                                                              ts
 id

rtu   {{use   {{usec   {{usec     {{usec     {{usec    {{us    {{usec     {{usec    {{use      {{us   {{use
_0    case    ases[    ases[0     ases[      ases[0    ecas    ases[0     ases[0    cases      ecas   case
1     s[0].   0].pri   ].featur   0].criti   ].sema    es[0]   ].sensi    ].mode    [0].fall   es[0   s[0].
      nam     mitive   e_ids}}    cality}    ntics}}   .aut    tivity}}   ration}   back}      ].ob   note
      e}}     }}                  }                    h}}                }         }          s}}    s}}
rtu   {{use   {{usec   {{usec     {{usec     {{usec    {{us    {{usec     {{usec    {{use      {{us   {{use
_0    case    ases[    ases[1     ases[      ases[1    ecas    ases[1     ases[1    cases      ecas   case
2     s[1].   1].pri   ].featur   1].criti   ].sema    es[1]   ].sensi    ].mode    [1].fall   es[1   s[1].
      nam     mitive   e_ids}}    cality}    ntics}}   .aut    tivity}}   ration}   back}      ].ob   note
      e}}     }}                  }                    h}}                }         }          s}}    s}}


3) Coverage Checks (required if applies)

  ●​ All realtime features covered: {{coverage.features_covered}}​

  ●​ All use cases have fallback: {{coverage.fallback_complete}}​

  ●​ All use cases have auth requirements: {{coverage.auth_complete}}​



Cross-References
  ●​ Upstream: {{xref:ARC-05}} | OPTIONAL, {{xref:PMAD-01}} | OPTIONAL, {{xref:ERR-01}}
     | OPTIONAL​

  ●​ Downstream: {{xref:RTM-02}}, {{xref:RTM-03}}, {{xref:RTM-04}}, {{xref:RTM-05}},
     {{xref:RTM-06}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required if applies. Define use cases + fallback + auth.​

  ●​ intermediate: Required if applies. Add delivery semantics and observability needs.​

  ●​ advanced: Required if applies. Add moderation hooks and scaling assumptions.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: multi_region_notes, notes, scaling_assumptions
     (but must be planned)​
 ●​ If applies == true and any use case lacks fallback → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.REALTIME​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ if_applies_then_usecases_present == true​

        ○​ fallback_complete == true​

        ○​ auth_complete == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
