CACHE-02
CACHE-02 — Invalidation Rules (events,
TTLs, busting)
Header Block
   ●​ template_id: CACHE-02​

   ●​ title: Invalidation Rules (events, TTLs, busting)​

   ●​ type: caching_data_access_patterns​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/caching/CACHE-02_Invalidation_Rules.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CACHE​

   ●​ upstream_dependencies: ["CACHE-01", "EVT-01", "WFO-01"]​

   ●​ inputs_required: ["CACHE-01", "EVT-01", "WFO-01", "ERR-05", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define deterministic cache invalidation: what events or conditions invalidate what keys, TTL
policies, busting strategies, and safe fallback behavior. This prevents stale data bugs and
inconsistent cache behavior across layers.


Inputs Required
   ●​ CACHE-01: {{xref:CACHE-01}} | OPTIONAL​

   ●​ EVT-01: {{xref:EVT-01}} | OPTIONAL​

   ●​ WFO-01: {{xref:WFO-01}} | OPTIONAL​
  ●​ ERR-05: {{xref:ERR-05}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Invalidation policy (global)​

  ●​ Invalidation rule catalog (minimum 15 rules)​

  ●​ For each rule:​

         ○​ inv_id​

         ○​ cache_id (from CACHE-01)​

         ○​ trigger (event/entity mutation/time/explicit bust)​

         ○​ keys affected (pattern)​

         ○​ propagation scope (client/server/edge)​

         ○​ execution mode (sync/async)​

         ○​ delay tolerance (max staleness)​

         ○​ failure handling (retry/skip/mark stale)​

         ○​ observability signals (invalidation success, lag)​

  ●​ “Hard bust” policy (emergency invalidation)​

  ●​ Verification checklist​



Optional Fields
  ●​ Cache stampede mitigation rules | OPTIONAL​

  ●​ Notes | OPTIONAL​
Rules
     ●​ Every cache candidate must have at least one invalidation rule OR explicit TTL-only
        policy.​

     ●​ Invalidation triggers must map to real mutations/events (EVT) or workflow steps (WFO).​

     ●​ Propagation must be defined across layers; no “invalidate somewhere.”​

     ●​ Failure handling must avoid stale-for-ever.​



Output Format
1) Global Policy (required)

     ●​ Default invalidation stance: {{policy.default}}​

     ●​ TTL-only allowed when: {{policy.ttl_only_allowed}}​

     ●​ Max staleness default: {{policy.max_staleness_default}} | OPTIONAL​



2) Invalidation Rules (canonical)
in     cache_i     trigger    keys_     scope      mode      max_sta      failure_     obs     notes
 v        d                   affect                          leness      handlin
_i                              ed                                            g
 d

in    {{rules[0]   {{rules[0 {{rules[ {{rules[    {{rules[   {{rules[0]   {{rules[    {{rules {{rules[
v     .cache_i     ].trigger 0].keys 0].scop      0].mod     .stalenes    0].failur   [0].obs 0].note
_     d}}          }}        }}       e}}         e}}        s}}          e}}         }}      s}}
0
1

in    {{rules[1]   {{rules[1 {{rules[ {{rules[    {{rules[   {{rules[1]   {{rules[    {{rules {{rules[
v     .cache_i     ].trigger 1].keys 1].scop      1].mod     .stalenes    1].failur   [1].obs 1].note
_     d}}          }}        }}       e}}         e}}        s}}          e}}         }}      s}}
0
2


3) Hard Bust Policy (required)
   ●​ When allowed: {{hard_bust.when}}​

   ●​ Who can do it: {{hard_bust.who}}​

   ●​ Required audit event: {{hard_bust.audit_event}} | OPTIONAL​

   ●​ Safety checks: {{hard_bust.safety_checks}} | OPTIONAL​



4) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:CACHE-01}} | OPTIONAL, {{xref:EVT-01}} | OPTIONAL,
      {{xref:WFO-01}} | OPTIONAL​

   ●​ Downstream: {{xref:CACHE-06}} | OPTIONAL, {{xref:OBS-04}} | OPTIONAL,
      {{xref:QA-04}} | OPTIONAL​

   ●​ Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
      {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
   ●​ beginner: Required. Global policy + rule catalog structure.​

   ●​ intermediate: Required. Add propagation scope and max staleness.​

   ●​ advanced: Required. Add failure handling and hard-bust governance.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: stampede_mitigation, notes, audit_event (if not wired
    yet but must be planned)​

 ●​ If any cache_id has no invalidation rule and no TTL-only justification → block
    Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.CACHE​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ rules_count >= 15​

        ○​ every_cache_has_invalidation_or_ttl_only == true​

        ○​ hard_bust_policy_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
