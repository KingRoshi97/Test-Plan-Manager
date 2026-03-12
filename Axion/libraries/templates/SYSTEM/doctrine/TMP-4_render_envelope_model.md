---
library: templates
id: TMP-4
schema_version: 1.0.0
status: draft
---

# TMP-4 — Render Envelope Model

## Purpose
Every rendered template output should have a companion envelope that records:
- what template produced it
- what inputs were used (pointers/refs)
- what knowledge items were cited
- what constraints/policies were applied (use_policy, excerpt limits)
- what verification evidence applies (optional)
This makes renders auditable, replayable, and safe.

## Key idea
Output file contains the content.
Envelope contains metadata + traceability.

## Envelope requirements (minimum)
- envelope_id, run_id
- template_id + version + path
- output_ref (path/hash)
- input_refs (canonical/standards/knowledge selection refs)
- knowledge_citations (KID IDs)
- policy_refs (risk class, policy set)
- created_at
