CACHE-01
CACHE-01 — Caching Strategy (what to
cache, where)
Header Block
   ●​ template_id: CACHE-01​

   ●​ title: Caching Strategy (what to cache, where)​

   ●​ type: caching_data_access_patterns​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/caching/CACHE-01_Caching_Strategy.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.CACHE​

   ●​ upstream_dependencies: ["DATA-07", "SRCH-01", "PERF-01"]​

   ●​ inputs_required: ["DATA-07", "SRCH-01", "PERF-01", "COST-01", "CACHE-03",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the caching strategy: what is cached (data and responses), where caches live
(client/server/CDN/edge/redis), why caching is needed, and what the allowed cache patterns
are.


Inputs Required
   ●​ DATA-07: {{xref:DATA-07}} | OPTIONAL​

   ●​ SRCH-01: {{xref:SRCH-01}} | OPTIONAL​

   ●​ PERF-01: {{xref:PERF-01}} | OPTIONAL​
  ●​ COST-01: {{xref:COST-01}} | OPTIONAL​

  ●​ CACHE-03: {{xref:CACHE-03}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Cache layers inventory (client/server/edge/CDN)​

  ●​ Cache candidates catalog (minimum 12)​

  ●​ For each candidate:​

         ○​ cache_id​

         ○​ data/resource cached (entity/read_model/endpoint)​

         ○​ cache layer(s)​

         ○​ key pattern (deterministic)​

         ○​ TTL (or SWR policy)​

         ○​ invalidation trigger pointer (CACHE-02)​

         ○​ sensitivity/PII constraints​

         ○​ consistency requirement (strong/eventual)​

         ○​ expected benefit (latency/cost)​

         ○​ failure fallback behavior​

  ●​ “Do not cache” list (sensitive or volatile)​

  ●​ Verification checklist​



Optional Fields
     ●​ Cache warming strategy | OPTIONAL​

     ●​ Notes | OPTIONAL​



Rules
     ●​ Cache keys must be deterministic and scoped (tenant/user where needed).​

     ●​ Do not cache sensitive data without explicit policy and encryption/segmentation.​

     ●​ Every cache entry must have TTL or invalidation; never “forever cache.”​

     ●​ Cache candidates must map to data access patterns (DATA-08) and consistency model
        (CACHE-03).​



Output Format
1) Cache Layers (required)
 layer             location                    typical_use                     notes

client    {{layers.client.location}}       {{layers.client.use}}     {{layers.client.notes}}

serve     {{layers.server.location}}       {{layers.server.use}}     {{layers.server.notes}}
r

edge      {{layers.edge.location}}         {{layers.edge.use}}       {{layers.edge.notes}}


2) Cache Candidates (canonical)
 c    cache     layer(   key_     ttl_or     invalid     sensi     consist     benefi    fallbac   notes
 a    d_tar       s)     patte    _swr       ation_r     tivity     ency         t          k
 c     get                rn                    ef
 h
 e
 _
 i
 d

c     {{cand    {{candi {{can {{can          {{candid    {{can     {{candid    {{candi   {{candi   {{cand
_     idates[   dates[ didate didat          ates[0].i   didate    ates[0].c   dates[    dates[0   idates[
0    0].targ   0].laye   s[0].k   es[0].   nvalidat    s[0].s   onsisten    0].ben    ].fallba   0].not
1    et}}      rs}}      ey}}     ttl}}    e}}         ens}}    cy}}        efit}}    ck}}       es}}

c    {{cand    {{candi   {{can    {{can    {{candid    {{can    {{candid    {{candi   {{candi    {{cand
_    idates[   dates[    didate   didat    ates[1].i   didate   ates[1].c   dates[    dates[1    idates[
0    1].targ   1].laye   s[1].k   es[1].   nvalidat    s[1].s   onsisten    1].ben    ].fallba   1].not
2    et}}      rs}}      ey}}     ttl}}    e}}         ens}}    cy}}        efit}}    ck}}       es}}


3) Do Not Cache (required)

    ●​ Do not cache list: {{no_cache.list}}​

    ●​ Rationale: {{no_cache.rationale}} | OPTIONAL​



4) Verification Checklist (required)

    ●​ {{verify[0]}}​

    ●​ {{verify[1]}}​

    ●​ {{verify[2]}} | OPTIONAL​



Cross-References
    ●​ Upstream: {{xref:CACHE-03}} | OPTIONAL, {{xref:DATA-07}} | OPTIONAL​

    ●​ Downstream: {{xref:CACHE-02}}, {{xref:CACHE-06}} | OPTIONAL, {{xref:OBS-02}} |
       OPTIONAL​

    ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
       {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
    ●​ beginner: Required. Layers + candidate list + do-not-cache.​

    ●​ intermediate: Required. Add key patterns, TTLs, and invalidation refs.​

    ●​ advanced: Required. Add sensitivity constraints and fallback behavior.​
Unknown Handling
 ●​ UNKNOWN_ALLOWED: warming_strategy, notes​

 ●​ If any candidate lacks TTL/SWR and invalidation_ref → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.CACHE​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ candidates_count >= 12​

        ○​ keys_present == true​

        ○​ ttl_or_invalidation_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true
