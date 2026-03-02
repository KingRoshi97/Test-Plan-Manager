RTM-03
RTM-03 — Channel/Topic Model (naming,
scoping, permissions)
Header Block
   ●​ template_id: RTM-03​

   ●​ title: Channel/Topic Model (naming, scoping, permissions)​

   ●​ type: realtime_messaging_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/realtime/RTM-03_Channel_Topic_Model.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.REALTIME​

   ●​ upstream_dependencies: ["RTM-01", "PMAD-01", "PMAD-02", "ARC-05"]​

   ●​ inputs_required: ["RTM-01", "PMAD-01", "PMAD-02", "ARC-05", "ERR-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the canonical model for realtime channels/topics: naming, scoping, membership rules,
permission checks for join/publish/subscribe, and how channel identity maps to domain entities
(rooms, streams, orgs).


Inputs Required
   ●​ RTM-01: {{xref:RTM-01}} | OPTIONAL​

   ●​ PMAD-01: {{xref:PMAD-01}} | OPTIONAL​

   ●​ PMAD-02: {{xref:PMAD-02}} | OPTIONAL​
  ●​ ARC-05: {{xref:ARC-05}} | OPTIONAL​

  ●​ ERR-02: {{xref:ERR-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Channel types list (minimum 5 if realtime exists)​

  ●​ For each channel type:​

         ○​ channel_type_id​

         ○​ purpose​

         ○​ naming convention (template string)​

         ○​ scope key(s) (org_id, room_id, stream_id, user_id)​

         ○​ membership model (open/invite/role-gated)​

         ○​ join authorization rule (policy_id or predicate)​

         ○​ publish authorization rule​

         ○​ subscribe authorization rule​

         ○​ visibility (discoverable or hidden)​

         ○​ retention/replay policy (if any)​

         ○​ moderation hooks (if applicable)​

  ●​ Global naming rules (allowed chars, length, versioning)​

  ●​ Channel lifecycle rules (create/join/leave/delete/archive)​

  ●​ Coverage checks: realtime use cases map to at least one channel type​



Optional Fields
  ●​ Multi-tenant isolation notes | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Channel names must be deterministic and derived from stable identifiers.​

  ●​ Server-side enforcement required for join and publish.​

  ●​ Private channels must be non-enumerable (no listing without access).​

  ●​ If replay/retention exists, define retention limits and access controls.​



Output Format
1) Naming Rules (required)

  ●​ Allowed characters: {{naming.allowed_chars}}​

  ●​ Max length: {{naming.max_length}}​

  ●​ Format policy: {{naming.format_policy}}​

  ●​ Versioning policy: {{naming.versioning}} | OPTIONAL​



2) Channel Types (canonical)
cha    purp    nam      sco     memb     join_    publis    subscr     visib     repla    mode     not
nne    ose     e_te     pe_     ership   auth     h_aut     ibe_au      ility    y_ret    ration   es
l_ty           mpla     key                         h         th                 entio
pe_             te       s                                                         n
 id

ch_    {{typ   {{typ    {{typ   {{type   {{type   {{types   {{types[   {{typ     {{typ    {{type   {{typ
roo    es[0]   es[0].   es[0    s[0].m   s[0].j   [0].pub   0].subs    es[0].    es[0].   s[0].m   es[0
m      .purp   templ    ].sco   ember    oin_a    lish_a    cribe_a    visibil   reten    oderat   ].not
       ose}}   ate}}    pe}}    ship}}   uth}}    uth}}     uth}}      ity}}     tion}}   ion}}    es}}
ch_    {{typ   {{typ    {{typ    {{type   {{type   {{types   {{types[   {{typ     {{typ    {{type   {{typ
dm     es[1]   es[1].   es[1     s[1].m   s[1].j   [1].pub   1].subs    es[1].    es[1].   s[1].m   es[1
       .purp   templ    ].sco    ember    oin_a    lish_a    cribe_a    visibil   reten    oderat   ].not
       ose}}   ate}}    pe}}     ship}}   uth}}    uth}}     uth}}      ity}}     tion}}   ion}}    es}}


3) Channel Lifecycle Rules (required)

  ●​ Create rule: {{lifecycle.create}}​

  ●​ Join rule: {{lifecycle.join}}​

  ●​ Leave/disconnect rule: {{lifecycle.leave}}​

  ●​ Archive/delete rule: {{lifecycle.delete_archive}} | OPTIONAL​



4) Use Case Coverage (required)
      rt_usecase_id                channel_type_ids

{{coverage[0].usecase}}         {{coverage[0].channels}}

{{coverage[1].usecase}}         {{coverage[1].channels}}


Cross-References
  ●​ Upstream: {{xref:PMAD-02}} | OPTIONAL, {{xref:RTM-01}} | OPTIONAL​

  ●​ Downstream: {{xref:RTM-04}}, {{xref:RTM-06}} | OPTIONAL, {{xref:MSG-}} | OPTIONAL,
     {{xref:OBS-}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-NAMING]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Channel types + naming + basic auth rules.​

  ●​ intermediate: Required. Add lifecycle rules and visibility/retention policy.​
 ●​ advanced: Required. Add coverage checks and isolation notes.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: retention_replay, moderation_hooks,
    isolation_notes, notes​

 ●​ If join_auth or publish_auth is UNKNOWN for any channel type → block Completeness
    Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.REALTIME​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ channel_types_present == true​

        ○​ auth_rules_present == true​

        ○​ lifecycle_rules_present == true​

        ○​ coverage_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
