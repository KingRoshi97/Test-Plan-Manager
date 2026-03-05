---
library: intake
id: INT-5
schema_version: 1.0.0
status: draft
---

# INT-5 — Stable ID + Ordering Rules

## Stable IDs
### submission_id
- Format: SUB-<6+ alnum>
- Must be generated once at submission creation.
- Never regenerated during normalization or validation.

### attachment_id
- Format: ATT-<6+ alnum>
- Stable for the life of the submission.
- Attachment hash is optional but recommended.

## Ordering rules
- intake_submission.answers must be sorted by field_id (for deterministic storage)
  - OR preserve user order but normalized_input must be deterministic. Pick one; recommended:
    - keep raw answers in user order (audit)
    - normalized_input uses deterministic map + sorted multi-values
- normalized_input multi lists are:
 - trimmed
 - de-duped
 - lexicographically sorted

## Slugify rule (stable)
- lowercase
- spaces/underscores → hyphen
- remove non-alnum except hyphen
- collapse repeated hyphens
