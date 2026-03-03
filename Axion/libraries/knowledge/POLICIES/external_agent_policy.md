# External Agent Policy

  ## Purpose

  Defines what external agents may access from the Knowledge Library per KL-4.3.

  ## Access Rules

  ### Allowed for External Agents

  - KIDs with `executor_access: internal_and_external`
  - KIDs with `use_policy: pattern_only` (study and derive only)
  - Checklists and procedures (rules-based content)
  - Glossary terms and canonical definitions

  ### Restricted from External Agents

  - KIDs with `executor_access: internal_only`
  - KIDs with `use_policy: restricted_internal_only`
  - Internal architecture decisions and proprietary patterns
  - Content marked with `redaction_class: restricted`

  ### Kit Export Rules

  - Kit exports for external execution must be filtered to exclude restricted KIDs
  - Knowledge selection artifacts for external runs must apply executor_access filtering
  - Bundle selection must use executor-appropriate bundles (EXTERNAL_AGENT bundle)

  ## Enforcement

  - KL-GATE-04: External executor cannot access restricted KIDs
  - KL-GATE-05: Kit export for external use excludes restricted content
  