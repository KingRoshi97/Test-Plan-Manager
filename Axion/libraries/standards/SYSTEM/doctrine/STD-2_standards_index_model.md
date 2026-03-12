---
library: standards
id: STD-2
schema_version: 1.0.0
status: draft
---

# STD-2 — Standards Index + Applicability Mapping

## Purpose
Provide an authoritative registry of all standards packs and how they apply, so resolution is
deterministic.

## Components
1) **STANDARDS_INDEX** (required)
- lists every available pack (pack_id, version, path, scope, maturity, hash optional)

2) **Applicability mapping** (embedded or separate)
- deterministic filters based on:
  - run profile_id (API/WEB/MOBILE/etc.)
  - risk_class
  - optional stack families (react/node/postgres)
  - optional canonical domains (auth/payments/media)

## Design rule
The index is the source-of-truth for "what exists and where it lives."
No stage should discover packs by directory walking.
