---
library: intake
id: INT-6c
schema_version: 1.0.0
status: draft
---

# INT-6c — Evidence Requirements

For any failure, intake_validation_report must include:
- code (INT-...)
- field_id
- message
- pointer (JSON pointer into submission)

For cross-field failures:
- include rule_id (XVAL-...) in message or details
- pointers should include the triggering field(s) and missing/invalid field(s)
