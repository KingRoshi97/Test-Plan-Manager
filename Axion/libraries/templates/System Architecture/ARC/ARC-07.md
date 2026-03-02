ARC-07
ARC-07 — Integration Architecture
(3rd-party boundaries + trust model)
Header Block
   ●​ template_id: ARC-07​

   ●​ title: Integration Architecture (3rd-party boundaries + trust model)​

   ●​ type: system_architecture​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/architecture/ARC-07_Integration_Architecture.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.ARCH​

   ●​ upstream_dependencies: ["ARC-01", "SIC-01", "RISK-03", "COMP-05"]​

   ●​ inputs_required: ["ARC-01", "SIC-01", "RISK-03", "BRP-01", "DGP-01", "SEC-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the system-level integration architecture: what external systems exist, what
boundaries/trust assumptions apply, what data crosses the boundary, and the rules for
authentication, integrity, retries, and auditing. This is the architecture-level view; per-integration
details live in SIC templates.


Inputs Required
   ●​ ARC-01: {{xref:ARC-01}} | OPTIONAL​

   ●​ SIC-01: {{xref:SIC-01}} | OPTIONAL​
  ●​ RISK-03: {{xref:RISK-03}} | OPTIONAL​

  ●​ BRP-01: {{xref:BRP-01}} | OPTIONAL​

  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ External systems list (minimum 3 if any integrations exist)​

  ●​ For each external system:​

         ○​ ext_id​

         ○​ name​

         ○​ purpose​

         ○​ direction (inbound/outbound/bidirectional)​

         ○​ trust classification (trusted/partially/untrusted)​

         ○​ auth mechanism (keys/OAuth/SSO/mTLS/webhook signature)​

         ○​ data exchanged (high-level categories)​

         ○​ PII classification (high-level, pointer to DGP)​

         ○​ integrity guarantees (signatures, replay protection)​

         ○​ rate limits/quotas (high-level)​

         ○​ failure handling model (retries, DLQ, manual ops)​

         ○​ audit/logging requirements​

         ○​ owner (internal)​
  ●​ Integration boundary rules:​

         ○​ where validation happens​

         ○​ where mapping/transforms happen​

         ○​ where secrets live and rotate​

  ●​ “Do not trust” rules (inputs that must never be accepted without validation)​

  ●​ Compatibility expectations (versioning, contract stability)​



Optional Fields
  ●​ Diagrams/pointers | OPTIONAL​

  ●​ Data residency constraints | OPTIONAL​

  ●​ Notes | OPTIONAL​



Rules
  ●​ All inbound data must be validated at the boundary (schema + auth + integrity).​

  ●​ Secrets must not be stored in code; must reference secrets management policy
     (ENV/SKM).​

  ●​ Webhook integrity must include replay protection (timestamp + nonce / signature policy).​

  ●​ Any PII crossing boundaries must follow DGP classification and retention rules.​

  ●​ Failures must be categorized and mapped to ERR taxonomy (dependency errors).​



Output Format
1) Integration Landscape (required)
ex      name       direction     purpose       trust      auth      data_c      pii_cl   owner       notes
t_                                                                  ategori      ass
id                                                                    es

ex     {{ext[0].   {{ext[0].di   {{ext[0].p   {{ext[0]   {{ext[0]   {{ext[0].   {{ext[0 {{ext[0].   {{ext[0].
t_     name}}      rection}}     urpose}}     .trust}}   .auth}}    data}}      ].pii}} owner}}     notes}}
01


2) Boundary Rules (required)

     ●​ Validation at boundary: {{boundary.validation}}​

     ●​ Mapping/transforms location: {{boundary.mapping_location}}​

     ●​ Secrets location/rotation pointer: {{boundary.secrets_pointer}} | OPTIONAL​

     ●​ Observability at boundary: {{boundary.observability}} | OPTIONAL​



3) Trust Model Rules (required)

     ●​ Trusted vs untrusted inputs policy: {{trust.inputs_policy}}​

     ●​ Do-not-trust list (required): {{trust.do_not_trust}}​

     ●​ Integrity rules: {{trust.integrity_rules}}​



4) Failure Model (required)
 failure_type       expected_behavior              retry_policy                 escalation          error_cl
                                                                                                      ass

timeout             {{failure.timeout.beha     {{failure.timeout.re     {{failure.timeout.escal     depend
                    vior}}                     try}}                    ation}}                     ency

invalid_signat {{failure.sig.behavior}         {{failure.sig.retry}}    {{failure.sig.escalation    authz
ure            }                                                        }}

schema_mis          {{failure.schema.beh       {{failure.schema.r       {{failure.schema.escal      depend
match               avior}}                    etry}}                   ation}}                     ency


5) Compatibility Expectations (required)
  ●​ Contract stability: {{compat.stability}}​

  ●​ Versioning/deprecation: {{compat.versioning}} | OPTIONAL​

  ●​ Backward compatibility stance: {{compat.backward_compat}}​



6) Audit/Logging Requirements (required)

  ●​ Required audit events: {{audit.events}}​

  ●​ Redaction policy: {{audit.redaction}}​

  ●​ Correlation ID propagation: {{audit.correlation}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:ARC-01}} | OPTIONAL, {{xref:SIC-01}} | OPTIONAL, {{xref:RISK-03}} |
     OPTIONAL​

  ●​ Downstream: {{xref:SIC-02}}, {{xref:SIC-03}}, {{xref:SIC-04}}, {{xref:SIC-05}},
     {{xref:SIC-06}} | OPTIONAL, {{xref:ERR-01}} | OPTIONAL, {{xref:SKM-*}} | OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Inventory + boundary validation + basic failure model.​

  ●​ intermediate: Required. Add trust classification and integrity guarantees.​

  ●​ advanced: Required. Add audit/redaction and compatibility expectations.​



Unknown Handling
 ●​ UNKNOWN_ALLOWED: diagrams, data_residency_constraints,
    rate_limits, notes​

 ●​ If any inbound integration lacks validation/auth rules → block Completeness Gate.​



Completeness Gate
 ●​ Gate ID: TMP-05.PRIMARY.ARCH​

 ●​ Pass conditions:​

        ○​ required_fields_present == true​

        ○​ integrations_inventory_present == true​

        ○​ boundary_rules_present == true​

        ○​ trust_rules_present == true​

        ○​ failure_model_present == true​

        ○​ placeholder_resolution == true​

        ○​ no_unapproved_unknowns == true​
