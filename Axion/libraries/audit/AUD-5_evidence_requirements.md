---
library: audit
id: AUD-5a
schema_version: 1.0.0
status: draft
---

# AUD-5a — Evidence Requirements (Audit Failures)

On failure, evidence must include:
- pointer to failing audit log
- failing event ids
- missing actor/reason fields
- timestamp ordering violations:
  - prior event id + timestamp
  - current event id + timestamp
- target/ref mismatch details
- integrity verification result (expected vs actual hash/root_hash)

Remediation:
- repair audit generation logic
- re-record missing required fields through corrective event if allowed
- rerun integrity verification
- block sensitive operation until audit requirements are satisfied
