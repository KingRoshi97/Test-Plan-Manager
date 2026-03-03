# IT End-to-End Selection Rules

  ## Selection Inputs
  - Canonical spec signals (domain/feature requirements)
  - Standards snapshot
  - Run profile (API/Web/Mobile/etc.)
  - Risk class (prototype/production/compliance)
  - Executor type (internal vs external)

  ## Selection Logic
  1. Filter KIDs by executor access constraints
  2. Filter by domain applicability (match canonical spec domains to KID domains)
  3. Filter by maturity threshold (production requires reviewed+)
  4. Rank by relevance using tag matching and domain proximity
  5. Cap selection set to avoid cognitive overload

  ## Domain Matching
  - Map canonical spec features to IT_END_TO_END domains
  - Include foundational KIDs (security, networking) by default for all builds
  - Include domain-specific KIDs based on spec signals
  