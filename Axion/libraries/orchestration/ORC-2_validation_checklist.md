---
library: orchestration
id: ORC-2b
schema_version: 1.0.0
status: draft
---

# ORC-2b — Validation Checklist

- [ ] stage_io_registry validates against stage_io_registry schema
- [ ] every contract has schema_ref (schema_id + schema_version)
- [ ] required_fields are defined (even if empty)
- [ ] pipeline_definition consumes/produces references exist in stage_io_registry
- [ ] stage execution validates consumes before running
- [ ] stage completion verifies all produces exist and validate
