---
library: telemetry
id: TEL-6a
schema_version: 1.0.0
status: draft
---

# TEL-6a — telemetry/ Definition of Done

telemetry/ is "done" when:

## Schemas + registries
- [ ] All telemetry schemas validate (JSON Schema check)
- [ ] event types registry validates and is pinned
- [ ] sink policy validates and is pinned
- [ ] privacy policy validates and is pinned

## Runtime behavior (contract-level)
- [ ] Events emitted validate against telemetry_event_base
- [ ] event_type values are registry-backed (strict mode optional)
- [ ] Redaction is applied deterministically before sink routing
- [ ] External sinks are disabled by default and block free-text by default
- [ ] Run metrics can be computed deterministically from pinned artifacts/events
## Safety
- [ ] No secrets or tokens are emitted
- [ ] No PII is emitted by default
- [ ] No full content dumps are emitted (docs/code/intake text)
- [ ] Violating events are dropped (external) or reduced (internal) per policy

## Non-interference
- [ ] Telemetry failures do not fail the run by default (policy-controlled strict mode only)
