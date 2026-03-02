SIC-02
SIC-02 — Contract Spec (per interface:
requests/responses/events/auth/errors)
Header Block
   ●​ template_id: SIC-02​

   ●​ title: Contract Spec (per interface: requests/responses/events/auth/errors)​

   ●​ type: system_interfaces_integration_contracts​

   ●​ template_version: 1.0.0​

   ●​ output_path: 10_app/integrations/SIC-02_Interface_Contract_Specs.md​

   ●​ compliance_gate_id: TMP-05.PRIMARY.INTEGRATION​

   ●​ upstream_dependencies: ["SIC-01", "ARC-07", "ERR-03"]​

   ●​ inputs_required: ["SIC-01", "ARC-07", "ERR-03", "DGP-01", "SEC-02", "APIG-02",
      "STANDARDS_INDEX"]​

   ●​ required_by_skill_level: {"beginner": true, "intermediate": true, "advanced": true}​



Purpose
Define the detailed, enforceable contract for each external interface: authentication,
request/response shapes, events, validation rules, error mapping, rate limits, and operational
expectations. This is the authoritative specification used to implement and validate integrations.


Inputs Required
   ●​ SIC-01: {{xref:SIC-01}}​

   ●​ ARC-07: {{xref:ARC-07}} | OPTIONAL​

   ●​ ERR-03: {{xref:ERR-03}} | OPTIONAL​
  ●​ DGP-01: {{xref:DGP-01}} | OPTIONAL​

  ●​ SEC-02: {{xref:SEC-02}} | OPTIONAL​

  ●​ APIG-02: {{xref:APIG-02}} | OPTIONAL​

  ●​ STANDARDS_INDEX: {{standards.index}} | OPTIONAL​



Required Fields
  ●​ One contract block per interface_id​

  ●​ Per contract:​

         ○​ interface_id + external system name​

         ○​ direction​

         ○​ auth method details (headers/scopes/keys/mTLS)​

         ○​ endpoints/events covered (list)​

         ○​ request schema(s)​

         ○​ response schema(s)​

         ○​ validation rules (schema + semantic checks)​

         ○​ idempotency expectations (if any)​

         ○​ pagination/filtering rules (if any)​

         ○​ error handling:​

                 ■​ status mapping (if HTTP)​

                 ■​ reason_code mapping policy​

                 ■​ retryability rules (ties to ERR-05)​

         ○​ rate limits/quotas and backoff expectations​
          ○​ timeout policy and SLAs (if known)​

          ○​ logging/audit requirements (redaction)​

          ○​ versioning and compatibility policy (APIG)​

   ●​ Test requirements (contract tests) summary​



Optional Fields
   ●​ Example payloads | OPTIONAL​

   ●​ Sandbox/dev environment notes | OPTIONAL​

   ●​ Notes | OPTIONAL​



Rules
   ●​ Contracts must not include secrets; reference where they are stored/rotated.​

   ●​ Any inbound contract must define signature/integrity and replay protection if applicable.​

   ●​ All error handling must map to the system error model (ERR).​

   ●​ Validation must include both schema and semantic checks (where needed).​

   ●​ Versioning policy must be explicit; if vendor changes, define update cadence.​



Output Format
Contract: {{contracts[0].interface_id}} — {{contracts[0].system_name}}

1) Overview

   ●​ Direction: {{contracts[0].direction}}​

   ●​ Interface type: {{contracts[0].type}}​
   ●​ Purpose: {{contracts[0].purpose}} | OPTIONAL​

   ●​ Stability: {{contracts[0].stability}} | OPTIONAL​


2) Authentication

   ●​ Method: {{contracts[0].auth.method}}​

   ●​ Required headers/scopes: {{contracts[0].auth.requirements}}​

   ●​ Rotation/expiry policy: {{contracts[0].auth.rotation}} | OPTIONAL​

   ●​ Integrity/signature: {{contracts[0].auth.integrity}} | OPTIONAL​


