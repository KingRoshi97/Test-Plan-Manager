---
library: telemetry
id: TEL-0a
schema_version: 1.0.0
status: draft
---

# TEL-0a — Boundary Checklist

Belongs in `telemetry/` if it answers:
- "What events do we emit and what fields do they have?"
- "What metrics do we compute?"
- "Where can telemetry go, and what must be redacted?"

Does NOT belong in `telemetry/` if it answers:
- "What thresholds trigger alerts?" (ops)
- "How do gates pass/fail?" (gates)
