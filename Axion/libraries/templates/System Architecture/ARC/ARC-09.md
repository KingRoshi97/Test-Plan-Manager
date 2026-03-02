ARC-09
ARC-09 — Cross-Cutting Concerns
(logging, tracing, rate limits, caching
touchpoints)
Header Block
   ●​ template_id: ARC-09​

   ●​ title: Cross-Cutting Concerns (logging, tracing, rate limits, caching touchpoints)​

   ●​ type: system_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/architecture/ARC-09_Cross_Cutting_Concerns.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ARCH​

   ●​ upstream_dependencies: ["ARC-01", "ARC-02", "ERR-06", "OBS-01", "APIG-01"]​

   ●​ inputs_required: ["ARC-01", "ARC-02", "ERR-06", "OBS-01", "OBS-03", "APIG-01",
      "RLIM-01", "CACHE-01", "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define how cross-cutting concerns are applied consistently across all boundaries: observability
(logs/metrics/traces), rate limiting/abuse controls touchpoints, caching strategy touchpoints, and
global policies that must not vary by service without explicit exception.


Inputs Required
   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​
  ●​ ARC-02: {{xref:ARC-02}} | OPTIONAL​

  ●​ OBS-01: {{xref:OBS-01}} | OPTIONAL​

  ●​ OBS-03: {{xref:OBS-03}} | OPTIONAL​

  ●​ ERR-06: {{xref:ERR-06}} | OPTIONAL​

  ●​ APIG-01: {{xref:APIG-01}} | OPTIONAL​

  ●​ RLIM-01: {{xref:RLIM-01}} | OPTIONAL​

  ●​ CACHE-01: {{xref:CACHE-01}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ Concern categories (minimum: logging, tracing, metrics, rate limiting, caching)​

  ●​ For each category:​

         ○​ canonical policy statement​

         ○​ required fields or behaviors​

         ○​ enforcement points (gateway/service/client)​

         ○​ exceptions policy (how to deviate)​

  ●​ Boundary touchpoints map (where each concern applies)​

  ●​ Required propagation rules (correlation IDs, trace headers, request IDs)​

  ●​ PII redaction rule for observability​

  ●​ Verification checklist​



Optional Fields
  ●​ Cost controls (sampling, retention) | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ Observability fields must be consistent across services (define minimum set).​

  ●​ Correlation/trace IDs must propagate across all hops including async boundaries.​

  ●​ Rate limiting must be enforceable at a deterministic point (edge/gateway preferred).​

  ●​ Caching must not violate correctness or authorization; never cache privileged data
     without scope keys.​

  ●​ Any exception must be documented with rationale and owner.​



Output Format
1) Canonical Policies (required)
 conc        policy         enforcement_p         required_field      exceptions_all          notes
  ern                            oints              s_or_rules            owed

loggi    {{policies.logg    {{policies.logging    {{policies.loggi    {{policies.loggin   {{policies.log
ng       ing.policy}}       .enforcement}}        ng.required}}       g.exceptions}}      ging.notes}}

tracin   {{policies.traci   {{policies.tracing.   {{policies.tracin {{policies.tracing {{policies.trac
g        ng.policy}}        enforcement}}         g.required}}      .exceptions}}      ing.notes}}

metri    {{policies.met     {{policies.metrics    {{policies.metri    {{policies.metric   {{policies.met
cs       rics.policy}}      .enforcement}}        cs.required}}       s.exceptions}}      rics.notes}}

rate_l   {{policies.ratel   {{policies.ratelimi   {{policies.rateli   {{policies.ratelim {{policies.rate
imitin   imit.policy}}      t.enforcement}}       mit.required}}      it.exceptions}}    limit.notes}}
g

cachi    {{policies.cac     {{policies.caching    {{policies.cachi    {{policies.cachin   {{policies.cac
ng       hing.policy}}      .enforcement}}        ng.required}}       g.exceptions}}      hing.notes}}


2) Touchpoints Map (required)
 boundary_i       logging        tracing       metrics       rate_limiti     caching        notes
     d                                                           ng

{{touchpoint    {{touchpoin    {{touchpoi     {{touchpoin    {{touchpoint {{touchpoin     {{touchpoi
s[0].bounda     ts[0].loggin   nts[0].traci   ts[0].metric   s[0].ratelimi ts[0].cachin   nts[0].not
ry}}            g}}            ng}}           s}}            t}}           g}}            es}}


3) Propagation Rules (required)

   ●​ Correlation ID header: {{propagation.correlation_header}}​

   ●​ Trace context standard: {{propagation.trace_standard}}​

   ●​ Async propagation (events/jobs): {{propagation.async}}​

   ●​ Client → server propagation: {{propagation.client_server}}​



4) PII Redaction Rules (required)

   ●​ Never log: {{redaction.never_log}}​

   ●​ Allowed with hashing: {{redaction.hash_ok}} | OPTIONAL​

   ●​ Sampling/retention policy pointer: {{redaction.retention_pointer}} | OPTIONAL​



5) Verification Checklist (required)

   ●​ {{verify[0]}}​

   ●​ {{verify[1]}}​

   ●​ {{verify[2]}}​

   ●​ {{verify[3]}} | OPTIONAL​



Cross-References
   ●​ Upstream: {{xref:OBS-01}} | OPTIONAL, {{xref:OBS-03}} | OPTIONAL, {{xref:ERR-06}} |
      OPTIONAL, {{xref:APIG-01}} | OPTIONAL​
  ●​ Downstream: {{xref:OPS-05}} | OPTIONAL, {{xref:OBS-04}} | OPTIONAL,
     {{xref:PERF-*}} | OPTIONAL, {{xref:QA-04}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Policies + propagation rules + basic touchpoints.​

  ●​ intermediate: Required. Add redaction rules and exceptions policy.​

  ●​ advanced: Required. Add verification checklist and cost controls.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: cost_controls, retention_pointer, notes,
     exceptions_allowed​

  ●​ If propagation rules are UNKNOWN → block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.ARCH​

  ●​ Pass conditions:​

         ○​ required_fields_present == true​

         ○​ canonical_policies_present == true​

         ○​ touchpoints_present == true​

         ○​ propagation_rules_present == true​

         ○​ redaction_rules_present == true​

         ○​ placeholder_resolution == true​
○​ no_unapproved_unknowns == true​
