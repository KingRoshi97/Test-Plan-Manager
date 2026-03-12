# WHCP-10 — Testing & Sandbox Strategy (test hooks, simulators)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WHCP-10                                             |
| Template Type     | Integration / Webhooks                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring testing & sandbox strategy (test hooks, simulators)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Testing & Sandbox Strategy (test hooks, simulators) Document                         |

## 2. Purpose

Define the canonical strategy for testing webhooks safely: test endpoints, simulators, sample
payload fixtures, signature generation/verification in tests, CI execution rules, and safety
constraints (never deliver to prod endpoints). This template must be consistent with the
integration sandbox strategy and webhook security/versioning rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-02 Outbound Producer Spec: {{whcp.outbound}} | OPTIONAL
- WHCP-03 Inbound Consumer Spec: {{whcp.inbound}} | OPTIONAL
- WHCP-06 Endpoint Registration: {{whcp.registration}} | OPTIONAL
- WHCP-09 Versioning/Compatibility: {{whcp.versioning}} | OPTIONAL
- IXS-09 Integration Sandbox/Test Strategy: {{ixs.test_strategy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Test surfaces (producer tests, consumer tests)
Fixture payload location and format
Signature test strategy (generate/verify)
Simulators/test hooks (what exists)
Sandbox endpoints for subscriptions (test-only)
CI rules (what runs in CI, safe allowlists)
Safety rules (block prod deliveries)
Coverage expectations (success/failure/invalid sig/version mismatch)
Verification commands (how to run)
Telemetry for tests (optional but recommended)

Optional Fields
Contract testing with consumers | OPTIONAL
Load testing strategy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Tests MUST not use production endpoints or production secrets.
Fixtures MUST include version fields and pass schema validation for targeted versions.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Test Surfaces
producer_tests: {{tests.producer_tests}}
consumer_tests: {{tests.consumer_tests}} | OPTIONAL
2. Fixtures
fixture_location: {{fixtures.location}}
fixture_format: {{fixtures.format}} (json/yaml/UNKNOWN)
versions_covered: {{fixtures.versions_covered}} | OPTIONAL
3. Signature Testing
signing_test_supported: {{sig.test_supported}}
test_key_policy: {{sig.test_key_policy}}
verification_test_rule: {{sig.verification_test_rule}} | OPTIONAL
4. Simulators / Test Hooks
simulators: {{sim.simulators}}
test_hook_endpoints: {{sim.test_hook_endpoints}} | OPTIONAL
5. Sandbox Subscriptions
sandbox_endpoints: {{sandbox.endpoints}}
registration_rules: {{sandbox.registration_rules}} | OPTIONAL
6. CI Rules
ci_enabled: {{ci.enabled}}
ci_allowlist_rule: {{ci.allowlist_rule}}
ci_secrets_policy: {{ci.secrets_policy}} | OPTIONAL
7. Safety Rules
block_prod_delivery_rule: {{safety.block_prod_delivery_rule}}
env_guard_rule: {{safety.env_guard_rule}} | OPTIONAL
8. Coverage Expectations
must_cover:
{{coverage.must_cover[0]}}
{{coverage.must_cover[1]}}
{{coverage.must_cover[2]}} | OPTIONAL

9. Verification Commands
how_to_run: {{verify.how_to_run}}
expected_outputs: {{verify.expected_outputs}} | OPTIONAL
10.References
Webhook catalog: {{xref:WHCP-01}}
Security rules: {{xref:WHCP-05}} | OPTIONAL
Versioning: {{xref:WHCP-09}} | OPTIONAL
Endpoint management: {{xref:WHCP-06}} | OPTIONAL
Integration test strategy: {{xref:IXS-09}} | OPTIONAL
Cross-References
Upstream: {{xref:WHCP-02}}, {{xref:WHCP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define fixtures + CI safety + how to run tests.
intermediate: Required. Define signature testing and simulators/test hooks and coverage list.
advanced: Required. Add contract/load testing and multi-version fixture coverage rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, consumer tests, versions covered,
verification rules, test hooks, registration rules, ci secrets policy, env guard, extra coverage
items, expected outputs, contract/load testing, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If fixtures.location is UNKNOWN → block Completeness Gate.
If ci.allowlist_rule is UNKNOWN → block Completeness Gate.
If safety.block_prod_delivery_rule is UNKNOWN → block Completeness Gate.
If verify.how_to_run is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
fixtures_defined == true
ci_and_safety_rules_defined == true
coverage_expectations_defined == true
verification_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Payments & Billing (PAY)

Payments & Billing (PAY)
PAY-01 Provider Inventory (by provider_id)
PAY-02 Payment Flow Spec (one-time, recurring, invoices)
PAY-03 Pricing & Plan Mapping (plans, tiers, entitlements)
PAY-04 Webhook Handling for Payments (events, idempotency, retries)
PAY-05 Tax/VAT Rules & Compliance (if applicable)
PAY-06 Refunds, Chargebacks & Disputes Policy
PAY-07 Ledger & Reconciliation Rules (source of truth, audits)
PAY-08 Fraud & Abuse Controls (risk checks, velocity limits)
PAY-09 Security & PCI Boundaries (tokenization, SAQ scope)
PAY-10 Billing Observability & Support Runbooks (alerts, workflows)

PAY-01

PAY-01 — Provider Inventory (by provider_id)
Header Block

## 5. Optional Fields

Contract testing with consumers | OPTIONAL
Load testing strategy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Tests MUST not use production endpoints or production secrets.**
- **Fixtures MUST include version fields and pass schema validation for targeted versions.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Test Surfaces`
2. `## Fixtures`
3. `## Signature Testing`
4. `## Simulators / Test Hooks`
5. `## Sandbox Subscriptions`
6. `## CI Rules`
7. `## Safety Rules`
8. `## Coverage Expectations`
9. `## must_cover:`
10. `## Verification Commands`

## 8. Cross-References

- **Upstream: {{xref:WHCP-02}}, {{xref:WHCP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:WHCP-08}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
