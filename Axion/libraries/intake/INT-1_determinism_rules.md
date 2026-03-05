---
library: intake
id: INT-1a
schema_version: 1.0.0
status: draft
---

# INT-1a — Determinism Rules (Form Spec)

- pages must be sorted by page.order (unique integers).
- fields order is the array order in the spec (stable).
- form spec changes require a version bump.
- visibility conditions are ANDed in listed order.
- field_id and page_id are immutable once published (deprecate via new version).
