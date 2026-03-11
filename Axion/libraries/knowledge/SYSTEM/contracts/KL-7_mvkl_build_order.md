---
  contract_id: KL-7
  schema_version: 1.0.0
  applies_to: "Initial Knowledge Library rollout plan"
  enforcement_level: "soft"
  ---

  # KL-7 — Minimum Viable Knowledge Library

  ## Principle
  Do not start with "everything." Start with a scalable spine:
  - registries + selection + gates first
  - then a small, high-leverage content set
  - then expand via atomic KIDs + bundles

  ## Phase 0 — System spine (must exist first)
  Create and validate:
  - KL-1 (KID model)
  - KL-2 (registries)
  - KL-3 (selection + KNOWLEDGE_SELECTION)
  - KL-4 (usage rules + citations)
  - KL-5 (gates)
  - KL-6 (ops workflows)

  ## Phase 1 — Core IT_END_TO_END domains (minimum)
  Add these domains as first-class in TAXONOMY and content:
  1) security_fundamentals
  2) auth_identity
  3) databases_postgres (or databases_core)
  4) networking_http
  5) cicd_release
  6) observability_core

  Each domain should start with:
  - 2 concepts
  - 2 patterns
  - 1 procedure
  - 1 checklist
  - 1 pitfall
  - 1 reference
  Total per domain: ~8 KIDs

  ## Phase 2 — Core languages/stacks (minimum)
  Add:
  - TypeScript/Node (backend)
  - React (frontend)
  - SQL/Postgres (data)

  Each starts with:
  - 1 reference (defaults/enums)
  - 2 patterns
  - 1 checklist
  - 1 pitfall

  ## Phase 3 — Industry playbooks (start with 3-5)
  Recommended starting set:
  - healthcare
  - finance
  - ecommerce
  - logistics
  - gov

  Each industry starts with:
  - 1 concept (risk landscape)
  - 1 checklist (compliance basics)
  - 1 pitfall (common failures)
  - 1 reference (required artifacts / documentation norms)

  ## Phase 4 — Bundles (make selection usable)
  Create bundles:
  - by run_profile: API / WEB / MOBILE
  - by risk_class: PROTOTYPE / PROD / COMPLIANCE
  - by executor: internal / external
  - by stack_family: react / node / postgres

  ## Exit criteria for "MVKL complete"
  - Selection produces stable KNOWLEDGE_SELECTION artifacts
  - Gates block policy violations
  - At least 2 bundles exist (API-PROTOTYPE, API-PROD)
  - At least 1 IT_END_TO_END domain has a complete starter set (~8 KIDs)
  