3) Endpoints / Events Covered

        id                kind                  name                direction              notes
                     (endpoint/even
                           t)

 {{contracts[0].it   {{contracts[0].ite   {{contracts[0].ite   {{contracts[0].item   {{contracts[0].ite
 ems[0].id}}         ms[0].kind}}         ms[0].name}}         s[0].direction}}      ms[0].notes}}

4) Schemas

   ●​ Request schemas: {{contracts[0].schemas.requests}}​

   ●​ Response schemas: {{contracts[0].schemas.responses}}​

   ●​ Shared types: {{contracts[0].schemas.shared}} | OPTIONAL​


5) Validation Rules

   ●​ Schema validation: {{contracts[0].validation.schema}}​

   ●​ Semantic validation: {{contracts[0].validation.semantic}} | OPTIONAL​

   ●​ Rejection behavior: {{contracts[0].validation.rejection_behavior}}​


6) Idempotency / Pagination (if applicable)
   ●​ Idempotency: {{contracts[0].idempotency}} | OPTIONAL​

   ●​ Pagination: {{contracts[0].pagination}} | OPTIONAL​

   ●​ Filtering/sorting: {{contracts[0].filtering}} | OPTIONAL​


7) Error Handling

   ●​ Status mapping: {{contracts[0].errors.status_mapping}} | OPTIONAL​

   ●​ Reason codes mapping policy: {{contracts[0].errors.reason_codes}}​

   ●​ Retryability rules: {{contracts[0].errors.retryability}}​

   ●​ Backoff expectations: {{contracts[0].errors.backoff}} | OPTIONAL​


8) Limits, Timeouts, SLAs

   ●​ Rate limits/quotas: {{contracts[0].limits.rate_limits}} | OPTIONAL​

   ●​ Timeout policy: {{contracts[0].limits.timeouts}} | OPTIONAL​

   ●​ SLA expectations: {{contracts[0].limits.sla}} | OPTIONAL​


9) Logging / Audit

   ●​ Required fields: {{contracts[0].logging.required_fields}}​

   ●​ Redaction rules: {{contracts[0].logging.redaction}}​

   ●​ Audit events: {{contracts[0].logging.audit_events}} | OPTIONAL​


10) Versioning / Compatibility

   ●​ Versioning policy: {{contracts[0].versioning.policy}}​

   ●​ Deprecation policy: {{contracts[0].versioning.deprecation}} | OPTIONAL​

   ●​ Upgrade cadence: {{contracts[0].versioning.cadence}} | OPTIONAL​


11) Test Requirements
  ●​ Contract tests required: {{contracts[0].tests.contract_tests}}​

  ●​ Mocking/stubbing notes: {{contracts[0].tests.mocking}} | OPTIONAL​



Cross-References
  ●​ Upstream: {{xref:SIC-01}}, {{xref:ARC-07}} | OPTIONAL​

  ●​ Downstream: {{xref:SIC-05}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL, {{xref:QA-03}} |
     OPTIONAL​

  ●​ Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
     {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
     {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL​



Skill Level Requiredness Rules
  ●​ beginner: Required. Auth + item list + schemas + basic error handling.​

  ●​ intermediate: Required. Add validation rules and rate/timeout expectations.​

  ●​ advanced: Required. Add versioning policy, audit requirements, and contract test
     expectations.​



Unknown Handling
  ●​ UNKNOWN_ALLOWED: example_payloads, sandbox_notes, sla, rate_limits,
     timeouts, notes​

  ●​ If auth method details or validation rules are UNKNOWN for an inbound interface →
     block Completeness Gate.​



Completeness Gate
  ●​ Gate ID: TMP-05.PRIMARY.INTEGRATION​
●​ Pass conditions:​

       ○​ required_fields_present == true​

       ○​ every_interface_has_contract_block == true​

       ○​ auth_defined == true​

       ○​ schemas_defined == true​

       ○​ validation_defined == true​

       ○​ error_handling_defined == true​

       ○​ versioning_defined == true​

       ○​ placeholder_resolution == true​

       ○​ no_unapproved_unknowns == true
