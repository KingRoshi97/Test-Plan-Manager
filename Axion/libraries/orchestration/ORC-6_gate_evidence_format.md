---
library: orchestration
id: ORC-6b
schema_version: 1.0.0
status: draft
---

# ORC-6b — Orchestration Gate Evidence Format

Every ORC gate failure report MUST include:
- gate_id
- run_id
- stage_id (if applicable)
- failing_contract_ids (if IO-related)
- expected vs actual (short)
- pointers (paths to manifest, stage report, artifacts)
- remediation guidance (what to fix)

Examples:
- ORC-GATE-02: missing consumes artifact NORMALIZED_INPUT for stage S3
- ORC-GATE-03: produced artifact STANDARDS_SNAPSHOT failed schema validation
- ORC-GATE-01: stage executed out of order
