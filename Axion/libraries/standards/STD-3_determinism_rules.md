---
library: standards
id: STD-3b
schema_version: 1.0.0
status: draft
---

# STD-3b — Determinism Rules (Resolution)

- Applicability filter is deterministic (STD-2).
- Version selection for same pack_id is deterministic.
- Pack precedence sorting uses stable scoring + lexicographic tie-breakers.
- Rule layering is applied in pack precedence order.
- Conflict handling is deterministic using severity ordering:
  must_not > must > should.
- Any unresolved conflict behavior is risk-class + policy controlled and recorded in snapshot.
