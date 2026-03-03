# IXS-09 — Sandbox/Test Environment Strategy (stubs, mocks, fixtures)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-09 |
| title | Sandbox/Test Environment Strategy (stubs, mocks, fixtures) |
| type | integration_sandbox_test_strategy |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-09_Sandbox_Test_Strategy.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-01", "IXS-02", "IXS-10"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "IXS-02", "IXS-05", "TESTPLAN-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical strategy for testing integrations safely: which vendors have sandboxes,
how stubs/mocks are used, fixture datasets, replayable test events, and CI-safe verification.
This template must ensure tests do not hit production systems and must not invent test
environments that don’t exist in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}}
- IXS-05 Data Mapping Rules: {{ixs.data_mapping}} | OPTIONAL
- Existing test plans/notes: {{inputs.test_notes}} | OPTIONAL

## Required Fields

- Sandbox availability map (integration_id → sandbox available yes/no)
- Sandbox endpoints/credentials policy (no secrets, references only)
- Stub/mock strategy (when to stub vs use sandbox)
- Fixture data strategy (schemas, sample payloads)
- Replay strategy (recorded webhooks/events)
- CI execution rules (what runs in CI)
- Safety rules (never call prod, allowlist only)
- Test coverage expectations (happy path + failure classes)
- Verification commands/policies (how to run tests)

## Optional Fields

- Contract testing approach | OPTIONAL
- Rate-limited test windows | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- No production endpoints or production credentials may be used in tests.
- Fixtures must conform to mapping rules and data schemas.
- If sandbox does not exist, tests must use stubs/mocks with deterministic fixtures.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Sandbox Availability
Integration Sandbox
integration_id: {{sandboxes[0].integration_id}}
sandbox_available: {{sandboxes[0].available}}
sandbox_endpoint: {{sandboxes[0].endpoint}} | OPTIONAL
sandbox_notes: {{sandboxes[0].notes}} | OPTIONAL
(Repeat per integration_id.)
2. Stub / Mock Strategy
use_sandbox_when: {{stubs.use_sandbox_when}}
use_stub_when: {{stubs.use_stub_when}}
mock_fidelity_rule: {{stubs.fidelity_rule}} | OPTIONAL
3. Fixtures
fixture_location: {{fixtures.location}}
fixture_format: {{fixtures.format}} (json/yaml/UNKNOWN)
schema_binding_ref: {{fixtures.schema_binding_ref}} (expected: {{xref:DATA-06}}) |
OPTIONAL
mapping_binding_ref: {{fixtures.mapping_binding_ref}} (expected: {{xref:IXS-05}}) |
OPTIONAL
4. Replay Strategy
replay_supported: {{replay.supported}}
recording_rules: {{replay.recording_rules}} | OPTIONAL
replay_runner: {{replay.runner}} | OPTIONAL
5. CI Rules
ci_tests_enabled: {{ci.enabled}}
ci_scope: {{ci.scope}}
ci_secrets_policy: {{ci.secrets_policy}} | OPTIONAL
6. Safety Rules
prod_call_block_rule: {{safety.prod_call_block_rule}}
destination_allowlist_ref: {{safety.allowlist_ref}} (expected: {{xref:IXS-03}}) | OPTIONAL
7. Coverage Expectations
must_cover:
{{coverage.must_cover[0]}}
{{coverage.must_cover[1]}} | OPTIONAL

8. Verification Commands
how_to_run: {{verify.how_to_run}}
expected_outputs: {{verify.expected_outputs}} | OPTIONAL
9. References
Integration inventory: {{xref:IXS-01}}
Integration specs: {{xref:IXS-02}}
Connectivity allowlist: {{xref:IXS-03}} | OPTIONAL
Data mapping: {{xref:IXS-05}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}}, {{xref:IXS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define sandbox availability + CI safety rules; use UNKNOWN for replay
tooling if not present.
intermediate: Required. Define stubs/fixtures and how-to-run verification.
advanced: Required. Add contract testing and replay runner rigor with deterministic fixtures.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, sandbox endpoint/notes, fidelity rule,
schema/mapping refs, replay details, ci secrets policy, allowlist ref, extra coverage items,
expected outputs, contract testing, rate-limited windows, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If ci.enabled is UNKNOWN → block Completeness Gate.
If safety.prod_call_block_rule is UNKNOWN → block Completeness Gate.
If fixtures.location is UNKNOWN → block Completeness Gate.
If verify.how_to_run is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
sandbox_map_defined == true
ci_and_safety_rules_defined == true
fixtures_defined == true
verification_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
